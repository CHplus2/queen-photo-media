import {
  collection,
  doc,
  runTransaction,
  type Transaction,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import type {
  InventoryItem,
  Order,
  OrderEvent,
  ServiceItem,
  StaffStamp,
  StockUsage,
} from '../types';
import {
  inventoryAction,
  materialPlan,
  stockBalance,
  validateSale,
  saleFingerprint,
} from '../utils/workflow';
import {
  paidAmount,
  remainingAmount,
  validatePayment,
  paymentState,
} from '../utils/payments';
const clean = <T>(data: T): T => JSON.parse(JSON.stringify(data));
function actor(): StaffStamp {
  if (!auth.currentUser) throw new Error('Silakan masuk kembali.');
  return {
    uid: auth.currentUser.uid,
    name:
      auth.currentUser.displayName ||
      auth.currentUser.email ||
      auth.currentUser.uid,
  };
}
async function moveStock(
  transaction: Transaction,
  usage: StockUsage[],
  direction: -1 | 1,
  orderId: string,
  by: StaffStamp,
  reason: string,
) {
  // All transaction reads precede all writes, including reads of the order and services.
  const materials = await Promise.all(
    usage.map(async (usage) => {
      const ref = doc(db, 'inventory', usage.inventoryId);
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists())
        throw new Error(
          'Bahan belum tersedia di inventaris. Periksa konfigurasi layanan.',
        );
      const item = snapshot.data() as InventoryItem;
      return {
        ref,
        item,
        usage,
        next: stockBalance(item, usage.quantity, direction),
      };
    }),
  );
  for (const { ref, item, usage, next } of materials) {
    transaction.update(ref, { currentStock: next });
    const log = doc(collection(db, 'stock_logs'));
    transaction.set(log, {
      id: log.id,
      timestamp: new Date().toISOString(),
      itemId: ref.id,
      itemName: item.name,
      changeAmount: direction * usage.quantity,
      previousStock: item.currentStock,
      newStock: next,
      reason,
      orderId,
      by,
    });
  }
}
// Customer-created order fields are not an inventory ledger. Keep authoritative
// movement state in staff-only stock_logs so even older deployed rules cannot
// let a forged order claim that stock was deducted and obtain a false restoration.
async function trustedOrder(
  transaction: Transaction,
  order: Order,
): Promise<Order> {
  const snapshot = await transaction.get(
    doc(db, 'stock_logs', `state-${order.id}`),
  );
  if (snapshot.exists()) {
    const state = snapshot.data();
    return {
      ...order,
      workflowVersion: state.workflowVersion,
      inventoryStatus: state.inventoryStatus,
      materialUsage: state.materialUsage,
      history: state.history || [],
      recordedBy: state.recordedBy,
      paidAt: state.paidAt,
      paymentVerifiedBy: state.paymentVerifiedBy,
      payments: state.payments,
    };
  }
  const {
    inventoryStatus,
    materialUsage,
    history,
    recordedBy,
    paidAt,
    paymentVerifiedBy,
    payments,
    ...safe
  } = order;
  return {
    ...safe,
    workflowVersion:
      order.channel === 'ONLINE' && order.orderStatus === 'MENUNGGU_BAYAR'
        ? 2
        : undefined,
    inventoryStatus: 'PENDING',
    history: [],
  };
}
function writeOrder(transaction: Transaction, order: Order) {
  transaction.set(doc(db, 'orders', order.id), clean(order));
  transaction.set(
    doc(db, 'stock_logs', `state-${order.id}`),
    clean({
      type: 'ORDER_STATE',
      orderId: order.id,
      workflowVersion: order.workflowVersion,
      inventoryStatus: order.inventoryStatus,
      materialUsage: order.materialUsage || [],
      history: order.history || [],
      recordedBy: order.recordedBy,
      paidAt: order.paidAt,
      paymentVerifiedBy: order.paymentVerifiedBy,
      payments: order.payments,
    }),
  );
}

async function servicePlan(transaction: Transaction, order: Order) {
  const ids = [...new Set(order.items.map((item) => item.serviceId))];
  const snapshots = await Promise.all(
    ids.map((id) => transaction.get(doc(db, 'services', id))),
  );
  return materialPlan(
    order.items,
    snapshots
      .filter((s) => s.exists())
      .map((s) => ({ ...s.data(), id: s.id }) as ServiceItem),
  );
}
export async function saveWalkin(
  orderData: Omit<Order, 'id' | 'createdAt'>,
  requestId: string,
): Promise<Order> {
  const by = actor();
  const ref = doc(db, 'orders', `QP-${requestId}`);
  return runTransaction(db, async (transaction) => {
    const existing = await transaction.get(ref);
    if (existing.exists()) {
      if (
        saleFingerprint(existing.data() as Order) !== saleFingerprint(orderData)
      )
        throw new Error(
          'Penjualan dengan nomor ini sudah tersimpan. Periksa riwayat, lalu kosongkan isian untuk transaksi baru.',
        );
      return existing.data() as Order;
    }
    const totals = validateSale(orderData.items);
    const at = new Date().toISOString();
    const order: Order = clean({
      ...orderData,
      ...totals,
      totalAmount: totals.subtotal,
      deliveryFee: 0,
      id: ref.id,
      createdAt: at,
      ownerUid: by.uid,
      workflowVersion: 2,
      recordedBy: by,
      inventoryStatus: 'PENDING',
      history: [
        { type: 'created', at, by, detail: 'Penjualan walk-in dicatat' },
      ],
    });
    const initial =
      orderData.initialPaymentAmount ??
      (order.paymentStatus === 'LUNAS' ? order.totalAmount : 0);
    if (initial) validatePayment(initial, order.totalAmount);
    else if (initial !== 0) throw new Error('Jumlah pembayaran tidak valid.');
    order.payments =
      initial > 0
        ? [
            {
              id: `initial-${requestId}`,
              amount: initial,
              method: order.paymentMethod,
              at,
              by,
            },
          ]
        : [];
    order.paymentStatus = paymentState(order.totalAmount, order.payments);
    if (initial > 0) {
      order.paidAt = at;
      order.paymentVerifiedBy = by;
    }
    if (order.orderStatus === 'SELESAI') {
      const plan = await servicePlan(transaction, order);
      // Never partially deduct a job with an unknown recipe.
      order.inventoryWarnings = plan.missing;
      if (orderData.stockExceptionReason?.trim()) {
        order.inventoryStatus = 'NEEDS_REVIEW';
        order.inventoryWarnings = [
          'Pengecualian stok: ' + orderData.stockExceptionReason.trim(),
        ];
        order.history!.push({
          type: 'status',
          at,
          by,
          detail: order.inventoryWarnings[0],
        });
      } else if (plan.missing.length) order.inventoryStatus = 'NEEDS_REVIEW';
      else {
        await moveStock(
          transaction,
          plan.usage,
          -1,
          order.id,
          by,
          'Bahan penjualan walk-in',
        );
        order.materialUsage = plan.usage;
        order.inventoryStatus = plan.usage.length ? 'DEDUCTED' : 'NOT_REQUIRED';
      }
    }
    writeOrder(transaction, order);
    return order;
  });
}
export async function changeOrderStatus(
  id: string,
  status: Order['orderStatus'],
  cancellation?: { reason: string; materials: 'unused' | 'used' },
): Promise<Order> {
  const by = actor();
  const ref = doc(db, 'orders', id);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw new Error('Pesanan tidak ditemukan.');
    const order = await trustedOrder(transaction, snapshot.data() as Order);
    const action = inventoryAction(order, status, cancellation?.materials);
    if (order.orderStatus === status) return order;
    if (status === 'DIBATALKAN' && !cancellation?.reason.trim())
      throw new Error('Isi alasan pembatalan.');
    const patch: Partial<Order> = { orderStatus: status };
    if (action === 'deduct') {
      const plan = await servicePlan(transaction, order);
      patch.inventoryWarnings = plan.missing;
      if (plan.missing.length) patch.inventoryStatus = 'NEEDS_REVIEW';
      else {
        await moveStock(
          transaction,
          plan.usage,
          -1,
          id,
          by,
          'Bahan pengerjaan pesanan',
        );
        patch.materialUsage = plan.usage;
        patch.inventoryStatus = plan.usage.length ? 'DEDUCTED' : 'NOT_REQUIRED';
      }
    } else if (action === 'restore') {
      if (!order.materialUsage?.length)
        throw new Error(
          'Riwayat bahan tidak tersedia; perlu pemeriksaan pemilik.',
        );
      await moveStock(
        transaction,
        order.materialUsage,
        1,
        id,
        by,
        'Pembatalan: bahan belum terpakai',
      );
      patch.inventoryStatus = 'RELEASED';
    } else if (action === 'waste') patch.inventoryStatus = 'WASTED';
    else if (action === 'review') patch.inventoryStatus = 'NEEDS_REVIEW';
    if (status === 'DIBATALKAN') {
      patch.cancelledAt = new Date().toISOString();
      patch.cancellationReason = cancellation!.reason.trim();
    }
    const event: OrderEvent = {
      type: status === 'DIBATALKAN' ? 'cancelled' : 'status',
      by,
      at: new Date().toISOString(),
      detail:
        status === 'DIBATALKAN'
          ? `${cancellation!.reason.trim()} · Bahan ${cancellation!.materials === 'used' ? 'terpakai' : 'belum terpakai'}`
          : status,
    };
    patch.history = [...(order.history || []), event];
    const next = { ...order, ...patch };
    writeOrder(transaction, next);
    return next;
  });
}
export async function verifyOrderPayment(
  id: string,
  paymentStatus: Order['paymentStatus'],
  payment?: { id: string; amount: number; method: Order['paymentMethod'] },
): Promise<Order> {
  const by = actor();
  const ref = doc(db, 'orders', id);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw new Error('Pesanan tidak ditemukan.');
    const order = await trustedOrder(transaction, snapshot.data() as Order);
    if (order.orderStatus === 'DIBATALKAN')
      throw new Error('Pesanan dibatalkan; periksa pengembalian dana.');
    if (payment && order.payments?.some((p) => p.id === payment.id)) {
      const previous = order.payments.find((p) => p.id === payment.id)!;
      if (
        previous.amount !== payment.amount ||
        previous.method !== payment.method
      )
        throw new Error('Nomor pembayaran sudah digunakan. Periksa riwayat.');
      return order;
    }
    if (!payment && order.paymentStatus === paymentStatus) return order;
    if (!payment && paymentStatus !== 'LUNAS')
      throw new Error(
        'Pembayaran tidak dapat dihapus. Hubungi penanggung jawab untuk koreksi.',
      );
    const amount = payment?.amount ?? remainingAmount(order);
    validatePayment(amount, remainingAmount(order));
    const at = new Date().toISOString();
    const payments =
      order.payments ||
      (paidAmount(order) > 0
        ? [
            {
              id: 'legacy',
              amount: paidAmount(order),
              method: order.paymentMethod,
              at: order.paidAt || order.createdAt,
              by: order.paymentVerifiedBy || by,
            },
          ]
        : []);
    payments.push({
      id: payment?.id || `settle-${id}`,
      amount,
      method: payment?.method || order.paymentMethod,
      at,
      by,
    });
    const next: Order = {
      ...order,
      payments,
      paymentStatus: paymentState(order.totalAmount, payments),
      paidAt: at,
      paymentVerifiedBy: by,
      history: [
        ...(order.history || []),
        { type: 'payment', at, by, detail: `Pembayaran Rp${amount}` },
      ],
    };
    writeOrder(transaction, next);
    return next;
  });
}
export async function addStock(
  itemId: string,
  amount: number,
  reason: string,
  maximum?: number,
) {
  const by = actor();
  if (!Number.isFinite(amount) || amount <= 0 || !reason.trim())
    throw new Error('Isi jumlah positif dan alasan penambahan stok.');
  const ref = doc(db, 'inventory', itemId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw new Error('Bahan tidak ditemukan.');
    const item = snapshot.data() as InventoryItem;
    const next = stockBalance(item, amount, 1);
    transaction.update(ref, {
      currentStock: next,
      maxStock: Math.max(next, maximum || item.maxStock),
    });
    const log = doc(collection(db, 'stock_logs'));
    transaction.set(log, {
      id: log.id,
      timestamp: new Date().toISOString(),
      itemId,
      itemName: item.name,
      previousStock: item.currentStock,
      newStock: next,
      changeAmount: amount,
      reason: reason.trim(),
      by,
    });
  });
}

export async function createMaterial(data: Omit<InventoryItem, 'id'>) {
  const by = actor();
  if (
    !data.name.trim() ||
    !data.unit.trim() ||
    !Number.isFinite(data.currentStock) ||
    data.currentStock < 0 ||
    !Number.isFinite(data.costPerUnit) ||
    data.costPerUnit < 0 ||
    !Number.isFinite(data.lowStockThreshold) ||
    data.lowStockThreshold < 0
  )
    throw new Error('Nama, satuan dan jumlah bahan tidak valid.');
  const ref = doc(collection(db, 'inventory'));
  await runTransaction(db, async (transaction) => {
    transaction.set(ref, { ...data, name: data.name.trim(), id: ref.id });
    const log = doc(collection(db, 'stock_logs'));
    transaction.set(log, {
      id: log.id,
      timestamp: new Date().toISOString(),
      itemId: ref.id,
      itemName: data.name.trim(),
      previousStock: 0,
      newStock: data.currentStock,
      changeAmount: data.currentStock,
      reason: 'Pencatatan saldo awal bahan',
      by,
    });
  });
}
export async function reconcileMaterialUsage(
  id: string,
  countedReason?: string,
): Promise<Order> {
  if (
    countedReason &&
    !(await auth.currentUser?.getIdTokenResult())?.claims.owner
  )
    throw new Error('Izin pemilik diperlukan.');
  const by = actor();
  const ref = doc(db, 'orders', id);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw new Error('Pesanan tidak ditemukan.');
    const order = await trustedOrder(transaction, snapshot.data() as Order);
    if (
      ['DEDUCTED', 'NOT_REQUIRED', 'COUNTED'].includes(
        order.inventoryStatus || '',
      )
    )
      return order;
    if (
      order.workflowVersion !== 2 ||
      order.inventoryStatus !== 'NEEDS_REVIEW' ||
      !['PROSES_CETAK', 'SIAP_DIAMBIL_KIRIM', 'SELESAI'].includes(
        order.orderStatus,
      )
    )
      throw new Error(
        'Riwayat bahan perlu diperiksa manual; pesanan ini tidak dapat dipotong ulang otomatis.',
      );
    if (countedReason?.trim()) {
      const next: Order = {
        ...order,
        inventoryStatus: 'COUNTED',
        inventoryWarnings: [],
        history: [
          ...(order.history || []),
          {
            type: 'status',
            at: new Date().toISOString(),
            by,
            detail:
              'Stok fisik sudah mencakup pemakaian ini; tanpa pemotongan ulang: ' +
              countedReason.trim(),
          },
        ],
      };
      writeOrder(transaction, next);
      return next;
    }
    const plan = await servicePlan(transaction, order);
    if (plan.missing.length)
      throw new Error(`Atur pemakaian bahan: ${plan.missing.join(', ')}.`);
    await moveStock(
      transaction,
      plan.usage,
      -1,
      id,
      by,
      'Pemakaian bahan setelah konfigurasi diperiksa',
    );
    const patch: Partial<Order> = {
      materialUsage: plan.usage,
      inventoryWarnings: [],
      inventoryStatus: plan.usage.length ? 'DEDUCTED' : 'NOT_REQUIRED',
      history: [
        ...(order.history || []),
        {
          type: 'status',
          at: new Date().toISOString(),
          by,
          detail: 'Pemakaian bahan diperiksa dan dicatat',
        },
      ],
    };
    const next = { ...order, ...patch };
    writeOrder(transaction, next);
    return next;
  });
}
export async function recordStocktake(
  id: string,
  measured: number,
  reason: string,
) {
  const by = actor();
  if (!Number.isFinite(measured) || measured < 0 || !reason.trim())
    throw new Error('Isi hasil hitung fisik dan alasan koreksi.');
  const ref = doc(db, 'inventory', id);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw new Error('Bahan tidak ditemukan.');
    const item = snapshot.data() as InventoryItem;
    transaction.update(ref, {
      currentStock: measured,
      maxStock: Math.max(item.maxStock, measured),
    });
    const log = doc(collection(db, 'stock_logs'));
    transaction.set(log, {
      id: log.id,
      timestamp: new Date().toISOString(),
      itemId: id,
      itemName: item.name,
      previousStock: item.currentStock,
      newStock: measured,
      changeAmount: measured - item.currentStock,
      reason: `Hitung fisik: ${reason.trim()}`,
      by,
    });
  });
}

export async function closeCashDrawer(data: {
  day: string;
  opening: number;
  receipts: number;
  cashOut: number;
  counted: number;
  receiptIds: string[];
  note: string;
}) {
  const by = actor();
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(data.day) ||
    [data.opening, data.receipts, data.cashOut, data.counted].some(
      (n) => !Number.isSafeInteger(n) || n < 0,
    )
  )
    throw new Error('Isi nominal kas dengan rupiah bulat, minimal Rp0.');
  if (data.cashOut > 0 && !data.note.trim())
    throw new Error('Jelaskan pengeluaran / pengembalian tunai.');
  const ref = doc(db, 'cash_closings', data.day);
  const expected = data.opening + data.receipts - data.cashOut;
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (snapshot.exists())
      throw new Error(
        'Kas tanggal ini sudah ditutup. Buka kembali ringkasan untuk melihat hasilnya.',
      );
    transaction.set(
      ref,
      clean({
        ...data,
        expected,
        difference: data.counted - expected,
        by,
        at: new Date().toISOString(),
      }),
    );
  });
}

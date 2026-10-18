import type {
  InventoryItem,
  Order,
  OrderItem,
  ServiceItem,
  StockUsage,
} from '../types';

export const roundStock = (value: number) => Math.round(value * 1e6) / 1e6;
export function materialPlan(items: OrderItem[], services: ServiceItem[]) {
  const totals = new Map<string, number>();
  const missing: string[] = [];
  for (const item of items) {
    if (
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      !Number.isFinite(item.unitPrice) ||
      item.unitPrice < 0
    )
      throw new Error('Jumlah dan harga layanan tidak valid.');
    const service = services.find((s) => s.id === item.serviceId);
    if (
      item.frame ||
      (service?.options?.sizes &&
        service.options.sizes.length > 1 &&
        item.size !== service.options.sizes[0] &&
        item.size !== service.unit)
    ) {
      missing.push(`${item.serviceName} (opsi khusus)`);
      continue;
    }
    if (service?.stockMode === 'none') continue;
    if (service?.stockMode !== 'automatic' || !service.materialUsage?.length) {
      missing.push(item.serviceName);
      continue;
    }
    for (const usage of service.materialUsage) {
      if (
        !usage.inventoryId ||
        !Number.isFinite(usage.quantity) ||
        usage.quantity <= 0
      )
        throw new Error('Konfigurasi bahan tidak valid.');
      totals.set(
        usage.inventoryId,
        roundStock(
          (totals.get(usage.inventoryId) || 0) + usage.quantity * item.quantity,
        ),
      );
    }
  }
  return {
    usage: [...totals].map(([inventoryId, quantity]) => ({
      inventoryId,
      quantity,
    })),
    missing,
  };
}
export function stockBalance(
  item: InventoryItem,
  quantity: number,
  direction: -1 | 1,
) {
  if (
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    !Number.isFinite(item.currentStock)
  )
    throw new Error('Jumlah stok tidak valid.');
  const balance = roundStock(item.currentStock + direction * quantity);
  if (balance < 0)
    throw new Error(
      `Stok ${item.name} tidak cukup. Sisa ${item.currentStock} ${item.unit}.`,
    );
  return balance;
}
export function inventoryAction(
  order: Order,
  next: Order['orderStatus'],
  disposition?: 'unused' | 'used',
) {
  if (order.orderStatus === next) return 'none';
  if (order.orderStatus === 'DIBATALKAN')
    throw new Error(
      'Pesanan batal tidak dibuka ulang. Buat pesanan baru untuk pengerjaan ulang.',
    );
  if (next === 'DIBATALKAN') {
    if (order.inventoryStatus === 'DEDUCTED') {
      if (!disposition) throw new Error('Pilih apakah bahan sudah terpakai.');
      return disposition === 'unused' ? 'restore' : 'waste';
    }
    return 'none';
  }
  if (order.workflowVersion !== 2) return 'review';
  if (
    ['PROSES_CETAK', 'SIAP_DIAMBIL_KIRIM', 'SELESAI'].includes(next) &&
    !['DEDUCTED', 'WASTED', 'NOT_REQUIRED'].includes(
      order.inventoryStatus || '',
    )
  )
    return 'deduct';
  return 'none';
}
export function validateSale(items: OrderItem[]) {
  if (!items.length || items.length > 50)
    throw new Error('Pilih 1–50 layanan.');
  for (const item of items) {
    if (
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 999 ||
      !Number.isFinite(item.unitPrice) ||
      item.unitPrice < 0 ||
      !Number.isFinite(item.unitCost) ||
      item.unitCost < 0
    )
      throw new Error('Jumlah, harga atau biaya layanan tidak valid.');
  }
  const subtotal = Math.round(
    items.reduce((n, i) => n + i.unitPrice * i.quantity, 0),
  );
  const totalCost = Math.round(
    items.reduce((n, i) => n + i.unitCost * i.quantity, 0),
  );
  return { subtotal, totalCost, totalProfit: subtotal - totalCost };
}

export function saleFingerprint(
  order: Pick<
    Order,
    | 'items'
    | 'customerName'
    | 'customerPhone'
    | 'paymentMethod'
    | 'paymentStatus'
    | 'orderStatus'
    | 'staffNotes'
    | 'estimatedReadyTime'
  >,
) {
  return JSON.stringify({
    items: order.items,
    name: order.customerName,
    phone: order.customerPhone,
    payment: order.paymentMethod,
    paid: order.paymentStatus,
    status: order.orderStatus,
    notes: order.staffNotes || '',
    due: order.estimatedReadyTime || '',
  });
}

import type { Order } from '../types';
const object = (v: unknown): v is Record<string, any> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
const amount = (v: unknown) =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0;
const stamp = (v: unknown) =>
  object(v) && typeof v.uid === 'string' && typeof v.name === 'string';
const date = (v: unknown) =>
  typeof v === 'string' && Number.isFinite(Date.parse(v));
export function isUnverifiedRequest(
  order: Pick<Order, 'channel' | 'paymentStatus' | 'orderStatus'>,
) {
  return (
    order.channel === 'ONLINE' &&
    order.paymentStatus === 'BELUM_BAYAR' &&
    order.orderStatus === 'MENUNGGU_BAYAR'
  );
}
// A malformed customer document must not crash every cashier's order listener.
// Invalid financial records are reported separately, never silently counted as zero.
export function readOrderRecord(id: string, value: unknown): Order | null {
  if (!object(value)) return null;
  const raw: Record<string, any> = { ...value, id };
  if (
    !date(raw.createdAt) ||
    !['ONLINE', 'WALKIN'].includes(raw.channel) ||
    !['BELUM_BAYAR', 'SEBAGIAN', 'LUNAS'].includes(raw.paymentStatus) ||
    ![
      'MENUNGGU_BAYAR',
      'ANTREAN_DESAIN',
      'PROSES_CETAK',
      'SIAP_DIAMBIL_KIRIM',
      'SELESAI',
      'DIBATALKAN',
    ].includes(raw.orderStatus) ||
    ![
      'QRIS',
      'TRANSFER_BANK',
      'TRANSFER_BCA',
      'TRANSFER_MANDIRI',
      'TRANSFER_BRI',
      'TUNAI_KASIR',
    ].includes(raw.paymentMethod) ||
    !['AMBIL_STUDIO', 'GRAB_EXPRESS_PONTIANAK', 'EKSPEDISI_KALBAR'].includes(
      raw.deliveryMethod,
    ) ||
    !['subtotal', 'totalAmount', 'totalCost', 'deliveryFee'].every((k) =>
      amount(raw[k]),
    ) ||
    !Array.isArray(raw.items) ||
    !raw.items.length ||
    raw.items.length > 50
  )
    return null;
  for (const item of raw.items) {
    if (
      !object(item) ||
      !['id', 'serviceId', 'serviceName', 'size', 'category'].every(
        (k) => typeof item[k] === 'string',
      ) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 999 ||
      !amount(item.unitPrice) ||
      !amount(item.unitCost) ||
      ![
        'finish',
        'frame',
        'notes',
        'backgroundColor',
        'photoFileName',
        'serviceNameEn',
      ].every((k) => item[k] == null || typeof item[k] === 'string')
    )
      return null;
  }
  for (const key of [
    'customerName',
    'customerPhone',
    'customerEmail',
    'customerAddress',
    'district',
    'staffNotes',
    'trackingNumber',
    'estimatedReadyTime',
    'cancellationReason',
  ]) {
    if (raw[key] != null && typeof raw[key] !== 'string') return null;
  }
  raw.customerName ||= 'Pelanggan tanpa nama';
  raw.customerPhone ||= '';
  if (isUnverifiedRequest(raw as Order)) {
    return {
      ...(raw as Order),
      inventoryStatus: 'PENDING',
      materialUsage: undefined,
      history: [],
      recordedBy: undefined,
      paymentVerifiedBy: undefined,
      paidAt: undefined,
      payments: undefined,
      initialPaymentAmount: undefined,
      inventoryWarnings: undefined,
      cancelledAt: undefined,
      cancellationReason: undefined,
    } as Order;
  }
  if (
    raw.payments != null &&
    (!Array.isArray(raw.payments) ||
      raw.payments.some(
        (p: unknown) =>
          !object(p) ||
          typeof p.id !== 'string' ||
          !amount(p.amount) ||
          !date(p.at) ||
          !stamp(p.by) ||
          ![
            'QRIS',
            'TRANSFER_BANK',
            'TRANSFER_BCA',
            'TRANSFER_MANDIRI',
            'TRANSFER_BRI',
            'TUNAI_KASIR',
          ].includes(p.method),
      ))
  )
    return null;
  for (const key of ['recordedBy', 'paymentVerifiedBy'])
    if (raw[key] != null && !stamp(raw[key])) return null;
  for (const key of ['paidAt', 'cancelledAt'])
    if (raw[key] != null && !date(raw[key])) return null;
  if (
    raw.inventoryWarnings != null &&
    (!Array.isArray(raw.inventoryWarnings) ||
      raw.inventoryWarnings.some((v: unknown) => typeof v !== 'string'))
  )
    return null;
  if (
    raw.history != null &&
    (!Array.isArray(raw.history) ||
      raw.history.some(
        (v: unknown) =>
          !object(v) ||
          !stamp(v.by) ||
          !date(v.at) ||
          typeof v.detail !== 'string' ||
          typeof v.type !== 'string',
      ))
  )
    return null;
  return raw as Order;
}

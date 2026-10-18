import type { Order, PaymentEntry } from '../types';
export function paidAmount(order: Order): number {
  return order.payments
    ? order.payments.reduce((n, p) => n + p.amount, 0)
    : order.paymentStatus === 'LUNAS'
      ? order.totalAmount
      : 0;
}
export function remainingAmount(order: Order): number {
  return Math.max(0, order.totalAmount - paidAmount(order));
}
export function validatePayment(amount: number, remaining: number) {
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > remaining)
    throw new Error(
      'Isi pembayaran lebih dari Rp0 dan tidak melebihi sisa bayar.',
    );
}
export function paymentState(
  total: number,
  payments: PaymentEntry[],
): Order['paymentStatus'] {
  const paid = payments.reduce((n, p) => n + p.amount, 0);
  return paid >= total ? 'LUNAS' : paid > 0 ? 'SEBAGIAN' : 'BELUM_BAYAR';
}

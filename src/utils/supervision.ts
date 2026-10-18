import type { Order } from '../types';
import { businessDate, reportableOrders, salesSummary } from './sales';
export function supervision(orders: Order[], day: string) {
  const onDate = (value: string | undefined) =>
    Boolean(
      value &&
        Number.isFinite(Date.parse(value)) &&
        businessDate(value) === day,
    );
  const today = orders.filter((o) => onDate(o.createdAt));
  const payments = orders.filter(
    (o) => o.paymentStatus === 'LUNAS' && onDate(o.paidAt || o.createdAt),
  );
  return {
    today,
    sales: salesSummary(reportableOrders(orders, day)),
    payments,
    pending: orders.filter(
      (o) => o.paymentStatus !== 'LUNAS' && o.orderStatus !== 'DIBATALKAN',
    ),
    ready: orders.filter((o) => o.orderStatus === 'SIAP_DIAMBIL_KIRIM'),
    cancelled: orders.filter(
      (o) =>
        o.orderStatus === 'DIBATALKAN' && onDate(o.cancelledAt || o.createdAt),
    ),
    refundsToCheck: orders.filter(
      (o) => o.orderStatus === 'DIBATALKAN' && o.paymentStatus === 'LUNAS',
    ),
    materialReview: orders.filter(
      (o) =>
        o.inventoryStatus === 'NEEDS_REVIEW' && o.orderStatus !== 'DIBATALKAN',
    ),
    legacyPayments: payments.filter((o) => !o.paidAt).length,
  };
}

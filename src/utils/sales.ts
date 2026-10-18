import type { Order } from '../types';

// Pontianak uses WIB. UTC timestamps near midnight must not change reporting days.
export function businessDate(value: string | Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Pontianak', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}
export function reportableOrders(orders: Order[], period = businessDate(new Date()).slice(0, 7)): Order[] {
  return orders.filter(order => order.paymentStatus === 'LUNAS' && order.orderStatus !== 'DIBATALKAN' && Number.isFinite(Date.parse(order.createdAt)) && businessDate(order.createdAt).startsWith(period));
}
export function salesSummary(orders: Order[]) {
  return orders.reduce((sum, order) => {
    const revenue = order.totalAmount - order.deliveryFee;
    return { revenue: sum.revenue + revenue, cost: sum.cost + order.totalCost, profit: sum.profit + revenue - order.totalCost };
  }, { revenue: 0, cost: 0, profit: 0 });
}

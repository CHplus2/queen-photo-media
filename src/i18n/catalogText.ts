import type { OrderItem, ServiceItem } from '../types';
import { getLanguage, tr } from './runtime';
export function serviceText(
  service: ServiceItem,
  field: 'name' | 'description' | 'unit',
): string {
  const translated = service.english?.[field];
  return getLanguage() === 'en' &&
    typeof translated === 'string' &&
    translated.trim()
    ? translated.trim()
    : tr(service[field]);
}
export function orderItemName(item: OrderItem): string {
  return getLanguage() === 'en' &&
    typeof item.serviceNameEn === 'string' &&
    item.serviceNameEn
    ? item.serviceNameEn
    : tr(item.serviceName);
}

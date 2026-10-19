import type { OrderItem, ServiceItem } from '../types';
import { getLanguage } from './runtime';
export function serviceText(
  service: ServiceItem,
  field: 'name' | 'description' | 'unit',
): string {
  const translated = service.english?.[field];
  return getLanguage() === 'en' &&
    typeof translated === 'string' &&
    translated.trim()
    ? translated.trim()
    : service[field];
}
export function orderItemName(item: OrderItem): string {
  return getLanguage() === 'en' &&
    typeof item.serviceNameEn === 'string' &&
    item.serviceNameEn
    ? item.serviceNameEn
    : item.serviceName;
}

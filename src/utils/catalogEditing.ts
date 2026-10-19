import type { ServiceItem } from '../types';
export function frameAdjustment(
  service: ServiceItem,
  frame: string,
): { price: number; cost: number } {
  if (!frame || frame === 'Tanpa Bingkai') return { price: 0, cost: 0 };
  const prices = service.options?.framePrices;
  const configured =
    prices && Object.hasOwn(prices, frame) ? prices[frame] : undefined;
  if (configured) return configured;
  if (['Minimalis Hitam', 'Minimalis Putih'].includes(frame))
    return { price: 25000, cost: 12000 };
  if (frame === 'Kayu Jati Elegan') return { price: 55000, cost: 28000 };
  if (frame === 'Ukiran Emas Klasik') return { price: 75000, cost: 38000 };
  return { price: 0, cost: 0 };
}
export function validateLabels(labels: string[]) {
  const clean = labels.map((s) => s.trim());
  if (clean.some((s) => !s || s.length > 100))
    throw new Error(
      'Isi setiap nama opsi (maksimal 100 karakter), atau hapus baris kosong.',
    );
  if (new Set(clean.map((s) => s.toLocaleLowerCase())).size !== clean.length)
    throw new Error('Nama opsi tidak boleh sama.');
  return clean;
}
export function frameOptions(
  service: ServiceItem,
  entries: { name: string; price: number; cost: number }[],
) {
  const names = validateLabels(entries.map((e) => e.name));
  const prices: NonNullable<
    NonNullable<ServiceItem['options']>['framePrices']
  > = {};
  entries.forEach((entry, i) => {
    if (
      !Number.isSafeInteger(entry.price) ||
      entry.price < 0 ||
      !Number.isSafeInteger(entry.cost) ||
      entry.cost < 0
    )
      throw new Error(
        'Harga dan biaya bingkai harus rupiah bulat, minimal Rp0.',
      );
    if (names[i] === 'Tanpa Bingkai' && (entry.price !== 0 || entry.cost !== 0))
      throw new Error(
        'Tanpa Bingkai harus memiliki tambahan harga dan biaya Rp0.',
      );
    Object.defineProperty(prices, names[i], {
      value: { price: entry.price, cost: entry.cost },
      enumerable: true,
    });
  });
  return { ...service.options, frames: names, framePrices: prices };
}

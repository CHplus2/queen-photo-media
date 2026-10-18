import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { businessDate, reportableOrders, salesSummary } from '../utils/sales';
import { formatRupiah } from '../utils/formatters';
import { Download, BarChart3 } from 'lucide-react';
const labels: Record<string, string> = {
  cetak_foto: 'Cetak foto',
  photostrip_polaroid: 'Photostrip & mini prints',
  pas_foto: 'Pas foto',
  foto_studio: 'Sesi studio',
  restorasi_edit: 'Restorasi & edit',
  merchandise: 'Hadiah & album',
  banner: 'Banner',
};
export const SalesAnalyticsView: React.FC = () => {
  const {
    orders: allOrders,
    monthlyRevenueTarget,
    setMonthlyRevenueTarget,
  } = useStudio();
  const [month, setMonth] = useState(businessDate(new Date()).slice(0, 7));
  const orders = reportableOrders(allOrders, month);
  const summary = salesSummary(orders);
  const target = monthlyRevenueTarget > 0 ? monthlyRevenueTarget : 0;
  const targetPct =
    target > 0 ? Math.max(0, (summary.revenue / target) * 100) : 0;
  const categories = Object.entries(labels)
    .map(([id, label]) => {
      let revenue = 0,
        count = 0;
      for (const order of orders) {
        const sum = order.items.reduce(
          (n, item) => n + item.unitPrice * item.quantity,
          0,
        );
        for (const item of order.items) {
          if (item.category === id) {
            count += item.quantity;
            revenue +=
              sum > 0
                ? ((order.totalAmount - order.deliveryFee) *
                    item.unitPrice *
                    item.quantity) /
                  sum
                : 0;
          }
        }
      }
      return { label, revenue, count };
    })
    .sort((a, b) => b.revenue - a.revenue);
  const exportReport = () => {
    const rows = [
      ['Periode', month],
      ['Omzet layanan', summary.revenue],
      ['Estimasi HPP', summary.cost],
      ['Estimasi laba kotor', summary.profit],
      ['Pesanan lunas', orders.length],
      [],
      ['Kategori', 'Jumlah unit', 'Omzet layanan'],
      ...categories.map((c) => [c.label, c.count, Math.round(c.revenue)]),
    ];
    const blob = new Blob(
      [
        '\ufeff' +
          rows
            .map((row) =>
              row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','),
            )
            .join('\r\n'),
      ],
      { type: 'text/csv;charset=utf-8;' },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `queen-photo-penjualan-${month}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="qp-container py-10 sm:py-12 space-y-7">
      <div className="flex flex-wrap justify-between gap-6 items-end">
        <div>
          <span className="qp-eyebrow">Performa studio</span>
          <h1 className="text-3xl !font-sans !tracking-tight font-semibold mt-2">
            Laporan penjualan
          </h1>
          <p className="text-sm text-stone-500 mt-3">
            Pesanan lunas dan tidak dibatalkan, berdasarkan tanggal pesanan
            (WIB).
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <label>
            <span className="qp-label">Periode laporan</span>
            <input
              className="qp-field"
              type="month"
              aria-label="Periode laporan"
              required
              value={month}
              onChange={(e) => {
                if (e.target.value) setMonth(e.target.value);
              }}
            />
          </label>
          <button
            className="qp-button qp-button-secondary"
            onClick={exportReport}
          >
            <Download size={17} />
            Unduh CSV
          </button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          [
            'Omzet layanan',
            formatRupiah(summary.revenue),
            'Setelah diskon, di luar ongkir',
          ],
          ['Pesanan lunas', String(orders.length), 'Online dan walk-in'],
          [
            'Estimasi laba kotor',
            formatRupiah(summary.profit),
            'Sebelum biaya operasional',
          ],
          [
            'Rata-rata pesanan',
            formatRupiah(orders.length ? summary.revenue / orders.length : 0),
            'Omzet layanan per transaksi',
          ],
        ].map(([title, value, caption]) => (
          <div className="qp-panel p-5 sm:p-6" key={title}>
            <p className="text-sm text-stone-500">{title}</p>
            <p className="text-2xl font-semibold tabular-nums mt-3 break-words">
              {value}
            </p>
            <p className="text-xs text-stone-500 mt-3">{caption}</p>
          </div>
        ))}
      </div>
      {orders.length === 0 && (
        <div className="qp-notice flex items-start gap-3">
          <BarChart3 size={21} className="shrink-0" />
          <p>
            Belum ada pesanan lunas pada periode ini. Pesanan yang belum dibayar
            atau dibatalkan tidak masuk laporan.
          </p>
        </div>
      )}
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <section className="qp-panel p-6 sm:p-7">
          <div className="flex justify-between gap-4 mb-7">
            <h2 className="!font-sans !tracking-normal text-lg font-semibold">
              Penjualan per layanan
            </h2>
            <span className="text-xs text-stone-500">Omzet bersih ongkir</span>
          </div>
          <div className="space-y-6">
            {categories.map((c) => (
              <div key={c.label}>
                <div className="flex justify-between gap-3 text-sm">
                  <span>
                    {c.label}
                    <span className="text-xs text-stone-500 ml-2">
                      {c.count} unit
                    </span>
                  </span>
                  <strong className="font-semibold tabular-nums">
                    {formatRupiah(c.revenue)}
                  </strong>
                </div>
                <div
                  role="meter"
                  aria-label={c.label}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={
                    summary.revenue
                      ? Math.round((c.revenue / summary.revenue) * 100)
                      : 0
                  }
                  className="h-2 rounded-full bg-stone-100 mt-3 overflow-hidden"
                >
                  <div
                    className="h-full bg-stone-700 rounded-full"
                    style={{
                      width: `${summary.revenue ? Math.max(0, (c.revenue / summary.revenue) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
        <div className="space-y-5">
          <section className="qp-panel p-6 sm:p-7">
            <h2 className="!font-sans !tracking-normal text-lg font-semibold">
              Saluran penjualan
            </h2>
            <dl className="mt-6 space-y-5">
              {(
                [
                  ['ONLINE', 'Website'],
                  ['WALKIN', 'Walk-in studio'],
                ] as const
              ).map(([id, label]) => {
                const selected = orders.filter((o) => o.channel === id);
                return (
                  <div
                    key={id}
                    className="flex items-start justify-between gap-4"
                  >
                    <dt>
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-xs text-stone-500 block mt-1">
                        {selected.length} pesanan
                      </span>
                    </dt>
                    <dd className="text-sm font-semibold tabular-nums">
                      {formatRupiah(salesSummary(selected).revenue)}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
          <section className="qp-panel p-6 sm:p-7">
            <h2 className="!font-sans !tracking-normal text-lg font-semibold">
              Target bulanan
            </h2>
            <p className="text-3xl font-semibold mt-5 tabular-nums">
              {Math.round(targetPct)}
              <span className="text-lg text-stone-500">%</span>
            </p>
            <div className="h-2 rounded-full bg-stone-100 mt-3 overflow-hidden">
              <div
                className="h-full bg-stone-900 rounded-full"
                style={{ width: `${Math.min(100, targetPct)}%` }}
              />
            </div>
            <label className="mt-5 block">
              <span className="qp-label">Target omzet (Rp)</span>
              <input
                className="qp-field"
                type="number"
                min={1}
                step={100000}
                defaultValue={target}
                onBlur={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isFinite(n) && n > 0) setMonthlyRevenueTarget(n);
                  else e.target.value = String(target);
                }}
              />
            </label>
          </section>
        </div>
      </div>
      <p className="text-xs text-stone-500 leading-relaxed max-w-3xl">
        Estimasi HPP periode ini: {formatRupiah(summary.cost)}. Laba kotor belum
        memperhitungkan sewa, gaji, dan biaya operasional lain. Laporan
        menggunakan tanggal pesanan, bukan tanggal penerimaan pembayaran.
      </p>
    </div>
  );
};

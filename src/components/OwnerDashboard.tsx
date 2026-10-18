import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { businessDate } from '../utils/sales';
import { supervision } from '../utils/supervision';
import { formatRupiah, formatDateTime } from '../utils/formatters';
import { Share2, ArrowRight, ClipboardCopy } from 'lucide-react';
export const OwnerDashboard: React.FC = () => {
  const {
    orders,
    inventory,
    inventoryReady,
    isFirebaseConnected,
    setCurrentView,
  } = useStudio();
  const [day, setDay] = useState(businessDate(new Date()));
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  const report = supervision(orders, day);
  const low = inventory.filter((i) => i.currentStock <= i.lowStockThreshold);
  const channels = (
    [
      ['TUNAI_KASIR', 'Tunai'],
      ['QRIS', 'QRIS'],
      ['BANK', 'Transfer bank'],
    ] as const
  ).map(([id, label]) => ({
    label,
    total: report.payments
      .filter((o) =>
        id === 'BANK'
          ? o.paymentMethod.startsWith('TRANSFER_')
          : o.paymentMethod === id,
      )
      .reduce((n, o) => n + o.totalAmount, 0),
  }));
  const recap = `RINGKASAN QUEEN PHOTO · ${day} WIB\nPenjualan lunas: ${formatRupiah(report.sales.revenue)} (di luar ongkir)\n${channels.map((c) => `${c.label} tercatat: ${formatRupiah(c.total)}`).join('\n')}\nMenunggu pembayaran: ${report.pending.length} pesanan\nSiap diambil: ${report.ready.length}\nPembatalan hari ini: ${report.cancelled.length}\nPembatalan berbayar perlu cek refund: ${report.refundsToCheck.length}\nStok rendah: ${low.length} bahan\nBahan perlu pemeriksaan: ${report.materialReview.length} pesanan\nPenerimaan belum dikurangi pengembalian dana. ${report.legacyPayments ? `${report.legacyPayments} pembayaran lama menggunakan tanggal pesanan.` : ''}`;
  const staff = new Map<
    string,
    { name: string; count: number; amount: number }
  >();
  for (const o of report.today) {
    const name =
      o.channel === 'ONLINE'
        ? 'Pesanan website'
        : o.recordedBy?.name || 'Staf belum tercatat (data lama)';
    const group = staff.get(name) || { name, count: 0, amount: 0 };
    group.count++;
    if (o.paymentStatus === 'LUNAS' && o.orderStatus !== 'DIBATALKAN')
      group.amount += o.totalAmount - o.deliveryFee;
    staff.set(name, group);
  }
  return (
    <div className="qp-container py-8 sm:py-10 space-y-6">
      <div className="flex flex-wrap justify-between gap-5 items-end">
        <div>
          <span className="qp-eyebrow">Supervisi jarak jauh</span>
          <h1 className="text-3xl !font-sans font-semibold mt-2">
            Ringkasan toko
          </h1>
          <p className="text-sm text-stone-500 mt-3">
            Periksa penjualan dan pengecualian tanpa membaca satu per satu pesan
            grup.
          </p>
        </div>
        <label>
          <span className="qp-label">Tanggal ringkasan (WIB)</span>
          <input
            className="qp-field"
            type="date"
            value={day}
            required
            onChange={(e) => {
              if (e.target.value) setDay(e.target.value);
            }}
          />
        </label>
      </div>
      {(!isFirebaseConnected || !inventoryReady) && (
        <p role="status" className="qp-notice">
          Menunggu data terbaru. Angka belum dapat dianggap sebagai saldo
          terakhir saat koneksi terputus.
        </p>
      )}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          [
            'Penjualan lunas',
            formatRupiah(report.sales.revenue),
            'Tanggal pesanan, di luar ongkir',
          ],
          [
            'Pembayaran belum diperiksa',
            String(report.pending.length),
            'Seluruh pesanan aktif',
          ],
          [
            'Siap diambil / dikirim',
            String(report.ready.length),
            'Seluruh antrean siap',
          ],
          [
            'Pembatalan',
            String(report.cancelled.length),
            'Pada tanggal yang dipilih',
          ],
        ].map(([label, value, caption]) => (
          <article key={label} className="qp-panel p-5">
            <h2 className="!font-sans text-sm text-stone-500 !tracking-normal">
              {label}
            </h2>
            <strong className="block text-2xl mt-3 tabular-nums">
              {value}
            </strong>
            <p className="text-xs text-stone-500 mt-3">{caption}</p>
          </article>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <section className="qp-panel p-5 sm:p-6">
          <h2 className="!font-sans text-lg font-semibold">
            Penerimaan yang dicatat
          </h2>
          <p className="text-xs text-stone-500 mt-2">
            Tanggal verifikasi pembayaran. Penerimaan kotor termasuk ongkir,
            belum dikurangi refund.
          </p>
          <dl className="space-y-4 mt-6">
            {channels.map((c) => (
              <div key={c.label} className="flex justify-between gap-3 text-sm">
                <dt>{c.label}</dt>
                <dd className="font-semibold tabular-nums">
                  {formatRupiah(c.total)}
                </dd>
              </div>
            ))}
          </dl>
          {report.legacyPayments > 0 && (
            <p className="qp-notice mt-5">
              {report.legacyPayments} transaksi lama belum memiliki tanggal
              verifikasi. Angkanya menggunakan tanggal pesanan dan perlu
              dicocokkan dengan bank / kas.
            </p>
          )}
          <p className="text-xs text-stone-500 mt-5">
            Cocokkan tunai dengan hitungan fisik dan non-tunai dengan aplikasi
            bank / merchant. Ringkasan ini bukan saldo bank atau saldo laci kas.
          </p>
        </section>
        <section className="qp-panel p-5 sm:p-6">
          <h2 className="!font-sans text-lg font-semibold">Perlu perhatian</h2>
          <ul className="mt-5 space-y-4 text-sm">
            <li>
              {report.refundsToCheck.length} pembatalan berbayar perlu diperiksa
              pengembalian dananya.
            </li>
            <li>
              {report.materialReview.length} pesanan belum memiliki pemotongan
              bahan yang dapat dipastikan.
            </li>
            <li>{low.length} bahan berada pada batas stok rendah.</li>
          </ul>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              className="qp-button qp-button-secondary"
              onClick={() => setCurrentView('orders')}
            >
              Tindak lanjut pesanan <ArrowRight size={16} />
            </button>
            <button
              className="qp-button qp-button-secondary"
              onClick={() => setCurrentView('inventory')}
            >
              Periksa inventaris
            </button>
          </div>
        </section>
      </div>
      <section className="qp-panel p-5 sm:p-6">
        <div className="flex flex-wrap justify-between gap-4 items-center">
          <h2 className="!font-sans text-lg font-semibold">
            Penjualan menurut pencatat
          </h2>
          <span className="text-xs text-stone-500">
            Tanggal pesanan yang dipilih
          </span>
        </div>
        <div className="divide-y divide-stone-200 mt-4">
          {[...staff.values()].map((s) => (
            <div
              className="flex justify-between gap-4 py-4 text-sm"
              key={s.name}
            >
              <div className="min-w-0 break-words">
                {s.name}
                <p className="text-xs text-stone-500 mt-1">
                  {s.count} transaksi dicatat
                </p>
              </div>
              <strong className="shrink-0">{formatRupiah(s.amount)}</strong>
            </div>
          ))}
        </div>
        {!staff.size && (
          <p className="text-sm text-stone-500 mt-4">
            Belum ada penjualan pada tanggal ini.
          </p>
        )}
      </section>
      <section className="qp-panel p-5 sm:p-6">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div>
            <h2 className="!font-sans text-lg font-semibold">
              Ringkasan untuk grup WhatsApp
            </h2>
            <p className="text-sm text-stone-500 mt-2">
              Staff cukup membagikan ringkasan; tidak perlu mengetik ulang semua
              transaksi.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              className="qp-button qp-button-secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(recap);
                  setCopied(true);
                  setCopyError('');
                } catch {
                  setCopyError('Salin teks di bawah secara manual.');
                }
              }}
            >
              <ClipboardCopy size={17} />
              {copied ? 'Tersalin' : 'Salin'}
            </button>
            <a
              className="qp-button"
              href={`https://wa.me/?text=${encodeURIComponent(recap)}`}
              target="_blank"
              rel="noreferrer"
            >
              <Share2 size={17} />
              Bagikan ke WhatsApp
            </a>
          </div>
        </div>
        <pre className="qp-notice mt-5 whitespace-pre-wrap !font-sans">
          {recap}
        </pre>
        <p role="status" className="text-xs text-stone-500 mt-3">
          {copyError ||
            'Pilih sendiri grup tujuan di WhatsApp. Tidak ada pesan yang dikirim otomatis.'}
        </p>
      </section>
    </div>
  );
};

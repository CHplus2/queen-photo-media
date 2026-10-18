import React, { useEffect, useState } from 'react';
import { useStudio } from '../context/StudioContext';
import {
  formatDateTime,
  formatRupiah,
  createStudioOrderLink,
} from '../utils/formatters';
import { Search, Package, Check, MessageCircle } from 'lucide-react';
const stages = [
  [
    'MENUNGGU_BAYAR',
    'Konfirmasi pesanan',
    'Staf memeriksa rincian dan pembayaran.',
  ],
  ['ANTREAN_DESAIN', 'Desain & penyesuaian', 'Foto masuk antrean editor.'],
  ['PROSES_CETAK', 'Proses cetak', 'Pesanan sedang dikerjakan.'],
  [
    'SIAP_DIAMBIL_KIRIM',
    'Siap diterima',
    'Ambil di studio atau tunggu pengiriman.',
  ],
  ['SELESAI', 'Selesai', 'Terima kasih sudah mempercayakan momen Anda.'],
];
export const OrderTrackingView: React.FC = () => {
  const { orders, activeTrackingId, setActiveTrackingId, setCurrentView } =
    useStudio();
  const [query, setQuery] = useState(activeTrackingId || '');
  const [searched, setSearched] = useState(activeTrackingId || '');
  useEffect(() => {
    setQuery(activeTrackingId || '');
    setSearched(activeTrackingId || '');
  }, [activeTrackingId]);
  const order = orders.find(
    (o) => o.id.toLowerCase() === searched.trim().toLowerCase(),
  );
  const index = order
    ? stages.findIndex((s) => s[0] === order.orderStatus)
    : -1;
  return (
    <div className="qp-container py-12 sm:py-16 max-w-3xl">
      <div className="mb-8">
        <span className="qp-eyebrow">Kabar dari studio</span>
        <h1 className="qp-title mt-3">Lacak pesanan Anda.</h1>
        <p className="text-stone-600 mt-4">
          Gunakan perangkat yang dipakai saat memesan. Masukkan nomor pesanan
          untuk melihat perkembangan terbaru.
        </p>
      </div>
      <form
        className="qp-panel p-5 sm:p-6"
        onSubmit={(e) => {
          e.preventDefault();
          setSearched(query.trim());
          setActiveTrackingId(query.trim());
        }}
      >
        <label htmlFor="tracking-id" className="qp-label">
          Nomor pesanan
        </label>
        <div className="flex gap-2">
          <input
            id="tracking-id"
            className="qp-field flex-1"
            placeholder="QP-…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
            autoCapitalize="off"
            autoComplete="off"
          />
          <button type="submit" className="qp-button">
            <Search size={17} />
            <span className="hidden sm:inline">Lacak</span>
            <span className="sr-only sm:hidden">Lacak</span>
          </button>
        </div>
        <p className="text-xs text-stone-500 mt-3">
          Nomor pesanan tersedia pada konfirmasi setelah checkout.
        </p>
        {orders.length > 0 && (
          <div className="mt-5 pt-4 border-t border-stone-200">
            <p className="text-xs text-stone-500 mb-2">
              Pesanan pada perangkat ini
            </p>
            <div className="flex flex-wrap gap-2">
              {orders.slice(0, 3).map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setQuery(o.id);
                    setSearched(o.id);
                    setActiveTrackingId(o.id);
                  }}
                  className="text-xs text-stone-700 bg-stone-50 rounded-lg px-3 py-3 max-w-full break-all"
                >
                  {o.id}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
      {order ? (
        <section className="qp-panel p-5 sm:p-8 mt-6">
          <div className="pb-6 border-b border-stone-200">
            <p className="qp-eyebrow">
              {order.orderStatus === 'DIBATALKAN'
                ? 'Pesanan dibatalkan'
                : 'Status pesanan'}
            </p>
            <h2 className="text-2xl mt-2">
              {order.orderStatus === 'DIBATALKAN'
                ? 'Pesanan tidak dilanjutkan'
                : stages[index]?.[1] || 'Sedang diperiksa'}
            </h2>
            <p className="text-xs text-stone-500 mt-3 break-all">
              {order.id} · {formatDateTime(order.createdAt)} WIB
            </p>
          </div>
          {order.orderStatus !== 'DIBATALKAN' && (
            <ol aria-label="Progres pesanan" className="py-6 space-y-5">
              {stages.map(([id, title, text], i) => (
                <li
                  key={id}
                  aria-current={i === index ? 'step' : undefined}
                  className="flex gap-4"
                >
                  <span
                    className={`qp-step-number ${i <= index ? '!bg-stone-900 !border-stone-900 text-white' : ''}`}
                  >
                    {i < index ? <Check size={15} /> : i + 1}
                  </span>
                  <div>
                    <p
                      className={`text-sm ${i <= index ? 'font-semibold' : 'text-stone-500'}`}
                    >
                      {title}
                    </p>
                    {i === index && (
                      <p className="text-xs text-stone-500 mt-1">{text}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
          <dl className="border-t border-stone-200 pt-5 text-sm space-y-3">
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">Total pesanan</dt>
              <dd className="font-semibold">
                {formatRupiah(order.totalAmount)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">Pembayaran</dt>
              <dd>
                {order.paymentStatus === 'LUNAS'
                  ? 'Lunas'
                  : 'Menunggu konfirmasi'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">Penerimaan</dt>
              <dd>
                {order.deliveryMethod === 'AMBIL_STUDIO'
                  ? 'Ambil di studio'
                  : 'Pengiriman'}
              </dd>
            </div>
          </dl>
          <ul className="mt-5 border-t border-stone-200 pt-4 space-y-2 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-3">
                <span className="text-stone-500">{item.quantity}×</span>
                <span>{item.serviceName}</span>
              </li>
            ))}
          </ul>
          <a
            className="qp-button qp-button-secondary w-full mt-6"
            href={createStudioOrderLink(order)}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={18} />
            Hubungi studio
            {!import.meta.env.VITE_STUDIO_WHATSAPP && ' via WhatsApp'}
          </a>
        </section>
      ) : (
        <div className="qp-panel p-8 mt-6 text-center" role="status">
          <Package
            size={32}
            strokeWidth={1.5}
            className="mx-auto text-stone-400"
          />
          <h2 className="text-2xl mt-5">
            {searched
              ? 'Pesanan belum ditemukan'
              : 'Kami kabari setiap langkahnya.'}
          </h2>
          <p className="text-sm text-stone-500 max-w-sm mx-auto mt-3">
            {searched
              ? 'Periksa nomor pesanan dan pastikan Anda memakai perangkat yang sama. Bila memesan langsung di studio, hubungi staf untuk bantuan.'
              : 'Pesanan Anda akan muncul di sini setelah tersimpan. Belum memesan? Temukan layanan yang sesuai.'}
          </p>
          {!searched && (
            <button
              className="qp-button qp-button-secondary mt-6"
              onClick={() => setCurrentView('layanan')}
            >
              Lihat layanan
            </button>
          )}
        </div>
      )}
    </div>
  );
};

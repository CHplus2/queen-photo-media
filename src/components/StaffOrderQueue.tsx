import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { useDialog } from '../hooks/useDialog';
import type { Order } from '../types';
import {
  formatDateTime,
  formatRupiah,
  createWhatsAppOrderLink,
} from '../utils/formatters';
import { Search, X, Printer, Check, MessageCircle } from 'lucide-react';
const statusText: Record<string, string> = {
  MENUNGGU_BAYAR: 'Menunggu konfirmasi',
  ANTREAN_DESAIN: 'Dikerjakan nanti',
  PROSES_CETAK: 'Sedang dikerjakan',
  SIAP_DIAMBIL_KIRIM: 'Siap diambil / dikirim',
  SELESAI: 'Selesai',
  DIBATALKAN: 'Dibatalkan',
};
export const StaffOrderQueue: React.FC<{
  onPrintReceipt: (order: Order) => void;
}> = ({ onPrintReceipt }) => {
  const { orders, updateOrderStatus, updateOrderPayment, reconcileStock } =
    useStudio();
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState('active');
  const [selected, setSelected] = useState<string | null>(null);
  const [cancel, setCancel] = useState(false);
  const [reason, setReason] = useState('');
  const [materials, setMaterials] = useState<'unused' | 'used'>('used');
  const [verify, setVerify] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const order = orders.find((o) => o.id === selected);
  const close = () => {
    if (!busy) {
      setSelected(null);
      setCancel(false);
      setVerify(false);
      setError('');
    }
  };
  const ref = useDialog<HTMLElement>(Boolean(order), close);
  const visible = orders.filter(
    (o) =>
      (scope === 'all' ||
        (o.orderStatus !== 'DIBATALKAN' &&
          (o.orderStatus !== 'SELESAI' || o.paymentStatus !== 'LUNAS'))) &&
      `${o.id} ${o.customerName} ${o.customerPhone} ${o.items.map((i) => i.serviceName).join(' ')}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const action = async (callback: () => Promise<void>) => {
    setError('');
    setBusy(true);
    try {
      await callback();
      setCancel(false);
      setVerify(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Perubahan belum tersimpan.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <section>
      <div className="flex flex-wrap gap-3 mb-5">
        <label className="relative flex-1 min-w-48">
          <span className="sr-only">Cari pesanan</span>
          <Search size={17} className="absolute left-3 top-4 text-stone-500" />
          <input
            className="qp-field !pl-10"
            type="search"
            placeholder="Nama, nomor pesanan, atau layanan"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label>
          <span className="sr-only">Tampilkan pesanan</span>
          <select
            className="qp-field"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
          >
            <option value="active">Perlu tindak lanjut</option>
            <option value="all">Semua & riwayat penjualan</option>
          </select>
        </label>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visible.map((o) => (
          <article className="qp-panel p-5" key={o.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="!font-sans !tracking-normal text-base font-semibold">
                  {o.customerName}
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  {o.channel === 'ONLINE' ? 'Website' : 'Walk-in'} ·{' '}
                  {formatDateTime(o.createdAt)} WIB
                </p>
              </div>
              <strong className="text-sm shrink-0">
                {formatRupiah(o.totalAmount)}
              </strong>
            </div>
            <p className="text-sm font-medium mt-4">
              {statusText[o.orderStatus]}
            </p>
            <p className="text-xs text-stone-600 mt-1">
              {o.paymentStatus === 'LUNAS'
                ? 'Pembayaran diterima'
                : 'Pembayaran perlu diperiksa'}
            </p>
            <ul className="text-sm text-stone-600 mt-4 space-y-1">
              {o.items.map((i) => (
                <li key={i.id}>
                  {i.quantity}× {i.serviceName}
                </li>
              ))}
            </ul>
            {o.estimatedReadyTime && (
              <p className="text-xs text-stone-600 mt-3">
                Janji: {o.estimatedReadyTime.slice(0, 10)}
              </p>
            )}
            <button
              className="qp-button qp-button-secondary w-full mt-5"
              onClick={() => {
                setSelected(o.id);
                setError('');
              }}
            >
              Buka pesanan
            </button>
          </article>
        ))}
      </div>
      {!visible.length && (
        <p className="qp-panel p-10 text-center text-stone-500">
          Tidak ada pesanan pada pilihan ini.
        </p>
      )}
      {order && (
        <div
          className="qp-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <section
            ref={ref}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="staff-order-title"
            className="qp-dialog"
          >
            <div className="qp-dialog-header">
              <div className="min-w-0">
                <span className="qp-eyebrow">
                  {order.channel === 'ONLINE'
                    ? 'Pesanan website'
                    : 'Penjualan walk-in'}
                </span>
                <h2 id="staff-order-title" className="text-2xl mt-2">
                  {order.customerName}
                </h2>
                <p className="text-xs text-stone-500 break-all mt-2">
                  {order.id}
                </p>
              </div>
              <button
                aria-label="Tutup pesanan"
                className="qp-icon-button shrink-0"
                disabled={busy}
                onClick={close}
              >
                <X size={20} />
              </button>
            </div>
            <div className="qp-dialog-content space-y-5">
              <p className="qp-notice">
                {statusText[order.orderStatus]} ·{' '}
                {order.paymentStatus === 'LUNAS' ? 'Lunas' : 'Belum dibayar'}
              </p>
              <ul className="space-y-3">
                {order.items.map((i) => (
                  <li key={i.id} className="flex justify-between gap-3 text-sm">
                    <div>
                      {i.quantity}× {i.serviceName}
                      <p className="text-xs text-stone-500">
                        {[i.size, i.frame, i.notes].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <strong className="shrink-0">
                      {formatRupiah(i.quantity * i.unitPrice)}
                    </strong>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between border-t border-stone-200 pt-4 font-semibold">
                <span>Total pesanan</span>
                <span>{formatRupiah(order.totalAmount)}</span>
              </div>
              {order.staffNotes && (
                <p className="text-sm text-stone-600 break-words">
                  Catatan: {order.staffNotes}
                </p>
              )}
              {order.customerPhone && (
                <p className="text-sm text-stone-600">
                  WhatsApp: {order.customerPhone}
                </p>
              )}
              {order.channel === 'WALKIN' && order.recordedBy && (
                <p className="text-xs text-stone-500">
                  Dicatat: {order.recordedBy.name}
                </p>
              )}
              {order.paymentStatus === 'LUNAS' && order.paymentVerifiedBy && (
                <p className="text-xs text-stone-500">
                  Pembayaran diperiksa: {order.paymentVerifiedBy.name}
                  {order.paidAt ? ` · ${formatDateTime(order.paidAt)} WIB` : ''}
                </p>
              )}
              {order.inventoryStatus === 'NEEDS_REVIEW' && (
                <p className="qp-notice">
                  Bahan perlu diperiksa:{' '}
                  {order.inventoryWarnings?.join(', ') ||
                    'transaksi lama / pemakaian belum diatur'}
                  . Jangan menganggap stok sudah dipotong.
                </p>
              )}
              {order.inventoryStatus === 'NEEDS_REVIEW' &&
                order.workflowVersion === 2 &&
                ['PROSES_CETAK', 'SIAP_DIAMBIL_KIRIM', 'SELESAI'].includes(
                  order.orderStatus,
                ) && (
                  <button
                    disabled={busy}
                    className="qp-button qp-button-secondary w-full"
                    onClick={() => action(() => reconcileStock(order.id))}
                  >
                    Bahan sudah diatur — catat pemakaian
                  </button>
                )}
              {order.orderStatus === 'DIBATALKAN' && (
                <p className="qp-notice">
                  Alasan:{' '}
                  {order.cancellationReason ||
                    'Tidak tercatat pada versi lama.'}
                  {order.paymentStatus === 'LUNAS'
                    ? ' Pembayaran sudah diterima: periksa pengembalian dana secara terpisah.'
                    : ''}
                </p>
              )}
              {order.orderStatus !== 'DIBATALKAN' && (
                <div className="space-y-3">
                  {order.paymentStatus !== 'LUNAS' && (
                    <button
                      disabled={busy}
                      className="qp-button w-full"
                      onClick={() => setVerify(!verify)}
                    >
                      Periksa pembayaran
                    </button>
                  )}
                  {verify && (
                    <div className="qp-notice space-y-4">
                      <p>
                        {order.paymentMethod === 'TUNAI_KASIR'
                          ? 'Pastikan uang tunai sudah diterima.'
                          : 'Periksa uang masuk pada aplikasi bank atau merchant QRIS. Screenshot pelanggan saja belum membuktikan pembayaran.'}
                      </p>
                      <button
                        disabled={busy}
                        className="qp-button w-full"
                        onClick={() =>
                          action(() => updateOrderPayment(order.id, 'LUNAS'))
                        }
                      >
                        Uang sudah masuk — tandai lunas <Check size={16} />
                      </button>
                    </div>
                  )}
                  {!['SIAP_DIAMBIL_KIRIM', 'SELESAI'].includes(
                    order.orderStatus,
                  ) && (
                    <button
                      disabled={busy}
                      className="qp-button qp-button-secondary w-full"
                      onClick={() =>
                        action(() =>
                          updateOrderStatus(order.id, 'SIAP_DIAMBIL_KIRIM'),
                        )
                      }
                    >
                      Pekerjaan selesai — siap diambil
                    </button>
                  )}
                  {order.orderStatus !== 'SELESAI' && (
                    <button
                      disabled={busy || order.paymentStatus !== 'LUNAS'}
                      className="qp-button qp-button-secondary w-full"
                      onClick={() =>
                        action(() => updateOrderStatus(order.id, 'SELESAI'))
                      }
                    >
                      Sudah diserahkan — selesai
                    </button>
                  )}
                  {order.paymentStatus !== 'LUNAS' && (
                    <p className="text-xs text-stone-500">
                      Selesaikan pemeriksaan pembayaran sebelum menyerahkan
                      pesanan.
                    </p>
                  )}
                  <button
                    disabled={busy}
                    className="text-sm text-red-800 underline min-h-11"
                    onClick={() => setCancel(!cancel)}
                  >
                    Batalkan pesanan
                  </button>
                  {cancel && (
                    <div className="border border-red-200 rounded-xl p-4 space-y-4">
                      <label className="block">
                        <span className="qp-label">Alasan pembatalan</span>
                        <textarea
                          className="qp-field"
                          value={reason}
                          maxLength={1000}
                          onChange={(e) => setReason(e.target.value)}
                        />
                      </label>
                      <label className="block">
                        <span className="qp-label">Bahan sudah terpakai?</span>
                        <select
                          className="qp-field"
                          value={materials}
                          onChange={(e) =>
                            setMaterials(e.target.value as 'unused' | 'used')
                          }
                        >
                          <option value="used">
                            Sudah terpakai — jangan kembalikan stok
                          </option>
                          <option value="unused">
                            Belum terpakai — kembalikan potongan tercatat
                          </option>
                        </select>
                      </label>
                      <p className="text-xs text-stone-500">
                        Kertas yang sudah dicetak tidak kembali menjadi bahan
                        baru. Pembatalan tidak otomatis mengembalikan uang.
                      </p>
                      <button
                        className="qp-button w-full"
                        disabled={busy || !reason.trim()}
                        onClick={() =>
                          action(() =>
                            updateOrderStatus(order.id, 'DIBATALKAN', {
                              reason,
                              materials,
                            }),
                          )
                        }
                      >
                        Konfirmasi pembatalan
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  className="qp-button qp-button-secondary"
                  onClick={() => onPrintReceipt(order)}
                >
                  <Printer size={17} />
                  Struk
                </button>
                {order.customerPhone && (
                  <a
                    className="qp-button qp-button-secondary"
                    href={createWhatsAppOrderLink(order)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle size={17} />
                    Hubungi pelanggan
                  </a>
                )}
              </div>
              {error && (
                <p className="qp-error" role="alert">
                  {error}
                </p>
              )}
              {order.history?.length ? (
                <details>
                  <summary className="text-sm cursor-pointer py-2">
                    Riwayat perubahan
                  </summary>
                  <ol className="mt-3 space-y-3">
                    {order.history.map((event, i) => (
                      <li className="text-xs text-stone-600" key={i}>
                        {formatDateTime(event.at)} WIB · {event.by.name}
                        <span className="block mt-1">{event.detail}</span>
                      </li>
                    ))}
                  </ol>
                </details>
              ) : null}
            </div>
          </section>
        </div>
      )}
    </section>
  );
};

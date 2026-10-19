import { auth } from '../lib/firebase';
import React, { useEffect, useRef, useState } from 'react';
import { useStudio } from '../context/StudioContext';
import type { Order, OrderItem, PaymentMethod } from '../types';
import { formatRupiah } from '../utils/formatters';
import { validateSale } from '../utils/workflow';
import {
  Plus,
  Search,
  Minus,
  Trash2,
  Check,
  Printer,
  ArrowRight,
  LoaderCircle,
} from 'lucide-react';
import { StaffOrderQueue } from './StaffOrderQueue';
interface Draft {
  items: OrderItem[];
  name: string;
  phone: string;
  notes: string;
  later: boolean;
  due: string;
  payment: PaymentMethod;
  received: boolean;
  requestId: string;
  cashTendered: string;
  partial: boolean;
  paymentAmount: string;
  stockExceptionReason: string;
}
const freshDraft = (): Draft => ({
  cashTendered: '',
  partial: false,
  paymentAmount: '',
  stockExceptionReason: '',
  items: [],
  name: '',
  phone: '',
  notes: '',
  later: false,
  due: '',
  payment: 'TUNAI_KASIR',
  received: true,
  requestId: crypto.randomUUID(),
});
const loadDraft = (): Draft => {
  try {
    const draft = JSON.parse(
      localStorage.getItem(
        `queen_staff_sale_${auth.currentUser?.uid || 'staff'}`,
      ) ||
        sessionStorage.getItem('queen_staff_sale') ||
        'null',
    );
    if (draft?.requestId && Array.isArray(draft.items))
      return { ...freshDraft(), ...draft };
  } catch {}
  return freshDraft();
};
export const AdminPosView: React.FC<{
  onPrintReceipt: (order: Order) => void;
  initialTab?: 'sale' | 'queue';
}> = ({ onPrintReceipt, initialTab = 'sale' }) => {
  const {
    services,
    invalidOrderIds = [],
    addOrder,
    setCurrentView,
    isFirebaseConnected,
    isSupervisor,
  } = useStudio();
  const [tab, setTab] = useState<'sale' | 'queue'>(initialTab);
  useEffect(() => setTab(initialTab), [initialTab]);
  const [draft, setDraft] = useState<Draft>(loadDraft);
  const [search, setSearch] = useState('');
  const [saleFormVisible, setSaleFormVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<Order | null>(null);
  const lock = useRef(false);
  useEffect(() => {
    try {
      localStorage.setItem(
        `queen_staff_sale_${auth.currentUser?.uid || 'staff'}`,
        JSON.stringify(draft),
      );
      sessionStorage.removeItem('queen_staff_sale');
    } catch {
      setError(
        'Tidak dapat menyimpan draf di perangkat. Jangan tutup halaman sebelum penjualan tersimpan.',
      );
    }
  }, [draft]);
  const total = draft.items.reduce(
    (n, item) => n + item.quantity * item.unitPrice,
    0,
  );
  const paymentAmount = draft.received
    ? draft.partial
      ? Number(draft.paymentAmount)
      : total
    : 0;
  const isPaid = draft.received && paymentAmount >= total;
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => {
      if (draft.items.length) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [draft.items.length]);
  useEffect(() => {
    const form = document.getElementById('staff-sale-form');
    if (!form) return;
    const observer = new IntersectionObserver(([entry]) =>
      setSaleFormVisible(entry.isIntersecting),
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, [tab, draft.items.length]);
  const active = services.filter(
    (s) =>
      s.isActive !== false &&
      `${s.name} ${s.category}`
        .toLowerCase()
        .includes(search.toLowerCase().trim()),
  );
  const add = (id: string) => {
    const service = services.find((s) => s.id === id);
    if (!service) return;
    const existing = draft.items.find((item) => item.serviceId === id);
    setDraft((d) => ({
      ...d,
      items: existing
        ? d.items.map((item) =>
            item.serviceId === id
              ? { ...item, quantity: Math.min(999, item.quantity + 1) }
              : item,
          )
        : [
            ...d.items,
            {
              id: crypto.randomUUID(),
              serviceId: id,
              serviceName: service.name,
              category: service.category,
              size: service.options?.sizes?.[0] || service.unit,
              quantity: 1,
              unitPrice: service.basePrice,
              unitCost: service.estimatedCost,
            },
          ],
    }));
    setSaved(null);
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lock.current) return;
    setError('');
    if ((draft.later || !isPaid) && !draft.name.trim()) {
      setError(
        'Isi nama pelanggan untuk pesanan nanti atau pembayaran yang belum diterima.',
      );
      return;
    }
    lock.current = true;
    setBusy(true);
    try {
      const totals = validateSale(draft.items);
      if (
        draft.received &&
        (!Number.isSafeInteger(paymentAmount) ||
          paymentAmount <= 0 ||
          paymentAmount > totals.subtotal)
      )
        throw new Error(
          'Isi jumlah pembayaran yang benar, tidak melebihi total.',
        );
      if (
        draft.payment === 'TUNAI_KASIR' &&
        draft.received &&
        draft.cashTendered !== '' &&
        Number(draft.cashTendered) < paymentAmount
      )
        throw new Error('Uang diterima kurang dari pembayaran yang dicatat.');
      const order = await addOrder(
        {
          customerName: draft.name.trim() || 'Pelanggan umum',
          customerPhone: draft.phone.trim(),
          channel: 'WALKIN',
          deliveryMethod: 'AMBIL_STUDIO',
          deliveryFee: 0,
          items: draft.items,
          ...totals,
          totalAmount: totals.subtotal,
          paymentMethod: draft.payment,
          paymentStatus: isPaid
            ? 'LUNAS'
            : paymentAmount > 0
              ? 'SEBAGIAN'
              : 'BELUM_BAYAR',
          initialPaymentAmount: paymentAmount,
          stockExceptionReason: !draft.later
            ? draft.stockExceptionReason.trim() || undefined
            : undefined,
          orderStatus: draft.later ? 'ANTREAN_DESAIN' : 'SELESAI',
          staffNotes: draft.notes.trim() || undefined,
          estimatedReadyTime: draft.due || undefined,
        },
        draft.requestId,
      );
      setSaved(order);
      setDraft(freshDraft());
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Penjualan belum tersimpan. Isian tetap tersedia.',
      );
    } finally {
      setBusy(false);
      lock.current = false;
    }
  };
  const missing = draft.items.filter(
    (item) => !services.find((s) => s.id === item.serviceId)?.stockMode,
  );
  return (
    <div className="qp-container py-8 sm:py-10 pb-28 lg:pb-10">
      <div className="flex flex-wrap justify-between gap-4 items-start mb-6">
        <div>
          <span className="qp-eyebrow">Ruang kerja Queen Photo</span>
          <h1 className="text-3xl font-semibold !font-sans mt-2">
            {tab === 'sale' ? 'Kasir' : 'Pesanan'}
          </h1>
          <p className="text-sm text-stone-500 mt-2">
            Catat sekali. Laporan dan bahan terhubung ke pesanan.
          </p>
        </div>
        <button
          className="qp-button qp-button-secondary"
          onClick={() => setCurrentView('supervision')}
        >
          {isSupervisor ? 'Ringkasan toko' : 'Penjualan hari ini'}{' '}
          <ArrowRight size={16} />
        </button>
      </div>
      {tab === 'sale' && draft.items.length > 0 && !saleFormVisible && (
        <aside
          className="lg:hidden fixed bottom-4 left-4 right-4 z-40"
          aria-label="Akses rincian penjualan"
        >
          <button
            type="button"
            className="qp-button w-full shadow-lg"
            onClick={() =>
              document
                .getElementById('staff-sale-form')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            Lihat penjualan · {formatRupiah(total)} <ArrowRight size={16} />
          </button>
        </aside>
      )}
      {!isFirebaseConnected && (
        <p role="status" className="qp-notice mb-5">
          Menunggu koneksi database. Pastikan muncul konfirmasi tersimpan
          sebelum menyerahkan struk.
        </p>
      )}
      {invalidOrderIds.length > 0 && (
        <p role="alert" className="qp-error">
          Ada {invalidOrderIds.length} pesanan dengan data tidak valid. Hubungi
          pemilik; daftar dan laporan belum lengkap.
        </p>
      )}
      {tab === 'queue' ? (
        <StaffOrderQueue onPrintReceipt={onPrintReceipt} />
      ) : (
        <>
          {saved && (
            <section
              role="status"
              className="qp-panel p-5 mb-6 border-stone-700"
            >
              <div className="flex gap-3 items-start">
                <Check size={22} />
                <div className="min-w-0 flex-1">
                  <h2 className="!font-sans font-semibold text-lg">
                    Penjualan tersimpan · {formatRupiah(saved.totalAmount)}
                  </h2>
                  <p className="text-sm text-stone-600 mt-1">
                    {saved.paymentStatus === 'LUNAS'
                      ? 'Pembayaran dicatat diterima.'
                      : saved.paymentStatus === 'SEBAGIAN'
                        ? `DP tercatat ${formatRupiah(saved.payments?.reduce((n, p) => n + p.amount, 0) || saved.initialPaymentAmount || 0)}. Sisa bayar tersedia di Pesanan.`
                        : 'Pembayaran belum diterima.'}{' '}
                    {saved.orderStatus === 'SELESAI'
                      ? 'Tidak perlu memperbarui status kerja.'
                      : 'Tersedia di daftar tindak lanjut.'}
                  </p>
                  {saved.inventoryStatus === 'NEEDS_REVIEW' && (
                    <p className="text-sm text-amber-900 mt-2">
                      Bahan belum dipotong. Penanggung jawab perlu memeriksa
                      pemakaian atau pengecualian stok.
                    </p>
                  )}
                  <p className="text-xs text-stone-500 break-all mt-2">
                    {saved.id}
                  </p>
                </div>
                <button
                  className="qp-button qp-button-secondary"
                  onClick={() => onPrintReceipt(saved)}
                >
                  <Printer size={17} />
                  <span className="hidden sm:inline">Struk</span>
                  <span className="sr-only sm:hidden">Cetak struk</span>
                </button>
              </div>
            </section>
          )}
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-6 items-start">
            <section className="qp-panel p-5 sm:p-6">
              <label className="qp-label" htmlFor="staff-service-search">
                Pilih layanan
              </label>
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-4 text-stone-500"
                />
                <input
                  id="staff-service-search"
                  className="qp-field !pl-10"
                  type="search"
                  placeholder="Cari cetak foto, pas foto, studio…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-5 max-h-[420px] lg:max-h-[600px] overflow-y-auto pr-1">
                {active.map((service) => (
                  <button
                    key={service.id}
                    disabled={busy}
                    className="text-left p-4 border border-stone-200 rounded-xl hover:border-stone-700 hover:bg-stone-50 min-h-28 disabled:opacity-50"
                    onClick={() => add(service.id)}
                  >
                    <span className="text-sm font-semibold block leading-snug">
                      {service.name}
                    </span>
                    <span className="text-sm mt-3 block">
                      {formatRupiah(service.basePrice)}
                    </span>
                    <span className="text-xs text-stone-500 mt-1 block">
                      per {service.unit}
                    </span>
                  </button>
                ))}
              </div>
              {active.length === 0 && (
                <p className="qp-notice mt-5">
                  Layanan tidak ditemukan. Coba kata lain.
                </p>
              )}
            </section>
            <form
              id="staff-sale-form"
              onSubmit={save}
              className="qp-panel p-5 sm:p-6 lg:sticky lg:top-40"
            >
              <fieldset disabled={busy} className="space-y-5 min-w-0">
                <legend className="text-lg font-semibold mb-5">
                  Rincian penjualan
                </legend>
                {!draft.items.length ? (
                  <p className="qp-notice">
                    Pilih satu atau beberapa layanan di sebelah kiri. Pelanggan
                    tidak perlu membuat akun.
                  </p>
                ) : (
                  <ul className="divide-y divide-stone-200">
                    {draft.items.map((item) => (
                      <li key={item.id} className="py-4 first:pt-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="!font-sans !tracking-normal text-sm font-semibold">
                              {item.serviceName}
                            </h2>
                            <p className="text-xs text-stone-500 mt-1">
                              {item.size}
                            </p>
                          </div>
                          <button
                            type="button"
                            aria-label={`Hapus ${item.serviceName}`}
                            className="qp-icon-button shrink-0"
                            onClick={() =>
                              setDraft((d) => ({
                                ...d,
                                items: d.items.filter((i) => i.id !== item.id),
                              }))
                            }
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                        <div className="grid grid-cols-[85px_1fr] gap-4 mt-3">
                          <label>
                            <span className="qp-label">Jumlah</span>
                            <input
                              className="qp-field"
                              type="number"
                              min={1}
                              max={999}
                              required
                              value={item.quantity}
                              onChange={(e) =>
                                setDraft((d) => ({
                                  ...d,
                                  items: d.items.map((i) =>
                                    i.id === item.id
                                      ? {
                                          ...i,
                                          quantity: Number(e.target.value),
                                        }
                                      : i,
                                  ),
                                }))
                              }
                            />
                          </label>
                          <div className="text-right">
                            <strong className="text-sm block mb-2">
                              {formatRupiah(item.quantity * item.unitPrice)}
                            </strong>
                            <details>
                              <summary className="text-xs text-stone-500 cursor-pointer min-h-8">
                                Harga satuan {formatRupiah(item.unitPrice)} ·
                                Ubah
                              </summary>
                              {(services.find((s) => s.id === item.serviceId)
                                ?.options?.sizes?.length || 0) > 1 && (
                                <label className="block mt-3 text-left">
                                  <span className="qp-label">
                                    Ukuran — periksa harga setelah mengubah
                                  </span>
                                  <select
                                    className="qp-field"
                                    value={item.size}
                                    onChange={(e) =>
                                      setDraft((d) => ({
                                        ...d,
                                        items: d.items.map((i) =>
                                          i.id === item.id
                                            ? { ...i, size: e.target.value }
                                            : i,
                                        ),
                                      }))
                                    }
                                  >
                                    {services
                                      .find((s) => s.id === item.serviceId)
                                      ?.options?.sizes?.map((size) => (
                                        <option key={size}>{size}</option>
                                      ))}
                                  </select>
                                </label>
                              )}
                              <label className="block mt-3 text-left">
                                <span className="qp-label">
                                  Harga satuan (Rp)
                                </span>
                                <input
                                  className="qp-field"
                                  type="number"
                                  min={0}
                                  step={1}
                                  required
                                  value={item.unitPrice}
                                  onChange={(e) =>
                                    setDraft((d) => ({
                                      ...d,
                                      items: d.items.map((i) =>
                                        i.id === item.id
                                          ? {
                                              ...i,
                                              unitPrice: Number(e.target.value),
                                            }
                                          : i,
                                      ),
                                    }))
                                  }
                                />
                              </label>
                            </details>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <fieldset>
                  <legend className="qp-label">Pembayaran</legend>
                  <div className="flex gap-2 flex-wrap">
                    {(
                      [
                        ['TUNAI_KASIR', 'Tunai'],
                        ['QRIS', 'QRIS'],
                        ['TRANSFER_BANK', 'Transfer bank'],
                      ] as const
                    ).map(([id, label]) => (
                      <label
                        key={id}
                        className={`flex gap-2 items-center p-3 border rounded-lg text-sm cursor-pointer ${draft.payment === id ? 'border-stone-900 bg-stone-50' : 'border-stone-200'}`}
                      >
                        <input
                          name="sale-payment"
                          type="radio"
                          checked={draft.payment === id}
                          onChange={() =>
                            setDraft((d) => ({
                              ...d,
                              payment: id,
                              received: id === 'TUNAI_KASIR',
                              cashTendered: '',
                            }))
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  <label className="flex gap-3 items-start text-sm mt-4">
                    <input
                      type="checkbox"
                      checked={draft.received}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, received: e.target.checked }))
                      }
                    />
                    <span>
                      {draft.payment === 'TUNAI_KASIR'
                        ? 'Uang tunai sudah diterima'
                        : 'Uang masuk sudah dicek di aplikasi bank / merchant QRIS'}
                      <span className="block text-xs text-stone-500 mt-1">
                        Jika belum dicentang, pembayaran tetap menunggu
                        konfirmasi.
                      </span>
                    </span>
                  </label>
                  {draft.received && (
                    <div className="space-y-3 mt-4">
                      <label className="flex gap-3 items-center text-sm">
                        <input
                          type="checkbox"
                          checked={draft.partial}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              partial: e.target.checked,
                              cashTendered: '',
                            }))
                          }
                        />
                        Bayar sebagian / DP
                      </label>
                      {draft.partial && (
                        <label className="block">
                          <span className="qp-label">
                            Pembayaran sekarang (Rp)
                          </span>
                          <input
                            className="qp-field"
                            type="number"
                            min="1"
                            max={Math.max(0, total)}
                            step="1"
                            required
                            value={draft.paymentAmount}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                paymentAmount: e.target.value,
                              }))
                            }
                          />
                        </label>
                      )}
                      {draft.payment === 'TUNAI_KASIR' && (
                        <>
                          <label className="block">
                            <span className="qp-label">
                              Uang diterima (Rp, untuk hitung kembalian)
                            </span>
                            <input
                              className="qp-field"
                              type="number"
                              min="0"
                              step="1"
                              value={draft.cashTendered}
                              onChange={(e) =>
                                setDraft((d) => ({
                                  ...d,
                                  cashTendered: e.target.value,
                                }))
                              }
                            />
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {[paymentAmount, 20000, 50000, 100000]
                              .filter(
                                (n, i, a) =>
                                  n > 0 &&
                                  n >= paymentAmount &&
                                  a.indexOf(n) === i,
                              )
                              .map((n) => (
                                <button
                                  type="button"
                                  className="qp-button qp-button-secondary !px-3 !py-2"
                                  key={n}
                                  onClick={() =>
                                    setDraft((d) => ({
                                      ...d,
                                      cashTendered: String(n),
                                    }))
                                  }
                                >
                                  {n === paymentAmount
                                    ? 'Uang pas'
                                    : formatRupiah(n)}
                                </button>
                              ))}
                          </div>
                          {draft.cashTendered !== '' && (
                            <p
                              role="status"
                              className="qp-notice text-lg font-semibold"
                            >
                              {Number(draft.cashTendered) >= paymentAmount
                                ? `Kembalian ${formatRupiah(Number(draft.cashTendered) - paymentAmount)}`
                                : `Uang kurang ${formatRupiah(paymentAmount - Number(draft.cashTendered))}`}
                            </p>
                          )}
                        </>
                      )}
                      {draft.partial && (
                        <p className="qp-notice">
                          Sisa bayar{' '}
                          {formatRupiah(Math.max(0, total - paymentAmount))}
                        </p>
                      )}
                    </div>
                  )}
                </fieldset>
                <label className="flex items-start gap-3 border-t border-stone-200 pt-5 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.later}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, later: e.target.checked }))
                    }
                  />
                  <span className="font-semibold">
                    Dikerjakan / diambil nanti
                    <span className="block text-xs text-stone-500 font-normal mt-1">
                      Biarkan kosong untuk pembelian yang langsung selesai.
                    </span>
                  </span>
                </label>
                {(draft.later || !isPaid) && (
                  <div className="space-y-4 bg-stone-50 rounded-xl p-4">
                    <label className="block">
                      <span className="qp-label">Nama pelanggan</span>
                      <input
                        className="qp-field"
                        required
                        value={draft.name}
                        maxLength={100}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, name: e.target.value }))
                        }
                      />
                    </label>
                    <label className="block">
                      <span className="qp-label">WhatsApp (opsional)</span>
                      <input
                        className="qp-field"
                        type="tel"
                        value={draft.phone}
                        maxLength={20}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, phone: e.target.value }))
                        }
                      />
                    </label>
                    <label className="block">
                      <span className="qp-label">Tanggal janji (opsional)</span>
                      <input
                        className="qp-field"
                        type="date"
                        value={draft.due}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, due: e.target.value }))
                        }
                      />
                    </label>
                  </div>
                )}
                <details>
                  <summary className="text-sm cursor-pointer py-2">
                    Catatan / nama pelanggan (opsional)
                  </summary>
                  <div className="space-y-3 mt-3">
                    {!draft.later && isPaid && (
                      <label className="block">
                        <span className="qp-label">Nama pelanggan</span>
                        <input
                          className="qp-field"
                          value={draft.name}
                          maxLength={100}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, name: e.target.value }))
                          }
                        />
                      </label>
                    )}
                    <label className="block">
                      <span className="qp-label">Catatan</span>
                      <textarea
                        className="qp-field"
                        rows={2}
                        value={draft.notes}
                        maxLength={2000}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, notes: e.target.value }))
                        }
                      />
                    </label>
                  </div>
                </details>
                {!draft.later && (
                  <details>
                    <summary className="text-sm cursor-pointer py-2">
                      Stok tidak cocok? Catat pengecualian
                    </summary>
                    <p className="text-sm text-stone-600 my-2">
                      Hanya jika barang benar-benar sudah dijual tetapi saldo
                      stok salah. Penjualan disimpan tanpa pemotongan bahan dan
                      muncul untuk pemeriksaan penanggung jawab.
                    </p>
                    <label>
                      <span className="qp-label">
                        Alasan pengecualian stok (kosongkan untuk pemotongan
                        normal)
                      </span>
                      <input
                        className="qp-field"
                        maxLength={300}
                        value={draft.stockExceptionReason}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            stockExceptionReason: e.target.value,
                          }))
                        }
                      />
                    </label>
                  </details>
                )}
                {missing.length > 0 && (
                  <p className="text-xs text-amber-900">
                    Pemakaian bahan {missing.length} layanan belum diatur.
                    Penjualan tetap dapat dicatat; stok akan ditandai perlu
                    pemeriksaan.
                  </p>
                )}
                <div className="border-t border-stone-200 pt-5 flex justify-between font-semibold text-xl">
                  <span>Total</span>
                  <span className="tabular-nums">{formatRupiah(total)}</span>
                </div>
                {error && (
                  <p role="alert" className="qp-error">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  className="qp-button w-full"
                  disabled={busy || !draft.items.length}
                >
                  {busy ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Menyimpan…
                    </>
                  ) : (
                    <>
                      Simpan penjualan <Check size={17} />
                    </>
                  )}
                </button>
                <p className="text-xs text-stone-500 text-center">
                  Struk dan ringkasan tersedia setelah tersimpan.
                </p>
                {draft.items.length > 0 && (
                  <button
                    type="button"
                    className="text-sm underline text-stone-500 min-h-11 w-full"
                    onClick={() => {
                      if (
                        window.confirm(
                          'Kosongkan isian dan mulai penjualan baru? Periksa riwayat bila penyimpanan sebelumnya belum pasti.',
                        )
                      ) {
                        setDraft(freshDraft());
                        setError('');
                      }
                    }}
                  >
                    Kosongkan isian
                  </button>
                )}
              </fieldset>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

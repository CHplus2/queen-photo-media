import React, { useEffect, useRef, useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { DeliveryMethod, PaymentMethod, Order } from '../types';
import { PONTIANAK_DISTRICTS } from '../data/initialData';
import { formatRupiah, createStudioOrderLink } from '../utils/formatters';
import { useDialog } from '../hooks/useDialog';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Truck,
  Check,
  MessageCircle,
  ShieldCheck,
  LoaderCircle,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    addOrder,
    setActiveTrackingId,
    setCurrentView,
  } = useStudio();
  const [step, setStep] = useState<'cart' | 'details'>('cart');
  const [delivery, setDelivery] = useState<DeliveryMethod>('AMBIL_STUDIO');
  const [district, setDistrict] = useState(PONTIANAK_DISTRICTS[0]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('QRIS');
  const [voucher, setVoucher] = useState('');
  const [discount, setDiscount] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);
  const content = useRef<HTMLDivElement>(null);
  const close = () => {
    if (submitting) return;
    setIsCartOpen(false);
    setCompleted(null);
    setStep('cart');
    setError('');
  };
  const ref = useDialog<HTMLElement>(isCartOpen, close);
  useEffect(() => {
    content.current?.scrollTo({ top: 0 });
  }, [step]);
  useEffect(() => {
    if (error)
      content.current
        ?.querySelector('[role="alert"]')
        ?.scrollIntoView({ block: 'nearest' });
  }, [error]);
  if (!isCartOpen) return null;
  const subtotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const cost = cart.reduce(
    (sum, item) => sum + item.unitCost * item.quantity,
    0,
  );
  const deliveryFee = delivery === 'AMBIL_STUDIO' ? 0 : district.fee;
  const discountAmount = Math.round(subtotal * discount);
  const total = subtotal - discountAmount + deliveryFee;
  const applyVoucher = (event: React.FormEvent) => {
    event.preventDefault();
    if (
      ['QUEEN10HEMAT', 'QUEEN10', 'QUEENFOTO10'].includes(
        voucher.trim().toUpperCase(),
      )
    ) {
      setDiscount(0.1);
      setVoucherMessage('Diskon 10% diterapkan.');
    } else {
      setDiscount(0);
      setVoucherMessage('Kode belum dikenali. Periksa kembali kode Anda.');
    }
  };
  const checkout = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || cart.length === 0) return;
    setError('');
    if (
      !name.trim() ||
      phone.replace(/\D/g, '').length < 8 ||
      phone.replace(/\D/g, '').length > 15 ||
      (delivery !== 'AMBIL_STUDIO' && !address.trim())
    ) {
      setError(
        'Lengkapi nama, nomor WhatsApp yang valid, dan alamat pengiriman bila diperlukan.',
      );
      return;
    }
    setSubmitting(true);
    try {
      const order = await addOrder({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerAddress:
          delivery === 'AMBIL_STUDIO'
            ? 'Ambil di Studio Jl. Gajah Mada'
            : address.trim(),
        district: delivery === 'AMBIL_STUDIO' ? undefined : district.name,
        channel: 'ONLINE',
        deliveryMethod: delivery,
        deliveryFee,
        items: [...cart],
        subtotal,
        totalAmount: total,
        totalCost: cost,
        totalProfit: subtotal - discountAmount - cost,
        paymentMethod: payment,
        paymentStatus: 'BELUM_BAYAR',
        orderStatus: 'MENUNGGU_BAYAR',
        staffNotes: `Pesanan website · Diskon ${discountAmount > 0 ? '10%' : 'tidak ada'} · Menunggu foto asli dan konfirmasi staf.`,
      });
      setCompleted(order);
      clearCart();
      setDiscount(0);
      setVoucher('');
      setVoucherMessage('');
    } catch {
      setError(
        'Pesanan belum tersimpan. Keranjang tetap aman. Periksa koneksi lalu coba kembali.',
      );
    } finally {
      setSubmitting(false);
    }
  };
  const shop = () => {
    setCurrentView('layanan');
    close();
  };
  return (
    <div
      className="fixed inset-0 z-[60] bg-stone-950/50 backdrop-blur-sm flex justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <aside
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="bg-white w-full max-w-[560px] h-dvh flex flex-col shadow-2xl"
      >
        <div className="qp-dialog-header">
          <div>
            <span className="qp-eyebrow">Pesanan Queen Photo</span>
            <h2 id="cart-title" className="text-2xl sm:text-3xl mt-2">
              {completed
                ? 'Pesanan tersimpan'
                : step === 'cart'
                  ? 'Keranjang Anda'
                  : 'Rincian pemesanan'}
            </h2>
          </div>
          <button
            aria-label="Tutup keranjang"
            disabled={submitting}
            className="qp-icon-button"
            onClick={close}
          >
            <X size={21} />
          </button>
        </div>
        {!completed && cart.length > 0 && (
          <ol
            aria-label="Tahap pemesanan"
            className="flex gap-6 px-6 py-4 bg-stone-50 border-b border-stone-200 text-sm"
          >
            <li
              className={step === 'cart' ? 'font-semibold' : 'text-stone-500'}
              aria-current={step === 'cart' ? 'step' : undefined}
            >
              01 <span className="ml-1">Keranjang</span>
            </li>
            <li
              className={
                step === 'details' ? 'font-semibold' : 'text-stone-500'
              }
              aria-current={step === 'details' ? 'step' : undefined}
            >
              02 <span className="ml-1">Checkout</span>
            </li>
          </ol>
        )}
        <div ref={content} className="qp-dialog-content flex-1">
          {completed ? (
            <div className="space-y-6">
              <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center">
                <Check size={26} />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  Satu langkah lagi: hubungi studio.
                </h3>
                <p className="text-sm text-stone-600 mt-3">
                  Kirim foto asli melalui WhatsApp. Staf akan memeriksa rincian,
                  harga, dan instruksi pembayaran sebelum pesanan diproses.
                </p>
              </div>
              <div className="qp-notice">
                <span className="qp-eyebrow">Nomor pesanan</span>
                <p className="font-mono text-sm break-all mt-2">
                  {completed.id}
                </p>
                <button
                  className="text-sm underline min-h-11"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(completed.id);
                      setCopied(true);
                    } catch {
                      setCopied(false);
                    }
                  }}
                >
                  {copied ? 'Nomor disalin' : 'Salin nomor pesanan'}
                </button>
                <span className="sr-only" role="status">
                  {copied ? 'Nomor pesanan disalin' : ''}
                </span>
              </div>
              <dl className="text-sm space-y-3">
                <div className="flex justify-between gap-4">
                  <dt className="text-stone-500">Total pesanan</dt>
                  <dd className="font-semibold">
                    {formatRupiah(completed.totalAmount)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-stone-500">Pembayaran</dt>
                  <dd>Menunggu konfirmasi</dd>
                </div>
              </dl>
              <a
                href={createStudioOrderLink(completed)}
                target="_blank"
                rel="noreferrer"
                className="qp-button w-full"
              >
                <MessageCircle size={18} />
                {import.meta.env.VITE_STUDIO_WHATSAPP
                  ? 'Kirim foto & konfirmasi'
                  : 'Bagikan ke WhatsApp studio'}
              </a>
              {!import.meta.env.VITE_STUDIO_WHATSAPP && (
                <p className="text-xs text-stone-500">
                  Pilih kontak studio di WhatsApp untuk mengirim rincian ini.
                </p>
              )}
              <button
                className="qp-button qp-button-secondary w-full"
                onClick={() => {
                  setActiveTrackingId(completed.id);
                  setCurrentView('lacak');
                  close();
                }}
              >
                Lihat status pesanan <ArrowRight size={16} />
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag
                size={36}
                strokeWidth={1.25}
                className="mx-auto text-stone-400"
              />
              <h3 className="text-xl font-semibold mt-6">
                Mulai dari satu momen.
              </h3>
              <p className="text-sm text-stone-500 mt-3 max-w-xs mx-auto">
                Pilih layanan cetak atau paket foto. Semua pilihan Anda akan
                tersimpan di sini.
              </p>
              <button className="qp-button mt-7" onClick={shop}>
                Jelajahi layanan <ArrowRight size={16} />
              </button>
            </div>
          ) : step === 'cart' ? (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-stone-600 mb-5">
                  {cart.length} layanan dalam satu pesanan. Anda bisa menambah
                  layanan sebelum checkout.
                </p>
                <ul className="divide-y divide-stone-200">
                  {cart.map((item) => (
                    <li key={item.id} className="py-5 first:pt-0">
                      <div className="flex justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold leading-relaxed">
                            {item.serviceName}
                          </h3>
                          <p className="text-xs text-stone-500 mt-1">
                            {[
                              item.size,
                              item.finish,
                              item.frame,
                              item.backgroundColor,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                          {item.notes && (
                            <p className="text-xs text-stone-600 mt-2 break-words">
                              Catatan: {item.notes}
                            </p>
                          )}
                          {item.photoFileName && (
                            <p className="text-xs text-stone-500 mt-2 break-all">
                              File untuk dikirim: {item.photoFileName}
                            </p>
                          )}
                        </div>
                        <button
                          aria-label={`Hapus ${item.serviceName}`}
                          className="qp-icon-button shrink-0 text-stone-500"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-4 gap-3">
                        <div className="inline-flex items-center border border-stone-200 rounded-lg">
                          <button
                            className="qp-icon-button"
                            disabled={item.quantity <= 1}
                            aria-label={`Kurangi jumlah ${item.serviceName}`}
                            onClick={() =>
                              updateCartItemQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <Minus size={15} />
                          </button>
                          <span
                            aria-label={`Jumlah ${item.serviceName}`}
                            className="min-w-8 text-center text-sm font-semibold"
                          >
                            {item.quantity}
                          </span>
                          <button
                            className="qp-icon-button"
                            disabled={item.quantity >= 999}
                            aria-label={`Tambah jumlah ${item.serviceName}`}
                            onClick={() =>
                              updateCartItemQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                        <strong className="text-sm tabular-nums">
                          {formatRupiah(item.unitPrice * item.quantity)}
                        </strong>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                className="qp-button qp-button-secondary w-full"
                onClick={shop}
              >
                <Plus size={17} />
                Tambah layanan lain
              </button>
              <details className="border-t border-stone-200 pt-5">
                <summary className="text-sm cursor-pointer min-h-11">
                  Punya kode promo?
                </summary>
                <form onSubmit={applyVoucher} className="flex gap-2 mt-3">
                  <label htmlFor="cart-voucher" className="sr-only">
                    Kode promo
                  </label>
                  <input
                    id="cart-voucher"
                    className="qp-field flex-1 uppercase"
                    placeholder="Masukkan kode"
                    value={voucher}
                    onChange={(e) => setVoucher(e.target.value)}
                  />
                  <button
                    className="qp-button qp-button-secondary"
                    type="submit"
                  >
                    Terapkan
                  </button>
                </form>
                {voucherMessage && (
                  <p role="status" className="text-sm text-stone-600 mt-3">
                    {voucherMessage}
                  </p>
                )}
              </details>
              <div className="qp-notice flex items-start gap-3">
                <MessageCircle size={18} className="shrink-0 mt-1" />
                <p>
                  Foto asli dikirim melalui WhatsApp setelah checkout. Belum ada
                  pembayaran pada langkah ini.
                </p>
              </div>
            </div>
          ) : (
            <form id="checkout-form" onSubmit={checkout} className="space-y-7">
              <fieldset disabled={submitting} className="space-y-7">
                <legend className="sr-only">Informasi pemesanan</legend>
                <section>
                  <h3 className="text-base font-semibold mb-4">
                    01 · Informasi pemesan
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="qp-label" htmlFor="customer-name">
                        Nama lengkap{' '}
                        <span className="text-stone-500 font-normal">
                          (wajib)
                        </span>
                      </label>
                      <input
                        id="customer-name"
                        className="qp-field"
                        autoComplete="name"
                        required
                        maxLength={100}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nama Anda"
                      />
                    </div>
                    <div>
                      <label className="qp-label" htmlFor="customer-phone">
                        Nomor WhatsApp{' '}
                        <span className="text-stone-500 font-normal">
                          (wajib)
                        </span>
                      </label>
                      <input
                        id="customer-phone"
                        className="qp-field"
                        type="tel"
                        autoComplete="tel"
                        required
                        maxLength={20}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0812xxxxxxxx"
                      />
                      <p className="text-xs text-stone-500 mt-2">
                        Untuk konfirmasi rincian dan kabar pesanan.
                      </p>
                    </div>
                  </div>
                </section>
                <fieldset>
                  <legend className="text-base font-semibold mb-4">
                    02 · Terima pesanan
                  </legend>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {(
                      [
                        [
                          'AMBIL_STUDIO',
                          'Ambil di studio',
                          'Tanpa biaya kirim',
                          MapPin,
                        ],
                        [
                          'GRAB_EXPRESS_PONTIANAK',
                          'Kirim ke alamat',
                          'Ongkir sesuai kecamatan',
                          Truck,
                        ],
                      ] as const
                    ).map(([id, title, desc, Icon]) => (
                      <label
                        key={id}
                        className={`p-4 border rounded-xl cursor-pointer flex gap-3 items-start ${delivery === id ? 'border-stone-900 bg-stone-50' : 'border-stone-200'}`}
                      >
                        <input
                          type="radio"
                          name="delivery"
                          value={id}
                          checked={delivery === id}
                          onChange={() => setDelivery(id)}
                        />
                        <span>
                          <Icon size={17} className="mb-2" />
                          <strong className="text-sm block">{title}</strong>
                          <span className="text-xs text-stone-500 block mt-1">
                            {desc}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                  {delivery === 'AMBIL_STUDIO' ? (
                    <p className="text-xs text-stone-500 mt-3">
                      Jl. Gajah Mada No. 128, Pontianak. Tunggu konfirmasi
                      sebelum datang.
                    </p>
                  ) : (
                    <div className="space-y-4 mt-4">
                      <div>
                        <label htmlFor="customer-district" className="qp-label">
                          Kecamatan tujuan
                        </label>
                        <select
                          id="customer-district"
                          className="qp-field"
                          value={district.name}
                          onChange={(e) => {
                            const selected = PONTIANAK_DISTRICTS.find(
                              (d) => d.name === e.target.value,
                            );
                            if (selected) setDistrict(selected);
                          }}
                        >
                          {PONTIANAK_DISTRICTS.map((d) => (
                            <option key={d.name}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="customer-address" className="qp-label">
                          Alamat lengkap & patokan
                        </label>
                        <textarea
                          id="customer-address"
                          className="qp-field"
                          autoComplete="street-address"
                          required
                          rows={3}
                          maxLength={1000}
                          placeholder="Nama jalan, nomor rumah, dan patokan"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </div>
                      <p className="text-xs text-stone-500">
                        Estimasi ongkir {formatRupiah(deliveryFee)}. Staf
                        mengonfirmasi ketersediaan pengiriman.
                      </p>
                    </div>
                  )}
                </fieldset>
                <fieldset>
                  <legend className="text-base font-semibold mb-4">
                    03 · Rencana pembayaran
                  </legend>
                  <div className="space-y-2">
                    {(
                      [
                        ['QRIS', 'QRIS / e-wallet'],
                        ['TRANSFER_BCA', 'Transfer bank'],
                        ['TUNAI_KASIR', 'Bayar di kasir'],
                      ] as const
                    ).map(([id, label]) => (
                      <label
                        key={id}
                        className={`flex items-center gap-3 p-3.5 border rounded-lg text-sm cursor-pointer ${payment === id ? 'border-stone-900 bg-stone-50' : 'border-stone-200'}`}
                      >
                        <input
                          name="payment"
                          type="radio"
                          checked={payment === id}
                          onChange={() => setPayment(id)}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  <p className="qp-notice mt-4 flex gap-3">
                    <ShieldCheck size={20} className="shrink-0" />
                    <span>
                      Belum perlu transfer. Staf akan mengonfirmasi harga dan
                      mengirim instruksi pembayaran resmi.
                    </span>
                  </p>
                </fieldset>
              </fieldset>
              {error && (
                <p role="alert" className="qp-error">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
        {!completed && cart.length > 0 && (
          <div className="qp-dialog-footer space-y-4">
            <dl className="text-sm space-y-2">
              <div className="flex justify-between">
                <dt className="text-stone-500">Subtotal layanan</dt>
                <dd>{formatRupiah(subtotal)}</dd>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-stone-500">Diskon 10%</dt>
                  <dd>−{formatRupiah(discountAmount)}</dd>
                </div>
              )}
              {step === 'details' && (
                <div className="flex justify-between">
                  <dt className="text-stone-500">
                    {delivery === 'AMBIL_STUDIO'
                      ? 'Ambil di studio'
                      : 'Estimasi pengiriman'}
                  </dt>
                  <dd>
                    {deliveryFee === 0 ? 'Gratis' : formatRupiah(deliveryFee)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg pt-2">
                <dt>{step === 'cart' ? 'Total layanan' : 'Total pesanan'}</dt>
                <dd className="tabular-nums">
                  {formatRupiah(
                    step === 'cart' ? subtotal - discountAmount : total,
                  )}
                </dd>
              </div>
            </dl>
            {step === 'cart' ? (
              <button
                className="qp-button w-full"
                onClick={() => setStep('details')}
              >
                Lanjut ke checkout <ArrowRight size={17} />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  className="qp-button qp-button-secondary"
                  disabled={submitting}
                  onClick={() => setStep('cart')}
                  aria-label="Kembali ke keranjang"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  form="checkout-form"
                  type="submit"
                  disabled={submitting}
                  className="qp-button flex-1"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle className="animate-spin" size={18} />
                      Menyimpan…
                    </>
                  ) : (
                    <>
                      Kirim pesanan <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </div>
            )}
            <p className="text-xs text-center text-stone-500">
              {step === 'cart'
                ? 'Ongkir ditampilkan setelah memilih pengiriman.'
                : 'Pesanan diproses setelah konfirmasi staf.'}
            </p>
          </div>
        )}
      </aside>
    </div>
  );
};

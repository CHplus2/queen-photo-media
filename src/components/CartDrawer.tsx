import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { DeliveryMethod, PaymentMethod } from '../types';
import { PONTIANAK_DISTRICTS } from '../data/initialData';
import { formatRupiah, createWhatsAppOrderLink } from '../utils/formatters';
import { 
  X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, 
  Truck, MapPin, CreditCard, QrCode, Tag, Check, AlertCircle, Sparkles 
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
    setIsSurveyModalOpen
  } = useStudio();

  // Delivery & Customer state
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('GRAB_EXPRESS_PONTIANAK');
  const [selectedDistrict, setSelectedDistrict] = useState(PONTIANAK_DISTRICTS[0]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('QRIS');
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Voucher / Promo code
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [voucherMessage, setVoucherMessage] = useState<string>('');

  // Order submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  if (!isCartOpen) return null;

  // Pricing calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const totalCost = cart.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0);
  const deliveryFee = deliveryMethod === 'AMBIL_STUDIO' ? 0 : selectedDistrict.fee;
  const discountAmount = Math.round(subtotal * appliedDiscount);
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);
  const totalProfit = totalAmount - totalCost - deliveryFee;

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = voucherInput.trim().toUpperCase();
    if (cleanCode === 'QUEEN10HEMAT' || cleanCode === 'QUEEN10' || cleanCode === 'QUEENFOTO10') {
      setAppliedDiscount(0.10);
      setVoucherMessage('Kupon Diskon 10% Berhasil Diterapkan!');
    } else {
      setVoucherMessage('Kode kupon tidak valid. Dapatkan kupon 10% dengan mengisi Survei 1 Menit!');
    }
  };

  const handleCopyAccount = (acc: string) => {
    navigator.clipboard.writeText(acc);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Mohon lengkapi Nama Lengkap dan Nomor WhatsApp Anda untuk konfirmasi pesanan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const summaryItems = cart.map(i => `${i.quantity}x ${i.serviceName} (${i.size})`).join(', ');

      const newOrder = await addOrder({
        customerName,
        customerPhone,
        customerAddress: deliveryMethod === 'AMBIL_STUDIO' ? 'Ambil di Studio Jl. Gajah Mada' : customerAddress,
        district: deliveryMethod === 'GRAB_EXPRESS_PONTIANAK' ? selectedDistrict.name : undefined,
        channel: 'ONLINE',
        deliveryMethod,
        deliveryFee,
        items: [...cart],
        subtotal,
        totalAmount,
        totalCost,
        totalProfit,
        paymentMethod,
        paymentStatus: paymentMethod === 'TUNAI_KASIR' ? 'BELUM_BAYAR' : 'LUNAS',
        orderStatus: 'ANTREAN_DESAIN',
        staffNotes: `Checkout Keranjang (${cart.length} item): ${summaryItems} · Diskon: ${appliedDiscount > 0 ? '10%' : 'Tidak ada'}`,
        trackingNumber: deliveryMethod === 'GRAB_EXPRESS_PONTIANAK' ? `GRAB-PTK-${Math.floor(10000 + Math.random() * 90000)}` : undefined,
      });

      setCompletedOrderId(newOrder.id);
      clearCart();
    } catch (err) {
      alert('Terjadi kendala saat memproses pesanan. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDrawer = () => {
    setIsCartOpen(false);
    setCompletedOrderId(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-stone-950/70 backdrop-blur-sm transition-all"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeDrawer();
      }}
    >
      <div 
        className="relative w-full max-w-xl bg-white h-full shadow-2xl border-l border-stone-200 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-4 bg-stone-900 text-stone-100 border-b border-stone-800 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-stone-950">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 id="cart-drawer-title" className="text-base sm:text-lg font-serif font-bold text-stone-50">
                {completedOrderId ? 'Checkout Berhasil!' : 'Keranjang Belanja Foto'}
              </h3>
              <p className="text-[11px] text-stone-400">
                {completedOrderId ? 'Terima kasih atas pesanan Anda' : `${cart.length} item siap diproses & dicetak`}
              </p>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="p-2 rounded-lg text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 transition-colors"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {completedOrderId ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs text-stone-500 font-mono">NOMOR INVOICE GABUNGAN</span>
              <p className="text-2xl font-bold font-mono text-stone-900">#{completedOrderId}</p>
              <p className="text-stone-600 text-xs sm:text-sm mt-2 max-w-md mx-auto">
                Semua item di keranjang Anda telah digabung menjadi 1 pesanan resmi di antrean cetak Queen Photo Studio Pontianak.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-stone-500">Pemesan:</span>
                <strong className="text-stone-900">{customerName} ({customerPhone})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Metode Pengiriman:</span>
                <strong className="text-stone-900">
                  {deliveryMethod === 'AMBIL_STUDIO' ? 'Ambil di Studio Gajah Mada' : 'GrabExpress Pontianak'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Total Pembayaran:</span>
                <strong className="font-mono text-amber-900 font-bold text-sm">
                  {formatRupiah(totalAmount)}
                </strong>
              </div>
            </div>

            {/* Survey CTA banner */}
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-left text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Bantu Kami Berbenah & Dapatkan Kupon 10% Tambahan!</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Suara Anda sangat berharga bagi perkembangan studio kami sejak 1980. Luangkan waktu 1 menit untuk survei singkat.
              </p>
              <button
                onClick={() => {
                  closeDrawer();
                  setIsSurveyModalOpen(true);
                }}
                className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs transition-colors"
              >
                Isi Survei Singkat (1 Menit)
              </button>
            </div>

            <div className="pt-2 flex flex-col gap-2.5 max-w-md mx-auto">
              <a
                href={createWhatsAppOrderLink({
                  id: completedOrderId,
                  customerName,
                  customerPhone,
                  channel: 'ONLINE',
                  deliveryMethod,
                  deliveryFee,
                  items: cart,
                  subtotal,
                  totalAmount,
                  totalCost,
                  totalProfit,
                  paymentMethod,
                  paymentStatus: 'LUNAS',
                  orderStatus: 'ANTREAN_DESAIN',
                  createdAt: new Date().toISOString(),
                })}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Konfirmasi via WhatsApp Studio</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={() => {
                  setActiveTrackingId(completedOrderId);
                  setCurrentView('lacak');
                  closeDrawer();
                }}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl text-xs transition-colors"
              >
                Lacak Status Pengerjaan Pesanan
              </button>
            </div>
          </div>
        ) : cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-stone-800 text-lg">Keranjang Belanja Kosong</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Anda belum menambahkan layanan foto ke keranjang. Pilih cetak foto, photostrip, kanvas, atau pas foto favorit Anda!
              </p>
            </div>
            <button
              onClick={() => {
                setCurrentView('layanan');
                closeDrawer();
              }}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Lihat Katalog Layanan & Harga</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* List of Cart Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Daftar Layanan ({cart.length})
                </span>
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium transition-colors"
                >
                  Kosongkan Keranjang
                </button>
              </div>

              {cart.map((item) => (
                <div 
                  key={item.id}
                  className="bg-stone-50 rounded-xl border border-stone-200 p-3.5 flex flex-col sm:flex-row gap-3 items-start justify-between transition-all hover:border-amber-400"
                >
                  <div className="flex gap-3 min-w-0">
                    {item.photoUrl ? (
                      <img 
                        src={item.photoUrl} 
                        alt={item.serviceName} 
                        className="w-14 h-14 rounded-lg object-cover border border-stone-300 shrink-0" 
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-stone-200 text-stone-500 flex flex-col items-center justify-center shrink-0 text-[10px] font-mono">
                        <ShoppingBag className="w-5 h-5 text-stone-400" />
                        <span>Foto</span>
                      </div>
                    )}

                    <div className="min-w-0 space-y-0.5">
                      <h4 className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                        {item.serviceName}
                      </h4>
                      <div className="flex flex-wrap gap-1.5 text-[11px] text-stone-600">
                        <span className="bg-white px-1.5 py-0.5 rounded border border-stone-200 font-medium">
                          {item.size}
                        </span>
                        {item.finish && (
                          <span className="bg-white px-1.5 py-0.5 rounded border border-stone-200">
                            {item.finish}
                          </span>
                        )}
                        {item.frame && (
                          <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-medium">
                            {item.frame}
                          </span>
                        )}
                      </div>
                      {item.photoFileName && (
                        <p className="text-[10px] text-emerald-700 font-mono truncate">
                          ✓ File: {item.photoFileName}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-[10px] text-stone-500 italic truncate">
                          Catatan: "{item.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200">
                    <span className="font-mono font-bold text-xs sm:text-sm text-stone-900">
                      {formatRupiah(item.unitPrice * item.quantity)}
                    </span>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-stone-300 bg-white rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-stone-100 text-stone-600 transition-colors"
                          title="Kurangi"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-mono text-xs font-bold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-stone-100 text-stone-600 transition-colors"
                          title="Tambah"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                        title="Hapus dari keranjang"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => {
                  setCurrentView('layanan');
                  closeDrawer();
                }}
                className="w-full py-2 border-2 border-dashed border-stone-300 hover:border-amber-400 text-stone-600 hover:text-stone-900 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Layanan / Produk Lain ke Keranjang</span>
              </button>
            </div>

            {/* Voucher & Discount Code */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-700" />
                  <span>Punya Kupon Diskon?</span>
                </span>
                <span className="text-[10px] text-amber-800 font-medium">Contoh: QUEEN10HEMAT</span>
              </div>
              <form onSubmit={handleApplyVoucher} className="flex gap-2">
                <input
                  type="text"
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value)}
                  placeholder="Ketik kode kupon (misal: QUEEN10HEMAT)"
                  className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono uppercase focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  Terapkan
                </button>
              </form>
              {voucherMessage && (
                <p className={`text-[11px] font-medium ${appliedDiscount > 0 ? 'text-emerald-700' : 'text-amber-800'}`}>
                  {voucherMessage}
                </p>
              )}
            </div>

            {/* Delivery Method Selection */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Pilihan Pengiriman
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label 
                  className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                    deliveryMethod === 'GRAB_EXPRESS_PONTIANAK' 
                      ? 'border-amber-400 bg-amber-50/50 ring-1 ring-amber-400/50' 
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="cart_delivery"
                    checked={deliveryMethod === 'GRAB_EXPRESS_PONTIANAK'}
                    onChange={() => setDeliveryMethod('GRAB_EXPRESS_PONTIANAK')}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <strong className="block text-stone-900 font-semibold">GrabExpress Pontianak</strong>
                    <span className="text-[11px] text-stone-500 block">Kirim langsung ke rumah Anda</span>
                    <span className="text-[11px] text-amber-900 font-mono font-bold mt-1 block">
                      +{formatRupiah(selectedDistrict.fee)}
                    </span>
                  </div>
                </label>

                <label 
                  className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                    deliveryMethod === 'AMBIL_STUDIO' 
                      ? 'border-amber-400 bg-amber-50/50 ring-1 ring-amber-400/50' 
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="cart_delivery"
                    checked={deliveryMethod === 'AMBIL_STUDIO'}
                    onChange={() => setDeliveryMethod('AMBIL_STUDIO')}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <strong className="block text-stone-900 font-semibold">Ambil di Studio</strong>
                    <span className="text-[11px] text-stone-500 block">Jl. Gajah Mada No. 128 Pontianak</span>
                    <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
                      GRATIS (Rp 0)
                    </span>
                  </div>
                </label>
              </div>

              {deliveryMethod === 'GRAB_EXPRESS_PONTIANAK' && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                  <div>
                    <label className="block text-stone-700 font-medium mb-1">
                      Pilih Kecamatan di Pontianak:
                    </label>
                    <select
                      value={selectedDistrict.name}
                      onChange={(e) => {
                        const dist = PONTIANAK_DISTRICTS.find(d => d.name === e.target.value);
                        if (dist) setSelectedDistrict(dist);
                      }}
                      className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                    >
                      {PONTIANAK_DISTRICTS.map(d => (
                        <option key={d.name} value={d.name}>
                          {d.name} (Ongkir: {formatRupiah(d.fee)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-stone-700 font-medium mb-1">
                      Alamat Lengkap / Patokan Rumah:
                    </label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Contoh: Jl. Reformasi Gg. Sejahtera No. 15, samping minimarket"
                      className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Customer Contact */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Informasi Pemesan
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">
                    Nama Lengkap <span className="text-rose-600">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">
                    Nomor WhatsApp <span className="text-rose-600">*</span>:
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0812xxxxxxxx"
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Metode Pembayaran (1x Bayar untuk Semua Layanan)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('QRIS')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'QRIS'
                      ? 'border-amber-400 bg-amber-50/50 font-bold'
                      : 'border-stone-200'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-amber-700 mb-1" />
                  <span>QRIS Semua Bank & E-Wallet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('TRANSFER_BCA')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'TRANSFER_BCA'
                      ? 'border-amber-400 bg-amber-50/50 font-bold'
                      : 'border-stone-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-600 mb-1" />
                  <span>Transfer BCA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('TUNAI_KASIR')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'TUNAI_KASIR'
                      ? 'border-amber-400 bg-amber-50/50 font-bold'
                      : 'border-stone-200'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-stone-700 mb-1" />
                  <span>Bayar di Kasir Toko</span>
                </button>
              </div>

              {/* QRIS / Transfer details */}
              {paymentMethod === 'QRIS' && (
                <div className="p-4 bg-stone-900 text-stone-100 rounded-xl space-y-2 text-xs text-center">
                  <p className="text-amber-300 font-bold uppercase tracking-wider text-[11px]">
                    Scan QRIS Studio Queen Photo
                  </p>
                  <div className="w-32 h-32 bg-white rounded-lg mx-auto p-1.5 flex items-center justify-center">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=00020101021226610016ID.CO.QRIS.WWW01189360099800000000005204581253033605802ID5920QUEEN%20PHOTO%20STUDIO6009PONTIANAK6304A8B9" 
                      alt="QRIS Queen Photo Studio"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[10px] text-stone-400">
                    Bisa di-scan dari BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, DANA.
                  </p>
                </div>
              )}

              {paymentMethod === 'TRANSFER_BCA' && (
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-1">
                  <span className="text-stone-500">Nomor Rekening BCA Studio:</span>
                  <div className="flex items-center justify-between font-mono font-bold text-stone-900 text-sm">
                    <span>029 188 9800</span>
                    <button
                      type="button"
                      onClick={() => handleCopyAccount('0291889800')}
                      className="text-xs text-amber-700 hover:underline font-sans font-medium"
                    >
                      {copiedAccount ? 'Tersalin ✓' : 'Salin Rekening'}
                    </button>
                  </div>
                  <span className="text-[11px] text-stone-500 block">a.n. Queen Photo Studio Pontianak</span>
                </div>
              )}
            </div>

            {/* Order Cost Summary */}
            <div className="p-4 bg-stone-100/80 rounded-xl border border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal ({cart.length} item):</span>
                <span className="font-mono font-medium">{formatRupiah(subtotal)}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Kupon Diskon (10%):</span>
                  <span className="font-mono">-{formatRupiah(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Ongkos Kirim:</span>
                <span className="font-mono font-medium">
                  {deliveryFee === 0 ? 'Gratis (Ambil di Toko)' : formatRupiah(deliveryFee)}
                </span>
              </div>
              <div className="pt-2 border-t border-stone-300 flex justify-between items-baseline font-bold text-stone-900 text-sm">
                <span>Total Tagihan:</span>
                <span className="font-mono text-base sm:text-lg text-amber-900">
                  {formatRupiah(totalAmount)}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCheckout}
                className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 active:scale-[0.99] text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <span>{isSubmitting ? 'Memproses Pesanan...' : 'Konfirmasi & Checkout Semua Layanan'}</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
              <p className="text-center text-[10px] text-stone-500 mt-2">
                🔒 Data pesanan tersimpan otomatis di database Cloud Firestore & langsung terhubung ke kasir studio.
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

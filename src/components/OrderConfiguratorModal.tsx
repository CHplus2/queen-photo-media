import React, { useState, useEffect } from 'react';
import { useStudio } from '../context/StudioContext';
import { ServiceItem, DeliveryMethod, PaymentMethod, OrderItem } from '../types';
import { PONTIANAK_DISTRICTS } from '../data/initialData';
import { formatRupiah, createWhatsAppOrderLink } from '../utils/formatters';
import { 
  X, Upload, Camera, Truck, MapPin, CreditCard, QrCode, 
  Check, ArrowRight, Copy, AlertCircle, ShoppingBag 
} from 'lucide-react';

export const OrderConfiguratorModal: React.FC = () => {
  const { 
    isOrderModalOpen, 
    setIsOrderModalOpen, 
    selectedServiceForOrder, 
    services, 
    addOrder, 
    setActiveTrackingId, 
    setCurrentView,
    addToCart,
    setIsCartOpen,
    setIsSurveyModalOpen
  } = useStudio();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1); // 1: Config & Photo, 2: Delivery & Contact, 3: Payment & Summary
  
  // Selected service state
  const [selectedService, setSelectedService] = useState<ServiceItem>(services[0]);
  const [selectedSize, setSelectedSize] = useState<string>('Standar');
  const [selectedFinish, setSelectedFinish] = useState<string>('Glossy Anti-Luntur');
  const [selectedFrame, setSelectedFrame] = useState<string>('Tanpa Bingkai');
  const [selectedBgColor, setSelectedBgColor] = useState<string>('Merah (Tahun Ganjil KTP)');
  const [quantity, setQuantity] = useState<number>(1);
  const [customerNotes, setCustomerNotes] = useState<string>('');
  
  // Photo upload state
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string>('');

  // Customer & Delivery state
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('GRAB_EXPRESS_PONTIANAK');
  const [selectedDistrict, setSelectedDistrict] = useState(PONTIANAK_DISTRICTS[0]);
  const [customerAddress, setCustomerAddress] = useState<string>('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('QRIS');
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Success state
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedServiceForOrder) {
      setSelectedService(selectedServiceForOrder);
      if (selectedServiceForOrder.options?.sizes?.[0]) {
        setSelectedSize(selectedServiceForOrder.options.sizes[0]);
      } else {
        setSelectedSize(selectedServiceForOrder.unit);
      }
      if (selectedServiceForOrder.options?.finishes?.[0]) {
        setSelectedFinish(selectedServiceForOrder.options.finishes[0]);
      }
      if (selectedServiceForOrder.options?.frames?.[0]) {
        setSelectedFrame(selectedServiceForOrder.options.frames[0]);
      }
      if (selectedServiceForOrder.options?.backgroundColors?.[0]) {
        setSelectedBgColor(selectedServiceForOrder.options.backgroundColors[0]);
      }
    }
  }, [selectedServiceForOrder]);

  // Close modal and reset state
  const closeModal = () => {
    setIsOrderModalOpen(false);
    setCompletedOrderId(null);
    setCurrentStep(1);
  };

  // Keyboard Escape listener
  useEffect(() => {
    if (!isOrderModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOrderModalOpen]);

  if (!isOrderModalOpen) return null;

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFileName(file.name);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setUploadedPhotoUrl(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Pricing calculations
  let unitPrice = selectedService.basePrice;
  let unitCost = selectedService.estimatedCost;

  // Adjust frame pricing
  if (selectedFrame === 'Minimalis Hitam' || selectedFrame === 'Minimalis Putih') {
    unitPrice += 25000;
    unitCost += 12000;
  } else if (selectedFrame === 'Kayu Jati Elegan') {
    unitPrice += 55000;
    unitCost += 28000;
  } else if (selectedFrame === 'Ukiran Emas Klasik') {
    unitPrice += 75000;
    unitCost += 38000;
  }

  const subtotal = unitPrice * quantity;
  const deliveryFee = deliveryMethod === 'AMBIL_STUDIO' ? 0 : selectedDistrict.fee;
  const totalAmount = subtotal + deliveryFee;
  const totalCost = (unitCost * quantity);
  const totalProfit = totalAmount - totalCost - deliveryFee;

  // Add to Shopping Cart for multi-item orders
  const handleAddToCart = () => {
    const orderItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      category: selectedService.category,
      size: selectedSize,
      finish: selectedFinish,
      frame: selectedFrame !== 'Tanpa Bingkai' ? selectedFrame : undefined,
      backgroundColor: selectedService.category === 'pas_foto' ? selectedBgColor : undefined,
      notes: customerNotes,
      quantity,
      unitPrice,
      unitCost,
      photoUrl: uploadedPhotoUrl || undefined,
      photoFileName: photoFileName || undefined,
    };

    addToCart(orderItem);
    closeModal();
    setIsCartOpen(true);
  };

  // Handle Submit Order
  const handleCompleteOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Mohon isi nama dan nomor WhatsApp Anda.');
      return;
    }

    const orderItem: OrderItem = {
      id: `item-${Date.now()}`,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      category: selectedService.category,
      size: selectedSize,
      finish: selectedFinish,
      frame: selectedFrame !== 'Tanpa Bingkai' ? selectedFrame : undefined,
      backgroundColor: selectedService.category === 'pas_foto' ? selectedBgColor : undefined,
      notes: customerNotes,
      quantity,
      unitPrice,
      unitCost,
      photoUrl: uploadedPhotoUrl || undefined,
      photoFileName: photoFileName || undefined,
    };

    const newOrder = await addOrder({
      customerName,
      customerPhone,
      customerAddress: deliveryMethod === 'AMBIL_STUDIO' ? 'Ambil di Studio Jl. Gajah Mada' : customerAddress,
      district: deliveryMethod === 'GRAB_EXPRESS_PONTIANAK' ? selectedDistrict.name : undefined,
      channel: 'ONLINE',
      deliveryMethod,
      deliveryFee,
      items: [orderItem],
      subtotal,
      totalAmount,
      totalCost,
      totalProfit,
      paymentMethod,
      paymentStatus: paymentMethod === 'TUNAI_KASIR' ? 'BELUM_BAYAR' : 'LUNAS',
      orderStatus: 'ANTREAN_DESAIN',
      staffNotes: `Pemesanan via Website Queen Photo · ${photoFileName ? 'Foto telah diupload' : 'Menunggu foto via WA'}`,
      trackingNumber: deliveryMethod === 'GRAB_EXPRESS_PONTIANAK' ? `GRAB-PTK-${Math.floor(10000 + Math.random() * 90000)}` : undefined,
    });

    setCompletedOrderId(newOrder.id);
  };

  const handleCopyAccount = (acc: string) => {
    navigator.clipboard.writeText(acc);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-950/75 backdrop-blur-sm p-0 sm:p-4 overscroll-contain transition-all"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-stone-200 flex flex-col max-h-[92dvh] sm:max-h-[90vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
      >
        
        {/* Sticky Modal Header - Permanently visible on mobile & desktop */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-stone-900 text-stone-100 border-b border-stone-800 z-20">
          <div className="pr-2 min-w-0">
            <p className="text-amber-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">
              Pemesanan Digital Queen Photo Pontianak
            </p>
            <h3 id="order-modal-title" className="text-sm sm:text-lg font-serif font-bold text-stone-50 truncate">
              {completedOrderId ? 'Pesanan Berhasil Dibuat!' : 'Konfigurasi & Cetak Foto Online'}
            </h3>
          </div>
          <button
            type="button"
            onClick={closeModal}
            aria-label="Tutup formulir pemesanan"
            title="Tutup (Esc)"
            className="shrink-0 p-2 sm:p-1.5 rounded-lg text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 active:bg-stone-600 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Order is Completed */}
        {completedOrderId ? (
          <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-8 space-y-6 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <div>
              <span className="text-xs text-stone-500 font-mono">NOMOR PESANAN RESMI</span>
              <p className="text-xl sm:text-2xl font-bold font-mono text-stone-900 mt-0.5">#{completedOrderId}</p>
              <p className="text-stone-600 text-xs sm:text-sm mt-2 max-w-md mx-auto">
                Terima kasih, <strong className="text-stone-900">{customerName}</strong>! Pesanan Anda telah tercatat otomatis di antrean laboratorium Queen Photo Pontianak.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-stone-500">Layanan:</span>
                <span className="font-semibold text-stone-800">{selectedService.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Ukuran & Kertas:</span>
                <span className="font-medium text-stone-800">{selectedSize} · {selectedFinish}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Pengiriman:</span>
                <span className="font-medium text-stone-800">
                  {deliveryMethod === 'GRAB_EXPRESS_PONTIANAK' ? `GrabExpress (${selectedDistrict.name})` : 'Ambil di Studio'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-200 text-sm">
                <span className="font-semibold text-stone-900">Total Pembayaran:</span>
                <span className="font-bold font-mono text-stone-900">{formatRupiah(totalAmount)}</span>
              </div>
            </div>

            {/* Customer Survey Banner */}
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex items-center gap-1.5 text-amber-950 font-bold">
                <span className="text-sm">🎁</span>
                <span>Bantu Queen Photo Berbenah & Raih Kupon Diskon 10%!</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Luangkan waktu 1 menit untuk memberi masukan layanan apa yang Anda harapkan dari studio kami sejak 1980. Langsung dapat kupon 10%!
              </p>
              <button
                type="button"
                onClick={() => {
                  closeModal();
                  setIsSurveyModalOpen(true);
                }}
                className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs transition-colors"
              >
                Isi Survei Singkat (1 Menit)
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => {
                  const sampleOrder = {
                    id: completedOrderId,
                    customerName,
                    customerPhone,
                    deliveryMethod,
                    deliveryFee,
                    totalAmount,
                    paymentMethod,
                    paymentStatus: 'LUNAS' as const,
                    orderStatus: 'ANTREAN_DESAIN' as const,
                    items: [{ quantity, serviceName: selectedService.name, size: selectedSize, finish: selectedFinish, unitPrice }],
                  };
                  window.open(createWhatsAppOrderLink(sampleOrder as any), '_blank');
                }}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Konfirmasi via WhatsApp Admin</span>
              </button>

              <button
                onClick={() => {
                  setActiveTrackingId(completedOrderId);
                  setCurrentView('lacak');
                  closeModal();
                }}
                className="px-5 py-3 bg-stone-900 hover:bg-stone-800 text-stone-100 font-medium text-xs rounded-lg transition-colors"
              >
                <span>Lacak Status Pengerjaan</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Step Navigation Bar - Pinned right beneath header */}
            <div className="shrink-0 bg-stone-100/95 border-b border-stone-200 px-3 sm:px-6 py-2.5 flex items-center justify-between text-[11px] sm:text-xs z-10">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`font-semibold flex items-center gap-1.5 transition-colors ${currentStep === 1 ? 'text-amber-800' : 'text-stone-500 hover:text-stone-800'}`}
              >
                <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep === 1 ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-600'}`}>1</span>
                <span className="truncate">Layanan & Foto</span>
              </button>
              <span className="text-stone-300 text-xs px-1">/</span>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`font-semibold flex items-center gap-1.5 transition-colors ${currentStep === 2 ? 'text-amber-800' : 'text-stone-500 hover:text-stone-800'}`}
              >
                <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep === 2 ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-600'}`}>2</span>
                <span className="truncate">Pengiriman</span>
              </button>
              <span className="text-stone-300 text-xs px-1">/</span>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className={`font-semibold flex items-center gap-1.5 transition-colors ${currentStep === 3 ? 'text-amber-800' : 'text-stone-500 hover:text-stone-800'}`}
              >
                <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep === 3 ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-600'}`}>3</span>
                <span className="truncate">Pembayaran</span>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5">

            {/* STEP 1: SERVICE & PHOTO UPLOAD */}
            {currentStep === 1 && (
              <div className="space-y-5">
                {/* Service selector */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Pilih Jenis Layanan:
                  </label>
                  <select
                    value={selectedService.id}
                    onChange={(e) => {
                      const found = services.find(s => s.id === e.target.value);
                      if (found) setSelectedService(found);
                    }}
                    className="w-full text-sm rounded-lg border border-stone-300 px-3.5 py-2.5 bg-stone-50 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} - {formatRupiah(s.basePrice)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Photo Upload Box */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Unggah Foto yang Ingin Dicetak / Diedit:
                  </label>
                  <div className="border-2 border-dashed border-stone-300 rounded-xl p-5 text-center hover:border-amber-500 transition-colors bg-stone-50">
                    {uploadedPhotoUrl ? (
                      <div className="space-y-3">
                        <img
                          src={uploadedPhotoUrl}
                          alt="Preview foto pelanggan"
                          className="max-h-48 mx-auto rounded-lg shadow-sm border border-stone-200 object-contain"
                        />
                        <div className="text-xs text-stone-600 flex items-center justify-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>{photoFileName}</span>
                          <label className="text-amber-800 font-semibold cursor-pointer underline ml-2">
                            Ganti Foto
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer block space-y-1.5 py-2 sm:py-3">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-stone-400 mx-auto" />
                        <p className="text-xs sm:text-sm font-semibold text-stone-800">
                          Klik untuk memilih foto dari HP atau Komputer
                        </p>
                        <p className="text-[11px] text-stone-500">
                          Format JPG, PNG, atau HEIC resolusi tinggi untuk hasil cetak tajam
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Dynamic Configuration Controls based on Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Finishes */}
                  {selectedService.options?.finishes && (
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Pilihan Kertas Cetak:
                      </label>
                      <select
                        value={selectedFinish}
                        onChange={(e) => setSelectedFinish(e.target.value)}
                        className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3 py-2 bg-white"
                      >
                        {selectedService.options.finishes.map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Frame */}
                  {selectedService.options?.frames && (
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Bingkai / Frame Foto:
                      </label>
                      <select
                        value={selectedFrame}
                        onChange={(e) => setSelectedFrame(e.target.value)}
                        className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3 py-2 bg-white"
                      >
                        {selectedService.options.frames.map(fr => (
                          <option key={fr} value={fr}>{fr}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Pas Foto Background */}
                  {selectedService.category === 'pas_foto' && selectedService.options?.backgroundColors && (
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Warna Background Pas Foto:
                      </label>
                      <select
                        value={selectedBgColor}
                        onChange={(e) => setSelectedBgColor(e.target.value)}
                        className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3 py-2 bg-white"
                      >
                        {selectedService.options.backgroundColors.map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Jumlah Cetak:
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-9 h-9 border border-stone-300 rounded-lg flex items-center justify-center font-bold text-stone-700 hover:bg-stone-100"
                      >
                        -
                      </button>
                      <span className="font-mono text-sm font-bold text-stone-900 w-8 text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-9 h-9 border border-stone-300 rounded-lg flex items-center justify-center font-bold text-stone-700 hover:bg-stone-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes for editor */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Catatan Khusus untuk Editor / Operator Cetak (Opsional):
                  </label>
                  <input
                    type="text"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Contoh: Tolong hilangkan jerawat halus, crop fokus ke wajah, dsb."
                    className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3.5 py-2 text-stone-800"
                  />
                </div>

                <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 mt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-3.5 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors"
                  >
                    Batal & Tutup
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold rounded-lg transition-colors border border-amber-300 shadow-xs"
                      title="Tambahkan ke keranjang belanja agar bisa memesan beberapa layanan sekaligus"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-800" />
                      <span>+ Keranjang</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold rounded-lg transition-colors shadow-sm active:scale-95"
                    >
                      <span>Pesan Langsung</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: DELIVERY & CONTACT */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Nama Lengkap Pemesan: *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Contoh: Fransiska / Hendra"
                      className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3.5 py-2 text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Nomor WhatsApp: *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Contoh: 08125678xxxx"
                      className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3.5 py-2 text-stone-800"
                    />
                  </div>
                </div>

                {/* Delivery Options */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-2">
                    Pilih Metode Pengambilan / Pengantaran:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* GrabExpress */}
                    <div
                      onClick={() => setDeliveryMethod('GRAB_EXPRESS_PONTIANAK')}
                      className={`cursor-pointer p-3 sm:p-4 rounded-xl border transition-all ${
                        deliveryMethod === 'GRAB_EXPRESS_PONTIANAK'
                          ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-xs sm:text-sm text-stone-900">
                          GrabExpress Pontianak
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1">
                        Dikirim kilat langsung ke rumah dengan kemasan bubble wrap & papan pelindung anti-tekuk.
                      </p>
                    </div>

                    {/* Studio Pickup */}
                    <div
                      onClick={() => setDeliveryMethod('AMBIL_STUDIO')}
                      className={`cursor-pointer p-3 sm:p-4 rounded-xl border transition-all ${
                        deliveryMethod === 'AMBIL_STUDIO'
                          ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                        <span className="font-semibold text-xs sm:text-sm text-stone-900">
                          Ambil Sendiri di Studio
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1">
                        Jl. Gajah Mada No. 128, Pontianak (Bebas Ongkir Rp 0).
                      </p>
                    </div>
                  </div>
                </div>

                {/* District Selector if GrabExpress */}
                {deliveryMethod === 'GRAB_EXPRESS_PONTIANAK' && (
                  <div className="space-y-3 p-3.5 sm:p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Kecamatan / Wilayah di Pontianak:
                      </label>
                      <select
                        value={selectedDistrict.name}
                        onChange={(e) => {
                          const dist = PONTIANAK_DISTRICTS.find(d => d.name === e.target.value);
                          if (dist) setSelectedDistrict(dist);
                        }}
                        className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3 py-2 bg-white"
                      >
                        {PONTIANAK_DISTRICTS.map(d => (
                          <option key={d.name} value={d.name}>
                            {d.name} - Ongkir {formatRupiah(d.fee)} (Estimasi ~{d.etaMinutes} mnt)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Alamat Pengiriman Lengkap & Patokan:
                      </label>
                      <textarea
                        rows={2}
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Nama jalan, nomor rumah, gang, atau patokan dekat ruko/sekolah..."
                        className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3 py-2 text-stone-800"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 mt-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
                    >
                      Kembali
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-2 py-2 text-xs text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      Tutup
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold rounded-lg transition-colors border border-amber-300 shadow-xs"
                      title="Simpan ke keranjang belanja agar bisa checkout beberapa pesanan sekaligus"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-800" />
                      <span>+ Keranjang</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold rounded-lg transition-colors shadow-sm active:scale-95"
                    >
                      <span>Lanjut ke Pembayaran</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT & SUMMARY */}
            {currentStep === 3 && (
              <div className="space-y-5">
                {/* Order Summary Box */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
                  <p className="font-semibold text-stone-900 text-sm">Ringkasan Biaya:</p>
                  <div className="flex justify-between">
                    <span className="text-stone-600">{quantity}x {selectedService.name} ({selectedSize})</span>
                    <span className="font-mono text-stone-900">{formatRupiah(subtotal)}</span>
                  </div>
                  {selectedFrame !== 'Tanpa Bingkai' && (
                    <div className="flex justify-between text-stone-500">
                      <span>Termasuk Bingkai: {selectedFrame}</span>
                      <span>(Sudah dihitung)</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-stone-600">
                      Ongkir ({deliveryMethod === 'GRAB_EXPRESS_PONTIANAK' ? 'GrabExpress Pontianak' : 'Ambil di Studio'}):
                    </span>
                    <span className="font-mono text-stone-900">{formatRupiah(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold">
                    <span className="text-stone-900">Total Tagihan:</span>
                    <span className="font-mono text-stone-900 text-base">{formatRupiah(totalAmount)}</span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-2">
                    Pilih Cara Pembayaran:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <button
                      onClick={() => setPaymentMethod('QRIS')}
                      className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                        paymentMethod === 'QRIS'
                          ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600 text-stone-900'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      <QrCode className="w-4 h-4 mb-1 text-stone-800" />
                      <p className="font-bold">QRIS Instant</p>
                      <p className="text-[10px] text-stone-500">BCA, GoPay, OVO, Dana</p>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('TRANSFER_BCA')}
                      className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                        paymentMethod === 'TRANSFER_BCA'
                          ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600 text-stone-900'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 mb-1 text-stone-800" />
                      <p className="font-bold">Transfer BCA</p>
                      <p className="text-[10px] text-stone-500">Cek Otomatis / Manual</p>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('TUNAI_KASIR')}
                      className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                        paymentMethod === 'TUNAI_KASIR'
                          ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600 text-stone-900'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4 mb-1 text-stone-800" />
                      <p className="font-bold">Bayar di Studio</p>
                      <p className="text-[10px] text-stone-500">Saat ambil pesanan</p>
                    </button>
                  </div>
                </div>

                {/* Payment Detail Details (Account Numbers / QRIS display) */}
                {paymentMethod === 'QRIS' && (
                  <div className="p-4 bg-stone-900 text-stone-100 rounded-xl text-center space-y-2 border border-stone-800">
                    <p className="text-xs text-amber-300 font-semibold">
                      Scan QRIS Queen Photo Pontianak
                    </p>
                    <div className="w-36 h-36 bg-white p-2 rounded-xl mx-auto flex items-center justify-center">
                      <div className="w-full h-full border-2 border-stone-900 border-dashed flex flex-col items-center justify-center text-stone-900">
                        <QrCode className="w-16 h-16 text-stone-900" />
                        <span className="text-[9px] font-mono font-bold mt-1">NMID: ID102026190</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      Bisa di-scan menggunakan aplikasi BCA Mobile, GoPay, OVO, Dana, Livin Mandiri, atau ShopeePay.
                    </p>
                  </div>
                )}

                {paymentMethod === 'TRANSFER_BCA' && (
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-stone-900">Rekening Resmi BCA Queen Photo Pontianak:</p>
                        <p className="font-mono text-base font-bold text-amber-950 mt-0.5">029-1827-391</p>
                        <p className="text-stone-600">a.n Queen Photo Studio Pontianak</p>
                      </div>
                      <button
                        onClick={() => handleCopyAccount('0291827391')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-stone-900 text-stone-100 rounded-lg hover:bg-stone-800 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedAccount ? 'Tersalin!' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-3 flex justify-between items-center border-t border-stone-200 mt-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
                    >
                      Kembali
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-2 py-2 text-xs text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      Tutup
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCompleteOrder}
                    className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs sm:text-sm font-bold rounded-lg transition-colors shadow-md active:scale-95"
                  >
                    <span>Konfirmasi & Cetak Pesanan</span>
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            </div>
          </>
        )}

      </div>
    </div>
  );
};

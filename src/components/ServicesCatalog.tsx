import bundledPhoto0 from '../assets/images/queen_photo_genz_photostrips_1791787249531.jpg';
import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { ServiceCategory, ServiceItem } from '../types';
import { formatRupiah } from '../utils/formatters';
import { Camera, Image, UserCheck, Sparkles, Gift, Layers, Check, ArrowRight, Heart, ShoppingBag } from 'lucide-react';

export const ServicesCatalog: React.FC = () => {
  const { services, openOrderWithService, addToCart, cart, setIsCartOpen } = useStudio();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Semua Layanan' },
    { id: 'photostrip_polaroid', label: 'Photostrip & Polaroid (Gen Z)' },
    { id: 'pas_foto', label: 'Pas Foto & Aesthetic' },
    { id: 'cetak_foto', label: 'Cetak Foto & Frame' },
    { id: 'foto_studio', label: 'Studio Pontianak' },
    { id: 'restorasi_edit', label: 'Restorasi & Edit' },
    { id: 'merchandise', label: 'Mug & Album' },
    { id: 'banner', label: 'Banner & Spanduk' },
  ];

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedCategory);

  const photostripService = services.find(s => s.id === 'photostrip-korean-2x6') || services[0];
  const polaroidService = services.find(s => s.id === 'paket-polaroid-mini') || services[1];

  const handleQuickAddToCart = (service: ServiceItem) => {
    const defaultSize = service.options?.sizes?.[0] || service.unit;
    const defaultFinish = service.options?.finishes?.[0] || 'Glossy Anti-Luntur';
    const defaultBg = service.options?.backgroundColors?.[0] || (service.category === 'pas_foto' ? 'Merah (Tahun Ganjil KTP)' : undefined);

    addToCart({
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      size: defaultSize,
      finish: defaultFinish,
      backgroundColor: defaultBg,
      quantity: 1,
      unitPrice: service.basePrice,
      unitCost: service.estimatedCost,
    });

    setToastMsg(`✓ "${service.name}" berhasil dimasukkan ke keranjang!`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <section className="py-14 bg-stone-50/50 border-b border-stone-200 relative">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Gen Z Viral Spotlight Feature Banner */}
        <div className="rounded-2xl bg-white border border-stone-200/90 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 p-8 lg:p-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Favorit Mahasiswa & Gen Z Pontianak</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-snug">
              Cetak Photostrip Korean 4-Cut & Polaroid Mini dari HP
            </h3>

            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              Tren foto yang paling diminati anak muda saat ini: cetak foto pacar, sahabat, atau momen nongkrong di cafe Pontianak menjadi strip foto aesthetic & polaroid mini untuk casing HP. Bisa pesan beberapa layanan sekaligus dalam satu keranjang belanja.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handleQuickAddToCart(photostripService)}
                className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs rounded-xl transition-colors border border-amber-300 flex items-center gap-1.5 shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-800" />
                <span>+ Keranjang Photostrip (Rp 18.000)</span>
              </button>

              <button
                onClick={() => handleQuickAddToCart(polaroidService)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl transition-colors border border-stone-300 flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-stone-600" />
                <span>+ Keranjang 20 Polaroid (Rp 35.000)</span>
              </button>

              <button
                onClick={() => openOrderWithService(photostripService)}
                className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Kustomisasi / Upload Foto</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 aspect-[4/3] lg:aspect-auto lg:h-full relative overflow-hidden bg-stone-100">
            <img
              src={bundledPhoto0}
              alt="Koleksi photostrip dan polaroid mini Queen Photo Pontianak"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Section Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
          <div>
            <p className="text-amber-800 text-xs font-semibold uppercase tracking-wider">
              Katalog Lengkap Queen Photo
            </p>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
              Daftar Layanan & Harga Transparan
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-2xl">
              Pilih dan masukkan beberapa layanan sekaligus ke dalam keranjang belanja. Pesan cetak 4R, pas foto, dan photostrip dalam satu kali checkout!
            </p>
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-xl overflow-x-auto max-w-full">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-white text-stone-900 shadow-sm font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product & Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => {
            const inCartItems = cart.filter(i => i.serviceId === service.id);
            const inCartQty = inCartItems.reduce((sum, i) => sum + i.quantity, 0);

            return (
              <div
                key={service.id}
                className={`group flex flex-col justify-between bg-white rounded-2xl border p-6 transition-all duration-200 hover:shadow-md ${
                  inCartQty > 0 ? 'border-amber-400 ring-1 ring-amber-400/40' : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="space-y-4">
                  {/* Category text kicker & Cart status */}
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="uppercase tracking-wider font-semibold text-amber-800">
                      {service.category.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {inCartQty > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full flex items-center gap-1">
                          ✓ {inCartQty} di Keranjang
                        </span>
                      )}
                      {service.popular && (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Laris
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Service Specific Options */}
                  {service.options && (
                    <div className="pt-3 border-t border-stone-100 text-xs space-y-1.5 text-stone-500">
                      {service.options.finishes && (
                        <p>
                          <span className="font-medium text-stone-700">Kertas:</span>{' '}
                          {service.options.finishes.join(' · ')}
                        </p>
                      )}
                      {service.options.frames && (
                        <p>
                          <span className="font-medium text-stone-700">Bingkai:</span>{' '}
                          {service.options.frames.slice(0, 3).join(' · ')}
                        </p>
                      )}
                      {service.options.backgroundColors && (
                        <p>
                          <span className="font-medium text-stone-700">Latar:</span>{' '}
                          {service.options.backgroundColors.slice(0, 3).join(' · ')}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer price & action button */}
                <div className="pt-5 mt-5 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] text-stone-400">Harga</p>
                    <p className="text-base sm:text-lg font-bold font-mono tabular-nums text-stone-900">
                      {formatRupiah(service.basePrice)}
                      <span className="text-xs font-normal text-stone-500 font-sans">
                        /{service.unit}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleQuickAddToCart(service)}
                      className="flex items-center gap-1 px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold rounded-lg transition-colors border border-amber-300 shadow-xs whitespace-nowrap active:scale-95"
                      title="Tambah 1 ke keranjang belanja"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-800" />
                      <span>+ Keranjang</span>
                    </button>

                    <button
                      onClick={() => openOrderWithService(service)}
                      className="flex items-center gap-1 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs whitespace-nowrap active:scale-95"
                      title="Kustomisasi opsi cetak & upload foto"
                    >
                      <span>Kustom</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Floating Notification Toast when an item is added to cart */}
      {toastMsg && (
        <aside aria-label="Notifikasi Keranjang" className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-stone-900 text-white px-4 sm:px-6 py-3 rounded-2xl shadow-2xl border border-stone-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 text-xs">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium text-stone-100">{toastMsg}</span>
            <button
              onClick={() => setIsCartOpen(true)}
              className="px-3 py-1 bg-amber-400 text-stone-950 font-bold rounded-lg text-xs hover:bg-amber-300 transition-colors shrink-0 ml-1"
            >
              Buka Keranjang ({cart.length}) →
            </button>
          </div>
        </aside>
      )}
    </section>
  );
};

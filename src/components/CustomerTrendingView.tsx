import bundledPhoto0 from '../assets/images/queen_photo_genz_photostrips_1791787249531.jpg';
import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { Sparkles, Heart, Camera, ArrowRight, CheckCircle2, Star, ShoppingBag, Check } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export const CustomerTrendingView: React.FC = () => {
  const { openOrderWithService, services, addToCart, cart, setIsCartOpen } = useStudio();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const photostripService = services.find(s => s.id === 'photostrip-korean-2x6') || services[0];
  const polaroidService = services.find(s => s.id === 'paket-polaroid-mini') || services[1];
  const pasFotoAesthetic = services.find(s => s.id === 'pas-foto-korean-glow') || services[3];

  const handleQuickAdd = (service: any) => {
    addToCart({
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      size: service.options?.sizes?.[0] || service.unit,
      finish: service.options?.finishes?.[0] || 'Glossy Anti-Luntur',
      quantity: 1,
      unitPrice: service.basePrice,
      unitCost: service.estimatedCost,
    });
    setToastMsg(`✓ "${service.name}" ditambahkan ke keranjang!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const highlights = [
    {
      title: 'Korean 4-Cut Photostrip',
      price: 18000,
      unit: '2 Strip Lengkap',
      desc: 'Format strip 2x6 cm ala photobooth Korea dengan frame pastel atau monochrome. Favorit foto bareng bestie & ayang di Pontianak.',
      service: photostripService,
    },
    {
      title: 'Paket Mini Polaroid (20 Foto)',
      price: 35000,
      unit: '20 Foto HP',
      desc: 'Cetak foto gallery HP jadi polaroid mini instax. Pas banget diselipkan di belakang casing HP bening atau gantungan binder.',
      service: polaroidService,
    },
    {
      title: 'Pas Foto Aesthetic Korean Glow',
      price: 30000,
      unit: '8 Lembar + File HD',
      desc: 'Bukan pas foto kaku! Retouch pencahayaan lembut natural untuk lamaran kerja BUMN, LinkedIn, CV, atau paspor liburan ke Kuching.',
      service: pasFotoAesthetic,
    },
  ];

  return (
    <div className="py-12 bg-white border-b border-stone-200 relative">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Koleksi Favorit Mahasiswa & Pelajar Pontianak</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            Abadikan Momen Seru Jadi Photostrip & Polaroid Aesthetic
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed">
            Nggak perlu antre di mesin photobooth mall yang mahal. Cukup pilih foto dari galeri HP-mu, kami cetak dengan kualitas kertas kimia Minilab asli tahan air, siap diantar GrabExpress langsung ke rumah!
          </p>
        </div>

        {/* Visual Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-md aspect-[4/3] bg-stone-100">
            <img
              src={bundledPhoto0}
              alt="Koleksi photostrip dan polaroid aesthetic Queen Photo Pontianak"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-serif font-bold text-stone-900">
              Kenapa Anak Muda Pontianak Pilih Cetak di Queen Photo?
            </h3>
            
            <div className="space-y-3 text-xs sm:text-sm text-stone-700">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Bahan Kertas Foto Tebal Asli:</strong> Bukan kertas stiker tipis yang cepat melengkung dan pudar jika kena sinar matahari.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Pilihan Frame Warna Pastel:</strong> Tersedia frame putih minimalis, soft matcha, baby pink, hingga classic black.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Ongkir Hemat Sekota Pontianak:</strong> Pengiriman kilat via GrabExpress mulai Rp 10.000 atau bisa ambil langsung di studio Jl. Gajah Mada.</span>
              </div>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs text-stone-500">Harga Paket Photostrip</p>
                <p className="text-lg font-bold font-mono text-stone-900">Mulai Rp 18.000</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuickAdd(photostripService)}
                  className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs rounded-xl transition-colors border border-amber-300 shadow-xs flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-800" />
                  <span>+ Keranjang</span>
                </button>
                <button
                  onClick={() => openOrderWithService(photostripService)}
                  className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <span>Kustom Foto</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Featured Products Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {highlights.map((item, idx) => (
            <div
              key={idx}
              className="bg-stone-50 rounded-2xl border border-stone-200 p-6 flex flex-col justify-between hover:shadow-md transition-all space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    {item.unit}
                  </span>
                  <div className="flex text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                </div>

                <h4 className="text-lg font-bold text-stone-900">
                  {item.title}
                </h4>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-2">
                <span className="font-mono text-base font-bold text-stone-900">
                  {formatRupiah(item.price)}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleQuickAdd(item.service)}
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs rounded-lg transition-colors border border-amber-300 shadow-xs flex items-center gap-1"
                  >
                    <ShoppingBag className="w-3 h-3 text-amber-800" />
                    <span>+ Keranjang</span>
                  </button>
                  <button
                    onClick={() => openOrderWithService(item.service)}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>Kustom</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Floating notification */}
      {toastMsg && (
        <aside aria-label="Notifikasi Keranjang" className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-stone-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 text-xs">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium text-stone-100">{toastMsg}</span>
            <button
              onClick={() => setIsCartOpen(true)}
              className="px-3 py-1 bg-amber-400 text-stone-950 font-bold rounded-lg text-xs ml-1 hover:bg-amber-300 transition-colors shrink-0"
            >
              Lihat Keranjang ({cart.length}) →
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};

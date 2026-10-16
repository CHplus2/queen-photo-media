import React from 'react';
import { useStudio } from '../context/StudioContext';
import { Camera, Sparkles, Truck, Check, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { setIsOrderModalOpen, setCurrentView, openOrderWithService, services } = useStudio();

  const photostripService = services.find(s => s.id === 'photostrip-korean-2x6') || services[0];

  return (
    <section className="relative bg-white text-stone-900 overflow-hidden border-b border-stone-200">
      {/* Subtle modern background gradient highlight */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-stone-100/80 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Modern Hero Narrative */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Studio Foto & Cetak Digital Terpercaya · Pontianak</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 leading-[1.18] text-balance">
                Cetak Foto HP, Photostrip Aesthetic, & Potret Studio Tanpa Ribet Keluar Rumah.
              </h1>
            </div>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-xl">
              Tinggalkan cara lama yang repot. Pesan cetak foto favoritmu, photostrip 4-cut viral, atau pas foto aesthetic langsung dari handphone. 
              Hasil cetak kimia Minilab asli yang tahan air dan awet puluhan tahun, diantar kurir GrabExpress se-Pontianak & Kubu Raya.
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => setIsOrderModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-sm active:scale-[0.98] whitespace-nowrap"
              >
                <Camera className="w-4 h-4 text-amber-300" />
                <span>Pesan Cetak Foto Sekarang</span>
              </button>
              
              <button
                onClick={() => openOrderWithService(photostripService)}
                className="flex items-center gap-2 px-5 py-3.5 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-950 text-xs sm:text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Order Korean Photostrip (Rp 18rb)</span>
              </button>
            </div>

            {/* Modern Trust Points */}
            <div className="pt-6 border-t border-stone-100 grid grid-cols-3 gap-4 text-xs text-stone-600">
              <div>
                <p className="font-bold text-stone-900 text-sm">Minilab Asli</p>
                <p className="mt-0.5 text-stone-500">Bukan printer kertas biasa, anti pudar puluhan tahun</p>
              </div>
              <div>
                <p className="font-bold text-stone-900 text-sm">GrabExpress Kilat</p>
                <p className="mt-0.5 text-stone-500">Siap antar ke rumah se-Pontianak & Serdam</p>
              </div>
              <div>
                <p className="font-bold text-stone-900 text-sm">Sejak 1980</p>
                <p className="mt-0.5 text-stone-500">Berpengalaman 40+ tahun di Jl. Gajah Mada</p>
              </div>
            </div>

          </div>

          {/* Right Column: Fresh Modern Studio Visual */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-xl aspect-[16/10] bg-stone-100 group">
              <img
                src="/src/assets/images/queen_photo_modern_studio_1791787204044.jpg"
                alt="Studio foto modern minimalis Queen Photo Pontianak"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent pointer-events-none" />
              
              {/* Overlay description */}
              <div className="absolute bottom-4 left-5 right-5 text-stone-100 flex items-end justify-between pointer-events-none">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                    Modern Studio Session
                  </span>
                  <p className="font-serif font-bold text-white text-base">
                    Pencahayaan Studio Bersih & Alami
                  </p>
                  <p className="text-xs text-stone-300">
                    Sesi Pasangan, Sahabat & Keluarga Muda · Jl. Gajah Mada Pontianak
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md text-white">
                    Mulai Rp 85.000
                  </span>
                </div>
              </div>
            </div>

            {/* Quick floating feature badge */}
            <div className="hidden sm:flex items-center gap-3 absolute -bottom-5 -left-4 bg-white p-3 rounded-xl border border-stone-200 shadow-lg text-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <p className="font-bold text-stone-900">100% Garansi Warna Tajam</p>
                <p className="text-stone-500 text-[11px]">Bebas noda sidik jari & tahan air</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

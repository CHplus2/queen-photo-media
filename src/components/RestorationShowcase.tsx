import bundledPhoto0 from '../assets/images/queen_photo_vintage_restoration_1791784459211.jpg';
import React from 'react';
import { useStudio } from '../context/StudioContext';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export const RestorationShowcase: React.FC = () => {
  const { openOrderWithService, services } = useStudio();
  const restorationService = services.find(s => s.id === 'restorasi-foto-lawas') || services[4];

  return (
    <section className="py-16 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Visual Showcase */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-md bg-stone-900 select-none">
              <img
                src={bundledPhoto0}
                alt="Perbandingan restorasi foto lawas 1987 Queen Photo Pontianak"
                className="w-full h-auto object-cover aspect-[4/3]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-stone-900 text-xs px-3 py-1.5 rounded-lg font-semibold border border-stone-200 shadow-xs">
                Hasil Restorasi Nyata · Queen Photo
              </div>
            </div>
            <p className="mt-2.5 text-xs text-stone-500 text-center">
              Foto pernikahan 1987: Perbaikan tekstur pecah, jamur, serta pewarnaan kulit dan busana yang tajam alami.
            </p>
          </div>

          {/* Right Column: Narrative & Order Trigger */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-amber-800 text-xs font-semibold uppercase tracking-wider">
                Restorasi Digital Ahli
              </p>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1 leading-snug">
                Punya Foto Lawas Kakek, Nenek, atau Orang Tua yang Mulai Pudar?
              </h2>
            </div>

            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              Banyak keluarga di Pontianak memiliki foto album berharga yang mulai pudar atau berjamur karena cuaca tropis Kalimantan Barat. 
              Tim Queen Photo mengembalikan detail foto hitam-putih menjadi hidup dan berwarna dengan sentuhan digital Photoshop presisi.
            </p>

            <div className="space-y-3 text-xs sm:text-sm text-stone-700">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Pewarnaan Alami:</strong> Menghidupkan kembali foto hitam putih dengan warna natural busana & kulit.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Rekonstruksi Wajah:</strong> Memperbaiki lipatan, jamur, dan noda tanpa merusak ekspresi asli.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>File HD + Cetak Minilab:</strong> Bonus softfile resolusi tinggi untuk WhatsApp keluarga besar.</span>
              </div>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-stone-500">Biaya Jasa Mulai</p>
                <p className="text-lg font-bold font-mono text-stone-900">
                  {formatRupiah(restorationService.basePrice)}
                </p>
                <p className="text-[11px] text-stone-500">Estimasi 1-2 hari kerja</p>
              </div>
              <button
                onClick={() => openOrderWithService(restorationService)}
                className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-xs flex items-center gap-1.5"
              >
                <span>Order Restorasi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

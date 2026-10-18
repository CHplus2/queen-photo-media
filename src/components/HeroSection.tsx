import React from 'react';
import studioPhoto from '../assets/images/queen_photo_modern_studio_1791787204044.jpg';
import stripPhoto from '../assets/images/queen_photo_genz_photostrips_1791787249531.jpg';
import { useStudio } from '../context/StudioContext';
import { ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export const HeroSection: React.FC = () => {
  const { setCurrentView, openOrderWithService, services } = useStudio();
  const strip = services.find(
    (s) => s.id === 'photostrip-korean-2x6' && s.isActive !== false,
  );
  return (
    <>
      <section className="bg-[#f3f1e9] border-b border-stone-200">
        <div className="qp-container grid lg:grid-cols-2 gap-10 lg:gap-16 items-center py-12 sm:py-16 lg:py-20">
          <div>
            <span className="qp-eyebrow flex gap-2 items-center">
              <span className="w-6 h-px bg-stone-500" />
              Studio foto untuk setiap generasi
            </span>
            <h1 className="text-[clamp(2.75rem,5.2vw,4.7rem)] leading-[1.08] font-medium mt-6 max-w-xl">
              Momen sederhana.
              <br />
              <span className="italic text-[#8a6547]">Kenangan selamanya.</span>
            </h1>
            <p className="text-stone-600 mt-6 text-base sm:text-lg max-w-md leading-relaxed">
              Dari foto di ponsel hingga potret keluarga. Cetak, bingkai, dan
              simpan cerita favoritmu bersama Queen Photo.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <button
                className="qp-button"
                onClick={() => setCurrentView('layanan')}
              >
                Lihat layanan & harga <ArrowRight size={17} />
              </button>
              <button
                className="qp-button qp-button-secondary"
                onClick={() => setCurrentView('lacak')}
              >
                Lacak pesanan
              </button>
            </div>
            <div className="flex items-center gap-2 mt-8 text-xs sm:text-sm text-stone-500">
              <MapPin size={16} />
              Pontianak, Kalimantan Barat <span className="mx-1">·</span> Sejak
              1980
            </div>
          </div>
          <div className="relative pb-6 sm:pl-5">
            <div className="rounded-t-[100px] sm:rounded-t-[150px] rounded-b-xl overflow-hidden aspect-[5/4] sm:aspect-[6/5] bg-stone-200">
              <img
                src={studioPhoto}
                width="1200"
                height="1000"
                fetchPriority="high"
                alt="Potret pasangan dengan pencahayaan studio yang natural"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-5 sm:right-10 flex items-center gap-4 bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-sm">
              <span className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                <Sparkles size={20} strokeWidth={1.5} />
              </span>
              <div>
                <p className="font-semibold text-sm">
                  Untuk momen besar. Juga yang kecil.
                </p>
                <p className="text-stone-500 text-xs sm:text-sm mt-1">
                  Sendiri, bersama sahabat, atau sekeluarga.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        aria-label="Cara memesan"
        className="bg-white border-b border-stone-200"
      >
        <div className="qp-container grid sm:grid-cols-3 gap-5 py-7">
          {[
            ['01', 'Pilih layanan', 'Gunakan pilihan standar atau sesuaikan.'],
            [
              '02',
              'Gabungkan di keranjang',
              'Satu pesanan untuk beberapa layanan.',
            ],
            [
              '03',
              'Konfirmasi dengan studio',
              'Kirim foto asli dan cek rincian via WhatsApp.',
            ],
          ].map(([n, title, text]) => (
            <div key={n} className="qp-step">
              <span className="qp-step-number">{n}</span>
              <div>
                <p className="font-semibold text-stone-900">{title}</p>
                <p className="text-xs mt-1">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {strip && (
        <section className="qp-container py-12 sm:py-16">
          <div className="qp-panel overflow-hidden grid md:grid-cols-[.85fr_1.15fr] items-center">
            <img
              src={stripPhoto}
              alt="Contoh photostrip dan cetakan mini untuk koleksi momen bersama"
              width="800"
              height="600"
              loading="lazy"
              className="w-full h-full max-h-[320px] object-cover"
            />
            <div className="p-6 sm:p-10">
              <span className="qp-eyebrow">Cetakan kecil, cerita besar</span>
              <h2 className="text-3xl sm:text-4xl mt-3 leading-tight">
                Momen favorit, jadi photostrip.
              </h2>
              <p className="text-stone-600 text-sm sm:text-base mt-4 max-w-lg">
                Untuk sahabat, pasangan, atau koleksi sendiri. Pilih paketnya,
                lalu kirim foto favoritmu.
              </p>
              <div className="flex flex-wrap items-center gap-5 mt-6">
                <button
                  onClick={() => openOrderWithService(strip)}
                  className="qp-button"
                >
                  Buat photostrip <ArrowRight size={16} />
                </button>
                <span className="text-sm text-stone-500">
                  Mulai{' '}
                  <strong className="text-stone-900">
                    {formatRupiah(strip.basePrice)}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

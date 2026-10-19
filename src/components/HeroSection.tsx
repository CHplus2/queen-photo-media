import { tr } from '../i18n/runtime';
import galleryPhoto from '../assets/images/queen_photo_gallery_wall_1791784471362.webp';
import React from 'react';
import studioPhoto from '../assets/images/queen_photo_modern_studio_1791787204044.webp';
import stripPhoto from '../assets/images/queen_photo_genz_photostrips_1791787249531.webp';
import { useStudio } from '../context/StudioContext';
import { ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export const HeroSection: React.FC = () => {
  const { setCurrentView, openOrderWithService, services } = useStudio();
  const phone = (import.meta.env.VITE_STUDIO_WHATSAPP || '').replace(
    /[^0-9]/g,
    '',
  );
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
              {tr('Queen Photo · Pontianak · Sejak 1980')}
            </span>
            <h1 className="text-[clamp(2.5rem,4.7vw,4.2rem)] leading-[1.08] font-medium mt-6 max-w-xl">
              {tr('Cetak foto, pas foto')}
              <br />
              <span className="italic text-[#8a6547]">
                {tr('& studio di Pontianak.')}
              </span>
            </h1>
            <p className="text-stone-600 mt-6 text-base sm:text-lg max-w-md leading-relaxed">
              {tr(
                'Untuk dokumen, foto keluarga, wisuda, atau cetakan dari ponsel. Pilih paket dengan harga jelas, lalu konfirmasikan kebutuhan Anda bersama staf.',
              )}
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <button
                className="qp-button"
                onClick={() => setCurrentView('layanan')}
              >
                {tr('Lihat layanan & harga')} <ArrowRight size={17} />
              </button>
              {phone ? (
                <a
                  className="qp-button qp-button-secondary"
                  href={`https://wa.me/${phone}?text=${encodeURIComponent('Halo Queen Photo, saya ingin bertanya tentang layanan foto.')}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {tr('Tanya lewat WhatsApp')}
                </a>
              ) : (
                <button
                  className="qp-button qp-button-secondary"
                  onClick={() => setCurrentView('cerita')}
                >
                  {tr('Informasi studio')}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-8 text-xs sm:text-sm text-stone-500">
              <MapPin size={16} />
              Pontianak, Kalimantan Barat <span className="mx-1">·</span>{' '}
              {tr('Sejak 1980')}
            </div>
          </div>
          <div className="relative pb-6 sm:pl-5">
            <div className="rounded-t-[100px] sm:rounded-t-[150px] rounded-b-xl overflow-hidden aspect-[5/4] sm:aspect-[6/5] bg-stone-200">
              <img
                src={studioPhoto}
                width="1200"
                height="1000"
                fetchPriority="high"
                alt={tr(
                  'Potret pasangan dengan pencahayaan studio yang natural',
                )}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-5 sm:right-10 flex items-center gap-4 bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-sm">
              <span className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                <Sparkles size={20} strokeWidth={1.5} />
              </span>
              <div>
                <p className="font-semibold text-sm">
                  {tr('Untuk momen besar. Juga yang kecil.')}
                </p>
                <p className="text-stone-500 text-xs sm:text-sm mt-1">
                  {tr(
                    'Pilihan untuk keluarga, sahabat, dan kebutuhan sehari-hari.',
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        aria-label={tr('Cara memesan')}
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
                <p className="font-semibold text-stone-900">{tr(title)}</p>
                <p className="text-xs mt-1">{tr(text)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="qp-container py-12 sm:py-16">
        <span className="qp-eyebrow">{tr('Pilih sesuai kebutuhan')}</span>
        <h2 className="qp-title mt-3">
          {tr('Foto untuk setiap bagian hidup.')}
        </h2>
        <div className="grid md:grid-cols-3 gap-5 mt-8">
          {[
            {
              title: tr('Kebutuhan sehari-hari'),
              text: tr(
                'Cetak ulang foto dan pas foto untuk dokumen, sekolah, atau lamaran kerja.',
              ),
              service: services.find(
                (s) => s.id === 'cetak-4r' && s.isActive !== false,
              ),
              image: galleryPhoto,
              button: tr('Pesan cetak foto'),
            },
            {
              title: tr('Momen bersama keluarga'),
              text: tr(
                'Potret keluarga, wisuda, dan bingkai untuk kenangan yang ingin dipajang.',
              ),
              service: services.find(
                (s) => s.id === 'sesi-studio-keluarga' && s.isActive !== false,
              ),
              image: studioPhoto,
              button: tr('Lihat paket keluarga'),
            },
            {
              title: tr('Cetakan kreatif'),
              text: tr(
                'Photostrip dan mini prints untuk sahabat, pasangan, hadiah, atau koleksi sendiri.',
              ),
              service: strip,
              image: stripPhoto,
              button: tr('Buat photostrip'),
            },
          ].map((group) => (
            <article
              className="qp-panel overflow-hidden flex flex-col"
              key={group.title}
            >
              <img
                src={group.image}
                alt={tr(`Ilustrasi ${group.title.toLowerCase()}`)}
                loading="lazy"
                width="500"
                height="350"
                className="w-full h-44 object-cover"
              />
              <div className="p-5 sm:p-6 flex flex-col flex-1">
                <h3 className="text-xl font-semibold">{tr(group.title)}</h3>
                <p className="text-sm text-stone-600 mt-3 mb-5">
                  {tr(group.text)}
                </p>
                {group.service ? (
                  <>
                    <p className="text-sm mt-auto">
                      {tr('Mulai')}{' '}
                      <strong>{formatRupiah(group.service.basePrice)}</strong>
                      <span className="text-xs text-stone-500 block mt-1">
                        {tr('per')} {tr(group.service.unit)}
                      </span>
                    </p>
                    <button
                      className="qp-button qp-button-secondary mt-5"
                      onClick={() => openOrderWithService(group.service!)}
                    >
                      {tr(group.button)}
                      <ArrowRight size={16} />
                    </button>
                  </>
                ) : (
                  <button
                    className="qp-button qp-button-secondary mt-auto"
                    onClick={() => setCurrentView('layanan')}
                  >
                    {tr('Lihat layanan')}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
        <p className="text-xs text-stone-500 mt-4">
          {tr(
            'Gambar sebagai ilustrasi gaya. Minta contoh hasil dan konfirmasi paket melalui studio.',
          )}
        </p>
      </section>
    </>
  );
};

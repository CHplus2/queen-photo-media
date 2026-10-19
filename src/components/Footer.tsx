import { tr } from '../i18n/runtime';
import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { MapPin, ArrowUpRight, Aperture } from 'lucide-react';
import { AdminAuthModal } from './AdminAuthModal';
export const Footer: React.FC = () => {
  const { setCurrentView, setIsSurveyModalOpen, activeRole } = useStudio();
  const [login, setLogin] = useState(false);
  const phone = (import.meta.env.VITE_STUDIO_WHATSAPP || '').replace(
    /[^0-9]/g,
    '',
  );
  if (activeRole === 'ADMIN')
    return (
      <footer className="border-t border-stone-200 py-6 text-xs text-stone-500">
        <div className="qp-container flex justify-between gap-4">
          <span>{tr('Queen Photo · Ruang kerja studio')}</span>
          <span>{tr('Pontianak, WIB')}</span>
        </div>
      </footer>
    );
  return (
    <>
      <footer className="bg-stone-950 text-stone-200 pt-12 sm:pt-16 pb-6">
        <div className="qp-container">
          <div className="grid md:grid-cols-[1.3fr_1fr_1fr] gap-10 pb-12">
            <div>
              <span className="flex items-center gap-3">
                <Aperture size={25} strokeWidth={1.5} />
                <span className="font-serif text-2xl text-white">
                  Queen Photo.
                </span>
              </span>
              <p className="text-sm text-stone-300 leading-relaxed mt-5 max-w-sm">
                {tr('Menjaga cerita dalam setiap foto.')}
                <br />
                {tr('Studio dan cetak foto di Pontianak, sejak 1980.')}
              </p>
            </div>
            <div>
              <h2 className="!font-sans text-sm font-semibold !tracking-normal text-white mb-4">
                {tr('Jelajahi')}
              </h2>
              <div className="grid gap-1 justify-items-start">
                {(
                  [
                    ['layanan', 'Layanan & harga'],
                    ['trending', 'Photostrip & mini prints'],
                    ['lacak', 'Lacak pesanan'],
                    ['cerita', 'Tentang Queen Photo'],
                  ] as const
                ).map(([view, label]) => (
                  <button
                    className="text-sm min-h-10 hover:text-white"
                    key={view}
                    onClick={() => setCurrentView(view)}
                  >
                    {tr(label)}
                  </button>
                ))}
                <button
                  className="text-sm min-h-10 hover:text-white"
                  onClick={() => setIsSurveyModalOpen(true)}
                >
                  {tr('Beri masukan')}
                </button>
              </div>
            </div>
            <div>
              <h2 className="!font-sans text-sm font-semibold !tracking-normal text-white mb-5">
                {tr('Temui kami')}
              </h2>
              <div className="flex gap-3 text-sm leading-relaxed">
                <MapPin size={18} className="shrink-0 mt-1" />
                <p>
                  Jl. Gajah Mada No. 128
                  <br />
                  Pontianak, Kalimantan Barat
                </p>
              </div>
              <p className="text-sm mt-5 text-stone-300">
                {tr('Senin–Sabtu · 09.00–20.30 WIB')}
              </p>
              {phone && (
                <a
                  className="inline-flex items-center gap-2 text-sm text-white underline underline-offset-4 min-h-11 mt-3"
                  href={`https://wa.me/${phone}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {tr('Hubungi studio')} <ArrowUpRight size={15} />
                </a>
              )}
            </div>
          </div>
          <div className="border-t border-stone-800 pt-6 flex flex-wrap justify-between gap-4 text-xs text-stone-300">
            <p>© {new Date().getFullYear()} Queen Photo Pontianak</p>
            <button
              className="min-h-8 hover:text-white"
              onClick={() => setLogin(true)}
            >
              {tr('Portal staf')}{' '}
              <ArrowUpRight size={13} className="inline ml-1" />
            </button>
          </div>
        </div>
      </footer>
      <AdminAuthModal isOpen={login} onClose={() => setLogin(false)} />
    </>
  );
};

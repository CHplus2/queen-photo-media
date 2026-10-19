import { tr } from '../i18n/runtime';
import React from 'react';
import studio from '../assets/images/queen_photo_modern_studio_1791787204044.webp';
import strips from '../assets/images/queen_photo_genz_photostrips_1791787249531.webp';
import restoration from '../assets/images/queen_photo_vintage_restoration_1791784459211.webp';
import gallery from '../assets/images/queen_photo_gallery_wall_1791784471362.webp';
import gifts from '../assets/images/queen_photo_products_mug_album_1791784497018.webp';
import type { ServiceCategory } from '../types';
import { Image } from 'lucide-react';
const artwork: Partial<Record<ServiceCategory, string>> = {
  cetak_foto: gallery,
  photostrip_polaroid: strips,
  foto_studio: studio,
  pas_foto: studio,
  restorasi_edit: restoration,
  merchandise: gifts,
};
export const ServiceArtwork: React.FC<{
  category: ServiceCategory;
  className?: string;
}> = ({ category, className = '' }) => (
  <div className={`relative bg-stone-100 overflow-hidden ${className}`}>
    {artwork[category] ? (
      <img
        className="w-full h-full object-cover"
        src={artwork[category]}
        alt={tr(
          'Ilustrasi layanan foto; konfirmasikan contoh hasil dengan studio',
        )}
        loading="lazy"
        width="600"
        height="500"
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center text-stone-500">
        <Image size={36} strokeWidth={1.4} />
      </div>
    )}
    <span className="absolute bottom-2 left-2 text-[10px] bg-white/95 text-stone-600 rounded px-2 py-1">
      {tr('Ilustrasi layanan')}
    </span>
  </div>
);

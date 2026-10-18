import React from 'react';
import photo from '../assets/images/queen_photo_vintage_restoration_1791784459211.jpg';
import { useStudio } from '../context/StudioContext';
import { ArrowRight } from 'lucide-react';
export const RestorationShowcase: React.FC = () => {
  const { services, openOrderWithService } = useStudio();
  const service = services.find(
    (s) => s.id === 'restorasi-foto-lawas' && s.isActive !== false,
  );
  if (!service) return null;
  return (
    <section className="bg-[#eeeae1] py-12 sm:py-16">
      <div className="qp-container grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div className="rounded-xl overflow-hidden bg-stone-200">
          <img
            src={photo}
            alt="Ilustrasi perbaikan dan pewarnaan foto lama"
            width="1000"
            height="750"
            loading="lazy"
            className="w-full aspect-[4/3] object-cover"
          />
        </div>
        <div>
          <span className="qp-eyebrow">Kenangan lintas generasi</span>
          <h2 className="qp-title mt-4">Cerita lama, dirawat kembali.</h2>
          <p className="text-stone-600 mt-5 leading-relaxed">
            Foto yang pudar tetap menyimpan cerita. Konsultasikan perbaikan
            noda, lipatan, atau pewarnaan dengan studio sebelum menentukan
            pengerjaan.
          </p>
          <button
            className="qp-button mt-7"
            onClick={() => openOrderWithService(service)}
          >
            Lihat layanan restorasi <ArrowRight size={17} />
          </button>
          <p className="text-xs text-stone-500 mt-4">
            Harga dan hasil yang memungkinkan bergantung pada kondisi foto asli.
          </p>
        </div>
      </div>
    </section>
  );
};

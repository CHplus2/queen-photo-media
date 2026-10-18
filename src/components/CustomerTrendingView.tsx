import React from 'react';
import photo from '../assets/images/queen_photo_genz_photostrips_1791787249531.jpg';
import { useStudio } from '../context/StudioContext';
import { formatRupiah } from '../utils/formatters';
import { ArrowRight, Sparkles } from 'lucide-react';
export const CustomerTrendingView: React.FC = () => {
  const { services, openOrderWithService } = useStudio();
  const packages = services.filter(
    (s) => s.category === 'photostrip_polaroid' && s.isActive !== false,
  );
  return (
    <div className="qp-container py-12 sm:py-16">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div>
          <span className="qp-eyebrow">Photostrip & mini prints</span>
          <h1 className="qp-title mt-4">
            Momen kecil.
            <br />
            <span className="italic text-[#8a6547]">Bisa dibawa pulang.</span>
          </h1>
          <p className="text-stone-600 mt-5 text-base leading-relaxed">
            Foto sahabat, pasangan, atau keseharian yang ingin disimpan. Ubah
            pilihan dari galeri ponsel menjadi cetakan untuk dompet, meja, atau
            hadiah.
          </p>
          <div className="qp-notice mt-6 flex gap-3">
            <Sparkles size={20} className="shrink-0" />
            <p>
              Pilih paket di bawah, masukkan ke keranjang, lalu kirim foto asli
              melalui WhatsApp setelah checkout.
            </p>
          </div>
        </div>
        <img
          src={photo}
          alt="Koleksi photostrip dan cetakan mini"
          width="1000"
          height="800"
          className="w-full aspect-[5/4] object-cover rounded-xl"
        />
      </div>
      <div className="mt-12">
        <h2 className="text-3xl">Pilih paket favoritmu</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {packages.map((service) => (
            <article key={service.id} className="qp-service-card">
              <span className="qp-eyebrow">Photostrip & mini prints</span>
              <h3 className="text-xl font-semibold mt-3">{service.name}</h3>
              <p className="text-sm text-stone-600 mt-4 mb-6">
                {service.description}
              </p>
              <div className="mt-auto pt-5 border-t border-stone-200">
                <p className="text-xl font-semibold tabular-nums">
                  {formatRupiah(service.basePrice)}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  per {service.unit}
                </p>
                <button
                  className="qp-button w-full mt-5"
                  onClick={() => openOrderWithService(service)}
                >
                  Pilih paket <ArrowRight size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
        {packages.length === 0 && (
          <p className="qp-notice mt-5">
            Paket belum tersedia. Hubungi studio untuk pilihan terbaru.
          </p>
        )}
      </div>
    </div>
  );
};

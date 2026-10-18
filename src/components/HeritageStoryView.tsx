import React from 'react';
import photo from '../assets/images/queen_photo_gallery_wall_1791784471362.jpg';
import { useStudio } from '../context/StudioContext';
import { ArrowRight, MapPin } from 'lucide-react';
export const HeritageStoryView: React.FC = () => {
  const { setCurrentView } = useStudio();
  return (
    <div>
      <section className="qp-container py-12 sm:py-20 grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <span className="qp-eyebrow">Queen Photo · Pontianak</span>
          <h1 className="qp-title mt-4">
            Merawat kenangan,
            <br />
            <span className="italic text-[#8a6547]">lintas generasi.</span>
          </h1>
          <p className="mt-6 text-stone-600 leading-relaxed">
            Sejak 1980, Queen Photo menjadi bagian dari cerita keluarga di
            Pontianak. Dari pas foto dan potret keluarga hingga cetakan kecil
            dari galeri ponsel, setiap kebutuhan punya tempat di studio kami.
          </p>
          <p className="mt-4 text-stone-600 leading-relaxed">
            Kami ingin membuat prosesnya lebih mudah: pilih layanan, sampaikan
            kebutuhan, dan konfirmasikan hasil yang diinginkan bersama staf.
          </p>
          <button
            className="qp-button mt-7"
            onClick={() => setCurrentView('layanan')}
          >
            Temukan layanan Anda <ArrowRight size={17} />
          </button>
        </div>
        <img
          src={photo}
          width="1000"
          height="1000"
          alt="Inspirasi menata cetakan foto keluarga dalam bingkai"
          className="w-full aspect-square rounded-xl object-cover"
        />
      </section>
      <section className="bg-white border-y border-stone-200 py-12">
        <div className="qp-container grid md:grid-cols-3 gap-8">
          {[
            [
              'Untuk kebutuhan sehari-hari',
              'Pas foto, cetak ulang, dan foto yang perlu disiapkan untuk dokumen atau keluarga.',
            ],
            [
              'Untuk momen bersama',
              'Potret studio, photostrip, dan hadiah personal untuk orang terdekat.',
            ],
            [
              'Untuk cerita yang sudah lama',
              'Konsultasi restorasi foto pudar agar kenangan dapat dirawat kembali.',
            ],
          ].map(([title, text]) => (
            <div key={title}>
              <h2 className="!font-sans !tracking-normal text-lg font-semibold">
                {title}
              </h2>
              <p className="text-sm text-stone-600 mt-3 leading-relaxed">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="qp-container py-12 sm:py-16">
        <div className="qp-panel p-6 sm:p-10 flex flex-col md:flex-row gap-6 justify-between items-start">
          <div>
            <span className="qp-eyebrow">Datang ke studio</span>
            <h2 className="text-3xl mt-3">Sampai bertemu di Queen Photo.</h2>
            <p className="flex gap-2 items-center text-sm text-stone-600 mt-5">
              <MapPin size={17} />
              Jl. Gajah Mada No. 128, Pontianak
            </p>
            <p className="text-sm text-stone-500 mt-2">
              Senin–Sabtu · 09.00–20.30 WIB
            </p>
          </div>
          <button
            className="qp-button qp-button-secondary"
            onClick={() => setCurrentView('layanan')}
          >
            Lihat layanan & harga <ArrowRight size={17} />
          </button>
        </div>
      </section>
    </div>
  );
};

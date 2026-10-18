import bundledPhoto0 from '../assets/images/queen_photo_products_mug_album_1791784497018.jpg';
import React from 'react';
import { useStudio } from '../context/StudioContext';
import { Camera, History, Sparkles, MapPin, ArrowRight } from 'lucide-react';

export const HeritageStoryView: React.FC = () => {
  const { setIsOrderModalOpen } = useStudio();

  const eras = [
    {
      year: '1980-an',
      title: 'Awal Mula: Kamar Gelap & Potret Hitam Putih di Pontianak',
      desc: 'Berdiri di jantung kota Pontianak, Queen Photo berawal dari studio potret klasik menggunakan kamera film format sedang dan proses cuci cetak manual di kamar gelap. Di era ini, setiap cetakan foto hitam putih adalah karya kimia presisi yang merekam sejarah keluarga-keluarga perintis di Kalimantan Barat.',
      tag: 'Era Analog & Darkroom',
    },
    {
      year: '2000-an',
      title: 'Revolusi Minilab Digital & Sentuhan Photoshop',
      desc: 'Ketika teknologi fotografi bertransformasi ke era digital, Queen Photo berinvestasi pada mesin minilab digital dan menguasai software Photoshop. Layanan pas foto resmi kilat untuk dokumen imigrasi & instansi berkembang pesat, disusul keahlian merestorasi dan mewarnai kembali foto-foto lama keluarga yang mulai pudar.',
      tag: 'Era Digital & Retouching',
    },
    {
      year: '2018',
      title: 'Ekspansi Produk Kreatif, Mug & Album Kenangan',
      desc: 'Menjawab kebutuhan masyarakat modern, Queen Photo melengkapi layanan dengan cetak mug keramik custom, photobook layflat premium, cetak kanvas seni dinding, hingga banner dan spanduk acara komunitas di Pontianak dan sekitarnya.',
      tag: 'Era Diversifikasi Produk',
    },
    {
      year: '2026 & Seterusnya',
      title: 'Digitalisasi Penuh: Antar Langsung ke Rumah via GrabExpress',
      desc: 'Melangkah ke masa depan dengan platform pemesanan online terintegrasi. Pelanggan kini dapat mengunggah foto langsung dari ponsel, memilih kualitas kertas kimia asli Minilab, dan menerima paket foto terlindung rapi diantar kurir instan, tanpa harus menembus kemacetan kota.',
      tag: 'Era Digital Storefront & Logistik',
    },
  ];

  return (
    <div className="py-14 bg-stone-50 border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-14">
          <p className="text-amber-800 text-xs font-semibold uppercase tracking-wider">
            Perjalanan 40+ Tahun
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            Kisah Queen Photo: Menjaga Memori Keluarga Pontianak
          </h2>
          <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Dari era film gulung analog hingga era ponsel pintar, dedikasi kami terhadap ketajaman warna dan keabadian foto tidak pernah berubah.
          </p>
        </div>

        {/* Studio Visual Showcase */}
        <div className="mb-16 rounded-2xl overflow-hidden border border-stone-200 shadow-lg bg-stone-900 grid grid-cols-1 md:grid-cols-2 items-center">
          <div className="aspect-[4/3] bg-stone-800 overflow-hidden">
            <img
              src={bundledPhoto0}
              alt="Produk album kenangan dan mug keramik Queen Photo Pontianak"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="p-8 space-y-4 text-stone-200">
            <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
              Kualitas Fisik yang Bertahan
            </span>
            <h3 className="text-2xl font-serif font-bold text-stone-50">
              Mengapa Foto Cetak Tetap Tak Tergantikan di Era Digital?
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              File di memori handphone atau harddisk seringkali rusak atau hilang saat berganti perangkat. 
              Namun sebuah lembaran foto minilab berbahan kertas kimia perak, atau sebuah album photobook keluarga yang diletakkan di ruang tamu, akan tetap bercerita kepada anak cucu hingga 50 tahun mendatang.
            </p>
            <div className="pt-2 text-xs text-stone-400 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Studio Queen Photo · Jl. Gajah Mada No. 128, Pontianak Kota</span>
            </div>
          </div>
        </div>

        {/* Timeline Sequence */}
        <div className="relative pl-6 sm:pl-10 space-y-12 before:absolute before:left-3 sm:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-300">
          {eras.map((era, index) => (
            <div key={index} className="relative flex items-start gap-6">
              <div className="absolute -left-6 sm:-left-10 top-1 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-stone-900 text-amber-300 border-4 border-stone-100 flex items-center justify-center text-xs font-bold font-mono shadow-sm">
                {index + 1}
              </div>

              <div className="space-y-2 bg-white p-6 rounded-2xl border border-stone-200/90 shadow-sm w-full">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold font-mono text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/60">
                    {era.year}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    {era.tag}
                  </span>
                </div>

                <h4 className="text-lg font-bold text-stone-900">
                  {era.title}
                </h4>

                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  {era.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action footer */}
        <div className="mt-16 text-center bg-stone-900 text-stone-100 p-8 sm:p-10 rounded-2xl border border-stone-800 space-y-4">
          <h3 className="text-2xl font-serif font-bold text-stone-50">
            Ingin Mengabadikan Momen Keluarga Hari Ini?
          </h3>
          <p className="text-stone-300 text-xs sm:text-sm max-w-lg mx-auto">
            Jangan tunggu foto lama rusak. Kirimkan foto Anda secara online sekarang dan nikmati kemudahan pengiriman GrabExpress Pontianak.
          </p>
          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <span>Mulai Pesan Foto Anda</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

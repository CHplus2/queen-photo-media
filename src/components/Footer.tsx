import React from 'react';
import { useStudio } from '../context/StudioContext';
import { MapPin, Phone, Clock, Mail, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView, setIsSurveyModalOpen } = useStudio();

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 text-xs">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <h3 className="text-base font-serif font-bold text-amber-200">
              Queen Photo Pontianak
            </h3>
            <p className="text-stone-400 text-xs leading-relaxed">
              Studio foto & laboratorium cetak minilab terpercaya di Pontianak, Kalimantan Barat sejak tahun 1980. Melestarikan memori keluarga lintas generasi.
            </p>
            <p className="text-[11px] text-stone-500">
              Kertas Fuji Minilab Asli · Anti Luntur 50 Tahun
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <p className="font-semibold text-stone-100 text-xs uppercase tracking-wider">
              Layanan Utama
            </p>
            <ul className="space-y-1.5 text-stone-400">
              <li>
                <button onClick={() => setCurrentView('layanan')} className="hover:text-amber-300 transition-colors">
                  Cetak Foto 4R, 10R & Roll Kanvas
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('layanan')} className="hover:text-amber-300 transition-colors">
                  Pas Foto Resmi Kilat (KTP / Paspor)
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('layanan')} className="hover:text-amber-300 transition-colors">
                  Restorasi Foto Lawas & Edit Photoshop
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('layanan')} className="hover:text-amber-300 transition-colors">
                  Mug Keramik Kustom & Layflat Album
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('layanan')} className="hover:text-amber-300 transition-colors">
                  Sesi Foto Studio Keluarga Pontianak
                </button>
              </li>
              <li className="pt-1">
                <button 
                  onClick={() => setIsSurveyModalOpen(true)} 
                  className="text-amber-300 font-bold hover:text-amber-200 transition-colors flex items-center gap-1.5"
                >
                  <span>🎁 Survei Riset Pasar (Diskon 10%)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Operational & Staff Navigation */}
          <div className="space-y-2">
            <p className="font-semibold text-stone-100 text-xs uppercase tracking-wider">
              Sistem Studio
            </p>
            <ul className="space-y-1.5 text-stone-400">
              <li>
                <button onClick={() => setCurrentView('lacak')} className="hover:text-amber-300 transition-colors">
                  Lacak Status Pesanan (Real-Time)
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('cerita')} className="hover:text-amber-300 transition-colors">
                  Kisah 40 Tahun Queen Photo
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('pos')} className="hover:text-amber-300 transition-colors">
                  Kasir Walk-In & Manajemen Pesanan
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('kalkulator')} className="hover:text-amber-300 transition-colors">
                  Kalkulator HPP Kertas Roll & Laba
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('rekap')} className="hover:text-amber-300 transition-colors">
                  Laporan Rekap Omset & Target Pra-Pandemi
                </button>
              </li>
            </ul>
          </div>

          {/* Studio Contact Pontianak */}
          <div className="space-y-2">
            <p className="font-semibold text-stone-100 text-xs uppercase tracking-wider">
              Lokasi & Jam Buka
            </p>
            <div className="space-y-2 text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Jl. Gajah Mada No. 128, Pontianak Kota, Kalimantan Barat</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Senin - Sabtu: 09.00 - 20.30 WIB</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>WhatsApp: 0812-5678-xxxx (Order & CS)</span>
              </div>
              <div className="pt-2 text-[11px] text-stone-500">
                Layanan Antar Kilat: GrabExpress Pontianak & Kubu Raya
              </div>
            </div>
          </div>

        </div>

        {/* Bottom row */}
        <div className="mt-12 pt-6 border-t border-stone-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500 text-[11px]">
          <p>© 1980 - 2026 Queen Photo Pontianak. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-4">
            <span>Pontianak, Kalimantan Barat, Indonesia</span>
            <span>·</span>
            <button onClick={() => setCurrentView('pos')} className="hover:underline">
              Akses Portal Kasir
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

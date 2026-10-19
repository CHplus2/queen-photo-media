import { tr } from '../i18n/runtime';
import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import type { AppView } from '../context/StudioContext';
import { ArrowRight } from 'lucide-react';
export const AdminSettingsView: React.FC = () => {
  const { adminEmail, triggerPasswordReset, setCurrentView } = useStudio();
  const [message, setMessage] = useState('');
  return (
    <div className="qp-container py-8 sm:py-10 space-y-6">
      <div>
        <span className="qp-eyebrow">{tr('Pengaturan & alat')}</span>
        <h1 className="text-3xl !font-sans font-semibold mt-2">
          {tr('Atur kebutuhan toko')}
        </h1>
        <p className="text-sm text-stone-500 mt-3">
          {tr(
            'Pengaturan dipisahkan dari tugas kasir harian agar pencatatan penjualan tetap cepat.',
          )}
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {(
          [
            [
              'menu',
              'Layanan & harga',
              'Tambah paket, perbarui harga, dan atur pilihan pelanggan.',
            ],
            [
              'kalkulator',
              'Kalkulator biaya',
              'Hitung estimasi biaya bahan dan harga jasa.',
            ],
            [
              'strategi',
              'Riset pelanggan',
              'Baca masukan pelanggan dan evaluasi ide penawaran.',
            ],
          ] as [AppView, string, string][]
        ).map(([view, title, text]) => (
          <article className="qp-panel p-5" key={view}>
            <h2 className="!font-sans font-semibold text-lg">{tr(title)}</h2>
            <p className="text-sm text-stone-500 mt-3">{tr(text)}</p>
            <button
              className="qp-button qp-button-secondary mt-5"
              onClick={() => setCurrentView(view)}
            >
              {tr('Buka')} <ArrowRight size={16} />
            </button>
          </article>
        ))}
      </div>
      <section className="qp-panel p-5 sm:p-6 max-w-2xl">
        <h2 className="!font-sans font-semibold text-lg">{tr('Akun staf')}</h2>
        <p className="text-sm mt-3 break-all">{adminEmail}</p>
        <p className="text-sm text-stone-500 mt-3">
          {tr(
            'Gunakan akun masing-masing agar pencatat penjualan dan pemeriksa pembayaran dapat dikenali. Hak akses tetap dikelola melalui Firebase.',
          )}
        </p>
        <button
          className="qp-button qp-button-secondary mt-5"
          onClick={async () => {
            try {
              setMessage(await triggerPasswordReset(adminEmail));
            } catch {
              setMessage('Email reset belum terkirim. Coba kembali.');
            }
          }}
        >
          {tr('Kirim tautan reset kata sandi')}
        </button>
        <p role="status" className="text-sm text-stone-600 mt-3">
          {tr(message)}
        </p>
      </section>
    </div>
  );
};

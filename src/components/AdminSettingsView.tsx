import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
export const AdminSettingsView: React.FC = () => {
  const { adminEmail, triggerPasswordReset } = useStudio();
  const [message, setMessage] = useState('');
  return <section className="max-w-xl mx-auto py-10 px-6 space-y-5"><h2 className="text-2xl font-bold">Keamanan akun staf</h2><p>Akun aktif: {adminEmail}</p><p>Izin staf dikelola melalui Firebase Admin, bukan pendaftaran publik. Untuk mengganti kata sandi, gunakan tautan reset resmi Firebase.</p><button className="bg-stone-900 text-white p-3 rounded-lg" onClick={async () => { try { setMessage(await triggerPasswordReset(adminEmail)); } catch (e) { setMessage(e instanceof Error ? e.message : 'Gagal mengirim email.'); } }}>Kirim tautan reset password</button><p role="status">{message}</p><p className="text-sm text-stone-500">Autentikasi dua faktor harus dikonfigurasi melalui Firebase Authentication. Pengaturan TOTP lokal sebelumnya tidak digunakan untuk memberi akses staf.</p></section>;
};

import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { 
  KeyRound, Mail, ShieldCheck, Lock, Smartphone, 
  Check, RefreshCw, AlertCircle, Database, CheckCircle2, 
  Copy, QrCode, ShieldAlert, X 
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const { 
    adminEmail, 
    setAdminEmail, 
    adminPassword, 
    changeAdminPassword, 
    triggerPasswordReset, 
    seedFirestoreDataNow,
    isTwoFactorEnabled,
    twoFactorSecret,
    enableTwoFactor,
    disableTwoFactor,
    getOtpAuthUri,
    generateNewTwoFactorSecret 
  } = useStudio();

  // Password Change state
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [changePassSuccess, setChangePassSuccess] = useState('');
  const [changePassError, setChangePassError] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Forgot Password Email state
  const [resetEmailInput, setResetEmailInput] = useState(adminEmail);
  const [resetStatusMsg, setResetStatusMsg] = useState('');
  const [resetErrorMsg, setResetErrorMsg] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // 2FA Setup state
  const [setupSecret, setSetupSecret] = useState(twoFactorSecret || 'JBSWY3DPEHPK3PXP');
  const [testTotpInput, setTestTotpInput] = useState('');
  const [totpSetupError, setTotpSetupError] = useState('');
  const [totpSetupSuccess, setTotpSetupSuccess] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Cloud Sync state
  const [syncLoading, setSyncLoading] = useState(false);

  // Email format regex
  const isValidEmail = (val: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(val.trim());
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePassSuccess('');
    setChangePassError('');

    if (newPassInput.length < 6) {
      setChangePassError('Password baru minimal 6 karakter.');
      return;
    }
    if (newPassInput !== confirmPassInput) {
      setChangePassError('Konfirmasi password baru tidak cocok.');
      return;
    }

    setIsChangingPass(true);
    try {
      await changeAdminPassword(newPassInput);
      setChangePassSuccess('✅ Password admin studio berhasil diubah dan disinkronkan!');
      setCurrentPassInput('');
      setNewPassInput('');
      setConfirmPassInput('');
    } catch (err: any) {
      setChangePassError(err?.message || 'Gagal mengubah password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  // Handle Forgot Password Email (Sends genuine Firebase reset link)
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatusMsg('');
    setResetErrorMsg('');

    if (!resetEmailInput.trim() || !isValidEmail(resetEmailInput.trim())) {
      setResetErrorMsg('❌ Format email tidak valid! Masukkan email asli (contoh: queenphotomedia@gmail.com).');
      return;
    }

    setResetLoading(true);
    try {
      const result = await triggerPasswordReset(resetEmailInput);
      setResetStatusMsg(result);
    } catch (err: any) {
      setResetErrorMsg(err?.message || 'Gagal mengirim email reset.');
    } finally {
      setResetLoading(false);
    }
  };

  // Handle Enable 2FA with Code from Phone
  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setTotpSetupError('');
    setTotpSetupSuccess('');

    if (testTotpInput.length !== 6) {
      setTotpSetupError('Masukkan 6 digit angka dari aplikasi Google Authenticator di HP Anda.');
      return;
    }

    const res = await enableTwoFactor(setupSecret, testTotpInput);
    if (res.success) {
      setTotpSetupSuccess(res.message);
      setTestTotpInput('');
    } else {
      setTotpSetupError(res.message);
    }
  };

  // Handle Disable 2FA
  const handleDisable2FA = async () => {
    if (window.confirm('Apakah Anda yakin ingin menonaktifkan autentikasi 2FA Google Authenticator?')) {
      await disableTwoFactor();
      setTotpSetupSuccess('2FA Google Authenticator dinonaktifkan.');
      setTotpSetupError('');
      setTimeout(() => setTotpSetupSuccess(''), 4000);
    }
  };

  // Copy Secret Key
  const handleCopySecret = () => {
    navigator.clipboard.writeText(setupSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2500);
  };

  // Generate fresh secret
  const handleGenerateFreshSecret = () => {
    const newSec = generateNewTwoFactorSecret();
    setSetupSecret(newSec);
    setTotpSetupError('');
    setTotpSetupSuccess('');
  };

  const otpAuthUri = getOtpAuthUri(setupSecret);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUri)}`;

  const handleSyncCloud = async () => {
    setSyncLoading(true);
    await seedFirestoreDataNow();
    setSyncLoading(false);
  };

  return (
    <div className="py-6 sm:py-10 max-w-4xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-10">
      
      {/* Header */}
      <div className="space-y-1 pb-6 border-b border-stone-200">
        <p className="text-amber-800 text-xs font-semibold uppercase tracking-wider">
          Pengaturan Keamanan & Akun
        </p>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
          Keamanan Akun Admin, Password & 2FA Google Authenticator
        </h2>
        <p className="text-stone-600 text-xs sm:text-sm">
          Kelola password akun, kirim tautan reset password ke email resmi via Firebase, dan konfigurasi Google Authenticator asli di HP Anda.
        </p>
      </div>

      {/* SECTION 1: UBAH PASSWORD ADMIN */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <KeyRound className="w-5 h-5 text-amber-600" />
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Ubah Password Akun Admin Studio
            </h3>
            <p className="text-xs text-stone-500">
              Ganti kata sandi admin yang digunakan untuk masuk ke dashboard kasir & manajemen.
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md text-xs">
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Password Baru:
            </label>
            <input
              type="password"
              required
              value={newPassInput}
              onChange={(e) => setNewPassInput(e.target.value)}
              placeholder="Minimal 6 karakter..."
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Konfirmasi Password Baru:
            </label>
            <input
              type="password"
              required
              value={confirmPassInput}
              onChange={(e) => setConfirmPassInput(e.target.value)}
              placeholder="Ulangi password baru..."
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-600"
            />
          </div>

          {changePassError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{changePassError}</span>
            </div>
          )}

          {changePassSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{changePassSuccess}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isChangingPass}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            {isChangingPass ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            <span>Simpan Password Baru</span>
          </button>
        </form>
      </div>

      {/* SECTION 2: LUPA PASSWORD & EMAIL VERIFICATION VIA REAL FIREBASE */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <Mail className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Lupa Password & Kirim Link Reset ke Email Asli
            </h3>
            <p className="text-xs text-stone-500">
              Google Firebase Authentication akan mengirimkan email resmi berisi tautan langsung untuk mengatur ulang kata sandi.
            </p>
          </div>
        </div>

        <form onSubmit={handleSendResetEmail} className="space-y-4 max-w-md text-xs">
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Email Penerima Link Reset Password:
            </label>
            <input
              type="email"
              required
              value={resetEmailInput}
              onChange={(e) => setResetEmailInput(e.target.value)}
              placeholder="queenphotomedia@gmail.com"
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          {resetErrorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{resetErrorMsg}</span>
            </div>
          )}

          {resetStatusMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{resetStatusMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={resetLoading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            {resetLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            <span>{resetLoading ? 'Mengirim via Firebase...' : 'Kirim Tautan Reset ke Email'}</span>
          </button>
        </form>
      </div>

      {/* SECTION 3: REAL GOOGLE AUTHENTICATOR (2FA) TOTP SETUP */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Setup Google Authenticator (2FA Asli)
              </h3>
              <p className="text-xs text-stone-500">
                Hubungkan dengan aplikasi Google Authenticator / Microsoft Authenticator di smartphone Anda.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">Status 2FA:</span>
            {isTwoFactorEnabled ? (
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>AKTIF</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-stone-100 text-stone-600 font-bold text-xs rounded-full">
                NONAKTIF
              </span>
            )}
          </div>
        </div>

        {/* Instructions & Steps */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start text-xs text-stone-700">
          
          <div className="md:col-span-7 space-y-4">
            <ol className="list-decimal pl-4 space-y-2 leading-relaxed">
              <li>
                Install aplikasi <strong>Google Authenticator</strong> atau <strong>Microsoft Authenticator</strong> di HP Anda melalui Play Store / App Store.
              </li>
              <li>
                Buka aplikasi di HP, tekan tombol <strong>Tambah (+)</strong>, lalu pilih <strong>Pindai kode QR</strong> atau <strong>Masukkan Kunci Penyiapan</strong>.
              </li>
              <li>
                Nama Akun: <code>Queen Photo Studio ({adminEmail})</code>
              </li>
              <li>
                Kunci Rahasia (Setup Key):
                <div className="mt-1 flex items-center gap-2">
                  <code className="font-mono text-sm bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-900 font-bold tracking-wider select-all">
                    {setupSecret}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="p-1.5 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors"
                    title="Salin Kunci Rahasia"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {copiedSecret && <span className="text-emerald-600 text-[11px] font-semibold">Tersalin!</span>}
                </div>
              </li>
            </ol>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleGenerateFreshSecret}
                className="text-[11px] text-stone-500 hover:text-stone-800 underline"
              >
                Buat Kunci Rahasia Baru
              </button>
            </div>

            {/* Test & Enable Form */}
            <form onSubmit={handleEnable2FA} className="pt-3 border-t border-stone-100 space-y-2">
              <label className="block font-semibold text-stone-900">
                Verifikasi 6-Digit dari Google Authenticator di HP Anda:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={testTotpInput}
                  onChange={(e) => setTestTotpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-36 text-center font-mono font-bold text-base border border-stone-300 rounded-xl px-2 py-2 text-stone-900 focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-colors text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Aktifkan 2FA</span>
                </button>
              </div>

              {totpSetupError && (
                <p className="text-rose-600 font-semibold text-xs pt-1">{totpSetupError}</p>
              )}
              {totpSetupSuccess && (
                <p className="text-emerald-700 font-semibold text-xs pt-1">{totpSetupSuccess}</p>
              )}
            </form>

            {isTwoFactorEnabled && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDisable2FA}
                  className="px-3 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-lg transition-colors"
                >
                  Nonaktifkan 2FA Google Authenticator
                </button>
              </div>
            )}
          </div>

          {/* QR Code Container */}
          <div className="md:col-span-5 bg-stone-50 p-5 rounded-xl border border-stone-200 text-center space-y-3">
            <span className="font-semibold text-stone-800 block text-xs">
              Pindai Kode QR via HP:
            </span>
            <div className="inline-block p-2 bg-white rounded-xl shadow-xs border border-stone-200">
              <img
                src={qrCodeUrl}
                alt="Google Authenticator QR Code"
                className="w-44 h-44 mx-auto"
                loading="lazy"
              />
            </div>
            <p className="text-[11px] text-stone-500 leading-tight">
              Arahkan kamera aplikasi Google Authenticator ke kode QR di atas untuk menambahkan akun secara otomatis.
            </p>
          </div>

        </div>
      </div>

      {/* SECTION 4: CLOUD DATABASE STATUS */}
      <div className="bg-stone-900 text-stone-100 p-6 sm:p-8 rounded-2xl border border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-stone-50">
              Informasi Database Cloud Firestore
            </h3>
          </div>
          <span className="text-xs font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
            TERHUBUNG & AKTIF
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-stone-400 block">Project ID Firebase:</span>
            <strong className="font-mono text-stone-200">gen-lang-client-0346719757</strong>
          </div>
          <div>
            <span className="text-stone-400 block">Database ID Khusus:</span>
            <strong className="font-mono text-stone-200 text-[11px] block truncate">
              ai-studio-queenphotostudio-009ecc42-7075-40e2-bda1-c76643f190a5
            </strong>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSyncCloud}
            disabled={syncLoading}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
            <span>{syncLoading ? 'Menyinkronkan...' : 'Sinkronkan Ulang Semua Data ke Cloud Firestore'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};

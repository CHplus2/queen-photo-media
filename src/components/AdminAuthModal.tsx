import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { 
  Lock, Mail, X, ShieldCheck, 
  ArrowRight, Smartphone, Eye, EyeOff, AlertCircle, RefreshCw, CheckCircle2 
} from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    setActiveRole, 
    setIsAdminAuthenticated, 
    setCurrentView,
    adminEmail,
    loginWithFirebaseAuth,
    verifyTotpCode,
    isTwoFactorEnabled,
    triggerPasswordReset 
  } = useStudio();
  
  // Auth mode: 'LOGIN' | 'FORGOT_PASSWORD'
  const [authMode, setAuthMode] = useState<'LOGIN' | 'FORGOT_PASSWORD'>('LOGIN');
  
  // Form credentials - do not auto-display email on sign-in click
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // 2FA TOTP Step
  const [is2FAStep, setIs2FAStep] = useState(false);
  const [totpCodeInput, setTotpCodeInput] = useState('');
  
  // Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reset inputs when modal opens so credentials are never auto-revealed
  React.useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setIs2FAStep(false);
      setTotpCodeInput('');
      setErrorMsg('');
      setSuccessMsg('');
      setAuthMode('LOGIN');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // RFC compliant email format check
  const isValidEmail = (val: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(val.trim());
  };

  const grantAdminAccess = () => {
    setIsAdminAuthenticated(true);
    setActiveRole('ADMIN');
    setCurrentView('pos');
    onClose();
    // Reset form states
    setIs2FAStep(false);
    setPassword('');
    setTotpCodeInput('');
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(false);
  };

  // 1. Production Login (Requires Email + Password)
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Mohon masukkan alamat email akun admin.');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setErrorMsg('Format email tidak valid. Gunakan format email resmi.');
      return;
    }

    if (!password) {
      setErrorMsg('Mohon masukkan kata sandi Anda.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginWithFirebaseAuth(cleanEmail, password);

      if (result.requires2FA) {
        setIs2FAStep(true);
        setErrorMsg('');
        setIsLoading(false);
      } else {
        grantAdminAccess();
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Email atau kata sandi tidak cocok. Silakan periksa kembali.');
    }
  };

  // 2. 2FA Verification (Requires 6-Digit TOTP Code)
  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanCode = totpCodeInput.trim().replace(/\s/g, '');
    if (cleanCode.length !== 6) {
      setErrorMsg('Masukkan 6 digit angka dari aplikasi Google Authenticator.');
      return;
    }

    setIsLoading(true);

    const isValid = verifyTotpCode(cleanCode);

    if (isValid) {
      grantAdminAccess();
    } else {
      setIsLoading(false);
      setErrorMsg('Kode 6-digit tidak cocok atau sudah kedaluwarsa. Periksa sinkronisasi jam di HP Anda.');
    }
  };

  // 3. Forgot Password via Real Firebase Email
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setErrorMsg('Masukkan alamat email yang valid.');
      return;
    }

    setIsLoading(true);

    try {
      const msg = await triggerPasswordReset(cleanEmail);
      setIsLoading(false);
      setSuccessMsg(msg);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Gagal mengirim email reset password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-stone-900 text-stone-100 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-100">Portal Masuk Admin Studio</h3>
              <p className="text-[11px] text-stone-400">Akses Khusus Manajemen Kasir & Operasional</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Segmented Mode Tabs (Only when not in 2FA step) */}
          {!is2FAStep && (
            <div className="grid grid-cols-2 rounded-xl bg-stone-100 p-1 text-xs gap-1">
              <button
                type="button"
                onClick={() => { setAuthMode('LOGIN'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`py-2 rounded-lg font-bold transition-all text-center min-h-[38px] ${
                  authMode === 'LOGIN'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Masuk Akun
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode('FORGOT_PASSWORD'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`py-2 rounded-lg font-bold transition-all text-center min-h-[38px] ${
                  authMode === 'FORGOT_PASSWORD'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Lupa Password
              </button>
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* VIEW A: STEP 2 - 2FA TOTP */}
          {is2FAStep ? (
            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <Smartphone className="w-4 h-4 text-amber-700" />
                  <span>Verifikasi 2FA Google Authenticator</span>
                </div>
                <p className="text-amber-800 leading-relaxed text-[11px]">
                  Buka aplikasi <strong>Google Authenticator</strong> di ponsel Anda, lalu masukkan 6-digit kode yang sedang tampil.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Kode 6-Digit dari Aplikasi HP:
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  autoFocus
                  value={totpCodeInput}
                  onChange={(e) => setTotpCodeInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center font-mono text-2xl font-bold tracking-widest py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setIs2FAStep(false); setTotpCodeInput(''); }}
                  className="flex-1 py-3 border border-stone-300 text-stone-700 rounded-xl font-semibold text-xs hover:bg-stone-50 min-h-[44px]"
                >
                  Kembali
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Verifikasi & Masuk</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : authMode === 'LOGIN' ? (
            /* VIEW B: PRODUCTION LOGIN FORM */
            <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Email Akun Admin:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-stone-800">
                    Kata Sandi (Password):
                  </label>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('FORGOT_PASSWORD'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-[11px] text-amber-800 hover:text-amber-950 hover:underline font-semibold"
                  >
                    Lupa Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isTwoFactorEnabled && (
                <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-[11px] text-stone-600 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-stone-500 shrink-0" />
                  <span>2FA Google Authenticator aktif pada akun ini.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 active:bg-stone-950 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 min-h-[44px]"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Masuk ke Dashboard Admin</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* VIEW C: FORGOT PASSWORD (FIREBASE AUTH RESET LINK VIA EMAIL) */
            <form onSubmit={handleSendResetEmail} className="space-y-4">
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 space-y-1.5">
                <p className="font-bold text-stone-900">Kirim Tautan Reset Password</p>
                <p className="text-[11px] leading-relaxed text-stone-600">
                  Google Firebase Authentication akan mengirimkan tautan resmi ke alamat email Anda untuk membuat kata sandi baru. Periksa kotak masuk (inbox) atau folder spam email Anda.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Email Akun Admin:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 min-h-[44px]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setAuthMode('LOGIN'); setErrorMsg(''); setSuccessMsg(''); }}
                  className="flex-1 py-3 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-50 min-h-[44px]"
                >
                  Kembali ke Login
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Kirim Tautan Reset</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Studio Footer Note */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
            <span>Queen Photo Studio Pontianak</span>
            <span>Jl. Gajah Mada No. 188</span>
          </div>

        </div>

      </div>
    </div>
  );
};

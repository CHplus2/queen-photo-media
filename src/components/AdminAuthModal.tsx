import React, { useState, useEffect } from 'react';
import { useStudio } from '../context/StudioContext';
import { useDialog } from '../hooks/useDialog';
import { X, Eye, EyeOff, LockKeyhole, ArrowRight } from 'lucide-react';
interface Props {
  isOpen: boolean;
  onClose: () => void;
}
export const AdminAuthModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { loginWithFirebaseAuth, triggerPasswordReset, setCurrentView } =
    useStudio();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const ref = useDialog<HTMLElement>(isOpen, () => {
    if (!busy) onClose();
  });
  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setVisible(false);
    }
    if (isOpen) {
      setEmail('');
      setPassword('');
      setVisible(false);
      setError('');
      setMessage('');
    }
  }, [isOpen]);
  if (!isOpen) return null;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await loginWithFirebaseAuth(email, password);
      setCurrentView('pos');
      onClose();
    } catch {
      setError(
        'Login belum berhasil. Periksa email, kata sandi, dan izin staf Anda.',
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      className="qp-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <section
        ref={ref}
        tabIndex={-1}
        className="qp-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-login-title"
      >
        <div className="qp-dialog-header">
          <div>
            <span className="qp-eyebrow">Khusus tim Queen Photo</span>
            <h2 id="staff-login-title" className="text-2xl mt-2">
              Masuk ruang kerja
            </h2>
          </div>
          <button
            aria-label="Tutup login staf"
            disabled={busy}
            className="qp-icon-button"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="qp-dialog-content space-y-5">
          <p className="text-sm text-stone-600">
            Kelola pesanan, layanan, dan laporan studio menggunakan akun staf
            yang telah diizinkan.
          </p>
          <div>
            <label className="qp-label" htmlFor="staff-email">
              Email staf
            </label>
            <input
              className="qp-field"
              id="staff-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={busy}
            />
          </div>
          <div>
            <label className="qp-label" htmlFor="staff-password">
              Kata sandi
            </label>
            <div className="relative">
              <input
                className="qp-field !pr-14"
                id="staff-password"
                type={visible ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={busy}
              />
              <button
                type="button"
                aria-label={
                  visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'
                }
                aria-pressed={visible}
                onClick={() => setVisible(!visible)}
                className="qp-icon-button absolute right-1 top-0.5"
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && (
            <p role="alert" className="qp-error">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="qp-notice">
              {message}
            </p>
          )}
          <button type="submit" disabled={busy} className="qp-button w-full">
            {busy ? 'Memeriksa akun…' : 'Masuk'}
            <ArrowRight size={17} />
          </button>
          <button
            type="button"
            disabled={busy}
            className="block mx-auto text-sm text-stone-600 min-h-11 underline"
            onClick={async () => {
              setError('');
              setMessage('');
              if (!email.trim()) {
                setError('Isi email staf untuk menerima tautan reset.');
                return;
              }
              setBusy(true);
              try {
                setMessage(await triggerPasswordReset(email));
              } catch {
                setError(
                  'Email reset belum terkirim. Periksa alamat email dan coba lagi.',
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            Lupa kata sandi?
          </button>
          <p className="text-xs text-stone-500 text-center flex items-center justify-center gap-2">
            <LockKeyhole size={13} />
            Akses hanya untuk staf yang berwenang.
          </p>
        </form>
      </section>
    </div>
  );
};

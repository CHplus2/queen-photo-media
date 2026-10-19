import React, { useState, useEffect } from 'react';
import { useStudio, AppView } from '../context/StudioContext';
import {
  Aperture,
  ShoppingBag,
  Menu,
  X,
  ArrowUpRight,
  LogOut,
} from 'lucide-react';
import { AdminAuthModal } from './AdminAuthModal';

const customerLinks: [AppView, string][] = [
  ['beranda', 'Beranda'],
  ['layanan', 'Layanan & harga'],
  ['trending', 'Photostrip'],
  ['lacak', 'Lacak pesanan'],
  ['cerita', 'Tentang kami'],
];
const staffLinks: [AppView, string][] = [
  ['pos', 'Kasir'],
  ['orders', 'Pesanan'],
  ['supervision', 'Ringkasan toko'],
  ['menu', 'Produk & harga'],
  ['inventory', 'Inventaris'],
  ['rekap', 'Laporan'],
  ['settings', 'Pengaturan'],
];
export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    activeRole,
    setActiveRole,
    isAdminAuthenticated,
    isSupervisor,
    logoutAdmin,
    cart,
    setIsCartOpen,
  } = useStudio();
  const [logoutError, setLogoutError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        document
          .querySelector<HTMLElement>('[aria-controls="mobile-navigation"]')
          ?.focus();
      }
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [menuOpen]);
  const staff = activeRole === 'ADMIN';
  const navigate = (view: AppView) => {
    setCurrentView(view);
    setMenuOpen(false);
  };
  const openStaff = () => {
    setMenuOpen(false);
    if (isAdminAuthenticated) {
      setActiveRole('ADMIN');
      setCurrentView('pos');
    } else setLoginOpen(true);
  };
  const links = staff
    ? isSupervisor
      ? staffLinks
      : ([
          ['pos', 'Kasir'],
          ['orders', 'Pesanan'],
          ['supervision', 'Penjualan hari ini'],
        ] as [AppView, string][])
    : customerLinks;
  return (
    <>
      <a className="skip-link" href="#main-content">
        Langsung ke konten
      </a>
      {logoutError && (
        <p role="alert" className="qp-error">
          {logoutError}
        </p>
      )}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="qp-container flex items-center justify-between gap-4 min-h-[80px]">
          <button
            aria-label="Queen Photo — Beranda"
            onClick={() => navigate(staff ? 'pos' : 'beranda')}
            className="flex items-center gap-3 text-left shrink-0"
          >
            <span className="w-9 h-9 sm:w-10 sm:h-10 bg-stone-900 text-white rounded-lg flex items-center justify-center">
              <Aperture size={24} strokeWidth={1.5} />
            </span>
            <span>
              <span className="block text-lg sm:text-xl font-serif font-bold leading-tight">
                Queen Photo<span className="text-amber-700">.</span>
              </span>
              <span className="hidden min-[380px]:block text-[10px] uppercase tracking-[.15em] text-stone-500 mt-1">
                {staff ? 'Ruang kerja studio' : 'Pontianak · Sejak 1980'}
              </span>
            </span>
          </button>
          {!staff && (
            <nav aria-label="Navigasi utama" className="hidden xl:flex gap-1">
              {links.map(([view, label]) => (
                <button
                  key={view}
                  className="qp-nav-link"
                  aria-current={currentView === view ? 'page' : undefined}
                  onClick={() => navigate(view)}
                >
                  {label}
                </button>
              ))}
            </nav>
          )}
          <div className="flex items-center gap-2">
            {!staff ? (
              <>
                <button
                  aria-label={`Buka keranjang, ${cart.reduce((n, item) => n + item.quantity, 0)} item`}
                  className="qp-icon-button relative border border-stone-200"
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingBag size={19} />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-stone-900 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </button>
                <span className="hidden sm:inline-flex">
                  <button
                    className="qp-button"
                    onClick={() => navigate('layanan')}
                  >
                    Mulai pesan <ArrowUpRight size={17} />
                  </button>
                </span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline-flex">
                  <button
                    className="qp-button qp-button-secondary"
                    onClick={() => {
                      setActiveRole('CUSTOMER');
                      navigate('beranda');
                    }}
                  >
                    Lihat website <ArrowUpRight size={16} />
                  </button>
                </span>
                <button
                  aria-label="Keluar dari akun staf"
                  className="qp-icon-button"
                  onClick={async () => {
                    try {
                      await logoutAdmin();
                      navigate('beranda');
                      setLogoutError('');
                    } catch {
                      setLogoutError(
                        'Belum berhasil keluar. Coba lagi sebelum meninggalkan perangkat.',
                      );
                    }
                  }}
                >
                  <LogOut size={19} />
                </button>
              </>
            )}
            <span className="xl:hidden">
              <button
                className="qp-icon-button border border-stone-200"
                aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
                aria-expanded={menuOpen}
                aria-controls="mobile-navigation"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X size={21} /> : <Menu size={21} />}
              </button>
            </span>
            {!staff && (
              <button
                onClick={openStaff}
                className="hidden xl:block text-xs text-stone-500 border-l border-stone-200 pl-4 ml-2 min-h-11"
              >
                Staf
              </button>
            )}
          </div>
        </div>
        {staff && (
          <nav
            aria-label="Navigasi staf"
            className="qp-container hidden xl:flex gap-2 pb-3 overflow-x-auto"
          >
            {links.map(([view, label]) => (
              <button
                key={view}
                className="qp-nav-link"
                aria-current={currentView === view ? 'page' : undefined}
                onClick={() => navigate(view)}
              >
                {label}
              </button>
            ))}
          </nav>
        )}
        {menuOpen && (
          <nav
            id="mobile-navigation"
            aria-label="Menu seluler"
            className="xl:hidden border-t border-stone-200 bg-white max-h-[calc(100dvh-80px)] overflow-y-auto"
          >
            <div className="qp-container py-4 grid gap-1">
              {links.map(([view, label]) => (
                <button
                  key={view}
                  className="qp-nav-link text-left"
                  aria-current={currentView === view ? 'page' : undefined}
                  onClick={() => navigate(view)}
                >
                  {label}
                </button>
              ))}
              <div className="border-t border-stone-200 mt-3 pt-3">
                {staff ? (
                  <button
                    className="qp-nav-link"
                    onClick={() => {
                      setActiveRole('CUSTOMER');
                      navigate('beranda');
                    }}
                  >
                    Lihat website pelanggan
                  </button>
                ) : (
                  <button className="qp-nav-link" onClick={openStaff}>
                    Masuk sebagai staf
                  </button>
                )}
              </div>
            </div>
          </nav>
        )}
      </header>
      <AdminAuthModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
};

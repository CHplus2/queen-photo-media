import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { 
  Camera, Lock, LogOut, Menu, X, Home, Image, 
  Sparkles, Search, BookOpen, ShoppingBag, Utensils, 
  Package, Calculator, BarChart3, Settings, TrendingUp, RefreshCw, CheckCircle2 
} from 'lucide-react';
import { AdminAuthModal } from './AdminAuthModal';

export const Header: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    setIsOrderModalOpen, 
    activeRole, 
    setActiveRole, 
    isAdminAuthenticated,
    logoutAdmin,
    cart,
    setIsCartOpen,
    setIsSurveyModalOpen,
    seedFirestoreDataNow,
    isSyncing
  } = useStudio();

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  const handleManualSync = async () => {
    setSyncLoading(true);
    await seedFirestoreDataNow();
    setSyncLoading(false);
  };

  const handleAdminToggle = async () => {
    setIsMobileMenuOpen(false);
    if (activeRole === 'ADMIN') {
      await logoutAdmin();
      setCurrentView('beranda');
    } else {
      if (isAdminAuthenticated) {
        setActiveRole('ADMIN');
        setCurrentView('pos');
      } else {
        setIsAdminModalOpen(true);
      }
    }
  };

  const handleNavClick = (view: any) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors w-full overflow-x-clip ${
        activeRole === 'ADMIN'
          ? 'bg-stone-900 border-stone-800 text-stone-100 shadow-md'
          : 'bg-white/95 border-stone-200 text-stone-900'
      }`}>
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-2.5 sm:py-3">
          
          {/* Zone 1: Brand Wordmark & Mode Badge */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink-0">
            <button
              onClick={() => {
                if (activeRole === 'ADMIN') {
                  setCurrentView('pos');
                } else {
                  setCurrentView('beranda');
                }
                setIsMobileMenuOpen(false);
              }}
              className={`text-base sm:text-xl font-bold tracking-tight transition-colors text-left font-serif truncate ${
                activeRole === 'ADMIN' ? 'text-amber-300' : 'text-stone-900 hover:text-amber-800'
              }`}
            >
              <span className="whitespace-nowrap">Queen Photo</span>
              <span className="hidden sm:inline whitespace-nowrap"> Pontianak</span>
            </button>

            {activeRole === 'ADMIN' ? (
              <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-xs">
                <span>👑 Admin</span>
              </span>
            ) : (
              <span className="hidden md:inline-block text-[10px] font-mono text-stone-400 uppercase tracking-widest pl-1">
                Sejak 1980
              </span>
            )}
          </div>

          {/* Zone 2: Navigation Links */}
          {activeRole === 'CUSTOMER' ? (
            /* Customer Desktop Navigation */
            <nav className="hidden lg:flex items-center gap-5 text-sm font-medium">
              <button
                onClick={() => handleNavClick('beranda')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-stone-900 ${
                  currentView === 'beranda' ? 'text-stone-950 font-bold underline underline-offset-8 decoration-stone-900' : 'text-stone-600'
                }`}
              >
                Beranda
              </button>
              <button
                onClick={() => handleNavClick('layanan')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-stone-900 ${
                  currentView === 'layanan' ? 'text-stone-950 font-bold underline underline-offset-8 decoration-stone-900' : 'text-stone-600'
                }`}
              >
                Layanan & Harga
              </button>
              <button
                onClick={() => handleNavClick('trending')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-stone-900 ${
                  currentView === 'trending' ? 'text-stone-950 font-bold underline underline-offset-8 decoration-stone-900' : 'text-stone-600'
                }`}
              >
                Tren Photostrip
              </button>
              <button
                onClick={() => handleNavClick('lacak')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-stone-900 ${
                  currentView === 'lacak' ? 'text-stone-950 font-bold underline underline-offset-8 decoration-stone-900' : 'text-stone-600'
                }`}
              >
                Lacak Pesanan
              </button>
              <button
                onClick={() => handleNavClick('cerita')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-stone-900 ${
                  currentView === 'cerita' ? 'text-stone-950 font-bold underline underline-offset-8 decoration-stone-900' : 'text-stone-600'
                }`}
              >
                Kisah Sejak 1980
              </button>
              <button
                onClick={() => setIsSurveyModalOpen(true)}
                className="transition-colors whitespace-nowrap shrink-0 px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold flex items-center gap-1.5"
                title="Bantu berikan masukan & dapatkan diskon 10%"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Kupon Diskon 10%</span>
              </button>
            </nav>
          ) : (
            /* Admin Desktop Navigation Tabs (Clean Unified Bar, No Duplicates) */
            <nav className="hidden lg:flex items-center gap-1.5 text-xs font-medium overflow-x-auto pb-0.5 scrollbar-none">
              <button
                onClick={() => handleNavClick('pos')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentView === 'pos'
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>1. Kasir & Pesanan</span>
              </button>
              <button
                onClick={() => handleNavClick('menu')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentView === 'menu'
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>2. Kelola Menu</span>
              </button>
              <button
                onClick={() => handleNavClick('inventory')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentView === 'inventory'
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>3. Inventaris Bahan</span>
              </button>
              <button
                onClick={() => handleNavClick('kalkulator')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentView === 'kalkulator'
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>4. Kalkulator Roll</span>
              </button>
              <button
                onClick={() => handleNavClick('rekap')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentView === 'rekap'
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>5. Rekap Omset</span>
              </button>
              <button
                onClick={() => handleNavClick('strategi')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentView === 'strategi'
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>6. Riset Pasar & Feedback</span>
              </button>
              <button
                onClick={() => handleNavClick('settings')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentView === 'settings'
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>7. Pengaturan & 2FA</span>
              </button>
            </nav>
          )}

          {/* Zone 3: Actions (Cart, Sync, Role Switch, Lock) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {activeRole === 'CUSTOMER' ? (
              <>
                {/* Shopping Cart Button with Badge */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  aria-label="Buka Keranjang Belanja"
                  title="Keranjang Belanja"
                  className="relative p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-xl transition-colors border border-stone-200 flex items-center justify-center min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-stone-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-xs animate-in zoom-in">
                      {cart.length}
                    </span>
                  )}
                </button>

                {/* Direct Order Button */}
                <button
                  onClick={() => setIsOrderModalOpen(true)}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-white bg-stone-900 rounded-xl hover:bg-stone-800 transition-colors whitespace-nowrap shadow-xs active:scale-95 min-h-[36px] sm:min-h-[40px]"
                  title="Pesan Foto"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="hidden sm:inline">Pesan Foto</span>
                  <span className="sm:hidden text-[11px]">Pesan</span>
                </button>

                {/* Admin Login Modal Trigger */}
                <button
                  onClick={handleAdminToggle}
                  title="Masuk ke Mode Kasir & Laporan Studio (Admin)"
                  aria-label="Portal Masuk Admin"
                  className="p-1.5 sm:p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors border border-stone-200 min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center shrink-0"
                >
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </>
            ) : (
              /* Admin Top Actions */
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Cloud Sync Button */}
                <button
                  onClick={handleManualSync}
                  disabled={syncLoading || isSyncing}
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium border border-stone-700 transition-colors"
                  title="Sinkronisasi seluruh data ke database Cloud Firestore"
                >
                  <RefreshCw className={`w-3 h-3 ${syncLoading || isSyncing ? 'animate-spin text-amber-400' : 'text-stone-400'}`} />
                  <span className="text-[11px]">{syncLoading || isSyncing ? 'Menyimpan...' : 'Sync Cloud'}</span>
                </button>

                {/* Switch to Customer View */}
                <button
                  onClick={() => {
                    setActiveRole('CUSTOMER');
                    setCurrentView('beranda');
                  }}
                  className="px-2.5 py-1.5 text-amber-300 hover:text-amber-200 text-xs font-medium transition-colors whitespace-nowrap"
                  title="Lihat tampilan website seperti pelanggan"
                >
                  ← Mode Pelanggan
                </button>

                {/* Lock & Logout */}
                <button
                  onClick={handleAdminToggle}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-stone-800 text-stone-300 hover:text-white hover:bg-rose-950 hover:border-rose-800 rounded-lg border border-stone-700 transition-colors whitespace-nowrap"
                  title="Kunci sesi admin dan kembali ke tampilan pelanggan"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
              className={`lg:hidden p-1.5 sm:p-2 rounded-xl transition-colors min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center border shrink-0 ${
                activeRole === 'ADMIN'
                  ? 'text-stone-300 hover:text-white hover:bg-stone-800 border-stone-700'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100 border-stone-200'
              }`}
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
              ) : (
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>

        </div>

        {/* MOBILE SLIDE-DOWN DRAWER */}
        {isMobileMenuOpen && (
          <div className={`lg:hidden border-t px-4 py-4 animate-in slide-in-from-top-2 duration-150 ${
            activeRole === 'ADMIN'
              ? 'bg-stone-900 border-stone-800 text-stone-100 shadow-xl'
              : 'bg-white border-stone-200 text-stone-900 shadow-xl'
          }`}>
            <div className="space-y-1">
              {activeRole === 'CUSTOMER' ? (
                <>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-3 py-1">
                    Navigasi Studio
                  </div>
                  <button
                    onClick={() => handleNavClick('beranda')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                      currentView === 'beranda'
                        ? 'bg-amber-100/70 text-amber-950 font-bold'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Home className="w-4 h-4 text-stone-500" />
                    <span>Beranda</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('layanan')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                      currentView === 'layanan'
                        ? 'bg-amber-100/70 text-amber-950 font-bold'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Image className="w-4 h-4 text-stone-500" />
                    <span>Layanan & Harga Lengkap</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('trending')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                      currentView === 'trending'
                        ? 'bg-amber-100/70 text-amber-950 font-bold'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Tren Photostrip Korean (Gen Z)</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('lacak')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                      currentView === 'lacak'
                        ? 'bg-amber-100/70 text-amber-950 font-bold'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Search className="w-4 h-4 text-stone-500" />
                    <span>Lacak Pesanan Anda</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('cerita')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                      currentView === 'cerita'
                        ? 'bg-amber-100/70 text-amber-950 font-bold'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-stone-500" />
                    <span>Kisah Queen Photo Sejak 1980</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsSurveyModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors min-h-[44px]"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Survei Pasar & Kupon Diskon 10%</span>
                  </button>

                  <div className="pt-3 mt-2 border-t border-stone-100 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsCartOpen(true);
                      }}
                      className="w-full py-3 bg-amber-400 text-stone-950 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-xs min-h-[44px]"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Buka Keranjang Belanja ({cart.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsOrderModalOpen(true);
                      }}
                      className="w-full py-3 bg-stone-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-xs min-h-[44px]"
                    >
                      <Camera className="w-4 h-4 text-amber-300" />
                      <span>Mulai Pesan Cetak Foto</span>
                    </button>

                    <button
                      onClick={handleAdminToggle}
                      className="w-full py-2.5 border border-stone-200 text-stone-600 hover:text-stone-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <Lock className="w-3.5 h-3.5 text-stone-500" />
                      <span>Masuk Portal Admin / Kasir</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 px-3 py-1 flex items-center justify-between">
                    <span>Menu Manajemen Admin</span>
                    <span className="text-[10px] text-stone-400 font-mono">Queen Photo</span>
                  </div>
                  <button
                    onClick={() => handleNavClick('pos')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                      currentView === 'pos'
                        ? 'bg-amber-400 text-stone-950 font-bold'
                        : 'text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>1. Kasir POS & Semua Pesanan</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('menu')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                      currentView === 'menu'
                        ? 'bg-amber-400 text-stone-950 font-bold'
                        : 'text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    <Utensils className="w-4 h-4" />
                    <span>2. Kelola Menu & Layanan</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('inventory')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                      currentView === 'inventory'
                        ? 'bg-amber-400 text-stone-950 font-bold'
                        : 'text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span>3. Inventaris Kertas & Stok</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('kalkulator')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                      currentView === 'kalkulator'
                        ? 'bg-amber-400 text-stone-950 font-bold'
                        : 'text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    <Calculator className="w-4 h-4" />
                    <span>4. Kalkulator Kertas Roll</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('rekap')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                      currentView === 'rekap'
                        ? 'bg-amber-400 text-stone-950 font-bold'
                        : 'text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>5. Rekap Omset & Laporan</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('strategi')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                      currentView === 'strategi'
                        ? 'bg-amber-400 text-stone-950 font-bold'
                        : 'text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>6. Riset Pasar & Feedback</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('settings')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                      currentView === 'settings'
                        ? 'bg-amber-400 text-stone-950 font-bold'
                        : 'text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>7. Pengaturan & Keamanan</span>
                  </button>

                  <div className="pt-3 mt-2 border-t border-stone-800 space-y-2">
                    <button
                      onClick={handleManualSync}
                      disabled={syncLoading || isSyncing}
                      className="w-full py-2.5 bg-stone-800 text-stone-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncLoading || isSyncing ? 'animate-spin text-amber-400' : ''}`} />
                      <span>{syncLoading || isSyncing ? 'Menyimpan ke Cloud...' : 'Tulis Data ke Cloud Firestore'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveRole('CUSTOMER');
                        setCurrentView('beranda');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-2.5 bg-amber-400 text-stone-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <span>← Beralih ke Mode Pelanggan</span>
                    </button>

                    <button
                      onClick={handleAdminToggle}
                      className="w-full py-2.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Kunci & Keluar dari Mode Admin</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Admin Authentication Modal */}
      <AdminAuthModal 
        isOpen={isAdminModalOpen} 
        onClose={() => setIsAdminModalOpen(false)} 
      />
    </>
  );
};

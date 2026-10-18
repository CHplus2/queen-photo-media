import React, { useState, useEffect, useRef } from 'react';
import { StudioProvider, useStudio, AppView } from './context/StudioContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { RestorationShowcase } from './components/RestorationShowcase';
import { ServicesCatalog } from './components/ServicesCatalog';
import { OrderConfiguratorModal } from './components/OrderConfiguratorModal';
import { CartDrawer } from './components/CartDrawer';
import { CustomerSurveyModal } from './components/CustomerSurveyModal';
import { OrderTrackingView } from './components/OrderTrackingView';
import { CustomerTrendingView } from './components/CustomerTrendingView';
import { HeritageStoryView } from './components/HeritageStoryView';
import { MarketStrategyView } from './components/MarketStrategyView';
import { OwnerDashboard } from './components/OwnerDashboard';
import { AdminPosView } from './components/AdminPosView';
import { InventoryView } from './components/InventoryView';
import { AdminMenuView } from './components/AdminMenuView';
import { CostProfitCalculatorView } from './components/CostProfitCalculatorView';
import { SalesAnalyticsView } from './components/SalesAnalyticsView';
import { AdminSettingsView } from './components/AdminSettingsView';
import { ReceiptModal } from './components/ReceiptModal';
import { Footer } from './components/Footer';
import { Order } from './types';
import { formatRupiah } from './utils/formatters';
import { ShoppingBag } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    activeRole,
    setActiveRole,
    cart,
    isCartOpen,
    setIsCartOpen,
  } = useStudio();

  const previousView = useRef(currentView);
  useEffect(() => {
    const titles: Record<string, string> = {
      beranda: 'Studio & cetak foto',
      layanan: 'Layanan & harga',
      trending: 'Photostrip',
      lacak: 'Lacak pesanan',
      cerita: 'Tentang kami',
      pos: 'Kasir',
      orders: 'Pesanan',
      supervision: 'Ringkasan toko',
      rekap: 'Laporan penjualan',
    };
    document.title = `${titles[currentView] || 'Ruang kerja studio'} — Queen Photo`;
    if (previousView.current !== currentView) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.getElementById('main-content')?.focus({ preventScroll: true });
      previousView.current = currentView;
    }
  }, [currentView]);
  const [selectedReceiptOrder, setSelectedReceiptOrder] =
    useState<Order | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Single Unified Header for both Customer & Admin - No Duplicate Navbar! */}
      <Header />

      {/* Main View Router */}
      <main
        id="main-content"
        tabIndex={-1}
        className={`flex-1 outline-none ${activeRole === 'ADMIN' ? 'admin-workspace' : ''}`}
      >
        {/* CUSTOMER VIEWS */}
        {activeRole === 'CUSTOMER' && (
          <>
            {currentView === 'beranda' && (
              <>
                <HeroSection />
                <ServicesCatalog />
                <RestorationShowcase />
              </>
            )}

            {currentView === 'layanan' && <ServicesCatalog />}

            {currentView === 'trending' && <CustomerTrendingView />}

            {currentView === 'lacak' && <OrderTrackingView />}

            {currentView === 'cerita' && <HeritageStoryView />}

            {/* Fallbacks if role switched */}
            {(currentView === 'orders' ||
              currentView === 'supervision' ||
              currentView === 'pos' ||
              currentView === 'menu' ||
              currentView === 'inventory' ||
              currentView === 'kalkulator' ||
              currentView === 'rekap' ||
              currentView === 'settings' ||
              currentView === 'strategi') && (
              <>
                <HeroSection />
                <ServicesCatalog />
                <RestorationShowcase />
              </>
            )}
          </>
        )}

        {/* ADMIN VIEWS */}
        {activeRole === 'ADMIN' && (
          <>
            {currentView === 'pos' && (
              <AdminPosView
                onPrintReceipt={(order) => setSelectedReceiptOrder(order)}
              />
            )}

            {currentView === 'orders' && (
              <AdminPosView
                initialTab="queue"
                onPrintReceipt={(order) => setSelectedReceiptOrder(order)}
              />
            )}
            {currentView === 'supervision' && <OwnerDashboard />}

            {currentView === 'menu' && <AdminMenuView />}

            {currentView === 'inventory' && <InventoryView />}

            {currentView === 'kalkulator' && <CostProfitCalculatorView />}

            {currentView === 'rekap' && <SalesAnalyticsView />}

            {currentView === 'settings' && <AdminSettingsView />}

            {currentView === 'strategi' && <MarketStrategyView />}

            {/* Fallbacks if navigated from customer view */}
            {currentView === 'beranda' && (
              <AdminPosView
                onPrintReceipt={(order) => setSelectedReceiptOrder(order)}
              />
            )}
            {currentView === 'layanan' && <ServicesCatalog />}
            {currentView === 'trending' && <CustomerTrendingView />}
            {currentView === 'lacak' && <OrderTrackingView />}
            {currentView === 'cerita' && <HeritageStoryView />}
          </>
        )}
      </main>

      {/* Floating Cart Button for Customers when items exist */}
      {activeRole === 'CUSTOMER' && cart.length > 0 && !isCartOpen && (
        <aside
          aria-label="Akses keranjang cepat"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-40"
        >
          <button
            onClick={() => setIsCartOpen(true)}
            className="qp-button !rounded-xl !py-4 !px-5 w-full sm:w-auto shadow-lg border border-stone-700 flex gap-4"
          >
            <ShoppingBag size={20} />
            <span className="text-left flex-1">
              <span className="block text-xs text-stone-200">
                {cart.reduce((n, item) => n + item.quantity, 0)} item di
                keranjang
              </span>
              <strong className="text-sm">
                {formatRupiah(
                  cart.reduce(
                    (sum, item) => sum + item.unitPrice * item.quantity,
                    0,
                  ),
                )}
              </strong>
            </span>
            <span className="text-sm pl-4 border-l border-stone-600">
              Lihat keranjang →
            </span>
          </button>
        </aside>
      )}

      {/* Footer */}
      <Footer />
      {activeRole === 'CUSTOMER' && cart.length > 0 && (
        <div aria-hidden="true" className="h-24 bg-stone-950" />
      )}

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <CustomerSurveyModal />
      <OrderConfiguratorModal />
      <ReceiptModal
        order={selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <StudioProvider>
      <MainAppContent />
    </StudioProvider>
  );
}

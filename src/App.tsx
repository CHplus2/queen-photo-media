import { tr } from './i18n/runtime';
import { LanguageProvider, useLanguage } from './i18n/LanguageProvider';
import { PageBoundary } from './components/PageBoundary';
import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { StudioProvider, useStudio, AppView } from './context/StudioContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { RestorationShowcase } from './components/RestorationShowcase';
import { ServicesCatalog } from './components/ServicesCatalog';
import { Footer } from './components/Footer';
import { Order } from './types';
import { formatRupiah } from './utils/formatters';
import { ShoppingBag } from 'lucide-react';

const MarketStrategyView = lazy(() =>
  import('./components/MarketStrategyView').then((module) => ({
    default: module.MarketStrategyView,
  })),
);
const OwnerDashboard = lazy(() =>
  import('./components/OwnerDashboard').then((module) => ({
    default: module.OwnerDashboard,
  })),
);
const AdminPosView = lazy(() =>
  import('./components/AdminPosView').then((module) => ({
    default: module.AdminPosView,
  })),
);
const InventoryView = lazy(() =>
  import('./components/InventoryView').then((module) => ({
    default: module.InventoryView,
  })),
);
const AdminMenuView = lazy(() =>
  import('./components/AdminMenuView').then((module) => ({
    default: module.AdminMenuView,
  })),
);
const CostProfitCalculatorView = lazy(() =>
  import('./components/CostProfitCalculatorView').then((module) => ({
    default: module.CostProfitCalculatorView,
  })),
);
const SalesAnalyticsView = lazy(() =>
  import('./components/SalesAnalyticsView').then((module) => ({
    default: module.SalesAnalyticsView,
  })),
);
const AdminSettingsView = lazy(() =>
  import('./components/AdminSettingsView').then((module) => ({
    default: module.AdminSettingsView,
  })),
);
const ReceiptModal = lazy(() =>
  import('./components/ReceiptModal').then((module) => ({
    default: module.ReceiptModal,
  })),
);
const OrderTrackingView = lazy(() =>
  import('./components/OrderTrackingView').then((module) => ({
    default: module.OrderTrackingView,
  })),
);
const CustomerTrendingView = lazy(() =>
  import('./components/CustomerTrendingView').then((module) => ({
    default: module.CustomerTrendingView,
  })),
);
const HeritageStoryView = lazy(() =>
  import('./components/HeritageStoryView').then((module) => ({
    default: module.HeritageStoryView,
  })),
);
const CustomerSurveyModal = lazy(() =>
  import('./components/CustomerSurveyModal').then((module) => ({
    default: module.CustomerSurveyModal,
  })),
);
const OrderConfiguratorModal = lazy(() =>
  import('./components/OrderConfiguratorModal').then((module) => ({
    default: module.OrderConfiguratorModal,
  })),
);
const CartDrawer = lazy(() =>
  import('./components/CartDrawer').then((module) => ({
    default: module.CartDrawer,
  })),
);

const MainAppContent: React.FC = () => {
  const { language } = useLanguage();
  const {
    currentView,
    isSupervisor,
    isAdminAuthenticated,
    setCurrentView,
    activeRole,
    setActiveRole,
    cart,
    isCartOpen,
    isSurveyModalOpen,
    isOrderModalOpen,
    setIsCartOpen,
  } = useStudio();

  useEffect(() => {
    if (
      activeRole === 'ADMIN' &&
      !isSupervisor &&
      [
        'menu',
        'inventory',
        'kalkulator',
        'rekap',
        'settings',
        'strategi',
      ].includes(currentView)
    )
      setCurrentView('pos');
  }, [activeRole, isSupervisor, currentView, setCurrentView]);
  const [openedDialogs, setOpenedDialogs] = useState({
    cart: false,
    survey: false,
    order: false,
  });
  useEffect(() => {
    setOpenedDialogs((previous) => ({
      cart: previous.cart || !!isCartOpen,
      survey: previous.survey || !!isSurveyModalOpen,
      order: previous.order || !!isOrderModalOpen,
    }));
  }, [isCartOpen, isSurveyModalOpen, isOrderModalOpen]);
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
    document.title = `${tr(titles[currentView] || 'Ruang kerja studio')} — Queen Photo`;
    if (previousView.current !== currentView) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.getElementById('main-content')?.focus({ preventScroll: true });
      previousView.current = currentView;
    }
  }, [currentView, language]);
  const [selectedReceiptOrder, setSelectedReceiptOrder] =
    useState<Order | null>(null);

  useEffect(() => {
    if (!isAdminAuthenticated) setSelectedReceiptOrder(null);
  }, [isAdminAuthenticated]);

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
        <Suspense
          fallback={
            <p role="status" className="qp-container py-8">
              {tr('Memuat halaman…')}
            </p>
          }
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

              {isSupervisor && currentView === 'menu' && <AdminMenuView />}

              {isSupervisor && currentView === 'inventory' && <InventoryView />}

              {isSupervisor && currentView === 'kalkulator' && (
                <CostProfitCalculatorView />
              )}

              {isSupervisor && currentView === 'rekap' && (
                <SalesAnalyticsView />
              )}

              {isSupervisor && currentView === 'settings' && (
                <AdminSettingsView />
              )}

              {isSupervisor && currentView === 'strategi' && (
                <MarketStrategyView />
              )}

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
        </Suspense>
      </main>

      {/* Floating Cart Button for Customers when items exist */}
      {activeRole === 'CUSTOMER' && cart.length > 0 && !isCartOpen && (
        <aside
          aria-label={tr('Akses keranjang cepat')}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-40"
        >
          <button
            onClick={() => setIsCartOpen(true)}
            className="qp-button !rounded-xl !py-4 !px-5 w-full sm:w-auto shadow-lg border border-stone-700 flex gap-4"
          >
            <ShoppingBag size={20} />
            <span className="text-left flex-1">
              <span className="block text-xs text-stone-200">
                {cart.reduce((n, item) => n + item.quantity, 0)}{' '}
                {tr('item di keranjang')}
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
              {tr('Lihat keranjang →')}
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
      <Suspense
        fallback={
          <p role="status" className="qp-notice fixed bottom-4 right-4 z-50">
            {tr('Memuat formulir…')}
          </p>
        }
      >
        {(isCartOpen || openedDialogs.cart) && <CartDrawer />}
        {(isSurveyModalOpen || openedDialogs.survey) && <CustomerSurveyModal />}
        {(isOrderModalOpen || openedDialogs.order) && (
          <OrderConfiguratorModal />
        )}
        {isAdminAuthenticated && selectedReceiptOrder && (
          <ReceiptModal
            order={selectedReceiptOrder}
            onClose={() => setSelectedReceiptOrder(null)}
          />
        )}
      </Suspense>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <StudioProvider>
        <PageBoundary>
          <MainAppContent />
        </PageBoundary>
      </StudioProvider>
    </LanguageProvider>
  );
}

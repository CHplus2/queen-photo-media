import React, { useState } from 'react';
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
    setIsCartOpen
  } = useStudio();
  
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      
      {/* Single Unified Header for both Customer & Admin - No Duplicate Navbar! */}
      <Header />

      {/* Main View Router */}
      <main className="flex-1">
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

            {currentView === 'layanan' && (
              <ServicesCatalog />
            )}

            {currentView === 'trending' && (
              <CustomerTrendingView />
            )}

            {currentView === 'lacak' && (
              <OrderTrackingView />
            )}

            {currentView === 'cerita' && (
              <HeritageStoryView />
            )}

            {/* Fallbacks if role switched */}
            {(currentView === 'pos' || currentView === 'menu' || currentView === 'inventory' || currentView === 'kalkulator' || currentView === 'rekap' || currentView === 'settings' || currentView === 'strategi') && (
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
              <AdminPosView onPrintReceipt={(order) => setSelectedReceiptOrder(order)} />
            )}

            {currentView === 'menu' && (
              <AdminMenuView />
            )}

            {currentView === 'inventory' && (
              <InventoryView />
            )}

            {currentView === 'kalkulator' && (
              <CostProfitCalculatorView />
            )}

            {currentView === 'rekap' && (
              <SalesAnalyticsView />
            )}

            {currentView === 'settings' && (
              <AdminSettingsView />
            )}

            {currentView === 'strategi' && (
              <MarketStrategyView />
            )}

            {/* Fallbacks if navigated from customer view */}
            {currentView === 'beranda' && (
              <AdminPosView onPrintReceipt={(order) => setSelectedReceiptOrder(order)} />
            )}
            {currentView === 'layanan' && (
              <ServicesCatalog />
            )}
            {currentView === 'trending' && (
              <CustomerTrendingView />
            )}
            {currentView === 'lacak' && (
              <OrderTrackingView />
            )}
            {currentView === 'cerita' && (
              <HeritageStoryView />
            )}
          </>
        )}
      </main>

      {/* Floating Cart Button for Customers when items exist */}
      {activeRole === 'CUSTOMER' && cart.length > 0 && !isCartOpen && (
        <aside aria-label="Akses Keranjang Cepat" className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-stone-700 animate-in slide-in-from-bottom-4 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Buka Keranjang Belanja & Checkout"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <span className="absolute -top-2 -right-2 bg-amber-500 text-stone-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                {cart.length}
              </span>
            </div>
            <div className="text-left text-xs">
              <p className="font-bold text-amber-300">Keranjang ({cart.length} item)</p>
              <p className="font-mono text-stone-300 text-[11px]">
                {formatRupiah(cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0))}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-stone-950 font-bold text-xs ml-1 flex items-center gap-1">
              Checkout →
            </span>
          </button>
        </aside>
      )}

      {/* Footer */}
      <Footer />

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

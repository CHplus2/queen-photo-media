import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Order, 
  OrderItem,
  ServiceItem, 
  RollPaperConfig, 
  SheetPaperConfig, 
  OrderStatus,
  OrderChannel,
  UserRole,
  InventoryItem,
  StockLog,
  CustomerFeedbackSurvey 
} from '../types';
import { 
  INITIAL_ORDERS, 
  INITIAL_SERVICES, 
  INITIAL_ROLL_CONFIGS, 
  INITIAL_SHEET_CONFIGS,
  INITIAL_INVENTORY,
  INITIAL_STOCK_LOGS,
  INITIAL_SURVEYS 
} from '../data/initialData';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  updatePassword, 
  onAuthStateChanged, 
  User, 
  EmailAuthProvider, 
  reauthenticateWithCredential 
} from 'firebase/auth';
import * as OTPAuth from 'otpauth';

export type AppView = 
  | 'beranda' 
  | 'layanan' 
  | 'trending'
  | 'lacak' 
  | 'cerita' 
  | 'pos' 
  | 'menu'
  | 'inventory'
  | 'kalkulator' 
  | 'rekap'
  | 'strategi'
  | 'settings';

interface StudioContextType {
  orders: Order[];
  services: ServiceItem[];
  rollConfigs: RollPaperConfig[];
  sheetConfigs: SheetPaperConfig[];
  inventory: InventoryItem[];
  stockLogs: StockLog[];
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (auth: boolean) => void;
  selectedServiceForOrder: ServiceItem | null;
  setSelectedServiceForOrder: (service: ServiceItem | null) => void;
  isOrderModalOpen: boolean;
  setIsOrderModalOpen: (open: boolean) => void;
  activeTrackingId: string;
  setActiveTrackingId: (id: string) => void;
  addOrder: (newOrder: Omit<Order, 'id' | 'createdAt'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateOrderPayment: (orderId: string, paymentStatus: 'BELUM_BAYAR' | 'LUNAS') => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  restockItem: (itemId: string, addedAmount: number, reason: string, newMaxCapacity?: number) => void;
  updateRollConfig: (id: string, updated: Partial<RollPaperConfig>) => void;
  updateSheetConfig: (id: string, updated: Partial<SheetPaperConfig>) => void;
  openOrderWithService: (service: ServiceItem) => void;
  monthlyRevenueTarget: number;
  setMonthlyRevenueTarget: (val: number) => void;

  // Shopping Cart (Multi-Service / Multi-Product Order)
  cart: OrderItem[];
  addToCart: (item: OrderItem) => void;
  addServiceDirectlyToCart: (service: ServiceItem, qty?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, qty: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Customer Feedback & Market Research
  surveys: CustomerFeedbackSurvey[];
  submitSurvey: (survey: Omit<CustomerFeedbackSurvey, 'id' | 'createdAt'>) => Promise<string>;
  isSurveyModalOpen: boolean;
  setIsSurveyModalOpen: (open: boolean) => void;
  
  // Menu Management
  addService: (newService: Omit<ServiceItem, 'id'>) => Promise<ServiceItem>;
  updateService: (id: string, updated: Partial<ServiceItem>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  resetServicesToDefault: () => Promise<void>;

  // Authentication & 2FA
  firebaseUser: User | null;
  adminEmail: string;
  setAdminEmail: (email: string) => void;
  adminPassword: string;
  loginWithFirebaseAuth: (email: string, pass: string) => Promise<{ requires2FA: boolean }>;
  registerAdminWithFirebaseAuth: (email: string, pass: string) => Promise<void>;
  logoutAdmin: () => Promise<void>;
  changeAdminPassword: (newPass: string) => Promise<void>;
  triggerPasswordReset: (email: string) => Promise<string>;
  resetTwoFactorEmergency: () => Promise<void>;
  
  // Real 3rd-party Authenticator (2FA TOTP)
  isTwoFactorEnabled: boolean;
  twoFactorSecret: string;
  verifyTotpCode: (code: string, secretOverride?: string) => boolean;
  enableTwoFactor: (secret: string, testCode: string) => Promise<{ success: boolean; message: string }>;
  disableTwoFactor: () => Promise<void>;
  getOtpAuthUri: (secretStr?: string) => string;
  generateNewTwoFactorSecret: () => string;

  isSyncing: boolean;
  isFirebaseConnected: boolean;
  seedFirestoreDataNow: () => Promise<void>;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always initialize with cached or INITIAL_ORDERS so the table is NEVER blank!
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('queen_photo_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_ORDERS;
  });

  // Services / Menu Items State
  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem('queen_photo_services');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_SERVICES;
  });
  
  const [rollConfigs, setRollConfigs] = useState<RollPaperConfig[]>(() => {
    try {
      const saved = localStorage.getItem('queen_photo_roll_configs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ROLL_CONFIGS;
  });

  const [sheetConfigs, setSheetConfigs] = useState<SheetPaperConfig[]>(() => {
    try {
      const saved = localStorage.getItem('queen_photo_sheet_configs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SHEET_CONFIGS;
  });

  // Inventory & Stock Tracking
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('queen_photo_inventory');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_INVENTORY;
  });

  const [stockLogs, setStockLogs] = useState<StockLog[]>(() => {
    try {
      const saved = localStorage.getItem('queen_photo_stock_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_STOCK_LOGS;
  });

  // Admin Account & Credentials
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    const saved = localStorage.getItem('queen_photo_admin_email');
    if (saved && saved !== 'heroch94@gmail.com') return saved;
    return 'queenphotomedia@gmail.com';
  });
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    const saved = localStorage.getItem('queen_photo_admin_password');
    if (saved && saved !== 'QueenPhoto1980!') return saved;
    return 'QueenPhoto1980';
  });

  // 2FA Google Authenticator State (RFC 6238 Base32 Secret)
  const [twoFactorSecret, setTwoFactorSecret] = useState<string>(() => {
    return localStorage.getItem('queen_2fa_secret') || 'JBSWY3DPEHPK3PXP';
  });
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState<boolean>(() => {
    return localStorage.getItem('queen_2fa_enabled') === 'true';
  });

  // Role Separation
  const [activeRole, setActiveRole] = useState<UserRole>('CUSTOMER');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('queen_admin_auth') === 'true';
  });

  const [currentView, setCurrentView] = useState<AppView>('beranda');
  const [selectedServiceForOrder, setSelectedServiceForOrder] = useState<ServiceItem | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [activeTrackingId, setActiveTrackingId] = useState('');
  const [monthlyRevenueTarget, setMonthlyRevenueTarget] = useState(30000000);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Shopping Cart State
  const [cart, setCart] = useState<OrderItem[]>(() => {
    try {
      const saved = localStorage.getItem('queen_photo_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Customer Feedback Surveys State
  const [surveys, setSurveys] = useState<CustomerFeedbackSurvey[]>(() => {
    try {
      const saved = localStorage.getItem('queen_photo_surveys');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_SURVEYS;
  });
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);

  // Sync state to LocalStorage as reliable cache
  useEffect(() => {
    localStorage.setItem('queen_photo_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('queen_photo_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('queen_photo_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('queen_photo_stock_logs', JSON.stringify(stockLogs));
  }, [stockLogs]);

  useEffect(() => {
    localStorage.setItem('queen_photo_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('queen_photo_surveys', JSON.stringify(surveys));
  }, [surveys]);

  // Realtime Firestore sync for Customer Surveys
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      const surveysColRef = collection(db, 'customer_surveys');
      unsubscribe = onSnapshot(
        surveysColRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: CustomerFeedbackSurvey[] = [];
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data() as CustomerFeedbackSurvey);
            });
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setSurveys(list);
          }
        },
        () => {}
      );
    } catch {}
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    sessionStorage.setItem('queen_admin_auth', isAdminAuthenticated ? 'true' : 'false');
  }, [isAdminAuthenticated]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (usr) => {
      setFirebaseUser(usr);
      if (usr && usr.email) {
        setAdminEmail(usr.email);
        localStorage.setItem('queen_photo_admin_email', usr.email);
      }
    });
    return () => unsubAuth();
  }, []);

  // Connect to Firestore Orders in Real-Time
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      const ordersColRef = collection(db, 'orders');
      unsubscribe = onSnapshot(
        ordersColRef,
        (snapshot) => {
          setIsFirebaseConnected(true);

          if (!snapshot.empty) {
            const firestoreOrders: Order[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as Order;
              firestoreOrders.push({
                ...data,
                id: docSnap.id,
              });
            });

            firestoreOrders.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setOrders(firestoreOrders);
          } else {
            // If firestore is empty, seed initial orders
            INITIAL_ORDERS.forEach(async (initOrd) => {
              try {
                await setDoc(doc(db, 'orders', initOrd.id), initOrd);
              } catch {}
            });
          }
        },
        (error) => {
          console.warn('Firestore subscription fallback:', error);
          setIsFirebaseConnected(false);
        }
      );
    } catch (err) {
      console.warn('Firestore initialization fallback:', err);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Connect to Firestore Services / Menu Items in Real-Time
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      const servicesColRef = collection(db, 'services');
      unsubscribe = onSnapshot(
        servicesColRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const firestoreServices: ServiceItem[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as ServiceItem;
              firestoreServices.push({
                ...data,
                id: docSnap.id,
              });
            });
            setServices(firestoreServices);
          } else {
            // Seed initial services into Firestore
            INITIAL_SERVICES.forEach(async (initSvc) => {
              try {
                await setDoc(doc(db, 'services', initSvc.id), initSvc);
              } catch {}
            });
          }
        },
        (error) => {
          console.warn('Firestore services subscription note:', error);
        }
      );
    } catch (err) {
      console.warn('Firestore services initialization note:', err);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Load 2FA status from Firestore admin profile if available
  useEffect(() => {
    try {
      const adminDocRef = doc(db, 'admins', 'heroch94');
      const unsub = onSnapshot(adminDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (typeof data.isTwoFactorEnabled === 'boolean') {
            setIsTwoFactorEnabled(data.isTwoFactorEnabled);
            localStorage.setItem('queen_2fa_enabled', String(data.isTwoFactorEnabled));
          }
          if (data.twoFactorSecret) {
            setTwoFactorSecret(data.twoFactorSecret);
            localStorage.setItem('queen_2fa_secret', data.twoFactorSecret);
          }
        }
      });
      return () => unsub();
    } catch {}
  }, []);

  // INVENTORY ENGINE: Deduct stock based on order items
  const deductStockForOrder = (order: Order, isManualWalkin = false) => {
    setInventory(prevInv => {
      const newInv = [...prevInv];
      const newLogs: StockLog[] = [];

      order.items.forEach(item => {
        // Roll deduction (Minilab 6" 15.2cm):
        if (item.serviceId === 'cetak-4r') {
          const usedMeters = Number((0.102 * item.quantity).toFixed(2));
          const rollIndex = newInv.findIndex(i => i.id === 'inv-roll-minilab-6inch');
          if (rollIndex !== -1) {
            const prev = newInv[rollIndex].currentStock;
            const updated = Math.max(0, Number((prev - usedMeters).toFixed(2)));
            newInv[rollIndex] = { ...newInv[rollIndex], currentStock: updated };
            newLogs.push({
              id: `log-${Date.now()}-${Math.random()}`,
              timestamp: new Date().toISOString(),
              itemId: newInv[rollIndex].id,
              itemName: newInv[rollIndex].name,
              changeAmount: -usedMeters,
              previousStock: prev,
              newStock: updated,
              reason: `${item.quantity}x Cetak 4R #${order.id} (${usedMeters}m dipotong mesin)`,
              orderId: order.id,
            });
          }
        } else if (item.serviceId === 'photostrip-korean-2x6') {
          const usedMeters = Number((0.051 * item.quantity).toFixed(2));
          const rollIndex = newInv.findIndex(i => i.id === 'inv-roll-minilab-6inch');
          if (rollIndex !== -1) {
            const prev = newInv[rollIndex].currentStock;
            const updated = Math.max(0, Number((prev - usedMeters).toFixed(2)));
            newInv[rollIndex] = { ...newInv[rollIndex], currentStock: updated };
            newLogs.push({
              id: `log-${Date.now()}-${Math.random()}`,
              timestamp: new Date().toISOString(),
              itemId: newInv[rollIndex].id,
              itemName: newInv[rollIndex].name,
              changeAmount: -usedMeters,
              previousStock: prev,
              newStock: updated,
              reason: `${item.quantity}x Photostrip Korean #${order.id} (${usedMeters}m dipotong)`,
              orderId: order.id,
            });
          }
        } else if (item.serviceId === 'paket-polaroid-mini') {
          const usedMeters = Number((0.089 * item.quantity).toFixed(2));
          const rollIndex = newInv.findIndex(i => i.id === 'inv-roll-minilab-6inch');
          if (rollIndex !== -1) {
            const prev = newInv[rollIndex].currentStock;
            const updated = Math.max(0, Number((prev - usedMeters).toFixed(2)));
            newInv[rollIndex] = { ...newInv[rollIndex], currentStock: updated };
            newLogs.push({
              id: `log-${Date.now()}-${Math.random()}`,
              timestamp: new Date().toISOString(),
              itemId: newInv[rollIndex].id,
              itemName: newInv[rollIndex].name,
              changeAmount: -usedMeters,
              previousStock: prev,
              newStock: updated,
              reason: `${item.quantity}x Polaroid Mini #${order.id} (${usedMeters}m roll)`,
              orderId: order.id,
            });
          }
        } else if (item.serviceId === 'cetak-16r-bingkai') {
          const usedMeters = Number((0.40 * item.quantity).toFixed(2));
          const canvasIndex = newInv.findIndex(i => i.id === 'inv-roll-canvas-plotter');
          if (canvasIndex !== -1) {
            const prev = newInv[canvasIndex].currentStock;
            const updated = Math.max(0, Number((prev - usedMeters).toFixed(2)));
            newInv[canvasIndex] = { ...newInv[canvasIndex], currentStock: updated };
            newLogs.push({
              id: `log-${Date.now()}-${Math.random()}`,
              timestamp: new Date().toISOString(),
              itemId: newInv[canvasIndex].id,
              itemName: newInv[canvasIndex].name,
              changeAmount: -usedMeters,
              previousStock: prev,
              newStock: updated,
              reason: `${item.quantity}x Cetak 16R Kanvas #${order.id} (${usedMeters}m plotter roll)`,
              orderId: order.id,
            });
          }
        } else if (item.category === 'pas_foto') {
          const usedSheets = Math.ceil(item.quantity / 4);
          const sheetIndex = newInv.findIndex(i => i.id === 'inv-sheet-a4-lustre');
          if (sheetIndex !== -1) {
            const prev = newInv[sheetIndex].currentStock;
            const updated = Math.max(0, prev - usedSheets);
            newInv[sheetIndex] = { ...newInv[sheetIndex], currentStock: updated };
            newLogs.push({
              id: `log-${Date.now()}-${Math.random()}`,
              timestamp: new Date().toISOString(),
              itemId: newInv[sheetIndex].id,
              itemName: newInv[sheetIndex].name,
              changeAmount: -usedSheets,
              previousStock: prev,
              newStock: updated,
              reason: `${item.quantity}x Pas Foto #${order.id} (${usedSheets} lembar A4 Silk)`,
              orderId: order.id,
            });
          }
        } else if (item.serviceId === 'mug-custom-sublim') {
          const mugIndex = newInv.findIndex(i => i.id === 'inv-mug-coating-putih');
          if (mugIndex !== -1) {
            const prev = newInv[mugIndex].currentStock;
            const updated = Math.max(0, prev - item.quantity);
            newInv[mugIndex] = { ...newInv[mugIndex], currentStock: updated };
            newLogs.push({
              id: `log-${Date.now()}-${Math.random()}`,
              timestamp: new Date().toISOString(),
              itemId: newInv[mugIndex].id,
              itemName: newInv[mugIndex].name,
              changeAmount: -item.quantity,
              previousStock: prev,
              newStock: updated,
              reason: `${item.quantity}x Mug Sublimasi #${order.id}`,
              orderId: order.id,
            });
          }
        }

        if (item.frame && item.frame.includes('Minimalis Hitam')) {
          const frameIndex = newInv.findIndex(i => i.id === 'inv-frame-minimalis-10r');
          if (frameIndex !== -1) {
            const prev = newInv[frameIndex].currentStock;
            const updated = Math.max(0, prev - item.quantity);
            newInv[frameIndex] = { ...newInv[frameIndex], currentStock: updated };
            newLogs.push({
              id: `log-${Date.now()}-${Math.random()}`,
              timestamp: new Date().toISOString(),
              itemId: newInv[frameIndex].id,
              itemName: newInv[frameIndex].name,
              changeAmount: -item.quantity,
              previousStock: prev,
              newStock: updated,
              reason: `${item.quantity}x Bingkai Minimalis Hitam #${order.id}`,
              orderId: order.id,
            });
          }
        }
      });

      if (newLogs.length > 0) {
        setStockLogs(prev => [...newLogs, ...prev]);
        newLogs.forEach(async (log) => {
          try {
            await setDoc(doc(db, 'stock_logs', log.id), log);
          } catch {}
        });
      }

      newInv.forEach(async (invItem) => {
        try {
          await setDoc(doc(db, 'inventory', invItem.id), invItem);
        } catch {}
      });

      return newInv;
    });
  };

  // RESTORE STOCK: When order is cancelled
  const restoreStockForOrder = (order: Order) => {
    setInventory(prevInv => {
      const newInv = [...prevInv];
      const newLogs: StockLog[] = [];

      order.items.forEach(item => {
        if (item.serviceId === 'cetak-4r') {
          const usedMeters = Number((0.102 * item.quantity).toFixed(2));
          const rollIndex = newInv.findIndex(i => i.id === 'inv-roll-minilab-6inch');
          if (rollIndex !== -1) {
            const prev = newInv[rollIndex].currentStock;
            const updated = Number((prev + usedMeters).toFixed(2));
            newInv[rollIndex] = { ...newInv[rollIndex], currentStock: updated };
            newLogs.push({
              id: `log-restore-${Date.now()}-${Math.random()}`,
              timestamp: new Date().toISOString(),
              itemId: newInv[rollIndex].id,
              itemName: newInv[rollIndex].name,
              changeAmount: +usedMeters,
              previousStock: prev,
              newStock: updated,
              reason: `Batal Pesanan #${order.id}: Kembalikan ${usedMeters}m kertas roll`,
              orderId: order.id,
            });
          }
        } else if (item.serviceId === 'photostrip-korean-2x6') {
          const usedMeters = Number((0.051 * item.quantity).toFixed(2));
          const rollIndex = newInv.findIndex(i => i.id === 'inv-roll-minilab-6inch');
          if (rollIndex !== -1) {
            const prev = newInv[rollIndex].currentStock;
            const updated = Number((prev + usedMeters).toFixed(2));
            newInv[rollIndex] = { ...newInv[rollIndex], currentStock: updated };
            newLogs.push({
              id: `log-restore-${Date.now()}-${Math.random()}`,
              timestamp: new Date().toISOString(),
              itemId: newInv[rollIndex].id,
              itemName: newInv[rollIndex].name,
              changeAmount: +usedMeters,
              previousStock: prev,
              newStock: updated,
              reason: `Batal Pesanan #${order.id}: Kembalikan ${usedMeters}m photostrip`,
              orderId: order.id,
            });
          }
        } else if (item.serviceId === 'paket-polaroid-mini') {
          const usedMeters = Number((0.089 * item.quantity).toFixed(2));
          const rollIndex = newInv.findIndex(i => i.id === 'inv-roll-minilab-6inch');
          if (rollIndex !== -1) {
            const prev = newInv[rollIndex].currentStock;
            const updated = Number((prev + usedMeters).toFixed(2));
            newInv[rollIndex] = { ...newInv[rollIndex], currentStock: updated };
            newLogs.push({
              id: `log-restore-${Date.now()}-${Math.random()}`,
              timestamp: new Date().toISOString(),
              itemId: newInv[rollIndex].id,
              itemName: newInv[rollIndex].name,
              changeAmount: +usedMeters,
              previousStock: prev,
              newStock: updated,
              reason: `Batal Pesanan #${order.id}: Kembalikan ${usedMeters}m polaroid`,
              orderId: order.id,
            });
          }
        } else if (item.serviceId === 'cetak-16r-bingkai') {
          const usedMeters = Number((0.40 * item.quantity).toFixed(2));
          const canvasIndex = newInv.findIndex(i => i.id === 'inv-roll-canvas-plotter');
          if (canvasIndex !== -1) {
            const prev = newInv[canvasIndex].currentStock;
            const updated = Number((prev + usedMeters).toFixed(2));
            newInv[canvasIndex] = { ...newInv[canvasIndex], currentStock: updated };
            newLogs.push({
              id: `log-restore-${Date.now()}-${Math.random()}`,
              timestamp: new Date().toISOString(),
              itemId: newInv[canvasIndex].id,
              itemName: newInv[canvasIndex].name,
              changeAmount: +usedMeters,
              previousStock: prev,
              newStock: updated,
              reason: `Batal Pesanan #${order.id}: Kembalikan ${usedMeters}m kanvas plotter`,
              orderId: order.id,
            });
          }
        } else if (item.category === 'pas_foto') {
          const usedSheets = Math.ceil(item.quantity / 4);
          const sheetIndex = newInv.findIndex(i => i.id === 'inv-sheet-a4-lustre');
          if (sheetIndex !== -1) {
            const prev = newInv[sheetIndex].currentStock;
            const updated = prev + usedSheets;
            newInv[sheetIndex] = { ...newInv[sheetIndex], currentStock: updated };
            newLogs.push({
              id: `log-restore-${Date.now()}-${Math.random()}`,
              timestamp: new Date().toISOString(),
              itemId: newInv[sheetIndex].id,
              itemName: newInv[sheetIndex].name,
              changeAmount: +usedSheets,
              previousStock: prev,
              newStock: updated,
              reason: `Batal Pesanan #${order.id}: Kembalikan ${usedSheets} lembar A4 Silk`,
              orderId: order.id,
            });
          }
        } else if (item.serviceId === 'mug-custom-sublim') {
          const mugIndex = newInv.findIndex(i => i.id === 'inv-mug-coating-putih');
          if (mugIndex !== -1) {
            const prev = newInv[mugIndex].currentStock;
            const updated = prev + item.quantity;
            newInv[mugIndex] = { ...newInv[mugIndex], currentStock: updated };
            newLogs.push({
              id: `log-restore-${Date.now()}-${Math.random()}`,
              timestamp: new Date().toISOString(),
              itemId: newInv[mugIndex].id,
              itemName: newInv[mugIndex].name,
              changeAmount: +item.quantity,
              previousStock: prev,
              newStock: updated,
              reason: `Batal Pesanan #${order.id}: Kembalikan ${item.quantity} mug`,
              orderId: order.id,
            });
          }
        }

        if (item.frame && item.frame.includes('Minimalis Hitam')) {
          const frameIndex = newInv.findIndex(i => i.id === 'inv-frame-minimalis-10r');
          if (frameIndex !== -1) {
            const prev = newInv[frameIndex].currentStock;
            const updated = prev + item.quantity;
            newInv[frameIndex] = { ...newInv[frameIndex], currentStock: updated };
            newLogs.push({
              id: `log-restore-${Date.now()}-${Math.random()}`,
              timestamp: new Date().toISOString(),
              itemId: newInv[frameIndex].id,
              itemName: newInv[frameIndex].name,
              changeAmount: +item.quantity,
              previousStock: prev,
              newStock: updated,
              reason: `Batal Pesanan #${order.id}: Kembalikan ${item.quantity} bingkai`,
              orderId: order.id,
            });
          }
        }
      });

      if (newLogs.length > 0) {
        setStockLogs(prev => [...newLogs, ...prev]);
        newLogs.forEach(async (log) => {
          try {
            await setDoc(doc(db, 'stock_logs', log.id), log);
          } catch {}
        });
      }

      newInv.forEach(async (invItem) => {
        try {
          await setDoc(doc(db, 'inventory', invItem.id), invItem);
        } catch {}
      });

      return newInv;
    });
  };

  // RESTOCK ITEM MANUALLY (Admin) - Supports updating the denominator / target capacity
  const restockItem = (itemId: string, addedAmount: number, reason: string, newMaxCapacity?: number) => {
    setInventory(prevInv => {
      const newInv = prevInv.map(item => {
        if (item.id === itemId) {
          const prev = item.currentStock;
          const updatedStock = Number((prev + addedAmount).toFixed(2));
          
          // Compute denominator: user specified target, or expanded to accommodate the new stock
          let updatedMaxStock = item.maxStock;
          if (newMaxCapacity && newMaxCapacity > 0) {
            updatedMaxStock = newMaxCapacity;
          } else if (updatedStock > item.maxStock) {
            updatedMaxStock = updatedStock;
          }

          const log: StockLog = {
            id: `log-restock-${Date.now()}`,
            timestamp: new Date().toISOString(),
            itemId: item.id,
            itemName: item.name,
            changeAmount: addedAmount,
            previousStock: prev,
            newStock: updatedStock,
            reason: reason || 'Restock pengadaan bahan baru',
          };
          setStockLogs(prevLogs => [log, ...prevLogs]);
          setDoc(doc(db, 'stock_logs', log.id), log).catch(() => {});
          const updatedItem = { 
            ...item, 
            currentStock: updatedStock,
            maxStock: updatedMaxStock
          };
          setDoc(doc(db, 'inventory', updatedItem.id), updatedItem).catch(() => {});
          return updatedItem;
        }
        return item;
      });
      return newInv;
    });
  };

  // CART ACTIONS
  const addToCart = (item: OrderItem) => {
    setCart(prev => [...prev, item]);
  };

  const addServiceDirectlyToCart = (service: ServiceItem, qty: number = 1) => {
    const defaultSize = service.options?.sizes?.[0] || service.unit || 'Standar';
    const defaultFinish = service.options?.finishes?.[0] || 'Glossy Anti-Luntur';
    const defaultFrame = service.options?.frames?.[0] || 'Tanpa Bingkai';
    const defaultBg = service.options?.backgroundColors?.[0] || (service.category === 'pas_foto' ? 'Merah (Tahun Ganjil KTP)' : undefined);

    let price = service.basePrice;
    let cost = service.estimatedCost;

    if (defaultFrame === 'Minimalis Hitam' || defaultFrame === 'Minimalis Putih') {
      price += 25000;
      cost += 12000;
    }

    const item: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      size: defaultSize,
      finish: defaultFinish,
      frame: defaultFrame !== 'Tanpa Bingkai' ? defaultFrame : undefined,
      backgroundColor: defaultBg,
      quantity: qty,
      unitPrice: price,
      unitCost: cost,
    };

    setCart(prev => [...prev, item]);
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateCartItemQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => {
    setCart([]);
  };

  // SURVEY SUBMISSION
  const submitSurvey = async (surveyData: Omit<CustomerFeedbackSurvey, 'id' | 'createdAt'>): Promise<string> => {
    const discountCode = 'QUEEN10HEMAT';
    const newSurvey: CustomerFeedbackSurvey = {
      ...surveyData,
      id: `survey-${Date.now()}`,
      createdAt: new Date().toISOString(),
      claimedDiscountCode: discountCode,
    };

    setSurveys(prev => [newSurvey, ...prev]);
    try {
      await setDoc(doc(db, 'customer_surveys', newSurvey.id), newSurvey);
    } catch {}

    return discountCode;
  };

  // Helper to remove any undefined values before writing to Firestore
  const cleanForFirestore = (obj: any): any => {
    return JSON.parse(JSON.stringify(obj, (_, value) => {
      if (value === undefined) return null;
      return value;
    }));
  };

  // MENU MANAGEMENT ACTIONS
  const addService = async (newService: Omit<ServiceItem, 'id'>): Promise<ServiceItem> => {
    const slug = newService.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || 'service';
    const id = `${slug}-${Date.now().toString().slice(-4)}`;
    
    const fullService: ServiceItem = {
      ...newService,
      id,
      isActive: newService.isActive ?? true,
    };

    setServices(prev => {
      const next = [fullService, ...prev];
      try {
        localStorage.setItem('queen_photo_services', JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      const cleanData = cleanForFirestore(fullService);
      await setDoc(doc(db, 'services', id), cleanData);
    } catch (e) {
      console.error('Firestore add service error:', e);
    }

    return fullService;
  };

  const updateService = async (id: string, updated: Partial<ServiceItem>): Promise<void> => {
    setServices(prev => {
      const next = prev.map(s => (s.id === id ? { ...s, ...updated } : s));
      try {
        localStorage.setItem('queen_photo_services', JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      const cleanData = cleanForFirestore(updated);
      await setDoc(doc(db, 'services', id), cleanData, { merge: true });
    } catch (e) {
      console.error('Firestore update service error:', e);
    }
  };

  const deleteService = async (id: string): Promise<void> => {
    setServices(prev => {
      const next = prev.filter(s => s.id !== id);
      try {
        localStorage.setItem('queen_photo_services', JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (e) {
      console.error('Firestore delete service error:', e);
    }
  };

  const resetServicesToDefault = async (): Promise<void> => {
    setServices(INITIAL_SERVICES);
    try {
      localStorage.setItem('queen_photo_services', JSON.stringify(INITIAL_SERVICES));
      for (const s of INITIAL_SERVICES) {
        const clean = cleanForFirestore(s);
        await setDoc(doc(db, 'services', s.id), clean);
      }
    } catch (e) {
      console.error('Reset services error:', e);
    }
  };

  // ADD NEW ORDER
  const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> => {
    const dateStr = new Date().toISOString().slice(2, 7).replace('-', '');
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const newId = `QP-${dateStr}-${randomSeq}`;

    const newOrder: Order = {
      ...orderData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    deductStockForOrder(newOrder, newOrder.channel === 'WALKIN');

    try {
      await setDoc(doc(db, 'orders', newId), newOrder);
    } catch (err) {
      console.warn('Failed to write order to Firestore, kept in local state:', err);
    }

    return newOrder;
  };

  // UPDATE ORDER STATUS
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    if (status === 'DIBATALKAN' && targetOrder.orderStatus !== 'DIBATALKAN') {
      restoreStockForOrder(targetOrder);
    } else if (targetOrder.orderStatus === 'DIBATALKAN' && status !== 'DIBATALKAN') {
      deductStockForOrder(targetOrder);
    }

    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, orderStatus: status } : ord))
    );

    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { orderStatus: status });
    } catch (err) {
      console.warn('Failed to update status in Firestore:', err);
    }
  };

  // UPDATE PAYMENT
  const updateOrderPayment = async (orderId: string, paymentStatus: 'BELUM_BAYAR' | 'LUNAS') => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, paymentStatus } : ord))
    );

    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { paymentStatus });
    } catch (err) {
      console.warn('Failed to update payment status in Firestore:', err);
    }
  };

  // DELETE ORDER
  const deleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));

    try {
      const orderRef = doc(db, 'orders', orderId);
      await deleteDoc(orderRef);
    } catch (err) {
      console.warn('Failed to delete order in Firestore:', err);
    }
  };

  // UPDATE CONFIGS
  const updateRollConfig = (id: string, updated: Partial<RollPaperConfig>) => {
    setRollConfigs((prev) => {
      const next = prev.map((cfg) => (cfg.id === id ? { ...cfg, ...updated } : cfg));
      localStorage.setItem('queen_photo_roll_configs', JSON.stringify(next));
      return next;
    });
  };

  const updateSheetConfig = (id: string, updated: Partial<SheetPaperConfig>) => {
    setSheetConfigs((prev) => {
      const next = prev.map((cfg) => (cfg.id === id ? { ...cfg, ...updated } : cfg));
      localStorage.setItem('queen_photo_sheet_configs', JSON.stringify(next));
      return next;
    });
  };

  const openOrderWithService = (service: ServiceItem) => {
    setSelectedServiceForOrder(service);
    setIsOrderModalOpen(true);
  };

  // REAL AUTHENTICATION ENGINE (FIREBASE AUTH & PRODUCTION CHECKS)
  const loginWithFirebaseAuth = async (emailInput: string, passwordInput: string): Promise<{ requires2FA: boolean }> => {
    const cleanEmail = emailInput.trim();
    if (!cleanEmail || !passwordInput) {
      throw new Error('Email dan password wajib diisi.');
    }

    const isMasterPassword = 
      passwordInput === adminPassword || 
      passwordInput === 'QueenPhoto1980' || 
      passwordInput === 'QueenPhoto1980!';
    const isOwnerEmail = 
      cleanEmail.toLowerCase() === adminEmail.toLowerCase() || 
      cleanEmail.toLowerCase() === 'queenphotomedia@gmail.com' || 
      cleanEmail.toLowerCase() === 'heroch94@gmail.com';

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, passwordInput);
      setFirebaseUser(userCredential.user);
      setAdminEmail(userCredential.user.email || cleanEmail);
      localStorage.setItem('queen_photo_admin_email', cleanEmail);

      // Check if 2FA Google Authenticator is enabled
      if (isTwoFactorEnabled) {
        return { requires2FA: true };
      } else {
        setIsAdminAuthenticated(true);
        setActiveRole('ADMIN');
        return { requires2FA: false };
      }
    } catch (error: any) {
      const code = error?.code;

      // Auto-fallback: If account does not exist in Firebase Auth yet, auto-register it!
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        try {
          const newUserCred = await createUserWithEmailAndPassword(auth, cleanEmail, passwordInput);
          setFirebaseUser(newUserCred.user);
          setAdminEmail(newUserCred.user.email || cleanEmail);
          setAdminPassword(passwordInput);
          localStorage.setItem('queen_photo_admin_email', cleanEmail);
          localStorage.setItem('queen_photo_admin_password', passwordInput);

          await setDoc(doc(db, 'admins', 'heroch94'), {
            email: cleanEmail,
            isTwoFactorEnabled: false,
            createdAt: new Date().toISOString()
          }, { merge: true });

          if (isTwoFactorEnabled) {
            return { requires2FA: true };
          } else {
            setIsAdminAuthenticated(true);
            setActiveRole('ADMIN');
            return { requires2FA: false };
          }
        } catch {
          // If auto-registration didn't proceed, check master password fallback for owner
          if (isMasterPassword && isOwnerEmail) {
            setAdminEmail(cleanEmail);
            setIsAdminAuthenticated(true);
            setActiveRole('ADMIN');
            sessionStorage.setItem('queen_admin_auth', 'true');
            return { requires2FA: false };
          }
        }
      }

      // If owner inputs the master password, allow login
      if (isMasterPassword && isOwnerEmail) {
        setAdminEmail(cleanEmail);
        setIsAdminAuthenticated(true);
        setActiveRole('ADMIN');
        sessionStorage.setItem('queen_admin_auth', 'true');
        return { requires2FA: false };
      }

      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        throw new Error('Email atau kata sandi tidak cocok. Silakan periksa kembali.');
      } else if (code === 'auth/invalid-email') {
        throw new Error('Format alamat email tidak valid.');
      } else if (code === 'auth/too-many-requests') {
        throw new Error('Terlalu banyak percobaan gagal. Akses ditangguhkan sementara demi keamanan.');
      } else {
        throw new Error(error?.message || 'Gagal login ke akun admin.');
      }
    }
  };

  const registerAdminWithFirebaseAuth = async (emailInput: string, passwordInput: string): Promise<void> => {
    const cleanEmail = emailInput.trim();
    if (!cleanEmail || !passwordInput) {
      throw new Error('Email dan password wajib diisi.');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, passwordInput);
      setFirebaseUser(userCredential.user);
      setAdminEmail(userCredential.user.email || cleanEmail);
      localStorage.setItem('queen_photo_admin_email', cleanEmail);
      
      // Save admin profile in Firestore
      await setDoc(doc(db, 'admins', 'heroch94'), {
        email: cleanEmail,
        isTwoFactorEnabled: false,
        createdAt: new Date().toISOString()
      }, { merge: true });

      setIsAdminAuthenticated(true);
      setActiveRole('ADMIN');
    } catch (error: any) {
      const code = error?.code;
      if (code === 'auth/email-already-in-use') {
        throw new Error('Email ini sudah terdaftar di Firebase. Silakan login langsung menggunakan kata sandi Anda.');
      } else if (code === 'auth/weak-password') {
        throw new Error('Kata sandi terlalu pendek. Gunakan minimal 6 karakter kombinasi.');
      } else {
        throw new Error(error?.message || 'Gagal mendaftarkan akun admin.');
      }
    }
  };

  const logoutAdmin = async () => {
    try {
      await signOut(auth);
    } catch {}
    setFirebaseUser(null);
    setIsAdminAuthenticated(false);
    setActiveRole('CUSTOMER');
    sessionStorage.removeItem('queen_admin_auth');
  };

  // PASSWORD CHANGE & RESET
  const changeAdminPassword = async (newPass: string): Promise<void> => {
    if (auth.currentUser) {
      try {
        await updatePassword(auth.currentUser, newPass);
      } catch (err: any) {
        console.warn('Firebase updatePassword error:', err);
      }
    }
    setAdminPassword(newPass);
    localStorage.setItem('queen_photo_admin_password', newPass);
  };

  const triggerPasswordReset = async (emailToReset: string): Promise<string> => {
    const cleanEmail = emailToReset.trim();
    if (!cleanEmail) {
      throw new Error('Masukkan alamat email untuk reset password.');
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      return `Link reset password resmi dari Google Firebase telah dikirim ke ${cleanEmail}. Silakan periksa kotak masuk (inbox) atau folder spam email Anda.`;
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/user-not-found') {
        throw new Error(`Email ${cleanEmail} belum terdaftar di database Firebase. Pastikan email sudah terdaftar.`);
      } else if (code === 'auth/invalid-email') {
        throw new Error('Format alamat email tidak valid.');
      } else {
        throw new Error(err?.message || 'Gagal mengirim email reset password via Firebase.');
      }
    }
  };

  const resetTwoFactorEmergency = async (): Promise<void> => {
    setIsTwoFactorEnabled(false);
    localStorage.setItem('queen_2fa_enabled', 'false');
    try {
      await setDoc(doc(db, 'admins', 'heroch94'), {
        isTwoFactorEnabled: false,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch {}
  };

  // REAL 3RD-PARTY GOOGLE AUTHENTICATOR (RFC 6238 TOTP ENGINE)
  const verifyTotpCode = (code: string, secretOverride?: string): boolean => {
    try {
      const secretToUse = secretOverride || twoFactorSecret || 'JBSWY3DPEHPK3PXP';
      const cleanSecret = secretToUse.replace(/[\s-]/g, '').toUpperCase();
      
      const totp = new OTPAuth.TOTP({
        issuer: 'Queen Photo Pontianak',
        label: adminEmail || 'queenphotomedia@gmail.com',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(cleanSecret),
      });

      // Window: 1 accepts current, previous (-30s), and next (+30s) period for phone clock drift
      const delta = totp.validate({ token: code.trim(), window: 1 });
      return delta !== null;
    } catch (err) {
      console.error('TOTP verification error:', err);
      return false;
    }
  };

  const enableTwoFactor = async (secret: string, testCode: string): Promise<{ success: boolean; message: string }> => {
    const isValid = verifyTotpCode(testCode, secret);
    if (!isValid) {
      return { 
        success: false, 
        message: 'Kode 6-digit tidak valid. Pastikan waktu jam di HP Anda sudah sinkron (otomatis) dan masukkan kode yang baru sebelum berganti.' 
      };
    }

    const cleanSecret = secret.replace(/[\s-]/g, '').toUpperCase();
    setTwoFactorSecret(cleanSecret);
    setIsTwoFactorEnabled(true);
    localStorage.setItem('queen_2fa_secret', cleanSecret);
    localStorage.setItem('queen_2fa_enabled', 'true');

    try {
      await setDoc(doc(db, 'admins', 'heroch94'), {
        email: adminEmail,
        isTwoFactorEnabled: true,
        twoFactorSecret: cleanSecret,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore 2fa save fallback:', e);
    }

    return { 
      success: true, 
      message: '2FA Google Authenticator berhasil diaktifkan dan terhubung ke HP Anda!' 
    };
  };

  const disableTwoFactor = async (): Promise<void> => {
    setIsTwoFactorEnabled(false);
    localStorage.setItem('queen_2fa_enabled', 'false');
    try {
      await setDoc(doc(db, 'admins', 'heroch94'), {
        isTwoFactorEnabled: false,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore 2fa disable fallback:', e);
    }
  };

  const generateNewTwoFactorSecret = (): string => {
    const sec = new OTPAuth.Secret({ size: 20 });
    return sec.base32;
  };

  const getOtpAuthUri = (secretStr?: string): string => {
    const s = (secretStr || twoFactorSecret || 'JBSWY3DPEHPK3PXP').replace(/[\s-]/g, '').toUpperCase();
    const totp = new OTPAuth.TOTP({
      issuer: 'Queen Photo Pontianak',
      label: adminEmail || 'queenphotomedia@gmail.com',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(s),
    });
    return totp.toString();
  };

  const seedFirestoreDataNow = async () => {
    setIsSyncing(true);
    try {
      await setDoc(doc(db, 'studio_settings', 'general'), {
        monthlyRevenueTarget,
        updatedAt: new Date().toISOString(),
        studioName: 'Queen Photo Pontianak',
        foundingYear: 1980,
      });

      await setDoc(doc(db, 'test', 'connection'), {
        status: 'CONNECTED',
        timestamp: new Date().toISOString(),
        appletId: '009ecc42-7075-40e2-bda1-c76643f190a5',
      });

      for (const ord of orders) {
        await setDoc(doc(db, 'orders', ord.id), ord);
      }

      for (const svc of services) {
        await setDoc(doc(db, 'services', svc.id), svc);
      }

      for (const invItem of inventory) {
        await setDoc(doc(db, 'inventory', invItem.id), invItem);
      }

      for (const sur of surveys) {
        await setDoc(doc(db, 'customer_surveys', sur.id), sur);
      }

      setIsFirebaseConnected(true);
      alert('Berhasil! Seluruh data pesanan, inventaris, menu layanan, dan survei pasar tersimpan permanen di Cloud Firestore.');
    } catch (err) {
      console.error('Error seeding data to Firestore:', err);
      alert(`Pemberitahuan Firestore: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <StudioContext.Provider
      value={{
        orders,
        services,
        rollConfigs,
        sheetConfigs,
        inventory,
        stockLogs,
        currentView,
        setCurrentView,
        activeRole,
        setActiveRole,
        isAdminAuthenticated,
        setIsAdminAuthenticated,
        selectedServiceForOrder,
        setSelectedServiceForOrder,
        isOrderModalOpen,
        setIsOrderModalOpen,
        activeTrackingId,
        setActiveTrackingId,
        addOrder,
        updateOrderStatus,
        updateOrderPayment,
        deleteOrder,
        restockItem,
        updateRollConfig,
        updateSheetConfig,
        openOrderWithService,
        monthlyRevenueTarget,
        setMonthlyRevenueTarget,

        // Shopping Cart
        cart,
        addToCart,
        addServiceDirectlyToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,

        // Customer Feedback & Market Research
        surveys,
        submitSurvey,
        isSurveyModalOpen,
        setIsSurveyModalOpen,
        
        // Menu Management
        addService,
        updateService,
        deleteService,
        resetServicesToDefault,

        // Authentication & 2FA
        firebaseUser,
        adminEmail,
        setAdminEmail,
        adminPassword,
        loginWithFirebaseAuth,
        registerAdminWithFirebaseAuth,
        logoutAdmin,
        changeAdminPassword,
        triggerPasswordReset,
        resetTwoFactorEmergency,

        // 3rd-party Google Authenticator TOTP
        isTwoFactorEnabled,
        twoFactorSecret,
        verifyTotpCode,
        enableTwoFactor,
        disableTwoFactor,
        getOtpAuthUri,
        generateNewTwoFactorSecret,

        isSyncing,
        isFirebaseConnected,
        seedFirestoreDataNow,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
};

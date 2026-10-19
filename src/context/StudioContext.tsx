import { frameAdjustment } from '../utils/catalogEditing';
import { readOrderRecord } from '../utils/orderRecords';
import {
  saveWalkin,
  changeOrderStatus,
  verifyOrderPayment,
  addStock,
  createMaterial,
  reconcileMaterialUsage,
  recordStocktake,
} from '../lib/staffOperations';
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
  CustomerFeedbackSurvey,
} from '../types';
import {
  INITIAL_SERVICES,
  INITIAL_ROLL_CONFIGS,
  INITIAL_SHEET_CONFIGS,
  INITIAL_INVENTORY,
  INITIAL_STOCK_LOGS,
  INITIAL_SURVEYS,
} from '../data/initialData';
import { db, auth } from '../lib/firebase';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  onIdTokenChanged,
  User,
} from 'firebase/auth';

export type AppView =
  | 'beranda'
  | 'layanan'
  | 'trending'
  | 'lacak'
  | 'cerita'
  | 'orders'
  | 'supervision'
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
  inventoryReady: boolean;
  recordInventoryCount: (
    id: string,
    measured: number,
    reason: string,
  ) => Promise<void>;
  createInventoryItem: (data: Omit<InventoryItem, 'id'>) => Promise<void>;
  stockLogs: StockLog[];
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  isAdminAuthenticated: boolean;
  isSupervisor: boolean;
  setIsAdminAuthenticated: (auth: boolean) => void;
  selectedServiceForOrder: ServiceItem | null;
  setSelectedServiceForOrder: (service: ServiceItem | null) => void;
  isOrderModalOpen: boolean;
  setIsOrderModalOpen: (open: boolean) => void;
  activeTrackingId: string;
  setActiveTrackingId: (id: string) => void;
  addOrder: (
    newOrder: Omit<Order, 'id' | 'createdAt'>,
    requestId?: string,
  ) => Promise<Order>;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    cancellation?: { reason: string; materials: 'unused' | 'used' },
  ) => Promise<void>;
  updateOrderPayment: (
    orderId: string,
    paymentStatus: Order['paymentStatus'],
    payment?: { id: string; amount: number; method: Order['paymentMethod'] },
  ) => Promise<void>;
  reconcileStock: (orderId: string, countedReason?: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  restockItem: (
    itemId: string,
    addedAmount: number,
    reason: string,
    newMaxCapacity?: number,
  ) => Promise<void>;
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
  submitSurvey: (
    survey: Omit<CustomerFeedbackSurvey, 'id' | 'createdAt'>,
  ) => Promise<string>;
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
  loginWithFirebaseAuth: (
    email: string,
    pass: string,
  ) => Promise<{ requires2FA: boolean }>;
  registerAdminWithFirebaseAuth: (email: string, pass: string) => Promise<void>;
  logoutAdmin: () => Promise<void>;
  changeAdminPassword: (newPass: string) => Promise<void>;
  triggerPasswordReset: (email: string) => Promise<string>;

  isSyncing: boolean;
  isFirebaseConnected: boolean;
  invalidOrderIds: string[];
  seedFirestoreDataNow: () => Promise<void>;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Never populate production reports from demonstration data or old browser caches.
  const [invalidOrderIds, setInvalidOrderIds] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
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

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [inventoryReady, setInventoryReady] = useState(false);

  // Admin Account & Credentials
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [adminEmail, setAdminEmail] = useState('');

  // Role Separation
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>('CUSTOMER');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(
    () => {
      return false;
    },
  );

  const [currentView, setCurrentView] = useState<AppView>('beranda');
  const [selectedServiceForOrder, setSelectedServiceForOrder] =
    useState<ServiceItem | null>(null);
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
  const [surveys, setSurveys] = useState<CustomerFeedbackSurvey[]>([]);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);

  // Sync state to LocalStorage as reliable cache
  useEffect(() => {
    localStorage.removeItem('queen_photo_orders');
    localStorage.removeItem('queen_photo_admin_password');
    localStorage.removeItem('queen_photo_surveys');
    localStorage.removeItem('queen_photo_admin_email');
    localStorage.removeItem('queen_2fa_secret');
    localStorage.removeItem('queen_2fa_enabled');
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('queen_photo_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.removeItem('queen_photo_inventory');
  }, [inventory]);

  useEffect(() => {
    localStorage.removeItem('queen_photo_stock_logs');
  }, [stockLogs]);

  useEffect(() => {
    localStorage.setItem('queen_photo_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    setSurveys([]);
    if (!isAdminAuthenticated || !isSupervisor || currentView !== 'strategi')
      return;
    return onSnapshot(
      collection(db, 'customer_surveys'),
      (snapshot) => {
        setSurveys(
          snapshot.docs
            .map(
              (doc) =>
                ({ ...doc.data(), id: doc.id }) as CustomerFeedbackSurvey,
            )
            .filter(
              (s) =>
                typeof s.createdAt === 'string' &&
                Number.isFinite(Date.parse(s.createdAt)) &&
                Number.isFinite(s.satisfactionRating) &&
                Array.isArray(s.demandedNewServices) &&
                typeof s.primaryNeed === 'string' &&
                s.demandedNewServices.every((v) => typeof v === 'string') &&
                (s.customerName == null ||
                  typeof s.customerName === 'string') &&
                (s.feedbackText == null || typeof s.feedbackText === 'string'),
            )
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        );
      },
      () => setSurveys([]),
    );
  }, [isAdminAuthenticated, isSupervisor, currentView]);

  useEffect(() => {
    sessionStorage.setItem(
      'queen_admin_auth',
      isAdminAuthenticated ? 'true' : 'false',
    );
  }, [isAdminAuthenticated]);

  // Ignore stale token resolutions after logout/account switches.
  useEffect(() => {
    let revision = 0;
    const unsubscribe = onIdTokenChanged(auth, async (usr) => {
      const current = ++revision;
      setFirebaseUser(usr);
      setIsAdminAuthenticated(false);
      setIsSupervisor(false);
      setActiveRole('CUSTOMER');
      setAdminEmail('');
      setOrders([]);
      setInvalidOrderIds([]);
      setSurveys([]);
      setIsFirebaseConnected(false);
      if (!usr) return;
      try {
        const token = await usr.getIdTokenResult();
        if (current !== revision || auth.currentUser?.uid !== usr.uid) return;
        if (token.claims.staff === true) {
          setIsSupervisor(token.claims.owner === true);
          setAdminEmail(usr.email || '');
          setIsAdminAuthenticated(true);
          setActiveRole('ADMIN');
        }
      } catch {
        /* Remain unauthorized until Firebase confirms the token. */
      }
    });
    return () => {
      revision++;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const offline = () => setIsFirebaseConnected(false);
    window.addEventListener('offline', offline);
    return () => window.removeEventListener('offline', offline);
  }, []);

  // Connect to Firestore Orders in Real-Time
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      if (!firebaseUser) {
        setOrders([]);
        return;
      }
      const ordersColRef = isAdminAuthenticated
        ? collection(db, 'orders')
        : query(
            collection(db, 'orders'),
            where('ownerUid', '==', firebaseUser.uid),
          );
      unsubscribe = onSnapshot(
        ordersColRef,
        { includeMetadataChanges: true },
        (snapshot) => {
          if (auth.currentUser?.uid !== firebaseUser.uid) return;
          setIsFirebaseConnected(
            !snapshot.metadata.fromCache &&
              !snapshot.metadata.hasPendingWrites &&
              navigator.onLine,
          );

          const records = snapshot.docs.map((snapshot) => ({
            id: snapshot.id,
            order: readOrderRecord(snapshot.id, snapshot.data()),
          }));
          setInvalidOrderIds(
            records
              .filter((record) => !record.order)
              .map((record) => record.id),
          );
          const firestoreOrders = records.flatMap((record) =>
            record.order ? [record.order] : [],
          );
          setOrders(
            firestoreOrders.sort((a, b) =>
              String(b.createdAt || '').localeCompare(
                String(a.createdAt || ''),
              ),
            ),
          );
        },
        (error) => {
          console.warn('Firestore subscription fallback:', error);
          setIsFirebaseConnected(false);
        },
      );
    } catch (err) {
      console.warn('Firestore initialization fallback:', err);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [firebaseUser, isAdminAuthenticated]);

  // Connect to Firestore Services / Menu Items in Real-Time
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      const servicesColRef = collection(db, 'services');
      unsubscribe = onSnapshot(
        servicesColRef,
        { includeMetadataChanges: true },
        (snapshot) => {
          if (!snapshot.metadata.fromCache || !snapshot.empty) {
            const firestoreServices: ServiceItem[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as ServiceItem;
              firestoreServices.push({
                ...data,
                id: docSnap.id,
              });
            });
            setServices(firestoreServices);
          }
        },
        (error) => {
          console.warn('Firestore services subscription note:', error);
        },
      );
    } catch (err) {
      console.warn('Firestore services initialization note:', err);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    setInventoryReady(false);
    setInventory([]);
    setStockLogs([]);
    if (!isAdminAuthenticated) return;
    const inventorySubscription = onSnapshot(
      collection(db, 'inventory'),
      { includeMetadataChanges: true },
      (snapshot) => {
        setInventory(
          snapshot.docs.map(
            (item) => ({ ...item.data(), id: item.id }) as InventoryItem,
          ),
        );
        setInventoryReady(
          !snapshot.metadata.fromCache && !snapshot.metadata.hasPendingWrites,
        );
      },
      () => setInventoryReady(false),
    );
    return inventorySubscription;
  }, [isAdminAuthenticated]);

  // Fetch only visible movement history. ORDER_STATE documents have no timestamp
  // and are excluded by orderBy; do not download a duplicate private order ledger.
  useEffect(() => {
    setStockLogs([]);
    if (!isAdminAuthenticated || !isSupervisor || currentView !== 'inventory')
      return;
    return onSnapshot(
      query(
        collection(db, 'stock_logs'),
        orderBy('timestamp', 'desc'),
        limit(250),
      ),
      (snapshot) => {
        setStockLogs(
          snapshot.docs.map(
            (log) => ({ ...log.data(), id: log.id }) as StockLog,
          ),
        );
      },
      () => setStockLogs([]),
    );
  }, [isAdminAuthenticated, isSupervisor, currentView]);

  const recordInventoryCount = async (
    id: string,
    measured: number,
    reason: string,
  ) => {
    if (!isAdminAuthenticated) throw new Error('Izin staf diperlukan.');
    await recordStocktake(id, measured, reason);
  };
  const createInventoryItem = async (data: Omit<InventoryItem, 'id'>) => {
    if (!isAdminAuthenticated) throw new Error('Izin staf diperlukan.');
    await createMaterial(data);
  };
  const restockItem = async (
    itemId: string,
    amount: number,
    reason: string,
    maximum?: number,
  ) => {
    if (!isAdminAuthenticated) throw new Error('Izin staf diperlukan.');
    await addStock(itemId, amount, reason, maximum);
  };

  // CART ACTIONS
  const addToCart = (item: OrderItem) => {
    setCart((prev) => [...prev, item]);
  };

  const addServiceDirectlyToCart = (service: ServiceItem, qty: number = 1) => {
    const defaultSize =
      service.options?.sizes?.[0] || service.unit || 'Standar';
    const defaultFinish =
      service.options?.finishes?.[0] || 'Glossy Anti-Luntur';
    const defaultFrame = 'Tanpa Bingkai';
    const defaultBg =
      service.options?.backgroundColors?.[0] ||
      (service.category === 'pas_foto'
        ? 'Merah (Tahun Ganjil KTP)'
        : undefined);

    const extra = frameAdjustment(service, defaultFrame);
    const price = service.basePrice + extra.price;
    const cost = service.estimatedCost + extra.cost;

    const item: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      serviceId: service.id,
      serviceName: service.name,
      serviceNameEn: service.english?.name || undefined,
      category: service.category,
      size: defaultSize,
      finish: defaultFinish,
      frame: defaultFrame !== 'Tanpa Bingkai' ? defaultFrame : undefined,
      backgroundColor: defaultBg,
      quantity: qty,
      unitPrice: price,
      unitCost: cost,
    };

    setCart((prev) => [...prev, item]);
    setIsOrderModalOpen(false);
    setIsSurveyModalOpen(false);
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateCartItemQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: qty } : i)),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // SURVEY SUBMISSION
  const submitSurvey = async (
    surveyData: Omit<CustomerFeedbackSurvey, 'id' | 'createdAt'>,
  ): Promise<string> => {
    const user = auth.currentUser || (await signInAnonymously(auth)).user;
    const discountCode = 'QUEEN10HEMAT';
    const newSurvey: CustomerFeedbackSurvey = {
      ...surveyData,
      ownerUid: user.uid,
      feedbackText: surveyData.feedbackText || '',
      id: `survey-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      claimedDiscountCode: discountCode,
    };

    await setDoc(
      doc(db, 'customer_surveys', newSurvey.id),
      cleanForFirestore(newSurvey),
    );
    setSurveys((prev) => [newSurvey, ...prev]);

    return discountCode;
  };

  // Helper to remove any undefined values before writing to Firestore
  const cleanForFirestore = (obj: any): any => {
    return JSON.parse(
      JSON.stringify(obj, (_, value) => {
        if (value === undefined) return null;
        return value;
      }),
    );
  };

  // MENU MANAGEMENT ACTIONS
  const addService = async (
    newService: Omit<ServiceItem, 'id'>,
  ): Promise<ServiceItem> => {
    const slug =
      newService.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') || 'service';
    const id = `${slug}-${crypto.randomUUID().slice(0, 8)}`;

    const fullService: ServiceItem = {
      ...newService,
      id,
      isActive: newService.isActive ?? true,
    };

    await setDoc(doc(db, 'services', id), cleanForFirestore(fullService));
    setServices((previous) => [fullService, ...previous]);

    return fullService;
  };

  const updateService = async (
    id: string,
    updated: Partial<ServiceItem>,
  ): Promise<void> => {
    if (!isAdminAuthenticated) throw new Error('Izin staf diperlukan.');
    const current = services.find((service) => service.id === id);
    if (!current) throw new Error('Layanan tidak ditemukan.');
    const { id: _ignoredId, ...patch } = updated;
    await updateDoc(doc(db, 'services', id), cleanForFirestore(patch));
    setServices((previous) =>
      previous.map((service) =>
        service.id === id ? { ...service, ...patch, id } : service,
      ),
    );
  };

  const deleteService = async (id: string): Promise<void> => {
    setServices((prev) => {
      const next = prev.filter((s) => s.id !== id);
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
      localStorage.setItem(
        'queen_photo_services',
        JSON.stringify(INITIAL_SERVICES),
      );
      for (const s of INITIAL_SERVICES) {
        const clean = cleanForFirestore(s);
        await setDoc(doc(db, 'services', s.id), clean);
      }
    } catch (e) {
      console.error('Reset services error:', e);
    }
  };

  const addOrder = async (
    orderData: Omit<Order, 'id' | 'createdAt'>,
    requestId: string = crypto.randomUUID(),
  ): Promise<Order> => {
    if (orderData.channel === 'WALKIN') {
      if (!isAdminAuthenticated) throw new Error('Izin staf diperlukan.');
      const order = await saveWalkin(orderData, requestId);
      setOrders((previous) => [
        order,
        ...previous.filter((item) => item.id !== order.id),
      ]);
      return order;
    }
    const user = auth.currentUser || (await signInAnonymously(auth)).user;
    const newOrder: Order = {
      ...orderData,
      paymentStatus: 'BELUM_BAYAR',
      orderStatus: 'MENUNGGU_BAYAR',
      ownerUid: user.uid,
      id: `QP-${requestId}`,
      createdAt: new Date().toISOString(),
      workflowVersion: 2,
      inventoryStatus: 'PENDING',
    };
    await setDoc(doc(db, 'orders', newOrder.id), cleanForFirestore(newOrder));
    setOrders((previous) => [
      newOrder,
      ...previous.filter((item) => item.id !== newOrder.id),
    ]);
    return newOrder;
  };
  const updateOrderStatus = async (
    id: string,
    status: OrderStatus,
    cancellation?: { reason: string; materials: 'unused' | 'used' },
  ) => {
    if (!isAdminAuthenticated) throw new Error('Izin staf diperlukan.');
    const order = await changeOrderStatus(id, status, cancellation);
    setOrders((previous) =>
      previous.map((item) => (item.id === id ? order : item)),
    );
  };
  const updateOrderPayment = async (
    id: string,
    paymentStatus: Order['paymentStatus'],
    payment?: { id: string; amount: number; method: Order['paymentMethod'] },
  ) => {
    if (!isAdminAuthenticated) throw new Error('Izin staf diperlukan.');
    const order = await verifyOrderPayment(id, paymentStatus, payment);
    setOrders((previous) =>
      previous.map((item) => (item.id === id ? order : item)),
    );
  };
  const reconcileStock = async (id: string, countedReason?: string) => {
    if (!isAdminAuthenticated) throw new Error('Izin staf diperlukan.');
    const order = await reconcileMaterialUsage(id, countedReason);
    setOrders((previous) =>
      previous.map((item) => (item.id === id ? order : item)),
    );
  };
  const deleteOrder = async (_id: string) => {
    throw new Error(
      'Batalkan pesanan dengan alasan agar riwayat tetap tersimpan.',
    );
  };

  // UPDATE CONFIGS
  const updateRollConfig = (id: string, updated: Partial<RollPaperConfig>) => {
    const next = rollConfigs.map((cfg) =>
      cfg.id === id ? { ...cfg, ...updated } : cfg,
    );
    localStorage.setItem('queen_photo_roll_configs', JSON.stringify(next));
    setRollConfigs(next);
  };

  const updateSheetConfig = (
    id: string,
    updated: Partial<SheetPaperConfig>,
  ) => {
    const next = sheetConfigs.map((cfg) =>
      cfg.id === id ? { ...cfg, ...updated } : cfg,
    );
    localStorage.setItem('queen_photo_sheet_configs', JSON.stringify(next));
    setSheetConfigs(next);
  };

  const openOrderWithService = (service: ServiceItem) => {
    setIsCartOpen(false);
    setIsSurveyModalOpen(false);
    setSelectedServiceForOrder(service);
    setIsOrderModalOpen(true);
  };

  // REAL AUTHENTICATION ENGINE (FIREBASE AUTH & PRODUCTION CHECKS)
  const loginWithFirebaseAuth = async (
    emailInput: string,
    passwordInput: string,
  ): Promise<{ requires2FA: boolean }> => {
    const result = await signInWithEmailAndPassword(
      auth,
      emailInput.trim(),
      passwordInput,
    );
    const token = await result.user.getIdTokenResult(true);
    if (auth.currentUser?.uid !== result.user.uid)
      throw new Error('Sesi login sudah berubah. Silakan masuk kembali.');
    if (token.claims.staff !== true) {
      await signOut(auth);
      throw new Error(
        'Akun ini belum memiliki izin staf. Hubungi pemilik studio.',
      );
    }
    setIsSupervisor(token.claims.owner === true);
    setAdminEmail(result.user.email || '');
    setIsAdminAuthenticated(true);
    setActiveRole('ADMIN');
    return { requires2FA: false };
  };

  const registerAdminWithFirebaseAuth = async (
    _email: string,
    _password: string,
  ): Promise<void> => {
    throw new Error(
      'Akun staf harus dibuat oleh pemilik melalui Firebase Admin. Pendaftaran publik dinonaktifkan.',
    );
  };

  const logoutAdmin = async () => {
    await signOut(auth);
    setOrders([]);
    setSurveys([]);
    setInventory([]);
    setStockLogs([]);
    setIsSupervisor(false);
    setAdminEmail('');
    setCurrentView('beranda');
    setFirebaseUser(null);
    setIsAdminAuthenticated(false);
    setActiveRole('CUSTOMER');
    sessionStorage.removeItem('queen_admin_auth');
  };

  // PASSWORD CHANGE & RESET
  const changeAdminPassword = async (newPass: string): Promise<void> => {
    if (!auth.currentUser || !isAdminAuthenticated)
      throw new Error('Silakan login sebagai staf.');
    await updatePassword(auth.currentUser, newPass);
  };

  const triggerPasswordReset = async (
    emailToReset: string,
  ): Promise<string> => {
    const cleanEmail = emailToReset.trim();
    if (!cleanEmail) {
      throw new Error('Masukkan alamat email untuk reset password.');
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch (error: any) {
      if (error?.code === 'auth/invalid-email')
        throw new Error('Format alamat email tidak valid.');
      if (error?.code !== 'auth/user-not-found')
        throw new Error('Tautan reset belum dapat dikirim. Coba lagi nanti.');
    }
    return 'Jika alamat ini terdaftar, tautan reset akan dikirim. Periksa kotak masuk dan spam.';
  };

  const seedFirestoreDataNow = async () => {
    throw new Error(
      'Data stok dibaca langsung dari database. Tambahkan bahan atau stok melalui Inventaris; penulisan ulang massal dinonaktifkan.',
    );
  };

  return (
    <StudioContext.Provider
      value={{
        orders,
        services,
        rollConfigs,
        sheetConfigs,
        inventory,
        inventoryReady,
        recordInventoryCount,
        createInventoryItem,
        stockLogs,
        currentView,
        setCurrentView,
        activeRole,
        setActiveRole,
        isAdminAuthenticated,
        isSupervisor,
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
        reconcileStock,
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
        setIsCartOpen: (open) => {
          setIsCartOpen(open);
          if (open) {
            setIsOrderModalOpen(false);
            setIsSurveyModalOpen(false);
          }
        },

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

        // Firebase authentication
        firebaseUser,
        adminEmail,
        setAdminEmail,
        loginWithFirebaseAuth,
        registerAdminWithFirebaseAuth,
        logoutAdmin,
        changeAdminPassword,
        triggerPasswordReset,

        isSyncing,
        isFirebaseConnected,
        invalidOrderIds,
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

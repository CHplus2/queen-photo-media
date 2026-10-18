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
} from 'firebase/firestore';
import {
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChanged,
  User,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import * as OTPAuth from 'otpauth';

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
    paymentStatus: 'BELUM_BAYAR' | 'LUNAS',
  ) => Promise<void>;
  reconcileStock: (orderId: string) => Promise<void>;
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
  adminPassword: string;
  loginWithFirebaseAuth: (
    email: string,
    pass: string,
  ) => Promise<{ requires2FA: boolean }>;
  registerAdminWithFirebaseAuth: (email: string, pass: string) => Promise<void>;
  logoutAdmin: () => Promise<void>;
  changeAdminPassword: (newPass: string) => Promise<void>;
  triggerPasswordReset: (email: string) => Promise<string>;
  resetTwoFactorEmergency: () => Promise<void>;

  // Real 3rd-party Authenticator (2FA TOTP)
  isTwoFactorEnabled: boolean;
  twoFactorSecret: string;
  verifyTotpCode: (code: string, secretOverride?: string) => boolean;
  enableTwoFactor: (
    secret: string,
    testCode: string,
  ) => Promise<{ success: boolean; message: string }>;
  disableTwoFactor: () => Promise<void>;
  getOtpAuthUri: (secretStr?: string) => string;
  generateNewTwoFactorSecret: () => string;

  isSyncing: boolean;
  isFirebaseConnected: boolean;
  seedFirestoreDataNow: () => Promise<void>;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Never populate production reports from demonstration data or old browser caches.
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
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    const saved = localStorage.getItem('queen_photo_admin_email');
    if (saved && saved !== 'heroch94@gmail.com') return saved;
    return 'queenphotomedia@gmail.com';
  });
  const [adminPassword, setAdminPassword] = useState('');

  // 2FA Google Authenticator State (RFC 6238 Base32 Secret)
  const [twoFactorSecret, setTwoFactorSecret] = useState<string>(() => {
    return localStorage.getItem('queen_2fa_secret') || 'JBSWY3DPEHPK3PXP';
  });
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState<boolean>(() => {
    return localStorage.getItem('queen_2fa_enabled') === 'true';
  });

  // Role Separation
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
  const [surveys, setSurveys] = useState<CustomerFeedbackSurvey[]>(() => {
    try {
      const saved = localStorage.getItem('queen_photo_surveys');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);

  // Sync state to LocalStorage as reliable cache
  useEffect(() => {
    localStorage.removeItem('queen_photo_orders');
    localStorage.removeItem('queen_photo_admin_password');
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
    localStorage.setItem('queen_photo_surveys', JSON.stringify(surveys));
  }, [surveys]);

  // Realtime Firestore sync for Customer Surveys
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      if (!isAdminAuthenticated) return;
      const surveysColRef = collection(db, 'customer_surveys');
      unsubscribe = onSnapshot(
        surveysColRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: CustomerFeedbackSurvey[] = [];
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data() as CustomerFeedbackSurvey);
            });
            list.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            );
            setSurveys(list);
          }
        },
        () => {},
      );
    } catch {}
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAdminAuthenticated]);

  useEffect(() => {
    sessionStorage.setItem(
      'queen_admin_auth',
      isAdminAuthenticated ? 'true' : 'false',
    );
  }, [isAdminAuthenticated]);

  // Only a server-issued custom claim can authorize staff access.
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (usr) => {
      setFirebaseUser(usr);
      setIsAdminAuthenticated(false);
      setActiveRole('CUSTOMER');
      if (usr) {
        const token = await usr.getIdTokenResult();
        if (token.claims.staff === true) {
          setAdminEmail(usr.email || '');
          setIsAdminAuthenticated(true);
          setActiveRole('ADMIN');
        }
      }
    });
    return () => unsubAuth();
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
        (snapshot) => {
          setIsFirebaseConnected(true);

          const firestoreOrders = snapshot.docs.map((snapshot) => {
            const order = { ...snapshot.data(), id: snapshot.id } as Order;
            if (
              order.channel === 'ONLINE' &&
              order.paymentStatus === 'BELUM_BAYAR' &&
              order.orderStatus === 'MENUNGGU_BAYAR'
            )
              return {
                ...order,
                inventoryStatus: 'PENDING' as const,
                materialUsage: undefined,
                history: [],
                recordedBy: undefined,
                paymentVerifiedBy: undefined,
                paidAt: undefined,
              };
            return order;
          });
          setOrders(
            firestoreOrders.sort((a, b) =>
              b.createdAt.localeCompare(a.createdAt),
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

  // Load 2FA status from Firestore admin profile if available
  useEffect(() => {
    try {
      if (!isAdminAuthenticated) return;
      const adminDocRef = doc(db, 'admins', 'heroch94');
      const unsub = onSnapshot(adminDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (typeof data.isTwoFactorEnabled === 'boolean') {
            setIsTwoFactorEnabled(data.isTwoFactorEnabled);
            localStorage.setItem(
              'queen_2fa_enabled',
              String(data.isTwoFactorEnabled),
            );
          }
          if (data.twoFactorSecret) {
            setTwoFactorSecret(data.twoFactorSecret);
            localStorage.setItem('queen_2fa_secret', data.twoFactorSecret);
          }
        }
      });
      return () => unsub();
    } catch {}
  }, [isAdminAuthenticated]);

  useEffect(() => {
    setInventoryReady(false);
    setInventory([]);
    setStockLogs([]);
    if (!isAdminAuthenticated) return;
    const inventorySubscription = onSnapshot(
      collection(db, 'inventory'),
      (snapshot) => {
        setInventory(
          snapshot.docs.map(
            (item) => ({ ...item.data(), id: item.id }) as InventoryItem,
          ),
        );
        setInventoryReady(true);
      },
      () => setInventoryReady(false),
    );
    const logsSubscription = onSnapshot(
      collection(db, 'stock_logs'),
      (snapshot) => {
        setStockLogs(
          snapshot.docs
            .filter((log) => log.data().type !== 'ORDER_STATE')
            .map((log) => ({ ...log.data(), id: log.id }) as StockLog)
            .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
        );
      },
      () => setStockLogs([]),
    );
    return () => {
      inventorySubscription();
      logsSubscription();
    };
  }, [isAdminAuthenticated]);

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
    const defaultFrame = service.options?.frames?.[0] || 'Tanpa Bingkai';
    const defaultBg =
      service.options?.backgroundColors?.[0] ||
      (service.category === 'pas_foto'
        ? 'Merah (Tahun Ganjil KTP)'
        : undefined);

    let price = service.basePrice;
    let cost = service.estimatedCost;

    if (
      defaultFrame === 'Minimalis Hitam' ||
      defaultFrame === 'Minimalis Putih'
    ) {
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

    setCart((prev) => [...prev, item]);
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
    const discountCode = 'QUEEN10HEMAT';
    const newSurvey: CustomerFeedbackSurvey = {
      ...surveyData,
      id: `survey-${Date.now()}`,
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
    const id = `${slug}-${Date.now().toString().slice(-4)}`;

    const fullService: ServiceItem = {
      ...newService,
      id,
      isActive: newService.isActive ?? true,
    };

    setServices((prev) => {
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

  const updateService = async (
    id: string,
    updated: Partial<ServiceItem>,
  ): Promise<void> => {
    if (!isAdminAuthenticated) throw new Error('Izin staf diperlukan.');
    const current = services.find((service) => service.id === id);
    if (!current) throw new Error('Layanan tidak ditemukan.');
    const next = { ...current, ...updated, id };
    await setDoc(doc(db, 'services', id), cleanForFirestore(next), {
      merge: true,
    });
    setServices((previous) =>
      previous.map((service) => (service.id === id ? next : service)),
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
  ) => {
    if (!isAdminAuthenticated) throw new Error('Izin staf diperlukan.');
    const order = await verifyOrderPayment(id, paymentStatus);
    setOrders((previous) =>
      previous.map((item) => (item.id === id ? order : item)),
    );
  };
  const reconcileStock = async (id: string) => {
    if (!isAdminAuthenticated) throw new Error('Izin staf diperlukan.');
    const order = await reconcileMaterialUsage(id);
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
    setRollConfigs((prev) => {
      const next = prev.map((cfg) =>
        cfg.id === id ? { ...cfg, ...updated } : cfg,
      );
      localStorage.setItem('queen_photo_roll_configs', JSON.stringify(next));
      return next;
    });
  };

  const updateSheetConfig = (
    id: string,
    updated: Partial<SheetPaperConfig>,
  ) => {
    setSheetConfigs((prev) => {
      const next = prev.map((cfg) =>
        cfg.id === id ? { ...cfg, ...updated } : cfg,
      );
      localStorage.setItem('queen_photo_sheet_configs', JSON.stringify(next));
      return next;
    });
  };

  const openOrderWithService = (service: ServiceItem) => {
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
    if (token.claims.staff !== true) {
      await signOut(auth);
      throw new Error(
        'Akun ini belum memiliki izin staf. Hubungi pemilik studio.',
      );
    }
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
      return `Link reset password resmi dari Google Firebase telah dikirim ke ${cleanEmail}. Silakan periksa kotak masuk (inbox) atau folder spam email Anda.`;
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/user-not-found') {
        throw new Error(
          `Email ${cleanEmail} belum terdaftar di database Firebase. Pastikan email sudah terdaftar.`,
        );
      } else if (code === 'auth/invalid-email') {
        throw new Error('Format alamat email tidak valid.');
      } else {
        throw new Error(
          err?.message || 'Gagal mengirim email reset password via Firebase.',
        );
      }
    }
  };

  const resetTwoFactorEmergency = async (): Promise<void> => {
    setIsTwoFactorEnabled(false);
    localStorage.setItem('queen_2fa_enabled', 'false');
    try {
      await setDoc(
        doc(db, 'admins', 'heroch94'),
        {
          isTwoFactorEnabled: false,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
    } catch {}
  };

  // REAL 3RD-PARTY GOOGLE AUTHENTICATOR (RFC 6238 TOTP ENGINE)
  const verifyTotpCode = (code: string, secretOverride?: string): boolean => {
    try {
      const secretToUse =
        secretOverride || twoFactorSecret || 'JBSWY3DPEHPK3PXP';
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

  const enableTwoFactor = async (
    secret: string,
    testCode: string,
  ): Promise<{ success: boolean; message: string }> => {
    const isValid = verifyTotpCode(testCode, secret);
    if (!isValid) {
      return {
        success: false,
        message:
          'Kode 6-digit tidak valid. Pastikan waktu jam di HP Anda sudah sinkron (otomatis) dan masukkan kode yang baru sebelum berganti.',
      };
    }

    const cleanSecret = secret.replace(/[\s-]/g, '').toUpperCase();
    setTwoFactorSecret(cleanSecret);
    setIsTwoFactorEnabled(true);
    localStorage.setItem('queen_2fa_secret', cleanSecret);
    localStorage.setItem('queen_2fa_enabled', 'true');

    try {
      await setDoc(
        doc(db, 'admins', 'heroch94'),
        {
          email: adminEmail,
          isTwoFactorEnabled: true,
          twoFactorSecret: cleanSecret,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
    } catch (e) {
      console.warn('Firestore 2fa save fallback:', e);
    }

    return {
      success: true,
      message:
        '2FA Google Authenticator berhasil diaktifkan dan terhubung ke HP Anda!',
    };
  };

  const disableTwoFactor = async (): Promise<void> => {
    setIsTwoFactorEnabled(false);
    localStorage.setItem('queen_2fa_enabled', 'false');
    try {
      await setDoc(
        doc(db, 'admins', 'heroch94'),
        {
          isTwoFactorEnabled: false,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
    } catch (e) {
      console.warn('Firestore 2fa disable fallback:', e);
    }
  };

  const generateNewTwoFactorSecret = (): string => {
    const sec = new OTPAuth.Secret({ size: 20 });
    return sec.base32;
  };

  const getOtpAuthUri = (secretStr?: string): string => {
    const s = (secretStr || twoFactorSecret || 'JBSWY3DPEHPK3PXP')
      .replace(/[\s-]/g, '')
      .toUpperCase();
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

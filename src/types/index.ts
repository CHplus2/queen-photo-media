export type UserRole = 'CUSTOMER' | 'ADMIN';

export type ServiceCategory =
  | 'cetak_foto'
  | 'pas_foto'
  | 'photostrip_polaroid'
  | 'foto_studio'
  | 'restorasi_edit'
  | 'merchandise'
  | 'banner';

export interface StockUsage {
  inventoryId: string;
  quantity: number;
}
export interface StaffStamp {
  uid: string;
  name: string;
}
export interface OrderEvent {
  type: 'created' | 'status' | 'payment' | 'cancelled';
  at: string;
  by: StaffStamp;
  detail: string;
}
export interface ServiceItem {
  english?: { name?: string; description?: string; unit?: string };
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  basePrice: number;
  estimatedCost: number; // HPP
  stockMode?: 'automatic' | 'none';
  materialUsage?: StockUsage[];
  paperType?: 'sheet' | 'roll' | 'merchandise' | 'service';
  unit: string;
  popular?: boolean;
  isActive?: boolean;
  imageUrl?: string;
  options?: {
    sizes?: string[];
    finishes?: string[];
    frames?: string[];
    framePrices?: Record<string, { price: number; cost: number }>;
    backgroundColors?: string[];
  };
}

export type PaperFinish =
  | 'Glossy Anti-Luntur'
  | 'Doff Matte'
  | 'Silk / Luster'
  | 'Kanvas Tekstur Roll';
export type FrameOption =
  | 'Tanpa Bingkai'
  | 'Minimalis Hitam'
  | 'Minimalis Putih'
  | 'Kayu Jati Elegan'
  | 'Ukiran Emas Klasik';

export type DeliveryMethod =
  | 'AMBIL_STUDIO'
  | 'GRAB_EXPRESS_PONTIANAK'
  | 'EKSPEDISI_KALBAR';

export type PaymentMethod =
  | 'QRIS'
  | 'TRANSFER_BANK'
  | 'TRANSFER_BCA'
  | 'TRANSFER_MANDIRI'
  | 'TRANSFER_BRI'
  | 'TUNAI_KASIR';

export type OrderStatus =
  | 'MENUNGGU_BAYAR'
  | 'ANTREAN_DESAIN'
  | 'PROSES_CETAK'
  | 'SIAP_DIAMBIL_KIRIM'
  | 'SELESAI'
  | 'DIBATALKAN';

export interface InventoryItem {
  id: string;
  name: string;
  type: 'ROLL' | 'SHEET' | 'MERCHANDISE' | 'FRAME';
  currentStock: number; // For ROLL: meters. For others: count.
  maxStock: number;
  unit: string;
  lowStockThreshold: number;
  costPerUnit: number;
  description: string;
}

export interface StockLog {
  id: string;
  timestamp: string;
  itemId: string;
  itemName: string;
  changeAmount: number;
  previousStock: number;
  newStock: number;
  reason: string;
  orderId?: string;
  by?: StaffStamp;
}

export type OrderChannel = 'ONLINE' | 'WALKIN';

export interface OrderItem {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceNameEn?: string;
  category: ServiceCategory;
  size: string;
  finish?: string;
  frame?: string;
  backgroundColor?: string;
  notes?: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  photoUrl?: string;
  photoFileName?: string;
}

export interface PaymentEntry {
  id: string;
  amount: number;
  method: PaymentMethod;
  at: string;
  by: StaffStamp;
}

export interface Order {
  id: string; // e.g., QP-2610-001
  createdAt: string;
  ownerUid?: string;
  workflowVersion?: 2;
  recordedBy?: StaffStamp;
  paymentVerifiedBy?: StaffStamp;
  paidAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  inventoryStatus?:
    | 'COUNTED'
    | 'PENDING'
    | 'DEDUCTED'
    | 'RELEASED'
    | 'WASTED'
    | 'NEEDS_REVIEW'
    | 'NOT_REQUIRED';
  materialUsage?: StockUsage[];
  inventoryWarnings?: string[];
  history?: OrderEvent[];
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  district?: string; // Pontianak Kota, Pontianak Selatan, etc.
  channel: OrderChannel;
  deliveryMethod: DeliveryMethod;
  deliveryFee: number;
  items: OrderItem[];
  subtotal: number;
  totalAmount: number;
  totalCost: number; // HPP
  totalProfit: number; // Untung Bersih
  paymentMethod: PaymentMethod;
  paymentStatus: 'BELUM_BAYAR' | 'SEBAGIAN' | 'LUNAS';
  payments?: PaymentEntry[];
  initialPaymentAmount?: number;
  stockExceptionReason?: string;
  orderStatus: OrderStatus;
  staffNotes?: string;
  trackingNumber?: string;
  receiptProofUrl?: string;
  estimatedReadyTime?: string;
}

export interface RollPaperConfig {
  id: string;
  name: string;
  rollWidthCm: number;
  rollLengthMeter: number;
  rollCostIdr: number; // e.g. 420.000
  inkCostPerSqMeter: number; // e.g. 15.000
  overheadPerUnit: number; // e.g. 500
}

export interface SheetPaperConfig {
  id: string;
  sizeName: string; // 4R, 10R, A4, etc.
  costPerSheetIdr: number;
  inkCostIdr: number;
  overheadIdr: number;
}

export type AgeDemographic = '<20' | '20-29' | '30-45' | '>45';

export interface CustomerFeedbackSurvey {
  ownerUid?: string;
  id: string;
  createdAt: string;
  customerName?: string;
  customerPhone?: string;
  ageBracket: AgeDemographic;
  primaryNeed: string;
  pastPrintingComparison: string;
  demandedNewServices: string[];
  improvementPriority: string;
  satisfactionRating: number;
  feedbackText?: string;
  claimedDiscountCode?: string;
}

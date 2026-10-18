import { businessDate, reportableOrders, salesSummary } from '../utils/sales';
import { useDialog } from '../hooks/useDialog';
import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { Order, OrderStatus, OrderChannel, PaymentMethod } from '../types';
import {
  formatRupiah,
  formatDateTime,
  generateWhatsAppRecapText,
  createWhatsAppOrderLink,
} from '../utils/formatters';
import {
  Plus,
  Search,
  Share2,
  CheckCircle2,
  Clock,
  Printer,
  MessageSquare,
  User,
  Smartphone,
  CreditCard,
  Check,
  Trash2,
  Eye,
  X,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  Layers,
  ShieldCheck,
} from 'lucide-react';

interface AdminPosViewProps {
  onPrintReceipt: (order: Order) => void;
}

export const AdminPosView: React.FC<AdminPosViewProps> = ({
  onPrintReceipt,
}) => {
  const {
    orders,
    services,
    addOrder,
    updateOrderStatus,
    updateOrderPayment,
    deleteOrder,
    monthlyRevenueTarget,
    seedFirestoreDataNow,
    isSyncing,
  } = useStudio();

  // POS Form state for quick Walk-in customer
  const [showWalkinForm, setShowWalkinForm] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(
    services[0]?.id || 'cetak-4r',
  );
  const [walkinQty, setWalkinQty] = useState(1);
  const [walkinPaymentMethod, setWalkinPaymentMethod] =
    useState<PaymentMethod>('TUNAI_KASIR');
  const [walkinNotes, setWalkinNotes] = useState('');

  // Selected Order for Full Detail Modal
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const detailRef = useDialog<HTMLDivElement>(Boolean(detailOrder), () =>
    setDetailOrder(null),
  );

  // Table filters & Quick Tabs
  const [activeTab, setActiveTab] = useState<
    'ALL' | 'ONLINE' | 'WALKIN' | 'ACTIVE' | 'DONE' | 'CANCELLED'
  >('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedRecap, setCopiedRecap] = useState(false);
  const [actionAlert, setActionAlert] = useState<string>('');

  // Handle Quick Walk-in Submit
  const handleWalkinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName.trim()) {
      alert('Mohon isi nama pelanggan walk-in.');
      return;
    }

    const service =
      services.find((s) => s.id === selectedServiceId) || services[0];
    const unitPrice = service.basePrice;
    const unitCost = service.estimatedCost;
    const subtotal = unitPrice * walkinQty;
    const totalCost = unitCost * walkinQty;
    const totalProfit = subtotal - totalCost;

    try {
      const newOrder = await addOrder({
        customerName: walkinName,
        customerPhone: walkinPhone || '08xxxxxxxx',
        customerAddress: 'Walk-in Kasir Studio (Jl. Gajah Mada)',
        channel: 'WALKIN',
        deliveryMethod: 'AMBIL_STUDIO',
        deliveryFee: 0,
        subtotal,
        totalAmount: subtotal,
        totalCost,
        totalProfit,
        paymentMethod: walkinPaymentMethod,
        paymentStatus: 'LUNAS',
        orderStatus: 'PROSES_CETAK',
        staffNotes: walkinNotes || 'Pelanggan datang langsung ke toko',
        items: [
          {
            id: `walkin-item-${Date.now()}`,
            serviceId: service.id,
            serviceName: service.name,
            category: service.category,
            size: service.unit,
            quantity: walkinQty,
            unitPrice,
            unitCost,
          },
        ],
      });

      // Reset form
      setWalkinName('');
      setWalkinPhone('');
      setWalkinQty(1);
      setWalkinNotes('');
      setShowWalkinForm(false);
      setActionAlert(
        `Transaksi Walk-in #${newOrder.id} berhasil dicatat! Stok bahan otomatis terpotong.`,
      );
      setTimeout(() => setActionAlert(''), 5000);
      onPrintReceipt(newOrder);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Transaksi belum tersimpan. Silakan coba lagi.',
      );
    }
  };

  // Copy WhatsApp Daily Recap
  const handleCopyWhatsAppRecap = () => {
    const recapText = generateWhatsAppRecapText(orders, monthlyRevenueTarget);
    navigator.clipboard.writeText(recapText);
    setCopiedRecap(true);
    setTimeout(() => setCopiedRecap(false), 2500);

    const encoded = encodeURIComponent(recapText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // Filter logic
  const filteredOrders = orders.filter((o) => {
    // Tab filter
    if (activeTab === 'ONLINE' && o.channel !== 'ONLINE') return false;
    if (activeTab === 'WALKIN' && o.channel !== 'WALKIN') return false;
    if (
      activeTab === 'ACTIVE' &&
      (o.orderStatus === 'SELESAI' || o.orderStatus === 'DIBATALKAN')
    )
      return false;
    if (activeTab === 'DONE' && o.orderStatus !== 'SELESAI') return false;
    if (activeTab === 'CANCELLED' && o.orderStatus !== 'DIBATALKAN')
      return false;

    // Search filter
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchId = o.id.toLowerCase().includes(q);
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchPhone = o.customerPhone.includes(q);
      const matchItems = o.items.some((it) =>
        it.serviceName.toLowerCase().includes(q),
      );
      return matchId || matchName || matchPhone || matchItems;
    }

    return true;
  });

  // Calculate metrics
  const todayStr = businessDate(new Date());
  const todayOrders = reportableOrders(orders, todayStr);
  const todayRevenue = salesSummary(todayOrders).revenue;
  const todayProfit = salesSummary(todayOrders).profit;

  const onlineCount = orders.filter((o) => o.channel === 'ONLINE').length;
  const walkinCount = orders.filter((o) => o.channel === 'WALKIN').length;
  const activeCount = orders.filter(
    (o) => o.orderStatus !== 'SELESAI' && o.orderStatus !== 'DIBATALKAN',
  ).length;
  const doneCount = orders.filter((o) => o.orderStatus === 'SELESAI').length;
  const cancelledCount = orders.filter(
    (o) => o.orderStatus === 'DIBATALKAN',
  ).length;

  return (
    <div className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-amber-800 text-xs font-semibold uppercase tracking-wider">
              Sistem Kasir & Operasional Studio
            </span>
            <span className="text-[10px] bg-stone-900 text-stone-200 tabular-nums px-2 py-0.5 rounded-full">
              {orders.length} Pesanan Tercatat
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            Kasir & pesanan
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-0.5">
            Kelola pesanan website dan catat transaksi pelanggan yang datang ke
            studio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowWalkinForm(!showWalkinForm)}
            className="qp-button"
          >
            <Plus className="w-4 h-4" />
            <span>
              {showWalkinForm ? 'Tutup Kasir' : 'Catat penjualan walk-in'}
            </span>
          </button>

          <button
            onClick={handleCopyWhatsAppRecap}
            className="qp-button qp-button-secondary"
          >
            <Share2 className="w-4 h-4" />
            <span>{copiedRecap ? 'Tersalin ke WA!' : 'Kirim Rekap WA'}</span>
          </button>
        </div>
      </div>

      {/* Action notification banner */}
      {actionAlert && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionAlert}</span>
          </div>
          <button
            onClick={() => setActionAlert('')}
            className="text-emerald-700 hover:text-emerald-950"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm">
          <p className="text-xs text-stone-500 font-medium">
            Omset Hari Ini ({todayOrders.length} Pesanan)
          </p>
          <p className="text-xl font-bold tabular-nums tabular-nums text-stone-900 mt-1">
            {formatRupiah(todayRevenue)}
          </p>
          <p className="text-[11px] text-emerald-700 mt-0.5">
            Estimasi laba kotor: {formatRupiah(todayProfit)}
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm">
          <p className="text-xs text-stone-500 font-medium">
            Antrean Sedang Dikerjakan
          </p>
          <p className="text-xl font-bold tabular-nums tabular-nums text-amber-800 mt-1">
            {activeCount}
          </p>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Antrean desain & mesin minilab
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm">
          <p className="text-xs text-stone-500 font-medium">
            Siap Diambil / Kirim Grab
          </p>
          <p className="text-xl font-bold tabular-nums tabular-nums text-indigo-700 mt-1">
            {
              orders.filter((o) => o.orderStatus === 'SIAP_DIAMBIL_KIRIM')
                .length
            }
          </p>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Menunggu kurir / pelanggan
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm">
          <p className="text-xs text-stone-500 font-medium">
            Saluran Penjualan
          </p>
          <p className="text-xl font-bold tabular-nums tabular-nums text-stone-900 mt-1">
            {walkinCount} Toko : {onlineCount} Online
          </p>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Walk-in Kasir vs GrabExpress
          </p>
        </div>
      </div>

      {/* QUICK WALKIN COUNTER FORM */}
      {showWalkinForm && (
        <form
          onSubmit={handleWalkinSubmit}
          className="p-6 bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 shadow-xl space-y-4 animate-in fade-in duration-200"
        >
          <label className="flex gap-2 text-sm text-stone-900 p-3 bg-amber-50">
            <input type="checkbox" required />
            Saya sudah menerima dan memeriksa pembayaran pelanggan.
          </label>
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <h3 className="text-base font-bold text-amber-300">
              Kasir Cepat Walk-In Studio (Pelanggan Datang Langsung)
            </h3>
            <span className="text-xs text-stone-300">
              Otomatis menghitung HPP kertas/tinta & memotong stok inventaris
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                className="block text-xs text-stone-300 font-medium mb-1"
                htmlFor="adminposview-field-1"
              >
                Nama Pelanggan: *
              </label>
              <input
                id="adminposview-field-1"
                type="text"
                required
                value={walkinName}
                onChange={(e) => setWalkinName(e.target.value)}
                placeholder="Contoh: Pak Herman / Sisca"
                className="w-full text-xs sm:text-sm bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label
                className="block text-xs text-stone-300 font-medium mb-1"
                htmlFor="adminposview-field-2"
              >
                No. HP / WhatsApp (Opsional):
              </label>
              <input
                id="adminposview-field-2"
                type="text"
                value={walkinPhone}
                onChange={(e) => setWalkinPhone(e.target.value)}
                placeholder="08xxxxxxxx"
                className="w-full text-xs sm:text-sm bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label
                className="block text-xs text-stone-300 font-medium mb-1"
                htmlFor="adminposview-field-3"
              >
                Metode Pembayaran:
              </label>
              <select
                id="adminposview-field-3"
                value={walkinPaymentMethod}
                onChange={(e) =>
                  setWalkinPaymentMethod(e.target.value as PaymentMethod)
                }
                className="w-full text-xs sm:text-sm bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100"
              >
                <option value="TUNAI_KASIR">Uang Tunai (Kasir Toko)</option>
                <option value="QRIS">QRIS Statis / Dinamis</option>
                <option value="TRANSFER_BCA">Transfer Bank BCA</option>
                <option value="TRANSFER_MANDIRI">Transfer Bank Mandiri</option>
                <option value="TRANSFER_BRI">Transfer Bank BRI</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label
                className="block text-xs text-stone-300 font-medium mb-1"
                htmlFor="adminposview-field-4"
              >
                Pilih Layanan / Produk yang Dibeli:
              </label>
              <select
                id="adminposview-field-4"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full text-xs sm:text-sm bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - {formatRupiah(s.basePrice)} (HPP:{' '}
                    {formatRupiah(s.estimatedCost)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-xs text-stone-300 font-medium mb-1"
                htmlFor="adminposview-field-5"
              >
                Jumlah (Qty):
              </label>
              <input
                id="adminposview-field-5"
                type="number"
                min="1"
                value={walkinQty}
                onChange={(e) => setWalkinQty(parseInt(e.target.value) || 1)}
                className="w-full text-xs sm:text-sm bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 tabular-nums"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-xs text-stone-300 font-medium mb-1"
              htmlFor="adminposview-field-6"
            >
              Catatan Order (Ukuran pas foto, warna latar, no frame, dll):
            </label>
            <input
              id="adminposview-field-6"
              type="text"
              value={walkinNotes}
              onChange={(e) => setWalkinNotes(e.target.value)}
              placeholder="Contoh: Pas foto 4x6 4 lbr latar merah, mau diambil jam 4 sore"
              className="w-full text-xs sm:text-sm bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowWalkinForm(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-300 hover:text-stone-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Transaksi & Cetak Struk</span>
            </button>
          </div>
        </form>
      )}

      {/* QUICK STATUS TABS & SEARCH */}
      <div className="space-y-3">
        {/* Tab row */}
        <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-2">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ALL'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Semua Pesanan ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('ONLINE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ONLINE'
                ? 'bg-amber-400 text-stone-950 shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Online Grab ({onlineCount})
          </button>

          <button
            onClick={() => setActiveTab('WALKIN')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'WALKIN'
                ? 'bg-amber-400 text-stone-950 shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Walk-In Toko ({walkinCount})
          </button>

          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ACTIVE'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Antrean Proses ({activeCount})
          </button>

          <button
            onClick={() => setActiveTab('DONE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'DONE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Selesai ({doneCount})
          </button>

          <button
            onClick={() => setActiveTab('CANCELLED')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'CANCELLED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Dibatalkan ({cancelledCount})
          </button>
        </div>

        {/* Filter search bar */}
        <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Cari ID pesanan, nama, nomor HP..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500 w-full sm:w-auto justify-between sm:justify-end">
            <span>
              Menampilkan <strong>{filteredOrders.length}</strong> dari{' '}
              {orders.length} pesanan
            </span>
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="text-amber-800 hover:underline font-medium text-[11px]"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE ORDERS LIST (Cards view for smartphones) */}
      <div className="md:hidden space-y-3">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const marginPct =
              order.totalAmount > 0
                ? Math.round((order.totalProfit / order.totalAmount) * 100)
                : 0;

            return (
              <div
                key={order.id}
                className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums font-bold text-stone-900 text-sm">
                        #{order.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          order.channel === 'WALKIN'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        {order.channel === 'WALKIN' ? 'TOKO' : 'ONLINE'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-stone-900 block text-sm">
                      {formatRupiah(order.totalAmount)}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium">
                      +{formatRupiah(order.totalProfit)} ({marginPct}%)
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 text-xs">
                  <div className="font-semibold text-stone-900">
                    {order.customerName} ·{' '}
                    <span className="tabular-nums text-stone-600">
                      {order.customerPhone}
                    </span>
                  </div>
                  <div className="text-stone-600 mt-1 space-y-0.5">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="truncate">
                        • {it.quantity}x {it.serviceName} (
                        {it.size || it.finish || 'Standar'})
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-stone-500 font-medium">
                      Status:
                    </span>
                    <select
                      aria-label={`Status pesanan ${order.id}`}
                      value={order.orderStatus}
                      onChange={async (e) => {
                        const newStatus = e.target.value as OrderStatus;
                        await updateOrderStatus(order.id, newStatus);
                        if (newStatus === 'DIBATALKAN') {
                          setActionAlert(
                            `Status #${order.id} diubah ke DIBATALKAN. Stok bahan dikembalikan.`,
                          );
                        } else {
                          setActionAlert(`Status #${order.id} diperbarui.`);
                        }
                        setTimeout(() => setActionAlert(''), 5000);
                      }}
                      className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border min-h-[38px] ${
                        order.orderStatus === 'SELESAI'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : order.orderStatus === 'SIAP_DIAMBIL_KIRIM'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : order.orderStatus === 'PROSES_CETAK'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : order.orderStatus === 'DIBATALKAN'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      <option value="MENUNGGU_BAYAR">Menunggu Bayar</option>
                      <option value="ANTREAN_DESAIN">Antrean Desain</option>
                      <option value="PROSES_CETAK">Proses Cetak</option>
                      <option value="SIAP_DIAMBIL_KIRIM">
                        Siap Kirim / Diambil
                      </option>
                      <option value="SELESAI">Selesai</option>
                      <option value="DIBATALKAN">Dibatalkan</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setDetailOrder(order)}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1 min-h-[36px]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detail</span>
                    </button>
                    <button
                      onClick={() => onPrintReceipt(order)}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1 min-h-[36px]"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Struk</span>
                    </button>
                    <a
                      href={createWhatsAppOrderLink(order)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1 min-h-[36px]"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WA</span>
                    </a>
                    <button
                      onClick={() => {
                        if (confirm(`Batalkan transaksi #${order.id}?`)) {
                          updateOrderStatus(order.id, 'DIBATALKAN').catch(() =>
                            alert('Gagal membatalkan pesanan.'),
                          );
                        }
                      }}
                      aria-label={`Batalkan pesanan ${order.id}`}
                      className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500">
            <p className="font-semibold text-stone-600">
              Tidak ada pesanan pada filter ini.
            </p>
          </div>
        )}
      </div>

      {/* MASTER ORDERS TABLE (Desktop view) */}
      <div className="hidden md:block bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3.5">ID & Waktu</th>
                <th className="px-4 py-3.5">Pelanggan</th>
                <th className="px-4 py-3.5">Item & Layanan</th>
                <th className="px-4 py-3.5">Pengiriman</th>
                <th className="px-4 py-3.5 text-right">Omset</th>
                <th className="px-4 py-3.5 text-right">Laba (Margin)</th>
                <th className="px-4 py-3.5">Status Pengerjaan</th>
                <th className="px-4 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const marginPct =
                    order.totalAmount > 0
                      ? Math.round(
                          (order.totalProfit / order.totalAmount) * 100,
                        )
                      : 0;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-stone-50/70 transition-colors"
                    >
                      {/* ID & Time */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="tabular-nums font-bold text-stone-900 block">
                          #{order.id}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {formatDateTime(order.createdAt)}
                        </span>
                        <span
                          className={`text-[10px] inline-block font-semibold px-1.5 py-0.2 rounded mt-0.5 ${
                            order.channel === 'WALKIN'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-blue-100 text-blue-900'
                          }`}
                        >
                          {order.channel === 'WALKIN' ? 'TOKO' : 'ONLINE'}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3">
                        <span className="font-semibold text-stone-900 block">
                          {order.customerName}
                        </span>
                        <span className="text-[11px] text-stone-500 tabular-nums">
                          {order.customerPhone}
                        </span>
                      </td>

                      {/* Items */}
                      <td className="px-4 py-3 max-w-xs">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="truncate">
                            <span className="font-medium text-stone-800">
                              {it.quantity}x {it.serviceName}
                            </span>
                            <span className="text-[11px] text-stone-500 block truncate">
                              {it.size} {it.finish ? `· ${it.finish}` : ''}
                            </span>
                          </div>
                        ))}
                      </td>

                      {/* Delivery */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="block font-medium text-stone-800">
                          {order.deliveryMethod === 'GRAB_EXPRESS_PONTIANAK'
                            ? 'GrabExpress'
                            : 'Ambil di Studio'}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {order.district || 'Jl. Gajah Mada'}
                        </span>
                      </td>

                      {/* Omset */}
                      <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums tabular-nums font-bold text-stone-900">
                        {formatRupiah(order.totalAmount)}
                        <span className="block text-[10px] font-normal text-stone-500 font-sans">
                          {order.paymentMethod.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Laba */}
                      <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums tabular-nums text-emerald-700 font-bold">
                        {formatRupiah(order.totalProfit)}
                        <span className="block text-[10px] font-normal text-stone-500 font-sans">
                          {marginPct}% margin
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          aria-label={`Status pesanan ${order.id}`}
                          value={order.orderStatus}
                          onChange={async (e) => {
                            const newStatus = e.target.value as OrderStatus;
                            await updateOrderStatus(order.id, newStatus);
                            if (newStatus === 'DIBATALKAN') {
                              setActionAlert(
                                `Status #${order.id} diubah ke DIBATALKAN. Stok bahan otomatis dikembalikan ke inventaris!`,
                              );
                            } else {
                              setActionAlert(
                                `Status pesanan #${order.id} diperbarui menjadi ${newStatus.replace(/_/g, ' ')}`,
                              );
                            }
                            setTimeout(() => setActionAlert(''), 5000);
                          }}
                          className={`text-[11px] font-semibold rounded-md px-2 py-1 border transition-colors ${
                            order.orderStatus === 'SELESAI'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : order.orderStatus === 'SIAP_DIAMBIL_KIRIM'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : order.orderStatus === 'PROSES_CETAK'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : order.orderStatus === 'DIBATALKAN'
                                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                                    : 'bg-stone-100 text-stone-700 border-stone-200'
                          }`}
                        >
                          <option value="MENUNGGU_BAYAR">Menunggu Bayar</option>
                          <option value="ANTREAN_DESAIN">Antrean Desain</option>
                          <option value="PROSES_CETAK">Proses Cetak</option>
                          <option value="SIAP_DIAMBIL_KIRIM">
                            Siap Kirim / Diambil
                          </option>
                          <option value="SELESAI">Selesai</option>
                          <option value="DIBATALKAN">
                            Dibatalkan (Kembalikan Stok)
                          </option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            title="Lihat Detail Lengkap & Foto"
                            onClick={() => setDetailOrder(order)}
                            className="p-1.5 rounded-md hover:bg-stone-200 text-stone-700 hover:text-stone-900 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            title="Cetak Nota / Struk Kasir"
                            onClick={() => onPrintReceipt(order)}
                            className="p-1.5 rounded-md hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <a
                            title="Kirim Notifikasi WA ke Pelanggan"
                            href={createWhatsAppOrderLink(order)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-md hover:bg-emerald-100 text-emerald-700 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>

                          <button
                            title="Batalkan Transaksi"
                            onClick={() => {
                              if (confirm(`Batalkan transaksi #${order.id}?`)) {
                                updateOrderStatus(order.id, 'DIBATALKAN').catch(
                                  () => alert('Gagal membatalkan pesanan.'),
                                );
                              }
                            }}
                            className="p-1.5 rounded-md hover:bg-rose-100 text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-stone-500"
                  >
                    <p className="font-semibold text-stone-600">
                      Tidak ada pesanan pada filter ini.
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      Ganti tab filter atau gunakan pencarian lain.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-sm p-4">
          <div
            ref={detailRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Rincian pesanan"
            className="qp-dialog !max-w-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-stone-900 text-white">
              <div>
                <span className="block break-all text-xs text-amber-400 tabular-nums font-bold">
                  #{detailOrder.id}
                </span>
                <h3 className="text-base font-bold">
                  Detail Pesanan: {detailOrder.customerName}
                </h3>
              </div>
              <button
                aria-label="Tutup rincian pesanan"
                onClick={() => setDetailOrder(null)}
                className="qp-icon-button text-stone-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Customer & Delivery Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
                <div>
                  <span className="text-stone-500 text-[10px] uppercase font-bold tracking-wider">
                    Informasi Pelanggan
                  </span>
                  <p className="font-bold text-stone-900 text-sm mt-0.5">
                    {detailOrder.customerName}
                  </p>
                  <p className="text-stone-600 tabular-nums mt-0.5">
                    {detailOrder.customerPhone}
                  </p>
                  <p className="text-stone-500 mt-1">
                    Saluran:{' '}
                    <strong>
                      {detailOrder.channel === 'ONLINE'
                        ? 'Website Online'
                        : 'Kasir Toko (Walk-In)'}
                    </strong>
                  </p>
                </div>

                <div>
                  <span className="text-stone-500 text-[10px] uppercase font-bold tracking-wider">
                    Pengiriman & Alamat
                  </span>
                  <p className="font-bold text-stone-900 mt-0.5">
                    {detailOrder.deliveryMethod === 'GRAB_EXPRESS_PONTIANAK'
                      ? 'Kurir GrabExpress Pontianak'
                      : 'Ambil di Studio'}
                  </p>
                  <p className="text-stone-600 mt-0.5">
                    {detailOrder.customerAddress || 'Jl. Gajah Mada, Pontianak'}
                  </p>
                  {detailOrder.district && (
                    <span className="inline-block mt-1 bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[11px] font-semibold">
                      Kecamatan: {detailOrder.district}
                    </span>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <span className="text-stone-500 text-[11px] font-bold uppercase tracking-wider">
                  Item Foto & Produk yang Dipesan
                </span>
                <div className="space-y-3">
                  {detailOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 p-4 rounded-xl border border-stone-200 bg-white"
                    >
                      {item.photoUrl ? (
                        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-stone-200 bg-stone-100">
                          <img
                            src={item.photoUrl}
                            alt="Foto pesanan"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 shrink-0 text-center p-2 text-[10px]">
                          Foto Fisik / Studio
                        </div>
                      )}

                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-stone-900 text-sm">
                              {item.serviceName}
                            </h4>
                            <p className="text-stone-500 text-xs">
                              Ukuran / Varian: <strong>{item.size}</strong>
                            </p>
                          </div>
                          <span className="tabular-nums font-bold text-stone-900">
                            {formatRupiah(item.unitPrice * item.quantity)}
                          </span>
                        </div>

                        {item.finish && (
                          <p className="text-stone-600 text-[11px]">
                            Kertas: {item.finish}
                          </p>
                        )}
                        {item.frame && (
                          <p className="text-stone-600 text-[11px]">
                            Bingkai: {item.frame}
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-amber-800 text-[11px] bg-amber-50 p-1.5 rounded mt-1">
                            Catatan Pelanggan: "{item.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal Item:</span>
                  <span className="tabular-nums">
                    {formatRupiah(detailOrder.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Ongkos Kirim GrabExpress:</span>
                  <span className="tabular-nums">
                    {formatRupiah(detailOrder.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-stone-900 text-sm border-t border-stone-200 pt-2">
                  <span>Total Transaksi (Omset):</span>
                  <span className="tabular-nums">
                    {formatRupiah(detailOrder.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-500 text-[11px] pt-1">
                  <span>Estimasi Biaya Bahan (HPP Kertas & Tinta):</span>
                  <span className="tabular-nums">
                    {formatRupiah(detailOrder.totalCost)}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold text-xs">
                  <span>Estimasi Laba Kotor:</span>
                  <span className="tabular-nums">
                    {formatRupiah(detailOrder.totalProfit)}
                  </span>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-stone-700 font-semibold mb-1"
                    htmlFor="adminposview-field-7"
                  >
                    Status Pengerjaan:
                  </label>
                  <select
                    id="adminposview-field-7"
                    value={detailOrder.orderStatus}
                    onChange={async (e) => {
                      const newStatus = e.target.value as OrderStatus;
                      await updateOrderStatus(detailOrder.id, newStatus);
                      setDetailOrder({
                        ...detailOrder,
                        orderStatus: newStatus,
                      });
                      if (newStatus === 'DIBATALKAN') {
                        setActionAlert(
                          `Status #${detailOrder.id} diubah ke DIBATALKAN. Stok bahan otomatis dikembalikan ke inventaris!`,
                        );
                      }
                    }}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs font-semibold"
                  >
                    <option value="MENUNGGU_BAYAR">Menunggu Bayar</option>
                    <option value="ANTREAN_DESAIN">Antrean Desain</option>
                    <option value="PROSES_CETAK">Proses Cetak Mesin</option>
                    <option value="SIAP_DIAMBIL_KIRIM">
                      Siap Diambil / Kirim Grab
                    </option>
                    <option value="SELESAI">Selesai</option>
                    <option value="DIBATALKAN">Dibatalkan</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-stone-700 font-semibold mb-1"
                    htmlFor="adminposview-field-8"
                  >
                    Status Pembayaran:
                  </label>
                  <select
                    id="adminposview-field-8"
                    value={detailOrder.paymentStatus}
                    onChange={async (e) => {
                      const newPay = e.target.value as 'BELUM_BAYAR' | 'LUNAS';
                      if (
                        newPay === 'LUNAS' &&
                        !window.confirm(
                          'Pembayaran sudah benar-benar diterima dan diperiksa?',
                        )
                      )
                        return;
                      try {
                        await updateOrderPayment(detailOrder.id, newPay);
                      } catch {
                        alert(
                          'Perubahan pembayaran belum tersimpan. Coba kembali.',
                        );
                        return;
                      }
                      setDetailOrder({ ...detailOrder, paymentStatus: newPay });
                    }}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs font-semibold"
                  >
                    <option value="LUNAS">
                      LUNAS ({detailOrder.paymentMethod})
                    </option>
                    <option value="BELUM_BAYAR">BELUM BAYAR</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-4 bg-stone-100 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <a
                href={createWhatsAppOrderLink(detailOrder)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Kirim Notifikasi via WhatsApp</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onPrintReceipt(detailOrder);
                  }}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Struk / Nota</span>
                </button>

                <button
                  onClick={() => setDetailOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

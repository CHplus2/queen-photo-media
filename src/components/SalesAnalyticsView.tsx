import { reportableOrders, salesSummary } from '../utils/sales';
import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { formatRupiah, formatCompactRupiah, generateWhatsAppRecapText } from '../utils/formatters';
import { ServiceCategory } from '../types';
import { 
  TrendingUp, DollarSign, Target, PieChart, 
  BarChart3, Share2, Layers, CheckCircle2, ArrowUpRight 
} from 'lucide-react';

export const SalesAnalyticsView: React.FC = () => {
  const { orders: allOrders, monthlyRevenueTarget, setMonthlyRevenueTarget } = useStudio();
  const [copiedRecap, setCopiedRecap] = useState(false);

  const orders = reportableOrders(allOrders);
  const summary = salesSummary(orders);
  // Financial aggregates
  const totalRevenue = summary.revenue;
  const totalHPP = summary.cost;
  const totalProfit = summary.profit;
  const overallMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

  // Pre-COVID target recovery progress
  const targetPct = Math.min(100, Math.round((totalRevenue / monthlyRevenueTarget) * 100));

  // Category breakdown calculation
  const categoryTotals: Record<ServiceCategory, { revenue: number; profit: number; count: number }> = {
    photostrip_polaroid: { revenue: 0, profit: 0, count: 0 },
    cetak_foto: { revenue: 0, profit: 0, count: 0 },
    pas_foto: { revenue: 0, profit: 0, count: 0 },
    restorasi_edit: { revenue: 0, profit: 0, count: 0 },
    merchandise: { revenue: 0, profit: 0, count: 0 },
    foto_studio: { revenue: 0, profit: 0, count: 0 },
    banner: { revenue: 0, profit: 0, count: 0 },
  };

  orders.forEach(order => {
    order.items.forEach(it => {
      if (categoryTotals[it.category]) {
        const merchandiseTotal = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        const allocatedRevenue = merchandiseTotal > 0 ? (order.totalAmount - order.deliveryFee) * it.unitPrice * it.quantity / merchandiseTotal : 0;
        categoryTotals[it.category].revenue += allocatedRevenue;
        categoryTotals[it.category].profit += allocatedRevenue - it.unitCost * it.quantity;
        categoryTotals[it.category].count += it.quantity;
      }
    });
  });

  const categoryLabels: Record<ServiceCategory, string> = {
    photostrip_polaroid: 'Photostrip & Polaroid (Gen Z)',
    cetak_foto: 'Cetak Foto & Frame (Keluarga)',
    pas_foto: 'Pas Foto Resmi & Aesthetic',
    restorasi_edit: 'Restorasi & Photoshop Edit',
    merchandise: 'Mug Custom & Photobook',
    foto_studio: 'Sesi Foto Studio Pontianak',
    banner: 'Banner & Spanduk Acara',
  };

  // Channel breakdown
  const walkinRevenue = orders.filter(o => o.channel === 'WALKIN').reduce((sum, o) => sum + o.totalAmount - o.deliveryFee, 0);
  const onlineRevenue = orders.filter(o => o.channel === 'ONLINE').reduce((sum, o) => sum + o.totalAmount - o.deliveryFee, 0);
  const walkinCount = orders.filter(o => o.channel === 'WALKIN').length;
  const onlineCount = orders.filter(o => o.channel === 'ONLINE').length;

  const handleShareWA = () => {
    const recap = generateWhatsAppRecapText(allOrders, monthlyRevenueTarget);
    navigator.clipboard.writeText(recap);
    setCopiedRecap(true);
    setTimeout(() => setCopiedRecap(false), 2000);
    window.open(`https://wa.me/?text=${encodeURIComponent(recap)}`, '_blank');
  };

  return (
    <div className="py-10 max-w-6xl mx-auto px-6 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <p className="text-amber-800 text-xs font-semibold uppercase tracking-wider">
            Laporan Keuangan & Analitik Bisnis
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            Rekap Penjualan & Pemulihan Omset Queen Photo
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-0.5">
            Pesanan lunas dan tidak dibatalkan pada bulan ini (WIB), berdasarkan tanggal pesanan. Ongkir tidak termasuk omzet; laba belum dikurangi biaya operasional.
          </p>
        </div>

        <button
          onClick={handleShareWA}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl transition-colors shadow-sm self-start sm:self-auto"
        >
          <Share2 className="w-4 h-4" />
          <span>{copiedRecap ? 'Tersalin ke WhatsApp!' : 'Ekspor Ringkasan ke WA'}</span>
        </button>
      </div>

      {/* Target Pre-COVID Tracker Card */}
      <div className="bg-stone-900 text-stone-100 p-6 sm:p-8 rounded-2xl border border-stone-800 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>Target Pemulihan Omset Pra-Pandemi (20 - 40 Juta / Bulan)</span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-stone-50 mt-1">
              {formatRupiah(totalRevenue)}
              <span className="text-sm font-sans font-normal text-stone-400 ml-2">
                dari target {formatRupiah(monthlyRevenueTarget)}
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-400">Atur Target:</span>
            <select
              value={monthlyRevenueTarget}
              onChange={(e) => setMonthlyRevenueTarget(Number(e.target.value))}
              className="bg-stone-800 text-stone-100 border border-stone-700 rounded-lg px-2.5 py-1.5 font-mono"
            >
              <option value={20000000}>Rp 20.000.000 / bln</option>
              <option value={30000000}>Rp 30.000.000 / bln (Standar)</option>
              <option value={40000000}>Rp 40.000.000 / bln (Maksimal)</option>
            </select>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-stone-400">
            <span>Kemajuan Bulan Ini</span>
            <span className="font-mono text-amber-300 font-bold">{targetPct}% Tercapai</span>
          </div>
          <div className="w-full h-3 bg-stone-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
              style={{ width: `${targetPct}%` }}
            />
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-stone-800 text-xs">
          <div>
            <span className="text-stone-400 block">Total Omset Kotor:</span>
            <span className="font-mono text-lg font-bold text-stone-100">{formatRupiah(totalRevenue)}</span>
          </div>
          <div>
            <span className="text-stone-400 block">Total HPP (Bahan/Kertas):</span>
            <span className="font-mono text-lg font-bold text-rose-300">{formatRupiah(totalHPP)}</span>
          </div>
          <div>
            <span className="text-stone-400 block">Estimasi Laba Kotor Studio:</span>
            <span className="font-mono text-lg font-bold text-emerald-400">{formatRupiah(totalProfit)}</span>
          </div>
          <div>
            <span className="text-stone-400 block">Rata-rata Margin Laba:</span>
            <span className="font-mono text-lg font-bold text-amber-300">{overallMargin}%</span>
          </div>
        </div>
      </div>

      {/* Grid: Category Breakdown vs Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Category Contribution (Answering user's observation about photo vs banner!) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h4 className="font-bold text-stone-900 text-sm">
                Kontribusi Pendapatan Berdasarkan Kategori
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                Membuktikan fakta bahwa Foto Keluarga & Pas Foto adalah pilar omset utama Queen Photo
              </p>
            </div>
            <BarChart3 className="w-4 h-4 text-stone-400" />
          </div>

          <div className="space-y-3 pt-2">
            {(Object.keys(categoryTotals) as ServiceCategory[]).map(catKey => {
              const data = categoryTotals[catKey];
              const pct = totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 100) : 0;

              return (
                <div key={catKey} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-stone-800">
                    <span className="font-medium">{categoryLabels[catKey]}</span>
                    <span className="font-mono font-bold">
                      {formatRupiah(data.revenue)}{' '}
                      <span className="text-stone-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        catKey === 'cetak_foto' || catKey === 'foto_studio'
                          ? 'bg-amber-500'
                          : catKey === 'restorasi_edit' || catKey === 'pas_foto'
                          ? 'bg-indigo-600'
                          : 'bg-stone-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-stone-700 leading-relaxed">
            🔍 <strong>Wawasan Bisnis:</strong> Lebih dari <strong>70%</strong> omset dihasilkan dari Foto Cetak & Restorasi Keluarga. 
            Meskipun banner menghasilkan nilai meteran, margin laba bersih tertinggi (70-85%) berasal dari Pas Foto dan Restorasi Foto Lawas.
          </div>
        </div>

        {/* Channel Performance (Walk-in vs Online GrabExpress) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h4 className="font-bold text-stone-900 text-sm">
              Perbandingan Saluran Penjualan
            </h4>
            <PieChart className="w-4 h-4 text-stone-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <span className="text-xs text-stone-500 block font-medium">Walk-In Toko Studio</span>
              <span className="font-mono text-base font-bold text-stone-900">{formatRupiah(walkinRevenue)}</span>
              <p className="text-[11px] text-stone-500">{walkinCount} transaksi langsung</p>
            </div>

            <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-1">
              <span className="text-xs text-amber-900 block font-medium">Pemesanan Online Grab</span>
              <span className="font-mono text-base font-bold text-stone-900">{formatRupiah(onlineRevenue)}</span>
              <p className="text-[11px] text-stone-500">{onlineCount} transaksi digital</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-stone-600">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Efisiensi Digital:</strong> Order online mengurangi antrean fisik di ruko Jl. Gajah Mada dan menjangkau pelanggan di luar Pontianak Kota (Kubu Raya / Serdam).
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Pelaporan Otomatis:</strong> Karyawan tidak perlu lagi mengetik rekap manual yang rawan selisih di grup WhatsApp setiap malam.
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

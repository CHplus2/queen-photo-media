import { useDialog } from '../hooks/useDialog';
import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { InventoryItem, StockLog } from '../types';
import { formatRupiah, formatDateTime } from '../utils/formatters';
import {
  Package,
  Scissors,
  AlertTriangle,
  Plus,
  RefreshCw,
  CheckCircle2,
  History,
  ArrowDownRight,
  ArrowUpRight,
  Info,
  Layers,
  X,
  Calculator,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { inventory, stockLogs, restockItem } = useStudio();

  // Restock modal state
  const [selectedRestockItem, setSelectedRestockItem] =
    useState<InventoryItem | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(65);
  const [restockCapacity, setRestockCapacity] = useState<number>(65);
  const [restockReason, setRestockReason] = useState<string>(
    'Pemasangan roll / pengadaan baru',
  );

  const modalRef = useDialog<HTMLDivElement>(Boolean(selectedRestockItem), () =>
    setSelectedRestockItem(null),
  );

  // Interactive Live Cutter Simulator state
  const [simProduct, setSimProduct] = useState<
    '4R' | 'PHOTOSTRIP' | '16R_KANVAS' | 'PAS_FOTO'
  >('4R');
  const [simQty, setSimQty] = useState<number>(10);

  // Filter logs state
  const [logFilter, setLogFilter] = useState<
    'ALL' | 'DEDUCT' | 'RESTORE' | 'RESTOCK'
  >('ALL');

  const lowStockItems = inventory.filter(
    (i) => i.currentStock <= i.lowStockThreshold,
  );

  const handleOpenRestock = (item: InventoryItem) => {
    setSelectedRestockItem(item);
    let amount = 50;
    if (item.type === 'ROLL') {
      amount = item.maxStock; // e.g. 65 meters
      setRestockReason('Pemasangan 1 roll kertas baru di mesin minilab');
    } else {
      amount = 50;
      setRestockReason('Pengadaan stok bahan baru dari supplier');
    }
    setRestockAmount(amount);
    // Auto-calculate new denominator so stock never exceeds denominator!
    const projectedStock = Number((item.currentStock + amount).toFixed(1));
    setRestockCapacity(Math.max(item.maxStock, projectedStock));
  };

  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestockItem || restockAmount <= 0) return;

    restockItem(
      selectedRestockItem.id,
      restockAmount,
      restockReason,
      restockCapacity,
    );
    setSelectedRestockItem(null);
  };

  // Cutter Simulator calculations
  const minilabRoll = inventory.find((i) => i.id === 'inv-roll-minilab-6inch');
  const minilabStockMeters = minilabRoll?.currentStock || 58.4;

  let simCutLengthMeters = 0;
  let simCutLengthCm = 0;
  let simTargetItemName = '';
  let simCurrentStockMeters = 0;

  if (simProduct === '4R') {
    simCutLengthMeters = Number((0.102 * simQty).toFixed(3));
    simCutLengthCm = Number((10.2 * simQty).toFixed(1));
    simTargetItemName = 'Kertas Roll Foto Minilab 6" (15.2 cm)';
    simCurrentStockMeters = minilabStockMeters;
  } else if (simProduct === 'PHOTOSTRIP') {
    simCutLengthMeters = Number((0.051 * simQty).toFixed(3));
    simCutLengthCm = Number((5.08 * simQty).toFixed(1));
    simTargetItemName = 'Kertas Roll Foto Minilab 6" (15.2 cm)';
    simCurrentStockMeters = minilabStockMeters;
  } else if (simProduct === '16R_KANVAS') {
    simCutLengthMeters = Number((0.4 * simQty).toFixed(3));
    simCutLengthCm = Number((40 * simQty).toFixed(1));
    const canvasRoll = inventory.find(
      (i) => i.id === 'inv-roll-canvas-plotter-24inch',
    );
    simTargetItemName = 'Kertas Roll Kanvas Plotter 24" (61 cm)';
    simCurrentStockMeters = canvasRoll?.currentStock || 28.5;
  } else if (simProduct === 'PAS_FOTO') {
    simCutLengthMeters = simQty;
    simCutLengthCm = 0;
    const a4 = inventory.find((i) => i.id === 'inv-sheet-a4-pasfoto');
    simTargetItemName = 'Kertas Foto Lembaran A4 (Per Lembar)';
    simCurrentStockMeters = a4?.currentStock || 240;
  }

  const remainingAfterSim = Math.max(
    0,
    Number((simCurrentStockMeters - simCutLengthMeters).toFixed(2)),
  );

  // Filtered logs
  const filteredLogs = stockLogs.filter((log) => {
    if (logFilter === 'DEDUCT')
      return log.changeAmount < 0 && !log.reason.includes('[RESTORE]');
    if (logFilter === 'RESTORE') return log.reason.includes('[RESTORE]');
    if (logFilter === 'RESTOCK')
      return log.changeAmount > 0 && !log.reason.includes('[RESTORE]');
    return true;
  });

  return (
    <div className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <p className="text-amber-800 text-xs font-semibold uppercase tracking-wider">
            Sistem Inventaris Bahan & Kertas Queen Photo
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            Manajemen Stok Kertas Roll, Lembaran & Merchandise
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-0.5">
            Otomatis terpotong saat pesanan masuk (Online & Kasir) dan otomatis
            dikembalikan jika pesanan dibatalkan.
          </p>
        </div>

        {lowStockItems.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Perhatian:</strong> {lowStockItems.length} bahan mendekati
              batas minimum!
            </span>
          </div>
        )}
      </div>

      {/* Mechanics Explanation Box: The Photo Paper Roll Cutting Mechanics */}
      <div className="p-5 bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
          <Scissors className="w-4 h-4" />
          <span>
            Cara Kerja Pemotongan Kertas Roll di Mesin Minilab Queen Photo
            (Pontianak)
          </span>
        </div>
        <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
          Kertas foto minilab berupa{' '}
          <strong>1 gulungan roll panjang (65 meter)</strong> dengan lebar tetap
          (15.2 cm / 6-inci). Saat pesanan dicetak, pisau pemotong guillotine
          otomatis di dalam mesin memotong kertas berdasarkan panjang ukuran
          foto:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 bg-stone-800 rounded-xl border border-stone-700">
            <p className="font-bold text-amber-200">Foto 4R (10.2 x 15.2 cm)</p>
            <p className="text-stone-300 mt-0.5">
              Mesin memotong <strong>10.2 cm (0.102 m)</strong> per lembar. 1
              roll utuh cukup untuk ~637 lembar foto 4R.
            </p>
          </div>
          <div className="p-3 bg-stone-800 rounded-xl border border-stone-700">
            <p className="font-bold text-amber-200">
              Photostrip 2x6 (5.08 x 15.2 cm)
            </p>
            <p className="text-stone-300 mt-0.5">
              Mesin memotong <strong>5.08 cm (0.051 m)</strong> per cetakan.
              Sangat hemat bahan.
            </p>
          </div>
          <div className="p-3 bg-stone-800 rounded-xl border border-stone-700">
            <p className="font-bold text-amber-200">Kanvas 16R (40 x 50 cm)</p>
            <p className="text-stone-300 mt-0.5">
              Mesin plotter memotong <strong>40 cm (0.40 m)</strong> dari roll
              kanvas lebar 61 cm.
            </p>
          </div>
        </div>
      </div>

      {/* INTERACTIVE CUTTER SIMULATOR WIDGET */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-amber-200/80">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <Calculator className="w-4 h-4 text-amber-800" />
            <span>
              Kalkulator & Simulator Pemotong Mesin Roll (Live Cutter)
            </span>
          </div>
          <span className="text-xs text-stone-500 font-medium">
            Simulasi sisa panjang roll di mesin saat mencetak berbagai variasi
            foto
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-xs">
          <div>
            <label
              className="block font-semibold text-stone-700 mb-1"
              htmlFor="inventoryview-field-1"
            >
              Pilih Varian Foto:
            </label>
            <select
              id="inventoryview-field-1"
              value={simProduct}
              onChange={(e) => setSimProduct(e.target.value as any)}
              className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs font-semibold"
            >
              <option value="4R">
                Cetak 4R (10.2 x 15.2 cm) - Roll Minilab 6"
              </option>
              <option value="PHOTOSTRIP">
                Photostrip 2x6 (5.08 x 15.2 cm) - Roll Minilab 6"
              </option>
              <option value="16R_KANVAS">
                Cetak Kanvas 16R (40 x 50 cm) - Roll Plotter 24"
              </option>
              <option value="PAS_FOTO">
                Pas Foto Resmi - Kertas Lembaran A4
              </option>
            </select>
          </div>

          <div>
            <label
              className="block font-semibold text-stone-700 mb-1"
              htmlFor="inventoryview-field-2"
            >
              Jumlah Lembar / Qty Cetak:
            </label>
            <input
              id="inventoryview-field-2"
              type="number"
              min="1"
              max="500"
              value={simQty}
              onChange={(e) =>
                setSimQty(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs tabular-nums font-bold"
            />
          </div>

          {/* Result card */}
          <div className="p-3 bg-white rounded-xl border border-amber-300/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
              Hasil Potongan Otomatis Mesin:
            </span>
            <div className="flex justify-between items-baseline">
              <span className="text-stone-600">Panjang Dipotong:</span>
              <strong className="tabular-nums text-sm text-stone-900">
                {simProduct === 'PAS_FOTO'
                  ? `${simQty} Lembar A4`
                  : `${simCutLengthCm} cm (${simCutLengthMeters} meter)`}
              </strong>
            </div>
            <div className="flex justify-between items-baseline text-[11px]">
              <span className="text-stone-500">Sisa Roll di Mesin:</span>
              <strong className="tabular-nums text-emerald-700">
                {simProduct === 'PAS_FOTO'
                  ? `${remainingAfterSim} Lembar`
                  : `${remainingAfterSim} meter`}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* INVENTORY ITEMS GRID */}
      <div className="space-y-4">
        <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider">
          Daftar Stok Bahan Saat Ini
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory.map((item) => {
            const isLow = item.currentStock <= item.lowStockThreshold;
            const effectiveDenominator = Math.max(
              item.maxStock,
              item.currentStock,
            );
            const pct = Math.min(
              100,
              Math.round((item.currentStock / effectiveDenominator) * 100),
            );

            // Estimate how many 4R prints remaining for minilab roll
            let capacityNote = '';
            if (item.id === 'inv-roll-minilab-6inch') {
              const est4R = Math.floor(item.currentStock / 0.102);
              const estStrip = Math.floor(item.currentStock / 0.051);
              capacityNote = `Cukup untuk ~${est4R} lembar 4R atau ~${estStrip} photostrip lagi`;
            } else if (item.id === 'inv-roll-canvas-plotter-24inch') {
              const est16R = Math.floor(item.currentStock / 0.4);
              capacityNote = `Cukup untuk ~${est16R} cetak kanvas 16R lagi`;
            }

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-5 flex flex-col justify-between shadow-sm transition-all ${
                  isLow
                    ? 'border-amber-400 ring-1 ring-amber-400/50'
                    : 'border-stone-200'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        {item.type === 'ROLL'
                          ? 'GULUNGAN ROLL'
                          : item.type === 'SHEET'
                            ? 'LEMBARAN'
                            : 'BARANG / MERCH'}
                      </span>
                      <h4 className="font-bold text-stone-900 text-sm mt-0.5">
                        {item.name}
                      </h4>
                    </div>
                    {isLow ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                        Menipis
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                        Normal
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-500 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Stock Bar & Explicit Metrics Breakdown */}
                  <div className="space-y-2 pt-2 bg-stone-50/80 p-3 rounded-xl border border-stone-100 text-xs">
                    <div className="flex justify-between items-baseline">
                      <span className="text-stone-600 font-semibold">
                        Stok Tersedia:
                      </span>
                      <span className="tabular-nums text-base font-bold text-stone-900">
                        {item.currentStock} {item.unit}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-stone-500">
                      <span>Kapasitas Target (Penyebut):</span>
                      <span className="tabular-nums font-semibold text-stone-700">
                        {item.maxStock} {item.unit}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-stone-500">
                      <span>Batas Minimum Peringatan:</span>
                      <span className="tabular-nums font-semibold text-amber-700">
                        {item.lowStockThreshold} {item.unit}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isLow ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {capacityNote && (
                      <p className="text-[11px] text-emerald-700 font-medium pt-1">
                        💡 {capacityNote}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-500">
                    Nilai Modal:{' '}
                    {formatRupiah(
                      Math.round(item.currentStock * item.costPerUnit),
                    )}
                  </span>

                  <button
                    onClick={() => handleOpenRestock(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Restock</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STOCK LOGS TABLE: Audit Trail */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-stone-500" />
            <h3 className="font-bold text-stone-900 text-sm">
              Riwayat Audit Pemotongan & Pengembalian Bahan Otomatis
            </h3>
          </div>

          {/* Log filter pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setLogFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                logFilter === 'ALL'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600'
              }`}
            >
              Semua ({stockLogs.length})
            </button>
            <button
              onClick={() => setLogFilter('DEDUCT')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                logFilter === 'DEDUCT'
                  ? 'bg-rose-600 text-white'
                  : 'bg-stone-100 text-stone-600'
              }`}
            >
              Potong Pesanan
            </button>
            <button
              onClick={() => setLogFilter('RESTORE')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                logFilter === 'RESTORE'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-stone-100 text-stone-600'
              }`}
            >
              Restore Pembatalan
            </button>
            <button
              onClick={() => setLogFilter('RESTOCK')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                logFilter === 'RESTOCK'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-100 text-stone-600'
              }`}
            >
              Restock Manual
            </button>
          </div>
        </div>

        <div
          className="overflow-x-auto"
          tabIndex={0}
          role="region"
          aria-label="Riwayat perubahan stok"
        >
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Nama Bahan</th>
                <th className="px-4 py-3">Perubahan</th>
                <th className="px-4 py-3">Sisa Stok Akhir</th>
                <th className="px-4 py-3">Keterangan / Nomor Pesanan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredLogs.slice(0, 20).map((log) => {
                const isDeduction = log.changeAmount < 0;

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-stone-50/60 transition-colors"
                  >
                    <td className="px-4 py-2.5 whitespace-nowrap text-stone-500 tabular-nums text-[11px]">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-stone-900">
                      {log.itemName}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap tabular-nums font-bold">
                      <span
                        className={`inline-flex items-center gap-0.5 ${
                          isDeduction ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {isDeduction ? (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                        {log.changeAmount > 0
                          ? `+${log.changeAmount}`
                          : log.changeAmount}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap tabular-nums font-semibold text-stone-800">
                      {log.newStock}
                    </td>
                    <td className="px-4 py-2.5 text-stone-600">{log.reason}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESTOCK MODAL */}
      {selectedRestockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-sm p-4">
          <div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Tambah stok bahan"
            className="qp-dialog !max-w-md"
          >
            <div className="flex items-center justify-between px-6 py-4 bg-stone-900 text-stone-100 border-b border-stone-800">
              <div>
                <h3 className="text-sm font-bold">
                  Restock Bahan / Pemasangan Roll
                </h3>
                <p className="text-[11px] text-stone-300">
                  {selectedRestockItem.name}
                </p>
              </div>
              <button
                aria-label="Tutup penambahan stok"
                onClick={() => setSelectedRestockItem(null)}
                className="qp-icon-button text-stone-300 hover:text-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleConfirmRestock}
              className="qp-dialog-content space-y-4 text-sm"
            >
              <div>
                <label
                  className="block text-stone-700 font-semibold mb-1"
                  htmlFor="inventoryview-field-3"
                >
                  Jumlah Tambahan ({selectedRestockItem.unit}):
                </label>
                <input
                  id="inventoryview-field-3"
                  type="number"
                  step={selectedRestockItem.type === 'ROLL' ? '0.1' : '1'}
                  required
                  value={restockAmount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setRestockAmount(val);
                    const newProj = Number(
                      (selectedRestockItem.currentStock + val).toFixed(1),
                    );
                    setRestockCapacity((prev) => Math.max(prev, newProj));
                  }}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm tabular-nums font-bold text-stone-900 focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Stok saat ini: {selectedRestockItem.currentStock}{' '}
                  {selectedRestockItem.unit} → Menjadi{' '}
                  <strong className="text-stone-900">
                    {Number(
                      (
                        selectedRestockItem.currentStock + restockAmount
                      ).toFixed(2),
                    )}{' '}
                    {selectedRestockItem.unit}
                  </strong>
                </span>
              </div>

              {/* Denominator / Target Capacity Field */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-stone-700 font-semibold">
                    Target Kapasitas Gudang / Denominator (
                    {selectedRestockItem.unit}):
                  </label>
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded tabular-nums font-bold">
                    Penyebut
                  </span>
                </div>
                <input
                  type="number"
                  step={selectedRestockItem.type === 'ROLL' ? '0.1' : '1'}
                  required
                  min={Number(
                    (selectedRestockItem.currentStock + restockAmount).toFixed(
                      1,
                    ),
                  )}
                  aria-label="Kapasitas maksimum stok"
                  value={restockCapacity}
                  onChange={(e) => setRestockCapacity(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm tabular-nums font-bold text-stone-900 focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[10px] text-stone-500 mt-1 block leading-relaxed">
                  💡 Angka ini adalah <strong>denominator (penyebut)</strong>{' '}
                  pada kartu stok. Sistem otomatis menyesuaikannya agar stok
                  yang baru ditambahkan tidak melampaui denominator (contoh:
                  hasil rasio 60/60 atau 60/100, bukan 60/25).
                </span>
              </div>

              <div>
                <label
                  className="block text-stone-700 font-semibold mb-1"
                  htmlFor="inventoryview-field-4"
                >
                  Catatan / Keterangan Restock:
                </label>
                <input
                  id="inventoryview-field-4"
                  type="text"
                  required
                  value={restockReason}
                  onChange={(e) => setRestockReason(e.target.value)}
                  placeholder="Contoh: Beli 1 roll baru dari distributor / supplier"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRestockItem(null)}
                  className="px-4 py-2 text-stone-500 hover:text-stone-800 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Simpan Tambahan Stok</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

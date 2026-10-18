import { MaterialSetup } from './MaterialSetup';
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

  const [restockBusy, setRestockBusy] = useState(false);
  const [restockError, setRestockError] = useState('');
  // Restock modal state
  const [selectedRestockItem, setSelectedRestockItem] =
    useState<InventoryItem | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(0);
  const [restockCapacity, setRestockCapacity] = useState<number>(65);
  const [restockReason, setRestockReason] = useState<string>(
    'Pemasangan roll / pengadaan baru',
  );

  const modalRef = useDialog<HTMLDivElement>(Boolean(selectedRestockItem), () =>
    setSelectedRestockItem(null),
  );

  // Filter logs state
  const [logFilter, setLogFilter] = useState<
    'ALL' | 'DEDUCT' | 'RESTORE' | 'RESTOCK'
  >('ALL');

  const lowStockItems = inventory.filter(
    (i) => i.currentStock <= i.lowStockThreshold,
  );

  const handleOpenRestock = (item: InventoryItem) => {
    setRestockError('');
    setSelectedRestockItem(item);
    setRestockAmount(0);
    setRestockReason('Penerimaan bahan baru');
    setRestockCapacity(item.maxStock);
  };

  const handleConfirmRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestockItem || restockAmount <= 0 || restockBusy) return;
    setRestockBusy(true);

    try {
      await restockItem(
        selectedRestockItem.id,
        restockAmount,
        restockReason,
        restockCapacity,
      );
      setSelectedRestockItem(null);
    } catch (error) {
      setRestockError(
        error instanceof Error ? error.message : 'Stok belum tersimpan.',
      );
    } finally {
      setRestockBusy(false);
    }
  };

  // Filtered logs
  const filteredLogs = stockLogs.filter((log) => {
    const restored =
      log.reason.includes('Pembatalan:') || log.reason.includes('[RESTORE]');
    if (logFilter === 'DEDUCT') return log.changeAmount < 0;
    if (logFilter === 'RESTORE') return restored;
    if (logFilter === 'RESTOCK') return log.changeAmount > 0 && !restored;
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
            Saldo bersama dari database. Pemotongan mengikuti pemakaian layanan
            yang sudah diatur; pembatalan membedakan bahan terpakai dan belum
            terpakai.
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

      <MaterialSetup />

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

            {restockError && (
              <p role="alert" className="qp-error mx-5 mt-4">
                {restockError}
              </p>
            )}
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
                  disabled={restockBusy}
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

import { tr } from '../i18n/runtime';
import React, { useEffect, useState } from 'react';
import { useStudio } from '../context/StudioContext';
import type { InventoryItem, StockUsage } from '../types';
import { Plus, Trash2 } from 'lucide-react';
export const MaterialSetup: React.FC = () => {
  const {
    inventory,
    inventoryReady,
    services,
    createInventoryItem,
    updateService,
    recordInventoryCount,
  } = useStudio();
  const [countId, setCountId] = useState('');
  const [measured, setMeasured] = useState<number | ''>('');
  const [countReason, setCountReason] = useState('');
  const [serviceId, setServiceId] = useState('');
  const service = services.find((s) => s.id === serviceId);
  const [mode, setMode] = useState('');
  const [usage, setUsage] = useState<StockUsage[]>([]);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [type, setType] = useState<InventoryItem['type']>('MERCHANDISE');
  const [amount, setAmount] = useState(0);
  const [unitCost, setUnitCost] = useState(0);
  const [threshold, setThreshold] = useState(5);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    setMode(service?.stockMode || '');
    setUsage(service?.materialUsage?.map((u) => ({ ...u })) || []);
    setMessage('');
    setError('');
  }, [service]);
  const run = async (callback: () => Promise<void>, success: string) => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await callback();
      setMessage(success);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Perubahan belum tersimpan.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="qp-panel p-5 sm:p-6">
      <h2 className="text-lg !font-sans font-semibold">
        {tr('Pengaturan bahan otomatis')}
      </h2>
      <p className="text-sm text-stone-600 mt-3">
        {tr(
          'Stok dibaca bersama dari database. Atur pemakaian untuk setiap 1 unit / paket layanan sesuai hasil ukur di toko. Angka contoh aplikasi tidak dipakai sebagai saldo stok.',
        )}
      </p>
      {!inventoryReady && (
        <p className="qp-notice mt-4">
          {tr('Inventaris belum tersambung. Tunggu sebelum mengubah data.')}
        </p>
      )}
      <details
        className="mt-5 border-t border-stone-200 pt-3"
        open={!inventory.length}
      >
        <summary className="text-sm font-semibold cursor-pointer py-3">
          {tr('Tambah bahan / saldo awal')}
        </summary>
        <form
          className="grid sm:grid-cols-2 gap-4 mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              await createInventoryItem({
                name,
                type,
                unit,
                currentStock: amount,
                maxStock: Math.max(amount, threshold, 1),
                lowStockThreshold: threshold,
                costPerUnit: unitCost,
                description: 'Saldo awal diperiksa staf',
              });
              setName('');
              setAmount(0);
            }, 'Bahan dan saldo awal tersimpan.');
          }}
        >
          <label>
            <span className="qp-label">{tr('Nama bahan')}</span>
            <input
              className="qp-field"
              required
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            <span className="qp-label">{tr('Jenis bahan')}</span>
            <select
              className="qp-field"
              value={type}
              onChange={(e) => setType(e.target.value as InventoryItem['type'])}
            >
              <option value="ROLL">{tr('Roll kertas')}</option>
              <option value="SHEET">{tr('Kertas lembar')}</option>
              <option value="MERCHANDISE">{tr('Produk / merchandise')}</option>
              <option value="FRAME">{tr('Bingkai')}</option>
            </select>
          </label>
          <label>
            <span className="qp-label">{tr('Satuan stok')}</span>
            <input
              className="qp-field"
              required
              maxLength={30}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder={tr('meter, lembar, pcs…')}
            />
          </label>
          <label>
            <span className="qp-label">
              {tr('Saldo awal hasil hitung fisik')}
            </span>
            <input
              className="qp-field"
              type="number"
              min={0}
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </label>
          <label>
            <span className="qp-label">
              {tr('Peringatkan saat stok di bawah')}
            </span>
            <input
              className="qp-field"
              type="number"
              min={0}
              step="any"
              required
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
            />
          </label>
          <label>
            <span className="qp-label">
              {tr('Biaya per satuan bahan (Rp, opsional)')}
            </span>
            <input
              className="qp-field"
              type="number"
              min={0}
              step={1}
              value={unitCost}
              onChange={(e) => setUnitCost(Number(e.target.value))}
            />
          </label>
          <button
            className="qp-button self-end"
            disabled={busy || !inventoryReady}
          >
            {tr('Tambah bahan')}
          </button>
        </form>
      </details>
      <details className="mt-4 border-t border-stone-200 pt-3">
        <summary className="text-sm font-semibold cursor-pointer py-3">
          {tr('Atur pemakaian per layanan')}
        </summary>
        <form
          className="space-y-4 mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              if (!service || !mode)
                throw new Error('Pilih layanan dan cara pencatatan bahan.');
              if (
                mode === 'automatic' &&
                (!usage.length ||
                  usage.some(
                    (u) =>
                      !u.inventoryId ||
                      !Number.isFinite(u.quantity) ||
                      u.quantity <= 0,
                  ) ||
                  new Set(usage.map((u) => u.inventoryId)).size !==
                    usage.length)
              )
                throw new Error(
                  'Pilih bahan berbeda dan isi pemakaian positif.',
                );
              await updateService(service.id, {
                stockMode: mode as 'automatic' | 'none',
                materialUsage: mode === 'automatic' ? usage : [],
              });
            }, 'Pemakaian bahan layanan tersimpan.');
          }}
        >
          <label className="block">
            <span className="qp-label">{tr('Layanan')}</span>
            <select
              className="qp-field"
              required
              aria-label={tr('Layanan')}
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
            >
              <option value="">{tr('Pilih layanan')}</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {tr(s.name)} · {tr(s.unit)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="qp-label">{tr('Pencatatan bahan')}</span>
            <select
              className="qp-field"
              required
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="">{tr('Belum diatur — perlu pemeriksaan')}</option>
              <option value="none">{tr('Jasa tanpa bahan fisik')}</option>
              <option value="automatic">{tr('Potong bahan otomatis')}</option>
            </select>
          </label>
          {mode === 'automatic' && (
            <div className="space-y-4">
              <p className="qp-notice">
                {tr('Untuk 1')} {service?.unit || tr('unit layanan')}
                {tr(
                  ', berapa bahan yang dipakai? Konfigurasi ini berlaku untuk ukuran standar tanpa tambahan bingkai. Varian lain ditandai perlu pemeriksaan; buat layanan terpisah bila pemakaiannya berbeda.',
                )}
              </p>
              {usage.map((u, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_100px_44px] gap-2 items-end"
                >
                  <label>
                    <span className="qp-label">{tr('Bahan')}</span>
                    <select
                      className="qp-field"
                      required
                      value={u.inventoryId}
                      onChange={(e) =>
                        setUsage((list) =>
                          list.map((x, j) =>
                            i === j ? { ...x, inventoryId: e.target.value } : x,
                          ),
                        )
                      }
                    >
                      <option value="">{tr('Pilih bahan')}</option>
                      {inventory.map((item) => (
                        <option key={item.id} value={item.id}>
                          {tr(item.name)} ({tr(item.unit)})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="qp-label">{tr('Pemakaian')}</span>
                    <input
                      className="qp-field"
                      type="number"
                      min={0.000001}
                      step="any"
                      required
                      value={u.quantity}
                      onChange={(e) =>
                        setUsage((list) =>
                          list.map((x, j) =>
                            i === j
                              ? { ...x, quantity: Number(e.target.value) }
                              : x,
                          ),
                        )
                      }
                    />
                  </label>
                  <button
                    className="qp-icon-button"
                    type="button"
                    aria-label={tr(`Hapus bahan ${i + 1}`)}
                    onClick={() =>
                      setUsage((list) => list.filter((_, j) => j !== i))
                    }
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="qp-button qp-button-secondary"
                onClick={() =>
                  setUsage((list) => [
                    ...list,
                    { inventoryId: '', quantity: 1 },
                  ])
                }
              >
                <Plus size={16} />
                {tr('Tambah bahan')}
              </button>
            </div>
          )}
          <button
            className="qp-button"
            disabled={busy || !inventoryReady || !serviceId}
          >
            {tr('Simpan pemakaian bahan')}
          </button>
        </form>
      </details>
      <details className="mt-4 border-t border-stone-200 pt-3">
        <summary className="text-sm font-semibold cursor-pointer py-3">
          {tr('Cocokkan dengan hitungan fisik')}
        </summary>
        <form
          className="grid sm:grid-cols-2 gap-4 mt-4"
          onSubmit={(event) => {
            event.preventDefault();
            run(async () => {
              if (measured === '') throw new Error('Isi jumlah yang dihitung.');
              await recordInventoryCount(
                countId,
                Number(measured),
                countReason,
              );
              setMeasured('');
              setCountReason('');
            }, 'Saldo fisik dan alasan koreksi tersimpan.');
          }}
        >
          <label>
            <span className="qp-label">{tr('Bahan yang dihitung')}</span>
            <select
              className="qp-field"
              required
              value={countId}
              onChange={(e) => setCountId(e.target.value)}
            >
              <option value="">{tr('Pilih bahan')}</option>
              {inventory.map((item) => (
                <option key={item.id} value={item.id}>
                  {tr(item.name)} ({tr(item.unit)})
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="qp-label">
              {tr('Jumlah fisik yang tersedia sekarang')}
            </span>
            <input
              className="qp-field"
              type="number"
              min={0}
              step="any"
              required
              value={measured}
              onChange={(e) =>
                setMeasured(e.target.value === '' ? '' : Number(e.target.value))
              }
            />
          </label>
          <label className="sm:col-span-2">
            <span className="qp-label">
              {tr('Alasan / keterangan pemeriksaan')}
            </span>
            <input
              className="qp-field"
              required
              maxLength={1000}
              value={countReason}
              onChange={(e) => setCountReason(e.target.value)}
            />
          </label>
          <label className="sm:col-span-2 flex gap-3 items-start text-sm">
            <input type="checkbox" required />
            {tr(
              'Saya sudah menghitung fisik. Angka ini menggantikan saldo stok saat ini; gunakan hanya saat tidak ada produksi / penjualan bersamaan.',
            )}
          </label>
          <button className="qp-button" disabled={busy || !inventoryReady}>
            {tr('Simpan hasil hitung fisik')}
          </button>
        </form>
      </details>
      {error && (
        <p role="alert" className="qp-error mt-4">
          {tr(error)}
        </p>
      )}
      {message && (
        <p role="status" className="qp-notice mt-4">
          {tr(message)}
        </p>
      )}
    </section>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { useStudio } from '../context/StudioContext';
import type { ServiceItem } from '../types';
import {
  frameAdjustment,
  frameOptions,
  validateLabels,
} from '../utils/catalogEditing';
const categories = [
  ['cetak_foto', 'Cetak foto'],
  ['pas_foto', 'Pas foto'],
  ['foto_studio', 'Sesi studio'],
  ['photostrip_polaroid', 'Photostrip & mini prints'],
  ['restorasi_edit', 'Restorasi & edit'],
  ['merchandise', 'Hadiah & album'],
  ['banner', 'Banner'],
];
type Tab = 'product' | 'sizes' | 'frames';
export function CatalogQuickEditor({
  onDetails,
}: {
  onDetails: (service: ServiceItem) => void;
}) {
  const { services } = useStudio();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('product');
  const [notice, setNotice] = useState('');
  const visible = services.filter((s) =>
    [s.name, s.unit, ...(s.options?.sizes || []), ...(s.options?.frames || [])]
      .join(' ')
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  return (
    <section className="space-y-4">
      <label className="block">
        <span className="qp-label">Cari nama produk, ukuran, atau bingkai</span>
        <input
          type="search"
          className="qp-field"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Contoh: 10R"
        />
      </label>
      <div
        role="group"
        aria-label="Bagian yang diubah"
        className="flex gap-2 flex-wrap"
      >
        {(
          [
            ['product', 'Nama & harga'],
            ['sizes', 'Ukuran foto'],
            ['frames', 'Bingkai'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            className={'qp-button ' + (tab === id ? '' : 'qp-button-secondary')}
            aria-pressed={tab === id}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-sm text-stone-600">
        Ubah langsung di bawah, lalu tekan Enter atau Simpan pada produk
        tersebut. Perubahan berlaku untuk transaksi baru; riwayat penjualan
        tetap memakai data saat transaksi dibuat.
      </p>
      {notice && (
        <p role="status" className="qp-notice">
          {notice}
        </p>
      )}
      {visible.map((service) => (
        <CatalogRow
          key={service.id}
          service={service}
          tab={tab}
          onSaved={setNotice}
          onDetails={() => onDetails(service)}
        />
      ))}
      {!visible.length && (
        <p className="qp-notice">Tidak ada produk yang cocok.</p>
      )}
    </section>
  );
}
function CatalogRow({
  service,
  tab,
  onDetails,
  onSaved,
}: {
  service: ServiceItem;
  tab: Tab;
  onDetails: () => void;
  onSaved: (message: string) => void;
}) {
  const { updateService } = useStudio();
  const snapshot = () => ({
    name: service.name,
    price: String(service.basePrice),
    unit: service.unit,
    category: service.category,
    active: service.isActive !== false,
    sizes: [...(service.options?.sizes || [])],
    frames: (service.options?.frames || []).map((name) => ({
      name,
      ...frameAdjustment(service, name),
    })),
  });
  const [draft, setDraft] = useState(snapshot);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [labelOnly, setLabelOnly] = useState(false);
  const [conflict, setConflict] = useState(false);
  const baseline = useRef(JSON.stringify(service));
  const lock = useRef(false);
  useEffect(() => {
    if (!dirty) {
      setDraft(snapshot());
      baseline.current = JSON.stringify(service);
      setConflict(false);
    } else if (JSON.stringify(service) !== baseline.current && !busy)
      setConflict(true);
  }, [service, dirty, busy]);
  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [dirty]);
  const change = (patch: Partial<typeof draft>) => {
    onSaved('');
    setDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
    setError('');
  };
  const sizesChanged =
    JSON.stringify(draft.sizes) !==
    JSON.stringify(service.options?.sizes || []);
  const reset = () => {
    setDraft(snapshot());
    setDirty(false);
    setLabelOnly(false);
    setError('');
    setConflict(false);
  };
  return (
    <form
      aria-label={`Ubah ${service.name}`}
      className="qp-panel p-4 sm:p-5 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (lock.current || !dirty || conflict) return;
        lock.current = true;
        setBusy(true);
        setError('');
        try {
          if (!draft.name.trim()) throw new Error('Nama produk wajib diisi.');
          if (
            draft.price.trim() === '' ||
            !Number.isSafeInteger(Number(draft.price)) ||
            Number(draft.price) < 0
          )
            throw new Error('Isi harga jual dalam rupiah bulat, minimal Rp0.');
          const sizes = validateLabels(draft.sizes);
          const options = frameOptions(service, draft.frames);
          options.sizes = sizes;
          const patch: Partial<ServiceItem> = {
            name: draft.name.trim(),
            basePrice: Number(draft.price),
            unit: draft.unit.trim() || 'paket',
            category: draft.category,
            isActive: draft.active,
            options,
          };
          const review =
            sizesChanged && service.stockMode === 'automatic' && !labelOnly;
          if (review) patch.stockMode = undefined;
          await updateService(service.id, patch);
          onSaved(
            review
              ? `Tersimpan: ${draft.name.trim()}. Periksa pemakaian bahan ukuran baru di Inventaris.`
              : `Tersimpan: ${draft.name.trim()}.`,
          );
          setDirty(false);
          setLabelOnly(false);
        } catch (e) {
          setError(
            e instanceof Error
              ? e.message
              : 'Belum tersimpan. Isian tetap tersedia.',
          );
        } finally {
          lock.current = false;
          setBusy(false);
        }
      }}
    >
      <div className="flex justify-between items-start gap-3">
        <div>
          <h2 className="!font-sans text-lg font-semibold">{service.name}</h2>
          <p className="text-xs text-stone-500 mt-1">
            {service.isActive === false
              ? 'Disembunyikan'
              : 'Tampil di kasir & website'}
          </p>
        </div>
        <button
          type="button"
          className="text-sm underline min-h-11"
          disabled={busy || dirty}
          title={
            dirty
              ? 'Simpan atau batalkan perubahan sebelum membuka detail.'
              : undefined
          }
          onClick={onDetails}
        >
          Detail lainnya
        </button>
      </div>
      <fieldset disabled={busy} className="space-y-4 min-w-0">
        {tab === 'product' && (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <label>
                <span className="qp-label">Nama produk</span>
                <input
                  className="qp-field"
                  required
                  maxLength={150}
                  value={draft.name}
                  onChange={(e) => change({ name: e.target.value })}
                />
              </label>
              <label>
                <span className="qp-label">Harga jual (Rp)</span>
                <input
                  className="qp-field"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={draft.price}
                  onChange={(e) => change({ price: e.target.value })}
                />
              </label>
              <label>
                <span className="qp-label">Satuan penjualan</span>
                <input
                  className="qp-field"
                  required
                  maxLength={80}
                  value={draft.unit}
                  onChange={(e) => change({ unit: e.target.value })}
                />
              </label>
              <label>
                <span className="qp-label">Kelompok produk</span>
                <select
                  className="qp-field"
                  value={draft.category}
                  onChange={(e) =>
                    change({
                      category: e.target.value as ServiceItem['category'],
                    })
                  }
                >
                  {categories.map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              {draft.sizes.length === 1 && (
                <label>
                  <span className="qp-label">Ukuran foto</span>
                  <input
                    className="qp-field"
                    required
                    maxLength={100}
                    value={draft.sizes[0]}
                    onChange={(e) => change({ sizes: [e.target.value] })}
                  />
                </label>
              )}
            </div>
            <label className="flex gap-3 text-sm">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) => change({ active: e.target.checked })}
              />
              Tampilkan produk di kasir & website
            </label>
          </>
        )}
        {tab === 'sizes' && (
          <>
            <p className="text-sm text-stone-600">
              Satu ukuran per baris. Baris pertama menjadi pilihan standar.
            </p>
            {draft.sizes.map((size, index) => (
              <div className="flex gap-2" key={index}>
                <label className="flex-1">
                  <span className="qp-label">Ukuran {index + 1}</span>
                  <input
                    className="qp-field"
                    required
                    maxLength={100}
                    value={size}
                    onChange={(e) =>
                      change({
                        sizes: draft.sizes.map((s, i) =>
                          i === index ? e.target.value : s,
                        ),
                      })
                    }
                  />
                </label>
                <button
                  type="button"
                  className="qp-button qp-button-secondary self-end !px-3"
                  aria-label={`Hapus ukuran ${index + 1}`}
                  onClick={() =>
                    change({ sizes: draft.sizes.filter((_, i) => i !== index) })
                  }
                >
                  Hapus
                </button>
              </div>
            ))}
            <button
              type="button"
              className="qp-button qp-button-secondary"
              onClick={() => change({ sizes: [...draft.sizes, ''] })}
            >
              Tambah ukuran
            </button>
          </>
        )}
        {tab === 'frames' && (
          <>
            <p className="text-sm text-stone-600">
              Harga di sini adalah tambahan di atas harga produk. Mengubah nama
              mempertahankan nominalnya.
            </p>
            {draft.frames.map((frame, index) => (
              <div
                key={index}
                className="border border-stone-200 rounded-xl p-3 space-y-3"
              >
                <label className="block">
                  <span className="qp-label">Nama bingkai {index + 1}</span>
                  <input
                    className="qp-field"
                    required
                    readOnly={frame.name === 'Tanpa Bingkai'}
                    maxLength={100}
                    value={frame.name}
                    onChange={(e) =>
                      change({
                        frames: draft.frames.map((f, i) =>
                          i === index ? { ...f, name: e.target.value } : f,
                        ),
                      })
                    }
                  />
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(['price', 'cost'] as const).map((key) => (
                    <label key={key}>
                      <span className="qp-label">
                        {key === 'price' ? 'Tambahan harga' : 'Biaya bahan'}{' '}
                        bingkai {index + 1} (Rp)
                      </span>
                      <input
                        type="number"
                        className="qp-field"
                        required
                        disabled={frame.name === 'Tanpa Bingkai'}
                        min="0"
                        step="1"
                        value={frame[key]}
                        onChange={(e) =>
                          change({
                            frames: draft.frames.map((f, i) =>
                              i === index
                                ? { ...f, [key]: Number(e.target.value) }
                                : f,
                            ),
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  className="text-sm underline min-h-11"
                  disabled={frame.name === 'Tanpa Bingkai'}
                  aria-label={`Hapus bingkai ${index + 1}`}
                  onClick={() =>
                    change({
                      frames: draft.frames.filter((_, i) => i !== index),
                    })
                  }
                >
                  Hapus bingkai
                </button>
              </div>
            ))}
            <button
              type="button"
              className="qp-button qp-button-secondary"
              onClick={() =>
                change({
                  frames: [...draft.frames, { name: '', price: 0, cost: 0 }],
                })
              }
            >
              Tambah bingkai
            </button>
          </>
        )}
        {sizesChanged && service.stockMode === 'automatic' && (
          <div className="qp-notice text-sm">
            <p>
              Ukuran berbeda dapat memakai jumlah bahan berbeda. Pemotongan
              otomatis akan menunggu pemeriksaan di Inventaris.
            </p>
            <label className="flex gap-3 mt-3">
              <input
                type="checkbox"
                checked={labelOnly}
                onChange={(e) => setLabelOnly(e.target.checked)}
              />
              Hanya koreksi tulisan; ukuran fisik dan pemakaian bahan tetap
              sama.
            </label>
          </div>
        )}
        {conflict && (
          <div role="alert" className="qp-error">
            Produk ini berubah di perangkat lain. Salin isian Anda jika perlu,
            lalu{' '}
            <button type="button" className="underline" onClick={reset}>
              muat data terbaru
            </button>{' '}
            sebelum menyimpan.
          </div>
        )}
        {error && (
          <p role="alert" className="qp-error">
            {error}
          </p>
        )}
        {dirty && (
          <div className="flex gap-3">
            <button
              className="qp-button"
              type="submit"
              disabled={busy || conflict}
            >
              {busy ? 'Menyimpan…' : 'Simpan'}
            </button>
            <button
              className="qp-button qp-button-secondary"
              type="button"
              disabled={busy}
              onClick={reset}
            >
              Batalkan
            </button>
          </div>
        )}
      </fieldset>
    </form>
  );
}

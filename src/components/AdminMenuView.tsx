import { useDialog } from '../hooks/useDialog';
import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { ServiceItem, ServiceCategory } from '../types';
import { formatRupiah } from '../utils/formatters';
import {
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  Search,
  Sparkles,
  Layers,
  Package,
  AlertCircle,
  RefreshCw,
  Eye,
  ArrowUpDown,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

export const AdminMenuView: React.FC = () => {
  const {
    services,
    addService,
    updateService,
    deleteService,
    resetServicesToDefault,
    openOrderWithService,
  } = useStudio();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const modalRef = useDialog<HTMLDivElement>(isModalOpen, () => {
    if (!isSaving) setIsModalOpen(false);
  });

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ServiceCategory>(
    'photostrip_polaroid',
  );
  const [formDescription, setFormDescription] = useState('');
  const [formBasePrice, setFormBasePrice] = useState<number>(20000);
  const [formEstimatedCost, setFormEstimatedCost] = useState<number>(6000);
  const [formUnit, setFormUnit] = useState('2 strip');
  const [formPaperType, setFormPaperType] = useState<
    'sheet' | 'roll' | 'merchandise' | 'service'
  >('roll');
  const [formPopular, setFormPopular] = useState(false);
  const [formSizes, setFormSizes] = useState<string>('2x6 inch (5x15cm)');
  const [formFinishes, setFormFinishes] = useState<string>(
    'Glossy Anti-Luntur, Doff Matte',
  );
  const [formFrames, setFormFrames] = useState<string>('Tanpa Bingkai');
  const [formBgColors, setFormBgColors] = useState<string>('');

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Semua Kategori' },
    { id: 'photostrip_polaroid', label: 'Photostrip & Polaroid (Gen Z)' },
    { id: 'pas_foto', label: 'Pas Foto & Aesthetic' },
    { id: 'cetak_foto', label: 'Cetak Foto & Bingkai' },
    { id: 'foto_studio', label: 'Foto Studio' },
    { id: 'restorasi_edit', label: 'Restorasi & Edit' },
    { id: 'merchandise', label: 'Merchandise & Mug' },
    { id: 'banner', label: 'Spanduk / Banner' },
  ];

  // Filtered Services
  const filteredServices = services.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory)
      return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchUnit = item.unit.toLowerCase().includes(q);
      return matchName || matchDesc || matchUnit;
    }
    return true;
  });

  // Calculate Metrics
  const totalItems = services.length;
  const popularCount = services.filter((s) => s.popular).length;
  const avgMargin =
    services.length > 0
      ? Math.round(
          services.reduce((acc, s) => {
            const margin =
              s.basePrice > 0
                ? ((s.basePrice - s.estimatedCost) / s.basePrice) * 100
                : 0;
            return acc + margin;
          }, 0) / services.length,
        )
      : 0;

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('photostrip_polaroid');
    setFormDescription('');
    setFormBasePrice(25000);
    setFormEstimatedCost(7500);
    setFormUnit('paket');
    setFormPaperType('roll');
    setFormPopular(false);
    setFormSizes('Ukuran Standar');
    setFormFinishes('Glossy Anti-Luntur, Doff Matte');
    setFormFrames('Tanpa Bingkai');
    setFormBgColors('');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (item: ServiceItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormDescription(item.description);
    setFormBasePrice(item.basePrice);
    setFormEstimatedCost(item.estimatedCost);
    setFormUnit(item.unit);
    setFormPaperType(item.paperType || 'roll');
    setFormPopular(Boolean(item.popular));
    setFormSizes(item.options?.sizes?.join(', ') || '');
    setFormFinishes(item.options?.finishes?.join(', ') || '');
    setFormFrames(item.options?.frames?.join(', ') || '');
    setFormBgColors(item.options?.backgroundColors?.join(', ') || '');
    setIsModalOpen(true);
  };

  // Save Service (Create or Update)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Nama layanan wajib diisi.');
      return;
    }

    const sizesArr = formSizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const finishesArr = formFinishes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const framesArr = formFrames
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const bgColorsArr = formBgColors
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const optionsObj: Record<string, string[]> = {};
    if (sizesArr.length > 0) optionsObj.sizes = sizesArr;
    if (finishesArr.length > 0) optionsObj.finishes = finishesArr;
    if (framesArr.length > 0) optionsObj.frames = framesArr;
    if (bgColorsArr.length > 0) optionsObj.backgroundColors = bgColorsArr;

    const servicePayload: Omit<ServiceItem, 'id'> = {
      name: formName.trim(),
      category: formCategory,
      description: formDescription.trim(),
      basePrice: Number(formBasePrice),
      estimatedCost: Number(formEstimatedCost),
      unit: formUnit.trim() || 'paket',
      paperType: formPaperType,
      popular: Boolean(formPopular),
      isActive: true,
      options: Object.keys(optionsObj).length > 0 ? optionsObj : {},
    };

    setIsSaving(true);
    try {
      if (editingItem) {
        await updateService(editingItem.id, servicePayload);
        setNotificationMsg(
          `Layanan "${formName}" berhasil diperbarui! Harga & data telah tersimpan permanen di Cloud Firestore.`,
        );
      } else {
        const created = await addService(servicePayload);
        setNotificationMsg(
          `Menu baru "${created.name}" berhasil ditambahkan dan aktif di kasir & website!`,
        );
      }
      setIsModalOpen(false);
      setTimeout(() => setNotificationMsg(''), 5000);
    } catch (err: any) {
      alert(
        `Gagal menyimpan perubahan: ${err?.message || 'Terjadi kesalahan'}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Service
  const handleDeleteService = async (id: string, name: string) => {
    await deleteService(id);
    setIsDeletingId(null);
    setNotificationMsg(`🗑️ Layanan "${name}" telah dihapus.`);
    setTimeout(() => setNotificationMsg(''), 5000);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Katalog & Daftar Harga Studio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Kelola Menu Layanan & Produk Studio
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-0.5">
            Tambah, perbarui harga jual & biaya HPP, sesuaikan paket foto Gen Z,
            dan kontrol menu yang tampil di kasir toko & website.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>+ Tambah Menu / Produk Baru</span>
          </button>

          <button
            onClick={() => {
              if (
                window.confirm(
                  'Reset semua menu ke daftar awal Queen Photo Pontianak?',
                )
              ) {
                resetServicesToDefault();
                setNotificationMsg('Menu telah direset ke default awal.');
                setTimeout(() => setNotificationMsg(''), 4000);
              }
            }}
            className="px-3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            title="Kembalikan menu ke template awal"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
            <span>Reset Default</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notificationMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 block uppercase">
            Total Menu Aktif
          </span>
          <p className="text-2xl font-bold font-serif text-stone-900 mt-1">
            {totalItems}
          </p>
          <span className="text-[10px] text-stone-500">
            Tersedia untuk pelanggan
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 block uppercase">
            Menu Populer / Viral
          </span>
          <p className="text-2xl font-bold font-serif text-amber-800 mt-1">
            {popularCount}
          </p>
          <span className="text-[10px] text-amber-700">
            Photostrip & Polaroid Gen Z
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 block uppercase">
            Rata-rata Margin Laba
          </span>
          <p className="text-2xl font-bold font-serif text-emerald-800 mt-1">
            {avgMargin}%
          </p>
          <span className="text-[10px] text-emerald-700">
            Persentase keuntungan rata-rata
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 block uppercase">
            Sinkronisasi Cloud
          </span>
          <p className="text-sm font-bold tabular-nums text-stone-800 mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            Firestore Real-Time
          </p>
          <span className="text-[10px] text-stone-500">
            Otomatis update di Kasir POS
          </span>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama menu, deskripsi, atau satuan..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500 whitespace-nowrap">
              Kategori:
            </span>
            <select
              aria-label="Filter kategori layanan"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs border border-stone-300 rounded-xl px-3 py-2 bg-white text-stone-800 font-medium focus:outline-none focus:border-amber-600"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Category Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === c.id
                  ? 'bg-stone-900 text-white font-bold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map((item) => {
          const profit = item.basePrice - item.estimatedCost;
          const marginPct =
            item.basePrice > 0
              ? Math.round((profit / item.basePrice) * 100)
              : 0;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md">
                      {item.category.replace('_', ' ')}
                    </span>
                    <h3 className="text-base font-bold text-stone-900 font-serif leading-tight">
                      {item.name}
                    </h3>
                  </div>

                  {item.popular && (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-full">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Best Seller</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Financial Metric */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Harga Jual:</span>
                    <span className="font-bold text-stone-900 font-serif text-sm">
                      {formatRupiah(item.basePrice)}
                      <span className="text-[10px] text-stone-500 font-sans font-normal ml-1">
                        / {item.unit}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-500">Biaya HPP:</span>
                    <span className="text-stone-700 tabular-nums">
                      {formatRupiah(item.estimatedCost)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-200/70 font-semibold">
                    <span className="text-emerald-700">Untung Bersih:</span>
                    <span className="text-emerald-700 tabular-nums">
                      +{formatRupiah(profit)} ({marginPct}%)
                    </span>
                  </div>
                </div>

                {/* Options Badges */}
                <div className="space-y-1 text-[11px] text-stone-500">
                  {item.options?.sizes && (
                    <div className="truncate">
                      <strong className="text-stone-700">Ukuran:</strong>{' '}
                      {item.options.sizes.join(', ')}
                    </div>
                  )}
                  {item.options?.finishes && (
                    <div className="truncate">
                      <strong className="text-stone-700">Finishing:</strong>{' '}
                      {item.options.finishes.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3.5 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => openOrderWithService(item)}
                  className="text-stone-600 hover:text-stone-900 text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Uji coba order form untuk pelanggan"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Order</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 text-stone-700 hover:bg-stone-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setIsDeletingId(item.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium transition-colors"
                    title="Hapus Layanan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Confirm Delete Inline Box */}
              {isDeletingId === item.id && (
                <div className="p-4 bg-rose-50 border-t border-rose-200 text-xs text-rose-900 space-y-2 animate-in fade-in">
                  <p className="font-semibold">Yakin hapus "{item.name}"?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteService(item.id, item.name)}
                      className="px-3 py-1 bg-rose-600 text-white rounded font-bold text-[11px]"
                    >
                      Ya, Hapus
                    </button>
                    <button
                      onClick={() => setIsDeletingId(null)}
                      className="px-3 py-1 bg-stone-200 text-stone-800 rounded font-semibold text-[11px]"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 space-y-3">
          <p className="text-sm font-semibold">
            Tidak ada layanan yang sesuai dengan pencarian atau kategori.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Rincian layanan"
            className="qp-dialog !max-w-xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-stone-900 text-stone-100 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold">
                  {editingItem
                    ? 'Edit Menu Layanan & Harga'
                    : 'Tambah Menu Layanan Baru'}
                </h3>
              </div>
              <button
                aria-label="Tutup rincian layanan"
                onClick={() => setIsModalOpen(false)}
                className="qp-icon-button text-stone-300 hover:text-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleSaveService}
              className="qp-dialog-content space-y-4 text-sm"
            >
              <div>
                <label
                  className="block text-stone-800 font-semibold mb-1"
                  htmlFor="adminmenuview-field-1"
                >
                  Nama Menu / Layanan <span className="text-rose-500">*</span>:
                </label>
                <input
                  id="adminmenuview-field-1"
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Photostrip 3-Pose Korean Aesthetic"
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-medium focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-stone-800 font-semibold mb-1"
                    htmlFor="adminmenuview-field-2"
                  >
                    Kategori Layanan:
                  </label>
                  <select
                    id="adminmenuview-field-2"
                    value={formCategory}
                    onChange={(e) =>
                      setFormCategory(e.target.value as ServiceCategory)
                    }
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white font-medium focus:outline-none focus:border-amber-600"
                  >
                    <option value="photostrip_polaroid">
                      Photostrip & Polaroid (Gen Z)
                    </option>
                    <option value="pas_foto">Pas Foto & Aesthetic</option>
                    <option value="cetak_foto">Cetak Foto & Frame</option>
                    <option value="foto_studio">Foto Studio Pontianak</option>
                    <option value="restorasi_edit">Restorasi & Edit</option>
                    <option value="merchandise">Merchandise & Mug</option>
                    <option value="banner">Banner & Spanduk</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-stone-800 font-semibold mb-1"
                    htmlFor="adminmenuview-field-3"
                  >
                    Satuan Penjualan:
                  </label>
                  <input
                    id="adminmenuview-field-3"
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="Contoh: 2 strip, lembar, paket, pcs"
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-medium focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-stone-800 font-semibold mb-1"
                  htmlFor="adminmenuview-field-4"
                >
                  Deskripsi Lengkap (Keunggulan & Kualitas):
                </label>
                <textarea
                  id="adminmenuview-field-4"
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Contoh: Cetak foto strip 4-cut aesthetic gaya Korea menggunakan kertas foto minilab asli tahan air puluhan tahun..."
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Price & Cost */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-3">
                <span className="font-bold text-stone-900 block text-xs">
                  Penetapan Harga & Biaya Pokok (HPP)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-stone-700 font-semibold mb-1"
                      htmlFor="adminmenuview-field-5"
                    >
                      Harga Jual Konsumen (Rp):
                    </label>
                    <input
                      id="adminmenuview-field-5"
                      type="number"
                      min={0}
                      step={500}
                      required
                      value={formBasePrice}
                      onChange={(e) => setFormBasePrice(Number(e.target.value))}
                      className="w-full border border-stone-300 rounded-xl px-3 py-2 tabular-nums font-bold text-stone-900 focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-stone-700 font-semibold mb-1"
                      htmlFor="adminmenuview-field-6"
                    >
                      Biaya Pokok Produksi / HPP (Rp):
                    </label>
                    <input
                      id="adminmenuview-field-6"
                      type="number"
                      min={0}
                      step={100}
                      required
                      value={formEstimatedCost}
                      onChange={(e) =>
                        setFormEstimatedCost(Number(e.target.value))
                      }
                      className="w-full border border-stone-300 rounded-xl px-3 py-2 tabular-nums font-bold text-stone-900 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                {/* Live Margin Calculation */}
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
                  <span className="text-stone-600">
                    Proyeksi Laba Bersih per Unit:
                  </span>
                  <span className="font-bold text-emerald-700 tabular-nums">
                    +{formatRupiah(formBasePrice - formEstimatedCost)} (
                    {formBasePrice > 0
                      ? Math.round(
                          ((formBasePrice - formEstimatedCost) /
                            formBasePrice) *
                            100,
                        )
                      : 0}
                    % Margin)
                  </span>
                </div>
              </div>

              {/* Material & Paper Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-stone-800 font-semibold mb-1"
                    htmlFor="adminmenuview-field-7"
                  >
                    Jenis Bahan / Mesin:
                  </label>
                  <select
                    id="adminmenuview-field-7"
                    value={formPaperType}
                    onChange={(e) => setFormPaperType(e.target.value as any)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white font-medium"
                  >
                    <option value="roll">
                      Roll Mesin Minilab (Cepat, Presisi)
                    </option>
                    <option value="sheet">
                      Lembaran Sheet / A4 (Pas Foto / Dokumen)
                    </option>
                    <option value="merchandise">
                      Bahan Fisik / Merchandise (Mug, Frame)
                    </option>
                    <option value="service">
                      Jasa / Layanan Studio & Restorasi
                    </option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPopular}
                      onChange={(e) => setFormPopular(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-semibold text-stone-800">
                      Tandai sebagai Produk Populer / Best Seller
                    </span>
                  </label>
                </div>
              </div>

              {/* Options Configuration */}
              <div className="space-y-3 pt-2 border-t border-stone-200">
                <span className="font-bold text-stone-800 block">
                  Konfigurasi Opsi Tambahan (Pisahkan dengan koma):
                </span>

                <div>
                  <label
                    className="block text-stone-600 text-[11px] font-semibold mb-0.5"
                    htmlFor="adminmenuview-field-8"
                  >
                    Opsi Ukuran Foto:
                  </label>
                  <input
                    id="adminmenuview-field-8"
                    type="text"
                    value={formSizes}
                    onChange={(e) => setFormSizes(e.target.value)}
                    placeholder="Contoh: 2x6 inch, 4R (10x15cm), 10R, 16R"
                    className="w-full border border-stone-300 rounded-xl px-3 py-1.5 text-stone-900 text-xs"
                  />
                </div>

                <div>
                  <label
                    className="block text-stone-600 text-[11px] font-semibold mb-0.5"
                    htmlFor="adminmenuview-field-9"
                  >
                    Opsi Finishing Kertas:
                  </label>
                  <input
                    id="adminmenuview-field-9"
                    type="text"
                    value={formFinishes}
                    onChange={(e) => setFormFinishes(e.target.value)}
                    placeholder="Contoh: Glossy Anti-Luntur, Doff Matte, Silk Luster"
                    className="w-full border border-stone-300 rounded-xl px-3 py-1.5 text-stone-900 text-xs"
                  />
                </div>

                <div>
                  <label
                    className="block text-stone-600 text-[11px] font-semibold mb-0.5"
                    htmlFor="adminmenuview-field-10"
                  >
                    Opsi Bingkai / Frame:
                  </label>
                  <input
                    id="adminmenuview-field-10"
                    type="text"
                    value={formFrames}
                    onChange={(e) => setFormFrames(e.target.value)}
                    placeholder="Contoh: Tanpa Bingkai, Minimalis Hitam, Minimalis Putih, Kayu Jati"
                    className="w-full border border-stone-300 rounded-xl px-3 py-1.5 text-stone-900 text-xs"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl font-semibold hover:bg-stone-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold transition-colors shadow-xs flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menyimpan ke Cloud Firestore...</span>
                    </>
                  ) : (
                    <span>
                      {editingItem ? 'Simpan Perubahan' : 'Buat Layanan Baru'}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import { tr } from '../i18n/runtime';
import { CatalogQuickEditor } from './CatalogQuickEditor';
import { frameAdjustment, frameOptions } from '../utils/catalogEditing';
import { useDialog } from '../hooks/useDialog';
import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { ServiceItem, ServiceCategory } from '../types';
import { formatRupiah } from '../utils/formatters';
import { Plus, X, Layers, RefreshCw } from 'lucide-react';

export const AdminMenuView: React.FC = () => {
  const { addService, updateService } = useStudio();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
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
      alert(tr('Nama layanan wajib diisi.'));
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
      isActive: editingItem?.isActive ?? true,
      options: {
        ...editingItem?.options,
        ...optionsObj,
        sizes: sizesArr,
        frames: framesArr,
        finishes: finishesArr,
        backgroundColors: bgColorsArr,
      },
    };

    setIsSaving(true);
    try {
      if (editingItem) {
        servicePayload.options = frameOptions(
          editingItem,
          framesArr.map((name, index) => ({
            name,
            ...frameAdjustment(
              editingItem,
              editingItem.options?.frames?.includes(name)
                ? name
                : editingItem.options?.frames?.[index] || name,
            ),
          })),
        );
        servicePayload.options = {
          ...servicePayload.options,
          sizes: sizesArr,
          finishes: finishesArr,
          backgroundColors: bgColorsArr,
        };
        if (
          JSON.stringify(sizesArr) !==
            JSON.stringify(editingItem.options?.sizes || []) &&
          editingItem.stockMode === 'automatic'
        )
          servicePayload.stockMode = undefined;
      }
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
        tr(`Gagal menyimpan perubahan: ${err?.message || 'Terjadi kesalahan'}`),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="qp-container py-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="qp-eyebrow">{tr('Katalog studio')}</span>
          <h1 className="text-3xl !font-sans font-semibold mt-2">
            {tr('Produk & harga')}
          </h1>
          <p className="text-sm text-stone-600 mt-3">
            {tr(
              'Nama, harga, ukuran, dan bingkai dapat diubah langsung tanpa membuka formulir panjang.',
            )}
          </p>
        </div>
        <button className="qp-button" onClick={handleOpenCreateModal}>
          <Plus size={17} />
          {tr('Tambah produk')}
        </button>
      </div>
      {notificationMsg && (
        <p role="status" className="qp-notice">
          {tr(notificationMsg)}
        </p>
      )}
      <CatalogQuickEditor onDetails={handleOpenEditModal} />
      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={tr('Rincian layanan')}
            className="qp-dialog !max-w-xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-stone-900 text-stone-100 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold">
                  {editingItem
                    ? tr('Edit Menu Layanan & Harga')
                    : tr('Tambah Menu Layanan Baru')}
                </h3>
              </div>
              <button
                aria-label={tr('Tutup rincian layanan')}
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
                  {tr('Nama Menu / Layanan')}{' '}
                  <span className="text-rose-500">*</span>:
                </label>
                <input
                  id="adminmenuview-field-1"
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={tr('Contoh: Photostrip 3-Pose Korean Aesthetic')}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-medium focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-stone-800 font-semibold mb-1"
                    htmlFor="adminmenuview-field-2"
                  >
                    {tr('Kategori Layanan:')}
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
                      {tr('Photostrip & Polaroid (Gen Z)')}
                    </option>
                    <option value="pas_foto">
                      {tr('Pas Foto & Aesthetic')}
                    </option>
                    <option value="cetak_foto">
                      {tr('Cetak Foto & Frame')}
                    </option>
                    <option value="foto_studio">
                      {tr('Foto Studio Pontianak')}
                    </option>
                    <option value="restorasi_edit">
                      {tr('Restorasi & Edit')}
                    </option>
                    <option value="merchandise">
                      {tr('Merchandise & Mug')}
                    </option>
                    <option value="banner">{tr('Banner & Spanduk')}</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-stone-800 font-semibold mb-1"
                    htmlFor="adminmenuview-field-3"
                  >
                    {tr('Satuan Penjualan:')}
                  </label>
                  <input
                    id="adminmenuview-field-3"
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder={tr('Contoh: 2 strip, lembar, paket, pcs')}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-medium focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-stone-800 font-semibold mb-1"
                  htmlFor="adminmenuview-field-4"
                >
                  {tr('Deskripsi Lengkap (Keunggulan & Kualitas):')}
                </label>
                <textarea
                  id="adminmenuview-field-4"
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={tr(
                    'Contoh: Cetak foto strip 4-cut aesthetic gaya Korea menggunakan kertas foto minilab asli tahan air puluhan tahun...',
                  )}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Price & Cost */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-3">
                <span className="font-bold text-stone-900 block text-xs">
                  {tr('Penetapan Harga & Biaya Pokok (HPP)')}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-stone-700 font-semibold mb-1"
                      htmlFor="adminmenuview-field-5"
                    >
                      {tr('Harga Jual Konsumen (Rp):')}
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
                      {tr('Biaya Pokok Produksi / HPP (Rp):')}
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
                    {tr('Proyeksi Laba Bersih per Unit:')}
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
                    {tr('% Margin)')}
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
                    {tr('Jenis Bahan / Mesin:')}
                  </label>
                  <select
                    id="adminmenuview-field-7"
                    value={formPaperType}
                    onChange={(e) => setFormPaperType(e.target.value as any)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white font-medium"
                  >
                    <option value="roll">
                      {tr('Roll Mesin Minilab (Cepat, Presisi)')}
                    </option>
                    <option value="sheet">
                      {tr('Lembaran Sheet / A4 (Pas Foto / Dokumen)')}
                    </option>
                    <option value="merchandise">
                      {tr('Bahan Fisik / Merchandise (Mug, Frame)')}
                    </option>
                    <option value="service">
                      {tr('Jasa / Layanan Studio & Restorasi')}
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
                      {tr('Tandai sebagai Produk Populer / Best Seller')}
                    </span>
                  </label>
                </div>
              </div>

              {/* Options Configuration */}
              <div className="space-y-3 pt-2 border-t border-stone-200">
                <span className="font-bold text-stone-800 block">
                  {tr('Konfigurasi Opsi Tambahan (Pisahkan dengan koma):')}
                </span>

                <div>
                  <label
                    className="block text-stone-600 text-[11px] font-semibold mb-0.5"
                    htmlFor="adminmenuview-field-8"
                  >
                    {tr('Opsi Ukuran Foto:')}
                  </label>
                  <input
                    id="adminmenuview-field-8"
                    type="text"
                    value={formSizes}
                    onChange={(e) => setFormSizes(e.target.value)}
                    placeholder={tr('Contoh: 2x6 inch, 4R (10x15cm), 10R, 16R')}
                    className="w-full border border-stone-300 rounded-xl px-3 py-1.5 text-stone-900 text-xs"
                  />
                </div>

                <div>
                  <label
                    className="block text-stone-600 text-[11px] font-semibold mb-0.5"
                    htmlFor="adminmenuview-field-9"
                  >
                    {tr('Opsi Finishing Kertas:')}
                  </label>
                  <input
                    id="adminmenuview-field-9"
                    type="text"
                    value={formFinishes}
                    onChange={(e) => setFormFinishes(e.target.value)}
                    placeholder={tr(
                      'Contoh: Glossy Anti-Luntur, Doff Matte, Silk Luster',
                    )}
                    className="w-full border border-stone-300 rounded-xl px-3 py-1.5 text-stone-900 text-xs"
                  />
                </div>

                <div>
                  <label
                    className="block text-stone-600 text-[11px] font-semibold mb-0.5"
                    htmlFor="adminmenuview-field-10"
                  >
                    {tr('Opsi Bingkai / Frame:')}
                  </label>
                  <input
                    id="adminmenuview-field-10"
                    type="text"
                    value={formFrames}
                    onChange={(e) => setFormFrames(e.target.value)}
                    placeholder={tr(
                      'Contoh: Tanpa Bingkai, Minimalis Hitam, Minimalis Putih, Kayu Jati',
                    )}
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
                  {tr('Batal')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold transition-colors shadow-xs flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{tr('Menyimpan ke Cloud Firestore...')}</span>
                    </>
                  ) : (
                    <span>
                      {editingItem
                        ? tr('Simpan Perubahan')
                        : tr('Buat Layanan Baru')}
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

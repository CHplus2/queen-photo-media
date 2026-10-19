import { serviceText } from '../i18n/catalogText';
import { tr } from '../i18n/runtime';
import { frameAdjustment } from '../utils/catalogEditing';
import { ServiceArtwork } from './ServiceArtwork';
import React, { useEffect, useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { useDialog } from '../hooks/useDialog';
import { formatRupiah } from '../utils/formatters';
import {
  X,
  ShoppingBag,
  ChevronDown,
  MessageCircle,
  SlidersHorizontal,
} from 'lucide-react';
export const OrderConfiguratorModal: React.FC = () => {
  const {
    isOrderModalOpen,
    setIsOrderModalOpen,
    selectedServiceForOrder,
    services,
    addToCart,
    setIsCartOpen,
  } = useStudio();
  const service =
    selectedServiceForOrder || services.find((s) => s.isActive !== false);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('');
  const [finish, setFinish] = useState('');
  const [frame, setFrame] = useState('Tanpa Bingkai');
  const [background, setBackground] = useState('');
  const [notes, setNotes] = useState('');
  const [expanded, setExpanded] = useState(false);
  const close = () => setIsOrderModalOpen(false);
  const ref = useDialog<HTMLElement>(isOrderModalOpen, close);
  useEffect(() => {
    if (!isOrderModalOpen || !service) return;
    setQuantity(1);
    setSize(service.options?.sizes?.[0] || service.unit);
    setFinish(service.options?.finishes?.[0] || '');
    setFrame('Tanpa Bingkai');
    setBackground(service.options?.backgroundColors?.[0] || '');
    setNotes('');
    setExpanded(false);
  }, [isOrderModalOpen, service?.id]);
  if (!isOrderModalOpen || !service) return null;
  const adjustment = frameAdjustment(service, frame);
  const extra = [adjustment.price, adjustment.cost];
  const price = service.basePrice + extra[0];
  const quote = ['restorasi_edit', 'banner', 'foto_studio'].includes(
    service.category,
  );
  const phone = (import.meta.env.VITE_STUDIO_WHATSAPP || '').replace(
    /[^0-9]/g,
    '',
  );
  const quoteLink = `https://wa.me/${phone}?text=${encodeURIComponent(`Halo Queen Photo, saya ingin konsultasi ${serviceText(service, 'name')}. ${notes || 'Mohon konfirmasi harga dan jadwal.'}`)}`;
  const add = (event: React.FormEvent) => {
    event.preventDefault();
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) return;
    addToCart({
      id: crypto.randomUUID(),
      serviceId: service.id,
      serviceName: service.name,
      serviceNameEn: service.english?.name || undefined,
      category: service.category,
      size,
      finish: finish || undefined,
      frame: frame === 'Tanpa Bingkai' ? undefined : frame,
      backgroundColor: background || undefined,
      notes,
      quantity,
      unitPrice: price,
      unitCost: service.estimatedCost + extra[1],
    });
    close();
    setIsCartOpen(true);
  };
  const select = (
    label: string,
    values: string[] | undefined,
    value: string,
    change: (s: string) => void,
  ) =>
    values?.length ? (
      <label className="block">
        <span className="qp-label">{tr(label)}</span>
        <select
          className="qp-field"
          value={value}
          onChange={(e) => change(e.target.value)}
        >
          {values.map((option) => (
            <option key={option} value={option}>
              {tr(option)}
            </option>
          ))}
        </select>
      </label>
    ) : null;
  return (
    <div
      className="qp-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section
        className="qp-dialog qp-service-dialog"
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="configure-title"
        aria-describedby="configure-description"
      >
        <div className="qp-dialog-header">
          <div>
            <span className="qp-eyebrow">{tr('Sesuaikan pesanan')}</span>
            <h2 id="configure-title" className="text-2xl leading-tight mt-2">
              {serviceText(service, 'name')}
            </h2>
          </div>
          <button
            className="qp-icon-button shrink-0"
            aria-label={tr('Tutup pilihan layanan')}
            onClick={close}
          >
            <X size={20} />
          </button>
        </div>
        <ServiceArtwork
          category={service.category}
          className="qp-service-art"
        />
        <form
          id="configure-form"
          onSubmit={add}
          className="qp-dialog-content space-y-5"
        >
          <p id="configure-description" className="text-sm text-stone-600">
            {tr(
              'Pilihan standar sudah tersedia. Ubah hanya yang Anda perlukan.',
            )}
          </p>
          {select(tr('Ukuran / paket'), service.options?.sizes, size, setSize)}
          <div className="grid grid-cols-[1fr_120px] items-end gap-6">
            <div>
              <p className="qp-label">
                {quote ? tr('Harga mulai dari') : tr('Harga per paket')}
              </p>
              <p className="text-xl font-semibold tabular-nums">
                {formatRupiah(price)}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                {tr(serviceText(service, 'unit'))}
              </p>
            </div>
            <label>
              <span className="qp-label">{tr('Jumlah')}</span>
              <input
                className="qp-field"
                aria-label={tr('Jumlah')}
                type="number"
                min={1}
                max={999}
                step={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />
            </label>
          </div>
          <div className="border-y border-stone-200 py-2">
            <button
              className="flex items-center justify-between gap-3 w-full min-h-12 text-sm font-medium"
              type="button"
              aria-expanded={expanded}
              aria-controls="extra-options"
              onClick={() => setExpanded(!expanded)}
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal size={16} />
                {tr('Opsi tambahan & catatan (opsional)')}
              </span>
              <ChevronDown size={17} className={expanded ? 'rotate-180' : ''} />
            </button>
            {expanded && (
              <div id="extra-options" className="space-y-4 pt-3 pb-4">
                {select(
                  tr('Finishing'),
                  service.options?.finishes,
                  finish,
                  setFinish,
                )}
                {select(
                  tr('Bingkai'),
                  service.options?.frames
                    ? [
                        'Tanpa Bingkai',
                        ...service.options.frames.filter(
                          (f) => f !== 'Tanpa Bingkai',
                        ),
                      ]
                    : undefined,
                  frame,
                  setFrame,
                )}
                {select(
                  tr('Warna latar'),
                  service.options?.backgroundColors,
                  background,
                  setBackground,
                )}
                {extra[0] > 0 && (
                  <p className="text-xs text-stone-600">
                    {tr('Tambahan bingkai')} {formatRupiah(extra[0])}{' '}
                    {tr('per paket sudah termasuk pada harga.')}
                  </p>
                )}
                <label>
                  <span className="qp-label">{tr('Catatan untuk studio')}</span>
                  <textarea
                    className="qp-field"
                    rows={3}
                    value={notes}
                    maxLength={2000}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={tr(
                      'Contoh: crop fokus wajah, warna natural, atau minta konfirmasi sebelum cetak.',
                    )}
                  />
                </label>
              </div>
            )}
          </div>
          <div className="qp-notice flex gap-3">
            <MessageCircle size={19} className="shrink-0 mt-0.5" />
            <div>
              <strong className="block text-sm text-stone-900">
                {tr('Foto dikirim setelah checkout')}
              </strong>
              <p className="text-sm mt-1">
                {tr(
                  'Kirim foto asli melalui WhatsApp studio. Belum perlu menyiapkan file di langkah ini.',
                )}
              </p>
            </div>
          </div>
          {quote && (
            <a
              href={quoteLink}
              target="_blank"
              rel="noreferrer"
              className="qp-button qp-button-secondary w-full"
            >
              {tr('Konsultasi harga / jadwal')}
              {!phone && ' via WhatsApp'}
            </a>
          )}
        </form>
        <div className="qp-dialog-footer">
          <div className="flex justify-between gap-4 items-center mb-4">
            <span className="text-sm text-stone-500">
              {quote ? tr('Estimasi total') : tr('Total layanan')}
            </span>
            <strong className="text-xl tabular-nums">
              {formatRupiah(price * (quantity || 0))}
            </strong>
          </div>
          <button
            type="submit"
            form="configure-form"
            disabled={
              !Number.isInteger(quantity) || quantity < 1 || quantity > 999
            }
            className="qp-button w-full"
          >
            <ShoppingBag size={17} />
            {tr('Tambah ke keranjang')}
          </button>
          <p className="text-xs text-stone-500 text-center mt-3">
            {tr('Masih bisa menambah layanan lain sebelum checkout.')}
          </p>
        </div>
      </section>
    </div>
  );
};

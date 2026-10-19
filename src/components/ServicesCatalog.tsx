import { serviceText } from '../i18n/catalogText';
import { tr } from '../i18n/runtime';
import { ServiceArtwork } from './ServiceArtwork';
import React, { useEffect, useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { formatRupiah } from '../utils/formatters';
import {
  Camera,
  Image,
  UserRound,
  Sparkles,
  Gift,
  Frame,
  Flag,
  Search,
  ArrowRight,
  Plus,
  Check,
  X,
} from 'lucide-react';
const categories = [
  { id: 'all', label: 'Semua layanan', icon: Image },
  { id: 'cetak_foto', label: 'Cetak foto', icon: Image },
  {
    id: 'photostrip_polaroid',
    label: 'Photostrip & mini prints',
    icon: Sparkles,
  },
  { id: 'pas_foto', label: 'Pas foto', icon: UserRound },
  { id: 'foto_studio', label: 'Sesi studio', icon: Camera },
  { id: 'restorasi_edit', label: 'Restorasi & edit', icon: Frame },
  { id: 'merchandise', label: 'Hadiah & album', icon: Gift },
  { id: 'banner', label: 'Banner', icon: Flag },
];
export const ServicesCatalog: React.FC = () => {
  const {
    services,
    openOrderWithService,
    addServiceDirectlyToCart,
    cart,
    setIsCartOpen,
  } = useStudio();
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [added, setAdded] = useState('');
  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(''), 5000);
    return () => clearTimeout(timer);
  }, [added]);
  const visible = services.filter(
    (service) =>
      service.isActive !== false &&
      (category === 'all' || service.category === category) &&
      `${service.name} ${service.description} ${serviceText(service, 'name')} ${serviceText(service, 'description')} ${service.english?.name || ''} ${service.english?.description || ''}`
        .toLocaleLowerCase('id')
        .includes(search.trim().toLocaleLowerCase('id')),
  );
  return (
    <section id="services" className="py-12 sm:py-16 border-b border-stone-200">
      <div className="qp-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="qp-eyebrow">{tr('Layanan Queen Photo')}</span>
            <h2 className="qp-title mt-3">
              {tr('Ada cerita yang ingin dicetak?')}
            </h2>
            <p className="text-stone-600 mt-4 max-w-xl">
              {tr(
                'Pilih layanan sesuai kebutuhan. Sesuaikan detailnya, atau langsung tambahkan pilihan standar.',
              )}
            </p>
          </div>
          <div className="relative w-full md:w-72 shrink-0">
            <label htmlFor="service-search" className="sr-only">
              {tr('Cari layanan')}
            </label>
            <Search
              size={18}
              className="absolute left-4 top-4 text-stone-500"
            />
            <input
              id="service-search"
              type="search"
              placeholder={tr('Cari layanan…')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="qp-field !pl-11"
            />
          </div>
        </div>
        <div
          role="group"
          aria-label={tr('Kategori layanan')}
          className="flex gap-2 overflow-x-auto py-2 mt-7 mb-5 -mx-1 px-1"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              className="qp-filter"
              aria-pressed={category === cat.id}
              onClick={() => setCategory(cat.id)}
            >
              {tr(cat.label)}
            </button>
          ))}
        </div>
        <p role="status" className="text-xs text-stone-500 mb-5">
          {visible.length} {tr('layanan')}
          {category !== 'all'
            ? ` · ${tr(categories.find((c) => c.id === category)?.label || '')}`
            : ''}
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((service) => {
            const cat = categories.find((c) => c.id === service.category);
            const Icon = cat?.icon || Image;
            const quantity = cart
              .filter((item) => item.serviceId === service.id)
              .reduce((n, item) => n + item.quantity, 0);
            const quote = ['restorasi_edit', 'banner', 'foto_studio'].includes(
              service.category,
            );
            return (
              <article key={service.id} className="qp-service-card">
                <ServiceArtwork
                  category={service.category}
                  className="h-36 rounded-lg mb-5"
                />
                <div className="flex items-center justify-between gap-3">
                  <span className="w-11 h-11 flex items-center justify-center rounded-xl bg-stone-100 text-stone-700">
                    <Icon size={21} strokeWidth={1.5} />
                  </span>
                  {quantity > 0 ? (
                    <span className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                      <Check size={14} />
                      {quantity} {tr('di keranjang')}
                    </span>
                  ) : service.popular ? (
                    <span className="text-xs text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
                      {tr('Pilihan populer')}
                    </span>
                  ) : null}
                </div>
                <span className="qp-eyebrow !text-[10px] mt-5">
                  {tr(cat?.label || '')}
                </span>
                <h3 className="text-lg font-semibold leading-snug mt-2">
                  {serviceText(service, 'name')}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed mt-3 mb-6">
                  {serviceText(service, 'description')}
                </p>
                <div className="mt-auto pt-5 border-t border-stone-200">
                  <p className="text-xs text-stone-500">
                    {quote ? tr('Mulai dari') : tr('Harga paket')}
                  </p>
                  <p className="text-xl font-semibold tabular-nums mt-1">
                    {formatRupiah(service.basePrice)}
                    <span className="block text-xs font-normal text-stone-500 mt-1">
                      {tr('per')} {tr(serviceText(service, 'unit'))}
                    </span>
                  </p>
                  <button
                    className="qp-button w-full mt-5"
                    onClick={() => openOrderWithService(service)}
                  >
                    {tr('Pilih layanan')} <ArrowRight size={16} />
                  </button>
                  {!quote && (
                    <button
                      className="w-full min-h-11 text-sm text-stone-600 flex items-center justify-center gap-2 mt-1"
                      onClick={() => {
                        addServiceDirectlyToCart(service);
                        setAdded(service.name);
                      }}
                    >
                      <Plus size={15} />
                      {tr('Tambah pilihan standar')}
                    </button>
                  )}
                  {quote && (
                    <p className="text-xs text-stone-500 mt-3 text-center">
                      {tr('Rincian & jadwal dikonfirmasi staf.')}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        {visible.length === 0 && (
          <div className="qp-panel text-center py-16 px-6">
            <Search className="mx-auto text-stone-400" size={30} />
            <h3 className="text-xl font-semibold mt-4">
              {tr('Layanan belum ditemukan')}
            </h3>
            <p className="text-stone-500 mt-2">
              {tr('Coba kata lain atau lihat seluruh layanan.')}
            </p>
            <button
              className="qp-button qp-button-secondary mt-6"
              onClick={() => {
                setSearch('');
                setCategory('all');
              }}
            >
              {tr('Tampilkan semua layanan')}
            </button>
          </div>
        )}
      </div>
      {added && (
        <aside className="fixed bottom-24 sm:bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 max-w-xl">
          <div className="bg-stone-900 text-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
            <Check size={18} className="shrink-0" />
            <p role="status" className="text-sm flex-1 min-w-0">
              {tr('Ditambahkan ke keranjang')}
              <span className="block text-xs text-stone-300 truncate">
                {added}
              </span>
            </p>
            <button
              className="text-sm font-semibold underline min-h-11 shrink-0"
              onClick={() => {
                setIsCartOpen(true);
                setAdded('');
              }}
            >
              {tr('Lihat')}
            </button>
            <button
              className="qp-icon-button !min-w-8"
              aria-label={tr('Tutup notifikasi')}
              onClick={() => setAdded('')}
            >
              <X size={16} />
            </button>
          </div>
        </aside>
      )}
    </section>
  );
};

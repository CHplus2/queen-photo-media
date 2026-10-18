import React, { useEffect, useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { formatRupiah } from '../utils/formatters';
import { X, ShoppingBag } from 'lucide-react';

export const OrderConfiguratorModal: React.FC = () => {
  const { isOrderModalOpen, setIsOrderModalOpen, selectedServiceForOrder, services, addToCart, setIsCartOpen } = useStudio();
  const service = selectedServiceForOrder || services[0];
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('');
  const [finish, setFinish] = useState('');
  const [frame, setFrame] = useState('Tanpa Bingkai');
  const [background, setBackground] = useState('');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (!isOrderModalOpen || !service) return;
    setQuantity(1); setSize(service.options?.sizes?.[0] || service.unit);
    setFinish(service.options?.finishes?.[0] || ''); setFrame('Tanpa Bingkai');
    setBackground(service.options?.backgroundColors?.[0] || '');
    setNotes(''); setFileName(''); setExpanded(false);
  }, [isOrderModalOpen, service?.id]);
  useEffect(() => {
    if (!isOrderModalOpen) return;
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOrderModalOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [isOrderModalOpen]);
  if (!isOrderModalOpen || !service) return null;
  const extra = frame === 'Minimalis Hitam' || frame === 'Minimalis Putih' ? [25000, 12000] : frame === 'Kayu Jati Elegan' ? [55000, 28000] : frame === 'Ukiran Emas Klasik' ? [75000, 38000] : [0, 0];
  const price = service.basePrice + extra[0];
  const add = () => {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) return;
    addToCart({ id: crypto.randomUUID(), serviceId: service.id, serviceName: service.name,
      category: service.category, size, finish: finish || undefined, frame: frame === 'Tanpa Bingkai' ? undefined : frame,
      backgroundColor: background || undefined, notes, quantity, unitPrice: price,
      unitCost: service.estimatedCost + extra[1], photoFileName: fileName || undefined });
    setIsOrderModalOpen(false); setIsCartOpen(true);
  };
  const select = (label: string, values: string[] | undefined, value: string, change: (value: string) => void) => values?.length ? (
    <label className="block text-sm font-medium">{label}
      <select className="block w-full mt-1 border rounded-lg p-3" value={value} onChange={e => change(e.target.value)}>
        {values.map(option => <option key={option}>{option}</option>)}
      </select>
    </label>
  ) : null;
  const needsQuote = ['restorasi_edit', 'banner', 'foto_studio'].includes(service.category);
  const quotePhone = (import.meta.env.VITE_STUDIO_WHATSAPP || '').replace(/[^0-9]/g, '');
  const quoteLink = `https://wa.me/${quotePhone}?text=${encodeURIComponent(`Halo Queen Photo, saya ingin konsultasi ${service.name}. Rincian: ${notes || 'Mohon bantu pilih paket dan konfirmasi harga/jadwal.'}`)}`;
  return <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-3" onClick={e => { if (e.target === e.currentTarget) setIsOrderModalOpen(false); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="configure-title" className="bg-white rounded-2xl w-full max-w-lg max-h-[90dvh] overflow-auto p-6 space-y-5">
      <div className="flex justify-between gap-3"><div><p className="text-xs text-stone-500">Pilih layanan → Keranjang → Checkout</p><h2 id="configure-title" className="font-bold text-xl">{service.name}</h2></div><button aria-label="Tutup" onClick={() => setIsOrderModalOpen(false)}><X /></button></div>
      <p className="text-sm text-stone-600">{service.description}</p>
      <p className="text-sm">Pilihan standar sudah tersedia. Ubah sesuai kebutuhan, lalu gabungkan dengan layanan lain di keranjang.</p>
      {select('Ukuran / paket', service.options?.sizes, size, setSize)}
      <label className="block text-sm font-medium">Jumlah<input aria-label="Jumlah" type="number" min="1" max="999" step="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="block border rounded-lg p-3 w-full mt-1" /></label>
      <button className="text-sm underline" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>Opsi tambahan & catatan (opsional)</button>
      {expanded && <div className="space-y-4">
        {select('Finishing', service.options?.finishes, finish, setFinish)}
        {select('Bingkai', service.options?.frames ? ['Tanpa Bingkai', ...service.options.frames.filter(f => f !== 'Tanpa Bingkai')] : undefined, frame, setFrame)}
        {select('Warna latar', service.options?.backgroundColors, background, setBackground)}
        <label className="block text-sm">Catatan untuk studio<textarea className="block border rounded-lg p-3 w-full mt-1" value={notes} maxLength={2000} onChange={e => setNotes(e.target.value)} placeholder="Contoh: crop fokus wajah, warna natural, atau minta konfirmasi sebelum cetak." /></label>
      </div>}
      <div className="bg-amber-50 rounded-lg p-3 text-sm space-y-2"><p>Kirim foto asli melalui WhatsApp setelah checkout. File tidak diunggah melalui formulir ini.</p><label className="block">Catat nama file (opsional)<input className="block w-full mt-2" type="file" accept="image/*" onChange={e => setFileName(e.target.files?.[0]?.name || '')} /></label>{fileName && <p>Nama file: {fileName}</p>}</div>
      {needsQuote && <a href={quoteLink} target="_blank" rel="noreferrer" className="block border border-amber-400 rounded-lg p-3 text-sm">Butuh harga khusus / jadwal? Konsultasi via WhatsApp{!quotePhone && ' (pilih kontak studio)'}</a>}
      <div className="flex items-center justify-between gap-3 border-t pt-4"><strong>{formatRupiah(price * (quantity || 0))}</strong><button disabled={!Number.isInteger(quantity) || quantity < 1 || quantity > 999} onClick={add} className="bg-stone-900 text-white rounded-lg p-3 flex gap-2 disabled:opacity-50"><ShoppingBag size={18} />Tambah ke keranjang</button></div>
      <p className="text-xs text-stone-500">Restorasi kompleks, desain khusus, dan jadwal studio memerlukan konfirmasi staf. Jangan transfer sebelum rincian dikonfirmasi.</p>
    </section>
  </div>;
};

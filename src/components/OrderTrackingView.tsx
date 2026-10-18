import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { formatRupiah, formatDateTime, createWhatsAppOrderLink } from '../utils/formatters';
import { OrderStatus } from '../types';
import { Search, Clock, CheckCircle2, Truck, Package, MessageSquare, ArrowRight } from 'lucide-react';

export const OrderTrackingView: React.FC = () => {
  const { orders, activeTrackingId, setActiveTrackingId, setIsOrderModalOpen } = useStudio();
  const [searchInput, setSearchInput] = useState(activeTrackingId || '');

  const matchedOrder = searchInput.trim() ? orders.find(
    o => o.id.toLowerCase() === searchInput.trim().toLowerCase()
  ) : undefined;

  const getStepStatus = (currentStatus: OrderStatus, step: number) => {
    const statusOrder: OrderStatus[] = [
      'MENUNGGU_BAYAR',
      'ANTREAN_DESAIN',
      'PROSES_CETAK',
      'SIAP_DIAMBIL_KIRIM',
      'SELESAI',
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex >= step) return 'completed';
    if (currentIndex === step - 1) return 'active';
    return 'pending';
  };

  const steps = [
    { label: 'Pesanan Terdaftar', desc: 'Verifikasi rincian foto & data' },
    { label: 'Antrean Desain & Edit', desc: 'Penyesuaian warna, retouch & crop' },
    { label: 'Proses Cetak Minilab', desc: 'Pencetakan dengan kertas foto asli' },
    { label: 'Siap Kirim / Diambil', desc: 'Packing rapi & serah terima kurir' },
    { label: 'Selesai', desc: 'Telah sampai / diterima pelanggan' },
  ];

  return (
    <div className="py-12 max-w-4xl mx-auto px-6">
      <div className="text-center space-y-2 mb-8">
        <p className="text-amber-800 text-xs font-semibold uppercase tracking-wider">
          Pelacakan Real-time
        </p>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
          Lacak Status Pesanan Foto Anda
        </h2>
        <p className="text-stone-600 text-sm max-w-md mx-auto">
          Masukkan Nomor Pesanan (misal: QP-2610-001) di perangkat yang digunakan saat memesan. Untuk bantuan dari perangkat lain, hubungi studio.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-4 rounded-2xl border border-stone-300 shadow-sm mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Contoh: QP-2610-001 atau 08125678..."
              className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900"
            />
          </div>
          <button
            onClick={() => setActiveTrackingId(searchInput)}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-100 font-semibold text-xs rounded-xl transition-colors whitespace-nowrap"
          >
            Lacak
          </button>
        </div>

        {/* Quick chip shortcuts for demo convenience */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-500">
          <span>Contoh pesanan:</span>
          {orders.slice(0, 3).map(o => (
            <button
              key={o.id}
              onClick={() => {
                setSearchInput(o.id);
                setActiveTrackingId(o.id);
              }}
              className="hover:text-amber-800 underline font-mono"
            >
              #{o.id} ({o.customerName})
            </button>
          ))}
        </div>
      </div>

      {/* Order Tracking Result */}
      {matchedOrder ? (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
          
          {/* Header Status Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xl font-bold text-stone-900">
                  #{matchedOrder.id}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-md font-semibold bg-amber-100 text-amber-900">
                  {matchedOrder.orderStatus.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Dipesan pada {formatDateTime(matchedOrder.createdAt)} · Pemesan: <strong className="text-stone-800">{matchedOrder.customerName}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-stone-500">Total Tagihan:</span>
              <p className="text-xl font-mono font-bold text-stone-900">
                {formatRupiah(matchedOrder.totalAmount)}
              </p>
              <span className="text-xs text-emerald-700 font-medium">
                {matchedOrder.paymentStatus === 'LUNAS' ? 'Pembayaran Terverifikasi (Lunas)' : 'Menunggu Pelunasan'}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-6">
              Kemajuan Pengerjaan di Queen Photo:
            </h4>
            
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
              {steps.map((st, idx) => {
                const state = getStepStatus(matchedOrder.orderStatus, idx);
                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div
                      className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        state === 'completed'
                          ? 'bg-emerald-600 text-white'
                          : state === 'active'
                          ? 'bg-amber-400 text-stone-950 ring-4 ring-amber-100'
                          : 'bg-stone-200 text-stone-500'
                      }`}
                    >
                      {state === 'completed' ? '✓' : idx + 1}
                    </div>

                    <div className="pt-0.5">
                      <p className={`text-sm font-semibold ${state === 'active' ? 'text-amber-900' : 'text-stone-900'}`}>
                        {st.label}
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5">{st.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery & Dispatch Box */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
            <div className="flex items-center gap-2 text-stone-800 font-semibold text-sm">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Informasi Pengiriman / Pengambilan</span>
            </div>
            <p className="text-stone-600">
              <strong>Metode:</strong>{' '}
              {matchedOrder.deliveryMethod === 'GRAB_EXPRESS_PONTIANAK'
                ? `Kurir GrabExpress Pontianak (${matchedOrder.district || 'Kota Pontianak'})`
                : 'Ambil Sendiri di Studio Queen Photo (Jl. Gajah Mada No. 128)'}
            </p>
            {matchedOrder.trackingNumber && (
              <p className="text-stone-600">
                <strong>Nomor Resi / Booking Grab:</strong>{' '}
                <span className="font-mono font-semibold text-stone-800">{matchedOrder.trackingNumber}</span>
              </p>
            )}
            {matchedOrder.customerAddress && (
              <p className="text-stone-600">
                <strong>Alamat Tujuan:</strong> {matchedOrder.customerAddress}
              </p>
            )}
            {matchedOrder.staffNotes && (
              <p className="text-stone-600 italic pt-1 border-t border-stone-200">
                <strong>Catatan Operator Studio:</strong> "{matchedOrder.staffNotes}"
              </p>
            )}
          </div>

          {/* Order Item List */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
              Rincian Item yang Dipesan:
            </h4>
            <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
              {matchedOrder.items.map((item, i) => (
                <div key={i} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-stone-900">{item.quantity}x {item.serviceName}</p>
                    <p className="text-stone-500 mt-0.5">
                      Ukuran: {item.size} {item.finish && `· Kertas: ${item.finish}`} {item.frame && `· Bingkai: ${item.frame}`}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-stone-800">
                    {formatRupiah(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Helper CTA */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <a
              href={createWhatsAppOrderLink(matchedOrder)}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium text-center transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Hubungi CS WhatsApp Mengenai Pesanan Ini</span>
            </a>
          </div>

        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8 space-y-4">
          <Package className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">Belum Ada Pesanan yang Terpilih</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Ketik nomor pesanan di atas untuk memeriksa proses pengerjaan, atau buat pesanan cetak baru sekarang.
          </p>
          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="px-5 py-2.5 bg-stone-900 text-amber-100 text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5"
          >
            <span>Buat Pesanan Cetak Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

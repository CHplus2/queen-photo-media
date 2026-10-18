import { paidAmount, remainingAmount } from '../utils/payments';
import React from 'react';
import { useDialog } from '../hooks/useDialog';
import { Order } from '../types';
import {
  formatRupiah,
  formatDateTime,
  formatPaymentMethod,
  createWhatsAppOrderLink,
} from '../utils/formatters';
import { X, Printer, MessageSquare, Check } from 'lucide-react';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  onClose,
}) => {
  const ref = useDialog<HTMLDivElement>(Boolean(order), onClose);
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Nota pesanan"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8"
      >
        {/* Top Control Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-stone-900 text-stone-100 border-b border-stone-800 print:hidden">
          <span className="text-xs font-semibold text-amber-400">
            Struk Nota Resmi Queen Photo
          </span>
          <button
            aria-label="Tutup nota"
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PRINTABLE RECEIPT CONTENT */}
        <div
          id="printable-receipt"
          className="p-6 text-stone-900 text-xs space-y-4 bg-white"
        >
          {/* Header */}
          <div className="text-center space-y-1 pb-3 border-b-2 border-stone-800">
            <h2 className="text-lg font-serif font-bold text-stone-950 tracking-tight">
              QUEEN PHOTO PONTIANAK
            </h2>
            <p className="text-[11px] text-stone-600">
              Studio Foto & Laboratorium Cetak Minilab Sejak 1980
            </p>
            <p className="text-[10px] text-stone-500">
              Jl. Gajah Mada No. 128, Pontianak Kota
            </p>
          </div>

          {/* Meta Info */}
          <div className="space-y-1 text-[11px] text-stone-700 pb-3 border-b border-stone-200">
            <div className="flex justify-between">
              <span>No. Nota:</span>
              <strong className="font-mono text-stone-950 break-all text-right max-w-[70%]">
                #{order.id}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Waktu:</span>
              <span>{formatDateTime(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pelanggan:</span>
              <strong>
                {order.customerName} ({order.customerPhone})
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Saluran:</span>
              <span>
                {order.channel === 'WALKIN'
                  ? 'Kasir Toko (Walk-in)'
                  : 'Pemesanan Online'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Pengiriman:</span>
              <span>
                {order.deliveryMethod === 'GRAB_EXPRESS_PONTIANAK'
                  ? `GrabExpress (${order.district || 'Pontianak'})`
                  : 'Ambil di Studio'}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2 py-1">
            <div className="font-semibold text-stone-950 border-b border-stone-300 pb-1 flex justify-between">
              <span>Deskripsi Item</span>
              <span>Subtotal</span>
            </div>
            {order.items.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-start text-[11px]"
              >
                <div className="pr-2">
                  <p className="font-medium text-stone-900">
                    {item.quantity}x {item.serviceName}
                  </p>
                  <p className="text-[10px] text-stone-500">
                    {item.size} {item.finish && `· ${item.finish}`}{' '}
                    {item.frame && `· ${item.frame}`}
                  </p>
                </div>
                <span className="font-mono font-semibold text-stone-950 whitespace-nowrap">
                  {formatRupiah(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="pt-2 border-t-2 border-stone-800 space-y-1 text-[11px]">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal Pesanan:</span>
              <span className="font-mono">{formatRupiah(order.subtotal)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-stone-600">
                <span>Ongkir GrabExpress:</span>
                <span className="font-mono">
                  {formatRupiah(order.deliveryFee)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-stone-950 pt-1 border-t border-stone-200">
              <span>TOTAL AKHIR:</span>
              <span className="font-mono">
                {formatRupiah(order.totalAmount)}
                <span className="block text-sm font-normal">
                  Dibayar {formatRupiah(paidAmount(order))} · Sisa{' '}
                  {formatRupiah(remainingAmount(order))}
                </span>
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-stone-600 pt-1">
              <span>Metode Bayar:</span>
              <span>
                {formatPaymentMethod(order.paymentMethod)} (
                {order.paymentStatus === 'SEBAGIAN'
                  ? 'Bayar sebagian'
                  : order.paymentStatus === 'LUNAS'
                    ? 'Lunas'
                    : 'Belum bayar'}
                )
              </span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center pt-3 border-t border-stone-200 text-[10px] text-stone-500 space-y-0.5">
            <p>
              Terima kasih atas kepercayaan Anda pada Queen Photo Pontianak.
            </p>
            <p>Kertas foto minilab asli tahan pudar hingga 50 tahun.</p>
            <p className="font-mono pt-1 text-stone-400">
              --- Simpan struk ini sebagai tanda bukti pengambilan ---
            </p>
          </div>
        </div>

        {/* Bottom Actions (Hidden during print) */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-stone-100 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk Nota (Print)</span>
          </button>
          <a
            href={createWhatsAppOrderLink(order)}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors text-center"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Kirim Nota ke WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};

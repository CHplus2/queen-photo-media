import { paidAmount, remainingAmount } from './payments';
import { businessDate, reportableOrders, salesSummary } from './sales';
import { Order, PaymentMethod } from '../types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactRupiah(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`;
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)} Jt`;
  }
  if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)} Rb`;
  }
  return `Rp ${amount}`;
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Pontianak',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}

export function generateWhatsAppRecapText(
  orders: Order[],
  targetMonthly = 30000000,
): string {
  const todayStr = businessDate(new Date());
  const todayOrders = reportableOrders(orders, todayStr);

  const totalOmset = salesSummary(todayOrders).revenue;
  const totalHPP = todayOrders.reduce((sum, o) => sum + o.totalCost, 0);
  const totalProfit = totalOmset - totalHPP;
  const walkinCount = todayOrders.filter((o) => o.channel === 'WALKIN').length;
  const onlineCount = todayOrders.filter((o) => o.channel === 'ONLINE').length;

  const monthOrders = reportableOrders(orders);
  const monthlyOmset = salesSummary(monthOrders).revenue;
  const monthlyProfit = salesSummary(monthOrders).profit;
  const targetPct = Math.min(
    100,
    Math.round((monthlyOmset / targetMonthly) * 100),
  );

  let text = `📸 *LAPORAN PENJUALAN QUEEN PHOTO PONTIANAK*\n`;
  text += `📅 Tanggal: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}\n\n`;
  text += `📊 *RINGKASAN HARI INI:*\n`;
  text += `• Total Transaksi: ${todayOrders.length} pesanan (${walkinCount} Toko / ${onlineCount} Online)\n`;
  text += `• Total Omset: *${formatRupiah(totalOmset)}*\n`;
  text += `• Estimasi HPP Kertas/Bahan: ${formatRupiah(totalHPP)}\n`;
  text += `• Estimasi Laba Kotor: *${formatRupiah(totalProfit)}* (${totalOmset > 0 ? Math.round((totalProfit / totalOmset) * 100) : 0}%)\n\n`;

  text += `📈 *PROGRESS OMSET BULAN INI:*\n`;
  text += `• Akumulasi Omset: ${formatRupiah(monthlyOmset)} / Target ${formatRupiah(targetMonthly)} (${targetPct}%)\n`;
  text += `• Akumulasi Laba: ${formatRupiah(monthlyProfit)}\n\n`;

  text += `📝 *DETAIL TRANSAKSI TERAKHIR:*\n`;
  todayOrders.slice(0, 5).forEach((order, index) => {
    const itemNames = order.items
      .map((i) => `${i.quantity}x ${i.serviceName}`)
      .join(', ');
    text += `${index + 1}. [${order.channel}] ${order.customerName} - ${itemNames} = ${formatRupiah(order.totalAmount)} (${order.paymentMethod})\n`;
  });

  text += `\n_Dicatat otomatis via Sistem Digital Queen Photo Pontianak_ ✨`;
  return text;
}

export function createWhatsAppOrderLink(order: Order): string {
  const phone = order.customerPhone.replace(/[^0-9]/g, '');
  const cleanPhone = phone.startsWith('0') ? `62${phone.slice(1)}` : phone;

  let msg = `Halo ${order.customerName}, terima kasih telah memesan di *Queen Photo Pontianak*! 📸\n\n`;
  msg += `Nomor Pesanan: *#${order.id}*\n`;
  msg += `Status: *${order.orderStatus.replace(/_/g, ' ')}*\n`;
  msg += `Metode Pembayaran: *${formatPaymentMethod(order.paymentMethod)}* (${order.paymentStatus})\n`;
  msg += `Sudah dibayar: *${formatRupiah(paidAmount(order))}* · Sisa bayar: *${formatRupiah(remainingAmount(order))}*\n`;
  msg += `Metode Pengiriman: *${order.deliveryMethod === 'GRAB_EXPRESS_PONTIANAK' ? 'GrabExpress Pontianak' : order.deliveryMethod === 'AMBIL_STUDIO' ? 'Ambil di Studio (Gajah Mada)' : 'Ekspedisi Kalbar'}*\n\n`;
  msg += `*Rincian Pesanan:*\n`;
  order.items.forEach((item) => {
    msg += `• ${item.quantity}x ${item.serviceName} (${item.size}${item.finish ? `, ${item.finish}` : ''}) = ${formatRupiah(item.unitPrice * item.quantity)}\n`;
  });
  if (order.deliveryFee > 0) {
    msg += `• Ongkir: ${formatRupiah(order.deliveryFee)}\n`;
  }
  msg += `\n*Total Tagihan: ${formatRupiah(order.totalAmount)}*\n\n`;
  msg += `Lokasi Studio: Jl. Gajah Mada No. 128, Pontianak (Buka 09.00 - 20.30 WIB)\n`;
  msg += `Untuk konfirmasi atau pertanyaan, balas pesan ini ya Kak!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}

export function createStudioOrderLink(order: Order): string {
  const phone = (import.meta.env.VITE_STUDIO_WHATSAPP || '').replace(
    /[^0-9]/g,
    '',
  );
  const text =
    `Halo Queen Photo, saya ${order.customerName}. Mohon konfirmasi pesanan #${order.id}.\n` +
    order.items
      .map(
        (item) =>
          `${item.quantity}x ${item.serviceName} (${item.size})${item.photoFileName ? ` — file: ${item.photoFileName}` : ''}`,
      )
      .join('\n') +
    `\nTotal: ${formatRupiah(order.totalAmount)}. Status pembayaran: ${order.paymentStatus}. Saya akan mengirim foto asli di chat ini.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function formatPaymentMethod(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    TUNAI_KASIR: 'Tunai di kasir',
    QRIS: 'QRIS',
    TRANSFER_BANK: 'Transfer bank',
    TRANSFER_BCA: 'Transfer BCA',
    TRANSFER_MANDIRI: 'Transfer Mandiri',
    TRANSFER_BRI: 'Transfer BRI',
  };
  return labels[method] || method;
}

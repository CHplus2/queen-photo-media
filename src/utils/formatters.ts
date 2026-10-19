import { orderItemName } from '../i18n/catalogText';
import { getLocale, tr } from '../i18n/runtime';
import { paidAmount, remainingAmount } from './payments';
import { businessDate, reportableOrders, salesSummary } from './sales';
import { Order, PaymentMethod } from '../types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat(getLocale(), {
    style: 'currency',
    currency: 'IDR',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactRupiah(amount: number): string {
  if (amount >= 1_000_000_000) {
    return tr(`Rp ${(amount / 1_000_000_000).toFixed(1)} M`);
  }
  if (amount >= 1_000_000) {
    return tr(`Rp ${(amount / 1_000_000).toFixed(1)} Jt`);
  }
  if (amount >= 1_000) {
    return tr(`Rp ${(amount / 1_000).toFixed(0)} Rb`);
  }
  return tr(`Rp ${amount}`);
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat(getLocale(), {
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

  let text = tr(`📸 *LAPORAN PENJUALAN QUEEN PHOTO PONTIANAK*\n`);
  text += tr(
    `📅 Tanggal: ${new Date().toLocaleDateString(getLocale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}\n\n`,
  );
  text += tr(`📊 *RINGKASAN HARI INI:*\n`);
  text += tr(
    `• Total Transaksi: ${todayOrders.length} pesanan (${walkinCount} Toko / ${onlineCount} Online)\n`,
  );
  text += tr(`• Total Omset: *${formatRupiah(totalOmset)}*\n`);
  text += tr(`• Estimasi HPP Kertas/Bahan: ${formatRupiah(totalHPP)}\n`);
  text += tr(
    `• Estimasi Laba Kotor: *${formatRupiah(totalProfit)}* (${totalOmset > 0 ? Math.round((totalProfit / totalOmset) * 100) : 0}%)\n\n`,
  );

  text += tr(`📈 *PROGRESS OMSET BULAN INI:*\n`);
  text += tr(
    `• Akumulasi Omset: ${formatRupiah(monthlyOmset)} / Target ${formatRupiah(targetMonthly)} (${targetPct}%)\n`,
  );
  text += tr(`• Akumulasi Laba: ${formatRupiah(monthlyProfit)}\n\n`);

  text += tr(`📝 *DETAIL TRANSAKSI TERAKHIR:*\n`);
  todayOrders.slice(0, 5).forEach((order, index) => {
    const itemNames = order.items
      .map((i) => `${i.quantity}x ${orderItemName(i)}`)
      .join(', ');
    text += `${index + 1}. [${order.channel}] ${order.customerName} - ${itemNames} = ${formatRupiah(order.totalAmount)} (${order.paymentMethod})\n`;
  });

  text += tr(
    `\n_Dicatat otomatis via Sistem Digital Queen Photo Pontianak_ ✨`,
  );
  return text;
}

export function createWhatsAppOrderLink(order: Order): string {
  const phone = order.customerPhone.replace(/[^0-9]/g, '');
  const cleanPhone = phone.startsWith('0') ? `62${phone.slice(1)}` : phone;

  let msg = tr(
    `Halo ${order.customerName}, terima kasih telah memesan di *Queen Photo Pontianak*! 📸\n\n`,
  );
  msg += tr(`Nomor Pesanan: *#${order.id}*\n`);
  msg += tr(`Status: *${tr(order.orderStatus)}*\n`);
  msg += tr(
    `Metode Pembayaran: *${formatPaymentMethod(order.paymentMethod)}* (${tr(order.paymentStatus)})\n`,
  );
  msg += tr(
    `Sudah dibayar: *${formatRupiah(paidAmount(order))}* · Sisa bayar: *${formatRupiah(remainingAmount(order))}*\n`,
  );
  msg += tr(
    `Metode Pengiriman: *${order.deliveryMethod === 'GRAB_EXPRESS_PONTIANAK' ? tr('GrabExpress Pontianak') : order.deliveryMethod === 'AMBIL_STUDIO' ? tr('Ambil di Studio (Gajah Mada)') : tr('Ekspedisi Kalbar')}*\n\n`,
  );
  msg += tr(`*Rincian Pesanan:*\n`);
  order.items.forEach((item) => {
    msg += `• ${item.quantity}x ${orderItemName(item)} (${item.size}${item.finish ? `, ${item.finish}` : ''}) = ${formatRupiah(item.unitPrice * item.quantity)}\n`;
  });
  if (order.deliveryFee > 0) {
    msg += tr(`• Ongkir: ${formatRupiah(order.deliveryFee)}\n`);
  }
  msg += tr(`\n*Total Tagihan: ${formatRupiah(order.totalAmount)}*\n\n`);
  msg += tr(
    `Lokasi Studio: Jl. Gajah Mada No. 128, Pontianak (Buka 09.00 - 20.30 WIB)\n`,
  );
  msg += tr(`Untuk konfirmasi atau pertanyaan, balas pesan ini ya Kak!`);

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
          `${item.quantity}x ${orderItemName(item)} (${item.size})${item.photoFileName ? ` — file: ${item.photoFileName}` : ''}`,
      )
      .join('\n') +
    `\nTotal: ${formatRupiah(order.totalAmount)}. Status pembayaran: ${tr(order.paymentStatus)}. Saya akan mengirim foto asli di chat ini.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function formatPaymentMethod(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    TUNAI_KASIR: tr('Tunai di kasir'),
    QRIS: 'QRIS',
    TRANSFER_BANK: tr('Transfer bank'),
    TRANSFER_BCA: 'Transfer BCA',
    TRANSFER_MANDIRI: 'Transfer Mandiri',
    TRANSFER_BRI: 'Transfer BRI',
  };
  return labels[method] || method;
}

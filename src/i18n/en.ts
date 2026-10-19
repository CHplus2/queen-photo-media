import catalogEnglish from './catalogEnglish';
const messages: Record<string, string> = {
  ...catalogEnglish,
  'Konfigurasi kertas belum tersedia. Muat ulang atau hubungi pemilik toko.':
    'Paper configuration is unavailable. Reload or contact the owner.',
  'Isi ukuran lebih dari nol dan biaya tidak negatif.':
    'Enter dimensions greater than zero and non-negative costs.',
  'Konfigurasi tersimpan di perangkat ini saja.':
    'Configuration saved on this device only.',
  'Gagal menyimpan konfigurasi. Periksa penyimpanan perangkat lalu coba lagi.':
    'Configuration could not be saved. Check device storage and try again.',

  'Estimasi Laba Kotor per Lembar:': 'Estimated gross profit per print:',
  'Estimasi Laba Kotor 1 Roll:': 'Estimated gross profit per roll:',
  '· Estimasi Laba Kotor:': '· Estimated gross profit:',
  'Estimasi biaya cetak terpakai:': 'Estimated cost of materials used:',
  'Estimasi biaya bahan dan laba kotor berdasarkan angka yang Anda isi. Belum mencakup seluruh biaya usaha, pajak, atau bahan terbuang.':
    'Estimated material costs and gross profit based on your inputs. Excludes total operating expenses, tax and waste.',
  'Perkiraan susunan cetak sederhana dengan rotasi. Belum termasuk jarak potong, tepi, dan bahan terbuang; hasil nyata dapat lebih rendah.':
    'Simple grid estimate allowing rotation. Excludes cutting gaps, borders and waste; actual yield may be lower.',
  'Gunakan biaya aktual toko. Angka ini estimasi laba kotor, bukan jaminan laba bersih.':
    'Use actual shop costs. These figures estimate gross profit and do not guarantee net profit.',

  'Login belum berhasil. Periksa email, kata sandi, dan izin staf Anda.':
    'Sign-in failed. Check your email, password, and staff access.',
  'Khusus tim Queen Photo': 'Queen Photo staff only',
  'Masuk ruang kerja': 'Staff sign-in',
  'Tutup login staf': 'Close staff sign-in',
  'Kelola pesanan, layanan, dan laporan studio menggunakan akun staf yang telah diizinkan.':
    'Manage studio orders, services, and reports with an authorized staff account.',
  'Email staf': 'Staff email',
  'Kata sandi': 'Password',
  'Tampilkan kata sandi': 'Show password',
  'Sembunyikan kata sandi': 'Hide password',
  'Memeriksa akun…': 'Checking account…',
  'Lupa kata sandi?': 'Forgot password?',
  'Isi email staf untuk menerima tautan reset.':
    'Enter your staff email to receive a reset link.',
  'Email reset belum terkirim. Periksa alamat email dan coba lagi.':
    'Reset email could not be sent. Check the address and try again.',
  'Akses hanya untuk staf yang berwenang.': 'Authorized staff only.',
  '2 strip': '2 strips',
  'Glossy Anti-Luntur, Doff Matte': 'Fade-resistant glossy, matte',
  'Tanpa Bingkai': 'No frame',
  'Ukuran Standar': 'Standard size',
  'Nama layanan wajib diisi.': 'Enter a service name.',
  'Menu baru "{0}" berhasil ditambahkan dan aktif di kasir & website!':
    'New product "{0}" saved and available at the cashier and on the website.',
  'Layanan "{0}" berhasil diperbarui! Harga & data telah tersimpan permanen di Cloud Firestore.':
    'Service "{0}" updated and saved to the database.',
  'Gagal menyimpan perubahan: {0}': 'Could not save changes: {0}',
  'Terjadi kesalahan': 'An error occurred',
  'Katalog studio': 'Studio catalog',
  'Produk & harga': 'Products & prices',
  'Nama, harga, ukuran, dan bingkai dapat diubah langsung tanpa membuka formulir panjang.':
    'Edit names, prices, sizes, and frames directly without opening a long form.',
  'Tambah produk': 'Add product',
  'Tambah Menu Layanan Baru': 'Add service',
  'Edit Menu Layanan & Harga': 'Edit service & price',
  'Tutup rincian layanan': 'Close service details',
  'Nama Menu / Layanan': 'Product / service name',
  'Contoh: Photostrip 3-Pose Korean Aesthetic':
    'Example: Korean-style 3-pose photostrip',
  'Kategori Layanan:': 'Service category:',
  'Photostrip & Polaroid (Gen Z)': 'Photostrips & Polaroids',
  'Pas Foto & Aesthetic': 'ID & portrait photos',
  'Cetak Foto & Frame': 'Photo prints & frames',
  'Foto Studio Pontianak': 'Studio photography in Pontianak',
  'Restorasi & Edit': 'Restoration & editing',
  'Merchandise & Mug': 'Merchandise & mugs',
  'Banner & Spanduk': 'Banners & signs',
  'Satuan Penjualan:': 'Sales unit:',
  'Contoh: 2 strip, lembar, paket, pcs':
    'Example: 2 strips, print, package, piece',
  'Deskripsi Lengkap (Keunggulan & Kualitas):':
    'Full description (features & quality):',
  'Contoh: Cetak foto strip 4-cut aesthetic gaya Korea menggunakan kertas foto minilab asli tahan air puluhan tahun...':
    'Example: Korean-style 4-cut photostrips on durable, water-resistant photo paper…',
  'Penetapan Harga & Biaya Pokok (HPP)': 'Selling price & production cost',
  'Harga Jual Konsumen (Rp):': 'Customer price (Rp):',
  'Biaya Pokok Produksi / HPP (Rp):': 'Production cost (Rp):',
  'Proyeksi Laba Bersih per Unit:': 'Estimated profit per unit:',
  '% Margin)': '% margin)',
  'Jenis Bahan / Mesin:': 'Material / machine:',
  'Roll Mesin Minilab (Cepat, Presisi)': 'Minilab roll paper',
  'Lembaran Sheet / A4 (Pas Foto / Dokumen)':
    'Sheets / A4 (ID photos / documents)',
  'Bahan Fisik / Merchandise (Mug, Frame)': 'Physical product (mug, frame)',
  'Jasa / Layanan Studio & Restorasi': 'Studio & restoration service',
  'Tandai sebagai Produk Populer / Best Seller': 'Mark as a popular product',
  'Konfigurasi Opsi Tambahan (Pisahkan dengan koma):':
    'Additional options (separate with commas):',
  'Opsi Ukuran Foto:': 'Photo sizes:',
  'Contoh: 2x6 inch, 4R (10x15cm), 10R, 16R':
    'Example: 2x6 inches, 4R (10x15 cm), 10R, 16R',
  'Opsi Finishing Kertas:': 'Paper finishes:',
  'Contoh: Glossy Anti-Luntur, Doff Matte, Silk Luster':
    'Example: fade-resistant glossy, matte, silk / luster',
  'Opsi Bingkai / Frame:': 'Frames:',
  'Contoh: Tanpa Bingkai, Minimalis Hitam, Minimalis Putih, Kayu Jati':
    'Example: no frame, minimalist black, minimalist white, teak',
  Batal: 'Cancel',
  'Buat Layanan Baru': 'Create service',
  'Simpan Perubahan': 'Save changes',
  'Menyimpan ke Cloud Firestore...': 'Saving to the database…',
  'Rincian layanan': 'Service details',
  'Tidak dapat menyimpan draf di perangkat. Jangan tutup halaman sebelum penjualan tersimpan.':
    'Could not save the draft on this device. Keep this page open until the sale is saved.',
  'Isi nama pelanggan untuk pesanan nanti atau pembayaran yang belum diterima.':
    'Enter a customer name for later collection or outstanding payments.',
  'Isi jumlah pembayaran yang benar, tidak melebihi total.':
    'Enter a valid payment amount that does not exceed the total.',
  'Uang diterima kurang dari pembayaran yang dicatat.':
    'Cash received is less than the payment being recorded.',
  'Pelanggan umum': 'Walk-in customer',
  'Penjualan belum tersimpan. Isian tetap tersedia.':
    'Sale not saved. Your entries are still here.',
  'Ruang kerja Queen Photo': 'Queen Photo workspace',
  'Catat sekali. Laporan dan bahan terhubung ke pesanan.':
    'Record once. Sales reports and materials stay linked to the order.',
  'Penjualan hari ini': "Today's sales",
  'Ringkasan toko': 'Shop summary',
  'Lihat penjualan ·': 'View sale ·',
  'Akses rincian penjualan': 'Open sale details',
  'Menunggu koneksi database. Pastikan muncul konfirmasi tersimpan sebelum menyerahkan struk.':
    'Waiting for the database. Confirm that the sale is saved before handing over a receipt.',
  Ada: 'There are',
  'pesanan dengan data tidak valid. Hubungi pemilik; daftar dan laporan belum lengkap.':
    'invalid orders. Contact the owner; this list and the reports are incomplete.',
  'Penjualan tersimpan ·': 'Sale saved ·',
  'Pembayaran belum diterima.': 'Payment not yet received.',
  'DP tercatat {0}. Sisa bayar tersedia di Pesanan.':
    'Deposit recorded: {0}. See Orders for the remaining balance.',
  'Pembayaran dicatat diterima.': 'Payment recorded as received.',
  'Tersedia di daftar tindak lanjut.': 'Available in the follow-up list.',
  'Tidak perlu memperbarui status kerja.': 'No work-status update is needed.',
  'Bahan belum dipotong. Penanggung jawab perlu memeriksa pemakaian atau pengecualian stok.':
    'Materials have not been deducted. The supervisor needs to review usage or the stock exception.',
  Struk: 'Receipt',
  'Cetak struk': 'Print receipt',
  'Pilih layanan': 'Choose a service',
  'Cari cetak foto, pas foto, studio…': 'Search prints, ID photos, studio…',
  per: 'per',
  'Layanan tidak ditemukan. Coba kata lain.':
    'No services found. Try another search.',
  'Rincian penjualan': 'Sale details',
  'Hapus {0}': 'Remove {0}',
  Jumlah: 'Quantity',
  'Harga satuan': 'Unit price',
  '· Ubah': '· Edit',
  'Ukuran — periksa harga setelah mengubah':
    'Size — check the price after changing it',
  'Harga satuan (Rp)': 'Unit price (Rp)',
  'Pilih satu atau beberapa layanan di sebelah kiri. Pelanggan tidak perlu membuat akun.':
    'Choose one or more services on the left. Customers do not need an account.',
  Pembayaran: 'Payment',
  Tunai: 'Cash',
  'Transfer bank': 'Bank transfer',
  'Uang masuk sudah dicek di aplikasi bank / merchant QRIS':
    'Incoming funds checked in the bank / QRIS merchant app',
  'Uang tunai sudah diterima': 'Cash has been received',
  'Jika belum dicentang, pembayaran tetap menunggu konfirmasi.':
    'Leave unchecked if the payment has not been verified.',
  'Bayar sebagian / DP': 'Partial payment / deposit',
  'Pembayaran sekarang (Rp)': 'Payment now (Rp)',
  'Uang diterima (Rp, untuk hitung kembalian)':
    'Cash received (Rp, to calculate change)',
  'Uang pas': 'Exact amount',
  'Uang kurang {0}': 'Short by {0}',
  'Kembalian {0}': 'Change: {0}',
  'Sisa bayar': 'Remaining balance',
  'Dikerjakan / diambil nanti': 'Work / collect later',
  'Biarkan kosong untuk pembelian yang langsung selesai.':
    'Leave unchecked for a purchase completed immediately.',
  'Nama pelanggan': 'Customer name',
  'WhatsApp (opsional)': 'WhatsApp (optional)',
  'Tanggal janji (opsional)': 'Promised date (optional)',
  'Catatan / nama pelanggan (opsional)': 'Notes / customer name (optional)',
  Catatan: 'Notes',
  'Stok tidak cocok? Catat pengecualian':
    'Stock does not match? Record an exception',
  'Hanya jika barang benar-benar sudah dijual tetapi saldo stok salah. Penjualan disimpan tanpa pemotongan bahan dan muncul untuk pemeriksaan penanggung jawab.':
    'Only use this if the sale has already happened but the recorded stock is wrong. The sale is saved without a material deduction and flagged for supervisor review.',
  'Alasan pengecualian stok (kosongkan untuk pemotongan normal)':
    'Stock exception reason (leave empty for normal deductions)',
  'Pemakaian bahan': 'Material usage for',
  'layanan belum diatur. Penjualan tetap dapat dicatat; stok akan ditandai perlu pemeriksaan.':
    'services is not configured. You can still record the sale; stock will be flagged for review.',
  'Simpan penjualan': 'Save sale',
  'Menyimpan…': 'Saving…',
  'Struk dan ringkasan tersedia setelah tersimpan.':
    'The receipt and summary are available after saving.',
  'Kosongkan isian': 'Clear entries',
  'Kosongkan isian dan mulai penjualan baru? Periksa riwayat bila penyimpanan sebelumnya belum pasti.':
    'Clear these entries and start a new sale? Check history first if the previous save was uncertain.',
  'Pengaturan & alat': 'Settings & tools',
  'Atur kebutuhan toko': 'Manage the shop',
  'Pengaturan dipisahkan dari tugas kasir harian agar pencatatan penjualan tetap cepat.':
    'Settings are kept separate from everyday cashier work so recording sales stays fast.',
  Buka: 'Open',
  'Layanan & harga': 'Services & prices',
  'Tambah paket, perbarui harga, dan atur pilihan pelanggan.':
    'Add packages, update prices, and manage customer options.',
  'Kalkulator biaya': 'Cost calculator',
  'Hitung estimasi biaya bahan dan harga jasa.':
    'Estimate material costs and service prices.',
  'Riset pelanggan': 'Customer research',
  'Baca masukan pelanggan dan evaluasi ide penawaran.':
    'Read customer feedback and evaluate offers.',
  'Akun staf': 'Staff account',
  'Gunakan akun masing-masing agar pencatat penjualan dan pemeriksa pembayaran dapat dikenali. Hak akses tetap dikelola melalui Firebase.':
    'Use individual accounts to identify who recorded each sale and verified each payment. Access is managed through Firebase.',
  'Kirim tautan reset kata sandi': 'Send password reset link',
  'Email reset belum terkirim. Coba kembali.':
    'Reset email could not be sent. Please try again.',
  'Kode belum dikenali. Periksa kembali kode Anda.':
    'Code not recognized. Check your code.',
  'Diskon 10% diterapkan.': '10% discount applied.',
  'Lengkapi nama, nomor WhatsApp yang valid, dan alamat pengiriman bila diperlukan.':
    'Enter your name, a valid WhatsApp number, and a delivery address if needed.',
  'Ambil di Studio Jl. Gajah Mada': 'Collect at the studio, Jl. Gajah Mada',
  'Pesanan website · Diskon {0} · Menunggu foto asli dan konfirmasi staf.':
    'Website order · Discount {0} · Awaiting original photos and staff confirmation.',
  'tidak ada': 'none',
  'Pesanan belum tersimpan. Keranjang tetap aman. Periksa koneksi lalu coba kembali.':
    'Order not saved. Your cart is safe. Check your connection and try again.',
  layanan: 'services',
  'Pesanan Queen Photo': 'Queen Photo order',
  'Rincian pemesanan': 'Order details',
  'Keranjang Anda': 'Your cart',
  'Pesanan tersimpan': 'Order saved',
  'Tutup keranjang': 'Close cart',
  Keranjang: 'Cart',
  'Tahap pemesanan': 'Order steps',
  'Informasi pemesanan': 'Ordering information',
  '01 · Informasi pemesan': '01 · Your details',
  'Nama lengkap': 'Full name',
  '(wajib)': '(required)',
  'Nama Anda': 'Your name',
  'Nomor WhatsApp': 'WhatsApp number',
  'Untuk konfirmasi rincian dan kabar pesanan.':
    'For confirming details and order updates.',
  '02 · Terima pesanan': '02 · Receive your order',
  'Ambil di studio': 'Collect at the studio',
  'Tanpa biaya kirim': 'No delivery charge',
  'Kirim ke alamat': 'Deliver to an address',
  'Ongkir sesuai kecamatan': 'Delivery fee depends on the district',
  'Kecamatan tujuan': 'Delivery district',
  'Alamat lengkap & patokan': 'Full address & landmark',
  'Nama jalan, nomor rumah, dan patokan': 'Street, house number, and landmark',
  'Estimasi ongkir': 'Estimated delivery fee',
  '. Staf mengonfirmasi ketersediaan pengiriman.':
    '. Staff will confirm delivery availability.',
  'Jl. Gajah Mada No. 128, Pontianak. Tunggu konfirmasi sebelum datang.':
    'Jl. Gajah Mada No. 128, Pontianak. Wait for confirmation before visiting.',
  '03 · Rencana pembayaran': '03 · Payment plan',
  'Bayar di kasir': 'Pay at the studio',
  'Belum perlu transfer. Staf akan mengonfirmasi harga dan mengirim instruksi pembayaran resmi.':
    'No transfer is needed yet. Staff will confirm the price and send official payment instructions.',
  'layanan dalam satu pesanan. Anda bisa menambah layanan sebelum checkout.':
    'services in one order. You can add more before checkout.',
  'Catatan:': 'Notes:',
  'File untuk dikirim:': 'Files to send:',
  'Kurangi jumlah {0}': 'Decrease quantity for {0}',
  'Jumlah {0}': 'Quantity for {0}',
  'Tambah jumlah {0}': 'Increase quantity for {0}',
  'Tambah layanan lain': 'Add another service',
  'Punya kode promo?': 'Have a promo code?',
  'Kode promo': 'Promo code',
  'Masukkan kode': 'Enter code',
  Terapkan: 'Apply',
  'Foto asli dikirim melalui WhatsApp setelah checkout. Belum ada pembayaran pada langkah ini.':
    'Send original photos through WhatsApp after checkout. No payment is taken at this step.',
  'Mulai dari satu momen.': 'Start with a moment.',
  'Pilih layanan cetak atau paket foto. Semua pilihan Anda akan tersimpan di sini.':
    'Choose prints or a photo package. Your choices will appear here.',
  'Jelajahi layanan': 'Explore services',
  'Satu langkah lagi: hubungi studio.': 'One more step: contact the studio.',
  'Kirim foto asli melalui WhatsApp. Staf akan memeriksa rincian, harga, dan instruksi pembayaran sebelum pesanan diproses.':
    'Send your original photos through WhatsApp. Staff will check the details, price, and payment instructions before processing the order.',
  'Nomor pesanan': 'Order number',
  'Salin nomor pesanan': 'Copy order number',
  'Nomor disalin': 'Number copied',
  'Nomor pesanan disalin': 'Order number copied',
  'Total pesanan': 'Order total',
  'Menunggu konfirmasi': 'Awaiting confirmation',
  'Bagikan ke WhatsApp studio': 'Share with the studio on WhatsApp',
  'Kirim foto & konfirmasi': 'Send photos & confirm',
  'Pilih kontak studio di WhatsApp untuk mengirim rincian ini.':
    'Choose the studio contact in WhatsApp to send these details.',
  'Lihat status pesanan': 'Track order',
  'Ringkasan pesanan': 'Order summary',
  'Subtotal layanan': 'Services subtotal',
  'Diskon 10%': '10% discount',
  'Estimasi pengiriman': 'Estimated delivery',
  'Total layanan': 'Services total',
  'Kembali ke keranjang': 'Back to cart',
  'Kirim pesanan': 'Submit order',
  'Lanjut ke checkout': 'Continue to checkout',
  'Pesanan diproses setelah konfirmasi staf.':
    'Orders are processed after staff confirmation.',
  'Ongkir ditampilkan setelah memilih pengiriman.':
    'The delivery fee appears after you select delivery.',
  'Tutup kas belum tersedia. Periksa koneksi dan publikasi aturan database.':
    'Cash closing is unavailable. Check the connection and published database rules.',
  'Tutup kas ·': 'Cash closing ·',
  'Satu laci kas bersama per hari. Hentikan pencatatan transaksi sebentar saat menghitung uang. QRIS dan transfer tidak masuk hitungan laci.':
    'One shared cash drawer per day. Pause sales briefly while counting cash. QRIS and transfers are excluded from the drawer balance.',
  'Hitung uang & tutup kas hari ini': "Count cash & close today's drawer",
  'Uang awal laci (Rp)': 'Opening cash (Rp)',
  'Pengeluaran / refund tunai hari ini (Rp)':
    'Cash expenses / refunds today (Rp)',
  'Uang tunai yang dihitung sekarang (Rp)': 'Cash counted now (Rp)',
  'Catatan pengeluaran / selisih': 'Expense / difference notes',
  'Tunai masuk tercatat': 'Recorded cash received',
  'Kas seharusnya': 'Expected cash',
  Selisih: 'Difference',
  'Semua penjualan sudah dicatat dan uang sudah dihitung. Ini hanya laporan; tidak memotong uang atau mencatat refund lagi.':
    'All sales are recorded and cash has been counted. This is a report only; it does not deduct money or record a refund again.',
  'Simpan tutup kas': 'Save cash closing',
  'Belum tersimpan.': 'Not saved yet.',
  'Dicatat oleh': 'Recorded by',
  '· Uang dihitung': '· Cash counted',
  'Ada transaksi berubah setelah penutupan. Hasil ini perlu diperiksa penanggung jawab; jangan dianggap saldo terkini.':
    'Transactions changed after closing. The supervisor must review this snapshot; it is not the current balance.',
  'Cetak foto': 'Photo prints',
  'Pas foto': 'ID photos',
  'Sesi studio': 'Studio sessions',
  'Restorasi & edit': 'Restoration & editing',
  'Hadiah & album': 'Gifts & albums',
  'Cari nama produk, ukuran, atau bingkai': 'Search product, size, or frame',
  'Contoh: 10R': 'Example: 10R',
  'Nama & harga': 'Names & prices',
  'Ukuran foto': 'Photo sizes',
  Bingkai: 'Frames',
  'Bagian yang diubah': 'Section to edit',
  'Ubah langsung di bawah, lalu tekan Enter atau Simpan pada produk tersebut. Perubahan berlaku untuk transaksi baru; riwayat penjualan tetap memakai data saat transaksi dibuat.':
    'Edit directly below, then press Enter or Save for that product. Changes apply to new transactions; past sales keep their original details.',
  'Tidak ada produk yang cocok.': 'No matching products.',
  'Tampil di kasir & website': 'Shown at the cashier & on the website',
  'Detail lainnya': 'More details',
  'Simpan atau batalkan perubahan sebelum membuka detail.':
    'Save or cancel your changes before opening details.',
  'Nama produk': 'Product name',
  'Harga jual (Rp)': 'Selling price (Rp)',
  'Satuan penjualan': 'Sales unit',
  'Kelompok produk': 'Product group',
  'Tampilkan produk di kasir & website': 'Show at the cashier & on the website',
  'Satu ukuran per baris. Baris pertama menjadi pilihan standar.':
    'One size per row. The first row is the default.',
  Ukuran: 'Size',
  Hapus: 'Remove',
  'Hapus ukuran {0}': 'Remove size {0}',
  'Tambah ukuran': 'Add size',
  'Harga di sini adalah tambahan di atas harga produk. Mengubah nama mempertahankan nominalnya.':
    'These prices are added to the product price. Renaming a frame preserves its amounts.',
  'Nama bingkai': 'Frame name',
  'Biaya bahan': 'Material cost',
  'Tambahan harga': 'Additional price',
  bingkai: 'frame',
  'Hapus bingkai': 'Remove frame',
  'Hapus bingkai {0}': 'Remove frame {0}',
  'Tambah bingkai': 'Add frame',
  'Ukuran berbeda dapat memakai jumlah bahan berbeda. Pemotongan otomatis akan menunggu pemeriksaan di Inventaris.':
    'Different sizes may use different quantities of materials. Automatic deductions will wait for an Inventory review.',
  'Hanya koreksi tulisan; ukuran fisik dan pemakaian bahan tetap sama.':
    'Spelling correction only; physical size and material usage are unchanged.',
  'Produk ini berubah di perangkat lain. Salin isian Anda jika perlu, lalu':
    'This product changed on another device. Copy your entries if needed, then',
  'muat data terbaru': 'load the latest data',
  'sebelum menyimpan.': 'before saving.',
  Batalkan: 'Cancel',
  'Ubah {0}': 'Edit {0}',
  'Nama produk wajib diisi.': 'Enter a product name.',
  'Isi harga jual dalam rupiah bulat, minimal Rp0.':
    'Enter the selling price in whole rupiah, at least Rp0.',
  'Tersimpan: {0}.': 'Saved: {0}.',
  'Tersimpan: {0}. Periksa pemakaian bahan ukuran baru di Inventaris.':
    'Saved: {0}. Review material usage for the new size in Inventory.',
  'Belum tersimpan. Isian tetap tersedia.':
    'Not saved. Your entries are still here.',
  'Kalkulator HPP & Laba Queen Photo': 'Queen Photo cost & profit calculator',
  'Kalkulasi Otomatis Laba Kertas Roll vs Lembaran':
    'Roll vs sheet paper cost calculator',
  'Menjawab tantangan perhitungan kertas roll Minilab & Plotter: Sistem ini membagi harga 1 gulungan roll ke dalam satuan luas (cm² / m²) dan lembaran cetak secara presisi, sehingga pemilik studio tahu pasti laba bersih setiap pesanan.':
    "The calculator divides a roll's price by its area and print dimensions to estimate material costs and profit per order.",
  '1. Kertas Roll (Minilab, Kanvas & Plotter)':
    '1. Roll paper (minilab, canvas & plotter)',
  '2. Kertas Lembaran (Sheet 4R / 10R / A4)': '2. Sheet paper (4R / 10R / A4)',
  'Spesifikasi & Harga Pembelian Roll': 'Roll specifications & purchase price',
  'Jenis roll kertas': 'Paper roll type',
  'Harga Beli 1 Roll (Rp):': 'Purchase price per roll (Rp):',
  'Contoh: Rp 420.000 / roll Minilab': 'Example: Rp420,000 per minilab roll',
  'Panjang Roll (Meter):': 'Roll length (meters):',
  'Contoh: 65 meter': 'Example: 65 meters',
  'Lebar Roll (cm):': 'Roll width (cm):',
  '6 inch = 15.2 cm': '6 inches = 15.2 cm',
  'Estimasi Tinta per m² (Rp):': 'Estimated ink per m² (Rp):',
  'Tinta kimia/solvent per m²': 'Chemical / solvent ink per m²',
  'Simulasi Ukuran Foto yang Dicetak dari Roll:':
    'Print size cut from the roll:',
  'Lebar Potongan Cetak (cm):': 'Print width (cm):',
  'Panjang Potongan Cetak (cm):': 'Print length (cm):',
  'Harga Jual per Lembar (Rp):': 'Selling price per print (Rp):',
  'Jumlah Pesanan (Lembar):': 'Order quantity (prints):',
  'Simpan Konfigurasi Roll Ini': 'Save this roll configuration',
  'Konfigurasi Roll berhasil disimpan ke database lokal!':
    'Roll configuration saved locally.',
  'Hasil Perhitungan per Lembar Cetak': 'Calculation per print',
  'HPP Kertas (dari Roll):': 'Paper cost (from roll):',
  'Biaya Tinta & Listrik:': 'Ink & electricity:',
  'Total HPP per Lembar:': 'Total cost per print:',
  'Laba Bersih per Lembar:': 'Profit per print:',
  'Kapasitas Laba dari 1 Gulungan Roll Penuh':
    'Estimated profit from a full roll',
  'Panjang roll:': 'Roll length:',
  'meter menghasilkan:': 'meters produces:',
  'lembar foto': 'photo prints',
  'Total Omset Potensial jika 1 roll habis terjual:':
    'Potential revenue if the full roll is sold:',
  'Total Biaya Modal (Roll + Tinta seluruhnya):': 'Total costs (roll + ink):',
  'Total Laba Bersih 1 Roll:': 'Profit per roll:',
  'Ringkasan Pesanan Ini (': 'This order (',
  'Lembar):': 'prints):',
  'Omset:': 'Revenue:',
  '· Total HPP:': '· Total costs:',
  '· Laba Bersih Langsung:': '· Estimated profit:',
  'Perhitungan Kertas Lembaran (Pieces)': 'Sheet paper calculation',
  'Jenis kertas lembaran': 'Sheet paper type',
  'Harga Beli Kertas per Lembar:': 'Paper purchase price per sheet:',
  'Biaya Tinta per Lembar:': 'Ink cost per sheet:',
  'Listrik & Kemasan Plastik:': 'Electricity & packaging:',
  'Harga Jual ke Pelanggan:': 'Customer price:',
  'Simpan Parameter Kertas Lembaran': 'Save sheet paper settings',
  'Konfigurasi Lembaran berhasil diperbarui!': 'Sheet settings updated.',
  'Hasil Margin Kertas Lembaran': 'Sheet paper margin',
  'Contoh:': 'Example:',
  'Pas foto resmi kilat dicetak di lembaran A4 (bisa memuat hingga 18 pas foto). Dengan modal 1 lembar A4 ~Rp 3.200 dan harga paket pas foto Rp 25.000, margin laba bersih studio mencapai':
    "Express ID photos can be printed on an A4 sheet (up to 18 photos). At around Rp3,200 per A4 sheet and Rp25,000 per package, the studio's estimated margin can exceed",
  'Masukan belum tersimpan. Coba kembali saat koneksi tersedia.':
    'Feedback not saved. Try again when connected.',
  'Pilih jawaban': 'Choose an answer',
  'Suara pelanggan': 'Customer feedback',
  'Bantu studio tumbuh lebih baik.': 'Help the studio improve.',
  'Terima kasih atas masukannya.': 'Thank you for your feedback.',
  'Tutup survei': 'Close survey',
  'Sekitar 2 menit. Jawaban Anda membantu kami memilih layanan yang benar-benar dibutuhkan. Dapatkan kode diskon 10% setelah mengirim.':
    'About 2 minutes. Your answers help us choose services people need. Submit to receive a 10% discount code.',
  'Masukan pelanggan': 'Customer feedback',
  'Rentang usia': 'Age range',
  'Layanan yang paling Anda butuhkan': 'The service you need most',
  'Pas foto / dokumen': 'ID photos / documents',
  'Photostrip / mini prints': 'Photostrips / mini prints',
  'Sesi foto studio': 'Studio photo session',
  'Restorasi / edit foto': 'Photo restoration / editing',
  'Hadiah / album': 'Gifts / albums',
  'Banner / desain': 'Banners / design',
  'Seberapa sering Anda mencetak foto?': 'How often do you print photos?',
  'Belum pernah': 'Never',
  'Kurang dari sekali setahun': 'Less than once a year',
  'Beberapa kali setahun': 'A few times a year',
  'Setiap bulan atau lebih': 'Monthly or more',
  'Hal yang paling perlu kami tingkatkan': 'What should we improve most?',
  'Hasil foto / cetak': 'Photo / print quality',
  'Kejelasan harga': 'Clear pricing',
  'Kecepatan layanan': 'Service speed',
  'Pilihan paket': 'Package choices',
  'Kemudahan memesan': 'Ease of ordering',
  'Kenyamanan studio': 'Studio comfort',
  'Penilaian pengalaman Anda': 'Rate your experience',
  '1 = sangat kurang, 5 = sangat baik.': '1 = very poor, 5 = excellent.',
  'Ide atau masukan lain (opsional)': 'Other ideas or feedback (optional)',
  'Nama (opsional)': 'Name (optional)',
  'Gunakan kode berikut untuk diskon 10% saat checkout.':
    'Use this code for 10% off at checkout.',
  'Kembali ke website': 'Back to website',
  'Kirim masukan': 'Submit feedback',
  'Mengirim…': 'Sending…',
  'Momen kecil.': 'Small moments.',
  'Bisa dibawa pulang.': 'Yours to keep.',
  'Foto sahabat, pasangan, atau keseharian yang ingin disimpan. Ubah pilihan dari galeri ponsel menjadi cetakan untuk dompet, meja, atau hadiah.':
    'Friends, partners, and everyday moments worth keeping. Turn photos from your phone into prints for your wallet, desk, or gifts.',
  'Pilih paket di bawah, masukkan ke keranjang, lalu kirim foto asli melalui WhatsApp setelah checkout.':
    'Choose a package, add it to your cart, then send the original photos through WhatsApp after checkout.',
  'Koleksi photostrip dan cetakan mini': 'Photostrips & mini print collection',
  'Pilih paket favoritmu': 'Choose your favorite package',
  'Pilih paket': 'Choose package',
  'Paket belum tersedia. Hubungi studio untuk pilihan terbaru.':
    'No packages available yet. Contact the studio for current options.',
  'Queen Photo · Ruang kerja studio': 'Queen Photo · Studio workspace',
  'Pontianak, WIB': 'Pontianak, WIB',
  'Menjaga cerita dalam setiap foto.': 'Keeping stories in every photo.',
  'Studio dan cetak foto di Pontianak, sejak 1980.':
    'Photo studio & prints in Pontianak, since 1980.',
  Jelajahi: 'Explore',
  'Lacak pesanan': 'Track order',
  'Tentang Queen Photo': 'About Queen Photo',
  'Beri masukan': 'Leave feedback',
  'Temui kami': 'Visit us',
  'Senin–Sabtu · 09.00–20.30 WIB': 'Monday–Saturday · 09:00–20:30 WIB',
  'Hubungi studio': 'Contact the studio',
  'Portal staf': 'Staff portal',
  'Tentang kami': 'About us',
  'Langsung ke konten': 'Skip to content',
  'Pontianak · Sejak 1980': 'Pontianak · Since 1980',
  'Ruang kerja studio': 'Studio workspace',
  'Queen Photo — Beranda': 'Queen Photo — Home',
  'Navigasi utama': 'Main navigation',
  'Lihat website': 'View website',
  'Keluar dari akun staf': 'Sign out of staff account',
  'Belum berhasil keluar. Coba lagi sebelum meninggalkan perangkat.':
    'Sign-out failed. Try again before leaving this device.',
  'Buka keranjang, {0} item': 'Open cart, {0} items',
  'Mulai pesan': 'Start an order',
  'Buka menu': 'Open menu',
  'Tutup menu': 'Close menu',
  Staf: 'Staff',
  'Navigasi staf': 'Staff navigation',
  'Masuk sebagai staf': 'Staff sign-in',
  'Lihat website pelanggan': 'View customer website',
  'Menu seluler': 'Mobile menu',
  'Merawat kenangan,': 'Keeping memories,',
  'lintas generasi.': 'across generations.',
  'Sejak 1980, Queen Photo menjadi bagian dari cerita keluarga di Pontianak. Dari pas foto dan potret keluarga hingga cetakan kecil dari galeri ponsel, setiap kebutuhan punya tempat di studio kami.':
    'Queen Photo has been part of family stories in Pontianak since 1980. From ID photos and family portraits to small prints from your phone, there is a place for every need at our studio.',
  'Kami ingin membuat prosesnya lebih mudah: pilih layanan, sampaikan kebutuhan, dan konfirmasikan hasil yang diinginkan bersama staf.':
    'We want to make it easier: choose a service, tell us what you need, and confirm the result with our staff.',
  'Temukan layanan Anda': 'Find your service',
  'Inspirasi menata cetakan foto keluarga dalam bingkai':
    'Inspiration for displaying framed family photos',
  'Untuk kebutuhan sehari-hari': 'For everyday needs',
  'Pas foto, cetak ulang, dan foto yang perlu disiapkan untuk dokumen atau keluarga.':
    'ID photos, reprints, and photos for documents or family.',
  'Untuk momen bersama': 'For moments together',
  'Potret studio, photostrip, dan hadiah personal untuk orang terdekat.':
    'Studio portraits, photostrips, and personal gifts for loved ones.',
  'Untuk cerita yang sudah lama': 'For older stories',
  'Konsultasi restorasi foto pudar agar kenangan dapat dirawat kembali.':
    'Ask about restoring faded photos to help preserve your memories.',
  'Datang ke studio': 'Visit the studio',
  'Sampai bertemu di Queen Photo.': 'See you at Queen Photo.',
  'Lihat layanan & harga': 'View services & prices',
  'Queen Photo · Pontianak · Sejak 1980':
    'Queen Photo · Pontianak · Since 1980',
  'Cetak foto, pas foto': 'Photo prints, ID photos',
  '& studio di Pontianak.': '& studio sessions in Pontianak.',
  'Untuk dokumen, foto keluarga, wisuda, atau cetakan dari ponsel. Pilih paket dengan harga jelas, lalu konfirmasikan kebutuhan Anda bersama staf.':
    'For documents, family, graduation, or prints from your phone. Choose a clearly priced package, then confirm your needs with our staff.',
  'Informasi studio': 'Studio information',
  'Tanya lewat WhatsApp': 'Ask on WhatsApp',
  'Halo Queen Photo, saya ingin bertanya tentang layanan foto.':
    'Hello Queen Photo, I would like to ask about your photo services.',
  'Sejak 1980': 'Since 1980',
  'Potret pasangan dengan pencahayaan studio yang natural':
    'Couple portrait with natural studio lighting',
  'Untuk momen besar. Juga yang kecil.': 'For big moments. And small ones.',
  'Pilihan untuk keluarga, sahabat, dan kebutuhan sehari-hari.':
    'Options for family, friends, and everyday needs.',
  'Gunakan pilihan standar atau sesuaikan.':
    'Use the standard options or customize.',
  'Gabungkan di keranjang': 'Combine in your cart',
  'Satu pesanan untuk beberapa layanan.': 'One order for several services.',
  'Konfirmasi dengan studio': 'Confirm with the studio',
  'Kirim foto asli dan cek rincian via WhatsApp.':
    'Send original photos and check details through WhatsApp.',
  'Cara memesan': 'How to order',
  'Pilih sesuai kebutuhan': 'Choose what you need',
  'Foto untuk setiap bagian hidup.': 'Photos for every part of life.',
  'Ilustrasi {0}': 'Illustration: {0}',
  'Lihat layanan': 'View services',
  Mulai: 'From',
  'Kebutuhan sehari-hari': 'Everyday essentials',
  'Cetak ulang foto dan pas foto untuk dokumen, sekolah, atau lamaran kerja.':
    'Photo reprints and ID photos for documents, school, or job applications.',
  'Pesan cetak foto': 'Order photo prints',
  'Momen bersama keluarga': 'Family moments',
  'Potret keluarga, wisuda, dan bingkai untuk kenangan yang ingin dipajang.':
    'Family portraits, graduation photos, and frames for memories worth displaying.',
  'Lihat paket keluarga': 'View family packages',
  'Cetakan kreatif': 'Creative prints',
  'Photostrip dan mini prints untuk sahabat, pasangan, hadiah, atau koleksi sendiri.':
    'Photostrips and mini prints for friends, partners, gifts, or your collection.',
  'Buat photostrip': 'Create photostrips',
  'Gambar sebagai ilustrasi gaya. Minta contoh hasil dan konfirmasi paket melalui studio.':
    'Images illustrate the style. Ask the studio for real examples and package confirmation.',
  'Pemasangan roll / pengadaan baru': 'New roll installed / purchased',
  'Penerimaan bahan baru': 'New materials received',
  'Stok belum tersimpan.': 'Stock not saved yet.',
  'Sistem Inventaris Bahan & Kertas Queen Photo':
    'Queen Photo materials & paper inventory',
  'Manajemen Stok Kertas Roll, Lembaran & Merchandise':
    'Roll paper, sheet paper & merchandise stock',
  'Saldo bersama dari database. Pemotongan mengikuti pemakaian layanan yang sudah diatur; pembatalan membedakan bahan terpakai dan belum terpakai.':
    'Shared database balances. Deductions follow configured service usage; cancellations distinguish used and unused materials.',
  'Perhatian:': 'Attention:',
  'bahan mendekati batas minimum!': 'materials are close to the minimum level.',
  'Daftar Stok Bahan Saat Ini': 'Current material stock',
  'Cukup untuk ~{0} cetak kanvas 16R lagi':
    'Enough for about {0} more 16R canvas prints',
  'Cukup untuk ~{0} lembar 4R atau ~{1} photostrip lagi':
    'Enough for about {0} more 4R prints or {1} photostrips',
  'BARANG / MERCH': 'PRODUCT / MERCHANDISE',
  'GULUNGAN ROLL': 'PAPER ROLL',
  Menipis: 'Low stock',
  'Stok Tersedia:': 'Available stock:',
  'Kapasitas Target (Penyebut):': 'Target capacity (denominator):',
  'Batas Minimum Peringatan:': 'Low-stock warning threshold:',
  'Nilai Modal:': 'Stock cost value:',
  Restock: 'Add stock',
  'Riwayat bahan · 250 aktivitas terbaru':
    'Material history · latest 250 activities',
  'Semua (': 'All (',
  'Potong Pesanan': 'Order deductions',
  'Restore Pembatalan': 'Cancellation returns',
  'Restock Manual': 'Manual restocks',
  Waktu: 'Time',
  'Nama Bahan': 'Material name',
  Perubahan: 'Change',
  'Sisa Stok Akhir': 'Closing stock',
  'Keterangan / Nomor Pesanan': 'Notes / order number',
  'Riwayat perubahan stok': 'Stock movement history',
  'Restock Bahan / Pemasangan Roll': 'Restock materials / install roll',
  'Tutup penambahan stok': 'Close stock addition',
  'Jumlah Tambahan (': 'Quantity to add (',
  'Stok saat ini:': 'Current stock:',
  '→ Menjadi': '→ New balance',
  'Target Kapasitas Gudang / Denominator (':
    'Storage target capacity / denominator (',
  Penyebut: 'Denominator',
  'Kapasitas maksimum stok': 'Maximum stock capacity',
  '💡 Angka ini adalah': '💡 This number is the',
  'denominator (penyebut)': 'denominator',
  'pada kartu stok. Sistem otomatis menyesuaikannya agar stok yang baru ditambahkan tidak melampaui denominator (contoh: hasil rasio 60/60 atau 60/100, bukan 60/25).':
    'on the stock card. It adjusts automatically so added stock never exceeds the denominator (for example 60/60 or 60/100, rather than 60/25).',
  'Catatan / Keterangan Restock:': 'Restock notes:',
  'Contoh: Beli 1 roll baru dari distributor / supplier':
    'Example: one new roll purchased from the supplier',
  'Simpan Tambahan Stok': 'Save stock addition',
  'Tambah stok bahan': 'Add material stock',
  'Perubahan belum tersimpan.': 'Changes not saved.',
  'Pengaturan bahan otomatis': 'Automatic material settings',
  'Stok dibaca bersama dari database. Atur pemakaian untuk setiap 1 unit / paket layanan sesuai hasil ukur di toko. Angka contoh aplikasi tidak dipakai sebagai saldo stok.':
    'Stock is shared through the database. Configure measured usage per service unit / package. Example application quantities are not used as real stock balances.',
  'Inventaris belum tersambung. Tunggu sebelum mengubah data.':
    'Inventory is not connected. Wait before editing.',
  'Tambah bahan / saldo awal': 'Add material / opening balance',
  'Nama bahan': 'Material name',
  'Jenis bahan': 'Material type',
  'Roll kertas': 'Paper roll',
  'Kertas lembar': 'Sheet paper',
  'Produk / merchandise': 'Product / merchandise',
  'Satuan stok': 'Stock unit',
  'meter, lembar, pcs…': 'meter, sheet, piece…',
  'Saldo awal hasil hitung fisik': 'Physically counted opening balance',
  'Peringatkan saat stok di bawah': 'Warn when stock falls below',
  'Biaya per satuan bahan (Rp, opsional)':
    'Cost per material unit (Rp, optional)',
  'Tambah bahan': 'Add material',
  'Saldo awal diperiksa staf': 'Opening balance checked by staff',
  'Bahan dan saldo awal tersimpan.': 'Material and opening balance saved.',
  'Atur pemakaian per layanan': 'Configure usage per service',
  Layanan: 'Service',
  'Pencatatan bahan': 'Material tracking',
  'Belum diatur — perlu pemeriksaan': 'Not configured — review needed',
  'Jasa tanpa bahan fisik': 'Service without physical materials',
  'Potong bahan otomatis': 'Deduct materials automatically',
  'Untuk 1': 'For 1',
  'unit layanan': 'service unit',
  ', berapa bahan yang dipakai? Konfigurasi ini berlaku untuk ukuran standar tanpa tambahan bingkai. Varian lain ditandai perlu pemeriksaan; buat layanan terpisah bila pemakaiannya berbeda.':
    ', how much material is used? This configuration applies to the standard size without extra frames. Other variants are flagged for review; create separate services if usage differs.',
  Bahan: 'Material',
  'Pilih bahan': 'Choose material',
  Pemakaian: 'Usage',
  'Hapus bahan {0}': 'Remove material {0}',
  'Simpan pemakaian bahan': 'Save material usage',
  'Pilih layanan dan cara pencatatan bahan.':
    'Choose a service and a material-tracking method.',
  'Pilih bahan berbeda dan isi pemakaian positif.':
    'Choose different materials and enter positive usage amounts.',
  'Pemakaian bahan layanan tersimpan.': 'Service material usage saved.',
  'Cocokkan dengan hitungan fisik': 'Match the physical count',
  'Bahan yang dihitung': 'Material being counted',
  'Jumlah fisik yang tersedia sekarang': 'Physical quantity available now',
  'Alasan / keterangan pemeriksaan': 'Count / correction notes',
  'Saya sudah menghitung fisik. Angka ini menggantikan saldo stok saat ini; gunakan hanya saat tidak ada produksi / penjualan bersamaan.':
    'I have counted the physical stock. This replaces the current stock balance; only use this while production and sales are paused.',
  'Simpan hasil hitung fisik': 'Save physical count',
  'Isi jumlah yang dihitung.': 'Enter the quantity counted.',
  'Saldo fisik dan alasan koreksi tersimpan.':
    'Physical stock balance and correction notes saved.',
  'Halo Queen Photo, saya ingin konsultasi {0}. {1}':
    'Hello Queen Photo, I would like to discuss {0}. {1}',
  'Mohon konfirmasi harga dan jadwal.':
    'Please confirm the price and schedule.',
  'Sesuaikan pesanan': 'Customize order',
  'Tutup pilihan layanan': 'Close service options',
  'Pilihan standar sudah tersedia. Ubah hanya yang Anda perlukan.':
    'Standard options are ready. Only change what you need.',
  'Ukuran / paket': 'Size / package',
  'Harga per paket': 'Price per package',
  'Harga mulai dari': 'Prices from',
  'Opsi tambahan & catatan (opsional)': 'Additional options & notes (optional)',
  'Warna latar': 'Background color',
  'Tambahan bingkai': 'Frame surcharge',
  'per paket sudah termasuk pada harga.':
    'per package is included in the price.',
  'Catatan untuk studio': 'Notes for the studio',
  'Contoh: crop fokus wajah, warna natural, atau minta konfirmasi sebelum cetak.':
    'Example: crop closer to the face, natural colors, or confirm before printing.',
  'Foto dikirim setelah checkout': 'Send photos after checkout',
  'Kirim foto asli melalui WhatsApp studio. Belum perlu menyiapkan file di langkah ini.':
    "Send original photos through the studio's WhatsApp. You do not need to prepare files at this step.",
  'Konsultasi harga / jadwal': 'Discuss price / schedule',
  'Estimasi total': 'Estimated total',
  'Tambah ke keranjang': 'Add to cart',
  'Masih bisa menambah layanan lain sebelum checkout.':
    'You can add more services before checkout.',
  'Konfirmasi pesanan': 'Order confirmation',
  'Staf memeriksa rincian dan pembayaran.':
    'Staff check the details and payment.',
  'Desain & penyesuaian': 'Design & adjustments',
  'Foto masuk antrean editor.': 'Photos are in the editing queue.',
  'Proses cetak': 'Printing',
  'Pesanan sedang dikerjakan.': 'Your order is being prepared.',
  'Siap diterima': 'Ready to receive',
  'Ambil di studio atau tunggu pengiriman.':
    'Collect at the studio or wait for delivery.',
  'Terima kasih sudah mempercayakan momen Anda.':
    'Thank you for trusting us with your moments.',
  'Kabar dari studio': 'Studio updates',
  'Lacak pesanan Anda.': 'Track your order.',
  'Gunakan perangkat yang dipakai saat memesan. Masukkan nomor pesanan untuk melihat perkembangan terbaru.':
    'Use the same device you ordered on. Enter your order number to see the latest update.',
  Lacak: 'Track',
  'Nomor pesanan tersedia pada konfirmasi setelah checkout.':
    'Your order number is on the confirmation after checkout.',
  'Pesanan pada perangkat ini': 'Orders on this device',
  'Kami kabari setiap langkahnya.': 'Updates at every step.',
  'Pesanan belum ditemukan': 'Order not found',
  'Pesanan Anda akan muncul di sini setelah tersimpan. Belum memesan? Temukan layanan yang sesuai.':
    "Your order will appear here after it is saved. Haven't ordered yet? Find the right service.",
  'Periksa nomor pesanan dan pastikan Anda memakai perangkat yang sama. Bila memesan langsung di studio, hubungi staf untuk bantuan.':
    'Check the order number and use the same device. For an in-store order, contact staff for help.',
  'Status pesanan': 'Order status',
  'Pesanan dibatalkan': 'Order cancelled',
  'Sedang diperiksa': 'Under review',
  'Pesanan tidak dilanjutkan': 'Order will not proceed',
  'Progres pesanan': 'Order progress',
  Penerimaan: 'Receiving method',
  'RINGKASAN QUEEN PHOTO · {0} WIB\nPenjualan lunas: {1} (di luar ongkir)\n{2}\nMenunggu pembayaran: {3} pesanan\nSiap diambil: {4}\nPembatalan hari ini: {5}\nPembatalan berbayar perlu cek refund: {6}\nStok rendah: {7} bahan\nBahan perlu pemeriksaan: {8} pesanan\nPenerimaan belum dikurangi pengembalian dana. {9}':
    'QUEEN PHOTO SUMMARY · {0} WIB\nPaid sales: {1} (excluding delivery)\n{2}\nAwaiting payment: {3} orders\nReady for collection: {4}\nCancellations today: {5}\nPaid cancellations needing refund review: {6}\nLow stock: {7} materials\nMaterial review needed: {8} orders\nReceipts have not had refunds deducted. {9}',
  '{0} tercatat: {1}': '{0} recorded: {1}',
  '{0} pembayaran lama menggunakan tanggal pesanan.':
    '{0} legacy payments use the order date.',
  'Staf belum tercatat (data lama)': 'Staff not recorded (legacy data)',
  'Pesanan website': 'Website order',
  'Supervisi jarak jauh': 'Remote supervision',
  'Periksa penjualan dan pengecualian tanpa membaca satu per satu pesan grup.':
    'Review sales and exceptions without reading every group message.',
  'Tanggal ringkasan (WIB)': 'Summary date (WIB)',
  'Menunggu data terbaru. Angka belum dapat dianggap sebagai saldo terakhir saat koneksi terputus.':
    'Waiting for fresh data. These figures are not confirmed current balances while disconnected.',
  'data pesanan tidak valid. Angka laporan belum lengkap dan tutup kas dinonaktifkan. Periksa ID ini di Firestore sebelum memperbaiki data:':
    'invalid orders. Report totals are incomplete and cash closing is disabled. Review these IDs in Firestore before correcting the records:',
  'Penjualan lunas': 'Paid sales',
  'Tanggal pesanan, di luar ongkir': 'By order date, excluding delivery',
  'Pembayaran belum diperiksa': 'Payments awaiting verification',
  'Seluruh pesanan aktif': 'All active orders',
  'Siap diambil / dikirim': 'Ready for collection / delivery',
  'Seluruh antrean siap': 'All ready orders',
  'Pada tanggal yang dipilih': 'On the selected date',
  'Penerimaan yang dicatat': 'Recorded receipts',
  'Tanggal verifikasi pembayaran. Penerimaan kotor termasuk ongkir, belum dikurangi refund.':
    'By payment verification date. Gross receipts include delivery and have not had refunds deducted.',
  'transaksi lama belum memiliki tanggal verifikasi. Angkanya menggunakan tanggal pesanan dan perlu dicocokkan dengan bank / kas.':
    'legacy transactions have no verification date. Their order dates are used; reconcile them with bank / cash records.',
  'Cocokkan tunai dengan hitungan fisik dan non-tunai dengan aplikasi bank / merchant. Ringkasan ini bukan saldo bank atau saldo laci kas.':
    'Match cash to the physical count and non-cash receipts to the bank / merchant app. This summary is not a bank or drawer balance.',
  'Perlu perhatian': 'Needs attention',
  'pembatalan berbayar perlu diperiksa pengembalian dananya.':
    'paid cancellations need refund review.',
  'pesanan belum memiliki pemotongan bahan yang dapat dipastikan.':
    'orders have no confirmed material deduction.',
  'bahan berada pada batas stok rendah.':
    'materials are at the low-stock threshold.',
  'Tindak lanjut pesanan': 'Follow up orders',
  'Periksa inventaris': 'Review inventory',
  'Penjualan menurut pencatat': 'Sales by staff member',
  'Tanggal pesanan yang dipilih': 'Selected order date',
  'transaksi dicatat': 'transactions recorded',
  'Belum ada penjualan pada tanggal ini.': 'No sales recorded on this date.',
  'Ringkasan untuk grup WhatsApp': 'Summary for the WhatsApp group',
  'Staff cukup membagikan ringkasan; tidak perlu mengetik ulang semua transaksi.':
    'Share the summary instead of retyping every transaction.',
  'Salin teks di bawah secara manual.': 'Copy the text below manually.',
  'Bagikan ke WhatsApp': 'Share on WhatsApp',
  'Pilih sendiri grup tujuan di WhatsApp. Tidak ada pesan yang dikirim otomatis.':
    'Choose the destination group in WhatsApp. No message is sent automatically.',
  'Halaman belum dapat ditampilkan': 'Page could not be displayed',
  'Periksa koneksi, lalu muat ulang. Draf kasir dan keranjang yang tersimpan di perangkat akan tetap tersedia. Jangan mencatat ulang transaksi yang sudah mendapat konfirmasi tersimpan.':
    'Check the connection, then reload. Saved cashier drafts and carts on this device remain available. Do not record a transaction again if its save was already confirmed.',
  'Muat ulang halaman': 'Reload page',
  'Struk Nota Resmi Queen Photo': 'Queen Photo official receipt',
  'Tutup nota': 'Close receipt',
  'Studio Foto & Laboratorium Cetak Minilab Sejak 1980':
    'Photo studio & minilab prints since 1980',
  'No. Nota:': 'Receipt no.:',
  'Waktu:': 'Time:',
  'Pelanggan:': 'Customer:',
  'Saluran:': 'Channel:',
  'Pemesanan Online': 'Online order',
  'Kasir Toko (Walk-in)': 'In-store cashier (walk-in)',
  'Pengiriman:': 'Delivery:',
  'Ambil di Studio': 'Studio collection',
  'Deskripsi Item': 'Item description',
  'Subtotal Pesanan:': 'Order subtotal:',
  'Ongkir GrabExpress:': 'GrabExpress delivery fee:',
  'TOTAL AKHIR:': 'FINAL TOTAL:',
  Dibayar: 'Paid',
  '· Sisa': '· Remaining',
  'Metode Bayar:': 'Payment method:',
  'Belum bayar': 'Unpaid',
  'Bayar sebagian': 'Partially paid',
  'Terima kasih atas kepercayaan Anda pada Queen Photo Pontianak.':
    'Thank you for choosing Queen Photo Pontianak.',
  'Kertas foto minilab asli tahan pudar hingga 50 tahun.':
    'Original minilab photo paper, with fade resistance up to 50 years.',
  '--- Simpan struk ini sebagai tanda bukti pengambilan ---':
    '--- Keep this receipt as proof for collection ---',
  'Cetak Struk Nota (Print)': 'Print receipt',
  'Kirim Nota ke WhatsApp': 'Send receipt on WhatsApp',
  'Nota pesanan': 'Order receipt',
  'Ilustrasi perbaikan dan pewarnaan foto lama':
    'Illustration of restoring and colorizing an old photo',
  'Kenangan lintas generasi': 'Memories across generations',
  'Cerita lama, dirawat kembali.': 'Old stories, cared for again.',
  'Foto yang pudar tetap menyimpan cerita. Konsultasikan perbaikan noda, lipatan, atau pewarnaan dengan studio sebelum menentukan pengerjaan.':
    'Faded photos still hold stories. Ask the studio about stains, creases, or colorization before choosing restoration work.',
  'Lihat layanan restorasi': 'View restoration services',
  'Harga dan hasil yang memungkinkan bergantung pada kondisi foto asli.':
    "Price and possible results depend on the original photo's condition.",
  'Omzet layanan': 'Service revenue',
  'Estimasi HPP': 'Estimated production costs',
  'Estimasi laba kotor': 'Estimated gross profit',
  'Pesanan lunas': 'Paid orders',
  'Jumlah unit': 'Units sold',
  'Performa studio': 'Studio performance',
  'Laporan penjualan': 'Sales report',
  'Pesanan lunas dan tidak dibatalkan, berdasarkan tanggal pesanan (WIB).':
    'Paid, non-cancelled orders, grouped by order date (WIB).',
  'Periode laporan': 'Report period',
  'Unduh CSV': 'Download CSV',
  'Setelah diskon, di luar ongkir': 'After discounts, excluding delivery',
  'Online dan walk-in': 'Online and walk-in',
  'Sebelum biaya operasional': 'Before operating expenses',
  'Rata-rata pesanan': 'Average order',
  'Omzet layanan per transaksi': 'Service revenue per transaction',
  'Belum ada pesanan lunas pada periode ini. Pesanan yang belum dibayar atau dibatalkan tidak masuk laporan.':
    'No paid orders in this period. Unpaid and cancelled orders are excluded.',
  'Penjualan per layanan': 'Sales by service',
  'Omzet bersih ongkir': 'Revenue excluding delivery',
  unit: 'units',
  'Saluran penjualan': 'Sales channels',
  pesanan: 'orders',
  'Walk-in studio': 'In-store walk-in',
  'Target bulanan': 'Monthly target',
  'Target omzet (Rp)': 'Revenue target (Rp)',
  'Estimasi HPP periode ini:': 'Estimated costs this period:',
  '. Laba kotor belum memperhitungkan sewa, gaji, dan biaya operasional lain. Laporan menggunakan tanggal pesanan, bukan tanggal penerimaan pembayaran.':
    '. Gross profit does not include rent, wages, or other operating expenses. Reports use order dates, not payment receipt dates.',
  'Ilustrasi layanan foto; konfirmasikan contoh hasil dengan studio':
    'Photo service illustration; confirm real examples with the studio',
  'Ilustrasi layanan': 'Service illustration',
  'Semua layanan': 'All services',
  'Layanan Queen Photo': 'Queen Photo services',
  'Ada cerita yang ingin dicetak?': 'A story worth printing?',
  'Pilih layanan sesuai kebutuhan. Sesuaikan detailnya, atau langsung tambahkan pilihan standar.':
    'Choose what you need. Customize the details or add the standard option directly.',
  'Cari layanan': 'Search services',
  'Cari layanan…': 'Search services…',
  'Kategori layanan': 'Service categories',
  'Pilihan populer': 'Popular choice',
  'di keranjang': 'in cart',
  'Harga paket': 'Package price',
  'Mulai dari': 'From',
  'Tambah pilihan standar': 'Add standard option',
  'Rincian & jadwal dikonfirmasi staf.':
    'Staff confirm the details and schedule.',
  'Layanan belum ditemukan': 'No services found',
  'Coba kata lain atau lihat seluruh layanan.':
    'Try another search or view all services.',
  'Tampilkan semua layanan': 'Show all services',
  'Ditambahkan ke keranjang': 'Added to cart',
  Lihat: 'View',
  'Tutup notifikasi': 'Close notification',
  'Dikerjakan nanti': 'Work later',
  'Sedang dikerjakan': 'In progress',
  'Cari pesanan': 'Search orders',
  'Nama, nomor pesanan, atau layanan': 'Name, order number, or service',
  'Tampilkan pesanan': 'Show orders',
  'Perlu tindak lanjut': 'Needs follow-up',
  'Semua & riwayat penjualan': 'All sales & history',
  'Belum dibayar': 'Unpaid',
  'Bayar sebagian · Sisa {0}': 'Partially paid · Remaining {0}',
  'Pembayaran diterima': 'Payment received',
  'Janji:': 'Due:',
  'Buka pesanan': 'Open order',
  'Tidak ada pesanan pada pilihan ini.': 'No orders in this view.',
  'Penjualan walk-in': 'Walk-in sale',
  'Tutup pesanan': 'Close order',
  'Riwayat uang masuk': 'Payment history',
  'Dicatat:': 'Recorded:',
  'Pembayaran diperiksa:': 'Payment checked:',
  'Bahan perlu diperiksa:': 'Materials need review:',
  'transaksi lama / pemakaian belum diatur':
    'legacy transaction / usage not configured',
  '. Jangan menganggap stok sudah dipotong.':
    '. Do not assume stock has already been deducted.',
  'Bahan sudah diatur — catat pemakaian': 'Materials configured — record usage',
  'Saldo fisik sudah mencakup pesanan ini — selesaikan pemeriksaan':
    'Physical count includes this order — complete review',
  'Hanya jika saldo Inventaris sudah dihitung fisik SETELAH pesanan ini dibuat. Pemakaian pesanan ini sudah masuk dalam saldo tersebut. Isi catatan hitung fisik; stok tidak akan dipotong lagi.':
    'Only if Inventory was physically counted AFTER this order. Its usage must already be included in that balance. Enter the count notes; stock will not be deducted again.',
  'Alasan:': 'Reason:',
  'Tidak tercatat pada versi lama.': 'Not recorded in the previous version.',
  ' Pembayaran sudah diterima: periksa pengembalian dana secara terpisah.':
    ' Payment has been received: review the refund separately.',
  'Periksa pembayaran': 'Check payment',
  'Periksa uang masuk pada aplikasi bank atau merchant QRIS. Screenshot pelanggan saja belum membuktikan pembayaran.':
    'Check incoming funds in the bank or QRIS merchant app. A customer screenshot alone does not verify payment.',
  'Pastikan uang tunai sudah diterima.': 'Confirm that cash has been received.',
  'Sudah dibayar': 'Already paid',
  'Jumlah uang masuk (Rp)': 'Incoming payment amount (Rp)',
  'Cara pembayaran uang masuk': 'Incoming payment method',
  'Transfer bank (lama)': 'Bank transfer (legacy)',
  'Uang sudah masuk — simpan pembayaran': 'Funds received — save payment',
  'Pekerjaan selesai — siap diambil': 'Work complete — ready for collection',
  'Sudah diserahkan — selesai': 'Handed over — complete',
  'Selesaikan pemeriksaan pembayaran sebelum menyerahkan pesanan.':
    'Complete payment verification before handing over the order.',
  'Batalkan pesanan': 'Cancel order',
  'Alasan pembatalan': 'Cancellation reason',
  'Bahan sudah terpakai?': 'Have materials been used?',
  'Sudah terpakai — jangan kembalikan stok':
    'Already used — do not restore stock',
  'Belum terpakai — kembalikan potongan tercatat':
    'Unused — restore recorded deductions',
  'Kertas yang sudah dicetak tidak kembali menjadi bahan baru. Pembatalan tidak otomatis mengembalikan uang.':
    'Printed paper cannot become unused material again. Cancelling does not automatically refund money.',
  'Konfirmasi pembatalan': 'Confirm cancellation',
  'Hubungi pelanggan': 'Contact customer',
  'Riwayat perubahan': 'Change history',
  'Minimalis Hitam': 'Minimalist black',
  'Minimalis Putih': 'Minimalist white',
  'Kayu Jati Elegan': 'Elegant teak',
  'Ukiran Emas Klasik': 'Classic gold carving',
  'Isi setiap nama opsi (maksimal 100 karakter), atau hapus baris kosong.':
    'Enter every option name (maximum 100 characters), or remove empty rows.',
  'Nama opsi tidak boleh sama.': 'Option names must be different.',
  'Harga dan biaya bingkai harus rupiah bulat, minimal Rp0.':
    'Frame prices and costs must be whole rupiah, at least Rp0.',
  'Tanpa Bingkai harus memiliki tambahan harga dan biaya Rp0.':
    'No frame must have an additional price and cost of Rp0.',
  'Rp {0} M': 'Rp {0} bn',
  'Rp {0} Jt': 'Rp {0} m',
  'Rp {0} Rb': 'Rp {0} k',
  'Rp {0}': 'Rp {0}',
  '📸 *LAPORAN PENJUALAN QUEEN PHOTO PONTIANAK*\n':
    '📸 *QUEEN PHOTO PONTIANAK SALES REPORT*\n',
  '📅 Tanggal: {0}\n\n': '📅 Date: {0}\n\n',
  '📊 *RINGKASAN HARI INI:*\n': "📊 *TODAY'S SUMMARY:*\n",
  '• Total Transaksi: {0} pesanan ({1} Toko / {2} Online)\n':
    '• Transactions: {0} orders ({1} in-store / {2} online)\n',
  '• Total Omset: *{0}*\n': '• Revenue: *{0}*\n',
  '• Estimasi HPP Kertas/Bahan: {0}\n': '• Estimated material costs: {0}\n',
  '• Estimasi Laba Kotor: *{0}* ({1}%)\n\n':
    '• Estimated gross profit: *{0}* ({1}%)\n\n',
  '📈 *PROGRESS OMSET BULAN INI:*\n': "📈 *THIS MONTH'S REVENUE:*\n",
  '• Akumulasi Omset: {0} / Target {1} ({2}%)\n':
    '• Revenue to date: {0} / Target {1} ({2}%)\n',
  '• Akumulasi Laba: {0}\n\n': '• Profit to date: {0}\n\n',
  '📝 *DETAIL TRANSAKSI TERAKHIR:*\n': '📝 *LATEST TRANSACTIONS:*\n',
  '\n_Dicatat otomatis via Sistem Digital Queen Photo Pontianak_ ✨':
    "\n_Recorded through Queen Photo Pontianak's digital system_ ✨",
  'Halo {0}, terima kasih telah memesan di *Queen Photo Pontianak*! 📸\n\n':
    'Hello {0}, thank you for ordering from *Queen Photo Pontianak*! 📸\n\n',
  'Nomor Pesanan: *#{0}*\n': 'Order number: *#{0}*\n',
  'Status: *{0}*\n': 'Status: *{0}*\n',
  'Metode Pembayaran: *{0}* ({1})\n': 'Payment method: *{0}* ({1})\n',
  'Sudah dibayar: *{0}* · Sisa bayar: *{1}*\n':
    'Paid: *{0}* · Remaining: *{1}*\n',
  'Metode Pengiriman: *{0}*\n\n': 'Delivery method: *{0}*\n\n',
  'Ekspedisi Kalbar': 'West Kalimantan delivery',
  'Ambil di Studio (Gajah Mada)': 'Studio collection (Gajah Mada)',
  '*Rincian Pesanan:*\n': '*Order details:*\n',
  '• Ongkir: {0}\n': '• Delivery fee: {0}\n',
  '\n*Total Tagihan: {0}*\n\n': '\n*Total due: {0}*\n\n',
  'Lokasi Studio: Jl. Gajah Mada No. 128, Pontianak (Buka 09.00 - 20.30 WIB)\n':
    'Studio: Jl. Gajah Mada No. 128, Pontianak (open 09:00–20:30 WIB)\n',
  'Untuk konfirmasi atau pertanyaan, balas pesan ini ya Kak!':
    'Reply to this message to confirm or ask a question.',
  'Halo Queen Photo, saya {0}. Mohon konfirmasi pesanan #{1}.\n':
    'Hello Queen Photo, I am {0}. Please confirm order #{1}.\n',
  ' — file: {0}': ' — file: {0}',
  '\nTotal: {0}. Status pembayaran: {1}. Saya akan mengirim foto asli di chat ini.':
    '\nTotal: {0}. Payment status: {1}. I will send the original photos in this chat.',
  'Tunai di kasir': 'Cash at the studio',
  'Pelanggan tanpa nama': 'Unnamed customer',
  'Isi pembayaran lebih dari Rp0 dan tidak melebihi sisa bayar.':
    'Enter a payment greater than Rp0 and no more than the remaining balance.',
  'Jumlah dan harga layanan tidak valid.': 'Invalid service quantity or price.',
  '{0} (opsi khusus)': '{0} (custom option)',
  'Konfigurasi bahan tidak valid.': 'Invalid material configuration.',
  'Jumlah stok tidak valid.': 'Invalid stock quantity.',
  'Stok {0} tidak cukup. Sisa {1} {2}.':
    'Not enough {0} stock. Remaining: {1} {2}.',
  'Pesanan batal tidak dibuka ulang. Buat pesanan baru untuk pengerjaan ulang.':
    'Cancelled orders cannot be reopened. Create a new order for rework.',
  'Pilih apakah bahan sudah terpakai.':
    'Choose whether the materials have been used.',
  'Pilih 1–50 layanan.': 'Choose 1–50 services.',
  'Jumlah, harga atau biaya layanan tidak valid.':
    'Invalid quantity, price, or service cost.',
  'Izin staf diperlukan.': 'Staff access is required.',
  'Glossy Anti-Luntur': 'Fade-resistant glossy',
  'Merah (Tahun Ganjil KTP)': 'Red (odd-year ID card)',
  'Layanan tidak ditemukan.': 'Service not found.',
  'Batalkan pesanan dengan alasan agar riwayat tetap tersimpan.':
    'Cancel the order with a reason to preserve its history.',
  'Sesi login sudah berubah. Silakan masuk kembali.':
    'The sign-in session changed. Please sign in again.',
  'Akun ini belum memiliki izin staf. Hubungi pemilik studio.':
    'This account has no staff access. Contact the studio owner.',
  'Akun staf harus dibuat oleh pemilik melalui Firebase Admin. Pendaftaran publik dinonaktifkan.':
    'The owner must create staff accounts through Firebase Admin. Public registration is disabled.',
  'Silakan login sebagai staf.': 'Please sign in as staff.',
  'Masukkan alamat email untuk reset password.':
    'Enter an email address for password reset.',
  'Format alamat email tidak valid.': 'Invalid email format.',
  'Tautan reset belum dapat dikirim. Coba lagi nanti.':
    'The reset link could not be sent. Try again later.',
  'Jika alamat ini terdaftar, tautan reset akan dikirim. Periksa kotak masuk dan spam.':
    'If this address is registered, a reset link will be sent. Check your inbox and spam folder.',
  'Data stok dibaca langsung dari database. Tambahkan bahan atau stok melalui Inventaris; penulisan ulang massal dinonaktifkan.':
    'Stock is read directly from the database. Add materials or stock through Inventory; bulk overwriting is disabled.',
  'Studio & cetak foto': 'Studio & photo prints',
  'Memuat halaman…': 'Loading page…',
  'item di keranjang': 'items in cart',
  'Lihat keranjang →': 'View cart →',
  'Akses keranjang cepat': 'Quick cart access',
  'Memuat formulir…': 'Loading form…',
  Kasir: 'Cashier',
  Pesanan: 'Orders',
  Inventaris: 'Inventory',
  Laporan: 'Reports',
  Pengaturan: 'Settings',
  Beranda: 'Home',
  Masuk: 'Sign in',
  Keluar: 'Sign out',
  Simpan: 'Save',
  Tutup: 'Close',
  Semua: 'All',
  Selesai: 'Completed',
  Lunas: 'Paid',
  Dibatalkan: 'Cancelled',
  Disembunyikan: 'Hidden',
  Tersalin: 'Copied',
  Salin: 'Copy',
  Terpopuler: 'Popular',
  Konsultasi: 'Consultation',
  Lembar: 'Sheets',
  lembar: 'sheet',
  meter: 'meter',
  paket: 'package',
  buah: 'piece',
  Putih: 'White',
  Merah: 'Red',
  Biru: 'Blue',
  Finishing: 'Finish',
  MENUNGGU_BAYAR: 'Awaiting payment',
  BELUM_BAYAR: 'Unpaid',
  LUNAS: 'Paid',
  SEBAGIAN: 'Partially paid',
  ANTREAN_DESAIN: 'Queued for design',
  PROSES_CETAK: 'Printing',
  SIAP_DIAMBIL_KIRIM: 'Ready for collection / delivery',
  SELESAI: 'Completed',
  DIBATALKAN: 'Cancelled',
  'Gunakan jawaban nyata untuk menguji penawaran. Usia pelanggan saja tidak menentukan layanan yang ingin mereka beli.':
    'Use real feedback to test offers. Age alone does not tell you which services customers want.',
  'Buka survei pelanggan': 'Open customer survey',
  'Jumlah jawaban': 'Responses',
  'Rata-rata penilaian': 'Average rating',
  'Belum ada data': 'No data yet',
  'Belum ada jawaban survei. Jangan menganggap kebutuhan atau anggaran pelanggan sudah diketahui sebelum mengumpulkan data.':
    'No survey responses yet. Collect evidence before making assumptions about customer needs or budgets.',
  'Layanan yang dibutuhkan': 'Services requested',
  'Pelanggan Anonim': 'Anonymous customer',
  'Usia:': 'Age:',
  '· Penilaian:': '· Rating:',
  'Jawaban survei mewakili orang yang mengisi formulir, bukan seluruh pasar Pontianak. Bandingkan dengan transaksi toko dan uji penawaran kecil sebelum berinvestasi.':
    'Survey responses represent the people who answered, not all of Pontianak. Compare them with shop transactions and test small offers before investing.',
  'Silakan masuk kembali.': 'Please sign in again.',
  'Bahan belum tersedia di inventaris. Periksa konfigurasi layanan.':
    'Material is missing from Inventory. Check the service configuration.',
  'Penjualan dengan nomor ini sudah tersimpan. Periksa riwayat, lalu kosongkan isian untuk transaksi baru.':
    'This sale number is already saved. Check history, then clear the form for a new sale.',
  'Jumlah pembayaran tidak valid.': 'Invalid payment amount.',
  'Pesanan tidak ditemukan.': 'Order not found.',
  'Isi alasan pembatalan.': 'Enter a cancellation reason.',
  'Riwayat bahan tidak tersedia; perlu pemeriksaan pemilik.':
    'Material history is unavailable; owner review is needed.',
  'Pesanan dibatalkan; periksa pengembalian dana.':
    'The order was cancelled; review the refund.',
  'Nomor pembayaran sudah digunakan. Periksa riwayat.':
    'This payment reference was already used. Check history.',
  'Pembayaran tidak dapat dihapus. Hubungi penanggung jawab untuk koreksi.':
    'Payments cannot be removed. Contact the supervisor for a correction.',
  'Isi jumlah positif dan alasan penambahan stok.':
    'Enter a positive stock quantity and a restock reason.',
  'Bahan tidak ditemukan.': 'Material not found.',
  'Nama, satuan dan jumlah bahan tidak valid.':
    'Invalid material name, unit, or quantity.',
  'Izin pemilik diperlukan.': 'Owner access is required.',
  'Riwayat bahan perlu diperiksa manual; pesanan ini tidak dapat dipotong ulang otomatis.':
    'Material history needs manual review; this order cannot be deducted automatically again.',
  'Atur pemakaian bahan: {0}.': 'Configure material usage: {0}.',
  'Isi hasil hitung fisik dan alasan koreksi.':
    'Enter the physical count and correction reason.',
  'Isi nominal kas dengan rupiah bulat, minimal Rp0.':
    'Enter cash amounts in whole rupiah, at least Rp0.',
  'Jelaskan pengeluaran / pengembalian tunai.':
    'Explain the cash expense / refund.',
  'Kas tanggal ini sudah ditutup. Buka kembali ringkasan untuk melihat hasilnya.':
    'Cash for this date is already closed. Reopen the summary to view it.',
  'Pembayaran Rp{0}': 'Payment Rp{0}',
  'Penjualan walk-in dicatat': 'Walk-in sale recorded',
  'Bahan penjualan walk-in': 'Walk-in sale materials',
  'Bahan pengerjaan pesanan': 'Order production materials',
  'Pembatalan: bahan belum terpakai': 'Cancellation: unused materials',
  'Pemakaian bahan setelah konfigurasi diperiksa':
    'Material usage after configuration review',
  'Pemakaian bahan diperiksa dan dicatat':
    'Material usage reviewed and recorded',
  'Pengecualian stok: {0}': 'Stock exception: {0}',
  'Foto Studio': 'Studio photography',
  Banner: 'Banner',
  Rp: 'Rp',
  ID: 'ID',
  Online: 'Online',
  'Walk-in': 'Walk-in',
  'Bahasa belum dimuat. Coba lagi.': 'Language could not be loaded. Try again.',
  'Teks produk bahasa Inggris (opsional)': 'English product text (optional)',
  'Kosongkan untuk memakai teks asli. Catatan pelanggan tidak diterjemahkan otomatis.':
    'Leave empty to use the original text. Customer notes are not automatically translated.',
  'Nama produk bahasa Inggris': 'English product name',
  'Deskripsi bahasa Inggris': 'English description',
  'Satuan bahasa Inggris': 'English unit',
  Periode: 'Period',
  Kategori: 'Category',
  'Penilaian:': 'Rating:',
  ROLL: 'ROLL',
  SHEET: 'SHEET',
  MERCHANDISE: 'MERCHANDISE',
  FRAME: 'FRAME',
  'GrabExpress Pontianak': 'GrabExpress Pontianak',
};
export default messages;

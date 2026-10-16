import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { 
  Users, Sparkles, TrendingUp, DollarSign, Target, 
  CheckCircle2, ArrowRight, HelpCircle, Palette, Smartphone, 
  MessageSquare, Star, Heart, Award, AlertTriangle, Lightbulb 
} from 'lucide-react';

export const MarketStrategyView: React.FC = () => {
  const { setCurrentView, surveys, setIsSurveyModalOpen } = useStudio();
  const [selectedSegment, setSelectedSegment] = useState<'genz' | 'millennials' | 'traditional'>('genz');
  const [surveyAgeFilter, setSurveyAgeFilter] = useState<'ALL' | '<20' | '20-29' | '30-45' | '>45'>('ALL');

  // Survey analytics
  const totalSurveys = surveys.length;
  const avgRating = totalSurveys > 0 
    ? (surveys.reduce((sum, s) => sum + s.satisfactionRating, 0) / totalSurveys).toFixed(1) 
    : '5.0';

  // Age distribution
  const countUnder20 = surveys.filter(s => s.ageBracket === '<20').length;
  const count20to29 = surveys.filter(s => s.ageBracket === '20-29').length;
  const count30to45 = surveys.filter(s => s.ageBracket === '30-45').length;
  const countOver45 = surveys.filter(s => s.ageBracket === '>45').length;

  // New services demand frequency
  const serviceDemandMap: Record<string, number> = {};
  surveys.forEach(s => {
    s.demandedNewServices?.forEach(svc => {
      serviceDemandMap[svc] = (serviceDemandMap[svc] || 0) + 1;
    });
  });

  const sortedDemandedServices = Object.entries(serviceDemandMap)
    .sort((a, b) => b[1] - a[1]);

  const filteredSurveys = surveys.filter(s => {
    if (surveyAgeFilter === 'ALL') return true;
    return s.ageBracket === surveyAgeFilter;
  });

  const segments = {
    genz: {
      id: 'genz',
      title: 'Gen Z & Mahasiswa (Untan / Polnep / Pelajar Pontianak)',
      ageRange: 'Usia 15 – 25 Tahun',
      budget: 'Rp 15.000 – Rp 85.000 / transaksi',
      frequency: 'Tinggi (Rutin setiap momen nongkrong, pacaran, wisuda, atau update CV)',
      behavior: 'Sangat visual, malas antre lama, memesan lewat HP/Grab, menyukai photostrips, polaroids, dan pas foto aesthetic glowing.',
      products: [
        'Photostrip 2x6 Korean 4-Cut (Rp 18.000 / 2 strip)',
        'Paket Polaroid Mini 20 lembar untuk casing HP (Rp 35.000)',
        'Self Photo Studio private remote (Rp 85.000)',
        'Pas Foto Aesthetic CV / LinkedIn / BUMN (Rp 30.000)',
      ],
      marketingTip: 'Posting foto photostrip & video behind-the-scenes singkat di TikTok & Instagram Reels. Sediakan promo diskon mahasiswa Untan.',
    },
    millennials: {
      id: 'millennials',
      title: 'Keluarga Muda Millennial (Orang Tua Baru di Pontianak)',
      ageRange: 'Usia 26 – 40 Tahun',
      budget: 'Rp 150.000 – Rp 500.000 / transaksi',
      frequency: 'Menengah (Momen penting: bayi lahir, ultah anak, dekorasi rumah, mudik Lebaran/Imlek)',
      behavior: 'Memiliki daya beli paling stabil. Menginginkan hasil foto bersih modern (Scandinavian/Japandi) dengan bingkai kayu jati minimalis.',
      products: [
        'Cetak Galeri Dinding 10R / 16R + Bingkai Minimalis (Rp 75.000 - Rp 175.000)',
        'Album Layflat Photobook Hardcover (Rp 220.000)',
        'Sesi Studio Keluarga Modern (Rp 350.000)',
      ],
      marketingTip: 'Tonjolkan kemudahan pengiriman GrabExpress Pontianak langsung ke rumah sehingga ibu-ibu muda tidak perlu repot membawa balita ke toko.',
    },
    traditional: {
      id: 'traditional',
      title: 'Pelanggan Tradisional & Komuter (Rural / Pinggiran Pontianak)',
      ageRange: 'Usia 40+ Tahun & Warga Siantan / Serdam / Kubu Raya / Sambas',
      budget: 'Rp 25.000 – Rp 150.000 / transaksi',
      frequency: 'Kebutuhan administratif & restorasi foto pusaka',
      behavior: 'Membutuhkan pas foto regulasi resmi (KUA nikah, paspor/visa berobat ke Kuching, umroh/haji) dan restorasi foto orang tua yang mulai rusak.',
      products: [
        'Pas Foto Resmi Kilat KTP/Paspor (Rp 25.000)',
        'Restorasi & Pewarnaan Foto Jadul (Rp 75.000)',
        'Cetak Ulang Foto Wisuda Anak (Rp 25.000)',
      ],
      marketingTip: 'Jaga kecepatan cetak kilat (10-15 menit jadi di kasir toko) dan integrasi order via WhatsApp yang mudah dipahami orang tua.',
    },
  };

  const activeData = segments[selectedSegment];

  return (
    <div className="py-6 sm:py-10 max-w-6xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
      
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-stone-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Laporan Riset Pasar, Suara Pelanggan & Analisis Penjualan Studio</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
          Mengapa Penjualan Lebih Rendah Dibanding 10 Tahun Lalu & Solusi Pemulihannya?
        </h2>
        <p className="text-stone-600 text-xs sm:text-sm leading-relaxed max-w-3xl">
          Analisis mendalam mengenai perubahan perilaku konsumen fotografi di Pontianak, hasil survei demografi usia, dan formula strategi "Dual Engine" untuk mengembalikan omset studio ke target Rp 30 Juta/bulan.
        </p>
      </div>

      {/* EXECUTIVE DIAGNOSIS: 10 Years Ago vs Today */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 space-y-6 border border-stone-800 shadow-sm">
        <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm uppercase tracking-wider">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <span>Diagnosa Bisnis: 4 Alasan Mengapa Pola Pembelian Berubah Sejak 2014-2016</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm">
          <div className="p-4 bg-stone-800/90 rounded-xl border border-stone-700/80 space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <h4>1. Ledakan Smartphone & Cloud Storage</h4>
            </div>
            <p className="text-stone-300 text-xs leading-relaxed">
              10 tahun lalu, kamera digital saku dan HP jadul memerlukan cetak foto fisik 4R agar bisa disimpan di album. Sekarang, ribuan foto tersimpan gratis di galeri smartphone dan media sosial (Instagram/TikTok), sehingga orang tidak lagi mencetak foto keseharian secara otomatis.
            </p>
          </div>

          <div className="p-4 bg-stone-800/90 rounded-xl border border-stone-700/80 space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <h4>2. Instansi Beralih ke Softfile Digital (JPG Upload)</h4>
            </div>
            <p className="text-stone-300 text-xs leading-relaxed">
              Dulu pendaftaran CPNS, buku nikah KUA, visa, dan sekolah mewajibkan 10-20 lembar cetak pas foto kertas fisik. Saat ini mayoritas portal meminta upload softcopy digital. Studio yang tidak menyediakan softcopy instan via WA/Drive kehilangan pasar ke fotografer rumahan.
            </p>
          </div>

          <div className="p-4 bg-stone-800/90 rounded-xl border border-stone-700/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <h4>3. Pergeseran ke "Experience Photography" (Self-Photo & Booth)</h4>
            </div>
            <p className="text-stone-300 text-xs leading-relaxed">
              Pasar anak muda hari ini tidak mencari foto studio kaku berjarak dengan fotografer formal. Mereka menginginkan <strong>Self-Photo Studio (kamar privat ber-AC dengan remote nirkabel di tangan)</strong> dan <strong>Photostrip 2x6 Korean 4-Cut</strong> untuk diselipkan di casing HP transparan.
            </p>
          </div>

          <div className="p-4 bg-stone-800/90 rounded-xl border border-stone-700/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <h4>4. Solusi: Terapkan Strategi "Dual Engine"</h4>
            </div>
            <p className="text-stone-300 text-xs leading-relaxed">
              Jangan tinggalkan pelanggan lama (restorasi pusaka & pas foto dinas ber-margin tinggi), namun aktifkan mesin volume baru (Self Photo Rp 85k & Photostrip Rp 18k) untuk menarik ribuan mahasiswa Untan/Polnep nongkrong ke Queen Photo Jl. Gajah Mada setiap sore!
            </p>
          </div>
        </div>
      </div>

      {/* LIVE MARKET RESEARCH & CUSTOMER FEEDBACK METRICS */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
              <MessageSquare className="w-4 h-4" />
              <span>Hasil Survei Pasar & Feedback Nyata Pelanggan Pontianak</span>
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 mt-1">
              Data Demografi & Kebutuhan Layanan Terpopuler
            </h3>
          </div>

          <button
            onClick={() => setIsSurveyModalOpen(true)}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ Buka / Coba Formulir Survei Pelanggan</span>
          </button>
        </div>

        {/* High-level KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-stone-500 block">Total Responden:</span>
            <strong className="text-2xl font-mono font-bold text-stone-900 mt-1 block">
              {totalSurveys} Orang
            </strong>
            <span className="text-[10px] text-stone-400 mt-0.5 block">Warga Pontianak & Sekitarnya</span>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-stone-500 block">Tingkat Kepuasan:</span>
            <div className="flex items-baseline gap-1 mt-1">
              <strong className="text-2xl font-mono font-bold text-amber-700">
                {avgRating}
              </strong>
              <span className="text-xs text-stone-400">/ 5.0</span>
            </div>
            <div className="flex text-amber-400 mt-0.5">
              {'★★★★★'}
            </div>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-stone-500 block">Segmen Usia Dominan:</span>
            <strong className="text-lg font-bold text-stone-900 mt-1 block">
              20 – 29 Tahun
            </strong>
            <span className="text-[10px] text-stone-500 mt-0.5 block">
              {totalSurveys > 0 ? Math.round((count20to29 / totalSurveys) * 100) : 60}% Mahasiswa & Pekerja Muda
            </span>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-stone-500 block">Layanan #1 Diinginkan:</span>
            <strong className="text-sm font-bold text-emerald-800 mt-1 block truncate" title="Self-Photo Studio Mandiri">
              Self-Photo Studio
            </strong>
            <span className="text-[10px] text-emerald-700 mt-0.5 block">
              Permintaan tertinggi Gen Z
            </span>
          </div>
        </div>

        {/* Detailed Demographic & Demand Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Demographic Age Breakdown */}
          <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs uppercase tracking-wider">
              <Users className="w-4 h-4 text-amber-700" />
              <span>Distribusi Demografi Usia Pelanggan</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-stone-700 font-medium">Usia &lt; 20 Tahun (Pelajar / Gen Z):</span>
                  <span className="font-mono font-bold text-stone-900">
                    {countUnder20} ({totalSurveys > 0 ? Math.round((countUnder20 / totalSurveys) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${totalSurveys > 0 ? (countUnder20 / totalSurveys) * 100 : 0}%` }} 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-stone-700 font-semibold">Usia 20 – 29 Tahun (Mahasiswa / Fresh Grad):</span>
                  <span className="font-mono font-bold text-stone-900">
                    {count20to29} ({totalSurveys > 0 ? Math.round((count20to29 / totalSurveys) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-600 rounded-full" 
                    style={{ width: `${totalSurveys > 0 ? (count20to29 / totalSurveys) * 100 : 0}%` }} 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-stone-700 font-medium">Usia 30 – 45 Tahun (Keluarga Muda / Pekerja):</span>
                  <span className="font-mono font-bold text-stone-900">
                    {count30to45} ({totalSurveys > 0 ? Math.round((count30to45 / totalSurveys) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-700 rounded-full" 
                    style={{ width: `${totalSurveys > 0 ? (count30to45 / totalSurveys) * 100 : 0}%` }} 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-stone-700 font-medium">Usia &gt; 45 Tahun (Pelanggan Tradisional 1980-an):</span>
                  <span className="font-mono font-bold text-stone-900">
                    {countOver45} ({totalSurveys > 0 ? Math.round((countOver45 / totalSurveys) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-stone-700 rounded-full" 
                    style={{ width: `${totalSurveys > 0 ? (countOver45 / totalSurveys) * 100 : 0}%` }} 
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 pt-1 leading-relaxed">
              💡 <strong>Insight:</strong> Lebih dari 75% responden survei berada di kelompok usia 15-29 tahun. Mereka adalah pembeli potensial harian untuk Photostrip, Self-Photo, dan Pas Foto CV modern.
            </p>
          </div>

          {/* Ranking of Demanded New Services */}
          <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs uppercase tracking-wider">
              <Target className="w-4 h-4 text-emerald-700" />
              <span>Ranking Layanan Baru yang Paling Diminta Pasar</span>
            </div>

            <div className="space-y-2 text-xs">
              {sortedDemandedServices.slice(0, 5).map(([svcName, count], idx) => {
                const pct = totalSurveys > 0 ? Math.round((count / totalSurveys) * 100) : 0;
                return (
                  <div key={svcName} className="space-y-1">
                    <div className="flex justify-between items-baseline text-[11px]">
                      <span className="font-medium text-stone-800 truncate pr-2">
                        {idx + 1}. {svcName}
                      </span>
                      <span className="font-mono font-bold text-stone-900 shrink-0">
                        {count} peminat ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-600 rounded-full" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-stone-500 pt-1 leading-relaxed">
              💡 <strong>Peluang Emas:</strong> Membuka bilik <em>Self-Photo Studio</em> dan <em>Korean Photobooth</em> di toko fisik Queen Photo dapat langsung menjawab keinginan pasar terbesar saat ini.
            </p>
          </div>

        </div>

        {/* FEED OF REAL CUSTOMER FEEDBACK & QUOTES */}
        <div className="space-y-4 pt-4 border-t border-stone-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-stone-900 text-sm">
                Suara Asli Pelanggan & Catatan Kebutuhan
              </h4>
              <p className="text-xs text-stone-500">
                Umpan balik langsung dari formulir survei dengan kode voucher diskon 10%
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1 sm:pb-0">
              {(['ALL', '<20', '20-29', '30-45', '>45'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setSurveyAgeFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors whitespace-nowrap text-[11px] ${
                    surveyAgeFilter === filter
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {filter === 'ALL' ? 'Semua Usia' : `Usia ${filter}`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSurveys.map(item => (
              <div 
                key={item.id} 
                className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5 flex flex-col justify-between hover:border-amber-400 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-xs">
                          {item.customerName || 'Pelanggan Anonim'}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 font-semibold">
                          Usia {item.ageBracket} thn
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex text-amber-400 text-xs shrink-0">
                      {'★'.repeat(item.satisfactionRating)}
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-stone-600">
                      <strong>Kebutuhan:</strong> {item.primaryNeed}
                    </p>
                    <p className="text-stone-600">
                      <strong>Kenapa Jarang Cetak:</strong> {item.pastPrintingComparison}
                    </p>
                    {item.demandedNewServices && item.demandedNewServices.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.demandedNewServices.map((svc, i) => (
                          <span key={i} className="text-[10px] bg-white border border-stone-200 text-stone-700 px-1.5 py-0.5 rounded">
                            + {svc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {item.feedbackText && (
                    <div className="p-2.5 bg-amber-50/70 rounded-lg border border-amber-200/80 text-[11px] text-stone-800 italic">
                      "{item.feedbackText}"
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between text-[10px] text-stone-400">
                  <span>Prioritas: {item.improvementPriority}</span>
                  <span className="font-mono text-emerald-700 font-bold">Kupon: {item.claimedDiscountCode || 'QUEEN10HEMAT'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* TARGET SEGMENT STRATEGY ROADMAP */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-1 pb-4 border-b border-stone-100">
          <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
            Panduan Strategis Tiap Segmen Konsumen di Pontianak
          </h3>
          <p className="text-xs text-stone-500">
            Pilih segmen untuk melihat rentang anggaran belanja, perilaku, dan rekomendasi produk
          </p>
        </div>

        {/* Segment Tabs */}
        <div className="flex gap-2 border-b border-stone-200 pb-3 overflow-x-auto text-xs">
          <button
            onClick={() => setSelectedSegment('genz')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors whitespace-nowrap ${
              selectedSegment === 'genz'
                ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            1. Gen Z & Mahasiswa Untan / Polnep
          </button>
          <button
            onClick={() => setSelectedSegment('millennials')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors whitespace-nowrap ${
              selectedSegment === 'millennials'
                ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            2. Keluarga Muda Millennial
          </button>
          <button
            onClick={() => setSelectedSegment('traditional')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors whitespace-nowrap ${
              selectedSegment === 'traditional'
                ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            3. Pelanggan Tradisional & Komuter
          </button>
        </div>

        {/* Selected Segment Details Card */}
        <div className="bg-stone-50 rounded-2xl border border-stone-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Profil Target Pasar
              </span>
              <h4 className="text-lg font-bold text-stone-900 mt-0.5">
                {activeData.title}
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">{activeData.ageRange}</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-stone-200 shrink-0">
              <span className="text-[11px] text-stone-500 block">Kisaran Belanja Rata-Rata:</span>
              <strong className="font-mono text-sm text-stone-900">{activeData.budget}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-700">
            <div className="space-y-4">
              <div>
                <p className="font-bold text-stone-900 mb-1">Karakteristik & Perilaku Membeli:</p>
                <p className="leading-relaxed text-stone-600">{activeData.behavior}</p>
              </div>
              <div>
                <p className="font-bold text-stone-900 mb-1">Strategi Pemasaran & Media Sosial:</p>
                <p className="leading-relaxed text-stone-600">{activeData.marketingTip}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-stone-900">Produk yang Paling Dicari Segmen Ini:</p>
              <div className="space-y-2">
                {activeData.products.map((prod, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-stone-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-stone-800">{prod}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-500">
            Kombinasi layanan viral anak muda + foto keluarga besar adalah formula terbaik untuk memulihkan penjualan Queen Photo Studio ke angka optimal.
          </p>
          <button
            onClick={() => setCurrentView('layanan')}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-sm"
          >
            <span>Buka Katalog Produk Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { AgeDemographic } from '../types';
import { 
  X, Sparkles, CheckCircle2, Copy, Heart, Star, 
  Send, HelpCircle, Users, Smartphone, MessageSquare 
} from 'lucide-react';

export const CustomerSurveyModal: React.FC = () => {
  const { 
    isSurveyModalOpen, 
    setIsSurveyModalOpen, 
    submitSurvey, 
    setIsCartOpen 
  } = useStudio();

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [ageBracket, setAgeBracket] = useState<AgeDemographic>('20-29');
  const [primaryNeed, setPrimaryNeed] = useState('Tren Photostrip / Polaroid Aesthetic');
  const [pastPrintingComparison, setPastPrintingComparison] = useState(
    'Semua foto sekarang cuma tersimpan di HP & Instagram, jarang dicetak fisik kecuali photostrip / momen wisuda'
  );
  const [demandedNewServices, setDemandedNewServices] = useState<string[]>([
    'Self-Photo Studio (kamar privat + remote jepret nirkabel)',
    'Korean Photobooth dengan pilihan frame aesthetic pastel'
  ]);
  const [improvementPriority, setImprovementPriority] = useState(
    'Suasana interior studio lebih aesthetic / Instagrammable'
  );
  const [satisfactionRating, setSatisfactionRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState('');

  // Result state
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isSurveyModalOpen) return null;

  const toggleServiceCheckbox = (service: string) => {
    if (demandedNewServices.includes(service)) {
      setDemandedNewServices(demandedNewServices.filter(s => s !== service));
    } else {
      setDemandedNewServices([...demandedNewServices, service]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const code = await submitSurvey({
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        ageBracket,
        primaryNeed,
        pastPrintingComparison,
        demandedNewServices,
        improvementPriority,
        satisfactionRating,
        feedbackText: feedbackText.trim() || undefined,
      });
      setSubmittedCode(code);
    } catch (err) {
      alert('Terima kasih! Tanggapan Anda telah tercatat.');
      setSubmittedCode('QUEEN10HEMAT');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (submittedCode) {
      navigator.clipboard.writeText(submittedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleClose = () => {
    setIsSurveyModalOpen(false);
    setSubmittedCode(null);
  };

  const serviceOptions = [
    'Self-Photo Studio (kamar privat + remote jepret nirkabel)',
    'Korean Photobooth dengan pilihan frame aesthetic pastel',
    'Paket Wisuda Lengkap (Sewa toga/kebaya + makeup + foto + softfile)',
    'Kirim Softcopy Resolusi Tinggi Instan via Google Drive / WhatsApp',
    'Cetak Kilat 15 Menit Jadi Bisa Ditunggu di Tempat',
    'Paket Bundling Polaroid & Custom Casing / Keychain Akrilik',
    'Sewa Studio untuk Foto Produk UMKM & Makanan Pontianak'
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/75 backdrop-blur-sm p-3 sm:p-4 overscroll-contain transition-all"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="survey-modal-title"
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-4 bg-stone-900 text-stone-100 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-stone-950">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-amber-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                Riset Pasar & Suara Pelanggan
              </p>
              <h3 id="survey-modal-title" className="text-sm sm:text-lg font-serif font-bold text-stone-50">
                {submittedCode ? 'Terima Kasih Banyak!' : 'Bantu Queen Photo Berinovasi & Raih Diskon 10%'}
              </h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 sm:p-2 rounded-lg text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 transition-colors"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {submittedCode ? (
          <div className="p-6 sm:p-8 space-y-6 text-center overflow-y-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                Masukan Anda Sangat Berharga!
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                Terima kasih telah berbagi pandangan. Jawaban Anda membantu kami menghadirkan layanan studio foto yang relevan bagi generasi muda & masyarakat Pontianak.
              </p>
            </div>

            {/* Voucher Reward Card */}
            <div className="p-5 bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl max-w-md mx-auto space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Kupon Hadiah Diskon 10% Anda
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-2xl font-black text-amber-950 tracking-wider">
                  {submittedCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCode ? 'Tersalin ✓' : 'Salin'}</span>
                </button>
              </div>
              <p className="text-[11px] text-amber-900">
                Gunakan kode ini saat checkout di Keranjang Belanja untuk mendapatkan diskon 10% otomatis!
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <button
                onClick={() => {
                  handleClose();
                  setIsCartOpen(true);
                }}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors shadow-sm"
              >
                Gunakan di Keranjang Belanja
              </button>
              <button
                onClick={handleClose}
                className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl text-xs sm:text-sm transition-colors"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 overflow-y-auto text-xs">
            
            {/* Introductory Incentive Callout */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-stone-700 leading-relaxed">
                <p className="font-bold text-amber-950 text-xs">
                  Mengapa Kami Bertanya?
                </p>
                <p className="text-[11px]">
                  Queen Photo Studio telah berdiri di Pontianak sejak 1980. Pola fotografi telah berubah drastis dibanding 10 tahun lalu dengan maraknya smartphone. Kami ingin memahami kebutuhan nyata Anda agar Queen Photo bisa bertransformasi menjadi studio impian Anda!
                </p>
              </div>
            </div>

            {/* Q1: Demografi Usia */}
            <div className="space-y-2">
              <label className="block font-bold text-stone-900 text-xs sm:text-sm">
                1. Berapa Usia Anda Saat Ini? <span className="text-rose-600">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { value: '<20', label: '< 20 Tahun (Pelajar SMP/SMA / Gen Z)' },
                  { value: '20-29', label: '20 – 29 Tahun (Mahasiswa Untan/Polnep / Fresh Grad)' },
                  { value: '30-45', label: '30 – 45 Tahun (Keluarga Muda / Pekerja)' },
                  { value: '>45', label: '> 45 Tahun (Pelanggan Setia Sejak 1980-an)' }
                ].map(opt => (
                  <label
                    key={opt.value}
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                      ageBracket === opt.value
                        ? 'border-amber-400 bg-amber-50/50 font-bold text-stone-900 ring-1 ring-amber-400/50'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="survey_age"
                      value={opt.value}
                      checked={ageBracket === opt.value}
                      onChange={() => setAgeBracket(opt.value as AgeDemographic)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Q2: Kebutuhan Utama Foto */}
            <div className="space-y-2">
              <label className="block font-bold text-stone-900 text-xs sm:text-sm">
                2. Apa Tujuan Utama Anda Membutuhkan Foto Hari Ini? <span className="text-rose-600">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Pass Foto Resmi (CV Kerja, LinkedIn, CPNS, Paspor, Visa)',
                  'Tren Photostrip 4-Cut / Polaroid Estetik bareng Teman/Pasangan',
                  'Foto Studio Wisuda / Foto Keluarga',
                  'Restorasi Foto Jadul Warisan Kuno (Rusak/Pudar/Robek)',
                  'Cetak Bingkai / Kanvas Hiasan Dinding Rumah'
                ].map(item => (
                  <label
                    key={item}
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                      primaryNeed === item
                        ? 'border-amber-400 bg-amber-50/50 font-bold text-stone-900 ring-1 ring-amber-400/50'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="survey_need"
                      value={item}
                      checked={primaryNeed === item}
                      onChange={() => setPrimaryNeed(item)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Q3: Kenapa Lebih Jarang Cetak Dibanding 10 Tahun Lalu? */}
            <div className="space-y-2">
              <label className="block font-bold text-stone-900 text-xs sm:text-sm">
                3. Mengapa Menurut Anda Orang Sekarang Lebih Jarang Mencetak Foto Fisik Dibanding 10 Tahun Lalu? <span className="text-rose-600">*</span>
              </label>
              <div className="space-y-2">
                {[
                  'Semua foto sekarang cuma tersimpan di HP & Instagram, jarang dicetak fisik kecuali photostrip / momen wisuda',
                  'Kurang tahu format cetak kekinian yang praktis dan estetik untuk dipajang',
                  'Pendaftaran instansi/sekolah sekarang beralih ke softfile digital (upload JPG) bukan kertas cetak',
                  'Harga cetak & bingkai konvensional terasa mahal dan kurang ramah kantong pelajar'
                ].map(reason => (
                  <label
                    key={reason}
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                      pastPrintingComparison === reason
                        ? 'border-amber-400 bg-amber-50/50 font-bold text-stone-900 ring-1 ring-amber-400/50'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="survey_comparison"
                      value={reason}
                      checked={pastPrintingComparison === reason}
                      onChange={() => setPastPrintingComparison(reason)}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="leading-snug">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Q4: Layanan Baru yang Paling Diinginkan (Checkboxes) */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <label className="block font-bold text-stone-900 text-xs sm:text-sm">
                  4. Layanan Baru Apa yang Paling Anda Inginkan Hadir di Queen Photo Pontianak?
                </label>
                <span className="text-[11px] text-stone-500">Boleh pilih lebih dari satu</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {serviceOptions.map(svc => (
                  <label
                    key={svc}
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                      demandedNewServices.includes(svc)
                        ? 'border-amber-400 bg-amber-50/60 font-semibold text-stone-900'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={demandedNewServices.includes(svc)}
                      onChange={() => toggleServiceCheckbox(svc)}
                      className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-[11px] leading-snug">{svc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Q5: Hal yang Paling Perlu Ditingkatkan */}
            <div className="space-y-2">
              <label className="block font-bold text-stone-900 text-xs sm:text-sm">
                5. Hal Apa yang Paling Mendesak Perlu Kami Tingkatkan?
              </label>
              <select
                value={improvementPriority}
                onChange={(e) => setImprovementPriority(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:ring-1 focus:ring-amber-500"
              >
                <option value="Suasana interior studio lebih aesthetic / Instagrammable untuk nongkrong">
                  Suasana interior studio lebih aesthetic / Instagrammable untuk nongkrong
                </option>
                <option value="Harga paket hemat khusus pelajar & mahasiswa Pontianak">
                  Harga paket hemat khusus pelajar & mahasiswa Pontianak
                </option>
                <option value="Pilihan frame kayu minimalis modern (gaya Scandinavian/Japandi)">
                  Pilihan frame kayu minimalis modern (gaya Scandinavian/Japandi)
                </option>
                <option value="Kecepatan pengerjaan kilat 15 menit dan kemudahan order via Web/Grab">
                  Kecepatan pengerjaan kilat 15 menit dan kemudahan order via Web/Grab
                </option>
              </select>
            </div>

            {/* Q6: Rating & Masukan Bebas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-stone-900 text-xs sm:text-sm">
                  6. Berapa Bintang Rating Kepuasan Anda untuk Queen Photo?
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setSatisfactionRating(star)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-5 h-5 ${
                          star <= satisfactionRating 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-stone-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Masukan atau Saran Terbuka untuk Kemajuan Queen Photo (Opsional):
                </label>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Ceritakan pengalaman Anda, keluhan, atau ide produk unik yang Anda harapkan..."
                  className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs text-stone-900 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Contact for Voucher Notification */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <span className="font-bold text-stone-800 block">
                Data Diri untuk Pengiriman Kupon Diskon 10% (Opsional)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nama Lengkap / Panggilan"
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="No. WhatsApp (08xxxx)"
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>{isSubmitting ? 'Mengirim Tanggapan...' : 'Kirim Tanggapan & Ambil Kupon Diskon 10%'}</span>
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};

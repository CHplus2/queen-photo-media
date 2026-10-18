import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { useDialog } from '../hooks/useDialog';
import type { AgeDemographic } from '../types';
import { X, Check, ArrowRight, LoaderCircle } from 'lucide-react';
export const CustomerSurveyModal: React.FC = () => {
  const { isSurveyModalOpen, setIsSurveyModalOpen, submitSurvey } = useStudio();
  const [age, setAge] = useState<AgeDemographic | ''>('');
  const [need, setNeed] = useState('');
  const [frequency, setFrequency] = useState('');
  const [priority, setPriority] = useState('');
  const [rating, setRating] = useState('');
  const [feedback, setFeedback] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const close = () => {
    if (!busy) {
      setIsSurveyModalOpen(false);
      setCode('');
      setError('');
    }
  };
  const ref = useDialog<HTMLElement>(isSurveyModalOpen, close);
  if (!isSurveyModalOpen) return null;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!age) return;
    setBusy(true);
    setError('');
    try {
      const result = await submitSurvey({
        customerName: name.trim() || undefined,
        ageBracket: age,
        primaryNeed: need,
        pastPrintingComparison: frequency,
        demandedNewServices: [],
        improvementPriority: priority,
        satisfactionRating: Number(rating),
        feedbackText: feedback.trim() || undefined,
      });
      setCode(result);
    } catch {
      setError('Masukan belum tersimpan. Coba kembali saat koneksi tersedia.');
    } finally {
      setBusy(false);
    }
  };
  const choices = (
    id: string,
    label: string,
    value: string,
    set: (s: string) => void,
    options: string[],
  ) => (
    <div>
      <label className="qp-label" htmlFor={id}>
        {label}
      </label>
      <select
        className="qp-field"
        id={id}
        value={value}
        onChange={(e) => set(e.target.value)}
        required
      >
        <option value="" disabled>
          Pilih jawaban
        </option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
  return (
    <div
      className="qp-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="survey-title"
        className="qp-dialog"
      >
        <div className="qp-dialog-header">
          <div>
            <span className="qp-eyebrow">Suara pelanggan</span>
            <h2 id="survey-title" className="text-2xl mt-2">
              {code
                ? 'Terima kasih atas masukannya.'
                : 'Bantu studio tumbuh lebih baik.'}
            </h2>
          </div>
          <button
            aria-label="Tutup survei"
            disabled={busy}
            className="qp-icon-button"
            onClick={close}
          >
            <X size={20} />
          </button>
        </div>
        <div className="qp-dialog-content">
          {code ? (
            <div className="text-center space-y-5">
              <Check size={36} className="mx-auto" />
              <p className="text-sm text-stone-600">
                Gunakan kode berikut untuk diskon 10% saat checkout.
              </p>
              <p className="qp-notice font-mono text-xl text-stone-900">
                {code}
              </p>
              <button className="qp-button w-full" onClick={close}>
                Kembali ke website
              </button>
            </div>
          ) : (
            <form id="survey-form" onSubmit={submit} className="space-y-5">
              <p className="text-sm text-stone-600">
                Sekitar 2 menit. Jawaban Anda membantu kami memilih layanan yang
                benar-benar dibutuhkan. Dapatkan kode diskon 10% setelah
                mengirim.
              </p>
              <fieldset disabled={busy} className="space-y-5">
                <legend className="sr-only">Masukan pelanggan</legend>
                {choices(
                  'survey-age',
                  'Rentang usia',
                  age,
                  (v) => setAge(v as AgeDemographic),
                  ['<20', '20-29', '30-45', '>45'],
                )}
                {choices(
                  'survey-need',
                  'Layanan yang paling Anda butuhkan',
                  need,
                  setNeed,
                  [
                    'Cetak foto',
                    'Pas foto / dokumen',
                    'Photostrip / mini prints',
                    'Sesi foto studio',
                    'Restorasi / edit foto',
                    'Hadiah / album',
                    'Banner / desain',
                  ],
                )}
                {choices(
                  'survey-frequency',
                  'Seberapa sering Anda mencetak foto?',
                  frequency,
                  setFrequency,
                  [
                    'Belum pernah',
                    'Kurang dari sekali setahun',
                    'Beberapa kali setahun',
                    'Setiap bulan atau lebih',
                  ],
                )}
                {choices(
                  'survey-priority',
                  'Hal yang paling perlu kami tingkatkan',
                  priority,
                  setPriority,
                  [
                    'Hasil foto / cetak',
                    'Kejelasan harga',
                    'Kecepatan layanan',
                    'Pilihan paket',
                    'Kemudahan memesan',
                    'Kenyamanan studio',
                  ],
                )}
                {choices(
                  'survey-rating',
                  'Penilaian pengalaman Anda',
                  rating,
                  setRating,
                  ['1', '2', '3', '4', '5'],
                )}
                <p className="text-xs text-stone-500 !mt-1">
                  1 = sangat kurang, 5 = sangat baik.
                </p>
                <div>
                  <label className="qp-label" htmlFor="survey-feedback">
                    Ide atau masukan lain (opsional)
                  </label>
                  <textarea
                    id="survey-feedback"
                    className="qp-field"
                    rows={3}
                    maxLength={2000}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>
                <div>
                  <label className="qp-label" htmlFor="survey-name">
                    Nama (opsional)
                  </label>
                  <input
                    id="survey-name"
                    className="qp-field"
                    autoComplete="name"
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </fieldset>
              {error && (
                <p className="qp-error" role="alert">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
        {!code && (
          <div className="qp-dialog-footer">
            <button
              form="survey-form"
              type="submit"
              className="qp-button w-full"
              disabled={busy}
            >
              {busy ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Mengirim…
                </>
              ) : (
                <>
                  Kirim masukan <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

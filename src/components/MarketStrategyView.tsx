import { tr } from '../i18n/runtime';
import React from 'react';
import { useStudio } from '../context/StudioContext';
export const MarketStrategyView: React.FC = () => {
  const { surveys, setIsSurveyModalOpen } = useStudio();
  const average = surveys.length
    ? surveys.reduce((n, s) => n + s.satisfactionRating, 0) / surveys.length
    : null;
  const needs = new Map<string, number>();
  for (const survey of surveys)
    needs.set(survey.primaryNeed, (needs.get(survey.primaryNeed) || 0) + 1);
  return (
    <div className="qp-container py-8 space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-start">
        <div>
          <span className="qp-eyebrow">{tr('Riset pelanggan')}</span>
          <h1 className="text-3xl !font-sans font-semibold mt-2">
            {tr('Masukan pelanggan')}
          </h1>
          <p className="text-stone-600 mt-3 max-w-2xl">
            {tr(
              'Gunakan jawaban nyata untuk menguji penawaran. Usia pelanggan saja tidak menentukan layanan yang ingin mereka beli.',
            )}
          </p>
        </div>
        <button
          className="qp-button"
          onClick={() => setIsSurveyModalOpen(true)}
        >
          {tr('Buka survei pelanggan')}
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <article className="qp-panel p-5">
          <h2 className="qp-label">{tr('Jumlah jawaban')}</h2>
          <strong className="text-3xl">{surveys.length}</strong>
        </article>
        <article className="qp-panel p-5">
          <h2 className="qp-label">{tr('Rata-rata penilaian')}</h2>
          <strong className="text-3xl">
            {average === null
              ? tr('Belum ada data')
              : average.toFixed(1) + ' / 5'}
          </strong>
        </article>
      </div>
      {!surveys.length ? (
        <p className="qp-notice">
          {tr(
            'Belum ada jawaban survei. Jangan menganggap kebutuhan atau anggaran pelanggan sudah diketahui sebelum mengumpulkan data.',
          )}
        </p>
      ) : (
        <>
          <section className="qp-panel p-5">
            <h2 className="text-xl !font-sans font-semibold">
              {tr('Layanan yang dibutuhkan')}
            </h2>
            <ul className="divide-y divide-stone-200">
              {[...needs]
                .sort((a, b) => b[1] - a[1])
                .map(([label, count]) => (
                  <li key={label} className="flex justify-between gap-4 py-3">
                    <span>{tr(label)}</span>
                    <strong>{count}</strong>
                  </li>
                ))}
            </ul>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl !font-sans font-semibold">
              {tr('Suara pelanggan')}
            </h2>
            {surveys.map((survey) => (
              <article className="qp-panel p-5 space-y-2" key={survey.id}>
                <p className="font-semibold">
                  {survey.customerName || tr('Pelanggan Anonim')}
                </p>
                <p className="text-sm">
                  {tr('Usia:')} {survey.ageBracket} {tr('· Penilaian:')}{' '}
                  {survey.satisfactionRating}/5
                </p>
                <p>{tr(survey.primaryNeed)}</p>
                {survey.feedbackText && (
                  <p className="text-stone-600 whitespace-pre-wrap">
                    {survey.feedbackText}
                  </p>
                )}
              </article>
            ))}
          </section>
        </>
      )}
      <p className="text-sm text-stone-600">
        {tr(
          'Jawaban survei mewakili orang yang mengisi formulir, bukan seluruh pasar Pontianak. Bandingkan dengan transaksi toko dan uji penawaran kecil sebelum berinvestasi.',
        )}
      </p>
    </div>
  );
};

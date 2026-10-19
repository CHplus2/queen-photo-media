import { tr } from '../i18n/runtime';
import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { closeCashDrawer } from '../lib/staffOperations';
import { formatRupiah } from '../utils/formatters';
import type { Order } from '../types';
export function CashClosing({
  day,
  payments,
  connected,
}: {
  day: string;
  payments: Order[];
  connected: boolean;
}) {
  const [opening, setOpening] = useState('');
  const [cashOut, setCashOut] = useState('0');
  const [counted, setCounted] = useState('');
  const [note, setNote] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [closing, setClosing] = useState<{
    receipts: number;
    expected: number;
    counted: number;
    difference: number;
    by: { name: string };
    receiptIds: string[];
  } | null>(null);
  const [ready, setReady] = useState(false);
  const cash = payments.filter((p) => p.paymentMethod === 'TUNAI_KASIR');
  const receipts = cash.reduce((n, p) => n + p.totalAmount, 0);
  const expected = Number(opening) + receipts - Number(cashOut);
  useEffect(() => {
    setReady(false);
    setOpening('');
    setCashOut('0');
    setCounted('');
    setNote('');
    setClosing(null);
    setError('');
    setConfirmed(false);
    return onSnapshot(
      doc(db, 'cash_closings', day),
      (s) => {
        setClosing(s.exists() ? (s.data() as typeof closing) : null);
        setReady(true);
      },
      () => {
        setReady(false);
        setError(
          'Tutup kas belum tersedia. Periksa koneksi dan publikasi aturan database.',
        );
      },
    );
  }, [day]);
  const changed =
    closing &&
    (closing.receipts !== receipts ||
      JSON.stringify([...closing.receiptIds].sort()) !==
        JSON.stringify(cash.map((p) => p.id).sort()));
  return (
    <section className="qp-panel p-5 space-y-4">
      <h2 className="!font-sans text-xl font-semibold">
        {tr('Tutup kas ·')} {day}
      </h2>
      <p className="text-sm text-stone-600">
        {tr(
          'Satu laci kas bersama per hari. Hentikan pencatatan transaksi sebentar saat menghitung uang. QRIS dan transfer tidak masuk hitungan laci.',
        )}
      </p>
      {closing ? (
        <div className="qp-notice space-y-2">
          <p>
            {tr('Dicatat oleh')} {closing.by.name}
          </p>
          <p>
            {tr('Kas seharusnya')} {formatRupiah(closing.expected)}{' '}
            {tr('· Uang dihitung')} {formatRupiah(closing.counted)}
          </p>
          <strong>
            {tr('Selisih')} {formatRupiah(closing.difference)}
          </strong>
          {changed && (
            <p role="alert">
              {tr(
                'Ada transaksi berubah setelah penutupan. Hasil ini perlu diperiksa penanggung jawab; jangan dianggap saldo terkini.',
              )}
            </p>
          )}
        </div>
      ) : (
        <details>
          <summary className="cursor-pointer py-2">
            {tr('Hitung uang & tutup kas hari ini')}
          </summary>
          <form
            className="space-y-4 mt-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (busy || !confirmed || !connected || !ready) return;
              setBusy(true);
              setError('');
              try {
                await closeCashDrawer({
                  day,
                  opening: Number(opening),
                  receipts,
                  cashOut: Number(cashOut),
                  counted: Number(counted),
                  receiptIds: cash.map((p) => p.id),
                  note,
                });
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Belum tersimpan.');
              } finally {
                setBusy(false);
              }
            }}
          >
            <fieldset disabled={busy} className="space-y-4">
              {[
                ['Uang awal laci (Rp)', opening, setOpening],
                [
                  'Pengeluaran / refund tunai hari ini (Rp)',
                  cashOut,
                  setCashOut,
                ],
                ['Uang tunai yang dihitung sekarang (Rp)', counted, setCounted],
              ].map(([label, value, setter]) => (
                <label className="block" key={String(label)}>
                  <span className="qp-label">{tr(String(label))}</span>
                  <input
                    className="qp-field"
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={value as string}
                    onChange={(e) =>
                      (setter as (s: string) => void)(e.target.value)
                    }
                  />
                </label>
              ))}
              <label className="block">
                <span className="qp-label">
                  {tr('Catatan pengeluaran / selisih')}
                </span>
                <input
                  className="qp-field"
                  maxLength={1000}
                  required={Number(cashOut) > 0}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
              <p>
                {tr('Tunai masuk tercatat')} {formatRupiah(receipts)}
              </p>
              <p>
                {tr('Kas seharusnya')} {formatRupiah(expected)}
              </p>
              {counted !== '' && (
                <p className="qp-notice">
                  {tr('Selisih')} {formatRupiah(Number(counted) - expected)}
                </p>
              )}
              <label className="flex gap-3 text-sm">
                <input
                  type="checkbox"
                  required
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                {tr(
                  'Semua penjualan sudah dicatat dan uang sudah dihitung. Ini hanya laporan; tidak memotong uang atau mencatat refund lagi.',
                )}
              </label>
              <button
                className="qp-button"
                disabled={!confirmed || !connected || !ready || busy}
              >
                {busy ? tr('Menyimpan…') : tr('Simpan tutup kas')}
              </button>
            </fieldset>
          </form>
        </details>
      )}
      {error && (
        <p role="alert" className="qp-error">
          {tr(error)}
        </p>
      )}
    </section>
  );
}

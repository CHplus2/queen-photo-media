import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { formatRupiah } from '../utils/formatters';
import {
  Calculator,
  Layers,
  HelpCircle,
  Save,
  Sliders,
  CheckCircle2,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export const CostProfitCalculatorView: React.FC = () => {
  const { rollConfigs, sheetConfigs, updateRollConfig, updateSheetConfig } =
    useStudio();

  // Active calculator mode
  const [activeTab, setActiveTab] = useState<'roll' | 'sheet' | 'simulator'>(
    'roll',
  );

  // Selected roll config
  const [selectedRollId, setSelectedRollId] = useState(rollConfigs[0].id);
  const currentRoll =
    rollConfigs.find((r) => r.id === selectedRollId) || rollConfigs[0];

  // Roll calculator interactive inputs
  const [rollCost, setRollCost] = useState(currentRoll.rollCostIdr);
  const [rollLength, setRollLength] = useState(currentRoll.rollLengthMeter);
  const [rollWidth, setRollWidth] = useState(currentRoll.rollWidthCm);
  const [inkCostPerM2, setInkCostPerM2] = useState(
    currentRoll.inkCostPerSqMeter,
  );
  const [overheadPerUnit, setOverheadPerUnit] = useState(
    currentRoll.overheadPerUnit,
  );

  // Custom print job simulation on roll
  const [customPrintWidthCm, setCustomPrintWidthCm] = useState(15.2); // e.g. 4R height
  const [customPrintLengthCm, setCustomPrintLengthCm] = useState(10.2); // e.g. 4R width
  const [customSellingPrice, setCustomSellingPrice] = useState(5000);
  const [customPrintQuantity, setCustomPrintQuantity] = useState(25);

  // Sheet config inputs
  const [selectedSheetId, setSelectedSheetId] = useState(sheetConfigs[0].id);
  const currentSheet =
    sheetConfigs.find((s) => s.id === selectedSheetId) || sheetConfigs[0];
  const [sheetPaperCost, setSheetPaperCost] = useState(
    currentSheet.costPerSheetIdr,
  );
  const [sheetInkCost, setSheetInkCost] = useState(currentSheet.inkCostIdr);
  const [sheetOverhead, setSheetOverhead] = useState(currentSheet.overheadIdr);
  const [sheetSellPrice, setSheetSellPrice] = useState(5000);

  // Calculation Math for Roll
  const rollAreaM2 = (rollWidth / 100) * rollLength; // Total meter persegi roll
  const paperCostPerM2 = rollAreaM2 > 0 ? rollCost / rollAreaM2 : 0;

  // Custom job math on roll
  const singleJobAreaM2 =
    (customPrintWidthCm / 100) * (customPrintLengthCm / 100);
  const singleJobPaperCost = singleJobAreaM2 * paperCostPerM2;
  const singleJobInkCost = singleJobAreaM2 * inkCostPerM2;
  const singleJobHpp = Math.round(
    singleJobPaperCost + singleJobInkCost + overheadPerUnit,
  );
  const singleJobProfit = customSellingPrice - singleJobHpp;
  const singleJobMarginPct =
    customSellingPrice > 0
      ? Math.round((singleJobProfit / customSellingPrice) * 100)
      : 0;

  // Total batch math
  const batchHpp = singleJobHpp * customPrintQuantity;
  const batchRevenue = customSellingPrice * customPrintQuantity;
  const batchProfit = batchRevenue - batchHpp;

  // Max yield of prints per roll
  const printsPerRoll =
    customPrintLengthCm > 0
      ? Math.floor((rollLength * 100) / customPrintLengthCm)
      : 0;
  const totalPotentialProfitPerRoll = printsPerRoll * singleJobProfit;

  // Sheet Math
  const sheetTotalHpp = sheetPaperCost + sheetInkCost + sheetOverhead;
  const sheetProfit = sheetSellPrice - sheetTotalHpp;
  const sheetMarginPct =
    sheetSellPrice > 0 ? Math.round((sheetProfit / sheetSellPrice) * 100) : 0;

  return (
    <div className="py-10 max-w-6xl mx-auto px-6 space-y-8">
      {/* Header */}
      <div className="space-y-1 pb-6 border-b border-stone-200">
        <p className="text-amber-800 text-xs font-semibold uppercase tracking-wider">
          Kalkulator HPP & Laba Queen Photo
        </p>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
          Kalkulasi Otomatis Laba Kertas Roll vs Lembaran
        </h2>
        <p className="text-stone-600 text-xs sm:text-sm max-w-3xl">
          Menjawab tantangan perhitungan kertas roll Minilab & Plotter: Sistem
          ini membagi harga 1 gulungan roll ke dalam satuan luas (cm² / m²) dan
          lembaran cetak secara presisi, sehingga pemilik studio tahu pasti laba
          bersih setiap pesanan.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('roll')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'roll'
              ? 'bg-stone-900 text-stone-50'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          1. Kertas Roll (Minilab, Kanvas & Plotter)
        </button>
        <button
          onClick={() => setActiveTab('sheet')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'sheet'
              ? 'bg-stone-900 text-stone-50'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          2. Kertas Lembaran (Sheet 4R / 10R / A4)
        </button>
      </div>

      {/* TAB 1: ROLL PAPER CALCULATOR */}
      {activeTab === 'roll' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: Parameter Roll Kertas */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm">
                Spesifikasi & Harga Pembelian Roll
              </h3>
              <select
                aria-label="Jenis roll kertas"
                value={selectedRollId}
                onChange={(e) => {
                  setSelectedRollId(e.target.value);
                  const found = rollConfigs.find(
                    (r) => r.id === e.target.value,
                  );
                  if (found) {
                    setRollCost(found.rollCostIdr);
                    setRollLength(found.rollLengthMeter);
                    setRollWidth(found.rollWidthCm);
                    setInkCostPerM2(found.inkCostPerSqMeter);
                    setOverheadPerUnit(found.overheadPerUnit);
                  }
                }}
                className="text-xs border border-stone-200 rounded-md px-2 py-1 bg-stone-50"
              >
                {rollConfigs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label
                  className="block text-stone-600 font-medium mb-1"
                  htmlFor="costprofitcalculatorview-field-1"
                >
                  Harga Beli 1 Roll (Rp):
                </label>
                <input
                  id="costprofitcalculatorview-field-1"
                  type="number"
                  value={rollCost}
                  onChange={(e) => setRollCost(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 tabular-nums font-bold"
                />
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  Contoh: Rp 420.000 / roll Minilab
                </span>
              </div>

              <div>
                <label
                  className="block text-stone-600 font-medium mb-1"
                  htmlFor="costprofitcalculatorview-field-2"
                >
                  Panjang Roll (Meter):
                </label>
                <input
                  id="costprofitcalculatorview-field-2"
                  type="number"
                  value={rollLength}
                  onChange={(e) => setRollLength(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 tabular-nums"
                />
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  Contoh: 65 meter
                </span>
              </div>

              <div>
                <label
                  className="block text-stone-600 font-medium mb-1"
                  htmlFor="costprofitcalculatorview-field-3"
                >
                  Lebar Roll (cm):
                </label>
                <input
                  id="costprofitcalculatorview-field-3"
                  type="number"
                  value={rollWidth}
                  onChange={(e) => setRollWidth(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 tabular-nums"
                />
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  6 inch = 15.2 cm
                </span>
              </div>

              <div>
                <label
                  className="block text-stone-600 font-medium mb-1"
                  htmlFor="costprofitcalculatorview-field-4"
                >
                  Estimasi Tinta per m² (Rp):
                </label>
                <input
                  id="costprofitcalculatorview-field-4"
                  type="number"
                  value={inkCostPerM2}
                  onChange={(e) => setInkCostPerM2(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 tabular-nums"
                />
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  Tinta kimia/solvent per m²
                </span>
              </div>
            </div>

            {/* Test Job Config */}
            <div className="pt-4 border-t border-stone-100 space-y-4">
              <h4 className="font-bold text-stone-900 text-xs">
                Simulasi Ukuran Foto yang Dicetak dari Roll:
              </h4>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label
                    className="block text-stone-600 font-medium mb-1"
                    htmlFor="costprofitcalculatorview-field-5"
                  >
                    Lebar Potongan Cetak (cm):
                  </label>
                  <input
                    id="costprofitcalculatorview-field-5"
                    type="number"
                    value={customPrintWidthCm}
                    onChange={(e) =>
                      setCustomPrintWidthCm(Number(e.target.value))
                    }
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 tabular-nums"
                  />
                </div>

                <div>
                  <label
                    className="block text-stone-600 font-medium mb-1"
                    htmlFor="costprofitcalculatorview-field-6"
                  >
                    Panjang Potongan Cetak (cm):
                  </label>
                  <input
                    id="costprofitcalculatorview-field-6"
                    type="number"
                    value={customPrintLengthCm}
                    onChange={(e) =>
                      setCustomPrintLengthCm(Number(e.target.value))
                    }
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 tabular-nums"
                  />
                </div>

                <div>
                  <label
                    className="block text-stone-600 font-medium mb-1"
                    htmlFor="costprofitcalculatorview-field-7"
                  >
                    Harga Jual per Lembar (Rp):
                  </label>
                  <input
                    id="costprofitcalculatorview-field-7"
                    type="number"
                    value={customSellingPrice}
                    onChange={(e) =>
                      setCustomSellingPrice(Number(e.target.value))
                    }
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 tabular-nums font-bold text-stone-900"
                  />
                </div>

                <div>
                  <label
                    className="block text-stone-600 font-medium mb-1"
                    htmlFor="costprofitcalculatorview-field-8"
                  >
                    Jumlah Pesanan (Lembar):
                  </label>
                  <input
                    id="costprofitcalculatorview-field-8"
                    type="number"
                    value={customPrintQuantity}
                    onChange={(e) =>
                      setCustomPrintQuantity(Number(e.target.value))
                    }
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 tabular-nums"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                updateRollConfig(selectedRollId, {
                  rollCostIdr: rollCost,
                  rollLengthMeter: rollLength,
                  rollWidthCm: rollWidth,
                  inkCostPerSqMeter: inkCostPerM2,
                  overheadPerUnit,
                });
                alert('Konfigurasi Roll berhasil disimpan ke database lokal!');
              }}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Konfigurasi Roll Ini</span>
            </button>
          </div>

          {/* Right Cards: Direct Mathematical Breakdown & Profit Output */}
          <div className="lg:col-span-6 space-y-5">
            {/* Direct Unit Result Card */}
            <div className="bg-stone-900 text-stone-100 p-6 rounded-2xl border border-stone-800 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
                  Hasil Perhitungan per Lembar Cetak
                </span>
                <span className="tabular-nums text-xs bg-stone-800 px-2 py-0.5 rounded text-amber-200">
                  {customPrintWidthCm} x {customPrintLengthCm} cm
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-xs text-stone-300 block">
                    HPP Kertas (dari Roll):
                  </span>
                  <span className="tabular-nums text-base font-bold text-stone-200">
                    {formatRupiah(Math.round(singleJobPaperCost))}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-300 block">
                    Biaya Tinta & Listrik:
                  </span>
                  <span className="tabular-nums text-base font-bold text-stone-200">
                    {formatRupiah(
                      Math.round(singleJobInkCost + overheadPerUnit),
                    )}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-300 block">
                    Total HPP per Lembar:
                  </span>
                  <span className="tabular-nums text-xl font-bold text-rose-300">
                    {formatRupiah(singleJobHpp)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-300 block">
                    Laba Bersih per Lembar:
                  </span>
                  <span className="tabular-nums text-2xl font-bold text-emerald-400">
                    {formatRupiah(singleJobProfit)}
                    <span className="text-xs font-normal text-stone-300 font-sans ml-1">
                      ({singleJobMarginPct}%)
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Batch & Full Roll Yield Card */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Kapasitas Laba dari 1 Gulungan Roll Penuh</span>
              </h4>

              <div className="space-y-3 text-xs text-stone-600">
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span>Panjang roll: {rollLength} meter menghasilkan:</span>
                  <strong className="tabular-nums text-stone-900">
                    ~{printsPerRoll} lembar foto
                  </strong>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span>Total Omset Potensial jika 1 roll habis terjual:</span>
                  <strong className="tabular-nums text-stone-900">
                    {formatRupiah(printsPerRoll * customSellingPrice)}
                  </strong>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span>Total Biaya Modal (Roll + Tinta seluruhnya):</span>
                  <strong className="tabular-nums text-rose-600">
                    {formatRupiah(printsPerRoll * singleJobHpp)}
                  </strong>
                </div>
                <div className="flex justify-between py-2 text-sm font-bold text-emerald-700 bg-emerald-50 px-3 rounded-lg">
                  <span>Total Laba Bersih 1 Roll:</span>
                  <span className="tabular-nums text-base">
                    {formatRupiah(totalPotentialProfitPerRoll)}
                  </span>
                </div>
              </div>

              {/* Batch Order Preview */}
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs space-y-1">
                <p className="font-bold text-stone-900">
                  Ringkasan Pesanan Ini ({customPrintQuantity} Lembar):
                </p>
                <p className="text-stone-700">
                  Omset:{' '}
                  <span className="tabular-nums font-bold">
                    {formatRupiah(batchRevenue)}
                  </span>{' '}
                  · Total HPP:{' '}
                  <span className="tabular-nums font-bold">
                    {formatRupiah(batchHpp)}
                  </span>{' '}
                  · Laba Bersih Langsung:{' '}
                  <span className="tabular-nums font-bold text-emerald-800">
                    {formatRupiah(batchProfit)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SHEET PAPER CALCULATOR */}
      {activeTab === 'sheet' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm">
                Perhitungan Kertas Lembaran (Pieces)
              </h3>
              <select
                aria-label="Jenis kertas lembaran"
                value={selectedSheetId}
                onChange={(e) => {
                  setSelectedSheetId(e.target.value);
                  const found = sheetConfigs.find(
                    (s) => s.id === e.target.value,
                  );
                  if (found) {
                    setSheetPaperCost(found.costPerSheetIdr);
                    setSheetInkCost(found.inkCostIdr);
                    setSheetOverhead(found.overheadIdr);
                  }
                }}
                className="text-xs border border-stone-200 rounded-md px-2 py-1 bg-stone-50"
              >
                {sheetConfigs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.sizeName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label
                  className="block text-stone-600 font-medium mb-1"
                  htmlFor="costprofitcalculatorview-field-9"
                >
                  Harga Beli Kertas per Lembar:
                </label>
                <input
                  id="costprofitcalculatorview-field-9"
                  type="number"
                  value={sheetPaperCost}
                  onChange={(e) => setSheetPaperCost(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 tabular-nums"
                />
              </div>

              <div>
                <label
                  className="block text-stone-600 font-medium mb-1"
                  htmlFor="costprofitcalculatorview-field-10"
                >
                  Biaya Tinta per Lembar:
                </label>
                <input
                  id="costprofitcalculatorview-field-10"
                  type="number"
                  value={sheetInkCost}
                  onChange={(e) => setSheetInkCost(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 tabular-nums"
                />
              </div>

              <div>
                <label
                  className="block text-stone-600 font-medium mb-1"
                  htmlFor="costprofitcalculatorview-field-11"
                >
                  Listrik & Kemasan Plastik:
                </label>
                <input
                  id="costprofitcalculatorview-field-11"
                  type="number"
                  value={sheetOverhead}
                  onChange={(e) => setSheetOverhead(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 tabular-nums"
                />
              </div>

              <div>
                <label
                  className="block text-stone-600 font-medium mb-1"
                  htmlFor="costprofitcalculatorview-field-12"
                >
                  Harga Jual ke Pelanggan:
                </label>
                <input
                  id="costprofitcalculatorview-field-12"
                  type="number"
                  value={sheetSellPrice}
                  onChange={(e) => setSheetSellPrice(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 tabular-nums font-bold"
                />
              </div>
            </div>

            <button
              onClick={() => {
                updateSheetConfig(selectedSheetId, {
                  costPerSheetIdr: sheetPaperCost,
                  inkCostIdr: sheetInkCost,
                  overheadIdr: sheetOverhead,
                });
                alert('Konfigurasi Lembaran berhasil diperbarui!');
              }}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Parameter Kertas Lembaran</span>
            </button>
          </div>

          <div className="lg:col-span-6 bg-stone-900 text-stone-100 p-6 rounded-2xl border border-stone-800 shadow-md space-y-4">
            <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
              Hasil Margin Kertas Lembaran
            </span>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-xs text-stone-300 block">
                  Total HPP per Lembar:
                </span>
                <span className="tabular-nums text-xl font-bold text-rose-300">
                  {formatRupiah(sheetTotalHpp)}
                </span>
              </div>
              <div>
                <span className="text-xs text-stone-300 block">
                  Laba Bersih per Lembar:
                </span>
                <span className="tabular-nums text-2xl font-bold text-emerald-400">
                  {formatRupiah(sheetProfit)}
                </span>
                <span className="text-xs text-stone-300 block font-sans">
                  Margin: {sheetMarginPct}%
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-stone-800 text-xs text-stone-300 leading-relaxed">
              💡 <em>Contoh:</em> Pas foto resmi kilat dicetak di lembaran A4
              (bisa memuat hingga 18 pas foto). Dengan modal 1 lembar A4 ~Rp
              3.200 dan harga paket pas foto Rp 25.000, margin laba bersih
              studio mencapai <strong>&gt;85%</strong>!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

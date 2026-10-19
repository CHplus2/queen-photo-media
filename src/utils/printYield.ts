// A simple grid estimate: no cutting gap, border, setup loss or mixed orientations.
export function estimateRollYield(
  rollWidthCm: number,
  rollLengthMeter: number,
  printWidthCm: number,
  printLengthCm: number,
): number {
  const dimensions = [
    rollWidthCm,
    rollLengthMeter,
    printWidthCm,
    printLengthCm,
  ];
  if (!dimensions.every((v) => Number.isFinite(v) && v > 0)) return 0;
  const lengthCm = rollLengthMeter * 100;
  const normal =
    Math.floor(rollWidthCm / printWidthCm) *
    Math.floor(lengthCm / printLengthCm);
  const rotated =
    Math.floor(rollWidthCm / printLengthCm) *
    Math.floor(lengthCm / printWidthCm);
  const result = Math.max(normal, rotated);
  return Number.isSafeInteger(result) ? result : 0;
}

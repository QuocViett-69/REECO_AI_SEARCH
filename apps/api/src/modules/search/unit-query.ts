export function celsiusValue(value: string, unit: string): number | null {
  const number = Number(value.replace('−', '-').replace(',', '.'));
  if (!Number.isFinite(number)) return null;
  const name = unit.toLowerCase().replace(/°|\s|độ|degrees?|deg/gu, '');
  const converted = /^(?:f|℉|fahrenheit)$/u.test(name) ? (number - 32) * 5 / 9
    : /^(?:k|kelvin)$/u.test(name) ? number - 273.15 : number;
  return Math.round(converted * 1e9) / 1e9;
}

// Normalize only explicit units: bare numbers never become engineering requirements.
export function normalizeEngineeringUnits(text: string): string {
  const units: Record<string, [number, string]> = {
    hz: [1, 'hz'], khz: [1000, 'hz'], mhz: [1e6, 'hz'],
    v: [1, 'v'], mv: [0.001, 'v'], vdc: [1, 'vdc'], mvdc: [0.001, 'vdc'],
    a: [1, 'a'], ma: [0.001, 'a'], ua: [1e-6, 'a'], 'µa': [1e-6, 'a'], 'μa': [1e-6, 'a'],
    w: [1, 'w'], mw: [0.001, 'w'],
    m: [1, 'm'], cm: [0.01, 'm'], mm: [0.001, 'm'],
    pa: [1, 'pa'], kpa: [1000, 'pa'], mpa: [1e6, 'pa'], bar: [1e5, 'pa'],
  };
  const unitPattern = String.raw`(?:mhz|khz|hz|mvdc|vdc|mv|v|[µμ]a|ua|ma|a|mw|w|cm|mm|m|mpa|kpa|pa|bar)`;
  const numberPattern = String.raw`[+−-]?\d+(?:[.,]\d+)?`;
  const convert = (value: string, unit: string) => {
    const [baseScale, canonical] = units[unit.toLowerCase()]!;
    let scale = baseScale;
    if (/^M(?:V(?:DC)?|A|W|m)$/u.test(unit)) scale = 1e6;
    if (unit === 'mPa') scale = 0.001;
    return `${Math.round(Number(value.replace('−', '-').replace(',', '.')) * scale * 1e9) / 1e9} ${canonical}`;
  };
  const ranges = text.replace(new RegExp(String.raw`(?<![\p{L}\p{N}.])(${numberPattern})\s*(${unitPattern})?\s*(?:to|đến|tới|[-–—])\s*(${numberPattern})\s*(${unitPattern})(?![\p{L}\p{N}])`, 'giu'),
    (_match, min: string, firstUnit: string | undefined, max: string, lastUnit: string) => `${convert(min, firstUnit ?? lastUnit)} to ${convert(max, lastUnit)}`);
  return ranges.replace(new RegExp(String.raw`(?<![\p{L}\p{N}.])(${numberPattern})\s*(${unitPattern})(?![\p{L}\p{N}])`, 'giu'), (_match, value: string, unit: string) => convert(value, unit));
}

import type { ProductSpecification } from '@reeco/shared';
import { normalizeEngineeringUnits } from './unit-query';

export const normalizeSpecificationText = (text: string): string => normalizeEngineeringUnits(text.normalize('NFKC'))
  .toLowerCase().replace(/−/gu, '-').replace(/(?<=\d),(?=\d)/gu, '.').replace(/°\s+([cf])/gu, '°$1').replace(/[‐‑–—_]/gu, ' ').replace(/-(?!\d)|(?<=[\p{L}\p{N}])-/gu, ' ').replace(/\s+/gu, ' ').trim();

// shortcut: exact values and covering intervals; accuracy tolerances and inequalities need quantity-specific rules.
export function specificationTerms(query: string): string[] {
  let text = normalizeSpecificationText(query);
  for (const constraint of specificationConstraints(query)) text = text.replace(constraint.fragment, ' ');
  return [...new Set([
    ...text.matchAll(/\bip\d{2}[a-z]?\b|\bcan\s*bus\b|\bthermistor\b|(?<![\p{L}\p{N}.])[+-]?\d+(?:\.\d+)?\s*(?:hz|vdc|v|a|w|m|pa)(?![\p{L}\p{N}])(?:\s+to\s+[+-]?\d+(?:\.\d+)?\s*(?:hz|vdc|v|a|w|m|pa)(?![\p{L}\p{N}]))?|\b\d+(?:\.\d+)?\s*(?:aa|bits?\b(?:\s*adc\b)?)|\b\d+(?:\.\d+)?\s*%/gu),
  ].map(match => match[0].replace(/\bbits\b/gu, 'bit').replace(/\bcan\s+bus\b/gu, 'canbus')))];
}

const fold = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/gu, '').replace(/đ/gu, 'd');
// shortcut: reviewed field aliases, not arbitrary spec names; extend this list with catalog evidence.
const fields = [
  { label: 'Điện áp nguồn', aliases: 'dien ap (?:nguon|cap|dau vao)|(?:supply|input|operating) voltage(?: range)?', keys: /^(?:supply_voltage(?:_range)?|input_voltage(?:_range)?|voltage|voltage_supply.*|power_supply_requirements|power_requirements)$/u, hints: ['voltage', 'power_supply', 'power_requirements'] },
  { label: 'Điện áp đầu ra', aliases: 'dien ap dau ra|output voltage', keys: /^(?:output_voltage|voltage_output)(?:_(?:high|low|range))?$/u, hints: ['voltage'] },
  { label: 'Dòng đầu ra', aliases: '(?:dong|tin hieu dong)(?: dien)? dau ra|(?:current|analog) output', keys: /^(?:current_output|output_current|analog_output|output)(?:_.*)?$/u, hints: ['output'] },
  { label: 'Dòng đầu vào', aliases: '(?:dong(?: dien)? dau vao|dau vao dong(?: dien)?)|current(?: loop)? input', keys: /^(?:analog_inputs|current_loop(?:_.*)?|current_inputs)$/u, hints: ['analog_inputs', 'current_loop', 'current_inputs'] },
  { label: 'Dòng tiêu thụ', aliases: 'dong(?: dien)? tieu thu|current consumption|current drain', keys: /current_consumption|current_drain|idle_current|active_current|average_current|low_power_mode/u, hints: ['current', 'low_power'] },
  { label: 'Công suất tiêu thụ', aliases: 'cong suat tieu thu|power consumption', keys: /^(?:power|power_consumption(?:_.*)?|power_requirements)$/u, hints: ['power'] },
  { label: 'Dải áp suất', aliases: '(?:dai (?:do )?)?ap suat|pressure(?: measurement)? range', keys: /pressure.*range|range.*pressure/u, hints: ['pressure', 'range'] },
  { label: 'Dải tốc độ gió', aliases: '(?:dai (?:do )?)?toc do gio|wind speed(?: range)?', keys: /^(?:horizontal_)?wind_speed_range$/u, hints: ['wind_speed'] },
  { label: 'Dải độ ẩm vận hành', aliases: 'do am (?:hoat dong|van hanh)|operating humidity range', keys: /^operating_humidity_range$/u, hints: ['operating_humidity'] },
  { label: 'Dải độ ẩm', aliases: 'dai (?:do )?do am(?: tuong doi)?|(?:relative )?humidity range', keys: /^(?!operating|storage).*humidity.*range/u, hints: ['humidity'] },
  { label: 'Tần số lấy mẫu', aliases: 'tan so lay mau|sampling frequency|sample rate|scan rate', keys: /^(?:sampling_frequency|sample_rate|sampling_rate|scan_rate)$/u, hints: ['sampling', 'sample_rate', 'scan_rate'] },
  { label: 'Tần số', aliases: '(?:dai (?:do )?)?tan so|(?:excitation |sampling |vibrating wire )?frequency(?: range)?', keys: /^(?:(?:excitation|vibrating_wire|measurement|sampling|output|default_output)_)?frequency(?:_range)?$/u, hints: ['frequency'] },
  { label: 'Tốc độ truyền', aliases: 'toc do truyen(?: du lieu)?|baud rate|data rate', keys: /baud|data_rate|transmission_rate/u, hints: ['baud', 'data_rate', 'transmission_rate'] },
  { label: 'Độ chính xác', aliases: 'do chinh xac|sai so|accuracy|uncertainty', keys: /accuracy|uncertainty/u, hints: ['accuracy', 'uncertainty'] },
  { label: 'Độ phân giải', aliases: 'do phan giai|(?:adc |measurement |basic )?resolution', keys: /resolution/u, hints: ['resolution'] },
  { label: 'Bộ nhớ lưu dữ liệu', aliases: 'bo nho (?:luu (?:tru )?)?du lieu|data (?:storage(?: memory)?|memory)', keys: /^(?:data_storage_memory|data_memory|memory_data_storage)$/u, hints: ['data_storage', 'data_memory', 'memory_data_storage'] },
  { label: 'Bộ nhớ USB', aliases: 'bo nho usb|usb memory', keys: /^usb_memory$/u, hints: ['usb_memory'] },
  { label: 'Bộ nhớ hệ thống', aliases: 'bo nho he thong|(?:operating system|system) memory', keys: /^(?:operating_system_memory|system_memory)$/u, hints: ['system_memory'] },
  { label: 'Bộ nhớ', aliases: '(?:dung luong )?bo nho|memory', keys: /memory|data_storage/u, hints: ['memory', 'data_storage'] },
  { label: 'Cấp bảo vệ', aliases: '(?:cap (?:bao ve|chong nuoc)|chuan (?:bao ve|chong nuoc)|ingress protection(?: rating)?|ip rating)', keys: /ingress_protection|ip_rating|protection_rating/u, hints: ['protection', 'ip_rating'] },
  { label: 'Khối lượng', aliases: 'khoi luong|trong luong|weight|mass', keys: /weight|mass/u, hints: ['weight', 'mass'] },
];

const amount = String.raw`[+\-−]?\d+(?:\.\d+)?\s*(?:%rh|%|w/m2|m/s|mm/h|bytes|bps|bit|vdc|vac|hz|pa|kg|°c|°f|v|a|w|m|s)(?![\p{L}\p{N}/])`;
const valuePattern = new RegExp(String.raw`^\s*[:=]?\s*(<=|>=|≤|≥|<|>|khong qua|toi da|toi thieu|it nhat|at most|at least)?\s*(±)?\s*(${amount}(?:\s+to\s+${amount})?|ip\d{2}[a-z]?)(?![\p{L}\p{N}])`, 'u');

export function specificationConstraints(query: string) {
  const text = normalizeSpecificationText(query);
  const normalized = fold(text);
  const matches = fields.flatMap(field => [...normalized.matchAll(new RegExp(`(?<![\\p{L}\\p{N}])(?:${field.aliases})(?![\\p{L}\\p{N}])`, 'gu'))]
    .flatMap(match => {
      const value = valuePattern.exec(normalized.slice(match.index + match[0].length));
      if (!value) return [];
      if (/^\s*adc\b/u.test(normalized.slice(match.index + match[0].length + value[0].length))) return [];
      const operator = /^(?:<=|≤|khong qua|toi da|at most)$/u.test(value[1] ?? '') ? 'lte'
        : /^(?:>=|≥|toi thieu|it nhat|at least)$/u.test(value[1] ?? '') ? 'gte' : value[1] === '<' ? 'lt' : value[1] === '>' ? 'gt' : 'eq';
      return [{ field, operator, value: value[3]!, tolerance: !!value[2], fragment: text.slice(match.index, match.index + match[0].length + value[0].length), index: match.index }];
    })).sort((a, b) => a.index - b.index || b.fragment.length - a.fragment.length);
  return matches.filter((match, index) => !matches.slice(0, index).some(previous => previous.index + previous.fragment.length > match.index));
}

export type SpecificationConstraint = ReturnType<typeof specificationConstraints>[number];

const englishLabels: Record<string, string> = {
  'Điện áp nguồn': 'Supply voltage', 'Điện áp đầu ra': 'Output voltage', 'Dòng đầu ra': 'Output current', 'Dòng đầu vào': 'Input current',
  'Dòng tiêu thụ': 'Current consumption', 'Công suất tiêu thụ': 'Power consumption', 'Dải áp suất': 'Pressure range', 'Dải tốc độ gió': 'Wind speed range',
  'Dải độ ẩm vận hành': 'Operating humidity range', 'Dải độ ẩm': 'Humidity range', 'Tần số lấy mẫu': 'Sampling frequency', 'Tần số': 'Frequency',
  'Tốc độ truyền': 'Data rate', 'Độ chính xác': 'Accuracy', 'Độ phân giải': 'Resolution', 'Bộ nhớ lưu dữ liệu': 'Data storage memory',
  'Bộ nhớ USB': 'USB memory', 'Bộ nhớ hệ thống': 'System memory', 'Bộ nhớ': 'Memory', 'Cấp bảo vệ': 'Ingress protection', 'Khối lượng': 'Weight',
};

export function specificationFieldLabel(key: string, vi: boolean): string {
  if (/operating_temperature/u.test(key)) return vi ? 'Dải nhiệt độ hoạt động' : 'Operating temperature range';
  if (/temperature.*range/u.test(key)) return vi ? 'Dải đo nhiệt độ' : 'Temperature measurement range';
  const field = fields.find(field => field.keys.test(key));
  return field ? vi ? field.label : englishLabels[field.label]! : vi ? 'Thông số kỹ thuật' : key.replace(/_/gu, ' ');
}

export function specificationRequirementLabel(constraint: SpecificationConstraint, vi: boolean): string {
  const operators: Record<string, string> = { eq: '', lte: '≤ ', lt: '< ', gte: '≥ ', gt: '> ' };
  return `${vi ? constraint.field.label : englishLabels[constraint.field.label]} ${operators[constraint.operator]}${constraint.tolerance ? '±' : ''}${constraint.value.replace(/\bto\b/gu, vi ? 'đến' : 'to').replace(/\bbytes\b/gu, vi ? 'byte' : 'bytes')}`;
}

function numericValue(text: string) {
  const match = new RegExp(`^(${amount})(?:\\s+to\\s+(${amount}))?$`, 'u').exec(normalizeSpecificationText(text));
  if (!match) return undefined;
  const parse = (value: string) => /^([+\-−]?\d+(?:\.\d+)?)\s*(.+)$/u.exec(value)!;
  const first = parse(match[1]!); const last = parse(match[2] ?? match[1]!);
  if (first[2] !== last[2] || Number(first[1]) > Number(last[1])) return undefined;
  return { min: Number(first[1]), max: Number(last[1]), unit: first[2]! };
}

export function matchSpecificationConstraints(constraints: SpecificationConstraint[], specifications: ProductSpecification[]) {
  const matches = [];
  for (const constraint of constraints) {
    const requested = numericValue(constraint.value);
    if (!requested && !/^ip\d{2}[a-z]?$/u.test(constraint.value)) return null;
    const isTolerance = /Độ chính xác|Độ phân giải/u.test(constraint.field.label);
    if (requested && constraint.tolerance && !isTolerance) requested.min = -Math.abs(requested.max);
    if (requested && /độ ẩm/u.test(constraint.field.label.toLowerCase())) requested.unit = requested.unit.replace('%rh', '%');
    const candidates = specifications.filter(spec => constraint.field.keys.test(spec.canonical_key)).flatMap(specification => {
      const normalized = specification.normalized_value;
      const raw = normalized.value_raw ?? (normalized.type === 'text' ? normalized.value : '');
      if (/\b(?:not support(?:ed)?|unsupported|not available|no support|cannot)\b/iu.test(raw)) return [];
      let candidateText = raw.split('|')[0]!.trim();
      let qualifier = /^[±<>≤≥]/u.exec(candidateText)?.[0] ?? '';
      if (qualifier) candidateText = candidateText.slice(qualifier.length).trim();
      if (normalized.type === 'number' && normalized.unit) {
        candidateText = `${normalized.value} ${normalized.unit}`;
        qualifier = normalized.qualifier ?? '';
      } else if (normalized.type === 'range') {
        if (normalized.min && normalized.max) candidateText = `${normalized.min.value} ${normalized.min.unit} to ${normalized.max.value} ${normalized.max.unit}`;
        else if (normalized.unit) candidateText = `${normalized.min_value} ${normalized.unit} to ${normalized.max_value} ${normalized.unit}`;
        qualifier = normalized.qualifier ?? '';
      }
      const candidate = numericValue(candidateText);
      if (candidate && qualifier === '±' && !isTolerance) candidate.min = -Math.abs(candidate.max);
      if (candidate && /độ ẩm/u.test(constraint.field.label.toLowerCase())) candidate.unit = candidate.unit.replace('%rh', '%');
      const unitLabels: Record<string, string> = { a: 'A', v: 'V', vdc: 'VDC', vac: 'VAC', hz: 'Hz', pa: 'Pa', w: 'W', bytes: 'byte', '°c': '°C', '°f': '°F' };
      const displayValue = candidate ? `${qualifier === '±' && !isTolerance ? '' : qualifier}${candidate.min === candidate.max ? candidate.min : `${candidate.min}–${candidate.max}`} ${unitLabels[candidate.unit] ?? candidate.unit}` : constraint.value;
      if (requested && candidate && requested.unit === candidate.unit && /^(?:|±|<|<=|≤|>|>=|≥)$/u.test(qualifier)) {
        const upperBound = /^(?:<|<=|≤)$/u.test(qualifier);
        const lowerBound = /^(?:>|>=|≥)$/u.test(qualifier);
        const exact = !upperBound && !lowerBound && requested.min === candidate.min && requested.max === candidate.max;
        const accepted = constraint.operator === 'lte' ? !lowerBound && candidate.max <= requested.max
          : constraint.operator === 'lt' ? !lowerBound && (candidate.max < requested.max || qualifier === '<' && candidate.max === requested.max)
          : constraint.operator === 'gte' ? !upperBound && candidate.min >= requested.min
          : constraint.operator === 'gt' ? !upperBound && (candidate.min > requested.min || qualifier === '>' && candidate.min === requested.min)
          : !upperBound && !lowerBound && candidate.min <= requested.min && candidate.max >= requested.max;
        if (accepted) return [{ constraint, specification, exact, value: raw || candidateText, displayValue }];
      }
      // Conditional prose is only an exact textual lookup, never proof of a numeric bound.
      if (constraint.operator !== 'eq' || qualifier && qualifier !== '±') return [];
      const value = normalizeSpecificationText(raw).replace(/±\s*/gu, '');
      if (value === constraint.value || value.startsWith(`${constraint.value} `) || value.startsWith(`${constraint.value} (`)) {
        return [{ constraint, specification, exact: true, value: raw, displayValue }];
      }
      const literalRange = constraint.value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
      if (requested && requested.min !== requested.max && constraint.field.label === 'Dòng đầu vào'
        && new RegExp(`(?<![\\p{L}\\p{N}.+\\-])${literalRange}(?![\\p{L}\\p{N}.])`, 'u').test(value)) {
        return [{ constraint, specification, exact: true, value: raw, displayValue }];
      }
      return [];
    }).sort((a, b) => Number(b.exact) - Number(a.exact));
    if (!candidates.length) return null;
    matches.push(candidates[0]!);
  }
  return matches;
}

export function specificationEvidence(terms: string[], specifications: ProductSpecification[]): ProductSpecification[] | null {
  const evidence: ProductSpecification[] = [];
  for (const term of terms) {
    const normalized = normalizeSpecificationText(term);
    const adc = /\bbit adc$/u.test(normalized);
    const pattern = normalized.replace(/ adc$/u, '').split(/\s+/u).map(word => word.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')).join('\\s*');
    const numeric = /^([+-]?\d+(?:\.\d+)?)\s*(hz|vdc|v|a|w|m|pa)(?:\s+to\s+([+-]?\d+(?:\.\d+)?)\s*(hz|vdc|v|a|w|m|pa))?$/u.exec(normalized);
    if (numeric?.[3] && Number(numeric[1]) > Number(numeric[3])) return null;
    const match = specifications.find(spec => {
      const raw = spec.normalized_value.value_raw ?? (spec.normalized_value.type === 'text' ? spec.normalized_value.value : '');
      const text = normalizeSpecificationText(`${spec.canonical_key} ${raw}`);
      const interval = numeric && [...text.matchAll(/([+\-]?\d+(?:\.\d+)?)\s*(hz|vdc|v|a|w|m|pa)\s+to\s+([+\-]?\d+(?:\.\d+)?)\s*(hz|vdc|v|a|w|m|pa)(?![\p{L}\p{N}])/gu)]
        .some(range => range[2] === numeric[2] && range[4] === numeric[2] && (!numeric[4] || numeric[4] === numeric[2])
          && Number(range[1]) <= Number(numeric[1]) && Number(range[3]) >= Number(numeric[3] ?? numeric[1]));
      return (new RegExp(`(?<![\\p{L}\\p{N}.+\\-])${pattern}(?![\\p{L}\\p{N}.])`, 'u').test(text) || interval)
        && (!adc || /\badc\b|\banalog to digital\b|\ba(?:\/| per )d converter\b/u.test(text))
        && !/\b(?:not supported|unsupported|not available|no support)\b/u.test(text);
    });
    if (!match) return null;
    evidence.push(match);
  }
  return evidence;
}

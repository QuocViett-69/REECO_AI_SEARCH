import type { ProductSpecification } from '@reeco/shared';

export type SearchLanguage = 'vi' | 'en';

export function searchLanguage(query: string, fallback: SearchLanguage = 'en'): SearchLanguage {
  const text = query.normalize('NFC').toLowerCase();
  if (/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/u.test(text)
    || /\b(?:toi can|cam bien|bo ghi|do am|nhiet do|dien ap|ap suat|thong so|bo nho|cap bao ve|giai thich|cai nao|vi sao|khong dung|luong mua|toc do gio)\b/u.test(text)) return 'vi';
  if (/\b(?:i|need|sensors?|loggers?|modules?|devices?|products?|instruments?|specifications?|requirements?|weather|soil|water|temperature|range|memory|voltage|pressure|frequency|resolution|accuracy|support|does|can|which|why|explain|with|without|power|communication|system|show|find|current|consumption|output|input|ingress|protection|weight|mass|humidity|capacity|storage|data|rate|supply|compare|best|about|please|this|what|how|recommend|and|or|for|the|no|not|waterproof|sensitivity|dimensions)\b/u.test(text)) return 'en';
  return fallback;
}

// Raw prose stays in evidence; only numeric facts and technical units enter the answer.
export function numericSpecificationText(spec: ProductSpecification, language: SearchLanguage): string | undefined {
  const normalized = spec.normalized_value;
  const raw = normalized.value_raw ?? (normalized.type === 'text' ? normalized.value : '');
  let value = raw;
  if (normalized.type === 'number' && normalized.unit) value = `${normalized.qualifier ?? ''}${normalized.value} ${normalized.unit}`;
  if (normalized.type === 'range') {
    if (normalized.min && normalized.max) value = `${normalized.qualifier ?? ''}${normalized.min.value} ${normalized.min.unit} to ${normalized.max.value} ${normalized.max.unit}`;
    else if (normalized.unit) value = `${normalized.qualifier ?? ''}${normalized.min_value} to ${normalized.max_value} ${normalized.unit}`;
  }
  for (const source of [raw, value]) {
    const remainder = source.replace(/\b(?:to|VDC|VAC|DC|AC|RH|RMS|Hz|kHz|MHz|GHz|hPa|kPa|MPa|Pa|mbar|bar|psi|V|mV|A|mA|uA|W|mW|kg|g|m|cm|mm|s|ms|h|in|MB|kB|GB|KB|bps|kbps|Mbps|bit|bits)\b/giu, '')
      .replace(/[\d\s.+−–—\-±×*/<>=≤≥°%µμ²³⁻¹Ω(),:;|]/gu, '').replace(/[CFK]/gu, '');
    if (remainder) return undefined;
  }
  if (!value) return undefined;
  return value.replace(/\bto\b/giu, language === 'vi' ? 'đến' : 'to');
}

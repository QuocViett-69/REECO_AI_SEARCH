import type { ProductSpecification } from '@reeco/shared';

export const normalizeSpecificationText = (text: string): string => text.normalize('NFKC')
  .toLowerCase().replace(/[‐‑–—_-]/gu, ' ').replace(/\s+/gu, ' ').trim();

// ponytail: literal spec evidence; add unit-aware interval matching when inequalities are required.
export function specificationTerms(query: string): string[] {
  const text = normalizeSpecificationText(query);
  return [...new Set([
    ...text.matchAll(/\bip\d{2}[a-z]?\b|\bcan\s*bus\b|\bthermistor\b|\b\d+(?:\.\d+)?\s*(?:to\s*\d+(?:\.\d+)?\s*)?(?:khz|hz|vdc|aa|bits?\b(?:\s*adc\b)?)|\b\d+(?:\.\d+)?\s*%/gu),
  ].map(match => match[0].replace(/\bbits\b/gu, 'bit').replace(/\bcan\s+bus\b/gu, 'canbus')))];
}

export function specificationEvidence(terms: string[], specifications: ProductSpecification[]): ProductSpecification[] | null {
  const evidence: ProductSpecification[] = [];
  for (const term of terms) {
    const adc = /\bbit adc$/u.test(term);
    const pattern = term.replace(/ adc$/u, '').split(/\s+/u).map(word => word.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')).join('\\s*');
    const match = specifications.find(spec => {
      const raw = spec.normalized_value.value_raw ?? (spec.normalized_value.type === 'text' ? spec.normalized_value.value : '');
      const text = normalizeSpecificationText(`${spec.canonical_key} ${raw}`);
      return new RegExp(`(?<![\\p{L}\\p{N}.])${pattern}(?![\\p{L}\\p{N}.])`, 'u').test(text)
        && (!adc || /\badc\b|\banalog to digital\b|\ba(?:\/| per )d converter\b/u.test(text))
        && !/\b(?:not supported|unsupported|not available|no support)\b/u.test(text);
    });
    if (!match) return null;
    evidence.push(match);
  }
  return evidence;
}

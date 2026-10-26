import type { ProductSpecification } from '@reeco/shared';
import { normalizeEngineeringUnits } from './unit-query';

export const normalizeSpecificationText = (text: string): string => normalizeEngineeringUnits(text.normalize('NFKC'))
  .toLowerCase().replace(/[‐‑–—_]/gu, ' ').replace(/-(?!\d)|(?<=[\p{L}\p{N}])-/gu, ' ').replace(/\s+/gu, ' ').trim();

// shortcut: exact values and covering intervals; accuracy tolerances and inequalities need quantity-specific rules.
export function specificationTerms(query: string): string[] {
  const text = normalizeSpecificationText(query);
  return [...new Set([
    ...text.matchAll(/\bip\d{2}[a-z]?\b|\bcan\s*bus\b|\bthermistor\b|(?<![\p{L}\p{N}.])[+-]?\d+(?:\.\d+)?\s*(?:hz|vdc|v|a|w|m|pa)(?![\p{L}\p{N}])(?:\s+to\s+[+-]?\d+(?:\.\d+)?\s*(?:hz|vdc|v|a|w|m|pa)(?![\p{L}\p{N}]))?|\b\d+(?:\.\d+)?\s*(?:aa|bits?\b(?:\s*adc\b)?)|\b\d+(?:\.\d+)?\s*%/gu),
  ].map(match => match[0].replace(/\bbits\b/gu, 'bit').replace(/\bcan\s+bus\b/gu, 'canbus')))];
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

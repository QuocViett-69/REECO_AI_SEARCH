import type { TechnicalProductIdentity } from './technical-query-parser.service';

const key = (text: string): string => text.toUpperCase().replace(/[\s_-]/gu, '');

function oneEditAway(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let edits = 0;
  for (let i = 0, j = 0; i < a.length || j < b.length;) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length >= b.length) i++;
    if (b.length >= a.length) j++;
  }
  return true;
}

export function suggestModels(query: string, catalog: readonly TechnicalProductIdentity[]): TechnicalProductIdentity[] {
  if (!/^[a-z0-9\s_-]+$/iu.test(query)) return [];
  const normalized = key(query);
  if (normalized.length < 4 || catalog.some(p => key(p.model) === normalized || key(p.productId) === normalized)) return [];
  // Suggestions are catalog entries, never exact identities. Keep ambiguous prefixes plural.
  return catalog.filter(p => key(p.model).startsWith(normalized)
    || /\d/u.test(normalized) && oneEditAway(normalized, key(p.model)))
    .sort((a, b) => Math.abs(key(a.model).length - normalized.length) - Math.abs(key(b.model).length - normalized.length) || a.model.localeCompare(b.model));
}

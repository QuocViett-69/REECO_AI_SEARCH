import type { SearchRequest } from '@reeco/shared';

const alternative = /^(?:what about|how about|thế còn|còn)(?:\s|$)/iu;
const continuation = /^(?:and|also|with|only|does it support|do they support|can it|what about|how about|thế còn|còn|và|với|chỉ|thêm|có hỗ trợ|có loại|loại nào|nó|chúng)(?:\s|$)/iu;
const shortConstraint = /\b(?:SDI[\s-]?12|RS[\s-]?(?:485|232)|USB|CAN[\s-]?bus|CPI|Modbus|Wi[\s‐‑–—-]?Fi)\b|[-+]?\d+(?:\.\d+)?\s*(?:°\s*C|deg(?:rees?)?\s*C|C\b)/iu;

export const hasTechnicalConstraint = (query: string): boolean => shortConstraint.test(query);

export interface SearchExclusions {
  protocols: string[];
  cellular: boolean;
  temperature: boolean;
}

export function parseNegativeConstraints(query: string): { query: string; exclusions: SearchExclusions; unsupported: boolean } {
  let cleaned = query.normalize('NFC');
  const protocols = new Set<string>();
  const canonical = (value: string) => /^sdi[\s-]?12$/iu.test(value) ? 'SDI-12'
    : /^rs[\s-]?232$/iu.test(value) ? 'RS-232' : /^wi[\s-]?fi$/iu.test(value) ? 'Wi-Fi'
    : /^can[\s-]?bus$/iu.test(value) ? 'CANbus' : /^modbus\s+rtu$/iu.test(value) ? 'Modbus RTU'
    : /^modbus$/iu.test(value) ? 'Modbus' : value.toUpperCase();
  const negativeProtocol = /(?:without|excluding|exclude|does not support|doesn.t support|no|kh(?:\u00f4ng)\s+(?:co|ho tro|dung|h\u1ed7 tr\u1ee3|d\u00f9ng|c\u00f3))\s+(SDI[\s-]?12|RS[\s-]?232|Wi[\s-]?Fi|USB|CAN[\s-]?bus|CPI|Modbus(?:\s+RTU)?)\b/giu;
  cleaned = cleaned.replace(negativeProtocol, (_match, value: string) => { protocols.add(canonical(value)); return ' '; });
  let cellular = false;
  cleaned = cleaned.replace(/\bnon[-\s]+cellular\b/giu, () => { cellular = true; return ' '; });
  let temperature = false;
  cleaned = cleaned.replace(/\b(?:but\s+not|not)\s+temperature\s+sensor\b/giu, () => { temperature = true; return ' '; });
  cleaned = cleaned.replace(/\s+/gu, ' ').trim();
  cleaned = cleaned.replace(/^(?:and|but|also)\s+|\s+(?:and|but|also)$|^(?:and|but|also)$/giu, '').trim();
  const marker = /\b(?:without|excluding|exclude|does\s+not\s+support|doesn't\s+support|but\s+not)\b|\bnon[-\s]+\p{L}|\bno\s+(?:modbus|sdi|rs)\b|kh\s*\u00f4ng\s+(?:ho tro|dung|co|h\u1ed7 tr\u1ee3|d\u00f9ng)\b/iu;
  const unsupported = marker.test(cleaned);
  return { query: cleaned, exclusions: { protocols: [...protocols], cellular, temperature }, unsupported };
}

export const hasUnsupportedNegativeConstraint = (query: string): boolean => parseNegativeConstraints(query).unsupported;

export function resolveConversationQuery(
  query: string,
  context?: SearchRequest['context'],
): { query: string; applied: boolean } {
  const turn = query.normalize('NFC').trim();
  if (!context) return { query: turn, applied: false };
  const negative = parseNegativeConstraints(turn);
  if (negative.unsupported || negative.exclusions.protocols.length > 0 || negative.exclusions.cellular || negative.exclusions.temperature) {
    return { query: turn, applied: false };
  }
  const words = turn.split(/\s+/u);
  if (!continuation.test(turn) && !(words.length <= 3 && shortConstraint.test(turn))) {
    return { query: turn, applied: false };
  }

  const source = alternative.test(turn) ? context.base_query : context.previous_query;
  const filter = turn
    .replace(continuation, '')
    .replace(/^(?:support|supports|hỗ trợ)(?:\s|$)/iu, '')
    .replace(/\s+(?:không|not)\s*\??$/iu, '')
    .replace(/[?？]+$/u, '')
    .trim();
  if (!filter) return { query: turn, applied: false };
  const resolved = `${source.trim()} ${filter}`.replace(/\s+/gu, ' ').trim();
  return resolved.length <= 500
    ? { query: resolved, applied: true }
    : { query: turn, applied: false };
}

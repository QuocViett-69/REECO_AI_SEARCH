import type { SearchRequest } from '@reeco/shared';
import { protocolRequirements, requestedProtocols } from './protocol-query';

const alternative = /^(?:what about|how about|thế còn|còn)(?:\s|$)/iu;
const continuation = /^(?:and|also|with|only|does it support|do they support|can it|what about|how about|thế còn|còn|và|với|chỉ|thêm|có hỗ trợ|có loại|loại nào|nó|chúng)(?:\s|$)/iu;
const shortConstraint = /\b(?:SDI[\s-]?12|RS[\s-]?(?:485|232)|USB|CAN[\s-]?bus|CPI|Modbus|Wi[\s‐‑–—-]?Fi)\b|[-+]?\d+(?:\.\d+)?\s*(?:°\s*C|℃|độ\s*C|deg(?:rees?)?\s*C|C\b)/iu;

export const hasTechnicalConstraint = (query: string): boolean => shortConstraint.test(query) || requestedProtocols(query).length > 0;
export const isExplanationQuestion = (query: string): boolean => /\b(?:this (?:product|device)|these (?:models|products|devices)|the other one|my (?:application|requirements|query|use case)|recommended this)|(?:(?:các|những) (?:model|sản phẩm|thiết bị) này|sản phẩm này|thiết bị này|sản phẩm còn lại|nhu cầu của tôi|yêu cầu của tôi|câu hỏi của tôi|trường hợp (?:sử dụng )?của tôi)/iu.test(query);

export interface SearchExclusions {
  protocols: string[];
  cellular: boolean;
  temperature: boolean;
}

export function parseNegativeConstraints(query: string): { query: string; exclusions: SearchExclusions; unsupported: boolean } {
  const protocols = protocolRequirements(query);
  let cleaned = protocols.query;
  let cellular = false;
  cleaned = cleaned.replace(/\bnon[-\s]+cellular\b/giu, () => { cellular = true; return ' '; });
  cleaned = cleaned.replace(/(?:\b(?:without|no)\s+(?:cellular|[345]g)(?!\s+coverage)\b|không\s+(?:hỗ trợ|dùng)\s+(?:cellular|[345]g))(?=$|[^\p{L}\p{N}])/giu, () => { cellular = true; return ' '; });
  let temperature = false;
  cleaned = cleaned.replace(/\b(?:but\s+not|not)\s+temperature\s+sensor\b/giu, () => { temperature = true; return ' '; });
  cleaned = cleaned.replace(/không\s+(?:đo\s+nhiệt\s+độ|phải\s+cảm\s+biến\s+nhiệt\s+độ)(?=$|[^\p{L}\p{N}])/giu, () => { temperature = true; return ' '; });
  cleaned = cleaned.replace(/\s+/gu, ' ').trim();
  cleaned = cleaned.replace(/^(?:and|but|also)\s+|\s+(?:and|but|also)$|^(?:and|but|also)$/giu, '').trim();
  const marker = /\b(?:without|excluding|exclude|do(?:es)?\s+not\s+(?:support|use|have|need|operate|measure)|do(?:es)?n['’]t\s+(?:support|use|have|need|operate|measure)|not\s+(?:using|supporting|operating|measuring|suitable)|but\s+not)\b|\bnon[-\s]+\p{L}|\bno\s+(?:modbus|sdi|rs)\b|kh[oô]ng\s+(?:ho tro|dung|co|có|hỗ trợ|dùng|được|sử dụng|cần|đo|hoạt động)(?=$|[^\p{L}\p{N}])/iu;
  // Contextual absence is a deployment need, not a product exclusion.
  const unsupported = marker.test(cleaned
    .replace(/\bwithout\s+(?:personnel|visiting|having to visit|staff|an? (?:internet|grid) connection)\b/giu, '')
    .replace(/\bwithout\s+(?:cellular coverage|submerging|immersing)\b/giu, '')
    .replace(/\b(?:non[-\s]+contact|without\s+(?:a\s+)?(?:propeller|rotor|moving parts))\b/giu, '')
    .replace(/không\s+được\s+nhúng/giu, '')
    .replace(/không có (?:sóng (?:di động\s*)?(?:4G)?|điện lưới|bất kỳ mạng viễn thông mặt đất nào)/giu, ''));
  return { query: cleaned, exclusions: { protocols: protocols.excluded, cellular, temperature }, unsupported };
}

export const hasUnsupportedNegativeConstraint = (query: string): boolean => parseNegativeConstraints(query).unsupported;

export function resolveConversationQuery(
  query: string,
  context?: SearchRequest['context'],
): { query: string; applied: boolean; broaden?: boolean } {
  const turn = query.normalize('NFC').trim();
  if (!context) return { query: turn, applied: false };
  if (/^(?:cái nào|thiết bị nào|sản phẩm nào|which (?:one|device|product)).*(?:phù hợp nhất|best|most suitable)/iu.test(turn)) {
    return { query: context.previous_query, applied: true };
  }
  if (/^(?:chấp nhận|tôi chấp nhận|cho phép|I (?:accept|allow))\s+(?:cảm biến chìm|submersible)/iu.test(turn)) {
    return { query: context.previous_query.replace(/(?:mà\s+)?không được nhúng.*$/iu, '').replace(/non[ -]contact/giu, ''), applied: true, broaden: true };
  }
  if (isExplanationQuestion(turn)) return { query: context.previous_query, applied: true };
  const negative = parseNegativeConstraints(turn);
  if (!negative.unsupported && !negative.query && (negative.exclusions.protocols.length || negative.exclusions.cellular || negative.exclusions.temperature)) {
    const resolved = `${context.previous_query} ${turn}`;
    return resolved.length <= 500 ? { query: resolved, applied: true } : { query: turn, applied: false };
  }
  if (negative.unsupported || negative.exclusions.protocols.length > 0 || negative.exclusions.cellular || negative.exclusions.temperature) {
    return { query: turn, applied: false };
  }
  const words = turn.split(/\s+/u);
  if (!continuation.test(turn) && !(words.length <= 3 && hasTechnicalConstraint(turn))) {
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

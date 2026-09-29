"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveConversationQuery = exports.hasUnsupportedNegativeConstraint = exports.hasTechnicalConstraint = void 0;
const alternative = /^(?:what about|how about|thế còn|còn)(?:\s|$)/iu;
const continuation = /^(?:and|also|with|only|does it support|do they support|can it|what about|how about|thế còn|còn|và|với|chỉ|thêm|có hỗ trợ|có loại|loại nào|nó|chúng)(?:\s|$)/iu;
const shortConstraint = /\b(?:SDI[\s-]?12|RS[\s-]?485|Modbus|Wi[\s‐‑–—-]?Fi)\b|[-+]?\d+(?:\.\d+)?\s*(?:°\s*C|deg(?:rees?)?\s*C|C\b)/iu;
const hasTechnicalConstraint = (query) => shortConstraint.test(query);
exports.hasTechnicalConstraint = hasTechnicalConstraint;
const hasUnsupportedNegativeConstraint = (query) => /\b(?:without|exclude|does\s+not\s+support|doesn't\s+support)\b|\bno\s+(?:modbus|sdi|rs)\b|không\s+(?:hỗ trợ|dùng)/iu.test(query);
exports.hasUnsupportedNegativeConstraint = hasUnsupportedNegativeConstraint;
function resolveConversationQuery(query, context) {
    const turn = query.normalize('NFC').trim();
    if (!context)
        return { query: turn, applied: false };
    if ((0, exports.hasUnsupportedNegativeConstraint)(turn)) {
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
    if (!filter)
        return { query: turn, applied: false };
    const resolved = `${source.trim()} ${filter}`.replace(/\s+/gu, ' ').trim();
    return resolved.length <= 500
        ? { query: resolved, applied: true }
        : { query: turn, applied: false };
}
exports.resolveConversationQuery = resolveConversationQuery;

// Keep equipment already owned out of the purchase target; never discard the new need.
export function purchaseQuery(query: string): string {
  return query.replace(/^(?:tôi\s+)?(?:có sẵn|đang có|đã có|I (?:have|already own))\s+(.+?)\s+(?:cần mua|cần tìm|need to buy|need|looking for)\s+/iu, '')
    .replace(/\s+(?:để (?:kết nối|gắn).*|to connect.*)\s+(?:với|to)\s+(?:bộ ghi.*|my .*logger.*)$/iu, '');
}

export function isCapabilityQuestion(query: string): boolean {
  return /(?:có\s+(?:hỗ trợ|kết nối).*(?:không|\?)\s*$|\b(?:does|can)\b.*\b(?:support|connect)\b)/iu.test(query);
}

export function protocolAlternatives(protocol: string, supported: string[]): string[] {
  return supported.filter(p => p !== protocol && !p.startsWith(`${protocol} `)
    && /^(?:SDI-12|RS-232|PakBus|DNP3|Ethernet|USB|CS I\/O|CPI)$/iu.test(p)
    && !(protocol === 'Modbus' && p === 'RS-232'));
}

export function isOutsideCatalog(query: string): boolean {
  const text = query.normalize('NFD').replace(/[\u0300-\u036f]/gu, '').replace(/đ/giu, 'd').toLowerCase();
  // Route explicit consumer/medical needs; ambiguous monitoring needs still use retrieval.
  return /\b(?:huyet ap|blood pressure|medical|may loc nuoc (?:gia dinh|gia dung)|household water (?:filter|purifier)|dien thoai (?:thong minh|di dong)|smartphone|mobile phone)\b/u.test(text);
}

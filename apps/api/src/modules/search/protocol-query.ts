import { SUPPORTED_TECHNICAL_PROTOCOLS } from './technical-query.constants';

export type TechnicalProtocol = (typeof SUPPORTED_TECHNICAL_PROTOCOLS)[number];
const protocolPattern = String.raw`(?:SDI[\s-]?12|RS[\s-]?(?:232|422|485)|Wi[\s-]?Fi|USB|CAN[\s-]?bus|CPI|Modbus(?:[\s/-]+(?:RTU|TCP(?:\s*/\s*IP)?|ASCII))?|Ethernet|Pak[\s-]?Bus|DNP[\s-]?3|MQTT|TCP\s*/\s*IP)`;
const separator = String.raw`(?:\s*(?:,|/|and|or|và|hoặc)\s*)`;
const prefix = String.raw`(?:without(?:\s+using)?|excluding|exclude|do(?:es)?\s+not\s+(?:support|use|have|need)|don['’]t\s+(?:support|use|have|need)|doesn['’]t\s+(?:support|use|have|need)|not\s+(?:using|supporting)|no\s+need\s+for|no|kh[oô]ng\s+(?:được\s+)?(?:c[oó]|h[oỗ]\s*tr[oợ]|d[uù]ng|sử\s+dụng)|kh[oô]ng\s+c[aầ]n(?:\s+d[uù]ng)?)`;
const normalize = (value: string) => value.normalize('NFC').replace(/[‐‑–—]/gu, '-');

export function canonicalProtocol(value: string): TechnicalProtocol | undefined {
  const key = normalize(value).replace(/[\s/-]/gu, '').toLowerCase();
  if (key === 'modbustcpip') return 'Modbus TCP';
  return SUPPORTED_TECHNICAL_PROTOCOLS.find(protocol => protocol.replace(/[\s/-]/gu, '').toLowerCase() === key);
}

export function protocolSatisfies(requested: string, supported: string): boolean {
  const requestedName = canonicalProtocol(requested) ?? requested;
  const supportedName = canonicalProtocol(supported) ?? supported;
  return requestedName === supportedName || requestedName === 'Modbus' && supportedName.startsWith('Modbus ');
}

export function protocolRequirements(query: string): { query: string; excluded: TechnicalProtocol[]; avoided: TechnicalProtocol[] } {
  const excluded = new Set<TechnicalProtocol>();
  const avoided = new Set<TechnicalProtocol>();
  let cleaned = normalize(query).replace(new RegExp(String.raw`(?<![\p{L}\p{N}])(${prefix})\s+(?:an?\s+)?(${protocolPattern}(?:${separator}${protocolPattern})*)(?![\p{L}\p{N}])`, 'giu'), (_match, negative: string, list: string) => {
    const optional = /kh[oô]ng\s+c[aầ]n|\bneed\b/iu.test(negative);
    const usage = /using|\buse\b|d[uù]ng|sử\s+dụng/iu.test(negative);
    for (const mention of list.matchAll(new RegExp(protocolPattern, 'giu'))) {
      const protocol = canonicalProtocol(mention[0]);
      if (protocol && !optional) {
        excluded.add(protocol);
        if (usage) avoided.add(protocol);
      }
    }
    return ' ';
  });
  cleaned = cleaned.replace(new RegExp(String.raw`(?<![\p{L}\p{N}])(${protocolPattern})\s+(?:is\s+)?(?:not\s+(?:supported|required)|kh[oô]ng\s+(?:được\s+)?hỗ\s+trợ|kh[oô]ng\s+c[aầ]n)(?![\p{L}\p{N}])`, 'giu'), (match, value: string) => {
    const protocol = canonicalProtocol(value);
    if (protocol && !/required|c[aầ]n/iu.test(match)) excluded.add(protocol);
    return ' ';
  });
  return { query: cleaned, excluded: [...excluded], avoided: [...avoided] };
}

export function requestedProtocols(query: string): TechnicalProtocol[] {
  const text = protocolRequirements(query).query.replace(new RegExp(String.raw`${protocolPattern}\s+(?:is\s+)?(?:unavailable|not available)\b`, 'giu'), '');
  const found = new Set([...text.matchAll(new RegExp(String.raw`(?<![\p{L}\p{N}])${protocolPattern}(?![\p{L}\p{N}])`, 'giu'))].map(match => canonicalProtocol(match[0])));
  return SUPPORTED_TECHNICAL_PROTOCOLS.filter(protocol => found.has(protocol));
}

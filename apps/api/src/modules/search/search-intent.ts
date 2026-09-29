import type { ProductSearchDocument, ProductSpecification, SearchResponse } from '@reeco/shared';
import { parseTemperatureTarget, temperatureTargetEvidence } from './temperature-target';

type Evidence = NonNullable<SearchResponse['results'][number]['explanation']>['evidence'][number];
type Requirement = { key: string; en: string; vi: string; pattern: RegExp };
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/gu, '').replace(/đ/giu, 'd').toLowerCase();

// ponytail: reviewed bilingual concepts, not a general language parser; extend with catalog-backed aliases.
const measurements: Requirement[] = [
  { key: 'volumetric_water_content', en: 'soil moisture', vi: 'độ ẩm đất', pattern: /\bsoil (?:moisture|water content)\b|\bvolumetric water content\b|\bvwc\b|\bdo am (?:cua )?dat\b|\bham luong nuoc (?:trong dat|the tich)\b/u },
  { key: 'relative_humidity', en: 'relative humidity', vi: 'độ ẩm không khí', pattern: /\b(?:relative |air )?humidity\b|\bdo am (?:khong khi|tuong doi)\b/u },
  { key: 'barometric_pressure', en: 'air pressure', vi: 'áp suất không khí', pattern: /\b(?:barometric|atmospheric|air) pressure\b|\bap suat (?:khong khi|khi quyen)\b/u },
  { key: 'turbidity', en: 'turbidity', vi: 'độ đục', pattern: /\bturbidity\b|\bdo duc\b/u },
];
const roles: Requirement[] = [
  { key: 'soil', en: 'soil sensor', vi: 'cảm biến đất', pattern: /\bsoil sensors?\b|\bcam bien dat\b/u },
  { key: 'logger', en: 'data logger', vi: 'bộ ghi dữ liệu', pattern: /\bdata\s*loggers?\b|\bbo ghi du lieu\b/u },
  { key: 'cellular', en: 'cellular communication', vi: 'truyền thông cellular', pattern: /\bcellular\b|\btruyen (?:thong|du lieu) (?:qua mang )?di dong\b/u },
  { key: 'vibrating', en: 'vibrating wire reader', vi: 'thiết bị đọc vibrating wire', pattern: /\bvibrating wire\b|\bday rung\b/u },
  { key: 'power', en: 'power supply', vi: 'nguồn cấp', pattern: /\bpower suppl(?:y|ies)\b|\bnguon (?:cap|dien)\b|\bcap nguon\b/u },
];

export function parseSearchIntent(query: string) {
  const text = normalize(query);
  const requested = measurements.filter(item => item.pattern.test(text));
  const target = parseTemperatureTarget(query);
  // Vietnamese permits a shared trailing medium: "nhiệt độ, độ ẩm và áp suất không khí".
  const airList = /\bkhong khi\b/u.test(text) && /\bnhiet do\b/u.test(text) && /\bdo am\b/u.test(text)
    && !/\b(?:dat|nuoc)\b/u.test(text);
  if (airList && !requested.some(item => item.key === 'relative_humidity')) requested.push(measurements[1]!);
  const medium = target ?? (airList ? parseTemperatureTarget('air temperature') : undefined);
  const kinds = roles.filter(item => item.pattern.test(text));
  const outdoor = /\b(?:harsh|rugged|extreme)\b.*\b(?:outdoor|environment)|\b(?:outdoor|environment).*\b(?:harsh|rugged|extreme)\b|\b(?:moi truong|ngoai troi).*\bkhac nghiet\b/u.test(text);
  return { measurements: requested, target: medium, roles: kinds, outdoor,
    constrained: requested.length > 0 || !!medium || kinds.length > 0 || outdoor };
}

export type SearchIntent = ReturnType<typeof parseSearchIntent>;

export function matchSearchIntent(intent: SearchIntent, document: ProductSearchDocument, specifications: ProductSpecification[] = []): Evidence[] | null {
  const evidence: Evidence[] = [];
  for (const item of intent.measurements) {
    const measurement = document.measurements.find(entry => entry.key === item.key);
    const capability = document.capabilities.find(entry => entry.key === `measure_${item.key}`);
    if (!measurement && !capability) return null;
    evidence.push({ source: 'product_document', field: measurement ? 'measurements' : 'capabilities', value: `${item.en} / ${item.vi}` });
  }
  if (intent.target) {
    const field = temperatureTargetEvidence(document, intent.target);
    if (!field) return null;
    evidence.push({ source: 'product_document', field, value: `${intent.target.en} / ${intent.target.vi}` });
  }
  const type = normalize(document.taxonomy.device_type);
  for (const role of intent.roles) {
    const matches = role.key === 'soil' ? /\bsoil\b/u.test(type)
      : role.key === 'logger' ? /\bdata logger\b/u.test(type)
      : role.key === 'cellular' ? /\bcellular\b/u.test(type) || document.supported_protocols.some(p => /^(?:cellular|lte|[345]g)$/iu.test(p))
      : role.key === 'vibrating' ? /\bvibrating wire\b/u.test(`${type} ${normalize(document.name_en)}`)
      : document.taxonomy.category_key === 'power';
    if (!matches) return null;
    evidence.push({ source: 'product_document', field: role.key === 'power' ? 'taxonomy.category' : 'taxonomy.device_type', value: role.key === 'power' ? document.taxonomy.category : document.taxonomy.device_type });
  }
  if (intent.outdoor) {
    if (document.taxonomy.category_key !== 'sensors') return null;
    const spec = specifications.map(item => ({ key: item.canonical_key, text: item.normalized_value.value_raw ?? (item.normalized_value.type === 'text' ? item.normalized_value.value : '') }))
      .find(item => item.key === 'ingress_protection'
      && /(?:intended|designed) for.*outdoor use/iu.test(item.text)
      && !/not (?:intended|designed|suitable) for/iu.test(item.text));
    if (!spec) return null;
    evidence.push({ source: 'normalized_spec', field: spec.key, value: spec.text });
  }
  return evidence;
}

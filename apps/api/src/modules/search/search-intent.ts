import type { ProductSearchDocument, ProductSpecification, SearchResponse } from '@reeco/shared';
import { parseTemperatureTarget, temperatureTargetEvidence } from './temperature-target';
import { specificationTerms, specificationEvidence } from './specification-query';

type Evidence = NonNullable<SearchResponse['results'][number]['explanation']>['evidence'][number];
type Requirement = { key: string; en: string; vi: string; pattern: RegExp };
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/gu, '').replace(/đ/giu, 'd').toLowerCase();

// ponytail: reviewed bilingual concepts, not a general language parser; extend with catalog-backed aliases.
const measurements: Requirement[] = [
  { key: 'volumetric_water_content', en: 'soil moisture', vi: 'độ ẩm đất', pattern: /\bsoil (?:moisture|humidity|water content)\b|\b(?:water content|water) in (?:the )?soil\b|\bwet (?:the )?soil\b|\bvolumetric water content\b|\bvwc\b|\bdo am (?:cua )?dat\b|\b(?:ham )?luong nuoc (?:trong dat|the tich)\b/u },
  { key: 'relative_humidity', en: 'relative humidity', vi: 'độ ẩm không khí', pattern: /\b(?:relative |air )?humidity\b|\bdo am (?:khong khi|tuong doi)\b/u },
  { key: 'barometric_pressure', en: 'air pressure', vi: 'áp suất không khí', pattern: /\b(?:barometric|atmospheric|air) pressure\b|\bap suat (?:khong khi|khi quyen)\b/u },
  { key: 'turbidity', en: 'turbidity', vi: 'độ đục', pattern: /\bturbidity\b|\bdo duc\b/u },
  { key: 'soil_electrical_conductivity', en: 'soil electrical conductivity', vi: 'độ dẫn điện đất', pattern: /\b(?:electrical conductivity|do dan dien)\b/u },
];
const roles: Requirement[] = [
  { key: 'soil', en: 'soil sensor', vi: 'cảm biến đất', pattern: /\bsoil sensors?\b|\bcam bien dat\b/u },
  { key: 'logger', en: 'data logger', vi: 'bộ ghi dữ liệu', pattern: /\bdata\s*loggers?\b|\bbo ghi du lieu\b|\bthu thap du lieu\b/u },
  { key: 'cellular', en: 'cellular communication', vi: 'truyền thông cellular', pattern: /\bcellular\b|\bmobile network\b|\btruyen (?:thong|du lieu) (?:qua mang )?di dong\b/u },
  { key: 'vibrating', en: 'vibrating wire reader', vi: 'thiết bị đọc vibrating wire', pattern: /\bvibrating wire\b|\bday rung\b/u },
  { key: 'power', en: 'power supply', vi: 'nguồn cấp', pattern: /\bpower suppl(?:y|ies)\b|\bnguon (?:cap|dien)\b|\bcap nguon\b/u },
  { key: 'communication', en: 'communication equipment', vi: 'thiết bị truyền dữ liệu', pattern: /\bcommunication\b|\btruyen du lieu\b/u },
  { key: 'weather', en: 'weather instrument', vi: 'thiết bị thời tiết', pattern: /\bweather\b|\bthoi tiet\b/u },
  { key: 'water', en: 'water monitoring instrument', vi: 'thiết bị quan trắc nước', pattern: /\bhydrolog(?:y|ical)\b/u },
  { key: 'wireless', en: 'wireless communication', vi: 'truyền thông không dây', pattern: /\bwireless\b|\bkhong day\b/u },
];

export function parseSearchIntent(query: string) {
  const text = normalize(query);
  const requested = measurements.filter(item => item.pattern.test(text));
  // "Soil humidity" describes water content, not relative humidity in air.
  if (/\bsoil humidity\b/u.test(text) && !/\b(?:air|relative) humidity\b/u.test(text)) {
    const humidity = requested.findIndex(item => item.key === 'relative_humidity');
    if (humidity >= 0) requested.splice(humidity, 1);
  }
  const target = parseTemperatureTarget(query);
  // Vietnamese permits a shared trailing medium: "nhiệt độ, độ ẩm và áp suất không khí".
  const airList = /\bkhong khi\b/u.test(text) && /\bnhiet do\b/u.test(text) && /\bdo am\b/u.test(text)
    && !/\b(?:dat|nuoc)\b/u.test(text);
  if (airList && !requested.some(item => item.key === 'relative_humidity')) requested.push(measurements[1]!);
  const weather = /\bweather\b|\bthoi tiet\b/u.test(text);
  if (weather && /\b(?:humidity|do am)\b/u.test(text) && !requested.some(item => item.key === 'relative_humidity')) requested.push(measurements[1]!);
  if (weather && /\b(?:pressure|ap suat)\b/u.test(text) && !requested.some(item => item.key === 'barometric_pressure')) requested.push(measurements[2]!);
  const medium = target ?? (airList || weather && /\b(?:temperature|nhiet do)\b/u.test(text) ? parseTemperatureTarget('air temperature') : undefined);
  const kinds = roles.filter(item => item.pattern.test(text));
  const specifications = specificationTerms(query);
  const outdoor = /\b(?:harsh|rugged|extreme)\b.*\b(?:outdoor|environment)|\b(?:outdoor|environment).*\b(?:harsh|rugged|extreme)\b|\b(?:moi truong|ngoai troi).*\bkhac nghiet\b/u.test(text);
  return { measurements: requested, target: medium, roles: kinds, outdoor, specifications,
    constrained: requested.length > 0 || !!medium || kinds.length > 0 || outdoor || specifications.length > 0 };
}

export type SearchIntent = ReturnType<typeof parseSearchIntent>;

export function matchSearchIntent(intent: SearchIntent, document: ProductSearchDocument, specifications: ProductSpecification[] = []): Evidence[] | null {
  const evidence: Evidence[] = [];
  const literalEvidence = specificationEvidence(intent.specifications, specifications);
  if (!literalEvidence) return null;
  evidence.push(...literalEvidence.map(spec => ({ source: 'normalized_spec' as const, field: spec.canonical_key,
    value: spec.normalized_value.value_raw ?? (spec.normalized_value.type === 'text' ? spec.normalized_value.value : '') })));
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
  const communicationOption = document.variants?.find(v => v.model === document.model)?.distinguishing_specifications.find(s => s.name_en === 'Communication Option');
  for (const role of intent.roles) {
    const matches = role.key === 'soil' ? /\bsoil\b/u.test(type)
      : role.key === 'logger' ? /\bdata logger\b/u.test(type)
      : role.key === 'cellular' ? /\bcellular\b/u.test(type) || document.supported_protocols.some(p => /^(?:cellular|lte|[345]g)$/iu.test(p))
      : role.key === 'vibrating' ? /\bvibrating wire\b/u.test(`${type} ${normalize(document.name_en)}`)
      : role.key === 'communication' ? /\b(?:communication|modem|radio|transmitter)\b/u.test(type)
      : role.key === 'weather' ? /\b(?:weather|air|humidity|barometric|wind|precipitation|rain)\b/u.test(type)
      : role.key === 'water' ? /\b(?:water|turbidity|oxygen)\b/u.test(type)
      : role.key === 'wireless' ? communicationOption
        ? /wi[ -]?fi|cellular|radio/iu.test(communicationOption.value_raw)
        : /\b(?:wireless|cellular|radio)\b/iu.test(`${type} ${document.name_en}`) || document.supported_protocols.includes('Wi-Fi')
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

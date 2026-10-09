import type { ProductSearchDocument, ProductSpecification, SearchResponse } from '@reeco/shared';
import { parseTemperatureTarget, temperatureTargetEvidence } from './temperature-target';
import { specificationTerms, specificationEvidence } from './specification-query';

type Evidence = NonNullable<SearchResponse['results'][number]['explanation']>['evidence'][number];
type Requirement = { key: string; en: string; vi: string; pattern: RegExp };
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/gu, '').replace(/đ/giu, 'd').replace(/[‐‑–—-]/gu, ' ').toLowerCase();

// ponytail: reviewed bilingual concepts, not a general language parser; extend with catalog-backed aliases.
const measurements: Requirement[] = [
  { key: 'volumetric_water_content', en: 'soil moisture', vi: 'độ ẩm đất', pattern: /\bsoil (?:moisture|humidity|water content)\b|\b(?:water content|water) in (?:the )?soil\b|\bwet (?:the )?soil\b|\bvolumetric water content\b|\bvwc\b|\bdo am (?:cua )?dat\b|\b(?:ham )?luong nuoc (?:trong dat|the tich)\b/u },
  { key: 'relative_humidity', en: 'relative humidity', vi: 'độ ẩm không khí', pattern: /\b(?:relative |air )?humidity\b|\bdo am (?:khong khi|tuong doi)\b/u },
  { key: 'barometric_pressure', en: 'air pressure', vi: 'áp suất không khí', pattern: /\b(?:barometric|atmospheric|air) pressure\b|\bap suat (?:khong khi|khi quyen)\b/u },
  { key: 'turbidity', en: 'turbidity', vi: 'độ đục', pattern: /\b(?:turbidity|turbid|cloudy)\b|\b(?:do duc|nuoc.*duc|duc.*nuoc)\b/u },
  { key: 'soil_electrical_conductivity', en: 'soil electrical conductivity', vi: 'độ dẫn điện đất', pattern: /\b(?:electrical conductivity|do dan dien)\b/u },
  { key: 'precipitation', en: 'rainfall', vi: 'lượng mưa', pattern: /\brain(?:fall)?\b|\bprecipitation\b|\b(?:luong mua|anh huong cua mua|sau mua|moi tran mua|cam bien mua|mua lon)\b/u },
  { key: 'dissolved_oxygen', en: 'dissolved oxygen', vi: 'oxy hòa tan', pattern: /\bdissolved oxygen\b|\boxy hoa tan\b/u },
  { key: 'wind_speed', en: 'wind speed', vi: 'tốc độ gió', pattern: /\b(?:wind speed|strong winds|peak wind|toc do.*gio|gio manh|gio cuc dai)\b/u },
  { key: 'wind_direction', en: 'wind direction', vi: 'hướng gió', pattern: /\b(?:wind.*direction|huong gio)\b/u },
  { key: 'solar_radiation', en: 'solar radiation', vi: 'bức xạ mặt trời', pattern: /\b(?:solar radiation|anh sang mat troi|buc xa mat troi)\b/u },
  { key: 'leaf_wetness', en: 'leaf wetness', vi: 'độ ướt lá', pattern: /\b(?:leaf wetness|wet leaves|do uot la|la bi uot|la uot)\b/u },
  { key: 'water_level', en: 'water level', vi: 'mực nước', pattern: /\b(?:water level|water stage|muc nuoc)\b/u },
  { key: 'net_radiation', en: 'net radiation', vi: 'bức xạ thuần', pattern: /\b(?:net radiation|net radiometer|buc xa thuan)\b/u },
  { key: 'photosynthetic_photon_flux_density', en: 'photosynthetic photon flux density', vi: 'mật độ thông lượng photon quang hợp', pattern: /\b(?:ppfd|photosynthetic photon flux density|photon quang hop|buc xa quang hop)\b/u },
  { key: 'soil_heat_flux', en: 'soil heat flux', vi: 'thông lượng nhiệt đất', pattern: /\b(?:soil heat flux|thong luong nhiet dat|dong nhiet dat)\b/u },
  { key: 'fuel_moisture', en: 'fuel moisture', vi: 'độ ẩm vật liệu cháy', pattern: /\b(?:fuel moisture|do am vat lieu chay)\b/u },
  { key: 'background_luminance', en: 'background luminance', vi: 'độ chói nền', pattern: /\b(?:background luminance|do choi nen)\b/u },
  { key: 'cloud_base_height', en: 'cloud base height', vi: 'độ cao chân mây', pattern: /\b(?:cloud base heights?|do cao chan may)\b/u },
  { key: 'snow_depth', en: 'snow depth', vi: 'độ sâu tuyết', pattern: /\b(?:snow depth|do sau tuyet)\b/u },
  { key: 'visibility', en: 'visibility', vi: 'tầm nhìn', pattern: /\b(?:visibility|tam nhin)\b/u },
  { key: 'dielectric_permittivity', en: 'dielectric permittivity', vi: 'hằng số điện môi', pattern: /\b(?:dielectric permittivity|hang so dien moi)\b/u },
  { key: 'precipitation_intensity', en: 'precipitation intensity', vi: 'cường độ mưa', pattern: /\b(?:precipitation intensity|rainfall intensity|cuong do mua)\b/u },
  { key: 'precipitation_electrical_conductivity', en: 'precipitation electrical conductivity', vi: 'độ dẫn điện nước mưa', pattern: /\b(?:precipitation electrical conductivity|do dan dien (?:cua )?nuoc mua)\b/u },
  { key: 'compass_heading', en: 'compass heading', vi: 'hướng la bàn', pattern: /\b(?:compass heading|huong la ban)\b/u },
  { key: 'lightning_distance', en: 'lightning distance', vi: 'khoảng cách sét', pattern: /\b(?:lightning distance|khoang cach set)\b/u },
  { key: 'lightning_strike_count', en: 'lightning strike count', vi: 'số lần sét đánh', pattern: /\b(?:lightning strike count|so lan set danh)\b/u },
  { key: 'tilt', en: 'tilt', vi: 'độ nghiêng', pattern: /\b(?:tilt|do nghieng)\b/u },
  { key: 'distance', en: 'distance measurement', vi: 'đo khoảng cách', pattern: /\b(?:distance|do khoang cach|khoang cach)\b/u },
  { key: 'present_weather', en: 'present weather', vi: 'thời tiết hiện tại', pattern: /\b(?:present weather|thoi tiet hien tai)\b/u },
];
const roles: Requirement[] = [
  { key: 'soil', en: 'soil sensor', vi: 'cảm biến đất', pattern: /\bsoil sensors?\b|\bcam bien dat\b/u },
  { key: 'logger', en: 'data logger', vi: 'bộ ghi dữ liệu', pattern: /\bdata\s*log{1,2}ers?\b|\bbo ghi du lieu\b|\bthu thap du lieu\b|\bcollect.*data automatically\b|\b(?:data.*stored|luu.*du lieu|du lieu.*luu)\b/u },
  { key: 'cellular', en: 'cellular communication', vi: 'truyền thông cellular', pattern: /\bcellular\b|\bmobile network\b|\b(?:song|mang) di dong\b|\btruyen (?:thong|du lieu) (?:qua mang )?di dong\b/u },
  { key: 'vibrating', en: 'vibrating wire reader', vi: 'thiết bị đọc vibrating wire', pattern: /\bvibrating wire\b|\bday rung\b/u },
  { key: 'reader', en: 'analyzer', vi: 'thiết bị đọc/phân tích', pattern: /\b(?:reader|analy[sz]er)\b|\binspect and read\b|\bthiet bi doc\b/u },
  { key: 'power', en: 'power supply', vi: 'nguồn cấp', pattern: /^power$|\bpower suppl(?:y|ies)\b|\bnguon (?:cap|dien)\b|\bcap nguon\b/u },
  { key: 'communication', en: 'communication equipment', vi: 'thiết bị truyền dữ liệu', pattern: /\bcommunication\b|\b(?:truyen|gui|nhan) du lieu\b|\btruyen thong\b|\b(?:transmit|send|receive).*data\b|\b(?:xem|kiem tra).*tu xa\b|\bremote data access\b|\baccess.*data remotely\b/u },
  { key: 'weather', en: 'weather instrument', vi: 'thiết bị thời tiết', pattern: /\b(?:weather|meteorolog\w*)\b|\b(?:thoi tiet|khi tuong)\b/u },
  { key: 'water', en: 'water monitoring instrument', vi: 'thiết bị quan trắc nước', pattern: /\bhydrolog(?:y|ical)\b|\bwater sensor\b|\bcam bien nuoc\b/u },
  { key: 'wireless', en: 'wireless communication', vi: 'truyền thông không dây', pattern: /\bwireless\b|\bkhong day\b/u },
  { key: 'waterquality', en: 'water quality measurement', vi: 'đo chất lượng nước', pattern: /\bwater quality\b|\bchat luong nuoc\b/u },
  { key: 'ethernet', en: 'Ethernet communication', vi: 'truyền thông Ethernet', pattern: /\bethernet\b/u },
];

export function parseSearchIntent(query: string) {
  const text = normalize(query);
  const requested = measurements.filter(item => item.pattern.test(text));
  if (requested.some(item => item.key === 'lightning_distance') && !/\b(?:target|muc tieu)\b/u.test(text)) {
    const distance = requested.findIndex(item => item.key === 'distance');
    if (distance >= 0) requested.splice(distance, 1);
  }
  if (requested.some(item => item.key === 'precipitation_electrical_conductivity')) {
    const soilEC = requested.findIndex(item => item.key === 'soil_electrical_conductivity');
    if (soilEC >= 0 && !/\b(?:soil|dat)\b/u.test(text)) requested.splice(soilEC, 1);
  }
  const soilNeed = /\b(?:irrigat\w*|soil.*(?:dry|wet)|water stress|water infiltrat.*soil|tuoi|dat.*(?:kho|uot)|nuoc tham.*dat)\b/u.test(text);
  if (soilNeed && !requested.some(item => item.key === 'volumetric_water_content')) requested.push(measurements[0]!);
  if (/\bdo am\b/u.test(text) && /\bdat\b/u.test(text) && !/\bkhong khi\b/u.test(text) && !requested.some(item => item.key === 'volumetric_water_content')) requested.push(measurements[0]!);
  // Rain is context in "river turbid after rain"; retain it for explicit studies of both variables.
  if (requested.some(item => item.key === 'turbidity') && /\b(?:after rain|sau mua)\b/u.test(text) && !/\b(?:study|nghien cuu|relationship|moi quan he)\b/u.test(text)) {
    const rain = requested.findIndex(item => item.key === 'precipitation');
    if (rain >= 0) requested.splice(rain, 1);
  }
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
  const kinds = roles.filter(item => item.pattern.test(text));
  const sensorOnly = /\bsensors?\b|\bcam bien\b/u.test(text) && !requested.length && !target && !kinds.some(item => ['logger', 'reader', 'power', 'communication', 'cellular'].includes(item.key));
  const weather = kinds.some(item => item.key === 'weather') || /\b(?:temperature|nhiet do)\b/u.test(text)
    && /\b(?:humidity|do am)\b/u.test(text) && /\b(?:rainfall|luong mua)\b/u.test(text) && !/\b(?:soil|dat|water|nuoc)\b/u.test(text);
  if (weather && /\b(?:humidity|do am)\b/u.test(text) && !requested.some(item => item.key === 'relative_humidity')) requested.push(measurements[1]!);
  if (weather && /\b(?:pressure|ap suat)\b/u.test(text) && !requested.some(item => item.key === 'barometric_pressure')) requested.push(measurements[2]!);
  const medium = target ?? (airList || weather && /\b(?:temperature|nhiet do)\b/u.test(text) ? parseTemperatureTarget('air temperature') : undefined);
  if (!requested.length && /\b(?:sensor.*soil|soil.*sensor|cam bien.*dat)\b/u.test(text) && !kinds.some(item => item.key === 'soil')) kinds.push(roles[0]!);
  if (/\b(?:network goes down|internet.*lost|mang.*mat|mat ket noi)\b/u.test(text)) {
    if (!kinds.some(item => item.key === 'logger')) kinds.push(roles[1]!);
    const cellular = kinds.findIndex(item => item.key === 'cellular');
    if (cellular >= 0) kinds.splice(cellular, 1);
  }
  if (requested.some(item => item.key === 'volumetric_water_content') && !/\b(?:air|relative) humidity\b|\bkhong khi\b/u.test(text)) {
    const humidity = requested.findIndex(item => item.key === 'relative_humidity');
    if (humidity >= 0) requested.splice(humidity, 1);
  }
  const comparison = /\b(?:instead of|rather than|more (?:appropriate|suitable) than|why.*both|thay vi|phu hop hon|can ca|ethernet.*or.*cellular)\b/u.test(text);
  if (comparison && requested.some(item => item.key === 'volumetric_water_content')) {
    const weatherRole = kinds.findIndex(item => item.key === 'weather');
    if (weatherRole >= 0) kinds.splice(weatherRole, 1);
  }
  if (kinds.some(item => item.key === 'logger') && !/\b(?:which sensor|cam bien nao|nhung cam bien|sensor, datalogger|cam bien, datalogger)\b/u.test(text)) {
    requested.length = 0;
  }
  const specifications = specificationTerms(query);
  const outdoor = /\b(?:harsh|rugged|extreme)\b.*\b(?:outdoor|environment)|\b(?:outdoor|environment).*\b(?:harsh|rugged|extreme)\b|\b(?:moi truong|ngoai troi).*\bkhac nghiet\b/u.test(text);
  const loggerOnly = kinds.some(item => item.key === 'logger') && requested.length === 0;
  const system = !/\b(?:one device|mot thiet bi|both analog and digital)\b/u.test(text)
    && (/\b(?:system|he thong|systems?|nhung thiet bi|what equipment|thi can he thong)\b/u.test(text) && (requested.length > 1 || kinds.length > 1)
      || /\b(?:stud(?:y|ying|ies)|nghien cuu|relationship|moi quan he|changes after|sau moi tran mua|thay doi.*(?:sau|mua))\b/u.test(text) && requested.length > 1);
  const effectiveTarget = loggerOnly ? undefined : medium;
  return { measurements: requested, target: effectiveTarget, roles: kinds, outdoor, specifications, system, comparison, sensorOnly,
    constrained: requested.length > 0 || !!effectiveTarget || kinds.length > 0 || outdoor || specifications.length > 0 };
}

export type SearchIntent = ReturnType<typeof parseSearchIntent>;

export function buildSearchPlan(query: string): { label: string; query: string; needs_clarification?: boolean }[] {
  const text = normalize(query);
  const vi = /[ăâđêôơư]|[\u1ea0-\u1ef9]/iu.test(query);
  const intent = parseSearchIntent(query);
  if (/\bethernet\b/u.test(text) && /\bwi.fi\b/u.test(text) && /\b(?:cellular|di dong)\b/u.test(text) && /\b(?:or|hay)\b/u.test(text)) {
    return ['Ethernet', 'Wi-Fi', 'cellular'].map(protocol => ({ label: protocol, query: protocol === 'cellular' ? 'cellular communication' : `communication equipment with ${protocol}` }));
  }
  const explicitSystem = /\b(?:system|he thong|system include|station.*off.grid|tram.*khong co dien)\b/u.test(text);
  const remote = /\b(?:remote(?:ly)?|vung xa|from home|tu xa|tu nha|ve server|to a server|to the internet|ve internet)\b/u.test(text);
  const farmEnvironment = /\b(?:overall environmental|toan bo.*moi truong)\b/u.test(text) && /\b(?:farm|trang trai)\b/u.test(text);
  const storeAndSend = /\b(?:store and transmit|luu va truyen)\b/u.test(text);
  const multipleStations = /\b(?:multiple monitoring stations|nhieu tram quan trac)\b/u.test(text);
  const multipleZones = /\b(?:soil zones|soil moisture across|so sanh do am.*khu vuc|khu vuc dat khac nhau)\b/u.test(text);
  const loggerAndCommunication = intent.roles.some(item => item.key === 'logger') && intent.roles.some(item => item.key === 'communication');
  const peakWind = /\b(?:record peak wind|ghi lai.*gio cuc dai)\b/u.test(text);
  const design = intent.system || storeAndSend || multipleStations || multipleZones || loggerAndCommunication || peakWind || farmEnvironment && remote
    || intent.comparison && intent.measurements.length > 1
    || explicitSystem && (remote || /\b(?:alert|canh bao|months|thang|off.grid|khong co dien|nhung thanh phan|without personnel|khong co nguoi)\b/u.test(text));
  if (!design) return [];
  const components: { label: string; query: string; needs_clarification?: boolean }[] = intent.measurements.map(item => ({ label: vi ? item.vi : item.en, query: `${item.en} sensor` }));
  if (intent.target) components.push({ label: vi ? intent.target.vi : intent.target.en, query: `${intent.target.en} sensor` });
  else if (/\b(?:temperature|nhiet do)\b/u.test(text) && !intent.roles.some(item => item.key === 'logger')) components.push({ label: vi ? 'Nhiệt độ — cần xác định môi trường đo' : 'Temperature — specify the medium', query: 'temperature sensor', needs_clarification: true });
  if (/\b(?:water.quality|chat luong nuoc)\b/u.test(text) && !components.length) components.push({ label: vi ? 'Chỉ số nước cần đo' : 'Water measurements', query: 'water quality sensor' });
  if ((intent.roles.some(item => item.key === 'weather') || /\b(?:environmental|moi truong)\b/u.test(text)) && !components.length) components.push({ label: vi ? 'Đại lượng thời tiết' : 'Weather measurements', query: 'weather sensor' });
  if (farmEnvironment) components.push({ label: vi ? 'Độ ẩm đất' : 'Soil moisture', query: 'soil moisture sensor' });
  if (/\b(?:soil|dat.*kho)\b/u.test(text) && !components.length) components.push({ label: vi ? 'Độ ẩm đất' : 'Soil moisture', query: 'soil moisture sensor' });
  components.push({ label: vi ? 'Ghi và lưu dữ liệu' : 'Record and store data', query: 'data logger' });
  if (remote || storeAndSend || multipleStations || loggerAndCommunication || /\b(?:alert|canh bao|communication|truyen thong)\b/u.test(text)) components.push({ label: vi ? 'Truyền dữ liệu' : 'Transmit data', query: 'communication equipment' });
  if (/\b(?:off.grid|khong co dien|six months|sau thang|remote area|vung xa)\b/u.test(text)) components.push({ label: vi ? 'Nguồn cấp' : 'Power supply', query: 'power supply' });
  return [...new Map(components.map(item => [item.query, item])).values()];
}

export function matchSearchIntent(intent: SearchIntent, document: ProductSearchDocument, specifications: ProductSpecification[] = []): Evidence[] | null {
  if (intent.sensorOnly && document.taxonomy.category_key !== 'sensors') return null;
  const evidence: Evidence[] = [];
  const literalEvidence = specificationEvidence(intent.specifications, specifications);
  if (!literalEvidence) return null;
  evidence.push(...literalEvidence.map(spec => ({ source: 'normalized_spec' as const, field: spec.canonical_key,
    value: spec.normalized_value.value_raw ?? (spec.normalized_value.type === 'text' ? spec.normalized_value.value : ''), raw_ref: spec.raw_ref })));
  for (const item of intent.measurements) {
    const measurement = document.measurements.find(entry => entry.key === item.key);
    const capability = document.capabilities.find(entry => entry.key === `measure_${item.key}`);
    const rainGauge = item.key === 'precipitation' && /\brain ga[u]?ge\b|\bprecipitation sensor\b/iu.test(document.taxonomy.device_type);
    if (!measurement && !capability && !rainGauge) return null;
    const raw = (measurement ?? capability)?.evidence?.find(entry => entry.source === 'normalized_spec');
    evidence.push({ source: 'product_document', field: measurement ? 'measurements' : capability ? 'capabilities' : 'taxonomy.device_type', value: measurement || capability ? `${item.en} / ${item.vi}` : document.taxonomy.device_type,
      ...(raw?.source === 'normalized_spec' && { raw_ref: raw.raw_ref }) });
  }
  if (intent.target) {
    const field = temperatureTargetEvidence(document, intent.target);
    if (!field) return null;
    evidence.push({ source: 'product_document', field, value: field === 'taxonomy.device_type' ? document.taxonomy.device_type : `${intent.target.en} / ${intent.target.vi}` });
  }
  const type = normalize(document.taxonomy.device_type);
  const communicationOption = document.variants?.find(v => v.model === document.model)?.distinguishing_specifications.find(s => s.name_en === 'Communication Option');
  for (const role of intent.roles) {
    const matches = role.key === 'soil' ? /\bsoil\b/u.test(type)
      : role.key === 'logger' ? /\bdata logger\b/u.test(type)
      : role.key === 'cellular' ? /\bcellular\b/u.test(type) || document.supported_protocols.some(p => /^(?:cellular|lte|[345]g)$/iu.test(p))
      : role.key === 'vibrating' ? /\bvibrating wire\b/u.test(`${type} ${normalize(document.name_en)}`)
      : role.key === 'reader' ? /\b(?:reader|analy[sz]er)\b/u.test(`${type} ${normalize(document.name_en)}`)
      : role.key === 'communication' ? /\b(?:communication|modem|radio|transmitter)\b/u.test(type)
      : role.key === 'weather' ? /\b(?:weather|air|humidity|barometric|wind|precipitation|rain|visibility|ceilometer|luminance)\b/u.test(type)
      : role.key === 'water' ? /\b(?:water|turbidity|oxygen)\b/u.test(type)
      : role.key === 'waterquality' ? /\b(?:water quality|turbidity|dissolved oxygen)\b/u.test(type)
      : role.key === 'ethernet' ? document.supported_protocols.includes('Ethernet') || /\bethernet\b/u.test(type)
      : role.key === 'wireless' ? communicationOption
        ? /wi[ -]?fi|cellular|radio/iu.test(communicationOption.value_raw)
        : /\b(?:wireless|cellular|radio)\b/iu.test(`${type} ${document.name_en}`) || document.supported_protocols.includes('Wi-Fi')
      : document.taxonomy.category_key === 'power';
    if (!matches) return null;
    evidence.push({ source: 'product_document', field: role.key === 'power' ? 'taxonomy.category' : role.key === 'ethernet' && document.supported_protocols.includes('Ethernet') ? 'supported_protocols' : 'taxonomy.device_type', value: role.key === 'power' ? document.taxonomy.category : role.key === 'ethernet' && document.supported_protocols.includes('Ethernet') ? 'Ethernet' : document.taxonomy.device_type });
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

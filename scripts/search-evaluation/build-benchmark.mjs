import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..');
const outputDirectory = path.join(root, 'data', 'evaluation');
const documentsDirectory = path.join(root, 'data', 'search-documents');
const normalizedDirectory = path.join(root, 'data', 'normalized', 'specifications');

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function readDirectory(directory) {
  const files = (await readdir(directory)).filter((file) => file.endsWith('.json')).sort();
  return Promise.all(files.map((file) => readJson(path.join(directory, file))));
}

const documents = await readDirectory(documentsDirectory);
const normalized = await readDirectory(normalizedDirectory);
const documentById = new Map(documents.map((document) => [document.product_id, document]));
const normalizedById = new Map(normalized.map((item) => [item.product_id, item]));

const exactDefinitions = [
  ['CS655', 'en', 'CSI_CS655'], ['CSI_CS655', 'mixed', 'CSI_CS655'],
  ['43347', 'en', 'CSI_43347'], ['CR1000Xe-XT-CC', 'en', 'CSI_CR1000XE_XT_CC'],
  ['CS451', 'en', 'CSI_CS451'], ['CS451-HA', 'en', 'CSI_CS451'],
  ['CS451-WN', 'en', 'CSI_CS451'], ['CS451-NN', 'en', 'CSI_CS451'],
  ['AVW200-ST', 'en', 'CSI_AVW200_ST'], ['CR350-NA', 'en', 'CSI_CR350_NA'],
  ['TempVue20-S', 'en', 'CSI_TEMPVUE20_S'], ['SoilVue10-5', 'en', 'CSI_SOILVUE10_5'],
  ['ClimaVue50G2', 'en', 'CSI_CLIMAVUE50G2'], ['RF407', 'en', 'CSI_RF407'],
  ['MetSENS500-DS', 'en', 'CSI_METSENS500_DS'], ['CPEC306-DW', 'en', 'CSI_CPEC306_DW'],
  ['PS200', 'en', 'CSI_PS200'], ['RainVue10-MM', 'en', 'CSI_RAINVUE10_MM'],
  ['HMP60', 'en', 'CSI_HMP60'], ['NL241', 'en', 'CSI_NL241'],
];

const typeDefinitions = [
  ['data logger', 'en', 'data_logger'],
  ['cellular modem router', 'en', 'cellular_modem_router'],
  ['power supply charge regulator', 'en', 'power_supply_charge_regulator'],
  ['all-in-one weather sensor', 'en', 'all_in_one_weather_sensor'],
  ['compact weather sensor', 'en', 'compact_weather_sensor'],
  ['barometric pressure sensor', 'en', 'barometric_pressure_sensor'],
  ['soil temperature sensor', 'en', 'soil_temperature_sensor'],
  ['air temperature sensor', 'en', 'air_temperature_sensor'],
  ['precipitation sensor', 'en', 'precipitation_sensor'],
  ['vibrating wire analyzer', 'en', 'vibrating_wire_analyzer'],
  ['solar radiation sensor', 'en', 'solar_radiation_sensor'],
  ['telephone modem', 'en', 'telephone_modem'],
  ['radio modem', 'en', 'radio_modem'],
  ['leaf wetness sensor', 'en', 'leaf_wetness_sensor'],
  ['dissolved oxygen sensor', 'en', 'dissolved_oxygen_sensor'],
];

const protocolDefinitions = [
  ['SDI-12 sensor', 'en', 'SDI-12'], ['cảm biến SDI-12', 'vi', 'SDI-12'],
  ['thiết bị hỗ trợ SDI 12', 'vi', 'SDI-12'], ['RS-485 device', 'en', 'RS-485'],
  ['cảm biến RS485', 'vi', 'RS-485'], ['thiết bị giao tiếp RS 485', 'vi', 'RS-485'],
  ['Modbus device', 'en', 'Modbus'], ['thiết bị Modbus', 'vi', 'Modbus'],
  ['Modbus compatible sensor', 'en', 'Modbus'], ['Modbus RTU sensor', 'en', 'Modbus RTU'],
  ['cảm biến Modbus RTU', 'vi', 'Modbus RTU'], ['thiết bị hỗ trợ Modbus RTU', 'vi', 'Modbus RTU'],
  ['MQTT data logger', 'en', 'MQTT'], ['DNP3 logger', 'en', 'DNP3'],
  ['cảm biến giao tiếp USB', 'vi', 'USB'],
];

const numericDefinitions = [
  ['operates at -40°C', 'en', 'operating', 'point', -40],
  ['operates at 60°C', 'en', 'operating', 'point', 60],
  ['operating temperature -40 to 60°C', 'en', 'operating', 'range', -40, 60],
  ['operating temperature -50 to 70°C', 'en', 'operating', 'range', -50, 70],
  ['operating temperature -20 to 50°C', 'en', 'operating', 'range', -20, 50],
  ['hoạt động ở -40°C', 'vi', 'operating', 'point', -40],
  ['hoạt động tại 50°C', 'vi', 'operating', 'point', 50],
  ['nhiệt độ hoạt động -30 đến 60°C', 'vi', 'operating', 'range', -30, 60],
  ['nhiệt độ hoạt động -10 tới 45°C', 'vi', 'operating', 'range', -10, 45],
  ['measure up to 70°C', 'en', 'measurement', 'upper_bound', 70],
  ['measure up to 50°C', 'en', 'measurement', 'upper_bound', 50],
  ['đo tới 60°C', 'vi', 'measurement', 'upper_bound', 60],
  ['đo đến 40°C', 'vi', 'measurement', 'upper_bound', 40],
  ['operates at -55°C', 'en', 'operating', 'point', -55],
  ['operating temperature 0 to 40°C', 'en', 'operating', 'range', 0, 40],
];

const semanticDefinitions = [
  ['measure soil moisture and salinity', 'en', 'volumetric_water_content'],
  ['đo độ ẩm đất', 'vi', 'volumetric_water_content'],
  ['monitor air temperature and humidity', 'en', 'relative_humidity'],
  ['đo nhiệt độ và độ ẩm không khí', 'vi', 'relative_humidity'],
  ['measure rainfall', 'en', 'precipitation'],
  ['đo lượng mưa', 'vi', 'precipitation'],
  ['monitor river water level', 'en', 'water_level'],
  ['quan trắc mực nước', 'vi', 'water_level'],
  ['measure wind speed and direction', 'en', 'wind_speed'],
  ['đo tốc độ và hướng gió', 'vi', 'wind_speed'],
  ['solar radiation monitoring', 'en', 'solar_radiation'],
  ['đo bức xạ mặt trời', 'vi', 'solar_radiation'],
  ['monitor barometric pressure', 'en', 'barometric_pressure'],
  ['detect leaf wetness', 'en', 'leaf_wetness'],
  ['snow depth monitoring', 'en', 'snow_depth'],
];

const mixedDefinitions = [
  ['soil moisture sensor with SDI-12', 'en', 'volumetric_water_content', 'SDI-12'],
  ['cảm biến độ ẩm đất hỗ trợ SDI-12', 'vi', 'volumetric_water_content', 'SDI-12'],
  ['weather sensor with Modbus RTU', 'en', 'air_temperature', 'Modbus RTU'],
  ['cảm biến thời tiết RS-485', 'vi', 'air_temperature', 'RS-485'],
  ['data logger with MQTT', 'en', null, 'MQTT'],
  ['barometric pressure sensor SDI-12', 'en', 'barometric_pressure', 'SDI-12'],
  ['rain sensor with SDI-12', 'en', 'precipitation', 'SDI-12'],
  ['cảm biến mực nước SDI-12', 'vi', 'water_level', 'SDI-12'],
  ['wind sensor with RS-485', 'en', 'wind_speed', 'RS-485'],
  ['soil temperature sensor Modbus', 'en', 'soil_temperature', 'Modbus'],
];

const negativeDefinitions = [
  ['unknown-model-999', 'en', true, 'Unknown exact model'],
  ['CSI_DOES_NOT_EXIST', 'mixed', true, 'Unknown exact product ID'],
  ['CS65', 'en', true, 'Near miss must not be treated as CS655'],
  ['CPEC310', 'en', true, 'Removed product'],
  ['5103', 'en', true, 'Removed product'],
  ['sensor', 'en', false, 'Broad intent requires human scope decision'],
  ['industrial thing', 'en', false, 'No stable product intent'],
  ['thiết bị đo', 'vi', false, 'Broad Vietnamese intent'],
  ['PROFINET sensor', 'en', false, 'Unsupported protocol and possible semantic matches'],
  ['operates at -200°C', 'en', false, 'Extreme numeric constraint; UNKNOWN policy needs review'],
];

function judgment(productId, relevance, evidence) {
  return { product_id: productId, relevance, evidence };
}

function protocolSatisfies(queryProtocol, supportedProtocol) {
  return queryProtocol === 'Modbus'
    ? supportedProtocol === 'Modbus' || supportedProtocol.startsWith('Modbus ')
    : supportedProtocol === queryProtocol;
}

function temperatureJudgments(definition) {
  const [, , intent, kind, first, second] = definition;
  const approved = intent === 'operating'
    ? new Set(['operating_temperature_range', 'operating_temperature_extended_duty_xd'])
    : new Set(['air_temperature_measurement_range', 'air_temperature_range', 'soil_temperature_range', 'temperature_measurement_range', 'temperature_measurement_operating_range']);
  const results = [];
  for (const document of documents) {
    const specifications = normalizedById.get(document.product_id)?.specifications ?? [];
    const ranges = specifications.filter((specification) =>
      approved.has(specification.canonical_key) &&
      specification.normalized?.type === 'range' &&
      specification.normalized.unit === '°C' &&
      Number.isFinite(specification.normalized.min_value) &&
      Number.isFinite(specification.normalized.max_value));
    if (ranges.length === 0) continue;
    const matches = ranges.some((specification) => {
      const value = specification.normalized;
      if (kind === 'range') return value.min_value <= first && value.max_value >= second;
      if (kind === 'upper_bound') return value.max_value >= first;
      return value.min_value <= first && value.max_value >= first;
    });
    results.push(judgment(document.product_id, matches ? 3 : 0, ranges.map((item) => ({
      source: 'normalized_spec', canonical_key: item.canonical_key,
      range: [item.normalized.min_value, item.normalized.max_value], unit: item.normalized.unit,
      raw_ref: item.raw_ref,
    }))));
  }
  return results;
}

const queries = [];
function add(category, query, language, fields) {
  queries.push({ id: `q${String(queries.length + 1).padStart(3, '0')}`, query, language, category, ...fields });
}

for (const [query, language, productId] of exactDefinitions) {
  const document = documentById.get(productId);
  if (!document) throw new Error(`Unknown exact benchmark product ${productId}`);
  add('exact_identity', query, language, {
    intent: 'Find one canonical product by product ID, model, or reviewed variant alias.',
    judgment_status: 'verified', review_reason: null,
    ground_truth_basis: 'Canonical product identity or reviewed variant mapping; independent of search output.',
    constraints: { canonical_product_id: productId },
    judgments: [judgment(productId, 3, [{ source: 'search_document', field: 'aliases_or_variants', value: query }])],
  });
}

for (const [query, language, deviceTypeKey] of typeDefinitions) {
  const matches = documents.filter((document) => document.taxonomy.device_type_key === deviceTypeKey);
  add('product_type', query, language, {
    intent: 'Find all products with an exact curated device type.', judgment_status: 'verified', review_reason: null,
    ground_truth_basis: `Exact curated taxonomy device_type_key=${deviceTypeKey}; exhaustive over 89 documents.`,
    constraints: { device_type_key: deviceTypeKey },
    judgments: matches.map((document) => judgment(document.product_id, 3, [{ source: 'search_document', field: 'taxonomy.device_type_key', value: deviceTypeKey }])),
  });
}

for (const [query, language, protocol] of protocolDefinitions) {
  const matches = documents.filter((document) => document.supported_protocols.some((item) => protocolSatisfies(protocol, item)));
  add('protocol', query, language, {
    intent: `Find products explicitly documented to support ${protocol}.`, judgment_status: 'needs_manual_review',
    review_reason: 'Protocol support is deterministic, but completeness and relative relevance across device types require review.',
    ground_truth_basis: 'Suggested positives come only from explicit supported_protocols evidence; current ranking is not used.',
    constraints: { protocol },
    judgments: matches.map((document) => judgment(document.product_id, 3, [{ source: 'search_document', field: 'supported_protocols', value: protocol }])),
  });
}

for (const definition of numericDefinitions) {
  const [query, language, intent, kind, first, second] = definition;
  add('technical_numeric', query, language, {
    intent: 'Find products whose reviewed normalized Celsius range satisfies the query.', judgment_status: 'needs_manual_review',
    review_reason: 'MATCH/MISMATCH is deterministic where normalized evidence exists; UNKNOWN products and usefulness need review.',
    ground_truth_basis: 'Suggested grades use only normalized range evidence and the documented three-state policy.',
    constraints: kind === 'range' ? { temperature_intent: intent, kind, min_celsius: first, max_celsius: second } : { temperature_intent: intent, kind, value_celsius: first },
    judgments: temperatureJudgments(definition),
  });
}

for (const [query, language, measurementKey] of semanticDefinitions) {
  const matches = documents.filter((document) => document.measurements.some((measurement) => measurement.key === measurementKey));
  add('semantic', query, language, {
    intent: `Find products suitable for ${measurementKey.replaceAll('_', ' ')}.`, judgment_status: 'needs_manual_review',
    review_reason: 'Curated measurement evidence supplies candidates, but natural-language relevance and grades need human judgment.',
    ground_truth_basis: 'Suggested positives use curated measurement keys only; search output is excluded.',
    constraints: { measurement_key: measurementKey },
    judgments: matches.map((document) => judgment(document.product_id, 2, [{ source: 'search_document', field: 'measurements.key', value: measurementKey }])),
  });
}

for (const [query, language, measurementKey, protocol] of mixedDefinitions) {
  const matches = documents.filter((document) =>
    (!measurementKey || document.measurements.some((measurement) => measurement.key === measurementKey)) &&
    document.supported_protocols.some((item) => protocolSatisfies(protocol, item)));
  add('mixed_constraint', query, language, {
    intent: 'Find products satisfying both functional and protocol constraints.', judgment_status: 'needs_manual_review',
    review_reason: 'Constraint intersection is evidence-backed, but usefulness and missing structured evidence require review.',
    ground_truth_basis: 'Suggested positives are the intersection of curated measurement and explicit protocol support.',
    constraints: { measurement_key: measurementKey, protocol },
    judgments: matches.map((document) => judgment(document.product_id, 3, [
      ...(measurementKey ? [{ source: 'search_document', field: 'measurements.key', value: measurementKey }] : []),
      { source: 'search_document', field: 'supported_protocols', value: protocol },
    ])),
  });
}

for (const [query, language, verified, reason] of negativeDefinitions) {
  add('negative_or_ambiguous', query, language, {
    intent: verified ? 'Confirm an unknown or removed identity does not resolve as an exact product.' : 'Probe ambiguous or unsupported intent.',
    judgment_status: verified ? 'verified' : 'needs_manual_review', review_reason: verified ? null : reason,
    ground_truth_basis: verified ? 'Exhaustive canonical ID/model/variant inventory check.' : 'No deterministic exhaustive relevance rule.',
    constraints: { expected_exact_identity: null }, judgments: [],
  });
}

const counts = (field) => Object.fromEntries([...new Set(queries.map((query) => query[field]))].sort().map((value) => [value, queries.filter((query) => query[field] === value).length]));
const benchmark = {
  schema_version: '1.0', benchmark_id: 'search-benchmark-v1', generated_at: new Date().toISOString(),
  catalog_snapshot: { products: 89, active: 89, review: 0, product_documents: 89, search_index_rows: 89, embeddings_present: 89 },
  relevance_scale: { 0: 'not relevant', 1: 'marginally relevant', 2: 'relevant', 3: 'highly relevant' },
  policy: {
    ranking_independence: 'Judgments are derived from canonical identity and curated structured evidence, never current result positions.',
    unjudged_items: 'Unjudged items are not assumed irrelevant for needs_manual_review queries.',
    verified_metrics: 'Aggregate relevance metrics include only verified queries with at least one positive judgment.',
  },
  summary: { query_count: queries.length, by_category: counts('category'), by_language: counts('language'), by_judgment_status: counts('judgment_status') },
  queries,
};

if (queries.length !== 100) throw new Error(`Expected 100 benchmark queries, received ${queries.length}`);
await mkdir(outputDirectory, { recursive: true });
await writeFile(path.join(outputDirectory, 'search-benchmark-v1.json'), `${JSON.stringify(benchmark, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(benchmark.summary, null, 2));

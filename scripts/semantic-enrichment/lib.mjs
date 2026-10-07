import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(scriptsDirectory, '..', '..');
const masterPath = path.join(
  projectRoot,
  'data',
  'master',
  'product-master.json',
);
const normalizedDirectory = path.join(
  projectRoot,
  'data',
  'normalized',
  'specifications',
);
const outputDirectory = path.join(projectRoot, 'data', 'enriched', 'products');
const ontologyPath = path.join(
  projectRoot,
  'data',
  'ontology',
  'semantic-vocabulary.json',
);
const reportPath = path.join(
  projectRoot,
  'data',
  'reports',
  'semantic-enrichment-report.json',
);

const readJson = async (filePath) =>
  JSON.parse(await readFile(filePath, 'utf8'));

const writeJsonIfChanged = async (filePath, value) => {
  const content = `${JSON.stringify(value, null, 2)}\n`;
  try {
    if ((await readFile(filePath, 'utf8')) === content) return false;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await writeFile(filePath, content, 'utf8');
  return true;
};

const keyFor = (value) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLocaleLowerCase('en-US')
    .replace(/&/gu, ' and ')
    .replace(/[^a-z0-9]+/gu, '_')
    .replace(/^_+|_+$/gu, '');

const uniqueBy = (items, getKey) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const uniqueStrings = (items) =>
  uniqueBy(
    items.filter((item) => typeof item === 'string' && item.trim() !== ''),
    (item) => item.toLocaleLowerCase('en-US'),
  );

const productEvidence = (field, value) => ({
  source: 'product_master',
  field,
  value,
});

const specificationEvidence = (specification) => ({
  source: 'normalized_spec',
  canonical_key: specification.canonical_key,
  raw_ref: specification.raw_ref,
});

const dedupeEvidence = (evidence) =>
  uniqueBy(evidence, (item) => JSON.stringify(item));

const TAXONOMY_VI = {
  sensors: 'Cảm biến',
  measurement_devices: 'Thiết bị đo lường',
  communications: 'Thiết bị truyền thông',
  power: 'Nguồn điện',
  systems: 'Hệ thống',
  temperature_sensors_air_soil_water:
    'Cảm biến nhiệt độ không khí, đất và nước',
  air_temperature_sensors: 'Cảm biến nhiệt độ không khí',
  water_and_soil_temperature_sensors: 'Cảm biến nhiệt độ nước và đất',
  air_temperature_and_relative_humidity_sensors:
    'Cảm biến nhiệt độ không khí và độ ẩm tương đối',
  barometric_pressure_sensors: 'Cảm biến áp suất khí quyển',
  precipitation_sensors: 'Cảm biến lượng mưa',
  wind_speed_and_wind_direction_sensors: 'Cảm biến tốc độ và hướng gió',
  all_in_one_weather_sensors: 'Cảm biến thời tiết tích hợp',
  solar_radiation_sensors: 'Cảm biến bức xạ mặt trời',
  present_weather_sensors: 'Cảm biến thời tiết hiện tại',
  visibility_sensors: 'Cảm biến tầm nhìn',
  dissolved_oxygen_sensors: 'Cảm biến oxy hòa tan',
  turbidity_sensors: 'Cảm biến độ đục',
  water_level_stage_and_flow_sensors:
    'Cảm biến mực nước, cao trình và lưu lượng',
  soil_moisture_temperature_and_ec_sensors:
    'Cảm biến độ ẩm, nhiệt độ và độ dẫn điện của đất',
  leaf_wetness_sensors: 'Cảm biến độ ướt lá',
  snow_water_equivalent_snow_depth_sensors:
    'Cảm biến lượng nước tương đương tuyết và độ sâu tuyết',
  vibrating_wire_analyzers: 'Bộ phân tích dây rung',
  data_loggers: 'Bộ ghi dữ liệu',
  thermocouple_measurement_modules: 'Mô-đun đo cặp nhiệt điện',
  vibrating_wire_measurement_modules: 'Mô-đun đo dây rung',
  cellular_communications: 'Truyền thông di động',
  spread_spectrum_radios: 'Vô tuyến trải phổ',
  wi_fi_communications: 'Truyền thông Wi-Fi',
  ethernet_communications: 'Truyền thông Ethernet',
  satellite_communications: 'Truyền thông vệ tinh',
  charge_regulators_and_dc_adapters: 'Bộ điều khiển sạc và bộ chuyển đổi DC',
  power_supplies_and_charge_regulators: 'Bộ nguồn và bộ điều khiển sạc',
  solar_monitoring_stations: 'Trạm giám sát năng lượng mặt trời',
  sensor: 'Cảm biến',
  air_temperature_sensor: 'Cảm biến nhiệt độ không khí',
  water_and_soil_temperature_sensor: 'Cảm biến nhiệt độ nước và đất',
  air_temperature_and_relative_humidity_sensor:
    'Cảm biến nhiệt độ không khí và độ ẩm tương đối',
  barometric_pressure_sensor: 'Cảm biến áp suất khí quyển',
  precipitation_sensor: 'Cảm biến lượng mưa',
  wind_speed_and_wind_direction_sensor: 'Cảm biến tốc độ và hướng gió',
  all_in_one_weather_sensor: 'Cảm biến thời tiết tích hợp',
  solar_radiation_sensor: 'Cảm biến bức xạ mặt trời',
  present_weather_sensor: 'Cảm biến thời tiết hiện tại',
  visibility_sensor: 'Cảm biến tầm nhìn',
  dissolved_oxygen_sensor: 'Cảm biến oxy hòa tan',
  turbidity_sensor: 'Cảm biến độ đục',
  water_level_stage_and_flow_sensor:
    'Cảm biến mực nước, cao trình và lưu lượng',
  soil_moisture_temperature_and_ec_sensor:
    'Cảm biến độ ẩm, nhiệt độ và độ dẫn điện của đất',
  leaf_wetness_sensor: 'Cảm biến độ ướt lá',
  snow_water_equivalent_snow_depth_sensor:
    'Cảm biến lượng nước tương đương tuyết và độ sâu tuyết',
  vibrating_wire_analyzer: 'Bộ phân tích dây rung',
  data_logger: 'Bộ ghi dữ liệu',
  measurement_device: 'Thiết bị đo lường',
  cellular_modem_router: 'Modem hoặc bộ định tuyến di động',
  radio_communication_device: 'Thiết bị truyền thông vô tuyến',
  wi_fi_communication_device: 'Thiết bị truyền thông Wi-Fi',
  ethernet_communication_device: 'Thiết bị truyền thông Ethernet',
  satellite_communication_device: 'Thiết bị truyền thông vệ tinh',
  charge_regulator_dc_adapter: 'Bộ điều khiển sạc hoặc bộ chuyển đổi DC',
  power_supply_charge_regulator: 'Bộ nguồn hoặc bộ điều khiển sạc',
  solar_monitoring_station: 'Trạm giám sát năng lượng mặt trời',
  analog_input_modules: 'Mô-đun đầu vào tương tự',
  carbon_flux_systems: 'Hệ thống thông lượng carbon',
  data_loggers_edge_devices: 'Bộ ghi dữ liệu / thiết bị biên',
  fuel_moisture_sensors: 'Cảm biến độ ẩm nhiên liệu',
  multiplexers: 'Bộ ghép kênh',
  radio_communications: 'Truyền thông vô tuyến',
  radios: 'Thiết bị vô tuyến',
  satellite_transmitters: 'Bộ phát vệ tinh',
  soil_sensors: 'Cảm biến đất',
  telephone_communications: 'Truyền thông điện thoại',
  temperature_and_humidity_sensors: 'Cảm biến nhiệt độ và độ ẩm',
  water_level_sensors: 'Cảm biến mực nước',
  weather_sensors: 'Cảm biến thời tiết',
  wind_sensors: 'Cảm biến gió',
  analog_input_module: 'Mô-đun đầu vào tương tự',
  back_of_module_temperature_sensor: 'Cảm biến nhiệt độ mặt sau mô-đun',
  background_luminance_sensor: 'Cảm biến độ chói nền',
  black_globe_temperature_sensor: 'Cảm biến nhiệt độ cầu đen',
  carbon_flux_measurement_system: 'Hệ thống đo thông lượng carbon',
  compact_weather_sensor: 'Cảm biến thời tiết nhỏ gọn',
  data_logger_edge_device: 'Bộ ghi dữ liệu / thiết bị biên',
  fuel_moisture_sensor: 'Cảm biến độ ẩm nhiên liệu',
  handheld_soil_moisture_meter: 'Máy đo độ ẩm đất cầm tay',
  heat_flux_plate: 'Tấm đo thông lượng nhiệt',
  lidar_ceilometer: 'Máy đo trần mây LIDAR',
  multiplexer: 'Bộ ghép kênh',
  net_radiometer: 'Cảm biến bức xạ thuần',
  pyranometer: 'Cảm biến bức xạ mặt trời',
  quantum_sensor: 'Cảm biến lượng tử',
  radio_modem: 'Modem vô tuyến',
  rain_gage: 'Cảm biến đo mưa',
  satellite_transmitter: 'Bộ phát vệ tinh',
  soil_profiler_tdr_soil_moisture_and_temperature_profile_sensor:
    'Cảm biến TDR đo hồ sơ độ ẩm và nhiệt độ đất',
  soil_temperature_sensor: 'Cảm biến nhiệt độ đất',
  spread_spectrum_radio: 'Thiết bị vô tuyến trải phổ',
  tdr_soil_moisture_probe: 'Đầu dò độ ẩm đất TDR',
  telephone_modem: 'Modem điện thoại',
  temperature_and_relative_humidity_sensor:
    'Cảm biến nhiệt độ và độ ẩm tương đối',
  temperature_profiler: 'Cảm biến hồ sơ nhiệt độ',
  tipping_bucket_rain_gage: 'Cảm biến mưa gàu lật',
  ultrasonic_wind_sensor: 'Cảm biến gió siêu âm',
  vibrating_wire_data_logger: 'Bộ ghi dữ liệu dây rung',
  water_level_continuous_flow_bubbler:
    'Thiết bị sủi khí dòng liên tục đo mực nước',
  water_level_recording_sensor: 'Cảm biến ghi mực nước',
  water_level_sensor: 'Cảm biến mực nước',
};

const measurementDefinitions = [
  [
    'temperature',
    'Temperature',
    'Nhiệt độ',
    ['temperature measurement'],
    /\btemperature\b|\bthermocouple\b/iu,
    /\btemperature\b[^.;|]{0,45}\b(?:sensor|probe|profiler)\b|\bthermocouple\b/iu,
  ],
  [
    'air_temperature',
    'Air Temperature',
    'Nhiệt độ không khí',
    ['ambient temperature'],
    /\bair temperature\b/iu,
    /\bair temperature sensor\b/iu,
  ],
  [
    'water_temperature',
    'Water Temperature',
    'Nhiệt độ nước',
    [],
    /\bwater temperature\b/iu,
    /\bwater temperature sensor\b/iu,
  ],
  [
    'soil_temperature',
    'Soil Temperature',
    'Nhiệt độ đất',
    [],
    /\bsoil temperature\b|\bsoil\b[^|;]{0,100}\btemperature\b/iu,
    /\bsoil temperature sensor\b|\bthermocouple burial probe\b/iu,
  ],
  [
    'relative_humidity',
    'Relative Humidity',
    'Độ ẩm tương đối',
    ['RH'],
    /\brelative humidity\b|(?:^|[;,| ])RH(?:[;,| ]|$)/iu,
    /temperature\s*\/\s*RH sensor/iu,
  ],
  [
    'barometric_pressure',
    'Barometric Pressure',
    'Áp suất khí quyển',
    [],
    /\bbarometric pressure\b/iu,
    /\bbarometer\b|\bbarometric pressure sensor\b/iu,
  ],
  [
    'precipitation',
    'Precipitation',
    'Lượng mưa',
    ['rainfall'],
    /\bprecipitation\b|\brainfall\b/iu,
    /\b(?:rain ga[u]?ge|precipitation sensor)\b/iu,
  ],
  [
    'precipitation_intensity',
    'Precipitation Intensity',
    'Cường độ mưa',
    [],
    /\bprecipitation intensity\b|\brainfall intensity\b/iu,
    /$a/iu,
  ],
  [
    'precipitation_electrical_conductivity',
    'Precipitation Electrical Conductivity',
    'Độ dẫn điện của nước mưa',
    ['precipitation EC'],
    /\bprecipitation electrical conductivity\b|\bprecipitation\b[^,;|]{0,60}\(EC\)/iu,
    /$a/iu,
  ],
  [
    'wind_speed',
    'Wind Speed',
    'Tốc độ gió',
    [],
    /\bwind speed\b|\bwind direction and speed\b/iu,
    /\bwind speed\b|\banemometer\b/iu,
  ],
  [
    'wind_direction',
    'Wind Direction',
    'Hướng gió',
    [],
    /\bwind direction\b/iu,
    /\bwind direction\b|\banemometer\b/iu,
  ],
  [
    'solar_radiation',
    'Solar Radiation',
    'Bức xạ mặt trời',
    ['sun plus sky radiation'],
    /\bsolar radiation\b|\bsun plus sky radiation\b|\bpyranometer\b/iu,
    /\bpyranometer\b|\bsolar radiation sensor\b/iu,
  ],
  [
    'net_radiation',
    'Net Radiation',
    'Bức xạ thuần',
    ['net radiometer'],
    /\bnet radiation\b|\bnet radiometer\b|\bshort-wave and long-wave radiation\b/iu,
    /\bnet radiation sensor\b/iu,
  ],
  [
    'turbidity',
    'Turbidity',
    'Độ đục',
    ['turbidity measurement'],
    /\bturbidity\b/iu,
    /\bturbidity\b/iu,
  ],
  [
    'water_level',
    'Water Level',
    'Mực nước',
    ['stage'],
    /\bwater[- ]level\b|\bstage\b/iu,
    /\bwater[- ]level\b[^.;|]{0,45}\b(?:sensor|transducer)\b/iu,
  ],
  [
    'distance',
    'Distance',
    'Khoảng cách',
    [],
    /\bdistance(?:\s+to target|\s*\/\s*stage|\s+measurement)\b/iu,
    /\bdistance sensor\b/iu,
  ],
  [
    'volumetric_water_content',
    'Volumetric Water Content',
    'Hàm lượng nước thể tích',
    ['VWC'],
    /\bvolumetric water content\b|\(VWC\)/iu,
    /\bwater content reflectometer\b/iu,
  ],
  [
    'soil_electrical_conductivity',
    'Soil Electrical Conductivity',
    'Độ dẫn điện của đất',
    ['soil EC'],
    /\bsoil electrical conductivity\b|\bsoil\b[^,;|]{0,100}\belectrical conductivity\b/iu,
    /$a/iu,
  ],
  [
    'dielectric_permittivity',
    'Dielectric Permittivity',
    'Hằng số điện môi',
    ['permittivity'],
    /\bdielectric permittivity\b|\brelative dielectric permittivity\b|\bpermittivity\b/iu,
    /$a/iu,
  ],
  [
    'leaf_wetness',
    'Leaf Wetness',
    'Độ ướt lá',
    [],
    /\bleaf[- ]?(?:surface )?wetness\b/iu,
    /\bleaf wetness sensor\b/iu,
  ],
  [
    'dissolved_oxygen',
    'Dissolved Oxygen',
    'Oxy hòa tan',
    [],
    /\bdissolved oxygen\b/iu,
    /\bdissolved oxygen sensor\b/iu,
  ],
  [
    'snow_depth',
    'Snow Depth',
    'Độ sâu tuyết',
    [],
    /\bsnow[- ]depth\b|\bsnow depth\b/iu,
    /\bsnow depth sensor\b/iu,
  ],
  [
    'present_weather',
    'Present Weather',
    'Thời tiết hiện tại',
    [],
    /\bpresent weather\b/iu,
    /\bpresent weather sensor\b/iu,
  ],
  [
    'visibility',
    'Visibility',
    'Tầm nhìn',
    ['meteorological optical range', 'MOR'],
    /\bvisibility\b|meteorological observable range|\bMOR\b/iu,
    /\bvisibility sensor\b/iu,
  ],
  [
    'compass_heading',
    'Compass Heading',
    'Hướng la bàn',
    [],
    /\bcompass heading\b/iu,
    /$a/iu,
  ],
  [
    'lightning_distance',
    'Lightning Distance',
    'Khoảng cách sét',
    [],
    /\blightning average distance\b|\blightning distance\b/iu,
    /$a/iu,
  ],
  [
    'lightning_strike_count',
    'Lightning Strike Count',
    'Số lần sét đánh',
    [],
    /\blightning strike count\b/iu,
    /$a/iu,
  ],
  ['tilt', 'Tilt', 'Độ nghiêng', [], /(?:^|[,;| ])tilt(?:[,;| ]|$)/iu, /$a/iu],
  ['photosynthetic_photon_flux_density', 'Photosynthetic Photon Flux Density', 'Mật độ thông lượng photon quang hợp', ['PPFD', 'PAR'], /\bphotosynthetic photon flux density\b|\bPPFD\b/iu, /\bquantum sensor\b/iu],
  ['soil_heat_flux', 'Soil Heat Flux', 'Thông lượng nhiệt đất', [], /\bsoil heat flux\b/iu, /\bsoil heat flux plate\b/iu],
  ['fuel_moisture', 'Fuel Moisture', 'Độ ẩm vật liệu cháy', [], /\bfuel moisture\b/iu, /\bfuel moisture sensor\b/iu],
  ['background_luminance', 'Background Luminance', 'Độ chói nền', [], /\bbackground luminance\b/iu, /\bbackground luminance sensor\b/iu],
  ['cloud_base_height', 'Cloud Base Height', 'Độ cao chân mây', [], /\bcloud base heights?\b/iu, /$a/iu],
].map(([key, labelEn, labelVi, aliases, specPattern, namePattern]) => ({
  key,
  label_en: labelEn,
  label_vi: labelVi,
  aliases,
  specPattern,
  namePattern,
}));

const applicationDefinitions = [
  [
    'meteorological_monitoring',
    'Meteorological Monitoring',
    'Giám sát khí tượng',
    ['weather monitoring'],
    /meteorological parameters|weather monitoring/iu,
  ],
  [
    'energy_balance_studies',
    'Energy Balance Studies',
    'Nghiên cứu cân bằng năng lượng',
    [],
    /energy balance studies/iu,
  ],
  [
    'water_level_monitoring',
    'Water Level Monitoring',
    'Giám sát mực nước',
    [],
    /monitoring of water level/iu,
  ],
  [
    'leaf_wetness_monitoring',
    'Leaf Wetness Monitoring',
    'Giám sát độ ướt lá',
    [],
    /leaf surface wetness/iu,
  ],
  [
    'data_logger_connectivity',
    'Data Logger Connectivity',
    'Kết nối bộ ghi dữ liệu',
    [],
    /connectivity (?:for|to).*data loggers/iu,
  ],
  [
    'system_power_supply',
    'System Power Supply',
    'Cấp nguồn cho hệ thống',
    [],
    /power supply for systems/iu,
  ],
  [
    'solar_resource_assessment',
    'Solar Resource Assessment',
    'Đánh giá tài nguyên mặt trời',
    [],
    /solar resource assessment/iu,
  ],
  [
    'solar_project_monitoring',
    'Solar Project Monitoring',
    'Giám sát dự án điện mặt trời',
    [],
    /solar project monitoring/iu,
  ],
].map(([key, labelEn, labelVi, aliases, pattern]) => ({
  key,
  label_en: labelEn,
  label_vi: labelVi,
  aliases,
  pattern,
}));

const measurementAnchorNames = new Set([
  'measurements made',
  'measurement parameter',
  'measurement description',
  'reported parameters',
  'output parameters',
  'product type',
  'device classification',
]);
const applicationAnchorNames = new Set([
  'primary application',
  'typical deployment',
  'application',
  'intended use',
  'product description',
]);

const PRESERVED_NAMES = new Set([
  'TempVue™20',
  'TempVue™50',
  'RainVue™10',
  'MetSENS500-DS',
  'TEMP 120',
  'VWIRE 305',
  'RV50X',
  'RF407',
  'NL241',
  'NL201-ST',
]);
const NAME_VI_OVERRIDES = {
  CSI_CLARIVUE10: 'Cảm biến độ đục ClariVUE™ 10',
  CSI_RANGEVUE30: 'Cảm biến radar đo mực nước RangeVue™30',
};

const taxonomyFor = (product) => ({
  category: product.category,
  category_key: keyFor(product.category),
  subcategory: product.subcategory,
  subcategory_key: keyFor(product.subcategory),
  device_type: product.device_type,
  device_type_key: keyFor(product.device_type),
});

const semanticItem = (definition, evidence) => ({
  key: definition.key,
  label_en: definition.label_en,
  label_vi: definition.label_vi,
  evidence: dedupeEvidence(evidence),
});

const collectMeasurements = (product, normalized) => {
  const explicitList = normalized.specifications.find(spec => spec.name_raw.toLowerCase() === 'measurements made');
  const result = [];
  for (const definition of measurementDefinitions) {
    const evidence = [];
    if (definition.namePattern.test(product.product_name_en)) {
      evidence.push(
        productEvidence('product_name_en', product.product_name_en),
      );
    }
    for (const specification of normalized.specifications) {
      const name = specification.name_raw.toLocaleLowerCase('en-US');
      const combined = `${specification.name_raw}: ${String(specification.value_raw ?? '')}`;
      const isAnchor = measurementAnchorNames.has(name);
      const canonicalKey = specification.canonical_key ?? '';
      const isCanonicalMeasurement =
        /(?:^|_)measurements?(?:_|$)/u.test(canonicalKey) &&
        !/measurement_temperature_note|measurement_performance_verification/u.test(
          canonicalKey,
        );
      // Named ranges/accuracy establish the measured variable, not operating limits.
      const isNamedMeasurement = /(?:range|accuracy|resolution|uncertainty)$/u.test(canonicalKey)
        && !/operating|storage|^maximum_|overpressure|supply|response|compensat/u.test(canonicalKey)
        && definition.key !== 'temperature';
      const listed = !explicitList || definition.specPattern.test(explicitList.value_raw)
        || definition.key === 'soil_electrical_conductivity' && /\bsoil\b/iu.test(product.product_name_en) && /electrical conductivity/iu.test(explicitList.value_raw);
      const isDirectMeasurementStatement =
        /\bmeasures?\b|\bmeasured using\b|\bfor [^.;|]{0,80} measurements\b/iu.test(
          String(specification.value_raw ?? ''),
        ) &&
        !/\b(?:does not|will not|not|without)\b[^.;|]{0,40}\bmeasur/iu.test(
          String(specification.value_raw ?? ''),
        );
      if (
        (isAnchor || isCanonicalMeasurement || isDirectMeasurementStatement || isNamedMeasurement && listed) &&
        (definition.specPattern.test(combined) || isAnchor && definition.namePattern.test(combined)
          || isNamedMeasurement && canonicalKey.startsWith(`${definition.key}_`)) &&
        !(definition.key === 'distance' && /\blightning\b/iu.test(combined))
      ) {
        evidence.push(specificationEvidence(specification));
      }
      if (isAnchor && definition.key === 'soil_electrical_conductivity'
        && /\bsoil\b/iu.test(product.product_name_en)
        && /\belectrical conductivity\b/iu.test(combined)) evidence.push(specificationEvidence(specification));
    }
    if (evidence.length > 0) result.push(semanticItem(definition, evidence));
  }
  const specificTemperatureKeys = new Set([
    'air_temperature',
    'water_temperature',
    'soil_temperature',
  ]);
  return result.filter(
    (item) =>
      item.key !== 'temperature' ||
      !result.some((candidate) => specificTemperatureKeys.has(candidate.key)),
  );
};

const collectApplications = (normalized) => {
  const result = [];
  for (const definition of applicationDefinitions) {
    const evidence = normalized.specifications
      .filter((specification) =>
        applicationAnchorNames.has(
          specification.name_raw.toLocaleLowerCase('en-US'),
        ),
      )
      .filter((specification) =>
        definition.pattern.test(String(specification.value_raw ?? '')),
      )
      .map(specificationEvidence);
    if (evidence.length > 0) result.push(semanticItem(definition, evidence));
  }
  return result;
};

const collectProtocols = (normalized, diagnostics) => {
  const byName = new Map();
  for (const specification of normalized.specifications) {
    for (const relation of ['supported', 'unsupported']) {
      const names = specification.facets?.[`${relation}_protocols`] ?? [];
      for (const name of names) {
        const entry = byName.get(name) ?? { supported: [], unsupported: [] };
        entry[relation].push(specificationEvidence(specification));
        byName.set(name, entry);
      }
    }
  }
  const protocols = [];
  for (const [name, relations] of byName) {
    for (const relation of ['supported', 'unsupported']) {
      if (relations[relation].length > 0) {
        protocols.push({
          name,
          relation,
          evidence: dedupeEvidence(relations[relation]),
        });
      }
    }
  }
  return protocols.sort(
    (a, b) =>
      a.name.localeCompare(b.name, 'en-US') ||
      a.relation.localeCompare(b.relation, 'en-US'),
  );
};

const collectCapabilities = (product, measurements) => {
  const capabilities = measurements.map((measurement) => ({
    key: `measure_${measurement.key}`,
    label_en: `Measure ${measurement.label_en}`,
    label_vi: `Đo ${measurement.label_vi.toLocaleLowerCase('vi-VN')}`,
    evidence: measurement.evidence,
  }));
  if (/\bheated rain gage\b/iu.test(product.product_name_en)) {
    capabilities.push({
      key: 'heated_precipitation_measurement',
      label_en: 'Heated Precipitation Measurement',
      label_vi: 'Đo lượng mưa có gia nhiệt',
      evidence: [productEvidence('product_name_en', product.product_name_en)],
    });
  }
  return capabilities;
};

const collectAliases = (product, normalized) => {
  const aliases = [
    {
      value: product.model,
      type: 'model',
      language: 'und',
      evidence: [productEvidence('model', product.model)],
    },
    {
      value: product.product_id,
      type: 'product_id',
      language: 'und',
      evidence: [productEvidence('product_id', product.product_id)],
    },
    {
      value: product.product_name_en,
      type: 'canonical_name',
      language: 'en',
      evidence: [productEvidence('product_name_en', product.product_name_en)],
    },
  ];
  for (const specification of normalized.specifications) {
    if (
      specification.name_raw.toLocaleLowerCase('en-US') === 'product name' &&
      typeof specification.value_raw === 'string' &&
      specification.value_raw.trim() !== ''
    ) {
      aliases.push({
        value: specification.value_raw,
        type: 'source_name',
        language: 'en',
        evidence: [specificationEvidence(specification)],
      });
    }
  }
  return uniqueBy(aliases, (alias) => alias.value.toLocaleLowerCase('en-US'));
};

const deriveKeywords = ({
  product,
  nameVi,
  taxonomy,
  measurements,
  applications,
  protocols,
  capabilities,
  aliases,
}) => {
  const supportedProtocols = protocols
    .filter((protocol) => protocol.relation === 'supported')
    .map((protocol) => protocol.name);
  return {
    en: uniqueStrings([
      product.model,
      product.product_name_en,
      taxonomy.category,
      taxonomy.subcategory,
      taxonomy.device_type,
      ...measurements.flatMap((item) => [
        item.label_en,
        ...definitionAliases(measurementDefinitions, item.key),
      ]),
      ...applications.flatMap((item) => [
        item.label_en,
        ...definitionAliases(applicationDefinitions, item.key),
      ]),
      ...supportedProtocols,
      ...capabilities.map((item) => item.label_en),
      ...aliases.map((alias) => alias.value),
    ]),
    vi: uniqueStrings([
      product.model,
      nameVi,
      TAXONOMY_VI[taxonomy.category_key],
      TAXONOMY_VI[taxonomy.subcategory_key],
      TAXONOMY_VI[taxonomy.device_type_key],
      ...measurements.map((item) => item.label_vi),
      ...applications.map((item) => item.label_vi),
      ...supportedProtocols,
      ...capabilities.map((item) => item.label_vi),
    ]),
  };
};

const definitionAliases = (definitions, key) =>
  definitions.find((definition) => definition.key === key)?.aliases ?? [];

const createProductDocument = (product, normalized, diagnostics) => {
  const taxonomy = taxonomyFor(product);
  const measurements = collectMeasurements(product, normalized);
  const applications = collectApplications(normalized);
  const protocols = collectProtocols(normalized, diagnostics);
  const capabilities = collectCapabilities(product, measurements);
  const aliases = collectAliases(product, normalized);
  const nameVi =
    NAME_VI_OVERRIDES[product.product_id] ??
    (PRESERVED_NAMES.has(product.product_name_en)
      ? product.product_name_en
      : null);
  const searchKeywords = deriveKeywords({
    product,
    nameVi,
    taxonomy,
    measurements,
    applications,
    protocols,
    capabilities,
    aliases,
  });
  return {
    schema_version: '1.0',
    product_id: product.product_id,
    model: product.model,
    name_en: product.product_name_en,
    name_vi: nameVi,
    taxonomy,
    measurements,
    applications,
    protocols,
    capabilities,
    aliases,
    search_keywords: searchKeywords,
  };
};

const ontologyConcepts = (documents, field, definitions) => {
  const used = new Set(
    documents.flatMap((document) => document[field].map((item) => item.key)),
  );
  return definitions
    .filter((definition) => used.has(definition.key))
    .map(({ key, label_en, label_vi, aliases }) => ({
      key,
      label_en,
      label_vi,
      aliases,
    }));
};

const taxonomyVocabulary = (documents, valueField, keyField) =>
  uniqueBy(
    documents.map((document) => ({
      source_value: document.taxonomy[valueField],
      key: document.taxonomy[keyField],
      label_en: document.taxonomy[valueField],
      label_vi: TAXONOMY_VI[document.taxonomy[keyField]] ?? null,
    })),
    (item) => item.source_value,
  ).sort((a, b) => a.key.localeCompare(b.key, 'en-US'));

const createOntology = (documents) => {
  const capabilities = uniqueBy(
    documents.flatMap((document) =>
      document.capabilities.map(({ key, label_en, label_vi }) => ({
        key,
        label_en,
        label_vi,
        aliases: [],
      })),
    ),
    (item) => item.key,
  );
  return {
    schema_version: '1.0',
    taxonomy: {
      categories: taxonomyVocabulary(documents, 'category', 'category_key'),
      subcategories: taxonomyVocabulary(
        documents,
        'subcategory',
        'subcategory_key',
      ),
      device_types: taxonomyVocabulary(
        documents,
        'device_type',
        'device_type_key',
      ),
    },
    measurements: ontologyConcepts(
      documents,
      'measurements',
      measurementDefinitions,
    ),
    applications: ontologyConcepts(
      documents,
      'applications',
      applicationDefinitions,
    ),
    capabilities,
    protocols: uniqueStrings(
      documents.flatMap((document) =>
        document.protocols.map((protocol) => protocol.name),
      ),
    ).sort((a, b) => a.localeCompare(b, 'en-US')),
    approved_aliases: {
      measurements: Object.fromEntries(
        ontologyConcepts(documents, 'measurements', measurementDefinitions)
          .filter((item) => item.aliases.length > 0)
          .map((item) => [item.key, item.aliases]),
      ),
      applications: Object.fromEntries(
        ontologyConcepts(documents, 'applications', applicationDefinitions)
          .filter((item) => item.aliases.length > 0)
          .map((item) => [item.key, item.aliases]),
      ),
    },
  };
};

const validatePlan = ({
  master,
  documents,
  ontology,
  normalizedById,
  diagnostics,
}) => {
  const active = master.filter((product) => product.status === 'active');
  const review = master.filter((product) => product.status === 'review');
  const enrichmentWithoutEvidence = [];
  const invalidRawRefs = [];
  const unknownMeasurements = [];
  const unknownApplications = [];
  const unknownCapabilities = [];
  const taxonomyUnmapped = [];
  const protocolRelationConflicts = [];
  const aliasCollisions = [];
  const duplicateKeywords = [];
  const measurementKeys = new Set(
    ontology.measurements.map((item) => item.key),
  );
  const applicationKeys = new Set(
    ontology.applications.map((item) => item.key),
  );
  const capabilityKeys = new Set(ontology.capabilities.map((item) => item.key));
  const aliasesByValue = new Map();

  for (const document of documents) {
    const normalized = normalizedById.get(document.product_id);
    const evidenceItems = [
      ...document.measurements,
      ...document.applications,
      ...document.protocols,
      ...document.capabilities,
      ...document.aliases,
    ];
    for (const item of evidenceItems) {
      if (!Array.isArray(item.evidence) || item.evidence.length === 0) {
        enrichmentWithoutEvidence.push({
          product_id: document.product_id,
          item,
        });
      }
      for (const evidence of item.evidence ?? []) {
        if (evidence.source === 'normalized_spec') {
          const specification =
            normalized?.specifications?.[evidence.raw_ref?.spec_index];
          if (
            !specification ||
            specification.canonical_key !== evidence.canonical_key ||
            JSON.stringify(specification.raw_ref) !==
              JSON.stringify(evidence.raw_ref)
          ) {
            invalidRawRefs.push({ product_id: document.product_id, evidence });
          }
        } else if (evidence.source === 'product_master') {
          const product = active.find(
            (candidate) => candidate.product_id === document.product_id,
          );
          if (!product || product[evidence.field] !== evidence.value) {
            enrichmentWithoutEvidence.push({
              product_id: document.product_id,
              evidence,
            });
          }
        }
      }
    }
    for (const item of document.measurements)
      if (!measurementKeys.has(item.key))
        unknownMeasurements.push({
          product_id: document.product_id,
          key: item.key,
        });
    for (const item of document.applications)
      if (!applicationKeys.has(item.key))
        unknownApplications.push({
          product_id: document.product_id,
          key: item.key,
        });
    for (const item of document.capabilities)
      if (!capabilityKeys.has(item.key))
        unknownCapabilities.push({
          product_id: document.product_id,
          key: item.key,
        });
    for (const key of ['category_key', 'subcategory_key', 'device_type_key']) {
      if (!TAXONOMY_VI[document.taxonomy[key]])
        taxonomyUnmapped.push({
          product_id: document.product_id,
          field: key,
          value: document.taxonomy[key],
        });
    }
    const relations = new Map();
    for (const protocol of document.protocols) {
      const relationEvidence = relations.get(protocol.name) ?? {
        supported: new Set(),
        unsupported: new Set(),
      };
      for (const evidence of protocol.evidence) {
        relationEvidence[protocol.relation].add(JSON.stringify(evidence));
      }
      relations.set(protocol.name, relationEvidence);
    }
    for (const [name, relationEvidence] of relations) {
      if (
        [...relationEvidence.supported].some((evidence) =>
          relationEvidence.unsupported.has(evidence),
        )
      ) {
        protocolRelationConflicts.push({
          product_id: document.product_id,
          name,
          reason: 'same_evidence_has_conflicting_relations',
        });
      }
    }
    for (const alias of document.aliases) {
      const key = alias.value.toLocaleLowerCase('en-US');
      const products = aliasesByValue.get(key) ?? new Set();
      products.add(document.product_id);
      aliasesByValue.set(key, products);
    }
    for (const language of ['en', 'vi']) {
      const values = document.search_keywords[language];
      if (
        new Set(values.map((value) => value.toLocaleLowerCase('en-US')))
          .size !== values.length
      )
        duplicateKeywords.push({ product_id: document.product_id, language });
    }
  }
  for (const [value, products] of aliasesByValue) {
    if (products.size > 1)
      aliasCollisions.push({ value, product_ids: [...products] });
  }

  const unsupportedSemanticClaims = [
    ...enrichmentWithoutEvidence,
    ...invalidRawRefs,
    ...unknownMeasurements,
    ...unknownApplications,
    ...unknownCapabilities,
  ];
  const blockingCount =
    (documents.length === active.length ? 0 : 1) +
    enrichmentWithoutEvidence.length +
    invalidRawRefs.length +
    unknownMeasurements.length +
    unknownApplications.length +
    unknownCapabilities.length +
    taxonomyUnmapped.length +
    protocolRelationConflicts.length +
    aliasCollisions.length +
    duplicateKeywords.length +
    unsupportedSemanticClaims.length;
  return {
    active,
    review,
    diagnostics: {
      enrichment_without_evidence: enrichmentWithoutEvidence,
      invalid_raw_refs: invalidRawRefs,
      unknown_measurements: unknownMeasurements,
      unknown_applications: unknownApplications,
      unknown_capabilities: unknownCapabilities,
      taxonomy_unmapped: taxonomyUnmapped,
      protocol_relation_conflicts: protocolRelationConflicts,
      alias_collisions: aliasCollisions,
      duplicate_keywords: duplicateKeywords,
      unsupported_semantic_claims: unsupportedSemanticClaims,
      protocol_relation_omissions: diagnostics.protocol_relation_omissions,
    },
    blockingCount,
  };
};

const hashInputs = (masterContent, normalizedEntries) => {
  const hash = createHash('sha256');
  hash.update(masterContent.replace(/\r\n/gu, '\n'));
  for (const entry of normalizedEntries) {
    hash.update(entry.file);
    hash.update(entry.content.replace(/\r\n/gu, '\n'));
  }
  return hash.digest('hex');
};

export const createEnrichmentPlan = async () => {
  const masterContent = await readFile(masterPath, 'utf8');
  const master = JSON.parse(masterContent);
  const normalizedFiles = (await readdir(normalizedDirectory))
    .filter((file) => file.endsWith('.json'))
    .sort();
  const normalizedEntries = await Promise.all(
    normalizedFiles.map(async (file) => {
      const content = await readFile(
        path.join(normalizedDirectory, file),
        'utf8',
      );
      return { file, content, data: JSON.parse(content) };
    }),
  );
  const normalizedById = new Map(
    normalizedEntries.map((entry) => [entry.data.product_id, entry.data]),
  );
  const diagnostics = { protocol_relation_omissions: [] };
  const documents = master
    .filter((product) => product.status === 'active')
    .map((product) =>
      createProductDocument(
        product,
        normalizedById.get(product.product_id),
        diagnostics,
      ),
    );
  const ontology = createOntology(documents);
  const validation = validatePlan({
    master,
    documents,
    ontology,
    normalizedById,
    diagnostics,
  });
  const measurementAssignments = documents.reduce(
    (total, document) => total + document.measurements.length,
    0,
  );
  const applicationAssignments = documents.reduce(
    (total, document) => total + document.applications.length,
    0,
  );
  const capabilityAssignments = documents.reduce(
    (total, document) => total + document.capabilities.length,
    0,
  );
  const aliases = documents.reduce(
    (total, document) => total + document.aliases.length,
    0,
  );
  const enKeywords = documents.reduce(
    (total, document) => total + document.search_keywords.en.length,
    0,
  );
  const viKeywords = documents.reduce(
    (total, document) => total + document.search_keywords.vi.length,
    0,
  );
  const supportedProtocols = documents.reduce(
    (total, document) =>
      total +
      document.protocols.filter((protocol) => protocol.relation === 'supported')
        .length,
    0,
  );
  const unsupportedProtocols = documents.reduce(
    (total, document) =>
      total +
      document.protocols.filter(
        (protocol) => protocol.relation === 'unsupported',
      ).length,
    0,
  );
  const translationReview = documents
    .filter((document) => document.name_vi === null)
    .map((document) => ({
      product_id: document.product_id,
      name_en: document.name_en,
      reason: 'conservative_translation_not_available',
    }));
  const report = {
    schema_version: '1.0',
    input_fingerprint_sha256: hashInputs(masterContent, normalizedEntries),
    validation_status: validation.blockingCount === 0 ? 'passed' : 'failed',
    summary: {
      total_master_products: master.length,
      active_products: validation.active.length,
      enriched_products: documents.length,
      skipped_products: validation.review.length,
      products_with_name_vi: documents.length - translationReview.length,
      products_requiring_translation_review: translationReview.length,
      measurement_concepts: ontology.measurements.length,
      total_measurement_assignments: measurementAssignments,
      application_concepts: ontology.applications.length,
      total_application_assignments: applicationAssignments,
      supported_protocol_assignments: supportedProtocols,
      unsupported_protocol_assignments: unsupportedProtocols,
      capability_concepts: ontology.capabilities.length,
      capability_assignments: capabilityAssignments,
      aliases,
      en_keywords: enKeywords,
      vi_keywords: viKeywords,
      enrichment_without_evidence_count:
        validation.diagnostics.enrichment_without_evidence.length,
      unknown_measurement_count:
        validation.diagnostics.unknown_measurements.length,
      unknown_application_count:
        validation.diagnostics.unknown_applications.length,
      unknown_capability_count:
        validation.diagnostics.unknown_capabilities.length,
      taxonomy_unmapped_count: validation.diagnostics.taxonomy_unmapped.length,
      protocol_relation_conflict_count:
        validation.diagnostics.protocol_relation_conflicts.length,
      alias_collision_count: validation.diagnostics.alias_collisions.length,
      duplicate_keyword_count: validation.diagnostics.duplicate_keywords.length,
      translation_review_count: translationReview.length,
      invalid_raw_ref_count: validation.diagnostics.invalid_raw_refs.length,
      unsupported_semantic_claim_count:
        validation.diagnostics.unsupported_semantic_claims.length,
      duplicate_product_artifact_count:
        documents.length -
        new Set(documents.map((document) => document.product_id)).size,
      blockers: validation.blockingCount,
    },
    skipped_products: validation.review.map((product) => ({
      product_id: product.product_id,
      model: product.model,
      status: product.status,
      reason: 'product_status_review',
    })),
    translation_review: translationReview,
    diagnostics: validation.diagnostics,
    outputs: documents.map(
      (document) => `data/enriched/products/${document.product_id}.json`,
    ),
  };
  return { documents, ontology, report };
};

export const writeEnrichmentOutputs = async ({
  documents,
  ontology,
  report,
}) => {
  await mkdir(outputDirectory, { recursive: true });
  await mkdir(path.dirname(ontologyPath), { recursive: true });
  await mkdir(path.dirname(reportPath), { recursive: true });
  const expected = new Set(
    documents.map((document) => `${document.product_id}.json`),
  );
  for (const file of (await readdir(outputDirectory)).filter((file) =>
    file.endsWith('.json'),
  )) {
    if (!expected.has(file)) await unlink(path.join(outputDirectory, file));
  }
  await Promise.all(
    documents.map((document) =>
      writeJsonIfChanged(
        path.join(outputDirectory, `${document.product_id}.json`),
        document,
      ),
    ),
  );
  await writeJsonIfChanged(ontologyPath, ontology);
  await writeJsonIfChanged(reportPath, report);
};

export const validateEnrichment = async () => {
  const expected = await createEnrichmentPlan();
  const errors = [];
  let actualOntology = null;
  let actualReport = null;
  try {
    actualOntology = await readJson(ontologyPath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  try {
    actualReport = await readJson(reportPath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const files = (await readdir(outputDirectory))
    .filter((file) => file.endsWith('.json'))
    .sort();
  const expectedByFile = new Map(
    expected.documents.map((document) => [
      `${document.product_id}.json`,
      document,
    ]),
  );
  for (const file of files) {
    if (!expectedByFile.has(file))
      errors.push({ code: 'unexpected_product_artifact', file });
    else if (
      JSON.stringify(await readJson(path.join(outputDirectory, file))) !==
      JSON.stringify(expectedByFile.get(file))
    )
      errors.push({ code: 'stale_or_modified_product_artifact', file });
  }
  for (const file of expectedByFile.keys())
    if (!files.includes(file))
      errors.push({ code: 'missing_product_artifact', file });
  if (JSON.stringify(actualOntology) !== JSON.stringify(expected.ontology))
    errors.push({ code: 'semantic_vocabulary_stale_or_modified' });
  if (JSON.stringify(actualReport) !== JSON.stringify(expected.report))
    errors.push({ code: 'semantic_report_stale_or_modified' });
  const passed =
    errors.length === 0 && expected.report.validation_status === 'passed';
  return {
    passed,
    errors,
    report: passed
      ? expected.report
      : { ...expected.report, validation_status: 'failed' },
  };
};

export const printSemanticSummary = (report) => {
  const summary = report.summary;
  console.log(`semantic_enrichment_status=${report.validation_status}`);
  console.log(`enriched_products=${summary.enriched_products}`);
  console.log(`skipped_products=${summary.skipped_products}`);
  console.log(`measurement_concepts=${summary.measurement_concepts}`);
  console.log(
    `measurement_assignments=${summary.total_measurement_assignments}`,
  );
  console.log(`application_concepts=${summary.application_concepts}`);
  console.log(
    `application_assignments=${summary.total_application_assignments}`,
  );
  console.log(`supported_protocols=${summary.supported_protocol_assignments}`);
  console.log(
    `unsupported_protocols=${summary.unsupported_protocol_assignments}`,
  );
  console.log(`capability_concepts=${summary.capability_concepts}`);
  console.log(`capability_assignments=${summary.capability_assignments}`);
  console.log(`aliases=${summary.aliases}`);
  console.log(`en_keywords=${summary.en_keywords}`);
  console.log(`vi_keywords=${summary.vi_keywords}`);
  console.log(`translation_review=${summary.translation_review_count}`);
  console.log(
    `enrichment_without_evidence=${summary.enrichment_without_evidence_count}`,
  );
  console.log(`invalid_raw_ref=${summary.invalid_raw_ref_count}`);
  console.log(
    `protocol_relation_conflicts=${summary.protocol_relation_conflict_count}`,
  );
  console.log(
    `unsupported_semantic_claims=${summary.unsupported_semantic_claim_count}`,
  );
  console.log(`blockers=${summary.blockers}`);
};

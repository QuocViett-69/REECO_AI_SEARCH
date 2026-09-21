const keys = (items) => new Set(items.map((item) => item.key));

export function supportsProtocol(document, protocol) {
  return document.supported_protocols.some((item) => protocol === 'Modbus' ? item === 'Modbus' || item.startsWith('Modbus ') : item === protocol);
}

export function isSensor(document) {
  return document.taxonomy.category_key === 'sensors' || document.taxonomy.device_type_key.includes('sensor');
}

export function isLogger(document) {
  return document.taxonomy.device_type_key.includes('data_logger');
}

function taxonomyRelated(document, measurement) {
  const taxonomy = `${document.taxonomy.subcategory_key} ${document.taxonomy.device_type_key}`;
  const terms = {
    volumetric_water_content: ['soil_moisture'], relative_humidity: ['humidity', 'weather_sensor'],
    precipitation: ['precipitation', 'rain'], water_level: ['water_level', 'water-level'],
    wind_speed: ['wind'], solar_radiation: ['solar_radiation', 'pyranometer', 'radiometer'],
    barometric_pressure: ['barometric_pressure'], leaf_wetness: ['leaf_wetness'],
    snow_depth: ['snow'], air_temperature: ['air_temperature', 'weather_sensor'],
    soil_temperature: ['soil_temperature', 'soil_moisture'],
  }[measurement] ?? [];
  return terms.some((term) => taxonomy.includes(term));
}

export function functionMatch(query, document) {
  if (query.constraints.measurement_key) {
    return keys(document.measurements).has(query.constraints.measurement_key) || taxonomyRelated(document, query.constraints.measurement_key);
  }
  return isLogger(document);
}

export function gradeEvidence(query, document, candidate = null) {
  const measurements = keys(document.measurements);
  if (query.category === 'protocol') {
    const supported = supportsProtocol(document, query.constraints.protocol);
    const wantsSensor = /sensor|cảm biến/iu.test(query.query);
    const wantsLogger = /logger|bộ ghi/iu.test(query.query);
    const roleMatch = wantsSensor ? isSensor(document) : wantsLogger ? isLogger(document) : true;
    return { relevance: supported && roleMatch ? 3 : supported || roleMatch ? 1 : 0, reason: `protocol=${supported ? 'supported' : 'not-supported'}; role=${roleMatch ? 'match' : 'mismatch'}` };
  }
  if (query.category === 'technical_numeric') {
    const state = candidate?.technical_state?.temperature?.[0]?.result ?? 'UNKNOWN';
    return { relevance: state === 'MATCH' ? 3 : 0, reason: `normalized-temperature=${state}` };
  }
  if (query.category === 'semantic') {
    const key = query.constraints.measurement_key;
    const paired = query.id === 'q066' || query.id === 'q067'
      ? ['volumetric_water_content', 'soil_electrical_conductivity']
      : query.id === 'q068' || query.id === 'q069'
        ? ['air_temperature', 'relative_humidity']
        : query.id === 'q074' || query.id === 'q075'
          ? ['wind_speed', 'wind_direction'] : null;
    if (paired) {
      const count = paired.filter((item) => measurements.has(item)).length;
      return { relevance: count === paired.length ? 3 : count === 1 ? 2 : taxonomyRelated(document, key) ? 1 : 0, reason: `measurements=${count}/${paired.length}` };
    }
    const applicationMatch = document.applications.some((item) => item.key.includes(key.replace('volumetric_', '').replace('barometric_', '')));
    return { relevance: measurements.has(key) || applicationMatch ? 3 : taxonomyRelated(document, key) ? 2 : 0, reason: measurements.has(key) ? `measurement=${key}` : applicationMatch ? `application=${key}` : taxonomyRelated(document, key) ? `taxonomy=${key}` : 'no-functional-evidence' };
  }
  if (query.category === 'mixed_constraint') {
    const functional = functionMatch(query, document);
    const protocol = supportsProtocol(document, query.constraints.protocol);
    return { relevance: functional && protocol ? 3 : functional || protocol ? 1 : 0, reason: `function=${functional ? 'match' : 'mismatch'}; protocol=${protocol ? 'supported' : 'not-supported'}` };
  }
  if (query.category === 'negative_or_ambiguous') {
    if (query.id === 'q096') return { relevance: isSensor(document) ? 1 : 0, reason: isSensor(document) ? 'broad-sensor-taxonomy' : 'not-a-sensor' };
    if (query.id === 'q097') return { relevance: 1, reason: 'broad-industrial-catalog-match' };
    if (query.id === 'q098') return { relevance: document.taxonomy.category_key === 'measurement_devices' ? 2 : isSensor(document) ? 1 : 0, reason: `taxonomy=${document.taxonomy.category_key}` };
    return { relevance: 0, reason: query.id === 'q099' ? 'no-PROFINET-evidence' : 'no--200C-specification-evidence' };
  }
  throw new Error(`Unsupported review category ${query.category}`);
}

import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(scriptsDirectory, '..', '..');
export const masterPath = path.join(
  projectRoot,
  'data',
  'master',
  'product-master.json',
);
export const productMasterReportPath = path.join(
  projectRoot,
  'data',
  'reports',
  'product-master-report.json',
);
export const rawDirectory = path.join(projectRoot, 'data', 'raw');
export const outputDirectory = path.join(
  projectRoot,
  'data',
  'normalized',
  'specifications',
);
export const normalizationReportPath = path.join(
  projectRoot,
  'data',
  'reports',
  'spec-normalization-report.json',
);
export const missingRawManifestPath = path.join(
  projectRoot,
  'data',
  'reports',
  'missing-raw-products.json',
);

const VARIANT_RAW_CANDIDATES = {
  CSI_AM16_32B_ST: [{ file: 'AM16_32B-XT.json', product_index: 0 }],
  CSI_ASPEN10_CELL_ST: [{ file: 'Aspen10-CELL-XT.json', product_index: 0 }],
  CSI_CR1000XE_ST_CC: [{ file: 'CR1000Xe-XT-CC.json', product_index: 0 }],
  CSI_CR6_NA_ST_CC: [{ file: 'CR6-NA-XT-CC.json', product_index: 0 }],
};

const NUMBER_SOURCE =
  '[+\\-−]?(?:(?:\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.\\d+)?|\\.\\d+)';
const QUALIFIER_SOURCE =
  '(<=|>=|<|>|≤|≥|±|~|approximately|approx\\.?|up\\s+to|minimum|maximum)';
const RANGE_BODY_SOURCE = `(${NUMBER_SOURCE})\\s*(.*?)\\s+(?:to|through|–|—)\\s+(${NUMBER_SOURCE})\\s*(.*?)`;
const RANGE_PATTERN = new RegExp(
  `^\\s*(?:${QUALIFIER_SOURCE}\\s*)?${RANGE_BODY_SOURCE}\\s*$`,
  'iu',
);
const DUAL_RANGE_PATTERN = new RegExp(
  `^\\s*(?:${QUALIFIER_SOURCE}\\s*)?${RANGE_BODY_SOURCE}\\s*\\(\\s*${RANGE_BODY_SOURCE}\\s*\\)\\.?\\s*$`,
  'iu',
);
const NUMBER_PATTERN = new RegExp(
  `^\\s*(?:${QUALIFIER_SOURCE}\\s*)?(${NUMBER_SOURCE})\\s*(.*?)\\s*$`,
  'iu',
);
const DUAL_NUMBER_PATTERN = new RegExp(
  `^\\s*(?:${QUALIFIER_SOURCE}\\s*)?(${NUMBER_SOURCE})\\s*([^()|;]+?)\\s*\\(\\s*(${NUMBER_SOURCE})\\s*([^()|;]+?)\\s*\\)\\.?\\s*$`,
  'iu',
);

const UNIT_ALIASES = new Map(
  [
    ['°c', '°C'],
    ['ºc', '°C'],
    ['deg c', '°C'],
    ['degree c', '°C'],
    ['degrees c', '°C'],
    ['c', '°C'],
    ['vdc', 'V DC'],
    ['v dc', 'V DC'],
    ['v ac', 'V AC'],
    ['vac', 'V AC'],
    ['v', 'V'],
    ['mv', 'mV'],
    ['µv', 'µV'],
    ['uv', 'µV'],
    ['a', 'A'],
    ['ma', 'mA'],
    ['µa', 'µA'],
    ['ua', 'µA'],
    ['na', 'nA'],
    ['w', 'W'],
    ['µw', 'µW'],
    ['uw', 'µW'],
    ['mw', 'mW'],
    ['kw', 'kW'],
    ['mm', 'mm'],
    ['cm', 'cm'],
    ['m', 'm'],
    ['km', 'km'],
    ['nm', 'nm'],
    ['µm', 'µm'],
    ['um', 'µm'],
    ['in', 'in'],
    ['inch', 'in'],
    ['inches', 'in'],
    ['ft', 'ft'],
    ['feet', 'ft'],
    ['g', 'g'],
    ['kg', 'kg'],
    ['lb', 'lb'],
    ['lbs', 'lb'],
    ['hz', 'Hz'],
    ['khz', 'kHz'],
    ['mhz', 'MHz'],
    ['ghz', 'GHz'],
    ['rpm', 'rpm'],
    ['s', 's'],
    ['sec', 's'],
    ['second', 's'],
    ['seconds', 's'],
    ['ms', 'ms'],
    ['µs', 'µs'],
    ['us', 'µs'],
    ['ns', 'ns'],
    ['min', 'min'],
    ['minute', 'min'],
    ['minutes', 'min'],
    ['h', 'h'],
    ['hr', 'h'],
    ['hour', 'h'],
    ['hours', 'h'],
    ['day', 'day'],
    ['days', 'day'],
    ['year', 'year'],
    ['years', 'year'],
    ['%', '%'],
    ['% rh', '% RH'],
    ['°', '°'],
    ['deg', '°'],
    ['degree', '°'],
    ['degrees', '°'],
    ['ω', 'Ω'],
    ['ohm', 'Ω'],
    ['ohms', 'Ω'],
    ['kω', 'kΩ'],
    ['kohm', 'kΩ'],
    ['kohms', 'kΩ'],
    ['mω', 'MΩ'],
    ['mohm', 'MΩ'],
    ['mohms', 'MΩ'],
    ['bps', 'bps'],
    ['kbps', 'kbps'],
    ['mbps', 'Mbps'],
    ['gbps', 'Gbps'],
    ['db', 'dB'],
    ['dbm', 'dBm'],
    ['m/s', 'm/s'],
    ['cm/s', 'cm/s'],
    ['mm/h', 'mm/h'],
    ['in/h', 'in/h'],
    ['in./h', 'in/h'],
    ['w/m²', 'W/m²'],
    ['w/m2', 'W/m²'],
    ['w m⁻²', 'W/m²'],
    ['w/m²/mv', 'W/m²/mV'],
    ['mv/w/m²', 'mV/W/m²'],
    ['pa', 'Pa'],
    ['hpa', 'hPa'],
    ['kpa', 'kPa'],
    ['psig', 'psig'],
    ['hpa/year', 'hPa/year'],
    ['ms/day', 'ms/day'],
    ['µw/cm²', 'µW/cm²'],
    ['uw/cm2', 'µW/cm²'],
    ['ah', 'Ah'],
    ['mah', 'mAh'],
    ['n·m', 'N·m'],
    ['n-m', 'N·m'],
    ['ds/m', 'dS/m'],
    ['m³', 'm³'],
    ['m3', 'm³'],
    ['cm³', 'cm³'],
    ['cm3', 'cm³'],
    ['byte', 'bytes'],
    ['bytes', 'bytes'],
    ['kb', 'KB'],
    ['mb', 'MB'],
    ['gb', 'GB'],
    ['bit', 'bits'],
    ['bits', 'bits'],
    ['fnu', 'FNU'],
    ['ntu', 'NTU'],
    ['ppm', 'ppm'],
    ['strike', 'strikes'],
    ['strikes', 'strikes'],
    ['oz', 'oz'],
    ['mi', 'mi'],
    ['mph', 'mph'],
    ['cm²', 'cm²'],
    ['cm2', 'cm²'],
    ['in²', 'in²'],
    ['in2', 'in²'],
    ['ft·lb', 'ft·lb'],
    ['ft-lb', 'ft·lb'],
    ['in·lb', 'in·lb'],
    ['in-lb', 'in·lb'],
  ].map(([alias, canonical]) => [alias.toLocaleLowerCase('en-US'), canonical]),
);

const PROTOCOL_PATTERNS = [
  ['Modbus RTU', /\bmodbus\s+rtu\b/iu],
  ['Modbus ASCII', /\bmodbus\s+ascii\b|\bmodbus\s+rtu\s*\/\s*ascii\b/iu],
  ['Modbus TCP', /\bmodbus\s+tcp\b|\bmodbus\s+rtu\s*\/\s*ascii\s*\/\s*tcp\b/iu],
  ['SDI-12', /\bsdi[\s_-]*12\b/iu],
  ['RS-232', /\brs[\s_-]*232\b/iu],
  ['RS-422', /\brs[\s_-]*422\b/iu],
  ['RS-485', /\brs[\s_-]*485\b/iu],
  ['4-20 mA', /\b4\s*[-–—]\s*20\s*ma\b/iu],
  ['Ethernet', /\bethernet\b/iu],
  ['Wi-Fi', /\bwi[\s_-]*fi\b/iu],
  ['USB', /\busb\b/iu],
  ['RJ45', /\brj[\s_-]*45\b/iu],
  ['SIM', /\b(?:mini[\s_-]*)?sim\b/iu],
  ['TCP/IP', /\btcp\s*\/\s*ip\b/iu],
  ['IPv4', /\bipv4\b/iu],
  ['IPv6', /\bipv6\b/iu],
  ['ICMP', /\bicmp\b/iu],
  ['PPP', /\bppp\b/iu],
  ['RNDIS', /\brndis\b/iu],
  ['Auto-IP', /\bauto[\s_-]*ip\b/iu],
  ['UDP', /\budp\b/iu],
  ['TCP', /\btcp\b/iu],
  ['TLS', /\btls\b/iu],
  ['DNS', /\bdns\b/iu],
  ['DHCP', /\bdhcp\b/iu],
  ['SLAAC', /\bslaac\b/iu],
  ['Telnet', /\btelnet\b/iu],
  ['HTTPS', /\bhttps\b/iu],
  ['HTTP', /\bhttp\b/iu],
  ['FTPS', /\bftps\b/iu],
  ['FTP', /\bftp\b/iu],
  ['POP3', /\bpop3\b/iu],
  ['NTP', /\bntp\b/iu],
  ['SMTP', /\bsmtp\b/iu],
  ['MQTT', /\bmqtt\b/iu],
  ['PakBus', /\bpakbus\b/iu],
  ['DNP3', /\bdnp3\b/iu],
  ['CS I/O', /\bcs\s+i\s*\/\s*o\b/iu],
  ['CPI', /\bcpi\b/iu],
  ['ASCII', /\bascii\b/iu],
];

const BOOLEAN_VALUES = new Map([
  ['yes', true],
  ['true', true],
  ['supported', true],
  ['enabled', true],
  ['no', false],
  ['false', false],
  ['not supported', false],
  ['disabled', false],
  ['required', true],
  ['not required', false],
  ['included', true],
  ['not included', false],
  ['replaceable', true],
  ['not replaceable', false],
  ['interchangeable', true],
  ['not interchangeable', false],
  ['compliant', true],
  ['non-compliant', false],
]);

const BOOLEAN_FIELD_PATTERN =
  /\b(?:required|supported|included|replaceable|interchangeable|compliant|enabled)\b/iu;
const PROTOCOL_FIELD_PATTERN =
  /\b(?:protocols?|interfaces?|communications?|outputs?|ports?)\b|\bsignal\s*type\b/iu;
const UNKNOWN_PROTOCOL_FIELD_PATTERN = /\bprotocols?\b/iu;
const NON_UNIT_TOKENS = new Set([
  'npt',
  'route',
  'routes',
  'terminal',
  'terminals',
]);
const VALID_QUALIFIERS = new Set([
  '<',
  '≤',
  '>',
  '≥',
  '±',
  '~',
  'approximately',
  'minimum',
  'maximum',
]);

const readJson = async (filePath) =>
  JSON.parse(await readFile(filePath, 'utf8'));

const relativePath = (filePath) =>
  path.relative(projectRoot, filePath).split(path.sep).join('/');

const parseNumber = (value) =>
  Number(value.replaceAll(',', '').replace('−', '-'));

const cleanUnit = (value) =>
  value
    .trim()
    .replace(/^\((.*)\)$/u, '$1')
    .replace(/[.,;:]$/u, '')
    .replace(/\s+/gu, ' ');

const normalizeUnit = (value) => {
  const cleaned = cleanUnit(value);
  if (cleaned === '') return { unit: null, known: true };
  const unit = UNIT_ALIASES.get(cleaned.toLocaleLowerCase('en-US'));
  return unit
    ? { unit, known: true }
    : { unit: null, known: false, unit_raw: cleaned };
};

const isPlausibleUnitToken = (value) => {
  const cleaned = cleanUnit(value);
  return (
    cleaned.length > 0 &&
    cleaned.length <= 20 &&
    !NON_UNIT_TOKENS.has(cleaned.toLocaleLowerCase('en-US')) &&
    /^[\p{L}°ºµμΩ%][\p{L}\d°ºµμΩ%/²³⁻.\-]*(?:\s+(?:DC|AC|RH))?$/iu.test(cleaned)
  );
};

const normalizeQualifier = (value) => {
  if (!value) return null;
  const normalized = value.trim().toLocaleLowerCase('en-US');
  if (normalized === '<=' || normalized === '≤' || normalized === 'up to') {
    return '≤';
  }
  if (normalized === '>=' || normalized === '≥') return '≥';
  if (normalized === 'approx' || normalized === 'approx.') {
    return 'approximately';
  }
  return normalized;
};

const isProtocolField = (nameRaw) => PROTOCOL_FIELD_PATTERN.test(nameRaw);

const clauseBounds = (value, matchIndex, matchLength) => {
  const before = value.slice(0, matchIndex);
  const after = value.slice(matchIndex + matchLength);
  const previousBoundary = Math.max(
    before.lastIndexOf('|'),
    before.lastIndexOf(';'),
  );
  const boundaryOffsets = [after.indexOf('|'), after.indexOf(';')].filter(
    (index) => index >= 0,
  );
  const nextBoundary =
    boundaryOffsets.length === 0
      ? value.length
      : matchIndex + matchLength + Math.min(...boundaryOffsets);
  return { start: previousBoundary + 1, end: nextBoundary };
};

const isNegatedProtocolMention = (value, matchIndex, matchLength) => {
  const bounds = clauseBounds(value, matchIndex, matchLength);
  const mentionStart = matchIndex - bounds.start;
  const mentionEnd = mentionStart + matchLength;
  const clause = value.slice(bounds.start, bounds.end);
  const prefix = clause.slice(0, mentionStart);
  const suffix = clause.slice(mentionEnd);
  return (
    /(?:\bdoes\s+not\s+support\b|\bnot\s+powered\s+over\b|\bwithout\b|\bunavailable\b|\bnot\b)[^,]{0,80}$/iu.test(
      prefix,
    ) ||
    /^[^|;]{0,80}\b(?:does\s+not\s+support|not\s+supported|unsupported|not\s+operational|unavailable|without)\b/iu.test(
      suffix,
    )
  );
};

const classifyProtocols = (value) => {
  let mentions = PROTOCOL_PATTERNS.flatMap(([protocol, pattern]) => {
    const match = pattern.exec(value);
    return match
      ? [
          {
            protocol,
            unsupported: isNegatedProtocolMention(
              value,
              match.index,
              match[0].length,
            ),
          },
        ]
      : [];
  });

  if (
    /\bmodbus\b/iu.test(value) &&
    !mentions.some(({ protocol }) => protocol.startsWith('Modbus '))
  ) {
    const match = /\bmodbus\b/iu.exec(value);
    mentions.unshift({
      protocol: 'Modbus',
      unsupported: isNegatedProtocolMention(
        value,
        match.index,
        match[0].length,
      ),
    });
  }

  const coveredGenericProtocols = new Set();
  if (mentions.some(({ protocol }) => protocol === 'TCP/IP')) {
    coveredGenericProtocols.add('TCP');
  }
  if (mentions.some(({ protocol }) => protocol === 'HTTPS')) {
    coveredGenericProtocols.add('HTTP');
  }
  if (mentions.some(({ protocol }) => protocol === 'FTPS')) {
    coveredGenericProtocols.add('FTP');
  }
  if (mentions.some(({ protocol }) => protocol === 'Modbus TCP')) {
    coveredGenericProtocols.add('TCP');
  }
  if (mentions.some(({ protocol }) => protocol === 'Modbus ASCII')) {
    coveredGenericProtocols.add('ASCII');
  }
  mentions = mentions.filter(
    ({ protocol }) => !coveredGenericProtocols.has(protocol),
  );

  const supportedProtocols = [];
  const unsupportedProtocols = [];
  for (const mention of mentions) {
    const target = mention.unsupported
      ? unsupportedProtocols
      : supportedProtocols;
    if (!target.includes(mention.protocol)) target.push(mention.protocol);
  }
  return { supportedProtocols, unsupportedProtocols };
};

const createProtocolFacets = ({ supportedProtocols, unsupportedProtocols }) => {
  if (supportedProtocols.length === 0 && unsupportedProtocols.length === 0) {
    return undefined;
  }
  return {
    supported_protocols: supportedProtocols,
    unsupported_protocols: unsupportedProtocols,
  };
};

const unitsAreCompatible = (firstUnit, secondUnit) => {
  if (!firstUnit.known || !secondUnit.known) return false;
  if (
    !firstUnit.unit ||
    !secondUnit.unit ||
    firstUnit.unit === secondUnit.unit
  ) {
    return true;
  }
  const pair = new Set([firstUnit.unit, secondUnit.unit]);
  return pair.has('°') && pair.has('°C');
};

const selectRangeUnit = (firstUnit, secondUnit) =>
  firstUnit.unit === '°' && secondUnit.unit === '°C'
    ? '°C'
    : (firstUnit.unit ?? secondUnit.unit);

const parseRangeParts = (minRaw, firstUnitRaw, maxRaw, secondUnitRaw) => {
  const minValue = parseNumber(minRaw);
  const maxValue = parseNumber(maxRaw);
  const firstUnit = normalizeUnit(firstUnitRaw);
  const secondUnit = normalizeUnit(secondUnitRaw);
  const compatible = unitsAreCompatible(firstUnit, secondUnit);
  return {
    minValue,
    maxValue,
    firstUnit,
    secondUnit,
    compatible,
    unit: compatible ? selectRangeUnit(firstUnit, secondUnit) : null,
  };
};

const UNIT_QUANTITY_GROUPS = new Map(
  [
    ['frequency', ['Hz', 'kHz', 'MHz', 'GHz']],
    ['data_rate', ['bps', 'kbps', 'Mbps', 'Gbps']],
    ['time', ['ns', 'µs', 'ms', 's', 'min', 'h', 'day', 'year']],
    ['length', ['mm', 'cm', 'm', 'km', 'in', 'ft', 'mi']],
    ['mass', ['g', 'kg', 'oz', 'lb']],
    ['current', ['µA', 'nA', 'mA', 'A']],
    ['voltage', ['µV', 'mV', 'V', 'V DC', 'V AC']],
    ['power', ['µW', 'mW', 'W', 'kW']],
  ].flatMap(([quantity, units]) => units.map((unit) => [unit, quantity])),
);

const endpointsSharePhysicalQuantity = (firstUnit, secondUnit) =>
  firstUnit &&
  secondUnit &&
  UNIT_QUANTITY_GROUPS.get(firstUnit) === UNIT_QUANTITY_GROUPS.get(secondUnit);

const extractSafeRangeContext = (value) => {
  const dependingMatch = value.match(/^(.*?)\s+(depending\s+on\s+.+)$/iu);
  if (dependingMatch) {
    return { value: dependingMatch[1], condition: dependingMatch[2] };
  }
  const trailingWithMatch = value.match(/^(.*\))\s+(with\s+.+)$/iu);
  if (trailingWithMatch) {
    return { value: trailingWithMatch[1], condition: trailingWithMatch[2] };
  }
  const conditionMatch = value.match(
    /^(.*?)\s+\(((?:for|with)\s+[^()]+)\)\s*$/iu,
  );
  if (conditionMatch) {
    return { value: conditionMatch[1], condition: conditionMatch[2] };
  }
  const parentheticalNoteMatch = value.match(
    /^(.*?)\s+\((software-selectable)\)\s*$/iu,
  );
  if (parentheticalNoteMatch) {
    return {
      value: parentheticalNoteMatch[1],
      note: parentheticalNoteMatch[2],
    };
  }
  const commaNoteMatch = value.match(/^(.*?),\s*(standard)\s*$/iu);
  if (commaNoteMatch) {
    return { value: commaNoteMatch[1], note: commaNoteMatch[2] };
  }
  return { value };
};

const canonicalSlug = (value) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLocaleLowerCase('en-US')
    .replace(/\bi\s*\/\s*o\b/gu, ' io ')
    .replace(/&/gu, ' and ')
    .replace(/%/gu, ' percent ')
    .replace(/\//gu, ' per ')
    .replace(/\+/gu, ' plus ')
    .replace(/[^a-z0-9]+/gu, '_')
    .replace(/^_+|_+$/gu, '')
    .replace(/_+/gu, '_');

const GENERIC_CANONICAL_NAMES = new Set([
  'accuracy',
  'dimensions',
  'measurement_range',
  'operating_range',
  'output',
  'range',
  'resolution',
  'weight',
]);

const genericSection = (section) =>
  !section || /^(?:general\s+specifications?|specifications?)$/iu.test(section);

const deriveQuantityKind = (nameRaw, section) => {
  const name = `${section ?? ''} ${nameRaw}`.toLocaleLowerCase('en-US');
  const rules = [
    ['temperature', /\btemperature\b/iu],
    ['relative_humidity', /\brelative\s+humidity\b|%\s*rh\b|\brh\b/iu],
    ['voltage', /\bvoltage\b|\bvolt\b/iu],
    ['current', /\bcurrent\b/iu],
    ['frequency', /\bfrequency\b/iu],
    ['pressure', /\bpressure\b|\bbarometric\b/iu],
    ['data_rate', /\b(?:data|communication)\s+rate\b|\bbaud\b/iu],
    ['time', /\btime\b|\binterval\b|\bperiod\b/iu],
    ['mass', /\bweight\b|\bmass\b/iu],
    ['torque', /\btorque\b/iu],
    ['power', /\bpower\b/iu],
    ['speed', /\bspeed\b|\bvelocity\b/iu],
    [
      'length',
      /\blength\b|\bdepth\b|\bdiameter\b|\bdistance\b|\bheight\b|\bwidth\b/iu,
    ],
  ];
  return rules.find(([, pattern]) => pattern.test(name))?.[0] ?? null;
};

const assignCanonicalMetadata = (specifications) => {
  const baseEntries = specifications.map((specification) => {
    const nameKey = canonicalSlug(specification.name_raw);
    const sectionKey = canonicalSlug(specification.section ?? '');
    const needsSection =
      GENERIC_CANONICAL_NAMES.has(nameKey) &&
      sectionKey &&
      !genericSection(specification.section);
    return {
      specification,
      signature: `${specification.section ?? ''}\u0000${specification.name_raw}`,
      key: needsSection ? `${sectionKey}_${nameKey}` : nameKey,
    };
  });
  const signaturesByKey = new Map();
  for (const entry of baseEntries) {
    if (!entry.key) continue;
    const signatures = signaturesByKey.get(entry.key) ?? new Set();
    signatures.add(entry.signature);
    signaturesByKey.set(entry.key, signatures);
  }

  return baseEntries.map(({ specification, signature, key }) => {
    let canonicalKey = key;
    if (canonicalKey && signaturesByKey.get(canonicalKey)?.size > 1) {
      canonicalKey = `${canonicalKey}_${createHash('sha256')
        .update(signature)
        .digest('hex')
        .slice(0, 8)}`;
    }
    const quantityKind = deriveQuantityKind(
      specification.name_raw,
      specification.section,
    );
    return {
      ...specification,
      ...(canonicalKey ? { canonical_key: canonicalKey } : {}),
      ...(quantityKind ? { quantity_kind: quantityKind } : {}),
    };
  });
};

const diagnostic = (productId, rawRef, nameRaw, valueRaw, details = {}) => ({
  product_id: productId,
  name_raw: nameRaw,
  value_raw: valueRaw,
  raw_ref: rawRef,
  ...details,
});

const rawValueText = (value) =>
  value === null || value === undefined ? '' : String(value);

const normalizeValue = ({ productId, nameRaw, valueRaw, rawRef }) => {
  const parseWarnings = [];
  const unknownUnits = [];
  const unknownProtocols = [];
  const invalidRanges = [];
  const trimmed = rawValueText(valueRaw).trim();
  const protocolClassification = classifyProtocols(trimmed);
  const facets = createProtocolFacets(protocolClassification);
  const numericContext = extractSafeRangeContext(trimmed);

  if (
    protocolClassification.supportedProtocols.length > 0 &&
    isProtocolField(nameRaw)
  ) {
    return {
      type: 'protocol',
      normalized: {
        type: 'protocol',
        values: protocolClassification.supportedProtocols,
      },
      facets,
      parseWarnings,
      unknownUnits,
      unknownProtocols,
      invalidRanges,
    };
  }

  if (
    UNKNOWN_PROTOCOL_FIELD_PATTERN.test(nameRaw) &&
    trimmed !== '' &&
    !facets
  ) {
    unknownProtocols.push(
      diagnostic(productId, rawRef, nameRaw, valueRaw, {
        reason: 'protocol_or_interface_name_without_known_canonical_value',
      }),
    );
  }

  const boolean = BOOLEAN_VALUES.get(trimmed.toLocaleLowerCase('en-US'));
  if (boolean !== undefined && BOOLEAN_FIELD_PATTERN.test(nameRaw)) {
    return {
      type: 'boolean',
      normalized: { type: 'boolean', value: boolean },
      facets,
      parseWarnings,
      unknownUnits,
      unknownProtocols,
      invalidRanges,
    };
  }

  const dualRangeMatch = numericContext.value.match(DUAL_RANGE_PATTERN);
  if (dualRangeMatch) {
    const primary = parseRangeParts(
      dualRangeMatch[2],
      dualRangeMatch[3],
      dualRangeMatch[4],
      dualRangeMatch[5],
    );
    const alternate = parseRangeParts(
      dualRangeMatch[6],
      dualRangeMatch[7],
      dualRangeMatch[8],
      dualRangeMatch[9],
    );
    if (
      primary.compatible &&
      alternate.compatible &&
      primary.unit &&
      alternate.unit &&
      primary.minValue <= primary.maxValue &&
      alternate.minValue <= alternate.maxValue
    ) {
      return {
        type: 'range',
        normalized: {
          type: 'range',
          min_value: primary.minValue,
          max_value: primary.maxValue,
          unit: primary.unit,
          qualifier: normalizeQualifier(dualRangeMatch[1]),
          alternate: {
            min_value: alternate.minValue,
            max_value: alternate.maxValue,
            unit: alternate.unit,
          },
          ...(numericContext.condition
            ? { condition: numericContext.condition }
            : {}),
          ...(numericContext.note ? { note: numericContext.note } : {}),
        },
        facets,
        parseWarnings,
        unknownUnits,
        unknownProtocols,
        invalidRanges,
      };
    }
  }

  const dualNumberMatch = dualRangeMatch
    ? null
    : numericContext.value.match(DUAL_NUMBER_PATTERN);
  if (dualNumberMatch) {
    const primaryUnit = normalizeUnit(dualNumberMatch[3]);
    const alternateUnit = normalizeUnit(dualNumberMatch[5]);
    if (
      primaryUnit.known &&
      alternateUnit.known &&
      primaryUnit.unit &&
      alternateUnit.unit
    ) {
      return {
        type: 'number',
        normalized: {
          type: 'number',
          value: parseNumber(dualNumberMatch[2]),
          unit: primaryUnit.unit,
          qualifier: normalizeQualifier(dualNumberMatch[1]),
          alternate: {
            value: parseNumber(dualNumberMatch[4]),
            unit: alternateUnit.unit,
          },
          ...(numericContext.condition
            ? { condition: numericContext.condition }
            : {}),
          ...(numericContext.note ? { note: numericContext.note } : {}),
        },
        facets,
        parseWarnings,
        unknownUnits,
        unknownProtocols,
        invalidRanges,
      };
    }
  }

  const rangeContext = numericContext;
  const rangeMatch = dualRangeMatch
    ? null
    : rangeContext.value.match(RANGE_PATTERN);
  if (rangeMatch) {
    const parsedRange = parseRangeParts(
      rangeMatch[2],
      rangeMatch[3],
      rangeMatch[4],
      rangeMatch[5],
    );
    const { minValue, maxValue, firstUnit, secondUnit } = parsedRange;

    if (!firstUnit.known || !secondUnit.known) {
      const unknown = !firstUnit.known
        ? firstUnit.unit_raw
        : secondUnit.unit_raw;
      if (isPlausibleUnitToken(unknown)) {
        unknownUnits.push(
          diagnostic(productId, rawRef, nameRaw, valueRaw, {
            unit_raw: unknown,
            reason: 'unknown_unit_in_range',
          }),
        );
      } else {
        parseWarnings.push(
          diagnostic(productId, rawRef, nameRaw, valueRaw, {
            reason: 'complex_range_expression_kept_as_text',
          }),
        );
      }
    } else if (
      !parsedRange.compatible &&
      endpointsSharePhysicalQuantity(firstUnit.unit, secondUnit.unit)
    ) {
      return {
        type: 'range',
        normalized: {
          type: 'range',
          min: { value: minValue, unit: firstUnit.unit },
          max: { value: maxValue, unit: secondUnit.unit },
          qualifier: normalizeQualifier(rangeMatch[1]),
          ...(rangeContext.condition
            ? { condition: rangeContext.condition }
            : {}),
          ...(rangeContext.note ? { note: rangeContext.note } : {}),
        },
        facets,
        parseWarnings,
        unknownUnits,
        unknownProtocols,
        invalidRanges,
      };
    } else if (!parsedRange.compatible) {
      parseWarnings.push(
        diagnostic(productId, rawRef, nameRaw, valueRaw, {
          reason: 'range_units_do_not_match',
        }),
      );
    } else if (minValue > maxValue) {
      invalidRanges.push(
        diagnostic(productId, rawRef, nameRaw, valueRaw, {
          min_value: minValue,
          max_value: maxValue,
          reason: 'minimum_exceeds_maximum',
        }),
      );
    } else {
      return {
        type: 'range',
        normalized: {
          type: 'range',
          min_value: minValue,
          max_value: maxValue,
          unit: parsedRange.unit,
          qualifier: normalizeQualifier(rangeMatch[1]),
          ...(rangeContext.condition
            ? { condition: rangeContext.condition }
            : {}),
          ...(rangeContext.note ? { note: rangeContext.note } : {}),
        },
        facets,
        parseWarnings,
        unknownUnits,
        unknownProtocols,
        invalidRanges,
      };
    }
  }

  const numberMatch =
    rangeMatch || dualNumberMatch || rangeContext.value !== trimmed
      ? null
      : trimmed.match(NUMBER_PATTERN);
  if (numberMatch) {
    const unitResult = normalizeUnit(numberMatch[3]);
    if (unitResult.known) {
      return {
        type: 'number',
        normalized: {
          type: 'number',
          value: parseNumber(numberMatch[2]),
          unit: unitResult.unit,
          qualifier: normalizeQualifier(numberMatch[1]),
        },
        facets,
        parseWarnings,
        unknownUnits,
        unknownProtocols,
        invalidRanges,
      };
    }
    if (isPlausibleUnitToken(unitResult.unit_raw)) {
      unknownUnits.push(
        diagnostic(productId, rawRef, nameRaw, valueRaw, {
          unit_raw: unitResult.unit_raw,
          reason: 'unknown_unit_in_numeric_value',
        }),
      );
    }
  }

  const listValues = trimmed
    .split(/\s+\|\s+/u)
    .map((value) => value.trim())
    .filter(Boolean);
  const isSimpleEnumList =
    listValues.length > 1 &&
    listValues.length <= 20 &&
    listValues.every(
      (value) =>
        value.length <= 80 && !/\d/iu.test(value) && !/[.;]/u.test(value),
    );
  if (isSimpleEnumList) {
    return {
      type: 'list',
      normalized: { type: 'list', values: listValues },
      facets,
      parseWarnings,
      unknownUnits,
      unknownProtocols,
      invalidRanges,
    };
  }

  if (
    parseWarnings.length === 0 &&
    invalidRanges.length === 0 &&
    /(?:\d|\.\d)\s*(?:to|through|–|—|±|\/|or)\s*(?:[+\-−]?\d|\.\d)/iu.test(
      trimmed,
    )
  ) {
    parseWarnings.push(
      diagnostic(productId, rawRef, nameRaw, valueRaw, {
        reason: 'complex_numeric_expression_kept_as_text',
      }),
    );
  }

  return {
    type: 'text',
    normalized: null,
    facets,
    parseWarnings,
    unknownUnits,
    unknownProtocols,
    invalidRanges,
  };
};

const isUnambiguousSimpleDualUnit = (valueRaw) => {
  const trimmed = rawValueText(valueRaw).trim();
  const numericContext = extractSafeRangeContext(trimmed);
  const dualRangeMatch = numericContext.value.match(DUAL_RANGE_PATTERN);
  if (dualRangeMatch) {
    const primary = parseRangeParts(
      dualRangeMatch[2],
      dualRangeMatch[3],
      dualRangeMatch[4],
      dualRangeMatch[5],
    );
    const alternate = parseRangeParts(
      dualRangeMatch[6],
      dualRangeMatch[7],
      dualRangeMatch[8],
      dualRangeMatch[9],
    );
    return (
      primary.compatible &&
      alternate.compatible &&
      primary.unit &&
      alternate.unit &&
      primary.minValue <= primary.maxValue &&
      alternate.minValue <= alternate.maxValue
    );
  }
  const dualNumberMatch = numericContext.value.match(DUAL_NUMBER_PATTERN);
  if (!dualNumberMatch) return false;
  return (
    normalizeUnit(dualNumberMatch[3]).known &&
    normalizeUnit(dualNumberMatch[3]).unit &&
    normalizeUnit(dualNumberMatch[5]).known &&
    normalizeUnit(dualNumberMatch[5]).unit
  );
};

const isUnambiguousSafeRange = (valueRaw) => {
  const numericContext = extractSafeRangeContext(rawValueText(valueRaw).trim());
  if (isUnambiguousSimpleDualUnit(valueRaw)) return true;
  const rangeMatch = numericContext.value.match(RANGE_PATTERN);
  if (!rangeMatch) return false;
  const parsedRange = parseRangeParts(
    rangeMatch[2],
    rangeMatch[3],
    rangeMatch[4],
    rangeMatch[5],
  );
  if (!parsedRange.firstUnit.known || !parsedRange.secondUnit.known) {
    return false;
  }
  if (parsedRange.compatible) {
    return parsedRange.minValue <= parsedRange.maxValue;
  }
  return endpointsSharePhysicalQuantity(
    parsedRange.firstUnit.unit,
    parsedRange.secondUnit.unit,
  );
};

const collectSemanticDiagnostics = (documents) => {
  const diagnostics = {
    protocol_false_positives: [],
    negated_protocol_as_supported: [],
    simple_dual_unit_unparsed: [],
    invalid_qualifiers: [],
    normalized_without_raw_ref: [],
    normalized_value_not_supported_by_raw: [],
    canonical_key_conflicts: [],
  };
  let protocolFacetCount = 0;
  let supportedProtocolFacetValueCount = 0;
  let unsupportedProtocolFacetCount = 0;
  let unsupportedProtocolFacetValueCount = 0;
  let dualUnitValuesParsed = 0;
  let canonicalKeyAssigned = 0;
  let quantityKindAssigned = 0;

  for (const document of documents) {
    const canonicalSignatures = new Map();
    for (const specification of document.specifications) {
      const supported = specification.facets?.supported_protocols ?? [];
      const unsupported = specification.facets?.unsupported_protocols ?? [];
      if (supported.length > 0) {
        protocolFacetCount += 1;
        supportedProtocolFacetValueCount += supported.length;
      }
      if (unsupported.length > 0) {
        unsupportedProtocolFacetCount += 1;
        unsupportedProtocolFacetValueCount += unsupported.length;
      }
      if (
        specification.normalized?.alternate ||
        (specification.normalized?.type === 'range' &&
          specification.normalized.min?.unit &&
          specification.normalized.max?.unit &&
          specification.normalized.min.unit !==
            specification.normalized.max.unit)
      ) {
        dualUnitValuesParsed += 1;
      }
      if (specification.canonical_key) {
        canonicalKeyAssigned += 1;
        const signatures =
          canonicalSignatures.get(specification.canonical_key) ?? new Set();
        signatures.add(
          `${specification.section ?? ''}\u0000${specification.name_raw}`,
        );
        canonicalSignatures.set(specification.canonical_key, signatures);
      }
      if (specification.quantity_kind) quantityKindAssigned += 1;

      if (
        specification.type === 'protocol' &&
        !isProtocolField(specification.name_raw)
      ) {
        diagnostics.protocol_false_positives.push(
          diagnostic(
            specification.product_id,
            specification.raw_ref,
            specification.name_raw,
            specification.value_raw,
            { reason: 'protocol_type_on_non_protocol_field' },
          ),
        );
      }

      const classified = classifyProtocols(
        rawValueText(specification.value_raw),
      );
      const negatedAsSupported = supported.filter((protocol) =>
        classified.unsupportedProtocols.includes(protocol),
      );
      if (negatedAsSupported.length > 0) {
        diagnostics.negated_protocol_as_supported.push(
          diagnostic(
            specification.product_id,
            specification.raw_ref,
            specification.name_raw,
            specification.value_raw,
            { protocols: negatedAsSupported },
          ),
        );
      }

      if (
        isUnambiguousSimpleDualUnit(specification.value_raw) &&
        !specification.normalized?.alternate
      ) {
        diagnostics.simple_dual_unit_unparsed.push(
          diagnostic(
            specification.product_id,
            specification.raw_ref,
            specification.name_raw,
            specification.value_raw,
          ),
        );
      }

      const qualifier = specification.normalized?.qualifier;
      if (
        qualifier !== undefined &&
        qualifier !== null &&
        !VALID_QUALIFIERS.has(qualifier)
      ) {
        diagnostics.invalid_qualifiers.push(
          diagnostic(
            specification.product_id,
            specification.raw_ref,
            specification.name_raw,
            specification.value_raw,
            { qualifier },
          ),
        );
      }

      if (
        specification.normalized !== null &&
        (!specification.raw_ref ||
          !specification.raw_ref.file ||
          !Number.isInteger(specification.raw_ref.product_index) ||
          !Number.isInteger(specification.raw_ref.spec_index))
      ) {
        diagnostics.normalized_without_raw_ref.push({
          product_id: specification.product_id,
          name_raw: specification.name_raw,
          value_raw: specification.value_raw,
        });
      }

      const regenerated = normalizeValue({
        productId: specification.product_id,
        nameRaw: specification.name_raw,
        valueRaw: specification.value_raw,
        rawRef: specification.raw_ref,
      });
      const actualSemanticValue = {
        type: specification.type,
        normalized: specification.normalized,
        facets: specification.facets,
      };
      const supportedSemanticValue = {
        type: regenerated.type,
        normalized: regenerated.normalized,
        facets: regenerated.facets,
      };
      if (
        JSON.stringify(actualSemanticValue) !==
        JSON.stringify(supportedSemanticValue)
      ) {
        diagnostics.normalized_value_not_supported_by_raw.push(
          diagnostic(
            specification.product_id,
            specification.raw_ref,
            specification.name_raw,
            specification.value_raw,
          ),
        );
      }
    }
    for (const [canonicalKey, signatures] of canonicalSignatures) {
      if (signatures.size > 1) {
        diagnostics.canonical_key_conflicts.push({
          product_id: document.product_id,
          canonical_key: canonicalKey,
          signatures: [...signatures],
        });
      }
    }
  }

  return {
    diagnostics,
    counts: {
      protocol_facet_count: protocolFacetCount,
      supported_protocol_facet_value_count: supportedProtocolFacetValueCount,
      unsupported_protocol_facet_count: unsupportedProtocolFacetCount,
      unsupported_protocol_facet_value_count:
        unsupportedProtocolFacetValueCount,
      dual_unit_values_parsed: dualUnitValuesParsed,
      canonical_key_assigned: canonicalKeyAssigned,
      quantity_kind_assigned: quantityKindAssigned,
    },
  };
};

const scanRepositorySpecificationSources = async (
  directory = projectRoot,
  relativeDirectory = '',
) => {
  const excludedDirectories = new Set([
    '.git',
    'node_modules',
    'dist',
    'data/raw',
    'data/normalized',
    'data/evaluation',
  ]);
  const sourceExtensions = new Set(['.xlsx', '.xls', '.csv', '.tsv', '.pdf']);
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = relativeDirectory
      ? `${relativeDirectory}/${entry.name}`
      : entry.name;
    if (entry.isDirectory()) {
      if (
        excludedDirectories.has(entry.name) ||
        excludedDirectories.has(relative)
      ) {
        continue;
      }
      files.push(
        ...(await scanRepositorySpecificationSources(
          path.join(directory, entry.name),
          relative,
        )),
      );
    } else if (sourceExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(relative);
    }
  }
  return files.sort();
};

const rawCandidateDetails = (rawByFile, candidates) =>
  candidates.flatMap(({ file, product_index: productIndex }) => {
    const rawProduct = rawByFile.get(file)?.products?.[productIndex];
    return rawProduct
      ? [
          {
            file: `data/raw/${file}`,
            product_index: productIndex,
            product_id: rawProduct.product_id ?? null,
            model: rawProduct.model ?? null,
          },
        ]
      : [];
  });

const createMissingRawManifest = ({
  master,
  skippedProducts,
  rawByFile,
  specificationSourceFiles,
}) => {
  const masterById = new Map(
    master.map((product) => [product.product_id, product]),
  );
  const cs451Candidates = [];
  for (const [file, raw] of rawByFile) {
    for (
      let productIndex = 0;
      productIndex < (raw.products ?? []).length;
      productIndex += 1
    ) {
      const rawProduct = raw.products[productIndex];
      if (/^CS451-/iu.test(rawProduct.model ?? '')) {
        cs451Candidates.push({
          file: `data/raw/${file}`,
          product_index: productIndex,
          product_id: rawProduct.product_id ?? null,
          model: rawProduct.model ?? null,
        });
      }
    }
  }

  const products = skippedProducts.map((skipped) => {
    const product = masterById.get(skipped.product_id);
    const reason = skipped.mapping_reason ?? skipped.reason;
    if (reason === 'meaningful_model_suffix_mismatch') {
      return {
        product_id: product.product_id,
        model: product.model,
        status: product.status,
        blocker: 'variant_mismatch',
        existing_raw_candidates: rawCandidateDetails(
          rawByFile,
          VARIANT_RAW_CANDIDATES[product.product_id] ?? [],
        ),
        resolution:
          'Provide repository source evidence or a separate raw record for the exact ST variant; XT must not be reused.',
      };
    }
    if (
      reason === 'multiple_raw_records_match_without_variant_evidence' &&
      product.product_id === 'CSI_CS451'
    ) {
      return {
        product_id: product.product_id,
        model: product.model,
        status: product.status,
        blocker: 'ambiguous_variant',
        policy: 'generic_product_requires_variant_policy',
        existing_raw_candidates: cs451Candidates,
        resolution:
          'Provide a generic CS451 source/raw record or an explicit canonical variant policy; do not select HA, WN, or NN implicitly.',
      };
    }
    if (reason === 'raw_identity_conflict') {
      return {
        product_id: product.product_id,
        model: product.model,
        status: product.status,
        blocker: 'identity_conflict',
        resolution:
          'Resolve the conflicting model identity in the source/raw record before activation.',
      };
    }
    return {
      product_id: product.product_id,
      model: product.model,
      status: product.status,
      blocker: 'raw_record_not_found',
      repository_source_found: false,
      resolution:
        'No specification source exists in the repository; provide an evidence-backed source or raw record.',
    };
  });

  return {
    schema_version: '1.0',
    source_scan: {
      internet_search_used: false,
      identity_source: 'data/master/product-master-source.json',
      specification_source_extensions: ['xlsx', 'xls', 'csv', 'tsv', 'pdf'],
      specification_source_files_found: specificationSourceFiles,
      extractable_missing_product_sources_found: 0,
    },
    summary: {
      upstream_blocked_products: products.length,
      raw_record_not_found: products.filter(
        (product) => product.blocker === 'raw_record_not_found',
      ).length,
      variant_mismatch: products.filter(
        (product) => product.blocker === 'variant_mismatch',
      ).length,
      ambiguous_variant: products.filter(
        (product) => product.blocker === 'ambiguous_variant',
      ).length,
      identity_conflict: products.filter(
        (product) => product.blocker === 'identity_conflict',
      ).length,
      new_raw_records_extracted: 0,
    },
    products,
  };
};

const loadInputs = async () => {
  const [master, productMasterReport, rawFiles] = await Promise.all([
    readJson(masterPath),
    readJson(productMasterReportPath),
    readdir(rawDirectory),
  ]);
  const jsonFiles = rawFiles.filter((file) => file.endsWith('.json')).sort();
  const rawEntries = await Promise.all(
    jsonFiles.map(async (file) => {
      const filePath = path.join(rawDirectory, file);
      const content = await readFile(filePath, 'utf8');
      return { file, content, data: JSON.parse(content) };
    }),
  );
  return { master, productMasterReport, rawEntries };
};

const createFingerprint = ({ master, productMasterReport, rawEntries }) => {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(master));
  hash.update(JSON.stringify(productMasterReport.mappings ?? []));
  for (const entry of rawEntries) {
    hash.update(entry.file);
    hash.update(entry.content.replace(/\r\n/gu, '\n'));
  }
  return hash.digest('hex');
};

const skippedProduct = (product, mapping, reason) => ({
  product_id: product.product_id,
  model: product.model,
  status: product.status,
  reason,
  mapping_reason: mapping?.unresolved_reason ?? null,
});

export const createNormalizationPlan = async () => {
  const [inputs, specificationSourceFiles] = await Promise.all([
    loadInputs(),
    scanRepositorySpecificationSources(),
  ]);
  const mappingByProductId = new Map(
    (inputs.productMasterReport.mappings ?? []).map((mapping) => [
      mapping.product_id,
      mapping,
    ]),
  );
  const rawByFile = new Map(
    inputs.rawEntries.map((entry) => [entry.file, entry.data]),
  );
  const activeMappings = inputs.master
    .filter((product) => product.status === 'active')
    .map((product) => mappingByProductId.get(product.product_id))
    .filter((mapping) => mapping?.raw_record_key);
  const rawKeyCounts = new Map();
  for (const mapping of activeMappings) {
    rawKeyCounts.set(
      mapping.raw_record_key,
      (rawKeyCounts.get(mapping.raw_record_key) ?? 0) + 1,
    );
  }

  const documents = [];
  const skippedProducts = [];
  const errors = [];
  const diagnostics = {
    actionable_parse_warnings: [],
    intentionally_kept_as_text: [],
    upstream_missing_raw: [],
    variant_mismatch: [],
    ambiguous_variant: [],
    identity_conflict: [],
    unknown_units: [],
    unknown_protocols: [],
    invalid_ranges: [],
    missing_raw_references: [],
  };
  const typeCounts = {
    number: 0,
    range: 0,
    boolean: 0,
    protocol: 0,
    list: 0,
    text: 0,
  };

  for (const product of inputs.master) {
    const mapping = mappingByProductId.get(product.product_id);
    if (product.status !== 'active') {
      skippedProducts.push(
        skippedProduct(product, mapping, 'product_status_not_active'),
      );
      continue;
    }
    if (!mapping?.raw_file || !Number.isInteger(mapping.raw_index)) {
      skippedProducts.push(
        skippedProduct(product, mapping, 'active_product_has_no_raw_mapping'),
      );
      errors.push({
        product_id: product.product_id,
        code: 'active_product_has_no_raw_mapping',
      });
      continue;
    }
    if ((rawKeyCounts.get(mapping.raw_record_key) ?? 0) !== 1) {
      skippedProducts.push(
        skippedProduct(product, mapping, 'raw_mapping_not_unique'),
      );
      errors.push({
        product_id: product.product_id,
        code: 'raw_mapping_not_unique',
      });
      continue;
    }

    const rawFile = rawByFile.get(mapping.raw_file);
    const rawProduct = rawFile?.products?.[mapping.raw_index];
    if (!rawProduct) {
      skippedProducts.push(
        skippedProduct(product, mapping, 'mapped_raw_record_missing'),
      );
      errors.push({
        product_id: product.product_id,
        code: 'mapped_raw_record_missing',
      });
      continue;
    }

    const rawSpecifications = (rawProduct.specifications ?? []).map(
      (rawSpec, specIndex) => {
        const rawRef = {
          file: `data/raw/${mapping.raw_file}`,
          product_index: mapping.raw_index,
          spec_index: specIndex,
          source_rows: Array.isArray(rawSpec.source_rows)
            ? [...rawSpec.source_rows]
            : [],
        };
        if (
          !Array.isArray(rawSpec.source_rows) ||
          rawSpec.source_rows.length === 0
        ) {
          diagnostics.missing_raw_references.push(
            diagnostic(
              product.product_id,
              rawRef,
              rawSpec.name_en ?? '',
              rawSpec.value_raw,
              { reason: 'source_rows_missing' },
            ),
          );
        }
        const result = normalizeValue({
          productId: product.product_id,
          nameRaw: rawSpec.name_en ?? '',
          valueRaw: rawSpec.value_raw,
          rawRef,
        });
        typeCounts[result.type] += 1;
        if (result.type === 'text') {
          diagnostics.intentionally_kept_as_text.push(
            diagnostic(
              product.product_id,
              rawRef,
              rawSpec.name_en ?? '',
              rawSpec.value_raw,
              {
                reasons:
                  result.parseWarnings.length > 0
                    ? result.parseWarnings.map((warning) => warning.reason)
                    : ['descriptive_or_unstructured_text'],
              },
            ),
          );
        } else if (result.parseWarnings.length > 0) {
          diagnostics.actionable_parse_warnings.push(...result.parseWarnings);
        }
        diagnostics.unknown_units.push(...result.unknownUnits);
        diagnostics.unknown_protocols.push(...result.unknownProtocols);
        diagnostics.invalid_ranges.push(...result.invalidRanges);

        return {
          product_id: product.product_id,
          section: rawSpec.section ?? null,
          name_raw: rawSpec.name_en ?? '',
          value_raw: rawSpec.value_raw,
          type: result.type,
          normalized: result.normalized,
          ...(result.facets ? { facets: result.facets } : {}),
          raw_ref: rawRef,
        };
      },
    );
    const specifications = assignCanonicalMetadata(rawSpecifications);

    documents.push({
      schema_version: '1.2',
      product_id: product.product_id,
      model: product.model,
      raw_record_ref: {
        file: `data/raw/${mapping.raw_file}`,
        product_index: mapping.raw_index,
        raw_record_key: mapping.raw_record_key,
        raw_product_id: rawProduct.product_id ?? null,
        raw_model: rawProduct.model ?? null,
      },
      variants: (rawProduct.variants ?? []).map((variant) => ({
        product_id: variant.product_id,
        model: variant.model,
        product_name_en: variant.product_name_en ?? null,
        is_representative: variant.is_representative === true,
        distinguishing_specifications: (
          variant.distinguishing_specifications ?? []
        ).map((specification) => ({
          section: specification.section ?? null,
          name_en: specification.name_en ?? '',
          value_raw: String(specification.value_raw ?? ''),
        })),
      })),
      specifications,
    });
  }

  for (const product of skippedProducts) {
    const item = {
      product_id: product.product_id,
      model: product.model,
      reason: product.mapping_reason ?? product.reason,
    };
    if (product.mapping_reason === 'raw_record_not_found') {
      diagnostics.upstream_missing_raw.push(item);
    } else if (product.mapping_reason === 'meaningful_model_suffix_mismatch') {
      diagnostics.variant_mismatch.push(item);
    } else if (
      product.mapping_reason ===
      'multiple_raw_records_match_without_variant_evidence'
    ) {
      diagnostics.ambiguous_variant.push({
        ...item,
        policy: 'generic_product_requires_variant_policy',
      });
    } else if (product.mapping_reason === 'raw_identity_conflict') {
      diagnostics.identity_conflict.push(item);
    }
  }

  for (const document of documents) {
    for (const specification of document.specifications) {
      if (
        specification.type === 'text' &&
        isUnambiguousSafeRange(specification.value_raw)
      ) {
        diagnostics.actionable_parse_warnings.push(
          diagnostic(
            specification.product_id,
            specification.raw_ref,
            specification.name_raw,
            specification.value_raw,
            { reason: 'safe_range_pattern_was_not_normalized' },
          ),
        );
      }
    }
  }

  const totalSpecifications = Object.values(typeCounts).reduce(
    (total, count) => total + count,
    0,
  );
  const normalizedSuccessfully = totalSpecifications - typeCounts.text;
  const semanticAudit = collectSemanticDiagnostics(documents);
  Object.assign(diagnostics, semanticAudit.diagnostics);
  const acceptanceFailures = [
    ...diagnostics.actionable_parse_warnings,
    ...diagnostics.invalid_ranges,
    ...diagnostics.missing_raw_references,
    ...diagnostics.protocol_false_positives,
    ...diagnostics.negated_protocol_as_supported,
    ...diagnostics.simple_dual_unit_unparsed,
    ...diagnostics.invalid_qualifiers,
    ...diagnostics.normalized_without_raw_ref,
    ...diagnostics.normalized_value_not_supported_by_raw,
    ...diagnostics.canonical_key_conflicts,
  ];
  const blockingErrors = [
    ...errors,
    ...acceptanceFailures.map((item) => ({
      product_id: item.product_id,
      code: item.reason ?? 'normalization_acceptance_failure',
      raw_ref: item.raw_ref ?? null,
    })),
  ];
  const report = {
    schema_version: '1.2',
    input_fingerprint_sha256: createFingerprint(inputs),
    normalization_engine_status:
      blockingErrors.length === 0 ? 'passed' : 'failed',
    technical_normalization_status:
      blockingErrors.length === 0 ? 'LOCKED' : 'UNLOCKED',
    validation_status: blockingErrors.length === 0 ? 'passed' : 'failed',
    dataset_coverage: {
      master_products: inputs.master.length,
      eligible_products: inputs.master.filter(
        (product) => product.status === 'active',
      ).length,
      normalized_products: documents.length,
      upstream_blocked_products: skippedProducts.length,
    },
    summary: {
      master_product_count: inputs.master.length,
      active_product_count: inputs.master.filter(
        (product) => product.status === 'active',
      ).length,
      products_normalized: documents.length,
      products_skipped: skippedProducts.length,
      total_specifications: totalSpecifications,
      normalized_successfully: normalizedSuccessfully,
      kept_as_text: typeCounts.text,
      parse_warning_count: diagnostics.actionable_parse_warnings.length,
      actionable_parse_warning_count:
        diagnostics.actionable_parse_warnings.length,
      intentionally_kept_as_text_count:
        diagnostics.intentionally_kept_as_text.length,
      unknown_unit_count: diagnostics.unknown_units.length,
      unknown_protocol_count: diagnostics.unknown_protocols.length,
      invalid_range_count: diagnostics.invalid_ranges.length,
      missing_raw_reference_count: diagnostics.missing_raw_references.length,
      protocol_false_positive_count:
        diagnostics.protocol_false_positives.length,
      negated_protocol_as_supported_count:
        diagnostics.negated_protocol_as_supported.length,
      simple_dual_unit_unparsed_count:
        diagnostics.simple_dual_unit_unparsed.length,
      invalid_qualifier_count: diagnostics.invalid_qualifiers.length,
      normalized_without_raw_ref_count:
        diagnostics.normalized_without_raw_ref.length,
      normalized_value_not_supported_by_raw_count:
        diagnostics.normalized_value_not_supported_by_raw.length,
      canonical_key_conflict_count: diagnostics.canonical_key_conflicts.length,
      ...semanticAudit.counts,
      blocking_error_count: blockingErrors.length,
    },
    type_counts: typeCounts,
    skipped_products: skippedProducts,
    diagnostics,
    blocking_errors: blockingErrors,
    outputs: documents.map((document) =>
      relativePath(path.join(outputDirectory, `${document.product_id}.json`)),
    ),
  };
  const missingRawManifest = createMissingRawManifest({
    master: inputs.master,
    skippedProducts,
    rawByFile,
    specificationSourceFiles,
  });

  return { documents, report, missingRawManifest };
};

export const writeNormalizationOutputs = async ({
  documents,
  report,
  missingRawManifest,
}) => {
  await mkdir(outputDirectory, { recursive: true });
  await mkdir(path.dirname(normalizationReportPath), { recursive: true });
  const expectedFiles = new Set(
    documents.map((document) => `${document.product_id}.json`),
  );
  const existingFiles = (await readdir(outputDirectory)).filter((file) =>
    file.endsWith('.json'),
  );
  for (const file of existingFiles) {
    if (!expectedFiles.has(file)) {
      await unlink(path.join(outputDirectory, file));
    }
  }
  const writeJsonIfChanged = async (filePath, value) => {
    const content = `${JSON.stringify(value, null, 2)}\n`;
    try {
      if ((await readFile(filePath, 'utf8')) === content) return;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    await writeFile(filePath, content, 'utf8');
  };
  await Promise.all(
    documents.map((document) =>
      writeJsonIfChanged(
        path.join(outputDirectory, `${document.product_id}.json`),
        document,
      ),
    ),
  );
  await writeJsonIfChanged(normalizationReportPath, report);
  await writeJsonIfChanged(missingRawManifestPath, missingRawManifest);
};

export const loadOutputDocuments = async () => {
  let files = [];
  try {
    files = (await readdir(outputDirectory))
      .filter((file) => file.endsWith('.json'))
      .sort();
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  return Promise.all(
    files.map(async (file) => ({
      file,
      data: await readJson(path.join(outputDirectory, file)),
    })),
  );
};

export const validateNormalization = async () => {
  const expected = await createNormalizationPlan();
  const actualDocuments = await loadOutputDocuments();
  let actualReport = null;
  let actualMissingRawManifest = null;
  try {
    actualReport = await readJson(normalizationReportPath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  try {
    actualMissingRawManifest = await readJson(missingRawManifestPath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const errors = [];
  const expectedByFile = new Map(
    expected.documents.map((document) => [
      `${document.product_id}.json`,
      document,
    ]),
  );
  const actualByFile = new Map(
    actualDocuments.map(({ file, data }) => [file, data]),
  );
  for (const [file, document] of expectedByFile) {
    const actual = actualByFile.get(file);
    if (!actual) {
      errors.push({ code: 'normalized_output_missing', file });
    } else if (JSON.stringify(actual) !== JSON.stringify(document)) {
      errors.push({ code: 'normalized_output_stale_or_modified', file });
    }
  }
  for (const file of actualByFile.keys()) {
    if (!expectedByFile.has(file)) {
      errors.push({ code: 'unexpected_normalized_output', file });
    }
  }
  if (!actualReport) {
    errors.push({ code: 'normalization_report_missing' });
  } else if (JSON.stringify(actualReport) !== JSON.stringify(expected.report)) {
    errors.push({ code: 'normalization_report_stale_or_modified' });
  }
  if (!actualMissingRawManifest) {
    errors.push({ code: 'missing_raw_manifest_missing' });
  } else if (
    JSON.stringify(actualMissingRawManifest) !==
    JSON.stringify(expected.missingRawManifest)
  ) {
    errors.push({ code: 'missing_raw_manifest_stale_or_modified' });
  }

  const rawEntries = new Map();
  for (const { data } of actualDocuments) {
    const rawFile = data?.raw_record_ref?.file;
    const productIndex = data?.raw_record_ref?.product_index;
    if (!rawFile || !Number.isInteger(productIndex)) {
      errors.push({
        code: 'document_raw_reference_missing',
        product_id: data?.product_id,
      });
      continue;
    }
    if (!rawEntries.has(rawFile)) {
      try {
        rawEntries.set(
          rawFile,
          await readJson(path.join(projectRoot, rawFile)),
        );
      } catch {
        errors.push({ code: 'referenced_raw_file_missing', file: rawFile });
        continue;
      }
    }
    const rawProduct = rawEntries.get(rawFile)?.products?.[productIndex];
    for (const specification of data.specifications ?? []) {
      const rawRef = specification.raw_ref;
      const rawSpec = rawProduct?.specifications?.[rawRef?.spec_index];
      if (!rawSpec) {
        errors.push({
          code: 'referenced_raw_specification_missing',
          product_id: data.product_id,
          spec_index: rawRef?.spec_index,
        });
        continue;
      }
      if (rawSpec.value_raw !== specification.value_raw) {
        errors.push({
          code: 'value_raw_changed',
          product_id: data.product_id,
          spec_index: rawRef.spec_index,
        });
      }
      if (
        (rawSpec.section ?? null) !== specification.section ||
        (rawSpec.name_en ?? '') !== specification.name_raw
      ) {
        errors.push({
          code: 'raw_specification_identity_changed',
          product_id: data.product_id,
          spec_index: rawRef.spec_index,
        });
      }
      if (
        rawRef.file !== rawFile ||
        rawRef.product_index !== productIndex ||
        !Array.isArray(rawRef.source_rows) ||
        JSON.stringify(rawRef.source_rows) !==
          JSON.stringify(rawSpec.source_rows ?? [])
      ) {
        errors.push({
          code: 'raw_reference_incorrect',
          product_id: data.product_id,
          spec_index: rawRef.spec_index,
        });
      }
    }
  }

  const actualSemanticAudit = collectSemanticDiagnostics(
    actualDocuments.map(({ data }) => data),
  );
  const semanticChecks = [
    [
      'protocol_false_positive',
      actualSemanticAudit.diagnostics.protocol_false_positives,
    ],
    [
      'negated_protocol_as_supported',
      actualSemanticAudit.diagnostics.negated_protocol_as_supported,
    ],
    [
      'simple_dual_unit_unparsed',
      actualSemanticAudit.diagnostics.simple_dual_unit_unparsed,
    ],
    ['invalid_qualifier', actualSemanticAudit.diagnostics.invalid_qualifiers],
    [
      'normalized_without_raw_ref',
      actualSemanticAudit.diagnostics.normalized_without_raw_ref,
    ],
    [
      'normalized_value_not_supported_by_raw',
      actualSemanticAudit.diagnostics.normalized_value_not_supported_by_raw,
    ],
    [
      'canonical_key_conflict',
      actualSemanticAudit.diagnostics.canonical_key_conflicts,
    ],
  ];
  for (const [code, items] of semanticChecks) {
    for (const item of items) {
      errors.push({
        code,
        product_id: item.product_id,
        raw_ref: item.raw_ref ?? null,
      });
    }
  }

  const passed =
    errors.length === 0 && expected.report.validation_status === 'passed';
  const validationReport = passed
    ? expected.report
    : {
        ...expected.report,
        normalization_engine_status: 'failed',
        technical_normalization_status: 'UNLOCKED',
        validation_status: 'failed',
        summary: {
          ...expected.report.summary,
          blocking_error_count:
            expected.report.summary.blocking_error_count + errors.length,
        },
      };
  return { passed, errors, report: validationReport };
};

export const printReportSummary = (report) => {
  const summary = report.summary;
  console.log(
    `normalization_engine_status=${report.normalization_engine_status}`,
  );
  console.log(
    `technical_normalization_status=${report.technical_normalization_status}`,
  );
  console.log(`validation_status=${report.validation_status}`);
  console.log(
    `normalization_coverage=${report.dataset_coverage.normalized_products}/${report.dataset_coverage.master_products}`,
  );
  console.log(
    `upstream_blocked_products=${report.dataset_coverage.upstream_blocked_products}`,
  );
  console.log(`products_normalized=${summary.products_normalized}`);
  console.log(`products_skipped=${summary.products_skipped}`);
  console.log(`total_specifications=${summary.total_specifications}`);
  console.log(`normalized_successfully=${summary.normalized_successfully}`);
  console.log(`kept_as_text=${summary.kept_as_text}`);
  console.log(`parse_warnings=${summary.parse_warning_count}`);
  console.log(
    `intentionally_kept_as_text=${summary.intentionally_kept_as_text_count}`,
  );
  console.log(`unknown_units=${summary.unknown_unit_count}`);
  console.log(`unknown_protocols=${summary.unknown_protocol_count}`);
  console.log(`invalid_ranges=${summary.invalid_range_count}`);
  console.log(`missing_raw_references=${summary.missing_raw_reference_count}`);
  console.log(`protocol_facets=${summary.protocol_facet_count}`);
  console.log(
    `unsupported_protocol_facets=${summary.unsupported_protocol_facet_count}`,
  );
  console.log(`dual_unit_values_parsed=${summary.dual_unit_values_parsed}`);
  console.log(
    `protocol_false_positives=${summary.protocol_false_positive_count}`,
  );
  console.log(
    `negated_protocol_as_supported=${summary.negated_protocol_as_supported_count}`,
  );
  console.log(
    `simple_dual_unit_unparsed=${summary.simple_dual_unit_unparsed_count}`,
  );
  console.log(`invalid_qualifiers=${summary.invalid_qualifier_count}`);
  console.log(
    `normalized_without_raw_ref=${summary.normalized_without_raw_ref_count}`,
  );
  console.log(
    `normalized_value_not_supported_by_raw=${summary.normalized_value_not_supported_by_raw_count}`,
  );
  console.log(
    `canonical_key_conflicts=${summary.canonical_key_conflict_count}`,
  );
  console.log(`canonical_key_assigned=${summary.canonical_key_assigned}`);
  console.log(`quantity_kind_assigned=${summary.quantity_kind_assigned}`);
  console.log(`blocking_errors=${summary.blocking_error_count}`);
};

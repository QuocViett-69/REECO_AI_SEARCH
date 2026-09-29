import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';

const require = createRequire(import.meta.url);
const projectRoot = path.resolve(import.meta.dirname, '..', '..');
const fromDist = (...segments) =>
  require(path.join(projectRoot, 'apps', 'api', 'dist', ...segments));
const { ProductsService } = fromDist(
  'modules',
  'products',
  'products.service.js',
);
const { TechnicalMatchService } = fromDist(
  'modules',
  'search',
  'technical-match.service.js',
);
const { TechnicalQueryParserService } = fromDist(
  'modules',
  'search',
  'technical-query-parser.service.js',
);

const catalog = [
  { productId: 'CSI_CS655', model: 'CS655' },
  { productId: 'CSI_AVW200_ST', model: 'AVW200-ST' },
  { productId: 'CSI_CR350_NA', model: 'CR350-NA' },
];
const rawRef = {
  file: 'data/raw/test.json',
  product_index: 0,
  spec_index: 0,
  source_rows: [1],
};

const rangeSpec = (canonicalKey, min, max, unit = '°C') => ({
  specification_id: Math.abs(min * 1000 + max) + 1,
  canonical_key: canonicalKey,
  quantity_kind: 'temperature',
  normalized_value: {
    type: 'range',
    min_value: min,
    max_value: max,
    unit,
    qualifier: null,
  },
  raw_ref: rawRef,
});

const productEvidence = (
  productId,
  {
    model = productId,
    specifications = [],
    supported = [],
    unsupported = [],
  } = {},
) => ({
  product: {
    product_id: productId,
    model,
    product_name_en: `Product ${productId}`,
    category: null,
    subcategory: null,
    device_type: null,
    status: 'active',
  },
  document: {
    supported_protocols: supported,
    unsupported_protocols: unsupported,
  },
  specifications,
});

function matcherHarness(evidenceEntries) {
  const calls = [];
  const productsService = {
    getTechnicalEvidenceByIds: async (ids) => {
      calls.push(ids);
      return new Map(evidenceEntries);
    },
  };
  return {
    calls,
    matcher: new TechnicalMatchService(productsService),
  };
}

test('parses exact active catalog identity without fuzzy matching', () => {
  const parser = new TechnicalQueryParserService();
  for (const query of ['CS655', 'cs655', 'CSI_CS655', 'CSI-CS655']) {
    const parsed = parser.parse(query, catalog);
    assert.equal(parsed.identity.productId, 'CSI_CS655');
    assert.equal(parsed.confidence.identity, 'high');
  }
  assert.equal(
    parser.parse('AVW200-ST', catalog).identity.productId,
    'CSI_AVW200_ST',
  );
  assert.equal(
    parser.parse('avw200-st', catalog).identity.productId,
    'CSI_AVW200_ST',
  );
  assert.equal(
    parser.parse('CR350-NA', catalog).identity.productId,
    'CSI_CR350_NA',
  );
  assert.equal(parser.parse('CS65', catalog).identity, null);
});

test('recognizes bounded model identifiers inside descriptions without prefix collisions', () => {
  const parser = new TechnicalQueryParserService();
  assert.equal(parser.parse('CS655 soil moisture', catalog).identity?.productId, 'CSI_CS655');
  assert.equal(parser.parse('sensor CS655 SDI-12', catalog).identity?.productId, 'CSI_CS655');
  assert.equal(parser.parse('CS6555 soil moisture', catalog).identity, null);
  assert.equal(parser.parse('CS655 and AVW200-ST', catalog).identity, null);
  assert.equal(parser.parse('operating temperature 109°C', [{ productId: 'p', model: '109' }]).identity, null);
});

test('preserves technical interfaces across spacing and hyphen variants', () => {
  const parser = new TechnicalQueryParserService();
  assert.deepEqual(parser.parse('SDI12 rs232 USB CANbus CPI').protocols, ['SDI-12', 'RS-232', 'USB', 'CANbus', 'CPI']);
});

test('does not claim identity when safe separator normalization is ambiguous', () => {
  const parser = new TechnicalQueryParserService();
  const ambiguousCatalog = [
    { productId: 'CSI_A_B', model: 'A-B' },
    { productId: 'CSI_AB', model: 'AB' },
  ];
  assert.equal(parser.parse('AB', ambiguousCatalog).identity, null);
  assert.equal(parser.parse('CSI-AB', ambiguousCatalog).identity, null);
});

test('canonicalizes only the reviewed protocol forms and preserves Modbus specificity', () => {
  const parser = new TechnicalQueryParserService();
  const cases = new Map([
    ['SDI-12', ['SDI-12']],
    ['sdi12', ['SDI-12']],
    ['SDI 12', ['SDI-12']],
    ['RS-485', ['RS-485']],
    ['rs485', ['RS-485']],
    ['RS 485', ['RS-485']],
    ['Modbus', ['Modbus']],
    ['Modbus RTU', ['Modbus RTU']],
    ['sensor with SDI-12', ['SDI-12']],
    ['cảm biến hỗ trợ SDI-12', ['SDI-12']],
    ['Modbus TCP', []],
  ]);
  for (const [query, expected] of cases) {
    assert.deepEqual(parser.parse(query).protocols, expected);
  }
});

test('parses Celsius syntax conservatively and separates intent', () => {
  const parser = new TechnicalQueryParserService();
  const cases = [
    ['-40°C', 'point', 'ambiguous', 'none'],
    ['+70 C', 'point', 'ambiguous', 'none'],
    ['+70°C', 'point', 'ambiguous', 'none'],
    ['-40 deg C', 'point', 'ambiguous', 'none'],
    ['-50 to 70°C', 'range', 'ambiguous', 'none'],
    ['-50 ... +70 C', 'range', 'ambiguous', 'none'],
    ['-50 đến 70°C', 'range', 'ambiguous', 'none'],
    ['-50 tới 70°C', 'range', 'ambiguous', 'none'],
    ['operates at -40°C', 'point', 'operating', 'high'],
    ['hoạt động ở -40°C', 'point', 'operating', 'high'],
    ['operates at 60 C', 'point', 'operating', 'high'],
    ['operating temperature -50 to 60°C', 'range', 'operating', 'high'],
    ['measure up to 70°C', 'upper_bound', 'measurement', 'high'],
    ['đo tới 70°C', 'upper_bound', 'measurement', 'high'],
  ];
  for (const [query, kind, intent, confidence] of cases) {
    const parsed = parser.parse(query);
    assert.equal(parsed.temperatureConstraints.length, 1, query);
    assert.equal(parsed.temperatureConstraints[0].kind, kind, query);
    assert.equal(parsed.temperatureConstraints[0].intent, intent, query);
    assert.equal(
      parsed.temperatureConstraints[0].confidence,
      confidence,
      query,
    );
    assert.equal(parsed.temperatureConstraints[0].unit, '°C', query);
  }
  assert.deepEqual(
    parser.parse('temperature sensor').temperatureConstraints,
    [],
  );
  assert.deepEqual(parser.parse('operates at -40').temperatureConstraints, []);
  assert.deepEqual(
    parser.parse('operating temperature 70 to -50°C').temperatureConstraints,
    [],
  );
});

test('evaluates operating point and interval constraints with three-state semantics', async () => {
  const parser = new TechnicalQueryParserService();
  const evidence = new Map([
    [
      'A',
      productEvidence('A', {
        specifications: [rangeSpec('operating_temperature_range', -50, 70)],
      }),
    ],
    [
      'B',
      productEvidence('B', {
        specifications: [rangeSpec('operating_temperature_range', 0, 70)],
      }),
    ],
    [
      'C',
      productEvidence('C', {
        specifications: [rangeSpec('operating_temperature_range', -50, 50)],
      }),
    ],
    ['D', productEvidence('D')],
  ]);
  const { matcher } = matcherHarness(evidence);

  const point = await matcher.evaluate(parser.parse('operates at -40°C'), [
    'A',
    'B',
    'D',
  ]);
  assert.deepEqual(
    point.map((result) => result.temperatureMatches[0].result),
    ['MATCH', 'MISMATCH', 'UNKNOWN'],
  );
  assert.deepEqual(
    point.map((result) => result.hardMismatch),
    [false, true, false],
  );

  const interval = await matcher.evaluate(
    parser.parse('operating temperature -40 to 60°C'),
    ['A', 'C'],
  );
  assert.deepEqual(
    interval.map((result) => result.temperatureMatches[0].result),
    ['MATCH', 'MISMATCH'],
  );
});

test('uses only reviewed measurement keys for upper-bound evaluation', async () => {
  const parser = new TechnicalQueryParserService();
  const evidence = new Map([
    [
      'MEASUREMENT',
      productEvidence('MEASUREMENT', {
        specifications: [rangeSpec('soil_temperature_range', -50, 70)],
      }),
    ],
    [
      'OPERATING_ONLY',
      productEvidence('OPERATING_ONLY', {
        specifications: [rangeSpec('operating_temperature_range', -80, 100)],
      }),
    ],
  ]);
  const { matcher } = matcherHarness(evidence);
  const results = await matcher.evaluate(parser.parse('measure up to 70°C'), [
    'MEASUREMENT',
    'OPERATING_ONLY',
  ]);
  assert.deepEqual(
    results.map((result) => result.temperatureMatches[0].result),
    ['MATCH', 'UNKNOWN'],
  );
});

test('storage temperature and absent evidence never satisfy operating intent', async () => {
  const parser = new TechnicalQueryParserService();
  const evidence = new Map([
    [
      'STORAGE_ONLY',
      productEvidence('STORAGE_ONLY', {
        specifications: [rangeSpec('storage_temperature_range', -80, 100)],
      }),
    ],
    ['NO_EVIDENCE', productEvidence('NO_EVIDENCE')],
  ]);
  const { matcher } = matcherHarness(evidence);
  const results = await matcher.evaluate(parser.parse('operates at -40°C'), [
    'STORAGE_ONLY',
    'NO_EVIDENCE',
  ]);
  assert.deepEqual(
    results.map((result) => result.temperatureMatches[0].result),
    ['UNKNOWN', 'UNKNOWN'],
  );
  assert.ok(results.every((result) => result.hardMismatch === false));
});

test('matches protocol evidence and applies only the documented broad Modbus hierarchy', async () => {
  const parser = new TechnicalQueryParserService();
  const evidence = new Map([
    ['RTU', productEvidence('RTU', { supported: ['Modbus RTU'] })],
    ['BROAD', productEvidence('BROAD', { supported: ['Modbus'] })],
    ['NONE', productEvidence('NONE')],
  ]);
  const { matcher } = matcherHarness(evidence);

  const broad = await matcher.evaluate(parser.parse('Modbus'), [
    'RTU',
    'BROAD',
    'NONE',
  ]);
  assert.deepEqual(
    broad.map((result) => result.protocolMatches[0].result),
    ['MATCH', 'MATCH', 'UNKNOWN'],
  );
  const exact = await matcher.evaluate(parser.parse('Modbus RTU'), [
    'RTU',
    'BROAD',
  ]);
  assert.deepEqual(
    exact.map((result) => result.protocolMatches[0].result),
    ['MATCH', 'UNKNOWN'],
  );
});

test('matches identity only from canonical product identity', async () => {
  const parser = new TechnicalQueryParserService();
  const evidence = new Map([
    [
      'CSI_CS655',
      productEvidence('CSI_CS655', {
        model: 'CS655',
        supported: ['SDI-12'],
      }),
    ],
    ['OTHER', productEvidence('OTHER', { model: 'OTHER' })],
  ]);
  const { matcher } = matcherHarness(evidence);
  const results = await matcher.evaluate(parser.parse('CS655', catalog), [
    'CSI_CS655',
    'OTHER',
  ]);
  assert.deepEqual(
    results.map((result) => result.identityMatch),
    ['exact', 'none'],
  );
  assert.equal(results[0].identityEvidence[0].source, 'products');
  assert.equal(results[0].identityEvidence[0].field, 'model');
});

test('loads product documents and specifications once per candidate batch', async () => {
  const calls = {
    products: 0,
    documents: 0,
    specificationBatches: 0,
    singleSpecifications: 0,
  };
  const repository = {
    listByIds: async (ids, activeOnly) => {
      calls.products += 1;
      assert.equal(activeOnly, true);
      return ids.map((id) => ({
        product_id: id,
        model: id,
        product_name_en: `Product ${id}`,
        category: null,
        subcategory: null,
        device_type: null,
        status: 'active',
      }));
    },
    listDocuments: async (ids) => {
      calls.documents += 1;
      return ids.map((id) => ({
        product_id: id,
        search_document: {
          supported_protocols: [],
          unsupported_protocols: [],
        },
      }));
    },
    listSpecificationsByProductIds: async (ids) => {
      calls.specificationBatches += 1;
      return ids.map((id, index) => ({
        product_id: id,
        ...rangeSpec('operating_temperature_range', -50 + index, 70),
      }));
    },
    listSpecifications: async () => {
      calls.singleSpecifications += 1;
      return [];
    },
  };
  const productsService = new ProductsService(repository);
  const matcher = new TechnicalMatchService(productsService);
  const parser = new TechnicalQueryParserService();
  const results = await matcher.evaluate(parser.parse('operates at -40°C'), [
    'A',
    'B',
    'C',
  ]);

  assert.equal(results.length, 3);
  assert.deepEqual(calls, {
    products: 1,
    documents: 1,
    specificationBatches: 1,
    singleSpecifications: 0,
  });
});

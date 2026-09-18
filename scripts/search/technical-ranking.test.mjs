import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';

const require = createRequire(import.meta.url);
const projectRoot = path.resolve(import.meta.dirname, '..', '..');
const { TechnicalRankingService } = require(
  path.join(
    projectRoot,
    'apps',
    'api',
    'dist',
    'modules',
    'search',
    'technical-ranking.service.js',
  ),
);

const ranking = new TechnicalRankingService();

const candidate = (productId, rrfScore) => ({
  productId,
  model: productId,
  productNameEn: `Product ${productId}`,
  keywordRank: 1,
  semanticRank: 1,
  keywordScore: 0.5,
  semanticScore: 0.5,
  rrfScore,
  matchedBy: { keyword: true, semantic: true },
});

const match = (
  productId,
  {
    identity = null,
    protocols = [],
    temperatures = [],
    hardMismatch = false,
  } = {},
) => ({
  productId,
  identityMatch: identity ? 'exact' : 'none',
  identityEvidence: identity
    ? [
        {
          source: 'products',
          field: identity.field,
          value: identity.value,
        },
      ]
    : [],
  protocolMatches: protocols.map(
    ({ queryProtocol, result, evidenceProtocol = null }) => ({
      queryProtocol,
      result,
      evidence:
        result === 'MATCH' && evidenceProtocol
          ? [
              {
                source: 'product_document',
                canonicalProtocol: evidenceProtocol,
                relation: 'supported',
              },
            ]
          : [],
    }),
  ),
  temperatureMatches: temperatures,
  hardMismatch,
});

const temperature = (
  result,
  {
    kind = 'point',
    intent = 'operating',
    valueCelsius = -40,
    minCelsius = -50,
    maxCelsius = 60,
  } = {},
) => ({
  constraint:
    kind === 'range'
      ? {
          kind,
          intent,
          minCelsius,
          maxCelsius,
          unit: '°C',
          confidence: 'high',
        }
      : {
          kind,
          intent,
          valueCelsius,
          unit: '°C',
          confidence: 'high',
        },
  result,
  evidence:
    result === 'MATCH'
      ? [
          {
            source: 'normalized_spec',
            canonicalKey: `${intent}_temperature_range`,
            candidateRange: {
              minCelsius: -50,
              maxCelsius: 70,
              unit: '°C',
            },
            result: 'MATCH',
            rawRef: {
              file: 'data/raw/test.json',
              product_index: 0,
              spec_index: 0,
              source_rows: [1],
            },
          },
        ]
      : [],
});

test('pins a retrieved exact identity without changing its RRF score', () => {
  const candidates = [candidate('OTHER', 0.04), candidate('CSI_CS655', 0.01)];
  const ranked = ranking.rank(candidates, [
    match('OTHER'),
    match('CSI_CS655', {
      identity: { field: 'model', value: 'CS655' },
    }),
  ]);

  assert.deepEqual(
    ranked.map((item) => item.candidate.productId),
    ['CSI_CS655', 'OTHER'],
  );
  assert.equal(ranked[0].candidate.rrfScore, 0.01);
  assert.deepEqual(ranked[0].matchedFeatures, ['identity:model:CS655']);
});

test('prioritizes more confirmed protocol constraints and retains unknowns', () => {
  const candidates = [
    candidate('UNKNOWN', 0.04),
    candidate('ONE', 0.03),
    candidate('TWO', 0.02),
  ];
  const requested = [
    { queryProtocol: 'SDI-12', result: 'MATCH', evidenceProtocol: 'SDI-12' },
    { queryProtocol: 'RS-485', result: 'MATCH', evidenceProtocol: 'RS-485' },
  ];
  const ranked = ranking.rank(candidates, [
    match('UNKNOWN', {
      protocols: requested.map((item) => ({ ...item, result: 'UNKNOWN' })),
    }),
    match('ONE', {
      protocols: [requested[0], { ...requested[1], result: 'UNKNOWN' }],
    }),
    match('TWO', { protocols: requested }),
  ]);

  assert.deepEqual(
    ranked.map((item) => item.candidate.productId),
    ['TWO', 'ONE', 'UNKNOWN'],
  );
  assert.equal(ranked.length, 3);
});

test('does not hard-filter an explicit protocol mismatch', () => {
  const ranked = ranking.rank(
    [candidate('A', 0.02)],
    [
      match('A', {
        protocols: [{ queryProtocol: 'SDI-12', result: 'MISMATCH' }],
      }),
    ],
  );
  assert.equal(ranked.length, 1);
  assert.deepEqual(ranked[0].matchedFeatures, []);
});

test('orders operating MATCH before UNKNOWN and removes hard MISMATCH', () => {
  const ranked = ranking.rank(
    [
      candidate('UNKNOWN', 0.04),
      candidate('MISMATCH', 0.03),
      candidate('MATCH', 0.02),
    ],
    [
      match('UNKNOWN', { temperatures: [temperature('UNKNOWN')] }),
      match('MISMATCH', {
        temperatures: [temperature('MISMATCH')],
        hardMismatch: true,
      }),
      match('MATCH', { temperatures: [temperature('MATCH')] }),
    ],
  );

  assert.deepEqual(
    ranked.map((item) => item.candidate.productId),
    ['MATCH', 'UNKNOWN'],
  );
  assert.equal(ranked[0].technical.temperatureState, 'MATCH');
  assert.equal(ranked[1].technical.temperatureState, 'UNKNOWN');
});

test('prioritizes measurement MATCH and creates an evidence-only feature', () => {
  const ranked = ranking.rank(
    [candidate('UNKNOWN', 0.04), candidate('MATCH', 0.02)],
    [
      match('UNKNOWN', {
        temperatures: [
          temperature('UNKNOWN', {
            kind: 'upper_bound',
            intent: 'measurement',
            valueCelsius: 70,
          }),
        ],
      }),
      match('MATCH', {
        temperatures: [
          temperature('MATCH', {
            kind: 'upper_bound',
            intent: 'measurement',
            valueCelsius: 70,
          }),
        ],
      }),
    ],
  );

  assert.equal(ranked[0].candidate.productId, 'MATCH');
  assert.deepEqual(ranked[0].matchedFeatures, [
    'measurement-temperature:up-to-70°C',
  ]);
  assert.deepEqual(ranked[1].matchedFeatures, []);
});

test('formats an operating interval feature deterministically', () => {
  const ranked = ranking.rank(
    [candidate('A', 0.02)],
    [
      match('A', {
        temperatures: [
          temperature('MATCH', {
            kind: 'range',
            minCelsius: -50,
            maxCelsius: 60,
          }),
        ],
      }),
    ],
  );
  assert.deepEqual(ranked[0].matchedFeatures, [
    'operating-temperature:-50..60°C',
  ]);
});

test('uses actual structured protocol evidence in matched_features', () => {
  const ranked = ranking.rank(
    [candidate('RTU', 0.02)],
    [
      match('RTU', {
        protocols: [
          {
            queryProtocol: 'Modbus',
            result: 'MATCH',
            evidenceProtocol: 'Modbus RTU',
          },
        ],
      }),
    ],
  );
  assert.deepEqual(ranked[0].matchedFeatures, ['protocol:Modbus RTU']);
});

test('does not expose a temperature feature without positive evidence', () => {
  const claimedMatch = temperature('MATCH');
  claimedMatch.evidence = [];
  const ranked = ranking.rank(
    [candidate('A', 0.02)],
    [match('A', { temperatures: [claimedMatch] })],
  );
  assert.deepEqual(ranked[0].matchedFeatures, []);
});

test('preserves retrieval order and scores when there is no technical signal', () => {
  const candidates = [candidate('B', 0.04), candidate('A', 0.03)];
  const ranked = ranking.preserve(candidates);
  assert.deepEqual(
    ranked.map((item) => item.candidate.productId),
    ['B', 'A'],
  );
  assert.deepEqual(
    ranked.map((item) => item.candidate.rrfScore),
    [0.04, 0.03],
  );
  assert.ok(ranked.every((item) => item.matchedFeatures.length === 0));
});

test('uses original retrieval rank as deterministic fallback', () => {
  const ranked = ranking.rank(
    [candidate('Z', 0.02), candidate('A', 0.02)],
    [match('Z'), match('A')],
  );
  assert.deepEqual(
    ranked.map((item) => item.candidate.productId),
    ['Z', 'A'],
  );
});

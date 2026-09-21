import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { normalizeQuery } from './query-normalizer.mjs';

const root = path.resolve(import.meta.dirname, '..', '..', '..');
const vocabulary = JSON.parse(await readFile(path.join(root, 'data/ontology/semantic-vocabulary.json'), 'utf8'));

test('recognizes English and Vietnamese aliases from reviewed vocabulary/data', () => {
  const english = normalizeQuery('soil moisture sensor', vocabulary);
  const vietnamese = normalizeQuery('cảm biến độ ẩm đất', vocabulary);
  assert.equal(english.detected_concepts[0].key, 'volumetric_water_content');
  assert.equal(vietnamese.detected_concepts[0].key, 'volumetric_water_content');
  assert.match(english.expanded_keyword_query, /Volumetric Water Content/u);
  assert.match(vietnamese.expanded_keyword_query, /soil moisture/u);
});

test('preserves exact models and unknown queries as no-ops', () => {
  assert.equal(normalizeQuery('CS655', vocabulary, ['CS655']).no_op_reason, 'exact_identity');
  assert.equal(normalizeQuery('unknown-model-999', vocabulary).no_op_reason, 'no_supported_concept');
  assert.equal(normalizeQuery('unknown-model-999', vocabulary).expanded_keyword_query, 'unknown-model-999');
});

test('preserves protocol and temperature tokens in every expansion', () => {
  for (const query of ['soil moisture sensor SDI-12', 'air temperature sensor RS-485 at -40°C', 'weather sensor Modbus RTU']) {
    const result = normalizeQuery(query, vocabulary);
    const protectedTokens = query.match(/SDI-12|RS-485|-40°C|Modbus RTU/gu) ?? [];
    for (const alternative of result.alternatives) {
      for (const token of protectedTokens) assert.equal(alternative.includes(token), true);
    }
  }
});

test('skips ambiguous aliases and removes duplicate expansions', () => {
  const synthetic = {
    taxonomy: { subcategories: [], device_types: [] },
    measurements: [
      { key: 'one', label_en: 'Shared', label_vi: 'Một', aliases: [] },
      { key: 'two', label_en: 'Shared', label_vi: 'Hai', aliases: [] },
    ],
    applications: [],
    capabilities: [],
  };
  const result = normalizeQuery('shared', synthetic);
  assert.deepEqual(result.detected_concepts, []);
  assert.deepEqual(result.ambiguous_aliases, ['shared']);
  assert.equal(new Set(result.alternatives).size, result.alternatives.length);
  assert.equal(normalizeQuery('cảm biến SDI-12', vocabulary).no_op_reason, 'no_supported_concept');
});

test('handles empty input without expansion', () => {
  assert.deepEqual(normalizeQuery('   ', vocabulary).alternatives, []);
});

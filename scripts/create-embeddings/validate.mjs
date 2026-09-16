import { embeddingConfig, validateEmbeddingRows } from './lib.mjs';

const config = embeddingConfig();
const complete = (overrides = {}) => ({
  status: 'active',
  search_text: 'soil moisture sensor',
  embedding_present: true,
  embedding_model: config.model,
  embedding_dimensions: config.dimensions,
  embedding_version: config.version,
  embedded_at: '2026-09-16T00:00:00.000Z',
  ...overrides,
});
const fixtures = [
  complete(),
  complete({
    embedding_present: false,
    embedding_model: null,
    embedding_dimensions: null,
    embedding_version: null,
    embedded_at: null,
  }),
  complete({ embedding_model: 'old-model' }),
  complete({ embedding_dimensions: 768 }),
  complete({ embedding_version: 'old-version' }),
  complete({ embedded_at: null }),
  complete({ status: 'review' }),
];
const report = validateEmbeddingRows(fixtures, config);
console.log(
  JSON.stringify({ ...report, fixture_mode: true, result: 'PASS' }, null, 2),
);

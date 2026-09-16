export const EMBEDDING_DEFAULTS = Object.freeze({
  provider: 'ollama',
  baseUrl: 'http://127.0.0.1:11434',
  model: 'qwen3-embedding:4b',
  dimensions: 1536,
  version: 'ollama-qwen3-embedding-4b-1536-v1',
  timeoutMs: 180000,
  batchSize: 8,
});

const positiveInteger = (value, name) => {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw Object.assign(new Error(`${name} must be a positive integer`), {
      code: 'EMBEDDING_CONFIG_INVALID',
    });
  }
  return parsed;
};

export function embeddingConfig(environment = process.env) {
  const config = {
    provider: environment.EMBEDDING_PROVIDER ?? EMBEDDING_DEFAULTS.provider,
    baseUrl: environment.OLLAMA_BASE_URL ?? EMBEDDING_DEFAULTS.baseUrl,
    model: environment.EMBEDDING_MODEL ?? EMBEDDING_DEFAULTS.model,
    dimensions: positiveInteger(
      environment.EMBEDDING_DIMENSIONS ?? EMBEDDING_DEFAULTS.dimensions,
      'EMBEDDING_DIMENSIONS',
    ),
    version: environment.EMBEDDING_VERSION ?? EMBEDDING_DEFAULTS.version,
    timeoutMs: positiveInteger(
      environment.OLLAMA_EMBEDDING_TIMEOUT_MS ?? EMBEDDING_DEFAULTS.timeoutMs,
      'OLLAMA_EMBEDDING_TIMEOUT_MS',
    ),
    batchSize: positiveInteger(
      environment.EMBEDDING_BATCH_SIZE ?? EMBEDDING_DEFAULTS.batchSize,
      'EMBEDDING_BATCH_SIZE',
    ),
  };
  if (config.dimensions !== EMBEDDING_DEFAULTS.dimensions) {
    throw Object.assign(new Error('Embedding dimensions must be 1536'), {
      code: 'EMBEDDING_CONFIG_INVALID',
    });
  }
  return config;
}

const present = (value) => value !== null && value !== undefined;

export function classifyEmbedding(row, config) {
  const fields = [
    row.embedding_present ?? present(row.embedding),
    present(row.embedding_model),
    present(row.embedding_dimensions),
    present(row.embedding_version),
    present(row.embedded_at),
  ];
  const populated = fields.filter(Boolean).length;
  const partial = populated > 0 && populated < fields.length;
  const complete = populated === fields.length;
  const current =
    complete &&
    row.embedding_model === config.model &&
    Number(row.embedding_dimensions) === config.dimensions &&
    row.embedding_version === config.version;

  return {
    current,
    missing: populated === 0,
    partial,
    staleModel: complete && row.embedding_model !== config.model,
    staleDimensions:
      complete && Number(row.embedding_dimensions) !== config.dimensions,
    staleVersion: complete && row.embedding_version !== config.version,
    wrongDimensionMetadata:
      present(row.embedding_dimensions) &&
      Number(row.embedding_dimensions) !== config.dimensions,
  };
}

export function validateEmbeddingRows(rows, config) {
  const searchableRows = rows.filter(
    (row) =>
      row.status === 'active' &&
      typeof row.search_text === 'string' &&
      row.search_text.trim().length > 0,
  );
  const states = searchableRows.map((row) => classifyEmbedding(row, config));
  return {
    searchable_rows: searchableRows.length,
    current_embeddings: states.filter((state) => state.current).length,
    missing_embeddings: states.filter((state) => state.missing).length,
    stale_model: states.filter((state) => state.staleModel).length,
    stale_dimensions: states.filter((state) => state.staleDimensions).length,
    stale_version: states.filter((state) => state.staleVersion).length,
    partial_metadata_state: states.filter((state) => state.partial).length,
    review_products_indexed: rows.filter((row) => row.status === 'review')
      .length,
    wrong_dimension_metadata: states.filter(
      (state) => state.wrongDimensionMetadata,
    ).length,
  };
}

export const sanitizedReason = (error) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  typeof error.code === 'string'
    ? error.code
    : 'UNKNOWN_EMBEDDING_ERROR';

export async function runEmbeddingBackfill({ repository, provider, config }) {
  const rows = await repository.findSearchableRows();
  const candidates = [];
  let skippedCurrent = 0;
  for (const row of rows) {
    if (classifyEmbedding(row, config).current) skippedCurrent += 1;
    else candidates.push(row);
  }

  const result = {
    searchable_rows: rows.length,
    current_before: skippedCurrent,
    attempted: 0,
    embedded: 0,
    failed: 0,
    skipped_current: skippedCurrent,
    concurrent_source_changed: 0,
    remaining_missing_or_stale: candidates.length,
    failures: [],
  };

  for (let offset = 0; offset < candidates.length; offset += config.batchSize) {
    const batch = candidates.slice(offset, offset + config.batchSize);
    result.attempted += batch.length;
    let vectors;
    try {
      vectors = await provider.embedMany(batch.map((row) => row.search_text));
    } catch (error) {
      const reason = sanitizedReason(error);
      result.failed += batch.length;
      result.failures.push(
        ...batch.map((row) => ({ product_id: row.product_id, reason })),
      );
      continue;
    }

    for (let index = 0; index < batch.length; index += 1) {
      const row = batch[index];
      const updated = await repository.updateEmbeddingIfSourceCurrent({
        productId: row.product_id,
        sourceContentHash: row.source_content_hash,
        indexVersion: row.index_version,
        vector: vectors[index],
        model: config.model,
        dimensions: config.dimensions,
        version: config.version,
      });
      if (updated) result.embedded += 1;
      else result.concurrent_source_changed += 1;
    }
  }

  result.remaining_missing_or_stale -= result.embedded;
  return result;
}

export function emptyBackfillStats() {
  return {
    searchable_rows: 0,
    current_before: 0,
    attempted: 0,
    embedded: 0,
    failed: 0,
    skipped_current: 0,
    concurrent_source_changed: 0,
    remaining_missing_or_stale: 0,
    failures: [],
  };
}

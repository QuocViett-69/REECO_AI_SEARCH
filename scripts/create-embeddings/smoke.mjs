import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { embeddingConfig, sanitizedReason } from './lib.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..', '..');
const require = createRequire(import.meta.url);
const { OllamaEmbeddingProvider } = require(
  path.join(
    projectRoot,
    'apps',
    'api',
    'dist',
    'ai',
    'ollama-embedding.provider.js',
  ),
);
const config = embeddingConfig();
const provider = new OllamaEmbeddingProvider(config);
const inputs = ['cảm biến đo độ ẩm đất', 'soil moisture sensor'];
const started = Date.now();

let result = 'PASS';
try {
  await provider.embedMany(inputs);
} catch (error) {
  const reason = sanitizedReason(error);
  if (reason === 'OLLAMA_NOT_REACHABLE') result = 'NOT RUN / HOST ISOLATION';
  else {
    result = 'FAIL';
    process.exitCode = 1;
  }
}

console.log(
  JSON.stringify(
    {
      provider: config.provider,
      model: config.model,
      dimensions: config.dimensions,
      input_count: inputs.length,
      duration_ms: Date.now() - started,
      result,
    },
    null,
    2,
  ),
);

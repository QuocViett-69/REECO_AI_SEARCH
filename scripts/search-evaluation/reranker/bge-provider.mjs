import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

export const BGE_CONFIG = {
  modelId: 'BAAI/bge-reranker-v2-m3',
  revision: '953dc6f6f85a1b2dbfca4c34a2796e7dde08d41e',
  pythonPath: process.env.REECO_RERANKER_PYTHON ?? 'E:\\ModelCache\\reeco-reranker-venv\\Scripts\\python.exe',
  modelPath: process.env.REECO_RERANKER_MODEL_PATH ?? 'E:\\ModelCache\\huggingface\\hub\\models--BAAI--bge-reranker-v2-m3\\snapshots\\953dc6f6f85a1b2dbfca4c34a2796e7dde08d41e',
  batchSize: 4,
  maxLength: 512,
};

const values = (items) => [...new Set(items.flatMap((item) => [item.label_en, item.label_vi]).filter(Boolean))].join('; ');
const specification = (item) => `${item.canonical_key}=${JSON.stringify(item.normalized_value)}`;

export function serializeCandidate(candidate) {
  return [
    `Model: ${candidate.model}`,
    `Product: ${[candidate.product_name, candidate.product_name_vi].filter(Boolean).join(' | ')}`,
    `Taxonomy: ${[candidate.taxonomy?.category, candidate.taxonomy?.subcategory, candidate.taxonomy?.device_type].filter(Boolean).join(' > ')}`,
    `Measurements: ${values(candidate.measurements)}`,
    `Capabilities: ${values(candidate.capabilities)}`,
    `Applications: ${values(candidate.applications)}`,
    `Protocols: ${candidate.protocols.join('; ')}`,
    `Relevant specifications: ${candidate.relevant_normalized_specifications.map(specification).join('; ')}`,
    `Matched structured features: ${candidate.matched_features.join('; ')}`,
  ].join('\n');
}

export class BgeRerankerProvider {
  constructor(config = BGE_CONFIG) {
    this.config = config;
    this.pending = new Map();
    this.nextId = 1;
  }

  async start() {
    const workerPath = fileURLToPath(new URL('./bge-worker.py', import.meta.url));
    this.process = spawn(this.config.pythonPath, [workerPath, '--model-path', this.config.modelPath, '--model-id', this.config.modelId, '--revision', this.config.revision, '--batch-size', String(this.config.batchSize), '--max-length', String(this.config.maxLength)], {
      stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true,
      env: { ...process.env, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' },
    });
    this.stderr = '';
    this.process.stderr.on('data', (chunk) => { this.stderr = `${this.stderr}${chunk}`.slice(-4000); });
    const lines = createInterface({ input: this.process.stdout });
    lines.on('line', (line) => this.handle(JSON.parse(line)));
    this.process.on('exit', () => {
      this.readyReject?.(Object.assign(new Error(`BGE worker exited before ready: ${this.stderr}`), { code: 'PROVIDER_FAILURE' }));
      for (const { reject } of this.pending.values()) reject(Object.assign(new Error('BGE worker exited'), { code: 'PROVIDER_FAILURE' }));
      this.pending.clear();
    });
    this.ready = new Promise((resolve, reject) => {
      this.readyResolve = resolve;
      this.readyReject = reject;
      this.process.once('error', reject);
    });
    return this.ready;
  }

  handle(message) {
    if (message.type === 'ready') return this.readyResolve(message);
    const pending = this.pending.get(message.id);
    if (!pending) return;
    this.pending.delete(message.id);
    if (message.type === 'error') pending.reject(Object.assign(new Error(`BGE inference failed: ${message.message ?? message.error}`), { code: message.error ?? 'PROVIDER_FAILURE' }));
    else pending.resolve(message);
  }

  async rerank({ query, candidates }) {
    const id = this.nextId++;
    const result = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.process.stdin.write(`${JSON.stringify({ id, query, documents: candidates.map(serializeCandidate) })}\n`);
    const response = await result;
    const ranked = candidates.map((candidate, index) => ({ productId: candidate.product_id, score: response.scores[index], index }))
      .sort((left, right) => right.score - left.score || left.index - right.index);
    return {
      ordered_candidate_ids: ranked.map((item) => item.productId),
      scores: Object.fromEntries(ranked.map((item) => [item.productId, item.score])),
      timing_metadata: { inference_ms: response.inference_ms },
      resource_usage: { input_tokens: response.input_tokens, peak_vram_mb: response.peak_vram_mb },
    };
  }

  async close() {
    if (!this.process) return;
    this.process.stdin.end();
    await new Promise((resolve) => this.process.once('exit', resolve));
  }
}

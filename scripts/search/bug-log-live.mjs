import { createRequire } from 'node:module';
import { readFile, mkdir, writeFile, readdir, cp } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const require = createRequire(import.meta.url);
const { NestFactory } = require('@nestjs/core');
const dist = process.argv.includes('--baseline') ? '../../output/bug-log/baseline-dist' : '../../apps/api/dist';
if (process.argv.includes('--baseline')) {
  const ts = require('typescript');
  await cp(new URL('../../apps/api/dist/', import.meta.url), new URL(`${dist}/`, import.meta.url), { recursive: true });
  const files = execFileSync('git', ['ls-files', 'apps/api/src'], { encoding: 'utf8' }).trim().split('\n').filter(f => f.endsWith('.ts'));
  for (const file of files) {
    const source = execFileSync('git', ['show', `HEAD:${file}`], { encoding: 'utf8' });
    const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true, emitDecoratorMetadata: true, esModuleInterop: true } }).outputText;
    const path = new URL(`${dist}/${file.replace('apps/api/src/', '').replace(/\.ts$/u, '.js')}`, import.meta.url);
    await mkdir(new URL('./', path), { recursive: true }); await writeFile(path, compiled);
  }
}
const { AppModule } = require(`${dist}/app.module.js`);
const { SearchService } = require(`${dist}/modules/search/search.service.js`);
const cases = JSON.parse(await readFile(new URL('./bug-log-cases.json', import.meta.url), 'utf8'));
const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
const service = app.get(SearchService);
const { parseSearchIntent } = require(`${dist}/modules/search/search-intent.js`);
const original = service.hybridSearch.search.bind(service.hybridSearch);
let trace = [];
service.hybridSearch.search = async (query, limit) => {
  const result = await original(query, limit);
  trace.push({ query, ...result });
  return result;
};
const report = [];
try {
  for (const item of cases) {
    trace = [];
    const started = performance.now();
    try {
      const response = await service.search({ query: item.query, limit: 10, explain: true });
      report.push({ ...item, parsed_intent: parseSearchIntent(item.query), response, trace, latency_ms: Math.round(performance.now() - started) });
      console.log(item.id, response.mode, response.results.map(p => p.model).join(', ') || 'EMPTY');
    } catch (error) {
      report.push({ ...item, error: error.message, status: error.getStatus?.(), trace });
      console.log(item.id, 'ERROR', error.message);
    }
  }
  await mkdir('output/bug-log', { recursive: true });
  const { configuration } = require(`${dist}/config/configuration.js`);
  const config = configuration();
  const { SupabaseService } = require(`${dist}/database/supabase/supabase.service.js`);
  const { data: hashes, error } = await app.get(SupabaseService).getClient().from('product_documents').select('product_id,content_hash').order('product_id');
  if (error) throw new Error('Could not record catalog version');
  const runtimeModules = [];
  for (const name of (await readdir(new URL(`${dist}/modules/search/`, import.meta.url))).filter(n => n.endsWith('.js')).sort()) {
    runtimeModules.push({ name, sha256: createHash('sha256').update(await readFile(new URL(`${dist}/modules/search/${name}`, import.meta.url))).digest('hex') });
  }
  const versions = { base_commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    runtime: process.version, baseline: process.argv.includes('--baseline'),
    embedding: service.hybridSearch.semanticSearch.embeddings.getConfigurationMetadata(),
    explanation: { enabled: config.explanation.llmEnabled, model: config.explanation.model, timeout_ms: config.explanation.timeoutMs },
    runtime_modules: runtimeModules,
    catalog: hashes, catalog_sha256: createHash('sha256').update(JSON.stringify(hashes)).digest('hex') };
  const reviewed = await Promise.all(['CSI_109', 'CSI_CLIMAVUE40', 'CSI_TX325'].map(async id => ({ product_id: id,
    sha256: createHash('sha256').update(await readFile(`data/normalized/specifications/${id}.json`)).digest('hex') })));
  versions.reviewed_specifications = reviewed;
  await writeFile(`output/bug-log/${process.argv[2] ?? 'live'}.json`, JSON.stringify({ generated_at: new Date().toISOString(), versions, report }, null, 2));
} finally { await app.close(); }

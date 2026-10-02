import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const markdown = await readFile(path.join(root, 'REECO_AI_Search_Explanation_Test_Cases_VI_EN.md'), 'utf8');
const cases = [...markdown.matchAll(/^## (TC-[A-Z]+-\d+)\s+\*\*VI:\*\*\s+([^\n]+)\s+\*\*EN:\*\*\s+([^\n]+)/gm)]
  .flatMap(([, id, vi, en]) => [{ id, language: 'vi', query: vi.trim() }, { id, language: 'en', query: en.trim() }]);
if (cases.length !== 140) throw new Error(`Expected 140 queries, parsed ${cases.length}`);
const directory = path.join(root, 'output', 'explanation-cases');
await mkdir(directory, { recursive: true });
const results = [];
// Two workers keep the local model responsive without a sequential 140-query run.
let next = 0;
async function worker() {
  while (next < cases.length) {
    const item = cases[next++];
    const started = Date.now();
    try {
      const response = await fetch(`${process.env.SEARCH_TEST_BASE_URL || 'http://localhost:3000'}/api/v1/search`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: item.query, limit: 5, explain: true }), signal: AbortSignal.timeout(60000),
      });
      const body = await response.json();
      const products = body.results || [];
      results.push({ ...item, status: response.status, latencyMs: Date.now() - started,
        checks: { response_ok: response.ok, nonempty: products.length > 0,
          explanation_present: products.length > 0 && products.every(p => !!p.explanation?.text),
          evidence_present: products.length > 0 && products.every(p => p.explanation?.evidence?.length > 0),
          language_correct: products.length > 0 && products.every(p => p.explanation?.language === item.language) }, body });
    } catch (error) {
      results.push({ ...item, latencyMs: Date.now() - started, error: error.message });
    }
    await writeFile(path.join(directory, 'responses.json'), JSON.stringify(results.sort((a, b) => a.id.localeCompare(b.id) || b.language.localeCompare(a.language)), null, 2));
    console.log(`${results.length}/140 ${item.id} ${item.language}`);
  }
}
await Promise.all([worker(), worker()]);
console.log(JSON.stringify({ queries: results.length, errors: results.filter(r => r.error || r.status !== 200).length,
  empty: results.filter(r => r.body?.results?.length === 0).length,
  wrongLanguage: results.filter(r => r.checks?.nonempty && !r.checks.language_correct).length }));

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { NestFactory } = require('@nestjs/core');
const fromDist = name => require(`../../apps/api/dist/modules/search/${name}.js`);
const { AppModule } = require('../../apps/api/dist/app.module.js');
const { SearchService } = fromDist('search.service');
const { ProductsService } = require('../../apps/api/dist/modules/products/products.service.js');
const { TechnicalQueryParserService } = fromDist('technical-query-parser.service');
const { ExplanationService } = fromDist('explanation.service');
const { verifiedWording } = fromDist('explanation-wording');
const { protocolSatisfies } = fromDist('protocol-query');

// Read-only real retrieval; does not bind a server, reset users or write product data.
const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
try {
  const search = app.get(SearchService);
  const products = app.get(ProductsService);
  const parser = app.get(TechnicalQueryParserService);
  const explanation = app.get(ExplanationService);
  const matcher = search.technicalMatch;
  const catalog = await products.getActiveTechnicalIdentityCatalog();
  let rewritten = 0;
  for (const query of [
    'cảm biến độ ẩm đất hoạt động ở 233,15 K SDI12',
    'data logger Modbus TCP',
    'data logger without RS485, with Ethernet',
    'cảm biến độ ẩm đất không cần Wi-Fi',
    'soil moisture and air temperature, SDI-12',
    'CS655 có hỗ trợ Wi-Fi không?',
  ]) {
    const result = await search.search({ query, limit: 3, explain: true });
    if (query === 'soil moisture and air temperature, SDI-12') {
      assert.equal(result.results.length, 0, 'Mandatory requirements must not be weakened to force a result');
    } else if (!query.includes('without')) assert.ok(result.results.length, `No real retrieval result for ${query}`);
    const ids = result.results.map(item => item.product_id);
    const evidence = await products.getTechnicalEvidenceByIds(ids);
    const matches = await matcher.evaluate(parser.parse(query, catalog), ids);
    for (const item of result.results) {
      const entry = evidence.get(item.product_id);
      if (query.includes('without RS485')) assert.ok(!entry.document.supported_protocols.some(protocol => protocolSatisfies('RS-485', protocol)));
      const draft = explanation.explain(query, entry.document, matches.find(match => match.productId === item.product_id), entry.specifications);
      assert.ok(verifiedWording(item.explanation.text, draft.text, item.model), `Unverified generated text for ${item.model}`);
      if (item.explanation.source === 'llm' && item.explanation.text !== draft.text) rewritten++;
    }
    console.log(JSON.stringify({ query, mode: result.mode, models: result.results.map(item => item.model),
      explanations: result.results.map(item => ({ model: item.model, generation: item.explanation.generation, text: item.explanation.text })) }));
  }
  assert.ok(rewritten > 0, 'The real LLM must produce at least one changed, verified explanation');
  console.log(JSON.stringify({ result: 'PASS', verified_rewrites: rewritten }));
} finally {
  await app.close();
}

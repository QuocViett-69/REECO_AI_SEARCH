import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const projectRoot = path.resolve(import.meta.dirname, '..', '..');
const fromDist = (...segments) =>
  require(path.join(projectRoot, 'apps', 'api', 'dist', ...segments));
const { NestFactory } = require('@nestjs/core');
const { SearchResponseSchema } = require(
  path.join(projectRoot, 'packages', 'shared', 'dist', 'index.js'),
);
const { AppModule } = fromDist('app.module.js');
const { ProductsService } = fromDist(
  'modules',
  'products',
  'products.service.js',
);
const { HybridSearchService } = fromDist(
  'modules',
  'search',
  'hybrid-search.service.js',
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
const { TechnicalRankingService } = fromDist(
  'modules',
  'search',
  'technical-ranking.service.js',
);
const { TECHNICAL_QUERY_PARSER_VERSION } = fromDist(
  'modules',
  'search',
  'technical-query.constants.js',
);

const controlQueries = new Set([
  'soil moisture sensor',
  'cảm biến độ ẩm đất',
  '900 MHz radio',
  'weather station',
  'precipitation sensor',
  'temperature sensor',
]);
const identityExpectations = new Map([
  ['CS655', 'CSI_CS655'],
  ['CSI_CS655', 'CSI_CS655'],
  ['AVW200-ST', 'CSI_AVW200_ST'],
  ['CR350-NA', 'CSI_CR350_NA'],
]);
const protocolQueries = new Set([
  'SDI-12',
  'Modbus',
  'Modbus RTU',
  'RS-485',
  'sensor with SDI-12',
  'cảm biến hỗ trợ SDI-12',
]);
const queries = [
  'soil moisture sensor',
  'cảm biến độ ẩm đất',
  '900 MHz radio',
  'weather station',
  'precipitation sensor',
  'CS655',
  'CSI_CS655',
  'AVW200-ST',
  'CR350-NA',
  'CS65',
  'SDI-12',
  'Modbus',
  'Modbus RTU',
  'RS-485',
  'sensor with SDI-12',
  'cảm biến hỗ trợ SDI-12',
  'operates at -40°C',
  'hoạt động ở -40°C',
  'operates at 60 C',
  'operating temperature -50 to 60°C',
  'measure up to 70°C',
  'đo tới 70°C',
  'temperature sensor',
];

const hasTechnicalSignal = (parsed) =>
  parsed.confidence.identity === 'high' ||
  parsed.confidence.protocol === 'high' ||
  parsed.temperatureConstraints.some(
    (constraint) =>
      constraint.confidence === 'high' && constraint.intent !== 'ambiguous',
  );

const app = await NestFactory.create(AppModule, { logger: false });
app.setGlobalPrefix('api/v1');
await app.listen(0, '127.0.0.1');

const hybridSearch = app.get(HybridSearchService);
const productsService = app.get(ProductsService);
const parser = app.get(TechnicalQueryParserService);
const matcher = app.get(TechnicalMatchService);
const ranking = app.get(TechnicalRankingService);
const identityCatalog =
  await productsService.getActiveTechnicalIdentityCatalog();
const baseUrl = await app.getUrl();
const queryResults = [];

try {
  for (const query of queries) {
    const before = await hybridSearch.search(query);
    const parsed = parser.parse(query, identityCatalog);
    const signalDetected = hasTechnicalSignal(parsed);
    const matches = signalDetected
      ? await matcher.evaluate(
          parsed,
          before.candidates.map((candidate) => candidate.productId),
        )
      : [];
    const ranked = signalDetected
      ? ranking.rank(before.candidates, matches)
      : ranking.preserve(before.candidates);
    const matchesById = new Map(
      matches.map((match) => [match.productId, match]),
    );
    const rankedById = new Map(
      ranked.map((item, index) => [
        item.candidate.productId,
        { ...item, finalRank: index + 1 },
      ]),
    );

    const response = await fetch(`${baseUrl}/api/v1/search`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, limit: 10 }),
    });
    assert.equal(response.status, 200, query);
    const publicResult = SearchResponseSchema.parse(await response.json());
    assert.equal(publicResult.mode, 'hybrid', query);
    for (const result of publicResult.results) {
      assert.notEqual(result.scores.hybrid, null, query);
      assert.equal(result.scores.rerank, null, query);
    }

    const beforeIds = before.candidates.map((candidate) => candidate.productId);
    const afterIds = ranked.map((item) => item.candidate.productId);
    const orderingUnchanged =
      beforeIds.length === afterIds.length &&
      beforeIds.every((productId, index) => productId === afterIds[index]);

    if (controlQueries.has(query)) {
      assert.equal(signalDetected, false, query);
      assert.equal(orderingUnchanged, true, query);
      assert.ok(
        publicResult.results.every(
          (result) => result.matched_features.length === 0,
        ),
        query,
      );
    }

    const expectedIdentity = identityExpectations.get(query);
    if (expectedIdentity) {
      assert.equal(parsed.identity?.productId, expectedIdentity, query);
      assert.ok(beforeIds.includes(expectedIdentity), query);
      assert.equal(
        publicResult.results[0]?.product_id,
        expectedIdentity,
        query,
      );
      assert.ok(
        publicResult.results[0]?.matched_features.some((feature) =>
          feature.startsWith('identity:'),
        ),
        query,
      );
    }
    if (query === 'CS65') {
      assert.equal(parsed.identity, null);
      assert.equal(orderingUnchanged, true);
    }

    if (protocolQueries.has(query)) {
      assert.ok(parsed.protocols.length > 0, query);
      const matchFlags = ranked.map((item) =>
        item.technical.confirmedProtocolMatchCount > 0 ? 1 : 0,
      );
      const firstUnknown = matchFlags.indexOf(0);
      if (firstUnknown >= 0) {
        assert.ok(
          matchFlags.slice(firstUnknown).every((flag) => flag === 0),
          query,
        );
      }
      assert.ok(matchFlags.includes(1), query);
      assert.ok(
        publicResult.results.some((result) =>
          result.matched_features.some((feature) =>
            feature.startsWith('protocol:'),
          ),
        ),
        query,
      );
    }

    if (parsed.confidence.temperature === 'high') {
      const hardMismatchIds = matches
        .filter((match) => match.hardMismatch)
        .map((match) => match.productId);
      assert.ok(
        hardMismatchIds.every((productId) => !rankedById.has(productId)),
        query,
      );
      const unknownIds = matches
        .filter((match) =>
          match.temperatureMatches.some(
            (temperature) => temperature.result === 'UNKNOWN',
          ),
        )
        .map((match) => match.productId);
      assert.ok(
        unknownIds.every((productId) => rankedById.has(productId)),
        query,
      );
      const states = ranked.map((item) => item.technical.temperatureState);
      const firstUnknown = states.indexOf('UNKNOWN');
      if (firstUnknown >= 0) {
        assert.ok(
          states.slice(firstUnknown).every((state) => state === 'UNKNOWN'),
          query,
        );
      }
      assert.ok(states.includes('MATCH'), query);
      assert.ok(
        publicResult.results.some((result) =>
          result.matched_features.some((feature) =>
            feature.includes('-temperature:'),
          ),
        ),
        query,
      );
    }

    queryResults.push({
      query,
      mode: publicResult.mode,
      parsed_query: parsed,
      signal_detected: signalDetected,
      identity_retrieval_failure:
        parsed.identity !== null &&
        !beforeIds.includes(parsed.identity.productId),
      ordering_unchanged: orderingUnchanged,
      before: before.candidates.slice(0, 20).map((candidate, index) => ({
        rank: index + 1,
        product_id: candidate.productId,
        model: candidate.model,
        rrf_score: candidate.rrfScore,
      })),
      after: ranked.slice(0, 10).map((rankedItem, index) => {
        const candidate = rankedItem.candidate;
        const technicalMatch = matchesById.get(candidate.productId);
        return {
          rank: index + 1,
          original_rrf_rank: rankedItem.originalHybridRank,
          product_id: candidate.productId,
          model: candidate.model,
          rrf_score: candidate.rrfScore,
          exact_identity: rankedItem.technical.exactIdentity,
          protocol_matches:
            technicalMatch?.protocolMatches.filter(
              (protocol) => protocol.result === 'MATCH',
            ) ?? [],
          temperature_state: rankedItem.technical.temperatureState,
          hard_mismatch: rankedItem.technical.hardMismatch,
          matched_features: rankedItem.matchedFeatures,
        };
      }),
      public_smoke: publicResult.results.map((result, index) => ({
        rank: index + 1,
        product_id: result.product_id,
        model: result.model,
        keyword_score: result.scores.keyword,
        semantic_score: result.scores.semantic,
        rrf_score: result.scores.hybrid,
        matched_features: result.matched_features,
      })),
      filtered_hard_mismatches: matches
        .filter((match) => match.hardMismatch)
        .map((match) => ({
          product_id: match.productId,
          original_rrf_rank:
            before.candidates.findIndex(
              (candidate) => candidate.productId === match.productId,
            ) + 1,
          temperature_matches: match.temperatureMatches,
        })),
    });
  }

  const report = {
    generated_at: new Date().toISOString(),
    purpose: 'Step 7.6B deterministic public technical ranking evaluation',
    parser_version: TECHNICAL_QUERY_PARSER_VERSION,
    policy: [
      'exact_identity_desc',
      'filter_numeric_hard_mismatch',
      'satisfied_constraint_count_desc',
      'confirmed_protocol_match_count_desc',
      'temperature_match_before_unknown',
      'original_retrieval_rank_asc',
      'product_id_asc',
    ],
    request_limit: 10,
    queries: queryResults,
    result: 'PASS',
  };
  const reportPath = path.join(
    projectRoot,
    'data',
    'reports',
    'technical-ranking-evaluation.json',
  );
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(
    JSON.stringify(
      {
        report: path.relative(projectRoot, reportPath),
        parser_version: report.parser_version,
        queries: report.queries.length,
        controls_unchanged: report.queries
          .filter((item) => controlQueries.has(item.query))
          .every((item) => item.ordering_unchanged),
        result: report.result,
      },
      null,
      2,
    ),
  );
} finally {
  await app.close();
}

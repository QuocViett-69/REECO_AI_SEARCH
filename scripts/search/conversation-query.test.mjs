import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { resolveConversationQuery } = require(path.resolve(import.meta.dirname, '../../apps/api/dist/modules/search/conversation-query.js'));
const { SearchService } = require(path.resolve(import.meta.dirname, '../../apps/api/dist/modules/search/search.service.js'));
const context = { base_query: 'soil moisture sensor', previous_query: 'soil moisture sensor SDI-12' };

test('keeps independent searches independent', () => {
  assert.deepEqual(resolveConversationQuery('wind speed sensor', context), { query: 'wind speed sensor', applied: false });
  assert.deepEqual(resolveConversationQuery('105E'), { query: '105E', applied: false });
  assert.deepEqual(resolveConversationQuery('and without Modbus', context), { query: 'and without Modbus', applied: false });
});

test('adds refinements and replaces alternatives without carrying the previous filter', () => {
  assert.deepEqual(resolveConversationQuery('and operates at -40°C', context), {
    query: 'soil moisture sensor SDI-12 operates at -40°C', applied: true,
  });
  assert.deepEqual(resolveConversationQuery('what about Modbus?', context), {
    query: 'soil moisture sensor Modbus', applied: true,
  });
  assert.deepEqual(resolveConversationQuery('còn Modbus RTU?', context), {
    query: 'soil moisture sensor Modbus RTU', applied: true,
  });
});

test('understands a short Vietnamese protocol follow-up and enforces query length', () => {
  assert.deepEqual(resolveConversationQuery('có hỗ trợ SDI-12 không?', {
    base_query: 'soil moisture sensor', previous_query: 'soil moisture sensor',
  }), { query: 'soil moisture sensor SDI-12', applied: true });
  assert.deepEqual(resolveConversationQuery('and SDI-12', {
    base_query: 'x'.repeat(500), previous_query: 'x'.repeat(500),
  }), { query: 'and SDI-12', applied: false });
});

test('follow-up keeps the starting product scope and requires confirmed support', async () => {
  const candidate = (productId) => ({
    productId, keywordScore: 0, semanticScore: null, rrfScore: 0,
  });
  const candidates = ['A', 'B', 'C'].map(candidate);
  const searchedQueries = [];
  const service = new SearchService(
    { search: async (query) => {
      searchedQueries.push(query);
      return { mode: 'hybrid', candidates: query === 'soil moisture sensor' ? candidates : [candidate('C')] };
    } },
    {
      getActiveTechnicalIdentityCatalog: async () => [],
      getPublicSummariesByIds: async () => new Map(['A', 'B', 'C'].map((id) => [id, {
        product_id: id, model: id, name_en: id, name_vi: null,
        category: null, device_type: null, image_url: null,
      }])),
    },
    { parse: () => ({
      identity: null, protocols: ['Modbus'], temperatureConstraints: [],
      confidence: { identity: 'none', protocol: 'high', temperature: 'none' },
    }) },
    { evaluate: async (_query, ids) => ids.map((productId) => ({
      productId, protocolMatches: [{ result: productId === 'A' ? 'MATCH' : 'UNKNOWN' }],
      temperatureMatches: [], hardMismatch: false,
    })) },
    { rank: (items) => items.map((item) => ({ candidate: item, matchedFeatures: [] })) },
    { rerank: async (_query, _parsed, items) => items },
    { explain: () => { throw new Error('Not requested'); } },
  );
  const response = await service.search({
    query: 'and Modbus', limit: 10,
    context: { ...context, product_ids: ['A', 'B'] },
  });
  assert.equal(response.resolved_query, 'soil moisture sensor SDI-12 Modbus');
  assert.deepEqual(searchedQueries, ['soil moisture sensor']);
  assert.deepEqual(response.results.map((item) => item.product_id), ['A']);
  await assert.rejects(service.search({
    query: 'and without Modbus', limit: 10,
    context: { ...context, product_ids: ['A', 'B'] },
  }), /Negative search constraints are not supported/);
});

import fixtures from './searchFixtures.json';

// Mock for POST /search so UI work does not need Ollama or the local LLM.
// Enable per machine in apps/client/.env.local: REACT_APP_SEARCH_MOCK=true
// Fixtures are real hybrid-mode responses captured from an AI-enabled backend.
//
// Special queries preview non-happy states:
//   !empty        → 0 results
//   !error        → network error
//   !unavailable  → 503
//   !invalid      → 400
//   !slow         → first fixture after a 4s delay

export const isSearchMockEnabled =
  process.env.REACT_APP_SEARCH_MOCK?.toLowerCase() === 'true';

if (isSearchMockEnabled) {
  console.info('[search] Mock mode ON — results come from searchFixtures.json');
}

const DELAY_MS = Number(process.env.REACT_APP_SEARCH_MOCK_DELAY_MS ?? 600);

const normalize = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9-]+/g, ' ')
    .trim();

const tokens = (text) => new Set(normalize(text).split(' ').filter(Boolean));

function pickFixture(query) {
  const target = normalize(query);
  const exact = fixtures.find((f) => normalize(f.query) === target);
  if (exact) return exact;

  const queryTokens = tokens(query);
  let best = null;
  let bestScore = 0;
  for (const fixture of fixtures) {
    const fixtureTokens = tokens(fixture.query);
    let shared = 0;
    queryTokens.forEach((t) => fixtureTokens.has(t) && shared++);
    const score = shared / Math.max(queryTokens.size, fixtureTokens.size);
    if (score > bestScore) {
      best = fixture;
      bestScore = score;
    }
  }
  return best;
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Returns { status, body } shaped like the real endpoint.
export async function mockSearch(query, limit = 10, context = null) {
  const command = query.trim().toLowerCase();
  await wait(command === '!slow' ? 4000 : DELAY_MS);

  if (command === '!error') throw new Error('Mock network error');
  if (command === '!unavailable') return { status: 503, body: {} };
  if (command === '!invalid') {
    return { status: 400, body: { message: 'Mock invalid search query' } };
  }

  const fixture = command === '!empty' ? null : command === '!slow' ? fixtures[0] : pickFixture(context ? `${context.base_query} ${query}` : query);
  let results = fixture ? fixture.results : [];
  if (context) {
    results = results.filter((r) => context.product_ids.includes(r.product_id));
  }

  return {
    status: 200,
    body: {
      query,
      ...(context && {
        resolved_query: `${context.base_query} ${query}`,
        context_applied: true,
      }),
      mode: 'hybrid',
      results: results.slice(0, limit),
    },
  };
}

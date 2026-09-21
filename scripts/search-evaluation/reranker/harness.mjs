import {
  ndcgAt,
  precisionAt,
  recallAt,
  reciprocalRankAt,
} from '../metrics.mjs';

export const METRIC_NAMES = [
  'mrr_at_10',
  'recall_at_5',
  'recall_at_10',
  'precision_at_5',
  'ndcg_at_5',
  'ndcg_at_10',
];

export function queryMetrics(order, judgments) {
  if (!judgments.some((item) => item.relevance > 0)) return null;
  return {
    mrr_at_10: reciprocalRankAt(order, judgments, 10),
    recall_at_5: recallAt(order, judgments, 5),
    recall_at_10: recallAt(order, judgments, 10),
    precision_at_5: precisionAt(order, judgments, 5),
    ndcg_at_5: ndcgAt(order, judgments, 5),
    ndcg_at_10: ndcgAt(order, judgments, 10),
  };
}

export function metricDeltas(baseline, reranked) {
  if (!baseline || !reranked) return null;
  return Object.fromEntries(METRIC_NAMES.map((name) => [name, reranked[name] - baseline[name]]));
}

export function classifyDelta(delta, epsilon = 1e-12) {
  if (delta > epsilon) return 'WIN';
  if (delta < -epsilon) return 'LOSS';
  return 'TIE';
}

export function eligibleCandidates(candidates) {
  return candidates.filter((candidate) => candidate.active !== false && candidate.hard_mismatch !== true);
}

export function assertNoLabelLeakage(value) {
  const forbidden = new Set(['relevance', 'judgments', 'gold_rank', 'expected_product_ids', 'benchmark_reason', 'reranker_opportunity']);
  const visit = (item) => {
    if (!item || typeof item !== 'object') return;
    for (const [key, child] of Object.entries(item)) {
      if (forbidden.has(key) || key === 'embedding' || key === 'vector') throw Object.assign(new Error(`Forbidden provider input field: ${key}`), { code: 'LABEL_LEAKAGE' });
      visit(child);
    }
  };
  visit(value);
}

export function validateRerankerOutput(candidateIds, output) {
  if (!output || !Array.isArray(output.ordered_candidate_ids)) throw Object.assign(new Error('Malformed reranker output'), { code: 'MALFORMED_OUTPUT' });
  const ordered = output.ordered_candidate_ids;
  if (new Set(ordered).size !== ordered.length) throw Object.assign(new Error('Duplicate candidate ID'), { code: 'DUPLICATE_ID' });
  const allowed = new Set(candidateIds);
  if (ordered.some((productId) => !allowed.has(productId))) throw Object.assign(new Error('Unknown candidate ID'), { code: 'UNKNOWN_ID' });
  if (ordered.length !== candidateIds.length) throw Object.assign(new Error('Missing candidate ID'), { code: 'MISSING_ID' });
  return ordered;
}

export async function rerankPrefix({ provider, input, baselineOrder, topN, exactIdentityId = null }) {
  const eligibleIds = new Set(eligibleCandidates(input.candidates).map((candidate) => candidate.product_id));
  const safeBaselineOrder = baselineOrder.filter((productId) => eligibleIds.has(productId));
  const prefix = safeBaselineOrder.slice(0, topN);
  const suffix = safeBaselineOrder.slice(prefix.length);
  try {
    assertNoLabelLeakage(input);
    const startedAt = performance.now();
    const output = await provider.rerank({ ...input, candidates: input.candidates.filter((candidate) => prefix.includes(candidate.product_id)) });
    const elapsedMs = performance.now() - startedAt;
    const ordered = validateRerankerOutput(prefix, output);
    const rawOrder = [...ordered, ...suffix];
    const exactIdentityRegression = Boolean(exactIdentityId && prefix.includes(exactIdentityId) && ordered[0] !== exactIdentityId);
    const protectedPrefix = exactIdentityRegression ? [exactIdentityId, ...ordered.filter((productId) => productId !== exactIdentityId)] : ordered;
    return {
      order: [...protectedPrefix, ...suffix], raw_order: rawOrder,
      status: exactIdentityRegression ? 'success_protected' : 'success',
      latency_ms: output.timing_metadata?.inference_ms ?? elapsedMs,
      total_latency_ms: elapsedMs, scores: output.scores ?? null,
      resource_usage: output.resource_usage ?? null,
      raw_exact_identity_regression: exactIdentityRegression, failure_code: null,
    };
  } catch (error) {
    return { order: safeBaselineOrder, raw_order: safeBaselineOrder, status: 'fallback', latency_ms: null, total_latency_ms: null, scores: null, resource_usage: null, raw_exact_identity_regression: false, failure_code: error?.code ?? 'PROVIDER_FAILURE' };
  }
}

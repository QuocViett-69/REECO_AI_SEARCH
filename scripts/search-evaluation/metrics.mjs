function assertK(k) {
  if (!Number.isSafeInteger(k) || k <= 0) throw new TypeError('k must be a positive integer');
}

export function dedupeRanking(productIds) {
  return [...new Set(productIds)];
}

export function positiveJudgments(judgments) {
  return new Map(
    judgments
      .filter((judgment) => judgment.relevance > 0)
      .map((judgment) => [judgment.product_id, judgment.relevance]),
  );
}

export function reciprocalRankAt(productIds, judgments, k) {
  assertK(k);
  const relevant = positiveJudgments(judgments);
  if (relevant.size === 0) return null;
  const ranking = dedupeRanking(productIds).slice(0, k);
  const index = ranking.findIndex((productId) => relevant.has(productId));
  return index === -1 ? 0 : 1 / (index + 1);
}

export function recallAt(productIds, judgments, k) {
  assertK(k);
  const relevant = positiveJudgments(judgments);
  if (relevant.size === 0) return null;
  const hits = dedupeRanking(productIds)
    .slice(0, k)
    .filter((productId) => relevant.has(productId)).length;
  return hits / relevant.size;
}

export function precisionAt(productIds, judgments, k) {
  assertK(k);
  const relevant = positiveJudgments(judgments);
  if (relevant.size === 0) return null;
  const ranking = dedupeRanking(productIds).slice(0, k);
  const hits = ranking.filter((productId) => relevant.has(productId)).length;
  return hits / k;
}

export function dcgAt(productIds, judgments, k) {
  assertK(k);
  const grades = new Map(judgments.map((item) => [item.product_id, item.relevance]));
  return dedupeRanking(productIds)
    .slice(0, k)
    .reduce((total, productId, index) => {
      const relevance = grades.get(productId) ?? 0;
      return total + (2 ** relevance - 1) / Math.log2(index + 2);
    }, 0);
}

export function ndcgAt(productIds, judgments, k) {
  assertK(k);
  const relevant = positiveJudgments(judgments);
  if (relevant.size === 0) return null;
  const ideal = [...relevant.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([productId]) => productId);
  const denominator = dcgAt(ideal, judgments, k);
  return denominator === 0 ? null : dcgAt(productIds, judgments, k) / denominator;
}

export function mean(values) {
  const finite = values.filter((value) => typeof value === 'number' && Number.isFinite(value));
  return finite.length === 0 ? null : finite.reduce((sum, value) => sum + value, 0) / finite.length;
}

export function percentile(values, percentileValue) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentileValue / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, index))];
}

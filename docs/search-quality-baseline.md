# Search Quality Baseline v1

## Outcome

The Step 9.1 baseline is established against 100 queries and the verified 89-product catalog. The run used the current public endpoint and existing ranking unchanged.

Catalog integrity at run time:

- 89 products, all active, none in review.
- 89 product documents.
- 89 search-index rows.
- 89 non-null embeddings.

## Verified relevance metrics

Only 35 queries with independently verified positive judgments are included in these macro averages. The five verified negative-identity probes have no positive set and are correctly excluded.

| Metric | Baseline |
| --- | ---: |
| MRR@10 | 0.980952 |
| Recall@5 | 0.983810 |
| Recall@10 | 1.000000 |
| Precision@5 | 0.314286 |
| nDCG@5 | 0.974698 |
| nDCG@10 | 0.981380 |
| Exact identity top-1 | 1.000000 (20/20) |

Precision@5 is intentionally calculated with a fixed denominator of five. Many exact-identity queries have only one relevant canonical representative, so high identity quality can coexist with low absolute Precision@5.

## Safety and operations

| Metric | Baseline |
| --- | ---: |
| Protocol top-5 explicit-support rate | 0.920000 (69/75) |
| Numeric hard-mismatch rate | 0.000000 (0/260 returned results checked) |
| Numeric UNKNOWN retained | 117 |
| Zero-result rate | 0.000000 (0/100) |
| Latency p50 | 1762.635 ms |
| Latency p95 | 2786.583 ms |
| Latency max | 4153.863 ms |
| Latency mean | 1813.177 ms |

`UNKNOWN` retention is expected behavior: lack of approved normalized evidence is not treated as incompatibility. The zero hard-mismatch count confirms that products proven outside requested numeric ranges did not leak into public results during this run.

## Observed cases to review

The failure-case report contains 60 observations, not 60 proven defects:

- 2 verified product-type queries missed some relevant products in top 5: `data logger` reached 0.60 Recall@5 and `cellular modem router` reached 0.833333. Both reached full recall by top 10.
- 2 protocol queries had top-5 results without explicit support evidence: `MQTT data logger` and the Vietnamese USB query. These may be UNKNOWN rather than false matches and require review.
- 31 queries with provisional, unverified positive labels had at least one suggested product outside top 10.
- 25 queries had different keyword and semantic top-1 candidates. This is useful fusion evidence, not automatically an error.

There were no exact top-1 failures, verified misses at top 10, numeric hard-mismatch leaks, or zero-result cases.

## Interpretation

Version 1 provides a sound “before” measurement for future experiments. Exact identity and hard numeric safety are strong. The clearest review targets are product-type breadth at top 5, protocol evidence coverage, and the 60-query human-label queue. No conclusion should be drawn yet about semantic or mixed-query relevance from provisional labels alone.

## Frozen configuration

- Public endpoint: `POST /api/v1/search`
- Request and source retrieval limit: 20
- Fusion: current reciprocal-rank fusion, `k=60`
- Embedding provider/model/dimensions/version: recorded verbatim in `data/reports/search-baseline-v1.json`
- Candidate pool: union of public, keyword, semantic, deterministic exact, and structured technical candidates

Latency comparisons are valid only against runs with equivalent environment and embedding service conditions.

## Next step boundary

Complete the manual relevance labels in `data/evaluation/search-benchmark-review.csv`, reconcile them into a new immutable benchmark version, and only then use the expanded verified set for ranking experiments. This baseline does not add a reranker, explanation layer, conversational search, or any ranking change.

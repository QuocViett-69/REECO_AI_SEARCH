# Offline Reranker Evaluation v1

## Decision

RERANKER OFFLINE EXPERIMENT = INCOMPLETE

RERANKER QUALITY RESULT = INCONCLUSIVE

RERANKER RUNTIME INTEGRATION RECOMMENDED = INCONCLUSIVE

No suitable local reranker was installed. Ollama exposes only `qwen3-embedding:4b`; the existing Qwen model is embedding-only. The harness therefore exercised validated fallback behavior without claiming a reranker quality result.

## Required model

Use a local multilingual cross-encoder that supports English and Vietnamese, deterministic query-document scoring, and Top-20 inference. The recommended first experiment is `BAAI/bge-reranker-v2-m3`. No model was downloaded.

## Frozen evaluation

- Benchmark: search-benchmark-v1.1; 100 queries, 93 metric-eligible
- Candidate sizes configured: 5, 10, 20; primary Top-20
- Rerankable: 33 queries / 158 product-query cases
- Retrieval issues kept separate: 25 queries / 336 cases
- Opportunity outcomes: 0 win / 33 tie / 0 loss (all ties are fallback, not evidence of neutrality)

## Metrics

| Metric | Baseline | Fallback output | Delta |
| --- | ---: | ---: | ---: |
| mrr_at_10 | 0.992832 | 0.992832 | 0.000000 |
| recall_at_5 | 0.582540 | 0.582540 | 0.000000 |
| recall_at_10 | 0.682856 | 0.682856 | 0.000000 |
| precision_at_5 | 0.690323 | 0.690323 | 0.000000 |
| ndcg_at_5 | 0.941883 | 0.941883 | 0.000000 |
| ndcg_at_10 | 0.929796 | 0.929796 | 0.000000 |

Exact identity regressions: 0. Protocol regressions: 0. Numeric hard-mismatch violations: 0. These values reflect unchanged baseline fallback, not model inference.

## Latency and cost

Baseline search latency is p50 1762.635 ms / p95 2786.583 ms. Reranker latency, total latency, tokens, memory, model size, cold start, and repeated-run stability remain unmeasured because no reranker was installed.

## Safety boundary

PRODUCTION SEARCH CHANGED = NO

HOSTED DATABASE MUTATION = NO

BENCHMARK v1.1 CHANGED = NO

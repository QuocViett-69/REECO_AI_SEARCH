# Search Quality Baseline v1.1

## Status

100/100 queries are verified: 40 deterministic and 60 reviewed from model, taxonomy, capability, protocol, application, technical, and specification evidence. Ranking and score fields were excluded from labeling.

## Metrics

| Metric | v1 provisional | v1.1 reviewed | Delta |
| --- | ---: | ---: | ---: |
| mrr_at_10 | 0.980952 | 0.992832 | 0.011880 |
| recall_at_5 | 0.983810 | 0.582540 | -0.401270 |
| recall_at_10 | 1.000000 | 0.682856 | -0.317144 |
| precision_at_5 | 0.314286 | 0.690323 | 0.376037 |
| ndcg_at_5 | 0.974698 | 0.941883 | -0.032815 |
| ndcg_at_10 | 0.981380 | 0.929796 | -0.051584 |

Metric-eligible queries: 93. Intentional negative queries: 7. Deltas reflect improved ground truth, not a search algorithm change.

## Reranker readiness

- Queries with Top-5 ranking errors: 39
- Rerankable queries: 33
- Retrieval-miss queries: 25
- Already meets relevance cutoff: 54
- Reranker-addressable share: 31.98%

Rerankable means a verified relevant product exists in keyword/semantic Top-20 but is outside final Top-5. Retrieval misses require retrieval changes, not reranking.

## Safety and operations

Exact identity Top-1 remains 1.000000. Protocol evidence, numeric hard-mismatch, zero-result, and latency values are unchanged because the search runtime was not modified or rerun.

## Slices

Category and language metrics, each with query counts, are stored in `data/reports/search-baseline-v1.1.json`. Sample sizes are descriptive and do not establish statistical significance.

## Limitations

Broad queries intentionally use low relevance grades. Evidence absence is treated conservatively. The evidence review is reproducible and human-directed, but it is not an independent multi-reviewer agreement study. No reranker was implemented.

# BGE Offline Reranker Evaluation v1

## Result

Model: `BAAI/bge-reranker-v2-m3` at `953dc6f6f85a1b2dbfca4c34a2796e7dde08d41e`, device cuda, batch 4, max length 512. All 93/93 eligible queries were model-scored.

| Top-N | nDCG@5 | Delta | Precision@5 | nDCG@10 | WIN/TIE/LOSS | Protocol regressions | p50 ms | p95 ms |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 5 | 0.948655 | 0.006772 | 0.690323 | 0.936394 | 6/26/1 | 0 | 31.946 | 45.127 |
| 10 | 0.939395 | -0.002488 | 0.703226 | 0.928042 | 8/22/3 | 3 | 59.782 | 73.167 |
| 20 | 0.915921 | -0.025962 | 0.675269 | 0.917586 | 8/17/8 | 3 | 109.324 | 132.529 |

Baseline nDCG@5 is 0.941883. Top-20 opportunity outcomes: 8 WIN / 17 TIE / 8 LOSS. Raw exact-identity regressions: 0; protected: 0. Top-20 protocol regressions: 3. Numeric hard mismatch violations: 0.

RERANKER QUALITY RESULT = IMPROVED

BEST RERANK CANDIDATE SIZE = 5

RUNTIME INTEGRATION RECOMMENDED = YES

PRODUCTION SEARCH CHANGED = NO

HOSTED DATABASE MUTATION = NO

BENCHMARK v1.1 CHANGED = NO

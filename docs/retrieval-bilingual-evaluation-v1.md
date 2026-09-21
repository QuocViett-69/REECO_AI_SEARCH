# Retrieval and bilingual evaluation v1

## Decision

This is an offline-only experiment. Production retrieval, the reranker runtime, Supabase, and benchmark v1.1 were not changed.

Strategy A keeps the original semantic query and expands only keyword retrieval with deterministic ontology/data-supported OR alternatives. Strategy B was tested because Strategy A did not meet the predeclared 50% recovery threshold.

| Strategy | Candidate Recall@20 | Recovered queries (any/full) | Recovered cases | Precision@5 | nDCG@5 | nDCG@10 | p50 ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| baseline | 0.757697 | 0/0 | 0 | 0.690323 | 0.941883 | 0.929796 | 272.590 |
| strategy_a | 0.757697 | 0/0 | 0 | 0.690323 | 0.937377 | 0.927074 | 407.090 |
| strategy_b | 0.759105 | 2/0 | 2 | 0.690323 | 0.936776 | 0.926525 | 416.548 |

Bilingual pairs: 16; baseline Top-5/Top-10 Jaccard overlap 0.661706/0.684399. Best experimental strategy: **strategy_b**. Release decision: **baseline**. Combined with protected Top-5 reranker: nDCG@5 0.948655, nDCG@10 0.936394.

The 25-query/336-case frozen retrieval problem is dominated by broad-query competition and source misses. No experimental strategy is recommended for runtime integration unless it clears every predeclared recovery, quality, and safety gate. The experiment does not tune RRF, change embeddings, regenerate product documents, or add an LLM.

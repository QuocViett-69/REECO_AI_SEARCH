# Protected Top-5 reranker runtime

## Runtime flow

```text
Query
  -> Keyword + Semantic
  -> RRF
  -> Technical Parser / Matching
  -> Deterministic filtering & ranking
  -> Top 5 only
  -> BAAI/bge-reranker-v2-m3
  -> Protection layer
       exact identity stays #1
       hard mismatch cannot be restored
       only active/current candidate IDs are accepted
  -> Top 5 reordered
  -> Positions 6+ preserve baseline order
  -> SearchResponse
```

The FastAPI service is in `services/reranker`. It loads and warms the model once
during startup, uses CUDA when available and CPU otherwise, and exposes only
`GET /health` and `POST /rerank`. Requests are limited to five unique candidates.
The model and revision are fixed to:

- `BAAI/bge-reranker-v2-m3`
- `953dc6f6f85a1b2dbfca4c34a2796e7dde08d41e`

Model weights stay in the standard Hugging Face cache or a local path supplied
as `RERANKER_MODEL_PATH`; they are not stored in this repository.

## API configuration

```dotenv
RERANKER_ENABLED=false
RERANKER_BASE_URL=http://127.0.0.1:8011
RERANKER_TIMEOUT_MS=350
RERANKER_TOP_N=5
RERANKER_MODEL=BAAI/bge-reranker-v2-m3
RERANKER_MODEL_REVISION=953dc6f6f85a1b2dbfca4c34a2796e7dde08d41e
```

`RERANKER_ENABLED=false` is the release default. Values above 5 for
`RERANKER_TOP_N`, or a different model/revision, fail configuration validation.
The 350 ms HTTP timeout is conservative relative to the offline warm p95 of
45 ms without allowing a multi-second wait. Evidence loading occurs before the
HTTP timeout and is included in the Nest stage telemetry.

Start the service using the command in `services/reranker/README.md`, then set
`RERANKER_ENABLED=true` for the API. If the service is unavailable, times out,
or returns a malformed/non-permutation response, the request keeps its exact
pre-reranker order and succeeds normally.

## Contract and evidence

The runtime serializer is byte-tested against the Step 9.2A
`compact-bilingual-evidence-v1` serializer. It includes model, bilingual product
name, taxonomy, measurements, capabilities, applications, protocols, relevant
normalized temperature specifications, and matched structured features. It
never includes judgments, expected IDs, retrieval scores, ranks, or embeddings.

Raw BGE logits remain internal. Public `scores.rerank` stays `null`, and public
mode remains `keyword`, `semantic`, or `hybrid`.

## Verified result

The real CUDA service and Nest endpoint evaluated all 100 frozen benchmark v1.1
queries. Metrics were MRR@10 `1.000000`, Precision@5 `0.690323`, nDCG@5
`0.948655`, and nDCG@10 `0.936394`; opportunity outcomes were 6 WIN / 26 TIE /
1 LOSS. Exact identity regressions, numeric hard-mismatch leaks, protocol
regressions, and tail-order regressions were all zero.

Nest reranker-stage latency (evidence load, serialization, HTTP, and inference)
was p50 `378.364 ms`, p95 `648.278 ms`; end-to-end was p50 `1655.448 ms`, p95
`2349.609 ms`. This stage latency is intentionally not compared as if it were
the offline inference-only 32/45 ms measurement. q068 remains an observed loss
without any query or product special-case.

Feature-off reproduced 100/100 frozen orders. With the reranker process stopped
while Nest remained online, search returned HTTP 200 and the baseline Top-5.
The complete evidence is in
`data/reports/reranker-runtime-integration-v1.json`.

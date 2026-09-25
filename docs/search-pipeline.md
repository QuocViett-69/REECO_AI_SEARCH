# Search Pipeline

```text
User Query
→ Keyword + Semantic Retrieval
→ RRF Candidate Union
→ Deterministic Technical Query Parser
→ Batch Structured Evidence Matching
→ Deterministic Technical Ranking/Filtering
→ Optional Protected Top-5 BGE Reranking
→ Batch Public-Product Hydration
→ SearchResponse
```

Current implementation status:

- Keyword database foundation: implemented.
- Semantic database foundation: implemented in Step 7.2 and deployed to hosted Supabase in Step 7.3B.
- Local Ollama provider, embedding service, and backfill tooling: implemented in Step 7.3A.
- Hosted embeddings: 89/89 searchable active products after the data refresh.
- Service-role semantic RPC: runtime-verified in Step 7.3B.
- NestJS semantic retrieval adapter: implemented and runtime-verified in Step 7.4.
- Internal hybrid retrieval with Reciprocal Rank Fusion: implemented and runtime-verified in Step 7.5A.
- Public Search API: hybrid RRF integration implemented in Step 7.5B.
- RRF baseline: `K = 60`, configurable with `SEARCH_RRF_K`; no tuning claim has been made.
- Deterministic technical query parser: implemented internally in Step 7.6A.
- Structured identity/protocol/temperature evidence matcher: implemented internally in Step 7.6A.
- Celsius temperature constraint evaluator: implemented internally in Step 7.6A.
- Public deterministic technical ranking/filter integration: implemented in Step 7.6B.
- Protected Top-5 BGE reranker: implemented behind `RERANKER_ENABLED=false` by default.
- Optional grounded search explanation: bilingual text with catalog evidence, returned when `explain: true` and displayed by the client. Local Ollama can rewrite evidence-backed explanations when `LLM_EXPLANATION_ENABLED=true`; the deterministic text remains the fallback.
- Conversational refinements: the client sends the first five result IDs plus the first and previous resolved queries. Clear follow-ups are scoped to those products, and requested technical constraints require confirmed evidence. Technical follow-ups retrieve from the starting query so supported products are not lost when the new terms change retrieval ranking. The resolved query is visible; independent searches reset the browser-held context. Negative conditions are not supported as follow-ups.

The Step 7.3A contract is Ollama `qwen3-embedding:4b`, 1536 dimensions, version
`ollama-qwen3-embedding-4b-1536-v1`, and a default endpoint of `http://127.0.0.1:11434`. Only
`product_search_index.search_text` is embedded. Requests use configurable batches (default 8) and a
180-second default timeout so a local cold model load is not mistaken for a quick provider failure.

Hosted migrations `20260916074530` and `20260916080205` are deployed. The hosted column is
`extensions.vector(1536)`, and all 89 searchable active rows use model `qwen3-embedding:4b`, dimension
1536, and version `ollama-qwen3-embedding-4b-1536-v1`. The database RPC has been smoke-tested through
the service-role context. `SemanticSearchService` provides the internal query-to-embedding-to-RPC
adapter with validated candidates and safe errors. `SearchService` calls `HybridSearchService` once per
public request; the hybrid service calls keyword and semantic retrieval once each, fuses successful
results with rank-only RRF, and owns fallback selection. A zero-row source response is success, so the
public mode remains `hybrid` when both calls complete even if all candidates came from one source.

The public modes are `hybrid`, `keyword`, and `semantic`. They indicate respectively that both paths
succeeded, semantic failed and keyword fallback was used, or keyword failed and semantic fallback was
used. Single-source fallback returns HTTP 200. When both sources fail, the public endpoint returns a
sanitized HTTP 503. Internal strings such as `keyword_fallback` and `semantic_fallback` are not exposed.

The request limit controls final results, while `SEARCH_RETRIEVAL_LIMIT` controls source candidate
depth. `SearchService` retrieves `max(configured depth, request limit)`, clamped to 1–100, parses the
query once against a minimal active identity catalog, batch-evaluates structured evidence, applies the
technical policy, batch-loads active public summaries, safely drops candidates with no active summary,
and applies the final limit after hydration. This is the final active-only defense and avoids N+1
product detail or specification calls.

In hybrid mode the public keyword score is the raw keyword score or zero, the semantic score is cosine
similarity or null, and the hybrid score remains the original RRF retrieval score. Fallback modes leave
the hybrid score null. Technical ordering never rewrites any score, so a technical query's final rows
are not required to be globally descending by `scores.hybrid`. `scores.rerank` remains null.

Step 7.6A adds an internal, deterministic `technical-query-v1` parser and structured evidence matcher.
It recognizes exact active-catalog product/model identity, the reviewed protocol subset `SDI-12`,
`RS-485`, `Modbus`, and `Modbus RTU`, plus conservative Celsius-only operating and measurement
temperature syntax. Broad `Modbus` accepts structured `Modbus` family evidence; `Modbus RTU` requires
exact RTU evidence. Identity normalization is case-insensitive and treats whitespace plus hyphen/
underscore representation as equivalent only when that normalized key identifies exactly one product.
There is no typo correction.

Temperature evaluation uses only reviewed canonical-key allowlists and normalized shared-unit range
values. Operating keys are `operating_temperature_range` and
`operating_temperature_extended_duty_xd`. Measurement keys are
`air_temperature_measurement_range`, `air_temperature_range`, `soil_temperature_range`,
`temperature_measurement_range`, and `temperature_measurement_operating_range`. Storage,
survivability, accuracy, resolution, compensation, response, subsystem-only, and generic temperature
keys are excluded. Results are `MATCH`, `MISMATCH`, or `UNKNOWN`; ambiguous intent, absent evidence,
unsupported value shapes, and incompatible units produce `UNKNOWN`, never a fabricated mismatch.

Step 7.6B integrates that layer after retrieval/RRF and before hydration/limit. The deterministic
lexicographic policy is: exact retrieved identity first; remove only authoritative numeric
`hardMismatch`; rank by satisfied structured constraint count; then confirmed protocol-match count;
then temperature `MATCH` before `UNKNOWN`; then original retrieval rank; finally `product_id`. There
are no additive or multiplicative score weights. Exact products outside the retrieved union are not
injected. Protocol unknowns are retained and protocol mismatches are not hard-filtered. Numeric
`UNKNOWN` is retained; only definitive high-confidence operating/measurement mismatch is removed.

`matched_features` contains only positive structured evidence, using stable labels such as
`identity:model:CS655`, `protocol:SDI-12`, `operating-temperature:-40°C`, and
`measurement-temperature:up-to-70°C`. Unknown, missing, unsupported, semantic-only, and negative
evidence create no feature. The same policy runs in hybrid, keyword-fallback, and semantic-fallback
modes without changing the public mode. The RRF formula and `SEARCH_RRF_K=60` baseline are unchanged.
A deterministic grounded explanation is available on request; an optional local Ollama rewrite is enabled with `LLM_EXPLANATION_ENABLED=true` and `LLM_MODEL`. The optional cross-encoder runtime is documented in
[`reranker-runtime.md`](./reranker-runtime.md); it never changes retrieval mode or public score semantics.

Step 7.7 freezes this behavior for frontend integration; it adds no ranking stage or public search
field. See [`frontend-handoff.md`](./frontend-handoff.md) for client behavior and example fixtures.

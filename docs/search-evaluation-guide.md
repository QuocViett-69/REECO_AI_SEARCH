# Search Evaluation Guide

## Scope

This is the Step 9.1 evaluation layer for the existing REECO public search. It measures the current keyword + semantic + RRF + technical-policy pipeline without changing retrieval, fusion, technical ranking, public response shape, database rows, or embeddings.

The frozen catalog snapshot is 89 products: 89 active, 0 review, 89 product documents, 89 search-index rows, and 89 non-null embeddings. The snapshot was checked against Supabase with read-only SQL before the baseline run.

## Artifacts

- `data/evaluation/search-benchmark-v1.json`: canonical benchmark and judgments.
- `data/evaluation/search-benchmark-review.json`: evidence-rich candidate pools for queries needing a human label.
- `data/evaluation/search-benchmark-review.csv`: flat review queue; fill only `reviewer_relevance` and `reviewer_notes`.
- `data/reports/search-baseline-v1.json`: configuration, per-query output, latency, metrics, and slices.
- `data/reports/search-failure-cases-v1.json`: actionable observations and retrieval disagreements.
- `docs/search-quality-baseline.md`: concise interpretation of the measured baseline.

## Benchmark composition

Version 1 contains 100 queries:

| Category | Count | Purpose |
| --- | ---: | --- |
| Exact identity | 20 | Product IDs, canonical models, and reviewed variant aliases |
| Product type | 15 | Exact curated `device_type_key` coverage |
| Protocol | 15 | Explicit protocol-support retrieval |
| Technical numeric | 15 | Operating/measurement Celsius constraints |
| Semantic | 15 | Natural-language measurement intent |
| Mixed constraint | 10 | Functional intent plus protocol |
| Negative or ambiguous | 10 | Unknown, removed, near-match, broad, or unsupported intent |

Languages are recorded per query (`en`, `vi`, or `mixed`). Version 1 has 74 English, 24 Vietnamese, and 2 mixed identity queries.

## Ground-truth policy

Relevance uses four grades: 0 not relevant, 1 marginal, 2 relevant, and 3 highly relevant.

Labels must never be inferred from the current ranking. Version 1 uses only these independent sources:

1. Canonical `product_id`, `model`, and reviewed variant mappings for exact identity.
2. Exhaustive curated taxonomy keys for exact product-type queries.
3. Explicit `supported_protocols` evidence for protocol suggestions.
4. Reviewed normalized specification ranges for numeric suggestions.
5. Curated measurement keys for semantic candidate suggestions.

Only `verified` queries with at least one positive judgment enter aggregate MRR/recall/precision/nDCG. Queries marked `needs_manual_review` can carry evidence-based suggestions, but those suggestions are not treated as verified truth. Unjudged candidates on those queries are not silently converted to relevance 0.

## Human review workflow

1. Open `search-benchmark-review.csv` in a spreadsheet.
2. Filter by `query_id`; read the query, intent/reason, source ranks, and compact evidence.
3. Enter an integer 0–3 in `reviewer_relevance`. Do not use rank as a relevance signal.
4. Explain ambiguous decisions in `reviewer_notes`, especially missing evidence, variant behavior, or protocol/measurement conflicts.
5. Resolve disagreements by returning to the cited canonical document or normalized raw reference.
6. Promote reviewed labels into a new benchmark version; do not rewrite v1 silently.

The JSON review artifact is canonical when CSV cells truncate long evidence.

## Candidate-pool construction

For each query, the review pool is a deterministic union of:

- public top 20 results;
- keyword top 20 candidates;
- semantic top 20 candidates;
- deterministic exact-identity candidates;
- structured technical matches from explicit protocol/range evidence.

Duplicates are collapsed by `product_id`. The first public request is the measured request. Its semantic result is memoized only for the subsequent diagnostic retrieval, preventing a second embedding call from changing evidence or doubling model work.

## Metrics

- `MRR@10`: reciprocal rank of the first relevant result.
- `Recall@5`, `Recall@10`: retrieved verified positives divided by all verified positives.
- `Precision@5`: verified positive hits divided by 5, including short result lists.
- `nDCG@5`, `nDCG@10`: graded gain `2^relevance - 1` with logarithmic discount.
- Exact top-1 accuracy: canonical representative is first for exact IDs/models/variant aliases.
- Protocol top-5 explicit-support rate: proportion of top-5 results with direct support evidence. It is descriptive until human judgments are complete.
- Numeric hard-mismatch rate: returned products proven incompatible by approved normalized range keys. `UNKNOWN` is retained and counted separately; it is not a mismatch.
- Zero-result rate and public endpoint latency p50/p95/max/mean.

Duplicate result IDs are deduplicated before ranking metrics. Queries with no verified positive set return `null` and are excluded from macro averages.

## Commands

```text
npm run search:evaluation:build
npm run search:evaluation:test
npm run search:evaluation:baseline
npm run search:evaluation:validate
```

The baseline command requires the existing API environment and embedding provider. It performs read-only searches and report writes only.

## Regression use

Treat v1 as the “before” side of every later ranking experiment. Run the identical benchmark, compare aggregate and per-slice metrics, and inspect every new failure case. At minimum, do not accept a candidate that reduces exact top-1, introduces a numeric hard mismatch, or hides a meaningful verified recall regression behind a macro average.

Latency and semantic scores can vary with infrastructure/model service conditions. Compare like-for-like environment, model, dimensions, embedding version, retrieval limit, and RRF `k`. A benchmark change requires a new version and changelog entry; never overwrite labels merely to make a new ranker look better.

## Explicit stop point

Step 9.1 ends after baseline artifacts and review material are produced. No reranker, conversational layer, explanation generator, or ranking-weight change belongs in this step.

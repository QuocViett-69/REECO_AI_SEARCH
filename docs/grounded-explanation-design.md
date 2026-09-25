# Grounded explanation design

## Status

The offline benchmark evaluates deterministic templates. The search API also has an optional local Ollama rewrite when `LLM_EXPLANATION_ENABLED=true` and `LLM_MODEL` is configured. Retrieval, ranking, and Supabase data are unchanged.

## Contract

`grounded-evidence-v1` contains only query-relevant product identity, taxonomy, measurements, matched features, requested protocol states, requested numeric constraint states, capabilities, applications, supporting specifications, and a bounded semantic context. It excludes vectors, benchmark labels, reviewer notes, secrets, full database rows, and ranking internals.

The deterministic builder preserves MATCH, UNKNOWN, and MISMATCH. A protocol or numeric MATCH is rejected by schema validation unless supporting structured evidence is present. Semantic context never establishes a technical fact.

## Providers

The offline evaluator uses `ExplanationProvider.generate({ query, product, evidence, language })`. `DeterministicTemplateExplanationProvider` (template-explanation-v1) is its evaluated provider; its `LLMGroundedExplanationProvider` boundary remains unconfigured. The API runtime uses `ExplanationService` and the optional Ollama rewrite described below.

The runtime uses the locally installed `qwen3:4b-instruct-2507-q4_K_M` through Ollama `/api/chat`. It sends one batch for up to three results with specific evidence and retains the original evidence. Exact-model-only and taxonomy-only explanations use templates. Model errors, timeouts, malformed output, new numeric or named terms, and lost uncertainty or negation fall back to templates. These checks reduce unsupported claims; they are not a proof of factual correctness.

## Language and style

English and Vietnamese are selected deterministically from the benchmark language, with a deterministic mixed-query fallback. Model and protocol identifiers remain unchanged. Output is limited to one to three factual sentences and does not expose ranks, RRF, or similarity.

## Evaluation

The frozen real search output supplies 40 query/product pairs: 30 English and 10 Vietnamese. It includes 5 exact identity, 11 protocol, 9 numeric, and 4 UNKNOWN cases. Automatic safety violations: 0. Template p50/p95: 0.0237/0.1069 ms.

## Runtime limits

The LLM runs only when `explain: true` is requested and the feature flag is enabled. At most three results are rewritten in one call with a 20-second timeout by default. There is no persistent cache. The offline benchmark above measures templates, not LLM latency or factual quality; local smoke tests cover actual Ollama responses.

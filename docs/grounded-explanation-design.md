# Grounded explanation design

## Status

STEP 9.4A is an offline foundation. Search ranking, retrieval, reranking, SearchResponse, frontend, and Supabase data remain unchanged.

## Contract

`grounded-evidence-v1` contains only query-relevant product identity, taxonomy, measurements, matched features, requested protocol states, requested numeric constraint states, capabilities, applications, supporting specifications, and a bounded semantic context. It excludes vectors, benchmark labels, reviewer notes, secrets, full database rows, and ranking internals.

The deterministic builder preserves MATCH, UNKNOWN, and MISMATCH. A protocol or numeric MATCH is rejected by schema validation unless supporting structured evidence is present. Semantic context never establishes a technical fact.

## Providers

`ExplanationProvider.generate({ query, product, evidence, language })` is the boundary. `DeterministicTemplateExplanationProvider` (template-explanation-v1) is the evaluated fallback and safety reference. `LLMGroundedExplanationProvider` exists as an unconfigured boundary; it fails closed without an approved generator.

No suitable local generative model is installed. `qwen3-embedding:4b` is embedding-only, and the BGE reranker is not a generator. No model was downloaded.

## Language and style

English and Vietnamese are selected deterministically from the benchmark language, with a deterministic mixed-query fallback. Model and protocol identifiers remain unchanged. Output is limited to one to three factual sentences and does not expose ranks, RRF, or similarity.

## Evaluation

The frozen real search output supplies 40 query/product pairs: 30 English and 10 Vietnamese. It includes 5 exact identity, 11 protocol, 9 numeric, and 4 UNKNOWN cases. Automatic safety violations: 0. Template p50/p95: 0.0237/0.1069 ms.

## Future runtime design (not implemented)

Generate explanations only when requested. For Top-N, prefer one bounded batch or controlled concurrency after measuring a future approved generator; do not assume five sequential generations are acceptable. The persistent cache is deliberately deferred. A future cache key must include normalized query/version, product ID, evidence content/version, model revision, and prompt/template version—never product ID alone.

Suggested local models for a later approved experiment: `qwen3:4b` (official Ollama artifact 2.5 GB; estimated practical budget 6–8 GB RAM/VRAM) or `qwen3:8b` (official artifact 5.2 GB; estimated practical budget 10–12 GB RAM/VRAM). `gemma3:4b` is a 3.3 GB multilingual alternative. These memory budgets are planning estimates, not vendor guarantees. Model choice and download require explicit approval. Sources: https://ollama.com/library/qwen3/tags and https://ollama.com/library/gemma3.

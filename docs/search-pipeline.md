# Search Pipeline

```text
User Query
→ Keyword Search
→ Semantic Search
→ Hybrid Retrieval
→ AI Reranking
→ Search Explanation
```

Current implementation status:

- Keyword database foundation: implemented.
- Semantic database foundation: implemented in Step 7.2.
- Local Ollama provider, embedding service, and backfill tooling: implemented in Step 7.3A.
- Semantic runtime service: not implemented.
- Hybrid retrieval: not implemented.

The Step 7.3A contract is Ollama `qwen3-embedding:4b`, 1536 dimensions, version
`ollama-qwen3-embedding-4b-1536-v1`, and a default endpoint of `http://127.0.0.1:11434`. Only
`product_search_index.search_text` is embedded. Requests use configurable batches (default 8) and a
180-second default timeout so a local cold model load is not mistaken for a quick provider failure.

The committed semantic migration has not been deployed to hosted Supabase and no hosted product
embeddings have been generated. `POST /search` is still keyword-only: Step 7.3A does not connect the
provider to semantic retrieval, scoring, or hybrid search.

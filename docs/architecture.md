# Architecture

React (client :5173, admin :5174) → NestJS API (:3000) → Supabase PostgreSQL + pgvector / AI providers

The frontends reach product, order, and AI services only through the NestJS API. The one direct
browser call is the Supabase Auth password sign-in, which returns the access token the API then
verifies. AI providers are local and server-only: Ollama for embeddings and optional explanation wording,
and the optional BGE reranker service (`services/reranker`). VNPay sandbox handles online payment.

See [`search-pipeline.md`](./search-pipeline.md), [`database.md`](./database.md), and
[`api-contract.md`](./api-contract.md).

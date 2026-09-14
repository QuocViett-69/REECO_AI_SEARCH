# REECO AI Search — Codex Scaffold Specification

## 1. Mục tiêu

Hãy khởi tạo **nền cấu trúc thư mục và project skeleton** cho dự án **REECO AI Search**.

Stack đã chốt:

- Frontend: **React + Vite + TypeScript**
- Backend: **Node.js + NestJS + TypeScript**
- Database: **Supabase PostgreSQL**
- Vector Search: **pgvector**
- Package management: **npm workspaces**
- Repository style: **monorepo**

Phạm vi ở bước này chỉ là:

1. Tạo cấu trúc repository.
2. Khởi tạo React app.
3. Khởi tạo NestJS app.
4. Tạo các module/folder nền cho nghiệp vụ sau này.
5. Tạo package `shared` dùng chung type/schema giữa FE và BE.
6. Tạo folder Supabase, scripts, data, docs.
7. Tạo file `.env.example`, `.gitignore`, README cơ bản.
8. Đảm bảo project có thể cài dependency và chạy được FE/BE.

> **Không triển khai business logic AI Search ở bước này.**
>
> Chưa cần tạo embedding, hybrid search, reranking, import thật, database schema thật hoặc gọi AI API.

---

# 2. Bối cảnh dự án

REECO AI Search là module tìm kiếm sản phẩm Campbell Scientific.

Luồng dự kiến về sau:

```text
User Query
    ↓
Keyword Search + Semantic Search
    ↓
Hybrid Retrieval
    ↓
AI Reranking
    ↓
Top Results
    ↓
Search Explanation
```

MVP sau này sẽ bao gồm:

- Product management
- Import dữ liệu sản phẩm
- Product specifications
- Embedding generation
- Keyword Search
- Semantic Search
- Hybrid Search
- AI Reranking
- Search Explanation

Giai đoạn đầu thử nghiệm khoảng 50 sản phẩm, sau đó mở rộng toàn bộ dataset Campbell Scientific.

---

# 3. Cấu trúc repository bắt buộc

Tạo repository theo cấu trúc sau:

```text
reeco-ai-search/
│
├── apps/
│   │
│   ├── web/
│   │   ├── public/
│   │   │
│   │   ├── src/
│   │   │   ├── api/
│   │   │   │   └── client.ts
│   │   │   │
│   │   │   ├── components/
│   │   │   │   └── common/
│   │   │   │
│   │   │   ├── features/
│   │   │   │   ├── search/
│   │   │   │   │   ├── api/
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── hooks/
│   │   │   │   │   └── types/
│   │   │   │   │
│   │   │   │   ├── products/
│   │   │   │   │   ├── api/
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── hooks/
│   │   │   │   │   └── types/
│   │   │   │   │
│   │   │   │   └── imports/
│   │   │   │       ├── api/
│   │   │   │       ├── components/
│   │   │   │       ├── hooks/
│   │   │   │       └── types/
│   │   │   │
│   │   │   ├── hooks/
│   │   │   ├── layouts/
│   │   │   ├── pages/
│   │   │   │   ├── SearchPage.tsx
│   │   │   │   ├── ProductPage.tsx
│   │   │   │   ├── AdminProductsPage.tsx
│   │   │   │   └── ImportPage.tsx
│   │   │   │
│   │   │   ├── routes/
│   │   │   │   └── index.tsx
│   │   │   │
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   │
│   │   ├── .env.example
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   └── api/
│       ├── src/
│       │   ├── ai/
│       │   │   ├── embedding.provider.ts
│       │   │   ├── reranker.provider.ts
│       │   │   └── llm.provider.ts
│       │   │
│       │   ├── common/
│       │   │   ├── dto/
│       │   │   ├── exceptions/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   └── utils/
│       │   │
│       │   ├── config/
│       │   │   └── configuration.ts
│       │   │
│       │   ├── database/
│       │   │   └── supabase/
│       │   │       ├── supabase.module.ts
│       │   │       └── supabase.service.ts
│       │   │
│       │   ├── modules/
│       │   │   ├── health/
│       │   │   │   ├── health.controller.ts
│       │   │   │   └── health.module.ts
│       │   │   │
│       │   │   ├── products/
│       │   │   │   ├── dto/
│       │   │   │   ├── products.controller.ts
│       │   │   │   ├── products.module.ts
│       │   │   │   ├── products.repository.ts
│       │   │   │   └── products.service.ts
│       │   │   │
│       │   │   ├── imports/
│       │   │   │   ├── dto/
│       │   │   │   ├── imports.controller.ts
│       │   │   │   ├── imports.module.ts
│       │   │   │   ├── imports.service.ts
│       │   │   │   ├── import.parser.ts
│       │   │   │   └── import.validator.ts
│       │   │   │
│       │   │   ├── search/
│       │   │   │   ├── dto/
│       │   │   │   ├── search.controller.ts
│       │   │   │   ├── search.module.ts
│       │   │   │   ├── search.service.ts
│       │   │   │   ├── keyword-search.service.ts
│       │   │   │   ├── semantic-search.service.ts
│       │   │   │   ├── hybrid-search.service.ts
│       │   │   │   └── search-score.service.ts
│       │   │   │
│       │   │   ├── embeddings/
│       │   │   │   ├── embeddings.module.ts
│       │   │   │   └── embeddings.service.ts
│       │   │   │
│       │   │   ├── reranker/
│       │   │   │   ├── prompts/
│       │   │   │   ├── reranker.module.ts
│       │   │   │   ├── reranker.provider.ts
│       │   │   │   └── reranker.service.ts
│       │   │   │
│       │   │   └── explanation/
│       │   │       ├── prompts/
│       │   │       ├── explanation.module.ts
│       │   │       └── explanation.service.ts
│       │   │
│       │   ├── app.module.ts
│       │   └── main.ts
│       │
│       ├── test/
│       ├── .env.example
│       ├── nest-cli.json
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── constants/
│       │   │   └── index.ts
│       │   ├── schemas/
│       │   │   └── index.ts
│       │   ├── types/
│       │   │   ├── api.ts
│       │   │   ├── product.ts
│       │   │   └── search.ts
│       │   └── index.ts
│       │
│       ├── package.json
│       └── tsconfig.json
│
├── supabase/
│   ├── migrations/
│   │   └── .gitkeep
│   ├── seed/
│   │   └── .gitkeep
│   └── functions/
│       └── .gitkeep
│
├── scripts/
│   ├── import-products/
│   │   └── .gitkeep
│   ├── create-embeddings/
│   │   └── .gitkeep
│   └── seed-data/
│       └── .gitkeep
│
├── data/
│   ├── raw/
│   │   └── .gitkeep
│   ├── processed/
│   │   └── .gitkeep
│   └── samples/
│       └── .gitkeep
│
├── docs/
│   ├── architecture.md
│   ├── database.md
│   ├── search-pipeline.md
│   └── api.md
│
├── .editorconfig
├── .gitignore
├── .prettierignore
├── .prettierrc
├── eslint.config.js
├── package.json
├── tsconfig.base.json
└── README.md
```

---

# 4. Root workspace

Sử dụng **npm workspaces**.

Root `package.json` nên có dạng tương tự:

```json
{
  "name": "reeco-ai-search",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev:web": "npm run dev --workspace=@reeco/web",
    "dev:api": "npm run start:dev --workspace=@reeco/api",
    "build:web": "npm run build --workspace=@reeco/web",
    "build:api": "npm run build --workspace=@reeco/api",
    "build": "npm run build:web && npm run build:api",
    "lint": "npm run lint --workspaces --if-present",
    "format": "prettier --write ."
  }
}
```

Tên workspace:

```text
@reeco/web
@reeco/api
@reeco/shared
```

---

# 5. Frontend requirements

## 5.1 React app

Khởi tạo bằng:

```text
React + Vite + TypeScript
```

Không dùng Next.js.

Cài tối thiểu:

```text
react
react-dom
react-router-dom
@tanstack/react-query
zod
```

Có thể cài Tailwind CSS nếu cấu hình không làm project phức tạp quá mức.

---

## 5.2 Frontend routing

Tạo routing placeholder:

```text
/                    → SearchPage
/products/:id        → ProductPage
/admin/products      → AdminProductsPage
/admin/import        → ImportPage
```

Mỗi page chỉ cần render tiêu đề placeholder.

Ví dụ:

```tsx
export function SearchPage() {
  return <div>REECO AI Search</div>;
}
```

Chưa cần thiết kế UI chi tiết.

---

## 5.3 API client

Tạo:

```text
apps/web/src/api/client.ts
```

Base URL đọc từ:

```text
VITE_API_URL
```

Không hard-code localhost trực tiếp trong source code.

Frontend `.env.example`:

```env
VITE_API_URL=http://localhost:3000/api/v1

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

> Không được đưa `SUPABASE_SERVICE_ROLE_KEY` hoặc AI API key vào frontend.

---

# 6. Backend requirements

## 6.1 NestJS

Khởi tạo backend bằng NestJS + TypeScript.

Global API prefix:

```text
/api/v1
```

Port lấy từ environment variable:

```text
PORT
```

Default local port:

```text
3000
```

---

## 6.2 Health check

Chỉ endpoint này cần hoạt động thật ở bước scaffold:

```http
GET /api/v1/health
```

Response:

```json
{
  "status": "ok"
}
```

Dùng endpoint này để xác nhận backend đã chạy đúng.

---

## 6.3 Các business module

Tạo module skeleton cho:

```text
products
imports
search
embeddings
reranker
explanation
```

Ở bước này:

- Không query database thật.
- Không gọi AI API thật.
- Không implement search thật.
- Không implement import thật.

Method có thể để placeholder hoặc throw `NotImplementedException` nếu cần.

Không tạo mock business data không cần thiết.

---

# 7. AI provider abstraction

Tạo các file:

```text
apps/api/src/ai/embedding.provider.ts
apps/api/src/ai/reranker.provider.ts
apps/api/src/ai/llm.provider.ts
```

Chỉ tạo interface / abstract contract cơ bản.

Ví dụ ý tưởng:

```ts
export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}
```

```ts
export interface RerankerProvider {
  rerank(query: string, candidates: unknown[]): Promise<unknown[]>;
}
```

```ts
export interface LlmProvider {
  generate(prompt: string): Promise<string>;
}
```

Không kết nối OpenAI, Cohere hoặc provider cụ thể ở bước này.

Mục tiêu là để business module sau này không phụ thuộc trực tiếp vào vendor AI.

---

# 8. Supabase abstraction

Tạo:

```text
apps/api/src/database/supabase/supabase.module.ts
apps/api/src/database/supabase/supabase.service.ts
```

Có thể cài:

```text
@supabase/supabase-js
```

Nhưng chưa cần query database.

Service chỉ cần đọc config:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Nếu environment variables chưa được cấu hình thì app local vẫn nên có thể khởi động để chạy health check.

Không commit secret.

---

# 9. Backend environment variables

Tạo:

```text
apps/api/.env.example
```

Nội dung:

```env
NODE_ENV=development
PORT=3000

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

AI_EMBEDDING_API_KEY=
AI_RERANK_API_KEY=
AI_LLM_API_KEY=

EMBEDDING_MODEL=
RERANK_MODEL=
LLM_MODEL=

SEARCH_KEYWORD_WEIGHT=0.4
SEARCH_SEMANTIC_WEIGHT=0.6
SEARCH_RETRIEVAL_LIMIT=20
SEARCH_RESULT_LIMIT=5
```

Không tạo `.env` chứa secret thật.

---

# 10. Shared package

Tạo package:

```text
packages/shared
```

Mục đích sau này dùng chung type giữa frontend và backend.

Tạo type placeholder.

## `product.ts`

Ví dụ tối thiểu:

```ts
export interface ProductSummary {
  id: string;
  productId: string;
  model: string;
  productNameEn: string;
  productNameVi?: string | null;
  category?: string | null;
  subcategory?: string | null;
  deviceType?: string | null;
  imageUrl?: string | null;
}
```

## `search.ts`

```ts
export interface SearchRequest {
  query: string;
  limit?: number;
}
```

Không cần thiết kế toàn bộ domain model trong bước scaffold.

---

# 11. Future database direction

Chưa tạo migration thật trong task này.

Tuy nhiên folder database phải được chuẩn bị cho các bảng dự kiến sau:

```text
products
product_specifications
product_search_documents
import_jobs
search_logs
```

Search architecture về sau:

```text
products
   │
   ├── product_specifications
   │
   └── product_search_documents
          ├── search_vector
          └── embedding vector(...)
```

Vector Search sẽ dùng PostgreSQL extension:

```text
pgvector
```

Keyword Search dự kiến dùng:

```text
PostgreSQL Full Text Search
```

Không cài Elasticsearch hoặc vector database khác.

---

# 12. Docs placeholder

Tạo 4 file docs.

## `docs/architecture.md`

Chứa skeleton:

```md
# Architecture

React → NestJS → Supabase / AI Providers
```

## `docs/database.md`

Chứa danh sách bảng dự kiến:

```text
products
product_specifications
product_search_documents
import_jobs
search_logs
```

## `docs/search-pipeline.md`

Chứa:

```text
User Query
→ Keyword Search
→ Semantic Search
→ Hybrid Retrieval
→ AI Reranking
→ Search Explanation
```

## `docs/api.md`

Chứa API dự kiến:

```text
GET    /api/v1/health

GET    /api/v1/products
GET    /api/v1/products/:id
POST   /api/v1/products
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id

POST   /api/v1/imports
GET    /api/v1/imports/:id

POST   /api/v1/search

POST   /api/v1/products/:id/reindex
POST   /api/v1/index/rebuild
```

Chỉ document API, chưa cần implement toàn bộ.

---

# 13. Root README

README phải tối thiểu có:

```text
# REECO AI Search

## Tech Stack
- React
- Vite
- TypeScript
- Node.js
- NestJS
- Supabase PostgreSQL
- pgvector

## Project Structure

## Requirements
- Node.js
- npm

## Install
npm install

## Run frontend
npm run dev:web

## Run backend
npm run dev:api

## Build
npm run build
```

README cần nói rõ:

```text
Frontend default: http://localhost:5173
Backend default: http://localhost:3000
Health endpoint: http://localhost:3000/api/v1/health
```

---

# 14. Git ignore

`.gitignore` phải bỏ qua tối thiểu:

```text
node_modules
.env
.env.local
.env.*.local

dist
build
coverage

.vite

.DS_Store
Thumbs.db

*.log
```

Không ignore `.env.example`.

---

# 15. Code quality

Thiết lập cơ bản:

```text
ESLint
Prettier
EditorConfig
TypeScript strict mode
```

Ưu tiên code rõ ràng hơn cấu hình phức tạp.

Không cần Husky hoặc CI/CD ở bước này.

---

# 16. Naming conventions

Backend:

```text
kebab-case folder/file theo convention NestJS
PascalCase class
camelCase variable/function
```

Frontend component:

```text
PascalCase.tsx
```

Type/interface:

```text
PascalCase
```

Environment variables:

```text
UPPER_SNAKE_CASE
```

---

# 17. Kiến trúc bắt buộc giữ

Frontend không gọi trực tiếp AI provider.

Sai:

```text
React → OpenAI / AI API
```

Đúng:

```text
React
  ↓
NestJS API
  ↓
AI Provider
```

Frontend cũng không được sử dụng:

```text
SUPABASE_SERVICE_ROLE_KEY
AI API KEY
```

Secret chỉ nằm ở backend.

---

# 18. Không làm trong task này

Codex **không triển khai** các phần sau trong lần scaffold này:

```text
Database migrations thật
Product database schema thật
Excel parser thật
JSON import thật
Embedding generation thật
Vector search thật
Keyword search thật
Hybrid scoring thật
AI reranking thật
LLM explanation thật
Authentication flow thật
Supabase RLS policy
Admin UI hoàn chỉnh
Search UI hoàn chỉnh
Docker
CI/CD
Deployment
```

Chỉ dựng nền để các phần này được implement ở task tiếp theo.

---

# 19. Acceptance Criteria

Task chỉ được xem là hoàn thành khi đáp ứng đầy đủ:

### Repository

- [ ] Monorepo được tạo bằng npm workspaces.
- [ ] Có `apps/web`.
- [ ] Có `apps/api`.
- [ ] Có `packages/shared`.
- [ ] Có `supabase`, `scripts`, `data`, `docs`.

### Frontend

- [ ] React + Vite + TypeScript chạy được.
- [ ] Có React Router.
- [ ] Có các page placeholder.
- [ ] `npm run dev:web` chạy thành công.
- [ ] `npm run build:web` thành công.

### Backend

- [ ] NestJS + TypeScript chạy được.
- [ ] Global prefix `/api/v1`.
- [ ] `GET /api/v1/health` trả `{ "status": "ok" }`.
- [ ] Các module nghiệp vụ đã có skeleton.
- [ ] `npm run dev:api` chạy thành công.
- [ ] `npm run build:api` thành công.

### Shared

- [ ] `@reeco/shared` có thể import từ FE và BE.
- [ ] Có type placeholder cho product/search.

### Configuration

- [ ] Có `.env.example` cho web.
- [ ] Có `.env.example` cho api.
- [ ] Không commit secret.
- [ ] ESLint chạy được.
- [ ] Prettier được cấu hình.
- [ ] TypeScript strict mode.

### Documentation

- [ ] Root README có hướng dẫn install/run/build.
- [ ] Có `docs/architecture.md`.
- [ ] Có `docs/database.md`.
- [ ] Có `docs/search-pipeline.md`.
- [ ] Có `docs/api.md`.

---

# 20. Verification commands

Sau khi scaffold xong, Codex phải chạy các lệnh sau và sửa lỗi nếu có:

```bash
npm install
npm run build
npm run lint
```

Sau đó kiểm tra riêng:

```bash
npm run dev:api
```

Endpoint:

```text
GET http://localhost:3000/api/v1/health
```

phải trả:

```json
{
  "status": "ok"
}
```

Và:

```bash
npm run dev:web
```

Frontend phải load được tại:

```text
http://localhost:5173
```

---

# 21. Output cuối cùng Codex cần báo cáo

Sau khi hoàn thành, trả về ngắn gọn:

1. Tree các folder/file chính đã tạo.
2. Dependencies chính đã cài.
3. Các command để chạy FE/BE.
4. Kết quả `build` và `lint`.
5. Những phần cố ý chưa implement theo scope.
6. Nếu có thay đổi nhỏ so với spec này, giải thích lý do.

---

# 22. Nguyên tắc triển khai

Ưu tiên:

```text
Simple
Modular
Type-safe
Easy to extend
Easy for multiple team members to work on
```

Không over-engineer.

Dự án hiện mới ở giai đoạn MVP với dataset nhỏ, vì vậy không thêm:

```text
Microservices
Kafka
Redis
Elasticsearch
Separate Vector Database
Complex event architecture
```

Supabase PostgreSQL + pgvector sẽ là nền database/search chính ở các phase tiếp theo.

---

## Codex instruction ngắn gọn

> Hãy scaffold repository đúng theo tài liệu này. Chỉ dựng nền project/folder/module/configuration để FE và BE chạy được. Không triển khai business logic AI Search ở task hiện tại. Sau khi tạo xong, chạy install/build/lint, kiểm tra health endpoint và báo cáo các file chính đã tạo.

# Frontend–Backend Merge Response

Respondent: Repository owner directive, implemented by Codex
Date: 2026-09-18
Customer branch SHA: `3c4e40c938f4ef7cf47fd2ecc259504b07677bcd`
Admin branch SHA: `aa63ee4620a7add37a8735db2a59fa1294c13a64`
Backend target SHA before integration: `56461b7565306dc5cd18645ff711606cfe6b70d3`

The owner directed Codex to review all frontend branches and merge them into the backend project. This
supersedes the pending teammate-response pause. Because both frontend branches have unrelated
histories, “merge” means controlled feature integration into `apps/web`, not a destructive Git merge
of either standalone root tree.

The remote-tracking SHAs above were updated by `git fetch --all --prune` before the connection stopped
returning output. The fetch process was terminated, both updated deltas were reviewed, and those heads
are the source revisions integrated here.

## Answers

- Q01: **ACCEPT** — integrate both customer and admin branch feature sets from the audited SHAs.
- Q02: **ACCEPT** — selectively port into `apps/web`; preserve `main` as architecture authority.
- Q03: **ACCEPT** — use the proposed public/admin route map and `react-router-dom`.
- Q04: **ACCEPT** — public styling owns the customer shell; admin styling is scoped under the admin
  shell; shared tokens and state components are consolidated.
- Q05: **ACCEPT** — remove fabricated percentages and generated explanations; show positive
  `matched_features`, retrieval mode, and degraded keyword-fallback state without raw-score UX.
- Q06: **ACCEPT** — remove unbacked pricing, quote, accessory, and fabricated-benefit behavior.
- Q07: **ACCEPT** — use server-backed product pagination and filters.
- Q08: **ACCEPT** — persist comparison selections in URL parameters, load the public catalog for
  selection, fetch both details in parallel, and align structured specification keys.
- Q09: **ACCEPT** — admin product list/detail is read-only; no fake edit, delete, or status mutation.
- Q10: **ACCEPT** — replace browser file simulation with authenticated empty `POST /admin/import` and
  distinct expected error states.
- Q11: **ACCEPT** — retain an honest admin overview with navigation and an unavailable analytics state;
  do not show hardcoded live statistics.
- Q12: **ACCEPT** — use English as the primary merged UI language while preserving API-provided
  English/Vietnamese product names.
- Q13: **ACCEPT** — preserve Vite, TypeScript, React 18, workspace tooling, `@reeco/shared`, and the root
  lockfile. No CRA or React 19 dependency transplant was required.
- Q14: **ACCEPT** — run root lint/build/test gates, browser smoke, contract scan, and secret/artifact
  checks before handoff.

## Integrated feature set

- Customer search with hybrid/keyword/semantic mode handling and positive technical evidence.
- Server-paginated product catalog and filters.
- Full product detail using live structured data.
- URL-persistent two-product comparison aligned by canonical specification key.
- Responsive public navigation and layouts.
- Existing Supabase login/session and protected admin routes.
- Live admin catalog overview, authenticated product list/detail, and server-side import trigger/report
  with cache refresh after success.
- Shared typed API client with Zod response validation and normalized-value formatting.

## Explicitly excluded after review

- Both CRA roots, manifests, lockfiles, tracked `.env` files, public boilerplate, and stale CRA tests.
- Static customer/admin mock datasets and the local generated-explanation engine.
- Fabricated match percentages, default protocols, persisted-edit illusions, and browser-file import
  simulation.
- Any backend contract, ranking, database, migration, or Supabase schema change.

## Sign-off

These decisions are the implemented basis for the controlled frontend/backend integration. No remote
push or production deployment is included.

# Frontend–Backend Merge Clarifications

## Purpose and audit boundary

This is the STEP A read-only audit. No frontend branch was checked out, no merge/cherry-pick was run,
and no application code, dependency, database, or migration was changed.

Audited revisions:

- Backend authority: `main` at `184234f948686afda54fde558ed154001f8129b0`.
- Customer UI: `origin/client/customer` at `01bdcadd1d4e73626becd8784db38863a3c0cf47`.
- Admin UI: `origin/client/admin` at `efb8f502dd01194d034fa480ebcd39e59d371f9f`.

Assumption requiring confirmation: both `client/customer` and `client/admin` together constitute the
teammate's frontend delivery. They are separate Create React App projects and each has a history
unrelated to `main` and to the other frontend branch.

The teammate should answer every item under **Questions requiring a response** in:

`docs/integration/frontend-backend-merge-response.md`

Use the requested response format at the end of this document. STEP B must not start until the branch
scope and all blocking choices are answered.

## Executive audit result

The visual work is reusable, but neither frontend branch can be merged as a branch into `main` safely.
There is no merge-base, and each frontend tree is a standalone root-level Create React App project.
A direct merge with unrelated histories would make root manifests, lockfiles, environment files,
README, public assets, and the backend monorepo appear as competing whole-project replacements.

Recommended integration strategy for STEP B/C:

1. Keep `main` as the sole target and architecture authority.
2. Port selected visual components and styles into `apps/web` rather than merging either root tree.
3. Convert selected JavaScript components to TypeScript/TSX and wire them to the existing router,
   `AuthProvider`, `@reeco/shared` schemas, and Vite environment contract.
4. Keep backend, shared package, data, scripts, docs, migrations, root package files, and lockfile from
   `main`.
5. Do not use `git merge --allow-unrelated-histories` for these branches.

## Non-negotiable backend contract corrections

These are compatibility defects, not open product choices:

| Area              | Frontend branch behavior                                                                       | Frozen backend contract / required correction                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Toolchain         | Root Create React App, JavaScript, `react-scripts`, React 19                                   | Preserve `apps/web`: Vite, TypeScript, React 18, workspace scripts and root lockfile.                                                      |
| API environment   | `REACT_APP_API_URL`, default `http://localhost:4000/api/v1`                                    | Use `VITE_API_URL`; backend default is `http://localhost:3000/api/v1`.                                                                     |
| Local env         | Both branches track `.env`                                                                     | Do not transplant committed `.env`; retain only `apps/web/.env.example`. No secret patterns were found in the audited frontend commits.    |
| Search score      | Creates a synthetic `65–98%` match from keyword score and a fallback `0.8`                     | Do not fabricate or display a percentage. Score fields use different scales and are not a user-facing percentage.                          |
| Explanation       | Generates local “Why this matches” copy                                                        | Backend has no generated explanation. Render positive `matched_features` as evidence, or omit the section when empty.                      |
| Product protocol  | Defaults every product to `SDI-12`                                                             | Never invent protocol data. Search summaries do not contain protocols; detail returns protocol strings.                                    |
| Search response   | Drops `mode` and `matched_features`; collapses API failure and empty success into `null`/empty | Preserve `mode`, `matched_features`, `scores`, and distinguish `200 []`, `400`, and `503`.                                                 |
| Detail protocols  | Treats `supported_protocols` entries as `{ key }` objects                                      | They are strings such as `"SDI-12"`.                                                                                                       |
| Detail specs      | Reads range as `min`/`max` and expects type `quantity`                                         | Shared normalized values use `min_value`/`max_value` for shared-unit ranges and type `number` for scalar values. Use shared schemas/types. |
| Compare           | Reads bundled `masterProducts` mock data                                                       | Fetch both `/products/:id` details in parallel and align the union of `canonical_key`; missing means unavailable, not zero/false.          |
| Admin list/detail | Calls public `/products` routes without a token                                                | Call `/admin/products` and `/admin/products/:id` with the current Supabase access token.                                                   |
| Admin mutations   | Locally simulates edit and active/draft toggles                                                | Backend exposes no product mutation endpoint. Do not present local-only state as a persisted success.                                      |
| Admin import      | Simulates browser JSON upload and a one-second import                                          | `POST /admin/import` has no upload body; it triggers the server-side import and returns `201`, `409`, `401`, or `503`.                     |
| Tests             | Both branches retain the default “learn react” test although their apps contain no such text   | Replace with integration-relevant tests; do not transplant CRA test boilerplate.                                                           |

The backend endpoint surface remains:

```text
GET  /api/v1/health
GET  /api/v1/products
GET  /api/v1/products/:productId
POST /api/v1/search
GET  /api/v1/admin/products             Bearer token required
GET  /api/v1/admin/products/:productId  Bearer token required
POST /api/v1/admin/import               Bearer token required
```

There is no compare, quote/cart, product edit, status toggle, file-upload import, or delete endpoint.

## Files and concepts suitable for selective porting

Customer visual candidates:

- Search hero/results layout.
- Product catalog/card layout.
- Product detail layout.
- Compare layout and selector interaction, after replacing bundled product data with API data.
- Navbar, background effects, toast presentation, and relevant styles.

Admin visual candidates:

- Sidebar and admin page shell.
- Product table and product detail presentation in read-only form.
- Import status/confirmation presentation, after replacing file upload simulation with the real trigger.
- Toast presentation and relevant admin styles.

Do not transplant as authorities:

- Either frontend root `package.json`, `package-lock.json`, `.env`, `.env.example`, README, CRA public
  boilerplate, `src/index.js`, `reportWebVitals`, or `setupTests`.
- `src/data/masterProducts.js`, `src/data/products.js`, `src/data/searchEngine.js`, or
  `src/data/adminData.js` as production data sources.
- Either `src/services/api.js`; it contains contract mismatches listed above.
- The local page-state router in either `App.js`; retain `react-router-dom` in `main`.

`lucide-react` is the only obvious visual dependency that may need to be added to `apps/web`. This must
be decided in STEP B and pinned through the root workspace lockfile.

## Security and authentication observations

The backend validates an admin Bearer token through Supabase Auth. The existing `main` frontend already
has Supabase login/session plumbing and protected routes; neither frontend branch has Supabase auth or
adds an `Authorization` header.

The merge must retain only browser-safe `VITE_SUPABASE_URL` and
`VITE_SUPABASE_PUBLISHABLE_KEY`. `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, and Ollama configuration
must never enter client code or a `VITE_` variable.

Known backend limitation: a valid Supabase user is authenticated, but a separate admin role/allowlist
is not yet enforced. This is a pre-production backend authorization TODO; the UI must not claim that it
provides the missing security boundary.

## Questions requiring a response

### Q01 — Frontend branch scope (blocking)

Are both audited heads part of the intended merge?

- Recommended: **Yes — customer + admin**, using the exact audited SHAs above.
- If no, list the authoritative branch(es) and exact commit SHA(s).

### Q02 — Integration method (blocking)

Do you accept selective porting into `apps/web`, with `main` remaining authoritative, rather than a
Git merge of unrelated histories?

- Recommended: **Accept selective porting**.
- If rejected, explain what history-preservation requirement outweighs the deletion/conflict risk.

### Q03 — Route map (blocking)

Confirm or replace this route map:

```text
/                         customer search
/products                 customer catalog
/products/:id             customer product detail
/compare                  customer two-product comparison
/login                    existing Supabase login
/admin                    admin dashboard
/admin/products           admin product list
/admin/products/:id       admin read-only product detail
/admin/import             authenticated server-import trigger/status
```

- Recommended: **Accept this map** and use `react-router-dom`, not in-memory `currentPage/currentTab`.

### Q04 — Visual shell and CSS ownership (blocking)

The customer and admin branches both define root `App`, `index.css`, `api.js`, toast components, and
broad global class names. Their `index.css` files diverge substantially.

- Recommended: customer styling owns the public shell; admin styling is scoped under an admin root or
  CSS modules; shared design tokens are extracted once; duplicate Toast is consolidated.
- State any brand/theme behavior that must override this recommendation.

### Q05 — Search-result presentation (blocking)

After removal of the fabricated match percentage and generated explanation, what should occupy those
two UI areas?

- Recommended: show retrieval mode only as a subtle diagnostic/degraded-state label; show
  human-readable chips derived from `matched_features`; hide the evidence panel when empty; do not show
  raw scores by default.
- Specify if the layout should collapse those areas entirely instead.

### Q06 — Unbacked customer commerce/content controls (blocking)

The customer detail includes “Sign in for pricing”, quantity, “Add to quote”, accessories, resources,
and invented generic benefit text. None has a backend contract.

- Recommended MVP: remove pricing/quote controls and fabricated benefits; hide empty unsupported tabs;
  retain only content derived from product detail and media.
- If any are required as clearly disabled prototypes, list each one and the exact label/behavior.

### Q07 — Catalog pagination and filtering

Should `/products` use server pagination/filter query parameters, or load the current 42 active products
with `limit=100` and filter locally?

- Recommended: server pagination and filters, with URL-backed state.
- The one-page option is acceptable only as an explicitly frozen MVP shortcut.

### Q08 — Compare selection source

Should the comparison selector search the API or use products already loaded by the current page?

- Recommended: query the public product list API and then fetch the two selected details in parallel.
- Confirm whether compare selection must survive reload via URL parameters such as
  `/compare?left=...&right=...`.

### Q09 — Admin product UI (blocking)

Confirm that Edit, Save, status toggle, and any create/delete controls are removed until corresponding
backend endpoints exist.

- Recommended: **read-only admin list/detail** with honest disabled/absent mutation controls.
- Do not choose local-only “success” state for production pages.

### Q10 — Admin import UX (blocking)

Confirm replacement of browser file upload with a confirmation button that sends an authenticated empty
`POST /admin/import`, displays the returned report, prevents repeat clicks while pending, and handles
`401`, `409`, and `503` distinctly.

- Recommended: **replace file upload simulation with server trigger**.

### Q11 — Admin dashboard data

No dashboard statistics, recent imports, recent searches, or top-products endpoint exists.

- Recommended MVP: keep the dashboard shell but show links and clearly labeled unavailable/empty
  states; do not ship hardcoded numbers as live data.
- Alternatively, omit `/admin` and redirect it to `/admin/products`. Choose one.

### Q12 — Language and copy

The frontend branches mix English and Vietnamese status/error text.

- Recommended: choose one primary UI language for the merge and keep API-derived `name_en`/`name_vi`
  available for later localization.
- Reply with `English`, `Vietnamese`, or a defined bilingual rule.

### Q13 — TypeScript and dependency policy (blocking)

Confirm conversion to TypeScript/TSX, React 18, Vite, `@reeco/shared`, existing ESLint/Prettier rules,
and adding only `lucide-react` if the selected visuals require it.

- Recommended: **accept**; do not transplant React 19 or `react-scripts`.

### Q14 — Acceptance criteria

Confirm the minimum STEP C gate:

- Root lint and all workspace builds pass.
- Existing backend 83-test baseline passes.
- New frontend tests cover search success/empty/error, product detail, compare alignment, authenticated
  admin request headers, `401`, import `201/409/503`, and no fake mutations.
- Manual responsive smoke covers customer and admin routes.
- No tracked `.env`, backend secret, mock production data source, fabricated score, or generated
  explanation remains.

- Recommended: **accept all**; add any browser/device or visual-regression requirement.

## Requested response format

Create `docs/integration/frontend-backend-merge-response.md` with this exact minimum structure:

```markdown
# Frontend–Backend Merge Response

Respondent:
Date:
Customer branch SHA:
Admin branch SHA:

## Answers

- Q01: ACCEPT / REPLACE — details
- Q02: ACCEPT / REPLACE — details
- Q03: ACCEPT / REPLACE — details
- Q04: ACCEPT / REPLACE — details
- Q05: ACCEPT / REPLACE — details
- Q06: ACCEPT / REPLACE — details
- Q07: ACCEPT / REPLACE — details
- Q08: ACCEPT / REPLACE — details
- Q09: ACCEPT / REPLACE — details
- Q10: ACCEPT / REPLACE — details
- Q11: ACCEPT / REPLACE — details
- Q12: ACCEPT / REPLACE — details
- Q13: ACCEPT / REPLACE — details
- Q14: ACCEPT / REPLACE — details

## Additional constraints

- None / list constraints

## Sign-off

I confirm these answers are the intended basis for STEP B merge-structure design.
```

Do not modify backend contracts or start the merge while preparing the response.

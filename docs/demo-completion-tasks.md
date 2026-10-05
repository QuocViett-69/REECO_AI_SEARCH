# REECO AI Search — Kế hoạch hoàn thiện bản Demo (phần không liên quan Data/AI)

> Mục tiêu: có một bản demo **chạy end-to-end thật** (đăng nhập → tìm/xem sản phẩm → giỏ hàng → đặt hàng → thanh toán COD/VNPay sandbox → admin xử lý đơn → khách thấy trạng thái cập nhật). **Chưa cần production** (không cần deploy, CI/CD, rate limit, email thật, monitoring…).
>
> Ngoài phạm vi: mọi thứ thuộc Data/AI — pipeline dữ liệu, embeddings, search/rerank/explanation, `scripts/search*`, `services/reranker`, `apps/api/src/modules/search`, `apps/api/src/ai`, `data/`.

---

## 1. Hiện trạng — những gì đang "giả" hoặc bị thiếu

| # | Vấn đề | Chỗ trong code | Ảnh hưởng tới demo |
|---|--------|----------------|--------------------|
| 1 | **Đăng nhập của client là giả**: tài khoản hard-code (`haitran` / `reeco`, mật khẩu `ilovereeco`), token là chuỗi `demo-token-…` | `apps/client/src/services/authService.js`, `context/AuthContext.js` | Không gọi được API nào cần auth; không có đăng ký |
| 2 | **Đăng nhập của admin app là giả**: nhập email/mật khẩu gì cũng vào được, token `reeco_admin_token_…` | `apps/admin/src/services/api.js` → `loginAdminApi` | Backend (`SupabaseAuthGuard`) trả **401** → **sửa sản phẩm (PATCH) và Import luôn lỗi**. Danh sách sản phẩm "chạy" được chỉ vì code tự fallback sang API public nên che mất lỗi |
| 3 | **Đơn hàng chỉ lưu trong `localStorage`** của trình duyệt | `apps/client/src/services/orderService.js` | Admin app (port 5174) **không thấy** đơn khách đặt ở client (port 5173, origin khác). Đổi trình duyệt là mất đơn. Không có bảng orders trong DB |
| 4 | **Giá tính ở frontend** (`PRICE_MAP` + hàm hash fallback), backend không biết giá | `apps/client/src/services/commercialService.js` | Client gửi `amount_vnd` bất kỳ lên `/payments/vnpay/create-url` → có thể sửa giá khi thanh toán |
| 5 | **VNPay verify không cập nhật DB**: kết quả verify xong, trình duyệt tự đánh dấu đơn PAID trong localStorage | `VnpayReturnPage.js`, `payments.controller.ts` | Trạng thái thanh toán không đáng tin, admin không thấy |
| 6 | **Notification là giả** (localStorage + "daily job simulator") | `apps/client/src/services/notificationService.js` | Admin đổi trạng thái đơn ở app admin thì khách không nhận được thông báo |
| 7 | **Admin quản lý đơn nằm trong client app** (`components/admin/AdminOrders.js`), admin app thật thì không có trang đơn hàng | client `App.js`, `Navbar.js` | Admin phải dùng 2 app khác nhau, dữ liệu lại không chung |
| 8 | **Không có URL routing**: điều hướng bằng state `currentPage` | `apps/client/src/App.js`, `apps/admin/src/App.js` | F5 là về trang chủ, nút Back không chạy, không share link sản phẩm/đơn hàng được |
| 9 | Hồ sơ khách chỉ xem, không sửa; không có đăng ký; khách không tự hủy đơn được | `ProfilePage.js`, `LoginPage.js`, `OrderDetail.js` | Thiếu flow cơ bản khi demo |
| 10 | `PATCH /admin/products/:id` nhận `Record<string, any>`, không validate | `apps/api/src/modules/admin/admin.controller.ts` | Gửi sai field là lỗi 500 từ DB |
| 11 | Dashboard admin chỉ đếm sản phẩm, không có số liệu đơn/doanh thu | `apps/admin/src/components/dashboard/DashboardView.js` | Dashboard demo "trống" |
| 12 | Không có script tạo dữ liệu demo (tài khoản, giá, đơn mẫu) và kịch bản demo | — | Mỗi người setup một kiểu, lúc demo dễ hỏng |

Hiện đang chạy được: build API ✅, test client (32 test) ✅, browse/search sản phẩm, compare, cart/favorite (localStorage), checkout UI, ký URL VNPay sandbox trên server.

---

## 2. Cách chia việc để khi merge ít conflict nhất

### 2.1 Nguyên tắc chung (BẮT BUỘC, cả 3 người đọc kỹ)

1. **Task 0 (nền móng) phải được merge vào `main` trước**, sau đó 3 người mới tạo nhánh từ `main` mới nhất. Task 0 chứa mọi thứ mà nhiều người cùng đụng: migration DB, schema/contract dùng chung, đăng ký module, cài dependency, helper gọi API.
2. **Mỗi file chỉ có 1 người sở hữu** (xem bảng mục 2.3). Muốn sửa file của người khác → nhắn người đó, hoặc để họ sửa.
3. **Không sửa các "file nóng" sau khi Task 0 đã merge**, trừ người sở hữu:
   - `package.json`, `package-lock.json` (mọi workspace) → **không `npm install` thêm gói**. Cần gói mới thì báo trưởng nhóm, gom lại cài một lần.
   - `apps/api/src/app.module.ts`, `packages/shared/src/schemas/index.ts`, `packages/shared/src/index.ts`
   - `supabase/migrations/*` đã có → **không sửa migration cũ**. Cần đổi DB thì tạo file migration **mới** có timestamp riêng, và báo nhóm.
   - `apps/client/src/index.css` (4.600+ dòng) → **không thêm CSS vào đây**. Mỗi người tạo file CSS riêng cạnh component (vd `components/account/ProfilePage.css`) rồi `import './ProfilePage.css'` trong component đó.
4. **Không chạy `npm run format` / Prettier cho cả repo**, và tắt "format on save" cho file mình không sửa. Format lại toàn file = conflict toàn file.
5. **Không đổi contract** (tên field, URL endpoint, enum trạng thái) trong `packages/shared/src/schemas/commerce.ts`. Nếu bắt buộc phải đổi thì làm một PR nhỏ riêng, merge ngay, báo cả nhóm rebase.
6. Nhánh đặt tên: `feat/p1-auth-routing`, `feat/p2-orders-payment`, `feat/p3-admin`. **Rebase lên `main` mỗi sáng** (`git fetch && git rebase origin/main`). PR nhỏ, merge sớm; không để nhánh sống quá 3 ngày mà không rebase.
7. Trước khi mở PR phải chạy: `npm run build:shared && npm run build:api && npm run test:client && npm run build:client && npm run build:admin`. Có lỗi thì không mở PR.
8. Tiền tệ luôn là **VND, số nguyên đồng** (không có số lẻ). Thời gian lưu dạng ISO/`timestamptz`, hiển thị theo `Asia/Ho_Chi_Minh`.

### 2.2 Thứ tự làm và merge

```
Ngày 1        : Task 0 (Người 1 làm, Người 2 + 3 review)  ──► merge main
Ngày 2 → 5    : Người 1 (Auth + Routing)  |  Người 2 (Orders + Payment)  |  Người 3 (Admin app)   — làm song song
Thứ tự merge  : Người 1 → Người 2 → Người 3   (ai xong trước thì mở PR trước, nhưng nếu cùng lúc thì theo thứ tự này)
Ngày cuối     : Task 4 — cả nhóm chạy kịch bản demo, sửa bug
```

Trong lúc chờ Task 0, Người 2 và 3 **chỉ đọc code và chuẩn bị** (đọc file mình sở hữu, đọc `docs/api-contract.md`, bản thiết kế UI), **chưa commit**.

Vì Task 0 đã có sẵn `POST /auth/login` thật và tài khoản demo, cả 3 người có **token thật từ ngày 2**, không ai phải chờ ai.

### 2.3 Bảng sở hữu file

| Khu vực | Người 1 — Auth, Account, Routing | Người 2 — Orders, Payment, Notification | Người 3 — Admin app |
|---|---|---|---|
| API | `apps/api/src/auth/**`, `apps/api/src/modules/auth-api/**` | `apps/api/src/modules/orders/**`, `modules/payments/**`, `modules/notifications/**` | `apps/api/src/modules/admin/**`, `modules/products/**` (chỉ phần admin/giá), `modules/imports/**` |
| Client | `App.js`, `context/AuthContext.js`, `context/CartContext.js`, `context/FavoriteContext.js`, `services/authService.js`, `components/auth/**`, `components/account/ProfilePage.js`, `components/layout/Navbar.js` | `services/orderService.js`, `services/paymentService.js`, `services/notificationService.js`, `components/commerce/CheckoutPage.js`, `OrderSuccessPage.js`, `VnpayReturnPage.js`, `components/account/OrderList.js`, `OrderDetail.js`, `NotificationCenter.js`, `AccountDashboard.js` | — (không đụng client) |
| Admin app | — | — | Toàn bộ `apps/admin/**` |
| Test | `commerce.test.js` phần auth/cart/favorite | `commerce.test.js` phần order/payment, `scripts/payments/**`, `apps/client/scripts/test-commerce-*.mjs` | test trong `apps/admin` |
| Không ai đụng (trừ khi báo) | `packages/shared/**`, `supabase/migrations/**` cũ, `package*.json`, `app.module.ts`, `index.css`, `services/api.js` (search), `services/http.js` | | |

`commerce.test.js` có 2 người cùng sửa → **mỗi người chỉ sửa trong `describe(...)` của mình**, không di chuyển/đổi thứ tự các khối có sẵn. Tốt nhất Người 2 tách phần order/payment sang file mới `src/orders.test.js`.

---

## 3. TASK 0 — Nền móng chung (Người 1 làm, ~1 ngày, merge trước tiên)

> Mục đích: dồn mọi thay đổi ở "file nóng" vào 1 PR duy nhất để các PR sau không đụng nhau.

### 0.1 Migration DB — `supabase/migrations/20261001000000_commerce_foundation.sql`

> ✅ **ĐÃ LÀM SẴN** — file migration đã có trong repo (thêm check tổng tiền, trigger `updated_at`, revoke quyền anon/authenticated). Đoạn SQL dưới đây là bản tóm tắt để đọc cho nhanh; **bản chuẩn là file migration**.

```sql
-- Giá bán (server là nguồn sự thật về giá)
create table public.product_prices (
  product_id text primary key references public.products(product_id) on delete cascade,
  price_vnd  bigint not null check (price_vnd >= 0),
  updated_at timestamptz not null default now()
);

create sequence public.order_number_seq start 1001;

create table public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     bigint not null unique default nextval('public.order_number_seq'),
  order_code       text generated always as ('REECO-' || order_number) stored,
  customer_id      uuid not null references auth.users(id),
  status           text not null,
  payment_method   text not null check (payment_method in ('cod','vnpay')),
  payment_status   text not null,
  shipping_method  text not null check (shipping_method in ('standard','express')),
  shipping_fee     bigint not null,
  subtotal         bigint not null,
  total            bigint not null,
  currency         text not null default 'VND',
  customer_name    text not null,
  customer_email   text not null,
  customer_phone   text not null,
  shipping_address text not null,
  city             text not null,
  province         text,
  country          text not null default 'Vietnam',
  postal_code      text,
  notes            text,
  estimated_delivery_from date,
  estimated_delivery_to   date,
  vnpay_txn_ref    text unique,
  vnpay_transaction_no text,
  paid_at          timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint orders_status_check check (status in ('PENDING_PAYMENT','PAID','PROCESSING','FORWARDED_TO_MANUFACTURER','SHIPPED','DELIVERED','CANCELLED','PAYMENT_FAILED')),
  constraint orders_payment_status_check check (payment_status in ('PENDING_PAYMENT','COD_PENDING','PAID','FAILED'))
);

create table public.order_items (
  id           bigint generated always as identity primary key,
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   text not null references public.products(product_id),
  model        text not null,
  product_name text not null,
  image_url    text,
  unit_price   bigint not null,
  quantity     int not null check (quantity between 1 and 999),
  line_total   bigint not null
);

create table public.order_status_history (
  id          bigint generated always as identity primary key,
  order_id    uuid not null references public.orders(id) on delete cascade,
  from_status text,
  to_status   text not null,
  changed_by  uuid references auth.users(id),
  note        text,
  created_at  timestamptz not null default now()
);

create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id),
  type        text not null check (type in ('ORDER_CREATED','PAYMENT_UPDATED','ORDER_STATUS_CHANGED')),
  title       text not null,
  message     text not null,
  order_id    uuid references public.orders(id) on delete cascade,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index orders_customer_idx on public.orders (customer_id, created_at desc);
create index orders_status_idx on public.orders (status);
create index notifications_customer_idx on public.notifications (customer_id, created_at desc);

-- API dùng service-role nên bypass RLS; bật RLS và KHÔNG tạo policy public để chặn truy cập trực tiếp bằng anon key.
alter table public.product_prices enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.notifications enable row level security;
```

Chạy thử bằng Supabase local (`supabase db reset`) để chắc migration chạy được, không lỗi.

### 0.2 Contract dùng chung — `packages/shared/src/schemas/commerce.ts`

Viết bằng Zod (giống style `api-contract.ts`), export trong `schemas/index.ts`. Tối thiểu phải có:

- `OrderStatusSchema` (8 giá trị như check constraint ở trên), `PaymentStatusSchema`, `PaymentMethodSchema` (`cod | vnpay`), `ShippingMethodSchema` (`standard | express`).
- `ORDER_STATUS_TRANSITIONS` — **luồng trạng thái hợp lệ** (dùng chung cho API và admin UI):
  ```
  PENDING_PAYMENT → PAID | PAYMENT_FAILED | CANCELLED
  PAYMENT_FAILED  → PENDING_PAYMENT (thử thanh toán lại) | CANCELLED
  PAID            → PROCESSING | CANCELLED
  PROCESSING      → FORWARDED_TO_MANUFACTURER | CANCELLED
  FORWARDED_TO_MANUFACTURER → SHIPPED
  SHIPPED         → DELIVERED
  DELIVERED, CANCELLED → (kết thúc)
  ```
- `SHIPPING_METHODS` (standard 250.000đ 7–10 ngày, express 750.000đ 2–3 ngày) — chuyển từ `orderService.js` sang đây.
- `CreateOrderRequestSchema`: `{ items: [{ product_id, quantity }], shipping_method, payment_method, shipping_info: { full_name, email, phone, address, city, province?, country?, postal_code?, notes? } }`. **Không có giá trong request.**
- `OrderSchema` (response, snake_case giống DB, `items[]`, `status_history[]`), `OrderListResponseSchema` (`{ items, total, page, page_size }`).
- `UpdateOrderStatusRequestSchema`: `{ status, note? }`.
- `AdminOrderStatsSchema`: `{ total_orders, pending_payment, processing, delivered, cancelled, revenue_vnd }` (doanh thu = tổng `total` của đơn `payment_status = PAID`).
- `LoginRequestSchema` `{ email, password }`, `RegisterRequestSchema` `{ email, password (≥ 8 ký tự), full_name, phone?, company? }`, `AuthSessionSchema` `{ access_token, refresh_token, expires_at, user }`, `MeSchema` `{ id, email, role: 'customer'|'admin', full_name, phone, company }`, `UpdateMeRequestSchema`.
- `NotificationSchema`.
- `AdminProductUpdateSchema` — đúng các field mà `ProductsService.updateAdmin` đang nhận (`product_name_en`, `name_vi`, `category`, `subcategory`, `device_type`, `status`, `product_url`, `supported_protocols`, `specifications`), dùng `.strict()`.

### 0.3 API: guard, decorator, khung module

> **Trạng thái hiện tại (theo code):** quyền admin được kiểm tra bằng `apps/api/src/auth/admin.guard.ts` (`AdminGuard`, đọc `user.app_metadata.role`), gắn cùng `SupabaseAuthGuard` cho mọi controller `/admin/*` (`admin/products`, `admin/import`, `admin/orders`). **Chưa có** `roles.guard.ts`, `@Roles()`, `@CurrentUser()` hay module `auth-api`, và **không có** `POST /api/v1/auth/login`: cả Client lẫn Admin đăng nhập trực tiếp bằng Supabase password grant (`/auth/v1/token?grant_type=password`) với anon key, rồi gửi access token cho API. Các tiêu chí ở §0.6 dùng `POST /auth/login` vì thế không áp dụng như viết; kiểm tra 200/403 bằng token lấy từ Supabase.

- `apps/api/src/auth/roles.guard.ts` + `roles.decorator.ts` (`@Roles('admin')`) + `current-user.decorator.ts` (`@CurrentUser()`). Role đọc từ **`user.app_metadata.role`** (người dùng không tự sửa được field này; **không** dùng `user_metadata` để xét quyền). Không có role → coi là `customer`.
- Tạo khung module rỗng và đăng ký hết trong `app.module.ts`: `AuthApiModule` (`modules/auth-api`), `OrdersModule` (`modules/orders`), `NotificationsModule` (`modules/notifications`). Sau Task 0 **không ai sửa `app.module.ts` nữa**.
- Làm luôn `POST /api/v1/auth/login` (thật): gọi `supabase.auth.signInWithPassword` bằng một client riêng `persistSession: false`, trả về `AuthSession`. Sai mật khẩu → 401 với message tiếng Việt/Anh rõ ràng.
- Cập nhật `apps/api/.env.example` nếu có thêm biến (vd `CLIENT_APP_URL`, `ADMIN_APP_URL`). Kiểm tra CORS trong `main.ts` cho phép cả 5173 và 5174.

### 0.4 Script dữ liệu demo — `scripts/demo/seed-demo.mjs` + npm script `demo:seed`

> ✅ **ĐÃ LÀM SẴN** phần tài khoản + giá (`npm run demo:seed`, có `-- --dry-run`). Script dùng Supabase API qua HTTPS nên không cần `DATABASE_URL`.

- Tạo (hoặc cập nhật nếu đã tồn tại — **chạy nhiều lần không lỗi**) 2 tài khoản bằng `auth.admin.createUser({ email_confirm: true, app_metadata: { role } })`:
  - Khách: `haitran@example.com` / `ilovereeco`, full_name "Hai Tran", company "Vietnam Meteorological Station"
  - Admin: `admin@reeco.vn` / `ilovereeco`
- Seed `product_prices` từ `PRICE_MAP` hiện tại; sản phẩm không có trong map thì dùng **đúng** công thức `calculateFallbackPrice` hiện tại (để giá hiển thị không đổi). Chỉ seed cho `product_id` có trong bảng `products`.
- (Người 2 sẽ bổ sung phần seed 2–3 đơn mẫu vào script này ở Task 2 — chỉ thêm hàm mới ở cuối file.)

### 0.5 Frontend: dependency + helper gọi API

- Cài `react-router-dom@6` cho **cả** `apps/client` và `apps/admin` ngay trong Task 0 (để `package-lock.json` chỉ đổi 1 lần).
- Tạo `apps/client/src/services/http.js` và `apps/admin/src/services/http.js`, cùng 1 API:
  ```js
  // apiFetch(path, { method, body, auth = true }) → Promise<data>
  // - Tự thêm base URL (REACT_APP_API_URL) và header Authorization: Bearer <access_token>
  // - Token đọc từ localStorage key 'reeco_auth_session' (client) / 'reeco_admin_session' (admin)
  // - Response không ok → throw ApiError { status, message, details }
  // - 401 → phát event window 'reeco:unauthorized' (AuthContext nghe event này để logout)
  ```
  Người 2 và 3 **chỉ gọi API qua `apiFetch`**, không tự viết `fetch` + header.
- Gỡ trang admin ra khỏi client: xóa `apps/client/src/components/admin/AdminOrders.js`, bỏ import/route `admin`, `admin-orders` trong `App.js`, trong `Navbar.js` đổi 2 nút admin thành link mở `REACT_APP_ADMIN_URL` (thêm biến này vào `apps/client/.env.example`, mặc định `http://localhost:5174`). (Người 3 lấy lại code cũ bằng `git show 335d942:apps/client/src/components/admin/AdminOrders.js` để port sang admin app.)

### 0.6 Tiêu chí xong Task 0

- [ ] `supabase db reset` chạy migration mới không lỗi; `npm run demo:seed` chạy 2 lần liên tiếp không lỗi.
- [ ] `curl -X POST localhost:3000/api/v1/auth/login -H 'content-type: application/json' -d '{"email":"admin@reeco.vn","password":"ilovereeco"}'` trả `access_token`, và `user.role = "admin"`.
- [ ] Gọi `GET /api/v1/admin/products` bằng token đó → 200; bằng token khách → 403.
- [ ] Build tất cả + test client pass. Client vẫn chạy như cũ (đăng nhập giả vẫn dùng tạm được).

---

## 4. TASK 1 — Người 1: Auth thật, Tài khoản, URL Routing (client)

### 1.1 Backend (`modules/auth-api`)

| Endpoint | Auth | Mô tả |
|---|---|---|
| `POST /auth/login` | — | Đã có từ Task 0 |
| `POST /auth/register` | — | Tạo user bằng `auth.admin.createUser({ email_confirm: true, app_metadata: { role: 'customer' }, user_metadata: { full_name, phone, company } })`, sau đó login luôn và trả `AuthSession`. **Luôn ép role = customer**, bỏ qua mọi field role gửi lên. Email đã tồn tại → 409 |
| `POST /auth/refresh` | — | `{ refresh_token }` → `AuthSession` mới |
| `GET /auth/me` | Bearer | Trả `Me` |
| `PATCH /auth/me` | Bearer | Sửa `full_name`, `phone`, `company` (lưu vào `user_metadata`). Không cho sửa email/role |

Validate body bằng Zod pipe có sẵn (`common/pipes`) + schema từ `@reeco/shared`.

### 1.2 Client

- **`AuthContext.js` + `authService.js`**: bỏ `DEMO_CREDENTIALS`. Login bằng **email + mật khẩu** (bỏ ô chọn role — role lấy từ server). Lưu session vào `localStorage['reeco_auth_session']` (đúng key mà `http.js` đọc). Khi sắp hết hạn (`expires_at` còn < 60s) hoặc gặp 401 → gọi `/auth/refresh` 1 lần; refresh lỗi → logout. Nghe event `reeco:unauthorized`.
  - Giữ nguyên các giá trị context đang được dùng: `user`, `role`, `isAuthenticated`, `isCustomer`, `isAdmin`, `login`, `logout`, `authError` — để component của Người 2 không phải sửa. `user` phải có thêm `id` (uuid). **`user.username` không còn nữa** → grep `user.username` / `user?.username` trong các file mình sở hữu và đổi thành `user.id`; nếu thấy trong file của Người 2 thì nhắn Người 2.
  - Admin đăng nhập ở client → hiện thông báo và chuyển sang admin app (`REACT_APP_ADMIN_URL`).
  - Nhớ dọn key cũ `reeco_auth_user` khi load app.
- **Trang đăng ký** mới `components/auth/RegisterPage.js`: validate client (email, mật khẩu ≥ 8 ký tự, nhập lại mật khẩu khớp, họ tên bắt buộc), hiện lỗi 409 "Email đã được dùng". Link qua lại giữa Login ↔ Register.
- **`ProfilePage.js`**: cho sửa họ tên, SĐT, công ty (gọi `PATCH /auth/me`), có trạng thái đang lưu / lưu thành công / lỗi.
- **Cart & Favorites** (`CartContext.js`, `FavoriteContext.js`): đổi key lưu theo user từ `username` sang `user.id`. Giữ logic gộp giỏ hàng khách vãng lai vào giỏ user khi đăng nhập. (Vẫn lưu localStorage — đủ cho demo.)
- **URL routing với `react-router-dom`** trong `App.js` (`BrowserRouter`):

  | URL | Trang | Cần đăng nhập |
  |---|---|---|
  | `/` | Search hero | |
  | `/search?q=...` | Kết quả search (F5 phải search lại từ `q`) | |
  | `/products` | Catalog | |
  | `/products/:model` | Chi tiết sản phẩm | |
  | `/compare` | So sánh | |
  | `/cart` | Giỏ hàng | |
  | `/checkout` | Checkout | ✅ |
  | `/orders/:orderId/success` | Đặt hàng thành công | ✅ |
  | `/payment/vnpay-return` | Trang VNPay trả về (**giữ nguyên query string**, bỏ đoạn `history.replaceState` hiện tại) | ✅ |
  | `/account`, `/account/orders`, `/account/orders/:orderId`, `/account/favorites`, `/account/notifications`, `/account/profile` | Tài khoản | ✅ |
  | `/login?redirect=...`, `/register` | Auth | |
  | `*` | Trang 404 đơn giản | |

  - Chưa đăng nhập mà vào trang cần đăng nhập → chuyển tới `/login?redirect=<url hiện tại>`, đăng nhập xong quay lại đúng trang đó.
  - **Rất quan trọng để tránh conflict**: các component hiện nhận prop `onNavigate('page-name')`. **Giữ nguyên prop này**, trong `App.js` viết hàm `handleNavigate` chuyển tên trang cũ → URL mới (`'cart'` → `/cart`, `'account-order:1001'` → `/account/orders/1001`, `'order-success:1001'` → `/orders/1001/success`, `'detail'` + model → `/products/:model`, …). Như vậy **không phải sửa component của Người 2**. Viết bảng map này thành 1 object ở đầu `App.js`.
  - Trang VNPay return, OrderDetail, OrderSuccess cần `orderId` → truyền qua prop như hiện tại (lấy từ `useParams` trong `App.js`), không bắt component con tự gọi `useParams`.

### 1.3 Tiêu chí xong Task 1

- [ ] Đăng ký tài khoản mới → tự đăng nhập → vào `/account/profile` sửa tên → F5 vẫn còn tên mới.
- [ ] Sai mật khẩu hiện lỗi; token hết hạn tự refresh; xóa session trong DevTools → bị đưa về `/login`.
- [ ] F5 ở mọi URL trong bảng vẫn đúng trang; nút Back/Forward chạy; copy link `/products/CR1000X` mở tab mới ra đúng sản phẩm.
- [ ] Giỏ hàng khách vãng lai được gộp vào giỏ user sau khi đăng nhập.
- [ ] Test auth/cart/favorite trong `commerce.test.js` đã cập nhật và pass.

---

## 5. TASK 2 — Người 2: Đơn hàng, Thanh toán, Thông báo (backend + client)

### 2.1 Backend `modules/orders`

| Endpoint | Auth | Mô tả |
|---|---|---|
| `POST /orders` | customer | Tạo đơn theo `CreateOrderRequest` |
| `GET /orders/me?page=&page_size=` | customer | Đơn của chính mình, mới nhất trước |
| `GET /orders/:orderId` | owner hoặc admin | `orderId` nhận **cả** `uuid`, `1001` hoặc `REECO-1001`. Không phải chủ đơn → **404** (không trả 403 để khỏi lộ đơn có tồn tại) |
| `POST /orders/:orderId/cancel` | owner | Chỉ hủy được khi `PENDING_PAYMENT`, `PAYMENT_FAILED`, `PAID`, `PROCESSING`. Trạng thái khác → 409 |
| `GET /admin/orders?search=&status=&page=&page_size=` | admin | `search` khớp mã đơn, tên, email, SĐT khách |
| `PATCH /admin/orders/:orderId/status` | admin | Body `{ status, note? }`. **Kiểm tra theo `ORDER_STATUS_TRANSITIONS`**, sai → 409 kèm danh sách trạng thái được phép |
| `GET /admin/orders/stats` | admin | `AdminOrderStats` |

Quy tắc bắt buộc khi tạo đơn (làm trong service, **không tin bất cứ giá nào từ client**):
1. Lấy `products` + `product_prices` theo các `product_id`. Có `product_id` không tồn tại hoặc `status != 'active'` hoặc chưa có giá → 400, nói rõ sản phẩm nào.
2. Gộp các dòng trùng `product_id`. `quantity` 1–999.
3. `unit_price` = giá trong DB; lưu snapshot `model`, `product_name`, `image_url` (ảnh đầu tiên trong `product_media`) vào `order_items`.
4. `shipping_fee` lấy từ `SHIPPING_METHODS` trong `@reeco/shared`; `total = subtotal + shipping_fee`. Ngày giao dự kiến tính từ ngày tạo.
5. COD → `status = PROCESSING`, `payment_status = COD_PENDING`. VNPay → `PENDING_PAYMENT` / `PENDING_PAYMENT`.
6. Ghi 1 dòng `order_status_history` và 1 notification `ORDER_CREATED`.
7. Cập nhật `payment_status` khi admin đổi trạng thái giống logic hiện tại: COD → `PAID` khi `DELIVERED`.

Mỗi lần đổi trạng thái (admin, hủy, thanh toán) phải: cập nhật `orders.status` + `updated_at`, ghi `order_status_history` (có `changed_by`), tạo notification `ORDER_STATUS_CHANGED` / `PAYMENT_UPDATED` cho khách.

> Supabase JS không có transaction; để đơn giản cho demo: insert `orders` trước, insert `order_items` sau, nếu bước sau lỗi thì xóa `orders` vừa tạo. Hoặc viết 1 hàm SQL `create_order(...)` trong **migration mới của mình** rồi gọi `rpc` (cách này sạch hơn).

### 2.2 Backend `modules/payments` (sửa lại VNPay)

- `POST /payments/vnpay/create-url` → cần đăng nhập, body **chỉ còn `{ order_id }`**. Server tự đọc đơn: phải là chủ đơn, `payment_method = vnpay`, trạng thái `PENDING_PAYMENT` hoặc `PAYMENT_FAILED` (nếu `PAYMENT_FAILED` thì chuyển lại `PENDING_PAYMENT`). `amount` = `orders.total` từ DB. Tạo `vnp_TxnRef` mới cho mỗi lần thử (vd `${order_number}${Date.now()}` — chỉ chữ số, không có ký tự `-`) và lưu vào `orders.vnpay_txn_ref`.
- `GET /payments/vnpay/verify` → sau khi kiểm tra chữ ký hợp lệ: tìm đơn theo `vnp_TxnRef`, kiểm tra `vnp_Amount / 100 == total`, rồi **cập nhật DB**: thành công → `PAID` → `PROCESSING`, `paid_at`, `vnpay_transaction_no`; thất bại → `PAYMENT_FAILED`. **Idempotent**: đơn đã `PAID` thì trả kết quả cũ, không tạo thêm notification (F5 trang return không được xử lý 2 lần). Response trả kèm `order` để client hiển thị.
- (Tùy chọn) `GET /payments/vnpay/ipn` theo chuẩn VNPay (trả `{ RspCode, Message }`), dùng chung hàm cập nhật với `verify`. Khi chạy localhost VNPay không gọi được IPN, nên demo dựa vào `verify` là đủ; ghi chú trong README.
- Cập nhật `scripts/payments/vnpay.test.mjs` theo chữ ký hàm mới.

### 2.3 Backend `modules/notifications`

- `GET /notifications/me?unread_only=`, `PATCH /notifications/:id/read`, `POST /notifications/read-all` (chỉ của chính mình).
- Service `NotificationsService.create(...)` được `OrdersService`/`PaymentsService` gọi (export service trong `NotificationsModule`, import module vào `OrdersModule`/`PaymentsModule` — sửa trong module của mình, không đụng `app.module.ts`).
- **Bỏ "daily notification simulator"**.

### 2.4 Client

- **`orderService.js`**: viết lại thành wrapper gọi API qua `apiFetch`. **Mọi hàm giờ là `async`** → rà hết chỗ gọi trong các component của mình và thêm `await` + trạng thái loading/lỗi. Xóa toàn bộ code localStorage, đơn seed `ord_1001`, `getNextOrderId`. Giữ `ORDER_STATUSES` (label + màu) cho UI.
- **`paymentService.js`**: `createVnpayPaymentUrl(orderId)` chỉ gửi `order_id`; `verifyVnpayReturn(search)` dùng `apiFetch`.
- **`notificationService.js`** → gọi API. Badge số thông báo chưa đọc trên Navbar: **Navbar là của Người 1** → Người 2 export hook `useUnreadNotificationCount()` (poll mỗi 30s khi đã đăng nhập), Người 1 gắn vào Navbar (1 dòng) — hẹn nhau trước.
- **`CheckoutPage.js`**: gửi đúng `CreateOrderRequest` (chỉ `product_id` + `quantity`, không gửi giá). Hiện lỗi 400 từ server (vd sản phẩm không còn bán). Chống bấm "Đặt hàng" 2 lần (disable nút khi đang gửi). Đặt thành công mới xóa giỏ hàng. VNPay: tạo đơn xong gọi `create-url` rồi `window.location.href = payment_url`.
- **`VnpayReturnPage.js`**: gọi verify, hiển thị theo `order` server trả; bỏ việc tự `markOrderAsPaid` ở client. Nút "Thanh toán lại" khi thất bại.
- **`OrderList.js`, `OrderDetail.js`, `OrderSuccessPage.js`, `AccountDashboard.js`, `NotificationCenter.js`**: lấy dữ liệu từ API; OrderDetail hiển thị timeline từ `status_history`, nút "Hủy đơn" (có hộp xác nhận) khi đơn còn hủy được, nút "Thanh toán lại" cho VNPay chưa thanh toán.
- Giá hiển thị ở catalog/detail vẫn đang lấy từ `commercialService.js` — giữ nguyên cho demo (seed giá dùng cùng công thức nên khớp). Tổng tiền trên trang checkout ghi rõ "Tổng tiền cuối cùng do hệ thống xác nhận" và trang success hiển thị số tiền **từ server**.
- Seed đơn mẫu: thêm hàm vào cuối `scripts/demo/seed-demo.mjs` tạo 3 đơn cho `haitran@example.com` (1 `PROCESSING` COD, 1 `SHIPPED` VNPay đã trả, 1 `PENDING_PAYMENT` VNPay). Chạy lại không tạo trùng (đánh dấu bằng `notes = '[demo-seed]'`, xóa đơn seed cũ rồi tạo lại).

### 2.5 Tiêu chí xong Task 2

- [ ] Khách đặt đơn COD → thấy trong `/account/orders`; mở DevTools sửa giá trong request cũng không đổi được tổng tiền.
- [ ] Đặt đơn VNPay → qua trang sandbox → thanh toán thẻ test NCB → quay về thấy "Đã thanh toán"; F5 trang return không tạo thêm notification.
- [ ] Hủy thanh toán trên VNPay → đơn `PAYMENT_FAILED` → "Thanh toán lại" chạy.
- [ ] Khách A không xem được đơn của khách B (thử bằng URL) → 404.
- [ ] Gọi `PATCH /admin/orders/:id/status` bằng curl với token admin: chuyển sai luồng → 409; đúng luồng → khách thấy notification mới.
- [ ] Test order/payment đã cập nhật và pass.

---

## 6. TASK 3 — Người 3: Admin app

> Làm song song với Người 2: API `/admin/orders*` theo đúng contract ở Task 0. Trong lúc Người 2 chưa merge, viết `services/ordersApi.js` gọi `apiFetch` và **tạm** có cờ `REACT_APP_ADMIN_ORDERS_MOCK=true` trả dữ liệu giả **đúng schema `OrderSchema`**. Khi Người 2 merge xong thì tắt cờ, test với API thật, rồi xóa mock.

### 3.1 Đăng nhập admin thật

- `LoginView.js` + `services/api.js`: gọi `POST /auth/login`; nếu `user.role !== 'admin'` → báo "Tài khoản không có quyền quản trị" và **không** lưu session. Lưu session vào `localStorage['reeco_admin_session']` (key mà `admin/services/http.js` đọc). Xóa `loginAdminApi` giả, xóa đoạn quét key `sb-*-auth-token`.
- Refresh token + nghe `reeco:unauthorized` → về trang login (giống Người 1, có thể copy logic).
- **Xóa fallback sang API public** trong `getAdminProductsApi` / `getAdminProductDetailApi` — lỗi 401/403 phải hiện ra, không được che.

### 3.2 Routing admin (`react-router-dom`)

`/login`, `/` (dashboard), `/products`, `/products/:productId`, `/orders`, `/orders/:orderId`, `/import`. Chưa đăng nhập → `/login`. Sidebar highlight theo URL.

### 3.3 Quản lý đơn hàng (mới trong admin app)

- Lấy code cũ để tham khảo: `git show 335d942:apps/client/src/components/admin/AdminOrders.js`. Port UI sang `apps/admin/src/components/orders/OrderListView.js` và `OrderDetailView.js`, **viết lại phần dữ liệu** dùng API (code cũ đọc localStorage).
- Danh sách: tìm kiếm (debounce 300ms), lọc trạng thái, phân trang, cột mã đơn / khách / tổng tiền / phương thức TT / trạng thái TT / trạng thái đơn / ngày tạo.
- Chi tiết: thông tin khách, địa chỉ, sản phẩm, lịch sử trạng thái. Dropdown đổi trạng thái **chỉ hiện các trạng thái hợp lệ** theo `ORDER_STATUS_TRANSITIONS`, có ô ghi chú, hộp xác nhận khi chọn `CANCELLED`. Sau khi lưu thì tải lại đơn.

### 3.4 Dashboard

- Thẻ số liệu từ `GET /admin/orders/stats`: tổng đơn, chờ thanh toán, đang xử lý, đã giao, doanh thu (format `vi-VN` VND). Giữ các số liệu sản phẩm đang có.
- Bảng "5 đơn mới nhất" (dùng `/admin/orders?page_size=5`), bấm vào mở chi tiết.

### 3.5 Sản phẩm (backend + admin UI)

- Backend `admin.controller.ts`: validate body `PATCH /admin/products/:productId` bằng `AdminProductUpdateSchema` (từ shared) qua Zod pipe; thêm `@Roles('admin')` cho **mọi** route admin (`admin/products`, `admin/import`).
  > **Trạng thái hiện tại:** đã làm theo cách khác — `AdminProductUpdateSchema` nằm ở `apps/api/src/modules/admin/admin-product-update.schema.ts` (strict, `product_url` chỉ nhận http(s)), và mọi route admin dùng `AdminGuard` thay cho `@Roles('admin')`.
- Thêm `PUT /admin/products/:productId/price` body `{ price_vnd }` (số nguyên ≥ 0) → upsert `product_prices`. Trả giá trong `GET /admin/products/:productId` (thêm field `price_vnd` — chỉ thêm, không đổi field cũ).
- `AdminProductDetailView.js`: sửa thông tin + sửa giá, hiện lỗi validate từ server theo từng field.
- Import view: hiển thị báo cáo từ response API (bỏ lưu `reeco_admin_last_import` trong localStorage nếu không cần).

### 3.6 Tiêu chí xong Task 3

- [ ] Đăng nhập `admin@reeco.vn` vào được; đăng nhập `haitran@example.com` bị từ chối; nhập bừa bị từ chối.
- [ ] Sửa tên sản phẩm + giá → F5 vẫn còn; gửi field lạ → lỗi 400 hiển thị rõ.
- [ ] Khách đặt đơn ở client → trong ≤ 1 lần refresh admin thấy đơn; admin chuyển `PROCESSING → FORWARDED_TO_MANUFACTURER → SHIPPED → DELIVERED` → khách thấy timeline + notification.
- [ ] Dashboard số liệu khớp với danh sách đơn.
- [ ] F5 ở mọi URL admin vẫn đúng trang. Mock đơn hàng đã xóa.

---

## 7. TASK 4 — Cả nhóm: Kịch bản demo & nghiệm thu (ngày cuối)

- **Người 1** cập nhật `README.md` mục "Chạy demo": thứ tự lệnh `supabase start` → `supabase db reset` → `npm run demo:seed` → chạy API/client/admin; bảng tài khoản demo; biến môi trường VNPay sandbox (không commit secret thật).
- **Người 2** viết `docs/demo-script.md`: kịch bản 5–7 phút (tìm sản phẩm → so sánh → thêm giỏ → đăng nhập → checkout VNPay (kèm số thẻ test NCB) → admin xử lý đơn → khách thấy thông báo).
- **Người 3** chạy thử toàn bộ kịch bản trên **máy sạch** (clone mới, làm theo README), ghi lại chỗ vướng.
- Cả nhóm: xóa `localStorage` trình duyệt trước khi demo (key cũ: `reeco_orders_store`, `reeco_next_order_id`, `reeco_auth_user`, `reeco_notifications*`); sửa bug theo nguyên tắc sở hữu file ở mục 2.3.

### Checklist nghiệm thu cuối

- [ ] `npm run build` và `npm run test:client` pass trên `main`.
- [ ] Không còn `DEMO_CREDENTIALS`, `loginAdminApi` giả, `localStorage` cho đơn hàng/notification (`grep -rn "reeco_orders_store\|demo-token\|reeco_admin_token" apps` không ra kết quả).
- [ ] Toàn bộ flow trong `docs/demo-script.md` chạy được 2 lần liên tiếp không lỗi.
- [ ] Không commit file `.env` hay secret VNPay/Supabase.

---

## 8. Lỗi hay gặp — đọc trước khi code

- **Quên `await`** sau khi `orderService` thành async → component render `[object Promise]` hoặc `undefined.map`. Luôn có 3 trạng thái: loading / lỗi / có dữ liệu.
- **So sánh id sai kiểu**: `order_number` là số (1001), `id` là uuid, `order_code` là chuỗi `REECO-1001`. URL dùng `order_number`. Đừng so `===` giữa số và chuỗi.
- **Tiền**: không dùng số thực; VNPay nhận `amount * 100`. Kiểm tra tiền luôn ở server.
- **Role**: chỉ tin `app_metadata.role` ở backend. Ẩn nút ở frontend **không** phải là phân quyền.
- **CORS / base URL**: luôn dùng `REACT_APP_API_URL`, không hard-code `localhost:3000` trong component.
- **Supabase trả `{ data, error }`** chứ không throw → luôn kiểm tra `error`.
- **Không log** access token, mật khẩu, `VNPAY_HASH_SECRET` ra console.
- **Sửa `.env.example`** khi thêm biến môi trường mới, kèm comment giải thích.
- Trước khi push: `git diff origin/main --stat` — thấy file không thuộc phần mình → xem lại, có thể do format tự động.

# Merge feat/p2-orders-payment into main

Source: `6085e59`; main before merge: `4b44678`.
Backup: `backup/main-before-p2-orders-payment-20261002`.

Resolved ten conflicts using the database-backed order/payment flow. Kept
main's VND formatting and captured VNPay return parameters before cleaning
the browser URL. Only the order-backed VNPay controller is registered.

Integration fixes:

- Retained main's verified Supabase authentication; rejected fake demo tokens
  and unsigned JWT fallbacks. Client/admin login now requires real tokens.
- Removed the embedded service-role key and automatic admin credential login
  from the admin frontend. Configure public Supabase keys through env files.
  The removed key remains in source-branch Git history: rotate that exposed
  service-role key in Supabase before deploying.
- Used the existing database sequence for order numbers to prevent concurrent
  requests allocating the same number. Kept the generated order-code column.
- Removed hardcoded VNPay signing credentials. Required exact payment amounts
  and both successful response/transaction status codes. Reused the existing
  Vietnam-time formatter and preserved main's signing tests separately.

Validation:

- `npm run build`: shared, API, client and admin passed.
- `npm run test:client -- --runInBand`: 32 tests passed.
- `npm run test:admin -- --runInBand`: no tests present.
- `node --test scripts/payments/vnpay-signing.test.mjs scripts/payments/merge-regression.test.mjs`: 9 tests passed.
- `node --test scripts/search/*.test.mjs scripts/create-embeddings/*.test.mjs`: 137 tests passed.
- `npm run lint`: 35 explicit-any errors, including 34 in new modules and
  one existing error in `admin.controller.ts`. No lint rules were disabled.

Database-writing payment/notification integration suites and an actual VNPay
sandbox transaction were not run. Runtime checkout requires the commerce
migration, demo accounts/product prices, public frontend Supabase config, and
API VNPay credentials described in README. No remote database was modified.
The merge is local; it has not been pushed.

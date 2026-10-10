-- Customers can now self-register (POST /auth/register), so the `authenticated`
-- role is no longer admin-only. The *_authenticated_read policies used
-- `using (true)` and exposed `status = 'review'` catalog rows through PostgREST.
-- Authenticated users now get the same active-only rule as anon; full reads stay
-- available to JWTs whose app_metadata.role is 'admin'. The API uses the
-- service-role key and is unaffected.

alter policy products_public_active_read on public.products to anon, authenticated;
alter policy product_specifications_public_active_read on public.product_specifications to anon, authenticated;
alter policy product_documents_public_active_read on public.product_documents to anon, authenticated;
alter policy product_media_public_active_read on public.product_media to anon, authenticated;
alter policy product_search_index_public_active_read on public.product_search_index to anon, authenticated;

alter policy products_authenticated_read on public.products
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
alter policy product_specifications_authenticated_read on public.product_specifications
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
alter policy product_documents_authenticated_read on public.product_documents
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
alter policy product_media_authenticated_read on public.product_media
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
alter policy product_search_index_authenticated_read on public.product_search_index
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

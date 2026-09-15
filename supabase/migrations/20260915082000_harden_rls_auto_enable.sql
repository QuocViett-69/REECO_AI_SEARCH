-- The event trigger invokes this function internally. It must not be exposed
-- through PostgREST to anonymous or signed-in API clients.
revoke execute on function public.rls_auto_enable() from public;
revoke execute on function public.rls_auto_enable() from anon;
revoke execute on function public.rls_auto_enable() from authenticated;

-- The event trigger invokes this function internally. It must not be exposed
-- through PostgREST to anonymous or signed-in API clients.
-- This migration predates the repository-owned function definition, so it must
-- also be safe when replayed on a fresh database where the function is absent.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public';
    execute 'revoke execute on function public.rls_auto_enable() from anon';
    execute 'revoke execute on function public.rls_auto_enable() from authenticated';
  end if;
end;
$$;

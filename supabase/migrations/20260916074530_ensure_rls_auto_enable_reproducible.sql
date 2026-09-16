create or replace function public.rls_auto_enable()
returns event_trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  ddl_command record;
begin
  for ddl_command in
    select *
    from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type in ('table', 'partitioned table')
      and schema_name = 'public'
      and schema_name not in ('pg_catalog', 'information_schema')
      and schema_name not like 'pg_toast%'
      and schema_name not like 'pg_temp%'
  loop
    execute format(
      'alter table %s enable row level security',
      ddl_command.object_identity
    );
  end loop;
end;
$$;

revoke execute on function public.rls_auto_enable() from public;
revoke execute on function public.rls_auto_enable() from anon;
revoke execute on function public.rls_auto_enable() from authenticated;
revoke execute on function public.rls_auto_enable() from service_role;

drop event trigger if exists ensure_rls;

create event trigger ensure_rls
on ddl_command_end
when tag in (
  'CREATE TABLE',
  'CREATE TABLE AS',
  'SELECT INTO'
)
execute function public.rls_auto_enable();

-- Hórus Foundation 0002
-- Identity/authorization hardening. Authentication remains Supabase Auth;
-- authorization data is application-owned and never inferred from user metadata.

create or replace function private.sync_horus_entitlement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_entitlements(user_id, organization_id, role, plan_tier)
  values (new.id, new.organization_id, new.role, 'free')
  on conflict (user_id) do update
    set organization_id = excluded.organization_id,
        role = excluded.role,
        updated_at = now();
  return new;
end;
$$;

revoke all on function private.sync_horus_entitlement() from public, anon, authenticated;
drop trigger if exists on_horus_user_entitlement_sync on public.users;
create trigger on_horus_user_entitlement_sync
after insert or update of organization_id, role on public.users
for each row execute function private.sync_horus_entitlement();

-- Explicitly prevent direct client mutation of authorization state.
revoke insert, update, delete on public.organizations from anon, authenticated;
revoke insert, update, delete on public.users from anon, authenticated;
revoke insert, update, delete on public.organization_memberships from anon, authenticated;
revoke insert, update, delete on public.user_entitlements from anon, authenticated;
revoke insert, update, delete on public.credit_accounts from anon, authenticated;
revoke insert, update, delete on public.credit_ledger from anon, authenticated;
revoke insert, update, delete on public.credit_holds from anon, authenticated;
revoke insert, update, delete on public.idempotency_keys from anon, authenticated;

-- Keep system-owned authorization data invisible to anonymous clients.
-- Authenticated users only receive their own entitlement record and membership data through RLS.

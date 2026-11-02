-- Acceso del panel DiPizza.
-- Ejecutar después de supabase/schema.sql en un proyecto nuevo.
-- El acceso a solicitudes/calendario es solo para los dos propietarios
-- iniciales y cuentas agregadas tras aprobación desde el panel.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  is_active boolean not null default true,
  approved_at timestamptz not null default now(),
  approved_by_email text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_access_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by_email text
);

create unique index if not exists admin_access_requests_one_pending_per_user
  on public.admin_access_requests(user_id) where status = 'pending';

alter table public.admin_users enable row level security;
alter table public.admin_access_requests enable row level security;
revoke all on public.admin_users, public.admin_access_requests from anon, authenticated;
grant all on public.admin_users, public.admin_access_requests to service_role;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_dipizza_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid() and a.is_active
  );
$$;

revoke all on function private.is_dipizza_admin() from public, anon;
grant execute on function private.is_dipizza_admin() to authenticated;

drop policy if exists "panel lee solicitudes" on public.enquiries;
drop policy if exists "panel actualiza solicitudes" on public.enquiries;
drop policy if exists "panel gestiona fechas" on public.blocked_dates;

create policy "panel lee solicitudes"
  on public.enquiries for select to authenticated
  using (private.is_dipizza_admin());

create policy "panel actualiza solicitudes"
  on public.enquiries for update to authenticated
  using (private.is_dipizza_admin())
  with check (private.is_dipizza_admin());

create policy "panel gestiona fechas"
  on public.blocked_dates for all to authenticated
  using (private.is_dipizza_admin())
  with check (private.is_dipizza_admin());


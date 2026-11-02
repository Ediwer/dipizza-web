-- ════════════════════════════════════════════════════════════════
-- DiPizza · esquema de la base
--
-- Pegar entero en Supabase → SQL Editor → Run.
-- Es idempotente: se puede volver a ejecutar sin romper nada.
-- ════════════════════════════════════════════════════════════════

-- ── solicitudes de servicio ─────────────────────────────────────
create table if not exists public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- lo que rellena el cliente
  name        text not null,
  company     text,
  email       text not null,
  phone       text,
  occasion    text,
  event_date  date,
  guests      integer,
  venue       text,
  details     text,

  -- gestión interna
  status      text not null default 'new',
  notes       text,
  quote_total numeric(10,2),

  -- rastro
  source      text not null default 'web',
  user_agent  text
);

comment on table public.enquiries is
  'Solicitudes de catering que entran por el formulario de la web.';
comment on column public.enquiries.status is
  'new · quoted · confirmed · done · lost';

-- Solo estos estados, para que el panel no tenga que adivinar
alter table public.enquiries drop constraint if exists enquiries_status_check;
alter table public.enquiries add constraint enquiries_status_check
  check (status in ('new', 'quoted', 'confirmed', 'done', 'lost'));

create index if not exists enquiries_created_idx on public.enquiries (created_at desc);
create index if not exists enquiries_status_idx  on public.enquiries (status);
create index if not exists enquiries_date_idx    on public.enquiries (event_date);

-- ── fechas bloqueadas (disponibilidad) ──────────────────────────
-- Se usará en el panel para responder «esa fecha la tengo ocupada».
create table if not exists public.blocked_dates (
  day         date primary key,
  reason      text,
  enquiry_id  uuid references public.enquiries (id) on delete set null,
  created_at  timestamptz not null default now()
);

comment on table public.blocked_dates is
  'Días no disponibles: eventos confirmados, vacaciones, mantenimiento.';

-- ── updated_at automático ───────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

drop trigger if exists enquiries_touch on public.enquiries;
create trigger enquiries_touch
  before update on public.enquiries
  for each row execute function public.touch_updated_at();

-- ════════════════════════════════════════════════════════════════
-- SEGURIDAD Y ADMINISTRACIÓN
--
-- El formulario público solo inserta a través de la Edge Function.
-- El panel se limita a los dos correos propietarios y usuarios aprobados.
-- Las tablas de administración solo son accesibles por service_role.
-- ════════════════════════════════════════════════════════════════

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

alter table public.enquiries enable row level security;
alter table public.blocked_dates enable row level security;
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

create index if not exists blocked_dates_enquiry_idx on public.blocked_dates (enquiry_id);

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
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists enquiries_touch on public.enquiries;
create trigger enquiries_touch
  before update on public.enquiries
  for each row execute function public.touch_updated_at();

-- ════════════════════════════════════════════════════════════════
-- SEGURIDAD
--
-- Nadie entra directo desde el navegador. Las solicitudes las graba
-- la Edge Function, que usa la clave de servicio y se salta RLS.
-- El panel lee y actualiza solo si hay sesión iniciada.
-- ════════════════════════════════════════════════════════════════

alter table public.enquiries    enable row level security;
alter table public.blocked_dates enable row level security;

drop policy if exists "panel lee solicitudes"       on public.enquiries;
drop policy if exists "panel actualiza solicitudes" on public.enquiries;
drop policy if exists "panel gestiona fechas"       on public.blocked_dates;

create policy "panel lee solicitudes"
  on public.enquiries for select
  to authenticated using (true);

create policy "panel actualiza solicitudes"
  on public.enquiries for update
  to authenticated using (true) with check (true);

create policy "panel gestiona fechas"
  on public.blocked_dates for all
  to authenticated using (true) with check (true);

-- Sin política de insert para el público: el formulario NO escribe
-- directo en la tabla, pasa por la función. Así nadie puede llenarla
-- de basura con la clave pública.

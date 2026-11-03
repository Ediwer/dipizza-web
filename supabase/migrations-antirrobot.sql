-- ════════════════════════════════════════════════════════════════
-- CONTROL ANTIRROBOT DEL FORMULARIO
--
-- `enquiry_guard` cuenta intentos por IP para aplicar los limites.
-- La IP no se guarda: se guarda un HMAC truncado, que sirve para
-- contar pero no para identificar a nadie ni volver a la IP original.
--
-- `enquiry_nonces` convierte el reto firmado en un vale de un solo
-- uso, de modo que capturar una solicitud valida no permite repetirla.
--
-- Solo la Edge Function (service_role) las toca. El navegador no.
-- ════════════════════════════════════════════════════════════════

create table if not exists public.enquiry_guard (
  id         bigserial primary key,
  ip_hash    text not null,
  outcome    text not null,
  created_at timestamptz not null default now()
);

comment on table public.enquiry_guard is
  'Intentos de envio del formulario, por IP hasheada. Alimenta los limites de la Edge Function.';
comment on column public.enquiry_guard.outcome is
  'accepted · honeypot · challenge_failed · too_fast · replay · turnstile · rate_limited · abuse · global_limit · link_spam · duplicate · missing_fields · bad_request';

create index if not exists enquiry_guard_ip_idx on public.enquiry_guard (ip_hash, created_at desc);
create index if not exists enquiry_guard_recent_idx on public.enquiry_guard (created_at desc);

create table if not exists public.enquiry_nonces (
  jti     uuid primary key,
  used_at timestamptz not null default now()
);

comment on table public.enquiry_nonces is
  'Retos ya gastados. La clave primaria es lo que impide reutilizar uno.';

create index if not exists enquiry_nonces_used_idx on public.enquiry_nonces (used_at);

alter table public.enquiry_guard enable row level security;
alter table public.enquiry_nonces enable row level security;

revoke all on public.enquiry_guard, public.enquiry_nonces from anon, authenticated;
grant all on public.enquiry_guard, public.enquiry_nonces to service_role;
grant usage, select on sequence public.enquiry_guard_id_seq to service_role;
revoke all on sequence public.enquiry_guard_id_seq from anon, authenticated;

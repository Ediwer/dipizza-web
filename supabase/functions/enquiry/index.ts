// ════════════════════════════════════════════════════════════════
// DiPizza · recibe una solicitud del formulario y la reparte
//
//   GET  ?challenge=1  entrega un reto firmado que la pagina resuelve
//   POST               valida, guarda en `enquiries` y manda el correo
//
// El correo sale de aqui, no del navegador: el destinatario, el asunto
// y el acuse al cliente son constantes de este archivo. Antes se
// publicaba contra FormSubmit desde la pagina, donde cualquiera podia
// cambiar `_cc` o `_autoresponse` y usar el formulario para mandar
// correo a terceros.
// ════════════════════════════════════════════════════════════════

import { createClient } from "jsr:@supabase/supabase-js@2";

const ORIGINS = [
  "https://www.dipizzacatering.com",
  "https://dipizzacatering.com",
];

const TEAM_INBOX = "dipizza00@gmail.com";
const TEAM_CC = "ediwergraterol@gmail.com";
const PHONE = "(484) 954-7273";

// ── limites ─────────────────────────────────────────────────────
const PER_IP_HOUR = 3;        // solicitudes aceptadas por IP y hora
const PER_IP_DAY = 8;         // solicitudes aceptadas por IP y dia
const ATTEMPTS_HOUR = 30;     // intentos de cualquier tipo por IP y hora
const GLOBAL_HOUR = 40;       // tope global, protege la cuota de correo
const CHALLENGE_BITS = Number(Deno.env.get("CHALLENGE_BITS") ?? 14);
const MIN_AGE_MS = 3_000;     // un humano no rellena el formulario en 3 s
const MAX_AGE_MS = 20 * 60_000;
const MAX_LINKS = 2;          // mas enlaces que esto en texto libre es spam

const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && ORIGINS.includes(origin) ? origin : ORIGINS[0],
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Vary": "Origin",
});

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

type Payload = {
  name?: string; company?: string; email?: string; phone?: string;
  occasion?: string; date?: string; guests?: string | number;
  venue?: string; details?: string;
  website?: string;              // trampa para robots: debe llegar vacia
  challenge?: string; nonce?: string; turnstile?: string;
};

const clean = (v: unknown, max = 2000) =>
  typeof v === "string" ? v.trim().slice(0, max) || null : null;

// ── firma y reto ────────────────────────────────────────────────

const secretKey = () =>
  Deno.env.get("CHALLENGE_SECRET") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const hex = (buf: ArrayBuffer) =>
  [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");

async function hmac(message: string) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secretKey()),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  return hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message)));
}

async function sha256(text: string) {
  return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
}

// Comparacion en tiempo constante, para no filtrar la firma byte a byte.
function sameDigest(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function leadingZeroBits(digest: string) {
  let bits = 0;
  for (const ch of digest) {
    const nibble = parseInt(ch, 16);
    if (nibble === 0) { bits += 4; continue; }
    bits += Math.clz32(nibble) - 28;
    break;
  }
  return bits;
}

async function issueChallenge() {
  const jti = crypto.randomUUID();
  const iat = Date.now();
  const body = `${jti}.${iat}.${CHALLENGE_BITS}`;
  return { token: `${body}.${await hmac(body)}`, difficulty: CHALLENGE_BITS };
}

type ChallengeCheck = { ok: true; jti: string } | { ok: false; error: string };

async function checkChallenge(token: string | null, nonce: string | null): Promise<ChallengeCheck> {
  if (!token || !nonce) return { ok: false, error: "challenge_failed" };
  const parts = token.split(".");
  if (parts.length !== 4) return { ok: false, error: "challenge_failed" };

  const [jti, iatRaw, bitsRaw, signature] = parts;
  if (!sameDigest(signature, await hmac(`${jti}.${iatRaw}.${bitsRaw}`))) {
    return { ok: false, error: "challenge_failed" };
  }

  const age = Date.now() - Number(iatRaw);
  if (!Number.isFinite(age) || age > MAX_AGE_MS) return { ok: false, error: "challenge_failed" };
  if (age < MIN_AGE_MS) return { ok: false, error: "too_fast" };

  const bits = Number(bitsRaw);
  if (leadingZeroBits(await sha256(`${token}.${nonce}`)) < bits) {
    return { ok: false, error: "challenge_failed" };
  }
  return { ok: true, jti };
}

// ── Turnstile (solo si esta configurado) ────────────────────────

async function checkTurnstile(token: string | null, ip: string) {
  const secret = Deno.env.get("TURNSTILE_SECRET");
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
    });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error("turnstile error", err);
    return false;
  }
}

// ── avisos ──────────────────────────────────────────────────────

async function notifyTelegram(row: Record<string, unknown>) {
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chat = Deno.env.get("TELEGRAM_CHAT_ID");
  if (!token || !chat) return "sin configurar";

  const line = (label: string, value: unknown) => value ? `\n${label}: ${value}` : "";
  const text =
    `🍕 *Nueva solicitud*` +
    line("Nombre", row.name) + line("Empresa", row.company) +
    line("Correo", row.email) + line("Teléfono", row.phone) +
    line("Ocasión", row.occasion) + line("Fecha", row.event_date) +
    line("Comensales", row.guests) + line("Lugar", row.venue) +
    (row.details ? `\n\n_${row.details}_` : "");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chat, text, parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[
          { text: "✅ Disponible", callback_data: `ok:${row.id}` },
          { text: "❌ No puedo", callback_data: `no:${row.id}` },
        ]],
      },
    }),
  });
  return res.ok ? "enviado" : `error ${res.status}`;
}

/* El correo se construye aqui. El navegador no decide destinatario,
   asunto ni texto del acuse, asi que el formulario no sirve para
   mandar correo a nadie que no seamos nosotros y el propio cliente. */
async function sendMail(row: Record<string, unknown>) {
  const firstName = String(row.name ?? "there").trim().split(/\s+/)[0];
  const form = new URLSearchParams({
    name: String(row.name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    company: String(row.company ?? ""),
    occasion: String(row.occasion ?? ""),
    date: String(row.event_date ?? ""),
    guests: row.guests == null ? "" : String(row.guests),
    venue: String(row.venue ?? ""),
    details: String(row.details ?? ""),
    _subject: `Catering enquiry · ${row.name ?? "New customer"}`,
    _cc: TEAM_CC,
    _replyto: String(row.email ?? ""),
    _template: "table",
    _autoresponse:
      `Hi ${firstName}, thanks for contacting DiPizza. We have received your event ` +
      `enquiry and are reviewing your date, venue and event details. Our team will ` +
      `reply the same business day with availability and a tailored proposal. ` +
      `If it is urgent, call ${PHONE}. — DiPizza, wood-fired pizza catering`,
  });

  const res = await fetch(`https://formsubmit.co/ajax/${TEAM_INBOX}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
    body: form.toString(),
  });
  const text = await res.text();
  try {
    const reply = JSON.parse(text);
    if (res.ok && (reply.success === true || reply.success === "true")) return true;
  } catch {
    if (res.ok && /sent successfully/i.test(text)) return true;
  }
  console.error("FormSubmit no confirmo el envio", res.status, text.slice(0, 300));
  return false;
}

// ── servidor ────────────────────────────────────────────────────

Deno.serve(async (req) => {
  const head = cors(req.headers.get("origin"));
  const url = new URL(req.url);

  if (req.method === "OPTIONS") return new Response("ok", { headers: head });

  if (req.method === "GET") {
    if (!url.searchParams.has("challenge")) return json({ error: "not_found" }, 404, head);
    return json(await issueChallenge(), 200, head);
  }

  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, head);

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const ipHash = (await hmac("ip:" + ip)).slice(0, 32);

  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Cada intento queda registrado, aceptado o no. Los aceptados pesan
  // contra el limite normal; el total pesa contra el de abuso, que es el
  // que corta a quien este probando el reto a fuerza bruta.
  const logAttempt = (outcome: string) =>
    db.from("enquiry_guard").insert({ ip_hash: ipHash, outcome }).then(() => {}, () => {});

  const hourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const { count: attempts } = await db.from("enquiry_guard")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash).gte("created_at", hourAgo);
  if ((attempts ?? 0) >= ATTEMPTS_HOUR) {
    await logAttempt("abuse");
    return json({ error: "rate_limited" }, 429, head);
  }

  try {
    const body = (await req.json()) as Payload;

    // 1 · trampa para robots
    if (clean(body.website)) {
      await logAttempt("honeypot");
      return json({ ok: true, emailed: true }, 200, head);
    }

    // 2 · reto firmado, de un solo uso y con prueba de trabajo
    const challenge = await checkChallenge(clean(body.challenge, 300), clean(body.nonce, 40));
    if (!challenge.ok) {
      await logAttempt(challenge.error);
      return json({ error: challenge.error }, 403, head);
    }
    const { error: replay } = await db.from("enquiry_nonces").insert({ jti: challenge.jti });
    if (replay) {
      await logAttempt("replay");
      return json({ error: "challenge_failed" }, 403, head);
    }

    // 3 · Turnstile si hay secreto configurado
    if (!await checkTurnstile(clean(body.turnstile, 4000), ip)) {
      await logAttempt("turnstile");
      return json({ error: "turnstile_failed" }, 403, head);
    }

    // 4 · limites por IP y tope global
    const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
    const [perHour, perDay, global] = await Promise.all([
      db.from("enquiry_guard").select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash).eq("outcome", "accepted").gte("created_at", hourAgo),
      db.from("enquiry_guard").select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash).eq("outcome", "accepted").gte("created_at", dayAgo),
      db.from("enquiry_guard").select("id", { count: "exact", head: true })
        .eq("outcome", "accepted").gte("created_at", hourAgo),
    ]);
    if ((perHour.count ?? 0) >= PER_IP_HOUR || (perDay.count ?? 0) >= PER_IP_DAY) {
      await logAttempt("rate_limited");
      return json({ error: "rate_limited" }, 429, head);
    }
    if ((global.count ?? 0) >= GLOBAL_HOUR) {
      await logAttempt("global_limit");
      return json({ error: "busy" }, 429, head);
    }

    // 5 · campos obligatorios
    const name = clean(body.name, 160);
    const email = clean(body.email, 200);
    if (!name || !email || !/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) {
      await logAttempt("missing_fields");
      return json({ error: "missing_fields" }, 400, head);
    }

    const guests = Number(body.guests);
    const row = {
      name, email,
      company: clean(body.company, 160),
      phone: clean(body.phone, 60),
      occasion: clean(body.occasion, 80),
      event_date: clean(body.date, 20),
      guests: Number.isFinite(guests) && guests > 0 ? Math.round(guests) : null,
      venue: clean(body.venue, 240),
      details: clean(body.details, 4000),
      user_agent: clean(req.headers.get("user-agent"), 300),
    };

    // 6 · texto libre lleno de enlaces: spam de formulario de toda la vida
    const freeText = [row.details, row.venue, row.company].filter(Boolean).join(" ");
    const links = (freeText.match(/https?:\/\//gi) ?? []).length;
    if (links > MAX_LINKS || /\[url[=\]]|<a\s+href/i.test(freeText)) {
      await logAttempt("link_spam");
      return json({ ok: true, emailed: true }, 200, head);
    }

    // 7 · reenvio del mismo formulario: se acepta sin volver a avisar
    const tenMinutesAgo = new Date(Date.now() - 600_000).toISOString();
    const { data: twin } = await db.from("enquiries")
      .select("id").eq("email", email).eq("details", row.details)
      .gte("created_at", tenMinutesAgo).limit(1).maybeSingle();
    if (twin) {
      await logAttempt("duplicate");
      return json({ ok: true, emailed: true, id: twin.id }, 200, head);
    }

    // ── guardar y avisar ──────────────────────────────────────────
    const { data, error } = await db.from("enquiries").insert(row).select().single();
    if (error) console.error("insert falló:", error);
    await logAttempt("accepted");

    const [mail, telegram] = await Promise.all([
      sendMail(row).catch(err => { console.error("mail error", err); return false; }),
      data ? notifyTelegram({ ...row, id: data.id }).catch(() => "falló") : Promise.resolve("sin registro"),
    ]);

    console.log("solicitud procesada", data?.id ?? "sin registro",
      { saved: !error, emailed: mail, telegram });

    // Limpieza oportunista del rastro antirrobot, que no hace falta guardar.
    if (Math.random() < 0.05) {
      const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
      await Promise.all([
        db.from("enquiry_guard").delete().lt("created_at", weekAgo),
        db.from("enquiry_nonces").delete().lt("used_at", weekAgo),
      ]);
    }

    return json({ ok: true, id: data?.id ?? null, saved: !error, emailed: mail }, 200, head);
  } catch (err) {
    console.error("error inesperado:", err);
    await logAttempt("bad_request");
    return json({ error: "bad_request" }, 400, head);
  }
});

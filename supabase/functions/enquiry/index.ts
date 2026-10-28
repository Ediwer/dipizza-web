// ════════════════════════════════════════════════════════════════
// DiPizza · recibe una solicitud del formulario y la reparte
//
//   1. la guarda en la tabla `enquiries`
//   2. avisa por Telegram
//   3. manda correo al equipo y acuse de recibo al cliente
//
// Las claves viven aquí como variables de entorno, nunca en la web.
// Si Telegram o el correo no están configurados, se los salta: lo que
// no puede fallar es el paso 1.
// ════════════════════════════════════════════════════════════════

import { createClient } from "jsr:@supabase/supabase-js@2";

const ORIGINS = [
  "https://ediwer.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
];

const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && ORIGINS.includes(origin) ? origin : ORIGINS[0],
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});

const TEAM_INBOX = Deno.env.get("TEAM_INBOX") ?? "dipizza00@gmail.com";
const FROM = Deno.env.get("MAIL_FROM") ?? "DiPizza <onboarding@resend.dev>";

type Payload = {
  name?: string; company?: string; email?: string; phone?: string;
  occasion?: string; date?: string; guests?: string | number;
  venue?: string; details?: string;
  website?: string;            // trampa para robots: debe llegar vacío
};

const clean = (v: unknown, max = 2000) =>
  typeof v === "string" ? v.trim().slice(0, max) || null : null;

// ── avisos ──────────────────────────────────────────────────────

async function notifyTelegram(row: Record<string, unknown>) {
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chat = Deno.env.get("TELEGRAM_CHAT_ID");
  if (!token || !chat) return "sin configurar";

  const line = (label: string, value: unknown) =>
    value ? `\n${label}: ${value}` : "";

  const text =
    `🍕 *Nueva solicitud*` +
    line("Nombre", row.name) +
    line("Empresa", row.company) +
    line("Correo", row.email) +
    line("Teléfono", row.phone) +
    line("Ocasión", row.occasion) +
    line("Fecha", row.event_date) +
    line("Comensales", row.guests) +
    line("Lugar", row.venue) +
    (row.details ? `\n\n_${row.details}_` : "");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chat,
      text,
      parse_mode: "Markdown",
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

async function sendMail(to: string, subject: string, text: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return "sin configurar";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, text }),
  });
  return res.ok ? "enviado" : `error ${res.status}`;
}

const ACK = (first: string) =>
  `Thanks for getting in touch with DiPizza, ${first}.

We've got your enquiry and we're looking at it right now - your date, the venue and the pizzas you're after. You'll hear back from us the same business day with availability and the total.

If it's urgent, call us on (484) 954-7273.

- DiPizza, wood-fired pizza catering`;

// ── servidor ────────────────────────────────────────────────────

Deno.serve(async (req) => {
  const head = cors(req.headers.get("origin"));

  if (req.method === "OPTIONS") return new Response("ok", { headers: head });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405, headers: { ...head, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as Payload;

    // trampa para robots: un campo oculto que una persona nunca rellena
    if (clean(body.website)) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { ...head, "Content-Type": "application/json" },
      });
    }

    const name = clean(body.name, 160);
    const email = clean(body.email, 200);
    if (!name || !email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "missing_fields" }), {
        status: 400, headers: { ...head, "Content-Type": "application/json" },
      });
    }

    const guests = Number(body.guests);
    const row = {
      name,
      email,
      company: clean(body.company, 160),
      phone: clean(body.phone, 60),
      occasion: clean(body.occasion, 80),
      event_date: clean(body.date, 20),
      guests: Number.isFinite(guests) && guests > 0 ? Math.round(guests) : null,
      venue: clean(body.venue, 240),
      details: clean(body.details, 4000),
      user_agent: clean(req.headers.get("user-agent"), 300),
    };

    // 1 · guardar. Este paso es el que no puede fallar.
    const db = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data, error } = await db
      .from("enquiries").insert(row).select().single();

    if (error) {
      console.error("insert falló:", error);
      return new Response(JSON.stringify({ error: "db_error" }), {
        status: 500, headers: { ...head, "Content-Type": "application/json" },
      });
    }

    // 2 y 3 · avisos. Si alguno falla, la solicitud ya está a salvo.
    const summary = Object.entries(row)
      .filter(([k, v]) => v && k !== "user_agent")
      .map(([k, v]) => `${k.padEnd(11)} ${v}`).join("\n");

    const [telegram, teamMail, ackMail] = await Promise.allSettled([
      notifyTelegram({ ...row, id: data.id }),
      sendMail(TEAM_INBOX, `Nueva solicitud · ${name}`, summary),
      sendMail(email, "We've got your enquiry — DiPizza", ACK(name.split(" ")[0])),
    ]);

    const outcome = (r: PromiseSettledResult<string>) =>
      r.status === "fulfilled" ? r.value : "falló";

    console.log("solicitud", data.id, {
      telegram: outcome(telegram),
      correoEquipo: outcome(teamMail),
      acuseCliente: outcome(ackMail),
    });

    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      status: 200, headers: { ...head, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("error inesperado:", err);
    return new Response(JSON.stringify({ error: "bad_request" }), {
      status: 400, headers: { ...head, "Content-Type": "application/json" },
    });
  }
});

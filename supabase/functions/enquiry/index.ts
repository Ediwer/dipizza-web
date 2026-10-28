// ════════════════════════════════════════════════════════════════
// DiPizza · recibe una solicitud del formulario y la reparte
//
//   1. la guarda en la tabla `enquiries`
//   2. manda el detalle a los dos buzones de DiPizza con Resend
//   3. confirma al cliente que su solicitud se esta procesando
//   4. avisa por Telegram si esta configurado.
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

type Payload = {
  name?: string; company?: string; email?: string; phone?: string;
  occasion?: string; date?: string; guests?: string | number;
  venue?: string; details?: string;
  website?: string;            // trampa para robots: debe llegar vacío
};

const clean = (v: unknown, max = 2000) =>
  typeof v === "string" ? v.trim().slice(0, max) || null : null;

const TEAM_INBOX = ["dipizza00@gmail.com", "ediwergraterol@gmail.com"];

async function sendMail(
  to: string | string[],
  subject: string,
  text: string,
  replyTo?: string,
) {
  const key = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("MAIL_FROM");
  if (!key || !from) return { sent: false, reason: "not_configured" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        subject,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!res.ok) {
      console.error("Resend send failed", res.status, (await res.text()).slice(0, 240));
      return { sent: false, reason: `resend_${res.status}` };
    }
    const result = await res.json().catch(() => ({}));
    return { sent: true, id: result.id ?? null };
  } catch (error) {
    console.error("Resend request failed", error);
    return { sent: false, reason: "network_error" };
  }
}

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

    // 1 · guardar la solicitud; los correos se intentan aunque el guardado falle.
    const db = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data, error } = await db
      .from("enquiries").insert(row).select().single();
    if (error) console.error("insert falló:", error);

    const firstName = name.split(/\s+/)[0];
    const line = (label: string, value: unknown) => value ? `${label}: ${value}` : null;
    const teamText = [
      "New DiPizza event enquiry",
      "",
      line("Name", row.name),
      line("Company", row.company),
      line("Customer email", row.email),
      line("Phone", row.phone),
      line("Occasion", row.occasion),
      line("Preferred date", row.event_date),
      line("Guests", row.guests),
      line("Venue", row.venue),
      line("Details", row.details),
      line("Supabase record", data?.id),
    ].filter(Boolean).join("\n");
    const customerText = `Hi ${firstName},

Thanks for contacting DiPizza. We have received your event enquiry and are reviewing your date, venue and event details now. Our team will reply the same business day with availability and a tailored proposal.

If it is urgent, call us on (484) 954-7273.

DiPizza — wood-fired pizza catering`;

    const [teamMail, customerAck, telegram] = await Promise.all([
      sendMail(TEAM_INBOX, `New DiPizza event enquiry · ${name}`, teamText, email),
      sendMail(email, "We're processing your DiPizza enquiry", customerText),
      data ? notifyTelegram({ ...row, id: data.id }).catch(() => "falló") : Promise.resolve("sin registro"),
    ]);
    console.log("solicitud procesada", data?.id ?? "sin registro", {
      saved: !error,
      teamEmail: teamMail.sent,
      customerAck: customerAck.sent,
      telegram,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        id: data?.id ?? null,
        saved: !error,
        emails: { team: teamMail.sent, customer: customerAck.sent },
      }),
      { status: 200, headers: { ...head, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("error inesperado:", err);
    return new Response(JSON.stringify({ error: "bad_request" }), {
      status: 400, headers: { ...head, "Content-Type": "application/json" },
    });
  }
});

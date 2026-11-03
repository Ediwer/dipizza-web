import { createClient } from "jsr:@supabase/supabase-js@2";

const ORIGINS = ["https://dipizzacatering.com",
  "https://www.dipizzacatering.com",
  "https://ediwer.github.io", "http://localhost:3000", "http://127.0.0.1:5500"];
const BOOTSTRAP_ADMINS = new Set(["dipizza00@gmail.com", "ediwergraterol@gmail.com"]);
const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && ORIGINS.includes(origin) ? origin : ORIGINS[0],
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});
const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  const head = cors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers: head });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, head);

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!jwt || jwt === authHeader) return json({ error: "unauthorized" }, 401, head);

    const body = await req.json();
    const action = body?.action;
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY") || req.headers.get("apikey") || "";
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authClient = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: authData, error: authError } = await authClient.auth.getUser(jwt);
    const user = authData.user;
    if (authError || !user?.email) return json({ error: "unauthorized" }, 401, head);

    const email = user.email.trim().toLowerCase();
    if (!user.email_confirmed_at) return json({ error: "email_not_verified" }, 403, head);

    const db = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
    const isAdmin = async () => {
      if (BOOTSTRAP_ADMINS.has(email)) return true;
      const { data, error } = await db.from("admin_users").select("user_id")
        .eq("user_id", user.id).eq("is_active", true).maybeSingle();
      if (error) throw error;
      return Boolean(data);
    };

    if (action === "request_access") {
      if (await isAdmin()) {
        const { error } = await db.from("admin_users").upsert(
          { user_id: user.id, email, is_active: true, approved_by_email: email, approved_at: new Date().toISOString() },
          { onConflict: "user_id" },
        );
        if (error) throw error;
        return json({ ok: true, state: "approved" }, 200, head);
      }

      const { data: existing, error: lookupError } = await db.from("admin_access_requests")
        .select("id,status").eq("user_id", user.id).eq("status", "pending").maybeSingle();
      if (lookupError) throw lookupError;
      if (existing) return json({ ok: true, state: "pending", requestId: existing.id, notificationSent: null }, 200, head);

      const { data, error } = await db.from("admin_access_requests")
        .insert({ user_id: user.id, email, status: "pending" })
        .select("id").single();
      if (error) throw error;

      let notificationSent = false;
      try {
        const form = new URLSearchParams({
          name: "DiPizza · solicitud de acceso administrador",
          email,
          request: String(data.id),
          review: "Solicitudes: https://dipizzacatering.com/admin.html#approvals. Inicia sesión con uno de los correos propietarios para aprobar o rechazar.",
          _subject: "Aprobación de nuevo usuario administrador · DiPizza",
          _cc: "ediwergraterol@gmail.com",
          _template: "table",
        });
        const mail = await fetch("https://formsubmit.co/ajax/dipizza00@gmail.com", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
          body: form.toString(),
        });
        const replyText = await mail.text();
        try {
          const reply = JSON.parse(replyText);
          notificationSent = mail.ok && (reply.success === true || reply.success === "true");
        } catch {
          notificationSent = mail.ok && /sent successfully/i.test(replyText);
        }
        if (!notificationSent) console.error("FormSubmit admin notification was not confirmed", mail.status);
      } catch (err) {
        console.error("FormSubmit admin notification error", err);
      }
      return json({ ok: true, state: "pending", requestId: data.id, notificationSent }, 200, head);
    }

    if (action === "list_requests") {
      if (!BOOTSTRAP_ADMINS.has(email)) return json({ error: "forbidden" }, 403, head);
      const { data, error } = await db.from("admin_access_requests")
        .select("id,email,status,requested_at,reviewed_at,reviewed_by_email")
        .order("requested_at", { ascending: false }).limit(100);
      if (error) throw error;
      return json({ ok: true, requests: data || [] }, 200, head);
    }

    if (action === "review_request") {
      if (!BOOTSTRAP_ADMINS.has(email)) return json({ error: "forbidden" }, 403, head);
      const requestId = typeof body.requestId === "string" ? body.requestId : "";
      const decision = body.decision;
      if (!requestId || !["approve", "reject"].includes(decision)) {
        return json({ error: "invalid_request" }, 400, head);
      }
      const { data: pending, error: readError } = await db.from("admin_access_requests")
        .select("id,user_id,email,status").eq("id", requestId).eq("status", "pending").maybeSingle();
      if (readError) throw readError;
      if (!pending) return json({ error: "request_not_pending" }, 404, head);

      if (decision === "approve") {
        const { error } = await db.from("admin_users").upsert(
          { user_id: pending.user_id, email: pending.email, is_active: true, approved_by_email: email, approved_at: new Date().toISOString() },
          { onConflict: "user_id" },
        );
        if (error) throw error;
      }
      const { error: updateError } = await db.from("admin_access_requests")
        .update({ status: decision === "approve" ? "approved" : "rejected", reviewed_at: new Date().toISOString(), reviewed_by_email: email })
        .eq("id", requestId).eq("status", "pending");
      if (updateError) throw updateError;
      return json({ ok: true }, 200, head);
    }

    return json({ error: "unknown_action" }, 400, head);
  } catch (err) {
    console.error("admin-access error", err);
    return json({ error: "internal_error" }, 500, cors(req.headers.get("origin")));
  }
});

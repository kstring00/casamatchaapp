import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password"
};

type Audience = { scope?: "all" | "location" | "topic"; locationId?: "friendswood" | "webster"; topic?: "events" | "seasonal" | "rewards" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.headers.get("x-admin-password") !== Deno.env.get("ADMIN_PASSWORD")) return json({ error: "Unauthorized" }, 401);

  try {
    const body = await req.json();
    const title = String(body.title ?? "").trim();
    const message = String(body.body ?? "").trim();
    const route = body.route ? String(body.route) : undefined;
    const audience = (body.audience ?? { scope: "all" }) as Audience;
    if (!title || !message) return json({ error: "title and body are required" }, 400);

    const service = adminClient();
    if (body.scheduledAt && new Date(body.scheduledAt).getTime() > Date.now() + 30_000) {
      const { error } = await service.from("scheduled_pushes").insert({
        title,
        body: message,
        route,
        audience,
        scheduled_at: body.scheduledAt
      });
      if (error) throw error;
      return json({ ok: true, scheduled: true });
    }

    const sent = await deliver(service, { title, body: message, route, audience });
    return json({ ok: true, scheduled: false, sent });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

async function deliver(service: ReturnType<typeof adminClient>, push: { title: string; body: string; route?: string; audience: Audience }) {
  const { data, error } = await service.from("push_tokens").select("expo_push_token,location_id,topics,location_opt_ins");
  if (error) throw error;
  const recipients = (data ?? []).filter((row) => matches(row, push.audience));
  if (!recipients.length) return 0;

  const payload = recipients.map((row) => ({
    to: row.expo_push_token,
    sound: "default",
    title: push.title,
    body: push.body,
    data: push.route ? { route: push.route } : {}
  }));

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("Expo Push API returned " + response.status);
  return recipients.length;
}

function matches(row: any, audience: Audience) {
  if (!audience.scope || audience.scope === "all") return true;
  if (audience.scope === "location") {
    const id = audience.locationId;
    return id ? row.location_opt_ins?.[id] === true : false;
  }
  if (audience.scope === "topic") {
    const topic = audience.topic;
    return topic ? row.topics?.[topic] === true : false;
  }
  return false;
}

function adminClient() {
  return createClient(mustEnv("SUPABASE_URL"), mustEnv("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
}
function mustEnv(key: string) {
  const value = Deno.env.get(key);
  if (!value) throw new Error("Missing " + key);
  return value;
}
function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password"
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.headers.get("x-admin-password") !== Deno.env.get("ADMIN_PASSWORD")) return json({ error: "Unauthorized" }, 401);

  try {
    const service = createClient(mustEnv("SUPABASE_URL"), mustEnv("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
    if (req.method === "GET") {
      const [{ data: events }, { data: seasonal }] = await Promise.all([
        service.from("events").select("*").order("updated_at", { ascending: false }),
        service.from("seasonal_features").select("*").eq("id", "current").maybeSingle()
      ]);
      return json({ events: events ?? [], seasonal: seasonal ?? null });
    }

    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
    const body = await req.json();
    if (body.type === "event") {
      const payload = body.payload ?? {};
      const id = String(payload.id ?? crypto.randomUUID());
      const { error } = await service.from("events").upsert({ id, payload, published: body.published !== false, updated_at: new Date().toISOString() });
      if (error) throw error;
      return json({ ok: true, id });
    }
    if (body.type === "seasonal") {
      const { error } = await service.from("seasonal_features").upsert({ id: "current", payload: body.payload ?? {}, published: body.published !== false, updated_at: new Date().toISOString() });
      if (error) throw error;
      return json({ ok: true, id: "current" });
    }
    return json({ error: "Unknown content type" }, 400);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

function mustEnv(key: string) {
  const value = Deno.env.get(key);
  if (!value) throw new Error("Missing " + key);
  return value;
}
function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

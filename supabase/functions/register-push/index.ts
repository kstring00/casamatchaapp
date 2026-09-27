import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const token = String(body.token ?? "");
    if (!/^(Expo|Exponent)PushToken\[[^\]]+\]$/.test(token)) {
      return json({ error: "Invalid Expo push token" }, 400);
    }

    const service = createClient(
      mustEnv("SUPABASE_URL"),
      mustEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false } }
    );

    const { error } = await service.from("push_tokens").upsert(
      {
        expo_push_token: token,
        platform: body.platform,
        location_id: body.locationId,
        topics: body.topics ?? {},
        location_opt_ins: body.locationOptIns ?? {},
        updated_at: new Date().toISOString()
      },
      { onConflict: "expo_push_token" }
    );
    if (error) throw error;
    return json({ ok: true });
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

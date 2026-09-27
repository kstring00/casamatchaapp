import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.headers.get("authorization") !== "Bearer " + Deno.env.get("CRON_SECRET")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const service = createClient(
    mustEnv("SUPABASE_URL"),
    mustEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );
  const { data: jobs, error } = await service
    .from("scheduled_pushes")
    .select("*")
    .is("sent_at", null)
    .lte("scheduled_at", new Date().toISOString())
    .order("scheduled_at")
    .limit(25);
  if (error) throw error;

  let sentJobs = 0;
  for (const job of jobs ?? []) {
    const { data: tokens } = await service.from("push_tokens").select("expo_push_token,location_id,topics,location_opt_ins");
    const recipients = (tokens ?? []).filter((row: any) => matches(row, job.audience ?? { scope: "all" }));
    if (recipients.length) {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(recipients.map((row: any) => ({
          to: row.expo_push_token,
          sound: "default",
          title: job.title,
          body: job.body,
          data: job.route ? { route: job.route } : {}
        })))
      });
      if (!response.ok) continue;
    }
    await service.from("scheduled_pushes").update({ sent_at: new Date().toISOString() }).eq("id", job.id);
    sentJobs += 1;
  }
  return new Response(JSON.stringify({ ok: true, sentJobs }), { headers: { "Content-Type": "application/json" } });
});

function matches(row: any, audience: any) {
  if (!audience.scope || audience.scope === "all") return true;
  if (audience.scope === "location") return !!audience.locationId && row.location_opt_ins?.[audience.locationId] === true;
  if (audience.scope === "topic") return !!audience.topic && row.topics?.[audience.topic] === true;
  return false;
}
function mustEnv(key: string) {
  const value = Deno.env.get(key);
  if (!value) throw new Error("Missing " + key);
  return value;
}

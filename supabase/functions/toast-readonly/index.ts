import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

let accessToken = "";
let tokenExpiresAt = 0;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || url.pathname.split("/").filter(Boolean).at(-1) || "";
    if (action === "locations") return json(await getLocations());
    if (action === "menu") {
      const locationId = url.searchParams.get("locationId");
      if (locationId !== "friendswood" && locationId !== "webster") return json({ error: "Invalid locationId" }, 400);
      return json(await getMenu(locationId));
    }
    if (action === "rewards") {
      // Phase 2 never creates a competing points ledger. If Toast Loyalty is enabled,
      // the app links to Toast's guest loyalty surface instead.
      return json({
        points: 0,
        freeDrinkAt: 1,
        recentOrders: [],
        externalLoyaltyUrl: Deno.env.get("TOAST_LOYALTY_URL") || undefined
      });
    }
    return json({ error: "Unknown action" }, 404);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

async function toastFetch(path: string, restaurantGuid?: string) {
  const response = await fetch(mustEnv("TOAST_API_HOSTNAME").replace(/\/$/, "") + path, {
    headers: {
      Authorization: "Bearer " + await getToken(),
      "Content-Type": "application/json",
      ...(restaurantGuid ? { "Toast-Restaurant-External-ID": restaurantGuid } : {})
    }
  });
  if (!response.ok) throw new Error("Toast Standard API returned " + response.status + " for " + path);
  return response.json();
}

async function getToken() {
  if (accessToken && Date.now() < tokenExpiresAt - 60_000) return accessToken;
  const response = await fetch(mustEnv("TOAST_API_HOSTNAME").replace(/\/$/, "") + "/authentication/v1/authentication/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: mustEnv("TOAST_CLIENT_ID"),
      clientSecret: mustEnv("TOAST_CLIENT_SECRET"),
      userAccessType: "TOAST_MACHINE_CLIENT"
    })
  });
  if (!response.ok) throw new Error("Toast authentication failed (" + response.status + ")");
  const value = await response.json();
  accessToken = value?.token?.accessToken ?? value?.accessToken;
  if (!accessToken) throw new Error("Toast authentication response did not include an access token");
  const expiresIn = Number(value?.token?.expiresIn ?? value?.expiresIn ?? 3600);
  tokenExpiresAt = Date.now() + expiresIn * 1000;
  return accessToken;
}

function locationGuid(locationId: "friendswood" | "webster") {
  return mustEnv(locationId === "friendswood" ? "TOAST_FRIENDSWOOD_GUID" : "TOAST_WEBSTER_GUID");
}

async function getLocations() {
  return Promise.all((["friendswood", "webster"] as const).map(async (locationId) => {
    const guid = locationGuid(locationId);
    const raw = await toastFetch("/restaurants/v1/restaurants/" + encodeURIComponent(guid), guid);
    const address = raw?.location?.address ?? raw?.address ?? {};
    const urls = raw?.urls ?? raw?.general?.urls ?? {};
    return {
      id: locationId,
      name: raw?.restaurantName ?? raw?.general?.name ?? (locationId === "friendswood" ? "Friendswood" : "Webster"),
      address1: address.address1 ?? address.line1 ?? "",
      city: address.city ?? "",
      state: address.stateCode ?? address.state ?? "TX",
      zip: address.zipCode ?? address.zip ?? "",
      phone: raw?.location?.phone ?? raw?.phone ?? "",
      hoursSummary: "See current Toast ordering hours",
      latitude: Number(raw?.location?.latitude ?? raw?.latitude ?? 0),
      longitude: Number(raw?.location?.longitude ?? raw?.longitude ?? 0),
      orderUrl: Deno.env.get(locationId === "friendswood" ? "TOAST_FRIENDSWOOD_ORDER_URL" : "TOAST_WEBSTER_ORDER_URL") || urls.orderOnline || "",
      loyaltyUrl: Deno.env.get("TOAST_LOYALTY_URL") || undefined
    };
  }));
}

async function getMenu(locationId: "friendswood" | "webster") {
  const guid = locationGuid(locationId);
  const service = adminClient();
  const cacheKey = "toast-menu:" + locationId;
  const { data: cached } = await service.from("toast_cache").select("payload,expires_at").eq("cache_key", cacheKey).maybeSingle();
  if (cached && new Date(cached.expires_at).getTime() > Date.now()) return cached.payload;

  const raw = await toastFetch("/menus/v2/menus", guid);
  const mapped = mapMenus(raw, locationId);
  await service.from("toast_cache").upsert({
    cache_key: cacheKey,
    payload: mapped,
    expires_at: new Date(Date.now() + 5 * 60_000).toISOString(),
    updated_at: new Date().toISOString()
  });
  return mapped;
}

function mapMenus(raw: any, locationId: "friendswood" | "webster") {
  const menus = Array.isArray(raw) ? raw : raw?.menus ?? [];
  const items: any[] = [];
  for (const menu of menus) {
    const groups = menu?.menuGroups ?? menu?.groups ?? [];
    for (const group of groups) {
      const groupName = String(group?.name ?? menu?.name ?? "");
      const groupItems = group?.menuItems ?? group?.items ?? [];
      for (const item of groupItems) {
        if (item?.visibility === "HIDDEN") continue;
        const image = typeof item?.image === "string"
          ? item.image
          : item?.image?.url ?? item?.images?.[0]?.url ?? item?.images?.[0] ?? "";
        items.push({
          id: String(item?.guid ?? item?.id ?? crypto.randomUUID()),
          locationIds: [locationId],
          category: categoryFrom(groupName + " " + String(item?.name ?? "")),
          name: String(item?.name ?? "Menu item"),
          descriptor: String(item?.description ?? groupName ?? ""),
          price: Number(item?.price ?? item?.basePrice ?? 0),
          image,
          modifiers: []
        });
      }
    }
  }
  return items;
}

function categoryFrom(value: string) {
  const text = value.toLowerCase();
  if (/concha|bakery|pastry|pan dulce|cookie|food/.test(text)) return "Bakery";
  if (/season|pumpkin|special|limited/.test(text)) return "Seasonal";
  if (/coffee|espresso|cold brew|latte/.test(text) && !/matcha/.test(text)) return "Coffee";
  return "Matcha";
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

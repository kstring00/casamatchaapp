import { featuredEvent as mockEvent, seasonalFeature as mockSeasonal } from "@/data/mock";
import { supabase } from "@/lib/supabase";

export type SeasonalContent = {
  eyebrow: string;
  title: string;
  caption: string;
  image: string;
};

export type EventContent = {
  id: string;
  title: string;
  dateLabel: string;
  date?: string;
  locationId: "friendswood" | "webster";
  ticketUrl: string;
  image: string;
};

export async function getSeasonalFeature(): Promise<SeasonalContent> {
  if (!supabase) return mockSeasonal;
  const { data, error } = await supabase
    .from("seasonal_features")
    .select("payload")
    .eq("id", "current")
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  const payload = (data?.payload ?? {}) as Record<string, unknown>;
  return {
    eyebrow: stringValue(payload.eyebrow, mockSeasonal.eyebrow),
    title: stringValue(payload.title, mockSeasonal.title),
    caption: stringValue(payload.caption, mockSeasonal.caption),
    image: stringValue(payload.image, mockSeasonal.image)
  };
}

export async function getFeaturedEvent(): Promise<EventContent> {
  if (!supabase) return mockEvent;
  const { data, error } = await supabase
    .from("events")
    .select("id,payload,updated_at")
    .eq("published", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return mockEvent;
  const payload = (data.payload ?? {}) as Record<string, unknown>;
  const locationId = payload.locationId === "friendswood" ? "friendswood" : payload.locationId === "webster" ? "webster" : mockEvent.locationId;
  const date = typeof payload.date === "string" ? payload.date : undefined;
  return {
    id: String(data.id ?? mockEvent.id),
    title: stringValue(payload.title, mockEvent.title),
    date,
    dateLabel: stringValue(payload.dateLabel, date ? formatEventDate(date) : mockEvent.dateLabel),
    locationId,
    ticketUrl: stringValue(payload.ticketUrl, mockEvent.ticketUrl),
    image: stringValue(payload.image, mockEvent.image)
  };
}

export async function getLocationContent() {
  if (!supabase) return [];
  const { data, error } = await supabase.from("location_content").select("id,payload");
  if (error) throw error;
  return data ?? [];
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function formatEventDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return mockEvent.dateLabel;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

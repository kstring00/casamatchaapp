import Constants from "expo-constants";
import type { CommerceProvider, LocationId } from "@/types/commerce";
import { locations } from "@/data/mock";

const extra = Constants.expoConfig?.extra as
  | { supabaseUrl?: string; supabaseAnonKey?: string }
  | undefined;

const functionBase = extra?.supabaseUrl ? extra.supabaseUrl + "/functions/v1" : "";
const anonKey = extra?.supabaseAnonKey ?? "";

async function edge<T>(action: string, params: Record<string, string> = {}): Promise<T> {
  if (!functionBase) throw new Error("Supabase is not configured.");
  const query = new URLSearchParams({ action, ...params }).toString();
  const response = await fetch(functionBase + "/toast-readonly?" + query, {
    headers: {
      Authorization: "Bearer " + anonKey,
      apikey: anonKey
    }
  });
  if (!response.ok) throw new Error("Toast read-only edge function failed (" + response.status + ").");
  return response.json() as Promise<T>;
}

export const ToastReadOnlyProvider: CommerceProvider = {
  async getLocations() {
    return edge("locations");
  },
  async getMenu(locationId: LocationId) {
    return edge("menu", { locationId });
  },
  async getOrderHandoffUrl(locationId: LocationId) {
    // Phase 2 ordering remains a Toast Online Ordering handoff.
    // The in-app cart is demo-only until Phase 3.
    const remoteLocations = await edge<typeof locations>("locations").catch(() => locations);
    const location = remoteLocations.find((candidate) => candidate.id === locationId);
    if (!location?.orderUrl) throw new Error("Toast Online Ordering URL is not configured for this location.");
    return location.orderUrl;
  },
  async getRewards() {
    // No duplicate points ledger. Link to Toast Loyalty if the client uses it.
    return edge("rewards");
  },
  async placeOrder() {
    // Phase 3 only: native ordering requires Toast Partner API approval and write access.
    throw new Error("NotImplemented: native ordering is Phase 3.");
  }
};

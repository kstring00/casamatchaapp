import Constants from "expo-constants";
import type { CommerceProvider, LocationId } from "@/types/commerce";
import { locations } from "@/data/mock";

const extra = Constants.expoConfig?.extra as
  | { supabaseUrl?: string; supabaseAnonKey?: string }
  | undefined;

const functionBase = extra?.supabaseUrl ? `${extra.supabaseUrl}/functions/v1` : "";
const anonKey = extra?.supabaseAnonKey ?? "";

async function edge<T>(path: string): Promise<T> {
  if (!functionBase) throw new Error("Supabase is not configured.");
  const response = await fetch(`${functionBase}/toast-readonly${path}`, {
    headers: {
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey
    }
  });
  if (!response.ok) throw new Error(`Toast read-only edge function failed (${response.status}).`);
  return response.json() as Promise<T>;
}

export const ToastReadOnlyProvider: CommerceProvider = {
  async getLocations() {
    return edge("/locations");
  },
  async getMenu(locationId: LocationId) {
    return edge(`/menu?locationId=${encodeURIComponent(locationId)}`);
  },
  async getOrderHandoffUrl(locationId: LocationId) {
    // Phase 2 ordering handoff remains Toast Online Ordering. The in-app cart is demo-only until Phase 3.
    const location = locations.find((candidate) => candidate.id === locationId);
    if (!location) throw new Error("Location not found");
    return location.orderUrl;
  },
  async getRewards() {
    // Do not maintain a second points ledger. In Phase 2, link to Toast Loyalty if Casa Matcha uses it.
    return edge("/rewards");
  },
  async placeOrder() {
    // Phase 3 only: requires Toast Partner API approval and order write scopes.
    throw new Error("NotImplemented: native ordering is Phase 3.");
  }
};

import { locations, menuItems, rewardSummary } from "@/data/mock";
import type { CommerceProvider, LocationId } from "@/types/commerce";

export const MockProvider: CommerceProvider = {
  async getLocations() {
    return locations;
  },
  async getMenu(locationId: LocationId) {
    return menuItems.filter((item) => item.locationIds.includes(locationId));
  },
  async getOrderHandoffUrl(locationId: LocationId) {
    const location = locations.find((candidate) => candidate.id === locationId);
    if (!location) throw new Error("Location not found");
    return location.orderUrl;
  },
  async getRewards() {
    return rewardSummary;
  },
  async placeOrder() {
    // Phase 3 only: native Toast ordering requires the appropriate Toast Partner API approval.
    throw new Error("NotImplemented: native ordering is Phase 3.");
  }
};

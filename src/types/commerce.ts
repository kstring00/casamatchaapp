export type LocationId = "friendswood" | "webster";
export type MenuCategory = "Matcha" | "Coffee" | "Bakery" | "Seasonal";

export type CafeLocation = {
  id: LocationId;
  name: string;
  address1: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  hoursSummary: string;
  latitude: number;
  longitude: number;
  orderUrl: string;
  loyaltyUrl?: string;
};

export type ModifierOption = { id: string; label: string; priceDelta?: number };
export type ModifierGroup = {
  id: string;
  label: string;
  required?: boolean;
  options: ModifierOption[];
};

export type MenuItem = {
  id: string;
  locationIds: LocationId[];
  category: MenuCategory;
  name: string;
  descriptor: string;
  price: number;
  image: string;
  modifiers: ModifierGroup[];
};

export type RewardSummary = {
  points: number;
  freeDrinkAt: number;
  recentOrders: { id: string; itemIds: string[]; locationId: LocationId; label: string }[];
  externalLoyaltyUrl?: string;
};

export type CartLine = {
  itemId: string;
  quantity: number;
  modifiers?: Record<string, string>;
};

export interface CommerceProvider {
  getLocations(): Promise<CafeLocation[]>;
  getMenu(locationId: LocationId): Promise<MenuItem[]>;
  getOrderHandoffUrl(locationId: LocationId): Promise<string>;
  getRewards(userId: string): Promise<RewardSummary>;
  placeOrder(cart: CartLine[]): Promise<never>;
}

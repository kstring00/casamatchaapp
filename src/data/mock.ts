import type { CafeLocation, MenuItem, RewardSummary } from "@/types/commerce";

const asset = (path: string) => `https://casa-matcha.vercel.app${path}`;

export const locations: CafeLocation[] = [
  {
    id: "friendswood",
    name: "Friendswood",
    address1: "1616 S Friendswood Dr", // VERIFY
    city: "Friendswood", // VERIFY
    state: "TX", // VERIFY
    zip: "77546", // VERIFY
    phone: "(281) 993-4437", // VERIFY
    hoursSummary: "Mon–Fri 8am–6pm · Sat 8am–2pm · Sun closed", // VERIFY
    latitude: 29.5141, // VERIFY
    longitude: -95.1893, // VERIFY
    orderUrl: "https://www.toasttab.com/", // VERIFY: replace with Friendswood Toast Online Ordering URL
    loyaltyUrl: "https://www.toasttab.com/" // VERIFY: replace if Toast Loyalty is active
  },
  {
    id: "webster",
    name: "Webster",
    address1: "1199 E NASA Pkwy", // VERIFY
    city: "Webster", // VERIFY
    state: "TX", // VERIFY
    zip: "77058", // VERIFY
    phone: "(832) 379-4041", // VERIFY
    hoursSummary: "Mon–Tue 8am–6pm · Wed 8am–4pm · Thu–Fri 8am–6pm · Sat 8am–2pm · Sun closed", // VERIFY
    latitude: 29.5523, // VERIFY
    longitude: -95.1012, // VERIFY
    orderUrl: "https://www.toasttab.com/", // VERIFY: replace with Webster Toast Online Ordering URL
    loyaltyUrl: "https://www.toasttab.com/" // VERIFY: replace if Toast Loyalty is active
  }
];

const drinkModifiers = [
  {
    id: "size",
    label: "Size",
    required: true,
    options: [
      { id: "regular", label: "Regular" }, // VERIFY
      { id: "large", label: "Large", priceDelta: 1 } // VERIFY
    ]
  },
  {
    id: "milk",
    label: "Milk",
    options: [
      { id: "whole", label: "Whole" }, // VERIFY
      { id: "oat", label: "Oat", priceDelta: 0.75 }, // VERIFY
      { id: "almond", label: "Almond", priceDelta: 0.75 } // VERIFY
    ]
  },
  {
    id: "sweetness",
    label: "Sweetness",
    options: [
      { id: "100", label: "100%" }, // VERIFY
      { id: "75", label: "75%" }, // VERIFY
      { id: "50", label: "50%" }, // VERIFY
      { id: "25", label: "25%" } // VERIFY
    ]
  }
];

export const menuItems: MenuItem[] = [
  {
    id: "iced-matcha",
    locationIds: ["friendswood", "webster"],
    category: "Matcha",
    name: "Iced Matcha Latte", // VERIFY
    descriptor: "Smooth, Earthy, Iconic", // VERIFY
    price: 6.5, // VERIFY
    image: asset("/menu/iced-matcha.jpg"), // VERIFY
    modifiers: drinkModifiers
  },
  {
    id: "dirty-matcha",
    locationIds: ["friendswood", "webster"],
    category: "Matcha",
    name: "Dirty Matcha", // VERIFY
    descriptor: "Matcha + Espresso", // VERIFY
    price: 6.75, // VERIFY
    image: asset("/menu/dirty-matcha.jpg"), // VERIFY
    modifiers: drinkModifiers
  },
  {
    id: "strawberry-matcha",
    locationIds: ["friendswood", "webster"],
    category: "Matcha",
    name: "Strawberry Matcha", // VERIFY
    descriptor: "Fresh Fruit + Ceremonial", // VERIFY
    price: 6.75, // VERIFY
    image: asset("/menu/strawberry-matcha.jpg"), // VERIFY
    modifiers: drinkModifiers
  },
  {
    id: "sea-salt-cold-brew",
    locationIds: ["friendswood", "webster"],
    category: "Coffee",
    name: "Sea-Salt Cold Brew", // VERIFY
    descriptor: "Bold, Smooth, Addictive", // VERIFY
    price: 6.25, // VERIFY
    image: asset("/menu/sea-salt-cold-brew.jpg"), // VERIFY
    modifiers: drinkModifiers
  },
  {
    id: "concha",
    locationIds: ["friendswood", "webster"],
    category: "Bakery",
    name: "Concha", // VERIFY
    descriptor: "Classic Pan Dulce", // VERIFY
    price: 3.75, // VERIFY
    image: asset("/menu/conchas.jpg"), // VERIFY
    modifiers: []
  },
  {
    id: "ube-concha",
    locationIds: ["friendswood", "webster"],
    category: "Bakery",
    name: "Ube Concha", // VERIFY
    descriptor: "A Sweet Twist", // VERIFY
    price: 3.95, // VERIFY
    image: asset("/menu/conchas.jpg"), // VERIFY: replace with real ube concha photo
    modifiers: []
  }
];

export const seasonalFeature = {
  eyebrow: "Seasonal drop", // VERIFY
  title: "Pumpkin Drop", // VERIFY
  caption: "Real flavors. Same good energy.", // VERIFY
  image: asset("/drop/pumpkin-biscoff-matcha.jpg") // VERIFY
};

export const featuredEvent = {
  id: "matcha-cafe-perreo",
  title: "Matcha, Café y Perreo", // VERIFY
  dateLabel: "Oct 26 · 8 PM", // VERIFY
  locationId: "webster" as const, // VERIFY
  ticketUrl: "https://www.eventbrite.com/", // VERIFY
  image: asset("/events/dj-night.jpg") // VERIFY
};

export const story = {
  title: "More Than Drinks, A Community", // VERIFY
  body:
    "Casa Matcha is built around matcha, café, cultura and familia — a place designed to feel local, warm and worth coming back to.", // VERIFY
  ownerImage: asset("/about/owners.jpg"), // VERIFY
  testimonial:
    "You can feel the familia energy the second you walk in.", // VERIFY: replace with a real testimonial
  testimonialBy: "Casa Matcha guest", // VERIFY
  instagram: "@casamatchahtx" // VERIFY
};

export const rewardSummary: RewardSummary = {
  points: 350, // VERIFY: concept-only; do not use as a real ledger
  freeDrinkAt: 500, // VERIFY: concept-only; do not use as a real ledger
  recentOrders: [
    {
      id: "recent-1",
      itemIds: ["iced-matcha"],
      locationId: "friendswood",
      label: "Oct 12" // VERIFY
    }
  ]
};

export const inboxSeed = [
  {
    id: "1",
    title: "Pumpkin Drop is here", // VERIFY
    body: "Seasonal drinks just landed. Tap to see the drop.", // VERIFY
    topic: "seasonal"
  },
  {
    id: "2",
    title: "Matcha, Café y Perreo", // VERIFY
    body: "Featured event at Casa Matcha Webster.", // VERIFY
    topic: "events"
  }
] as const;

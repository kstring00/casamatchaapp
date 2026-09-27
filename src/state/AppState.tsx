import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import type { CartLine, LocationId } from "@/types/commerce";

type NotificationPrefs = {
  events: boolean;
  seasonal: boolean;
  rewards: boolean;
  friendswood: boolean;
  webster: boolean;
};

type AppStateValue = {
  locationId: LocationId;
  setLocationId: (id: LocationId) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  cart: CartLine[];
  addToCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  notificationPrefs: NotificationPrefs;
  setNotificationPrefs: (prefs: NotificationPrefs) => void;
};

const STORAGE = "casa-matcha:state:v1";
const defaultPrefs: NotificationPrefs = {
  events: true,
  seasonal: true,
  rewards: true,
  friendswood: true,
  webster: true
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [locationId, setLocationIdState] = useState<LocationId>("friendswood");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [notificationPrefs, setNotificationPrefsState] = useState(defaultPrefs);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE)
      .then((raw) => {
        if (!raw) return;
        const value = JSON.parse(raw);
        if (value.locationId) setLocationIdState(value.locationId);
        if (Array.isArray(value.favorites)) setFavorites(value.favorites);
        if (Array.isArray(value.cart)) setCart(value.cart);
        if (value.notificationPrefs) setNotificationPrefsState({ ...defaultPrefs, ...value.notificationPrefs });
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(
      STORAGE,
      JSON.stringify({ locationId, favorites, cart, notificationPrefs })
    ).catch(() => {});
  }, [hydrated, locationId, favorites, cart, notificationPrefs]);

  const setLocationId = useCallback((id: LocationId) => setLocationIdState(id), []);
  const toggleFavorite = useCallback((id: string) => {
    setFavorites((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  }, []);
  const addToCart = useCallback((itemId: string) => {
    setCart((current) => {
      const found = current.find((line) => line.itemId === itemId);
      if (!found) return [...current, { itemId, quantity: 1 }];
      return current.map((line) =>
        line.itemId === itemId ? { ...line, quantity: line.quantity + 1 } : line
      );
    });
  }, []);
  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setCart((current) =>
      quantity <= 0
        ? current.filter((line) => line.itemId !== itemId)
        : current.map((line) => (line.itemId === itemId ? { ...line, quantity } : line))
    );
  }, []);
  const clearCart = useCallback(() => setCart([]), []);
  const setNotificationPrefs = useCallback((prefs: NotificationPrefs) => setNotificationPrefsState(prefs), []);

  const value = useMemo(
    () => ({
      locationId,
      setLocationId,
      favorites,
      toggleFavorite,
      cart,
      addToCart,
      updateQuantity,
      clearCart,
      notificationPrefs,
      setNotificationPrefs
    }),
    [
      locationId,
      setLocationId,
      favorites,
      toggleFavorite,
      cart,
      addToCart,
      updateQuantity,
      clearCart,
      notificationPrefs,
      setNotificationPrefs
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error("useAppState must be used inside AppStateProvider");
  return value;
}

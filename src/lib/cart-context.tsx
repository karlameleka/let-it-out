"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  productVariantId: string;
  productSlug: string;
  title: string;
  format: "PHYSICAL" | "EBOOK";
  priceEGP: number;
  coverImageUrl: string | null;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productVariantId: string) => void;
  updateQuantity: (productVariantId: string, quantity: number) => void;
  clear: () => void;
  count: number;
  subtotalEGP: number;
  /** True once the initial localStorage read has completed — lets
   * consumers (e.g. AppBadgeSync) avoid treating a transient pre-hydration
   * count of 0 as "cart is actually empty". */
  hydrated: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "let-it-out-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Reading localStorage after mount (rather than as a lazy initial
    // state) is intentional: it keeps the server-rendered and first
    // client render both empty, avoiding a hydration mismatch.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupt cart data
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find(
          (i) => i.productVariantId === item.productVariantId,
        );
        if (existing) {
          return prev.map((i) =>
            i.productVariantId === item.productVariantId
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        }
        return [...prev, { ...item, quantity }];
      });
    },
    [],
  );

  const removeItem = useCallback((productVariantId: string) => {
    setItems((prev) =>
      prev.filter((i) => i.productVariantId !== productVariantId),
    );
  }, []);

  const updateQuantity = useCallback(
    (productVariantId: string, quantity: number) => {
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((i) => i.productVariantId !== productVariantId)
          : prev.map((i) =>
              i.productVariantId === productVariantId ? { ...i, quantity } : i,
            ),
      );
    },
    [],
  );

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const subtotalEGP = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.priceEGP, 0),
    [items],
  );

  const value = useMemo(
    () => ({ items, addItem, removeItem, updateQuantity, clear, count, subtotalEGP, hydrated }),
    [items, addItem, removeItem, updateQuantity, clear, count, subtotalEGP, hydrated],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

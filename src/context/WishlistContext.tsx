"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface WishlistContextType {
  items: string[];
  toggle: (productId: string) => void;
  isWished: (productId: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextType>({
  items: [],
  toggle: () => {},
  isWished: () => false,
  count: 0,
});

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sentir_wishlist");
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  const toggle = (productId: string) => {
    setItems((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      try { localStorage.setItem("sentir_wishlist", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const isWished = (productId: string) => items.includes(productId);

  return (
    <WishlistContext.Provider value={{ items, toggle, isWished, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);

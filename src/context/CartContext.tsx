"use client";

import { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from "react";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  size: string;
  color?: string;
  collectionName: string;
  quantity: number;
  isEntregaInmediata?: boolean;
}

interface CartState { items: CartItem[]; isOpen: boolean; }

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> }
  | { type: "REMOVE_ITEM"; payload: { productId: string; size: string; color?: string } }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; size: string; color?: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] };

const STORAGE_KEY = "sentir-cart";

function matchesItem(item: CartItem, productId: string, size: string, color?: string) {
  return item.productId === productId && item.size === size && (item.color || '') === (color || '');
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(i => matchesItem(i, action.payload.productId, action.payload.size, action.payload.color));
      if (existing) {
        return { ...state, isOpen: true, items: state.items.map(i => matchesItem(i, action.payload.productId, action.payload.size, action.payload.color) ? { ...i, quantity: i.quantity + 1 } : i) };
      }
      return { ...state, isOpen: true, items: [...state.items, { ...action.payload, quantity: 1 }] };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter(i => !matchesItem(i, action.payload.productId, action.payload.size, action.payload.color)) };
    case "UPDATE_QUANTITY":
      if (action.payload.quantity <= 0) return { ...state, items: state.items.filter(i => !matchesItem(i, action.payload.productId, action.payload.size, action.payload.color)) };
      return { ...state, items: state.items.map(i => matchesItem(i, action.payload.productId, action.payload.size, action.payload.color) ? { ...i, quantity: action.payload.quantity } : i) };
    case "CLEAR_CART": return { ...state, items: [] };
    case "TOGGLE_CART": return { ...state, isOpen: !state.isOpen };
    case "OPEN_CART": return { ...state, isOpen: true };
    case "CLOSE_CART": return { ...state, isOpen: false };
    case "LOAD_CART": return { ...state, items: action.payload };
    default: return state;
  }
}

const CartContext = createContext<{
  items: CartItem[]; isOpen: boolean; totalItems: number; total: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string, size: string, color?: string) => void;
  updateQuantity: (productId: string, size: string, color?: string, quantity?: number) => void;
  clearCart: () => void; toggleCart: () => void; openCart: () => void; closeCart: () => void;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) dispatch({ type: "LOAD_CART", payload: parsed });
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items)); } catch { /* ignore */ }
  }, [state.items]);

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);
  const total = state.items.reduce((s, i) => s + i.price * i.quantity, 0);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => dispatch({ type: "ADD_ITEM", payload: item }), []);
  const removeItem = useCallback((productId: string, size: string, color?: string) => dispatch({ type: "REMOVE_ITEM", payload: { productId, size, color } }), []);
  const updateQuantity = useCallback((productId: string, size: string, color?: string, quantity?: number) => dispatch({ type: "UPDATE_QUANTITY", payload: { productId, size, color, quantity: quantity ?? 0 } }), []);
  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);
  const toggleCart = useCallback(() => dispatch({ type: "TOGGLE_CART" }), []);
  const openCart = useCallback(() => dispatch({ type: "OPEN_CART" }), []);
  const closeCart = useCallback(() => dispatch({ type: "CLOSE_CART" }), []);

  return (
    <CartContext.Provider value={{ items: state.items, isOpen: state.isOpen, totalItems, total, addItem, removeItem, updateQuantity, clearCart, toggleCart, openCart, closeCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

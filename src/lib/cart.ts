import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  count: () => number;
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const id = `${item.productId}-${item.size || ""}-${item.color || ""}`;
        const existing = get().items.find((i) => i.id === id);
        if (existing) {
          set((s) => ({
            items: s.items.map((i) =>
              i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          }));
        } else {
          set((s) => ({ items: [...s.items, { ...item, id }] }));
        }
      },
      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));
      },
      clearCart: () => set({ items: [] }),
      total: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "cashpot-cart" }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: string;
  name: string;
  price: number; // base price
  quantity: number;
  image?: string;
  pricingTiers?: { minQty: number, maxQty: number | null, price: number }[];
};

export const calculateItemPrice = (item: CartItem, isB2B: boolean): number => {
  if (!isB2B || !item.pricingTiers || item.pricingTiers.length === 0) {
    return item.price;
  }
  
  // Sort tiers by minQty descending to find the highest applicable tier
  const sortedTiers = [...item.pricingTiers].sort((a, b) => b.minQty - a.minQty);
  for (const tier of sortedTiers) {
    if (item.quantity >= tier.minQty) {
      return tier.price;
    }
  }
  
  return item.price;
};

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleDrawer: () => void;
  setDrawerOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isDrawerOpen: false,
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
              isDrawerOpen: true, // Automatically open drawer on adding
            };
          }
          return { items: [...state.items, item], isDrawerOpen: true };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),
      clearCart: () => set({ items: [] }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
      setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
    }),
    {
      name: 'hasty-tasty-cart', // unique name for localStorage key
    }
  )
);

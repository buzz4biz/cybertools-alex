import { create } from "zustand";

export interface Purchase {
  id: string;
  supplier: string;
  date: string;
  items: string;
  total: number;
  status: "Pendente" | "Recebido" | "Cancelado";
  observations: string;
}

interface PurchasesStore {
  purchases: Purchase[];
  addPurchase: (p: Omit<Purchase, "id">) => void;
  updatePurchase: (id: string, data: Partial<Omit<Purchase, "id">>) => void;
  removePurchase: (id: string) => void;
}

const initialPurchases: Purchase[] = [];

export const usePurchasesStore = create<PurchasesStore>((set) => ({
  purchases: initialPurchases,
  addPurchase: (p) =>
    set((state) => ({
      purchases: [...state.purchases, { ...p, id: String(Date.now()) }],
    })),
  updatePurchase: (id, data) =>
    set((state) => ({
      purchases: state.purchases.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),
  removePurchase: (id) =>
    set((state) => ({
      purchases: state.purchases.filter((p) => p.id !== id),
    })),
}));

import { create } from "zustand";

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  date: string;
  client: string;
  items: SaleItem[];
  deliveryType: string;
  deliveryDate: string;
  originalTotal: number;
  totalDiscount: number;
  finalTotal: number;
  amountPaid: number;
  remaining: number;
  paymentMethod: string;
  status: string;
  profit: number;
  observations: string;
}

interface SalesStore {
  sales: Sale[];
  nextId: number;
  addSale: (sale: Omit<Sale, "id">) => void;
  updateSale: (id: number, data: Partial<Omit<Sale, "id">>) => void;
  cancelSale: (id: number) => void;
}

const initialSales: Sale[] = [];

export const useSalesStore = create<SalesStore>((set) => ({
  sales: initialSales,
  nextId: 1,
  addSale: (sale) =>
    set((state) => ({
      sales: [{ ...sale, id: state.nextId }, ...state.sales],
      nextId: state.nextId + 1,
    })),
  updateSale: (id, data) =>
    set((state) => ({
      sales: state.sales.map((s) =>
        s.id === id ? { ...s, ...data } : s
      ),
    })),
  cancelSale: (id) =>
    set((state) => ({
      sales: state.sales.map((s) =>
        s.id === id ? { ...s, status: "CANCELADO" } : s
      ),
    })),
}));

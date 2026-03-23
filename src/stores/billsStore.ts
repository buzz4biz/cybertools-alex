import { create } from "zustand";

export interface Bill {
  id: string;
  description: string;
  supplier: string;
  dueDate: string;
  amount: number;
  status: "Pendente" | "Pago" | "Vencido";
  category: string;
  observations: string;
}

interface BillsStore {
  bills: Bill[];
  addBill: (b: Omit<Bill, "id">) => void;
  updateBill: (id: string, data: Partial<Omit<Bill, "id">>) => void;
  removeBill: (id: string) => void;
}

const initialBills: Bill[] = [];

export const useBillsStore = create<BillsStore>((set) => ({
  bills: initialBills,
  addBill: (b) =>
    set((state) => ({
      bills: [...state.bills, { ...b, id: String(Date.now()) }],
    })),
  updateBill: (id, data) =>
    set((state) => ({
      bills: state.bills.map((b) => (b.id === id ? { ...b, ...data } : b)),
    })),
  removeBill: (id) =>
    set((state) => ({
      bills: state.bills.filter((b) => b.id !== id),
    })),
}));

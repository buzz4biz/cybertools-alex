import { create } from "zustand";

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  cnpj: string;
  address: string;
  observations: string;
}

interface SuppliersStore {
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, "id">) => void;
  updateSupplier: (id: string, data: Partial<Omit<Supplier, "id">>) => void;
  removeSupplier: (id: string) => void;
}

const initialSuppliers: Supplier[] = [];

export const useSuppliersStore = create<SuppliersStore>((set) => ({
  suppliers: initialSuppliers,
  addSupplier: (supplier) =>
    set((state) => ({
      suppliers: [...state.suppliers, { ...supplier, id: String(Date.now()) }],
    })),
  updateSupplier: (id, data) =>
    set((state) => ({
      suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...data } : s)),
    })),
  removeSupplier: (id) =>
    set((state) => ({
      suppliers: state.suppliers.filter((s) => s.id !== id),
    })),
}));

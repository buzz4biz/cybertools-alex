import { create } from "zustand";

export interface Brand {
  id: number;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  contact: string;
  observations: string;
  products: number;
}

interface BrandsStore {
  brands: Brand[];
  nextId: number;
  addBrand: (brand: Omit<Brand, "id" | "products">) => void;
  updateBrand: (id: number, data: Partial<Omit<Brand, "id">>) => void;
  removeBrand: (id: number) => void;
}

const initialBrands: Brand[] = [];

export const useBrandsStore = create<BrandsStore>((set) => ({
  brands: initialBrands,
  nextId: 1,
  addBrand: (brand) =>
    set((state) => ({
      brands: [...state.brands, { ...brand, id: state.nextId, products: 0 }],
      nextId: state.nextId + 1,
    })),
  updateBrand: (id, data) =>
    set((state) => ({
      brands: state.brands.map((b) => (b.id === id ? { ...b, ...data } : b)),
    })),
  removeBrand: (id) =>
    set((state) => ({
      brands: state.brands.filter((b) => b.id !== id),
    })),
}));

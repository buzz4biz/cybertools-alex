import { create } from "zustand";

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
}

interface ProductsStore {
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, data: Partial<Omit<Product, "id">>) => void;
  removeProduct: (id: string) => void;
  updateStock: (productId: string, quantitySold: number) => void;
}

const initialProducts: Product[] = [];

export const useProductsStore = create<ProductsStore>((set) => ({
  products: initialProducts,
  addProduct: (product) =>
    set((state) => ({
      products: [
        ...state.products,
        { ...product, id: String(Date.now()) },
      ],
    })),
  updateProduct: (id, data) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    })),
  removeProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),
  updateStock: (productId, quantitySold) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === productId
          ? { ...p, stock: Math.max(0, p.stock - quantitySold) }
          : p
      ),
    })),
}));

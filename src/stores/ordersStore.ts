import { create } from "zustand";

export type OrderStatus = "Aguardando" | "Em separação" | "Retirado" | "Cancelado";

export interface Order {
  id: string;
  saleId: number;
  client: string;
  address: string;
  items: string[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

interface OrdersStore {
  orders: Order[];
  addOrder: (order: Omit<Order, "id">) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  removeOrder: (id: string) => void;
}

const initialOrders: Order[] = [];

export const useOrdersStore = create<OrdersStore>((set) => ({
  orders: initialOrders,
  addOrder: (order) =>
    set((state) => ({
      orders: [...state.orders, { ...order, id: String(Date.now()) }],
    })),
  updateOrderStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    })),
  removeOrder: (id) =>
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== id),
    })),
}));

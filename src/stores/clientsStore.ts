import { create } from "zustand";

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  cpfCnpj: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  observations: string;
  sales: number;
  total: number;
}

interface ClientsStore {
  clients: Client[];
  addClient: (client: Omit<Client, "id" | "sales" | "total">) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  incrementSales: (clientName: string, amount: number) => void;
}

const initialClients: Client[] = [];

let nextId = 1;

export const useClientsStore = create<ClientsStore>((set) => ({
  clients: initialClients,
  addClient: (client) =>
    set((state) => ({
      clients: [...state.clients, { ...client, id: String(nextId++), sales: 0, total: 0 }],
    })),
  updateClient: (id, data) =>
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
  deleteClient: (id) =>
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== id),
    })),
  incrementSales: (clientName, amount) =>
    set((state) => ({
      clients: state.clients.map((c) =>
        c.name === clientName ? { ...c, sales: c.sales + 1, total: c.total + amount } : c
      ),
    })),
}));

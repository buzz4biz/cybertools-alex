import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Users,
  AlertCircle,
  Truck,
  Tags,
  Wrench,
  FileSpreadsheet,
  ClipboardList,
  ShoppingBag,
  Receipt,
  BarChart3,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/vendas", icon: ShoppingCart, label: "Vendas" },
  { to: "/pedidos", icon: ClipboardList, label: "Pedidos do Dia" },
  { to: "/produtos", icon: Wrench, label: "Produtos" },
  { to: "/estoque", icon: Warehouse, label: "Estoque" },
  { to: "/compras", icon: ShoppingBag, label: "Compras" },
  { to: "/contas-pagar", icon: Receipt, label: "Contas a Pagar" },
  { to: "/devedores", icon: AlertCircle, label: "Devedores" },
  { to: "/clientes", icon: Users, label: "Clientes" },
  { to: "/fornecedores", icon: Truck, label: "Fornecedores" },
  { to: "/marcas", icon: Tags, label: "Marcas" },
  { to: "/relatorios", icon: BarChart3, label: "Relatórios" },
  { to: "/importar", icon: FileSpreadsheet, label: "Importar" },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Package className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-accent-foreground">FerraTool</h1>
            <p className="text-xs text-sidebar-muted">Gestão de Vendas</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-muted text-center">v1.0 © 2026</p>
      </div>
    </aside>
  );
}

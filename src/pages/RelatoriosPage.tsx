import { useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { KpiCard } from "@/components/KpiCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSalesStore } from "@/stores/salesStore";
import { useProductsStore } from "@/stores/productsStore";
import { usePurchasesStore } from "@/stores/purchasesStore";
import { useBillsStore } from "@/stores/billsStore";
import { DollarSign, TrendingUp, ShoppingCart, Package, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(24 95% 53%)", "hsl(142 71% 45%)", "hsl(217 91% 60%)", "hsl(38 92% 50%)", "hsl(0 72% 51%)"];

export default function RelatoriosPage() {
  const sales = useSalesStore((s) => s.sales);
  const products = useProductsStore((s) => s.products);
  const purchases = usePurchasesStore((s) => s.purchases);
  const bills = useBillsStore((s) => s.bills);

  const activeSales = useMemo(() => sales.filter((s) => s.status !== "CANCELADO"), [sales]);
  const totalRevenue = useMemo(() => activeSales.reduce((s, v) => s + v.finalTotal, 0), [activeSales]);
  const totalProfit = useMemo(() => activeSales.reduce((s, v) => s + v.profit, 0), [activeSales]);
  const totalPurchases = useMemo(() => purchases.reduce((s, p) => s + p.total, 0), [purchases]);
  const totalBills = useMemo(() => bills.filter((b) => b.status !== "Pago").reduce((s, b) => s + b.amount, 0), [bills]);

  // Top products by revenue
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; qty: number }> = {};
    for (const sale of activeSales) {
      for (const item of sale.items) {
        if (!map[item.productId]) map[item.productId] = { name: item.productName, revenue: 0, qty: 0 };
        map[item.productId].revenue += item.subtotal;
        map[item.productId].qty += item.quantity;
      }
    }
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [activeSales]);

  // Sales by payment method
  const byPayment = useMemo(() => {
    const map: Record<string, number> = {};
    for (const sale of activeSales) {
      const key = sale.paymentMethod || "Outros";
      map[key] = (map[key] || 0) + sale.finalTotal;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [activeSales]);

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Visão geral financeira do negócio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Receita Total" value={`R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={<DollarSign className="w-5 h-5" />} iconBg="primary" />
        <KpiCard title="Lucro Total" value={`R$ ${totalProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={<TrendingUp className="w-5 h-5" />} iconBg="success" />
        <KpiCard title="Total Compras" value={`R$ ${totalPurchases.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={<ShoppingCart className="w-5 h-5" />} iconBg="info" />
        <KpiCard title="Contas Pendentes" value={`R$ ${totalBills.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={<BarChart3 className="w-5 h-5" />} iconBg="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top products chart */}
        <div className="bg-card rounded-lg p-5 card-shadow animate-fade-in">
          <h3 className="font-semibold text-card-foreground mb-4">Top 5 Produtos por Receita</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
              <XAxis type="number" fontSize={12} stroke="hsl(220 10% 46%)" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <YAxis dataKey="name" type="category" fontSize={11} stroke="hsl(220 10% 46%)" width={130} />
              <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Receita"]} />
              <Bar dataKey="revenue" fill="hsl(24 95% 53%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment methods pie */}
        <div className="bg-card rounded-lg p-5 card-shadow animate-fade-in">
          <h3 className="font-semibold text-card-foreground mb-4">Vendas por Método de Pagamento</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={byPayment} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} fontSize={12}>
                {byPayment.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top products table */}
      <div className="bg-card rounded-lg card-shadow animate-fade-in">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-card-foreground">Detalhamento por Produto</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Qtd Vendida</TableHead>
              <TableHead className="text-right">Receita</TableHead>
              <TableHead className="text-right">Estoque Atual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topProducts.map((tp) => {
              const product = products.find((p) => p.name === tp.name);
              return (
                <TableRow key={tp.name}>
                  <TableCell className="font-medium">{tp.name}</TableCell>
                  <TableCell className="text-right">{tp.qty}</TableCell>
                  <TableCell className="text-right font-semibold">R$ {tp.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-right">{product?.stock ?? "—"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </AppLayout>
  );
}

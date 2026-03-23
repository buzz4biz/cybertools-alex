import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { KpiCard } from "@/components/KpiCard";
import { QuickSaleDialog } from "@/components/QuickSaleDialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useSalesStore } from "@/stores/salesStore";
import { useProductsStore } from "@/stores/productsStore";
import { useBillsStore } from "@/stores/billsStore";
import { useGoalsStore } from "@/stores/goalsStore";
import {
  DollarSign, TrendingUp, Clock, AlertCircle, Zap, Target,
  BarChart3, ShoppingCart, Warehouse, Settings2, CircleDollarSign, Filter,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

const Index = () => {
  const sales = useSalesStore((s) => s.sales);
  const products = useProductsStore((s) => s.products);
  const { monthlyGoal, annualGoal, setMonthlyGoal, setAnnualGoal } = useGoalsStore();
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [tempMonthly, setTempMonthly] = useState(String(monthlyGoal));
  const [tempAnnual, setTempAnnual] = useState(String(annualGoal));
  const [filter, setFilter] = useState<"mes" | "ano" | "tudo" | "periodo">("mes");
  const [periodoStart, setPeriodoStart] = useState<Date | undefined>();
  const [periodoEnd, setPeriodoEnd] = useState<Date | undefined>();

  const bills = useBillsStore((s) => s.bills);

  const activeSales = useMemo(() => sales.filter((s) => s.status !== "CANCELADO"), [sales]);

  // Parse date helper dd/mm/yyyy -> Date
  const parseDate = (d: string) => {
    const [day, month, year] = d.split("/");
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  // Filter sales based on selected period
  const filteredSales = useMemo(() => {
    const now = new Date();
    return activeSales.filter((s) => {
      if (filter === "tudo") return true;
      const d = parseDate(s.date);
      if (filter === "mes") {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (filter === "ano") {
        return d.getFullYear() === now.getFullYear();
      }
      if (filter === "periodo" && periodoStart && periodoEnd) {
        return d >= periodoStart && d <= periodoEnd;
      }
      return true;
    });
  }, [activeSales, filter, periodoStart, periodoEnd]);

  const totalVendido = useMemo(() => filteredSales.reduce((s, v) => s + v.finalTotal, 0), [filteredSales]);
  const totalRecebido = useMemo(() => filteredSales.reduce((s, v) => s + v.amountPaid, 0), [filteredSales]);
  const aReceber = useMemo(() => filteredSales.reduce((s, v) => s + v.remaining, 0), [filteredSales]);
  const aPagar = useMemo(() => bills.filter(b => b.status === "Pendente" || b.status === "Vencido").reduce((s, b) => s + b.amount, 0), [bills]);
  const totalCustos = useMemo(() => bills.filter(b => b.status === "Pago").reduce((s, b) => s + b.amount, 0), [bills]);
  const lucroReal = useMemo(() => totalRecebido - totalCustos, [totalRecebido, totalCustos]);
  const lucroPotencial = useMemo(() => filteredSales.reduce((s, v) => s + v.profit, 0), [filteredSales]);

  // Current month sales count
  const now = new Date();
  const currentMonthStr = String(now.getMonth() + 1).padStart(2, "0");
  const currentYear = String(now.getFullYear());
  const monthSalesArr = useMemo(() => activeSales.filter((s) => {
    const parts = s.date.split("/");
    return parts[1] === currentMonthStr && parts[2] === currentYear;
  }), [activeSales, currentMonthStr, currentYear]);

  const ticketMedio = useMemo(() => filteredSales.length > 0 ? totalVendido / filteredSales.length : 0, [filteredSales, totalVendido]);
  const totalEstoque = useMemo(() => products.reduce((s, p) => s + p.stock, 0), [products]);
  const valorEstoque = useMemo(() => products.reduce((s, p) => s + p.stock * p.cost, 0), [products]);
  const alertaReposicao = useMemo(() => products.filter(p => p.stock <= p.minStock).length, [products]);

  const monthSales = useMemo(() => monthSalesArr.reduce((sum, s) => sum + s.finalTotal, 0), [monthSalesArr]);

  const yearSales = useMemo(() => {
    return activeSales.filter((s) => {
      const parts = s.date.split("/");
      return parts[2] === currentYear;
    }).reduce((sum, s) => sum + s.finalTotal, 0);
  }, [activeSales, currentYear]);

  const percentMonth = Math.min(100, Math.round((monthSales / monthlyGoal) * 100));
  const percentYear = Math.min(100, Math.round((yearSales / annualGoal) * 100));

  const salesByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    for (const sale of activeSales) {
      const parts = sale.date.split("/");
      const monthNum = parts[1];
      const months: Record<string, string> = { "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr", "05": "Mai", "06": "Jun", "07": "Jul", "08": "Ago", "09": "Set", "10": "Out", "11": "Nov", "12": "Dez" };
      const key = months[monthNum] || monthNum;
      map[key] = (map[key] || 0) + sale.finalTotal;
    }
    return Object.entries(map).map(([month, vendas]) => ({ month, vendas }));
  }, [activeSales]);

  const recentSales = useMemo(() => filteredSales.slice(0, 5), [filteredSales]);

  const handleSaveGoals = () => {
    setMonthlyGoal(Number(tempMonthly) || 25000);
    setAnnualGoal(Number(tempAnnual) || 300000);
    toast.success("Metas atualizadas!");
    setGoalsOpen(false);
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Resumo das suas vendas</p>
        </div>
        <div className="flex items-center gap-2">
          <QuickSaleDialog />
          <Button variant="outline" className="gap-2" onClick={() => { setTempMonthly(String(monthlyGoal)); setTempAnnual(String(annualGoal)); setGoalsOpen(true); }}>
            <Settings2 className="w-4 h-4" /> Meta
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-6 bg-card rounded-lg px-4 py-2.5 card-shadow">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {(["mes", "ano", "tudo", "periodo"] as const).map((f) => {
          const labels = { mes: "Mês", ano: "Ano", tudo: "Tudo", periodo: "Período" };
          return (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "ghost"}
              className={filter === f ? "rounded-full" : "rounded-full text-muted-foreground"}
              onClick={() => setFilter(f)}
            >
              {labels[f]}
            </Button>
          );
        })}
        {filter === "periodo" && (
          <div className="flex items-center gap-2 ml-2">
            <Input type="date" className="h-8 w-36 text-xs" onChange={(e) => setPeriodoStart(e.target.value ? new Date(e.target.value) : undefined)} />
            <span className="text-muted-foreground text-xs">até</span>
            <Input type="date" className="h-8 w-36 text-xs" onChange={(e) => setPeriodoEnd(e.target.value ? new Date(e.target.value) : undefined)} />
          </div>
        )}
      </div>

      {/* Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-card rounded-lg p-5 card-shadow animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="font-semibold text-card-foreground">Meta Mensal</span>
            </div>
            <span className="text-sm font-bold text-primary">{percentMonth}%</span>
          </div>
          <Progress value={percentMonth} className="h-2.5" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>R$ {monthSales.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            <span>Meta: R$ {monthlyGoal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="bg-card rounded-lg p-5 card-shadow animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-success" />
              <span className="font-semibold text-card-foreground">Meta Anual</span>
            </div>
            <span className="text-sm font-bold text-success">{percentYear}%</span>
          </div>
          <Progress value={percentYear} className="h-2.5" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>R$ {yearSales.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            <span>Meta: R$ {annualGoal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Goals config dialog */}
      <Dialog open={goalsOpen} onOpenChange={setGoalsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Metas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Meta Mensal (R$)</Label>
              <Input className="mt-1.5" type="number" value={tempMonthly} onChange={(e) => setTempMonthly(e.target.value)} />
            </div>
            <div>
              <Label>Meta Anual (R$)</Label>
              <Input className="mt-1.5" type="number" value={tempAnnual} onChange={(e) => setTempAnnual(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleSaveGoals}>Salvar Metas</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <KpiCard title="Total Vendido" value={`R$ ${totalVendido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={<DollarSign className="w-5 h-5" />} iconBg="primary" />
        <KpiCard title="Recebido" value={`R$ ${totalRecebido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={<TrendingUp className="w-5 h-5" />} iconBg="success" />
        <KpiCard title="A Receber" value={`R$ ${aReceber.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={<Clock className="w-5 h-5" />} iconBg="warning" />
        <KpiCard title="A Pagar" value={`R$ ${aPagar.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={<AlertCircle className="w-5 h-5" />} iconBg="destructive" />
      </div>

      {/* KPI Cards Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <KpiCard title="Lucro Real" value={`R$ ${lucroReal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} subtitle="recebido - custos pagos" icon={<Zap className="w-5 h-5" />} iconBg="primary" />
        <KpiCard title="Lucro Potencial" value={`R$ ${lucroPotencial.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} subtitle="todas vendas" icon={<CircleDollarSign className="w-5 h-5" />} iconBg="success" />
        <KpiCard title="Ticket Médio" value={`R$ ${ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={<BarChart3 className="w-5 h-5" />} iconBg="info" />
        <KpiCard title="Nº Vendas" value={`${filteredSales.length}`} subtitle={filter === "mes" ? "este mês" : filter === "ano" ? "este ano" : "no período"} icon={<ShoppingCart className="w-5 h-5" />} iconBg="primary" />
      </div>

      {/* KPI Cards Row 3 - Estoque */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KpiCard title="Qtd em Estoque" value={`${totalEstoque}`} subtitle="unidades" icon={<Warehouse className="w-5 h-5" />} iconBg="primary" />
        <KpiCard title="Valor em Estoque" value={`R$ ${valorEstoque.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} subtitle="investimento" icon={<Warehouse className="w-5 h-5" />} iconBg="success" />
        <KpiCard title="Alerta Reposição" value={`${alertaReposicao}`} subtitle="produtos" icon={<AlertCircle className="w-5 h-5" />} iconBg="destructive" />
      </div>

      {/* Chart + Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-lg p-5 card-shadow animate-fade-in">
          <h3 className="font-semibold text-card-foreground mb-4">Vendas por Mês</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={salesByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
              <XAxis dataKey="month" stroke="hsl(220 10% 46%)" fontSize={12} />
              <YAxis stroke="hsl(220 10% 46%)" fontSize={12} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Vendas"]}
                contentStyle={{ backgroundColor: "hsl(0 0% 100%)", border: "1px solid hsl(220 15% 90%)", borderRadius: "8px", fontSize: "13px" }}
              />
              <Bar dataKey="vendas" fill="hsl(24 95% 53%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg p-5 card-shadow animate-fade-in">
          <h3 className="font-semibold text-card-foreground mb-4">Vendas Recentes</h3>
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">
                    {sale.items.map((it) => it.productName).join(", ")}
                  </p>
                  <p className="text-xs text-muted-foreground">{sale.client} • {sale.date}</p>
                </div>
                <div className="text-right ml-3">
                  <p className="text-sm font-semibold text-card-foreground">R$ {sale.finalTotal.toFixed(2)}</p>
                  <span className={`text-xs font-medium ${sale.status === "PAGO" ? "text-success" : "text-destructive"}`}>
                    {sale.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;

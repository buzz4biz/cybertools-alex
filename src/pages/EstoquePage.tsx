import { useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { KpiCard } from "@/components/KpiCard";
import { Search, Package, AlertTriangle, Warehouse } from "lucide-react";
import { useProductsStore } from "@/stores/productsStore";

export default function EstoquePage() {
  const products = useProductsStore((s) => s.products);

  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const totalValue = products.reduce((s, p) => s + p.stock * p.cost, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  const brandSummary = useMemo(() => {
    const map: Record<string, { qty: number; value: number }> = {};
    for (const p of products) {
      const key = p.brand || "Sem Marca";
      if (!map[key]) map[key] = { qty: 0, value: 0 };
      map[key].qty += p.stock;
      map[key].value += p.stock * p.price;
    }
    return Object.entries(map).map(([brand, data]) => ({ brand, ...data })).sort((a, b) => b.value - a.value);
  }, [products]);

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Estoque</h1>
        <p className="text-sm text-muted-foreground">Controle preciso do seu estoque</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KpiCard title="Qtd em Estoque" value={`${totalStock}`} subtitle="unidades" icon={<Package className="w-5 h-5" />} iconBg="info" />
        <KpiCard title="Valor em Estoque" value={`R$ ${totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} subtitle="investimento" icon={<Warehouse className="w-5 h-5" />} iconBg="success" />
        <KpiCard title="Alerta Reposição" value={`${lowStockCount}`} subtitle="produtos" icon={<AlertTriangle className="w-5 h-5" />} iconBg="destructive" />
      </div>

      {/* Resumo por Marca */}
      <div className="bg-card rounded-lg card-shadow animate-fade-in mb-6">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-card-foreground">Estoque por Marca</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Marca</TableHead>
              <TableHead className="text-right">Qtd em Estoque</TableHead>
              <TableHead className="text-right">Valor Total (Venda)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brandSummary.map((b) => (
              <TableRow key={b.brand}>
                <TableCell className="font-medium">{b.brand}</TableCell>
                <TableCell className="text-right">{b.qty}</TableCell>
                <TableCell className="text-right font-semibold">R$ {b.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-card rounded-lg card-shadow animate-fade-in">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar no estoque..." className="pl-10" />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead className="text-right">Estoque Atual</TableHead>
              <TableHead className="text-right">Estoque Mínimo</TableHead>
              <TableHead className="text-right">Custo Unit.</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((item) => {
              const status = item.stock <= 0 ? "critical" : item.stock <= item.minStock ? "low" : "ok";
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.brand}</TableCell>
                  <TableCell className={`text-right font-semibold ${status !== "ok" ? "text-destructive" : ""}`}>{item.stock}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{item.minStock}</TableCell>
                  <TableCell className="text-right">R$ {item.cost.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-semibold">R$ {(item.stock * item.cost).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={status === "ok" ? "default" : "destructive"} className={status === "ok" ? "bg-success hover:bg-success/90" : ""}>
                      {status === "ok" ? "Normal" : status === "low" ? "Baixo" : "Crítico"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </AppLayout>
  );
}

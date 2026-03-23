import { AppLayout } from "@/components/AppLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QuickSaleDialog } from "@/components/QuickSaleDialog";
import { EditSaleDialog } from "@/components/EditSaleDialog";
import { SaleReceiptDialog } from "@/components/SaleReceiptDialog";
import { Search, XCircle, Edit, Receipt } from "lucide-react";
import { useSalesStore, Sale } from "@/stores/salesStore";
import { useProductsStore } from "@/stores/productsStore";
import { useState } from "react";
import { toast } from "sonner";

export default function VendasPage() {
  const sales = useSalesStore((s) => s.sales);
  const cancelSale = useSalesStore((s) => s.cancelSale);
  const updateStock = useProductsStore((s) => s.updateStock);
  const [search, setSearch] = useState("");
  const [editSale, setEditSale] = useState<Sale | null>(null);
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);

  const filtered = sales.filter((s) =>
    s.client.toLowerCase().includes(search.toLowerCase()) ||
    s.items.some((it) => it.productName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCancel = (sale: Sale) => {
    if (sale.status === "CANCELADO") return;
    for (const it of sale.items) {
      updateStock(it.productId, -it.quantity);
    }
    cancelSale(sale.id);
    toast.success("Venda cancelada e estoque devolvido!");
  };

  const statusBadge = (status: string) => {
    if (status === "PAGO") return <Badge className="bg-success hover:bg-success/90">PAGO</Badge>;
    if (status === "CANCELADO") return <Badge variant="outline" className="text-muted-foreground border-muted-foreground">CANCELADO</Badge>;
    return <Badge variant="destructive">DEVENDO</Badge>;
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendas</h1>
          <p className="text-sm text-muted-foreground">Histórico de todas as vendas</p>
        </div>
        <QuickSaleDialog />
      </div>

      <div className="bg-card rounded-lg card-shadow animate-fade-in">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar vendas..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Produto(s)</TableHead>
              <TableHead className="text-center">Qtd</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Valor Original</TableHead>
              <TableHead className="text-right">Desconto</TableHead>
              <TableHead className="text-right">Valor Final</TableHead>
              <TableHead className="text-right">Pago</TableHead>
              <TableHead className="text-right">Falta Pagar</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((sale) => (
              <TableRow key={sale.id} className={sale.status === "CANCELADO" ? "opacity-50" : ""}>
                <TableCell className="text-muted-foreground">{sale.date}</TableCell>
                <TableCell className="font-medium">
                  {sale.items.map((it) => it.productName).join(", ")}
                </TableCell>
                <TableCell className="text-center">
                  {sale.items.reduce((sum, it) => sum + it.quantity, 0)}
                </TableCell>
                <TableCell>{sale.client}</TableCell>
                <TableCell className="text-right">R$ {sale.originalTotal.toFixed(2)}</TableCell>
                <TableCell className="text-right text-destructive">
                  {sale.totalDiscount > 0 ? `- R$ ${sale.totalDiscount.toFixed(2)}` : "-"}
                </TableCell>
                <TableCell className="text-right font-semibold">R$ {sale.finalTotal.toFixed(2)}</TableCell>
                <TableCell className="text-right">R$ {sale.amountPaid.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  {sale.remaining > 0 ? `R$ ${sale.remaining.toFixed(2)}` : "-"}
                </TableCell>
                <TableCell>{statusBadge(sale.status)}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {sale.status !== "CANCELADO" && (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar venda" onClick={() => setEditSale(sale)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Recibo" onClick={() => setReceiptSale(sale)}>
                          <Receipt className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" title="Cancelar venda" onClick={() => handleCancel(sale)}>
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditSaleDialog sale={editSale} open={!!editSale} onOpenChange={(o) => !o && setEditSale(null)} />
      <SaleReceiptDialog sale={receiptSale} open={!!receiptSale} onOpenChange={(o) => !o && setReceiptSale(null)} />
    </AppLayout>
  );
}

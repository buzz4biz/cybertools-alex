import { AppLayout } from "@/components/AppLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KpiCard } from "@/components/KpiCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertCircle, DollarSign, Edit } from "lucide-react";
import { useSalesStore, Sale } from "@/stores/salesStore";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function DevedoresPage() {
  const sales = useSalesStore((s) => s.sales);
  const updateSale = useSalesStore((s) => s.updateSale);
  const [editSale, setEditSale] = useState<Sale | null>(null);
  const [payment, setPayment] = useState(0);

  const debtSales = useMemo(
    () => sales.filter((s) => s.status === "DEVENDO" && s.remaining > 0),
    [sales]
  );

  const totalDebt = useMemo(() => debtSales.reduce((s, d) => s + d.remaining, 0), [debtSales]);
  const uniqueDebtors = useMemo(() => new Set(debtSales.map((d) => d.client)).size, [debtSales]);

  const openPayment = (sale: Sale) => {
    setEditSale(sale);
    setPayment(0);
  };

  const handlePayment = () => {
    if (!editSale || payment <= 0) { toast.error("Informe um valor válido"); return; }

    const newAmountPaid = editSale.amountPaid + payment;
    const newRemaining = Math.max(0, editSale.finalTotal - newAmountPaid);
    const newStatus = newRemaining <= 0 ? "PAGO" : "DEVENDO";

    updateSale(editSale.id, {
      amountPaid: newAmountPaid,
      remaining: newRemaining,
      status: newStatus,
    });

    toast.success(
      newStatus === "PAGO"
        ? "Dívida quitada! Status alterado para PAGO."
        : `Pagamento de R$ ${payment.toFixed(2)} registrado. Restante: R$ ${newRemaining.toFixed(2)}`
    );
    setEditSale(null);
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Devedores</h1>
        <p className="text-sm text-muted-foreground">Clientes com pagamento pendente</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <KpiCard title="Total a Receber" value={`R$ ${totalDebt.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={<DollarSign className="w-5 h-5" />} iconBg="warning" />
        <KpiCard title="Clientes Devedores" value={`${uniqueDebtors}`} subtitle="clientes" icon={<AlertCircle className="w-5 h-5" />} iconBg="destructive" />
      </div>

      <div className="bg-card rounded-lg card-shadow animate-fade-in">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Produto(s)</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead className="text-right">Pago</TableHead>
              <TableHead className="text-right">Falta Pagar</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debtSales.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Nenhum devedor no momento 🎉
                </TableCell>
              </TableRow>
            )}
            {debtSales.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.client}</TableCell>
                <TableCell>{d.items.map((it) => it.productName).join(", ")}</TableCell>
                <TableCell className="text-muted-foreground">{d.date}</TableCell>
                <TableCell className="text-right">R$ {d.finalTotal.toFixed(2)}</TableCell>
                <TableCell className="text-right text-success">R$ {d.amountPaid.toFixed(2)}</TableCell>
                <TableCell className="text-right font-semibold text-destructive">R$ {d.remaining.toFixed(2)}</TableCell>
                <TableCell><Badge variant="destructive">DEVENDO</Badge></TableCell>
                <TableCell className="text-center">
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Registrar pagamento" onClick={() => openPayment(d)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Payment Dialog */}
      <Dialog open={!!editSale} onOpenChange={(o) => !o && setEditSale(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
          </DialogHeader>
          {editSale && (
            <div className="space-y-4 mt-2">
              <div className="bg-muted/50 rounded-md p-3 text-sm space-y-1">
                <div className="flex justify-between"><span>Cliente:</span><span className="font-medium">{editSale.client}</span></div>
                <div className="flex justify-between"><span>Produto(s):</span><span>{editSale.items.map((it) => it.productName).join(", ")}</span></div>
                <div className="flex justify-between"><span>Valor da Venda:</span><span>R$ {editSale.finalTotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Já Pago:</span><span className="text-success">R$ {editSale.amountPaid.toFixed(2)}</span></div>
                <div className="flex justify-between font-semibold text-destructive"><span>Restante:</span><span>R$ {editSale.remaining.toFixed(2)}</span></div>
              </div>
              <div>
                <Label>Valor do Pagamento (R$)</Label>
                <Input className="mt-1" type="number" min={0} max={editSale.remaining} value={payment || ""} onChange={(e) => setPayment(Number(e.target.value))} placeholder="0.00" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setPayment(editSale.remaining)}>
                  Quitar Tudo
                </Button>
                <Button className="flex-1" onClick={handlePayment}>
                  Registrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

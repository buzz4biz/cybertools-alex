import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { KpiCard } from "@/components/KpiCard";
import { Plus, Search, Edit, Trash2, DollarSign, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useBillsStore, Bill } from "@/stores/billsStore";

export default function ContasPagarPage() {
  const { bills, addBill, updateBill, removeBill } = useBillsStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Bill | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [description, setDescription] = useState("");
  const [supplier, setSupplier] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<Bill["status"]>("Pendente");
  const [category, setCategory] = useState("");
  const [observations, setObservations] = useState("");

  const totalPending = useMemo(() => bills.filter((b) => b.status === "Pendente").reduce((s, b) => s + b.amount, 0), [bills]);
  const totalOverdue = useMemo(() => bills.filter((b) => b.status === "Vencido").reduce((s, b) => s + b.amount, 0), [bills]);

  const resetForm = () => { setDescription(""); setSupplier(""); setDueDate(""); setAmount(""); setStatus("Pendente"); setCategory(""); setObservations(""); };

  const openNew = () => { setEditItem(null); resetForm(); setDialogOpen(true); };

  const openEdit = (b: Bill) => {
    setEditItem(b);
    setDescription(b.description); setSupplier(b.supplier); setDueDate(b.dueDate);
    setAmount(String(b.amount)); setStatus(b.status); setCategory(b.category); setObservations(b.observations);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!description.trim()) { toast.error("Descrição é obrigatória"); return; }
    const data = { description: description.trim(), supplier: supplier.trim(), dueDate: dueDate.trim(), amount: Number(amount) || 0, status, category: category.trim(), observations: observations.trim() };
    if (editItem) {
      updateBill(editItem.id, data);
      toast.success("Conta atualizada!");
    } else {
      addBill(data);
      toast.success("Conta registrada!");
    }
    setDialogOpen(false); resetForm(); setEditItem(null);
  };

  const handleDelete = () => {
    if (deleteId) { removeBill(deleteId); toast.success("Conta excluída!"); setDeleteId(null); }
  };

  const filtered = bills.filter((b) =>
    b.description.toLowerCase().includes(search.toLowerCase()) || b.supplier.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (s: Bill["status"]) => {
    const map = { Pendente: "bg-warning text-warning-foreground", Pago: "bg-success text-success-foreground", Vencido: "bg-destructive text-destructive-foreground" };
    return <Badge className={map[s]}>{s}</Badge>;
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contas a Pagar</h1>
          <p className="text-sm text-muted-foreground">Controle de despesas e contas</p>
        </div>
        <Button className="gap-2" onClick={openNew}><Plus className="w-4 h-4" />Nova Conta</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <KpiCard title="Pendente" value={`R$ ${totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={<DollarSign className="w-5 h-5" />} iconBg="warning" />
        <KpiCard title="Vencido" value={`R$ ${totalOverdue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={<AlertCircle className="w-5 h-5" />} iconBg="destructive" />
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { resetForm(); setEditItem(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Editar Conta" : "Nova Conta a Pagar"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Descrição</Label><Input className="mt-1.5" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Frete importação" /></div>
            <div><Label>Fornecedor</Label><Input className="mt-1.5" value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Nome do fornecedor" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Vencimento</Label><Input className="mt-1.5" value={dueDate} onChange={(e) => setDueDate(e.target.value)} placeholder="DD/MM/AAAA" /></div>
              <div><Label>Valor (R$)</Label><Input className="mt-1.5" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Categoria</Label><Input className="mt-1.5" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex: Frete, Aluguel" /></div>
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as Bill["status"])}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Pago">Pago</SelectItem>
                    <SelectItem value="Vencido">Vencido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Observações</Label><Input className="mt-1.5" value={observations} onChange={(e) => setObservations(e.target.value)} /></div>
            <Button className="w-full" onClick={handleSave}>{editItem ? "Salvar Alterações" : "Registrar"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir esta conta?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="bg-card rounded-lg card-shadow animate-fade-in">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar contas..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.description}</TableCell>
                <TableCell className="text-muted-foreground">{b.supplier}</TableCell>
                <TableCell className="text-muted-foreground">{b.dueDate}</TableCell>
                <TableCell><Badge variant="secondary">{b.category}</Badge></TableCell>
                <TableCell className="text-right font-semibold">R$ {b.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>{statusBadge(b.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(b.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AppLayout>
  );
}

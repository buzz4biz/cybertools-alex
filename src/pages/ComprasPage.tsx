import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { usePurchasesStore, Purchase } from "@/stores/purchasesStore";
import { useSuppliersStore } from "@/stores/suppliersStore";

export default function ComprasPage() {
  const { purchases, addPurchase, updatePurchase, removePurchase } = usePurchasesStore();
  const suppliers = useSuppliersStore((s) => s.suppliers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Purchase | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [supplier, setSupplier] = useState("");
  const [date, setDate] = useState("");
  const [items, setItems] = useState("");
  const [total, setTotal] = useState("");
  const [status, setStatus] = useState<Purchase["status"]>("Pendente");
  const [observations, setObservations] = useState("");

  const resetForm = () => { setSupplier(""); setDate(""); setItems(""); setTotal(""); setStatus("Pendente"); setObservations(""); };

  const openNew = () => { setEditItem(null); resetForm(); setDialogOpen(true); };

  const openEdit = (p: Purchase) => {
    setEditItem(p);
    setSupplier(p.supplier); setDate(p.date); setItems(p.items);
    setTotal(String(p.total)); setStatus(p.status); setObservations(p.observations);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!supplier.trim() || !items.trim()) { toast.error("Fornecedor e itens são obrigatórios"); return; }
    const data = { supplier: supplier.trim(), date: date.trim() || new Date().toLocaleDateString("pt-BR"), items: items.trim(), total: Number(total) || 0, status, observations: observations.trim() };
    if (editItem) {
      updatePurchase(editItem.id, data);
      toast.success("Compra atualizada!");
    } else {
      addPurchase(data);
      toast.success("Compra registrada!");
    }
    setDialogOpen(false); resetForm(); setEditItem(null);
  };

  const handleDelete = () => {
    if (deleteId) { removePurchase(deleteId); toast.success("Compra excluída!"); setDeleteId(null); }
  };

  const filtered = purchases.filter((p) =>
    p.supplier.toLowerCase().includes(search.toLowerCase()) || p.items.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (s: Purchase["status"]) => {
    const map = { Pendente: "bg-warning text-warning-foreground", Recebido: "bg-success text-success-foreground", Cancelado: "bg-destructive text-destructive-foreground" };
    return <Badge className={map[s]}>{s}</Badge>;
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Compras</h1>
          <p className="text-sm text-muted-foreground">Registro e controle de compras</p>
        </div>
        <Button className="gap-2" onClick={openNew}><Plus className="w-4 h-4" />Nova Compra</Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { resetForm(); setEditItem(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Editar Compra" : "Registrar Compra"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Fornecedor</Label>
              <Select value={supplier} onValueChange={setSupplier}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione o fornecedor" /></SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Data</Label><Input className="mt-1.5" value={date} onChange={(e) => setDate(e.target.value)} placeholder="DD/MM/AAAA" /></div>
            <div><Label>Itens</Label><Input className="mt-1.5" value={items} onChange={(e) => setItems(e.target.value)} placeholder="Ex: KIT 21V x20" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Total (R$)</Label><Input className="mt-1.5" type="number" value={total} onChange={(e) => setTotal(e.target.value)} /></div>
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as Purchase["status"])}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Recebido">Recebido</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Observações</Label><Input className="mt-1.5" value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="Notas adicionais" /></div>
            <Button className="w-full" onClick={handleSave}>{editItem ? "Salvar Alterações" : "Registrar"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir esta compra?</AlertDialogDescription>
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
            <Input placeholder="Buscar compras..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.supplier}</TableCell>
                <TableCell className="text-muted-foreground">{p.date}</TableCell>
                <TableCell>{p.items}</TableCell>
                <TableCell className="text-right font-semibold">R$ {p.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>{statusBadge(p.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(p.id)}><Trash2 className="w-4 h-4" /></Button>
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

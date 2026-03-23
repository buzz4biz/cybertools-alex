import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSuppliersStore, Supplier } from "@/stores/suppliersStore";

export default function FornecedoresPage() {
  const { suppliers, addSupplier, updateSupplier, removeSupplier } = useSuppliersStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [address, setAddress] = useState("");
  const [observations, setObservations] = useState("");

  const resetForm = () => { setName(""); setContact(""); setPhone(""); setEmail(""); setCnpj(""); setAddress(""); setObservations(""); };

  const openNew = () => { setEditSupplier(null); resetForm(); setDialogOpen(true); };

  const openEdit = (s: Supplier) => {
    setEditSupplier(s);
    setName(s.name); setContact(s.contact); setPhone(s.phone); setEmail(s.email);
    setCnpj(s.cnpj); setAddress(s.address); setObservations(s.observations);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) { toast.error("Nome é obrigatório"); return; }
    const data = { name: name.trim(), contact: contact.trim(), phone: phone.trim(), email: email.trim(), cnpj: cnpj.trim(), address: address.trim(), observations: observations.trim() };
    if (editSupplier) {
      updateSupplier(editSupplier.id, data);
      toast.success("Fornecedor atualizado!");
    } else {
      addSupplier(data);
      toast.success("Fornecedor cadastrado!");
    }
    setDialogOpen(false); resetForm(); setEditSupplier(null);
  };

  const handleDelete = () => {
    if (deleteId) { removeSupplier(deleteId); toast.success("Fornecedor excluído!"); setDeleteId(null); }
  };

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.contact.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fornecedores</h1>
          <p className="text-sm text-muted-foreground">Cadastro e gerenciamento de fornecedores</p>
        </div>
        <Button className="gap-2" onClick={openNew}><Plus className="w-4 h-4" />Novo Fornecedor</Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { resetForm(); setEditSupplier(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editSupplier ? "Editar Fornecedor" : "Cadastrar Fornecedor"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
            <div><Label>Nome da Empresa</Label><Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do fornecedor" /></div>
            <div><Label>CNPJ</Label><Input className="mt-1.5" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Contato</Label><Input className="mt-1.5" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Nome do contato" /></div>
              <div><Label>Telefone</Label><Input className="mt-1.5" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" /></div>
            </div>
            <div><Label>Email</Label><Input className="mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@fornecedor.com" /></div>
            <div><Label>Endereço</Label><Input className="mt-1.5" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Endereço completo" /></div>
            <div><Label>Observações</Label><Input className="mt-1.5" value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="Notas adicionais" /></div>
            <Button className="w-full" onClick={handleSave}>{editSupplier ? "Salvar Alterações" : "Cadastrar"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir este fornecedor? Esta ação não pode ser desfeita.</AlertDialogDescription>
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
            <Input placeholder="Buscar fornecedores..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.contact}</TableCell>
                <TableCell className="text-muted-foreground">{s.phone}</TableCell>
                <TableCell className="text-muted-foreground">{s.email}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(s.id)}><Trash2 className="w-4 h-4" /></Button>
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

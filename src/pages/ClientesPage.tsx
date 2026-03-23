import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { useClientsStore, Client } from "@/stores/clientsStore";

export default function ClientesPage() {
  const { clients, addClient, updateClient, deleteClient } = useClientsStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewClient, setViewClient] = useState<Client | null>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "", phone: "", email: "", cpfCnpj: "",
    street: "", number: "", complement: "", neighborhood: "",
    city: "", state: "", cep: "", observations: "",
  });

  const resetForm = () => {
    setForm({ name: "", phone: "", email: "", cpfCnpj: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "", cep: "", observations: "" });
    setEditingClient(null);
  };

  const openEdit = (c: Client) => {
    setEditingClient(c);
    setForm({
      name: c.name, phone: c.phone, email: c.email, cpfCnpj: c.cpfCnpj,
      street: c.street, number: c.number, complement: c.complement,
      neighborhood: c.neighborhood, city: c.city, state: c.state, cep: c.cep,
      observations: c.observations,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    if (editingClient) {
      updateClient(editingClient.id, form);
      toast.success("Cliente atualizado!");
    } else {
      addClient(form);
      toast.success("Cliente cadastrado!");
    }
    resetForm();
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteClient(id);
    toast.success("Cliente removido!");
  };

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.cpfCnpj.includes(search)
  );

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground">Cadastro de clientes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />Novo Cliente</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>{editingClient ? "Editar Cliente" : "Cadastrar Cliente"}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-80px)]">
              <div className="p-6 pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label>Nome *</Label>
                    <Input className="mt-1.5" placeholder="Nome do cliente" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <Input className="mt-1.5" placeholder="(00) 00000-0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div>
                    <Label>CPF/CNPJ</Label>
                    <Input className="mt-1.5" placeholder="000.000.000-00" value={form.cpfCnpj} onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <Label>Email</Label>
                    <Input className="mt-1.5" placeholder="email@exemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3">Endereço</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <Label>Rua</Label>
                      <Input className="mt-1.5" placeholder="Rua/Avenida" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
                    </div>
                    <div>
                      <Label>Número</Label>
                      <Input className="mt-1.5" placeholder="Nº" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
                    </div>
                    <div className="col-span-3">
                      <Label>Complemento</Label>
                      <Input className="mt-1.5" placeholder="Apto, Bloco, etc" value={form.complement} onChange={(e) => setForm({ ...form, complement: e.target.value })} />
                    </div>
                    <div>
                      <Label>Bairro</Label>
                      <Input className="mt-1.5" placeholder="Bairro" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
                    </div>
                    <div>
                      <Label>Cidade</Label>
                      <Input className="mt-1.5" placeholder="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                    </div>
                    <div>
                      <Label>Estado</Label>
                      <Input className="mt-1.5" placeholder="UF" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                    </div>
                    <div>
                      <Label>CEP</Label>
                      <Input className="mt-1.5" placeholder="00000-000" value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Observações</Label>
                  <Textarea className="mt-1.5 min-h-[60px]" placeholder="Observações sobre o cliente" value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} />
                </div>

                <Button className="w-full" onClick={handleSubmit}>
                  {editingClient ? "Salvar Alterações" : "Cadastrar"}
                </Button>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Client Dialog */}
      <Dialog open={!!viewClient} onOpenChange={(v) => { if (!v) setViewClient(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Dados do Cliente</DialogTitle></DialogHeader>
          {viewClient && (
            <div className="space-y-3 mt-2 text-sm">
              <div><span className="font-semibold text-muted-foreground">Nome:</span> <span>{viewClient.name}</span></div>
              <div><span className="font-semibold text-muted-foreground">Telefone:</span> <span>{viewClient.phone || "—"}</span></div>
              <div><span className="font-semibold text-muted-foreground">CPF/CNPJ:</span> <span>{viewClient.cpfCnpj || "—"}</span></div>
              <div><span className="font-semibold text-muted-foreground">Email:</span> <span>{viewClient.email || "—"}</span></div>
              {(viewClient.street || viewClient.city) && (
                <div>
                  <span className="font-semibold text-muted-foreground">Endereço:</span>
                  <p className="mt-1">{[viewClient.street, viewClient.number, viewClient.complement, viewClient.neighborhood, viewClient.city, viewClient.state, viewClient.cep].filter(Boolean).join(", ")}</p>
                </div>
              )}
              {viewClient.observations && (
                <div><span className="font-semibold text-muted-foreground">Observações:</span> <p className="mt-1">{viewClient.observations}</p></div>
              )}
              <div className="flex gap-4 pt-2 border-t border-border">
                <div><span className="font-semibold text-muted-foreground">Compras:</span> {viewClient.sales}</div>
                <div><span className="font-semibold text-muted-foreground">Total:</span> R$ {viewClient.total.toFixed(2)}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="bg-card rounded-lg card-shadow animate-fade-in">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar clientes..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>CPF/CNPJ</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead className="text-right">Nº Compras</TableHead>
              <TableHead className="text-right">Total Gasto</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.phone || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{c.cpfCnpj || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{c.city || "—"}</TableCell>
                <TableCell className="text-right">{c.sales}</TableCell>
                <TableCell className="text-right font-semibold">R$ {c.total.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setViewClient(c)}><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4" /></Button>
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

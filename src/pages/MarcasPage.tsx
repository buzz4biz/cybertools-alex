import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useBrandsStore, Brand } from "@/stores/brandsStore";

export default function MarcasPage() {
  const { brands, addBrand, updateBrand, removeBrand } = useBrandsStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [observations, setObservations] = useState("");

  const resetForm = () => {
    setName(""); setCnpj(""); setEmail(""); setPhone("");
    setAddress(""); setContact(""); setObservations("");
    setEditingBrand(null);
  };

  const openNew = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setName(brand.name); setCnpj(brand.cnpj); setEmail(brand.email);
    setPhone(brand.phone); setAddress(brand.address); setContact(brand.contact);
    setObservations(brand.observations);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) { toast.error("Nome é obrigatório"); return; }
    const data = { name, cnpj, email, phone, address, contact, observations };
    if (editingBrand) {
      updateBrand(editingBrand.id, data);
      toast.success("Marca atualizada!");
    } else {
      addBrand(data);
      toast.success("Marca cadastrada!");
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (brand: Brand) => {
    if (brand.products > 0) {
      toast.error(`Não é possível excluir. ${brand.name} possui ${brand.products} produtos.`);
      return;
    }
    removeBrand(brand.id);
    toast.success("Marca excluída!");
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Marcas</h1>
          <p className="text-sm text-muted-foreground">Cadastro de marcas e fornecedores</p>
        </div>
        <Button className="gap-2" onClick={openNew}><Plus className="w-4 h-4" />Nova Marca</Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) resetForm(); setDialogOpen(o); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBrand ? "Editar Marca" : "Cadastrar Marca"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Nome da Marca *</Label><Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" /></div>
              <div><Label>CNPJ</Label><Input className="mt-1" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email</Label><Input className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@marca.com" /></div>
              <div><Label>Telefone</Label><Input className="mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" /></div>
            </div>
            <div><Label>Endereço</Label><Input className="mt-1" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Endereço completo" /></div>
            <div><Label>Pessoa de Contato</Label><Input className="mt-1" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Nome do contato" /></div>
            <div><Label>Observações</Label><Input className="mt-1" value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="Notas adicionais" /></div>
            <Button className="w-full" onClick={handleSave}>
              {editingBrand ? "Salvar Alterações" : "Cadastrar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map((brand) => (
          <div key={brand.id} className="bg-card rounded-lg p-5 card-shadow hover:card-shadow-hover transition-shadow animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-card-foreground">{brand.name}</h3>
                <p className="text-sm text-muted-foreground">{brand.products} produtos</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(brand)}><Edit className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(brand)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
            {(brand.cnpj || brand.phone || brand.email) && (
              <div className="text-xs text-muted-foreground space-y-0.5 border-t border-border pt-2 mt-2">
                {brand.cnpj && <p>CNPJ: {brand.cnpj}</p>}
                {brand.phone && <p>Tel: {brand.phone}</p>}
                {brand.email && <p>Email: {brand.email}</p>}
                {brand.contact && <p>Contato: {brand.contact}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </AppLayout>
  );
}

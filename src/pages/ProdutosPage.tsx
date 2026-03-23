import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useProductsStore, Product } from "@/stores/productsStore";
import { useBrandsStore } from "@/stores/brandsStore";

export default function ProdutosPage() {
  const { products, addProduct, updateProduct, removeProduct } = useProductsStore();
  const brands = useBrandsStore((s) => s.brands);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState("3");

  const resetForm = () => { setName(""); setBrand(""); setPrice(""); setCost(""); setStock(""); setMinStock("3"); };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setName(p.name);
    setBrand(p.brand);
    setPrice(String(p.price));
    setCost(String(p.cost));
    setStock(String(p.stock));
    setMinStock(String(p.minStock));
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditProduct(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) { toast.error("Nome é obrigatório"); return; }
    const data = { name: name.trim(), brand: brand.trim() || "Generic", price: Number(price) || 0, cost: Number(cost) || 0, stock: Number(stock) || 0, minStock: Number(minStock) || 3 };
    if (editProduct) {
      updateProduct(editProduct.id, data);
      toast.success("Produto atualizado!");
    } else {
      addProduct(data);
      toast.success("Produto cadastrado!");
    }
    setDialogOpen(false);
    resetForm();
    setEditProduct(null);
  };

  const handleDelete = () => {
    if (deleteId) {
      removeProduct(deleteId);
      toast.success("Produto excluído!");
      setDeleteId(null);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
          <p className="text-sm text-muted-foreground">Cadastro e gerenciamento de produtos</p>
        </div>
        <Button className="gap-2" onClick={openNew}><Plus className="w-4 h-4" />Novo Produto</Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { resetForm(); setEditProduct(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editProduct ? "Editar Produto" : "Cadastrar Produto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Nome do Produto</Label><Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: KIT 21V - DUPLO" /></div>
            <div>
              <Label>Marca</Label>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Selecione uma marca" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Preço de Venda (R$)</Label><Input className="mt-1.5" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" /></div>
              <div><Label>Custo (R$)</Label><Input className="mt-1.5" type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0,00" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Estoque</Label><Input className="mt-1.5" type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" /></div>
              <div><Label>Estoque Mínimo</Label><Input className="mt-1.5" type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} placeholder="3" /></div>
            </div>
            <Button className="w-full" onClick={handleSave}>{editProduct ? "Salvar Alterações" : "Cadastrar"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
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
            <Input placeholder="Buscar produtos..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead className="text-right">Preço Venda</TableHead>
              <TableHead className="text-right">Custo</TableHead>
              <TableHead className="text-right">Margem</TableHead>
              <TableHead className="text-right">Estoque</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{p.brand}</TableCell>
                <TableCell className="text-right">R$ {p.price.toFixed(2)}</TableCell>
                <TableCell className="text-right text-muted-foreground">R$ {p.cost.toFixed(2)}</TableCell>
                <TableCell className="text-right font-semibold text-success">{p.price > 0 ? ((1 - p.cost / p.price) * 100).toFixed(0) : 0}%</TableCell>
                <TableCell className={`text-right font-semibold ${p.stock <= p.minStock ? "text-destructive" : ""}`}>{p.stock}</TableCell>
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

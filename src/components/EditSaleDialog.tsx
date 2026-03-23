import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sale, SaleItem, useSalesStore } from "@/stores/salesStore";
import { useProductsStore } from "@/stores/productsStore";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface EditSaleDialogProps {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSaleDialog({ sale, open, onOpenChange }: EditSaleDialogProps) {
  const updateSale = useSalesStore((s) => s.updateSale);
  const products = useProductsStore((s) => s.products);
  const [client, setClient] = useState("");
  const [items, setItems] = useState<SaleItem[]>([]);
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [deliveryType, setDeliveryType] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [observations, setObservations] = useState("");

  useEffect(() => {
    if (sale) {
      setClient(sale.client);
      setItems(sale.items.map((it) => ({ ...it })));
      setAmountPaid(sale.amountPaid);
      setPaymentMethod(sale.paymentMethod);
      setDeliveryType(sale.deliveryType);
      setDeliveryDate(sale.deliveryDate);
      setObservations(sale.observations);
    }
  }, [sale]);

  if (!sale) return null;

  const updateItem = (index: number, field: keyof SaleItem, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      if (field === "productId") {
        const product = products.find((p) => p.id === value);
        if (product) {
          item.productName = product.name;
          item.unitPrice = product.price;
        }
      }

      item.subtotal = item.unitPrice * item.quantity - item.discount;
      updated[index] = item;
      return updated;
    });
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { productId: "", productName: "", quantity: 1, unitPrice: 0, discount: 0, subtotal: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) { toast.error("A venda precisa de pelo menos 1 item"); return; }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const originalTotal = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
  const totalDiscount = items.reduce((s, it) => s + it.discount, 0);
  const finalTotal = originalTotal - totalDiscount;
  const remaining = Math.max(0, finalTotal - amountPaid);

  const handleSave = () => {
    if (items.some((it) => !it.productId)) {
      toast.error("Selecione um produto para todos os itens");
      return;
    }

    const recalcItems = items.map((it) => ({
      ...it,
      subtotal: it.unitPrice * it.quantity - it.discount,
    }));

    updateSale(sale.id, {
      client,
      items: recalcItems,
      amountPaid,
      paymentMethod,
      deliveryType,
      deliveryDate,
      observations,
      originalTotal,
      totalDiscount,
      finalTotal,
      remaining,
      status: remaining <= 0 ? "PAGO" : "DEVENDO",
    });

    toast.success("Venda atualizada com sucesso!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Venda #{sale.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>Cliente</Label>
            <Input className="mt-1" value={client} onChange={(e) => setClient(e.target.value)} />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold">Produtos</Label>
              <Button variant="outline" size="sm" className="gap-1" onClick={addItem}>
                <Plus className="w-3 h-3" /> Adicionar Item
              </Button>
            </div>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="border border-border rounded-md p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label className="text-xs">Produto</Label>
                      <Select value={item.productId} onValueChange={(v) => updateItem(i, "productId", v)}>
                        <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name} (Estoque: {p.stock})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive mt-5 h-8 w-8" onClick={() => removeItem(i)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label className="text-xs">Qtd</Label>
                      <Input className="mt-1 h-9 text-sm" type="number" min={1} value={item.quantity} onChange={(e) => updateItem(i, "quantity", Number(e.target.value))} />
                    </div>
                    <div>
                      <Label className="text-xs">Preço Unit.</Label>
                      <Input className="mt-1 h-9 text-sm" type="number" value={item.unitPrice} onChange={(e) => updateItem(i, "unitPrice", Number(e.target.value))} />
                    </div>
                    <div>
                      <Label className="text-xs">Desconto</Label>
                      <Input className="mt-1 h-9 text-sm" type="number" value={item.discount} onChange={(e) => updateItem(i, "discount", Number(e.target.value))} />
                    </div>
                    <div>
                      <Label className="text-xs">Subtotal</Label>
                      <div className="mt-1 h-9 flex items-center text-sm font-medium text-muted-foreground">
                        R$ {(item.unitPrice * item.quantity - item.discount).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Valor Pago (R$)</Label>
              <Input className="mt-1" type="number" value={amountPaid} onChange={(e) => setAmountPaid(Number(e.target.value))} />
            </div>
            <div>
              <Label>Forma de Pagamento</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="Pix">Pix</SelectItem>
                  <SelectItem value="Cartão Crédito">Cartão Crédito</SelectItem>
                  <SelectItem value="Cartão Débito">Cartão Débito</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo Entrega</Label>
              <Select value={deliveryType} onValueChange={setDeliveryType}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Retirada">Retirada</SelectItem>
                  <SelectItem value="Entrega">Entrega</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data Entrega</Label>
              <Input className="mt-1" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} placeholder="dd/mm/aaaa" />
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Input className="mt-1" value={observations} onChange={(e) => setObservations(e.target.value)} />
          </div>

          <div className="bg-muted/50 rounded-md p-3 text-sm space-y-1">
            <div className="flex justify-between"><span>Original:</span><span>R$ {originalTotal.toFixed(2)}</span></div>
            {totalDiscount > 0 && <div className="flex justify-between text-destructive"><span>Desconto:</span><span>- R$ {totalDiscount.toFixed(2)}</span></div>}
            <div className="flex justify-between font-semibold"><span>Total Final:</span><span>R$ {finalTotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Pago:</span><span>R$ {amountPaid.toFixed(2)}</span></div>
            {remaining > 0 && <div className="flex justify-between text-destructive font-semibold"><span>Falta:</span><span>R$ {remaining.toFixed(2)}</span></div>}
          </div>

          <Button className="w-full" onClick={handleSave}>Salvar Alterações</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

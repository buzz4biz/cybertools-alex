import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, ShoppingCart, Truck, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useSalesStore } from "@/stores/salesStore";
import { useProductsStore } from "@/stores/productsStore";
import { useClientsStore } from "@/stores/clientsStore";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SaleItemForm {
  brand: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

const emptyItem = (): SaleItemForm => ({ brand: "", productId: "", quantity: 1, unitPrice: 0, discount: 0 });

export function QuickSaleDialog() {
  const [open, setOpen] = useState(false);
  const addSale = useSalesStore((s) => s.addSale);
  const products = useProductsStore((s) => s.products);
  const updateStock = useProductsStore((s) => s.updateStock);
  const clients = useClientsStore((s) => s.clients);
  const incrementSales = useClientsStore((s) => s.incrementSales);

  const brands = useMemo(() => [...new Set(products.map((p) => p.brand))], [products]);

  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [clientId, setClientId] = useState("");
  const [items, setItems] = useState<SaleItemForm[]>([emptyItem()]);
  const [deliveryType, setDeliveryType] = useState("Retirada");
  const [deliveryDate, setDeliveryDate] = useState(today);
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Dinheiro");
  const [observations, setObservations] = useState("");

  const selectedClient = useMemo(() => clients.find((c) => c.id === clientId), [clients, clientId]);

  const updateItem = (index: number, field: keyof SaleItemForm, value: string | number) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === "brand") {
        next[index].productId = "";
        next[index].unitPrice = 0;
      }
      if (field === "productId") {
        const prod = products.find((p) => p.id === value);
        if (prod) next[index].unitPrice = prod.price;
      }
      return next;
    });
  };

  const addItem = () => {
    if (items.length < 6) setItems((prev) => [...prev, emptyItem()]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const originalTotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  const totalDiscount = items.reduce((sum, it) => sum + it.discount, 0);
  const finalTotal = originalTotal - totalDiscount;
  const paid = parseFloat(amountPaid) || 0;
  const remaining = Math.max(0, finalTotal - paid);
  const status = remaining <= 0 ? "PAGO" : "DEVENDO";

  const totalCost = items.reduce((sum, it) => {
    const prod = products.find((p) => p.id === it.productId);
    return sum + (prod ? prod.cost * it.quantity : 0);
  }, 0);
  const profit = paid - totalCost;

  const resetForm = () => {
    setDate(today);
    setClientId("");
    setItems([emptyItem()]);
    setDeliveryType("Retirada");
    setDeliveryDate(today);
    setAmountPaid("");
    setPaymentMethod("Dinheiro");
    setObservations("");
  };

  const handleSubmit = () => {
    if (!clientId) { toast.error("Selecione um cliente"); return; }
    if (items.some((it) => !it.productId)) { toast.error("Selecione todos os produtos"); return; }

    for (const it of items) {
      const prod = products.find((p) => p.id === it.productId);
      if (prod && it.quantity > prod.stock) {
        toast.error(`Estoque insuficiente para ${prod.name}. Disponível: ${prod.stock}`);
        return;
      }
    }

    const formatted = date.split("-").reverse().join("/");
    const clientName = selectedClient?.name || "";

    addSale({
      date: formatted,
      client: clientName,
      items: items.map((it) => {
        const prod = products.find((p) => p.id === it.productId);
        return {
          productId: it.productId,
          productName: prod?.name || "",
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          discount: it.discount,
          subtotal: it.unitPrice * it.quantity - it.discount,
        };
      }),
      deliveryType,
      deliveryDate: deliveryDate.split("-").reverse().join("/"),
      originalTotal,
      totalDiscount,
      finalTotal,
      amountPaid: paid,
      remaining,
      paymentMethod,
      status,
      profit: Math.max(0, profit),
      observations,
    });

    for (const it of items) {
      updateStock(it.productId, it.quantity);
    }
    incrementSales(clientName, finalTotal);

    toast.success("Venda registrada com sucesso!");
    resetForm();
    setOpen(false);
  };

  const clientAddress = selectedClient
    ? [selectedClient.street, selectedClient.number, selectedClient.complement, selectedClient.neighborhood, selectedClient.city, selectedClient.state, selectedClient.cep].filter(Boolean).join(", ")
    : "";

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Venda
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Nova Venda
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="p-6 pt-4 space-y-5">
            <div>
              <Label>Data</Label>
              <Input type="date" className="mt-1.5" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            {/* Cliente */}
            <div>
              <Label>Cliente *</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} {c.phone ? `- ${c.phone}` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Client address info */}
            {selectedClient && clientAddress && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border text-xs">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">{selectedClient.name}</p>
                  <p className="text-muted-foreground">{clientAddress}</p>
                  {selectedClient.phone && <p className="text-muted-foreground">Tel: {selectedClient.phone}</p>}
                </div>
              </div>
            )}

            {/* Produtos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-semibold">Produtos ({items.length}/6)</Label>
                <Button type="button" size="sm" variant="outline" onClick={addItem} disabled={items.length >= 6} className="gap-1 h-7 text-xs">
                  <Plus className="w-3 h-3" /> Adicionar
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => {
                  const filteredProducts = item.brand
                    ? products.filter((p) => p.brand === item.brand)
                    : products;
                  return (
                    <div key={idx} className="border border-border rounded-lg p-3 space-y-3 bg-muted/30 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">Item {idx + 1}</span>
                        {items.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeItem(idx)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>

                      <div>
                        <Label className="text-xs">Fabricante</Label>
                        <Select value={item.brand} onValueChange={(v) => updateItem(idx, "brand", v)}>
                          <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Selecione o fabricante" /></SelectTrigger>
                          <SelectContent>
                            {brands.map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs">Produto</Label>
                        <Select value={item.productId} onValueChange={(v) => updateItem(idx, "productId", v)}>
                          <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
                          <SelectContent>
                            {filteredProducts.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.name} (est: {p.stock})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Quantidade</Label>
                          <div className="flex items-center gap-1 mt-1">
                            <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={() => updateItem(idx, "quantity", Math.max(1, item.quantity - 1))}>
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Input className="text-center h-9" value={item.quantity} readOnly />
                            <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={() => updateItem(idx, "quantity", item.quantity + 1)}>
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Valor Unitário</Label>
                          <Input className="mt-1 h-9" type="number" value={item.unitPrice || ""} onChange={(e) => updateItem(idx, "unitPrice", parseFloat(e.target.value) || 0)} />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">Desconto (R$)</Label>
                        <Input className="mt-1 h-9" type="number" value={item.discount || ""} onChange={(e) => updateItem(idx, "discount", parseFloat(e.target.value) || 0)} />
                      </div>

                      <div className="text-right text-xs text-muted-foreground">
                        Subtotal: <span className="font-semibold text-foreground">R$ {(item.unitPrice * item.quantity - item.discount).toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Entrega / Retirada */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Truck className="w-4 h-4 text-info" />
                Entrega / Retirada
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Tipo de Atendimento</Label>
                  <Select value={deliveryType} onValueChange={setDeliveryType}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Retirada">Retirada</SelectItem>
                      <SelectItem value="Entrega">Entrega</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Data de Entrega</Label>
                  <Input type="date" className="mt-1 h-9" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
                </div>
              </div>
              {deliveryType === "Entrega" && selectedClient && clientAddress && (
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border border-border">
                  <span className="font-semibold">Endereço de entrega:</span> {clientAddress}
                </div>
              )}
            </div>

            {/* Pagamento */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Valor Pago</Label>
                <Input className="mt-1 h-9" type="number" placeholder="0" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Forma de Pagamento</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="Cartão Débito">Cartão Débito</SelectItem>
                    <SelectItem value="Cartão Crédito">Cartão Crédito</SelectItem>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Observações</Label>
              <Textarea className="mt-1 min-h-[60px]" placeholder="Observações adicionais" value={observations} onChange={(e) => setObservations(e.target.value)} />
            </div>

            <Separator />

            {/* Resumo */}
            <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-1.5">
              <h4 className="text-sm font-bold mb-2">Resumo da Venda</h4>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Valor Original:</span>
                <span>R$ {originalTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-destructive">
                <span>Desconto Total:</span>
                <span>- R$ {totalDiscount.toFixed(2)}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between text-sm font-bold">
                <span>Valor Final:</span>
                <span className="text-primary">R$ {finalTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Falta Pagar:</span>
                <span className={remaining > 0 ? "text-destructive font-semibold" : ""}>R$ {remaining.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Status:</span>
                <span className={status === "PAGO" ? "text-success font-semibold" : "text-destructive font-semibold"}>{status}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Lucro:</span>
                <span className="text-success font-semibold">R$ {Math.max(0, profit).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { resetForm(); setOpen(false); }}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleSubmit}>
                Finalizar Venda
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

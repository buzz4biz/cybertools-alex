import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Package, User } from "lucide-react";
import { useOrdersStore, OrderStatus } from "@/stores/ordersStore";
import { toast } from "sonner";

const statusColors: Record<OrderStatus, string> = {
  "Aguardando": "bg-warning text-warning-foreground",
  "Em separação": "bg-info text-info-foreground",
  "Retirado": "bg-success text-success-foreground",
  "Cancelado": "bg-destructive text-destructive-foreground",
};

export default function PedidosPage() {
  const { orders, updateOrderStatus } = useOrdersStore();

  const handleStatusChange = (id: string, status: OrderStatus) => {
    updateOrderStatus(id, status);
    toast.success(`Pedido atualizado para "${status}"`);
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Pedidos do Dia</h1>
        <p className="text-sm text-muted-foreground">Acompanhe e gerencie os pedidos em tempo real</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-card rounded-lg card-shadow animate-fade-in border border-border overflow-hidden">
            {/* Status header */}
            <div className={`px-4 py-2 ${statusColors[order.status]}`}>
              <span className="text-sm font-semibold">{order.status}</span>
            </div>

            <div className="p-4 space-y-3">
              {/* Client */}
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold text-card-foreground">{order.client}</span>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span className="text-sm text-muted-foreground">{order.address}</span>
              </div>

              {/* Items */}
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {order.items.map((item, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{item}</Badge>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-sm font-semibold text-card-foreground">
                  R$ {order.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-muted-foreground">{order.createdAt}</span>
              </div>

              {/* Status selector */}
              <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v as OrderStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aguardando">Aguardando</SelectItem>
                  <SelectItem value="Em separação">Em separação</SelectItem>
                  <SelectItem value="Retirado">Retirado</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nenhum pedido para hoje.
          </div>
        )}
      </div>
    </AppLayout>
  );
}

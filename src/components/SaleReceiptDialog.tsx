import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sale } from "@/stores/salesStore";
import { Printer } from "lucide-react";
import { useRef } from "react";

interface SaleReceiptDialogProps {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaleReceiptDialog({ sale, open, onOpenChange }: SaleReceiptDialogProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!sale) return null;

  const handlePrint = () => {
    const content = receiptRef.current;
    if (!content) return;
    const win = window.open("", "_blank", "width=400,height=600");
    if (!win) return;
    win.document.write(`
      <html><head><title>Recibo #${sale.id}</title>
      <style>
        body { font-family: monospace; padding: 20px; max-width: 350px; margin: 0 auto; }
        h2, h3 { text-align: center; margin: 4px 0; }
        hr { border: 1px dashed #333; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 0; font-size: 13px; }
        .right { text-align: right; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
      </style></head><body>${content.innerHTML}</body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Recibo de Venda</DialogTitle>
        </DialogHeader>
        <div ref={receiptRef} className="font-mono text-xs space-y-2 p-3 border border-border rounded-md bg-background">
          <h2 style={{ textAlign: "center", margin: "4px 0", fontSize: "16px" }}>RECIBO DE VENDA</h2>
          <hr style={{ border: "1px dashed currentColor" }} />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr><td>Nº Venda:</td><td className="right" style={{ textAlign: "right" }}>#{sale.id}</td></tr>
              <tr><td>Data:</td><td className="right" style={{ textAlign: "right" }}>{sale.date}</td></tr>
              <tr><td>Cliente:</td><td className="right" style={{ textAlign: "right" }}>{sale.client}</td></tr>
              <tr><td>Pagamento:</td><td className="right" style={{ textAlign: "right" }}>{sale.paymentMethod}</td></tr>
            </tbody>
          </table>
          <hr style={{ border: "1px dashed currentColor" }} />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ fontWeight: "bold" }}>
                <td>Produto</td><td style={{ textAlign: "center" }}>Qtd</td><td style={{ textAlign: "right" }}>Valor</td>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((it, i) => (
                <tr key={i}>
                  <td>{it.productName}</td>
                  <td style={{ textAlign: "center" }}>{it.quantity}</td>
                  <td style={{ textAlign: "right" }}>R$ {it.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr style={{ border: "1px dashed currentColor" }} />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr><td>Subtotal:</td><td style={{ textAlign: "right" }}>R$ {sale.originalTotal.toFixed(2)}</td></tr>
              {sale.totalDiscount > 0 && (
                <tr><td>Desconto:</td><td style={{ textAlign: "right" }}>- R$ {sale.totalDiscount.toFixed(2)}</td></tr>
              )}
              <tr style={{ fontWeight: "bold", fontSize: "14px" }}>
                <td>TOTAL:</td><td style={{ textAlign: "right" }}>R$ {sale.finalTotal.toFixed(2)}</td>
              </tr>
              <tr><td>Pago:</td><td style={{ textAlign: "right" }}>R$ {sale.amountPaid.toFixed(2)}</td></tr>
              {sale.remaining > 0 && (
                <tr><td>Restante:</td><td style={{ textAlign: "right" }}>R$ {sale.remaining.toFixed(2)}</td></tr>
              )}
            </tbody>
          </table>
          <hr style={{ border: "1px dashed currentColor" }} />
          {sale.observations && <p style={{ fontSize: "11px" }}>Obs: {sale.observations}</p>}
          <p style={{ textAlign: "center", fontSize: "11px", marginTop: "8px" }}>Obrigado pela preferência!</p>
        </div>
        <Button onClick={handlePrint} className="w-full gap-2 mt-2">
          <Printer className="w-4 h-4" /> Imprimir Recibo
        </Button>
      </DialogContent>
    </Dialog>
  );
}

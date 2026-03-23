import { useState, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileSpreadsheet, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useProductsStore } from "@/stores/productsStore";
import * as XLSX from "xlsx";

interface ImportRow {
  name: string;
  brand: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
}

export default function ImportPage() {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const products = useProductsStore((s) => s.products);
  const addProduct = useProductsStore((s) => s.addProduct);
  const updateStock = useProductsStore((s) => s.updateStock);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const wb = XLSX.read(data, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

      const parsed: ImportRow[] = json.map((row) => ({
        name: String(row["nome"] || row["Nome"] || row["NOME"] || row["name"] || row["Name"] || ""),
        brand: String(row["marca"] || row["Marca"] || row["MARCA"] || row["brand"] || row["Brand"] || "Generic"),
        price: Number(row["preco"] || row["Preco"] || row["PRECO"] || row["preço"] || row["Preço"] || row["price"] || row["Price"] || 0),
        cost: Number(row["custo"] || row["Custo"] || row["CUSTO"] || row["cost"] || row["Cost"] || 0),
        stock: Number(row["estoque"] || row["Estoque"] || row["ESTOQUE"] || row["stock"] || row["Stock"] || 0),
        minStock: Number(row["estoque_minimo"] || row["Estoque_Minimo"] || row["minStock"] || row["min_stock"] || 5),
      })).filter((r) => r.name.trim() !== "");

      setRows(parsed);
      if (parsed.length === 0) toast.error("Nenhum dado encontrado na planilha");
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = () => {
    if (rows.length === 0) return;

    let added = 0;
    let updated = 0;

    for (const row of rows) {
      const existing = products.find((p) => p.name.toLowerCase() === row.name.toLowerCase());
      if (existing) {
        // Update stock difference
        const diff = row.stock - existing.stock;
        if (diff !== 0) updateStock(existing.id, -diff); // negative of diff to add
        updated++;
      } else {
        addProduct({
          name: row.name,
          brand: row.brand,
          price: row.price,
          cost: row.cost,
          stock: row.stock,
          minStock: row.minStock,
        });
        added++;
      }
    }

    toast.success(`Importação concluída! ${added} novos, ${updated} atualizados.`);
    setRows([]);
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Importar Planilha</h1>
          <p className="text-sm text-muted-foreground">Atualize produtos e estoque via arquivo Excel</p>
        </div>
      </div>

      {/* Upload area */}
      <div className="bg-card rounded-lg card-shadow animate-fade-in p-6 mb-6">
        <div
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">Clique para enviar uma planilha</p>
          <p className="text-xs text-muted-foreground mt-1">Formatos: .xlsx, .xls, .csv</p>
        </div>

        {fileName && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <FileSpreadsheet className="w-4 h-4 text-primary" />
            <span className="text-foreground font-medium">{fileName}</span>
            <span className="text-muted-foreground">— {rows.length} produtos encontrados</span>
          </div>
        )}

        <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold mb-1">Colunas esperadas na planilha:</p>
              <p><strong>Nome</strong> (obrigatório), <strong>Marca</strong>, <strong>Preço</strong>, <strong>Custo</strong>, <strong>Estoque</strong>, <strong>Estoque_Minimo</strong></p>
              <p className="mt-1">Produtos existentes terão o estoque atualizado. Novos produtos serão cadastrados.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      {rows.length > 0 && (
        <div className="bg-card rounded-lg card-shadow animate-fade-in">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Pré-visualização ({rows.length} itens)</h3>
            <Button className="gap-2" onClick={handleImport}>
              <Check className="w-4 h-4" />
              Confirmar Importação
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead className="text-right">Est. Mínimo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => {
                const exists = products.some((p) => p.name.toLowerCase() === row.name.toLowerCase());
                return (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-muted-foreground">{row.brand}</TableCell>
                    <TableCell className="text-right">R$ {row.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">R$ {row.cost.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{row.stock}</TableCell>
                    <TableCell className="text-right">{row.minStock}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium ${exists ? "text-warning" : "text-success"}`}>
                        {exists ? "Atualizar" : "Novo"}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </AppLayout>
  );
}

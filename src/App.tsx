import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import VendasPage from "./pages/VendasPage";
import ProdutosPage from "./pages/ProdutosPage";
import EstoquePage from "./pages/EstoquePage";
import DevedoresPage from "./pages/DevedoresPage";
import ClientesPage from "./pages/ClientesPage";
import FornecedoresPage from "./pages/FornecedoresPage";
import MarcasPage from "./pages/MarcasPage";
import ImportPage from "./pages/ImportPage";
import PedidosPage from "./pages/PedidosPage";
import ComprasPage from "./pages/ComprasPage";
import ContasPagarPage from "./pages/ContasPagarPage";
import RelatoriosPage from "./pages/RelatoriosPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/vendas" element={<VendasPage />} />
          <Route path="/produtos" element={<ProdutosPage />} />
          <Route path="/estoque" element={<EstoquePage />} />
          <Route path="/devedores" element={<DevedoresPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/fornecedores" element={<FornecedoresPage />} />
          <Route path="/marcas" element={<MarcasPage />} />
          <Route path="/pedidos" element={<PedidosPage />} />
          <Route path="/compras" element={<ComprasPage />} />
          <Route path="/contas-pagar" element={<ContasPagarPage />} />
          <Route path="/relatorios" element={<RelatoriosPage />} />
          <Route path="/importar" element={<ImportPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

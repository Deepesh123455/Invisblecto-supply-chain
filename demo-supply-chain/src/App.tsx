import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import DemandForecast from "@/pages/DemandForecast";
import InventoryAllocation from "@/pages/InventoryAllocation";
import ExceptionsDashboard from "@/pages/ExceptionsDashboard";
import StoreNetwork from "@/pages/StoreNetwork";
import InterStoreTransfers from "./pages/InterStoreTransfers";
import SettingsPage from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/demand-forecast" element={<DemandForecast />} />
          <Route path="/inventory-allocation" element={<InventoryAllocation />} />
          <Route path="/exceptions" element={<ExceptionsDashboard />} />
          <Route path="/store-network" element={<StoreNetwork />} />
          <Route path="/inter-store-transfers" element={<InterStoreTransfers />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

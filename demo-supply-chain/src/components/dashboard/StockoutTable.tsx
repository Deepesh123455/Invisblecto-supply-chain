import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, CheckCircle2, AlertTriangle, RotateCcw, MapPin } from "lucide-react";
import { DataSimulator, ForecastingEngine } from "@/lib/engine";
import { useMemo } from "react";

const simulator = new DataSimulator();

interface StockoutRow {
  skuId:          string;
  skuName:        string;
  city:           string;
  region:         string;
  storeId:        string;
  woc:            number;
  priority:       "Critical" | "High" | "Medium";
  suggestedAction: string;
  lostRevPerDay:  number;
}

export function StockoutTable() {
  const rows = useMemo<StockoutRow[]>(() => {
    const results: StockoutRow[] = [];
    simulator.skus.slice(0, 5).forEach(sku => {
      const history   = simulator.history.filter(h => h.skuId === sku.id);
      const forecasts = ForecastingEngine.runForecast(history, sku, 1);
      const weeklyFc  = forecasts[0]?.predictedUnits ?? 20;

      simulator.stores.slice(0, 15).forEach(store => {
        const stHist = history.filter(h => h.storeId === store.id);
        if (!stHist.length) return;
        const last = stHist[stHist.length - 1];
        const woc  = last.closingStock / (weeklyFc || 1);
        if (woc < 2) {
          const action =
            woc <= 0    ? "Air-freight or urgent transfer" :
            woc < 1     ? "Inter-store transfer (same region)" :
            "Standard warehouse replenishment";
          results.push({
            skuId: sku.id,
            skuName: sku.name,
            city: store.city,
            region: store.region,
            storeId: store.id,
            woc: Math.max(0, Math.round(woc * 10) / 10),
            priority: woc <= 0 ? "Critical" : woc < 1 ? "High" : "Medium",
            suggestedAction: action,
            lostRevPerDay: Math.round(weeklyFc / 7 * sku.avgSellingPrice * 0.55),
          });
        }
      });
    });
    return results
      .sort((a, b) => a.woc - b.woc)
      .slice(0, 8);
  }, []);

  const priorityStyles: Record<string, string> = {
    Critical: "bg-destructive/10 text-destructive",
    High:     "bg-warning/10 text-warning",
    Medium:   "bg-primary/10 text-primary",
  };

  return (
    <div className="rounded-xl bg-card border card-shadow">
      <div className="flex items-center justify-between p-5 pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <h2 className="text-lg font-display font-semibold text-foreground">Stockout Risk Monitor</h2>
        </div>
        <span className="text-[10px] text-muted-foreground font-body bg-muted px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
          WOC &lt; 2 weeks
        </span>
      </div>
      <div className="px-5 pb-5">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold font-body">Product</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold font-body">Store</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold font-body text-center">WOC</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold font-body">Action</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold font-body text-right">Lost Rev/Day</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((item, i) => (
              <TableRow key={`${item.skuId}-${item.storeId}`} className={`border-border/30 hover:bg-muted/5 ${item.priority === "Critical" ? "bg-destructive/3" : ""}`}>
                <TableCell className="py-3">
                  <div className="text-xs font-semibold text-foreground font-body truncate max-w-[120px]">{item.skuName}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{item.skuId}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                    <div>
                      <div className="text-xs font-medium font-body">{item.city}</div>
                      <div className="text-[10px] text-muted-foreground font-body">{item.region}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold font-body ${priorityStyles[item.priority]}`}>
                    {item.woc === 0 ? "OOS" : `${item.woc}w`}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {item.priority === "Critical"
                      ? <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                      : <RotateCcw className="h-3 w-3 text-muted-foreground shrink-0" />}
                    <span className="text-[11px] text-muted-foreground font-body leading-tight">{item.suggestedAction}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-xs font-bold text-destructive font-body">
                    ₹{item.lostRevPerDay.toLocaleString("en-IN")}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

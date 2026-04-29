import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Truck, MapPin, Tag, Activity, BarChart3, PieChart, Layers, Boxes
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DataSimulator, SupplyChainEngine, ForecastingEngine,
  ReplenishmentTrigger
} from "@/lib/engine";

const simulator = new DataSimulator();

const REGION_TABS = ["All Regions", "North India", "South India", "West India", "East India"];

const PriorityBadge = ({ p }: { p: string }) => {
  const styles: Record<string, string> = {
    Critical: "bg-destructive/10 text-destructive border-destructive/20",
    High: "bg-warning/10 text-warning border-warning/20",
    Medium: "bg-primary/10 text-primary border-primary/20",
    Low: "bg-success/10 text-success border-success/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border font-body ${styles[p] || ""}`}>
      {p}
    </span>
  );
};

const ITEMS_PER_PAGE = 10;

const InventoryAllocation = () => {
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [activeView, setActiveView] = useState<"replenishment" | "push" | "markdowns" | "dispatch">("replenishment");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [pushCityFilter, setPushCityFilter] = useState("All Cities");
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setShowAll(false);
    setCurrentPage(1);
  }, [activeView, selectedRegion]);

  const filteredStores = useMemo(() => {
    return selectedRegion === "All Regions"
      ? simulator.stores
      : simulator.stores.filter(s => s.region === selectedRegion);
  }, [selectedRegion]);

  const availableCities = useMemo(() => {
    return Array.from(new Set(filteredStores.map(s => s.city))).sort();
  }, [filteredStores]);

  const replenishmentNeeds = useMemo(() => {
    const allTriggers: ReplenishmentTrigger[] = [];
    simulator.skus.slice(0, 2).forEach(sku => {
      const sampleHistory = simulator.history.filter(h => h.skuId === sku.id);
      const forecasts = ForecastingEngine.runForecast(sampleHistory, sku, 1);
      const triggers = SupplyChainEngine.getReplenishmentTriggers(filteredStores, sku, simulator.history, forecasts);
      allTriggers.push(...triggers);
    });
    return allTriggers.sort((a, b) => {
      const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      return (order[a.priority] ?? 9) - (order[b.priority] ?? 9);
    });
  }, [filteredStores]);

  const [selectedPushSkuId, setSelectedPushSkuId] = useState<string | null>(null);

  // Fair Share "Push" Allocation Mock Data
  const fairShareOpportunities = useMemo(() => {
    const opportunities = [];
    const pushSkus = simulator.skus.slice(4, 8); // Include 4 SKUs for variety
    pushSkus.forEach((sku, idx) => {
      const warehouseStock = 1200 - (idx * 200); // limited stock
      const totalRequested = 2500 - (idx * 300); // demand exceeds supply
      const fillRate = (warehouseStock / totalRequested) * 100;

      const distribution = filteredStores.map((store, sIdx) => {
        // Distribute STR from 98 down to ~30 over the length of stores.
        const strVal = Math.max(30, 98 - Math.floor(sIdx * (68 / filteredStores.length)));
        const velocityMultiplier = strVal / 100;

        // Add some random organic variance to make it look like real store data
        const baseRequested = totalRequested / filteredStores.length;
        const variance = 0.6 + (Math.random() * 0.8); // +/- 40% variance
        const requested = Math.max(1, Math.floor(baseRequested * variance));
        const allocated = Math.max(0, Math.floor(requested * (fillRate / 100) * velocityMultiplier));
        return {
          store,
          requested,
          allocated,
          velocityScore: strVal + "%"
        };
      });

      opportunities.push({
        id: `push-${sku.id}`,
        sku,
        warehouseStock,
        totalRequested,
        globalFillRate: fillRate.toFixed(1),
        distribution
      });
    });
    return opportunities;
  }, [filteredStores]);

  useEffect(() => {
    if (fairShareOpportunities.length > 0 && !selectedPushSkuId) {
      setSelectedPushSkuId(fairShareOpportunities[0].id);
    }
  }, [fairShareOpportunities]);

  const markdownItems = useMemo(() => {
    // Generate deterministic aging inventory mock data
    const items: any[] = [];
    const seasonalSkus = simulator.skus.slice(2, 6);
    seasonalSkus.forEach((sku, idx) => {
      const store = filteredStores[idx * 4] || filteredStores[0];
      if (store) {
        items.push({
          skuId: sku.id,
          storeId: store.id,
          woc: 12 + idx * 4, // Extremely high Weeks of Cover
          discountRange: [15 + idx * 5, 20 + idx * 5],
        });
      }
    });
    return items;
  }, [filteredStores]);

  const dispatchList = useMemo(() =>
    SupplyChainEngine.getDispatchList(replenishmentNeeds, simulator.skus, simulator.stores),
    [replenishmentNeeds]);

  return (
    <AppLayout>
      <div className="space-y-4 max-w-7xl mx-auto pb-10 px-4 md:px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 bg-card/40 p-4 rounded-2xl border border-border/40 backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Retail Allocation Engine</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-bold uppercase tracking-widest">Pull · Push · Markdown Diagnostics</p>
          </div>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: "Dead Stock Lock-up", value: "₹18.4L", sub: "Capital tied in non-moving inventory (90+ days)", color: "text-destructive", icon: Activity },
            { label: "Stockout Revenue Loss", value: "₹6.2L", sub: "Est. lost sales due to OOS this week", color: "text-warning", icon: BarChart3 },
            { label: "Stores Running Low", value: "8 Stores", sub: "Need restocking today across 3 cities", color: "text-primary", icon: Truck },
          ].map((kpi, i) => (
            <div key={i} className="rounded-xl bg-card border border-border/40 p-4 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-body">{kpi.label}</p>
                  <p className="text-2xl font-bold text-foreground font-display mt-0.5">{kpi.value}</p>
                  <p className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${kpi.color}`}>
                    {kpi.sub}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Region tabs */}
        <div className="flex items-center gap-1 bg-card/40 border border-border/40 p-1 rounded-xl overflow-x-auto backdrop-blur-sm">
          {REGION_TABS.map(region => (
            <Button
              key={region}
              variant={selectedRegion === region ? "secondary" : "ghost"}
              size="sm"
              className={`text-[10px] h-8 px-4 shrink-0 font-bold uppercase tracking-wider rounded-lg transition-all ${selectedRegion === region ? "bg-background shadow-sm border border-border/50" : ""
                }`}
              onClick={() => setSelectedRegion(region)}
            >
              {region}
            </Button>
          ))}
        </div>

        {/* Module Nav */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { id: "replenishment", label: "Pull Replenishment", value: replenishmentNeeds.length, color: "text-destructive", icon: Truck },
            { id: "push", label: "Fair Share Push", value: fairShareOpportunities.length, color: "text-primary", icon: Layers },
            { id: "markdowns", label: "Markdown Targets", value: markdownItems.length, color: "text-warning", icon: Tag },
            { id: "dispatch", label: "Dispatch Queue", value: dispatchList.length, color: "text-success", icon: Boxes },
          ].map(kpi => (
            <button
              key={kpi.id}
              onClick={() => setActiveView(kpi.id as any)}
              className={`text-left rounded-xl border p-3 transition-all hover:shadow-md ${activeView === kpi.id
                ? "bg-card border-primary shadow-sm ring-1 ring-primary/20"
                : "bg-card border-border/40 hover:border-primary/40"
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full bg-muted/50 ${activeView === kpi.id ? 'text-primary' : 'text-muted-foreground'}`}>{kpi.value}</span>
              </div>
              <p className={`text-xs font-bold font-body uppercase tracking-wide ${activeView === kpi.id ? 'text-primary' : 'text-foreground'}`}>{kpi.label}</p>
            </button>
          ))}
        </div>

        {/* Dynamic Views */}
        <div className="mt-4">

          {/* PULL REPLENISHMENT */}
          {activeView === "replenishment" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-2xl bg-card border border-border/60 card-shadow overflow-hidden">
                <div className="p-4 border-b border-border/40 flex flex-col md:flex-row items-start md:items-center justify-between bg-muted/10 gap-3">
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-foreground font-body uppercase tracking-wide">
                        Auto-Replenishment Triggers (Safety Stock Breach)
                      </h2>
                      <p className="text-[10px] text-muted-foreground font-body mt-0.5">
                        {replenishmentNeeds.length} active gaps where store inventory has dropped below safety thresholds.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="px-2.5 py-1 rounded-lg border border-destructive/20 bg-destructive/5 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                      <span className="text-[9px] font-bold text-destructive font-body uppercase tracking-wider">{replenishmentNeeds.filter(r => r.priority === 'Critical').length} Critical Breaches</span>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 bg-muted/5">
                        <TableHead className="text-[10px] uppercase font-bold text-muted-foreground py-3 font-body pl-6">Store Identity</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold text-muted-foreground font-body">Product Gap</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold text-muted-foreground text-center font-body">Safety Status</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold text-muted-foreground text-center font-body">Priority</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold text-muted-foreground text-right pr-6 font-body">Auto-Rec. Qty</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {replenishmentNeeds.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((item) => {
                        const store = simulator.stores.find(s => s.id === item.storeId)!;
                        const sku = simulator.skus.find(s => s.id === item.skuId)!;
                        const rowKey = `${item.storeId}-${item.skuId}`;

                        return (
                          <TableRow
                            key={rowKey}
                            className={`border-border/20 hover:bg-muted/5 transition-colors ${item.priority === "Critical" ? "bg-destructive/[0.01]" : ""}`}
                          >
                            <TableCell className="py-3 pl-6">
                              <div className="flex flex-col">
                                <div className="font-bold text-xs text-foreground truncate">{store?.name}</div>
                                <div className="text-[9px] text-muted-foreground font-mono mt-0.5">{store?.id} · {store?.city}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs font-bold text-foreground truncate max-w-[150px]">{sku?.name}</div>
                              <div className="text-[9px] text-muted-foreground font-mono mt-0.5">{sku?.id}</div>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold border font-body ${item.woc < 1 ? "bg-destructive/10 text-destructive border-destructive/20"
                                : item.woc < 2 ? "bg-warning/10 text-warning border-warning/20"
                                  : "bg-success/10 text-success border-success/20"
                                }`}>
                                {item.woc}w Cover
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <PriorityBadge p={item.priority} />
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <div className="font-bold text-xs text-foreground">{item.suggestedDispatchRange[0]}–{item.suggestedDispatchRange[1]}</div>
                              <div className="text-[9px] text-muted-foreground font-body mt-0.5">Units</div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                {/* Pagination */}
                <div className="p-3 border-t border-border/20 bg-muted/5 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, replenishmentNeeds.length)} of {replenishmentNeeds.length} Triggers
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      className="h-7 text-[10px] font-bold uppercase tracking-wider px-3"
                    >
                      Prev
                    </Button>
                    <div className="flex items-center gap-1 mx-2">
                      {Array.from({ length: Math.ceil(replenishmentNeeds.length / ITEMS_PER_PAGE) }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`h-6 w-6 rounded text-[10px] font-bold transition-all ${currentPage === i + 1 ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= Math.ceil(replenishmentNeeds.length / ITEMS_PER_PAGE)}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="h-7 text-[10px] font-bold uppercase tracking-wider px-3"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FAIR SHARE PUSH ALOCATION */}
          {activeView === "push" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start justify-between">
                <div className="flex gap-3 items-start">
                  <div className="p-2 rounded-lg bg-primary/20 text-primary">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground font-body uppercase tracking-wide">Fair Share Push Allocation</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5 max-w-2xl leading-relaxed font-body">
                      Velocity-balanced distribution for high-demand launches or limited warehouse stock.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 bg-card p-1.5 rounded-xl border border-border/40">
                  <div className="flex items-center gap-1.5 px-2">
                    <span className="text-[9px] font-bold uppercase text-muted-foreground">Product</span>
                    <select
                      value={selectedPushSkuId || ""}
                      onChange={e => setSelectedPushSkuId(e.target.value)}
                      className="h-7 px-2 rounded border border-border/50 bg-background text-[10px] font-bold min-w-[140px] focus:ring-1 focus:ring-primary outline-none"
                    >
                      {fairShareOpportunities.map(opp => (
                        <option key={opp.id} value={opp.id}>{opp.sku.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="h-4 w-[1px] bg-border/60 mx-1" />
                  <div className="flex items-center gap-1.5 px-2">
                    <span className="text-[9px] font-bold uppercase text-muted-foreground">City</span>
                    <select
                      value={pushCityFilter}
                      onChange={e => setPushCityFilter(e.target.value)}
                      className="h-7 px-2 rounded border border-border/50 bg-background text-[10px] font-bold min-w-[100px] focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="All Cities">All Cities</option>
                      {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {fairShareOpportunities
                  .filter(opp => opp.id === selectedPushSkuId)
                  .map(opp => {
                    const visibleDistribution = opp.distribution.filter(d => pushCityFilter === "All Cities" || d.store.city === pushCityFilter);
                    return (
                      <div key={opp.id} className="rounded-2xl border border-border/60 bg-card overflow-hidden card-shadow">
                        {/* App header for the SKU */}
                        <div className="p-4 border-b border-border/40 bg-muted/10 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                          <div className="col-span-2">
                            <div className="flex gap-2 items-center mb-1">
                              <span className="px-2 py-0.5 text-[9px] bg-primary/10 text-primary font-bold uppercase tracking-wider rounded border border-primary/20">High Velocity SKU</span>
                              <span className="text-[10px] text-muted-foreground font-mono">{opp.sku.id}</span>
                            </div>
                            <h4 className="text-base font-bold text-foreground truncate">{opp.sku.name}</h4>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide font-body">Supply vs Demand</p>
                            <div className="flex items-end gap-1 mt-1">
                              <span className="font-bold text-sm text-foreground">{opp.warehouseStock}</span>
                              <span className="text-[10px] text-muted-foreground pb-0.5">/ {opp.totalRequested} requested</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide font-body">Global Fill Rate</p>
                            <p className="font-bold text-sm text-warning mt-1">{opp.globalFillRate}%</p>
                          </div>
                        </div>

                        <div className="p-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 font-body border-b border-border/30 pb-2">Allocations by Store Matrix</p>
                          <div className="flex overflow-x-auto md:grid md:grid-cols-4 lg:grid-cols-5 gap-3 pb-4 md:pb-1 custom-scrollbar">
                            {(showAll ? visibleDistribution : visibleDistribution.slice(0, 10)).map((d, i) => (
                              <div key={i} className="p-3 border border-border/40 rounded-xl bg-card hover:bg-muted/5 transition-colors min-w-[150px] md:min-w-0 flex-shrink-0">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <span className="font-bold text-xs truncate block">{d.store.name}</span>
                                    <div className="text-[9px] text-muted-foreground font-mono mt-0.5">{d.store.id} · {d.store.city}</div>
                                  </div>
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-muted rounded font-mono text-muted-foreground">{d.velocityScore}</span>
                                </div>
                                <div className="flex justify-between items-end mt-3">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground font-body">Req</p>
                                    <p className="text-xs font-semibold">{d.requested}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[9px] text-primary font-bold font-body uppercase tracking-wider">Alloc</p>
                                    <p className="text-sm font-bold text-primary">{d.allocated}</p>
                                  </div>
                                </div>
                                {/* Mini progress bar showing request satisfaction */}
                                <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
                                  <div
                                    className="h-full bg-primary"
                                    style={{ width: `${(d.allocated / d.requested) * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          {!showAll && visibleDistribution.length > 10 && (
                            <div className="mt-4 flex justify-center">
                              <Button
                                variant="outline"
                                onClick={() => setShowAll(true)}
                                className="text-[10px] h-8 font-bold uppercase tracking-widest px-6"
                              >
                                Show {visibleDistribution.length - 10} More Stores
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* MARKDOWNS */}
          {activeView === "markdowns" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2 px-1">
                    <Tag className="h-4 w-4 text-warning" /> Aging Inventory Alerts
                  </h3>
                  {markdownItems.length === 0 ? (
                    <div className="p-10 border border-dashed border-border/50 rounded-2xl text-center text-muted-foreground">
                      No aging stock found.
                    </div>
                  ) : (
                    (showAll ? markdownItems : markdownItems.slice(0, 4)).map((item, i) => {
                      const sku = simulator.skus.find(s => s.id === item.skuId)!;
                      const store = simulator.stores.find(s => s.id === item.storeId)!;
                      return (
                        <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-warning/20 bg-warning/5 gap-4">
                          <div>
                            <div className="flex gap-2 items-center mb-1">
                              <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 rounded">{sku.id}</span>
                              <h4 className="text-sm font-bold text-foreground">{sku.name}</h4>
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {store.city} ({store.region})</p>
                          </div>
                          <div className="flex gap-6 items-center shrink-0 bg-background/50 p-3 rounded-lg border border-border/30">
                            <div>
                              <p className="text-[9px] uppercase font-bold text-muted-foreground font-body">Current WOC</p>
                              <p className="text-sm font-semibold">{item.woc}w</p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase font-bold text-warning font-body">Strategic Discount Range</p>
                              <p className="text-sm font-bold text-warning">{item.discountRange[0]}%–{item.discountRange[1]}%</p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  {!showAll && markdownItems.length > 4 && (
                    <Button
                      variant="ghost"
                      onClick={() => setShowAll(true)}
                      className="w-full text-[10px] font-bold uppercase tracking-widest text-warning hover:bg-warning/5"
                    >
                      Show {markdownItems.length - 4} More Targets
                    </Button>
                  )}
                </div>

                <div>
                  <div className="rounded-xl border border-border/40 p-5 bg-card/60 backdrop-blur top-4 sticky">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-body mb-4 flex items-center gap-2">
                      <PieChart className="h-3 w-3" /> Health Impact Summary
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Inventory at Risk</span>
                          <span className="font-bold">₹2.4M</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="w-[12%] h-full bg-warning" />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">GMROI Impact</span>
                          <span className="font-bold text-destructive">-4.2%</span>
                        </div>
                      </div>
                      <p className="text-[10px] leading-relaxed text-muted-foreground p-3 bg-muted/40 rounded-lg mt-4 font-body border border-border/30">
                        Implementing the suggested markdowns today reduces holding costs long-term and avoids steeper end-of-season closeout losses.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DISPATCH */}
          {activeView === "dispatch" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-2xl border border-border/40 p-5 bg-card border-dashed card-shadow">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-5 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-success/10 text-success flex items-center justify-center border border-success/20">
                      <Boxes className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-body">Warehouse Execution & Routing</h3>
                      <p className="text-[10px] text-muted-foreground font-body mt-0.5">Optimized load consolidation queue for next-day delivery dispatch.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="default" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest font-body rounded-lg px-4 bg-primary hover:bg-primary/90">
                      Sync to WMS
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {dispatchList.slice((currentPage - 1) * 8, currentPage * 8).map((item, i) => {
                    const sku = simulator.skus.find(s => s.id === item.skuId)!;
                    const store = simulator.stores.find(s => s.id === item.storeId)!;
                    return (
                      <div key={i} className="group relative bg-muted/5 hover:bg-muted/10 border border-border/30 rounded-xl overflow-hidden transition-all">
                        <div className="flex flex-col lg:flex-row lg:items-stretch">
                          {/* Priority & SKU ID */}
                          <div className="w-full lg:w-16 flex items-center justify-center text-[10px] font-bold font-body border-b lg:border-b-0 lg:border-r border-border/20 py-2 lg:py-0 bg-muted/30 text-muted-foreground uppercase tracking-tighter">
                            TICKET #{((currentPage - 1) * 8) + i + 1}
                          </div>

                          <div className="flex-1 p-3 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                            {/* Product Info */}
                            <div className="md:col-span-4">
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Product Details</p>
                              <div className="font-bold text-xs text-foreground truncate">{sku?.name}</div>
                              <div className="text-[10px] text-muted-foreground font-mono mt-0.5 flex items-center gap-2">
                                <Tag className="h-3 w-3" /> {sku?.id}
                              </div>
                            </div>

                            {/* Loading Specs */}
                            <div className="md:col-span-5 border-l border-border/10 pl-4">
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Loading Specifications</p>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {Object.entries(item.sizeBreakdown).map(([sz, qty]) => (
                                  <div key={sz} className="flex items-center bg-background border border-border/40 rounded px-1.5 py-0.5 min-w-[32px] justify-between">
                                    <span className="text-[9px] font-bold text-muted-foreground mr-1.5">{sz}</span>
                                    <span className="text-[10px] font-bold text-foreground">{qty}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Routing Info */}
                            <div className="md:col-span-3 border-l border-border/10 pl-4 text-right">
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Routing Info</p>
                              <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-foreground">
                                <Truck className="h-3 w-3 text-primary" /> {store?.city}
                              </div>
                              <div className="text-[9px] text-muted-foreground font-mono mt-1">{store?.name}</div>
                            </div>
                          </div>

                          {/* Final Total */}
                          <div className="bg-primary/5 p-3 flex flex-row lg:flex-col items-center justify-between lg:justify-center border-t lg:border-t-0 lg:border-l border-border/20 min-w-[90px]">
                            <p className="text-[9px] font-bold text-primary uppercase tracking-wider">Total Qty</p>
                            <p className="text-sm font-bold text-primary">{item.totalUnits[0]}–{item.totalUnits[1]}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="mt-5 flex items-center justify-between pt-2">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    Showing {(currentPage - 1) * 8 + 1}-{Math.min(currentPage * 8, dispatchList.length)} of {dispatchList.length} Pick Tickets
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      className="h-7 text-[10px] font-bold uppercase tracking-widest px-3"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.ceil(dispatchList.length / 8) }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`h-6 w-6 rounded text-[10px] font-bold transition-all ${currentPage === i + 1 ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={currentPage >= Math.ceil(dispatchList.length / 8)}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="h-7 text-[10px] font-bold uppercase tracking-widest px-3"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default InventoryAllocation;

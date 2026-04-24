import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Truck, ArrowUpRight, ArrowDownRight, MapPin, Tag, Activity,
  TrendingUp, BarChart3, Target, PieChart, Layers, Boxes
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DataSimulator, SupplyChainEngine, ForecastingEngine,
  ReplenishmentTrigger
} from "@/lib/engine";

const simulator = new DataSimulator();

const REGION_TABS = ["All Regions", "North India", "South India", "West India", "East India", "International"];

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

const InventoryAllocation = () => {
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [activeView, setActiveView] = useState<"replenishment" | "push" | "markdowns" | "dispatch">("replenishment");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [pushCityFilter, setPushCityFilter] = useState("All Cities");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setShowAll(false);
  }, [activeView]);

  const filteredStores = useMemo(() => {
    const stores = selectedRegion === "All Regions"
      ? simulator.stores
      : simulator.stores.filter(s => s.region === selectedRegion);
    return stores.slice(0, 15);
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

  // Fair Share "Push" Allocation Mock Data
  const fairShareOpportunities = useMemo(() => {
    const opportunities = [];
    const pushSkus = simulator.skus.slice(4, 5);
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
          recommendedDiscount: 15 + idx * 5,
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
      <div className="space-y-6 max-w-7xl mx-auto pb-12 px-4 md:px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Retail Allocation Engine</h1>
            <p className="text-sm text-muted-foreground mt-1 font-body">
              Automated Pull Replenishment · Velocity-Based Push · Markdown Diagnostics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-success/10 text-success border border-success/20 font-body">
              <Activity className="h-4 w-4" /> System Healthy
            </div>
          </div>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-card border card-shadow p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
              <TrendingUp className="h-16 w-16" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-body">Global Inventory Turnover</p>
            <p className="text-2xl font-bold text-foreground font-display mt-1">4.2x</p>
            <p className="text-[10px] text-success font-body mt-1 flex items-center gap-1 font-semibold">
              <ArrowUpRight className="h-3 w-3" /> +0.4 over trailing 30 days
            </p>
          </div>
          <div className="rounded-2xl bg-card border card-shadow p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
              <Target className="h-16 w-16" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-body">Warehouse Order Fill Rate</p>
            <p className="text-2xl font-bold text-primary font-display mt-1">94.8%</p>
            <p className="text-[10px] text-muted-foreground font-body mt-1">Service level on store pull requests</p>
          </div>
          <div className="rounded-2xl bg-card border card-shadow p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
              <BarChart3 className="h-16 w-16" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-body">Days Inv Outstanding (DIO)</p>
            <p className="text-2xl font-bold text-foreground font-display mt-1">86 Days</p>
            <p className="text-[10px] text-success font-body mt-1 flex items-center gap-1 font-semibold">
              <ArrowDownRight className="h-3 w-3" /> Reduced by 4 days
            </p>
          </div>
        </div>

        {/* Region tabs */}
        <div className="flex items-center gap-1 bg-card/40 border border-border/40 p-1 rounded-xl overflow-x-auto backdrop-blur-sm mt-2">
          {REGION_TABS.map(region => (
            <Button
              key={region}
              variant={selectedRegion === region ? "secondary" : "ghost"}
              size="sm"
              className={`text-[10px] h-8 px-4 shrink-0 font-body rounded-lg transition-all ${selectedRegion === region ? "shadow-sm border border-border/50 bg-background" : ""
                }`}
              onClick={() => setSelectedRegion(region)}
            >
              {region}
            </Button>
          ))}
        </div>

        {/* Module Nav */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: "replenishment", label: "Pull Replenishment", value: replenishmentNeeds.length, sub: "Store triggered", color: "text-destructive", icon: Truck },
            { id: "push", label: "Fair Share Push", value: fairShareOpportunities.length, sub: "Velocity-based", color: "text-primary", icon: Layers },
            { id: "markdowns", label: "Markdown Targets", value: markdownItems.length, sub: "Aging stock", color: "text-warning", icon: Tag },
            { id: "dispatch", label: "Dispatch Queue", value: dispatchList.length, sub: "Ready to pick", color: "text-success", icon: Boxes },
          ].map(kpi => (
            <button
              key={kpi.id}
              onClick={() => setActiveView(kpi.id as any)}
              className={`text-left rounded-xl border p-4 transition-all hover:-translate-y-0.5 ${activeView === kpi.id
                ? "bg-card border-primary/50 ring-1 ring-primary/20 shadow-md shadow-primary/5"
                : "bg-card border-border/40 hover:border-primary/30"
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full bg-muted/50 ${activeView === kpi.id ? 'text-primary' : 'text-muted-foreground'}`}>{kpi.value}</span>
              </div>
              <p className={`text-xs font-semibold text-foreground font-body ${activeView === kpi.id ? 'text-primary' : ''}`}>{kpi.label}</p>
              <p className="text-[10px] mt-0.5 text-muted-foreground font-body">{kpi.sub}</p>
            </button>
          ))}
        </div>

        {/* Dynamic Views */}
        <div className="mt-4">

          {/* PULL REPLENISHMENT */}
          {activeView === "replenishment" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-2xl bg-card border border-border/60 card-shadow overflow-hidden">
                <div className="p-5 border-b border-border/40 flex flex-col md:flex-row items-start md:items-center justify-between bg-muted/10 gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      Store-Driven Replenishment (Pull)
                    </h2>
                    <p className="text-[10px] text-muted-foreground font-body mt-1">
                      SKUs that have dropped below critical Weeks of Cover (WOC) thresholds at the store level.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div className="px-3 py-1.5 rounded-lg border border-destructive/20 bg-destructive/5 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-destructive" />
                      <span className="text-[10px] font-bold text-destructive font-body">{replenishmentNeeds.filter(r => r.priority === 'Critical').length} Critical</span>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 bg-muted/5">
                        <TableHead className="text-[10px] uppercase font-bold text-muted-foreground py-4 font-body pl-6">Location</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold text-muted-foreground font-body">Product</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold text-muted-foreground text-center font-body">WOC Status</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold text-muted-foreground text-center font-body">Priority Rating</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold text-muted-foreground text-right pr-6 font-body">Required Units</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(showAll ? replenishmentNeeds : replenishmentNeeds.slice(0, 10)).map((item) => {
                        const store = simulator.stores.find(s => s.id === item.storeId)!;
                        const sku = simulator.skus.find(s => s.id === item.skuId)!;
                        const rowKey = `${item.storeId}-${item.skuId}`;

                        return (
                          <TableRow
                            key={rowKey}
                            className={`border-border/30 hover:bg-muted/5 transition-colors ${item.priority === "Critical" ? "bg-destructive/[0.02]" : ""}`}
                          >
                            <TableCell className="py-4 pl-6">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border/50">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-xs text-foreground truncate">{store?.city}</div>
                                  <div className="text-[10px] text-muted-foreground font-mono truncate">{store?.id} · {store?.region}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs font-semibold truncate max-w-[150px]">{sku?.name}</div>
                              <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{sku?.id}</div>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border font-body ${item.woc < 1 ? "bg-destructive/10 text-destructive border-destructive/20"
                                : item.woc < 2 ? "bg-warning/10 text-warning border-warning/20"
                                  : "bg-success/10 text-success border-success/20"
                                }`}>
                                {item.woc < 1 ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                                {item.woc}w cover
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <PriorityBadge p={item.priority} />
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <div className="font-bold text-sm text-foreground">{item.suggestedDispatchRange[0]}–{item.suggestedDispatchRange[1]}</div>
                              <div className="text-[9px] text-muted-foreground font-body mt-0.5">Recommended Qty</div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                {!showAll && replenishmentNeeds.length > 10 && (
                  <div className="p-4 border-t border-border/20 bg-muted/5 flex justify-center">
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowAll(true)}
                      className="text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5"
                    >
                      Show {replenishmentNeeds.length - 10} More Needs
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FAIR SHARE PUSH ALOCATION */}
          {activeView === "push" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex flex-col md:flex-row gap-4 items-start justify-between">
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 rounded-lg bg-primary/20 text-primary">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground font-body">Fair Share Push Allocation</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-3xl leading-relaxed">
                      Used for distributing highly anticipated new items or limited warehouse stock.
                      Instead of a simple "first-come-first-served" approach, the engine balances scarcity by allocating stock proportionally
                      to stores based on their historical Sales Velocity and Tier rating.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 bg-card p-2 rounded-xl border border-border/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">City Filter</span>
                  <select
                    value={pushCityFilter}
                    onChange={e => setPushCityFilter(e.target.value)}
                    className="h-8 px-2 rounded-md border border-border/50 bg-background text-xs font-body min-w-[120px]"
                  >
                    <option value="All Cities">All Cities</option>
                    {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                {fairShareOpportunities.map(opp => {
                  const visibleDistribution = opp.distribution.filter(d => pushCityFilter === "All Cities" || d.store.city === pushCityFilter);
                  return (
                    <div key={opp.id} className="rounded-2xl border border-border/60 bg-card overflow-hidden card-shadow">
                      {/* App header for the SKU */}
                      <div className="p-5 border-b border-border/40 bg-muted/10 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div className="col-span-2">
                          <div className="flex gap-2 items-center mb-1">
                            <span className="px-2 py-0.5 text-[9px] bg-primary/10 text-primary font-bold uppercase tracking-wider rounded border border-primary/20">High Demand SKU</span>
                            <span className="text-xs text-muted-foreground font-mono">{opp.sku.id}</span>
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

                      <div className="p-5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 font-body border-b border-border/30 pb-2">Allocations by Store Matrix</p>
                        <div className="flex overflow-x-auto md:grid md:grid-cols-4 gap-3 pb-4 md:pb-2 custom-scrollbar">
                          {(showAll ? visibleDistribution : visibleDistribution.slice(0, 8)).map((d, i) => (
                            <div key={i} className="p-3 border border-border/40 rounded-xl bg-card hover:bg-muted/5 transition-colors min-w-[160px] md:min-w-0 flex-shrink-0">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="font-bold text-xs truncate">{d.store.city}</span>
                                  <div className="text-[9px] text-muted-foreground font-mono">Store #{d.store.id}</div>
                                </div>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-muted rounded font-mono text-muted-foreground">STR: {d.velocityScore}</span>
                              </div>
                              <div className="flex justify-between items-end mt-4">
                                <div>
                                  <p className="text-[9px] text-muted-foreground font-body">Requested</p>
                                  <p className="text-xs font-semibold">{d.requested}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[9px] text-primary font-bold font-body uppercase tracking-wider">Allocated</p>
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
                        {!showAll && visibleDistribution.length > 8 && (
                          <div className="mt-4 flex justify-center">
                            <Button 
                              variant="outline" 
                              onClick={() => setShowAll(true)}
                              className="text-[10px] h-8 font-bold uppercase tracking-widest px-6"
                            >
                              Show {visibleDistribution.length - 8} More Stores
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
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
                                <p className="text-[9px] uppercase font-bold text-warning font-body">AI Rec. Markdown</p>
                                <p className="text-sm font-bold text-warning">{item.recommendedDiscount}%</p>
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
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
              <div className="rounded-2xl border border-border/40 p-6 bg-card border-dashed card-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                      <Boxes className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Consolidated Dispatch List</h3>
                      <p className="text-[10px] text-muted-foreground font-body mt-0.5">Final pick-path optimized warehouse queue for next shift</p>
                    </div>
                  </div>
                  <Button variant="default" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest font-body rounded-lg">
                    Export to WMS
                  </Button>
                </div>
                <div className="space-y-3">
                  {(showAll ? dispatchList : dispatchList.slice(0, 8)).map((item, i) => {
                    const sku = simulator.skus.find(s => s.id === item.skuId)!;
                    const store = simulator.stores.find(s => s.id === item.storeId)!;
                    return (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-muted/10 border border-border/40 hover:bg-muted/20 transition-colors gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-bold font-body shrink-0 border ${item.priority === "Critical" ? "bg-destructive/10 text-destructive border-destructive/20" :
                            item.priority === "High" ? "bg-warning/10 text-warning border-warning/20" :
                              "bg-primary/10 text-primary border-primary/20"
                            }`}>#{i + 1}</div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-foreground truncate">{sku?.name}</div>
                            <div className="text-[10px] text-muted-foreground font-body mt-0.5 flex items-center gap-1">
                              <Truck className="h-3 w-3" /> Routing to: {store?.city}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4 items-center shrink-0 ml-12 sm:ml-0 max-w-[50%]">
                          <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-1.5 pt-0.5">
                            {Object.entries(item.sizeBreakdown).map(([sz, qty]) => (
                              <span key={sz} className="text-[9px] bg-background border border-border/60 px-1.5 py-0.5 rounded font-mono text-muted-foreground whitespace-nowrap shrink-0">
                                {sz}: <strong className="text-foreground">{qty}</strong>
                              </span>
                            ))}
                          </div>
                          <div className="text-right border-l border-border/50 pl-4 w-24 shrink-0">
                            <div className="text-sm font-bold text-foreground truncate">{item.totalUnits[0]}–{item.totalUnits[1]}</div>
                            <div className="text-[9px] text-muted-foreground font-body uppercase tracking-wider mt-0.5">Total Qty</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {!showAll && dispatchList.length > 8 && (
                  <div className="mt-4 flex justify-center">
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowAll(true)}
                      className="text-[10px] font-bold uppercase tracking-widest text-success hover:bg-success/5"
                    >
                      Show {dispatchList.length - 8} More Dispatches
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default InventoryAllocation;

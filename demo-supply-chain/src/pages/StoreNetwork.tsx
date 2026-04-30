import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { DataSimulator } from "@/lib/engine";
import { MapPin, Search, Globe, TrendingUp, TrendingDown, Filter, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const simulator = new DataSimulator();

const REGION_COLORS: Record<string, string> = {
  "North India": "bg-primary/10 text-primary border-primary/20",
  "South India": "bg-success/10 text-success border-success/20",
  "West India": "bg-warning/10 text-warning border-warning/20",
  "East India": "bg-destructive/10 text-destructive border-destructive/20",
  "International": "bg-muted text-muted-foreground border-border",
};

const SEGMENT_COUNTS = simulator.stores.reduce<Record<string, number>>((acc, s) => {
  acc[s.segment] = (acc[s.segment] || 0) + 1;
  return acc;
}, {});

const REGION_COUNTS = simulator.stores.reduce<Record<string, number>>((acc, s) => {
  acc[s.region] = (acc[s.region] || 0) + 1;
  return acc;
}, {});

const StoreNetwork = () => {
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [selectedSegment, setSelectedSegment] = useState<string>("All");
  const [showMore, setShowMore] = useState(false);
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
    setShowMore(false);
  }, [selectedRegion, selectedSegment, search]);

  const filtered = useMemo(() => {
    return simulator.stores.filter(s => {
      const matchRegion = selectedRegion === "All" || s.region === selectedRegion;
      const matchSegment = selectedSegment === "All" || s.segment === selectedSegment;
      const matchSearch = !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.city.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase());
      return matchRegion && matchSegment && matchSearch;
    });
  }, [search, selectedRegion, selectedSegment]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const pagedData = showMore
    ? filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : filtered.slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto pb-10 px-0 md:px-8 pt-2 md:pt-4">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">

            </div>
            <h1 className="text-2xl md:text-4xl font-display font-bold text-foreground tracking-tight">Store Network</h1>
            <p className="text-[11px] md:text-sm text-muted-foreground font-body">
              Managing <span className="font-bold text-foreground">{simulator.stores.length}</span> outlets across <span className="font-bold text-foreground">{Object.keys(REGION_COUNTS).length}</span> regions.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-card border border-border/40 p-2.5 pr-6 rounded-xl shadow-sm self-stretch sm:self-auto justify-center sm:justify-start">
            <div className="h-11 w-11 rounded-xl flex items-center justify-center">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-0.5">Coverage</p>
              <p className="text-[11px] font-bold text-foreground leading-none">Complete Locations</p>
            </div>
          </div>
        </div>

        {/* Region Quick Filters - Grid for all screens */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
          {Object.entries(REGION_COUNTS).map(([region, count]) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(selectedRegion === region ? "All" : region)}
              className={`rounded-xl p-3 md:p-4 border text-left transition-all duration-300 relative overflow-hidden group ${selectedRegion === region
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                : "bg-card border-border/40 shadow-sm hover:border-primary/40 hover:translate-y-[-1px]"
                }`}
            >
              <p className="text-xl md:text-2xl font-bold font-display leading-none">{count}</p>
              <p className="text-[9px] md:text-[10px] font-bold mt-1 font-body uppercase tracking-wider opacity-80">{region}</p>
              {selectedRegion === region && (
                <div className="absolute top-1.5 right-1.5">
                  <div className="h-1 w-1 rounded-full bg-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Filters & Search - Full width on mobile */}
        <div className="bg-card md:border border-border/40 md:rounded-xl p-3 md:p-5 md:card-shadow space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Find a store, city, or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9 md:h-11 bg-background/50 border-border/60 focus:border-primary/50 rounded-lg md:rounded-xl font-body text-xs md:text-sm transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5 lg:pb-0">
              <div className="h-6 w-px bg-border/40 mx-1 hidden lg:block" />
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest shrink-0">Segments:</span>
              <div className="flex gap-1.5">
                {Object.entries(SEGMENT_COUNTS).map(([seg, count]) => (
                  <button
                    key={seg}
                    onClick={() => setSelectedSegment(selectedSegment === seg ? "All" : seg)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold font-body transition-all whitespace-nowrap ${selectedSegment === seg
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                  >
                    {seg}
                    <span className={`rounded px-1 py-0.5 text-[8px] font-bold ${selectedSegment === seg ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(selectedRegion !== "All" || selectedSegment !== "All" || search) && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/20">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active:</span>
              <div className="flex flex-wrap gap-2">
                {selectedRegion !== "All" && (
                  <Button variant="secondary" size="sm" className="h-7 px-2.5 text-[10px] font-bold rounded-lg gap-1.5" onClick={() => setSelectedRegion("All")}>
                    {selectedRegion} <span className="opacity-50 text-xs">×</span>
                  </Button>
                )}
                {selectedSegment !== "All" && (
                  <Button variant="secondary" size="sm" className="h-7 px-2.5 text-[10px] font-bold rounded-lg gap-1.5" onClick={() => setSelectedSegment("All")}>
                    {selectedSegment} <span className="opacity-50 text-xs">×</span>
                  </Button>
                )}
                <button
                  onClick={() => { setSelectedRegion("All"); setSelectedSegment("All"); setSearch(""); }}
                  className="text-[10px] font-bold text-primary hover:underline ml-2"
                >
                  Clear all filters
                </button>
              </div>
              <span className="text-xs text-muted-foreground font-body ml-auto">
                Showing <span className="font-bold text-foreground">{filtered.length}</span> results
              </span>
            </div>
          )}
        </div>

        {/* Store List - Table (Desktop) / Cards (Mobile) - Full width on mobile */}
        <div className="md:rounded-2xl bg-card md:border border-border/40 md:overflow-hidden md:card-shadow">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30 border-b border-border/40">
                  <th className="text-left p-4 pl-6 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground font-body">Store Entity</th>
                  <th className="text-left p-4 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground font-body">Geography</th>
                  <th className="text-left p-4 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground font-body">Segment</th>
                  <th className="text-right p-4 pr-6 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground font-body">Sell Through Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {pagedData.length > 0 ? (
                  pagedData.map((store, i) => (
                    <tr key={store.id} className="group hover:bg-muted/10 transition-all duration-200">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border border-border/20 shadow-sm ${REGION_COLORS[store.region] || "bg-muted"}`}>
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{store.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono tracking-tighter uppercase">{store.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground">{store.city}</span>
                          <span className="text-[10px] text-muted-foreground font-body">{store.region} · {store.country}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-secondary/50 text-[10px] font-bold text-muted-foreground border border-border/40">
                          {store.segment}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1">
                              {store.historicPerformance >= 0.75
                                ? <TrendingUp className="h-3 w-3 text-success" />
                                : <TrendingDown className="h-3 w-3 text-warning" />}
                              <span className={`text-sm font-bold font-display ${store.historicPerformance >= 0.75 ? "text-success" : "text-warning"}`}>
                                {(store.historicPerformance * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-20 h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${store.historicPerformance >= 0.75 ? "bg-success" : "bg-warning"}`}
                                style={{ width: `${store.historicPerformance * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-16 text-center text-muted-foreground font-body">
                      <div className="flex flex-col items-center gap-3">
                        <Search className="h-8 w-8 opacity-20" />
                        <p className="text-sm italic">No stores found matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-border/20">
            {pagedData.length > 0 ? (
              pagedData.map((store) => (
                <div key={store.id} className="p-3 space-y-2.5 active:bg-muted/10 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-2xl flex items-center justify-center border border-border/20 ${REGION_COLORS[store.region] || "bg-muted"}`}>
                        <MapPin className="h-5.5 w-5.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground leading-tight">{store.name}</span>
                        <span className="text-[9px] text-muted-foreground font-mono leading-none mt-0.5">{store.id}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <span className={`text-xs font-bold font-display ${store.historicPerformance >= 0.75 ? "text-success" : "text-warning"}`}>
                          {(store.historicPerformance * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none">STR</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex flex-col">
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-0.5">Location</p>
                      <p className="text-[10px] font-bold text-foreground leading-none">{store.city}, {store.region}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-0.5">Segment</p>
                      <span className="text-[10px] font-bold text-foreground leading-none">{store.segment}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-muted-foreground font-body italic">
                No stores found matching your criteria.
              </div>
            )}
          </div>

          {/* Table/Card Footer - Shared Pagination Logic */}
          {!showMore && filtered.length > 5 ? (
            <div className="p-6 border-t border-border/20 bg-muted/5 flex justify-center">
              <Button
                onClick={() => setShowMore(true)}
                className="ai-gradient text-white h-11 px-10 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
              >
                Expand {filtered.length - 5} More Outlets
              </Button>
            </div>
          ) : showMore && totalPages > 1 ? (
            <div className="p-4 border-t border-border/20 bg-muted/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                <div className="text-xs text-muted-foreground font-body">
                  Showing <span className="font-bold text-foreground">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to <span className="font-bold text-foreground">{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</span> of <span className="font-bold text-foreground">{filtered.length}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMore(false)}
                  className="text-[10px] font-bold uppercase tracking-widest px-2 font-body text-primary h-7 hover:bg-primary/5"
                >
                  Show Less
                </Button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="h-8 w-8 p-0 rounded-lg"
                >
                  <ArrowRight className="h-3 w-3 rotate-180" />
                </Button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`h-8 min-w-[32px] px-1.5 rounded-lg text-[10px] font-bold transition-all ${currentPage === i + 1
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "hover:bg-muted text-muted-foreground"
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="h-8 w-8 p-0 rounded-lg"
                >
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </AppLayout>
  );
};

export default StoreNetwork;

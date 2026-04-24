import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { DataSimulator } from "@/lib/engine";
import { MapPin, Search, Globe, TrendingUp, TrendingDown, Filter } from "lucide-react";
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

  useEffect(() => {
    setShowMore(false);
  }, [selectedRegion, selectedSegment, search]);

  const regions = ["All", ...Object.keys(REGION_COUNTS)];
  const segments = ["All", ...Object.keys(SEGMENT_COUNTS)];

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

  const pagedData = showMore ? filtered : filtered.slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12 px-4 md:px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Store Network</h1>
            <p className="text-sm text-muted-foreground mt-1 font-body">
              {simulator.stores.length} stores across {Object.keys(REGION_COUNTS).length} regions · {Object.values(simulator.stores.reduce<Record<string, boolean>>((a, s) => ({ ...a, [s.country]: true }), {})).length} countries
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground font-body">India + UAE · Singapore · UK · USA · Malaysia · Thailand · Sri Lanka</span>
          </div>
        </div>

        {/* Region summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(REGION_COUNTS).map(([region, count]) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(selectedRegion === region ? "All" : region)}
              className={`rounded-xl p-4 border text-left transition-all hover:shadow-md ${selectedRegion === region
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border/40 card-shadow hover:border-primary/40"
                }`}
            >
              <p className="text-xl font-bold font-display">{count}</p>
              <p className="text-[11px] font-semibold mt-1 font-body leading-tight">{region}</p>
            </button>
          ))}
        </div>

        {/* Segment breakdown */}
        <div className="rounded-2xl bg-card border border-border/40 p-5 card-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-4">Store Segments (Monthly Grouping for Forecast Models)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(SEGMENT_COUNTS).map(([seg, count]) => (
              <button
                key={seg}
                onClick={() => setSelectedSegment(selectedSegment === seg ? "All" : seg)}
                className={`rounded-xl p-3 border text-left transition-all ${selectedSegment === seg
                  ? "bg-primary/10 border-primary/40"
                  : "border-border/30 hover:border-primary/30 hover:bg-accent/30"
                  }`}
              >
                <p className="text-base font-bold font-display text-foreground">{count}</p>
                <p className="text-[10px] font-semibold text-muted-foreground mt-0.5 font-body leading-tight">{seg}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search store, city, or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-10 font-body text-sm"
            />
          </div>
          {selectedRegion !== "All" && (
            <Button variant="outline" size="sm" className="h-10 text-xs font-body gap-1" onClick={() => setSelectedRegion("All")}>
              Region: {selectedRegion} ×
            </Button>
          )}
          {selectedSegment !== "All" && (
            <Button variant="outline" size="sm" className="h-10 text-xs font-body gap-1" onClick={() => setSelectedSegment("All")}>
              Segment: {selectedSegment} ×
            </Button>
          )}
          {
            selectedRegion !== "All" || selectedSegment !== "All" || search ? (
              <span className="text-xs text-muted-foreground font-body ml-auto">{filtered.length} stores shown</span>
            ) : null
          }
        </div>

        {/* Store Table */}
        {selectedRegion === "All" && selectedSegment === "All" && !search ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-card/50 p-12 text-center card-shadow">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
              <Filter className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-display font-semibold text-foreground mb-2">Select a category to view stores</h3>
            <p className="text-sm text-muted-foreground font-body max-w-md mx-auto">
              Choose from the options above or search from search box.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-card border border-border/40 overflow-hidden card-shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/20 border-b border-border/40">
                    <th className="text-left p-3 pl-5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-body">Store ID</th>
                    <th className="text-left p-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-body">City</th>
                    <th className="text-left p-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-body">Region</th>
                    <th className="text-left p-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-body">Country</th>
                    <th className="text-left p-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-body">Segment</th>
                    <th className="text-right p-3 pr-5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-body">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedData.map((store, i) => (
                    <tr key={store.id} className={`border-b border-border/20 hover:bg-muted/5 transition-colors ${i % 2 === 0 ? "" : "bg-muted/5"}`}>
                      <td className="p-3 pl-5">
                        <span className="text-xs font-mono text-muted-foreground">{store.id}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">{store.city}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-body ${REGION_COLORS[store.region] || ""}`}>
                          {store.region}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-xs text-muted-foreground font-body">{store.country}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] text-muted-foreground font-body">{store.segment}</span>
                      </td>
                      <td className="p-3 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {store.historicPerformance >= 0.75
                            ? <TrendingUp className="h-3 w-3 text-success" />
                            : <TrendingDown className="h-3 w-3 text-warning" />}
                          <span className={`text-xs font-bold font-body ${store.historicPerformance >= 0.75 ? "text-success" : "text-warning"}`}>
                            {(store.historicPerformance * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!showMore && filtered.length > 5 && (
              <div className="p-6 border-t border-border/20 bg-muted/5 flex justify-center">
                <Button 
                  onClick={() => setShowMore(true)}
                  className="ai-gradient text-white h-10 px-8 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
                >
                  Show {filtered.length - 5} More Stores
                </Button>
              </div>
            )}
            
            {showMore && (
              <div className="p-4 border-t border-border/20 bg-muted/10 flex items-center justify-between">
                <div className="text-xs text-muted-foreground font-body">
                  Showing all {filtered.length} stores
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMore(false)}
                  className="text-[10px] font-bold uppercase tracking-widest px-4 font-body"
                >
                  Show Less
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default StoreNetwork;

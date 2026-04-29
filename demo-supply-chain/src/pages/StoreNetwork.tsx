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
  
  // If showMore is false, only show 5. If true, show the current page.
  const pagedData = showMore 
    ? filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : filtered.slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-5 max-w-7xl mx-auto pb-10 px-4 md:px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Store Network</h1>
            <p className="text-sm text-muted-foreground mt-0.5 font-body">
              {simulator.stores.length} stores across {Object.keys(REGION_COUNTS).length} strategic regions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-[11px] font-bold text-muted-foreground font-body uppercase tracking-wider">Pan-India Coverage</span>
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
                : "bg-card border-border/40 shadow-sm hover:border-primary/40"
                }`}
            >
              <p className="text-xl font-bold font-display">{count}</p>
              <p className="text-[11px] font-semibold mt-1 font-body leading-tight">{region}</p>
            </button>
          ))}
        </div>

        {/* Segment breakdown — compact pill strip */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest shrink-0">Segments:</span>
          {Object.entries(SEGMENT_COUNTS).map(([seg, count]) => (
            <button
              key={seg}
              onClick={() => setSelectedSegment(selectedSegment === seg ? "All" : seg)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold font-body transition-all ${
                selectedSegment === seg
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {seg}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${selectedSegment === seg ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {count}
              </span>
            </button>
          ))}
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
          <span className="text-xs text-muted-foreground font-body ml-auto">
            {filtered.length} stores found
          </span>
        </div>

        {/* Store Table */}
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
                {pagedData.length > 0 ? (
                  pagedData.map((store, i) => (
                    <tr key={store.id} className={`border-b border-border/20 hover:bg-muted/5 transition-colors ${i % 2 === 0 ? "" : "bg-muted/5"}`}>
                      <td className="p-3 pl-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground truncate">{store.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{store.id} · {store.city}</span>
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-muted-foreground font-body italic">
                      No stores found matching these criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Conditional Footer: Show More vs Pagination */}
          {!showMore && filtered.length > 5 ? (
            <div className="p-6 border-t border-border/20 bg-muted/5 flex justify-center">
              <Button 
                onClick={() => setShowMore(true)}
                className="ai-gradient text-white h-10 px-8 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
              >
                Show {filtered.length - 5} More Stores
              </Button>
            </div>
          ) : showMore && totalPages > 1 ? (
            <div className="p-4 border-t border-border/20 bg-muted/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-xs text-muted-foreground font-body">
                  Showing <span className="font-bold text-foreground">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to <span className="font-bold text-foreground">{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</span> of <span className="font-bold text-foreground">{filtered.length}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMore(false)}
                  className="text-[10px] font-bold uppercase tracking-widest px-2 font-body text-primary h-7"
                >
                  Show Less
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="h-8 text-[10px] font-bold uppercase tracking-wider"
                >
                  Prev
                </Button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`h-8 w-8 rounded-lg text-[10px] font-bold transition-all ${
                        currentPage === i + 1 
                          ? "bg-primary text-primary-foreground" 
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
                  className="h-8 text-[10px] font-bold uppercase tracking-wider"
                >
                  Next
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

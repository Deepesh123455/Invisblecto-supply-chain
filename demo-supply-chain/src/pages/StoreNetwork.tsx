import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { DataSimulator, CITY_COORDINATES, Store } from "@/lib/engine";
import { MapPin, Search, Globe, TrendingUp, TrendingDown, ArrowRight, X, Info, Plus, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from "react-simple-maps";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-50m.json";


const INDIA_FEATURES = feature(worldAtlas, worldAtlas.objects.countries).features
  .filter((f: any) => String(f.id) === "356");

// Indian state centroids for map labels
const INDIA_STATE_LABELS: { name: string; short: string; coords: [number, number] }[] = [
  { name: "Rajasthan", short: "RJ", coords: [73.8, 27.0] },
  { name: "Uttar Pradesh", short: "UP", coords: [80.9, 27.0] },
  { name: "Maharashtra", short: "MH", coords: [76.4, 19.5] },
  { name: "Madhya Pradesh", short: "MP", coords: [78.6, 23.5] },
  { name: "Karnataka", short: "KA", coords: [76.8, 15.0] },
  { name: "Gujarat", short: "GJ", coords: [71.8, 22.3] },
  { name: "West Bengal", short: "WB", coords: [87.5, 23.8] },
  { name: "Tamil Nadu", short: "TN", coords: [78.5, 11.2] },
  { name: "Andhra Pradesh", short: "AP", coords: [79.7, 14.5] },
  { name: "Telangana", short: "TG", coords: [79.5, 17.8] },
  { name: "Odisha", short: "OD", coords: [84.5, 20.5] },
  { name: "Chhattisgarh", short: "CG", coords: [82.2, 21.3] },
  { name: "Kerala", short: "KL", coords: [76.5, 10.5] },
  { name: "Punjab", short: "PB", coords: [75.4, 31.1] },
  { name: "Haryana", short: "HR", coords: [76.1, 29.2] },
  { name: "Bihar", short: "BR", coords: [85.6, 25.6] },
  { name: "Jharkhand", short: "JH", coords: [85.3, 23.6] },
  { name: "Assam", short: "AS", coords: [92.9, 26.2] },
  { name: "Himachal Pradesh", short: "HP", coords: [77.2, 31.8] },
  { name: "Uttarakhand", short: "UK", coords: [79.4, 30.2] },
];

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
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [hoveredStore, setHoveredStore] = useState<Store | null>(null);
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([80, 22]);

  const handleZoomIn = () => {
    if (zoom >= 4) return;
    setZoom(z => z * 1.5);
  };

  const handleZoomOut = () => {
    if (zoom <= 1) return;
    setZoom(z => z / 1.5);
  };

  useEffect(() => {
    setCurrentPage(1);
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

  const pagedData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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



        {/* Enterprise Control Panel */}
        <div className="bg-card border border-border/40 rounded-2xl p-4 md:p-6 card-shadow space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search network by name, ID, or city..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 h-12 bg-background/50 border-border/60 focus:border-primary/50 rounded-xl font-body text-sm transition-all shadow-sm"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Region</span>
                <div className="flex bg-muted/30 p-1 rounded-xl border border-border/20">
                  {["All", "North India", "South India", "West India", "East India"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRegion(r)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        selectedRegion === r ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {r === "All" ? "All Regions" : r.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Segment</span>
                <div className="flex bg-muted/30 p-1 rounded-xl border border-border/20">
                  {["All", "Tier 1 Metro", "Tier 2 Emerging", "Heritage Bazaar"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSegment(s)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        selectedSegment === s ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s === "All" ? "All Segments" : s.split(" ").slice(0, 2).join(" ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- INTERACTIVE NETWORK MAP --- */}
        <div className="bg-card border border-border/40 rounded-3xl overflow-hidden card-shadow relative" style={{ height: '650px' }}>
          <div className="absolute top-6 left-6 z-10 space-y-1">
            <h3 className="text-sm font-bold text-foreground font-display flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> Live Network Visualization
            </h3>
            <p className="text-[10px] text-muted-foreground font-body uppercase tracking-widest">Interactive Store Distribution</p>
          </div>

          <div className="absolute top-24 left-6 z-[1000] flex flex-col gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              className="h-9 w-9 rounded-xl bg-background/80 backdrop-blur-md border-border/40 shadow-lg hover:bg-primary/10 hover:text-primary transition-all"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              className="h-9 w-9 rounded-xl bg-background/80 backdrop-blur-md border-border/40 shadow-lg hover:bg-primary/10 hover:text-primary transition-all"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => { setZoom(1); setCenter([80, 22]); }}
              className="h-9 w-9 rounded-xl bg-background/80 backdrop-blur-md border-border/40 shadow-lg hover:bg-primary/10 hover:text-primary transition-all"
            >
              <Globe className="h-4 w-4" />
            </Button>
          </div>

          <div className="absolute bottom-6 right-6 z-[1000] bg-background/80 backdrop-blur-md border border-border/40 p-3 rounded-xl shadow-xl space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Tier 1 Metro</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success shadow-[0_0_8px_rgba(var(--success),0.6)]" />
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Tier 2 Emerging</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-warning shadow-[0_0_8px_rgba(var(--warning),0.6)]" />
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Heritage Bazaar</span>
            </div>
          </div>

          <div className="w-full h-full min-h-[600px] flex items-center justify-center overflow-hidden">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 1050,
              }}
              style={{ width: "100%", height: "100%" }}
            >
              <ZoomableGroup
                zoom={zoom}
                center={center}
                onMoveEnd={({ zoom, coordinates }) => {
                  setZoom(zoom);
                  setCenter(coordinates as [number, number]);
                }}
              >
                <Geographies geography={{ type: "FeatureCollection", features: INDIA_FEATURES }}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#e8e4de"
                      stroke="#333333"
                      strokeWidth={1}
                      style={{
                        default: { outline: "none", fill: "#e8e4de", stroke: "#333333" },
                        hover: { outline: "none", fill: "#d4c9bb", stroke: "#111" },
                        pressed: { outline: "none" }
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* Pass 1: all non-hovered markers (renders underneath) */}
              {simulator.stores.map((store) => {
                const baseCoords = CITY_COORDINATES[store.city];
                if (!baseCoords) return null;
                
                // Add deterministic spiral jitter based on store ID to avoid overlap
                const idNum = parseInt(store.id.split('-')[1]) || 0;
                const angle = (idNum * 137.5) * (Math.PI / 180); // Golden angle for organic spread
                const radius = 0.25; // Base spread in degrees
                const coords: [number, number] = [
                  baseCoords[0] + Math.cos(angle) * radius,
                  baseCoords[1] + Math.sin(angle) * radius
                ];

                if (hoveredStore?.id === store.id) return null; // skip hovered
                const isActive = selectedStore?.id === store.id;
                const isFiltered = (selectedRegion !== "All" && store.region !== selectedRegion) || (selectedSegment !== "All" && store.segment !== selectedSegment);
                const color = store.segment.includes("Tier 1") ? "#b07d3a" : store.segment.includes("Tier 2") ? "#4a7c59" : "#c28d4b";
                
                // Responsive marker size
                const baseR = isActive ? 7 : 4.5;
                const markerR = baseR / Math.pow(zoom, 0.2); 

                return (
                  <Marker key={store.id} coordinates={coords} onClick={() => setSelectedStore(store)}>
                    <g onMouseEnter={() => setHoveredStore(store)} onMouseLeave={() => setHoveredStore(null)} style={{ cursor: 'pointer' }}>
                      <circle r={markerR} fill={color} stroke="#fff" strokeWidth={isActive ? 2 : 1.5}
                        opacity={isFiltered ? 0.2 : 1}
                        style={{ filter: isActive ? `drop-shadow(0 0 6px ${color})` : '' }}
                      />
                      {isActive && (
                        <text textAnchor="middle" y={-14}
                          style={{ fontFamily: 'Outfit,sans-serif', fontSize: '8px', fontWeight: 700, fill: '#1c1917', pointerEvents: 'none' }}
                        >
                          {store.city}
                        </text>
                      )}
                    </g>
                  </Marker>
                );
              })}

              {/* State Name Labels - Rendered after dots to be visible on top */}
              {INDIA_STATE_LABELS.map((state) => (
                <Marker key={state.name} coordinates={state.coords}>
                  <g style={{ pointerEvents: 'none' }}>
                    <text
                      textAnchor="middle"
                      y={0}
                      style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '7px',
                        fontWeight: 600,
                        fill: '#666',
                        stroke: '#fff',
                        strokeWidth: 2,
                        strokeLinejoin: 'round',
                        paintOrder: 'stroke',
                        letterSpacing: '0.06em',
                        pointerEvents: 'none'
                      }}
                    >
                      {state.name.toUpperCase()}
                    </text>
                  </g>
                </Marker>
              ))}

              {/* Pass 2: Tooltips for Hovered OR Search Matches (rendered LAST) */}
              {simulator.stores.map((store) => {
                const baseCoords = CITY_COORDINATES[store.city];
                if (!baseCoords) return null;
                
                // Add deterministic spiral jitter based on store ID to avoid overlap
                const idNum = parseInt(store.id.split('-')[1]) || 0;
                const angle = (idNum * 137.5) * (Math.PI / 180);
                const radius = 0.25;
                const coords: [number, number] = [
                  baseCoords[0] + Math.cos(angle) * radius,
                  baseCoords[1] + Math.sin(angle) * radius
                ];
                
                // Show tooltip if hovered OR if searching and this store is a match
                const isMatch = search.length > 1 && filtered.some(s => s.id === store.id);
                const isHovered = hoveredStore?.id === store.id;
                
                if (!isMatch && !isHovered) return null;

                const isActive = selectedStore?.id === store.id;
                const color = store.segment.includes("Tier 1") ? "#b07d3a" : store.segment.includes("Tier 2") ? "#4a7c59" : "#c28d4b";
                
                return (
                  <Marker key={`overlay-${store.id}`} coordinates={coords} onClick={() => setSelectedStore(store)}>
                    <g onMouseEnter={() => setHoveredStore(store)} onMouseLeave={() => setHoveredStore(null)} style={{ cursor: 'pointer' }}>
                      {/* Tooltip always on top */}
                      <g style={{ pointerEvents: 'none' }}>
                        <rect x={-70} y={-100} width={140} height={74} rx={8} ry={8}
                          fill="#ffffff" stroke="#e0dbd4" strokeWidth={1}
                          style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.18))' }}
                        />
                        <polygon points="0,-26 -6,-28 6,-28" fill="#ffffff" stroke="#e0dbd4" strokeWidth={1} />
                        <text textAnchor="middle" x={0} y={-82}
                          style={{ fontFamily: 'Outfit,sans-serif', fontSize: '9px', fontWeight: 700, fill: '#1c1917' }}
                        >
                          {store.name.length > 22 ? store.name.slice(0, 20) + '…' : store.name}
                        </text>
                        <text textAnchor="middle" x={0} y={-69}
                          style={{ fontFamily: 'monospace', fontSize: '7px', fill: '#78716c' }}
                        >
                          {store.id}
                        </text>
                        <line x1={-58} y1={-62} x2={58} y2={-62} stroke="#e8e4de" strokeWidth={0.8} />
                        <text textAnchor="middle" x={0} y={-52}
                          style={{ fontFamily: 'Outfit,sans-serif', fontSize: '7px', fill: '#888' }}
                        >
                          📍 {store.city} · {store.region}
                        </text>
                        <rect x={-48} y={-46} width={96} height={12} rx={4} fill={color} opacity={0.12} />
                        <text textAnchor="middle" x={0} y={-37}
                          style={{ fontFamily: 'Outfit,sans-serif', fontSize: '7px', fontWeight: 700, fill: color }}
                        >
                          {store.segment.toUpperCase()}
                        </text>
                      </g>
                      <circle r={(isActive ? 8 : 5) / Math.pow(zoom, 0.2)} fill={color} stroke="#fff" strokeWidth={isActive ? 2 : 1.5}
                        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                      />
                    </g>
                  </Marker>
                );
              })}
              </ZoomableGroup>
            </ComposableMap>
          </div>
        </div>

        {/* Enterprise Store Inventory Table */}
        <div className="bg-card border border-border/40 rounded-2xl overflow-hidden card-shadow animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="p-5 border-b border-border/40 flex items-center justify-between bg-muted/10">
            <div>
              <h3 className="text-sm font-bold text-foreground font-display uppercase tracking-widest">Store Inventory Network</h3>
              <p className="text-[10px] text-muted-foreground font-body mt-1">Showing <span className="text-foreground font-bold">{filtered.length}</span> active distribution nodes</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold rounded-lg gap-2">
                Export CSV
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30">
                  <th className="text-left p-4 pl-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-body border-b border-border/20">Entity</th>
                  <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-body border-b border-border/20">Location</th>
                  <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-body border-b border-border/20">Segment</th>
                  <th className="text-right p-4 pr-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-body border-b border-border/20">Performance Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {pagedData.length > 0 ? (
                  pagedData.map((store) => (
                    <tr key={store.id} onClick={() => setSelectedStore(store)} className="group hover:bg-primary/5 transition-all cursor-pointer">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border border-border/20 shadow-sm ${REGION_COLORS[store.region] || "bg-muted"}`}>
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{store.name}</span>
                            <span className="text-[9px] text-muted-foreground font-mono uppercase">{store.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-foreground">{store.city}</span>
                          <span className="text-[10px] text-muted-foreground">{store.region}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted/50 text-[10px] font-bold text-muted-foreground border border-border/40 uppercase tracking-tighter">
                          {store.segment}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold font-display ${store.historicPerformance >= 0.75 ? "text-success" : "text-warning"}`}>
                              {(store.historicPerformance * 100).toFixed(0)}%
                            </span>
                            {store.historicPerformance >= 0.75 ? <TrendingUp className="h-3 w-3 text-success" /> : <TrendingDown className="h-3 w-3 text-warning" />}
                          </div>
                          <div className="w-16 h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                            <div className={`h-full rounded-full ${store.historicPerformance >= 0.75 ? "bg-success" : "bg-warning"}`} style={{ width: `${store.historicPerformance * 100}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-muted-foreground font-body italic">
                      No network nodes found matching current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-border/20 bg-muted/5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest">
                  Prev
                </Button>
                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest">
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

      {/* Store Detail Modal */}
      {selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedStore(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-card border border-border/60 rounded-3xl p-6 shadow-2xl w-full max-w-lg animate-fade-up"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedStore(null)}
              className="absolute top-4 right-4 h-9 w-9 rounded-full hover:bg-muted/50 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className={`h-16 w-16 rounded-2xl flex items-center justify-center border border-border/20 shadow-lg ${REGION_COLORS[selectedStore.region] || "bg-muted"}`}>
                <MapPin className="h-8 w-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-foreground leading-tight">{selectedStore.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono text-muted-foreground tracking-tighter uppercase">{selectedStore.id}</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{selectedStore.segment}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-muted/20 p-3 rounded-2xl border border-border/20">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">City</p>
                <p className="text-sm font-bold text-foreground">{selectedStore.city}</p>
              </div>
              <div className="bg-muted/20 p-3 rounded-2xl border border-border/20">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Region</p>
                <p className="text-sm font-bold text-foreground">{selectedStore.region}</p>
              </div>
              <div className="bg-muted/20 p-3 rounded-2xl border border-border/20">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Country</p>
                <p className="text-sm font-bold text-foreground">{selectedStore.country}</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/40">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <TrendingUp className="h-3 w-3 text-success" /> Sell-Through Efficiency
                  </p>
                  <span className={`text-lg font-bold font-display ${selectedStore.historicPerformance >= 0.75 ? "text-success" : "text-warning"}`}>
                    {(selectedStore.historicPerformance * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${selectedStore.historicPerformance >= 0.75 ? "bg-success" : "bg-warning"}`}
                    style={{ width: `${selectedStore.historicPerformance * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl">
                <div className="flex items-start gap-3">
                  <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-primary mb-1">Performance Insight</p>
                    <p className="text-[11px] text-primary/80 font-body leading-relaxed">
                      This store is currently performing <span className="font-bold underline">{selectedStore.historicPerformance >= 0.75 ? "above" : "at"} target</span>.
                      Inventory turnover is optimized for {selectedStore.segment} dynamics in the {selectedStore.region}.
                    </p>
                  </div>
                </div>
              </div>

              <Button className="w-full h-12 rounded-xl ai-gradient text-white font-bold text-xs uppercase tracking-widest gap-2 shadow-lg shadow-primary/20">
                Open Store Command <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  </AppLayout>
  );
};

export default StoreNetwork;

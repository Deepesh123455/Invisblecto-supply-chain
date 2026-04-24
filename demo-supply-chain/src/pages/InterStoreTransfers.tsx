import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowRight, Check, X,
  TrendingUp, Package,
  Zap, Search, ChevronRight,
  RotateCcw, Info, DollarSign, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DataSimulator
} from "@/lib/engine";
import { motion, AnimatePresence } from "framer-motion";

const simulator = new DataSimulator();

const REGION_TABS = ["All Regions", "North India", "South India", "West India", "East India", "International"];

const InterStoreTransfers = () => {
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [search, setSearch] = useState("");
  const [approved, setApproved] = useState<Record<string, string>>({});
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const transferOpportunities = useMemo(() => {
    return simulator.demoTransfers.filter(t =>
      (selectedRegion === "All Regions" || t.fromRegion === selectedRegion || t.toRegion === selectedRegion) &&
      (!search ||
        t.skuName.toLowerCase().includes(search.toLowerCase()) ||
        t.fromCity.toLowerCase().includes(search.toLowerCase()) ||
        t.toCity.toLowerCase().includes(search.toLowerCase()))
    ).sort((a, b) => b.costSaving - a.costSaving);
  }, [selectedRegion, search]);

  const totalSavings = transferOpportunities
    .filter(t => !approved[t.id])
    .reduce((acc, t) => acc + t.costSaving, 0);

  const totalRevenueAtRisk = transferOpportunities
    .filter(t => !approved[t.id])
    .reduce((acc, t) => acc + t.potentialRevenueSaved, 0);

  const handleAction = (id: string, action: string) => {
    setApproved(prev => ({ ...prev, [id]: action }));
  };

  const handleBulkApprove = () => {
    const newApproved = { ...approved };
    transferOpportunities.forEach(t => {
      if (!newApproved[t.id]) newApproved[t.id] = "approved";
    });
    setApproved(newApproved);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12 px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-warning animate-pulse-soft" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-warning font-body">Proactive Rebalancing</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Inter-store Transfers</h1>
            <p className="text-sm text-muted-foreground mt-1 font-body">
              Balancing inventory across {simulator.stores.length} stores by moving excess stock to high-demand locations
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleBulkApprove} className="ai-gradient text-white h-10 px-6 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20">
              Bulk Approve All ({transferOpportunities.filter(t => !approved[t.id]).length})
            </Button>
          </div>
        </div>

        {/* ROI Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-card border card-shadow p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <DollarSign className="h-16 w-16" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-body">Logistics Cost Savings</p>
            <p className="text-2xl font-bold text-success font-display mt-1">₹{totalSavings.toLocaleString("en-IN")}</p>
            <p className="text-[10px] text-muted-foreground font-body mt-1 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> vs. regular warehouse dispatch
            </p>
          </div>
          <div className="rounded-2xl bg-card border card-shadow p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <TrendingUp className="h-16 w-16" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-body">Revenue Protection</p>
            <p className="text-2xl font-bold text-primary font-display mt-1">₹{totalRevenueAtRisk.toLocaleString("en-IN")}</p>
            <p className="text-[10px] text-muted-foreground font-body mt-1">Potential sales saved from stock-outs</p>
          </div>
          <div className="rounded-2xl bg-card border card-shadow p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <RotateCcw className="h-16 w-16" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-body">Transfer Efficiency</p>
            <p className="text-2xl font-bold text-foreground font-display mt-1">92%</p>
            <p className="text-[10px] text-muted-foreground font-body mt-1">Optimized for lowest total routing & handling cost</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-card/40 p-4 rounded-2xl border border-border/40 backdrop-blur-sm">
          <div className="flex items-center gap-1 bg-muted/50 border border-border/40 p-1 rounded-xl overflow-x-auto w-full md:w-auto">
            {REGION_TABS.map(region => (
              <Button
                key={region}
                variant={selectedRegion === region ? "secondary" : "ghost"}
                size="sm"
                className="text-[10px] h-8 px-4 shrink-0 font-body"
                onClick={() => setSelectedRegion(region)}
              >
                {region}
              </Button>
            ))}
          </div>
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search SKU or Store..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-10 font-body text-sm rounded-xl"
            />
          </div>
        </div>

        {/* Main List */}
        <div className="rounded-2xl bg-card border card-shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 bg-muted/20">
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground font-body py-4 pl-6">Recommended Transfer</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground font-body text-center">Product SKU</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground font-body text-center">Units</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground font-body text-center">ROI / Savings</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground font-body text-center">Status</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground font-body text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {transferOpportunities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-40">
                        <Package className="h-12 w-12" />
                        <p className="text-sm font-medium font-body">No transfer opportunities found for these filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  transferOpportunities.map((op) => {
                    const isApproved = approved[op.id];
                    const isExpanded = expandedRow === op.id;

                    return (
                      <>
                        <TableRow
                          key={op.id}
                          className={`border-border/20 hover:cursor-pointer transition-all ${isApproved ? "opacity-50" : "hover:bg-muted/5"} ${isExpanded ? "bg-muted/10 selection-none" : ""}`}
                        >
                          <TableCell className="py-4 pl-6" onClick={() => setExpandedRow(isExpanded ? null : op.id)}>
                            <div className="flex items-center gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-bold text-foreground truncate">{op.fromCity}</span>
                                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                  <span className="text-sm font-bold text-foreground truncate">{op.toCity}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-muted-foreground font-body uppercase bg-muted/60 px-1.5 py-0.5 rounded tracking-tighter">
                                    {op.distance}km · {op.leadTimeDays}d Transit
                                  </span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center" onClick={() => setExpandedRow(isExpanded ? null : op.id)}>
                            <div className="text-xs font-semibold text-foreground">{op.skuName}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{op.skuId}</div>
                          </TableCell>
                          <TableCell className="text-center" onClick={() => setExpandedRow(isExpanded ? null : op.id)}>
                            <div className="text-sm font-bold text-primary">{op.units[0]}–{op.units[1]}</div>
                            <div className="text-[10px] text-muted-foreground font-body">units</div>
                          </TableCell>
                          <TableCell className="text-center" onClick={() => setExpandedRow(isExpanded ? null : op.id)}>
                            <div className="text-sm font-bold text-success">₹{op.costSaving.toLocaleString("en-IN")}</div>
                            <div className="text-[10px] text-muted-foreground font-body">saved in shipping</div>
                          </TableCell>
                          <TableCell className="text-center" onClick={() => setExpandedRow(isExpanded ? null : op.id)}>
                            {!isApproved ? (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border font-body ${op.priority === "Critical" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-warning/10 text-warning border-warning/20"
                                }`}>
                                {op.priority === "Critical" && <Zap className="h-3 w-3" />}
                                {op.priority}
                              </span>
                            ) : (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border font-body ${isApproved === "approved" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-border"
                                }`}>
                                {isApproved === "approved" ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                {isApproved.toUpperCase()}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            {!isApproved ? (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  className="h-8 w-8 rounded-lg bg-success/10 text-success border border-success/20 hover:bg-success hover:text-white transition-all shadow-sm"
                                  onClick={(e) => { e.stopPropagation(); handleAction(op.id, "approved"); }}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 rounded-lg text-muted-foreground"
                                  onClick={(e) => { e.stopPropagation(); handleAction(op.id, "dismissed"); }}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 rounded-lg text-muted-foreground"
                                  onClick={(e) => { e.stopPropagation(); setExpandedRow(isExpanded ? null : op.id); }}
                                >
                                  <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-[11px] font-bold text-primary font-body"
                                onClick={(e) => { e.stopPropagation(); setApproved(prev => { const n = { ...prev }; delete n[op.id]; return n; }); }}
                              >
                                UNDO
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>

                        <AnimatePresence>
                          {isExpanded && (
                            <TableRow key={`${op.id}-detail`} className="bg-muted/5 border-none">
                              <TableCell colSpan={6} className="py-6 px-10">
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="grid grid-cols-1 md:grid-cols-3 gap-8"
                                >
                                  <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4 font-body flex items-center gap-2">
                                      <Info className="h-3 w-3" /> Decision Driver
                                    </h4>
                                    <div className="space-y-3">
                                      <div className="p-3 rounded-xl bg-card border border-border/40">
                                        <p className="text-xs font-semibold text-foreground mb-1">{op.fromCity} (Donor Store)</p>
                                        <p className="text-[10px] text-muted-foreground font-body">Current WOC: <span className="text-success font-bold">8.4 weeks</span> (Excessive)</p>
                                        <p className="text-[10px] text-muted-foreground font-body">After transfer: <span className="text-foreground">5.2 weeks</span> (Healthy)</p>
                                      </div>
                                      <div className="p-3 rounded-xl bg-card border border-border/40">
                                        <p className="text-xs font-semibold text-foreground mb-1">{op.toCity} (Recipient Store)</p>
                                        <p className="text-[10px] text-muted-foreground font-body">Current WOC: <span className="text-destructive font-bold">0.8 weeks</span> (At Risk)</p>
                                        <p className="text-[10px] text-muted-foreground font-body">After transfer: <span className="text-foreground">2.4 weeks</span> (Satisfactory)</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="col-span-2">
                                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4 font-body">
                                      Size-wise Breakdown Recommendation
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                      {["XS", "S", "M", "L", "XL"].map(size => {
                                        const baseQty = Math.floor(op.units[0] / 5);
                                        return (
                                          <div key={size} className="p-3 rounded-xl bg-card border border-border/40 text-center">
                                            <p className="text-[10px] font-bold text-muted-foreground font-body">{size}</p>
                                            <p className="text-sm font-bold text-foreground">{baseQty}–{baseQty + 5}</p>
                                            <p className="text-[9px] text-muted-foreground font-body mt-1">units</p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    <div className="mt-6 p-4 rounded-xl bg-primary text-primary-foreground">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Zap className="h-4 w-4" />
                                        <p className="text-xs font-bold font-body uppercase tracking-wider">AI Strategy Note</p>
                                      </div>
                                      <p className="text-xs leading-relaxed opacity-90 font-body">
                                        Transfer suggested because both stores share identical regional size curves. Local courier transit cost (₹1,800) is significantly lower than warehouse picking, packing and freight costs (expected ₹10,200).
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>
                              </TableCell>
                            </TableRow>
                          )}
                        </AnimatePresence>
                      </>
                    );
                  })
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
};

export default InterStoreTransfers;

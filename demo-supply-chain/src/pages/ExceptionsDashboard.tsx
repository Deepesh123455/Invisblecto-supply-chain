// import { useMemo, useState } from "react";
// import { AppLayout } from "@/components/AppLayout";
// import {
//   AlertTriangle, CheckCircle2,
//   Sparkles, Zap, ShieldAlert,
//   RotateCcw, Tag, Package, Database,
//   MoreHorizontal, History
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { motion, AnimatePresence } from "framer-motion";
// import { DataSimulator } from "@/lib/engine";

// const simulator = new DataSimulator();

// type ExceptionType = "Stock-out" | "Data Integrity" | "New Launch" | "Markdown" | "Transfer" | "Reorder";
// type Severity = "Critical" | "High" | "Medium";

// interface Exception {
//   id: string;
//   type: ExceptionType;
//   severity: Severity;
//   title: string;
//   description: string;
//   action: string;
//   icon: React.ElementType;
//   color: string;
//   bg: string;
//   store?: string;
//   sku?: string;
//   detail?: string;
// }

// const FILTER_TYPES: (ExceptionType | "All")[] = ["All", "Stock-out", "Data Integrity", "New Launch", "Markdown", "Transfer", "Reorder"];

// const ExceptionsDashboard = () => {
//   const [resolved, setResolved] = useState<Record<string, boolean>>({});
//   const [activeFilter, setActiveFilter] = useState<ExceptionType | "All">("All");

//   const exceptions = useMemo<Exception[]>(() => {
//     const list: Exception[] = [];

//     // 1. Critical stock-outs (from engine data)
//     simulator.skus.slice(0, 1).forEach(sku => {
//       const history = simulator.history.filter(h => h.skuId === sku.id);
//       simulator.stores.slice(0, 4).forEach(store => {
//         const storeHist = history.filter(h => h.storeId === store.id);
//         const lastEntry = storeHist[storeHist.length - 1];
//         if (lastEntry && lastEntry.closingStock <= 2) {
//           list.push({
//             id: `EX-SO-${sku.id}-${store.id}`,
//             type: "Stock-out",
//             severity: lastEntry.closingStock === 0 ? "Critical" : "High",
//             title: `${sku.name} OOS — ${store.city}`,
//             description: `Zero units on shelf at ${store.name}. Estimated lost revenue: ₹${(Math.random() * 15000 + 5000).toFixed(0)}/day. Suggest air-freight or inter-store transfer.`,
//             action: "Approve Dispatch",
//             icon: ShieldAlert,
//             color: "text-destructive",
//             bg: "bg-destructive/10",
//             store: store.name,
//             sku: sku.id,
//             detail: `WOC: 0 · Region: ${store.region}`,
//           });
//         }
//       });
//     });

//     // 2. Reconciliation failures
//     simulator.stores.slice(3, 4).forEach((store, i) => {
//       list.push({
//         id: `EX-REC-${store.id}`,
//         type: "Data Integrity",
//         severity: "High",
//         title: `Inventory Mismatch — ${store.name}`,
//         description: `Opening (${50 + i * 10}) + Purchased (20) − Sold (${15 + i * 3}) ≠ Closing (${52 + i * 5}). Discrepancy of ${3 + i} units found. Requires manual reconciliation before next forecast run.`,
//         action: "Reconcile Data",
//         icon: Database,
//         color: "text-warning",
//         bg: "bg-warning/10",
//         store: store.name,
//         detail: `Discrepancy: ${3 + i} units`,
//       });
//     });

//     // 3. New product - no history
//     list.push({
//       id: "EX-NEW-001",
//       type: "New Launch",
//       severity: "Medium",
//       title: "New SKU Setup — Summer Silk Blend",
//       description: "SKU-2009 'Summer Silk Blend' has no sales history. System needs a reference SKU to map forecast. Please confirm analogue product from last season.",
//       action: "Set Reference SKU",
//       icon: Zap,
//       color: "text-primary",
//       bg: "bg-primary/10",
//       sku: "SKU-2009",
//       detail: "Model: Analogue SKU Mapping (pending confirmation)",
//     });

//     // 4. Markdown recommendations
//     simulator.skus.slice(4, 5).forEach((sku, i) => {
//       const store = simulator.stores[i + 5];
//       list.push({
//         id: `EX-MD-${sku.id}`,
//         type: "Markdown",
//         severity: "Medium",
//         title: `Markdown Required — ${sku.name}`,
//         description: `${store?.city} store has ${8 + i * 2} weeks of cover remaining but only ${6 - i} selling weeks left in season. System recommends ${15 + i * 5}-${20 + i * 5}% discount to clear stock.`,
//         action: "Approve Markdown",
//         icon: Tag,
//         color: "text-warning",
//         bg: "bg-warning/10",
//         store: store?.name,
//         sku: sku.id,
//         detail: `WOC: ${8 + i * 2}w · Season ends in ${6 - i}w`,
//       });
//     });

//     // 5. High-value inter-store transfers (Pulled directly from real AI engine data)
//     const topTransfers = simulator.demoTransfers.slice(0, 1);
//     topTransfers.forEach((t, i) => {
//       list.push({
//         id: t.id,
//         type: "Transfer",
//         severity: t.priority === "Critical" ? "Critical" : "High",
//         title: `High-Value Transfer — ${t.skuName}`,
//         description: `${t.fromCity} → ${t.toCity}: ${t.units[0]}–${t.units[1]} units. Estimated value ₹${((t.units[1]) * t.unitCost / 1000).toFixed(0)}K. Exceeds auto-approval threshold — needs admin sign-off.`,
//         action: "Approve Transfer",
//         icon: RotateCcw,
//         color: "text-primary",
//         bg: "bg-primary/10",
//         store: `${t.fromCity} → ${t.toCity}`,
//         sku: t.skuId,
//         detail: `Saves ₹${t.costSaving.toLocaleString("en-IN")} vs warehouse dispatch`,
//       });
//     });

//     // 6. Low stock — reorder required
//     list.push({
//       id: "EX-PO-001",
//       type: "Reorder",
//       severity: "High",
//       title: "Reorder Required — Cotton Chinos Running Low",
//       description: "Cotton Chinos (SKU-2002) stock dropping below safe cover across 6 stores. System recommends raising a purchase order for 580–620 units to maintain 4-week cover. Order must be placed soon to account for lead time.",
//       action: "Raise Purchase Order",
//       icon: Package,
//       color: "text-primary",
//       bg: "bg-primary/10",
//       detail: "₹5.2L estimated · 4-week lead time · 6 stores at risk",
//     });

//     list.push({
//       id: "EX-PO-002",
//       type: "Reorder",
//       severity: "Critical",
//       title: "Urgent Restock — International Stores Running Empty",
//       description: "Dubai & Singapore stores will run out of Embroidered Kurta Set stock before June 1 at current sell-through rate. Replenishment shipment must be booked immediately — every day of delay increases logistics cost significantly.",
//       action: "Confirm Restock Order",
//       icon: AlertTriangle,
//       color: "text-destructive",
//       bg: "bg-destructive/10",
//       detail: "Critical · 240–280 units · Logistics booking window closing Apr 18",
//     });

//     return list;
//   }, []);

//   const filtered = useMemo(() =>
//     exceptions.filter(e => activeFilter === "All" || e.type === activeFilter),
//     [exceptions, activeFilter]);

//   const pending = filtered.filter(e => !resolved[e.id]);
//   const resolvedCount = Object.keys(resolved).length;
//   const critical = exceptions.filter(e => e.severity === "Critical" && !resolved[e.id]).length;

//   const handleResolve = (id: string) => setResolved(prev => ({ ...prev, [id]: true }));

//   const severityStyles: Record<Severity, string> = {
//     Critical: "bg-destructive/10 text-destructive border-destructive/20",
//     High: "bg-warning/10 text-warning border-warning/20",
//     Medium: "bg-primary/10 text-primary border-primary/20",
//   };

//   return (
//     <AppLayout>
//       <div className="space-y-6 max-w-5xl mx-auto pb-10 px-4 md:px-6">

//         {/* Header */}
//         <div className="flex justify-between items-end flex-col md:flex-row gap-4">
//           <div>
//             <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-wider mb-2 border border-destructive/20 font-body">
//               <ShieldAlert className="h-3 w-3" />
//               {critical > 0 ? `${critical} Critical Actions` : "Review Required"}
//             </div>
//             <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Exceptions Room</h1>
//             <p className="text-sm text-muted-foreground mt-1 font-body">
//               Human review for flagged decisions · Rest of the system runs automatically
//             </p>
//           </div>
//           <div className="text-right">
//             <div className="text-2xl font-display font-bold text-foreground">{pending.length} / {filtered.length}</div>
//             <div className="text-[10px] text-muted-foreground uppercase font-bold font-body">Unresolved · {activeFilter}</div>
//           </div>
//         </div>

//         {/* Filter tabs */}
//         <div className="flex items-center gap-1 flex-wrap">
//           {FILTER_TYPES.map(type => (
//             <button
//               key={type}
//               onClick={() => setActiveFilter(type)}
//               className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all font-body ${activeFilter === type
//                 ? "bg-primary text-primary-foreground border-primary"
//                 : "bg-card text-muted-foreground border-border hover:border-primary/50"
//                 }`}
//             >
//               {type}
//             </button>
//           ))}
//         </div>

//         {/* Exception Cards */}
//         <div className="grid grid-cols-1 gap-4">
//           <AnimatePresence>
//             {filtered.map((ex) =>
//               !resolved[ex.id] && (
//                 <motion.div
//                   key={ex.id}
//                   initial={{ opacity: 0, x: -16 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, scale: 0.96, x: 16 }}
//                   className={`group rounded-2xl bg-card border border-border/40 card-shadow overflow-hidden p-5 flex items-start gap-5 hover:border-border/80 transition-all ${ex.severity === "Critical" ? "border-l-4 border-l-destructive" :
//                     ex.severity === "High" ? "border-l-4 border-l-warning" : ""
//                     }`}
//                 >
//                   <div className={`p-3 rounded-xl ${ex.bg} shrink-0`}>
//                     <ex.icon className={`h-6 w-6 ${ex.color}`} />
//                   </div>

//                   <div className="flex-1 space-y-1 min-w-0">
//                     <div className="flex items-center justify-between gap-2 flex-wrap">
//                       <div className="flex items-center gap-2">
//                         <span className={`text-[10px] font-bold uppercase tracking-widest ${ex.color} font-body`}>{ex.type}</span>
//                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-body ${severityStyles[ex.severity]}`}>{ex.severity}</span>
//                       </div>
//                       <span className="text-[10px] text-muted-foreground font-mono">{ex.id}</span>
//                     </div>

//                     <h3 className="text-base font-semibold text-foreground">{ex.title}</h3>
//                     <p className="text-sm text-muted-foreground leading-relaxed font-body max-w-2xl">{ex.description}</p>

//                     {(ex.store || ex.detail) && (
//                       <div className="flex items-center gap-3 pt-1 flex-wrap">
//                         {ex.store && (
//                           <span className="text-[10px] font-body text-muted-foreground bg-muted px-2 py-0.5 rounded">{ex.store}</span>
//                         )}
//                         {ex.sku && (
//                           <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{ex.sku}</span>
//                         )}
//                         {ex.detail && (
//                           <span className="text-[10px] font-body text-muted-foreground">{ex.detail}</span>
//                         )}
//                       </div>
//                     )}

//                     <div className="pt-4 flex items-center gap-3 flex-wrap">
//                       <Button
//                         size="sm"
//                         className={`h-8 px-4 text-xs font-bold font-body ${ex.severity === "Critical" ? "bg-destructive hover:bg-destructive/90 text-white" : "ai-gradient text-white"
//                           }`}
//                         onClick={() => handleResolve(ex.id)}
//                       >
//                         {ex.action}
//                       </Button>
//                       <Button variant="ghost" size="sm" className="h-8 px-4 text-xs font-medium text-muted-foreground hover:text-foreground font-body">
//                         Request Info
//                       </Button>
//                       <Button variant="ghost" size="sm" className="h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground font-body">
//                         Escalate
//                       </Button>
//                     </div>
//                   </div>

//                   <div className="opacity-0 group-hover:opacity-100 transition-opacity">
//                     <Button variant="ghost" size="icon" className="h-8 w-8">
//                       <MoreHorizontal className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </motion.div>
//               )
//             )}
//           </AnimatePresence>

//           {pending.length === 0 && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="py-20 text-center space-y-4"
//             >
//               <div className="flex justify-center">
//                 <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
//                   <CheckCircle2 className="h-8 w-8 text-success" />
//                 </div>
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold">Inbox Zero</h3>
//                 <p className="text-sm text-muted-foreground font-body">All exceptions reviewed for this filter. Switch to "All" to see full list.</p>
//               </div>
//               <Button variant="outline" className="h-9 px-6 text-xs font-bold uppercase tracking-widest font-body" onClick={() => setActiveFilter("All")}>
//                 View All
//               </Button>
//             </motion.div>
//           )}
//         </div>

//         {/* Bottom Stats */}
//         <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
//           <div className="rounded-xl border border-border/40 p-4 bg-muted/20">
//             <div className="flex items-center gap-2 mb-2">
//               <History className="h-4 w-4 text-muted-foreground" />
//               <h4 className="text-[11px] font-bold uppercase text-muted-foreground font-body">Recent Actions</h4>
//             </div>
//             <p className="text-[10px] text-muted-foreground leading-relaxed font-body">
//               You resolved {resolvedCount} exception{resolvedCount !== 1 ? "s" : ""} this session. 14 dispatches auto-approved. 3 POs auto-raised.
//             </p>
//           </div>
//           <div className="rounded-xl border border-border/40 p-4 bg-muted/20">
//             <div className="flex items-center gap-2 mb-2">
//               <Zap className="h-4 w-4 text-primary" />
//               <h4 className="text-[11px] font-bold uppercase text-muted-foreground font-body">Automation Rate</h4>
//             </div>
//             <div className="flex items-baseline gap-2">
//               <span className="text-xl font-bold font-display">98.4%</span>
//               <span className="text-[10px] text-success font-bold font-body">+1.2% this week</span>
//             </div>
//             <p className="text-[10px] text-muted-foreground mt-1 font-body">Only {exceptions.length} of ~{exceptions.length * 50}+ decisions require human review</p>
//           </div>
//           <div className="rounded-xl border border-border/40 p-4 bg-primary text-primary-foreground">
//             <div className="flex items-center gap-2 mb-2">
//               <Sparkles className="h-4 w-4" />
//               <h4 className="text-[11px] font-bold uppercase font-body">AI Health</h4>
//             </div>
//             <p className="text-[10px] leading-relaxed opacity-90 font-body">
//               All forecast models are healthy. Data reconciliation passing in 62 of 65 stores. 3 stores pending audit.
//             </p>
//           </div>
//         </div>
//       </div>
//     </AppLayout>
//   );
// };

// export default ExceptionsDashboard;

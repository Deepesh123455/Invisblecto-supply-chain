import { Sparkles, Calendar, TrendingUp, History, Clock, Database, Wifi, MapPin, Zap } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const TRENDS = [
  {
    name: "Pastel Linens",
    status: "Market Breakout",
    statusClass: "status-success",
    interest: "High Growth",
    hubs: "West & South Zone",
    skus: 142,
    weekChange: "+18%",
    changeGood: true,
    reason: "Increased interest in light fabrics across Mumbai and Bangalore retail networks.",
    source: "YourCompany POS Transactions · Google Trends API · Vendor Sell-In Reports",
    sourceUpdated: "Last synced: 2h ago",
    confidence: "91%",
  },
  {
    name: "Cotton Coord Sets",
    status: "Trending Now",
    statusClass: "status-medium",
    interest: "High Traction",
    hubs: "North & West Zone",
    skus: 117,
    weekChange: "+14%",
    changeGood: true,
    reason: "Co-ord sets are the fastest growing ready-to-wear category across Indian fashion retail in Summer 2026, driven by Myntra, Nykaa Fashion, and D2C brand searches.",
    source: "Marketplace Search Trends (Myntra, Nykaa) · Store POS Data · Vendor Sell-In Reports",
    sourceUpdated: "Last synced: 3h ago",
    confidence: "87%",
  },
  {
    name: "Breathable Knits",
    status: "Popular",
    statusClass: "status-success",
    interest: "Strong Momentum",
    hubs: "All India",
    skus: 210,
    weekChange: "+9%",
    changeGood: true,
    reason: "Steady shift towards comfort-first apparel across all YourCompany urban centers.",
    source: "Pan-India POS Data · Customer Return Tags · Competitor Movement Index",
    sourceUpdated: "Last synced: 1h ago",
    confidence: "88%",
  },
  {
    name: "Eco-Friendly Cotton",
    status: "Emerging",
    statusClass: "status-high",
    interest: "Rising Interest",
    hubs: "Metro Hubs",
    skus: 63,
    weekChange: "+6%",
    changeGood: true,
    reason: "New customer preference for sustainable items in Tier-1 cities.",
    source: "Sustainability Survey — Apr 2026 · Store Feedback Loop · E-com Search Signals",
    sourceUpdated: "Last synced: 6h ago",
    confidence: "76%",
  },
];

const UPCOMING_EVENTS = [
  {
    name: "Early Monsoon Sale",
    date: "May 15 - May 22, 2026",
    spike: "20% - 30%",
    prevDate: "May 12 - May 25, 2025",
    prevSpike: "+22%",
    reason: "Based on 2025 historical patterns, umbrella and light cotton demand increases during this period.",
    priority: "High",
  },
  {
    name: "Weekend Clearance",
    date: "Jun 02, 2026",
    spike: "12% - 20%",
    prevDate: "Jun 04, 2025",
    prevSpike: "+12%",
    reason: "Monthly trend for clearing older stock batches across YourCompany network.",
    priority: "Medium",
  },
  {
    name: "Summer End Bash",
    date: "Jun 20 - Jun 30, 2026",
    spike: "35% - 45%",
    prevDate: "Jun 18 - Jun 28, 2025",
    prevSpike: "+38%",
    reason: "Major seasonal transition. High volume movement expected across North India stores.",
    priority: "Critical",
  },
];

export function WorkforceActivity() {
  return (
    <div className="rounded-xl bg-card border card-shadow p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-foreground">Growth Intelligence</h2>
          <p className="text-xs text-muted-foreground">Planning & Trends</p>
        </div>
        <div className="text-right p-3 rounded-xl bg-primary/5 border border-primary/10">
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mb-1">Total SKUs</p>
          <p className="text-2xl font-bold text-primary leading-none">2,450</p>
        </div>
      </div>

      {/* Emerging Trends */}
      <div className="mb-6">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="h-3 w-3" /> Emerging Trends (Est.)
        </h3>
        <div className="space-y-2">
          {TRENDS.map((trend, i) => (
            <Dialog key={trend.name}>
              <DialogTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="p-3 rounded-xl border border-l-4 border-l-primary/40 bg-card hover:bg-muted/30 transition-all cursor-pointer group"
                >
                  {/* Name + status badge */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {trend.name}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${trend.statusClass} uppercase tracking-wider`}>
                      {trend.status}
                    </span>
                  </div>
                  {/* Two key facts only */}
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5" />
                      {trend.hubs}
                    </span>
                    <span className="ml-auto font-bold text-success">{trend.weekChange} WoW</span>
                  </div>
                </motion.div>
              </DialogTrigger>

              {/* Dialog */}
              <DialogContent className="bg-card border-border shadow-2xl max-w-lg">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold">{trend.name}</DialogTitle>
                      <DialogDescription>Trend Analysis · Market Signal</DialogDescription>
                    </div>
                    <span className={`ml-auto text-[9px] font-bold px-2.5 py-1 rounded-full ${trend.statusClass} uppercase tracking-wider`}>
                      {trend.status}
                    </span>
                  </div>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                  {/* Why trending */}
                  <div className="p-4 rounded-xl border bg-muted/20">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Why this is trending</h4>
                    <p className="text-sm text-foreground leading-relaxed">{trend.reason}</p>
                  </div>

                  {/* Key metrics row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl border bg-card text-center">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">SKUs</p>
                      <p className="text-sm font-bold text-foreground">{trend.skus}</p>
                    </div>
                    <div className="p-3 rounded-xl border bg-card text-center">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">WoW Change</p>
                      <p className="text-sm font-bold text-success">{trend.weekChange}</p>
                    </div>
                    <div className="p-3 rounded-xl border bg-card text-center">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">AI Confidence</p>
                      <p className="text-sm font-bold text-primary">{trend.confidence}</p>
                    </div>
                  </div>

                  {/* Zone */}
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Coverage Zone</p>
                      <p className="text-sm font-bold text-primary">{trend.hubs}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Interest Level</p>
                      <p className="text-sm font-bold text-foreground">{trend.interest}</p>
                    </div>
                  </div>

                  {/* Data Source */}
                  <div className="p-4 rounded-xl border border-dashed border-border bg-muted/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data Sources</p>
                      <div className="ml-auto flex items-center gap-1">
                        <Wifi className="h-3 w-3 text-success" />
                        <span className="text-[9px] font-bold text-success">{trend.sourceUpdated}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{trend.source}</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>

      {/* Upcoming Spikes */}
      <div className="flex-1">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
          <Calendar className="h-3 w-3" /> Upcoming Sales Spikes (Forecast)
        </h3>
        <div className="space-y-3">
          {UPCOMING_EVENTS.map((event) => (
            <Dialog key={event.name}>
              <DialogTrigger asChild>
                <div className="relative pl-4 border-l-2 border-primary/30 hover:border-primary transition-colors cursor-pointer group pb-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{event.name}</h4>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      event.priority === "Critical" ? "status-critical" :
                      event.priority === "High" ? "status-high" : "status-medium"
                    }`}>
                      {event.spike} Spike
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{event.date}</p>
                </div>
              </DialogTrigger>

              <DialogContent className="bg-card border-border shadow-2xl">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <History className="h-5 w-5" />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-bold">{event.name}</DialogTitle>
                      <DialogDescription>Range-Based Demand Forecast</DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                  {/* Rationale */}
                  <div className="p-4 rounded-xl border bg-muted/10">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Pattern Rationale</h4>
                    <p className="text-sm text-foreground leading-relaxed">{event.reason}</p>
                  </div>

                  {/* Historical vs Forecast */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border bg-card space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <History className="h-3 w-3" /> 2025 Actual
                      </p>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Date</p>
                        <p className="text-xs font-bold text-foreground">{event.prevDate}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Spike</p>
                        <p className="text-sm font-bold text-foreground">{event.prevSpike}</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 flex items-center gap-1.5">
                        <Clock className="h-3 w-3" /> 2026 Forecast
                      </p>
                      <div>
                        <p className="text-[10px] text-primary/60">Est. Dates</p>
                        <p className="text-xs font-bold text-primary">{event.date}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-primary/60">Predicted Spike</p>
                        <p className="text-sm font-bold text-primary">{event.spike}</p>
                      </div>
                    </div>
                  </div>

                  {/* Data Source */}
                  <div className="p-4 rounded-xl border border-dashed border-border bg-muted/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data Sources</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      YourCompany Historical Sales DB (2023–2025) · Seasonal Demand Models · AI Forecast Engine v2.4
                    </p>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/10 border border-border">
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      Forecasts are ranges to account for variable market conditions and YourCompany's logistics capacity.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </div>
  );
}

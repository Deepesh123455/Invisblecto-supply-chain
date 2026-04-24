import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const kpis = [
  {
    label:    "Inventory at Risk",
    value:    "₹3.1L",
    sub:      "across 8 SKUs",
    trend:    "+8%",
    dir:      "up",
    bad:      true,
    color:    "text-destructive",
    bg:       "bg-destructive/10",
  },
  {
    label:    "Active Stockouts",
    value:    "4",
    sub:      "stores affected",
    trend:    "-1 vs last week",
    dir:      "down",
    bad:      false,
    color:    "text-warning",
    bg:       "bg-warning/10",
  },
  {
    label:    "Pending POs",
    value:    "2",
    sub:      "awaiting approval",
    trend:    "₹9.5L value",
    dir:      "flat",
    bad:      false,
    color:    "text-primary",
    bg:       "bg-primary/10",
  },
  {
    label:    "Monday Dispatches",
    value:    "6",
    sub:      "warehouse orders ready",
    trend:    "+1 vs last week",
    dir:      "up",
    bad:      false,
    color:    "text-success",
    bg:       "bg-success/10",
  },
  {
    label:    "Avg Sell-through",
    value:    "72.4%",
    sub:      "across all stores",
    trend:    "+2.1% this month",
    dir:      "up",
    bad:      false,
    color:    "text-success",
    bg:       "bg-success/10",
  },
  {
    label:    "Automation Rate",
    value:    "98.4%",
    sub:      "decisions automated",
    trend:    "+1.2% vs last week",
    dir:      "up",
    bad:      false,
    color:    "text-primary",
    bg:       "bg-primary/10",
  },
];

export function KpiCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((kpi, i) => {
        const TrendIcon =
          kpi.dir === "up"   ? TrendingUp   :
          kpi.dir === "down" ? TrendingDown :
          Minus;
        const trendColor =
          kpi.dir === "flat" ? "text-muted-foreground" :
          (kpi.dir === "up" && !kpi.bad) || (kpi.dir === "down" && kpi.bad) ? "text-success" :
          "text-destructive";

        return (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl bg-card border card-shadow p-4 hover:card-shadow-hover transition-shadow flex flex-col gap-2"
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${kpi.bg}`}>
              <TrendIcon className={`h-4 w-4 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground font-display leading-none">{kpi.value}</p>
              <p className="text-[10px] md:text-[11px] text-foreground mt-1 font-semibold font-body leading-tight">{kpi.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-body">{kpi.sub}</p>
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-bold font-body ${trendColor}`}>
              <TrendIcon className="h-2.5 w-2.5" />
              {kpi.trend}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

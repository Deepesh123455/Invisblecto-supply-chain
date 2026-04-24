import { Sparkles, Loader2, CheckCircle2, AlertCircle, Clock, RotateCcw, Package, TrendingUp } from "lucide-react";

const activityItems = [
  { status: "done",       icon: CheckCircle2, message: "Mumbai ST-1022 → Pune ST-1027: Cotton Chinos transfer approved (85–95 units)", time: "2 min ago" },
  { status: "processing", icon: Loader2,      message: "Forecast retraining in progress — 65 stores · LightGBM model updating", time: "5 min ago" },
  { status: "done",       icon: Package,      message: "Monday dispatch list generated — 28 orders queued for warehouse", time: "12 min ago" },
  { status: "flagged",    icon: AlertCircle,  message: "ST-1004: Inventory reconciliation gap (5 units) — sent to Exceptions Room", time: "18 min ago" },
  { status: "done",       icon: TrendingUp,   message: "Auto-raised restock order: Polo T-Shirt (SKU-2004) — 320–380 units · 4-week lead time applies", time: "34 min ago" },
  { status: "done",       icon: RotateCcw,    message: "Bengaluru → Chennai: Linen Shirt transfer dispatched (60 units)", time: "1h ago" },
  { status: "awaiting",   icon: Clock,        message: "3 high-value transfers pending admin approval · Total ₹4.8L", time: "1h ago" },
  { status: "done",       icon: CheckCircle2, message: "Dubai store season allocation confirmed — Embroidered Kurta 180 units shipped", time: "2h ago" },
];

const statusConfig: Record<string, { color: string; iconColor: string }> = {
  processing: { color: "bg-primary/10",     iconColor: "text-primary animate-spin" },
  awaiting:   { color: "bg-warning/10",     iconColor: "text-warning" },
  done:       { color: "bg-success/10",     iconColor: "text-success" },
  flagged:    { color: "bg-destructive/10", iconColor: "text-destructive" },
};

export function WorkforceActivity() {
  return (
    <div className="rounded-xl bg-card border card-shadow p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-display font-semibold text-foreground">AI Activity Log</h2>
        </div>
        <span className="text-[10px] text-muted-foreground font-body">Today</span>
      </div>
      <div className="space-y-1">
        {activityItems.map((item, i) => {
          const cfg     = statusConfig[item.status] || statusConfig.done;
          const Icon    = item.icon;
          return (
            <div key={i} className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-accent/30 transition-colors">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cfg.color} mt-0.5`}>
                <Icon className={`h-3.5 w-3.5 ${cfg.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground leading-relaxed font-body">{item.message}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-body">{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-border/40">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-body">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-soft" />
          AI engine processing continuously · 98.4% actions automated
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { ArrowRightLeft, TrendingUp, Clock, ShoppingCart, Tag, AlertTriangle, Check, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Recommendation {
  id: number;
  category: "Transfer" | "Forecast" | "Reorder" | "Markdown" | "Alert";
  priority: "Critical" | "High" | "Medium";
  status: "awaiting_approval" | "awaiting_review" | "flagged";
  message: string;
  action: string;
  detail: string;
}

const recommendations: Recommendation[] = [
  {
    id: 1,
    category: "Transfer",
    priority: "Critical",
    status: "awaiting_approval",
    message: "Mumbai ST-1022 → Pune ST-1025: Polo T-Shirt (SKU-2004) near stockout. Transfer 60–70 units. Saves ₹8,400 vs warehouse.",
    action: "Approve Transfer",
    detail: "WOC: 0.3w · Cost saving: ₹8,400",
  },
  {
    id: 2,
    category: "Reorder",
    priority: "High",
    status: "awaiting_approval",
    message: "Linen Shirt (SKU-2001) stock dropping below 2-week cover across 8 stores. System recommends restocking 280–320 units. Lead time: 4 weeks — order by Apr 14 to avoid stockout.",
    action: "Confirm Restock Order",
    detail: "₹5.6L estimated · 8 stores at risk",
  },
  {
    id: 3,
    category: "Markdown",
    priority: "High",
    status: "flagged",
    message: "Merino Wool Sweater (SKU-2012): WOC 9.2w but only 3 selling weeks remain. Recommend 25% markdown to clear ₹2.4L stock.",
    action: "Approve Markdown",
    detail: "3 stores · ₹2.4L at risk",
  },
  {
    id: 4,
    category: "Forecast",
    priority: "Medium",
    status: "awaiting_review",
    message: "Diwali demand signal detected 6 weeks early for North India. Forecast increased by 38% for W42–W44. Review allocation.",
    action: "Review Forecast",
    detail: "12 stores affected · W42 onwards",
  },
  {
    id: 5,
    category: "Transfer",
    priority: "Medium",
    status: "awaiting_approval",
    message: "Bengaluru ST-1012 → Chennai ST-1014: Cotton Chinos excess (120 units). Transfer 55–65 units to balance sell-through.",
    action: "Approve Transfer",
    detail: "Saves ₹6,200 · Same-day dispatch",
  },
  {
    id: 6,
    category: "Alert",
    priority: "High",
    status: "flagged",
    message: "Dubai store stock of Embroidered Kurta Set will run out before June 1. International replenishment logistics window closes Apr 18 — restocking after this date costs significantly more.",
    action: "Confirm Restock Now",
    detail: "Int'l delivery · Quantity: 240–280 units · Window closes Apr 18",
  },
];

const iconMap: Record<string, React.ElementType> = {
  Transfer: ArrowRightLeft,
  Forecast: TrendingUp,
  Reorder:  ShoppingCart,
  Markdown: Tag,
  Alert:    AlertTriangle,
};

const priorityStyles: Record<string, string> = {
  Critical: "status-critical",
  High:     "status-high",
  Medium:   "status-medium",
};

const statusLabels: Record<string, { label: string; color: string }> = {
  awaiting_approval: { label: "Needs Approval",   color: "bg-warning/15 text-warning border-warning/20" },
  awaiting_review:   { label: "Review Required",   color: "bg-primary/10 text-primary border-primary/20" },
  flagged:           { label: "Flagged",            color: "bg-destructive/10 text-destructive border-destructive/20" },
  approved:          { label: "Approved",           color: "bg-success/10 text-success border-success/20" },
  dismissed:         { label: "Dismissed",          color: "bg-muted text-muted-foreground border-border" },
};

export function RecommendationFeed() {
  const [actions, setActions] = useState<Record<number, string>>({});

  const handleAction = (id: number, action: string) =>
    setActions(prev => ({ ...prev, [id]: action }));

  const pendingCount = recommendations.filter(r => !actions[r.id]).length;

  return (
    <div className="rounded-xl bg-card border card-shadow">
      <div className="flex items-center justify-between p-5 pb-3">
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">Pending Actions</h2>
          <p className="text-xs text-muted-foreground font-body">AI-generated recommendations requiring your decision</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold bg-warning/10 text-warning border border-warning/20 font-body">
          {pendingCount} pending
        </span>
      </div>

      <div className="p-5 pt-2 space-y-3">
        <AnimatePresence>
          {recommendations.map(rec => {
            const Icon     = iconMap[rec.category] || TrendingUp;
            const resolved = actions[rec.id];
            const status   = resolved ? statusLabels[resolved] : statusLabels[rec.status];

            return (
              <motion.div
                key={rec.id}
                layout
                className={`rounded-lg border p-4 transition-colors ${
                  resolved ? "opacity-50 bg-muted/10" : "hover:bg-accent/30"
                } ${rec.priority === "Critical" && !resolved ? "border-destructive/40" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary ${priorityStyles[rec.priority]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1.5">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider font-body ${priorityStyles[rec.priority]}`}>
                        {rec.priority}
                      </span>
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium border font-body ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-body ml-auto">{rec.category}</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed font-body">{rec.message}</p>
                    {rec.detail && (
                      <p className="text-[10px] text-muted-foreground mt-1 font-body italic">{rec.detail}</p>
                    )}

                    {!resolved && (
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <Button
                          size="sm"
                          className={`h-7 rounded-md text-xs font-body ${
                            rec.priority === "Critical"
                              ? "bg-destructive hover:bg-destructive/90 text-white"
                              : "ai-gradient text-primary-foreground"
                          }`}
                          onClick={() => handleAction(rec.id, "approved")}
                        >
                          <Check className="h-3 w-3 mr-1" /> {rec.action}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 rounded-md text-xs font-body"
                          onClick={() => handleAction(rec.id, "dismissed")}
                        >
                          <X className="h-3 w-3 mr-1" /> Dismiss
                        </Button>
                        <button className="ml-auto text-[11px] text-muted-foreground hover:text-foreground font-body flex items-center gap-0.5 transition-colors">
                          Details <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    {resolved && (
                      <p className="text-xs text-muted-foreground mt-2 font-body italic">
                        {resolved === "approved" ? "✓ You approved this action" : "✗ You dismissed this recommendation"}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

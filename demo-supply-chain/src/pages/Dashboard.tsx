import { AppLayout } from "@/components/AppLayout";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { RecommendationFeed } from "@/components/dashboard/RecommendationFeed";
import { RiskChart } from "@/components/dashboard/RiskChart";
import { StockoutTable } from "@/components/dashboard/StockoutTable";
import { WorkforceActivity } from "@/components/dashboard/WorkforceActivity";
import { Sparkles, AlertTriangle, Globe } from "lucide-react";

// Live ticker items
const TICKER_ITEMS = [
  "✓ Model retrained 2h ago — forecast accuracy improved to 91.3%",
  "⚡ 14 replenishment orders auto-dispatched this morning",
  "🏪 Mumbai ST-1022: Silk Saree stock-out flagged — transfer from Pune approved",
  "📦 28 warehouse dispatch items queued for Monday",
  "⚠ Reconciliation gap found in ST-1004 — audit in progress",
  "🌐 Dubai store seasonal collection: sell-through 94% — reorder window open",
  "📈 North India week-on-week demand up 12% — Diwali signal detected early",
  "✓ 3 restock orders auto-raised for basic SKUs — lead times confirmed, dispatching this week",
  "🔄 Inter-store transfer: Bengaluru → Chennai (Cotton Chinos, 85-95 units) approved",
  "⚡ Singapore store: new season allocation dispatched — WOC 4.2 weeks",
];

const Dashboard = () => {
  const tickerContent = [...TICKER_ITEMS, ...TICKER_ITEMS].join("   ·   ");

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-10">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Enterprise Intelligence</h1>
            <p className="text-sm text-muted-foreground mt-1 font-body">
              AI Engine monitoring{" "}
              <span className="text-foreground font-semibold">65 stores</span>
              {" · "}
              <span className="text-foreground font-semibold">10 SKUs</span>
              {" · "}
              <span className="text-foreground font-semibold">6 Countries</span>
              {" · 8 Regions"}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-4 py-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-bold text-primary font-body uppercase tracking-wider">4 Exceptions Flagged</span>
          </div>
        </div>

        {/* Live Ticker */}
        <div className="rounded-xl bg-card border border-border/40 overflow-hidden card-shadow">
          <div className="flex items-center">
            <div className="shrink-0 flex items-center gap-2 px-3 py-2.5 bg-primary/10 border-r border-border/40">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-soft" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary font-body whitespace-nowrap">Live Feed</span>
            </div>
            <div className="overflow-hidden flex-1 relative">
              <div className="flex whitespace-nowrap animate-ticker-scroll py-2.5 px-4">
                <span className="text-[11px] text-muted-foreground font-body shrink-0">{tickerContent}</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <KpiCards />

        {/* Regional Status Row */}


        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <RiskChart />
            <RecommendationFeed />

            {/* <StockoutTable /> */}
          </div>
          <div className="space-y-6">
            <WorkforceActivity />

          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;

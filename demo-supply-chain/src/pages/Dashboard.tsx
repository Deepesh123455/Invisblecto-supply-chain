import { AppLayout } from "@/components/AppLayout";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { RiskChart } from "@/components/dashboard/RiskChart";
import { WorkforceActivity } from "@/components/dashboard/WorkforceActivity";
import { OperationalInsights } from "@/components/dashboard/OperationalInsights";
import { BarChart2 } from "lucide-react";

// Live ticker items with branded dummy data
const TICKER_ITEMS = [
  "✓ YourCompany Model retrained 2h ago — forecast accuracy improved to 91.3%",
  "⚡ 14 replenishment orders auto-dispatched to YourCompany West Zone",
  "🏪 Mumbai Central (YourCompany): Classic Cotton stock-out flagged — transfer initiated",
  "📦 28 YourCompany warehouse dispatch items queued for Monday morning",
  "⚠ YourCompany ST-1004: Reconciliation gap found — audit in progress",
  "📈 YourCompany North India week-on-week demand up 12% — seasonal signal detected",
  "✓ 3 restock orders auto-raised for YourCompany Basic SKUs — dispatching this week",
  "🔄 Inter-store transfer: Bengaluru → Chennai (YourCompany) completed",
];

const Dashboard = () => {
  const tickerContent = [...TICKER_ITEMS, ...TICKER_ITEMS].join("   ·   ");

  return (
    <AppLayout>
      <div className="space-y-6 w-full pb-10">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Enterprise Intelligence</h1>
          </div>

        </div>

        {/* Live Ticker */}


        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <RiskChart />
            <OperationalInsights />
          </div>
          <div className="space-y-6">
            <WorkforceActivity />
          </div>
        </div>

        {/* Performance Summary — KPI strip at the bottom */}
        <div className="w-full">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            <p className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">Performance Summary</p>
            <div className="flex-1 h-px bg-border" />
          </div>
          <KpiCards />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;

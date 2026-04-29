import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Maximize2, AlertTriangle, Info, Database, Wifi } from "lucide-react";

const forecastAccuracy = [
  {
    week: "W43", predicted: 88, actual: 84, variance: -4,
    range: "Oct 21 – 27",
    reason: "West Zone underperformed due to delayed inbound shipment from vendor.",
  },
  {
    week: "W44", predicted: 92, actual: 90, variance: -2,
    range: "Oct 28 – Nov 3",
    reason: "Minor stockout in South Zone on Classic Cotton SKU — partially recovered.",
  },
  {
    week: "W45", predicted: 79, actual: 82, variance: +3,
    range: "Nov 4 – 10",
    reason: "Unpredicted regional holiday in North Zone drove higher walk-in traffic.",
  },
  {
    week: "W46", predicted: 95, actual: 91, variance: -4,
    range: "Nov 11 – 17",
    reason: "Over-forecast due to festive carry-over assumption. Demand normalised early.",
  },
  {
    week: "W47", predicted: 88, actual: 86, variance: -2,
    range: "Nov 18 – 24",
    reason: "Steady week. Minor deviation within acceptable model threshold.",
  },
  {
    week: "W48", predicted: 91, actual: 93, variance: +2,
    range: "Nov 25 – Dec 1",
    reason: "Pre-December impulse buying — model underestimated seasonal pull-forward.",
  },
  {
    week: "W49", predicted: 86, actual: 88, variance: +2,
    range: "Dec 2 – 8",
    reason: "YourCompany weekend clearance event drove incremental sell-through.",
  },
  {
    week: "W50", predicted: 93, actual: 90, variance: -3,
    range: "Dec 9 – 15",
    reason: "Consumer sentiment dipped mid-week. Recovers in W51 trend.",
  },
];

// Custom tooltip for both preview and dialog charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const item = forecastAccuracy.find(d => d.week === label);
  const variance = item?.variance ?? 0;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-[11px] max-w-[200px]">
      <p className="font-bold text-foreground mb-1">{label} <span className="text-muted-foreground font-normal">· {item?.range}</span></p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-bold">
          {p.name === "predicted" ? "Forecast" : "Actual"}: {p.value}%
        </p>
      ))}
      <p className={`font-bold mt-1 ${variance > 0 ? "text-success" : variance < 0 ? "text-destructive" : "text-muted-foreground"}`}>
        Variance: {variance > 0 ? "+" : ""}{variance}%
      </p>
    </div>
  );
};

export function RiskChart() {
  return (
    <div className="space-y-4">
      <Dialog>
        <DialogTrigger asChild>
          <div className="rounded-xl bg-card border card-shadow p-5 cursor-pointer hover:border-primary/30 transition-all group relative">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <h2 className="text-sm font-semibold text-foreground mb-0.5 group-hover:text-primary transition-colors">Forecast Accuracy</h2>
            <p className="text-xs text-muted-foreground mb-4 font-body">Predicted vs actual sell-through % · last 8 weeks</p>
            <div className="h-[160px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastAccuracy} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(35,15%,88%)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 9, fill: "hsl(30,8%,50%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "hsl(30,8%,50%)" }} axisLine={false} tickLine={false} domain={[70, 100]} tickFormatter={v => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="predicted" stroke="hsl(30,20%,30%)" strokeWidth={2} strokeDasharray="5 3" dot={false} name="predicted" />
                  <Line type="monotone" dataKey="actual" stroke="hsl(152,45%,38%)" strokeWidth={2.5} dot={{ r: 3, fill: "white", stroke: "hsl(152,45%,38%)", strokeWidth: 2 }} name="actual" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-body">
                <span className="h-2 w-4 rounded-full bg-primary/60 border border-primary" style={{ borderStyle: "dashed" }} />Forecast
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-body">
                <span className="h-2 w-4 rounded-full bg-success" />Actual
              </div>
              <div className="ml-auto text-[10px] font-bold text-success font-body">Avg 91.3% accuracy</div>
            </div>
          </div>
        </DialogTrigger>

        {/* ── Expanded Dialog — same chart, more detail ── */}
        <DialogContent className="max-w-3xl bg-card border-border shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Maximize2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Forecast Accuracy — Full Breakdown</DialogTitle>
                <DialogDescription>Predicted vs Actual sell-through % · W43 – W50 · All Zones</DialogDescription>
              </div>
              <div className="ml-auto text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">8-Week Avg</p>
                <p className="text-lg font-bold text-success">91.3% accuracy</p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {/* Same line chart, taller + with reference line */}
            <div className="p-4 rounded-xl border bg-muted/10">
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastAccuracy} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(35,15%,88%)" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(30,8%,50%)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(30,8%,50%)" }} axisLine={false} tickLine={false} domain={[70, 100]} tickFormatter={v => `${v}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      iconType="line"
                      formatter={(name) => name === "predicted" ? "Forecast" : "Actual"}
                      wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                    />
                    <Line type="monotone" dataKey="predicted" stroke="hsl(30,20%,30%)" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3, fill: "white", stroke: "hsl(30,20%,30%)", strokeWidth: 2 }} name="predicted" />
                    <Line type="monotone" dataKey="actual" stroke="hsl(152,45%,38%)" strokeWidth={2.5} dot={{ r: 4, fill: "white", stroke: "hsl(152,45%,38%)", strokeWidth: 2.5 }} name="actual" activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Per-week table with ranges + reasons */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Week-by-Week Breakdown</h3>
              <div className="space-y-2">
                {forecastAccuracy.map((item) => (
                  <div key={item.week} className="p-3 rounded-lg border bg-card text-[11px]">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-foreground w-8 shrink-0">{item.week}</span>
                      <span className="text-muted-foreground shrink-0">{item.range}</span>
                      <span className="text-muted-foreground">F: <span className="font-bold text-foreground">{item.predicted}%</span></span>
                      <span className="text-muted-foreground">A: <span className="font-bold text-foreground">{item.actual}%</span></span>
                      <span className={`font-bold ml-auto shrink-0 ${item.variance > 0 ? "text-success" : "text-destructive"}`}>
                        {item.variance > 0 ? "+" : ""}{item.variance}%
                      </span>
                    </div>
                    <p className="text-muted-foreground pl-11 leading-relaxed">{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Anomaly + model note */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-destructive/20 bg-destructive/5 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-destructive uppercase tracking-wider">W45 Anomaly</p>
                  <p className="text-[11px] text-destructive/80 mt-0.5">Regional holiday drove +3% over-actual. Model updated post-event.</p>
                </div>
              </div>
              <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Model Note</p>
                  <p className="text-[11px] text-primary/80 mt-0.5">AI v2.1 adjusted for local festivals. Higher accuracy expected from W52 onward.</p>
                </div>
              </div>
            </div>

            {/* Data source */}

          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line, Legend
} from "recharts";

const forecastAccuracy = [
  { week: "W43", predicted: 88, actual: 84 },
  { week: "W44", predicted: 92, actual: 90 },
  { week: "W45", predicted: 79, actual: 82 },
  { week: "W46", predicted: 95, actual: 91 },
  { week: "W47", predicted: 88, actual: 86 },
  { week: "W48", predicted: 91, actual: 93 },
  { week: "W49", predicted: 86, actual: 88 },
  { week: "W50", predicted: 93, actual: 90 },
];

const riskByCategory = [
  { category: "Seasonal Fashion", value: 520000 },
  { category: "Core Essentials", value: 340000 },
  { category: "Basic", value: 210000 },
  { category: "New Launch", value: 180000 },
];

export function RiskChart() {
  return (
    <div className="space-y-4">
      {/* Forecast accuracy chart */}
      <div className="rounded-xl bg-card border card-shadow p-5">
        <h2 className="text-sm font-semibold text-foreground mb-0.5">Forecast Accuracy</h2>
        <p className="text-xs text-muted-foreground mb-4 font-body">Predicted vs actual sell-through % · last 8 weeks</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={forecastAccuracy} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(35,15%,88%)" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 9, fill: "hsl(30,8%,50%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "hsl(30,8%,50%)" }} axisLine={false} tickLine={false} domain={[70, 100]} tickFormatter={v => `${v}%`} />
            <Tooltip
              formatter={(v: number, name: string) => [`${v}%`, name === "predicted" ? "Forecast" : "Actual"]}
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(35,15%,88%)" }}
            />
            <Line type="monotone" dataKey="predicted" stroke="hsl(30,20%,30%)" strokeWidth={2} strokeDasharray="5 3" dot={false} name="predicted" />
            <Line type="monotone" dataKey="actual" stroke="hsl(152,45%,38%)" strokeWidth={2.5} dot={{ r: 3, fill: "white", stroke: "hsl(152,45%,38%)", strokeWidth: 2 }} name="actual" />
          </LineChart>
        </ResponsiveContainer>
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


    </div>
  );
}

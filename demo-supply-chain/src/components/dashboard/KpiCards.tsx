import { kpis } from "@/lib/constants";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, ArrowRight, BarChart3, Clock, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line
} from "recharts";

export function KpiCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, i) => {
        const TrendIcon =
          kpi.dir === "up" ? TrendingUp :
            kpi.dir === "down" ? TrendingDown :
              Minus;
        const trendColor =
          kpi.dir === "flat" ? "text-muted-foreground" :
            (kpi.dir === "up" && !kpi.bad) || (kpi.dir === "down" && kpi.bad) ? "text-success" :
              "text-destructive";

        const CardContent = (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`rounded-xl bg-card border card-shadow p-5 transition-all flex flex-col gap-1 relative overflow-hidden ${kpi.clickable ? "cursor-pointer group hover:border-primary/40 hover:card-shadow-hover" : "cursor-default"
              }`}
          >
            {kpi.clickable && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              </div>
            )}

            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold text-foreground leading-tight">{kpi.value}</p>

            <div className={`flex items-center gap-1 text-[11px] font-bold mt-2 ${trendColor}`}>
              <TrendIcon className="h-3 w-3" />
              {kpi.trend}
            </div>
          </motion.div>
        );

        if (!kpi.clickable) {
          return <div key={kpi.label}>{CardContent}</div>;
        }

        return (
          <Dialog key={kpi.label}>
            <DialogTrigger asChild>
              {CardContent}
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card border-border shadow-2xl">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`h-10 w-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                    <TrendIcon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold">{kpi.label} Details</DialogTitle>
                    <DialogDescription>Full historical breakdown and regional analysis for YourCompany.</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Trend Chart */}
                <div className="p-4 rounded-xl border bg-muted/20">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                    <BarChart3 className="h-3 w-3" /> 7-Day Performance
                  </h4>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={kpi.history}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                          animationDuration={1000}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Regional Breakdown */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> Regional Contribution
                  </h4>
                  <div className="space-y-3">
                    {[
                      { name: "North Zone", val: "32%", status: "Increasing" },
                      { name: "South Zone", val: "45%", status: "Stable" },
                      { name: "West Zone", val: "18%", status: "Stable" },
                      { name: "East Zone", val: "5%", status: "Declining" },
                    ].map((reg) => (
                      <div key={reg.name} className="flex items-center justify-between p-2 rounded-lg border bg-card">
                        <div>
                          <p className="text-xs font-bold">{reg.name}</p>
                          <p className="text-[10px] text-muted-foreground">{reg.status}</p>
                        </div>
                        <p className="text-sm font-bold text-primary">{reg.val}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex items-start gap-3 mt-4">
                    <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-[11px] text-primary/80 font-body">
                      Next automatic update scheduled for 10:00 PM IST based on YourCompany logistics logs.
                    </p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      })}
    </div>
  );
}

import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import {
  Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine, ComposedChart, Line
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sparkles, TrendingUp, CheckCircle2, Database,
  Cpu, Zap, Calendar, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight, Layers, Activity, ShieldCheck, LayoutDashboard
} from "lucide-react";
import { DataSimulator, ForecastingEngine } from "@/lib/engine";

const simulator = new DataSimulator();

const getWeekRange = (weekKey: string, endWeekKey?: string) => {
  const [w, y] = weekKey.replace("W", "").split("-").map(Number);
  const [ew, ey] = (endWeekKey || weekKey).replace("W", "").split("-").map(Number);

  // Simple calculation for 2026 (W01 starts Jan 4, Sunday)
  const startDate = new Date(y, 0, 4);
  startDate.setDate(startDate.getDate() + (w - 1) * 7);

  const endDate = new Date(ey || y, 0, 4);
  endDate.setDate(endDate.getDate() + (ew - 1) * 7 + 6);

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

  // If it's the same week, return single range
  if (!endWeekKey || weekKey === endWeekKey) {
    return `${startDate.toLocaleDateString('en-IN', options)} - ${endDate.toLocaleDateString('en-IN', options)}`;
  }

  // Multi-week range
  return `${startDate.toLocaleDateString('en-IN', options)} - ${endDate.toLocaleDateString('en-IN', options)}`;
};

const CustomForecastTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-card/95 backdrop-blur-md border border-border/50 rounded-xl shadow-2xl p-4 min-w-[240px]">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
        {d.type === 'forecast' && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">SCENARIO</span>
        )}
      </div>

      {d?.cleaned != null && (
        <div className="flex justify-between gap-4 mb-2">
          <span className="text-xs text-muted-foreground">Historical Sales</span>
          <span className="text-xs font-bold text-foreground">{d.cleaned} units</span>
        </div>
      )}

      {d?.type === 'forecast' && (
        <>
          <div className="space-y-1.5 border-l-2 border-border/50 pl-3 my-3">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Baseline Model</div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-muted-foreground">Target</span>
              <span className="text-xs font-semibold text-muted-foreground">{d.baselineMid} units</span>
            </div>
            {d.adjustedMid !== d.baselineMid && (
              <div className="flex justify-between gap-4">
                <span className="text-xs text-muted-foreground">Revenue Run-rate</span>
                <span className="text-xs font-semibold text-muted-foreground">₹{((d.baselineMid || 0) * d.price).toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5 border-l-2 border-success/50 pl-3 mb-2">
            <div className="text-[10px] font-bold text-success uppercase tracking-wider mb-1 flex items-center gap-1">
              Adjusted Scenario
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-muted-foreground">Lower Bound</span>
              <span className="text-xs font-medium text-success/80">{d.adjustedLower} units</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-muted-foreground">Target Demand</span>
              <span className="text-xs font-bold text-success">{d.adjustedMid} units</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-muted-foreground">Upper Bound</span>
              <span className="text-xs font-medium text-success/80">{d.adjustedUpper} units</span>
            </div>
          </div>

          <div className="border-t border-border/40 mt-3 pt-3">
            <div className="flex justify-between gap-4">
              <span className="text-xs text-muted-foreground">Scenario Impact</span>
              <span className={`text-xs font-bold ${d.adjustedMid > d.baselineMid ? 'text-success' : d.adjustedMid < d.baselineMid ? 'text-destructive' : 'text-muted-foreground'}`}>
                {d.adjustedMid > d.baselineMid ? '+' : ''}{d.adjustedMid - d.baselineMid} units
              </span>
            </div>
            <div className="flex justify-between gap-4 mt-1">
              <span className="text-xs text-muted-foreground">Projected Revenue</span>
              <span className="text-xs font-bold text-foreground">
                ₹{((d.adjustedLower || 0) * d.price).toLocaleString()} – ₹{((d.adjustedUpper || 0) * d.price).toLocaleString()}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const DemandForecast = () => {
  const [selectedSkuId, setSelectedSkuId] = useState(simulator.skus[0].id);
  const [selectedStoreId, setSelectedStoreId] = useState(simulator.stores[0].id);
  const [activeManualInputs, setActiveManualInputs] = useState<string[]>(["MI-001"]);
  const [showForecastTable, setShowForecastTable] = useState(false);

  const selectedSku = simulator.skus.find(s => s.id === selectedSkuId)!;
  const selectedStore = simulator.stores.find(s => s.id === selectedStoreId)!;

  const history = useMemo(() => {
    const raw = simulator.history.filter(h => h.skuId === selectedSkuId && h.storeId === selectedStoreId);
    return ForecastingEngine.cleanData(raw);
  }, [selectedSkuId, selectedStoreId]);

  const activeInputs = useMemo(
    () => simulator.manualInputs.filter(m => activeManualInputs.includes(m.id)),
    [activeManualInputs]
  );

  const baselineForecasts = useMemo(
    () => ForecastingEngine.runForecast(history, selectedSku, 8, []),
    [history, selectedSku]
  );

  const adjustedForecasts = useMemo(
    () => ForecastingEngine.runForecast(history, selectedSku, 8, activeInputs),
    [history, selectedSku, activeInputs]
  );

  const reconciliation = useMemo(() => ForecastingEngine.reconciliationCheck(history), [history]);

  const chartData = useMemo(() => {
    const hist = history.map(h => ({
      week: getWeekRange(h.weekKey),
      actual: h.sold,
      cleaned: h.sold + h.estimatedLostSales,
      type: "historical",
      isHealed: h.cleaningStatus === "healed",
      event: h.event,
    }));

    const fore = adjustedForecasts.map((f, i) => {
      const baseObj = baselineForecasts[i];

      return {
        week: getWeekRange(f.weekKey),

        // Baseline (Engine truth)
        baselinePredicted: baseObj.predictedUnits,
        baselineMid: baseObj.predictedUnits,

        // Adjusted (Scenario applied)
        adjustedLower: f.lowerBound,
        adjustedUpper: f.upperBound,
        adjustedMid: f.predictedUnits,

        type: "forecast",
        confidence: f.confidenceScore,
        price: selectedSku.avgSellingPrice
      };
    });

    return [...hist, ...fore];
  }, [history, adjustedForecasts, baselineForecasts, selectedSku.avgSellingPrice]);

  const latestBaseline = baselineForecasts[0];

  // Aggregate Stats
  const avgBaselineUnits = Math.round(baselineForecasts.reduce((a, b) => a + b.predictedUnits, 0) / (baselineForecasts.length || 1));

  // Scenario Stats
  const avgAdjustedUnits = Math.round(adjustedForecasts.reduce((a, b) => a + b.predictedUnits, 0) / (adjustedForecasts.length || 1));
  const avgAdjustedLower = Math.round(adjustedForecasts.reduce((a, b) => a + b.lowerBound, 0) / (adjustedForecasts.length || 1));
  const avgAdjustedUpper = Math.round(adjustedForecasts.reduce((a, b) => a + b.upperBound, 0) / (adjustedForecasts.length || 1));

  const totalRevBaseline = baselineForecasts.reduce((a, b) => a + b.predictedUnits, 0) * selectedSku.avgSellingPrice;
  const totalRevAdjusted = adjustedForecasts.reduce((a, b) => a + b.predictedUnits, 0) * selectedSku.avgSellingPrice;
  const deltaRev = totalRevAdjusted - totalRevBaseline;

  const avgScenarioWoc = adjustedForecasts.reduce((a, b) => a + b.weeksOfCover, 0) / (adjustedForecasts.length || 1);
  const scenarioRisk = avgScenarioWoc < 2 ? "Critical" : avgScenarioWoc < 4 ? "Medium" : "Low";

  const toggleManualInput = (id: string) => {
    setActiveManualInputs(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10 px-4 md:px-6">

        {/* --- COMMAND CENTER HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/40 border border-border/40 p-4 rounded-2xl shadow-sm backdrop-blur-md">
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-2xl font-display font-bold text-foreground tracking-tight">Demand Intelligence</h1>
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Scenario Command Center</p>
          </div>
        </div>

        {/* --- GLOBAL FILTERS --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-2">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-1.5 font-body">
              <Database className="h-3 w-3" /> Store Location
            </label>
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger className="bg-card border-border/40 text-sm font-medium h-12 rounded-xl shadow-sm hover:border-primary/50 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {simulator.stores.slice(0, 10).map(s => (
                  <SelectItem key={s.id} value={s.id} className="font-body text-xs py-2.5">
                    {s.name} <span className="text-muted-foreground ml-2">({s.city})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-1.5 font-body">
              <Zap className="h-3 w-3" /> Product SKU
            </label>
            <Select value={selectedSkuId} onValueChange={setSelectedSkuId}>
              <SelectTrigger className="bg-card border-border/40 text-sm font-medium h-12 rounded-xl shadow-sm hover:border-primary/50 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {simulator.skus.slice(0, 8).map(s => (
                  <SelectItem key={s.id} value={s.id} className="font-body text-xs py-2.5">
                    {s.name} <span className="text-muted-foreground ml-2">({s.category})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* --- IMPACT SUMMARY STRIP --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-card border border-border/40 p-5 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp className="h-24 w-24" />
            </div>
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-body mb-3">Adjusted Forecast</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl md:text-3xl font-bold text-foreground font-display">{avgAdjustedUnits}</p>
              <p className="text-sm font-medium text-muted-foreground font-display">units/wk</p>
            </div>
            <div className={`mt-2 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md ${avgAdjustedUnits > avgBaselineUnits ? 'bg-success/10 text-success' : avgAdjustedUnits < avgBaselineUnits ? 'bg-destructive/10 text-destructive' : 'bg-muted/10 text-muted-foreground'}`}>
              {avgAdjustedUnits > avgBaselineUnits ? <ArrowUpRight className="h-3 w-3" /> : avgAdjustedUnits < avgBaselineUnits ? <ArrowDownRight className="h-3 w-3" /> : <Activity className="h-3 w-3" />}
              {avgAdjustedUnits > avgBaselineUnits ? '+' : ''}{avgAdjustedUnits - avgBaselineUnits} units vs baseline
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border/40 p-5 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Layers className="h-24 w-24" />
            </div>
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-body mb-3">Scenario Rev Impact (8w)</p>
            <p className="text-2xl md:text-3xl font-bold text-foreground font-display">
              ₹{(totalRevAdjusted / 100000).toFixed(2)}L
            </p>
            <div className={`mt-2 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md ${deltaRev >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
              {deltaRev >= 0 ? '+' : ''}₹{(deltaRev / 100000).toFixed(2)}L vs baseline
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border/40 p-5 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity className="h-24 w-24" />
            </div>
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-body mb-3">Model Confidence</p>
            <p className="text-2xl md:text-3xl font-bold text-success font-display">
              {((latestBaseline?.confidenceScore || 0) * 100).toFixed(1)}%
            </p>
            <div className="mt-3 h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
              <div className="h-full bg-success rounded-full transition-all duration-1000" style={{ width: `${(latestBaseline?.confidenceScore || 0) * 100}%` }} />
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border/40 p-5 shadow-sm">
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-body mb-3">Model Risk Profile</p>
            <div>
              <p className={`text-2xl md:text-3xl font-bold font-display ${scenarioRisk === 'Critical' ? 'text-destructive' : scenarioRisk === 'Medium' ? 'text-warning' : 'text-success'}`}>
                {scenarioRisk}
              </p>
              <p className="text-[11px] text-muted-foreground mt-2 font-medium">Forward cover: {avgScenarioWoc.toFixed(1)} weeks</p>
            </div>
          </div>
        </div>

        {/* --- MAIN WORKSPACE --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Interactive Chart Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-3xl bg-card border border-border/40 shadow-xl p-6 relative overflow-hidden bg-gradient-to-b from-card to-background">

              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2">
                <div>
                  <h2 className="text-lg md:text-xl font-display font-semibold text-foreground flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                    Demand Trajectory Mapping
                  </h2>
                  <p className="text-[13px] text-muted-foreground font-body mt-1">
                    Visualizing historical actuals against AI baseline and current scenario overrides.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-body bg-muted/30 px-4 py-2 rounded-xl backdrop-blur-sm">
                  <span className="flex items-center gap-2"><span className="h-1 w-4 rounded-full bg-primary/40" />Historical</span>
                  <span className="flex items-center gap-2"><span className="h-0.5 w-4 rounded-full bg-muted-foreground/50 border-t border-dashed" />Baseline</span>
                  <span className="flex items-center gap-2 text-success">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                    </span>
                    Scenario Result
                  </span>
                </div>
              </div>

              <div className="h-[300px] md:h-[460px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fontWeight: 500, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} minTickGap={30} dy={15} />
                    <YAxis tick={{ fontSize: 10, fontWeight: 500, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} dx={-10} />
                    <Tooltip content={<CustomForecastTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }} />

                    {/* Today Marker */}
                    {history.length > 0 && (
                      <ReferenceLine x={history[history.length - 1].weekKey} stroke="hsl(var(--border))" strokeWidth={2}
                        label={{ value: "TODAY", position: "insideTopRight", fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 800, offset: 10 }} />
                    )}

                    {/* Historical Actuals */}
                    <Area type="monotone" dataKey="cleaned" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorHistorical)"
                      dot={{ r: 3, fill: "hsl(var(--background))", stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                      activeDot={{ r: 5, strokeWidth: 0, fill: "hsl(var(--primary))" }} />

                    {/* Baseline Engine (Dashed) */}
                    <Line type="monotone" dataKey="baselineMid" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} opacity={0.6} />


                    {/* Adjusted Scenario Target line */}
                    <Line type="monotone" dataKey="adjustedMid" stroke="hsl(var(--success))" strokeWidth={3}
                      dot={{ r: 4, fill: "hsl(var(--background))", stroke: "hsl(var(--success))", strokeWidth: 2 }}
                      activeDot={{ r: 6, strokeWidth: 0, fill: "hsl(var(--success))" }} />

                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scenario Breakdown Table */}
            <div className="rounded-2xl bg-card border border-border/40 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowForecastTable(v => !v)}
                className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-semibold text-foreground">8-Week Scenario Datatable</span>
                    <span className="block text-xs text-muted-foreground font-body mt-0.5">Line-by-line comparison of Base vs Scenario</span>
                  </div>
                </div>
                {showForecastTable ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
              </button>

              {showForecastTable && (
                <div className="border-t border-border/40 overflow-x-auto bg-card">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/20">
                        <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-body">Forward Week</th>
                        <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-body border-l border-border/40">Baseline Model</th>
                        <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-body border-l border-border/40" colSpan={3}>Active Scenario Range</th>
                        <th className="text-right py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-body">Revenue Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adjustedForecasts.map((f, i) => {
                        const baseObj = baselineForecasts[i];
                        const diff = f.predictedUnits - baseObj.predictedUnits;
                        return (
                          <tr key={f.weekKey} className="border-t border-border/20 hover:bg-muted/10 transition-colors">
                            <td className="py-3 px-6 text-xs font-bold text-foreground">{getWeekRange(f.weekKey)}</td>
                            <td className="py-3 px-6 text-center text-xs font-bold text-muted-foreground border-l border-border/40 bg-muted/5">{baseObj.predictedUnits}u</td>
                            <td className="py-3 px-2 text-right text-xs font-medium text-muted-foreground border-l border-border/40">{f.lowerBound}</td>
                            <td className="py-3 px-2 text-center text-xs font-bold text-success">{f.predictedUnits}u</td>
                            <td className="py-3 px-2 text-left text-xs font-medium text-muted-foreground">{f.upperBound}</td>
                            <td className="py-3 px-6 text-right">
                              <span className={`text-[11px] font-bold px-2 py-1 rounded bg-transparent ${diff > 0 ? "text-success" : diff < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                {diff > 0 ? '+' : ''}{diff}u
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Controls Sidebar */}
          <div className="space-y-6">

            {/* Event Overrides */}
            <div className="rounded-3xl border border-border/40 p-6 bg-card shadow-lg flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 font-body">
                  <Calendar className="h-4 w-4 text-primary" /> Event Overrides
                </h3>
              </div>

              <p className="text-[11px] text-muted-foreground font-body mb-5 shrink-0">
                Toggle anticipated events to automatically inject feature weights into the model.
              </p>

              <div className="space-y-3 overflow-y-auto pr-2 flex-grow scrollbar-thin">
                {simulator.manualInputs.map(mi => {
                  const active = activeManualInputs.includes(mi.id);
                  const impactPositive = mi.impact >= 1;
                  return (
                    <div
                      key={mi.id}
                      className={`relative flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all overflow-hidden ${active ? "bg-primary/5 border-primary/30 shadow-sm" : "bg-card border-border/40 hover:border-border"}`}
                      onClick={() => toggleManualInput(mi.id)}
                    >
                      {active && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                      )}

                      <div className="flex items-center gap-3 pl-2">
                        <div className={`flex items-center justify-center h-5 w-5 rounded-md border ${active ? "bg-primary border-primary text-primary-foreground" : "border-border/60"}`}>
                          {active && <CheckCircle2 className="h-3 w-3" />}
                        </div>
                        <div>
                          <p className={`text-[12px] font-semibold ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{mi.name}</p>
                          <p className="text-[10px] text-muted-foreground font-body mt-0.5">{mi.type} · {getWeekRange(mi.weekKey, mi.endWeekKey)}</p>
                        </div>
                      </div>
                      <div className={`flex flex-col items-end gap-0.5 text-[11px] font-bold ${active ? (impactPositive ? "text-success" : "text-destructive") : "text-muted-foreground/50"}`}>
                        <div className="flex items-center gap-0.5">
                          {impactPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {impactPositive ? "+" : ""}{((mi.impact - 1) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {activeManualInputs.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/30 shrink-0">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <p className="text-[11px] font-semibold text-primary font-body">
                      {activeManualInputs.length} event{activeManualInputs.length > 1 ? "s" : ""} injected into scenario
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DemandForecast;

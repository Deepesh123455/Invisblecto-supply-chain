import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, LayoutDashboard, TrendingUp, Warehouse, Network,
  Sparkles, ShieldCheck, Zap,
  AlertTriangle
} from "lucide-react";

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: "Enterprise Intelligence Dashboard",
    tagline: "Your entire operation at a glance.",
    description:
      "Live KPIs, forecast accuracy tracking, operational insights, and real-time growth trends — all in one command center built for decision-makers.",
    image: "/ss1.png",
    imageAlt: "Dashboard overview screenshot",
  },
  {
    icon: TrendingUp,
    title: "Demand Intelligence",
    tagline: "Predict. Plan. Profit.",
    description:
      "AI-powered scenario modeling lets you simulate seasonal events, toggle demand overrides, and see 8-week projections with confidence ranges — before committing inventory.",
    image: "/ss2.png",
    imageAlt: "Demand forecasting screenshot",
  },
  {
    icon: Warehouse,
    title: "Supply Operations",
    tagline: "Every SKU. Every shelf. Optimised.",
    description:
      "Identify dead stock, flag stockout risks, and auto-trigger replenishment across all zones. Built for multi-store, multi-SKU operations.",
    image: "/ss3.png",
    imageAlt: "Supply operations screenshot",
  },
  {
    icon: Network,
    title: "Store Network",
    tagline: "Multiples stores. Single Source Of Truth.",
    description:
      "Store performance, inter-store transfer recommendations, and zone-level health scoring — so you always know which stores need attention first.",
    image: "/ss4.png",
    imageAlt: "Store network screenshot",
  },
];

const STATS = [
  { end: 91.3, decimals: 1, suffix: "%", label: "Forecast Accuracy" },
  { end: 65, decimals: 0, suffix: "+", label: "Stores Connected" },
  { end: 2450, decimals: 0, suffix: "", label: "SKUs Tracked", format: true },
  { end: 8, decimals: 0, suffix: "-wk", label: "Forward Planning" },
];

function CountUp({ end, decimals = 0, suffix = "", format = false }: {
  end: number; decimals?: number; suffix?: string; format?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setValue(eased * end);
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end]);

  const display = format
    ? Math.round(value).toLocaleString("en-IN")
    : value.toFixed(decimals);

  return <span ref={ref}>{display}{suffix}</span>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } }),
};

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur border-b border-border px-6 md:px-12 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg ai-gradient flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-primary-foreground font-display">D</span>
          </div>
          <div className="flex-col "><span className="text-lg font-bold text-foreground font-display tracking-tight">DemandIQ</span>
            <span className="text-[11px] text-muted-foreground font-medium hidden sm:block">Powered by InvisibleCTO</span></div>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="h-8 px-4 rounded-lg ai-gradient text-primary-foreground text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
        >
          Get Started <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="px-6 md:px-12 pt-20 pb-16 text-center max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground tracking-tight leading-tight mb-4">
            Predict Demand.<br />
            <span className="ai-gradient bg-clip-text" style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Optimize Supply.
            </span>
          </h1>

          <div className="mb-8">
            <span className="ai-gradient bg-clip-text text-sm md:text-base font-bold uppercase tracking-[0.3em]" style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Stay Ahead Of Every Spike
            </span>
          </div>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            DemandIQ is the AI operations layer built for Businesses — turning your sales, inventory, and store data into decisions you can act on today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/login")}
              className="h-12 px-8 rounded-xl ai-gradient text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all hover:scale-[1.02] shadow-lg shadow-primary/20"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </button>
            <button

              className="h-12 px-8 rounded-xl border border-border bg-card text-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:border-primary/40 transition-colors"
            >
              + Schedule Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── Stats Strip ── */}


      {/* ── Feature Sections ── */}
      <section className="px-6 md:px-12 pb-20 max-w-6xl mx-auto space-y-24">
        {FEATURES.map((feature, i) => {
          const Icon = feature.icon;
          const isEven = i % 2 === 0;
          return (
            <motion.div
              key={feature.title}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${!isEven ? "lg:flex-row-reverse" : ""}`}
            >
              {/* Text — alternating side */}
              <div className={!isEven ? "lg:order-2" : ""}>

                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight mb-2">
                  {feature.title}
                </h2>
                <p className="text-sm font-semibold text-primary mb-3">{feature.tagline}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>

              {/* Screenshot */}
              <div className={`${!isEven ? "lg:order-1" : ""} group`}>
                <div className="rounded-2xl border border-border bg-card card-shadow overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-500">
                  {/* Fake browser chrome */}
                  <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-muted/40">
                    <span className="h-2.5 w-2.5 rounded-full bg-border" />
                    <span className="h-2.5 w-2.5 rounded-full bg-border" />
                    <span className="h-2.5 w-2.5 rounded-full bg-border" />
                    <div className="flex-1 mx-3 h-4 rounded bg-border/60 max-w-[140px]" />
                  </div>
                  <img
                    src={feature.image}
                    alt={feature.imageAlt}
                    className="w-full h-auto block border-0 group-hover:scale-[1.01] transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* ── Trust / Pillars ── */}
      <section className="px-6 md:px-12 py-16 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">Built . From day one.</h2>
          <p className="text-sm text-muted-foreground">No generic dashboards. Purpose-built for multi-store, multi-SKU apparel operations.</p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Sparkles, title: "AI-First Architecture", body: "Every number you see is driven by a live forecasting engine — not static reports." },
            { icon: ShieldCheck, title: "Reconciliation Built-In", body: "Stock discrepancies, stockout recovery, and lost-sales healing are automatic." },
            { icon: Zap, title: "Agentic Scenario Modeling", body: "Toggle seasonal events and see demand impact across your entire store network instantly." },
            { icon: AlertTriangle, title: "Real-Time Alerts", body: "Stockouts, slow-moving inventory, and forecast deviations — flagged before they impact revenue." }
          ].map((p, i) => (
            <motion.div
              key={p.title}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              className="rounded-2xl bg-background border border-border p-6 card-shadow hover:shadow-lg hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <p.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{p.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 md:px-12 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-sm font-bold text-primary">Ready to see your data differently?</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Your supply chain, now intelligent.
          </h2>

          <button
            onClick={() => navigate("/login")}
            className="h-13 px-10 py-3.5 rounded-xl ai-gradient text-primary-foreground font-bold text-sm inline-flex items-center gap-2 hover:opacity-90 transition-all hover:scale-[1.02] shadow-lg shadow-primary/20"
          >
            Get Started  <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 md:px-12 py-6 border-t border-border flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md ai-gradient flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary-foreground">D</span>
          </div>
          <span className="text-xs font-bold text-foreground">DemandIQ</span>
          <span className="text-[10px] text-muted-foreground">· by InvisibleCTO</span>
        </div>
        <p className="text-[10px] text-muted-foreground">© 2026 InvisibleCTO. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default LandingPage;

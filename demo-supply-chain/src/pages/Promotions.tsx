import { AppLayout } from "@/components/AppLayout";
import { Sparkles, Tag, Package, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const promotions = [
  {
    product: "Printed Kurti",
    excess: 180,
    daysUnsold: 45,
    recommendation: "Run 15% discount campaign",
    agent: "Zoya",
    color: "bg-purple-500",
  },
  {
    product: "Winter Jacket SKU-12",
    excess: 95,
    daysUnsold: 60,
    recommendation: "Bundle with scarf",
    agent: "Zoya",
    color: "bg-amber-500",
  },
  {
    product: "Decorative Lamp",
    excess: 70,
    daysUnsold: 38,
    recommendation: "Flash sale in Bangalore region",
    agent: "Zoya",
    color: "bg-emerald-500",
  },
];

const impact = [
  { label: "Inventory Reduction", value: "28%", icon: TrendingDown, color: "text-success" },
  { label: "Cash Released", value: "₹3,20,000", icon: DollarSign, color: "text-primary" },
  { label: "Est. Revenue Lift", value: "₹1,10,000", icon: BarChart3, color: "text-warning" },
];

const Promotions = () => {
  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Promotion Optimization</h1>
          <p className="text-sm text-muted-foreground mt-1">Campaign strategies by Zoya</p>
        </div>

        {/* Promotion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {promotions.map((promo, i) => (
            <motion.div
              key={promo.product}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-card border card-shadow p-5 hover:card-shadow-hover transition-shadow"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${promo.color} text-xs font-bold text-primary-foreground`}>
                  {promo.product[0]}
                </div>
                <h3 className="text-sm font-semibold text-foreground">{promo.product}</h3>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Excess Inventory</span>
                  <span className="font-semibold text-foreground">{promo.excess} units</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Days Unsold</span>
                  <span className="font-semibold text-destructive">{promo.daysUnsold} days</span>
                </div>
              </div>
              <div className="rounded-xl p-3" style={{ background: "hsl(225, 30%, 96%)" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Tag className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Recommendation</span>
                </div>
                <p className="text-sm text-foreground">{promo.recommendation}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Projected Impact */}
        <div className="rounded-2xl bg-card border card-shadow p-6">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Projected Impact</h2>
            <div className="ai-badge">
              <Sparkles className="h-3 w-3" />
              AI Generated
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {impact.map((item) => (
              <div key={item.label} className="rounded-xl bg-secondary/50 p-4 text-center">
                <item.icon className={`h-5 w-5 mx-auto mb-2 ${item.color}`} />
                <p className="text-xl font-bold text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Promotions;

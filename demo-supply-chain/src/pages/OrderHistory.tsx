import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { 
  History, 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  XCircle,
  ArrowRight,
  Filter,
  Calendar,
  Building2,
  ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const ORDERS = [
  {
    id: "ORD-2024-0891",
    date: "2024-05-04",
    source: "Mumbai Warehouse",
    destination: "Bengaluru Central",
    status: "Delivered",
    items: 142,
    amount: "₹2,45,000",
    priority: "Normal"
  },
  {
    id: "ORD-2024-0895",
    date: "2024-05-05",
    source: "Delhi Hub",
    destination: "Noida Sector 18",
    status: "In Transit",
    items: 85,
    amount: "₹1,12,000",
    priority: "High"
  },
  {
    id: "ORD-2024-0902",
    date: "2024-05-06",
    source: "Chennai Terminal",
    destination: "Hyderabad Gachibowli",
    status: "Processing",
    items: 210,
    amount: "₹4,30,000",
    priority: "Critical"
  },
  {
    id: "ORD-2024-0888",
    date: "2024-05-02",
    source: "Kolkata Port",
    destination: "Guwahati Hub",
    status: "Delivered",
    items: 56,
    amount: "₹89,000",
    priority: "Normal"
  },
  {
    id: "ORD-2024-0905",
    date: "2024-05-06",
    source: "Mumbai Warehouse",
    destination: "Pune FC Road",
    status: "Pending",
    items: 117,
    amount: "₹1,98,000",
    priority: "Medium"
  },
  {
    id: "ORD-2024-0880",
    date: "2024-04-30",
    source: "Ahmedabad Zone",
    destination: "Surat Textile Market",
    status: "Cancelled",
    items: 20,
    amount: "₹34,500",
    priority: "Low"
  }
];

const STATUS_CONFIG: Record<string, { icon: any; class: string }> = {
  "Delivered": { icon: CheckCircle2, class: "status-success" },
  "In Transit": { icon: Truck, class: "status-medium" },
  "Processing": { icon: Clock, class: "status-high" },
  "Pending": { icon: Clock, class: "bg-muted text-muted-foreground" },
  "Cancelled": { icon: XCircle, class: "status-critical" },
};

const OrderHistory = () => {
  const [search, setSearch] = useState("");

  const filteredOrders = ORDERS.filter(order => 
    order.id.toLowerCase().includes(search.toLowerCase()) ||
    order.destination.toLowerCase().includes(search.toLowerCase()) ||
    order.source.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-10 px-0 md:px-4 pt-2 md:pt-4">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 md:px-0">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-4xl font-display font-bold text-foreground tracking-tight">Order History</h1>
            <p className="text-xs md:text-sm text-muted-foreground font-body">
              Tracking <span className="font-bold text-foreground">{ORDERS.length}</span> recent enterprise shipments across the network.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
               <Filter className="h-3.5 w-3.5" />
               Filter
             </div>
             <Button className="ai-gradient text-white h-9 px-4 rounded-lg font-bold text-xs">
               Export Data
             </Button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 md:px-0">
          {[
            { label: "Active Shipments", value: "3", icon: Truck, color: "text-primary" },
            { label: "Completed (24h)", value: "12", icon: CheckCircle2, color: "text-success" },
            { label: "Avg. Transit Time", value: "1.2d", icon: Clock, color: "text-warning" },
            { label: "Inventory Value", value: "₹12.4L", icon: Package, color: "text-primary" },
          ].map((stat, i) => (
            <div key={i} className="bg-card border border-border/40 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground font-display">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="px-4 md:px-0">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Order ID or Destination..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-11 bg-card border-border/60 focus:border-primary/50 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-card md:border border-border/40 md:rounded-2xl md:overflow-hidden md:card-shadow">
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30 border-b border-border/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="text-left p-5 pl-8">Order Entity</th>
                  <th className="text-left p-5">Route</th>
                  <th className="text-left p-5">Status</th>
                  <th className="text-left p-5">Items</th>
                  <th className="text-right p-5 pr-8">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {filteredOrders.map((order, i) => {
                  const StatusIcon = STATUS_CONFIG[order.status]?.icon || Clock;
                  return (
                    <motion.tr 
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={order.id} 
                      className="group hover:bg-muted/5 transition-colors cursor-pointer"
                    >
                      <td className="p-5 pl-8">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                            <Package className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{order.id}</span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5" /> {order.date}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">{order.source}</span>
                            <span className="text-[10px] text-muted-foreground">Source Hub</span>
                          </div>
                          <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">{order.destination}</span>
                            <span className="text-[10px] text-muted-foreground">Destination</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-transparent ${STATUS_CONFIG[order.status]?.class}`}>
                          <StatusIcon className="h-3 w-3" />
                          {order.status}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className="text-sm font-bold text-foreground">{order.items}</span>
                        <span className="text-[10px] text-muted-foreground ml-1">SKUs</span>
                      </td>
                      <td className="p-5 pr-8 text-right">
                        <span className="text-sm font-bold text-foreground font-display">{order.amount}</span>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Consignment Val.</p>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-border/20">
            {filteredOrders.map((order, i) => {
              const StatusIcon = STATUS_CONFIG[order.status]?.icon || Clock;
              return (
                <div key={order.id} className="p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">{order.id}</span>
                        <span className="text-[10px] text-muted-foreground">{order.date}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${STATUS_CONFIG[order.status]?.class}`}>
                      <StatusIcon className="h-2.5 w-2.5" />
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-2 border-y border-border/10">
                    <div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">From</p>
                      <p className="text-[11px] font-bold text-foreground">{order.source}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">To</p>
                      <p className="text-[11px] font-bold text-foreground">{order.destination}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Items</p>
                        <p className="text-xs font-bold text-foreground">{order.items}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Value</p>
                        <p className="text-xs font-bold text-foreground">{order.amount}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredOrders.length === 0 && (
            <div className="p-20 text-center space-y-3">
              <History className="h-10 w-10 text-muted-foreground/20 mx-auto" />
              <p className="text-sm text-muted-foreground italic font-body">No orders found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default OrderHistory;

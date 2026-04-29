import { Box, Truck, ShoppingCart, Info, ArrowRight, MapPin, Calendar, User, Package, ExternalLink, ChevronLeft, ChevronRight, ListFilter } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const RECENT_EVENTS = [
  {
    id: 1,
    title: "Shipment Arrived",
    desc: "450 units of 'Classic Cotton Series' received at YourCompany Mumbai Warehouse.",
    time: "12 mins ago",
    date: "27 Apr 2024",
    icon: Box,
    color: "text-success",
    bg: "bg-success/10",
    details: {
      location: "YourCompany Mumbai Central Hub",
      officer: "Arjun Mehta",
      sku: "YC-CLS-MUM-01",
      batch: "YC-2024-B1",
    }
  },
  {
    id: 2,
    title: "Dispatch in Progress",
    desc: "Truck (MH-01-BK-8822) departed from YourCompany Pune for YourCompany Surat.",
    time: "45 mins ago",
    date: "27 Apr 2024",
    icon: Truck,
    color: "text-primary",
    bg: "bg-primary/10",
    details: {
      location: "YourCompany Pune Logistics Center",
      officer: "Vikram Sawant",
      sku: "MULTIPLE - 850 units",
      batch: "YC-T-LOG-99",
    }
  },
  {
    id: 3,
    title: "Low Stock Alert",
    desc: "YourCompany Delhi Retail dropped below 15% safety stock for 'Essential Linens'.",
    time: "2 hours ago",
    date: "27 Apr 2024",
    icon: Info,
    color: "text-warning",
    bg: "bg-warning/10",
    details: {
      location: "YourCompany Delhi NCR Store",
      officer: "Surbhi Gupta",
      sku: "YC-LIN-WHT-L",
      batch: "AUTO-FLAG-YC",
    }
  },
  {
    id: 4,
    title: "Inventory Update",
    desc: "YourCompany Bangalore Hub completed weekend reconciliation for 12,000 units.",
    time: "4 hours ago",
    date: "27 Apr 2024",
    icon: ShoppingCart,
    color: "text-primary",
    bg: "bg-primary/10",
    details: {
      location: "YourCompany Bangalore Mega Warehouse",
      officer: "Karthik Raja",
      sku: "SYSTEM - ALL",
      batch: "YC-REC-WK",
    }
  },
];

const FULL_LOG_DATA = [
  ...RECENT_EVENTS,
  { id: 5, title: "Order Picked", desc: "YourCompany Chennai team completed picking for 42 online orders (Summer Collection).", time: "5 hours ago", date: "27 Apr 2024", icon: ShoppingCart, color: "text-primary", bg: "bg-primary/10", details: { location: "Chennai Hub", officer: "P. Mani", sku: "YC-SHRT-WHT-L", batch: "YC-SS-24-01" } },
  { id: 6, title: "Quality Check", desc: "Batch YC-2024-A9 (Premium Silk Sarees) passed quality inspection at Pune.", time: "Yesterday", date: "26 Apr 2024", icon: Info, color: "text-success", bg: "bg-success/10", details: { location: "Pune QC Lab", officer: "D. Kulkarni", sku: "YC-SRE-GLD-UNI", batch: "YC-2024-A9" } },
  { id: 7, title: "Return Received", desc: "Defective item (size mismatch) returned from YourCompany Jaipur store.", time: "Yesterday", date: "26 Apr 2024", icon: Box, color: "text-destructive", bg: "bg-destructive/10", details: { location: "Jaipur Retail", officer: "R. Singh", sku: "YC-TROU-GRY-32", batch: "RET-992" } },
  { id: 8, title: "New Vendor Added", desc: "Arora Textiles onboarded for YourCompany North Zone (Denim Fabrics).", time: "2 days ago", date: "25 Apr 2024", icon: User, color: "text-primary", bg: "bg-primary/10", details: { location: "Corporate Office", officer: "H. Kapur", sku: "FAB-DENIM-RAW", batch: "VEN-NEW-01" } },
  { id: 9, title: "Forecast Adjusted", desc: "AI model updated demand for YourCompany T-Shirt range (Basics).", time: "2 days ago", date: "25 Apr 2024", icon: ListFilter, color: "text-primary", bg: "bg-primary/10", details: { location: "Cloud System", officer: "AI Engine", sku: "YC-TEE-ALL-M", batch: "RETRAIN-V2" } },
  { id: 10, title: "Warehouse Audit", desc: "Quarterly audit completed for Outerwear & Accessories at YourCompany Hub.", time: "3 days ago", date: "24 Apr 2024", icon: Calendar, color: "text-success", bg: "bg-success/10", details: { location: "Bengaluru Hub", officer: "S. Naidu", sku: "INV-CLOTH-24", batch: "AUDIT-Q1" } },
  { id: 11, title: "Safety Protocol Update", desc: "New handling guidelines issued for YourCompany Premium Garments.", time: "4 days ago", date: "23 Apr 2024", icon: Info, color: "text-primary", bg: "bg-primary/10", details: { location: "Global Ops", officer: "R. Joshi", sku: "GAR-PROT-01", batch: "SAFETY-DOC" } },
  { id: 12, title: "Truck Maintenance", desc: "MH-01-BK-8822 scheduled for routine checkup after Surat trip.", time: "5 days ago", date: "22 Apr 2024", icon: Truck, color: "text-warning", bg: "bg-warning/10", details: { location: "Surat Yard", officer: "M. Khan", sku: "LOG-VEH-8822", batch: "MT-8822" } },
];

// Reusable Activity Item Component
const ActivityItem = ({ event, isModal = false }: { event: any, isModal?: boolean }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className={`flex items-center gap-4 ${isModal ? 'p-4 rounded-xl' : 'p-3 rounded-lg'} border border-border/40 hover:bg-muted/30 transition-all group cursor-pointer`}>
          <div className={`shrink-0 ${isModal ? 'h-12 w-12 rounded-xl' : 'h-10 w-10 rounded-lg'} ${event.bg} flex items-center justify-center`}>
            <event.icon className={`${isModal ? 'h-6 w-6' : 'h-4.5 w-4.5'} ${event.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className={`${isModal ? 'text-base' : 'text-sm'} font-bold text-foreground truncate group-hover:text-primary transition-colors`}>{event.title}</h3>
              <span className="text-[10px] font-bold bg-muted/50 px-2 py-0.5 rounded-full text-muted-foreground whitespace-nowrap">{event.time}</span>
            </div>
            <p className={`${isModal ? 'text-xs' : 'text-[11px]'} text-muted-foreground font-body mt-0.5 line-clamp-1`}>{event.desc}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
        </div>
      </DialogTrigger>
      <DialogContent className="bg-card border-border shadow-2xl max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className={`h-12 w-12 rounded-xl ${event.bg} flex items-center justify-center`}>
              <event.icon className={`h-7 w-7 ${event.color}`} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">{event.title}</DialogTitle>
              <DialogDescription className="text-sm">Happened {event.time} at YourCompany</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 rounded-xl bg-muted/10 border mb-6">
          <p className="text-base font-medium text-foreground leading-relaxed italic">"{event.desc}"</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="p-3 rounded-xl border bg-card space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3 w-3" /> Location
            </p>
            <p className="text-xs font-bold">{event.details.location}</p>
          </div>
          <div className="p-3 rounded-xl border bg-card space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <User className="h-3 w-3" /> Responsible
            </p>
            <p className="text-xs font-bold">{event.details.officer}</p>
          </div>
          <div className="p-3 rounded-xl border bg-card space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Package className="h-3 w-3" /> Item / SKU
            </p>
            <p className="text-xs font-bold">{event.details.sku}</p>
          </div>
          <div className="p-3 rounded-xl border bg-card space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3 w-3" /> Batch ID
            </p>
            <p className="text-xs font-bold">{event.details.batch}</p>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export function OperationalInsights() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(FULL_LOG_DATA.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLogs = FULL_LOG_DATA.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="w-full">
      {/* Recent Activity Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl bg-card border card-shadow p-5 flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Recent Activity</h2>
            <p className="text-xs text-muted-foreground font-body font-medium mt-0.5 line-clamp-1">Last 7 days</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">Live Updates</span>
        </div>

        <div className="space-y-2 flex-1">
          {RECENT_EVENTS.map((event) => (
            <ActivityItem key={event.id} event={event} />
          ))}
        </div>

        {/* Full Log Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="mt-4 w-full py-2.5 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg border border-primary/20 transition-all flex items-center justify-center gap-2">
              View Full Activity Log <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-card border-border max-h-[85vh] flex flex-col p-0 overflow-hidden text-left shadow-2xl">
            <div className="p-5 border-b bg-card z-10">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Business Activity Log</DialogTitle>
                <DialogDescription className="text-sm text-left">Full audit trail for YourCompany Operations</DialogDescription>
              </DialogHeader>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scroll">
              {currentLogs.map((log) => (
                <ActivityItem key={log.id} event={log} isModal={true} />
              ))}
            </div>

            <div className="p-4 border-t flex items-center justify-between bg-muted/5">
              <p className="text-xs font-bold text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, FULL_LOG_DATA.length)} of {FULL_LOG_DATA.length}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-xs hover:bg-muted transition-all disabled:opacity-30"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-all disabled:opacity-30"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}

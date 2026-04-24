import {
  LayoutDashboard, TrendingUp, Warehouse,
  Settings, Sparkles, Activity, Network, ArrowRightLeft
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Demand Intelligence", url: "/demand-forecast", icon: TrendingUp },
  { title: "Supply Operations", url: "/inventory-allocation", icon: Warehouse },
  { title: "Inter-store Transfers", url: "/inter-store-transfers", icon: ArrowRightLeft },
  { title: "Store Network", url: "/store-network", icon: Network },
  { title: "Exceptions Room", url: "/exceptions", icon: Sparkles },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg ai-gradient shrink-0">
            <span className="text-sm font-bold text-sidebar-primary-foreground font-display">Y</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-accent-foreground tracking-wide font-display">Your Company</span>
              <span className="text-[10px] text-sidebar-foreground font-body uppercase tracking-widest">Inventory AI</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-widest font-body">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors font-body"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-widest font-body">
              System Status
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-3 px-2">
                <div className="flex items-center gap-2.5 rounded-lg p-2.5 bg-sidebar-accent/50">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse-soft shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-sidebar-accent-foreground font-body">65 Stores · 10 SKUs</p>
                    <p className="text-[10px] text-sidebar-foreground font-body">6 Countries · 8 Regions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-lg p-2.5 bg-sidebar-accent/50">
                  <Activity className="h-3.5 w-3.5 text-warning shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-sidebar-accent-foreground font-body">4 exceptions flagged</p>
                    <p className="text-[10px] text-sidebar-foreground font-body">1 critical · 2 high</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-lg p-2.5 bg-sidebar-accent/50">
                  <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-sidebar-accent-foreground font-body">Monday dispatch ready</p>
                    <p className="text-[10px] text-sidebar-foreground font-body">6 warehouse orders</p>
                  </div>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="rounded-lg bg-sidebar-accent p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-sidebar-primary" />
              <span className="text-[10px] font-semibold text-sidebar-accent-foreground uppercase tracking-wider font-body">AI Engine</span>
            </div>
            <p className="text-[11px] text-sidebar-foreground font-body">Last scan: 2 min ago · All models active</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

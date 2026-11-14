import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  CalendarClock,
  Factory,
  ArrowLeftRight,
  ClipboardList,
  Flame,
  LayoutDashboard,
  Database,
  ArrowRightLeft,
  BarChart3,
  ChevronDown,
  Command,
  SlidersHorizontal,
  LogOut,
  Search,
  Layers,
  CircleDot,
  Contact,
  Trophy,
  ClipboardCheck,
  Gauge,
  Clock,
  Hourglass,
  AlertTriangle,
  Package,
  GitFork,
  Wrench,
  Network,
  Ban,
  Route,
  Columns2,
  FileSpreadsheet,
  ListChecks,
  PlusCircle,
  Scissors,
  Lightbulb,
  Settings,
  MapPin,
  Boxes,
  Building2,
  LayoutGrid,
  Users,
  Cog,
  CircleSlash,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function Sidebar({ collapsed = false, onToggleCollapse, className }: SidebarProps) {
  const router = useRouter();
  const currentPath = router.pathname;

  // Active module state (defaults to "overview" for the overview dashboard)
  const [activeModule, setActiveModule] = useState<string>("overview");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Global keyboard shortcut: Cmd+K / Ctrl+K to focus search, Esc to clear
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (collapsed && onToggleCollapse) {
          onToggleCollapse();
        }
        setTimeout(() => {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        }, 50);
      }
      if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        setSearchQuery("");
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [collapsed, onToggleCollapse]);

  React.useEffect(() => {
    if (currentPath === "/") {
      setActiveModule("overview");
    } else if (currentPath === "/machine-scheduler") {
      setActiveModule("machine-scheduler");
    } else if (currentPath === "/production") {
      setActiveModule("production");
    } else if (currentPath === "/work-orders") {
      setActiveModule("work-orders");
    } else if (currentPath === "/bop-transfer") {
      setActiveModule("bop-transfer");
    }
  }, [currentPath]);

  // Track single open dropdown submenu (auto-closes other dropdowns when one is opened)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>("reports");

  const toggleSubmenu = (key: string) => {
    setOpenSubmenu((prev) => (prev === key ? null : key));
  };

  // Primary operational modules from PRODSYNC top navigation
  const primaryModules = [
    {
      id: "overview",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: "Live",
      badgeColor: "bg-[#EAF8EF] text-[#1E823B]",
      href: "/",
    },
    {
      id: "machine-scheduler",
      label: "Machine Scheduler",
      icon: CalendarClock,
      badge: "Active",
      badgeColor: "bg-[#007AFF] text-white",
      href: "/machine-scheduler",
    },
    {
      id: "production",
      label: "Production",
      icon: Factory,
      badge: "28",
      badgeColor: "bg-[#EAF8EF] text-[#1E823B]",
      href: "/production",
    },
    {
      id: "bop-transfer",
      label: "BOP Transfer",
      icon: Boxes,
      badge: "Store",
      badgeColor: "bg-[#EAF8EF] text-[#1E823B]",
      href: "/bop-transfer",
    },
    {
      id: "work-orders",
      label: "Work Orders",
      icon: ClipboardList,
      badge: "SoftGen",
      badgeColor: "bg-[#E0F2FE] text-[#0284C7]",
      href: "/work-orders",
    },
    {
      id: "brazing",
      label: "Brazing",
      icon: Flame,
      iconColor: "text-[#FF9500]",
      href: "#",
    },
  ];

  // Dropdown menu modules with enterprise manufacturing sub-items
  const dropdownModules = [
    {
      id: "masters",
      label: "Masters",
      icon: Database,
      items: [
        // --- CORE CONFIGURATION ---
        {
          id: "bom-master-assembly",
          label: "BOM Master (Assembly)",
          icon: GitFork,
          iconColor: "text-[#D97706]",
          badge: "Child + BOP",
          badgeColor: "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]",
          sectionHeader: "CORE CONFIGURATION",
          sectionIcon: Settings,
          sectionColor: "text-[#6E6E73]",
        },
        {
          id: "zone-master",
          label: "Zone Master",
          icon: MapPin,
          iconColor: "text-[#D97706]",
          badge: "Plant Zones",
          badgeColor: "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]",
        },
        {
          id: "virtual-box-master",
          label: "Virtual Box Master",
          icon: Boxes,
          iconColor: "text-[#0284C7]",
          badge: "VB1 - VB4",
          badgeColor: "bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]",
          subRow: {
            label: "BUFFER BOXES:",
            items: ["VB1", "VB2", "VB3", "VB4"],
          },
        },
        {
          id: "assembly-route-card",
          label: "Assembly Route Card",
          icon: Route,
          iconColor: "text-[#2563EB]",
          badge: "Zone Map",
          badgeColor: "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]",
        },
        {
          id: "department-master",
          label: "Department Master",
          icon: Building2,
          iconColor: "text-[#2563EB]",
        },
        {
          id: "section-master",
          label: "Section Master",
          icon: LayoutGrid,
          iconColor: "text-[#0D9488]",
        },
        {
          id: "employee-master",
          label: "Employee Master",
          icon: Users,
          iconColor: "text-[#2563EB]",
        },
        {
          id: "machines",
          label: "Machines",
          icon: Cog,
          iconColor: "text-[#2563EB]",
        },
        {
          id: "tool-master",
          label: "Tool Master",
          icon: Wrench,
          iconColor: "text-[#D97706]",
        },
        {
          id: "inventory-stock",
          label: "Inventory & Stock",
          icon: Package,
          iconColor: "text-[#0D9488]",
        },
        // --- REASON CODES ---
        {
          id: "delay-reasons",
          label: "Delay Reasons",
          icon: Clock,
          iconColor: "text-[#EA580C]",
          sectionHeader: "REASON CODES",
          sectionIcon: SlidersHorizontal,
          sectionColor: "text-[#6E6E73]",
        },
        {
          id: "cancel-split-reasons",
          label: "Cancel/Split Reasons",
          icon: CircleSlash,
          iconColor: "text-[#6E6E73]",
        },
      ],
    },
    {
      id: "transaction",
      label: "Transaction",
      icon: ArrowRightLeft,
      items: [
        {
          id: "all-transaction-forms",
          label: "All Transaction Forms",
          icon: Columns2,
          iconColor: "text-[#007AFF]",
          badge: "Hub",
          badgeColor: "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]",
        },
        // --- WORK ORDERS ---
        {
          id: "work-orders",
          label: "Work Orders",
          icon: ListChecks,
          iconColor: "text-[#2563EB]",
          sectionHeader: "WORK ORDERS",
          sectionIcon: FileSpreadsheet,
          sectionColor: "text-[#6E6E73]",
        },
        {
          id: "create-work-order",
          label: "Create Work Order",
          icon: PlusCircle,
          iconColor: "text-[#16A34A]",
        },
        {
          id: "work-order-assignment-tx",
          label: "Work Order Assignment",
          icon: Layers,
          iconColor: "text-[#2563EB]",
          badge: "5 Zones",
          badgeColor: "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]",
        },
        {
          id: "split-cancel-zone",
          label: "Split / Cancel Zone",
          icon: Scissors,
          iconColor: "text-[#DC2626]",
          badge: "11",
          badgeColor: "bg-[#DC2626] text-white font-bold",
        },
        // --- MACHINE AUDIT EMP RANKING ---
        {
          id: "machine-audit-emp-ranking-tx",
          label: "Machine Audit EMP Ranking",
          icon: Trophy,
          iconColor: "text-[#D97706]",
          sectionHeader: "MACHINE AUDIT EMP RANKING",
          sectionIcon: Lightbulb,
          sectionColor: "text-[#D97706]",
        },
        {
          id: "machine-setup-audit-entry",
          label: "Machine Setup Audit Entry",
          icon: ClipboardCheck,
          iconColor: "text-[#D97706]",
        },
      ],
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
      items: [
        {
          id: "all-reports-dashboard",
          label: "All Reports Dashboard",
          icon: LayoutDashboard,
          iconColor: "text-[#007AFF]",
        },
        // --- PRODUCTION & OPERATIONS ---
        {
          id: "operator-production-report",
          label: "Operator Production Report",
          icon: Contact,
          iconColor: "text-[#D97706]",
          badge: "Daily",
          badgeColor: "bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]",
          sectionHeader: "PRODUCTION & OPERATIONS",
          sectionIcon: BarChart3,
          sectionColor: "text-[#86868B]",
        },
        {
          id: "machine-audit-emp-ranking",
          label: "Machine Audit EMP Ranking",
          icon: Trophy,
          iconColor: "text-[#D97706]",
          badge: "Ranking",
          badgeColor: "bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]",
        },
        {
          id: "work-orders-report",
          label: "Work Orders Report",
          icon: ClipboardCheck,
          iconColor: "text-[#0284C7]",
        },
        {
          id: "machine-utilization",
          label: "Machine Utilization",
          icon: Gauge,
          iconColor: "text-[#0D9488]",
        },
        {
          id: "shift-production-log",
          label: "Shift Production Log",
          icon: Clock,
          iconColor: "text-[#0284C7]",
        },
        {
          id: "delay-downtime-analysis",
          label: "Delay & Downtime Analysis",
          icon: Hourglass,
          iconColor: "text-[#EA580C]",
        },
        {
          id: "machine-breakdowns",
          label: "Machine Breakdowns",
          icon: AlertTriangle,
          iconColor: "text-[#DC2626]",
        },
        {
          id: "material-consumption",
          label: "Material Consumption",
          icon: Package,
          iconColor: "text-[#6366F1]",
        },
        {
          id: "split-work-orders-history",
          label: "Split Work Orders History",
          icon: GitFork,
          iconColor: "text-[#4F46E5]",
        },
        {
          id: "tool-master-report",
          label: "Tool Master Report",
          icon: Wrench,
          iconColor: "text-[#2563EB]",
          badge: "Tool",
          badgeColor: "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]",
        },
        // --- ZONE PRODUCTION REPORTS ---
        {
          id: "zone-wise-production",
          label: "Zone-wise Production",
          icon: Factory,
          iconColor: "text-[#0D9488]",
          sectionHeader: "ZONE PRODUCTION REPORTS",
          sectionIcon: Network,
          sectionColor: "text-[#007AFF]",
        },
        {
          id: "zone-rejection-analysis",
          label: "Zone Rejection Analysis",
          icon: Ban,
          iconColor: "text-[#DC2626]",
        },
        {
          id: "work-order-traceability",
          label: "Work Order Traceability",
          icon: Route,
          iconColor: "text-[#2563EB]",
        },
      ],
    },
  ];

  // Clean trimmed search query
  const trimmedQuery = searchQuery.trim().toLowerCase();

  // Filter primary top modules
  const filteredPrimary = primaryModules.filter((m) =>
    !trimmedQuery || m.label.toLowerCase().includes(trimmedQuery)
  );

  // Filter dropdown modules and their nested sub-items
  const filteredDropdowns = dropdownModules
    .map((dropdown) => {
      const isParentMatch = dropdown.label.toLowerCase().includes(trimmedQuery);
      const matchingItems = !trimmedQuery
        ? dropdown.items
        : isParentMatch
        ? dropdown.items
        : dropdown.items.filter(
            (item) =>
              item.label.toLowerCase().includes(trimmedQuery) ||
              (item.sectionHeader &&
                item.sectionHeader.toLowerCase().includes(trimmedQuery))
          );
      return {
        ...dropdown,
        items: matchingItems,
      };
    })
    .filter((dropdown) => dropdown.items.length > 0);

  return (
    <aside
      className={cn(
        "apple-sidebar flex flex-col h-screen bg-[#FAFAFC] border-r border-[#E5E5EA] transition-all duration-300 z-30 select-none",
        collapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Brand Header: PRODSYNC Scheduler v2 */}
      <div className="apple-sidebar-header flex items-center justify-between px-4 py-4 border-b border-[#EBEBF0]">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* PRODSYNC Hexagon/Scheduler Glyph */}
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#007AFF] text-white shadow-sm shrink-0 font-bold text-xs tracking-tight">
            <Layers className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-[14px] font-bold text-[#1D1D1F] tracking-tight truncate">
                  PRODSYNC
                </span>
                <span className="text-[11px] font-normal text-[#86868B] italic">
                  Scheduler v2
                </span>
              </div>
              <span className="text-[10.5px] text-[#86868B] truncate flex items-center gap-1.5 mt-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#34C759] live-pulse-dot"></span>
                Shift Operations Live
              </span>
            </div>
          )}
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label="Toggle sidebar"
            className="text-[#86868B] hover:text-[#1D1D1F] p-1 rounded-lg hover:bg-[#EBEBF0] transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick Search / Filter Input */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter modules..."
              className="w-full pl-8 pr-8 py-1.5 text-xs text-[#1D1D1F] bg-white border border-[#E5E5EA] rounded-lg shadow-sm placeholder:text-[#86868B] focus:outline-none focus:border-[#007AFF] transition-colors"
            />
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2 text-[10px] text-[#86868B] hover:text-[#1D1D1F] p-0.5 rounded cursor-pointer"
                title="Clear filter (Esc)"
              >
                ✕
              </button>
            ) : (
              <kbd
                onClick={() => searchInputRef.current?.focus()}
                className="absolute right-2 text-[10px] font-medium bg-[#F2F2F7] border border-[#E5E5EA] px-1 py-0.5 rounded text-[#86868B] cursor-pointer hover:bg-[#E5E5EA]"
                title="Press ⌘K or Ctrl+K to search"
              >
                ⌘K
              </kbd>
            )}
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 custom-scrollbar">
        {/* Empty state when search yields no matches */}
        {trimmedQuery && filteredPrimary.length === 0 && filteredDropdowns.length === 0 && (
          <div className="px-3 py-8 text-center select-none">
            <Search className="w-6 h-6 text-[#86868B] mx-auto mb-2 opacity-40" />
            <div className="text-xs font-semibold text-[#1D1D1F]">No modules found</div>
            <div className="text-[11px] text-[#86868B] mt-0.5">
              No results for &ldquo;{searchQuery}&rdquo;
            </div>
            <button
              onClick={() => {
                setSearchQuery("");
                searchInputRef.current?.focus();
              }}
              className="mt-3 px-3 py-1 text-[11px] font-medium text-[#007AFF] bg-[#007AFF]/10 hover:bg-[#007AFF]/20 rounded-lg transition-colors cursor-pointer"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Core Operations / Scheduler Modules */}
        {filteredPrimary.length > 0 && (
          <div className="space-y-1">
            {!collapsed && (
              <div className="px-2.5 mb-1.5 text-[10.5px] font-semibold text-[#86868B] uppercase tracking-wider">
                Scheduling & Production
              </div>
            )}

            {filteredPrimary.map((module) => {
              const Icon = module.icon;
              const isCurrent = activeModule === module.id;

              return (
                <button
                  key={module.id}
                  onClick={() => {
                    setActiveModule(module.id);
                    setOpenSubmenu(null); // Auto-close open dropdowns when clicking a primary module
                    if (module.href && module.href !== "#") {
                      router.push(module.href);
                    }
                  }}
                  title={collapsed ? module.label : undefined}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all group text-left",
                    isCurrent
                      ? "bg-[#007AFF] text-white shadow-sm font-semibold"
                      : "text-[#1D1D1F] hover:bg-[#EBEBF0]/70"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isCurrent
                        ? "text-white"
                        : module.iconColor || "text-[#6E6E73] group-hover:text-[#1D1D1F]"
                    )}
                  />

                  {!collapsed && (
                    <span className="truncate flex-1">{module.label}</span>
                  )}

                  {!collapsed && (
                    <>
                      {module.badge && !isCurrent && (
                        <span
                          className={cn(
                            "text-[10px] font-medium px-1.5 py-0.2 rounded-full",
                            module.badgeColor
                          )}
                        >
                          {module.badge}
                        </span>
                      )}
                      {isCurrent && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0"></span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* System Masters & Data Dropdowns */}
        {filteredDropdowns.length > 0 && (
          <div className="space-y-1">
            {!collapsed && (
              <div className="px-2.5 mb-1.5 text-[10.5px] font-semibold text-[#86868B] uppercase tracking-wider">
                System Masters & Data
              </div>
            )}

            {filteredDropdowns.map((dropdown) => {
              const Icon = dropdown.icon;
              const isOpen = openSubmenu === dropdown.id || trimmedQuery.length > 0;
              const isAnySubActive = dropdown.items.some(
                (item) => activeModule === item.id
              );

            return (
              <div key={dropdown.id} className="space-y-0.5">
                {/* Main Dropdown Button */}
                <div
                  onClick={() => toggleSubmenu(dropdown.id)}
                  title={collapsed ? dropdown.label : undefined}
                  className={cn(
                    "flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors group",
                    isAnySubActive
                      ? "text-[#007AFF] bg-[#E8F2FE]/50 font-semibold"
                      : "text-[#1D1D1F] hover:bg-[#EBEBF0]/70"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isAnySubActive
                          ? "text-[#007AFF]"
                          : "text-[#6E6E73] group-hover:text-[#1D1D1F]"
                      )}
                    />
                    {!collapsed && <span className="truncate">{dropdown.label}</span>}
                  </div>

                  {!collapsed && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[#86868B] bg-white border border-[#E5E5EA] px-1.5 py-0.2 rounded-full">
                        {dropdown.items.length}
                      </span>
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 text-[#86868B] transition-transform duration-200",
                          isOpen ? "rotate-0" : "-rotate-90"
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Submenu Items with Smooth Grid Accordion */}
                {!collapsed && (
                  <div
                    className="accordion-grid-wrapper overflow-hidden"
                    style={{
                      gridTemplateRows: isOpen ? "1fr" : "0fr",
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div className="min-h-0 pl-5 pr-1 pt-0.5 space-y-0.5 border-l border-[#E5E5EA] ml-4 mt-0.5">
                    {dropdown.items.map((subItem: any, idx: number) => {
                      const isSubActive = activeModule === subItem.id;
                      const SubIcon = subItem.icon || CircleDot;

                      return (
                        <React.Fragment key={subItem.id}>
                          {subItem.sectionHeader && (
                            <div
                              className={cn(
                                "text-[9.5px] font-bold tracking-wider px-2 pt-2.5 pb-1 flex items-center gap-1.5 uppercase select-none",
                                subItem.sectionColor || "text-[#86868B]",
                                idx > 0 && "border-t border-[#E5E5EA]/70 mt-1"
                              )}
                            >
                              {subItem.sectionIcon && (
                                <subItem.sectionIcon className="w-3 h-3 shrink-0" />
                              )}
                              <span>{subItem.sectionHeader}</span>
                            </div>
                          )}

                          <div
                            onClick={() => setActiveModule(subItem.id)}
                            className={cn(
                              "flex items-center justify-between text-[11px] py-1.5 px-2 rounded-lg cursor-pointer transition-colors group/sub",
                              isSubActive
                                ? "bg-[#007AFF] text-white font-medium shadow-xs"
                                : "text-[#48484A] hover:text-[#007AFF] hover:bg-[#EBEBF0]/60"
                            )}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <SubIcon
                                className={cn(
                                  "w-3.5 h-3.5 shrink-0 transition-colors",
                                  isSubActive
                                    ? "text-white"
                                    : subItem.iconColor || "text-[#86868B] group-hover/sub:text-[#007AFF]"
                                )}
                              />
                              <span className="truncate">{subItem.label}</span>
                            </div>

                            {subItem.badge && (
                              <span
                                className={cn(
                                  "text-[9px] font-semibold px-1.5 py-0.2 rounded shrink-0",
                                  isSubActive
                                    ? "bg-white/20 text-white"
                                    : subItem.badgeColor || "bg-[#F2F2F7] text-[#86868B]"
                                )}
                              >
                                {subItem.badge}
                              </span>
                            )}
                          </div>

                          {subItem.subRow && (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#F5F5F7] rounded-md text-[9px] text-[#86868B] my-1 ml-5 border border-[#E5E5EA]">
                              <span className="font-semibold text-[8px] uppercase tracking-wider shrink-0">
                                {subItem.subRow.label}
                              </span>
                              <div className="flex items-center gap-1">
                                {subItem.subRow.items.map((box: string) => (
                                  <span
                                    key={box}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveModule(`buffer-box-${box.toLowerCase()}`);
                                    }}
                                    className="px-1.5 py-0.2 bg-white border border-[#D1D1D6] rounded text-[#1D1D1F] font-mono text-[9px] hover:border-[#007AFF] hover:text-[#007AFF] transition-colors cursor-pointer"
                                  >
                                    {box}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* User Footer Profile: Super Administrator */}
      <div className="apple-sidebar-footer p-3 border-t border-[#EBEBF0]">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#E5E5EA] shadow-sm">
          <div className="w-8 h-8 rounded-full bg-[#007AFF] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
            SA
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[#1D1D1F] truncate leading-tight">
                Super Administrator
              </div>
              <div className="text-[10px] text-[#007AFF] font-medium flex items-center gap-1 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#34C759] live-pulse-dot"></span>
                Super Admin
              </div>
            </div>
          )}
          {!collapsed && (
            <button
              title="Sign Out"
              className="text-[#86868B] hover:text-[#1D1D1F] p-1 rounded-lg hover:bg-[#F2F2F7] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}


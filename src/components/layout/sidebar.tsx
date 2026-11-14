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
  ChevronLeft,
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
    } else if (currentPath === "/brazing") {
      setActiveModule("brazing");
    } else if (currentPath === "/work-order-assignment") {
      setActiveModule("work-order-assignment");
    } else if (currentPath === "/split-cancel-zone") {
      setActiveModule("split-cancel-zone");
    } else if (currentPath.startsWith("/transaction")) {
      setActiveModule("all-transaction-forms");
      setOpenSubmenu("transaction");
    } else if (currentPath.startsWith("/masters")) {
      setActiveModule("masters");
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
      badge: "4",
      badgeColor: "bg-[#FEF3C7] text-[#D97706]",
      href: "/brazing",
    },
    {
      id: "work-order-assignment",
      label: "Work Order Assignment",
      icon: Layers,
      iconColor: "text-[#2563EB]",
      badge: "11",
      badgeColor: "bg-[#FEF3C7] text-[#D97706]",
      href: "/work-order-assignment",
    },
  ];

  // Dropdown menu modules with enterprise manufacturing sub-items
  const dropdownModules = [
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
          href: "/transactions",
        },
        {
          id: "split-cancel-zone",
          label: "Split / Cancel Zone",
          icon: Scissors,
          iconColor: "text-[#DC2626]",
          badge: "11",
          badgeColor: "bg-[#DC2626] text-white font-bold",
          href: "/split-cancel-zone",
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

  // Check if Masters module matches search query
  const isMastersMatch =
    !trimmedQuery ||
    "masters".includes(trimmedQuery) ||
    "master data".includes(trimmedQuery) ||
    "bom".includes(trimmedQuery) ||
    "zone".includes(trimmedQuery) ||
    "virtual box".includes(trimmedQuery) ||
    "department".includes(trimmedQuery) ||
    "section".includes(trimmedQuery) ||
    "employee".includes(trimmedQuery) ||
    "machines".includes(trimmedQuery) ||
    "tool".includes(trimmedQuery) ||
    "inventory".includes(trimmedQuery) ||
    "stock".includes(trimmedQuery) ||
    "delay reasons".includes(trimmedQuery) ||
    "cancel split reasons".includes(trimmedQuery);

  return (
    <aside
      className={cn(
        "apple-sidebar flex flex-col h-full bg-white border-r border-[#EAECF0] transition-all duration-300 z-30 font-sans",
        collapsed ? "w-20" : "w-72",
        className
      )}
    >
      {/* Brand Header / Top Controls matching reference */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#EAECF0]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#0A56D1] text-white shadow-xs shrink-0 font-bold text-xs tracking-tight">
            <Layers className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-bold text-[#101828] tracking-tight truncate leading-tight">
                Operations Menu
              </span>
              <span className="text-[11px] text-[#475467] truncate flex items-center gap-1.5 mt-0.5 font-medium">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#12B76A]"></span>
                Live System
              </span>
            </div>
          )}
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label="Toggle sidebar"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="w-6 h-6 rounded-full border border-[#EAECF0] bg-white flex items-center justify-center text-[#475467] hover:text-[#101828] hover:bg-[#F2F4F7] shadow-2xs transition-colors"
          >
            <ChevronLeft
              className={cn(
                "w-3.5 h-3.5 transition-transform duration-200",
                collapsed && "rotate-180"
              )}
            />
          </button>
        )}
      </div>

      {/* Quick Search / Filter Input */}
      {!collapsed && (
        <div className="px-3.5 pt-3 pb-1">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#667085] absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter modules..."
              className="w-full pl-9 pr-8 py-2 text-xs font-medium text-[#101828] bg-[#F8F9FC] border border-[#EAECF0] rounded-xl placeholder:text-[#667085] focus:outline-none focus:border-[#0A56D1] focus:bg-white transition-colors"
            />
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2 text-xs text-[#667085] hover:text-[#101828] p-0.5 rounded cursor-pointer"
                title="Clear filter (Esc)"
              >
                ✕
              </button>
            ) : (
              <kbd
                onClick={() => searchInputRef.current?.focus()}
                className="absolute right-2 text-[10px] font-semibold bg-white border border-[#EAECF0] px-1 py-0.5 rounded text-[#667085] cursor-pointer hover:bg-[#F2F4F7]"
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
              <div className="px-3.5 mb-2 mt-2 text-xs font-bold text-[#475467] uppercase tracking-wider">
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
                    "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group text-left",
                    isCurrent
                      ? "bg-[#EFF8FF] text-[#175CD3] font-semibold shadow-xs"
                      : "text-[#344054] hover:bg-[#F8F9FC] hover:text-[#101828]"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0 transition-colors",
                      isCurrent
                        ? "text-[#175CD3]"
                        : module.iconColor || "text-[#475467] group-hover:text-[#101828]"
                    )}
                  />

                  {!collapsed && (
                    <span className="truncate flex-1 font-medium">{module.label}</span>
                  )}

                  {!collapsed && (
                    <>
                      {module.badge && !isCurrent && (
                        <span
                          className={cn(
                            "text-xs font-semibold px-2 py-0.5 rounded-full",
                            module.badgeColor
                          )}
                        >
                          {module.badge}
                        </span>
                      )}
                      {isCurrent && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#175CD3] shrink-0"></span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* System Masters & Data */}
        {(isMastersMatch || filteredDropdowns.length > 0) && (
          <div className="space-y-1">
            {!collapsed && (
              <div className="px-3.5 mb-2 mt-5 text-xs font-bold text-[#475467] uppercase tracking-wider">
                System Masters & Data
              </div>
            )}

            {/* Master Data - Single Hub Link (matches reference screenshot) */}
            {isMastersMatch && (
              <button
                onClick={() => {
                  setActiveModule("masters");
                  setOpenSubmenu(null);
                  router.push("/masters");
                }}
                title={collapsed ? "Master Data" : undefined}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all group text-left",
                  activeModule === "masters" || currentPath.startsWith("/masters")
                    ? "bg-[#EFF8FF] text-[#175CD3] shadow-xs font-semibold"
                    : "text-[#344054] hover:bg-[#F8F9FC] hover:text-[#101828]"
                )}
              >
                <div className="flex items-center gap-3 truncate">
                  <Database
                    className={cn(
                      "w-5 h-5 shrink-0 transition-colors",
                      activeModule === "masters" || currentPath.startsWith("/masters")
                        ? "text-[#175CD3]"
                        : "text-[#475467] group-hover:text-[#101828]"
                    )}
                  />
                  {!collapsed && <span className="truncate font-medium">Master Data</span>}
                </div>

                {!collapsed && (
                  <span
                    className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full",
                      activeModule === "masters" || currentPath.startsWith("/masters")
                        ? "bg-[#175CD3] text-white"
                        : "bg-[#F2F4F7] text-[#475467]"
                    )}
                  >
                    12
                  </span>
                )}
              </button>
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
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors group",
                    isAnySubActive
                      ? "text-[#175CD3] bg-[#EFF8FF]/70 font-semibold"
                      : "text-[#344054] hover:bg-[#F8F9FC] hover:text-[#101828]"
                  )}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon
                      className={cn(
                        "w-5 h-5 shrink-0 transition-colors",
                        isAnySubActive
                          ? "text-[#175CD3]"
                          : "text-[#475467] group-hover:text-[#101828]"
                      )}
                    />
                    {!collapsed && <span className="truncate font-medium">{dropdown.label}</span>}
                  </div>

                  {!collapsed && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#475467] font-semibold bg-[#F2F4F7] px-2 py-0.5 rounded-full">
                        {dropdown.items.length}
                      </span>
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 text-[#475467] transition-transform duration-200",
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
                    <div className="min-h-0 pl-4 pr-1 pt-1 space-y-0.5 border-l border-[#EAECF0] ml-4 mt-0.5">
                    {dropdown.items.map((subItem: any, idx: number) => {
                      const isSubActive = activeModule === subItem.id;
                      const SubIcon = subItem.icon || CircleDot;

                      return (
                        <React.Fragment key={subItem.id}>
                          {subItem.sectionHeader && (
                            <div
                              className={cn(
                                "text-[11px] font-bold tracking-wider px-2 pt-2.5 pb-1 flex items-center gap-1.5 uppercase",
                                subItem.sectionColor || "text-[#667085]",
                                idx > 0 && "border-t border-[#EAECF0] mt-1"
                              )}
                            >
                              {subItem.sectionIcon && (
                                <subItem.sectionIcon className="w-3 h-3 shrink-0" />
                              )}
                              <span>{subItem.sectionHeader}</span>
                            </div>
                          )}

                          <div
                            onClick={() => {
                              setActiveModule(subItem.id);
                              if (subItem.href) {
                                router.push(subItem.href);
                              } else if (dropdown.id === "masters") {
                                router.push(`/masters/${subItem.id}`);
                              }
                            }}
                            className={cn(
                              "flex items-center justify-between text-[13px] font-medium py-2 px-3 rounded-lg cursor-pointer transition-colors group/sub",
                              isSubActive
                                ? "bg-[#EFF8FF] text-[#175CD3] font-semibold"
                                : "text-[#475467] hover:text-[#175CD3] hover:bg-[#F8F9FC]"
                            )}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <SubIcon
                                className={cn(
                                  "w-4 h-4 shrink-0 transition-colors",
                                  isSubActive
                                    ? "text-[#175CD3]"
                                    : subItem.iconColor || "text-[#667085] group-hover/sub:text-[#175CD3]"
                                )}
                              />
                              <span className="truncate">{subItem.label}</span>
                            </div>

                            {subItem.badge && (
                              <span
                                className={cn(
                                  "text-[10px] font-semibold px-2 py-0.5 rounded shrink-0",
                                  isSubActive
                                    ? "bg-[#175CD3] text-white"
                                    : subItem.badgeColor || "bg-[#F2F4F7] text-[#475467]"
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


import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  CalendarClock,
  CheckCircle2,
  ArrowLeftRight,
  ClipboardList,
  Flame,
  LayoutGrid,
  Database,
  Repeat,
  FileText,
  ChevronDown,
  LogOut,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ProdsyncTopNav() {
  const router = useRouter();
  const currentPath = router.pathname;

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const navItems = [
    {
      label: "Machine Scheduler",
      href: "/machine-scheduler",
      icon: CalendarClock,
      active: currentPath === "/machine-scheduler",
    },
    {
      label: "Production",
      href: "/production",
      icon: CheckCircle2,
      active: currentPath === "/production",
    },
    {
      label: "BOP Transfer",
      href: "#",
      icon: ArrowLeftRight,
      active: false,
    },
    {
      label: "Work Order Assignment",
      href: "#",
      icon: ClipboardList,
      active: false,
    },
    {
      label: "Brazing",
      href: "#",
      icon: Flame,
      iconColor: "text-[#FF9500]",
      active: false,
    },
    {
      label: "Dashboard Zone",
      href: "/",
      icon: LayoutGrid,
      active: currentPath === "/",
    },
  ];

  const dropdownMenus = [
    {
      id: "masters",
      label: "Masters",
      icon: Database,
      items: [
        "BOM Master (Assembly)",
        "Child Part Master",
        "Raw Material Stock",
        "Machine & Tooling Master",
        "Employee Shift Master",
      ],
    },
    {
      id: "transaction",
      label: "Transaction",
      icon: Repeat,
      items: [
        "Job Card Issue",
        "QC First-Piece Inspection",
        "BOP Requisition",
        "Scrap & Rework Logging",
      ],
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
      items: [
        "Daily Production Log",
        "OEE Machine Efficiency Report",
        "Rejection & Pareto Analysis",
        "Shift Handover Summary",
      ],
    },
  ];

  return (
    <nav className="w-full bg-white border-b border-[#E5E5EA] shadow-xs px-3 sm:px-4 h-12 flex items-center justify-between z-30 select-none text-[12px]">
      {/* Left: Brand + Primary Tabs */}
      <div className="flex items-center gap-1 sm:gap-2.5 overflow-x-auto scrollbar-none">
        {/* Brand Logo */}
        <Link
          href="/machine-scheduler"
          className="flex items-center gap-2 pr-2 sm:pr-3 border-r border-[#E5E5EA] shrink-0 hover:opacity-90 transition-opacity"
        >
          <div className="w-6 h-6 rounded-lg bg-[#007AFF] text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
            <Layers className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-[#1D1D1F] text-[13px] tracking-tight">
              PRODSYNC
            </span>
            <span className="text-[10px] text-[#86868B] font-normal italic">
              Scheduler v2
            </span>
          </div>
        </Link>

        {/* Primary Operational Links */}
        <div className="flex items-center gap-1 shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-[11.5px] font-medium transition-all shrink-0",
                  item.active
                    ? "bg-[#E8F2FE] text-[#007AFF] ring-1 ring-[#007AFF]/30 font-semibold shadow-xs"
                    : "text-[#515154] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]"
                )}
              >
                <Icon
                  className={cn(
                    "w-3.5 h-3.5",
                    item.iconColor || (item.active ? "text-[#007AFF]" : "text-[#86868B]")
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Dropdown Menus */}
        <div className="hidden xl:flex items-center gap-1 border-l border-[#E5E5EA] pl-1.5 shrink-0">
          {dropdownMenus.map((dm) => (
            <div key={dm.id} className="relative">
              <button
                onClick={() => toggleDropdown(dm.id)}
                className="px-2 py-1.5 rounded-lg text-[11px] font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] flex items-center gap-1 transition-colors"
              >
                <span>{dm.label}</span>
                <ChevronDown className="w-3 h-3 text-[#86868B]" />
              </button>

              {openDropdown === dm.id && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpenDropdown(null)}
                  />
                  <div className="absolute left-0 mt-1.5 w-52 bg-white border border-[#E5E5EA] rounded-xl shadow-apple-dropdown p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2.5 py-1 text-[9.5px] font-bold text-[#86868B] uppercase tracking-wider border-b border-[#F2F2F7]">
                      {dm.label}
                    </div>
                    {dm.items.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setOpenDropdown(null)}
                        className="w-full text-left px-2.5 py-1.5 text-[11px] text-[#1D1D1F] hover:bg-[#F5F5F7] hover:text-[#007AFF] rounded-lg transition-colors truncate"
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right: User Role & Logout */}
      <div className="flex items-center gap-2 shrink-0 pl-2">
        {/* Super Admin Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#007AFF] text-white text-[10px] font-semibold shadow-xs">
          <Sparkles className="w-2.5 h-2.5" />
          <span>Super Admin</span>
        </div>

        {/* User Name with Dropdown */}
        <div className="flex items-center gap-1 cursor-pointer hover:opacity-85 text-[#1D1D1F]">
          <span className="text-[11.5px] font-medium">Super Administrator</span>
          <ChevronDown className="w-3 h-3 text-[#86868B]" />
        </div>

        {/* Logout Button */}
        <button
          onClick={() => alert("Logged out from PRODSYNC Enterprise")}
          className="ml-1 px-2 py-1 rounded-lg border border-[#FF3B30]/30 hover:border-[#FF3B30] text-[#FF3B30] hover:bg-[#FFF5F5] text-[11px] font-medium flex items-center gap-1 transition-all"
        >
          <LogOut className="w-3 h-3 text-[#FF3B30]" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}

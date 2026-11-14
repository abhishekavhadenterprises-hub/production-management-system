import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  AlertTriangle,
  Bell,
  Menu,
  ChevronDown,
  MoreHorizontal,
  Maximize2,
  Plus,
  Calendar,
  Check,
  Info,
} from "lucide-react";
import { ReportingPeriod } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PremiumDropdown } from "@/components/ui/premium-dropdown";

interface HeaderProps {
  period: ReportingPeriod;
  onPeriodChange: (period: ReportingPeriod) => void;
  onToggleSidebar?: () => void;
}

const PERIOD_LABELS: Record<ReportingPeriod, string> = {
  today: "Today",
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  quarter: "This Quarter",
  ytd: "Year to Date",
};

export function Header({ period, onPeriodChange, onToggleSidebar }: HeaderProps) {
  const router = useRouter();
  const [dashboardDropdownOpen, setDashboardDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="apple-header-wrapper flex flex-col bg-[#F5F5F7] border-b border-[#E5E5EA]/70">
      {/* 1. Top System Bar (J Pan Tubular Enterprise Operations Portal) */}
      <div className="apple-top-nav h-14 px-4 sm:px-8 flex items-center justify-between border-b border-[#E5E5EA] bg-[#F5F5F7]/80 backdrop-blur-md sticky top-0 z-30">
        {/* Left: J Pan Tubular Monogram Glyph & Navigation Portal */}
        <div className="flex items-center gap-2.5">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 text-[#1D1D1F] hover:bg-[#E5E5EA] rounded-lg transition-colors mr-1"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          {/* PRODSYNC Brand Glyph */}
          <div className="w-6 h-6 rounded-lg bg-[#007AFF] text-white flex items-center justify-center font-bold text-[11px] shadow-sm tracking-tight">
            PS
          </div>

          <span className="text-[13.5px] font-semibold text-[#1D1D1F] tracking-tight">
            PRODSYNC Scheduler
          </span>
        </div>

        {/* Center: Prominent "Illustrative Sample Data" badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBEBF0] text-[#6E6E73] text-[11px] font-medium border border-[#D1D1D6]/80">
          <Info className="w-3.5 h-3.5 text-[#007AFF]" />
          <span>Illustrative Sample Data</span>
          <span className="text-[10px] text-[#86868B] border-l border-[#D1D1D6] pl-1.5">
            Demonstration Mode
          </span>
        </div>

        {/* Right Actions: Period dropdown, alerts, profile */}
        <div className="flex items-center gap-3 text-[#1D1D1F]">
          {/* Quick Period Selector in Header */}
          <div className="w-[145px]">
            <PremiumDropdown
              value={period}
              onChange={(val) => onPeriodChange(val as ReportingPeriod)}
              options={(["today", "7d", "30d", "quarter", "ytd"] as ReportingPeriod[]).map((p) => ({
                value: p,
                label: PERIOD_LABELS[p],
              }))}
              icon={<Calendar className="w-3.5 h-3.5 text-[#007AFF]" />}
              size="sm"
              align="right"
              searchable={false}
              menuClassName="w-44"
              buttonClassName="rounded-lg shadow-sm"
            />
          </div>

          {/* Diagnostics / Alert Indicator */}
          <button
            title="Operational Diagnostics"
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#E5E5EA] transition-colors text-[#1D1D1F]"
          >
            <AlertTriangle className="w-4 h-4 stroke-[1.75]" />
          </button>

          {/* Bell Icon with Count Badge 3 */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              title="Notifications"
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#E5E5EA] transition-colors text-[#1D1D1F]"
            >
              <Bell className="w-4 h-4 stroke-[1.75]" />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#FF3B30] text-white text-[9px] font-bold flex items-center justify-center leading-none">
                3
              </span>
            </button>

            {notificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotificationsOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E5E5EA] rounded-[16px] shadow-apple-dropdown p-3 z-50">
                  <div className="text-[12px] font-semibold text-[#1D1D1F] pb-2 border-b border-[#F2F2F7] flex items-center justify-between">
                    <span>Operational Alerts</span>
                    <span className="text-[10px] text-[#007AFF] font-medium cursor-pointer">
                      Mark read
                    </span>
                  </div>
                  <div className="py-2 space-y-2 text-xs">
                    <div className="p-2 rounded-lg bg-[#FFF6E9] text-[#A65F00]">
                      Calibration alert on Hydrostatic Testing Unit 2
                    </div>
                    <div className="p-2 rounded-lg bg-[#EAF8EF] text-[#1E823B]">
                      Batch #JP-8841 Passed Ultrasonic Testing
                    </div>
                    <div className="p-2 rounded-lg bg-[#F5F5F7] text-[#1D1D1F]">
                      Q3 Operations Audit synced to master log
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Card */}
          <div className="flex items-center gap-2 pl-2 cursor-pointer group">
            <div className="w-7 h-7 rounded-full bg-[#007AFF] text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
              SA
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-[12px] font-semibold text-[#1D1D1F] group-hover:text-[#007AFF] transition-colors">
                Super Administrator
              </span>
              <span className="text-[10px] text-[#007AFF] font-medium">
                Super Admin
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#86868B] group-hover:text-[#1D1D1F] transition-colors" />
          </div>
        </div>
      </div>

      {/* 2. Main Title Bar ("Overview ⌵" + action buttons) */}
      <div className="px-4 sm:px-8 py-5 flex items-center justify-between">
        {/* Title: "Overview" with dropdown chevron pill */}
        <div className="relative">
          <button
            onClick={() => setDashboardDropdownOpen(!dashboardDropdownOpen)}
            className="flex items-center gap-2 text-[26px] sm:text-[30px] font-bold text-[#1D1D1F] tracking-tight hover:opacity-85 transition-opacity leading-none"
          >
            <span>Overview</span>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#E5E5EA] text-[#6E6E73] mt-0.5">
              <svg className="w-2.5 h-2.5" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>

          {/* Module Switcher Dropdown */}
          {dashboardDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDashboardDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-64 bg-white border border-[#E5E5EA] rounded-[16px] shadow-apple-dropdown p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-[#86868B] uppercase tracking-wider">
                  Operational Modules
                </div>
                <button
                  onClick={() => {
                    setDashboardDropdownOpen(false);
                    router.push("/bop-transfer");
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-[#16A34A] bg-[#EAF8EF] rounded-lg flex items-center justify-between"
                >
                  <span>BOP Transfer (Store &rarr; Zones)</span>
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setDashboardDropdownOpen(false);
                    router.push("/work-orders");
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-colors"
                >
                  Work Orders Management (SoftGen)
                </button>
                <button
                  onClick={() => {
                    setDashboardDropdownOpen(false);
                    router.push("/machine-scheduler");
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-colors"
                >
                  Machine Scheduler
                </button>
                <button
                  onClick={() => {
                    setDashboardDropdownOpen(false);
                    router.push("/production");
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-colors"
                >
                  Production Monitoring
                </button>
                <button
                  onClick={() => {
                    setDashboardDropdownOpen(false);
                    router.push("/");
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-colors"
                >
                  Dashboard
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right Circle Action Buttons (···, ⤢ expand, + add) */}
        <div className="flex items-center gap-2">
          <button
            title="Dashboard Options"
            className="w-8 h-8 rounded-full border border-[#D1D1D6] bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center shadow-sm transition-all active:scale-95"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          <button
            title="Fullscreen View"
            className="w-8 h-8 rounded-full border border-[#D1D1D6] bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center shadow-sm transition-all active:scale-95"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            title="Add Metric or Widget"
            className="w-8 h-8 rounded-full border border-[#D1D1D6] bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

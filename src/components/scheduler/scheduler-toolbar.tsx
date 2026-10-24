import React from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Clock,
  RotateCcw,
  Search,
  Filter,
  Table,
  GanttChart,
  Upload,
  Info,
} from "lucide-react";
import { MachineStatus, ShiftType, ViewMode } from "@/lib/scheduler-types";
import { DEPARTMENTS_LIST } from "@/lib/scheduler-mock-data";
import { cn } from "@/lib/utils";

interface SchedulerToolbarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedShift: ShiftType;
  onShiftChange: (shift: ShiftType) => void;
  selectedDept: string;
  onDeptChange: (dept: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  activeStatusFilter: MachineStatus;
  onStatusFilterChange: (status: MachineStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusCounts: {
    all: number;
    running: number;
    available: number;
    breakdown: number;
    quality_issue: number;
    offline: number;
    maintenance: number;
  };
  onResetFilters: () => void;
  onOpenImportModal: () => void;
  lastUpdatedText: string;
}

export function SchedulerToolbar({
  selectedDate,
  onDateChange,
  selectedShift,
  onShiftChange,
  selectedDept,
  onDeptChange,
  viewMode,
  onViewModeChange,
  activeStatusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  statusCounts,
  onResetFilters,
  onOpenImportModal,
  lastUpdatedText,
}: SchedulerToolbarProps) {
  // Quick date jump helpers
  const handleToday = () => onDateChange("2026-10-24");
  const handleTomorrow = () => onDateChange("2026-10-25");

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split("T")[0]);
  };

  return (
    <div className="bg-white border-b border-[#E5E5EA] shadow-xs px-4 py-3 space-y-3">
      {/* ROW 1: Shift Selector & View Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Shifts Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <Clock className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>Select Shift:</span>
          </div>

          {/* Shift A */}
          <button
            onClick={() => onShiftChange("shift-a")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all",
              selectedShift === "shift-a"
                ? "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A] shadow-xs ring-1 ring-[#FDE68A]"
                : "bg-white text-[#48484A] border-[#E5E5EA] hover:bg-[#F5F5F7]"
            )}
          >
            <Sun className="w-3.5 h-3.5 text-[#F59E0B]" />
            <div className="text-left leading-tight">
              <span className="font-semibold">Shift A (08:30 AM – 08:30 PM)</span>
              <span className="block text-[9.5px] text-[#86868B]">
                Lunch: 01:00 PM – 01:30 PM
              </span>
            </div>
          </button>

          {/* Shift B */}
          <button
            onClick={() => onShiftChange("shift-b")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all",
              selectedShift === "shift-b"
                ? "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE] shadow-xs ring-1 ring-[#BFDBFE]"
                : "bg-white text-[#48484A] border-[#E5E5EA] hover:bg-[#F5F5F7]"
            )}
          >
            <Moon className="w-3.5 h-3.5 text-[#3B82F6]" />
            <div className="text-left leading-tight">
              <span className="font-semibold">Shift B (08:30 PM – 08:30 AM)</span>
              <span className="block text-[9.5px] text-[#86868B]">
                Break: 01:00 AM – 01:30 AM
              </span>
            </div>
          </button>

          {/* All Shifts 24h */}
          <button
            onClick={() => onShiftChange("all-shifts")}
            className={cn(
              "px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all",
              selectedShift === "all-shifts"
                ? "bg-[#007AFF] text-white border-[#007AFF] shadow-xs"
                : "bg-white text-[#48484A] border-[#E5E5EA] hover:bg-[#F5F5F7]"
            )}
          >
            <span>All Shifts (24-Hour)</span>
          </button>
        </div>

        {/* Right: View Switcher (Tabular vs Timeline) & Import */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-[#F5F5F7] p-1 rounded-xl border border-[#E5E5EA] flex items-center gap-1">
            <button
              onClick={() => onViewModeChange("tabular")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all",
                viewMode === "tabular"
                  ? "bg-white text-[#007AFF] shadow-xs font-semibold"
                  : "text-[#6E6E73] hover:text-[#1D1D1F]"
              )}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tabular Schedule View</span>
            </button>
            <button
              onClick={() => onViewModeChange("timeline")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all",
                viewMode === "timeline"
                  ? "bg-white text-[#007AFF] shadow-xs font-semibold"
                  : "text-[#6E6E73] hover:text-[#1D1D1F]"
              )}
            >
              <GanttChart className="w-3.5 h-3.5" />
              <span>Visual Timeline View</span>
            </button>
          </div>

          <button
            onClick={onOpenImportModal}
            className="px-2.5 py-1.5 bg-white border border-[#E5E5EA] hover:border-[#007AFF] hover:text-[#007AFF] text-[#1D1D1F] text-xs font-medium rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            title="Import Work Orders Batch"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import WO</span>
          </button>
        </div>
      </div>

      {/* ROW 2: Date Picker, Department Filter, Search, and Machine Status Counter Pills */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-[#F2F2F7]">
        {/* Date & Department */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Previous Day (<) */}
          <button
            onClick={handlePrevDay}
            className="p-1.5 bg-white border border-[#E5E5EA] hover:bg-[#F5F5F7] text-[#48484A] rounded-xl shadow-2xs transition-colors cursor-pointer"
            title="Previous Day"
            aria-label="Previous Day"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Date Picker Input */}
          <div className="flex items-center gap-1 bg-white border border-[#E5E5EA] rounded-xl px-2 py-1 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-[#007AFF] shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="text-xs font-medium text-[#1D1D1F] bg-transparent outline-none cursor-pointer"
            />
          </div>

          {/* Next Day (>) */}
          <button
            onClick={handleNextDay}
            className="p-1.5 bg-white border border-[#E5E5EA] hover:bg-[#F5F5F7] text-[#48484A] rounded-xl shadow-2xs transition-colors cursor-pointer"
            title="Next Day"
            aria-label="Next Day"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Today & Tomorrow quick buttons */}
          <button
            onClick={handleToday}
            className={cn(
              "px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer",
              selectedDate === "2026-10-24"
                ? "bg-[#007AFF] text-white border-[#007AFF]"
                : "bg-white text-[#48484A] border-[#E5E5EA] hover:bg-[#F5F5F7]"
            )}
          >
            Today
          </button>
          <button
            onClick={handleTomorrow}
            className={cn(
              "px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer",
              selectedDate === "2026-10-25"
                ? "bg-[#007AFF] text-white border-[#007AFF]"
                : "bg-white text-[#48484A] border-[#E5E5EA] hover:bg-[#F5F5F7]"
            )}
          >
            Tomorrow
          </button>

          {/* Department Dropdown */}
          <div className="relative">
            <select
              value={selectedDept}
              onChange={(e) => onDeptChange(e.target.value)}
              className="text-xs font-medium text-[#1D1D1F] bg-white border border-[#E5E5EA] rounded-xl px-3 py-1.5 shadow-xs outline-none cursor-pointer hover:border-[#D1D1D6] transition-colors"
            >
              {DEPARTMENTS_LIST.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Search Machine */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter machine by code or name..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs bg-[#F5F5F7] border border-transparent focus:border-[#007AFF] focus:bg-white rounded-xl text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all w-52"
            />
          </div>
        </div>

        {/* Machine Status Counters Bar: All, Running, Available, Breakdown, Quality Issue, Offline, Maintenance */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onStatusFilterChange("all")}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer",
              activeStatusFilter === "all"
                ? "bg-[#007AFF] text-white border-[#007AFF] shadow-xs"
                : "bg-white text-[#48484A] border-[#E5E5EA] hover:bg-[#F5F5F7]"
            )}
          >
            <span>All</span>
            <span
              className={cn(
                "px-1 py-0.2 rounded text-[10px] font-mono",
                activeStatusFilter === "all" ? "bg-white/20 text-white" : "bg-[#F2F2F7] text-[#6E6E73]"
              )}
            >
              {statusCounts.all}
            </span>
          </button>

          <button
            onClick={() => onStatusFilterChange("running")}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer",
              activeStatusFilter === "running"
                ? "bg-[#34C759] text-white border-[#34C759] shadow-xs"
                : "bg-white text-[#1E823B] border-[#E5E5EA] hover:bg-[#EAF8EF]"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-[#34C759] shrink-0" />
            <span>Running</span>
            <span className="font-mono text-[10px] font-semibold">{statusCounts.running}</span>
          </button>

          <button
            onClick={() => onStatusFilterChange("available")}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer",
              activeStatusFilter === "available"
                ? "bg-[#007AFF] text-white border-[#007AFF] shadow-xs"
                : "bg-white text-[#007AFF] border-[#E5E5EA] hover:bg-[#E8F2FE]"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-[#007AFF] shrink-0" />
            <span>Available</span>
            <span className="font-mono text-[10px] font-semibold">{statusCounts.available}</span>
          </button>

          <button
            onClick={() => onStatusFilterChange("breakdown")}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer",
              activeStatusFilter === "breakdown"
                ? "bg-[#FF3B30] text-white border-[#FF3B30] shadow-xs"
                : "bg-white text-[#DC2626] border-[#E5E5EA] hover:bg-[#FFEBEA]"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-[#FF3B30] shrink-0" />
            <span>Breakdown</span>
            <span className="font-mono text-[10px] font-semibold">{statusCounts.breakdown}</span>
          </button>

          <button
            onClick={() => onStatusFilterChange("quality_issue")}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer",
              activeStatusFilter === "quality_issue"
                ? "bg-[#FF9500] text-white border-[#FF9500] shadow-xs"
                : "bg-white text-[#D97706] border-[#E5E5EA] hover:bg-[#FFFBEB]"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-[#FF9500] shrink-0" />
            <span>Quality Issue</span>
            <span className="font-mono text-[10px] font-semibold">{statusCounts.quality_issue}</span>
          </button>

          {/* Offline */}
          <button
            onClick={() => onStatusFilterChange("offline")}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer",
              activeStatusFilter === "offline"
                ? "bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-xs"
                : "bg-white text-[#48484A] border-[#E5E5EA] hover:bg-[#F5F5F7]"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-[#8E8E93] shrink-0" />
            <span>Offline</span>
            <span className="font-mono text-[10px] font-semibold">{statusCounts.offline}</span>
          </button>

          {/* Maintenance */}
          <button
            onClick={() => onStatusFilterChange("maintenance")}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer",
              activeStatusFilter === "maintenance"
                ? "bg-[#5856D6] text-white border-[#5856D6] shadow-xs"
                : "bg-white text-[#5856D6] border-[#E5E5EA] hover:bg-[#F3F2FD]"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-[#5856D6] shrink-0" />
            <span>Maintenance</span>
            <span className="font-mono text-[10px] font-semibold">{statusCounts.maintenance}</span>
          </button>

          <button
            onClick={onResetFilters}
            className="p-1.5 text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-colors cursor-pointer"
            title="Reset All Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

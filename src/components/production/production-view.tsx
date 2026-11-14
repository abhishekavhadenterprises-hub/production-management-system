import React, { useState, useEffect, useMemo } from "react";
import {
  Factory,
  RotateCcw,
  Plus,
  ArrowLeftRight,
  Flame,
  Search,
  Filter,
  Check,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  Layers,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PremiumDatePicker } from "@/components/ui/premium-date-picker";
import { PremiumDropdown } from "@/components/ui/premium-dropdown";
import {
  ProductionRecord,
  NextProcessOption,
  ProductionKpiSummary,
} from "@/lib/production-types";
import {
  INITIAL_PRODUCTION_RECORDS,
  INITIAL_PRODUCTION_KPI,
  convertBookingToProductionRecord,
} from "@/lib/production-mock-data";
import { INITIAL_BOOKINGS } from "@/lib/scheduler-mock-data";
import { ProdsyncTopNav } from "@/components/layout/prodsync-top-nav";
import { OperatorLogModal } from "./operator-log-modal";
import { SupervisorConfirmModal } from "./supervisor-confirm-modal";

export function ProductionView() {
  const [records, setRecords] = useState<ProductionRecord[]>(
    INITIAL_PRODUCTION_RECORDS
  );
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(
    INITIAL_PRODUCTION_KPI.lastUpdated
  );

  // Filter States
  const [selectedDate, setSelectedDate] = useState("2026-10-24");
  const [selectedMachine, setSelectedMachine] = useState("All Machines");
  const [selectedCustomer, setSelectedCustomer] = useState("All Customers");
  const [selectedProdStatus, setSelectedProdStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals State
  const [selectedForLog, setSelectedForLog] = useState<ProductionRecord | null>(
    null
  );
  const [selectedForSupervisor, setSelectedForSupervisor] =
    useState<ProductionRecord | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Auto-sync scheduled bookings from scheduler
  useEffect(() => {
    const syncBookings = () => {
      try {
        let activeBookings = [...INITIAL_BOOKINGS];
        const stored = typeof window !== "undefined" ? localStorage.getItem("prodsync_active_bookings") : null;
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            activeBookings = parsed;
          }
        }

        const runningOrScheduled = activeBookings.filter(
          (b) => b.status === "running" || b.status === "scheduled"
        );

        if (runningOrScheduled.length > 0) {
          setRecords((prev) => {
            const existingWoIds = new Set(prev.map((r) => r.workOrderNo));
            const newRecords = runningOrScheduled
              .filter((b) => !existingWoIds.has(b.woNumber))
              .map((b, idx) =>
                convertBookingToProductionRecord(b, prev.length + idx + 1)
              );

            if (newRecords.length > 0) {
              return [...newRecords, ...prev];
            }
            return prev;
          });
        }
      } catch (e) {
        // ignore
      }
    };

    syncBookings();
    if (typeof window !== "undefined") {
      window.addEventListener("prodsync_bookings_updated", syncBookings);
      return () => window.removeEventListener("prodsync_bookings_updated", syncBookings);
    }
  }, []);

  // Timer auto-refresh simulator
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      const now = new Date();
      setLastSyncTime(now.toLocaleTimeString("en-GB"));
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Derived KPI metrics
  const kpiMetrics: ProductionKpiSummary = useMemo(() => {
    const totalPlan = records.reduce((acc, r) => acc + r.planQty, 0);
    const totalAchieved = records.reduce((acc, r) => acc + r.achievedQty, 0);
    const totalNg = records.reduce((acc, r) => acc + r.ngQty, 0);
    const runningMachines = records.filter(
      (r) => r.machineStatus === "running"
    ).length;

    return {
      totalPlanQty: totalPlan || 4087,
      achievedQty: totalAchieved || 10418,
      achievedPercent:
        totalPlan > 0
          ? Number(((totalAchieved / totalPlan) * 100).toFixed(1))
          : 254.8,
      totalNgQty: totalNg || 27,
      activeMachines: runningMachines,
      batchesInProgress: records.length,
      lastUpdated: lastSyncTime,
    };
  }, [records, lastSyncTime]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (
        selectedMachine !== "All Machines" &&
        r.machineCode !== selectedMachine
      )
        return false;
      if (
        selectedCustomer !== "All Customers" &&
        r.customerName !== selectedCustomer
      )
        return false;
      if (selectedProdStatus === "100% Achieved" && r.achievedPercent < 100)
        return false;
      if (selectedProdStatus === "In Progress" && r.achievedPercent >= 100)
        return false;
      if (
        selectedProdStatus === "Pending Verification" &&
        r.verificationStatus !== "pending_verification"
      )
        return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches =
          r.workOrderNo.toLowerCase().includes(query) ||
          r.machineCode.toLowerCase().includes(query) ||
          r.customerName.toLowerCase().includes(query) ||
          r.childPartCode.toLowerCase().includes(query) ||
          r.childPartName.toLowerCase().includes(query) ||
          r.assemblyPartCode.toLowerCase().includes(query);
        if (!matches) return false;
      }
      return true;
    });
  }, [
    records,
    selectedMachine,
    selectedCustomer,
    selectedProdStatus,
    searchQuery,
  ]);

  // Unique lists for filter dropdowns
  const uniqueMachines = useMemo(() => {
    return [
      "All Machines",
      ...Array.from(new Set(records.map((r) => r.machineCode))),
    ];
  }, [records]);

  const uniqueCustomers = useMemo(() => {
    return [
      "All Customers",
      ...Array.from(new Set(records.map((r) => r.customerName))),
    ];
  }, [records]);

  // Toast helper
  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Operator logs OK / NG
  const handleSaveOperatorLog = (
    target: ProductionRecord,
    newOk: number,
    newNg: number,
    rejectionReason: string,
    notes: string
  ) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === target.id) {
          const totalAch = newOk + newNg;
          const pct = Math.round((totalAch / (r.planQty || 1)) * 100);
          return {
            ...r,
            okQty: newOk,
            ngQty: newNg,
            achievedQty: totalAch,
            achievedPercent: pct,
            rejectionReason: newNg > 0 ? rejectionReason : undefined,
            verificationNotes: notes,
            postStatus: "pending_qc",
            verificationStatus: "pending_verification",
          };
        }
        return r;
      })
    );
    showToast(
      `Logged output for ${target.workOrderNo}: ${newOk} OK, ${newNg} NG. Submitted for QC confirmation.`
    );
  };

  // Supervisor confirms / verifies
  const handleSupervisorVerification = (
    target: ProductionRecord,
    role: string,
    verifierName: string,
    notes: string,
    action: "approve" | "reject"
  ) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === target.id) {
          if (action === "approve") {
            return {
              ...r,
              verificationStatus: "verified",
              verifiedByRole: role,
              verifiedByName: verifierName,
              verifiedAt: new Date().toLocaleString(),
              postStatus: "approved",
              moveStatus: "ready",
            };
          } else {
            return {
              ...r,
              verificationStatus: "rejected",
              verifiedByRole: role,
              verifiedByName: verifierName,
              verificationNotes: notes || "Flagged for recount",
              postStatus: "draft",
              moveStatus: "pending",
            };
          }
        }
        return r;
      })
    );
    showToast(
      action === "approve"
        ? `Output verified & signed off by ${verifierName} (${role}). Move unlocked.`
        : `Batch ${target.workOrderNo} flagged for recount by ${verifierName}.`
    );
  };

  // Move batch to next process
  const handleMoveBatch = (record: ProductionRecord) => {
    if (record.verificationStatus !== "verified") {
      setSelectedForSupervisor(record);
      return;
    }
    setRecords((prev) =>
      prev.map((r) =>
        r.id === record.id ? { ...r, moveStatus: "moved" } : r
      )
    );
    showToast(
      `Batch ${record.workOrderNo} (${record.okQty} pcs) successfully routed to ${record.process} station!`
    );
  };

  // Change next process routing
  const handleProcessChange = (
    recordId: string,
    newProcess: NextProcessOption
  ) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, process: newProcess } : r))
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] select-none text-[#1D1D1F]">
      {/* Top PRODSYNC Header Navigation Bar */}
      <ProdsyncTopNav />

      {/* Toast Alert */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1D1D1F] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle className="w-4 h-4 text-[#34C759]" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Page Title & Operational Header */}
      <div className="bg-white border-b border-[#E5E5EA] px-4 py-3 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Title & Live Status */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#007AFF] text-white flex items-center justify-center shadow-xs">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[#1D1D1F] tracking-tight">
                  Production
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EAF8EF] text-[#1E823B] text-[10px] font-semibold tracking-tight border border-[#34C759]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse"></span>
                  LIVE TRACKING
                </span>
              </div>
              <p className="text-[11px] text-[#86868B] mt-0.5">
                Live machine production progress, output achievement, NG count & next process routing
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Auto-Refresh Toggle */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#E5E5EA] bg-[#F5F5F7] text-[11px] font-medium text-[#6E6E73]">
              <span>Auto-Refresh (10s)</span>
              <button
                type="button"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={cn(
                  "w-8 h-4 rounded-full transition-colors relative p-0.5",
                  autoRefresh ? "bg-[#007AFF]" : "bg-[#D1D1D6]"
                )}
              >
                <div
                  className={cn(
                    "w-3 h-3 rounded-full bg-white transition-transform",
                    autoRefresh ? "translate-x-4" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => {
                const now = new Date();
                setLastSyncTime(now.toLocaleTimeString("en-GB"));
                showToast("Production metrics synced with live machine sensors.");
              }}
              className="px-2.5 py-1.5 rounded-lg border border-[#E5E5EA] bg-white hover:bg-[#F5F5F7] text-[11px] font-medium text-[#1D1D1F] flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#86868B]" />
              <span>Refresh</span>
            </button>

            {/* + Log Production Button */}
            <button
              onClick={() => {
                if (records.length > 0) setSelectedForLog(records[0]);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#007AFF] hover:bg-[#0062CC] text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Production</span>
            </button>

            {/* BOP Transfer Button */}
            <button
              onClick={() => showToast("Opening BOP Transfer Dispatch Portal")}
              className="px-2.5 py-1.5 rounded-lg border border-[#007AFF]/30 bg-white hover:bg-[#F0F7FF] text-[11px] font-medium text-[#007AFF] flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#007AFF]" />
              <span>BOP Transfer</span>
            </button>

            {/* Brazing Station Button */}
            <button
              onClick={() => showToast("Opening Continuous Brazing Line Station")}
              className="px-2.5 py-1.5 rounded-lg border border-[#FF9500]/30 bg-white hover:bg-[#FFF9F0] text-[11px] font-medium text-[#D97706] flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Flame className="w-3.5 h-3.5 text-[#FF9500]" />
              <span>Brazing Station</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Metric KPI Summary Cards */}
      <div className="px-4 py-3 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* 1. TOTAL PLAN QTY */}
          <div className="bg-white p-3 rounded-xl border border-[#E5E5EA] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>TOTAL PLAN QTY</span>
              <span className="px-1.5 py-0.2 rounded bg-[#E8F2FE] text-[#007AFF] text-[9.5px]">
                Planned
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-[#1D1D1F] mt-2">
              {kpiMetrics.totalPlanQty.toLocaleString()}
            </div>
          </div>

          {/* 2. ACHIEVED QTY */}
          <div className="bg-white p-3 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#34C759] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>ACHIEVED QTY</span>
              <span className="px-1.5 py-0.2 rounded bg-[#EAF8EF] text-[#1E823B] text-[9.5px]">
                {kpiMetrics.achievedPercent}%
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-[#1D1D1F] mt-2">
              {kpiMetrics.achievedQty.toLocaleString()}
            </div>
          </div>

          {/* 3. TOTAL NG (REJECTED) */}
          <div className="bg-white p-3 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#FF3B30] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>TOTAL NG (REJECTED)</span>
              <span className="px-1.5 py-0.2 rounded bg-[#FFF5F5] text-[#DC2626] text-[9.5px]">
                Defects
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-[#DC2626] mt-2">
              {kpiMetrics.totalNgQty}
            </div>
          </div>

          {/* 4. ACTIVE MACHINES */}
          <div className="bg-white p-3 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#007AFF] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>ACTIVE MACHINES</span>
              <span className="px-1.5 py-0.2 rounded bg-[#E8F2FE] text-[#007AFF] text-[9.5px]">
                Running
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-[#007AFF] mt-2">
              {kpiMetrics.activeMachines}
            </div>
          </div>

          {/* 5. BATCHES IN PROGRESS */}
          <div className="bg-white p-3 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#FF9500] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>BATCHES IN PROGRESS</span>
              <span className="px-1.5 py-0.2 rounded bg-[#FFFBEB] text-[#B45309] text-[9.5px]">
                Live Jobs
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-[#B45309] mt-2">
              {kpiMetrics.batchesInProgress}
            </div>
          </div>

          {/* 6. LAST UPDATED */}
          <div className="bg-white p-3 rounded-xl border border-[#E5E5EA] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>LAST UPDATED</span>
              <span className="px-1.5 py-0.2 rounded bg-[#EAF8EF] text-[#1E823B] text-[9.5px] font-mono">
                Sync OK
              </span>
            </div>
            <div className="text-base font-bold font-mono text-[#1D1D1F] mt-2">
              {kpiMetrics.lastUpdated}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="px-4 py-1 sm:px-6">
        <div className="bg-white p-2.5 rounded-xl border border-[#E5E5EA] shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Date Input */}
            <div className="flex flex-col min-w-[145px]">
              <span className="text-[10px] text-[#86868B] font-semibold uppercase mb-0.5">
                Date
              </span>
              <PremiumDatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                size="sm"
                buttonClassName="bg-[#F5F5F7] border-[#E5E5EA]"
              />
            </div>

            {/* Machine Dropdown */}
            <div className="flex flex-col min-w-[160px]">
              <span className="text-[10px] text-[#86868B] font-semibold uppercase mb-0.5">
                Machine
              </span>
              <PremiumDropdown
                value={selectedMachine}
                onChange={setSelectedMachine}
                options={uniqueMachines}
                size="sm"
                buttonClassName="bg-[#F5F5F7] border-[#E5E5EA]"
              />
            </div>

            {/* Customer Dropdown */}
            <div className="flex flex-col min-w-[180px]">
              <span className="text-[10px] text-[#86868B] font-semibold uppercase mb-0.5">
                Customer
              </span>
              <PremiumDropdown
                value={selectedCustomer}
                onChange={setSelectedCustomer}
                options={uniqueCustomers}
                size="sm"
                buttonClassName="bg-[#F5F5F7] border-[#E5E5EA]"
              />
            </div>

            {/* Prod Status Dropdown */}
            <div className="flex flex-col min-w-[155px]">
              <span className="text-[10px] text-[#86868B] font-semibold uppercase mb-0.5">
                Prod Status
              </span>
              <PremiumDropdown
                value={selectedProdStatus}
                onChange={setSelectedProdStatus}
                options={[
                  { value: "All", label: "All Statuses" },
                  { value: "100% Achieved", label: "All (100% Achieved)" },
                  { value: "In Progress", label: "In Progress (<100%)" },
                  { value: "Pending Verification", label: "Pending QC Verification" },
                ]}
                size="sm"
                buttonClassName="bg-[#F5F5F7] border-[#E5E5EA]"
              />
            </div>
          </div>

          {/* Search Input & Action Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 lg:w-72">
              <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="WO No, Part, Machine, Customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#F5F5F7] border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#007AFF]"
              />
            </div>
            <button
              onClick={() => {
                setSelectedMachine("All Machines");
                setSelectedCustomer("All Customers");
                setSelectedProdStatus("All");
                setSearchQuery("");
              }}
              title="Reset Filters"
              className="px-3 py-1.5 rounded-lg bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-semibold flex items-center justify-center shadow-xs transition-colors shrink-0"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Subheader / Info Bar */}
      <div className="px-4 py-2 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#1D1D1F] text-[13px]">
            Live Production Output
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#EAF8EF] text-[#1E823B] text-[10px] font-semibold border border-[#34C759]/30">
            ✓ 100% Target Achieved
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#F5F5F7] text-[#6E6E73] text-[10px] font-medium border border-[#E5E5EA]">
            {filteredRecords.length} records
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[#6E6E73]">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>
              ⓘ OK & NG inputs unlock after plan achievement.
            </span>
          </span>
          <span className="hidden md:inline text-[#86868B]">•</span>
          <span className="hidden md:inline text-[#86868B]">
            ● Assembly & Child Parts Color-Coded
          </span>
        </div>
      </div>

      {/* Main Production Table: All 19 Columns */}
      <div className="px-4 pb-6 sm:px-6 flex-1 overflow-hidden">
        <div className="bg-white rounded-xl border border-[#E5E5EA] shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse">
              {/* Table Header 1 */}
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#E5E5EA] text-[10px] font-bold text-[#6E6E73] uppercase tracking-wider whitespace-nowrap">
                  <th className="py-2.5 px-2 border-r border-[#E5E5EA] text-center w-10">
                    S.N.
                  </th>
                  <th className="py-2.5 px-3 border-r border-[#E5E5EA] min-w-[190px]">
                    MACHINE NAME
                  </th>
                  <th className="py-2.5 px-2.5 border-r border-[#E5E5EA] min-w-[85px]">
                    WORK ORDER DATE
                  </th>
                  <th className="py-2.5 px-2.5 border-r border-[#E5E5EA] min-w-[95px]">
                    WORK ORDER NO.
                  </th>
                  <th className="py-2.5 px-3 border-r border-[#E5E5EA] min-w-[160px]">
                    CUSTOMER NAME
                  </th>
                  <th className="py-2.5 px-2.5 border-r border-[#E5E5EA] min-w-[125px]">
                    ASSEMBLY PART CODE
                  </th>
                  <th className="py-2.5 px-3 border-r border-[#E5E5EA] min-w-[160px]">
                    ASSEMBLY PART NAME
                  </th>
                  <th className="py-2.5 px-2.5 border-r border-[#E5E5EA] min-w-[125px]">
                    CHILD PART CODE
                  </th>
                  <th className="py-2.5 px-3 border-r border-[#E5E5EA] min-w-[160px]">
                    CHILD PART NAME
                  </th>
                  <th className="py-2.5 px-2.5 border-r border-[#E5E5EA] text-center min-w-[65px]">
                    PLAN QTY
                  </th>
                  <th className="py-2.5 px-3 border-r border-[#E5E5EA] text-center min-w-[110px]">
                    PRODUCTION ACHIEVE QTY
                  </th>
                  <th className="py-2.5 px-2 border-r border-[#E5E5EA] text-center min-w-[60px] bg-[#34C759]/10 text-[#1E823B]">
                    OK
                  </th>
                  <th className="py-2.5 px-2 border-r border-[#E5E5EA] text-center min-w-[60px] bg-[#FF3B30]/10 text-[#DC2626]">
                    NG
                  </th>
                  <th className="py-2.5 px-2 border-r border-[#E5E5EA] text-center min-w-[65px] bg-[#007AFF]/10 text-[#007AFF]">
                    POST
                  </th>
                  <th className="py-2.5 px-2.5 border-r border-[#E5E5EA] text-center min-w-[95px]">
                    PROCESS
                  </th>
                  <th className="py-2.5 px-2 border-r border-[#E5E5EA] text-center min-w-[55px]">
                    MOVE
                  </th>
                  <th className="py-2.5 px-2.5 border-r border-[#E5E5EA] text-center min-w-[90px]">
                    STD CYCLE TIME
                  </th>
                  {/* Grouped Header: MACHINE PERFORMANCE (OEE) */}
                  <th
                    colSpan={4}
                    className="py-1 px-2 border-r border-[#E5E5EA] text-center bg-[#F2F4F7] text-[#1D1D1F]"
                  >
                    MACHINE PERFORMANCE (OEE)
                  </th>
                  <th className="py-2.5 px-3 text-center min-w-[95px]">
                    MACHINE STATUS
                  </th>
                </tr>

                {/* Subheader Row 2 */}
                <tr className="bg-[#FAFAFC] border-b border-[#E5E5EA] text-[9px] font-semibold text-[#86868B] uppercase tracking-wider whitespace-nowrap">
                  <th className="py-1 px-2 border-r border-[#E5E5EA] text-center">#</th>
                  <th className="py-1 px-3 border-r border-[#E5E5EA]">MACHINE</th>
                  <th className="py-1 px-2.5 border-r border-[#E5E5EA]">DATE</th>
                  <th className="py-1 px-2.5 border-r border-[#E5E5EA]">WO NO.</th>
                  <th className="py-1 px-3 border-r border-[#E5E5EA]">CLIENT</th>
                  <th className="py-1 px-2.5 border-r border-[#E5E5EA]">ASSY CODE</th>
                  <th className="py-1 px-3 border-r border-[#E5E5EA]">DESCRIPTION</th>
                  <th className="py-1 px-2.5 border-r border-[#E5E5EA]">CHILD CODE</th>
                  <th className="py-1 px-3 border-r border-[#E5E5EA]">DESCRIPTION</th>
                  <th className="py-1 px-2.5 border-r border-[#E5E5EA] text-center">TARGET</th>
                  <th className="py-1 px-3 border-r border-[#E5E5EA] text-center">PROGRESS</th>
                  <th className="py-1 px-2 border-r border-[#E5E5EA] text-center text-[#1E823B]">100% OK</th>
                  <th className="py-1 px-2 border-r border-[#E5E5EA] text-center text-[#DC2626]">DEFECT</th>
                  <th className="py-1 px-2 border-r border-[#E5E5EA] text-center text-[#007AFF]">ACTION</th>
                  <th className="py-1 px-2.5 border-r border-[#E5E5EA] text-center">NEXT ROUTE</th>
                  <th className="py-1 px-2 border-r border-[#E5E5EA] text-center">ACTION</th>
                  <th className="py-1 px-2.5 border-r border-[#E5E5EA] text-center">SECONDS</th>
                  {/* OEE 4 Sub-Columns */}
                  <th className="py-1 px-2 border-r border-[#E5E5EA] text-center min-w-[50px]">AVAIL (A)</th>
                  <th className="py-1 px-2 border-r border-[#E5E5EA] text-center min-w-[50px]">PERF (P)</th>
                  <th className="py-1 px-2 border-r border-[#E5E5EA] text-center min-w-[50px]">QUAL (Q)</th>
                  <th className="py-1 px-2 border-r border-[#E5E5EA] text-center min-w-[55px] text-[#007AFF]">★ OEE</th>
                  <th className="py-1 px-3 text-center">STATUS</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-[#E5E5EA] text-[11px]">
                {filteredRecords.map((r, index) => {
                  const is100Pct = r.achievedPercent >= 100;
                  const isMoved = r.moveStatus === "moved";
                  const isVerified = r.verificationStatus === "verified";
                  const isPendingQc = r.verificationStatus === "pending_verification";

                  return (
                    <tr
                      key={r.id}
                      className={cn(
                        "hover:bg-[#F9F9FB] transition-colors whitespace-nowrap",
                        index % 2 === 1 ? "bg-[#FCFCFD]" : "bg-white"
                      )}
                    >
                      {/* 1. S.N. */}
                      <td className="py-2 px-2 border-r border-[#E5E5EA] text-center font-mono text-[#86868B]">
                        {index + 1}
                      </td>

                      {/* 2. MACHINE NAME */}
                      <td className="py-2 px-3 border-r border-[#E5E5EA]">
                        <div className="flex flex-col">
                          <span className="inline-block px-1.5 py-0.2 rounded bg-[#E5E5EA]/70 text-[#1D1D1F] font-mono text-[9.5px] font-bold w-fit mb-0.5">
                            {r.machineCode}
                          </span>
                          <span
                            className="text-[11px] font-medium text-[#1D1D1F] truncate max-w-[200px]"
                            title={r.machineName}
                          >
                            {r.machineName}
                          </span>
                        </div>
                      </td>

                      {/* 3. WORK ORDER DATE */}
                      <td className="py-2 px-2.5 border-r border-[#E5E5EA] text-[#6E6E73] font-mono text-[10.5px]">
                        {r.workOrderDate}
                      </td>

                      {/* 4. WORK ORDER NO. */}
                      <td className="py-2 px-2.5 border-r border-[#E5E5EA]">
                        <button
                          onClick={() => setSelectedForLog(r)}
                          className="px-2 py-0.5 rounded-md bg-[#E8F2FE] hover:bg-[#D5E7FD] text-[#007AFF] font-mono text-[10.5px] font-bold transition-colors"
                        >
                          {r.workOrderNo}
                        </button>
                      </td>

                      {/* 5. CUSTOMER NAME */}
                      <td
                        className="py-2 px-3 border-r border-[#E5E5EA] font-semibold text-[#1D1D1F] truncate max-w-[160px]"
                        title={r.customerName}
                      >
                        {r.customerName}
                      </td>

                      {/* 6. ASSEMBLY PART CODE */}
                      <td className="py-2 px-2.5 border-r border-[#E5E5EA]">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F5F0FF] text-[#7C3AED] border border-[#DDD6FE] font-mono text-[9.5px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]"></span>
                          <span>{r.assemblyPartCode}</span>
                        </div>
                      </td>

                      {/* 7. ASSEMBLY PART NAME */}
                      <td
                        className="py-2 px-3 border-r border-[#E5E5EA] text-[#515154] truncate max-w-[160px]"
                        title={r.assemblyPartName}
                      >
                        {r.assemblyPartName}
                      </td>

                      {/* 8. CHILD PART CODE */}
                      <td className="py-2 px-2.5 border-r border-[#E5E5EA]">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] font-mono text-[9.5px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                          <span>{r.childPartCode}</span>
                        </div>
                      </td>

                      {/* 9. CHILD PART NAME */}
                      <td
                        className="py-2 px-3 border-r border-[#E5E5EA] text-[#515154] truncate max-w-[160px]"
                        title={r.childPartName}
                      >
                        {r.childPartName}
                      </td>

                      {/* 10. PLAN QTY */}
                      <td className="py-2 px-2.5 border-r border-[#E5E5EA] text-center font-mono font-bold text-[#1D1D1F]">
                        {r.planQty}
                      </td>

                      {/* 11. PRODUCTION ACHIEVE QTY */}
                      <td className="py-2 px-3 border-r border-[#E5E5EA] text-center">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-between w-full text-[10px] font-mono">
                            <span className="font-bold text-[#1D1D1F]">
                              {r.achievedQty}
                            </span>
                            <span className="text-[#34C759] font-semibold">
                              {r.achievedPercent}%
                            </span>
                          </div>
                          <div className="w-full bg-[#E5E5EA] h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                r.achievedPercent >= 100
                                  ? "bg-[#34C759]"
                                  : r.achievedPercent >= 70
                                  ? "bg-[#FF9500]"
                                  : "bg-[#007AFF]"
                              )}
                              style={{
                                width: `${Math.min(100, r.achievedPercent)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 12. OK (Good Qty - Operator Input) */}
                      <td className="py-1.5 px-2 border-r border-[#E5E5EA] text-center">
                        <button
                          onClick={() => setSelectedForLog(r)}
                          title="Click to update OK qty"
                          className="w-12 py-1 rounded-md border border-[#34C759] bg-[#EAF8EF] text-[#1E823B] font-mono font-bold text-xs hover:bg-[#D7F5E1] transition-colors"
                        >
                          {r.okQty}
                        </button>
                      </td>

                      {/* 13. NG (Defect Qty - Operator Input) */}
                      <td className="py-1.5 px-2 border-r border-[#E5E5EA] text-center">
                        <button
                          onClick={() => setSelectedForLog(r)}
                          title="Click to update NG rejection qty"
                          className={cn(
                            "w-10 py-1 rounded-md border font-mono font-bold text-xs transition-colors",
                            r.ngQty > 0
                              ? "border-[#FF3B30] bg-[#FFF5F5] text-[#DC2626] hover:bg-[#FFEBEB]"
                              : "border-[#E5E5EA] bg-white text-[#86868B] hover:border-[#FF3B30]"
                          )}
                        >
                          {r.ngQty}
                        </button>
                      </td>

                      {/* 14. POST (Action Button) */}
                      <td className="py-1.5 px-2 border-r border-[#E5E5EA] text-center">
                        <button
                          onClick={() => {
                            if (isPendingQc) {
                              setSelectedForSupervisor(r);
                            } else {
                              setSelectedForLog(r);
                            }
                          }}
                          className={cn(
                            "px-2 py-1 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 shadow-xs transition-all w-full",
                            isPendingQc
                              ? "bg-[#FF9500] hover:bg-[#E08500] text-white"
                              : "bg-[#007AFF] hover:bg-[#0062CC] text-white"
                          )}
                        >
                          <ArrowLeftRight className="w-2.5 h-2.5" />
                          <span>{isPendingQc ? "VERIFY" : "POST"}</span>
                        </button>
                      </td>

                      {/* 15. PROCESS (Next Routing Dropdown) */}
                      <td className="py-1.5 px-2 border-r border-[#E5E5EA] text-center min-w-[125px]">
                        <PremiumDropdown
                          value={r.process}
                          onChange={(val) =>
                            handleProcessChange(r.id, val as NextProcessOption)
                          }
                          options={[
                            "Brazing",
                            "End Forming",
                            "IKP / BOP Transfer",
                            "Ultrasonic QC",
                            "Hydrostatic Testing",
                            "Final Packing",
                          ]}
                          size="sm"
                          searchable={false}
                          buttonClassName="bg-[#F5F5F7] border-[#E5E5EA] text-[10.5px] py-0.5 px-1.5 min-h-[26px]"
                        />
                      </td>

                      {/* 16. MOVE (Confirmation to Next Station) */}
                      <td className="py-1.5 px-2 border-r border-[#E5E5EA] text-center">
                        <button
                          onClick={() => handleMoveBatch(r)}
                          title={
                            isMoved
                              ? `Batch already moved to ${r.process}`
                              : isVerified
                              ? `Click to move batch to ${r.process}`
                              : `Supervisor confirmation required before moving`
                          }
                          className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center mx-auto text-xs font-bold transition-all shadow-xs",
                            isMoved
                              ? "bg-[#86868B] text-white cursor-default opacity-60"
                              : isVerified
                              ? "bg-[#34C759] hover:bg-[#2DB34D] text-white ring-2 ring-[#34C759]/30"
                              : "bg-[#FF9500] hover:bg-[#E08500] text-white"
                          )}
                        >
                          {isMoved ? "✓" : isVerified ? "OK" : "!"}
                        </button>
                      </td>

                      {/* 17. STD CYCLE TIME */}
                      <td className="py-2 px-2.5 border-r border-[#E5E5EA] text-center">
                        <div className="font-mono text-[10.5px] font-semibold text-[#1D1D1F]">
                          {r.stdCycleTimeSec}s
                        </div>
                        <div className="text-[9px] text-[#86868B]">
                          {r.ratePerHour}/hr
                        </div>
                      </td>

                      {/* 18. OEE Sub-columns */}
                      {/* Availability (A) */}
                      <td className="py-2 px-2 border-r border-[#E5E5EA] text-center font-mono text-[10px] text-[#515154]">
                        {r.oee.availability.toFixed(1)}
                      </td>

                      {/* Performance (P) */}
                      <td className="py-2 px-2 border-r border-[#E5E5EA] text-center font-mono text-[10px] text-[#515154]">
                        {r.oee.performance.toFixed(1)}
                      </td>

                      {/* Quality (Q) */}
                      <td className="py-2 px-2 border-r border-[#E5E5EA] text-center font-mono text-[10px] text-[#515154]">
                        {r.oee.quality.toFixed(1)}
                      </td>

                      {/* ★ OEE (%) */}
                      <td className="py-2 px-2 border-r border-[#E5E5EA] text-center">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded font-mono text-[10px] font-bold",
                            r.oee.oee >= 85
                              ? "bg-[#EAF8EF] text-[#1E823B]"
                              : r.oee.oee >= 70
                              ? "bg-[#FFFBEB] text-[#B45309]"
                              : "bg-[#FFF5F5] text-[#DC2626]"
                          )}
                        >
                          {r.oee.oee.toFixed(1)}
                        </span>
                      </td>

                      {/* 19. MACHINE STATUS */}
                      <td className="py-2 px-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize",
                            r.machineStatus === "running"
                              ? "bg-[#EAF8EF] text-[#1E823B] border border-[#34C759]/30"
                              : r.machineStatus === "available"
                              ? "bg-[#E8F2FE] text-[#007AFF] border border-[#007AFF]/30"
                              : "bg-[#FFF5F5] text-[#DC2626] border border-[#FF3B30]/30"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              r.machineStatus === "running"
                                ? "bg-[#34C759]"
                                : r.machineStatus === "available"
                                ? "bg-[#007AFF]"
                                : "bg-[#FF3B30]"
                            )}
                          />
                          <span>{r.machineStatus}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Summary Bar */}
          <div className="p-3 bg-[#F8F9FA] border-t border-[#E5E5EA] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#6E6E73]">
            <div className="flex items-center gap-2">
              <span>
                Showing <strong>{filteredRecords.length}</strong> of{" "}
                <strong>{records.length}</strong> active production batches
              </span>
              <span className="text-[#86868B]">•</span>
              <span className="text-[#007AFF] font-medium">
                Live Sensor Sync Enabled
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#34C759]"></span>
                <span>Verified Output</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#FF9500]"></span>
                <span>Pending QC Check</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#FF3B30]"></span>
                <span>Defects Recorded</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Operator Production Logging Modal */}
      <OperatorLogModal
        isOpen={Boolean(selectedForLog)}
        onClose={() => setSelectedForLog(null)}
        record={selectedForLog}
        onSave={handleSaveOperatorLog}
      />

      {/* Responsible Person / Supervisor Confirmation Modal */}
      <SupervisorConfirmModal
        isOpen={Boolean(selectedForSupervisor)}
        onClose={() => setSelectedForSupervisor(null)}
        record={selectedForSupervisor}
        onConfirm={handleSupervisorVerification}
      />
    </div>
  );
}

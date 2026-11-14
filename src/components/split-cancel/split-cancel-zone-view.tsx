import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Scissors,
  XCircle,
  FileSpreadsheet,
  Printer,
  CalendarClock,
  Briefcase,
  AlertOctagon,
  GitFork,
  Search,
  RotateCcw,
  User,
  Clock,
  ArrowRight,
  ExternalLink,
  Info,
  CheckCircle2,
  X,
  Filter as FilterIcon,
  Layers,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PremiumDropdown } from "@/components/ui/premium-dropdown";
import {
  SplitCancelRecord,
  INITIAL_SPLIT_CANCEL_RECORDS,
  ZoneRecordType,
  PriorityLevel,
} from "@/lib/split-cancel-zone-data";
import { usePersistentState } from "@/lib/use-persistent-state";

export function SplitCancelZoneView() {
  const router = useRouter();

  // Persisted state
  const [records, setRecords] = usePersistentState<SplitCancelRecord[]>(
    "prodsync_split_cancel_records",
    INITIAL_SPLIT_CANCEL_RECORDS
  );

  // Filters
  const [activeTab, setActiveTab] = useState<"All" | ZoneRecordType>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");
  const [selectedRecord, setSelectedRecord] = useState<SplitCancelRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // KPI Calculations
  const metrics = useMemo(() => {
    const total = records.length;
    const cancelled = records.filter((r) => r.zoneType === "Cancelled");
    const splitParents = records.filter((r) => r.zoneType === "Split Parent");
    const splitChildren = records.filter((r) => r.zoneType === "Split Child");

    const cancelledPendingUnits = cancelled.reduce((acc, r) => acc + r.remainingQty, 0);
    const cancelledProducedUnits = cancelled.reduce((acc, r) => acc + r.producedQty, 0);
    const splitCarryOverUnits = splitChildren.reduce((acc, r) => acc + r.orderedQty, 0);

    return {
      total,
      cancelledCount: cancelled.length,
      splitParentsCount: splitParents.length,
      splitChildrenCount: splitChildren.length,
      cancelledPendingUnits,
      cancelledProducedUnits,
      splitCarryOverUnits,
    };
  }, [records]);

  // Priority options for dropdown
  const priorityOptions = [
    { value: "All Priorities", label: "All Priorities" },
    { value: "URGENT", label: "URGENT" },
    { value: "HIGH", label: "HIGH" },
    { value: "MEDIUM", label: "MEDIUM" },
    { value: "LOW", label: "LOW" },
  ];

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Tab filter
      if (activeTab !== "All" && r.zoneType !== activeTab) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== "All Priorities" && r.priority !== priorityFilter) {
        return false;
      }

      // Search filter
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        r.workOrderNo.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.poNumber.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.assemblyPartNo.toLowerCase().includes(q) ||
        r.reasonTitle.toLowerCase().includes(q) ||
        (r.parentWoNo && r.parentWoNo.toLowerCase().includes(q))
      );
    });
  }, [records, activeTab, priorityFilter, searchQuery]);

  // Reset Filters
  const handleResetFilters = () => {
    setActiveTab("All");
    setSearchQuery("");
    setPriorityFilter("All Priorities");
    showToast("Filters reset to default view");
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Work Order No",
      "Zone Type",
      "Parent Work Order",
      "Priority",
      "Customer",
      "PO Number",
      "Product Name",
      "Assembly Part No",
      "Ordered Qty",
      "Produced Qty",
      "Remaining Qty",
      "Reason Title",
      "Reason Detail",
      "Action By",
      "Action Date",
      "Action Time",
    ];

    const rows = filteredRecords.map((r) => [
      r.workOrderNo,
      r.zoneType,
      r.parentWoNo || "N/A",
      r.priority,
      `"${r.customerName}"`,
      r.poNumber,
      `"${r.productName}"`,
      r.assemblyPartNo,
      r.orderedQty,
      r.producedQty,
      r.remainingQty,
      `"${r.reasonTitle}"`,
      `"${r.reasonDetail || ""}"`,
      `"${r.actionBy}"`,
      r.actionDate,
      r.actionTime,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Split_Cancel_Zone_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported CSV report successfully");
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#15803D] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-80"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header Banner matching reference image */}
      <div className="px-4 sm:px-8 pt-5 pb-4 bg-white border-b border-[#E5E5EA]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left Title & Specialized Zone Tag */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-bold uppercase tracking-wider bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                Specialized Zone
              </span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#DC2626] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  <XCircle className="w-4 h-4" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
                  Split / Cancel Work Order Zone
                </h1>
              </div>
            </div>
            <p className="text-xs text-[#6E6E73] mt-1 pl-1 leading-relaxed">
              Comprehensive overview, reasons, parent-child lineage, and timeline of all Cancelled and Split work orders.
            </p>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg border border-[#D1D5DB] bg-white text-[#1D1D1F] hover:bg-[#F3F4F6] text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg border border-[#D1D5DB] bg-white text-[#1D1D1F] hover:bg-[#F3F4F6] text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>Print Report</span>
            </button>

            <button
              onClick={() => router.push("/machine-scheduler")}
              className="px-3.5 py-1.5 rounded-lg bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Back to Scheduler</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-5 space-y-4">
        {/* Top 4 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total In This Zone */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E5EA] shadow-xs flex items-center justify-between border-l-4 border-l-[#007AFF]">
            <div>
              <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                TOTAL IN THIS ZONE
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] mt-1 font-mono">
                {metrics.total}
              </div>
              <div className="text-xs text-[#007AFF] mt-1 font-medium">
                8 unique parent orders affected
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#007AFF] flex items-center justify-center shadow-2xs">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Cancelled Orders */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E5EA] shadow-xs flex items-center justify-between border-l-4 border-l-[#DC2626]">
            <div>
              <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                CANCELLED ORDERS
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#DC2626] mt-1 font-mono">
                {metrics.cancelledCount}
              </div>
              <div className="text-xs text-[#48484A] mt-1">
                <span className="font-semibold text-[#DC2626]">{metrics.cancelledPendingUnits} pending</span> units cancelled / released ({metrics.cancelledProducedUnits} produced)
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shadow-2xs">
              <XCircle className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Split Parent Orders */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E5EA] shadow-xs flex items-center justify-between border-l-4 border-l-[#F59E0B]">
            <div>
              <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                SPLIT PARENT ORDERS
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#F59E0B] mt-1 font-mono">
                {metrics.splitParentsCount}
              </div>
              <div className="text-xs text-[#48484A] mt-1">
                <span className="font-semibold text-[#D97706]">Partially completed</span> parent work orders
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center shadow-2xs">
              <GitFork className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Split Child Orders */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E5EA] shadow-xs flex items-center justify-between border-l-4 border-l-[#0284C7]">
            <div>
              <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                SPLIT CHILD ORDERS
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0284C7] mt-1 font-mono">
                {metrics.splitChildrenCount}
              </div>
              <div className="text-xs text-[#0284C7] mt-1 font-medium">
                {metrics.splitCarryOverUnits} carry-over split quantities
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shadow-2xs">
              <Scissors className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar Strip */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#E5E5EA] shadow-xs space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Left Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              <button
                onClick={() => setActiveTab("All")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                  activeTab === "All"
                    ? "bg-[#007AFF] text-white shadow-xs"
                    : "bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#EBEBF0]"
                )}
              >
                All ({metrics.total})
              </button>

              <button
                onClick={() => setActiveTab("Cancelled")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap",
                  activeTab === "Cancelled"
                    ? "bg-[#DC2626] text-white shadow-xs"
                    : "bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]"
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span>Cancelled ({metrics.cancelledCount})</span>
              </button>

              <button
                onClick={() => setActiveTab("Split Parent")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap",
                  activeTab === "Split Parent"
                    ? "bg-[#F59E0B] text-white shadow-xs"
                    : "bg-[#FFFBEB] text-[#D97706] hover:bg-[#FEF3C7]"
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span>Split Parents ({metrics.splitParentsCount})</span>
              </button>

              <button
                onClick={() => setActiveTab("Split Child")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap",
                  activeTab === "Split Child"
                    ? "bg-[#0284C7] text-white shadow-xs"
                    : "bg-[#E0F2FE] text-[#0284C7] hover:bg-[#BAE6FD]"
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span>Split Children ({metrics.splitChildrenCount})</span>
              </button>
            </div>

            {/* Right Search, Priority & Filter Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative min-w-[240px] sm:min-w-[280px]">
                <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search WO No, Reason, Customer, PO..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#F5F5F7] border border-transparent rounded-xl text-xs font-medium placeholder-[#86868B] focus:bg-white focus:border-[#007AFF] focus:outline-none transition-all"
                />
              </div>

              <div className="w-36">
                <PremiumDropdown
                  value={priorityFilter}
                  onChange={(val) => setPriorityFilter(val)}
                  options={priorityOptions}
                  className="w-full text-xs font-medium"
                />
              </div>

              <button
                onClick={() => showToast(`Filtered ${filteredRecords.length} records`)}
                className="px-4 py-1.5 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-bold shadow-2xs"
              >
                Filter
              </button>

              <button
                onClick={handleResetFilters}
                className="px-3 py-1.5 rounded-xl border border-[#D1D5DB] bg-white text-[#48484A] hover:bg-[#F3F4F6] text-xs font-semibold"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5E5EA] bg-[#F8F9FA] text-[11px] font-bold text-[#48484A]">
                  <th className="py-3 px-3.5 border-r border-[#E5E5EA] whitespace-nowrap">
                    Work Order No
                  </th>
                  <th className="py-3 px-3 border-r border-[#E5E5EA] text-center whitespace-nowrap">
                    Zone Type
                  </th>
                  <th className="py-3 px-3.5 border-r border-[#E5E5EA] min-w-[200px]">
                    Customer / PO
                  </th>
                  <th className="py-3 px-3.5 border-r border-[#E5E5EA] min-w-[220px]">
                    Product &amp; BOM
                  </th>
                  <th className="py-3 px-3.5 border-r border-[#E5E5EA] min-w-[150px]">
                    Quantities (Ord / Prod / Pend)
                  </th>
                  <th className="py-3 px-4 border-r border-[#E5E5EA] min-w-[260px]">
                    Reason &amp; Justification
                  </th>
                  <th className="py-3 px-3.5 border-r border-[#E5E5EA] min-w-[170px]">
                    Action By &amp; Time
                  </th>
                  <th className="py-3 px-3 text-center whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E5E5EA]">
                {filteredRecords.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={cn(
                      "transition-colors hover:bg-[#F9FAFB]",
                      idx % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"
                    )}
                  >
                    {/* Work Order No + Glyph + Priority */}
                    <td className="py-3.5 px-3.5 border-r border-[#E5E5EA] align-middle whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {item.zoneType === "Cancelled" && (
                          <XCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                        )}
                        {item.zoneType === "Split Child" && (
                          <Scissors className="w-4 h-4 text-[#0284C7] shrink-0" />
                        )}
                        {item.zoneType === "Split Parent" && (
                          <GitFork className="w-4 h-4 text-[#D97706] shrink-0" />
                        )}

                        <span className="font-bold text-xs text-[#007AFF]">
                          {item.workOrderNo}
                        </span>

                        <span
                          className={cn(
                            "text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase",
                            item.priority === "URGENT" && "bg-[#FEE2E2] text-[#DC2626]",
                            item.priority === "HIGH" && "bg-[#FEF3C7] text-[#D97706]",
                            item.priority === "MEDIUM" && "bg-[#EFF6FF] text-[#2563EB]",
                            item.priority === "LOW" && "bg-[#F3F4F6] text-[#6B7280]"
                          )}
                        >
                          {item.priority}
                        </span>
                      </div>

                      {item.parentWoNo && (
                        <div className="text-[10px] text-[#D97706] mt-0.5 font-medium pl-5">
                          ↳ From: {item.parentWoNo}
                        </div>
                      )}
                      {item.zoneType === "Split Parent" && (
                        <div className="text-[10px] text-[#86868B] mt-0.5 font-medium pl-5">
                          Parent Batch
                        </div>
                      )}
                    </td>

                    {/* Zone Type */}
                    <td className="py-3.5 px-3 border-r border-[#E5E5EA] text-center align-middle whitespace-nowrap">
                      {item.zoneType === "Cancelled" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                          Cancelled
                        </span>
                      )}
                      {item.zoneType === "Split Child" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
                          Split Child (Seq {item.sequence || 1})
                        </span>
                      )}
                      {item.zoneType === "Split Parent" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                          Split Parent
                        </span>
                      )}
                    </td>

                    {/* Customer / PO */}
                    <td className="py-3.5 px-3.5 border-r border-[#E5E5EA] align-middle">
                      <div className="font-bold text-xs text-[#1D1D1F]">
                        {item.customerName}
                      </div>
                      <div className="text-[10.5px] text-[#86868B] font-mono mt-0.5">
                        {item.poNumber}
                      </div>
                    </td>

                    {/* Product & BOM */}
                    <td className="py-3.5 px-3.5 border-r border-[#E5E5EA] align-middle">
                      <div className="font-medium text-xs text-[#1D1D1F] line-clamp-1">
                        {item.productName}
                      </div>
                      <div className="text-[10.5px] font-semibold text-[#007AFF] hover:underline mt-0.5 cursor-pointer">
                        {item.assemblyPartNo}
                      </div>
                    </td>

                    {/* Quantities (Ordered / Produced / Remaining) */}
                    <td className="py-3.5 px-3.5 border-r border-[#E5E5EA] align-middle font-mono text-[11px] space-y-0.5">
                      <div className="flex items-center justify-between text-[#48484A]">
                        <span>Ordered:</span>
                        <span className="font-bold">{item.orderedQty} pcs</span>
                      </div>
                      <div className="flex items-center justify-between text-[#16A34A] bg-[#DCFCE7]/40 px-1 py-0.2 rounded">
                        <span className="flex items-center gap-0.5">
                          ✓ Produced:
                        </span>
                        <span className="font-bold">{item.producedQty} pcs</span>
                      </div>
                      <div
                        className={cn(
                          "flex items-center justify-between px-1 py-0.2 rounded",
                          item.remainingQty > 0
                            ? "text-[#D97706] bg-[#FEF3C7]/40 font-bold"
                            : "text-[#86868B]"
                        )}
                      >
                        <span>⏳ Remaining:</span>
                        <span>{item.remainingQty} pcs</span>
                      </div>
                    </td>

                    {/* Reason & Justification */}
                    <td className="py-3.5 px-4 border-r border-[#E5E5EA] align-middle">
                      <div
                        className={cn(
                          "inline-block px-2 py-0.5 rounded text-[11px] font-bold mb-1",
                          item.zoneType === "Cancelled"
                            ? "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
                            : "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]"
                        )}
                      >
                        {item.reasonTitle}
                      </div>
                      {item.reasonDetail && (
                        <div className="text-[10.5px] text-[#6E6E73] leading-snug line-clamp-2">
                          {item.reasonDetail}
                        </div>
                      )}
                    </td>

                    {/* Action By & Time */}
                    <td className="py-3.5 px-3.5 border-r border-[#E5E5EA] align-middle text-[11px] space-y-0.5">
                      <div className="flex items-center gap-1 font-semibold text-[#1D1D1F]">
                        <User className="w-3.5 h-3.5 text-[#6E6E73] shrink-0" />
                        <span className="truncate">{item.actionBy}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#86868B] text-[10.5px]">
                        <Clock className="w-3 h-3 text-[#86868B] shrink-0" />
                        <span>
                          {item.actionDate}, {item.actionTime}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-center align-middle whitespace-nowrap">
                      <button
                        onClick={() => setSelectedRecord(item)}
                        className="px-3 py-1 rounded-lg border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-[#007AFF] hover:border-[#007AFF] text-xs font-semibold transition-all shadow-2xs"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Slide-Over / Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#E5E5EA] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-3">
              <div className="flex items-center gap-2">
                {selectedRecord.zoneType === "Cancelled" ? (
                  <XCircle className="w-5 h-5 text-[#DC2626]" />
                ) : (
                  <Scissors className="w-5 h-5 text-[#0284C7]" />
                )}
                <div>
                  <h3 className="text-base font-bold text-[#1D1D1F]">
                    {selectedRecord.workOrderNo} — {selectedRecord.zoneType} Audit
                  </h3>
                  <div className="text-[10.5px] text-[#86868B]">
                    Logged on {selectedRecord.actionDate} at {selectedRecord.actionTime} by {selectedRecord.actionBy}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-[#86868B] hover:text-[#1D1D1F] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Order Meta */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#F8F9FA] rounded-xl">
                <div>
                  <span className="font-bold text-[#86868B] uppercase text-[10px]">Customer:</span>
                  <div className="font-semibold text-[#1D1D1F] mt-0.5">{selectedRecord.customerName}</div>
                  <div className="text-[10.5px] text-[#86868B]">{selectedRecord.poNumber}</div>
                </div>
                <div>
                  <span className="font-bold text-[#86868B] uppercase text-[10px]">Product / Assembly:</span>
                  <div className="font-semibold text-[#1D1D1F] mt-0.5">{selectedRecord.assemblyPartNo}</div>
                  <div className="text-[10.5px] text-[#86868B] truncate">{selectedRecord.productName}</div>
                </div>
              </div>

              {/* Quantities breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center p-3 border border-[#E5E5EA] rounded-xl">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#86868B]">Ordered</div>
                  <div className="text-base font-extrabold font-mono text-[#1D1D1F] mt-0.5">{selectedRecord.orderedQty} pcs</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#16A34A]">Produced</div>
                  <div className="text-base font-extrabold font-mono text-[#16A34A] mt-0.5">{selectedRecord.producedQty} pcs</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#D97706]">Remaining / Cancelled</div>
                  <div className="text-base font-extrabold font-mono text-[#D97706] mt-0.5">{selectedRecord.remainingQty} pcs</div>
                </div>
              </div>

              {/* Reason & Audit Justification */}
              <div className="space-y-1">
                <div className="text-[10.5px] uppercase font-bold text-[#86868B]">
                  Official Authorization Reason:
                </div>
                <div
                  className={cn(
                    "p-3 rounded-xl border",
                    selectedRecord.zoneType === "Cancelled"
                      ? "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]"
                      : "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]"
                  )}
                >
                  <div className="font-bold text-xs">{selectedRecord.reasonTitle}</div>
                  {selectedRecord.reasonDetail && (
                    <div className="text-xs mt-1 leading-relaxed">{selectedRecord.reasonDetail}</div>
                  )}
                </div>
              </div>

              {/* Lineage */}
              {selectedRecord.parentWoNo && (
                <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#2563EB] uppercase">Parent Lineage:</span>
                    <div className="text-xs font-semibold text-[#1D1D1F]">
                      Split from parent order {selectedRecord.parentWoNo}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#007AFF] bg-white px-2 py-0.5 rounded border border-[#BFDBFE]">
                    Sequence {selectedRecord.sequence || 1}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E5E5EA]">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl bg-[#007AFF] text-white text-xs font-semibold"
              >
                Close Audit Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

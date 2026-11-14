import React, { useState, useMemo, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  Flame,
  Search,
  Filter,
  RotateCcw,
  Check,
  ArrowRight,
  Info,
  CheckCircle2,
  Calendar,
  X,
  ExternalLink,
  ChevronDown,
  Layers,
  Factory,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BrazingItem,
  INITIAL_BRAZING_ITEMS,
} from "@/lib/brazing-mock-data";
import { usePersistentState } from "@/lib/use-persistent-state";

export function BrazingView() {
  // Main Brazing items state (persisted)
  const [items, setItems] = usePersistentState<BrazingItem[]>(
    "prodsync_brazing_queue_items",
    INITIAL_BRAZING_ITEMS
  );

  // Filter state
  const [dateFilter, setDateFilter] = useState<string>("");
  const [machineFilter, setMachineFilter] = useState<string>("All Machines");
  const [customerFilter, setCustomerFilter] = useState<string>("All Customers");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Controls state
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>("07:43:10");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selection state
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({});
  const [selectedWoDetail, setSelectedWoDetail] = useState<BrazingItem | null>(null);

  // Auto-refresh timer
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      const now = new Date();
      setLastSyncTime(now.toLocaleTimeString("en-GB"));
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Dynamic filter options
  const uniqueMachines = useMemo(() => {
    const set = new Set(items.map((i) => i.machineCode));
    return ["All Machines", ...Array.from(set)];
  }, [items]);

  const uniqueCustomers = useMemo(() => {
    const set = new Set(items.map((i) => i.customerName));
    return ["All Customers", ...Array.from(set)];
  }, [items]);

  // Filtered dataset
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.workOrderNo.toLowerCase().includes(q) ||
        item.machineCode.toLowerCase().includes(q) ||
        item.machineName.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        item.assemblyPartCode.toLowerCase().includes(q) ||
        item.assemblyPartName.toLowerCase().includes(q);

      const matchMachine =
        machineFilter === "All Machines" ||
        item.machineCode === machineFilter ||
        item.machineName === machineFilter;

      const matchCustomer =
        customerFilter === "All Customers" ||
        item.customerName === customerFilter;

      const matchDate =
        !dateFilter || item.workOrderDate.includes(dateFilter);

      return matchSearch && matchMachine && matchCustomer && matchDate;
    });
  }, [items, searchQuery, machineFilter, customerFilter, dateFilter]);

  // KPI Calculations
  const totalTargetQty = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.planQty, 0);
  }, [items]);

  const totalBrazedOutputQty = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.okQty, 0);
  }, [items]);

  const brazedPercent = useMemo(() => {
    if (totalTargetQty === 0) return 0;
    return Math.round((totalBrazedOutputQty / totalTargetQty) * 100);
  }, [totalTargetQty, totalBrazedOutputQty]);

  const totalDefectsQty = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.ngQty, 0);
  }, [items]);

  const batchesCount = items.length;

  // Selection handlers
  const allFilteredSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) => selectedRowIds[item.id]);

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedRowIds({});
    } else {
      const newSel: Record<string, boolean> = {};
      filteredItems.forEach((item) => {
        newSel[item.id] = true;
      });
      setSelectedRowIds(newSel);
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedRowIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Input changes
  const handleOkQtyChange = (id: string, val: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const ok = Math.max(0, val);
          return { ...item, okQty: ok };
        }
        return item;
      })
    );
  };

  const handleNgQtyChange = (id: string, val: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const ng = Math.max(0, val);
          return { ...item, ngQty: ng };
        }
        return item;
      })
    );
  };

  const handleNextProcessChange = (id: string, nextProcess: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, nextProcess } : item))
    );
  };

  // Action: Advance batch to next process
  const handleHandoff = (item: BrazingItem) => {
    showToast(
      `Batch ${item.workOrderNo} (${item.assemblyPartCode}) routed to ${item.nextProcess} with ${item.okQty} OK parts.`
    );
  };

  const handleResetFilters = () => {
    setDateFilter("");
    setMachineFilter("All Machines");
    setCustomerFilter("All Customers");
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] text-[#1D1D1F]">
      <Head>
        <title>Brazing Zone - PRODSYNC Scheduler v2</title>
        <meta
          name="description"
          content="Continuous brazing line dispatch, queue management, OK/NG metrics, and next handoff inspection"
        />
      </Head>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-[#1D1D1F] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs border border-white/10 animate-in fade-in slide-in-from-top-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-75 text-white/80"
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Title & Operational Header */}
      <div className="bg-white border-b border-[#E5E5EA] px-4 py-3 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Title & Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF9500] to-[#E65100] text-white flex items-center justify-center shadow-xs shrink-0">
              <Flame className="w-6 h-6 text-white fill-white/20" />
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
                Brazing Zone
              </h1>
              <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-bold tracking-wider uppercase bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047]">
                ZONE-BR | TVE
              </span>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
            {/* Auto-Refresh (10s) Switch */}
            <div className="flex items-center gap-2 text-xs text-[#52525B] font-medium select-none">
              <button
                type="button"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={cn(
                  "w-8 h-4 rounded-full transition-colors relative p-0.5 focus:outline-none",
                  autoRefresh ? "bg-[#007AFF]" : "bg-[#D1D1D6]"
                )}
                aria-label="Toggle auto-refresh"
              >
                <div
                  className={cn(
                    "w-3 h-3 rounded-full bg-white transition-transform shadow-xs",
                    autoRefresh ? "translate-x-4" : "translate-x-0"
                  )}
                />
              </button>
              <span>Auto-Refresh (10s)</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => {
                const now = new Date();
                setLastSyncTime(now.toLocaleTimeString("en-GB"));
                showToast("Brazing sensor metrics updated successfully.");
              }}
              className="px-3 py-1.5 rounded-lg border border-[#E5E5EA] bg-white hover:bg-[#F5F5F7] text-xs font-medium text-[#1D1D1F] flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#86868B]" />
              <span>Refresh</span>
            </button>

            {/* Production Button */}
            <Link
              href="/production"
              className="px-3 py-1.5 rounded-lg border border-[#007AFF] text-[#007AFF] hover:bg-[#E8F2FE] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Factory className="w-3.5 h-3.5 text-[#007AFF]" />
              <span>Production</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Metric KPI Cards */}
      <div className="px-4 py-3.5 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. BRAZING TARGET QTY */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#F59E0B] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>BRAZING TARGET QTY</span>
              <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] text-[9.5px] font-bold">
                Planned
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#1D1D1F] mt-2">
              {totalTargetQty}
            </div>
          </div>

          {/* 2. BRAZED OUTPUT QTY */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#10B981] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>BRAZED OUTPUT QTY</span>
              <span className="px-2 py-0.5 rounded bg-[#D1FAE5] text-[#065F46] text-[9.5px] font-bold">
                {brazedPercent}%
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#10B981] mt-2">
              {totalBrazedOutputQty}
            </div>
          </div>

          {/* 3. BRAZING NG / DEFECTS */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#EF4444] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>BRAZING NG / DEFECTS</span>
              <span className="px-2 py-0.5 rounded bg-[#FEE2E2] text-[#991B1B] text-[9.5px] font-bold">
                Rejections
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#EF4444] mt-2">
              {totalDefectsQty}
            </div>
          </div>

          {/* 4. BATCHES IN BRAZING */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#3B82F6] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>BATCHES IN BRAZING</span>
              <span className="px-2 py-0.5 rounded bg-[#DBEAFE] text-[#1E40AF] text-[9.5px] font-bold">
                Active Lots
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#3B82F6] mt-2">
              {batchesCount}
            </div>
          </div>

          {/* 5. NEXT HANDOFF */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#06B6D4] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>NEXT HANDOFF</span>
              <span className="px-2 py-0.5 rounded bg-[#E0F2FE] text-[#0369A1] text-[9.5px] font-bold">
                LT
              </span>
            </div>
            <div className="text-lg font-bold text-[#0EA5E9] mt-2 truncate">
              Leak Testing
            </div>
          </div>

          {/* 6. LAST UPDATED */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#9CA3AF] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>LAST UPDATED</span>
              <span className="px-2 py-0.5 rounded bg-[#EAF8EF] text-[#16A34A] text-[9.5px] font-bold font-mono">
                Sync OK
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-[#1D1D1F] mt-2">
              {lastSyncTime}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Row Card */}
      <div className="px-4 py-1.5 sm:px-6">
        <div className="bg-white p-3 rounded-xl border border-[#E5E5EA] shadow-xs flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-3 text-xs">
          {/* Left Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            {/* Date */}
            <div className="flex flex-col">
              <label className="text-[10px] text-[#86868B] font-semibold uppercase mb-1">
                Date
              </label>
              <input
                type="text"
                placeholder="dd/mm/yyyy"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#007AFF] transition-colors"
              />
            </div>

            {/* Machine */}
            <div className="flex flex-col">
              <label className="text-[10px] text-[#86868B] font-semibold uppercase mb-1">
                Machine
              </label>
              <div className="relative">
                <select
                  value={machineFilter}
                  onChange={(e) => setMachineFilter(e.target.value)}
                  className="w-full appearance-none px-3 py-1.5 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] focus:outline-none focus:border-[#007AFF] transition-colors cursor-pointer"
                >
                  {uniqueMachines.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Customer */}
            <div className="flex flex-col">
              <label className="text-[10px] text-[#86868B] font-semibold uppercase mb-1">
                Customer
              </label>
              <div className="relative">
                <select
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  className="w-full appearance-none px-3 py-1.5 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] focus:outline-none focus:border-[#007AFF] transition-colors cursor-pointer"
                >
                  {uniqueCustomers.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Right Search and Actions */}
          <div className="flex items-end gap-2 flex-1 lg:max-w-md">
            {/* Search Input */}
            <div className="flex-1 flex flex-col">
              <label className="text-[10px] text-[#86868B] font-semibold uppercase mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="WO No, Part, Machine..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#007AFF] transition-colors"
                />
              </div>
            </div>

            {/* Amber Funnel Filter Button */}
            <button
              onClick={() => showToast("Filters applied")}
              className="h-[31px] px-3.5 rounded-lg bg-[#EAB308] hover:bg-[#CA8A04] text-[#1D1D1F] flex items-center justify-center shadow-xs transition-colors shrink-0"
              title="Apply Filters"
            >
              <Filter className="w-3.5 h-3.5 fill-[#1D1D1F] text-[#1D1D1F]" />
            </button>

            {/* Reload / Reset Button */}
            <button
              onClick={handleResetFilters}
              className="h-[31px] px-2.5 rounded-lg border border-[#E5E5EA] bg-white hover:bg-[#F5F5F7] text-[#6E6E73] flex items-center justify-center shadow-xs transition-colors shrink-0"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Section Header */}
      <div className="px-4 pt-4 pb-2 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Title & Batch Count */}
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm sm:text-base font-bold text-[#1D1D1F]">
              Brazing Queue & Output
            </h2>
            <span className="px-2.5 py-0.5 rounded-md bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-xs font-bold">
              {filteredItems.length} items in Brazing
            </span>
          </div>

          {/* Info Note */}
          <div className="flex items-center gap-1.5 text-xs text-[#6E6E73]">
            <Info className="w-3.5 h-3.5 text-[#86868B] shrink-0" />
            <span>OK & NG inputs unlock only after 100% Plan is achieved.</span>
          </div>
        </div>
      </div>

      {/* Main Brazing Queue Table */}
      <div className="px-4 pb-12 sm:px-6">
        <div className="bg-white rounded-xl border border-[#E5E5EA] shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
            {/* Table Header */}
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#E5E5EA] text-[10.5px] font-bold text-[#6E6E73] uppercase tracking-wider select-none">
                <th className="w-10 px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={handleToggleSelectAll}
                    className="w-3.5 h-3.5 rounded border-[#D1D1D6] text-[#007AFF] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="w-12 px-2 py-3 text-center">S.NO.</th>
                <th className="px-3 py-3 min-w-[200px]">MACHINE NAME</th>
                <th className="px-3 py-3 min-w-[190px]">CUSTOMER</th>
                <th className="px-3 py-3 min-w-[120px]">WORK ORDER NO.</th>
                <th className="px-3 py-3 min-w-[120px]">WORK ORDER DATE</th>
                <th className="px-3 py-3 min-w-[150px]">ASSEMBLY PART CODE</th>
                <th className="px-3 py-3 min-w-[220px]">
                  <div className="flex items-center gap-1">
                    <span>ASSEMBLY PART NO.</span>
                    <span className="px-1 py-0.2 bg-[#F59E0B] text-white rounded text-[8.5px] font-bold">
                      -BR
                    </span>
                  </div>
                </th>
                <th className="px-3 py-3 text-right min-w-[80px]">PLAN QTY</th>
                <th className="px-3 py-3 min-w-[190px]">
                  <div className="flex items-center justify-between gap-2">
                    <span>PRODUCTION ACHIEVE QTY</span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded-full bg-[#10B981] text-white text-[9px] font-bold">
                        OK
                      </span>
                      <span className="px-1.5 py-0.2 rounded-full bg-[#EF4444] text-white text-[9px] font-bold">
                        NG
                      </span>
                    </div>
                  </div>
                </th>
                <th className="px-3 py-3 text-center min-w-[180px]">NEXT PROCESS</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#F2F2F7]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#86868B] text-xs">
                    No brazing batches match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isChecked = !!selectedRowIds[item.id];
                  const isAchieved100 = item.achievedPercent >= 100;

                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        "hover:bg-[#F9FAFB] transition-colors",
                        isChecked && "bg-[#F0F7FF]/50"
                      )}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRow(item.id)}
                          className="w-3.5 h-3.5 rounded border-[#D1D1D6] text-[#007AFF] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* S.No */}
                      <td className="px-2 py-3 text-center text-[#6E6E73] font-medium font-mono">
                        {item.sNo}
                      </td>

                      {/* Machine Name */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-[#E5E7EB] text-[#374151] border border-[#D1D5DB] text-[10.5px] font-mono font-medium shrink-0">
                            {item.machineCode}
                          </span>
                          <span className="font-medium text-[#1D1D1F]">
                            {item.machineName}
                          </span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-3 py-3 text-[#1D1D1F] font-medium" title={item.customerName}>
                        <span className="truncate block max-w-[180px]">
                          {item.customerShort}
                        </span>
                      </td>

                      {/* Work Order No */}
                      <td className="px-3 py-3">
                        <button
                          onClick={() => setSelectedWoDetail(item)}
                          className="text-[#007AFF] font-bold hover:underline cursor-pointer focus:outline-none"
                        >
                          {item.workOrderNo}
                        </button>
                      </td>

                      {/* Work Order Date */}
                      <td className="px-3 py-3 font-mono text-[#6E6E73] text-[11.5px]">
                        {item.workOrderDate}
                      </td>

                      {/* Assembly Part Code */}
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] font-mono text-[11px] font-semibold inline-block">
                          {item.assemblyPartCode}
                        </span>
                      </td>

                      {/* Assembly Part No */}
                      <td className="px-3 py-3" title={item.assemblyPartName}>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-[#1D1D1F] truncate max-w-[160px]">
                            {item.assemblyPartShort}
                          </span>
                          <span className="px-1 py-0.2 bg-[#F59E0B] text-white rounded text-[9px] font-bold shrink-0">
                            {item.partTag}
                          </span>
                        </div>
                      </td>

                      {/* Plan Qty */}
                      <td className="px-3 py-3 text-right font-mono font-bold text-[#1D1D1F]">
                        {item.planQty}
                      </td>

                      {/* Production Achieve Qty + OK/NG Inputs */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          {/* Progress bar + percentage */}
                          <div className="flex-1 min-w-[100px]">
                            <div className="flex items-baseline justify-end gap-1.5 mb-1 font-mono">
                              <span className="text-xs font-bold text-[#1D1D1F]">
                                {item.achievedQty}
                              </span>
                            </div>
                            <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-300",
                                  isAchieved100 ? "bg-[#10B981]" : "bg-[#F59E0B]"
                                )}
                                style={{ width: `${Math.min(100, item.achievedPercent)}%` }}
                              />
                            </div>
                            <div className="text-[10px] text-[#6E6E73] font-mono text-right mt-0.5">
                              {item.achievedPercent}%
                            </div>
                          </div>

                          {/* OK Input */}
                          <input
                            type="number"
                            value={item.okQty}
                            onChange={(e) =>
                              handleOkQtyChange(item.id, parseInt(e.target.value) || 0)
                            }
                            className="w-14 px-1 py-1 text-center font-mono font-bold text-xs rounded-md border border-[#10B981] bg-white text-[#1D1D1F] focus:ring-1 focus:ring-[#10B981] focus:outline-none"
                          />

                          {/* NG Input */}
                          <input
                            type="number"
                            value={item.ngQty}
                            onChange={(e) =>
                              handleNgQtyChange(item.id, parseInt(e.target.value) || 0)
                            }
                            className="w-14 px-1 py-1 text-center font-mono font-bold text-xs rounded-md border border-[#EF4444] bg-white text-[#DC2626] focus:ring-1 focus:ring-[#EF4444] focus:outline-none"
                          />
                        </div>
                      </td>

                      {/* Next Process Actions */}
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Checkbox button */}
                          <button
                            type="button"
                            onClick={() => {
                              showToast(`Batch ${item.workOrderNo} marked verified.`);
                            }}
                            className="w-7 h-7 rounded border border-[#10B981] text-[#10B981] bg-[#ECFDF5] hover:bg-[#D1FAE5] flex items-center justify-center transition-colors shadow-2xs shrink-0"
                            title="Confirm Brazing Quality"
                          >
                            <Check className="w-4 h-4" />
                          </button>

                          {/* Process Selector */}
                          <div className="relative">
                            <select
                              value={item.nextProcess}
                              onChange={(e) =>
                                handleNextProcessChange(item.id, e.target.value)
                              }
                              className="appearance-none pl-2 pr-5 py-1 bg-white border border-[#06B6D4]/40 text-[#0E7490] font-medium text-xs rounded-md focus:outline-none cursor-pointer"
                            >
                              <option value="Leak Test">Leak Test</option>
                              <option value="Ultrasonic QC">Ultrasonic QC</option>
                              <option value="Hydrostatic Testing">Hydrostatic</option>
                              <option value="Washing">Washing</option>
                              <option value="Final Packing">Final Packing</option>
                            </select>
                            <ChevronDown className="w-3 h-3 text-[#0E7490] absolute right-1.5 top-2 pointer-events-none" />
                          </div>

                          {/* Go Button */}
                          <button
                            type="button"
                            onClick={() => handleHandoff(item)}
                            className="px-2.5 py-1 bg-[#06B6D4] hover:bg-[#0891B2] text-white text-xs font-bold rounded-md flex items-center gap-1 transition-all shadow-xs shrink-0"
                          >
                            <span>Go</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Work Order Detail Drawer / Modal */}
      {selectedWoDetail && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E5EA] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF9500]" />
                <h3 className="text-base font-bold text-[#1D1D1F]">
                  Work Order Inspection: {selectedWoDetail.workOrderNo}
                </h3>
              </div>
              <button
                onClick={() => setSelectedWoDetail(null)}
                className="p-1 rounded-lg hover:bg-[#F5F5F7] text-[#86868B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-[#F8F9FA] p-3 rounded-xl border border-[#E5E5EA]">
                <div>
                  <span className="text-[#86868B] block">Customer:</span>
                  <span className="font-semibold text-[#1D1D1F]">
                    {selectedWoDetail.customerName}
                  </span>
                </div>
                <div>
                  <span className="text-[#86868B] block">Order Date:</span>
                  <span className="font-semibold text-[#1D1D1F]">
                    {selectedWoDetail.workOrderDate}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-[#86868B] block">Machine Assignment:</span>
                  <span className="font-semibold text-[#1D1D1F]">
                    {selectedWoDetail.machineCode} ({selectedWoDetail.machineName})
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-[#86868B] block">Assembly Part:</span>
                  <span className="font-semibold text-[#1D1D1F]">
                    {selectedWoDetail.assemblyPartCode}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-[#E5E5EA] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#86868B]">Plan Target Quantity:</span>
                  <span className="font-mono font-bold text-[#1D1D1F]">
                    {selectedWoDetail.planQty} units
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#86868B]">Achieved Quantity:</span>
                  <span className="font-mono font-bold text-[#10B981]">
                    {selectedWoDetail.achievedQty} units ({selectedWoDetail.achievedPercent}%)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#86868B]">OK Quantity Accepted:</span>
                  <span className="font-mono font-bold text-[#10B981]">
                    {selectedWoDetail.okQty} units
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#86868B]">Defects / NG:</span>
                  <span className="font-mono font-bold text-[#EF4444]">
                    {selectedWoDetail.ngQty} units
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#F2F2F7]">
                  <span className="text-[#86868B]">Next Handoff Process:</span>
                  <span className="font-semibold text-[#0EA5E9]">
                    {selectedWoDetail.nextProcess}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E5EA]">
              <button
                onClick={() => setSelectedWoDetail(null)}
                className="px-4 py-2 rounded-xl border border-[#E5E5EA] hover:bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleHandoff(selectedWoDetail);
                  setSelectedWoDetail(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#06B6D4] hover:bg-[#0891B2] text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Dispatch to {selectedWoDetail.nextProcess}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  ClipboardList,
  Search,
  Filter,
  RotateCcw,
  Plus,
  Eye,
  Edit2,
  GitFork,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  X,
  ExternalLink,
  ChevronRight,
  Database,
  Calendar,
  Building2,
  Package,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PremiumDropdown } from "@/components/ui/premium-dropdown";
import { PremiumNumberInput } from "@/components/ui/premium-number-input";
import {
  SoftgenWorkOrder,
  INITIAL_SOFTGEN_WORK_ORDERS,
} from "@/lib/work-orders-mock-data";
import { usePersistentState } from "@/lib/use-persistent-state";

export function WorkOrdersView() {
  // State (persisted across reloads and module navigation)
  const [workOrders, setWorkOrders] = usePersistentState<SoftgenWorkOrder[]>(
    "prodsync_softgen_work_orders",
    INITIAL_SOFTGEN_WORK_ORDERS
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");
  const [selectedWoId, setSelectedWoId] = useState<string>("wo-1036"); // Selected by default as in screenshot
  const [inspectDrawerWo, setInspectDrawerWo] =
    useState<SoftgenWorkOrder | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // New Work Order Form State
  const [newWoForm, setNewWoForm] = useState({
    woNumber: `WO-${1041 + workOrders.length}`,
    customer: "",
    poNumber: "",
    product: "",
    assemblyCode: "ASSY-NEW-100",
    ordered: 100,
    priority: "HIGH" as SoftgenWorkOrder["priority"],
    deliveryDate: "15/11/2026",
  });

  // Filtered dataset
  const filteredOrders = useMemo(() => {
    return workOrders.filter((wo) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        wo.woNumber.toLowerCase().includes(q) ||
        wo.poNumber.toLowerCase().includes(q) ||
        wo.customer.toLowerCase().includes(q) ||
        wo.product.toLowerCase().includes(q) ||
        wo.assemblyCode.toLowerCase().includes(q);

      // 2. Status Filter
      const matchStatus =
        statusFilter === "All Statuses" ||
        wo.status.toLowerCase() === statusFilter.toLowerCase();

      // 3. Priority Filter
      const matchPriority =
        priorityFilter === "All Priorities" ||
        wo.priority.toUpperCase() === priorityFilter.toUpperCase();

      return matchSearch && matchStatus && matchPriority;
    });
  }, [workOrders, searchQuery, statusFilter, priorityFilter]);

  // Pagination calculation
  const totalCount = filteredOrders.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  // Handle Reset
  const handleReset = () => {
    setSearchQuery("");
    setStatusFilter("All Statuses");
    setPriorityFilter("All Priorities");
    setCurrentPage(1);
  };

  // Handle Create Work Order
  const handleCreateWorkOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWoForm.customer || !newWoForm.product) return;

    const newOrder: SoftgenWorkOrder = {
      id: `wo-${Date.now()}`,
      woNumber: newWoForm.woNumber,
      customer: newWoForm.customer,
      poNumber: newWoForm.poNumber || `PO-${Date.now().toString().slice(-4)}`,
      poDate: new Date().toLocaleDateString("en-GB"),
      product: newWoForm.product,
      assemblyCode: newWoForm.assemblyCode,
      ordered: Number(newWoForm.ordered),
      scheduled: 0,
      produced: 0,
      pending: Number(newWoForm.ordered),
      priority: newWoForm.priority,
      status: "Pending",
      partsStatus: "amber",
      partsPercent: 70,
      deliveryDate: newWoForm.deliveryDate,
      source: "Manual Entry (SoftGen Synced)",
      softgenSyncDate: "Just now",
      components: [
        {
          code: `COMP-${newWoForm.woNumber}-1`,
          name: `${newWoForm.product} Header Pipe`,
          required: Number(newWoForm.ordered),
          available: Number(newWoForm.ordered) + 50,
          shortage: 0,
          operation: "CNC Rotary Draw Bending",
        },
      ],
    };

    setWorkOrders((prev) => [newOrder, ...prev]);
    setIsCreateModalOpen(false);
    setSelectedWoId(newOrder.id);

    // Cross-sync to machine scheduler queue in localStorage
    try {
      if (typeof window !== "undefined") {
        const storedSched = localStorage.getItem("prodsync_scheduler_work_orders");
        let schedList: any[] = storedSched ? JSON.parse(storedSched) : [];
        const newSchedItem = {
          id: newOrder.id,
          woNumber: newOrder.woNumber,
          customer: newOrder.customer,
          orderedQty: newOrder.ordered,
          unscheduledQty: newOrder.ordered,
          priority: newOrder.priority,
          product: newOrder.product,
          assembly: newOrder.product,
          assemblyCode: newOrder.assemblyCode,
          components: (newOrder.components || []).map((c, idx) => ({
            id: `${newOrder.id}-c${idx + 1}`,
            code: c.code,
            name: c.name,
            operation: c.operation,
            remainingQty: c.required,
            scheduledBalance: 0,
            unit: "pcs",
            stock: {
              required: c.required,
              available: c.available,
              shortage: c.shortage,
            },
            rawMaterials: [
              {
                code: `RM-${c.code}`,
                description: `${c.name} Stock Blank`,
                reqQty: c.required,
                availStock: c.available,
                shortage: c.shortage,
                status: c.shortage > 0 ? "SHORTAGE" : "OK",
              },
            ],
          })),
        };
        schedList = [newSchedItem, ...schedList];
        localStorage.setItem("prodsync_scheduler_work_orders", JSON.stringify(schedList));
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="apple-work-orders-page min-h-screen bg-[#F5F5F7] text-[#1D1D1F] pb-12">
      <Head>
        <title>Work Orders Management - PRODSYNC Enterprise</title>
        <meta
          name="description"
          content="SoftGen ERP Work Order Management, BOM inspection, and schedule integration"
        />
      </Head>

      {/* Top Breadcrumb & Live ERP Status Strip */}
      <div className="bg-[#FAFAFC] border-b border-[#E5E5EA] px-4 sm:px-8 py-2 flex items-center justify-between text-xs text-[#6E6E73]">
        <div className="flex items-center gap-2">
          <span>Enterprise Portal</span>
          <span>/</span>
          <span className="font-semibold text-[#1D1D1F]">Work Orders Management</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7] font-medium text-[11px] border border-[#BAE6FD]">
            <Database className="w-3 h-3" />
            <span>SoftGen ERP Synced: Live</span>
          </div>
          <span className="text-[11px] text-[#86868B] hidden sm:inline">
            Last Refreshed: Today at 09:15 AM
          </span>
        </div>
      </div>

      {/* Main Header */}
      <div className="px-4 sm:px-8 pt-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#007AFF] text-white flex items-center justify-center shadow-xs">
              <ClipboardList className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
              Work Orders Management
            </h1>
          </div>
          <p className="text-xs sm:text-[13px] text-[#6E6E73] mt-1 pl-10">
            Create, track, inspect assembly completeness, and manage split lineage
          </p>
        </div>

        {/* Action Button: Create Work Order */}
        <div className="flex items-center gap-2.5 self-start md:self-auto pl-10 md:pl-0">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-[#007AFF] hover:bg-[#0066D6] text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Work Order</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="px-4 sm:px-8 space-y-4">
        {/* Search & Filter Toolbar (Exact match with reference image) */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#E5E5EA] shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* 1. Search Box */}
          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 text-[#86868B] absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search WO No, PO No, Customer, Product..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs text-[#1D1D1F] bg-[#F5F5F7] border border-transparent focus:border-[#007AFF] focus:bg-white rounded-xl placeholder-[#86868B] outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-xs text-[#86868B] hover:text-[#1D1D1F] p-0.5"
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>

          {/* 2. Status Filter Dropdown */}
          <div className="w-full lg:w-48">
            <PremiumDropdown
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
              options={[
                "All Statuses",
                "Pending",
                "Scheduled",
                "In progress",
                "Completed",
                "Cancelled",
              ]}
              size="sm"
              buttonClassName="rounded-xl shadow-2xs"
            />
          </div>

          {/* 3. Priority Filter Dropdown */}
          <div className="w-full lg:w-44">
            <PremiumDropdown
              value={priorityFilter}
              onChange={(val) => {
                setPriorityFilter(val);
                setCurrentPage(1);
              }}
              options={["All Priorities", "URGENT", "HIGH", "MEDIUM", "LOW"]}
              size="sm"
              buttonClassName="rounded-xl shadow-2xs"
            />
          </div>

          {/* 4. Action Buttons (Filter & Reset) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              className="px-5 py-2 bg-[#007AFF] hover:bg-[#0066D6] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-2 bg-white hover:bg-[#F5F5F7] text-[#48484A] hover:text-[#1D1D1F] text-xs font-semibold rounded-xl border border-[#D1D1D6] shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl bg-white border border-[#E5E5EA] shadow-xs overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse min-w-[1200px]">
              {/* Header */}
              <thead>
                <tr className="bg-[#FAFAFC] border-b border-[#E5E5EA] text-[#6E6E73] text-[10px] font-bold uppercase tracking-wider select-none">
                  <th className="py-3 px-3.5 whitespace-nowrap">WO NO</th>
                  <th className="py-3 px-3.5 min-w-[200px]">CUSTOMER / PO</th>
                  <th className="py-3 px-3.5 min-w-[240px]">PRODUCT & ASSEMBLY</th>
                  <th className="py-3 px-3 text-right">ORDERED</th>
                  <th className="py-3 px-3 text-right">SCHEDULED</th>
                  <th className="py-3 px-3 text-right">PRODUCED</th>
                  <th className="py-3 px-3 text-right">PENDING</th>
                  <th className="py-3 px-3 text-center">PRIORITY</th>
                  <th className="py-3 px-3 text-center">STATUS</th>
                  <th className="py-3 px-3 text-center min-w-[110px]">
                    PARTS STATUS (T:1)
                  </th>
                  <th className="py-3 px-3.5 whitespace-nowrap text-center">
                    DELIVERY DATE
                  </th>
                  <th className="py-3 px-3.5 text-center">ACTIONS</th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-[#E5E5EA]/70">
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={12}
                      className="py-12 text-center text-[#86868B] text-xs"
                    >
                      <ClipboardList className="w-8 h-8 text-[#86868B]/40 mx-auto mb-2" />
                      <div>No work orders found matching your search and filter criteria.</div>
                      <button
                        onClick={handleReset}
                        className="mt-3 text-[#007AFF] font-medium text-xs hover:underline cursor-pointer"
                      >
                        Reset filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((wo) => {
                    const isSelected = selectedWoId === wo.id;

                    return (
                      <tr
                        key={wo.id}
                        onClick={() => setSelectedWoId(wo.id)}
                        className={cn(
                          "transition-colors cursor-pointer group",
                          isSelected
                            ? "bg-[#EFEFF1] font-medium"
                            : "hover:bg-[#F9F9FB]"
                        )}
                      >
                        {/* 1. WO NO */}
                        <td className="py-3 px-3.5 font-bold text-[#007AFF] hover:underline whitespace-nowrap">
                          {wo.woNumber}
                        </td>

                        {/* 2. CUSTOMER / PO */}
                        <td className="py-3 px-3.5">
                          <div className="font-semibold text-[#1D1D1F] text-[12px] leading-snug">
                            {wo.customer}
                          </div>
                          <div className="text-[10.5px] text-[#86868B] font-mono mt-0.5">
                            {wo.poNumber} • {wo.poDate}
                          </div>
                        </td>

                        {/* 3. PRODUCT & ASSEMBLY */}
                        <td className="py-3 px-3.5">
                          <div className="text-[#1D1D1F] text-[11.5px] font-medium leading-snug">
                            {wo.product}
                          </div>
                          <div className="text-[10px] text-[#007AFF] font-mono font-semibold mt-0.5">
                            #{wo.assemblyCode}
                          </div>
                        </td>

                        {/* 4. ORDERED */}
                        <td className="py-3 px-3 text-right font-bold text-[#1D1D1F] font-mono text-[12px]">
                          {wo.ordered.toLocaleString()}
                        </td>

                        {/* 5. SCHEDULED (Cyan / Light Blue) */}
                        <td className="py-3 px-3 text-right font-semibold text-[#0284C7] font-mono text-[12px]">
                          {wo.scheduled.toLocaleString()}
                        </td>

                        {/* 6. PRODUCED (Green) */}
                        <td className="py-3 px-3 text-right font-semibold text-[#16A34A] font-mono text-[12px]">
                          {wo.produced.toLocaleString()}
                        </td>

                        {/* 7. PENDING (Amber / Orange) */}
                        <td className="py-3 px-3 text-right font-semibold text-[#D97706] font-mono text-[12px]">
                          {wo.pending.toLocaleString()}
                        </td>

                        {/* 8. PRIORITY */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span
                            className={cn(
                              "inline-block px-2 py-0.5 rounded text-[9.5px] font-bold tracking-wider uppercase border",
                              wo.priority === "URGENT" &&
                                "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]",
                              wo.priority === "HIGH" &&
                                "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]",
                              wo.priority === "MEDIUM" &&
                                "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]",
                              wo.priority === "LOW" &&
                                "bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]"
                            )}
                          >
                            {wo.priority}
                          </span>
                        </td>

                        {/* 9. STATUS */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span
                            className={cn(
                              "inline-block px-2.5 py-0.5 rounded-md text-[10px] font-semibold text-white",
                              wo.status === "Completed" && "bg-[#15803D]",
                              wo.status === "Pending" && "bg-[#64748B]",
                              wo.status === "Scheduled" && "bg-[#0284C7]",
                              wo.status === "In progress" && "bg-[#2563EB]",
                              wo.status === "Cancelled" && "bg-[#DC2626]"
                            )}
                          >
                            {wo.status}
                          </span>
                        </td>

                        {/* 10. PARTS STATUS (T:1) */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center">
                            <div
                              className={cn(
                                "h-2 w-16 rounded-full transition-all",
                                wo.partsStatus === "green"
                                  ? "bg-[#15803D]"
                                  : "bg-[#F59E0B]"
                              )}
                              title={`Assembly Parts Readiness: ${wo.partsPercent}% complete`}
                            />
                          </div>
                        </td>

                        {/* 11. DELIVERY DATE */}
                        <td className="py-3 px-3.5 text-center font-mono text-[11px] text-[#48484A] whitespace-nowrap">
                          {wo.deliveryDate}
                        </td>

                        {/* 12. ACTIONS */}
                        <td className="py-3 px-3.5 text-center whitespace-nowrap">
                          <div
                            className="flex items-center justify-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Inspect Eye */}
                            <button
                              onClick={() => setInspectDrawerWo(wo)}
                              className="p-1 rounded-md text-[#007AFF] hover:bg-[#E8F2FE] border border-[#B2D7FD] transition-colors"
                              title="Inspect Assembly Completeness & SoftGen Data"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Action */}
                            <button
                              onClick={() => {
                                setSelectedWoId(wo.id);
                                setInspectDrawerWo(wo);
                              }}
                              className="p-1 rounded-md text-[#D97706] hover:bg-[#FEF3C7] border border-[#FDE68A] transition-colors"
                              title="Edit Work Order"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Split / Lineage Action */}
                            <button
                              onClick={() => setInspectDrawerWo(wo)}
                              className="p-1 rounded-md text-[#DC2626] hover:bg-[#FEE2E2] border border-[#FECACA] transition-colors"
                              title="Split Work Order & Lineage"
                            >
                              <GitFork className="w-3.5 h-3.5" />
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

          {/* Pagination Footer */}
          <div className="px-4 py-3 bg-[#FAFAFC] border-t border-[#E5E5EA] flex items-center justify-between text-xs text-[#6E6E73] select-none">
            <div>
              Showing <span className="font-semibold text-[#1D1D1F]">
                {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </span> to{" "}
              <span className="font-semibold text-[#1D1D1F]">
                {Math.min(currentPage * pageSize, totalCount)}
              </span> of{" "}
              <span className="font-semibold text-[#1D1D1F]">{totalCount}</span> results
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                  currentPage <= 1
                    ? "text-[#C7C7CC] cursor-not-allowed"
                    : "text-[#007AFF] hover:bg-[#E5E5EA]/70"
                )}
              >
                &laquo; Previous
              </button>

              <span className="px-2 py-0.5 rounded bg-white border border-[#E5E5EA] text-[#1D1D1F] font-mono text-[11px]">
                {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                  currentPage >= totalPages
                    ? "text-[#C7C7CC] cursor-not-allowed"
                    : "text-[#007AFF] hover:bg-[#E5E5EA]/70"
                )}
              >
                Next &raquo;
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* DETAIL / INSPECT ASSEMBLY COMPLETENESS DRAWER */}
      {inspectDrawerWo && (
        <>
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-xs z-50 transition-opacity"
            onClick={() => setInspectDrawerWo(null)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[540px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#E5E5EA] flex items-center justify-between bg-[#FAFAFC]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#007AFF] text-white flex items-center justify-center font-bold text-xs">
                  WO
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#1D1D1F]">
                      {inspectDrawerWo.woNumber} Details
                    </h3>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-[#E0F2FE] text-[#0284C7]">
                      {inspectDrawerWo.source}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#86868B]">
                    {inspectDrawerWo.customer}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectDrawerWo(null)}
                className="w-7 h-7 rounded-lg hover:bg-[#E5E5EA] text-[#86868B] hover:text-[#1D1D1F] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar text-xs">
              {/* SoftGen ERP Summary Card */}
              <div className="p-3.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#86868B] font-medium">SoftGen PO Number:</span>
                  <span className="font-mono font-bold text-[#1D1D1F]">
                    {inspectDrawerWo.poNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#86868B] font-medium">PO Order Date:</span>
                  <span className="font-mono text-[#1D1D1F]">
                    {inspectDrawerWo.poDate}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#86868B] font-medium">Promised Delivery Date:</span>
                  <span className="font-mono font-bold text-[#007AFF]">
                    {inspectDrawerWo.deliveryDate}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#86868B] font-medium">Assembly Code:</span>
                  <span className="font-mono font-semibold text-[#1D1D1F]">
                    {inspectDrawerWo.assemblyCode}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#86868B] font-medium">Last Synced from SoftGen:</span>
                  <span className="text-[#15803D] font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                    {inspectDrawerWo.softgenSyncDate}
                  </span>
                </div>
              </div>

              {/* Quantity Breakdown Grid */}
              <div>
                <div className="text-[11px] font-bold text-[#6E6E73] uppercase tracking-wider mb-2">
                  Production Fulfillment Status
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-white border border-[#E5E5EA]">
                    <div className="text-[10px] text-[#86868B]">Ordered</div>
                    <div className="text-base font-bold text-[#1D1D1F] font-mono mt-0.5">
                      {inspectDrawerWo.ordered}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E5E5EA]">
                    <div className="text-[10px] text-[#0284C7]">Scheduled</div>
                    <div className="text-base font-bold text-[#0284C7] font-mono mt-0.5">
                      {inspectDrawerWo.scheduled}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E5E5EA]">
                    <div className="text-[10px] text-[#16A34A]">Produced</div>
                    <div className="text-base font-bold text-[#16A34A] font-mono mt-0.5">
                      {inspectDrawerWo.produced}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E5E5EA]">
                    <div className="text-[10px] text-[#D97706]">Pending</div>
                    <div className="text-base font-bold text-[#D97706] font-mono mt-0.5">
                      {inspectDrawerWo.pending}
                    </div>
                  </div>
                </div>
              </div>

              {/* Assembly Completeness & Parts Readiness */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[#6E6E73] uppercase tracking-wider">
                    Assembly Completeness (BOM Level)
                  </span>
                  <span className="text-xs font-bold text-[#007AFF]">
                    {inspectDrawerWo.partsPercent}% Ready
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#E5E5EA] overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      inspectDrawerWo.partsStatus === "green"
                        ? "bg-[#15803D]"
                        : "bg-[#F59E0B]"
                    )}
                    style={{ width: `${inspectDrawerWo.partsPercent}%` }}
                  />
                </div>
              </div>

              {/* Child BOM Components */}
              <div>
                <div className="text-[11px] font-bold text-[#6E6E73] uppercase tracking-wider mb-2">
                  BOM Components & Stock Availability
                </div>
                <div className="space-y-2">
                  {(inspectDrawerWo.components || [
                    {
                      code: "CH-01",
                      name: "Main Header Pipe",
                      required: inspectDrawerWo.ordered,
                      available: inspectDrawerWo.ordered,
                      shortage: 0,
                      operation: "CNC Bending",
                    },
                    {
                      code: "EP-02",
                      name: "Copper End Plug",
                      required: inspectDrawerWo.ordered,
                      available: inspectDrawerWo.ordered - 10,
                      shortage: 10,
                      operation: "End Forming",
                    },
                  ]).map((comp, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white border border-[#E5E5EA] shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1D1D1F]">
                          {comp.code} - {comp.name}
                        </span>
                        {comp.shortage > 0 ? (
                          <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-[#FEF2F2] text-[#DC2626]">
                            Shortage: {comp.shortage}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-[#EAF8EF] text-[#1E823B]">
                            Stock Ready
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#6E6E73]">
                        <span>Operation: {comp.operation}</span>
                        <span>
                          Req: {comp.required} | Avail: {comp.available}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions in Drawer */}
              <div className="pt-2 flex items-center gap-2">
                <Link
                  href="/machine-scheduler"
                  className="flex-1 py-2.5 px-3 bg-[#007AFF] hover:bg-[#0066D6] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors text-center flex items-center justify-center gap-1.5"
                >
                  <span>Open in Machine Scheduler</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setInspectDrawerWo(null)}
                  className="py-2.5 px-4 bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#1D1D1F] text-xs font-semibold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CREATE WORK ORDER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-apple-modal overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-10">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#E5E5EA] flex items-center justify-between bg-[#FAFAFC]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#007AFF] text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1D1D1F]">
                    Create New Work Order
                  </h3>
                  <div className="text-[11px] text-[#86868B]">
                    Simulate SoftGen ERP work order ingestion
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#E5E5EA] text-[#86868B] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateWorkOrder} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#48484A] mb-1">
                    Work Order No
                  </label>
                  <input
                    type="text"
                    required
                    value={newWoForm.woNumber}
                    onChange={(e) =>
                      setNewWoForm({ ...newWoForm, woNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl text-xs font-mono font-bold text-[#007AFF] focus:bg-white focus:border-[#007AFF] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#48484A] mb-1">
                    Customer PO Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PO-GOD-2026-99"
                    value={newWoForm.poNumber}
                    onChange={(e) =>
                      setNewWoForm({ ...newWoForm, poNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl text-xs font-mono text-[#1D1D1F] focus:bg-white focus:border-[#007AFF] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#48484A] mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daikin Airconditioning India Pvt Ltd"
                  value={newWoForm.customer}
                  onChange={(e) =>
                    setNewWoForm({ ...newWoForm, customer: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl text-xs text-[#1D1D1F] focus:bg-white focus:border-[#007AFF] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#48484A] mb-1">
                  Product / Assembly Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HVAC 4-Branch Copper Header Manifold Assembly"
                  value={newWoForm.product}
                  onChange={(e) =>
                    setNewWoForm({ ...newWoForm, product: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl text-xs text-[#1D1D1F] focus:bg-white focus:border-[#007AFF] outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#48484A] mb-1">
                    Quantity
                  </label>
                  <PremiumNumberInput
                    min={1}
                    value={newWoForm.ordered}
                    onChange={(val) =>
                      setNewWoForm({ ...newWoForm, ordered: val })
                    }
                    size="md"
                    className="w-full h-[38px] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#48484A] mb-1">
                    Priority
                  </label>
                  <PremiumDropdown
                    value={newWoForm.priority}
                    onChange={(val) =>
                      setNewWoForm({
                        ...newWoForm,
                        priority: val as SoftgenWorkOrder["priority"],
                      })
                    }
                    options={["URGENT", "HIGH", "MEDIUM", "LOW"]}
                    size="md"
                    searchable={false}
                    buttonClassName="h-[38px] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#48484A] mb-1">
                    Delivery Date
                  </label>
                  <input
                    type="text"
                    required
                    value={newWoForm.deliveryDate}
                    onChange={(e) =>
                      setNewWoForm({ ...newWoForm, deliveryDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl text-xs font-mono text-[#1D1D1F] focus:bg-white focus:border-[#007AFF] outline-none"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-[#E5E5EA] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-white border border-[#D1D1D6] hover:bg-[#F5F5F7] text-[#1D1D1F] rounded-xl text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#007AFF] hover:bg-[#0066D6] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Work Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

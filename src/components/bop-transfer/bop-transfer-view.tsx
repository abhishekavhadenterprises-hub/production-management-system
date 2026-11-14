import React, { useState, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  Boxes,
  ArrowRightLeft,
  ArrowRight,
  Search,
  Filter,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Package,
  Layers,
  Flame,
  Factory,
  Database,
  ChevronDown,
  X,
  Check,
  Calendar,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PremiumDropdown } from "@/components/ui/premium-dropdown";
import { PremiumDatePicker } from "@/components/ui/premium-date-picker";
import { PremiumNumberInput } from "@/components/ui/premium-number-input";
import { PremiumCheckbox } from "@/components/ui/premium-switch";
import {
  BopWorkOrder,
  BopPartItem,
  INITIAL_BOP_WORK_ORDERS,
} from "@/lib/bop-transfer-mock-data";
import { usePersistentState } from "@/lib/use-persistent-state";

export function BopTransferView() {
  // Orders State (Persisted across reloads and route navigation)
  const [orders, setOrders] = usePersistentState<BopWorkOrder[]>(
    "prodsync_bop_work_orders",
    INITIAL_BOP_WORK_ORDERS
  );
  const [selectedWoId, setSelectedWoId] = useState<string>("bop-6"); // Row 6 (Hitachi) highlighted as in screenshot
  const [dateFilter, setDateFilter] = useState<string>("");
  const [customerFilter, setCustomerFilter] = useState<string>("All Customers");
  const [assemblyFilter, setAssemblyFilter] = useState<string>("All Assemblies");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal / Drawer for "Open BOM (Child Parts & BOP Parts)"
  const [activeBomWo, setActiveBomWo] = useState<BopWorkOrder | null>(null);
  const [selectedParts, setSelectedParts] = useState<Record<string, boolean>>({});
  const [partTransferQuantities, setPartTransferQuantities] = useState<Record<string, number>>({});

  // Toast / Confirmation notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [transfersTodayCount, setTransfersTodayCount] = usePersistentState<number>(
    "prodsync_bop_transfers_today",
    0
  );

  // Dynamic lists for filters
  const customerList = useMemo(() => {
    const list = Array.from(new Set(orders.map((o) => o.customerName)));
    return ["All Customers", ...list];
  }, [orders]);

  const assemblyList = useMemo(() => {
    const list = Array.from(new Set(orders.map((o) => o.assemblyPartName)));
    return ["All Assemblies", ...list];
  }, [orders]);

  // Total store inventory sum
  const totalStoreStock = useMemo(() => {
    return 11278; // Target value shown in reference screenshot
  }, []);

  // Filtered dataset
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.workOrderNo.toLowerCase().includes(q) ||
        o.customerCode.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.assemblyPartCode.toLowerCase().includes(q) ||
        o.assemblyPartName.toLowerCase().includes(q);

      const matchCustomer =
        customerFilter === "All Customers" || o.customerName === customerFilter;

      const matchAssembly =
        assemblyFilter === "All Assemblies" || o.assemblyPartName === assemblyFilter;

      const matchDate = !dateFilter || o.workOrderDate.includes(dateFilter);

      return matchSearch && matchCustomer && matchAssembly && matchDate;
    });
  }, [orders, searchQuery, customerFilter, assemblyFilter, dateFilter]);

  // Open BOM Modal
  const handleOpenBomModal = (wo: BopWorkOrder) => {
    setActiveBomWo(wo);
    // Initialize part checkboxes and transfer quantities
    const initCheck: Record<string, boolean> = {};
    const initQty: Record<string, number> = {};
    wo.parts.forEach((p) => {
      initCheck[p.id] = p.type === "BOP"; // BOP parts checked by default
      initQty[p.id] = p.requiredQty;
    });
    setSelectedParts(initCheck);
    setPartTransferQuantities(initQty);
  };

  // Toggle Part Checkbox in BOM Modal
  const handleTogglePart = (partId: string) => {
    setSelectedParts((prev) => ({
      ...prev,
      [partId]: !prev[partId],
    }));
  };

  // Change destination zone
  const handleZoneChange = (woId: string, zone: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === woId ? { ...o, destinationZone: zone } : o))
    );
  };

  // Execute Transfer Action
  const handleExecuteTransfer = (wo: BopWorkOrder) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === wo.id
          ? {
              ...o,
              transferred: true,
              transferredAt: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              transferredQty: o.planQty,
            }
          : o
      )
    );

    setTransfersTodayCount((c) => c + 1);
    setToastMessage(
      `Transferred BOP components for ${wo.workOrderNo} into ${wo.destinationZone} successfully!`
    );

    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Execute Transfer from inside BOM Modal
  const handleConfirmBomTransfer = () => {
    if (!activeBomWo) return;
    handleExecuteTransfer(activeBomWo);
    setActiveBomWo(null);
  };

  // Handle Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setCustomerFilter("All Customers");
    setAssemblyFilter("All Assemblies");
    setDateFilter("");
  };

  return (
    <div className="apple-bop-transfer-page min-h-screen bg-[#F5F5F7] text-[#1D1D1F] pb-12">
      <Head>
        <title>BOP Transfer - PRODSYNC Operations</title>
        <meta
          name="description"
          content="Transfer BOM-required bought-out parts (BOP) from Store Inventory into destination zones"
        />
      </Head>

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

      {/* Top Header Banner Strip */}
      <div className="px-4 sm:px-8 pt-5 pb-3 bg-white border-b border-[#E5E5EA]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left Title and Subtitle */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#16A34A] text-white flex items-center justify-center font-bold shadow-xs">
                <Boxes className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
                  BOP Transfer
                </h1>
                <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-bold tracking-wide uppercase bg-[#EAF8EF] text-[#16A34A] border border-[#C3EED3]">
                  STORE &rarr; PRODUCTION ZONES
                </span>
              </div>
            </div>
            <p className="text-xs text-[#6E6E73] mt-1 pl-10 leading-tight">
              Transfer BOM-required bought-out parts (BOP) from Store Inventory into destination zones (Brazing, Machine, Packing)
            </p>
          </div>

          {/* Right Action Links matching reference */}
          <div className="flex items-center gap-2 self-start md:self-auto pl-10 md:pl-0">
            <Link
              href="/production"
              className="px-3 py-1.5 rounded-lg border border-[#007AFF] text-[#007AFF] hover:bg-[#E8F2FE] text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Factory className="w-3.5 h-3.5" />
              <span>Live Production</span>
            </Link>

            <button
              onClick={() => {
                setToastMessage("Brazing Zone view routed");
                setTimeout(() => setToastMessage(null), 2000);
              }}
              className="px-3 py-1.5 rounded-lg border border-[#F59E0B] text-[#D97706] hover:bg-[#FEF3C7] text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Brazing Zone</span>
            </button>

            <button
              onClick={() => {
                setToastMessage("BOM Master Configuration loaded");
                setTimeout(() => setToastMessage(null), 2000);
              }}
              className="px-3 py-1.5 rounded-lg border border-[#D1D1D6] text-[#48484A] hover:bg-[#F5F5F7] text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              <span>BOM Master</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Workspace */}
      <main className="px-4 sm:px-8 py-4 space-y-4">
        {/* ROW 1: 4 KPI Metrics Tiles matching reference layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Tile 1: Total Active Work Orders */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5E5EA] shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                TOTAL ACTIVE WORK ORDERS
              </div>
              <div className="text-2xl font-bold text-[#1D1D1F] font-mono mt-0.5">
                36
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E8F2FE] text-[#007AFF]">
              Active Sets
            </span>
          </div>

          {/* Tile 2: Store BOP Inventory Stock */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5E5EA] shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                STORE BOP INVENTORY STOCK
              </div>
              <div className="text-2xl font-bold text-[#16A34A] font-mono mt-0.5">
                {totalStoreStock.toLocaleString()}
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EAF8EF] text-[#16A34A]">
              In Store
            </span>
          </div>

          {/* Tile 3: BOP Component Types */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5E5EA] shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                BOP COMPONENT TYPES
              </div>
              <div className="text-2xl font-bold text-[#0284C7] font-mono mt-0.5">
                20
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E0F2FE] text-[#0284C7]">
              System Parts
            </span>
          </div>

          {/* Tile 4: Transfers Logged Today */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5E5EA] shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                TRANSFERS LOGGED TODAY
              </div>
              <div className="text-2xl font-bold text-[#D97706] font-mono mt-0.5">
                {transfersTodayCount}
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FFFBEB] text-[#D97706]">
              Live Count
            </span>
          </div>
        </div>

        {/* ROW 2: Filter Controls matching reference layout */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-[#E5E5EA] shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            {/* Work Order Date */}
            <div className="md:col-span-2">
              <label className="block text-[10.5px] font-bold text-[#86868B] uppercase tracking-wider mb-1">
                Work Order Date
              </label>
              <PremiumDatePicker
                value={dateFilter}
                onChange={setDateFilter}
                placeholder="dd/mm/yyyy"
                size="sm"
                buttonClassName="rounded-xl shadow-2xs w-full bg-[#F5F5F7] border-transparent hover:border-[#E5E5EA]"
              />
            </div>

            {/* Customer / OEM Dropdown */}
            <div className="md:col-span-3">
              <label className="block text-[10.5px] font-bold text-[#86868B] uppercase tracking-wider mb-1">
                Customer / OEM
              </label>
              <PremiumDropdown
                value={customerFilter}
                onChange={setCustomerFilter}
                options={customerList}
                size="sm"
                buttonClassName="rounded-xl shadow-2xs w-full"
              />
            </div>

            {/* Assembly Part Dropdown */}
            <div className="md:col-span-3">
              <label className="block text-[10.5px] font-bold text-[#86868B] uppercase tracking-wider mb-1">
                Assembly Part
              </label>
              <PremiumDropdown
                value={assemblyFilter}
                onChange={setAssemblyFilter}
                options={assemblyList}
                size="sm"
                buttonClassName="rounded-xl shadow-2xs w-full"
              />
            </div>

            {/* Search Input */}
            <div className="md:col-span-3">
              <label className="block text-[10.5px] font-bold text-[#86868B] uppercase tracking-wider mb-1">
                Search
              </label>
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="WO No, Part Code, Customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#F5F5F7] border border-transparent focus:border-[#007AFF] focus:bg-white rounded-xl text-[#1D1D1F] outline-none transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 text-[10px] text-[#86868B] hover:text-[#1D1D1F] p-0.5"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Filter Funnel & Reset Button */}
            <div className="md:col-span-1 flex items-center gap-1.5">
              <button
                className="w-full py-1.5 px-3 bg-[#007AFF] hover:bg-[#0066D6] text-white rounded-xl text-xs font-semibold flex items-center justify-center transition-colors shadow-xs"
                title="Filter records"
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetFilters}
                className="p-1.5 rounded-xl border border-[#D1D1D6] hover:bg-[#F5F5F7] text-[#48484A] text-xs transition-colors shadow-2xs"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ROW 3: Table Section Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-[13px] font-bold text-[#1D1D1F] tracking-tight">
              BOP Transfer Schedule Board
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F2FE] text-[#007AFF]">
              {filteredOrders.length} Work Orders
            </span>
            <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#EAF8EF] text-[#16A34A] border border-[#C3EED3]">
              Control: Store, Machine / Child Part, Production Zone
            </span>
          </div>

          <div className="text-[11px] text-[#6E6E73] flex items-center gap-1">
            <span className="text-[#007AFF] font-bold">ℹ</span>
            <span>Select required BOP parts using the checkboxes, verify transfer quantity, choose destination zone, and click Transfer.</span>
          </div>
        </div>

        {/* ROW 4: Main Data Table */}
        <div className="rounded-2xl bg-white border border-[#E5E5EA] shadow-xs overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse min-w-[1350px]">
              {/* Header */}
              <thead>
                <tr className="bg-[#FAFAFC] border-b border-[#E5E5EA] text-[#6E6E73] text-[9.5px] font-bold uppercase tracking-wider select-none">
                  <th className="py-2.5 px-3 text-center w-12">S.NO.</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">CUSTOMER CODE</th>
                  <th className="py-2.5 px-3 min-w-[200px]">CUSTOMER NAME</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-center">WORK ORDER DATE</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-center">WORK ORDER NO.</th>
                  <th className="py-2.5 px-3 text-right">PLAN QTY</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">ASSEMBLY PART CODE.</th>
                  <th className="py-2.5 px-3 min-w-[220px]">ASSEMBLY PART NAME.</th>
                  <th className="py-2.5 px-2 text-center w-14 whitespace-nowrap">BOM-REVISION NO</th>
                  <th className="py-2.5 px-3 text-center min-w-[220px]">
                    <div>BOM (CHILD PARTS & BOP PARTS)</div>
                    <div className="text-[8px] text-[#86868B] font-mono normal-case mt-0.5">
                      CHECKBOX | REQUIRED | STORE STOCK
                    </div>
                  </th>
                  <th className="py-2.5 px-3 text-center min-w-[140px]">
                    TRANSFER ZONE
                  </th>
                  <th className="py-2.5 px-3 text-center w-24">ACTION</th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-[#E5E5EA]/70">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-[#86868B] text-xs">
                      No matching work orders found in BOP schedule board.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((wo) => {
                    const isSelected = selectedWoId === wo.id;

                    return (
                      <tr
                        key={wo.id}
                        onClick={() => setSelectedWoId(wo.id)}
                        className={cn(
                          "transition-colors cursor-pointer group",
                          isSelected ? "bg-[#EFEFF1]" : "hover:bg-[#F9F9FB]"
                        )}
                      >
                        {/* 1. S.NO. */}
                        <td className="py-2.5 px-3 text-center font-mono text-[11px] text-[#6E6E73]">
                          {wo.sNo}
                        </td>

                        {/* 2. CUSTOMER CODE */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#F5F5F7] border border-[#E5E5EA] text-[#48484A]">
                            {wo.customerCode}
                          </span>
                        </td>

                        {/* 3. CUSTOMER NAME */}
                        <td className="py-2.5 px-3 font-semibold text-[#1D1D1F] text-[11.5px]">
                          {wo.customerName}
                        </td>

                        {/* 4. WORK ORDER DATE */}
                        <td className="py-2.5 px-3 text-center font-mono text-[11px] text-[#6E6E73] whitespace-nowrap">
                          {wo.workOrderDate}
                        </td>

                        {/* 5. WORK ORDER NO. */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className="font-bold text-[#007AFF] hover:underline cursor-pointer text-[12px] font-mono">
                            {wo.workOrderNo}
                          </span>
                        </td>

                        {/* 6. PLAN QTY */}
                        <td className="py-2.5 px-3 text-right font-bold text-[#1D1D1F] font-mono text-[12px]">
                          {wo.planQty}
                        </td>

                        {/* 7. ASSEMBLY PART CODE */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10.5px] font-mono font-bold bg-[#E8F2FE] text-[#007AFF] border border-[#B2D7FD]">
                            {wo.assemblyPartCode}
                          </span>
                        </td>

                        {/* 8. ASSEMBLY PART NAME */}
                        <td className="py-2.5 px-3 text-[#1D1D1F] font-medium text-[11.5px]">
                          {wo.assemblyPartName}
                        </td>

                        {/* 9. BOM REVISION NO */}
                        <td className="py-2.5 px-2 text-center">
                          <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-[#F2F2F7] border border-[#D1D1D6] text-[#48484A]">
                            {wo.bomRevision}
                          </span>
                        </td>

                        {/* 10. BOM (CHILD PARTS & BOP PARTS) BUTTON */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenBomModal(wo);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] text-[10.5px] font-semibold transition-colors flex items-center justify-center gap-1.5 mx-auto shadow-2xs"
                          >
                            <AlertTriangle className="w-3 h-3 text-[#D97706]" />
                            <span>
                              Open BOM | {wo.childPartsCount} Child • {wo.bopPartsCount} BOP
                            </span>
                            <ChevronDown className="w-3 h-3 text-[#1D4ED8]" />
                          </button>
                        </td>

                        {/* 11. TRANSFER ZONE DESTINATION DROPDOWN */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="w-36 mx-auto"
                          >
                            <PremiumDropdown
                              value={wo.destinationZone}
                              onChange={(val) => handleZoneChange(wo.id, val)}
                              options={[
                                "Virtual Box 1",
                                "Virtual Box 2",
                                "Virtual Box 3",
                                "Brazing Zone",
                                "CNC Machine Cell",
                                "Packing Line",
                              ]}
                              size="sm"
                              searchable={false}
                              buttonClassName="rounded-lg shadow-2xs font-semibold text-[10.5px] py-1 px-2 border-[#D1D1D6]"
                            />
                          </div>
                        </td>

                        {/* 12. ACTION: SOLID GREEN TRANSFER BUTTON */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {wo.transferred ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#16A34A] bg-[#EAF8EF] border border-[#C3EED3] px-2 py-0.5 rounded-lg">
                              <Check className="w-3 h-3" />
                              <span>Done ({wo.transferredAt})</span>
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExecuteTransfer(wo);
                              }}
                              className="px-3.5 py-1 bg-[#15803D] hover:bg-[#166534] text-white text-[11px] font-bold rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1 mx-auto active:scale-95 cursor-pointer"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              <span>Transfer</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* INTERACTIVE "OPEN BOM" MODAL */}
      {activeBomWo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveBomWo(null)}
          />

          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-apple-modal overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-10 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#E5E5EA] flex items-center justify-between bg-[#FAFAFC]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#007AFF] text-white flex items-center justify-center font-bold text-xs">
                  BOM
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#1D1D1F]">
                      BOM Components & Transfer Verification
                    </h3>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-[#E8F2FE] text-[#007AFF]">
                      {activeBomWo.workOrderNo}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6E6E73]">
                    {activeBomWo.customerName} • {activeBomWo.assemblyPartName}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveBomWo(null)}
                className="p-1 rounded-lg hover:bg-[#E5E5EA] text-[#86868B] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar text-xs">
              <div className="p-3 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-between">
                <div>
                  <span className="text-[#86868B]">Target Destination Zone:</span>{" "}
                  <strong className="text-[#007AFF]">
                    {activeBomWo.destinationZone}
                  </strong>
                </div>
                <div>
                  <span className="text-[#86868B]">Order Plan Qty:</span>{" "}
                  <strong className="font-mono text-[#1D1D1F]">
                    {activeBomWo.planQty} sets
                  </strong>
                </div>
              </div>

              {/* Parts Table */}
              <div className="border border-[#E5E5EA] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAFC] border-b border-[#E5E5EA] text-[#6E6E73] text-[10px] font-bold uppercase">
                    <tr>
                      <th className="py-2 px-3 w-10 text-center">SELECT</th>
                      <th className="py-2 px-3">PART CODE & NAME</th>
                      <th className="py-2 px-2 text-center">TYPE</th>
                      <th className="py-2 px-3 text-right">BOM REQ</th>
                      <th className="py-2 px-3 text-right">STORE STOCK</th>
                      <th className="py-2 px-3 text-center">TRANSFER QTY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5EA]">
                    {activeBomWo.parts.map((part) => {
                      const isChecked = selectedParts[part.id] ?? false;
                      const hasShortage = part.requiredQty > part.storeStock;

                      return (
                        <tr
                          key={part.id}
                          className={cn(
                            "hover:bg-[#F9F9FB] transition-colors",
                            isChecked && "bg-[#F0FDF4]/50"
                          )}
                        >
                          <td className="py-2.5 px-3 text-center">
                            <PremiumCheckbox
                              checked={isChecked}
                              onChange={() => handleTogglePart(part.id)}
                              color="green"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-mono font-bold text-[#1D1D1F]">
                              {part.partCode}
                            </div>
                            <div className="text-[11px] text-[#6E6E73]">
                              {part.partName}
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span
                              className={cn(
                                "px-1.5 py-0.5 rounded text-[9.5px] font-bold",
                                part.type === "BOP"
                                  ? "bg-[#FEF3C7] text-[#D97706]"
                                  : "bg-[#E0F2FE] text-[#0284C7]"
                              )}
                            >
                              {part.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#1D1D1F]">
                            {part.requiredQty} {part.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            <span
                              className={cn(
                                "font-semibold",
                                hasShortage ? "text-[#DC2626]" : "text-[#16A34A]"
                              )}
                            >
                              {part.storeStock} {part.unit}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <PremiumNumberInput
                              min={0}
                              disabled={!isChecked}
                              value={partTransferQuantities[part.id] || 0}
                              onChange={(val) =>
                                setPartTransferQuantities({
                                  ...partTransferQuantities,
                                  [part.id]: val,
                                })
                              }
                              size="sm"
                              className="w-24 mx-auto"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FAFAFC] border-t border-[#E5E5EA] flex items-center justify-between">
              <span className="text-[11px] text-[#6E6E73]">
                Total checked items will be deducted from Store Inventory and logged.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveBomWo(null)}
                  className="px-4 py-2 bg-white border border-[#D1D1D6] hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBomTransfer}
                  className="px-5 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Execute BOP Transfer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

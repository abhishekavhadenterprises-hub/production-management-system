import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Layers,
  LayoutGrid,
  List,
  Search,
  PlusCircle,
  ClipboardList,
  GitFork,
  Scissors,
  CalendarClock,
  Factory,
  ClipboardCheck,
  Trophy,
  Package,
  Boxes,
  Flame,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  X,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface TransactionFormItem {
  id: string;
  title: string;
  category:
    | "Work Orders & Planning"
    | "Shop Floor & Machine Operations"
    | "Quality Audits & Setup Inspections"
    | "Inventory & Stock Movements";
  badge: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  description: string;
  href?: string;
  isModalAction?: boolean;
  modalType?: "create-wo" | "audit-entry" | "mp-ranking";
}

export const TRANSACTION_FORMS: TransactionFormItem[] = [
  // 1. WORK ORDERS & PLANNING
  {
    id: "create-work-order",
    title: "Create New Work Order",
    category: "Work Orders & Planning",
    badge: "New Order",
    icon: PlusCircle,
    iconColor: "text-[#155EEF]",
    iconBg: "bg-[#EFF4FF]",
    description:
      "Create and issue a new customer work order with target assemblies, parts, delivery dates, and priorities.",
    isModalAction: true,
    modalType: "create-wo",
  },
  {
    id: "work-order-management",
    title: "Work Order Management",
    category: "Work Orders & Planning",
    badge: "All Orders",
    icon: ClipboardList,
    iconColor: "text-[#0284C7]",
    iconBg: "bg-[#E0F2FE]",
    description:
      "View, filter, edit, schedule, and track all active and completed customer work orders.",
    href: "/work-orders",
  },
  {
    id: "work-order-assignment",
    title: "Work Order Assignment",
    category: "Work Orders & Planning",
    badge: "To Plant",
    icon: GitFork,
    iconColor: "text-[#7C3AED]",
    iconBg: "bg-[#F5F3FF]",
    description:
      "Multi-stage component and BOP allocation across 5 plant zones (Machine, Brazing, Leak Testing, Packing, FG).",
    href: "/work-order-assignment",
  },
  {
    id: "work-order-split-cancel",
    title: "Work Order Split & Cancel",
    category: "Work Orders & Planning",
    badge: "Split / Cancel",
    icon: Scissors,
    iconColor: "text-[#DC2626]",
    iconBg: "bg-[#FEF2F2]",
    description:
      "Split running pending work orders on partial achievement, or cancel schedules with master reasons.",
    href: "/split-cancel-zone",
  },

  // 2. SHOP FLOOR & MACHINE OPERATIONS
  {
    id: "live-scheduler-dispatch",
    title: "Live Scheduler & Dispatch",
    category: "Shop Floor & Machine Operations",
    badge: "Live Scheduler",
    icon: CalendarClock,
    iconColor: "text-[#0891B2]",
    iconBg: "bg-[#ECFEFF]",
    description:
      "Assign parts to machine shifts, drag-and-drop sequencing, and live production monitoring.",
    href: "/machine-scheduler",
  },
  {
    id: "production-tracking-hub",
    title: "Production Tracking Hub",
    category: "Shop Floor & Machine Operations",
    badge: "Live Production",
    icon: Factory,
    iconColor: "text-[#16A34A]",
    iconBg: "bg-[#F0FDF4]",
    description:
      "Monitor live production lines, record parts output, and forward items across stages.",
    href: "/production",
  },
  {
    id: "brazing-operations",
    title: "Brazing Operations Hub",
    category: "Shop Floor & Machine Operations",
    badge: "Flame Process",
    icon: Flame,
    iconColor: "text-[#EA580C]",
    iconBg: "bg-[#FFF7ED]",
    description:
      "Continuous induction brazing carousel tracking, torch stations, operator defect logs, and flux staging.",
    href: "/brazing",
  },

  // 3. QUALITY AUDITS & SETUP INSPECTIONS
  {
    id: "machine-setup-audit-entry",
    title: "Machine Setup Audit Entry",
    category: "Quality Audits & Setup Inspections",
    badge: "Audit Entry",
    icon: ClipboardCheck,
    iconColor: "text-[#D97706]",
    iconBg: "bg-[#FEF3C7]",
    description:
      "Record 5S audit, tool alignment inspection, safety checks, and operator setup grading.",
    isModalAction: true,
    modalType: "audit-entry",
  },
  {
    id: "machine-audit-mp-ranking",
    title: "Machine Audit & MP Ranking",
    category: "Quality Audits & Setup Inspections",
    badge: "Rankings",
    icon: Trophy,
    iconColor: "text-[#9333EA]",
    iconBg: "bg-[#FAF5FF]",
    description:
      "Audit scoreboards, operator performance rankings, and monthly setup quality scores.",
    isModalAction: true,
    modalType: "mp-ranking",
  },

  // 4. INVENTORY & STOCK MOVEMENTS
  {
    id: "inventory-stock-register",
    title: "Inventory & Stock Register",
    category: "Inventory & Stock Movements",
    badge: "Stock Register",
    icon: Package,
    iconColor: "text-[#0D9488]",
    iconBg: "bg-[#F0FDFA]",
    description:
      "Monitor raw materials, BOM component stocks, shortage alerts, and reorder levels.",
    href: "/masters/inventory-stock",
  },
  {
    id: "bop-store-transfer",
    title: "BOP Store Transfer",
    category: "Inventory & Stock Movements",
    badge: "Store Transfer",
    icon: Boxes,
    iconColor: "text-[#15803D]",
    iconBg: "bg-[#DCFCE7]",
    description:
      "Transfer bought-out parts (valves, copper driers, brazing rings) from Store to Virtual Box 1.",
    href: "/bop-transfer",
  },
];

export function TransactionFormsHubView() {
  const router = useRouter();

  // Search, Category, and View Mode state (Grid / List)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isCreateWoModalOpen, setIsCreateWoModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);

  // Create Work Order Form State
  const [newWo, setNewWo] = useState({
    woNumber: `WO-${Math.floor(1040 + Math.random() * 20)}`,
    orderDate: "2026-11-14",
    customer: "Carrier Air-Conditioning & Refrigeration Ltd",
    poNumber: "PO-CAR-2026-8839",
    product: "Refrigeration Liquid Tube Assembly Unit",
    assemblyBom: "ASSY-CAR-1003",
    orderedQty: 100,
    priority: "High",
    deliveryDate: "2026-11-21",
    remarks: "Standard production queue dispatch. Verify bending die #2.",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const categories = useMemo(() => {
    return [
      "All",
      "Work Orders & Planning",
      "Shop Floor & Machine Operations",
      "Quality Audits & Setup Inspections",
      "Inventory & Stock Movements",
    ];
  }, []);

  const filteredForms = useMemo(() => {
    return TRANSACTION_FORMS.filter((form) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        form.title.toLowerCase().includes(q) ||
        form.description.toLowerCase().includes(q) ||
        form.badge.toLowerCase().includes(q) ||
        form.category.toLowerCase().includes(q);

      const matchCategory =
        selectedCategory === "All" || form.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleFormAction = (form: TransactionFormItem) => {
    if (form.isModalAction) {
      if (form.modalType === "create-wo") {
        setIsCreateWoModalOpen(true);
      } else if (form.modalType === "audit-entry") {
        setIsAuditModalOpen(true);
      } else if (form.modalType === "mp-ranking") {
        setIsRankingModalOpen(true);
      }
    } else if (form.href) {
      router.push(form.href);
    }
  };

  const handleCreateWoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreateWoModalOpen(false);
    showToast(`Work Order ${newWo.woNumber} created & placed in production queue!`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#101828] pb-16 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#12B76A] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
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

      {/* Main Top Header matching Master Data Hub styling */}
      <div className="px-6 sm:px-10 pt-7 pb-6 bg-white border-b border-[#EAECF0]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#155EEF] uppercase tracking-wider">
                Dashboard Zone / Transaction Forms
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#101828] tracking-tight mt-1">
              ERP Transaction Forms Hub
            </h1>
            <p className="text-sm text-[#475467] font-normal mt-1 leading-relaxed">
              Central directory for all operational entry forms, shop-floor logs, quality audits, and stock movement transactions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateWoModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#155EEF] hover:bg-[#175CD3] text-white text-xs sm:text-[13px] font-semibold transition-all flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Create New Work Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-6 space-y-6">
        {/* Search, Filter & View Mode Controls Bar */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#EAECF0] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#86868B] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Quick search any ERP transaction form (e.g. Work Order, Assignment, Audit, Stock)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#F5F5F7] border border-transparent rounded-xl text-xs font-medium placeholder-[#86868B] focus:bg-white focus:border-[#155EEF] focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Controls: Category Chips + View Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer",
                    selectedCategory === cat
                      ? "bg-[#155EEF] text-white shadow-xs"
                      : "bg-[#F8F9FC] text-[#475467] hover:bg-[#F2F4F7]"
                  )}
                >
                  {cat === "All" ? "All Forms" : cat}
                </button>
              ))}
            </div>

            {/* List vs Grid View Toggle Switcher */}
            <div className="flex items-center p-1 bg-[#F2F4F7] rounded-xl border border-[#EAECF0] shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                  viewMode === "grid"
                    ? "bg-white text-[#155EEF] shadow-xs"
                    : "text-[#667085] hover:text-[#101828]"
                )}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="text-xs">Grid</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                  viewMode === "list"
                    ? "bg-white text-[#155EEF] shadow-xs"
                    : "text-[#667085] hover:text-[#101828]"
                )}
                title="List View"
              >
                <List className="w-4 h-4" />
                <span className="text-xs">List</span>
              </button>
            </div>
          </div>
        </div>

        {/* --- GRID VIEW --- */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => {
              const Icon = form.icon;

              return (
                <div
                  key={form.id}
                  onClick={() => handleFormAction(form)}
                  className="bg-white rounded-2xl border border-[#EAECF0] p-6 shadow-xs hover:shadow-md hover:border-[#155EEF]/40 transition-all flex flex-col justify-between group cursor-pointer relative"
                >
                  <div>
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs",
                          form.iconBg
                        )}
                      >
                        <Icon className={cn("w-5 h-5", form.iconColor)} />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]">
                          {form.badge}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1 mb-2.5">
                      <h3 className="text-base font-semibold text-[#101828] group-hover:text-[#155EEF] transition-colors">
                        {form.title}
                      </h3>
                      <p className="text-[13px] text-[#475467] leading-relaxed line-clamp-2 mt-1">
                        {form.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Row: Open Form Link matching Master UI */}
                  <div className="pt-4 mt-2 flex items-center justify-between border-t border-[#F2F4F7]">
                    <span className="inline-flex items-center text-[13px] font-semibold text-[#155EEF] group-hover:text-[#175CD3] transition-colors">
                      <span>Open Form</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                    <span className="text-[11px] text-[#667085] font-medium">
                      {form.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --- LIST VIEW --- */}
        {viewMode === "list" && (
          <div className="bg-white rounded-2xl border border-[#EAECF0] shadow-xs overflow-hidden">
            <div className="divide-y divide-[#EAECF0]">
              {filteredForms.map((form) => {
                const Icon = form.icon;

                return (
                  <div
                    key={form.id}
                    onClick={() => handleFormAction(form)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8F9FC] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105",
                          form.iconBg
                        )}
                      >
                        <Icon className={cn("w-5 h-5", form.iconColor)} />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-semibold text-[#101828] group-hover:text-[#155EEF] transition-colors">
                            {form.title}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]">
                            {form.badge}
                          </span>
                          <span className="text-[11px] font-medium text-[#667085]">
                            &bull; {form.category}
                          </span>
                        </div>
                        <p className="text-xs text-[#475467] leading-relaxed max-w-2xl">
                          {form.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFormAction(form);
                        }}
                        className="px-3.5 py-1.5 rounded-xl border border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB] hover:border-[#155EEF] hover:text-[#155EEF] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                      >
                        <span>Open Form</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredForms.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#EAECF0] p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] text-[#86868B] mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#1D1D1F]">
              No Transaction Forms Found
            </h3>
            <p className="text-xs text-[#6E6E73] max-w-sm mx-auto">
              No ERP transaction form matches &quot;{searchQuery}&quot;. Clear your search or change the category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#155EEF] text-white text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* --- MODAL 1: Create New Work Order (Consistent with Apple / PRODSYNC Design) --- */}
      {isCreateWoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#EAECF0] space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EFF4FF] text-[#155EEF] flex items-center justify-center shadow-2xs">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#101828]">
                    Create New Work Order
                  </h3>
                  <p className="text-xs text-[#475467]">
                    Issue and place a new manufacturing work order into active queue
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateWoModalOpen(false)}
                className="text-[#86868B] hover:text-[#101828] p-1 rounded-lg hover:bg-[#F2F4F7] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateWoSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                    WORK ORDER NUMBER *
                  </label>
                  <input
                    type="text"
                    required
                    value={newWo.woNumber}
                    onChange={(e) => setNewWo({ ...newWo, woNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FC] border border-[#EAECF0] rounded-xl text-xs font-mono font-bold text-[#155EEF] focus:bg-white focus:border-[#155EEF] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                    ORDER DATE *
                  </label>
                  <input
                    type="date"
                    required
                    value={newWo.orderDate}
                    onChange={(e) => setNewWo({ ...newWo, orderDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FC] border border-[#EAECF0] rounded-xl text-xs font-medium text-[#101828] focus:bg-white focus:border-[#155EEF] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                    CUSTOMER *
                  </label>
                  <select
                    value={newWo.customer}
                    onChange={(e) => setNewWo({ ...newWo, customer: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FC] border border-[#EAECF0] rounded-xl text-xs font-medium text-[#101828] focus:bg-white focus:border-[#155EEF] outline-none cursor-pointer"
                  >
                    <option value="Carrier Air-Conditioning & Refrigeration Ltd">
                      Carrier Air-Conditioning & Refrigeration Ltd
                    </option>
                    <option value="Godrej Appliances (Godrej & Boyce Mfg Co)">
                      Godrej Appliances (Godrej & Boyce Mfg Co)
                    </option>
                    <option value="Daikin Airconditioning India Pvt Ltd">
                      Daikin Airconditioning India Pvt Ltd
                    </option>
                    <option value="Blue Star Ltd Commercial Systems">
                      Blue Star Ltd Commercial Systems
                    </option>
                    <option value="Voltas Limited - Air Conditioning Plant">
                      Voltas Limited - Air Conditioning Plant
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                    CUSTOMER PO NUMBER *
                  </label>
                  <input
                    type="text"
                    required
                    value={newWo.poNumber}
                    onChange={(e) => setNewWo({ ...newWo, poNumber: e.target.value })}
                    placeholder="e.g. PO-8839"
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FC] border border-[#EAECF0] rounded-xl text-xs font-mono text-[#101828] focus:bg-white focus:border-[#155EEF] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                    PRODUCT / ASSEMBLY NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={newWo.product}
                    onChange={(e) => setNewWo({ ...newWo, product: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FC] border border-[#EAECF0] rounded-xl text-xs font-medium text-[#101828] focus:bg-white focus:border-[#155EEF] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                    ASSEMBLY BOM SPECIFICATION *
                  </label>
                  <select
                    value={newWo.assemblyBom}
                    onChange={(e) => setNewWo({ ...newWo, assemblyBom: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FC] border border-[#EAECF0] rounded-xl text-xs font-medium text-[#101828] focus:bg-white focus:border-[#155EEF] outline-none cursor-pointer"
                  >
                    <option value="ASSY-CAR-1003">
                      ASSY-CAR-1003 (Refrigeration Liquid Tube Assembly Unit)
                    </option>
                    <option value="ASSY-CAR-1010">
                      ASSY-CAR-1010 (Evaporator Distributor Loop Assembly)
                    </option>
                    <option value="ASSY-GOD-1007">
                      ASSY-GOD-1007 (Accumulator Inlet Suction Tree Assembly)
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                    ORDERED QUANTITY (NOS) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newWo.orderedQty}
                    onChange={(e) =>
                      setNewWo({ ...newWo, orderedQty: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FC] border border-[#EAECF0] rounded-xl text-xs font-mono font-bold text-[#101828] focus:bg-white focus:border-[#155EEF] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                    PRIORITY *
                  </label>
                  <select
                    value={newWo.priority}
                    onChange={(e) => setNewWo({ ...newWo, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FC] border border-[#EAECF0] rounded-xl text-xs font-semibold text-[#101828] focus:bg-white focus:border-[#155EEF] outline-none cursor-pointer"
                  >
                    <option value="Urgent">🔴 Urgent</option>
                    <option value="High">🟠 High</option>
                    <option value="Medium">🔵 Medium</option>
                    <option value="Low">⚪ Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                    REQUIRED DELIVERY DATE *
                  </label>
                  <input
                    type="date"
                    required
                    value={newWo.deliveryDate}
                    onChange={(e) => setNewWo({ ...newWo, deliveryDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FC] border border-[#EAECF0] rounded-xl text-xs font-medium text-[#101828] focus:bg-white focus:border-[#155EEF] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                  PRODUCTION REMARKS / SPECIAL NOTES
                </label>
                <textarea
                  rows={2}
                  value={newWo.remarks}
                  onChange={(e) => setNewWo({ ...newWo, remarks: e.target.value })}
                  placeholder="Special engineering instructions, tolerance requirements, customer notes..."
                  className="w-full px-3.5 py-2 bg-[#F8F9FC] border border-[#EAECF0] rounded-xl text-xs text-[#101828] focus:bg-white focus:border-[#155EEF] outline-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-[#EAECF0] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateWoModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#155EEF] hover:bg-[#175CD3] text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save &amp; Place In Queue</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: Machine Setup Audit Entry --- */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#EAECF0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#101828]">
                    Machine Setup Audit Entry
                  </h3>
                  <p className="text-xs text-[#475467]">
                    Record 5S inspection, tool alignment &amp; safety readiness
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="text-[#86868B] hover:text-[#101828] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                  TARGET MACHINE CELL
                </label>
                <select className="w-full px-3 py-2 bg-[#F8F9FC] border border-[#EAECF0] rounded-xl text-xs font-medium">
                  <option>CNC Tube Bender #01 (Crippa Linear 42)</option>
                  <option>CNC Tube Bender #02 (SOCO SB-52X)</option>
                  <option>Rotary Hydraulic Ram Former #01</option>
                  <option>Continuous Induction Brazing Carousel #01</option>
                </select>
              </div>

              <div className="space-y-2 border border-[#EAECF0] p-3 rounded-xl bg-[#F8F9FC]">
                <div className="font-semibold text-[#101828] text-[11px]">
                  5S &amp; Safety Inspection Checklist:
                </div>
                {[
                  "Mandrel & Wiper Die lubrication and alignment verified",
                  "Hydraulic clamping pressure calibrated to 85 Bar",
                  "Emergency shut-off switches verified functional",
                  "First-off component bend angle gauge verified (±0.2°)",
                ].map((item, idx) => (
                  <label key={idx} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-[#155EEF]" />
                    <span className="text-[#344054]">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#EAECF0] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#D0D5DD] bg-white text-[#344054] text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAuditModalOpen(false);
                  showToast("Machine setup audit recorded successfully!");
                }}
                className="px-4 py-2 rounded-xl bg-[#155EEF] text-white text-xs font-semibold"
              >
                Submit Audit Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: Machine Audit & MP Ranking --- */}
      {isRankingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#EAECF0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FAF5FF] text-[#9333EA] flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#101828]">
                    Machine Audit &amp; MP Rankings
                  </h3>
                  <p className="text-xs text-[#475467]">
                    Operator performance rankings &amp; monthly audit scores
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRankingModalOpen(false)}
                className="text-[#86868B] hover:text-[#101828] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="border border-[#EAECF0] rounded-xl divide-y divide-[#EAECF0] overflow-hidden">
                {[
                  { rank: 1, name: "Rajesh Kumar", score: "98.4%", badge: "Top Operator" },
                  { rank: 2, name: "Amit Sharma", score: "96.2%", badge: "Excellent" },
                  { rank: 3, name: "Sunil Verma", score: "94.8%", badge: "Certified" },
                  { rank: 4, name: "Vikas Patel", score: "91.5%", badge: "Standard" },
                ].map((item) => (
                  <div key={item.rank} className="p-3 flex items-center justify-between bg-white hover:bg-[#F8F9FC]">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#EFF4FF] text-[#155EEF] font-bold text-xs flex items-center justify-center">
                        #{item.rank}
                      </span>
                      <div>
                        <div className="font-semibold text-[#101828]">{item.name}</div>
                        <div className="text-[11px] text-[#667085]">Audit Quality Score: {item.score}</div>
                      </div>
                    </div>
                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF3] text-[#027A48] border border-[#ABEFC6]">
                      {item.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#EAECF0] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsRankingModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#155EEF] text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

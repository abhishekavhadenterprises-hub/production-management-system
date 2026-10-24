import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Filter,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  Clock,
  ArrowRight,
  PanelLeftClose,
  PanelLeftOpen,
  GitFork,
  XCircle,
  Package,
  Wrench,
  AlertTriangle,
} from "lucide-react";
import { WorkOrder, BOMComponent, WorkOrderPriority, StockReadiness } from "@/lib/scheduler-types";
import { cn } from "@/lib/utils";

interface WorkOrderQueueProps {
  workOrders: WorkOrder[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSelectComponentToSchedule: (wo: WorkOrder, comp: BOMComponent) => void;
}

export function WorkOrderQueue({
  workOrders,
  isCollapsed,
  onToggleCollapse,
  onSelectComponentToSchedule,
}: WorkOrderQueueProps) {
  const [activeTab, setActiveTab] = useState<"active" | "split_cancel">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [readinessFilter, setReadinessFilter] = useState<string>("All");
  const [expandedWoIds, setExpandedWoIds] = useState<Record<string, boolean>>({
    "wo-1036": true, // Default expanded for instant inspection
  });
  const [expandedStockCompIds, setExpandedStockCompIds] = useState<Record<string, boolean>>({});

  const toggleWoExpand = (id: string) => {
    setExpandedWoIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStockExpand = (id: string) => {
    setExpandedStockCompIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter list by tab
  const tabFiltered = workOrders.filter((wo) => {
    if (activeTab === "active") return wo.status === "active";
    return wo.status === "split" || wo.status === "cancelled";
  });

  // Filter list by search & filters
  const filteredOrders = tabFiltered.filter((wo) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      wo.woNumber.toLowerCase().includes(q) ||
      wo.customer.toLowerCase().includes(q) ||
      wo.assembly.toLowerCase().includes(q) ||
      wo.components.some((c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));

    const matchPriority = priorityFilter === "All" || wo.priority === priorityFilter;

    const matchReadiness =
      readinessFilter === "All" ||
      (readinessFilter === "Ready" && wo.components.every((c) => c.stock.shortage === 0)) ||
      (readinessFilter === "Shortage" && wo.components.some((c) => c.stock.shortage > 0));

    return matchSearch && matchPriority && matchReadiness;
  });

  const activeCount = workOrders.filter((w) => w.status === "active").length;
  const splitCancelCount = workOrders.filter((w) => w.status === "split" || w.status === "cancelled").length;

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white border-r border-[#E5E5EA] flex flex-col items-center py-4 space-y-4 shrink-0 transition-all">
        <button
          onClick={onToggleCollapse}
          className="p-2 text-[#48484A] hover:text-[#007AFF] hover:bg-[#F5F5F7] rounded-xl transition-colors"
          title="Expand Work Orders Queue"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
        <div className="h-px w-6 bg-[#E5E5EA]" />
        <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider transform -rotate-90 whitespace-nowrap mt-8 select-none">
          WO Queue ({activeCount})
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 sm:w-96 bg-white border-r border-[#E5E5EA] flex flex-col h-full shrink-0 select-none transition-all">
      {/* Header & Tabs */}
      <div className="p-3 border-b border-[#E5E5EA] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-[#F5F5F7] p-1 rounded-xl border border-[#E5E5EA] flex-1 mr-2">
            <button
              onClick={() => setActiveTab("active")}
              className={cn(
                "flex-1 py-1 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
                activeTab === "active"
                  ? "bg-white text-[#007AFF] shadow-xs"
                  : "text-[#6E6E73] hover:text-[#1D1D1F]"
              )}
            >
              <span>Active Queue</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#E8F2FE] text-[#007AFF]">
                {activeCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("split_cancel")}
              className={cn(
                "flex-1 py-1 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
                activeTab === "split_cancel"
                  ? "bg-white text-[#FF3B30] shadow-xs"
                  : "text-[#6E6E73] hover:text-[#1D1D1F]"
              )}
            >
              <span>Split / Cancel</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#FFEBEA] text-[#B82218]">
                {splitCancelCount}
              </span>
            </button>
          </div>

          <button
            onClick={onToggleCollapse}
            className="p-1.5 text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-colors shrink-0"
            title="Collapse Queue"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search WO, customer, or part..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F5F5F7] border border-transparent focus:border-[#007AFF] focus:bg-white rounded-xl text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all"
          />
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-2 text-[11px]">
          <div className="flex items-center gap-1 flex-1">
            <span className="text-[#86868B] font-medium shrink-0">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-[11px] font-medium bg-[#F5F5F7] border border-[#E5E5EA] rounded-lg px-1.5 py-0.5 outline-none cursor-pointer flex-1"
            >
              <option value="All">All</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1 flex-1">
            <span className="text-[#86868B] font-medium shrink-0">Stock:</span>
            <select
              value={readinessFilter}
              onChange={(e) => setReadinessFilter(e.target.value)}
              className="text-[11px] font-medium bg-[#F5F5F7] border border-[#E5E5EA] rounded-lg px-1.5 py-0.5 outline-none cursor-pointer flex-1"
            >
              <option value="All">All</option>
              <option value="Ready">Ready</option>
              <option value="Shortage">Shortage</option>
            </select>
          </div>
        </div>
      </div>

      {/* Queue List with Custom Scrollbar */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#F5F5F7] text-[#86868B] flex items-center justify-center mx-auto">
              <Package className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-[#1D1D1F]">No Work Orders Found</div>
            <div className="text-[11px] text-[#86868B]">
              No work orders match the selected filters or search terms.
            </div>
          </div>
        ) : (
          filteredOrders.map((wo) => {
            const isExpanded = expandedWoIds[wo.id];
            const hasShortage = wo.components.some((c) => c.stock.shortage > 0);
            const totalRemaining = wo.components.reduce((acc, c) => acc + c.remainingQty, 0);

            return (
              <div
                key={wo.id}
                className={cn(
                  "border rounded-xl bg-white shadow-xs transition-all overflow-hidden",
                  wo.status === "cancelled"
                    ? "border-[#FDCAC7] bg-[#FFFBFB]"
                    : wo.status === "split"
                    ? "border-[#FDE0B6] bg-[#FFFCF8]"
                    : "border-[#E5E5EA] hover:border-[#D1D1D6]"
                )}
              >
                {/* WO Header Bar */}
                <div
                  onClick={() => toggleWoExpand(wo.id)}
                  className="p-3 cursor-pointer hover:bg-[#FAFAFC] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-[#1D1D1F] tracking-tight">
                        {wo.woNumber}
                      </span>
                      {wo.status === "active" && (
                        <span
                          className={cn(
                            "text-[9px] font-bold px-1.5 py-0.2 rounded uppercase",
                            wo.priority === "Urgent"
                              ? "bg-[#FFEBEA] text-[#B82218]"
                              : wo.priority === "High"
                              ? "bg-[#FFF6E9] text-[#A65F00]"
                              : "bg-[#EFF6FF] text-[#1D4ED8]"
                          )}
                        >
                          {wo.priority}
                        </span>
                      )}
                      {wo.status === "cancelled" && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase bg-[#FFEBEA] text-[#B82218] flex items-center gap-0.5">
                          <XCircle className="w-2.5 h-2.5" />
                          <span>Cancelled</span>
                        </span>
                      )}
                      {wo.status === "split" && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase bg-[#FFF6E9] text-[#A65F00] flex items-center gap-0.5">
                          <GitFork className="w-2.5 h-2.5" />
                          <span>Split Child</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-medium text-[#86868B] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#86868B]" />
                        <span>Due {wo.dueDate}</span>
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-[#86868B]" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-[#86868B]" />
                      )}
                    </div>
                  </div>

                  {/* Assembly & Customer */}
                  <div className="mt-1">
                    <div className="text-xs font-semibold text-[#1D1D1F] leading-snug truncate" title={wo.assembly}>
                      {wo.assembly}
                    </div>
                    <div className="text-[10.5px] text-[#86868B] truncate mt-0.5">
                      {wo.customer}
                    </div>
                  </div>

                  {/* Status Reason Notice if Cancelled / Split */}
                  {wo.splitCancelReason && (
                    <div className="mt-2 p-1.5 rounded-lg bg-[#FFEBEA]/60 border border-[#FDCAC7] text-[10px] text-[#B82218] flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                      <span>{wo.splitCancelReason}</span>
                    </div>
                  )}

                  {/* Metrics Row: Ordered, Produced, Pending */}
                  <div className="mt-2.5 pt-2 border-t border-[#F2F2F7] flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#86868B]">
                        Ord: <strong className="text-[#1D1D1F] font-mono">{wo.orderedQty}</strong>
                      </span>
                      <span className="text-[#86868B]">
                        Prod: <strong className="text-[#34C759] font-mono">{wo.producedQty}</strong>
                      </span>
                      <span className="text-[#86868B]">
                        Pend: <strong className="text-[#FF9500] font-mono">{wo.unscheduledQty}</strong>
                      </span>
                    </div>

                    {hasShortage ? (
                      <span className="text-[9.5px] font-semibold text-[#FF3B30] bg-[#FFEBEA] px-1.5 py-0.2 rounded flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>Shortage</span>
                      </span>
                    ) : (
                      <span className="text-[9.5px] font-semibold text-[#1E823B] bg-[#EAF8EF] px-1.5 py-0.2 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Stock Ready</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Expandable BOM Tree & Components */}
                {isExpanded && (
                  <div className="bg-[#FAFAFC] border-t border-[#E5E5EA] p-2.5 space-y-2">
                    <div className="text-[9.5px] font-bold text-[#86868B] uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-[#007AFF]" />
                        <span>BOM Components Demand</span>
                      </span>
                      <span>(WO Qty × BOM Qty)</span>
                    </div>

                    {wo.components.map((comp) => {
                      const isStockOpen = expandedStockCompIds[comp.id];
                      const canSchedule =
                        wo.status === "active" &&
                        comp.readyForScheduling &&
                        comp.remainingQty > 0 &&
                        comp.stock.shortage === 0;

                      return (
                        <div
                          key={comp.id}
                          draggable={canSchedule}
                          onDragStart={(e) => {
                            if (!canSchedule) return;
                            e.dataTransfer.setData(
                              "application/json",
                              JSON.stringify({ woId: wo.id, compId: comp.id })
                            );
                            e.dataTransfer.effectAllowed = "copy";
                          }}
                          className={cn(
                            "bg-white border border-[#E5E5EA] rounded-lg p-2 space-y-1.5 shadow-2xs transition-all",
                            canSchedule
                              ? "cursor-grab active:cursor-grabbing hover:border-[#007AFF] hover:shadow-xs"
                              : "opacity-85"
                          )}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-[11px] text-[#007AFF]">
                                  {comp.code}
                                </span>
                                {canSchedule && (
                                  <span className="text-[8.5px] font-medium text-[#007AFF] bg-[#E8F2FE] px-1 py-0.2 rounded border border-[#B2D7FD]">
                                    Drag to Slot
                                  </span>
                                )}
                              </div>
                              <div className="text-[10.5px] font-medium text-[#1D1D1F] truncate" title={comp.name}>
                                {comp.name}
                              </div>
                              <div className="text-[9.5px] text-[#86868B] flex items-center gap-1 mt-0.5">
                                <Wrench className="w-2.5 h-2.5 text-[#86868B]" />
                                <span>{comp.operation}</span>
                              </div>
                            </div>

                            {/* Schedule Action Button */}
                            <button
                              disabled={!canSchedule}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectComponentToSchedule(wo, comp);
                              }}
                              className={cn(
                                "px-2 py-1 text-[10.5px] font-semibold rounded-lg flex items-center gap-1 shrink-0 transition-all shadow-2xs",
                                canSchedule
                                  ? "bg-[#007AFF] text-white hover:bg-[#0058B3] cursor-pointer"
                                  : "bg-[#E5E5EA] text-[#86868B] cursor-not-allowed"
                              )}
                              title={
                                !canSchedule
                                  ? comp.stock.shortage > 0
                                    ? "Blocked: Raw material shortage"
                                    : comp.remainingQty === 0
                                    ? "Completed: No remaining quantity to schedule"
                                    : "Cannot schedule in current state"
                                  : "Schedule this component on machine"
                              }
                            >
                              <span>Schedule</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Demand & Progress Bar */}
                          <div className="pt-1 border-t border-[#F2F2F7]">
                            <div className="flex items-center justify-between text-[10px] text-[#6E6E73] mb-1">
                              <span>
                                Req: <strong className="font-mono text-[#1D1D1F]">{comp.requiredQty}</strong> {comp.unit}
                              </span>
                              <span>
                                Good: <strong className="font-mono text-[#34C759]">{comp.goodOutput}</strong>
                              </span>
                              <span>
                                Rem: <strong className="font-mono text-[#FF9500]">{comp.remainingQty}</strong>
                              </span>
                            </div>

                            {/* Stock Readiness Mini Toggle */}
                            <div className="mt-1 flex items-center justify-between text-[9.5px]">
                              <button
                                onClick={() => toggleStockExpand(comp.id)}
                                className="text-[#007AFF] font-medium hover:underline flex items-center gap-0.5"
                              >
                                {isStockOpen ? "Hide Stock Detail" : "View Stock Inventory"}
                                <ChevronDown className={cn("w-2.5 h-2.5 transition-transform", isStockOpen && "rotate-180")} />
                              </button>

                              {comp.stock.shortage > 0 ? (
                                <span className="font-semibold text-[#FF3B30]">
                                  Shortage: {comp.stock.shortage} {comp.unit}
                                </span>
                              ) : (
                                <span className="font-semibold text-[#1E823B]">
                                  Stock Available: {comp.stock.available} {comp.unit}
                                </span>
                              )}
                            </div>

                            {/* Detailed Stock Breakdown Table if expanded */}
                            {isStockOpen && (
                              <div className="mt-1.5 p-1.5 rounded bg-[#F5F5F7] text-[9.5px] border border-[#E5E5EA] grid grid-cols-4 gap-1 text-center font-mono">
                                <div>
                                  <div className="text-[#86868B] font-sans text-[8.5px]">Req</div>
                                  <div className="font-bold text-[#1D1D1F]">{comp.stock.required}</div>
                                </div>
                                <div>
                                  <div className="text-[#86868B] font-sans text-[8.5px]">Avail</div>
                                  <div className="font-bold text-[#34C759]">{comp.stock.available}</div>
                                </div>
                                <div>
                                  <div className="text-[#86868B] font-sans text-[8.5px]">Resvd</div>
                                  <div className="font-bold text-[#007AFF]">{comp.stock.reserved}</div>
                                </div>
                                <div>
                                  <div className="text-[#86868B] font-sans text-[8.5px]">Short</div>
                                  <div className={cn("font-bold", comp.stock.shortage > 0 ? "text-[#FF3B30]" : "text-[#86868B]")}>
                                    {comp.stock.shortage}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

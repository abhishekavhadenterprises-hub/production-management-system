import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  PanelLeftClose,
  PanelLeftOpen,
  GitFork,
  XCircle,
  Package,
  Wrench,
  AlertTriangle,
  GripVertical,
  Scissors,
  X,
  Sparkles,
} from "lucide-react";
import { WorkOrder, BOMComponent } from "@/lib/scheduler-types";
import { REASON_CODES } from "@/lib/scheduler-mock-data";
import { cn } from "@/lib/utils";
import { PremiumDropdown } from "@/components/ui/premium-dropdown";
import { PremiumNumberInput } from "@/components/ui/premium-number-input";

interface WorkOrderQueueProps {
  workOrders: WorkOrder[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSelectComponentToSchedule: (wo: WorkOrder, comp: BOMComponent) => void;
  onSplitWorkOrder?: (woId: string, compId: string, splitAvailableQty: number, reason: string) => void;
}

export function WorkOrderQueue({
  workOrders,
  isCollapsed,
  onToggleCollapse,
  onSelectComponentToSchedule,
  onSplitWorkOrder,
}: WorkOrderQueueProps) {
  const [activeTab, setActiveTab] = useState<"active" | "split_cancel">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [readinessFilter, setReadinessFilter] = useState<string>("All");
  const [expandedWoIds, setExpandedWoIds] = useState<Record<string, boolean>>({
    "wo-1036": true,
    "wo-1042": true, // Expand shortage item for instant inspection & splitting
  });
  const [expandedStockCompIds, setExpandedStockCompIds] = useState<Record<string, boolean>>({});

  // Split Modal in Queue State
  const [splitModalTarget, setSplitModalTarget] = useState<{
    wo: WorkOrder;
    comp: BOMComponent;
  } | null>(null);
  const [splitQuantityInput, setSplitQuantityInput] = useState<number>(0);
  const [splitReasonInput, setSplitReasonInput] = useState<string>(
    REASON_CODES.find((r) => r.category === "split" && r.code === "SPL-01")?.label ||
    "Raw material unavailable / partial stock shortage"
  );

  const toggleWoExpand = (id: string) => {
    setExpandedWoIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStockExpand = (id: string) => {
    setExpandedStockCompIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenSplitModal = (wo: WorkOrder, comp: BOMComponent) => {
    setSplitModalTarget({ wo, comp });
    // Default to the available stock or half
    const defaultQty = comp.stock.available > 0
      ? comp.stock.available
      : Math.max(1, Math.floor(comp.remainingQty / 2));
    setSplitQuantityInput(defaultQty);
    setSplitReasonInput(
      comp.stock.shortage > 0
        ? "Raw material unavailable / partial stock shortage"
        : "Customer requires smaller quantity / partial dispatch"
    );
  };

  const handleConfirmSplit = () => {
    if (!splitModalTarget || !onSplitWorkOrder) return;
    onSplitWorkOrder(
      splitModalTarget.wo.id,
      splitModalTarget.comp.id,
      splitQuantityInput,
      splitReasonInput
    );
    setSplitModalTarget(null);
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
      <div className="w-12 bg-white border-r border-[#E5E5EA] flex flex-col items-center py-4 space-y-4 shrink-0 transition-all select-none">
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
    <div className="w-80 sm:w-96 bg-white border-r border-[#E5E5EA] flex flex-col h-full shrink-0 select-none transition-all relative">
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
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#E8F2FE] text-[#007AFF] font-mono">
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
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#FFEBEA] text-[#B82218] font-mono">
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
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search WO, customer, or part..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#F5F5F7] border border-transparent focus:border-[#007AFF] focus:bg-white rounded-xl text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 text-[10px] text-[#86868B] hover:text-[#1D1D1F] p-0.5 rounded cursor-pointer"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="text-[#86868B] font-medium shrink-0">Priority:</span>
            <div className="flex-1 min-w-0">
              <PremiumDropdown
                value={priorityFilter}
                onChange={setPriorityFilter}
                options={["All", "Urgent", "High", "Medium", "Low"]}
                size="sm"
                searchable={false}
                buttonClassName="bg-[#F5F5F7] px-2 py-0.5 min-h-[26px] text-[11px] rounded-lg border-[#E5E5EA]"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="text-[#86868B] font-medium shrink-0">Stock:</span>
            <div className="flex-1 min-w-0">
              <PremiumDropdown
                value={readinessFilter}
                onChange={setReadinessFilter}
                options={["All", "Ready", "Shortage"]}
                size="sm"
                searchable={false}
                buttonClassName="bg-[#F5F5F7] px-2 py-0.5 min-h-[26px] text-[11px] rounded-lg border-[#E5E5EA]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Queue List */}
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
            const firstSchedulableComp = wo.components.find(
              (c) => c.readyForScheduling && c.stock.shortage === 0
            ) || wo.components[0];
            const canScheduleWo = wo.status === "active" && !hasShortage && firstSchedulableComp?.remainingQty > 0;

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
                {/* WO Header Bar (Draggable onto machines when ready!) */}
                <div
                  draggable={canScheduleWo}
                  onDragStart={(e) => {
                    if (!canScheduleWo || !firstSchedulableComp) return;
                    e.dataTransfer.setData(
                      "application/json",
                      JSON.stringify({ woId: wo.id, compId: firstSchedulableComp.id })
                    );
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() => toggleWoExpand(wo.id)}
                  className={cn(
                    "p-3 cursor-pointer hover:bg-[#FAFAFC] transition-colors relative",
                    canScheduleWo && "cursor-grab active:cursor-grabbing"
                  )}
                  title={canScheduleWo ? "Drag this entire Work Order onto a machine slot" : undefined}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {canScheduleWo && (
                        <GripVertical className="w-3.5 h-3.5 text-[#007AFF] -ml-1 opacity-70 shrink-0" />
                      )}
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

                  {/* Metrics Row: Ordered, Produced, Pending + Shortage & Split Button */}
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

                    <div className="flex items-center gap-1.5">
                      {hasShortage ? (
                        <>
                          <span className="text-[9.5px] font-semibold text-[#FF3B30] bg-[#FFEBEA] px-1.5 py-0.2 rounded flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>Shortage</span>
                          </span>

                          {wo.status === "active" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenSplitModal(wo, wo.components[0]);
                              }}
                              className="text-[9.5px] font-semibold text-[#007AFF] bg-[#E8F2FE] hover:bg-[#D4E8FD] px-1.5 py-0.5 rounded border border-[#B2D7FD] flex items-center gap-0.5 transition-colors shadow-2xs"
                              title="Split Work Order by available material quantity"
                            >
                              <Scissors className="w-2.5 h-2.5" />
                              <span>Split</span>
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-[9.5px] font-semibold text-[#1E823B] bg-[#EAF8EF] px-1.5 py-0.2 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Stock Ready</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable BOM Components Tree */}
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
                                {canSchedule && (
                                  <GripVertical className="w-3 h-3 text-[#007AFF] opacity-70 shrink-0" />
                                )}
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

                            <div className="flex items-center gap-1">
                              {/* If shortage, allow splitting */}
                              {comp.stock.shortage > 0 && wo.status === "active" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenSplitModal(wo, comp);
                                  }}
                                  className="px-1.5 py-1 text-[10px] font-semibold text-[#007AFF] bg-[#E8F2FE] hover:bg-[#D4E8FD] border border-[#B2D7FD] rounded-lg flex items-center gap-1 shrink-0 transition-colors"
                                  title="Split this component to match available stock"
                                >
                                  <Scissors className="w-2.5 h-2.5" />
                                  <span>Split</span>
                                </button>
                              )}

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

      {/* Split Work Order Popup Modal (Triggered when Material is Unavailable or Customer requires smaller qty) */}
      {splitModalTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSplitModalTarget(null)}
        >
          <div
            className="bg-white rounded-2xl border border-[#E5E5EA] shadow-2xl w-full max-w-md p-5 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E8F2FE] text-[#007AFF] flex items-center justify-center">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1D1D1F]">
                    Split Work Order ({splitModalTarget.wo.woNumber})
                  </h3>
                  <p className="text-[11px] text-[#6E6E73]">
                    {splitModalTarget.wo.customer}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSplitModalTarget(null)}
                className="w-7 h-7 rounded-full bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#6E6E73] flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Material Availability Notice */}
            {splitModalTarget.comp.stock.shortage > 0 ? (
              <div className="p-3 rounded-xl bg-[#FFF6E9] border border-[#FDE0B6] text-xs text-[#A65F00] space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Material Shortage Detected</span>
                </div>
                <div className="text-[11px] text-[#6E6E73]">
                  Required: <strong>{splitModalTarget.comp.stock.required} pcs</strong> •
                  Available: <strong className="text-[#34C759]">{splitModalTarget.comp.stock.available} pcs</strong> •
                  Shortage: <strong className="text-[#FF3B30]">{splitModalTarget.comp.stock.shortage} pcs</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setSplitQuantityInput(splitModalTarget.comp.stock.available)}
                  className="mt-1 text-[10.5px] font-semibold text-[#007AFF] hover:underline block"
                >
                  ⚡ Set split quantity to available stock ({splitModalTarget.comp.stock.available} pcs)
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1D4ED8]">
                Splitting order to accommodate customer reduced batch request or urgent partial delivery.
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] block mb-1">
                Quantity for Available Batch
              </label>
              <PremiumNumberInput
                min={1}
                max={splitModalTarget.wo.orderedQty - 1}
                value={splitQuantityInput}
                onChange={setSplitQuantityInput}
                suffix="pcs"
                size="md"
                className="w-full h-10 rounded-xl"
                inputClassName="text-sm font-bold"
              />
              <span className="text-[10px] text-[#86868B] mt-1 block">
                Remaining {splitModalTarget.wo.orderedQty - splitQuantityInput} pcs will move to child work order {splitModalTarget.wo.woNumber}-B.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] block mb-1">
                Split Reason Code
              </label>
              <PremiumDropdown
                value={splitReasonInput}
                onChange={setSplitReasonInput}
                options={REASON_CODES.filter((r) => r.category === "split").map((r) => ({
                  value: r.label,
                  label: `${r.code} – ${r.label}`,
                }))}
                size="md"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSplitModalTarget(null)}
                className="flex-1 py-2 rounded-xl border border-[#E5E5EA] text-xs font-medium text-[#6E6E73] hover:bg-[#F5F5F7]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSplit}
                className="flex-1 py-2 rounded-xl bg-[#007AFF] hover:bg-[#0058B3] text-white text-xs font-semibold shadow-xs"
              >
                Confirm Split Work
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { OperationalSummaryItem } from "@/lib/types";
import { Clock, ChevronRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface OperationalSummaryProps {
  items: OperationalSummaryItem[];
}

export function OperationalSummary({ items }: OperationalSummaryProps) {
  const [filter, setFilter] = useState<string>("all");

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    return item.category === filter;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-[#FFEBEA] text-[#B82218] border-[#FDCAC7]";
      case "High":
        return "bg-[#FFF6E9] text-[#A65F00] border-[#FDE0B6]";
      case "Medium":
        return "bg-[#E8F2FE] text-[#007AFF] border-[#B2D7FD]";
      default:
        return "bg-[#F2F2F7] text-[#6E6E73] border-[#E5E5EA]";
    }
  };

  return (
    <div className="apple-ref-card bg-white border border-[#E5E5EA] rounded-[16px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#D2D2D7] transition-all flex flex-col justify-between h-full">
      {/* Header & Tabs */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F2F2F7] gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-[13.5px] font-semibold text-[#1D1D1F] tracking-tight">
                Operational Focus & Attention Queue
              </h3>
              <span className="text-[9.5px] font-medium px-1.5 py-0.2 rounded bg-[#F2F2F7] text-[#86868B]">
                Sample Queue
              </span>
            </div>
            <p className="text-[10.5px] text-[#86868B] font-mono tracking-tight mt-0.5">
              module: operations.action-queue (sample)
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[#F5F5F7] p-1 rounded-xl border border-[#E5E5EA]">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-2 py-0.5 text-[10.5px] font-medium rounded-lg transition-all",
                filter === "all"
                  ? "bg-white text-[#1D1D1F] shadow-sm font-semibold"
                  : "text-[#6E6E73] hover:text-[#1D1D1F]"
              )}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setFilter("attention-needed")}
              className={cn(
                "px-2 py-0.5 text-[10.5px] font-medium rounded-lg transition-all",
                filter === "attention-needed"
                  ? "bg-white text-[#B82218] shadow-sm font-semibold"
                  : "text-[#6E6E73] hover:text-[#1D1D1F]"
              )}
            >
              Urgent (1)
            </button>
            <button
              onClick={() => setFilter("pending-tasks")}
              className={cn(
                "px-2 py-0.5 text-[10.5px] font-medium rounded-lg transition-all",
                filter === "pending-tasks"
                  ? "bg-white text-[#007AFF] shadow-sm font-semibold"
                  : "text-[#6E6E73] hover:text-[#1D1D1F]"
              )}
            >
              Tasks (2)
            </button>
            <button
              onClick={() => setFilter("upcoming-deadlines")}
              className={cn(
                "px-2 py-0.5 text-[10.5px] font-medium rounded-lg transition-all",
                filter === "upcoming-deadlines"
                  ? "bg-white text-[#1D1D1F] shadow-sm font-semibold"
                  : "text-[#6E6E73] hover:text-[#1D1D1F]"
              )}
            >
              Deadlines (1)
            </button>
          </div>
        </div>

        {/* Operational Focus Items */}
        <div className="py-1 divide-y divide-[#F2F2F7]">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="py-3 flex items-center justify-between gap-3 group hover:bg-[#FAFAFC] px-2 -mx-2 rounded-xl transition-colors cursor-pointer"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      "text-[9.5px] font-semibold px-2 py-0.5 rounded-full border",
                      getPriorityBadge(item.priority)
                    )}
                  >
                    {item.priority}
                  </span>
                  <span className="text-xs font-semibold text-[#1D1D1F] group-hover:text-[#007AFF] transition-colors truncate">
                    {item.title}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[10.5px] text-[#86868B] flex-wrap">
                  <span className="font-mono text-[#007AFF]">{item.module}</span>
                  <span>•</span>
                  <span>Assigned: <strong className="text-[#6E6E73]">{item.assignedTo}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#6E6E73]">
                    <Clock className="w-3 h-3 text-[#FF9500]" />
                    {item.dueText}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10.5px] font-medium text-[#6E6E73] bg-[#F5F5F7] px-2 py-1 rounded-lg border border-[#E5E5EA]">
                  {item.status}
                </span>
                <ChevronRight className="w-4 h-4 text-[#86868B] group-hover:text-[#007AFF] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Illustrative Performance Benchmark Metrics */}
      <div className="pt-3 border-t border-[#F2F2F7] grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 rounded-xl bg-[#F5F5F7]">
          <div className="text-[9.5px] text-[#86868B] uppercase font-medium">Daily Role Completion</div>
          <div className="text-xs font-bold text-[#34C759]">96.1% (Sample)</div>
        </div>
        <div className="p-2 rounded-xl bg-[#F5F5F7]">
          <div className="text-[9.5px] text-[#86868B] uppercase font-medium">MOM SLA Adherence</div>
          <div className="text-xs font-bold text-[#007AFF]">94.8% (Sample)</div>
        </div>
        <div className="p-2 rounded-xl bg-[#F5F5F7]">
          <div className="text-[9.5px] text-[#86868B] uppercase font-medium">Preventive Maintenance</div>
          <div className="text-xs font-bold text-[#1D1D1F]">100% on schedule</div>
        </div>
      </div>
    </div>
  );
}

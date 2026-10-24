import React from "react";
import {
  Machine,
  JobBooking,
  MachineStatus,
} from "@/lib/scheduler-types";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Play,
  Plus,
  Ban,
  Wrench,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileSchedulerListProps {
  machines: Machine[];
  bookings: JobBooking[];
  onBookingClick: (booking: JobBooking) => void;
  onMachineSchedule: (machine: Machine) => void;
}

export function MobileSchedulerList({
  machines,
  bookings,
  onBookingClick,
  onMachineSchedule,
}: MobileSchedulerListProps) {
  return (
    <div className="p-4 space-y-3 lg:hidden select-none">
      <div className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-2">
        Mobile Machine Schedule ({machines.length} Cells)
      </div>

      {machines.map((m) => {
        const machineBookings = bookings.filter((b) => b.machineId === m.id);
        const activeJob = machineBookings.find((b) => b.status === "running");
        const nextJob = machineBookings.find((b) => b.status === "scheduled");

        return (
          <div
            key={m.id}
            className="p-3.5 rounded-2xl bg-white border border-[#E5E5EA] shadow-xs space-y-3"
          >
            {/* Machine Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-[#1D1D1F]">{m.code}</span>
                  <span
                    className={cn(
                      "text-[9px] font-bold px-1.5 py-0.2 rounded uppercase",
                      m.status === "running"
                        ? "bg-[#EAF8EF] text-[#1E823B]"
                        : m.status === "available"
                        ? "bg-[#E8F2FE] text-[#007AFF]"
                        : "bg-[#FFEBEA] text-[#B82218]"
                    )}
                  >
                    {m.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs font-medium text-[#48484A] mt-0.5">{m.name}</div>
                <div className="text-[10px] text-[#86868B]">
                  {m.department} • Capacity: {m.capacity}
                </div>
              </div>

              {m.status !== "breakdown" && m.status !== "quality_issue" && (
                <button
                  onClick={() => onMachineSchedule(m)}
                  className="px-2.5 py-1 text-xs font-semibold bg-[#007AFF] text-white rounded-lg shadow-2xs flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Book</span>
                </button>
              )}
            </div>

            {/* Active Running Job */}
            {activeJob ? (
              <div
                onClick={() => onBookingClick(activeJob)}
                className="p-2.5 rounded-xl bg-[#34C759] text-white space-y-1.5 cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold">{activeJob.woNumber} (Running)</span>
                  <span className="font-mono text-[10px] bg-black/20 px-1 rounded">
                    {activeJob.progressPercent}%
                  </span>
                </div>
                <div className="text-[11px] font-mono opacity-90 truncate">
                  {activeJob.componentCode}: {activeJob.componentName}
                </div>
                <div className="flex items-center justify-between text-[10px] opacity-80 pt-1 border-t border-white/20">
                  <span>Slot: {activeJob.startTime}–{activeJob.endTime}</span>
                  <span>Good: {activeJob.producedGoodQty}/{activeJob.quantity} pcs</span>
                </div>
              </div>
            ) : nextJob ? (
              <div
                onClick={() => onBookingClick(nextJob)}
                className="p-2.5 rounded-xl bg-[#007AFF] text-white space-y-1.5 cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold">{nextJob.woNumber} (Next Up)</span>
                  <span className="font-mono text-[10px] bg-black/20 px-1 rounded">
                    {nextJob.quantity} pcs
                  </span>
                </div>
                <div className="text-[11px] font-mono opacity-90 truncate">
                  {nextJob.componentCode}
                </div>
                <div className="flex items-center justify-between text-[10px] opacity-80 pt-1 border-t border-white/20">
                  <span>Slot: {nextJob.startTime}–{nextJob.endTime}</span>
                  <span>Operator: {nextJob.operatorName}</span>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-[#F5F5F7] border border-dashed border-[#D1D1D6] text-center text-xs text-[#86868B]">
                {m.statusReason ? (
                  <span className="text-[#FF3B30] font-medium">{m.statusReason}</span>
                ) : (
                  <span>Available for scheduling</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

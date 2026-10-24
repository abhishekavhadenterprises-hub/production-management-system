import React from "react";
import {
  Machine,
  TimeSlot,
  JobBooking,
  MachineStatus,
} from "@/lib/scheduler-types";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  Plus,
  Ban,
  Wrench,
  Coffee,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MachineScheduleGridProps {
  machines: Machine[];
  timeSlots: TimeSlot[];
  bookings: JobBooking[];
  activeStatusFilter: MachineStatus;
  searchQuery: string;
  selectedDept: string;
  onSlotClick: (machine: Machine, slot: TimeSlot) => void;
  onBookingClick: (booking: JobBooking) => void;
  onDropComponentOnSlot?: (machine: Machine, slot: TimeSlot, woId: string, compId: string) => void;
}

export function MachineScheduleGrid({
  machines,
  timeSlots,
  bookings,
  activeStatusFilter,
  searchQuery,
  selectedDept,
  onSlotClick,
  onBookingClick,
  onDropComponentOnSlot,
}: MachineScheduleGridProps) {
  const [dragOverSlotKey, setDragOverSlotKey] = React.useState<string | null>(null);

  // Filter machines based on toolbar criteria
  const filteredMachines = machines.filter((m) => {
    const matchStatus =
      activeStatusFilter === "all" ||
      (activeStatusFilter === "running" && m.status === "running") ||
      (activeStatusFilter === "available" && m.status === "available") ||
      (activeStatusFilter === "breakdown" && m.status === "breakdown") ||
      (activeStatusFilter === "quality_issue" && m.status === "quality_issue") ||
      (activeStatusFilter === "offline" && m.status === "offline") ||
      (activeStatusFilter === "maintenance" && m.status === "maintenance");

    const matchDept =
      selectedDept === "All Departments" || m.department === selectedDept;

    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      m.code.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q);

    return matchStatus && matchDept && matchSearch;
  });

  const getMachineStatusBadge = (status: MachineStatus) => {
    switch (status) {
      case "running":
        return {
          label: "RUNNING",
          colorClass: "bg-[#EAF8EF] text-[#1E823B] border-[#C3EED3]",
          dotColor: "bg-[#34C759]",
        };
      case "available":
        return {
          label: "READY",
          colorClass: "bg-[#E8F2FE] text-[#007AFF] border-[#B2D7FD]",
          dotColor: "bg-[#007AFF]",
        };
      case "breakdown":
        return {
          label: "BREAKDOWN",
          colorClass: "bg-[#FFEBEA] text-[#B82218] border-[#FDCAC7]",
          dotColor: "bg-[#FF3B30]",
        };
      case "quality_issue":
        return {
          label: "QUALITY ISSUE",
          colorClass: "bg-[#FFF6E9] text-[#A65F00] border-[#FDE0B6]",
          dotColor: "bg-[#FF9500]",
        };
      case "offline":
        return {
          label: "OFFLINE",
          colorClass: "bg-[#F2F2F7] text-[#6E6E73] border-[#E5E5EA]",
          dotColor: "bg-[#8E8E93]",
        };
      default:
        return {
          label: "READY",
          colorClass: "bg-[#E8F2FE] text-[#007AFF] border-[#B2D7FD]",
          dotColor: "bg-[#007AFF]",
        };
    }
  };

  return (
    <div className="flex-1 overflow-x-auto overflow-y-auto bg-white select-none relative custom-scrollbar">
      <div className="min-w-[1300px] border-collapse text-xs">
        {/* Table Header: Sticky top row */}
        <div className="sticky top-0 z-20 flex bg-[#F8F9FA] border-b border-[#E5E5EA] shadow-2xs">
          {/* Machine Info Sticky Column Header */}
          <div className="w-64 min-w-[256px] sticky left-0 z-30 bg-[#F8F9FA] p-3 border-r border-[#E5E5EA] flex items-center justify-between font-bold text-[11px] text-[#6E6E73] uppercase tracking-wider">
            <span>Machine / Equipment</span>
            <span className="text-[9px] font-mono text-[#86868B]">Code • Status</span>
          </div>

          {/* Time Slot Columns */}
          <div className="flex flex-1">
            {timeSlots.map((slot) => {
              if (slot.isBreak) {
                return (
                  <div
                    key={slot.id}
                    className="w-32 min-w-[128px] p-2 bg-[#FFFDF0] border-r border-[#FDE68A] text-center flex flex-col items-center justify-center text-[10.5px] font-bold text-[#B45309]"
                  >
                    <div className="flex items-center gap-1 text-[9.5px]">
                      <Coffee className="w-3 h-3 text-[#D97706]" />
                      <span>{slot.startHour}–{slot.endHour}</span>
                    </div>
                    <span className="text-[9px] font-bold tracking-tight text-[#D97706] mt-0.5">
                      {slot.breakLabel}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={slot.id}
                  className="flex-1 min-w-[110px] p-2.5 border-r border-[#E5E5EA] text-center font-mono font-medium text-[10.5px] text-[#48484A]"
                >
                  {slot.timeLabel}
                </div>
              );
            })}
          </div>
        </div>

        {/* Machine Rows */}
        <div className="divide-y divide-[#E5E5EA]">
          {filteredMachines.length === 0 ? (
            <div className="p-12 text-center text-[#86868B] text-xs">
              No machines match the selected filter criteria.
            </div>
          ) : (
            filteredMachines.map((machine) => {
              const statusBadge = getMachineStatusBadge(machine.status);
              const isBlocked =
                machine.status === "breakdown" ||
                machine.status === "quality_issue" ||
                machine.status === "offline";

              // Find bookings on this machine
              const machineBookings = bookings.filter((b) => b.machineId === machine.id);

              return (
                <div key={machine.id} className="flex hover:bg-[#FAFAFC]/60 transition-colors group">
                  {/* Left Column: Machine Details (Sticky) */}
                  <div className="w-64 min-w-[256px] sticky left-0 z-10 bg-white group-hover:bg-[#FAFAFC] p-3 border-r border-[#E5E5EA] flex items-start gap-2.5 transition-colors shadow-xs">
                    <div className="w-9 h-9 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-center font-bold text-[10px] text-[#007AFF] shrink-0 overflow-hidden">
                      {machine.code.slice(0, 3)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-[#1D1D1F] tracking-tight">
                          {machine.code}
                        </span>
                        <span
                          className={cn(
                            "text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase flex items-center gap-1",
                            statusBadge.colorClass
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusBadge.dotColor)} />
                          <span>{statusBadge.label}</span>
                        </span>
                      </div>

                      <div className="text-[11px] font-medium text-[#48484A] truncate mt-0.5" title={machine.name}>
                        {machine.name}
                      </div>

                      <div className="text-[9.5px] text-[#86868B] truncate mt-0.5">
                        {machine.department} • {machine.capacity}
                      </div>

                      {/* Blocker alert if machine has issue */}
                      {machine.statusReason && (
                        <div className="text-[9px] text-[#DC2626] font-medium mt-1 leading-tight flex items-start gap-1">
                          <AlertTriangle className="w-2.5 h-2.5 shrink-0 mt-0.5" />
                          <span className="truncate">{machine.statusReason}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Time Slot Cells */}
                  <div className="flex flex-1 relative">
                    {timeSlots.map((slot) => {
                      // 1. Break slot
                      if (slot.isBreak) {
                        return (
                          <div
                            key={slot.id}
                            className="w-32 min-w-[128px] bg-[#FFFDF0]/80 border-r border-[#FDE68A] flex flex-col items-center justify-center p-2 text-center text-[10px] text-[#B45309] font-medium pointer-events-none select-none"
                          >
                            <Coffee className="w-3.5 h-3.5 text-[#D97706]/70 mb-1" />
                            <span>Break</span>
                          </div>
                        );
                      }

                      // 2. Machine Blocked / Breakdown
                      if (isBlocked) {
                        return (
                          <div
                            key={slot.id}
                            className="flex-1 min-w-[110px] p-2 border-r border-[#E5E5EA] bg-[#F5F5F7]/50 flex items-center justify-center text-center text-[9.5px] text-[#86868B] font-medium cursor-not-allowed select-none"
                            title={`Machine ${machine.code} is unavailable: ${machine.statusReason || machine.status}`}
                          >
                            <Ban className="w-3 h-3 text-[#FF3B30] mr-1 opacity-60" />
                            <span className="text-[9px] font-semibold uppercase text-[#86868B]">Blocked</span>
                          </div>
                        );
                      }

                      // 3. Check if there is an active booking during this slot
                      const slotBooking = machineBookings.find((b) => {
                        return b.startTime <= slot.startHour && b.endTime > slot.startHour;
                      });

                      if (slotBooking) {
                        const isFirstSlot = slotBooking.startTime === slot.startHour;

                        return (
                          <div
                            key={slot.id}
                            onClick={() => onBookingClick(slotBooking)}
                            className={cn(
                              "flex-1 min-w-[110px] p-1.5 border-r border-[#007AFF]/30 flex flex-col justify-between cursor-pointer transition-all relative overflow-hidden group/card",
                              slotBooking.status === "running"
                                ? "bg-[#34C759] text-white shadow-xs"
                                : slotBooking.status === "paused"
                                ? "bg-[#FF9500] text-white shadow-xs"
                                : "bg-[#007AFF] text-white shadow-xs"
                            )}
                            title={`Booking: ${slotBooking.woNumber} (${slotBooking.componentCode}) - Click for details`}
                          >
                            {isFirstSlot ? (
                              <>
                                <div className="flex items-start justify-between gap-1 leading-none">
                                  <span className="font-bold text-[10px] truncate tracking-tight">
                                    {slotBooking.woNumber}
                                  </span>
                                  <span className="text-[8.5px] font-mono px-1 py-0.2 bg-black/20 rounded">
                                    {slotBooking.quantity} pcs
                                  </span>
                                </div>

                                <div className="text-[9px] font-mono truncate opacity-90 mt-0.5">
                                  {slotBooking.componentCode}
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-1 pt-0.5 flex items-center justify-between text-[8px]">
                                  <span>{slotBooking.status === "running" ? "Running" : "Scheduled"}</span>
                                  <span className="font-mono">{slotBooking.progressPercent}%</span>
                                </div>
                                <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mt-0.5">
                                  <div
                                    className="bg-white h-full rounded-full transition-all"
                                    style={{ width: `${slotBooking.progressPercent}%` }}
                                  />
                                </div>
                              </>
                            ) : (
                              <div className="h-full flex items-center justify-center opacity-80 text-[9px] font-medium truncate">
                                <span>{slotBooking.woNumber} (Cont.)</span>
                              </div>
                            )}
                          </div>
                        );
                      }

                      // 4. Free / Available slot
                      const slotKey = `${machine.id}-${slot.id}`;
                      const isDragOver = dragOverSlotKey === slotKey;

                      return (
                        <div
                          key={slot.id}
                          onClick={() => onSlotClick(machine, slot)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "copy";
                            if (dragOverSlotKey !== slotKey) {
                              setDragOverSlotKey(slotKey);
                            }
                          }}
                          onDragLeave={() => {
                            if (dragOverSlotKey === slotKey) {
                              setDragOverSlotKey(null);
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragOverSlotKey(null);
                            const data = e.dataTransfer.getData("application/json");
                            if (data && onDropComponentOnSlot) {
                              try {
                                const { woId, compId } = JSON.parse(data);
                                onDropComponentOnSlot(machine, slot, woId, compId);
                              } catch (err) {
                                console.error(err);
                              }
                            }
                          }}
                          className={cn(
                            "flex-1 min-w-[110px] p-2 border-r border-[#E5E5EA] flex flex-col items-center justify-center cursor-pointer transition-all group/slot",
                            isDragOver
                              ? "bg-[#E8F2FE] ring-2 ring-[#007AFF] ring-inset"
                              : "hover:bg-[#E8F2FE]/50"
                          )}
                          title={`Click or drop component to schedule on ${machine.code} at ${slot.timeLabel}`}
                        >
                          <div
                            className={cn(
                              "w-full py-1.5 px-1 border rounded-lg text-center transition-all shadow-2xs",
                              isDragOver
                                ? "border-[#007AFF] bg-white font-semibold text-[#007AFF]"
                                : "border-dashed border-[#B2D7FD] bg-white group-hover/slot:border-[#007AFF]"
                            )}
                          >
                            <div className="flex items-center justify-center gap-1 text-[9.5px] font-medium text-[#007AFF]">
                              <Plus className="w-2.5 h-2.5" />
                              <span>{isDragOver ? "Drop to Book" : "Available"}</span>
                            </div>
                            <div className="text-[8.5px] text-[#86868B] font-mono mt-0.5">
                              {slot.startHour}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

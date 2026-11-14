import React, { useState } from "react";
import {
  Machine,
  JobBooking,
  MachineStatus,
  ShiftType,
} from "@/lib/scheduler-types";
import {
  ZoomIn,
  ZoomOut,
  Clock,
  Play,
  Coffee,
  Ban,
  Layers,
  Wrench,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MachineTimelineViewProps {
  machines: Machine[];
  bookings: JobBooking[];
  activeStatusFilter: MachineStatus;
  searchQuery: string;
  selectedDept: string;
  selectedShift: ShiftType;
  onBookingClick: (booking: JobBooking) => void;
  onSlotClick: (machine: Machine, timeStr: string) => void;
  onDropComponentOnTimeline?: (machine: Machine, timeStr: string, woId: string, compId: string) => void;
  onRescheduleBooking?: (bookingId: string, machineId: string, machineCode: string, newStartTime: string) => void;
}

export function MachineTimelineView({
  machines,
  bookings,
  activeStatusFilter,
  searchQuery,
  selectedDept,
  selectedShift,
  onBookingClick,
  onSlotClick,
  onDropComponentOnTimeline,
  onRescheduleBooking,
}: MachineTimelineViewProps) {
  const [zoomLevel, setZoomLevel] = useState<"1h" | "30m" | "15m">("1h");

  // Filter machines
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

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchStatus && matchDept;

    const machineBookings = bookings.filter((b) => b.machineId === m.id || b.machineCode === m.code);
    const hasMatchingBooking = machineBookings.some((b) =>
      b.woNumber.toLowerCase().includes(q) ||
      b.componentCode.toLowerCase().includes(q) ||
      b.componentName.toLowerCase().includes(q) ||
      (b.customer && b.customer.toLowerCase().includes(q)) ||
      (b.operatorName && b.operatorName.toLowerCase().includes(q)) ||
      (b.operation && b.operation.toLowerCase().includes(q))
    );

    const matchSearch =
      m.code.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q) ||
      m.status.toLowerCase().includes(q) ||
      hasMatchingBooking;

    return matchStatus && matchDept && matchSearch;
  });

  // Calculate timeline hours based on shift
  const startHour = selectedShift === "shift-b" ? 20.5 : 8.5; // 08:30 or 20:30
  const totalHours = selectedShift === "all-shifts" ? 24 : 12;

  // Zoom scale: pixels per hour
  const pxPerHour = zoomLevel === "1h" ? 110 : zoomLevel === "30m" ? 170 : 250;
  const timelineWidth = totalHours * pxPerHour;

  // Helper to convert time "HH:MM" to offset from start
  const timeToOffset = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    let hourVal = h + m / 60;
    if (selectedShift === "shift-b" && hourVal < 20.5) {
      hourVal += 24; // Crosses midnight
    }
    const diff = hourVal - startHour;
    return Math.max(0, diff * pxPerHour);
  };

  const durationToWidth = (minutes: number) => {
    return (minutes / 60) * pxPerHour;
  };

  // Markers for hour ticks
  const hourTicks = Array.from({ length: totalHours + 1 }).map((_, i) => {
    let rawHour = Math.floor(startHour + i);
    const minute = (startHour + i) % 1 === 0.5 ? "30" : "00";
    if (rawHour >= 24) rawHour -= 24;
    const hourFormatted = String(rawHour).padStart(2, "0");
    return {
      label: `${hourFormatted}:${minute}`,
      left: i * pxPerHour,
    };
  });

  // Current time position simulation marker (around 10:15 AM in Shift A)
  const currentTimeLeft = 1.75 * pxPerHour;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden select-none">
      {/* Zoom Control Bar */}
      <div className="px-4 py-2 bg-[#F8F9FA] border-b border-[#E5E5EA] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[#86868B] font-semibold text-[11px] uppercase tracking-wider">
            Timeline Zoom:
          </span>
          <div className="flex items-center bg-white border border-[#E5E5EA] rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={() => setZoomLevel("1h")}
              className={cn(
                "px-2 py-0.5 rounded text-[11px] font-medium transition-colors",
                zoomLevel === "1h" ? "bg-[#007AFF] text-white" : "text-[#48484A] hover:bg-[#F5F5F7]"
              )}
            >
              1 Hour
            </button>
            <button
              onClick={() => setZoomLevel("30m")}
              className={cn(
                "px-2 py-0.5 rounded text-[11px] font-medium transition-colors",
                zoomLevel === "30m" ? "bg-[#007AFF] text-white" : "text-[#48484A] hover:bg-[#F5F5F7]"
              )}
            >
              30 Mins
            </button>
            <button
              onClick={() => setZoomLevel("15m")}
              className={cn(
                "px-2 py-0.5 rounded text-[11px] font-medium transition-colors",
                zoomLevel === "15m" ? "bg-[#007AFF] text-white" : "text-[#48484A] hover:bg-[#F5F5F7]"
              )}
            >
              15 Mins
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10.5px]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#34C759]" />
            <span className="text-[#48484A]">Running</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#007AFF]" />
            <span className="text-[#48484A]">Scheduled</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#FFFBEB] border border-[#FDE68A]" />
            <span className="text-[#B45309]">Shift Lunch Break</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#FF3B30]" />
            <span className="text-[#FF3B30] font-semibold">Current Time (10:15)</span>
          </span>
        </div>
      </div>

      {/* Main Gantt Timeline Scroll Container */}
      <div className="flex-1 overflow-x-auto overflow-y-auto relative custom-scrollbar">
        <div style={{ width: timelineWidth + 260 }} className="min-w-full">
          {/* Timeline Header Row (Sticky) */}
          <div className="sticky top-0 z-30 flex bg-[#F8F9FA] border-b border-[#E5E5EA] shadow-2xs">
            <div className="w-64 min-w-[256px] sticky left-0 z-40 bg-[#F8F9FA] p-3 border-r border-[#E5E5EA] font-bold text-[11px] text-[#6E6E73] uppercase tracking-wider">
              Machine / Equipment
            </div>

            <div className="relative flex-1 h-10 border-b border-[#E5E5EA]">
              {hourTicks.map((tick, idx) => (
                <div
                  key={idx}
                  style={{ left: tick.left }}
                  className="absolute top-0 bottom-0 border-l border-[#E5E5EA] pl-1.5 pt-2 text-[10px] font-mono text-[#86868B] select-none pointer-events-none"
                >
                  {tick.label}
                </div>
              ))}

              {/* Red Current Time Line */}
              <div
                style={{ left: currentTimeLeft }}
                className="absolute top-0 bottom-0 w-0.5 bg-[#FF3B30] z-30 pointer-events-none"
              >
                <div className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-[#FF3B30]" />
              </div>
            </div>
          </div>

          {/* Machine Timeline Rows */}
          <div className="divide-y divide-[#E5E5EA]">
            {filteredMachines.map((machine) => {
              const machineBookings = bookings.filter((b) => b.machineId === machine.id);
              const isBlocked =
                machine.status === "breakdown" ||
                machine.status === "quality_issue" ||
                machine.status === "offline";

              return (
                <div key={machine.id} className="flex hover:bg-[#FAFAFC]/60 transition-colors group">
                  {/* Sticky Machine Column */}
                  <div className="w-64 min-w-[256px] sticky left-0 z-20 bg-white group-hover:bg-[#FAFAFC] p-3 border-r border-[#E5E5EA] flex items-center justify-between shadow-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#1D1D1F]">{machine.code}</span>
                        <span
                          className={cn(
                            "text-[8.5px] font-bold px-1.5 py-0.2 rounded uppercase",
                            machine.status === "running"
                              ? "bg-[#EAF8EF] text-[#1E823B]"
                              : machine.status === "available"
                              ? "bg-[#E8F2FE] text-[#007AFF]"
                              : "bg-[#FFEBEA] text-[#B82218]"
                          )}
                        >
                          {machine.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[10.5px] text-[#6E6E73] truncate max-w-[190px]">
                        {machine.name}
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Timeline Track */}
                  <div
                    style={{ width: timelineWidth }}
                    onDragOver={(e) => {
                      if (isBlocked) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "copy";
                    }}
                    onDrop={(e) => {
                      if (isBlocked) return;
                      e.preventDefault();
                      const data = e.dataTransfer.getData("application/json");
                      if (data) {
                        try {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickX = e.clientX - rect.left;
                          const hourOffset = clickX / pxPerHour;
                          const totalHour = startHour + hourOffset;
                          let h = Math.floor(totalHour);
                          if (h >= 24) h -= 24;
                          const m = Math.floor((totalHour % 1) * 60);
                          const roundedM = Math.round(m / 15) * 15;
                          const timeStr = `${String(h).padStart(2, "0")}:${String(roundedM % 60).padStart(2, "0")}`;
                          const parsed = JSON.parse(data);

                          if (parsed.isExistingBooking && onRescheduleBooking) {
                            onRescheduleBooking(parsed.bookingId, machine.id, machine.code, timeStr);
                          } else if (onDropComponentOnTimeline) {
                            onDropComponentOnTimeline(machine, timeStr, parsed.woId, parsed.compId);
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }
                    }}
                    className="relative h-16 flex-1 bg-white group-hover:bg-[#FAFAFC]/40 transition-colors"
                  >
                    {/* Hour Vertical Grid Lines */}
                    {hourTicks.map((tick, idx) => (
                      <div
                        key={idx}
                        style={{ left: tick.left }}
                        className="absolute top-0 bottom-0 border-l border-[#F2F2F7] pointer-events-none"
                      />
                    ))}

                    {/* Lunch Break Block (13:00 to 13:30 in Shift A) */}
                    {selectedShift !== "shift-b" && (
                      <div
                        style={{
                          left: timeToOffset("13:00"),
                          width: durationToWidth(30),
                        }}
                        className="absolute top-1 bottom-1 bg-[#FFFDF0] border border-[#FDE68A] rounded-lg flex items-center justify-center text-[10px] text-[#B45309] font-semibold z-10 shadow-2xs pointer-events-none"
                      >
                        <Coffee className="w-3 h-3 text-[#D97706] mr-1" />
                        <span className="hidden sm:inline">Lunch</span>
                      </div>
                    )}

                    {/* Red Current Time Line Across Tracks */}
                    <div
                      style={{ left: currentTimeLeft }}
                      className="absolute top-0 bottom-0 w-0.5 bg-[#FF3B30]/60 z-20 pointer-events-none"
                    />

                    {/* Blocked State Overlay */}
                    {isBlocked ? (
                      <div className="absolute inset-x-2 inset-y-1.5 bg-[#F5F5F7]/80 border border-dashed border-[#D1D1D6] rounded-xl flex items-center px-4 text-[#86868B] text-[10.5px] font-medium gap-2 select-none">
                        <Ban className="w-4 h-4 text-[#FF3B30] shrink-0" />
                        <span>Machine Blocked: {machine.statusReason || machine.status}</span>
                      </div>
                    ) : (
                      <>
                        {/* Render Booked Job Bars on this machine */}
                        {machineBookings.map((b) => {
                          const leftPos = timeToOffset(b.startTime);
                          const barWidth = durationToWidth(b.plannedDurationMinutes);

                          return (
                            <div
                              key={b.id}
                              draggable={true}
                              onDragStart={(e) => {
                                e.dataTransfer.setData(
                                  "application/json",
                                  JSON.stringify({
                                    isExistingBooking: true,
                                    bookingId: b.id,
                                    woId: b.woId,
                                    compId: b.componentCode,
                                  })
                                );
                                e.dataTransfer.effectAllowed = "move";
                              }}
                              onClick={() => onBookingClick(b)}
                              style={{
                                left: leftPos,
                                width: Math.max(90, barWidth),
                              }}
                              className={cn(
                                "absolute top-1.5 bottom-1.5 rounded-xl p-2 flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all shadow-xs text-white z-10 hover:brightness-105 hover:ring-2 hover:ring-white",
                                b.status === "running"
                                  ? "bg-[#34C759]"
                                  : b.status === "paused"
                                  ? "bg-[#FF9500]"
                                  : "bg-[#007AFF]"
                              )}
                              title={`${b.woNumber}: ${b.componentName} (${b.quantity} pcs) - Drag to reschedule or click for details`}
                            >
                              <div className="flex items-center justify-between gap-1 leading-tight">
                                <span className="font-bold text-[10.5px] truncate">
                                  {b.woNumber}
                                </span>
                                <div className="flex items-center gap-1">
                                  {b.startDelayReason && (
                                    <span
                                      className="text-[8px] font-bold px-1 py-0.2 bg-[#FF9500] text-white rounded flex items-center gap-0.5"
                                      title={`Delayed start: ${b.startDelayReason}`}
                                    >
                                      +{b.startDelayMinutes || 0}m
                                    </span>
                                  )}
                                  <span className="text-[9px] font-mono bg-black/20 px-1 py-0.2 rounded shrink-0">
                                    {b.quantity} pcs
                                  </span>
                                </div>
                              </div>

                              <div className="text-[9.5px] truncate opacity-90 font-mono">
                                {b.componentCode}
                              </div>

                              <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mt-0.5">
                                <div
                                  className="bg-white h-full rounded-full"
                                  style={{ width: `${b.progressPercent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

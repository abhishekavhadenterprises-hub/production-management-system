import React, { useState, useMemo, useEffect } from "react";
import {
  Machine,
  WorkOrder,
  BOMComponent,
  JobBooking,
  MachineStatus,
  ShiftType,
  ViewMode,
  TimeSlot,
} from "@/lib/scheduler-types";
import {
  INITIAL_MACHINES,
  INITIAL_WORK_ORDERS,
  INITIAL_BOOKINGS,
  TIME_SLOTS_SHIFT_A,
  TIME_SLOTS_SHIFT_B,
  TOOLS_MASTER,
  EMPLOYEES_MASTER,
  REASON_CODES,
} from "@/lib/scheduler-mock-data";
import { SchedulerToolbar } from "./scheduler-toolbar";
import { WorkOrderQueue } from "./work-order-queue";
import { MachineScheduleGrid } from "./machine-schedule-grid";
import { MachineTimelineView } from "./machine-timeline-view";
import { BookingModal } from "./booking-modal";
import { BookingDetailDrawer } from "./booking-detail-drawer";
import { ImportWorkOrdersModal } from "./import-work-orders-modal";
import { MobileSchedulerList } from "./mobile-scheduler-list";
import { ProdsyncTopNav } from "@/components/layout/prodsync-top-nav";

export function MachineSchedulerView() {
  // Main Workspace State
  const [selectedDate, setSelectedDate] = useState<string>("2026-10-24");
  const [selectedShift, setSelectedShift] = useState<ShiftType>("shift-a");
  const [selectedDept, setSelectedDept] = useState<string>("All Departments");
  const [viewMode, setViewMode] = useState<ViewMode>("tabular");
  const [activeStatusFilter, setActiveStatusFilter] = useState<MachineStatus>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isQueueCollapsed, setIsQueueCollapsed] = useState<boolean>(false);

  // Domain Entities State
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [bookings, setBookings] = useState<JobBooking[]>(INITIAL_BOOKINGS);

  // Sync scheduled and running jobs with Production view
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("prodsync_active_bookings", JSON.stringify(bookings));
        window.dispatchEvent(new Event("prodsync_bookings_updated"));
      }
    } catch (e) {
      // ignore
    }
  }, [bookings]);

  // Modal & Drawer State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedBookingForDrawer, setSelectedBookingForDrawer] =
    useState<JobBooking | null>(null);

  // Prefill references for Booking Modal
  const [prefillWo, setPrefillWo] = useState<WorkOrder | null>(null);
  const [prefillComponent, setPrefillComponent] = useState<BOMComponent | null>(
    null
  );
  const [prefillMachine, setPrefillMachine] = useState<Machine | null>(null);
  const [prefillStartTime, setPrefillStartTime] = useState<string>("08:30");

  // Time Slots selection based on shift
  const activeTimeSlots: TimeSlot[] =
    selectedShift === "shift-b"
      ? TIME_SLOTS_SHIFT_B
      : selectedShift === "all-shifts"
      ? [...TIME_SLOTS_SHIFT_A, ...TIME_SLOTS_SHIFT_B]
      : TIME_SLOTS_SHIFT_A;

  // Dynamic machines with effective status based on bookings for the current shift and date
  const effectiveMachines: Machine[] = useMemo(() => {
    return machines.map((m) => {
      // If machine is in a hardware failure/maintenance state, keep it
      if (
        m.status === "breakdown" ||
        m.status === "quality_issue" ||
        m.status === "offline" ||
        m.status === "maintenance"
      ) {
        return m;
      }

      // Check if machine has an active job booked or running in this date and shift
      const hasBooking = bookings.some((b) => {
        if (b.machineId !== m.id && b.machineCode !== m.code) return false;
        if (b.date !== selectedDate) return false;
        if (b.status === "cancelled" || b.status === "completed") return false;
        if (selectedShift === "all-shifts") return true;
        const shiftMatch =
          (selectedShift === "shift-a" && b.shift === "Shift A") ||
          (selectedShift === "shift-b" && b.shift === "Shift B");
        return shiftMatch;
      });

      return {
        ...m,
        status: hasBooking ? ("running" as MachineStatus) : ("available" as MachineStatus),
      };
    });
  }, [machines, bookings, selectedDate, selectedShift]);

  // Status counts calculated dynamically from effective status
  const statusCounts = {
    all: effectiveMachines.length,
    running: effectiveMachines.filter((m) => m.status === "running").length,
    available: effectiveMachines.filter((m) => m.status === "available").length,
    breakdown: effectiveMachines.filter((m) => m.status === "breakdown").length,
    quality_issue: effectiveMachines.filter((m) => m.status === "quality_issue").length,
    offline: effectiveMachines.filter((m) => m.status === "offline").length,
    maintenance: effectiveMachines.filter((m) => m.status === "maintenance").length,
  };

  // Filtered machines for mobile view
  const mobileFilteredMachines = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return effectiveMachines.filter((m) => {
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

      if (!q) return matchStatus && matchDept;

      const machineBookings = bookings.filter((b) => b.machineId === m.id || b.machineCode === m.code);
      const hasMatchingBooking = machineBookings.some((b) =>
        b.woNumber.toLowerCase().includes(q) ||
        b.componentCode.toLowerCase().includes(q) ||
        b.componentName.toLowerCase().includes(q) ||
        (b.customer && b.customer.toLowerCase().includes(q)) ||
        (b.operatorName && b.operatorName.toLowerCase().includes(q))
      );

      return (
        matchStatus &&
        matchDept &&
        (m.code.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.department.toLowerCase().includes(q) ||
          hasMatchingBooking)
      );
    });
  }, [effectiveMachines, activeStatusFilter, selectedDept, searchQuery, bookings]);

  // Reset Filters Handler
  const handleResetFilters = () => {
    setActiveStatusFilter("all");
    setSelectedDept("All Departments");
    setSearchQuery("");
    setSelectedShift("shift-a");
    setSelectedDate("2026-10-24");
  };

  // Click on free slot in tabular grid
  const handleSlotClick = (machine: Machine, slot: TimeSlot) => {
    setPrefillMachine(machine);
    setPrefillStartTime(slot.startHour);
    // Find first active work order and component as prefill candidate
    const firstActiveWo = workOrders.find((w) => w.status === "active");
    setPrefillWo(firstActiveWo || null);
    setPrefillComponent(firstActiveWo?.components[0] || null);
    setIsBookingModalOpen(true);
  };

  // Timeline click on empty space
  const handleTimelineSlotClick = (machine: Machine, timeStr: string) => {
    setPrefillMachine(machine);
    setPrefillStartTime(timeStr);
    const firstActiveWo = workOrders.find((w) => w.status === "active");
    setPrefillWo(firstActiveWo || null);
    setPrefillComponent(firstActiveWo?.components[0] || null);
    setIsBookingModalOpen(true);
  };

  // Click "Schedule" button on Work Order Queue
  const handleSelectComponentToSchedule = (
    wo: WorkOrder,
    comp: BOMComponent
  ) => {
    setPrefillWo(wo);
    setPrefillComponent(comp);
    // Find matching available machine for this component's operation
    const suitableMachine =
      effectiveMachines.find(
        (m) =>
          m.status === "available" &&
          m.compatibleOperations.some((op) =>
            comp.operation.toLowerCase().includes(op.toLowerCase())
          )
      ) ||
      effectiveMachines.find((m) => m.status === "available") ||
      effectiveMachines[0];

    setPrefillMachine(suitableMachine);
    setPrefillStartTime("08:30");
    setIsBookingModalOpen(true);
  };

  // Handle dropping a component card onto a free slot in Tabular Grid
  const handleDropComponentOnSlot = (
    machine: Machine,
    slot: TimeSlot,
    woId: string,
    compId: string
  ) => {
    const targetWo = workOrders.find((w) => w.id === woId);
    const targetComp = targetWo?.components.find((c) => c.id === compId);
    if (!targetWo || !targetComp) return;

    setPrefillWo(targetWo);
    setPrefillComponent(targetComp);
    setPrefillMachine(machine);
    setPrefillStartTime(slot.startHour);
    setIsBookingModalOpen(true);
  };

  // Handle dropping a component card onto the Visual Timeline
  const handleDropComponentOnTimeline = (
    machine: Machine,
    timeStr: string,
    woId: string,
    compId: string
  ) => {
    const targetWo = workOrders.find((w) => w.id === woId);
    const targetComp = targetWo?.components.find((c) => c.id === compId);
    if (!targetWo || !targetComp) return;

    setPrefillWo(targetWo);
    setPrefillComponent(targetComp);
    setPrefillMachine(machine);
    setPrefillStartTime(timeStr);
    setIsBookingModalOpen(true);
  };

  // Save confirmed booking
  const handleSaveBooking = (newBooking: JobBooking) => {
    setBookings((prev) => [...prev, newBooking]);

    // Update work order component scheduled balance
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id === newBooking.woId) {
          const updatedComponents = wo.components.map((comp) => {
            if (comp.code === newBooking.componentCode) {
              const newSched = comp.scheduledBalance + newBooking.quantity;
              const newRem = Math.max(0, comp.remainingQty - newBooking.quantity);
              return {
                ...comp,
                scheduledBalance: newSched,
                remainingQty: newRem,
              };
            }
            return comp;
          });
          const unscheduled = Math.max(0, wo.unscheduledQty - newBooking.quantity);
          return {
            ...wo,
            unscheduledQty: unscheduled,
            components: updatedComponents,
          };
        }
        return wo;
      })
    );
  };

  // Update existing booking (e.g. from Detail Drawer)
  const handleUpdateBooking = (updated: JobBooking) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === updated.id ? updated : b))
    );
    setSelectedBookingForDrawer(updated);

    // Update machine status if job started running
    if (updated.status === "running") {
      setMachines((prev) =>
        prev.map((m) =>
          m.id === updated.machineId ? { ...m, status: "running" } : m
        )
      );
    }
  };

  // Split job into child work order
  const handleSplitBooking = (
    booking: JobBooking,
    splitQty: number,
    reason: string
  ) => {
    const remainingQty = booking.quantity - splitQty;

    // Update parent booking
    const updatedParent: JobBooking = {
      ...booking,
      quantity: remainingQty,
      remarks: `Split ${splitQty} pcs into child order (${reason})`,
    };
    handleUpdateBooking(updatedParent);

    // Create child split Work Order in queue
    const childWoNumber = `${booking.woNumber}-B`;
    const newChildWo: WorkOrder = {
      id: `wo-${Date.now()}`,
      woNumber: childWoNumber,
      date: new Date().toLocaleDateString(),
      customer: booking.customer,
      assembly: `${booking.componentName} (Split Batch)`,
      assemblyCode: `ASSY-${childWoNumber}`,
      priority: "High",
      dueDate: "2026-10-31",
      orderedQty: splitQty,
      unscheduledQty: splitQty,
      producedQty: 0,
      status: "split",
      splitCancelReason: reason,
      splitParentWo: booking.woNumber,
      isSampleData: true,
      components: [
        {
          id: `c-split-${Date.now()}`,
          code: booking.componentCode,
          name: booking.componentName,
          operation: booking.operation,
          bomQty: 1,
          requiredQty: splitQty,
          scheduledBalance: 0,
          goodOutput: 0,
          rejects: 0,
          remainingQty: splitQty,
          unit: "pcs",
          readyForScheduling: true,
          stock: {
            required: splitQty,
            available: splitQty + 20,
            reserved: splitQty,
            shortage: 0,
            unit: "pcs",
          },
        },
      ],
    };

    setWorkOrders((prev) => [newChildWo, ...prev]);
  };

  // Split work order directly from queue (e.g. due to material shortage or customer smaller quantity)
  const handleSplitWorkOrder = (
    woId: string,
    compId: string,
    splitAvailableQty: number,
    reason: string
  ) => {
    setWorkOrders((prev) => {
      const targetWo = prev.find((w) => w.id === woId);
      if (!targetWo) return prev;

      const targetComp =
        targetWo.components.find((c) => c.id === compId) ||
        targetWo.components[0];
      const childQty = targetWo.orderedQty - splitAvailableQty;

      // Update parent WO to the available/smaller quantity
      const updatedParent: WorkOrder = {
        ...targetWo,
        orderedQty: splitAvailableQty,
        unscheduledQty: Math.min(targetWo.unscheduledQty, splitAvailableQty),
        splitChildren: [...(targetWo.splitChildren || []), `${targetWo.woNumber}-B`],
        components: targetWo.components.map((comp) => {
          if (comp.id === targetComp.id) {
            return {
              ...comp,
              requiredQty: splitAvailableQty,
              remainingQty: Math.min(comp.remainingQty, splitAvailableQty),
              readyForScheduling: true,
              stock: {
                ...comp.stock,
                required: splitAvailableQty,
                shortage: 0,
              },
            };
          }
          return comp;
        }),
      };

      // Create child split order for the remainder pending material/customer
      const childWo: WorkOrder = {
        id: `wo-${Date.now()}`,
        woNumber: `${targetWo.woNumber}-B`,
        date: new Date().toLocaleDateString(),
        customer: targetWo.customer,
        assembly: `${targetWo.assembly} (Split Remainder)`,
        assemblyCode: targetWo.assemblyCode,
        priority: targetWo.priority,
        dueDate: targetWo.dueDate,
        orderedQty: childQty,
        unscheduledQty: childQty,
        producedQty: 0,
        status: "split",
        splitCancelReason: reason,
        splitParentWo: targetWo.woNumber,
        isSampleData: true,
        components: targetWo.components.map((comp) => ({
          ...comp,
          id: `c-split-${Date.now()}-${comp.id}`,
          requiredQty: childQty,
          scheduledBalance: 0,
          goodOutput: 0,
          rejects: 0,
          remainingQty: childQty,
          readyForScheduling: false,
          stock: {
            ...comp.stock,
            required: childQty,
            available: 0,
            reserved: 0,
            shortage: childQty,
          },
        })),
      };

      return [updatedParent, childWo, ...prev.filter((w) => w.id !== woId)];
    });
  };

  // Drag and drop reschedule existing booking
  const handleRescheduleBooking = (
    bookingId: string,
    newMachineId: string,
    newMachineCode: string,
    newStartTime: string
  ) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          const [sh, sm] = newStartTime.split(":").map(Number);
          const durationMin = b.plannedDurationMinutes || 120;
          const endTotalMin = sh * 60 + sm + durationMin;
          const eh = Math.floor(endTotalMin / 60) % 24;
          const em = endTotalMin % 60;
          const newEndTime = `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;

          return {
            ...b,
            machineId: newMachineId,
            machineCode: newMachineCode,
            startTime: newStartTime,
            endTime: newEndTime,
          };
        }
        return b;
      })
    );
  };

  // Cancel booking
  const handleCancelBooking = (booking: JobBooking, reason: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id ? { ...b, status: "cancelled", remarks: reason } : b
      )
    );

    // Restore unscheduled balance in Work Order
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.woNumber === booking.woNumber) {
          return {
            ...wo,
            unscheduledQty: wo.unscheduledQty + (booking.quantity - booking.producedGoodQty),
          };
        }
        return wo;
      })
    );

    setSelectedBookingForDrawer(null);
  };

  // Bulk import work orders
  const handleImportWorkOrders = (newOrders: WorkOrder[]) => {
    setWorkOrders((prev) => [...newOrders, ...prev]);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F5F5F7] overflow-hidden select-none">
      {/* Top PRODSYNC Header Navigation Bar */}
      <ProdsyncTopNav />

      {/* Top Toolbar */}
      <SchedulerToolbar
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        selectedShift={selectedShift}
        onShiftChange={setSelectedShift}
        selectedDept={selectedDept}
        onDeptChange={setSelectedDept}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        activeStatusFilter={activeStatusFilter}
        onStatusFilterChange={setActiveStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusCounts={statusCounts}
        onResetFilters={handleResetFilters}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        lastUpdatedText="Live"
      />

      {/* Main Workspace Body: Left Collapsible Queue + Right Schedule Grid / Timeline */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Work Order Queue */}
        <WorkOrderQueue
          workOrders={workOrders}
          isCollapsed={isQueueCollapsed}
          onToggleCollapse={() => setIsQueueCollapsed(!isQueueCollapsed)}
          onSelectComponentToSchedule={handleSelectComponentToSchedule}
          onSplitWorkOrder={handleSplitWorkOrder}
        />

        {/* Center / Right Schedule View (Desktop: Grid or Timeline; Mobile: Responsive list) */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Mobile View */}
          <div className="lg:hidden flex-1 overflow-y-auto">
            <MobileSchedulerList
              machines={mobileFilteredMachines}
              bookings={bookings}
              onBookingClick={(b) => setSelectedBookingForDrawer(b)}
              onMachineSchedule={(m) => {
                setPrefillMachine(m);
                setPrefillStartTime("08:30");
                setIsBookingModalOpen(true);
              }}
            />
          </div>

          {/* Desktop Schedule Views */}
          <div className="hidden lg:flex flex-1 overflow-hidden">
            {viewMode === "tabular" ? (
              <MachineScheduleGrid
                machines={effectiveMachines}
                timeSlots={activeTimeSlots}
                bookings={bookings}
                activeStatusFilter={activeStatusFilter}
                searchQuery={searchQuery}
                selectedDept={selectedDept}
                onSlotClick={handleSlotClick}
                onBookingClick={(b) => setSelectedBookingForDrawer(b)}
                onDropComponentOnSlot={handleDropComponentOnSlot}
                onRescheduleBooking={handleRescheduleBooking}
              />
            ) : (
              <MachineTimelineView
                machines={effectiveMachines}
                bookings={bookings}
                activeStatusFilter={activeStatusFilter}
                searchQuery={searchQuery}
                selectedDept={selectedDept}
                selectedShift={selectedShift}
                onBookingClick={(b) => setSelectedBookingForDrawer(b)}
                onSlotClick={handleTimelineSlotClick}
                onDropComponentOnTimeline={handleDropComponentOnTimeline}
                onRescheduleBooking={handleRescheduleBooking}
              />
            )}
          </div>
        </div>
      </div>

      {/* Create / Edit Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSave={handleSaveBooking}
        prefillWo={prefillWo}
        prefillComponent={prefillComponent}
        prefillMachine={prefillMachine}
        prefillStartTime={prefillStartTime}
        prefillDate={selectedDate}
        machines={effectiveMachines}
        tools={TOOLS_MASTER}
        employees={EMPLOYEES_MASTER}
        existingBookings={bookings}
      />

      {/* Job Execution & Management Detail Drawer */}
      <BookingDetailDrawer
        booking={selectedBookingForDrawer}
        onClose={() => setSelectedBookingForDrawer(null)}
        onUpdateBooking={handleUpdateBooking}
        onSplitBooking={handleSplitBooking}
        onCancelBooking={handleCancelBooking}
      />

      {/* Bulk Import Work Orders Modal */}
      <ImportWorkOrdersModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportWorkOrders}
        existingWoNumbers={workOrders.map((w) => w.woNumber)}
      />
    </div>
  );
}

import React, { useState } from "react";
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

  // Status counts calculated dynamically
  const statusCounts = {
    all: machines.length,
    running: machines.filter((m) => m.status === "running").length,
    available: machines.filter((m) => m.status === "available").length,
    breakdown: machines.filter((m) => m.status === "breakdown").length,
    quality_issue: machines.filter((m) => m.status === "quality_issue").length,
    offline: machines.filter((m) => m.status === "offline").length,
    maintenance: machines.filter((m) => m.status === "maintenance").length,
  };

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
      machines.find(
        (m) =>
          m.status === "available" &&
          m.compatibleOperations.some((op) =>
            comp.operation.toLowerCase().includes(op.toLowerCase())
          )
      ) ||
      machines.find((m) => m.status === "available") ||
      machines[0];

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
    <div className="flex flex-col h-[calc(100vh-56px)] bg-[#F5F5F7] overflow-hidden select-none">
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
        />

        {/* Center / Right Schedule View (Desktop: Grid or Timeline; Mobile: Responsive list) */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Mobile View */}
          <div className="lg:hidden flex-1 overflow-y-auto">
            <MobileSchedulerList
              machines={machines}
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
                machines={machines}
                timeSlots={activeTimeSlots}
                bookings={bookings}
                activeStatusFilter={activeStatusFilter}
                searchQuery={searchQuery}
                selectedDept={selectedDept}
                onSlotClick={handleSlotClick}
                onBookingClick={(b) => setSelectedBookingForDrawer(b)}
                onDropComponentOnSlot={handleDropComponentOnSlot}
              />
            ) : (
              <MachineTimelineView
                machines={machines}
                bookings={bookings}
                activeStatusFilter={activeStatusFilter}
                searchQuery={searchQuery}
                selectedDept={selectedDept}
                selectedShift={selectedShift}
                onBookingClick={(b) => setSelectedBookingForDrawer(b)}
                onSlotClick={handleTimelineSlotClick}
                onDropComponentOnTimeline={handleDropComponentOnTimeline}
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
        machines={machines}
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

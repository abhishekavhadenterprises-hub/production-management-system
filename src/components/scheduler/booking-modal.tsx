import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  Wrench,
  User,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  Info,
  Package,
  Building2,
  Tag,
  CircleDot,
  FileSpreadsheet,
  Image as ImageIcon,
  Check,
  ChevronDown,
} from "lucide-react";
import {
  Machine,
  WorkOrder,
  BOMComponent,
  JobBooking,
  ToolMasterItem,
  EmployeeMasterItem,
} from "@/lib/scheduler-types";
import { cn } from "@/lib/utils";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: JobBooking) => void;
  prefillWo: WorkOrder | null;
  prefillComponent: BOMComponent | null;
  prefillMachine: Machine | null;
  prefillStartTime?: string;
  prefillDate?: string;
  machines: Machine[];
  tools: ToolMasterItem[];
  employees: EmployeeMasterItem[];
  existingBookings: JobBooking[];
}

export function BookingModal({
  isOpen,
  onClose,
  onSave,
  prefillWo,
  prefillComponent,
  prefillMachine,
  prefillStartTime = "08:30",
  prefillDate = "2026-10-24",
  machines,
  tools,
  employees,
  existingBookings,
}: BookingModalProps) {
  // Machine & Part Selection
  const [selectedMachineId, setSelectedMachineId] = useState<string>(
    prefillMachine?.id || machines[0]?.id || ""
  );
  const [selectedComponentId, setSelectedComponentId] = useState<string>(
    prefillComponent?.id || prefillWo?.components[0]?.id || ""
  );

  // Form Timing & Shift
  const [quantity, setQuantity] = useState<number>(
    prefillComponent?.remainingQty || 120
  );
  const [shift, setShift] = useState<"Shift A" | "Shift B">("Shift A");
  const [bookingDate, setBookingDate] = useState<string>(prefillDate);
  const [startTime, setStartTime] = useState<string>(prefillStartTime);

  // Maintenance Dates
  const [lastMaintenanceDate, setLastMaintenanceDate] = useState<string>("31/08/2026");
  const [prevMaintenanceDate, setPrevMaintenanceDate] = useState<string>("30/09/2026");

  // Tool Configuration
  const [toolChangeRequired, setToolChangeRequired] = useState<"Yes" | "No">("Yes");
  const [toolInfoMode, setToolInfoMode] = useState<string>("Select From Library");
  const [selectedToolId, setSelectedToolId] = useState<string>(tools[0]?.id || "");

  // Operator Assignment & Details
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>(
    employees[0]?.id || ""
  );
  const [operatorName, setOperatorName] = useState<string>(
    employees[0]?.name || "Operator Name"
  );
  const [empId, setEmpId] = useState<string>(employees[0]?.empId || "EMP ID");

  // Setup Times & Independent Apply / Skip controls
  const [toolSetupMin, setToolSetupMin] = useState<number>(15);
  const [toolSetupApplied, setToolSetupApplied] = useState<boolean>(true);
  const [programSetupMin, setProgramSetupMin] = useState<number>(10);
  const [programSetupApplied, setProgramSetupApplied] = useState<boolean>(true);
  const [sampleSetupMin, setSampleSetupMin] = useState<number>(10);
  const [sampleSetupApplied, setSampleSetupApplied] = useState<boolean>(true);

  // Remarks
  const [remarks, setRemarks] = useState<string>("");

  // Sync state on prefill change
  useEffect(() => {
    if (prefillMachine) {
      setSelectedMachineId(prefillMachine.id);
    }
    if (prefillWo && prefillWo.components.length > 0) {
      const activeComp = prefillComponent || prefillWo.components[0];
      setSelectedComponentId(activeComp.id);
      setQuantity(activeComp.remainingQty || prefillWo.orderedQty || 120);
    }
    if (prefillStartTime) {
      setStartTime(prefillStartTime);
    }
    if (prefillDate) {
      setBookingDate(prefillDate);
    }
  }, [prefillMachine, prefillWo, prefillComponent, prefillStartTime, prefillDate]);

  // When selected operator changes, auto-fill name and EMP ID
  const handleOperatorChange = (opId: string) => {
    setSelectedOperatorId(opId);
    const emp = employees.find((e) => e.id === opId);
    if (emp) {
      setOperatorName(emp.name);
      setEmpId(emp.empId);
    }
  };

  if (!isOpen) return null;

  const currentMachine = machines.find((m) => m.id === selectedMachineId) || machines[0];
  const currentTool = tools.find((t) => t.id === selectedToolId) || tools[0];

  // Active component from current WO
  const activeComponent =
    prefillWo?.components.find((c) => c.id === selectedComponentId) ||
    prefillComponent ||
    prefillWo?.components[0];

  // Production Rate & Time calculations
  const productionRate = currentMachine?.runningRatePerHour || 120; // pcs/hr
  const netRuntimeMinutes = Math.ceil((quantity / productionRate) * 60);

  const totalSetupMinutes =
    (toolSetupApplied ? toolSetupMin : 0) +
    (programSetupApplied ? programSetupMin : 0) +
    (sampleSetupApplied ? sampleSetupMin : 0);

  let totalDurationMinutes = totalSetupMinutes + netRuntimeMinutes;

  // Break-aware finish time recalculation around lunch break (13:00 to 13:30)
  const [startH, startM] = (startTime || "08:30").split(":").map(Number);
  const startDecimal = (isNaN(startH) ? 8 : startH) + (isNaN(startM) ? 30 : startM) / 60;
  let endDecimal = startDecimal + totalDurationMinutes / 60;

  let spansLunch = false;
  if (shift === "Shift A" && startDecimal < 13.0 && endDecimal > 13.0) {
    spansLunch = true;
    totalDurationMinutes += 30;
    endDecimal += 0.5;
  }

  // Format calculated end time
  let endHour = Math.floor(endDecimal);
  const endMin = Math.round((endDecimal - endHour) * 60);
  if (endHour >= 24) endHour -= 24;
  const formattedEndTime = `${String(endHour).padStart(2, "0")}:${String(
    endMin % 60
  ).padStart(2, "0")}`;

  const durationHours = Math.floor(totalDurationMinutes / 60);
  const durationMinsRemainder = totalDurationMinutes % 60;

  // Validations & Blocker checks
  const blockers: string[] = [];
  const warnings: string[] = [];

  // Check 1: Machine status
  if (currentMachine?.status === "breakdown") {
    blockers.push(`Machine ${currentMachine.code} is in BREAKDOWN: ${currentMachine.statusReason || ""}`);
  } else if (currentMachine?.status === "quality_issue") {
    blockers.push(`Machine ${currentMachine.code} has an active QUALITY ISSUE hold.`);
  }

  // Check 2: Machine suitability for operation
  if (activeComponent && currentMachine) {
    const isSuitable = currentMachine.compatibleOperations.some((op) =>
      activeComponent.operation.toLowerCase().includes(op.toLowerCase()) ||
      op.toLowerCase().includes(activeComponent.operation.toLowerCase())
    );
    if (!isSuitable) {
      warnings.push(`Advisory: ${currentMachine.name} is not tagged for "${activeComponent.operation}". Manual supervisor verification recommended.`);
    }
  }

  // Check 3: Tool compatibility
  if (currentMachine && currentTool) {
    if (!currentTool.compatibleMachines.includes(currentMachine.code)) {
      warnings.push(`Tool ${currentTool.code} is not standard for ${currentMachine.code}. Check die holder clearance.`);
    }
    if (currentTool.status === "Maintenance" || currentTool.status === "Worn Out") {
      blockers.push(`Tool ${currentTool.code} is currently flagged as ${currentTool.status}.`);
    }
  }

  // Check 4: Stock availability
  if (activeComponent && activeComponent.stock.shortage > 0) {
    blockers.push(`Raw material shortage of ${activeComponent.stock.shortage} ${activeComponent.unit} detected in inventory.`);
  }

  // Check 5: Overlapping conflict on same machine
  const conflict = existingBookings.find((b) => {
    return (
      b.machineId === selectedMachineId &&
      b.date === bookingDate &&
      b.startTime < formattedEndTime &&
      b.endTime > startTime
    );
  });
  if (conflict) {
    blockers.push(`Booking conflict: ${conflict.woNumber} (${conflict.componentCode}) is already scheduled on ${currentMachine?.code} from ${conflict.startTime} to ${conflict.endTime}.`);
  }

  const handleConfirm = () => {
    if (blockers.length > 0) return;

    const newBooking: JobBooking = {
      id: `b-${Date.now()}`,
      woId: prefillWo?.id || "wo-manual",
      woNumber: prefillWo?.woNumber || "WO-1006",
      customer: prefillWo?.customer || "Voltas Engineering & Cooling Systems",
      componentCode: activeComponent?.code || "CH-VOL-1007-A",
      componentName: activeComponent?.name || "Oil Return U-Tube Bend",
      operation: activeComponent?.operation || "CNC Rotary Draw Bending",
      machineId: selectedMachineId,
      machineCode: currentMachine?.code || "CNC-TB-01",
      quantity: quantity,
      shift: shift,
      date: bookingDate,
      startTime: startTime,
      endTime: formattedEndTime,
      plannedDurationMinutes: totalDurationMinutes,
      status: "scheduled",
      progressPercent: 0,
      producedGoodQty: 0,
      producedNgQty: 0,
      toolId: selectedToolId,
      toolName: currentTool?.name || "Standard Tooling",
      operatorId: selectedOperatorId,
      operatorName: operatorName,
      toolSetupMinutes: toolSetupApplied ? toolSetupMin : 0,
      programSetupMinutes: programSetupApplied ? programSetupMin : 0,
      sampleSetupMinutes: sampleSetupApplied ? sampleSetupMin : 0,
      toolSetupApplied,
      programSetupApplied,
      sampleSetupApplied,
      approvalStatus: "Approved",
      remarks: remarks || `Tool change required: ${toolChangeRequired}`,
      isSimulation: true,
      virtualBoxStage: "VB1",
    };

    onSave(newBooking);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-3 sm:p-5 select-none overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E5EA] w-full max-w-4xl overflow-hidden flex flex-col my-auto max-h-[94vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="px-6 py-3.5 border-b border-[#E5E5EA] flex items-center justify-between bg-[#F8F9FA]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#007AFF] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-[#1D1D1F] tracking-tight">
                Assign Work Order to Machine Shift
              </h2>
              <p className="text-[11px] text-[#86868B]">
                Configure machine shift assignment, raw material readiness, tooling setup, and operator allocation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#E5E5EA] rounded-full transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar text-xs">
          {/* SECTION 1: Readonly Header & Order Specification Card */}
          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E5EA] space-y-2.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-[11px]">
              {/* Customer Name */}
              <div className="flex items-center justify-between py-1 border-b border-[#EBEBF0]">
                <span className="text-[#86868B] font-semibold flex items-center gap-1.5 uppercase text-[10px]">
                  <Building2 className="w-3.5 h-3.5 text-[#007AFF]" />
                  <span>Customer Name</span>
                </span>
                <span className="font-bold text-[#1D1D1F] text-right truncate max-w-[260px]">
                  {prefillWo?.customer || "Voltas Engineering & Cooling Systems"}
                </span>
              </div>

              {/* Work Order No & Date */}
              <div className="flex items-center justify-between py-1 border-b border-[#EBEBF0]">
                <span className="text-[#86868B] font-semibold flex items-center gap-1.5 uppercase text-[10px]">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#007AFF]" />
                  <span>Work Order No & Date</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="px-2 py-0.5 rounded bg-[#007AFF] text-white font-mono font-bold text-[10.5px]">
                    {prefillWo?.woNumber || "WO-1006"}
                  </span>
                  <span className="text-[#6E6E73] text-[10.5px]">
                    (Date: {prefillWo?.date || "29/08/2026"})
                  </span>
                </span>
              </div>

              {/* Work Order Quantity */}
              <div className="flex items-center justify-between py-1 border-b border-[#EBEBF0]">
                <span className="text-[#86868B] font-semibold flex items-center gap-1.5 uppercase text-[10px]">
                  <Package className="w-3.5 h-3.5 text-[#007AFF]" />
                  <span>Work Order Quantity</span>
                </span>
                <span className="font-semibold text-[#1D1D1F]">
                  <strong className="font-mono text-[#007AFF]">{prefillWo?.orderedQty || 120} units</strong>{" "}
                  <span className="text-[#86868B] font-normal">
                    (Unscheduled: {prefillWo?.unscheduledQty || 0})
                  </span>
                </span>
              </div>

              {/* Assembly Code */}
              <div className="flex items-center justify-between py-1 border-b border-[#EBEBF0]">
                <span className="text-[#86868B] font-semibold flex items-center gap-1.5 uppercase text-[10px]">
                  <Layers className="w-3.5 h-3.5 text-[#007AFF]" />
                  <span>Assembly Code</span>
                </span>
                <span className="font-mono font-bold text-[#1D1D1F]">
                  {prefillWo?.assemblyCode || "ASSY-VOL-1007"}
                </span>
              </div>

              {/* Assembly Name */}
              <div className="flex items-center justify-between py-1 border-b border-[#EBEBF0]">
                <span className="text-[#86868B] font-semibold flex items-center gap-1.5 uppercase text-[10px]">
                  <Tag className="w-3.5 h-3.5 text-[#007AFF]" />
                  <span>Assembly Name</span>
                </span>
                <span className="font-semibold text-[#1D1D1F] text-right truncate max-w-[260px]" title={prefillWo?.assembly}>
                  {prefillWo?.assembly || "Oil Separator Return Line Assembly"}
                </span>
              </div>

              {/* Child Part Code */}
              <div className="flex items-center justify-between py-1 border-b border-[#EBEBF0]">
                <span className="text-[#86868B] font-semibold flex items-center gap-1.5 uppercase text-[10px]">
                  <CircleDot className="w-3.5 h-3.5 text-[#007AFF]" />
                  <span>Child Part Code</span>
                </span>
                <span className="font-mono font-bold text-[#007AFF]">
                  {activeComponent?.code || "CH-VOL-1007-A"}
                </span>
              </div>

              {/* Child Part Name */}
              <div className="flex items-center justify-between py-1 border-b border-[#EBEBF0]">
                <span className="text-[#86868B] font-semibold flex items-center gap-1.5 uppercase text-[10px]">
                  <Tag className="w-3.5 h-3.5 text-[#007AFF]" />
                  <span>Child Part Name</span>
                </span>
                <span className="font-semibold text-[#1D1D1F] text-right truncate max-w-[260px]" title={activeComponent?.name}>
                  {activeComponent?.name || "Oil Return U-Tube Bend"}
                </span>
              </div>

              {/* Machine No. & Name + Thumbnail */}
              <div className="flex items-center justify-between py-1 border-b border-[#EBEBF0]">
                <span className="text-[#86868B] font-semibold flex items-center gap-1.5 uppercase text-[10px]">
                  <Cpu className="w-3.5 h-3.5 text-[#007AFF]" />
                  <span>Machine No. & Name</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1D1D1F] text-right truncate max-w-[200px]">
                    {currentMachine.code} - {currentMachine.name}
                  </span>
                  <div className="w-6 h-6 rounded bg-[#E5E5EA] border border-[#D1D1D6] flex items-center justify-center shrink-0" title="Machine Image">
                    <ImageIcon className="w-3.5 h-3.5 text-[#6E6E73]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: RAW MATERIAL GRID AVAILABILITY Table */}
          <div className="rounded-xl border border-[#E5E5EA] overflow-hidden bg-white shadow-2xs">
            <div className="px-3.5 py-2.5 bg-[#F8F9FA] border-b border-[#E5E5EA] flex items-center justify-between">
              <span className="font-bold text-[11px] text-[#1D1D1F] uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>Raw Material Grid Availability</span>
              </span>

              {activeComponent && activeComponent.stock.shortage > 0 ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFEBEA] text-[#B82218] border border-[#FDCAC7] flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Raw Material Shortage ({activeComponent.stock.shortage} pcs)</span>
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EAF8EF] text-[#1E823B] border border-[#C3EED3] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>All Materials Sufficient</span>
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-[#FAFAFC] border-b border-[#E5E5EA] text-[#86868B] font-semibold text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">Component / Code</th>
                    <th className="p-2.5">Raw Material Description</th>
                    <th className="p-2.5 text-right">Req Qty</th>
                    <th className="p-2.5 text-right">Avail Stock</th>
                    <th className="p-2.5 text-center">Shortage</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5EA]">
                  {prefillWo?.components.map((comp) => {
                    const hasShort = comp.stock.shortage > 0;
                    return (
                      <tr key={comp.id} className="hover:bg-[#F9F9FB] transition-colors">
                        <td className="p-2.5">
                          <div className="font-semibold text-[#1D1D1F]">{comp.name}</div>
                          <div className="text-[10px] font-mono text-[#007AFF]">
                            {comp.code}{" "}
                            <span className="text-[#86868B] font-normal">[RM-CU-06]</span>
                          </div>
                        </td>
                        <td className="p-2.5 text-[#6E6E73] max-w-[220px]">
                          Preformed Copper Return U-Bend Blanks 3/8&quot; R25
                        </td>
                        <td className="p-2.5 text-right font-mono font-semibold text-[#1D1D1F]">
                          {comp.requiredQty.toFixed(1)} {comp.unit.toUpperCase()}
                        </td>
                        <td className="p-2.5 text-right font-mono font-semibold text-[#34C759]">
                          {comp.stock.available.toFixed(1)} {comp.unit.toUpperCase()}
                        </td>
                        <td className="p-2.5 text-center font-mono">
                          {hasShort ? (
                            <span className="text-[#FF3B30] font-bold">
                              {comp.stock.shortage} {comp.unit}
                            </span>
                          ) : (
                            <span className="text-[#86868B]">-</span>
                          )}
                        </td>
                        <td className="p-2.5 text-center">
                          {hasShort ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFEBEA] text-[#B82218] border border-[#FDCAC7]">
                              SHORTAGE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EAF8EF] text-[#1E823B] border border-[#C3EED3]">
                              OK
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  }) || (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-[#86868B]">
                        No raw material records attached to this work order.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3: Detailed Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Target Machine */}
            <div>
              <label className="block text-[10.5px] font-semibold text-[#86868B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>Target Machine</span>
              </label>
              <select
                value={selectedMachineId}
                onChange={(e) => setSelectedMachineId(e.target.value)}
                className="w-full p-2 bg-white border border-[#E5E5EA] rounded-xl text-xs font-semibold text-[#1D1D1F] outline-none focus:border-[#007AFF] shadow-2xs cursor-pointer"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} - {m.name} ({m.runningRatePerHour} pcs/hr)
                  </option>
                ))}
              </select>
            </div>

            {/* Assembly Part * */}
            <div>
              <label className="block text-[10.5px] font-semibold text-[#86868B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>Assembly Part *</span>
              </label>
              <select
                value={selectedComponentId}
                onChange={(e) => setSelectedComponentId(e.target.value)}
                className="w-full p-2 bg-white border border-[#E5E5EA] rounded-xl text-xs font-semibold text-[#007AFF] outline-none focus:border-[#007AFF] shadow-2xs cursor-pointer"
              >
                {prefillWo?.components.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name} ({c.remainingQty} {c.unit} remaining)
                  </option>
                ))}
              </select>
            </div>

            {/* Last Maintenance Date */}
            <div>
              <label className="block text-[10.5px] font-semibold text-[#86868B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>Last Maintenance</span>
              </label>
              <input
                type="text"
                value={lastMaintenanceDate}
                onChange={(e) => setLastMaintenanceDate(e.target.value)}
                className="w-full p-2 bg-[#F8F9FA] border border-[#E5E5EA] rounded-xl text-xs font-mono font-medium text-[#1D1D1F] outline-none focus:border-[#007AFF]"
              />
            </div>

            {/* Prev. Maintenance Schedule */}
            <div>
              <label className="block text-[10.5px] font-semibold text-[#86868B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>Prev. Maintenance Schedule</span>
              </label>
              <input
                type="text"
                value={prevMaintenanceDate}
                onChange={(e) => setPrevMaintenanceDate(e.target.value)}
                className="w-full p-2 bg-[#F8F9FA] border border-[#E5E5EA] rounded-xl text-xs font-mono font-medium text-[#1D1D1F] outline-none focus:border-[#007AFF]"
              />
            </div>

            {/* Shift * */}
            <div>
              <label className="block text-[10.5px] font-semibold text-[#86868B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>Shift *</span>
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as any)}
                className="w-full p-2 bg-white border border-[#E5E5EA] rounded-xl text-xs font-semibold text-[#1D1D1F] outline-none focus:border-[#007AFF] shadow-2xs cursor-pointer"
              >
                <option value="Shift A">Shift A (08:30 - 20:30)</option>
                <option value="Shift B">Shift B (20:30 - 08:30 next day)</option>
              </select>
            </div>

            {/* Tool Changed Required */}
            <div>
              <label className="block text-[10.5px] font-semibold text-[#86868B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>Tool Changed Required</span>
              </label>
              <select
                value={toolChangeRequired}
                onChange={(e) => setToolChangeRequired(e.target.value as any)}
                className="w-full p-2 bg-white border border-[#E5E5EA] rounded-xl text-xs font-medium text-[#1D1D1F] outline-none focus:border-[#007AFF] shadow-2xs cursor-pointer"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Tool Information */}
            <div>
              <label className="block text-[10.5px] font-semibold text-[#86868B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>Tool Information</span>
              </label>
              <select
                value={toolInfoMode}
                onChange={(e) => setToolInfoMode(e.target.value)}
                className="w-full p-2 bg-white border border-[#E5E5EA] rounded-xl text-xs font-medium text-[#1D1D1F] outline-none focus:border-[#007AFF] shadow-2xs cursor-pointer"
              >
                <option value="Select From Library">Select From Library</option>
                <option value="Custom Tooling Set">Custom Tooling Set</option>
                <option value="Direct Tool Mounting">Direct Tool Mounting</option>
              </select>
            </div>

            {/* Tool Library */}
            <div>
              <label className="block text-[10.5px] font-semibold text-[#86868B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>Tool Library</span>
              </label>
              <select
                value={selectedToolId}
                onChange={(e) => setSelectedToolId(e.target.value)}
                className="w-full p-2 bg-white border border-[#E5E5EA] rounded-xl text-xs font-medium text-[#1D1D1F] outline-none focus:border-[#007AFF] shadow-2xs cursor-pointer"
              >
                {tools.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code} - {t.name} ({t.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Planned Start * */}
            <div>
              <label className="block text-[10.5px] font-semibold text-[#86868B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>Planned Start *</span>
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="11:30"
                className="w-full p-2 bg-white border border-[#E5E5EA] rounded-xl text-xs font-mono font-semibold text-[#1D1D1F] outline-none focus:border-[#007AFF] shadow-2xs"
              />
            </div>

            {/* Planned End * with Duration Badge */}
            <div>
              <label className="block text-[10.5px] font-semibold text-[#86868B] uppercase tracking-wider mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#007AFF]" />
                  <span>Planned End *</span>
                </span>
                <span className="text-[9.5px] font-mono text-[#007AFF] bg-[#E8F2FE] px-1.5 py-0.2 rounded font-semibold">
                  {durationHours}h {durationMinsRemainder}m ({totalDurationMinutes} mins) Calculated End: {formattedEndTime} ({productionRate} pcs/hr)
                </span>
              </label>
              <input
                type="text"
                value={formattedEndTime}
                readOnly
                className="w-full p-2 bg-[#F8F9FA] border border-[#E5E5EA] rounded-xl text-xs font-mono font-bold text-[#1D1D1F] outline-none"
              />
            </div>

            {/* Assigned Operator */}
            <div>
              <label className="block text-[10.5px] font-semibold text-[#86868B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>Assigned Operator</span>
              </label>
              <select
                value={selectedOperatorId}
                onChange={(e) => handleOperatorChange(e.target.value)}
                className="w-full p-2 bg-white border border-[#E5E5EA] rounded-xl text-xs font-semibold text-[#1D1D1F] outline-none focus:border-[#007AFF] shadow-2xs cursor-pointer"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.empId}) • {e.attendance}
                  </option>
                ))}
              </select>
            </div>

            {/* Operator Name & EMP ID inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-[#86868B] uppercase tracking-wider mb-1">
                  Operator Name
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full p-2 bg-white border border-[#E5E5EA] rounded-xl text-xs font-medium text-[#1D1D1F] outline-none focus:border-[#007AFF] shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#86868B] uppercase tracking-wider mb-1">
                  EMP ID
                </label>
                <input
                  type="text"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  className="w-full p-2 bg-white border border-[#E5E5EA] rounded-xl text-xs font-mono font-semibold text-[#1D1D1F] outline-none focus:border-[#007AFF] shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Setup & Calibration Breakdown (JPan Custom Feature) */}
          <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E5E5EA] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#1D1D1F] flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>Setup & Calibration Breakdown</span>
              </span>
              <span className="text-[10.5px] text-[#86868B]">
                Total Setup: <strong>{totalSetupMinutes} mins</strong> | Net Run: <strong>{netRuntimeMinutes} mins</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Tool Setup */}
              <div className="p-2 rounded-lg bg-white border border-[#E5E5EA] space-y-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[11px] text-[#1D1D1F]">Tool Setup</span>
                  <label className="flex items-center gap-1 text-[10px] text-[#007AFF] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={toolSetupApplied}
                      onChange={(e) => setToolSetupApplied(e.target.checked)}
                      className="rounded text-[#007AFF]"
                    />
                    <span>{toolSetupApplied ? "Apply" : "Skip"}</span>
                  </label>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    disabled={!toolSetupApplied}
                    value={toolSetupMin}
                    onChange={(e) => setToolSetupMin(Number(e.target.value))}
                    className="w-16 p-1 text-center font-mono text-xs border rounded bg-[#F5F5F7] disabled:opacity-50"
                  />
                  <span className="text-[10px] text-[#86868B]">mins</span>
                </div>
              </div>

              {/* Program Setup */}
              <div className="p-2 rounded-lg bg-white border border-[#E5E5EA] space-y-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[11px] text-[#1D1D1F]">Program Setup</span>
                  <label className="flex items-center gap-1 text-[10px] text-[#007AFF] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={programSetupApplied}
                      onChange={(e) => setProgramSetupApplied(e.target.checked)}
                      className="rounded text-[#007AFF]"
                    />
                    <span>{programSetupApplied ? "Apply" : "Skip"}</span>
                  </label>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    disabled={!programSetupApplied}
                    value={programSetupMin}
                    onChange={(e) => setProgramSetupMin(Number(e.target.value))}
                    className="w-16 p-1 text-center font-mono text-xs border rounded bg-[#F5F5F7] disabled:opacity-50"
                  />
                  <span className="text-[10px] text-[#86868B]">mins</span>
                </div>
              </div>

              {/* Sample Inspection Setup */}
              <div className="p-2 rounded-lg bg-white border border-[#E5E5EA] space-y-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[11px] text-[#1D1D1F]">Sample Setup</span>
                  <label className="flex items-center gap-1 text-[10px] text-[#007AFF] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sampleSetupApplied}
                      onChange={(e) => setSampleSetupApplied(e.target.checked)}
                      className="rounded text-[#007AFF]"
                    />
                    <span>{sampleSetupApplied ? "Apply" : "Skip"}</span>
                  </label>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    disabled={!sampleSetupApplied}
                    value={sampleSetupMin}
                    onChange={(e) => setSampleSetupMin(Number(e.target.value))}
                    className="w-16 p-1 text-center font-mono text-xs border rounded bg-[#F5F5F7] disabled:opacity-50"
                  />
                  <span className="text-[10px] text-[#86868B]">mins</span>
                </div>
              </div>
            </div>

            {spansLunch && (
              <div className="p-2 rounded-lg bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] text-[10.5px] flex items-center justify-between">
                <span>Shift A Lunch Break (13:00 - 13:30) is spanned by this job duration.</span>
                <span className="font-bold">+30m added to planned end time</span>
              </div>
            )}
          </div>

          {/* Validation Blockers & Advisories */}
          {blockers.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#FFEBEA] border border-[#FDCAC7] text-[#B82218] space-y-1">
              <div className="font-bold text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Scheduling Blocked ({blockers.length} issues)</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                {blockers.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#FFF6E9] border border-[#FDE0B6] text-[#A65F00] space-y-1">
              <div className="font-bold text-xs flex items-center gap-1.5">
                <Info className="w-4 h-4 shrink-0" />
                <span>Operational Advisories</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Action Bar */}
        <div className="px-6 py-3.5 border-t border-[#E5E5EA] flex items-center justify-between bg-[#F8F9FA]">
          <span className="text-[11px] text-[#86868B]">
            All schedules generate a signed audit record with timestamp.
          </span>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#48484A] bg-[#E5E5EA]/70 hover:bg-[#E5E5EA] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={blockers.length > 0}
              onClick={handleConfirm}
              className={cn(
                "px-5 py-2 text-xs font-semibold rounded-xl text-white shadow-xs transition-all flex items-center gap-1.5",
                blockers.length > 0
                  ? "bg-[#D1D1D6] cursor-not-allowed text-[#86868B]"
                  : "bg-[#007AFF] hover:bg-[#0058B3] cursor-pointer"
              )}
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Save Schedule</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

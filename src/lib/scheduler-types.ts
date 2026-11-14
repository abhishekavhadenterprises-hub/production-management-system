export type MachineStatus =
  | "all"
  | "running"
  | "available"
  | "breakdown"
  | "quality_issue"
  | "offline"
  | "maintenance";

export type ShiftType = "shift-a" | "shift-b" | "all-shifts";

export type ViewMode = "tabular" | "timeline";

export interface Machine {
  id: string;
  code: string;
  name: string;
  department: string;
  section: string;
  capacity: string;
  status: MachineStatus;
  statusReason?: string;
  color: string;
  thumbnail?: string;
  compatibleOperations: string[];
  nextMaintenanceDate: string;
  runningRatePerHour: number;
}

export type WorkOrderPriority = "Urgent" | "High" | "Medium" | "Low";
export type StockReadiness = "Ready" | "Shortage" | "Blocked";

export interface StockDetail {
  required: number;
  available: number;
  reserved: number;
  shortage: number;
  unit: string;
}

export interface BOMComponent {
  id: string;
  code: string;
  name: string;
  operation: string;
  bomQty: number; // multiplier per assembly
  requiredQty: number; // total = woQty * bomQty
  scheduledBalance: number;
  goodOutput: number;
  rejects: number;
  remainingQty: number;
  unit: string;
  readyForScheduling: boolean;
  stock: StockDetail;
}

export interface WorkOrder {
  id: string;
  woNumber: string;
  date: string;
  customer: string;
  assembly: string;
  assemblyCode: string;
  priority: WorkOrderPriority;
  dueDate: string;
  orderedQty: number;
  unscheduledQty: number;
  producedQty: number;
  components: BOMComponent[];
  status: "active" | "split" | "cancelled" | "completed";
  splitCancelReason?: string;
  splitParentWo?: string;
  splitChildren?: string[];
  isSampleData: boolean;
}

export type BookingStatus =
  | "scheduled"
  | "running"
  | "paused"
  | "completed"
  | "cancelled";

export interface JobBooking {
  id: string;
  woId: string;
  woNumber: string;
  customer: string;
  componentCode: string;
  componentName: string;
  operation: string;
  machineId: string;
  machineCode: string;
  quantity: number;
  shift: "Shift A" | "Shift B";
  date: string;
  startTime: string; // e.g. "08:30"
  endTime: string; // e.g. "11:00"
  plannedDurationMinutes: number;
  status: BookingStatus;
  progressPercent: number;
  producedGoodQty: number;
  producedNgQty: number;
  toolId: string;
  toolName: string;
  operatorId: string;
  operatorName: string;
  toolSetupMinutes: number;
  programSetupMinutes: number;
  sampleSetupMinutes: number;
  toolSetupApplied?: boolean;
  programSetupApplied?: boolean;
  sampleSetupApplied?: boolean;
  approvalStatus?: "Approved" | "Pending Review" | "Draft";
  remarks?: string;
  pauseDurationMinutes?: number;
  pauseReason?: string; 
  actualStartTime?: string;   
  actualEndTime?: string;
  startDelayMinutes?: number;
  startDelayReason?: string;
  startDelayRemarks?: string;
  startDelayRecordedAt?: string;
  isSimulation?: boolean;
  virtualBoxStage?: "VB1" | "VB2" | "VB3" | "VB4";
}

export interface TimeSlot { 
  id: string;
  timeLabel: string;
  startHour: string;
  endHour: string;
  isBreak: boolean;
  breakLabel?: string;
}

export interface ToolMasterItem {
  id: string;
  code: string;
  name: string;
  type: string;
  status: "Available" | "In Use" | "Maintenance" | "Worn Out";
  compatibleMachines: string[];
}

export interface EmployeeMasterItem {
  id: string;
  empId: string;
  name: string;
  role: string;
  shift: "Shift A" | "Shift B";
  attendance: "Present" | "On Leave" | "Assigned";
  currentAssignments: string[];
}

export interface ReasonCode {
  id: string;
  category: "delay" | "split" | "cancel" | "rejection";
  code: string;
  label: string;
}

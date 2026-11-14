export type MachineStatus =
  | "available"
  | "running"
  | "breakdown"
  | "quality_issue"
  | "maintenance"
  | "offline";

export type VerificationStatus =
  | "unverified"
  | "pending_verification"
  | "verified"
  | "rejected";

export type NextProcessOption =
  | "Brazing"
  | "End Forming"
  | "IKP / BOP Transfer"
  | "Ultrasonic QC"
  | "Hydrostatic Testing"
  | "Final Packing";

export interface OeeMetrics {
  availability: number; // e.g. 85.7
  performance: number; // e.g. 100.0
  quality: number; // e.g. 100.0
  oee: number; // e.g. 85.7
}

export interface ProductionRecord {
  id: string;
  sNo: number;
  machineCode: string;
  machineName: string;
  workOrderDate: string;
  workOrderNo: string;
  customerName: string;
  assemblyPartCode: string;
  assemblyPartName: string;
  childPartCode: string;
  childPartName: string;
  planQty: number;
  achievedQty: number;
  achievedPercent: number;
  okQty: number;
  ngQty: number;
  postStatus: "draft" | "posted" | "pending_qc" | "approved";
  process: NextProcessOption;
  moveStatus: "ready" | "moved" | "pending";
  stdCycleTimeSec: number;
  ratePerHour: number;
  oee: OeeMetrics;
  machineStatus: MachineStatus;
  isLiveActive?: boolean;

  // Responsible Person Check / Role Confirmation
  verificationStatus: VerificationStatus;
  verifiedByRole?: string; // e.g. "Quality Inspector (QC-Lead)" | "Shift Production Supervisor" | "Plant QC Head"
  verifiedByName?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  rejectionReason?: string;
  operatorName?: string;
  operatorId?: string;
}

export interface ProductionKpiSummary {
  totalPlanQty: number;
  achievedQty: number;
  achievedPercent: number;
  totalNgQty: number;
  activeMachines: number;
  batchesInProgress: number;
  lastUpdated: string;
}

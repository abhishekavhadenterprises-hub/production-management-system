export type MasterStatus = "Active" | "Inactive" | "Draft";

export interface MasterConfig {
  id: string;
  title: string;
  shortDescription: string;
  codeLabel?: string;
  nameLabel?: string;
  categoryLabel?: string;
  secondaryLabel?: string;
  categories?: string[];
  secondaryOptions?: string[];
}

export interface StandardMasterItem {
  id: string;
  code: string;
  name: string;
  status: MasterStatus;
  category?: string;
  secondaryInfo?: string;
  description?: string;
  usageCount?: number;
  updatedAt?: string;
}

// BOM Master Types
export interface ChildPartMapping {
  id: string;
  partCode: string;
  partName: string;
  qtyPerAssembly: number;
  uom: string;
  targetMachineType?: string;
  remarks?: string;
  hasRawMaterial?: boolean;
  rawMaterialCode?: string;
  rawMaterialName?: string;
  consumptionPerPart?: number;
  rawMaterialUom?: string;
}

export interface BopPartMapping {
  id: string;
  bopCode: string;
  bopName: string;
  qtyPerAssembly: number;
  uom: string;
  unitCost: number;
  processStage: string;
  notes?: string;
}

export interface BomAssembly {
  id: string;
  assemblyCode: string;
  assemblyName: string;
  customer: string;
  linkedProduct: string;
  revision: string;
  description?: string;
  status: MasterStatus;
  childParts: ChildPartMapping[];
  bopParts: BopPartMapping[];
  createdAt: string;
  updatedAt: string;
}

export interface CatalogPartItem {
  partCode: string;
  partName: string;
  uom: string;
  defaultMachineType?: string;
  rawMaterialCode?: string;
  rawMaterialName?: string;
  defaultConsumption?: number;
  rawMaterialUom?: string;
}

export interface CatalogBopItem {
  bopCode: string;
  bopName: string;
  uom: string;
  defaultUnitCost: number;
  defaultStage: string;
}

// 2. Zone Master Types
export interface ZoneItem {
  id: string;
  code: string;
  name: string;
  sequence: number; // Required positive sequence
  description?: string;
  status: MasterStatus;
  createdAt?: string;
  updatedAt?: string;
}

// 3. Department Master Types
export interface DepartmentItem {
  id: string;
  code: string;
  name: string;
  remarks?: string;
  status: MasterStatus;
  sectionsCount?: number;
  employeesCount?: number;
}

// 4. Section Master Types
export interface SectionItem {
  id: string;
  code: string;
  name: string;
  parentDepartment: string; // Required
  remarks?: string;
  status: MasterStatus;
  assignedEmployeesCount?: number;
}

// 5. Employee Master Types
export interface EmployeeItem {
  id: string;
  empId: string; // string preserving leading zeros
  name: string;
  designation: string;
  department: string;
  section?: string; // filtered by department
  contactNumber?: string;
  email?: string;
  joiningDate?: string;
  remarks?: string;
  status: MasterStatus;
}

// 6. Machine Master Types
export type MachineOperationalStatus = "Available" | "Running" | "Breakdown" | "Maintenance" | "Offline";

export interface MachineMasterItem {
  id: string;
  code: string;
  name: string;
  type: string;
  department: string;
  ratedCapacity: number; // positive number
  capacityUom: string; // e.g. "pcs/hr", "meters/hr"
  operationalStatus: MachineOperationalStatus;
  serialNumber?: string;
  location?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDue?: string; // Renamed from Prev. Maintenance Schedule
  imageUrl?: string;
  remarks?: string;
  status: MasterStatus;
}

// 7. Tool Master Types
export interface ToolItem {
  id: string;
  code: string;
  name: string;
  condition: "OK" | "NG"; // If NG, remarks is required
  dimensions?: string; // e.g. "Ø28.6mm x 1.5mm CLR 45mm"
  customer?: string;
  linkedProductCode?: string;
  linkedProductName?: string;
  remarks?: string;
  status: MasterStatus;
}

// 8. Delay Reasons Master Types
export type DelayCategory = "Machine" | "Material" | "Operator" | "Quality" | "Tooling";

export interface DelayReasonItem {
  id: string;
  code: string;
  name: string;
  category: DelayCategory;
  status: MasterStatus;
  usageCount?: number;
  totalDelayMinutes?: number;
}

// 9. Cancel / Split Reasons Master Types
export type CancelSplitAppliesTo = "Cancel" | "Split" | "Both";
export type CancelSplitCategory = "Order Cancellation" | "Order Split" | "Schedule Deferral" | "Engineering Revision" | "Customer Request" | "Production Issue";

export interface CancelSplitReasonItem {
  id: string;
  code: string;
  name: string;
  category: CancelSplitCategory;
  appliesTo: CancelSplitAppliesTo;
  description?: string;
  status: MasterStatus;
  usageCount?: number;
}

// 10. Virtual Box Master Types
export interface VirtualBoxItem {
  id: string;
  code: string;
  name: string;
  fromZone: string;
  toZone: string;
  minStock?: number;
  maxCapacity?: number;
  uom: string;
  currentStock: number; // read-only calculated balance
  bufferHealth: "Optimal" | "Low Buffer" | "Critical" | "Overflow Warning";
  status: MasterStatus;
}

// 11. Assembly Route Card Types
export interface RouteStage {
  stageSequence: number;
  zoneCode: string;
  stageName: string;
  virtualBoxCode?: string;
  remarks?: string;
}

export interface AssemblyRouteItem {
  id: string;
  assemblyCode: string;
  assemblyName: string;
  bomRevision: string;
  componentCount: number;
  routeStatus: "Configured" | "Pending Configuration";
  stages: RouteStage[];
  updatedAt: string;
}

// 12. Inventory & Stock Types
export interface InventoryStockItem {
  id: string;
  itemCode: string;
  itemName: string;
  itemType: "Raw Material" | "Bought-Out Part (BOP)" | "Fabricated Child Part" | "Finished Assembly";
  warehouse: string;
  uom: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number; // current - reserved
  minimumStock: number;
  stockHealth: "Normal" | "Low Stock" | "Out of Stock" | "Excess";
  lastStockUpdate: string;
}

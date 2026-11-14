export interface AssignmentZoneValues {
  virtualBox0: number | "N/A";
  machineZone: number | "N/A";
  virtualBox1: number | "N/A";
  brazingZone: number | "N/A";
  virtualBox2: number | "N/A";
  leakTestingZone: number | "N/A";
  virtualBox3: number | "N/A";
  packingZone: number | "N/A";
  virtualBox4: number | "N/A";
  fgZone: number | "N/A";
}

export interface AssignmentPartItem {
  id: string;
  partCode: string;
  partName: string;
  routing: string;
  category: "Child Part" | "BOP";
  workOrderQty: number;
  stockQty: number;
  zones: AssignmentZoneValues;
  hasStoreTransferLink?: boolean;
}

export interface WorkOrderAssignment {
  id: string;
  workOrderNo: string;
  orderDate: string;
  planQty: number;
  customerName: string;
  assemblyPartNo: string;
  assemblyPartName: string;
  status: "Pending Auth" | "Authorized";
  savedCount: number;
  items: AssignmentPartItem[];
}

export const INITIAL_ASSIGNMENTS: WorkOrderAssignment[] = [
  {
    id: "wo-1040",
    workOrderNo: "WO-1040",
    orderDate: "24-Sep-2026",
    planQty: 200,
    customerName: "Carrier Air-Conditioning & Refrigeration Ltd",
    assemblyPartNo: "ASSY-CAR-1003",
    assemblyPartName: "Refrigeration Liquid Tube Assembly Unit",
    status: "Pending Auth",
    savedCount: 6,
    items: [
      {
        id: "wo-1040-1",
        partCode: "CH-CAR-1003-A",
        partName: "Main Suction Header Tube",
        routing: "Machine → Pre-Brazing (VB1) → Brazing → Leak Testing → Packing → FG",
        category: "Child Part",
        workOrderQty: 200,
        stockQty: 0,
        zones: {
          virtualBox0: 0,
          machineZone: 200,
          virtualBox1: 0,
          brazingZone: 0,
          virtualBox2: 0,
          leakTestingZone: 0,
          virtualBox3: 0,
          packingZone: 0,
          virtualBox4: 0,
          fgZone: 0,
        },
      },
      {
        id: "wo-1040-2",
        partCode: "CH-CAR-1003-B",
        partName: "Liquid Line Feed Pipe Ø10mm",
        routing: "Machine → Pre-Brazing (VB1) → Brazing → Leak Testing → Packing → FG",
        category: "Child Part",
        workOrderQty: 200,
        stockQty: 0,
        zones: {
          virtualBox0: 0,
          machineZone: 200,
          virtualBox1: 0,
          brazingZone: 0,
          virtualBox2: 0,
          leakTestingZone: 0,
          virtualBox3: 0,
          packingZone: 0,
          virtualBox4: 0,
          fgZone: 0,
        },
      },
      {
        id: "wo-1040-3",
        partCode: "CH-CAR-1003-C",
        partName: "Expansion Tube Reducer 10-8mm",
        routing: "Machine → Pre-Brazing (VB1) → Brazing → Leak Testing → Packing → FG",
        category: "Child Part",
        workOrderQty: 200,
        stockQty: 0,
        zones: {
          virtualBox0: 0,
          machineZone: 200,
          virtualBox1: 0,
          brazingZone: 0,
          virtualBox2: 0,
          leakTestingZone: 0,
          virtualBox3: 0,
          packingZone: 0,
          virtualBox4: 0,
          fgZone: 0,
        },
      },
      {
        id: "wo-1040-4",
        partCode: "BOP-03",
        partName: "Copper Filter Drier 15g",
        routing: "Store → Virtual Box 1 → Brazing",
        category: "BOP",
        workOrderQty: 0,
        stockQty: 500,
        zones: {
          virtualBox0: "N/A",
          machineZone: "N/A",
          virtualBox1: 10,
          brazingZone: 0,
          virtualBox2: 0,
          leakTestingZone: 0,
          virtualBox3: 0,
          packingZone: 0,
          virtualBox4: 0,
          fgZone: 0,
        },
        hasStoreTransferLink: true,
      },
      {
        id: "wo-1040-5",
        partCode: "BOP-04",
        partName: 'Silfos Brazing Ring 1/2"',
        routing: "Store → Virtual Box 1 → Brazing",
        category: "BOP",
        workOrderQty: 0,
        stockQty: 620,
        zones: {
          virtualBox0: "N/A",
          machineZone: "N/A",
          virtualBox1: 0,
          brazingZone: 0,
          virtualBox2: 0,
          leakTestingZone: 0,
          virtualBox3: 0,
          packingZone: 0,
          virtualBox4: 0,
          fgZone: 0,
        },
        hasStoreTransferLink: true,
      },
      {
        id: "wo-1040-6",
        partCode: "BOP-07",
        partName: 'Plastic Dust Seal Cap 1/4"',
        routing: "Store → Virtual Box 1 → Packing",
        category: "BOP",
        workOrderQty: 0,
        stockQty: 500,
        zones: {
          virtualBox0: "N/A",
          machineZone: "N/A",
          virtualBox1: 0,
          brazingZone: "N/A",
          virtualBox2: 0,
          leakTestingZone: "N/A",
          virtualBox3: 0,
          packingZone: 0,
          virtualBox4: 0,
          fgZone: 0,
        },
      },
    ],
  },
  {
    id: "wo-1039",
    workOrderNo: "WO-1039",
    orderDate: "24-Sep-2026",
    planQty: 280,
    customerName: "Carrier Commercial Refrigeration Ltd",
    assemblyPartNo: "ASSY-CAR-1010",
    assemblyPartName: "Evaporator Distributor Loop Assembly",
    status: "Authorized",
    savedCount: 3,
    items: [
      {
        id: "wo-1039-1",
        partCode: "CH-CAR-1010-A",
        partName: "Distributor Manifold Tube 22mm",
        routing: "Machine → Pre-Brazing (VB1) → Brazing → Leak Testing → Packing → FG",
        category: "Child Part",
        workOrderQty: 280,
        stockQty: 0,
        zones: {
          virtualBox0: 0,
          machineZone: 280,
          virtualBox1: 0,
          brazingZone: 0,
          virtualBox2: 0,
          leakTestingZone: 0,
          virtualBox3: 0,
          packingZone: 0,
          virtualBox4: 0,
          fgZone: 0,
        },
      },
      {
        id: "wo-1039-2",
        partCode: "CH-CAR-1010-B",
        partName: "Capillary Outlet Tube Bundle",
        routing: "Machine → Pre-Brazing (VB1) → Brazing → Leak Testing → Packing → FG",
        category: "Child Part",
        workOrderQty: 280,
        stockQty: 0,
        zones: {
          virtualBox0: 0,
          machineZone: 280,
          virtualBox1: 0,
          brazingZone: 0,
          virtualBox2: 0,
          leakTestingZone: 0,
          virtualBox3: 0,
          packingZone: 0,
          virtualBox4: 0,
          fgZone: 0,
        },
      },
      {
        id: "wo-1039-3",
        partCode: "BOP-02",
        partName: "Distributor Body Brass 4-Way",
        routing: "Store → Virtual Box 1 → Brazing",
        category: "BOP",
        workOrderQty: 0,
        stockQty: 450,
        zones: {
          virtualBox0: "N/A",
          machineZone: "N/A",
          virtualBox1: 280,
          brazingZone: 0,
          virtualBox2: 0,
          leakTestingZone: 0,
          virtualBox3: 0,
          packingZone: 0,
          virtualBox4: 0,
          fgZone: 0,
        },
        hasStoreTransferLink: true,
      },
    ],
  },
  {
    id: "wo-1036",
    workOrderNo: "WO-1036",
    orderDate: "24-Sep-2026",
    planQty: 300,
    customerName: "Godrej Appliances (Godrej & Boyce Mfg Co)",
    assemblyPartNo: "ASSY-GOD-1007",
    assemblyPartName: "Accumulator Inlet Suction Tree Assembly",
    status: "Pending Auth",
    savedCount: 4,
    items: [
      {
        id: "wo-1036-1",
        partCode: "CH-GOD-1007-A",
        partName: "4-Branch Copper Header Pipe 22.2mm",
        routing: "Machine → Pre-Brazing (VB1) → Brazing → Leak Testing → Packing → FG",
        category: "Child Part",
        workOrderQty: 300,
        stockQty: 240,
        zones: {
          virtualBox0: 0,
          machineZone: 300,
          virtualBox1: 0,
          brazingZone: 0,
          virtualBox2: 0,
          leakTestingZone: 0,
          virtualBox3: 0,
          packingZone: 0,
          virtualBox4: 0,
          fgZone: 0,
        },
      },
      {
        id: "wo-1036-2",
        partCode: "PB-GOD-1007-B",
        partName: "End Cap Seal Plug 22.2mm Copper",
        routing: "Machine → Pre-Brazing (VB1) → Brazing → Leak Testing → Packing → FG",
        category: "Child Part",
        workOrderQty: 300,
        stockQty: 550,
        zones: {
          virtualBox0: 0,
          machineZone: 300,
          virtualBox1: 0,
          brazingZone: 0,
          virtualBox2: 0,
          leakTestingZone: 0,
          virtualBox3: 0,
          packingZone: 0,
          virtualBox4: 0,
          fgZone: 0,
        },
      },
      {
        id: "wo-1036-3",
        partCode: "BR-GOD-1007-C",
        partName: "Induction Brazing Ring BCuP-5",
        routing: "Store → Virtual Box 1 → Brazing",
        category: "BOP",
        workOrderQty: 0,
        stockQty: 600,
        zones: {
          virtualBox0: "N/A",
          machineZone: "N/A",
          virtualBox1: 300,
          brazingZone: 0,
          virtualBox2: 0,
          leakTestingZone: 0,
          virtualBox3: 0,
          packingZone: 0,
          virtualBox4: 0,
          fgZone: 0,
        },
        hasStoreTransferLink: true,
      },
      {
        id: "wo-1036-4",
        partCode: "BOP-SCH-01",
        partName: 'Schrader Valve 1/4" Flare',
        routing: "Store → Virtual Box 1 → Brazing",
        category: "BOP",
        workOrderQty: 0,
        stockQty: 850,
        zones: {
          virtualBox0: "N/A",
          machineZone: "N/A",
          virtualBox1: 0,
          brazingZone: 0,
          virtualBox2: 0,
          leakTestingZone: 0,
          virtualBox3: 0,
          packingZone: 0,
          virtualBox4: 0,
          fgZone: 0,
        },
        hasStoreTransferLink: true,
      },
    ],
  },
];

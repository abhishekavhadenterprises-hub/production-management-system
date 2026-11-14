export interface BopPartItem {
  id: string;
  partCode: string;
  partName: string;
  type: "BOP" | "Child";
  bomQty: number;
  requiredQty: number;
  storeStock: number;
  unit: string;
  selected: boolean;
  transferQty: number;
}

export interface BopWorkOrder {
  id: string;
  sNo: number;
  customerCode: string;
  customerName: string;
  workOrderDate: string;
  workOrderNo: string;
  planQty: number;
  assemblyPartCode: string;
  assemblyPartName: string;
  bomRevision: string;
  childPartsCount: number;
  bopPartsCount: number;
  parts: BopPartItem[];
  destinationZone: string;
  transferred?: boolean;
  transferredAt?: string;
  transferredQty?: number;
}

export const INITIAL_BOP_WORK_ORDERS: BopWorkOrder[] = [
  {
    id: "bop-1",
    sNo: 1,
    customerCode: "CUST-CAR002",
    customerName: "Carrier Air-Conditioning & Refrigeration Ltd",
    workOrderDate: "24/09/2026",
    workOrderNo: "WO-1040",
    planQty: 200,
    assemblyPartCode: "ASSY-CAR-1011",
    assemblyPartName: "Refrigeration Liquid Tube Assembly Unit",
    bomRevision: "v1",
    childPartsCount: 5,
    bopPartsCount: 3,
    destinationZone: "Virtual Box 1",
    parts: [
      { id: "p1", partCode: "BOP-SCH-01", partName: "Schrader Access Valve 1/4\" SAE", type: "BOP", bomQty: 1, requiredQty: 200, storeStock: 850, unit: "pcs", selected: true, transferQty: 200 },
      { id: "p2", partCode: "BOP-OR-02", partName: "HNBR Green O-Ring Seal 12x2.5", type: "BOP", bomQty: 2, requiredQty: 400, storeStock: 2400, unit: "pcs", selected: true, transferQty: 400 },
      { id: "p3", partCode: "BOP-BR-03", partName: "BCuP-5 Brazing Alloy Ring 22.2mm", type: "BOP", bomQty: 4, requiredQty: 800, storeStock: 3200, unit: "pcs", selected: true, transferQty: 800 },
      { id: "p4", partCode: "CP-CAR-101", partName: "Liquid Tube Main Run 15.8mm", type: "Child", bomQty: 1, requiredQty: 200, storeStock: 450, unit: "pcs", selected: false, transferQty: 0 },
      { id: "p5", partCode: "CP-CAR-102", partName: "Discharge Pigtail 9.52mm", type: "Child", bomQty: 1, requiredQty: 200, storeStock: 310, unit: "pcs", selected: false, transferQty: 0 },
    ],
  },
  {
    id: "bop-2",
    sNo: 2,
    customerCode: "CUST-002",
    customerName: "Carrier Commercial Refrigeration Ltd",
    workOrderDate: "24/09/2026",
    workOrderNo: "WO-1039",
    planQty: 280,
    assemblyPartCode: "ASSY-CAR-1010",
    assemblyPartName: "Evaporator Distributor Loop Assembly",
    bomRevision: "v1",
    childPartsCount: 2,
    bopPartsCount: 1,
    destinationZone: "Virtual Box 1",
    parts: [
      { id: "p6", partCode: "BOP-DIST-01", partName: "Brass 4-Way Refrigerant Distributor", type: "BOP", bomQty: 1, requiredQty: 280, storeStock: 620, unit: "pcs", selected: true, transferQty: 280 },
      { id: "p7", partCode: "CP-CAR-201", partName: "Distributor Capillary Feeder Tube", type: "Child", bomQty: 4, requiredQty: 1120, storeStock: 1800, unit: "pcs", selected: false, transferQty: 0 },
    ],
  },
  {
    id: "bop-3",
    sNo: 3,
    customerCode: "CUST-008",
    customerName: "Mitsubishi Electric India Pvt Ltd",
    workOrderDate: "24/09/2026",
    workOrderNo: "WO-1038",
    planQty: 160,
    assemblyPartCode: "ASSY-MIT-1009",
    assemblyPartName: "Automotive Sub-Cooler Line Assembly",
    bomRevision: "v1",
    childPartsCount: 4,
    bopPartsCount: 1,
    destinationZone: "Virtual Box 1",
    parts: [
      { id: "p8", partCode: "BOP-SENS-01", partName: "Temperature Sensor Well Copper Plug", type: "BOP", bomQty: 1, requiredQty: 160, storeStock: 480, unit: "pcs", selected: true, transferQty: 160 },
      { id: "p9", partCode: "CP-MIT-301", partName: "Sub-Cooler Heat Exchanger Run", type: "Child", bomQty: 1, requiredQty: 160, storeStock: 350, unit: "pcs", selected: false, transferQty: 0 },
    ],
  },
  {
    id: "bop-4",
    sNo: 4,
    customerCode: "CUST-009",
    customerName: "Havells India Ltd (Lloyd Division)",
    workOrderDate: "24/09/2026",
    workOrderNo: "WO-1037",
    planQty: 190,
    assemblyPartCode: "ASSY-HAV-1008",
    assemblyPartName: "Hairpin Return Bend Assembly Unit",
    bomRevision: "v1",
    childPartsCount: 2,
    bopPartsCount: 2,
    destinationZone: "Virtual Box 1",
    parts: [
      { id: "p10", partCode: "BOP-RING-01", partName: "Silver Phosphorus Braze Ring 9.52", type: "BOP", bomQty: 2, requiredQty: 380, storeStock: 1450, unit: "pcs", selected: true, transferQty: 380 },
      { id: "p11", partCode: "BOP-CAP-02", partName: "Plastic Protection End Cap 3/8\"", type: "BOP", bomQty: 2, requiredQty: 380, storeStock: 2200, unit: "pcs", selected: true, transferQty: 380 },
    ],
  },
  {
    id: "bop-5",
    sNo: 5,
    customerCode: "CUST-005",
    customerName: "Godrej Appliances (Godrej & Boyce Mfg Co)",
    workOrderDate: "24/09/2026",
    workOrderNo: "WO-1036",
    planQty: 300,
    assemblyPartCode: "ASSY-GOD-1007",
    assemblyPartName: "Accumulator Inlet Suction Tree Assembly",
    bomRevision: "v1",
    childPartsCount: 2,
    bopPartsCount: 2,
    destinationZone: "Virtual Box 1",
    parts: [
      { id: "p12", partCode: "BOP-BR-GOD", partName: "Induction Brazing Preform Ring BCuP-5", type: "BOP", bomQty: 4, requiredQty: 1200, storeStock: 1600, unit: "pcs", selected: true, transferQty: 1200 },
      { id: "p13", partCode: "BOP-GASK-01", partName: "Neoprene Vibration Damping Grommet", type: "BOP", bomQty: 1, requiredQty: 300, storeStock: 950, unit: "pcs", selected: true, transferQty: 300 },
      { id: "p14", partCode: "CP-GOD-101", partName: "Suction Tree Copper Arm 22.2mm", type: "Child", bomQty: 1, requiredQty: 300, storeStock: 450, unit: "pcs", selected: false, transferQty: 0 },
    ],
  },
  {
    id: "bop-6",
    sNo: 6,
    customerCode: "CUST-007",
    customerName: "Hitachi Home & Life Solutions Ltd",
    workOrderDate: "24/09/2026",
    workOrderNo: "WO-1035",
    planQty: 250,
    assemblyPartCode: "ASSY-HIT-1006",
    assemblyPartName: "Muffler Discharge Loop Assembly",
    bomRevision: "v1",
    childPartsCount: 2,
    bopPartsCount: 2,
    destinationZone: "Virtual Box 1",
    parts: [
      { id: "p15", partCode: "BOP-MUFF-01", partName: "Steel Pulsation Muffler Canister", type: "BOP", bomQty: 1, requiredQty: 250, storeStock: 420, unit: "pcs", selected: true, transferQty: 250 },
      { id: "p16", partCode: "BOP-RING-HIT", partName: "Copper-Phosphorus Preform Ring", type: "BOP", bomQty: 2, requiredQty: 500, storeStock: 1850, unit: "pcs", selected: true, transferQty: 500 },
    ],
  },
  {
    id: "bop-7",
    sNo: 7,
    customerCode: "CUST-006",
    customerName: "Panasonic Life Solutions India Pvt Ltd",
    workOrderDate: "24/09/2026",
    workOrderNo: "WO-1034",
    planQty: 150,
    assemblyPartCode: "ASSY-PAN-1005",
    assemblyPartName: "Oil Separator Return Line Assembly",
    bomRevision: "v1",
    childPartsCount: 2,
    bopPartsCount: 2,
    destinationZone: "Virtual Box 1",
    parts: [
      { id: "p17", partCode: "BOP-FLTR-01", partName: "Brass In-line Strainer Filter Mesh", type: "BOP", bomQty: 1, requiredQty: 150, storeStock: 380, unit: "pcs", selected: true, transferQty: 150 },
      { id: "p18", partCode: "BOP-FLUX-02", partName: "Braze Paste Dispenser Unit", type: "BOP", bomQty: 1, requiredQty: 150, storeStock: 500, unit: "pcs", selected: true, transferQty: 150 },
    ],
  },
  {
    id: "bop-8",
    sNo: 8,
    customerCode: "CUST-004",
    customerName: "Blue Star Industrial HVAC Products",
    workOrderDate: "24/09/2026",
    workOrderNo: "WO-1033",
    planQty: 220,
    assemblyPartCode: "ASSY-BLU-1004",
    assemblyPartName: "Muffler Discharge Loop Assembly",
    bomRevision: "v1",
    childPartsCount: 2,
    bopPartsCount: 2,
    destinationZone: "Virtual Box 1",
    parts: [
      { id: "p19", partCode: "BOP-VALV-03", partName: "Charging Port Brass Valve 1/4", type: "BOP", bomQty: 1, requiredQty: 220, storeStock: 600, unit: "pcs", selected: true, transferQty: 220 },
      { id: "p20", partCode: "BOP-CAP-04", partName: "Brass Sealing Flare Cap", type: "BOP", bomQty: 1, requiredQty: 220, storeStock: 900, unit: "pcs", selected: true, transferQty: 220 },
    ],
  },
  {
    id: "bop-9",
    sNo: 9,
    customerCode: "CUST-003",
    customerName: "Voltas Engineering & Cooling Systems",
    workOrderDate: "24/09/2026",
    workOrderNo: "WO-1032",
    planQty: 180,
    assemblyPartCode: "ASSY-VOL-1003",
    assemblyPartName: "Liquid Tube Assembly",
    bomRevision: "v1",
    childPartsCount: 2,
    bopPartsCount: 3,
    destinationZone: "Virtual Box 1",
    parts: [
      { id: "p21", partCode: "BOP-NUT-01", partName: "Brass Flare Nut 3/8\" Heavy", type: "BOP", bomQty: 2, requiredQty: 360, storeStock: 1100, unit: "pcs", selected: true, transferQty: 360 },
      { id: "p22", partCode: "BOP-PLUG-02", partName: "Rubber Dust Stopper Cap 9.52", type: "BOP", bomQty: 2, requiredQty: 360, storeStock: 2500, unit: "pcs", selected: true, transferQty: 360 },
    ],
  },
  {
    id: "bop-10",
    sNo: 10,
    customerCode: "CUST-002",
    customerName: "Carrier Commercial Refrigeration Ltd",
    workOrderDate: "24/09/2026",
    workOrderNo: "WO-1031",
    planQty: 300,
    assemblyPartCode: "ASSY-CAR-1002",
    assemblyPartName: "Discharge Line Assembly",
    bomRevision: "v1",
    childPartsCount: 1,
    bopPartsCount: 1,
    destinationZone: "Virtual Box 1",
    parts: [
      { id: "p23", partCode: "BOP-FLNG-01", partName: "2-Bolt Mounting Steel Flange", type: "BOP", bomQty: 1, requiredQty: 300, storeStock: 740, unit: "pcs", selected: true, transferQty: 300 },
    ],
  },
  {
    id: "bop-11",
    sNo: 11,
    customerCode: "CUST-001",
    customerName: "Daikin Airconditioning India Pvt Ltd",
    workOrderDate: "24/09/2026",
    workOrderNo: "WO-1030",
    planQty: 250,
    assemblyPartCode: "ASSY-DAI-1001",
    assemblyPartName: "Automotive Suction Line Assembly",
    bomRevision: "v1",
    childPartsCount: 3,
    bopPartsCount: 1,
    destinationZone: "Virtual Box 1",
    parts: [
      { id: "p24", partCode: "BOP-CLMP-01", partName: "Stainless Steel Cushion Clamp 28mm", type: "BOP", bomQty: 1, requiredQty: 250, storeStock: 680, unit: "pcs", selected: true, transferQty: 250 },
    ],
  },
  {
    id: "bop-12",
    sNo: 12,
    customerCode: "CUST-008",
    customerName: "Mitsubishi Electric India Pvt Ltd",
    workOrderDate: "10/08/2026",
    workOrderNo: "WO-1029",
    planQty: 90,
    assemblyPartCode: "ASSY-MIT-1000",
    assemblyPartName: "Automotive Sub-Cooler Line Assembly",
    bomRevision: "v1",
    childPartsCount: 4,
    bopPartsCount: 1,
    destinationZone: "Virtual Box 1",
    parts: [
      { id: "p25", partCode: "BOP-RING-MIT2", partName: "Flux-Cored Braze Ring 12.7mm", type: "BOP", bomQty: 2, requiredQty: 180, storeStock: 820, unit: "pcs", selected: true, transferQty: 180 },
    ],
  },
  {
    id: "bop-13",
    sNo: 13,
    customerCode: "CUST-009",
    customerName: "Havells India Ltd (Lloyd Division)",
    workOrderDate: "09/08/2026",
    workOrderNo: "WO-1028",
    planQty: 65,
    assemblyPartCode: "ASSY-HAV-0999",
    assemblyPartName: "Hairpin Return Bend Assembly Unit",
    bomRevision: "v1",
    childPartsCount: 2,
    bopPartsCount: 2,
    destinationZone: "Virtual Box 1",
    parts: [
      { id: "p26", partCode: "BOP-CAP-HAV", partName: "Moisture-Proof Vinyl Cap 9.52", type: "BOP", bomQty: 2, requiredQty: 130, storeStock: 1900, unit: "pcs", selected: true, transferQty: 130 },
    ],
  },
  {
    id: "bop-14",
    sNo: 14,
    customerCode: "CUST-005",
    customerName: "Godrej Appliances (Godrej & Boyce Mfg Co)",
    workOrderDate: "08/08/2026",
    workOrderNo: "WO-1027",
    planQty: 160,
    assemblyPartCode: "ASSY-GOD-0998",
    assemblyPartName: "Accumulator Inlet Suction Tree Assembly",
    bomRevision: "v1",
    childPartsCount: 2,
    bopPartsCount: 2,
    destinationZone: "Virtual Box 1",
    parts: [
      { id: "p27", partCode: "BOP-ORING-GOD", partName: "Viton High-Temp O-Ring 19mm", type: "BOP", bomQty: 1, requiredQty: 160, storeStock: 940, unit: "pcs", selected: true, transferQty: 160 },
    ],
  },
];

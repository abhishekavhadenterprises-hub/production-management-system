export interface BrazingItem {
  id: string;
  sNo: number;
  machineCode: string;
  machineName: string;
  customerName: string;
  customerShort: string;
  workOrderNo: string;
  workOrderDate: string;
  assemblyPartCode: string;
  assemblyPartName: string;
  assemblyPartShort: string;
  partTag: string;
  planQty: number;
  achievedQty: number;
  achievedPercent: number;
  okQty: number;
  ngQty: number;
  nextProcess: string;
  isCompleted?: boolean;
}

export const INITIAL_BRAZING_ITEMS: BrazingItem[] = [
  {
    id: "br-1",
    sNo: 1,
    machineCode: "CNC-TB-01",
    machineName: "Standard Machine",
    customerName: "Carrier Commercial Refrigeration Ltd",
    customerShort: "Carrier Commercial Refri...",
    workOrderNo: "WO-1005",
    workOrderDate: "28/08/2026",
    assemblyPartCode: "CH-CAR-1004-A",
    assemblyPartName: "Multi-port Distributor Header Assy",
    assemblyPartShort: "Multi-port Distributor He...",
    partTag: "-BR",
    planQty: 250,
    achievedQty: 248,
    achievedPercent: 99.2,
    okQty: 248,
    ngQty: 0,
    nextProcess: "Leak Test",
  },
  {
    id: "br-2",
    sNo: 2,
    machineCode: "CNC-TB-02",
    machineName: "Standard Machine",
    customerName: "Daikin Airconditioning India Pvt Ltd",
    customerShort: "Daikin Airconditioning In...",
    workOrderNo: "WO-1001",
    workOrderDate: "29/08/2026",
    assemblyPartCode: "CH-DAI-2002-B",
    assemblyPartName: "Main Suction Header Tube",
    assemblyPartShort: "Main Suction Header Tube",
    partTag: "-BR",
    planQty: 120,
    achievedQty: 120,
    achievedPercent: 100,
    okQty: 90,
    ngQty: 0,
    nextProcess: "Leak Test",
  },
  {
    id: "br-3",
    sNo: 3,
    machineCode: "CNC-TB-03",
    machineName: "Standard Machine",
    customerName: "Voltas Engineering & Cooling Systems",
    customerShort: "Voltas Engineering & Coo...",
    workOrderNo: "WO-1003-A1",
    workOrderDate: "31/08/2026",
    assemblyPartCode: "CH-VOL-3014-D",
    assemblyPartName: "Equalizer Port Tube",
    assemblyPartShort: "Equalizer Port Tube",
    partTag: "-BR",
    planQty: 150,
    achievedQty: 145,
    achievedPercent: 96.7,
    okQty: 145,
    ngQty: 0,
    nextProcess: "Leak Test",
  },
  {
    id: "br-4",
    sNo: 4,
    machineCode: "CNC-TB-05",
    machineName: "Standard Machine",
    customerName: "Voltas Engineering & Cooling Systems",
    customerShort: "Voltas Engineering & Coo...",
    workOrderNo: "WO-1003",
    workOrderDate: "29/08/2026",
    assemblyPartCode: "CH-VOL-2003-D",
    assemblyPartName: "Expansion Tube Reducer Assembly",
    assemblyPartShort: "Expansion Tube Reducer ...",
    partTag: "-BR",
    planQty: 200,
    achievedQty: 50,
    achievedPercent: 25,
    okQty: 50,
    ngQty: 0,
    nextProcess: "Leak Test",
  },
];

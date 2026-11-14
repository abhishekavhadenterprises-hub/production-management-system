import React, { useState, useEffect } from "react";
import {
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Filter,
  Package,
  Wrench,
  Flame,
  ShieldCheck,
  Box,
  Truck,
  Check,
  X,
  Sparkles,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PremiumDropdown } from "@/components/ui/premium-dropdown";
import { PremiumCheckbox } from "@/components/ui/premium-switch";

interface StagePipelineItem {
  id: string;
  stageNumber: string;
  name: string;
  description: string;
  colorScheme: "gray" | "blue" | "amber" | "teal" | "green" | "yellow" | "dark";
}

interface VirtualBoxCardData {
  id: string;
  title: string;
  shortCode: string;
  linesCount: number;
  totalQty: number;
  goodQty?: number;
  ngQty?: number;
  hasDetails?: boolean;
}

interface CompletedProductionRow {
  sNo: number;
  machineName: string;
  machineType: string;
  workOrderDate: string;
  workOrderNo: string;
  customer: string;
  assemblyCode: string;
  assemblyName: string;
  childPartCode: string;
  childPartName: string;
  planQty: number;
  goodQty: number;
  ngQty: number;
  bopRequired: "Yes" | "No";
  bopStatus: string;
  partCode: string;
  bomQty: number;
  targetProcess: string;
  status: "ready_to_move" | "moved_to_brazing";
}

const PIPELINE_STAGES: StagePipelineItem[] = [
  {
    id: "stage-0",
    stageNumber: "STAGE 0",
    name: "Store Virtual Box",
    description: "Raw Materials & BOP Intake",
    colorScheme: "gray",
  },
  {
    id: "stage-1",
    stageNumber: "STAGE 1",
    name: "Machine Production",
    description: "Child Parts Formed",
    colorScheme: "blue",
  },
  {
    id: "stage-buffer",
    stageNumber: "STAGE BUFFER",
    name: "Pre Brazing Virtual Box",
    description: "Child & BOP Prep Buffer",
    colorScheme: "amber",
  },
  {
    id: "stage-2",
    stageNumber: "STAGE 2",
    name: "Brazing Section",
    description: "Child + BOP Brazed",
    colorScheme: "teal",
  },
  {
    id: "stage-3",
    stageNumber: "STAGE 3",
    name: "Leak Testing Gate",
    description: "Quality Pressure PASS",
    colorScheme: "green",
  },
  {
    id: "stage-4",
    stageNumber: "STAGE 4",
    name: "Packing Check",
    description: "Completeness Verified",
    colorScheme: "yellow",
  },
  {
    id: "stage-5",
    stageNumber: "STAGE 5",
    name: "Finished Goods (FG)",
    description: "Ready for Dispatch",
    colorScheme: "dark",
  },
];

const INITIAL_VIRTUAL_BOXES: VirtualBoxCardData[] = [
  {
    id: "stage-0",
    title: "Store Virtual Box",
    shortCode: "ST",
    linesCount: 0,
    totalQty: 0,
  },
  {
    id: "stage-1",
    title: "Machine(Child Part)Production Zone",
    shortCode: "Machine",
    linesCount: 33,
    totalQty: 260,
    goodQty: 258,
    ngQty: 2,
    hasDetails: true,
  },
  {
    id: "stage-buffer",
    title: "Virtual Box 1",
    shortCode: "VB1",
    linesCount: 1,
    totalQty: 10,
    hasDetails: true,
  },
  {
    id: "stage-2",
    title: "Brazing Zone",
    shortCode: "Brazing",
    linesCount: 1,
    totalQty: 380,
    hasDetails: true,
  },
  {
    id: "stage-3",
    title: "Leak Testing Zone",
    shortCode: "Leak Test",
    linesCount: 2,
    totalQty: 80,
    hasDetails: true,
  },
  {
    id: "stage-4",
    title: "Packing Zone",
    shortCode: "Packing",
    linesCount: 2,
    totalQty: 55,
    hasDetails: true,
  },
  {
    id: "stage-5",
    title: "FG Zone",
    shortCode: "FG",
    linesCount: 1,
    totalQty: 40,
    hasDetails: true,
  },
];

const THROUGHPUT_DATA = [
  { label: "Machine", qty: 11278, percent: 92 },
  { label: "VB1", qty: 10, percent: 2 },
  { label: "Brazing", qty: 380, percent: 8 },
  { label: "Leak Test", qty: 80, percent: 3 },
  { label: "Packing", qty: 55, percent: 2 },
  { label: "FG", qty: 40, percent: 2 },
];

const INITIAL_COMPLETED_ROWS: CompletedProductionRow[] = [
  {
    sNo: 1,
    machineName: "CNC-TB-01",
    machineType: "Machine",
    workOrderDate: "24/10/26",
    workOrderNo: "WO-1036",
    customer: "Havells India Ltd (Lloyd Div)",
    assemblyCode: "ASSY-HAV-1009",
    assemblyName: "Header Return Bend Assembly",
    childPartCode: "CH-HAV-1010-A",
    childPartName: "Header 3/8\" Copper Tube Return",
    planQty: 65,
    goodQty: 65,
    ngQty: 1,
    bopRequired: "Yes",
    bopStatus: "100% Loaded",
    partCode: "CP-HAV-1010-A",
    bomQty: 4,
    targetProcess: "Brazing",
    status: "ready_to_move",
  },
  {
    sNo: 2,
    machineName: "CNC-TB-02",
    machineType: "Machine",
    workOrderDate: "24/10/26",
    workOrderNo: "WO-1038",
    customer: "Hitachi Home & Life Solutions",
    assemblyCode: "ASSY-HIT-2009",
    assemblyName: "Muffler Discharge Loop Assembly",
    childPartCode: "CH-HIT-2001-A",
    childPartName: "Discharge Expansion Chamber Tube",
    planQty: 50,
    goodQty: 48,
    ngQty: 2,
    bopRequired: "Yes",
    bopStatus: "100% Loaded",
    partCode: "CP-HIT-2001-A",
    bomQty: 2,
    targetProcess: "Brazing",
    status: "ready_to_move",
  },
  {
    sNo: 3,
    machineName: "CNC-TB-03",
    machineType: "Machine",
    workOrderDate: "24/10/26",
    workOrderNo: "WO-1048",
    customer: "Daikin Airconditioning India",
    assemblyCode: "ASSY-DAI-1002",
    assemblyName: "VRV Copper Header Manifold",
    childPartCode: "CH-DAI-1002-A",
    childPartName: "VRV Copper Header Pipe 28.6mm",
    planQty: 100,
    goodQty: 100,
    ngQty: 0,
    bopRequired: "Yes",
    bopStatus: "100% Loaded",
    partCode: "CP-DAI-1002-A",
    bomQty: 1,
    targetProcess: "Brazing",
    status: "ready_to_move",
  },
  {
    sNo: 4,
    machineName: "CNC-TB-01",
    machineType: "Machine",
    workOrderDate: "24/10/26",
    workOrderNo: "WO-1052",
    customer: "Panasonic Life Solutions Ltd",
    assemblyCode: "ASSY-PAN-2001",
    assemblyName: "Oil Separator Return Line Assembly",
    childPartCode: "CH-PAN-2001-A",
    childPartName: "Sight Glass Adapter Sleeve",
    planQty: 45,
    goodQty: 45,
    ngQty: 1,
    bopRequired: "Yes",
    bopStatus: "100% Loaded",
    partCode: "CP-PAN-2001-A",
    bomQty: 3,
    targetProcess: "Brazing",
    status: "ready_to_move",
  },
  {
    sNo: 5,
    machineName: "BEND-02",
    machineType: "Machine",
    workOrderDate: "24/10/26",
    workOrderNo: "WO-1055",
    customer: "Godrej Appliances (Godrej & Boyce)",
    assemblyCode: "ASSY-GOD-1009",
    assemblyName: "HVAC 4-Branch Copper Header",
    childPartCode: "CH-GOD-1009-B",
    childPartName: "4-Branch Copper Header Pipe 22.2mm",
    planQty: 100,
    goodQty: 100,
    ngQty: 0,
    bopRequired: "No",
    bopStatus: "Direct Pass",
    partCode: "CP-GOD-1009-B",
    bomQty: 1,
    targetProcess: "Brazing",
    status: "ready_to_move",
  },
];

export function OverviewView() {
  // Filters & State
  const [selectedAssembly, setSelectedAssembly] = useState("All Assemblies");
  const [selectedRoute, setSelectedRoute] = useState("All Inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeZoneId, setActiveZoneId] = useState<string>("stage-1");
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [refreshCountdown, setRefreshCountdown] = useState(8);
  const [traceabilityMode, setTraceabilityMode] = useState<"assembly" | "bop" | "process">("assembly");

  // Domain state
  const [virtualBoxes, setVirtualBoxes] = useState(INITIAL_VIRTUAL_BOXES);
  const [productionRows, setProductionRows] = useState(INITIAL_COMPLETED_ROWS);
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const [selectedBomRow, setSelectedBomRow] = useState<CompletedProductionRow | null>(null);
  const [transferToast, setTransferToast] = useState<string | null>(null);

  // Auto-refresh timer simulation
  useEffect(() => {
    if (!isAutoRefresh) return;
    const interval = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) return 8;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isAutoRefresh]);

  // Handle stage handoff ("GB OK" move to next stage)
  const handleMoveToNextStage = (row: CompletedProductionRow) => {
    setProductionRows((prev) =>
      prev.map((r) =>
        r.sNo === row.sNo ? { ...r, status: "moved_to_brazing" } : r
      )
    );

    // Update Virtual Box counts dynamically: decrement Machine zone, increment Brazing zone
    setVirtualBoxes((prev) =>
      prev.map((box) => {
        if (box.id === "stage-1") {
          return {
            ...box,
            totalQty: Math.max(0, box.totalQty - row.goodQty),
            linesCount: Math.max(0, box.linesCount - 1),
          };
        }
        if (box.id === "stage-2") {
          return {
            ...box,
            totalQty: box.totalQty + row.goodQty,
            linesCount: box.linesCount + 1,
          };
        }
        return box;
      })
    );

    setTransferToast(
      `✓ Successfully moved ${row.goodQty} pcs of ${row.childPartCode} (${row.workOrderNo}) to Brazing Section!`
    );
    setTimeout(() => setTransferToast(null), 4000);
  };

  // Toggle row checkbox selection
  const handleToggleRow = (sNo: number) => {
    setSelectedRowIds((prev) =>
      prev.includes(sNo) ? prev.filter((id) => id !== sNo) : [...prev, sNo]
    );
  };

  // Filtered rows
  const filteredRows = productionRows.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      r.workOrderNo.toLowerCase().includes(q) ||
      r.customer.toLowerCase().includes(q) ||
      r.childPartCode.toLowerCase().includes(q) ||
      r.assemblyCode.toLowerCase().includes(q);

    const matchAssy =
      selectedAssembly === "All Assemblies" || r.assemblyCode === selectedAssembly;

    return matchSearch && matchAssy;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#101828] pb-12 font-sans">
      {/* Toast Notification */}
      {transferToast && (
        <div className="fixed top-4 right-4 z-50 bg-[#101828] text-white text-xs font-medium px-4 py-3 rounded-2xl shadow-apple-dropdown flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#12B76A] shrink-0" />
          <span>{transferToast}</span>
        </div>
      )}

      {/* Top Header & Filters Bar */}
      <div className="bg-white border-b border-[#EAECF0] px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Title & Live Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF4FF] text-[#155EEF] flex items-center justify-center font-bold shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-[#101828]">
                  Dashboard
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#ECFDF3] text-[#027A48] border border-[#ABEFC6]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-pulse" />
                  <span>LIVE TRACKING</span>
                </span>
              </div>
              <p className="text-sm text-[#475467] font-normal truncate mt-0.5 leading-relaxed">
                Zonewise Real-Time Virtual Box Inventory, Process Throughput & Assembly Traceability
              </p>
            </div>
          </div>

          {/* Controls: Assembly Filter, Route Filter, Search, Auto-Refresh */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Assembly Filter */}
            <div className="w-44">
              <PremiumDropdown
                value={selectedAssembly}
                onChange={setSelectedAssembly}
                options={[
                  "All Assemblies",
                  "ASSY-HAV-1009",
                  "ASSY-HIT-2009",
                  "ASSY-DAI-1002",
                  "ASSY-PAN-2001",
                  "ASSY-GOD-1009",
                ]}
                size="sm"
                searchable={false}
                buttonClassName="bg-[#F5F5F7] px-2.5 py-1 text-xs rounded-xl border-[#E5E5EA]"
              />
            </div>

            {/* Route / Inventory Filter */}
            <div className="w-40">
              <PremiumDropdown
                value={selectedRoute}
                onChange={setSelectedRoute}
                options={[
                  "All Inventory",
                  "Store Intake",
                  "Machine Child Parts",
                  "Pre-Brazing Buffer",
                  "Brazing Section",
                  "Leak Testing Gate",
                  "Finished Goods (FG)",
                ]}
                size="sm"
                searchable={false}
                buttonClassName="bg-[#F5F5F7] px-2.5 py-1 text-xs rounded-xl border-[#E5E5EA]"
              />
            </div>

            {/* Search Input */}
            <div className="relative w-52">
              <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Assy, Child, BOP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F5F5F7] border border-[#E5E5EA] focus:border-[#007AFF] focus:bg-white rounded-xl text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all"
              />
            </div>

            {/* Auto Refresh Toggle Pill */}
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={cn(
                "px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer",
                isAutoRefresh
                  ? "bg-[#007AFF] text-white border-[#007AFF] shadow-xs"
                  : "bg-white text-[#6E6E73] border-[#E5E5EA] hover:bg-[#F5F5F7]"
              )}
              title="Toggle auto-refresh"
            >
              <RotateCw className={cn("w-3 h-3", isAutoRefresh && "animate-spin")} />
              <span>Auto ({refreshCountdown}s)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Container */}
      <div className="px-4 sm:px-8 py-5 space-y-5 max-w-[1720px] mx-auto">
        {/* 1. 7-STAGE MANUFACTURING PROCESS PIPELINE */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-3 shadow-apple-card overflow-x-auto custom-scrollbar">
          <div className="flex items-center min-w-[1000px] gap-1.5">
            {PIPELINE_STAGES.map((stage, idx) => {
              const isLast = idx === PIPELINE_STAGES.length - 1;
              const isSelected = activeZoneId === stage.id;

              return (
                <React.Fragment key={stage.id}>
                  <div
                    onClick={() => setActiveZoneId(stage.id)}
                    className={cn(
                      "flex-1 p-2.5 rounded-xl border transition-all cursor-pointer relative group text-center min-w-[125px]",
                      isSelected
                        ? "bg-[#007AFF]/5 border-[#007AFF] shadow-xs"
                        : "bg-[#F8F9FA] border-[#E5E5EA] hover:bg-white hover:border-[#D1D1D6]"
                    )}
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase font-mono",
                          stage.colorScheme === "blue"
                            ? "bg-[#007AFF] text-white"
                            : stage.colorScheme === "amber"
                            ? "bg-[#FF9500] text-white"
                            : stage.colorScheme === "teal"
                            ? "bg-[#007788] text-white"
                            : stage.colorScheme === "green"
                            ? "bg-[#34C759] text-white"
                            : stage.colorScheme === "yellow"
                            ? "bg-[#D97706] text-white"
                            : stage.colorScheme === "dark"
                            ? "bg-[#1D1D1F] text-white"
                            : "bg-[#8E8E93] text-white"
                        )}
                      >
                        {stage.stageNumber}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-[#1D1D1F] truncate leading-tight">
                      {stage.name}
                    </div>
                    <div className="text-[10px] text-[#86868B] truncate mt-0.5">
                      {stage.description}
                    </div>
                  </div>

                  {!isLast && (
                    <div className="shrink-0 text-[#C7C7CC] px-0.5 font-bold">
                      <ChevronRight className="w-4 h-4 text-[#C7C7CC]" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* 2. LIVE VIRTUAL BOX INVENTORY CARDS */}
        <div className="space-y-2.5">
          {/* Subheader bar */}
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#ECFDF3] text-[#027A48] border border-[#ABEFC6]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-pulse" />
                <span>LIVE VIRTUAL BOX INVENTORY</span>
              </span>
              <span className="text-[11px] font-medium text-[#475467]">
                (6 Connected Stations)
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#475467]">
              <span className="font-medium text-[#344054]">Traceability:</span>
              <div className="inline-flex bg-white border border-[#EAECF0] rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setTraceabilityMode("assembly")}
                  className={cn(
                    "px-2.5 py-1 rounded font-medium transition-colors text-xs",
                    traceabilityMode === "assembly"
                      ? "bg-[#155EEF] text-white"
                      : "text-[#475467] hover:text-[#101828]"
                  )}
                >
                  Assembly
                </button>
                <button
                  onClick={() => setTraceabilityMode("bop")}
                  className={cn(
                    "px-2.5 py-1 rounded font-medium transition-colors text-xs",
                    traceabilityMode === "bop"
                      ? "bg-[#155EEF] text-white"
                      : "text-[#475467] hover:text-[#101828]"
                  )}
                >
                  BOP
                </button>
                <button
                  onClick={() => setTraceabilityMode("process")}
                  className={cn(
                    "px-2.5 py-1 rounded font-medium transition-colors text-xs",
                    traceabilityMode === "process"
                      ? "bg-[#155EEF] text-white"
                      : "text-[#475467] hover:text-[#101828]"
                  )}
                >
                  Process
                </button>
              </div>
            </div>
          </div>

          {/* 7 Inventory Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
            {virtualBoxes.map((box) => {
              const isSelected = activeZoneId === box.id;

              return (
                <div
                  key={box.id}
                  onClick={() => setActiveZoneId(box.id)}
                  className={cn(
                    "p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group",
                    isSelected
                      ? "bg-white border-[#155EEF] ring-2 ring-[#155EEF]/20 shadow-md"
                      : "bg-white border-[#EAECF0] hover:border-[#155EEF]/50 shadow-xs hover:shadow-md"
                  )}
                >
                  <div>
                    {/* Top row: badge + lines */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#F2F4F7] text-[10px] font-mono font-bold text-[#344054]">
                        {box.shortCode}
                      </span>
                      <span className="text-[11px] text-[#475467] font-medium">
                        {box.linesCount} lines
                      </span>
                    </div>

                    <div className="text-[13px] font-semibold text-[#101828] line-clamp-2 leading-snug">
                      {box.title}
                    </div>

                    {/* Numeric Count */}
                    <div className="mt-2.5 text-2xl font-bold tracking-tight text-[#101828] font-sans">
                      {box.totalQty.toLocaleString()}
                    </div>

                    {/* Sub-breakdown if present (Good vs NG) */}
                    {box.goodQty !== undefined && box.ngQty !== undefined && (
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] font-medium">
                        <span className="text-[#027A48] flex items-center gap-1 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A]" />
                          {box.goodQty}
                        </span>
                        <span className="text-[#D92D20] flex items-center gap-1 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F04438]" />
                          {box.ngQty}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-[#F2F4F7] flex items-center justify-between text-xs text-[#155EEF] font-semibold group-hover:text-[#175CD3]">
                    <span>Configure</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. PROCESS-WISE THROUGHPUT VISUALIZATION */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4 shadow-apple-card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#1D1D1F] tracking-tight">
                Process-Wise Throughput
              </h3>
              <p className="text-[11px] text-[#86868B]">
                Live WIP quantity sitting at each manufacturing stage right now
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#E8F2FE] text-[#007AFF] border border-[#B2D7FD]">
              Total WIP: 11,843 units
            </span>
          </div>

          {/* Proportional Throughput Bars */}
          <div className="grid grid-cols-6 gap-3 pt-2">
            {THROUGHPUT_DATA.map((t) => (
              <div key={t.label} className="space-y-1.5 text-center">
                <div className="h-20 bg-[#F5F5F7] rounded-xl p-1 flex items-end justify-center overflow-hidden border border-[#E5E5EA]">
                  <div
                    className="w-full bg-[#007AFF] hover:bg-[#0058B3] rounded-lg transition-all duration-500 shadow-2xs"
                    style={{ height: `${Math.max(12, t.percent)}%` }}
                  />
                </div>
                <div className="font-mono text-xs font-bold text-[#1D1D1F]">
                  {t.qty.toLocaleString()}
                </div>
                <div className="text-[10px] font-medium text-[#86868B] truncate">
                  {t.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. STAGE 1: COMPLETED MACHINE PRODUCTION OUTPUT & STAGE HANDOFF TABLE */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] shadow-apple-card overflow-hidden">
          {/* Table Header Row */}
          <div className="p-4 border-b border-[#E5E5EA] bg-[#FBFBFC] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#007AFF] text-white text-[10px] font-mono font-bold">
                STAGE 1
              </span>
              <h3 className="text-sm font-bold text-[#1D1D1F] tracking-tight">
                Stage 1: Completed Machine Production Output
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF8EF] text-[#1E823B] border border-[#C3EED3]">
                Completed
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-[11px] text-[#6E6E73] hidden sm:inline">
                Only 100% completed production parts shown (In-progress excluded).
              </span>
              <button
                onClick={() => {
                  setTransferToast("Full Production Batch Log Form opened in overlay");
                  setTimeout(() => setTransferToast(null), 3000);
                }}
                className="px-2.5 py-1 text-xs font-semibold text-[#007AFF] bg-[#E8F2FE] hover:bg-[#D4E8FD] border border-[#B2D7FD] rounded-xl flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Full Form</span>
              </button>
            </div>
          </div>

          {/* Table Data */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#E5E5EA] text-[10.5px] font-semibold text-[#6E6E73] uppercase tracking-wider">
                  <th className="py-2.5 px-3 text-center w-10">S.No</th>
                  <th className="py-2.5 px-3">Machine Name</th>
                  <th className="py-2.5 px-3">Work Order Date</th>
                  <th className="py-2.5 px-3">Work Order No.</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Assembly Part Code</th>
                  <th className="py-2.5 px-3">Assembly Part Name</th>
                  <th className="py-2.5 px-3">Child Part Code</th>
                  <th className="py-2.5 px-3">Child Part Name</th>
                  <th className="py-2.5 px-3 text-center">Plan Qty</th>
                  <th className="py-2.5 px-3 text-center">Production Achieve</th>
                  <th className="py-2.5 px-3 text-center">BOP Req.</th>
                  <th className="py-2.5 px-3 text-center">BOM Load</th>
                  <th className="py-2.5 px-3 text-center">Select</th>
                  <th className="py-2.5 px-3">Child BOM / Process</th>
                  <th className="py-2.5 px-3 text-center">Move Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5EA]">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="py-12 text-center text-xs text-[#86868B]">
                      No completed production lots found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => {
                    const isSelected = selectedRowIds.includes(row.sNo);
                    const isMoved = row.status === "moved_to_brazing";

                    return (
                      <tr
                        key={row.sNo}
                        className={cn(
                          "hover:bg-[#FAFAFC] transition-colors",
                          isMoved && "opacity-75 bg-[#F9F9FB]"
                        )}
                      >
                        <td className="py-3 px-3 text-center font-mono text-[11px] text-[#86868B]">
                          {row.sNo}
                        </td>
                        <td className="py-3 px-3 font-semibold text-[#1D1D1F]">
                          <div>{row.machineName}</div>
                          <span className="text-[10px] text-[#86868B]">{row.machineType}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-[#48484A]">
                          {row.workOrderDate}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#007AFF]">
                          {row.workOrderNo}
                        </td>
                        <td className="py-3 px-3 font-medium text-[#1D1D1F] max-w-[140px] truncate" title={row.customer}>
                          {row.customer}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-[#48484A]">
                          {row.assemblyCode}
                        </td>
                        <td className="py-3 px-3 text-[#1D1D1F] max-w-[150px] truncate" title={row.assemblyName}>
                          {row.assemblyName}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#007AFF]">
                          {row.childPartCode}
                        </td>
                        <td className="py-3 px-3 text-[#1D1D1F] max-w-[160px] truncate" title={row.childPartName}>
                          {row.childPartName}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-[#1D1D1F]">
                          {row.planQty}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1 font-mono text-[11px]">
                            <span className="px-1.5 py-0.5 rounded bg-[#EAF8EF] text-[#1E823B] font-bold border border-[#C3EED3]">
                              {row.goodQty}
                            </span>
                            {row.ngQty > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-[#FFEBEA] text-[#B82218] font-bold border border-[#FDCAC7]">
                                {row.ngQty}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                              row.bopRequired === "Yes"
                                ? "bg-[#E8F2FE] text-[#007AFF] border border-[#B2D7FD]"
                                : "bg-[#F2F2F7] text-[#6E6E73] border border-[#E5E5EA]"
                            )}
                          >
                            {row.bopRequired}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => setSelectedBomRow(row)}
                            className="px-2 py-1 text-[10px] font-bold rounded-lg bg-[#007AFF] hover:bg-[#0058B3] text-white shadow-2xs transition-colors"
                          >
                            BOM Load
                          </button>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <PremiumCheckbox
                            checked={isSelected}
                            onChange={() => handleToggleRow(row.sNo)}
                          />
                        </td>
                        <td className="py-3 px-3 font-mono text-[10.5px]">
                          <div className="text-[#1D1D1F] font-semibold">{row.partCode}</div>
                          <div className="text-[#86868B] text-[9.5px]">
                            Qty: {row.bomQty} pcs • Target: <span className="text-[#007AFF] font-bold">{row.targetProcess}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isMoved ? (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#1E823B] bg-[#EAF8EF] px-2 py-1 rounded-xl border border-[#C3EED3]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Moved</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleMoveToNextStage(row)}
                              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#34C759] hover:bg-[#2DB04D] text-white shadow-xs transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
                              title="Confirm stage completion (GB OK) and transfer lot to Brazing section"
                            >
                              <span>GB OK</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BOM Load Popup Modal */}
      {selectedBomRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedBomRow(null)}
        >
          <div
            className="bg-white rounded-2xl border border-[#E5E5EA] shadow-2xl w-full max-w-lg p-5 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#007AFF] text-white flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1D1D1F]">
                    BOM Breakdown: {selectedBomRow.assemblyCode}
                  </h3>
                  <p className="text-[11px] text-[#6E6E73]">
                    {selectedBomRow.assemblyName} • {selectedBomRow.customer}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBomRow(null)}
                className="w-7 h-7 rounded-full bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#6E6E73] flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E5E5EA] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#86868B]">Parent Work Order:</span>
                  <strong className="font-mono text-[#007AFF]">{selectedBomRow.workOrderNo}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#86868B]">Formed Child Part:</span>
                  <strong className="font-mono text-[#1D1D1F]">{selectedBomRow.childPartCode}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#86868B]">Completed Good Qty:</span>
                  <strong className="font-mono text-[#34C759]">{selectedBomRow.goodQty} pcs</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#86868B]">BOP Status:</span>
                  <strong className="text-[#007AFF]">{selectedBomRow.bopStatus}</strong>
                </div>
              </div>

              <div className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider pt-1">
                Sub-Parts Required for Brazing Assembly
              </div>

              <div className="p-2.5 rounded-xl border border-[#E5E5EA] bg-white space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <div>
                    <div className="font-mono font-bold text-[#1D1D1F]">{selectedBomRow.partCode}</div>
                    <div className="text-[#86868B] text-[10px]">Copper Coupling & Return Bend</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#007AFF]">{selectedBomRow.goodQty * selectedBomRow.bomQty} pcs</span>
                    <div className="text-[9.5px] text-[#34C759]">BOP Kit Ready</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => setSelectedBomRow(null)}
                className="px-4 py-2 bg-[#007AFF] text-white text-xs font-semibold rounded-xl shadow-xs hover:bg-[#0058B3]"
              >
                Close BOM View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

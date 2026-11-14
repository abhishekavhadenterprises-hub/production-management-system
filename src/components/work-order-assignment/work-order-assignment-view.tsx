import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Layers,
  FileSpreadsheet,
  Printer,
  ListChecks,
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Save,
  ShieldCheck,
  ShieldAlert,
  Boxes,
  ArrowRight,
  ExternalLink,
  Table,
  Check,
  X,
  MapPin,
  Route,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PremiumDropdown } from "@/components/ui/premium-dropdown";
import { usePersistentState } from "@/lib/use-persistent-state";
import {
  WorkOrderAssignment,
  INITIAL_ASSIGNMENTS,
  AssignmentPartItem,
  AssignmentZoneValues,
} from "@/lib/work-order-assignment-data";

export function WorkOrderAssignmentView() {
  const router = useRouter();

  // Persisted state across navigation & refreshes
  const [assignments, setAssignments] = usePersistentState<WorkOrderAssignment[]>(
    "prodsync_wo_assignments_v2",
    INITIAL_ASSIGNMENTS
  );

  const [selectedWoId, setSelectedWoId] = useState<string>("wo-1040");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showRouteCardModal, setShowRouteCardModal] = useState<boolean>(false);
  const [showBomModal, setShowBomModal] = useState<boolean>(false);

  // Active work order
  const currentWo = useMemo(() => {
    return (
      assignments.find((a) => a.id === selectedWoId) ||
      assignments[0] ||
      INITIAL_ASSIGNMENTS[0]
    );
  }, [assignments, selectedWoId]);

  // Dropdown options
  const woDropdownOptions = useMemo(() => {
    return assignments.map((a) => ({
      value: a.id,
      label: `${a.workOrderNo} — ${a.customerName} | ${a.assemblyPartNo} (Qty: ${a.planQty})`,
    }));
  }, [assignments]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Update zone value
  const handleZoneChange = (
    partId: string,
    zoneKey: keyof AssignmentZoneValues,
    value: string
  ) => {
    const num = parseFloat(value);
    const validNum = isNaN(num) ? 0 : Math.max(0, num);

    setAssignments((prev) =>
      prev.map((wo) => {
        if (wo.id !== currentWo.id) return wo;
        return {
          ...wo,
          items: wo.items.map((item) => {
            if (item.id !== partId) return item;
            if (item.zones[zoneKey] === "N/A") return item;
            return {
              ...item,
              zones: {
                ...item.zones,
                [zoneKey]: validNum,
              },
            };
          }),
        };
      })
    );
  };

  // Auto-assign defaults: Child parts full plan to Machine Zone, BOPs to VB1
  const handleAutoAssignDefaults = () => {
    setAssignments((prev) =>
      prev.map((wo) => {
        if (wo.id !== currentWo.id) return wo;
        return {
          ...wo,
          items: wo.items.map((item) => {
            if (item.category === "Child Part") {
              return {
                ...item,
                zones: {
                  ...item.zones,
                  virtualBox0: 0,
                  machineZone: wo.planQty,
                  virtualBox1: 0,
                  brazingZone: 0,
                  virtualBox2: 0,
                  leakTestingZone: 0,
                  virtualBox3: 0,
                  packingZone: 0,
                  virtualBox4: 0,
                  fgZone: 0,
                },
              };
            } else {
              return {
                ...item,
                zones: {
                  ...item.zones,
                  virtualBox0: "N/A",
                  virtualBox1: Math.min(item.stockQty, wo.planQty),
                  brazingZone: item.zones.brazingZone === "N/A" ? "N/A" : 0,
                  leakTestingZone:
                    item.zones.leakTestingZone === "N/A" ? "N/A" : 0,
                  virtualBox2: 0,
                  virtualBox3: 0,
                  packingZone: 0,
                  virtualBox4: 0,
                  fgZone: 0,
                },
              };
            }
          }),
        };
      })
    );
    showToast("Default zone routing rules applied successfully");
  };

  // Clear Zones
  const handleClearZones = () => {
    setAssignments((prev) =>
      prev.map((wo) => {
        if (wo.id !== currentWo.id) return wo;
        return {
          ...wo,
          items: wo.items.map((item) => {
            const vb0Val = item.zones.virtualBox0 ?? (item.category === "BOP" ? "N/A" : 0);
            return {
              ...item,
              zones: {
                virtualBox0: vb0Val === "N/A" ? "N/A" : 0,
                machineZone: item.zones.machineZone === "N/A" ? "N/A" : 0,
                virtualBox1: item.zones.virtualBox1 === "N/A" ? "N/A" : 0,
                brazingZone: item.zones.brazingZone === "N/A" ? "N/A" : 0,
                virtualBox2: item.zones.virtualBox2 === "N/A" ? "N/A" : 0,
                leakTestingZone:
                  item.zones.leakTestingZone === "N/A" ? "N/A" : 0,
                virtualBox3: item.zones.virtualBox3 === "N/A" ? "N/A" : 0,
                packingZone: item.zones.packingZone === "N/A" ? "N/A" : 0,
                virtualBox4: item.zones.virtualBox4 === "N/A" ? "N/A" : 0,
                fgZone: item.zones.fgZone === "N/A" ? "N/A" : 0,
              },
            };
          }),
        };
      })
    );
    showToast("Zone allocations cleared for this work order");
  };

  // Toggle Authorization
  const handleToggleAuthorization = () => {
    const nextStatus =
      currentWo.status === "Pending Auth" ? "Authorized" : "Pending Auth";
    setAssignments((prev) =>
      prev.map((wo) =>
        wo.id === currentWo.id ? { ...wo, status: nextStatus } : wo
      )
    );
    showToast(
      nextStatus === "Authorized"
        ? `Work Order ${currentWo.workOrderNo} zone assignment Authorized!`
        : `Work Order ${currentWo.workOrderNo} authorization revoked to Pending.`
    );
  };

  // Save changes
  const handleSaveAssignment = () => {
    showToast(
      `Zone assignment committed to system database for ${currentWo.workOrderNo}`
    );
  };

  const handleSaveAndAuthorize = () => {
    setAssignments((prev) =>
      prev.map((wo) =>
        wo.id === currentWo.id ? { ...wo, status: "Authorized" } : wo
      )
    );
    showToast(
      `Zone assignment saved & AUTHORIZED for production routing (${currentWo.workOrderNo})`
    );
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Work Order No",
      "Work Order Date",
      "Work Order Plan",
      "Assembly Part No",
      "BOM Part Code",
      "Part Description",
      "Routing",
      "Category",
      "Work Order Qty",
      "Stock Qty",
      "Virtual Box 0",
      "Machine Zone",
      "Virtual Box 1",
      "Brazing Zone",
      "Virtual Box 2",
      "Leak Testing Zone",
      "Virtual Box 3",
      "Packing Zone",
      "Virtual Box 4",
      "FG Zone",
    ];

    const rows = currentWo.items.map((item) => [
      currentWo.workOrderNo,
      currentWo.orderDate,
      `${currentWo.planQty} NOS`,
      currentWo.assemblyPartNo,
      `"${item.partCode}"`,
      `"${item.partName}"`,
      `"${item.routing}"`,
      item.category,
      item.workOrderQty,
      item.stockQty,
      item.zones.virtualBox0 ?? (item.category === "BOP" ? "N/A" : 0),
      item.zones.machineZone,
      item.zones.virtualBox1,
      item.zones.brazingZone,
      item.zones.virtualBox2,
      item.zones.leakTestingZone,
      item.zones.virtualBox3,
      item.zones.packingZone,
      item.zones.virtualBox4,
      item.zones.fgZone,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Zone_Assignment_${currentWo.workOrderNo}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV file exported successfully");
  };

  // Print view
  const handlePrint = () => {
    window.print();
  };

  // Summaries calculation
  const totals = useMemo(() => {
    let woQtyTotal = 0;
    let stockQtyTotal = 0;
    let vb0Total = 0;
    let machineZoneTotal = 0;
    let vb1Total = 0;
    let brazingTotal = 0;
    let vb2Total = 0;
    let leakTotal = 0;
    let vb3Total = 0;
    let packingTotal = 0;
    let vb4Total = 0;
    let fgTotal = 0;

    currentWo.items.forEach((item) => {
      woQtyTotal += item.workOrderQty;
      stockQtyTotal += item.stockQty;

      const vb0Val = item.zones.virtualBox0 ?? (item.category === "BOP" ? "N/A" : 0);
      if (typeof vb0Val === "number") {
        vb0Total += vb0Val;
      }
      if (typeof item.zones.machineZone === "number") {
        machineZoneTotal += item.zones.machineZone;
      }
      if (typeof item.zones.virtualBox1 === "number") {
        vb1Total += item.zones.virtualBox1;
      }
      if (typeof item.zones.brazingZone === "number") {
        brazingTotal += item.zones.brazingZone;
      }
      if (typeof item.zones.virtualBox2 === "number") {
        vb2Total += item.zones.virtualBox2;
      }
      if (typeof item.zones.leakTestingZone === "number") {
        leakTotal += item.zones.leakTestingZone;
      }
      if (typeof item.zones.virtualBox3 === "number") {
        vb3Total += item.zones.virtualBox3;
      }
      if (typeof item.zones.packingZone === "number") {
        packingTotal += item.zones.packingZone;
      }
      if (typeof item.zones.virtualBox4 === "number") {
        vb4Total += item.zones.virtualBox4;
      }
      if (typeof item.zones.fgZone === "number") {
        fgTotal += item.zones.fgZone;
      }
    });

    return {
      woQtyTotal,
      stockQtyTotal,
      vb0Total,
      machineZoneTotal,
      vb1Total,
      brazingTotal,
      vb2Total,
      leakTotal,
      vb3Total,
      packingTotal,
      vb4Total,
      fgTotal,
    };
  }, [currentWo]);

  const childCount = currentWo.items.filter((i) => i.category === "Child Part").length;
  const bopCount = currentWo.items.filter((i) => i.category === "BOP").length;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#15803D] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-80"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header Banner Strip */}
      <div className="px-4 sm:px-8 pt-5 pb-4 bg-white border-b border-[#E5E5EA]">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Left Title and Subtitle */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#007AFF] text-white flex items-center justify-center font-bold shadow-xs">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
                  Work Order Assignment
                </h1>
                <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-bold tracking-wide uppercase bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                  BOM &rarr; 5 PRODUCTION ZONES
                </span>
              </div>
            </div>
            <p className="text-xs text-[#6E6E73] mt-1 pl-10 leading-tight">
              Multi-stage component allocation for Machine, Brazing, Leak Testing, Packing, and FG Zones
            </p>
          </div>

          {/* Right Action Links matching reference */}
          <div className="flex items-center gap-2 flex-wrap self-start xl:self-auto pl-10 xl:pl-0">
            <button
              onClick={() => setShowRouteCardModal(true)}
              className="px-3 py-1.5 rounded-lg border border-[#D1D5DB] bg-white text-[#1D1D1F] hover:bg-[#F3F4F6] text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Route className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Assembly Route Card</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg border border-[#86EFAC] bg-[#F0FDF4] text-[#15803D] hover:bg-[#DCFCE7] text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Export Excel / CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg border border-[#D1D5DB] bg-white text-[#1D1D1F] hover:bg-[#F3F4F6] text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>Print</span>
            </button>

            <button
              onClick={() => router.push("/work-orders")}
              className="px-3 py-1.5 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <ListChecks className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Work Orders</span>
            </button>

            <button
              onClick={() => setShowBomModal(true)}
              className="px-3 py-1.5 rounded-lg border border-[#D1D5DB] bg-white text-[#1D1D1F] hover:bg-[#F3F4F6] text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <FolderKanban className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>BOM Master</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-5 space-y-4">
        {/* Work Order Selector & Specification Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E5EA] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Work order select dropdown */}
            <div className="lg:col-span-5 space-y-1">
              <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider flex items-center gap-1">
                <span>SELECT WORK ORDER</span>
              </label>
              <PremiumDropdown
                value={selectedWoId}
                onChange={(val) => setSelectedWoId(val)}
                options={woDropdownOptions}
                placeholder="Choose work order..."
                className="w-full text-xs font-medium"
              />
            </div>

            {/* Customer Details */}
            <div className="lg:col-span-3 space-y-0.5 border-l border-[#E5E5EA] pl-4">
              <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                CUSTOMER
              </div>
              <div className="text-xs font-bold text-[#1D1D1F] truncate" title={currentWo.customerName}>
                {currentWo.customerName}
              </div>
            </div>

            {/* Assembly Details */}
            <div className="lg:col-span-4 grid grid-cols-4 gap-2 border-l border-[#E5E5EA] pl-4 items-center">
              <div>
                <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                  ASSEMBLY
                </div>
                <button
                  onClick={() => setShowRouteCardModal(true)}
                  className="text-xs font-bold text-[#007AFF] hover:underline flex items-center gap-0.5 truncate"
                >
                  {currentWo.assemblyPartNo}
                </button>
                <div className="text-[10px] text-[#86868B] truncate" title={currentWo.assemblyPartName}>
                  {currentWo.assemblyPartName}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                  ORDER / PLAN QTY
                </div>
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-[#007AFF] text-white">
                  {currentWo.planQty} NOS
                </span>
              </div>

              <div>
                <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                  ORDER DATE
                </div>
                <div className="text-xs font-semibold text-[#1D1D1F]">
                  {currentWo.orderDate}
                </div>
                <div className="mt-0.5">
                  <span className="text-[10.5px] font-semibold text-[#16A34A] bg-[#DCFCE7] border border-[#86EFAC] px-1.5 py-0.2 rounded">
                    ✓ Saved ({currentWo.savedCount} parts)
                  </span>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                  AUTHORIZATION STATUS
                </div>
                {currentWo.status === "Pending Auth" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
                    Pending Auth
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                    Authorized
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Authorization Alert Banner */}
        <div
          className={cn(
            "rounded-2xl p-4 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs",
            currentWo.status === "Pending Auth"
              ? "bg-[#FFFBEB] border-[#FCD34D]"
              : "bg-[#F0FDF4] border-[#86EFAC]"
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs",
                currentWo.status === "Pending Auth"
                  ? "bg-[#F59E0B] text-white"
                  : "bg-[#16A34A] text-white"
              )}
            >
              {currentWo.status === "Pending Auth" ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-[#1D1D1F]">
                  {currentWo.status === "Pending Auth"
                    ? "Zone Assignment PENDING AUTHORIZATION"
                    : "Zone Assignment AUTHORIZED FOR PRODUCTION"}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded",
                    currentWo.status === "Pending Auth"
                      ? "bg-[#F59E0B] text-white"
                      : "bg-[#16A34A] text-white"
                  )}
                >
                  {currentWo.status === "Pending Auth"
                    ? "Authorization Mandatory"
                    : "Authorized"}
                </span>
              </div>
              <p className="text-xs text-[#48484A]">
                Work Order {currentWo.workOrderNo} zone assignments require authorization before production routing.
                <span className="ml-2 font-medium text-[#15803D]">
                  ✓ You have authorization rights (Super Administrator).
                </span>
              </p>
            </div>
          </div>

          <div className="self-end md:self-auto shrink-0">
            <button
              onClick={handleToggleAuthorization}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95",
                currentWo.status === "Pending Auth"
                  ? "bg-[#15803D] hover:bg-[#166534] text-white"
                  : "bg-white border border-[#D1D5DB] hover:bg-[#F3F4F6] text-[#374151]"
              )}
            >
              {currentWo.status === "Pending Auth" ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize Zone Assignment</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5 text-[#6B7280]" />
                  <span>Revoke Authorization</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Matrix Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2.5">
            <Table className="w-4 h-4 text-[#007AFF]" />
            <h2 className="text-sm sm:text-base font-bold text-[#1D1D1F]">
              Zone Assignment Matrix
            </h2>
            <span className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-[#E5E5EA] text-[#48484A]">
              {currentWo.items.length} Components ({childCount} Child Parts, {bopCount} BOPS)
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => router.push("/bop-transfer")}
              className="px-3 py-1.5 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46] hover:bg-[#D1FAE5] text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Boxes className="w-3.5 h-3.5 text-[#059669]" />
              <span>Store &rarr; Virtual Box 1 Transfer</span>
            </button>

            <button
              onClick={handleAutoAssignDefaults}
              className="px-3 py-1.5 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Auto-Assign Defaults</span>
            </button>

            <button
              onClick={handleClearZones}
              className="px-3 py-1.5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2] text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>Clear Zones</span>
            </button>

            <button
              onClick={handleSaveAssignment}
              className="px-3.5 py-1.5 rounded-lg bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Zone Assignment</span>
            </button>

            <button
              onClick={handleSaveAndAuthorize}
              className="px-3.5 py-1.5 rounded-lg bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Authorize</span>
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                {/* Header Row 1: Left Columns + Plant Zones Dark Navy Span */}
                <tr className="border-b border-[#E5E5EA] bg-[#F8F9FA] text-[11px] font-bold text-[#48484A]">
                  <th className="py-2.5 px-3 border-r border-[#E5E5EA] whitespace-nowrap" rowSpan={2}>
                    Work Order No.
                  </th>
                  <th className="py-2.5 px-3 border-r border-[#E5E5EA] whitespace-nowrap" rowSpan={2}>
                    Work Order Date
                  </th>
                  <th className="py-2.5 px-3 border-r border-[#E5E5EA] whitespace-nowrap" rowSpan={2}>
                    Work Order Plan
                  </th>
                  <th className="py-2.5 px-3 border-r border-[#E5E5EA] whitespace-nowrap" rowSpan={2}>
                    Assembly Part No.
                  </th>
                  <th className="py-2.5 px-4 border-r border-[#E5E5EA] min-w-[280px]" rowSpan={2}>
                    BOM
                  </th>
                  <th className="py-2.5 px-2.5 border-r border-[#E5E5EA] text-center whitespace-nowrap" rowSpan={2}>
                    Category
                  </th>
                  <th className="py-2.5 px-3 border-r border-[#E5E5EA] text-right whitespace-nowrap" rowSpan={2}>
                    Work Order Qty
                  </th>
                  <th className="py-2.5 px-3 border-r border-[#E5E5EA] text-right whitespace-nowrap" rowSpan={2}>
                    Stock Qty
                  </th>

                  {/* Dark navy header spanning all 10 plant zones and virtual boxes */}
                  <th
                    colSpan={10}
                    className="py-2 px-3 bg-[#0B2545] text-white text-center text-xs font-bold tracking-wide uppercase shadow-inner"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>Plant Zones &amp; Virtual Box</span>
                    </div>
                  </th>
                </tr>

                {/* Header Row 2: Sub-headers for the 10 zones */}
                <tr className="border-b border-[#E5E5EA] text-[10px] font-bold text-[#1D1D1F]">
                  <th className="py-2 px-2 text-center border-r border-[#E5E5EA] bg-[#F0FDF4] text-[#15803D] whitespace-nowrap min-w-[76px]">
                    Virtual Box 0
                  </th>
                  <th className="py-2 px-2 text-center border-r border-[#E5E5EA] bg-[#F1F5F9] whitespace-nowrap min-w-[76px]">
                    Machine Zone
                  </th>
                  <th className="py-2 px-2 text-center border-r border-[#E5E5EA] bg-[#F0FDF4] text-[#15803D] whitespace-nowrap min-w-[100px]">
                    <div>Virtual Box 1</div>
                    <div className="text-[9px] font-normal text-[#16A34A]">(Store Transfer VB)</div>
                  </th>
                  <th className="py-2 px-2 text-center border-r border-[#E5E5EA] bg-[#F8FAFC] whitespace-nowrap min-w-[76px]">
                    Brazing Zone
                  </th>
                  <th className="py-2 px-2 text-center border-r border-[#E5E5EA] bg-[#F0FDF4] text-[#15803D] whitespace-nowrap min-w-[76px]">
                    Virtual Box 2
                  </th>
                  <th className="py-2 px-2 text-center border-r border-[#E5E5EA] bg-[#F8FAFC] whitespace-nowrap min-w-[84px]">
                    Leak Testing Zone
                  </th>
                  <th className="py-2 px-2 text-center border-r border-[#E5E5EA] bg-[#F0FDF4] text-[#15803D] whitespace-nowrap min-w-[76px]">
                    Virtual Box 3
                  </th>
                  <th className="py-2 px-2 text-center border-r border-[#E5E5EA] bg-[#F8FAFC] whitespace-nowrap min-w-[76px]">
                    Packing Zone
                  </th>
                  <th className="py-2 px-2 text-center border-r border-[#E5E5EA] bg-[#F0FDF4] text-[#15803D] whitespace-nowrap min-w-[76px]">
                    Virtual Box 4
                  </th>
                  <th className="py-2 px-2 text-center bg-[#F8FAFC] whitespace-nowrap min-w-[76px]">
                    FG Zone
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E5E5EA]">
                {currentWo.items.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={cn(
                      "transition-colors hover:bg-[#F9FAFB]",
                      idx % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"
                    )}
                  >
                    {/* Work Order No */}
                    <td className="py-3 px-3 border-r border-[#E5E5EA] font-semibold text-[#1D1D1F] whitespace-nowrap align-middle">
                      {currentWo.workOrderNo}
                    </td>

                    {/* Work Order Date */}
                    <td className="py-3 px-3 border-r border-[#E5E5EA] text-[#6E6E73] whitespace-nowrap align-middle">
                      {currentWo.orderDate}
                    </td>

                    {/* Work Order Plan */}
                    <td className="py-3 px-3 border-r border-[#E5E5EA] text-[#007AFF] font-bold whitespace-nowrap align-middle">
                      {currentWo.planQty} NOS
                    </td>

                    {/* Assembly Part No */}
                    <td className="py-3 px-3 border-r border-[#E5E5EA] font-semibold text-[#1D1D1F] whitespace-nowrap align-middle">
                      {currentWo.assemblyPartNo}
                    </td>

                    {/* BOM Details: Part Code, Description & Routing */}
                    <td className="py-3 px-4 border-r border-[#E5E5EA] align-middle">
                      <div className="font-bold text-xs text-[#1D1D1F]">
                        {item.partCode}
                      </div>
                      <div className="text-xs text-[#48484A] font-medium">
                        {item.partName}
                      </div>
                      <div className="text-[10px] text-[#86868B] mt-0.5 leading-snug">
                        {item.routing}
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td className="py-3 px-2.5 border-r border-[#E5E5EA] text-center align-middle whitespace-nowrap">
                      {item.category === "Child Part" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                          ⚙ Child Part
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
                          📦 BOP
                        </span>
                      )}
                    </td>

                    {/* Work Order Qty */}
                    <td className="py-3 px-3 border-r border-[#E5E5EA] text-right font-mono text-xs font-semibold align-middle whitespace-nowrap">
                      {item.workOrderQty.toFixed(2)}
                    </td>

                    {/* Stock Qty */}
                    <td className="py-3 px-3 border-r border-[#E5E5EA] text-right font-mono text-xs font-semibold align-middle whitespace-nowrap">
                      <span
                        className={
                          item.stockQty > 0
                            ? "text-[#15803D] font-bold"
                            : "text-[#6E6E73]"
                        }
                      >
                        {item.stockQty.toFixed(2)}
                      </span>
                    </td>

                    {/* Zone 0: Virtual Box 0 */}
                    <td className="py-3 px-2 text-center border-r border-[#E5E5EA] align-middle bg-[#F0FDF4]/30">
                      {(item.zones.virtualBox0 ?? (item.category === "BOP" ? "N/A" : 0)) === "N/A" ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E2E8F0] text-[#64748B]">
                          N/A
                        </span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          value={item.zones.virtualBox0 ?? 0}
                          onChange={(e) =>
                            handleZoneChange(item.id, "virtualBox0", e.target.value)
                          }
                          className="w-16 h-7 text-center font-mono text-xs font-medium border border-[#D1D5DB] rounded-md focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] bg-white transition-all outline-none"
                        />
                      )}
                    </td>

                    {/* Zone 1: Machine Zone */}
                    <td className="py-3 px-2 text-center border-r border-[#E5E5EA] align-middle bg-[#F1F5F9]/30">
                      {item.zones.machineZone === "N/A" ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E2E8F0] text-[#64748B]">
                          N/A
                        </span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          value={item.zones.machineZone}
                          onChange={(e) =>
                            handleZoneChange(item.id, "machineZone", e.target.value)
                          }
                          className="w-16 h-7 text-center font-mono text-xs font-medium border border-[#D1D5DB] rounded-md focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] bg-white transition-all outline-none"
                        />
                      )}
                    </td>

                    {/* Zone 2: Virtual Box 1 */}
                    <td className="py-3 px-2 text-center border-r border-[#E5E5EA] align-middle bg-[#F0FDF4]/30">
                      {item.zones.virtualBox1 === "N/A" ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E2E8F0] text-[#64748B]">
                          N/A
                        </span>
                      ) : (
                        <div>
                          <input
                            type="number"
                            min="0"
                            value={item.zones.virtualBox1}
                            onChange={(e) =>
                              handleZoneChange(item.id, "virtualBox1", e.target.value)
                            }
                            className="w-16 h-7 text-center font-mono text-xs font-medium border border-[#D1D5DB] rounded-md focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] bg-white transition-all outline-none"
                          />
                          {item.hasStoreTransferLink && (
                            <Link
                              href="/bop-transfer"
                              className="text-[10px] font-medium text-[#007AFF] hover:underline block mt-1 tracking-tight"
                            >
                              [Store Transfer]
                            </Link>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Zone 3: Brazing Zone */}
                    <td className="py-3 px-2 text-center border-r border-[#E5E5EA] align-middle">
                      {item.zones.brazingZone === "N/A" ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E2E8F0] text-[#64748B]">
                          N/A
                        </span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          value={item.zones.brazingZone}
                          onChange={(e) =>
                            handleZoneChange(item.id, "brazingZone", e.target.value)
                          }
                          className="w-16 h-7 text-center font-mono text-xs font-medium border border-[#D1D5DB] rounded-md focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] bg-white transition-all outline-none"
                        />
                      )}
                    </td>

                    {/* Zone 4: Virtual Box 2 */}
                    <td className="py-3 px-2 text-center border-r border-[#E5E5EA] align-middle bg-[#F0FDF4]/30">
                      {item.zones.virtualBox2 === "N/A" ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E2E8F0] text-[#64748B]">
                          N/A
                        </span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          value={item.zones.virtualBox2}
                          onChange={(e) =>
                            handleZoneChange(item.id, "virtualBox2", e.target.value)
                          }
                          className="w-16 h-7 text-center font-mono text-xs font-medium border border-[#D1D5DB] rounded-md focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] bg-white transition-all outline-none"
                        />
                      )}
                    </td>

                    {/* Zone 5: Leak Testing Zone */}
                    <td className="py-3 px-2 text-center border-r border-[#E5E5EA] align-middle">
                      {item.zones.leakTestingZone === "N/A" ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E2E8F0] text-[#64748B]">
                          N/A
                        </span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          value={item.zones.leakTestingZone}
                          onChange={(e) =>
                            handleZoneChange(item.id, "leakTestingZone", e.target.value)
                          }
                          className="w-16 h-7 text-center font-mono text-xs font-medium border border-[#D1D5DB] rounded-md focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] bg-white transition-all outline-none"
                        />
                      )}
                    </td>

                    {/* Zone 6: Virtual Box 3 */}
                    <td className="py-3 px-2 text-center border-r border-[#E5E5EA] align-middle bg-[#F0FDF4]/30">
                      {item.zones.virtualBox3 === "N/A" ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E2E8F0] text-[#64748B]">
                          N/A
                        </span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          value={item.zones.virtualBox3}
                          onChange={(e) =>
                            handleZoneChange(item.id, "virtualBox3", e.target.value)
                          }
                          className="w-16 h-7 text-center font-mono text-xs font-medium border border-[#D1D5DB] rounded-md focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] bg-white transition-all outline-none"
                        />
                      )}
                    </td>

                    {/* Zone 7: Packing Zone */}
                    <td className="py-3 px-2 text-center border-r border-[#E5E5EA] align-middle">
                      {item.zones.packingZone === "N/A" ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E2E8F0] text-[#64748B]">
                          N/A
                        </span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          value={item.zones.packingZone}
                          onChange={(e) =>
                            handleZoneChange(item.id, "packingZone", e.target.value)
                          }
                          className="w-16 h-7 text-center font-mono text-xs font-medium border border-[#D1D5DB] rounded-md focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] bg-white transition-all outline-none"
                        />
                      )}
                    </td>

                    {/* Zone 8: Virtual Box 4 */}
                    <td className="py-3 px-2 text-center border-r border-[#E5E5EA] align-middle bg-[#F0FDF4]/30">
                      {item.zones.virtualBox4 === "N/A" ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E2E8F0] text-[#64748B]">
                          N/A
                        </span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          value={item.zones.virtualBox4}
                          onChange={(e) =>
                            handleZoneChange(item.id, "virtualBox4", e.target.value)
                          }
                          className="w-16 h-7 text-center font-mono text-xs font-medium border border-[#D1D5DB] rounded-md focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] bg-white transition-all outline-none"
                        />
                      )}
                    </td>

                    {/* Zone 9: FG Zone */}
                    <td className="py-3 px-2 text-center align-middle">
                      {item.zones.fgZone === "N/A" ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E2E8F0] text-[#64748B]">
                          N/A
                        </span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          value={item.zones.fgZone}
                          onChange={(e) =>
                            handleZoneChange(item.id, "fgZone", e.target.value)
                          }
                          className="w-16 h-7 text-center font-mono text-xs font-medium border border-[#D1D5DB] rounded-md focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] bg-white transition-all outline-none"
                        />
                      )}
                    </td>
                  </tr>
                ))}

                {/* Reactive TOTAL SUMMARY Row */}
                <tr className="bg-[#F8F9FA] font-bold text-xs border-t-2 border-[#D1D5DB]">
                  <td
                    colSpan={6}
                    className="py-3 px-4 border-r border-[#E5E5EA] text-right font-extrabold uppercase text-[#48484A] tracking-wider"
                  >
                    TOTAL SUMMARY:
                  </td>
                  <td className="py-3 px-3 border-r border-[#E5E5EA] text-right font-mono font-bold text-[#1D1D1F]">
                    {totals.woQtyTotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 border-r border-[#E5E5EA] text-right font-mono font-bold text-[#15803D]">
                    {totals.stockQtyTotal.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-3 px-2 text-center border-r border-[#E5E5EA] font-mono font-bold text-[#15803D] bg-[#F0FDF4]/60">
                    {totals.vb0Total.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-center border-r border-[#E5E5EA] font-mono font-bold text-[#1D1D1F] bg-[#F1F5F9]/60">
                    {totals.machineZoneTotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-center border-r border-[#E5E5EA] font-mono font-bold text-[#15803D] bg-[#F0FDF4]/60">
                    {totals.vb1Total.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-center border-r border-[#E5E5EA] font-mono font-bold text-[#1D1D1F]">
                    {totals.brazingTotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-center border-r border-[#E5E5EA] font-mono font-bold text-[#15803D] bg-[#F0FDF4]/60">
                    {totals.vb2Total.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-center border-r border-[#E5E5EA] font-mono font-bold text-[#1D1D1F]">
                    {totals.leakTotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-center border-r border-[#E5E5EA] font-mono font-bold text-[#15803D] bg-[#F0FDF4]/60">
                    {totals.vb3Total.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-center border-r border-[#E5E5EA] font-mono font-bold text-[#1D1D1F]">
                    {totals.packingTotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-center border-r border-[#E5E5EA] font-mono font-bold text-[#15803D] bg-[#F0FDF4]/60">
                    {totals.vb4Total.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-bold text-[#1D1D1F]">
                    {totals.fgTotal.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Notice & Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E5EA] py-3 px-4 sm:px-8 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto">
          <div className="text-[11px] text-[#6E6E73] flex items-center gap-1.5 leading-snug">
            <span className="font-bold text-[#D97706]">ℹ️ Notice:</span>
            <span>
              Zone assignments can be retrieved and amended. Click &quot;Save Zone Assignment&quot; to commit changes to system database.
              <span className="font-semibold text-[#DC2626] ml-1">
                Authorization is required before dispatching to plant zones.
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
            <button
              onClick={handleSaveAssignment}
              className="px-4 py-2 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Zone Assignment</span>
            </button>

            <button
              onClick={handleSaveAndAuthorize}
              className="px-4 py-2 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Save &amp; Authorize</span>
            </button>
          </div>
        </div>
      </div>

      {/* Assembly Route Card Modal */}
      {showRouteCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#E5E5EA] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-3">
              <div className="flex items-center gap-2">
                <Route className="w-5 h-5 text-[#007AFF]" />
                <h3 className="text-base font-bold text-[#1D1D1F]">
                  Assembly Route Card — {currentWo.assemblyPartNo}
                </h3>
              </div>
              <button
                onClick={() => setShowRouteCardModal(false)}
                className="text-[#86868B] hover:text-[#1D1D1F] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F8F9FA] rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#1D1D1F]">Customer:</span>{" "}
                  {currentWo.customerName}
                </div>
                <div>
                  <span className="font-bold text-[#1D1D1F]">Plan Qty:</span>{" "}
                  {currentWo.planQty} NOS
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-[#48484A] uppercase text-[10.5px]">
                  Production Stage Breakdown &amp; Virtual Handoffs:
                </div>
                <div className="space-y-1.5 border border-[#E5E5EA] rounded-xl p-3 bg-white">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#10B981] text-white text-[10px] font-bold flex items-center justify-center">0</span>
                    <span className="font-semibold text-[#1D1D1F]">Virtual Box 0:</span>
                    <span className="text-[#6E6E73]">Raw Material / Pipe Staging &amp; Issuance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#007AFF] text-white text-[10px] font-bold flex items-center justify-center">1</span>
                    <span className="font-semibold text-[#1D1D1F]">Machine Zone:</span>
                    <span className="text-[#6E6E73]">CNC Rotary Tube Draw Bending &amp; Forming</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#10B981] text-white text-[10px] font-bold flex items-center justify-center">2</span>
                    <span className="font-semibold text-[#1D1D1F]">Virtual Box 1:</span>
                    <span className="text-[#6E6E73]">Store BOP Kitting &amp; Child Part Staging</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#F59E0B] text-white text-[10px] font-bold flex items-center justify-center">3</span>
                    <span className="font-semibold text-[#1D1D1F]">Brazing Zone:</span>
                    <span className="text-[#6E6E73]">Continuous Induction Brazing Carousel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#6366F1] text-white text-[10px] font-bold flex items-center justify-center">4</span>
                    <span className="font-semibold text-[#1D1D1F]">Leak Testing Zone:</span>
                    <span className="text-[#6E6E73]">Differential Dry Air Pressure Decay Test (32 Bar)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#EC4899] text-white text-[10px] font-bold flex items-center justify-center">5</span>
                    <span className="font-semibold text-[#1D1D1F]">Packing &amp; FG Zone:</span>
                    <span className="text-[#6E6E73]">End Cap Sealing, Barcode Verification, Master Carton Pallet</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E5E5EA]">
              <button
                onClick={() => setShowRouteCardModal(false)}
                className="px-4 py-2 rounded-xl bg-[#007AFF] text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOM Master Modal */}
      {showBomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#E5E5EA] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-3">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-[#007AFF]" />
                <h3 className="text-base font-bold text-[#1D1D1F]">
                  BOM Master Specification — {currentWo.assemblyPartNo}
                </h3>
              </div>
              <button
                onClick={() => setShowBomModal(false)}
                className="text-[#86868B] hover:text-[#1D1D1F] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-[#6E6E73]">
                Total of {currentWo.items.length} bill-of-materials components assigned to {currentWo.assemblyPartName}.
              </p>
              <div className="border border-[#E5E5EA] rounded-xl overflow-hidden divide-y divide-[#E5E5EA]">
                {currentWo.items.map((item) => (
                  <div key={item.id} className="p-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#1D1D1F]">{item.partCode}</div>
                      <div className="text-[11px] text-[#48484A]">{item.partName}</div>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded",
                        item.category === "Child Part"
                          ? "bg-[#EFF6FF] text-[#2563EB]"
                          : "bg-[#FFFBEB] text-[#D97706]"
                      )}
                    >
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E5E5EA]">
              <button
                onClick={() => setShowBomModal(false)}
                className="px-4 py-2 rounded-xl bg-[#007AFF] text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

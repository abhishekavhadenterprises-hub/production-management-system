import React, { useState, useMemo } from "react";
import Head from "next/head";
import {
  Route,
  Search,
  Plus,
  RotateCcw,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  ChevronDown,
  Save,
  Package,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertTriangle,
  Boxes,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AssemblyRouteItem, RouteStage } from "@/lib/masters-types";
import { INITIAL_ASSEMBLY_ROUTES, INITIAL_BOM_ASSEMBLIES, INITIAL_ZONES, INITIAL_VIRTUAL_BOXES } from "@/lib/masters-mock-data";
import { usePersistentState } from "@/lib/use-persistent-state";

export function AssemblyRouteCardView() {
  const [routes, setRoutes] = usePersistentState<AssemblyRouteItem[]>(
    "prodsync_master_assembly_routes",
    INITIAL_ASSEMBLY_ROUTES
  );

  const [currentView, setCurrentView] = useState<"overview" | "edit">("overview");
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Edit Form State
  const [editFormData, setEditFormData] = useState<AssemblyRouteItem>({
    id: "",
    assemblyCode: "",
    assemblyName: "",
    bomRevision: "Rev 1.0",
    componentCount: 0,
    routeStatus: "Pending Configuration",
    stages: [],
    updatedAt: new Date().toISOString().split("T")[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.assemblyCode.toLowerCase().includes(q) ||
        r.assemblyName.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "All" || r.routeStatus === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [routes, searchQuery, statusFilter]);

  const paginatedRoutes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRoutes.slice(start, start + pageSize);
  }, [filteredRoutes, currentPage]);

  const totalPages = Math.ceil(filteredRoutes.length / pageSize) || 1;

  // 3 Summary cards matching spec: Total Assemblies, Configured Routes, Pending Routes
  const totalCount = routes.length;
  const configuredCount = routes.filter((r) => r.routeStatus === "Configured").length;
  const pendingCount = routes.filter((r) => r.routeStatus === "Pending Configuration").length;

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setCurrentPage(1);
  };

  // Open Edit Form
  const handleOpenEdit = (routeItem: AssemblyRouteItem) => {
    setEditFormData(JSON.parse(JSON.stringify(routeItem)));
    setErrors({});
    setSelectedRouteId(routeItem.id);
    setCurrentView("edit");
  };

  // Add Stage to Route
  const handleAddStage = () => {
    const defaultZone = INITIAL_ZONES[0];
    const defaultBox = INITIAL_VIRTUAL_BOXES[0];
    const nextSeq = editFormData.stages.length + 1;

    const newStage: RouteStage = {
      stageSequence: nextSeq,
      zoneCode: defaultZone.code,
      stageName: defaultZone.name,
      virtualBoxCode: defaultBox.code,
      remarks: "",
    };

    setEditFormData((prev) => ({
      ...prev,
      stages: [...prev.stages, newStage],
    }));
  };

  const handleRemoveStage = (index: number) => {
    setEditFormData((prev) => ({
      ...prev,
      stages: prev.stages
        .filter((_, i) => i !== index)
        .map((s, idx) => ({ ...s, stageSequence: idx + 1 })),
    }));
  };

  const handleStageChange = (index: number, field: keyof RouteStage, val: any) => {
    setEditFormData((prev) => {
      const updated = [...prev.stages];
      if (field === "zoneCode") {
        const zoneMatch = INITIAL_ZONES.find((z) => z.code === val);
        updated[index] = {
          ...updated[index],
          zoneCode: val,
          stageName: zoneMatch ? zoneMatch.name : updated[index].stageName,
        };
      } else {
        updated[index] = { ...updated[index], [field]: val };
      }
      return { ...prev, stages: updated };
    });
  };

  const handleSaveRoute = () => {
    if (editFormData.stages.length === 0) {
      setErrors({ stages: "Route requires at least one processing stage sequence." });
      return;
    }

    setIsSaving(true);
    setErrors({});

    const saved: AssemblyRouteItem = {
      ...editFormData,
      routeStatus: "Configured",
      updatedAt: new Date().toISOString().split("T")[0],
    };

    setTimeout(() => {
      setRoutes((prev) => prev.map((r) => (r.id === selectedRouteId ? saved : r)));
      showToast(`Process route saved for ${saved.assemblyCode}`);
      setIsSaving(false);
      setCurrentView("overview");
    }, 300);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] text-[#1D1D1F]">
      <Head>
        <title>Assembly Route Card - PRODSYNC Masters</title>
        <meta name="description" content="Assembly manufacturing process routing, zone handoffs and buffer box transitions" />
      </Head>

      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#1D1D1F] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs border border-white/10 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#34C759] shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75">✕</button>
        </div>
      )}

      {/* OVERVIEW VIEW */}
      {currentView === "overview" && (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-[#E5E5EA] px-4 py-3.5 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-xs shrink-0">
                  <Route className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-[#1D1D1F] tracking-tight">Assembly Route Card</h1>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                      ROUTING MATRIX
                    </span>
                  </div>
                  <p className="text-xs text-[#86868B] mt-0.5">
                    Define product progression across manufacturing zones, buffer virtual boxes, and QA handoffs
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Summary Cards */}
          <div className="px-4 py-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#007AFF] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                  <span>TOTAL ASSEMBLIES</span>
                  <span className="px-2 py-0.5 rounded bg-[#E8F2FE] text-[#007AFF] text-[9.5px] font-bold">BOM Link</span>
                </div>
                <div className="text-2xl font-bold font-mono text-[#1D1D1F] mt-2">{totalCount}</div>
                <span className="text-[11px] text-[#86868B] mt-1">Assemblies linked from BOM Master</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#10B981] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                  <span>CONFIGURED ROUTES</span>
                  <span className="px-2 py-0.5 rounded bg-[#D1FAE5] text-[#065F46] text-[9.5px] font-bold">Ready</span>
                </div>
                <div className="text-2xl font-bold font-mono text-[#10B981] mt-2">{configuredCount}</div>
                <span className="text-[11px] text-[#86868B] mt-1">Complete zone sequence verified</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#F59E0B] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                  <span>PENDING ROUTES</span>
                  <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] text-[9.5px] font-bold">Action Needed</span>
                </div>
                <div className="text-2xl font-bold font-mono text-[#F59E0B] mt-2">{pendingCount}</div>
                <span className="text-[11px] text-[#86868B] mt-1">Requires route card definition</span>
              </div>
            </div>
          </div>

          {/* Filter Row */}
          <div className="px-4 pb-2 sm:px-6">
            <div className="bg-white p-3 rounded-xl border border-[#E5E5EA] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                <div className="relative min-w-[240px] flex-1">
                  <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search Assembly Code, Name..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#007AFF]"
                  />
                </div>

                <div className="relative min-w-[190px]">
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full appearance-none px-3 py-1.5 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] focus:outline-none focus:border-[#007AFF] cursor-pointer"
                  >
                    <option value="All">All Route Statuses</option>
                    <option value="Configured">Configured</option>
                    <option value="Pending Configuration">Pending Configuration</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {(searchQuery || statusFilter !== "All") && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-1.5 rounded-lg border border-[#E5E5EA] bg-white hover:bg-[#F5F5F7] text-xs font-medium text-[#6E6E73] flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="px-4 py-2 sm:px-6 flex-1 flex flex-col pb-12">
            <div className="bg-white rounded-xl border border-[#E5E5EA] shadow-xs overflow-x-auto flex-1 flex flex-col justify-between">
              <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#E5E5EA] text-[10.5px] font-bold text-[#6E6E73] uppercase tracking-wider select-none">
                    <th className="px-3 py-3 min-w-[150px]">ASSEMBLY CODE</th>
                    <th className="px-3 py-3 min-w-[240px]">ASSEMBLY NAME</th>
                    <th className="px-3 py-3 text-center min-w-[100px]">BOM REVISION</th>
                    <th className="px-3 py-3 text-center min-w-[120px]">COMPONENT COUNT</th>
                    <th className="px-3 py-3 min-w-[220px]">ROUTE PREVIEW</th>
                    <th className="px-3 py-3 text-center min-w-[140px]">ROUTE STATUS</th>
                    <th className="px-3 py-3 text-center min-w-[100px]">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F2F7]">
                  {paginatedRoutes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-[#86868B]">
                        <div className="max-w-xs mx-auto flex flex-col items-center">
                          <Package className="w-8 h-8 text-[#C7C7CC] mb-2" />
                          <p className="text-sm font-semibold text-[#1D1D1F]">No Assembly Routes Found</p>
                          <p className="text-xs text-[#86868B] mt-1">Try resetting filters to view all BOM items.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedRoutes.map((r) => {
                      const isConfigured = r.routeStatus === "Configured";
                      return (
                        <tr key={r.id} className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="px-3 py-3">
                            <span className="px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] font-mono text-[11px] font-semibold">
                              {r.assemblyCode}
                            </span>
                          </td>
                          <td className="px-3 py-3 font-medium text-[#1D1D1F]">{r.assemblyName}</td>
                          <td className="px-3 py-3 text-center">
                            <span className="px-2 py-0.5 rounded bg-[#F2F2F7] text-[#48484A] font-mono text-[10.5px] font-semibold border border-[#E5E5EA]">
                              {r.bomRevision}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7] font-bold text-xs">
                              {r.componentCount} parts
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            {r.stages.length > 0 ? (
                              <div className="flex items-center gap-1 overflow-x-auto text-[10.5px] font-mono text-[#52525B]">
                                {r.stages.map((stg, i) => (
                                  <React.Fragment key={stg.stageSequence}>
                                    <span className="px-1.5 py-0.5 bg-[#F2F2F7] rounded border border-[#E5E5EA] font-semibold shrink-0">
                                      {stg.zoneCode}
                                    </span>
                                    {i < r.stages.length - 1 && <span className="text-[#86868B] shrink-0">&rarr;</span>}
                                  </React.Fragment>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[#86868B] italic">No stages assigned</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span
                              className={cn(
                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase inline-flex items-center gap-1",
                                isConfigured
                                  ? "bg-[#EAF8EF] text-[#16A34A] border border-[#34C759]/30"
                                  : "bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30"
                              )}
                            >
                              <span className={cn("w-1.5 h-1.5 rounded-full", isConfigured ? "bg-[#16A34A]" : "bg-[#F59E0B]")} />
                              <span>{r.routeStatus}</span>
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <button
                              onClick={() => handleOpenEdit(r)}
                              className="px-2.5 py-1 rounded-md text-xs font-semibold text-[#007AFF] hover:bg-[#E8F2FE] transition-colors"
                            >
                              {isConfigured ? "Edit Route" : "Configure"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="px-4 py-3 border-t border-[#E5E5EA] bg-[#FAFAFA] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6E6E73] select-none">
                <div>
                  Showing <span className="font-semibold text-[#1D1D1F]">{filteredRoutes.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to <span className="font-semibold text-[#1D1D1F]">{Math.min(currentPage * pageSize, filteredRoutes.length)}</span> of <span className="font-semibold text-[#1D1D1F]">{filteredRoutes.length}</span> assembly routes
                </div>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 rounded-lg border border-[#E5E5EA] bg-white text-[#1D1D1F] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F5F5F7] text-xs"
                  >
                    Previous
                  </button>
                  <span className="px-2 text-xs font-medium text-[#1D1D1F]">{currentPage} / {totalPages}</span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1 rounded-lg border border-[#E5E5EA] bg-white text-[#1D1D1F] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F5F5F7] text-xs"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED ROUTE-EDITING PAGE */}
      {currentView === "edit" && (
        <div className="flex-1 flex flex-col pb-16">
          <div className="bg-white border-b border-[#E5E5EA] px-4 py-3.5 sm:px-6 sticky top-0 z-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentView("overview")}
                  className="p-1.5 rounded-lg border border-[#E5E5EA] hover:bg-[#F5F5F7] text-[#1D1D1F] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-[#1D1D1F] tracking-tight">
                      Configure Route: {editFormData.assemblyCode}
                    </h1>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[#E8F2FE] text-[#007AFF] border border-[#007AFF]/20">
                      {editFormData.bomRevision}
                    </span>
                  </div>
                  <p className="text-xs text-[#86868B] mt-0.5">
                    {editFormData.assemblyName} &bull; {editFormData.componentCount} BOM components auto-linked
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentView("overview")}
                  className="px-3 py-1.5 rounded-xl border border-[#E5E5EA] bg-white hover:bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveRoute}
                  className="px-4 py-1.5 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Saving..." : "Save Route Card"}</span>
                </button>
              </div>
            </div>
          </div>

          {errors.stages && (
            <div className="mx-4 sm:mx-6 mt-4 p-3 bg-[#FFF5F5] border border-[#FF3B30]/30 rounded-xl text-xs text-[#DC2626] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errors.stages}</span>
            </div>
          )}

          <div className="px-4 py-4 sm:px-6 space-y-4 max-w-6xl w-full mx-auto">
            {/* Visual Route Flow Header Card */}
            <div className="bg-white rounded-xl border border-[#E5E5EA] shadow-xs p-4 sm:p-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#F2F2F7]">
                <div>
                  <h3 className="text-sm font-bold text-[#1D1D1F]">Route Sequence Flow</h3>
                  <p className="text-xs text-[#86868B]">Sequential stage progression through shop floor zones and buffer boxes</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddStage}
                  className="px-3 py-1.5 rounded-lg bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Process Stage</span>
                </button>
              </div>

              {editFormData.stages.length === 0 ? (
                <div className="py-12 text-center text-[#86868B] text-xs border border-dashed border-[#E5E5EA] rounded-xl mt-4">
                  No process stages assigned yet. Click &quot;Add Process Stage&quot; to build the routing sequence.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {editFormData.stages.map((stg, idx) => (
                    <div
                      key={stg.stageSequence}
                      className="p-3.5 rounded-xl border border-[#E5E5EA] bg-[#FAFAFA] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#007AFF] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-semibold text-[#1D1D1F] block text-xs">Stage {idx + 1}: {stg.stageName}</span>
                          <span className="text-[10.5px] text-[#86868B]">Zone Code: {stg.zoneCode}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 flex-1 sm:max-w-xl justify-end">
                        {/* Zone Selector */}
                        <div className="relative min-w-[170px]">
                          <select
                            value={stg.zoneCode}
                            onChange={(e) => handleStageChange(idx, "zoneCode", e.target.value)}
                            className="w-full appearance-none px-3 py-1.5 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs font-medium focus:outline-none focus:border-[#007AFF]"
                          >
                            {INITIAL_ZONES.map((z) => (
                              <option key={z.code} value={z.code}>{z.code} — {z.name.split(" ")[0]}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-2.5 pointer-events-none" />
                        </div>

                        {/* Buffer Virtual Box */}
                        <div className="relative min-w-[130px]">
                          <select
                            value={stg.virtualBoxCode || ""}
                            onChange={(e) => handleStageChange(idx, "virtualBoxCode", e.target.value)}
                            className="w-full appearance-none px-3 py-1.5 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs font-mono font-medium focus:outline-none focus:border-[#007AFF]"
                          >
                            <option value="">No Buffer Box</option>
                            {INITIAL_VIRTUAL_BOXES.map((vb) => (
                              <option key={vb.code} value={vb.code}>{vb.code} Buffer</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-2.5 pointer-events-none" />
                        </div>

                        {/* Remarks */}
                        <input
                          type="text"
                          placeholder="Optional station notes..."
                          value={stg.remarks || ""}
                          onChange={(e) => handleStageChange(idx, "remarks", e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-[#E5E5EA] rounded-lg text-xs flex-1 min-w-[130px] focus:outline-none focus:border-[#007AFF]"
                        />

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => handleRemoveStage(idx)}
                          className="p-1.5 rounded-lg text-[#86868B] hover:text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                          title="Remove Stage"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

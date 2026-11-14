import React, { useState, useMemo } from "react";
import Head from "next/head";
import {
  Cog,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MachineMasterItem, MachineOperationalStatus } from "@/lib/masters-types";
import { INITIAL_MACHINES_MASTER, INITIAL_DEPARTMENTS } from "@/lib/masters-mock-data";
import { usePersistentState } from "@/lib/use-persistent-state";

export function MachineMasterView() {
  const [machines, setMachines] = usePersistentState<MachineMasterItem[]>(
    "prodsync_master_machines_list",
    INITIAL_MACHINES_MASTER
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Operational Statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const initialForm: MachineMasterItem = {
    id: "",
    code: "",
    name: "",
    type: "CNC Rotary Draw Bender",
    department: INITIAL_DEPARTMENTS[0]?.name || "Tube Bending & Forming",
    ratedCapacity: 60,
    capacityUom: "pcs/hr",
    operationalStatus: "Available",
    serialNumber: "",
    location: "Bay 1 - North",
    nextMaintenanceDue: "",
    remarks: "",
    status: "Active",
  };

  const [formData, setFormData] = useState<MachineMasterItem>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const departmentList = useMemo(() => {
    return ["All Departments", ...INITIAL_DEPARTMENTS.map((d) => d.name)];
  }, []);

  const filteredMachines = useMemo(() => {
    return machines.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        m.code.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q) ||
        (m.location && m.location.toLowerCase().includes(q));

      const matchDept =
        deptFilter === "All Departments" || m.department === deptFilter;

      const matchStatus =
        statusFilter === "All Operational Statuses" || m.operationalStatus === statusFilter;

      return matchSearch && matchDept && matchStatus;
    });
  }, [machines, searchQuery, deptFilter, statusFilter]);

  const paginatedMachines = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMachines.slice(start, start + pageSize);
  }, [filteredMachines, currentPage]);

  const totalPages = Math.ceil(filteredMachines.length / pageSize) || 1;

  // 4 Summary cards matching spec: Total, Available, Running, Breakdown
  const totalCount = machines.length;
  const availableCount = machines.filter((m) => m.operationalStatus === "Available").length;
  const runningCount = machines.filter((m) => m.operationalStatus === "Running").length;
  const breakdownCount = machines.filter((m) => m.operationalStatus === "Breakdown").length;

  const handleClearFilters = () => {
    setSearchQuery("");
    setDeptFilter("All Departments");
    setStatusFilter("All Operational Statuses");
    setCurrentPage(1);
  };

  const handleOpenAdd = () => {
    setFormData({
      ...initialForm,
      id: `mac-${Date.now()}`,
    });
    setErrors({});
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mac: MachineMasterItem) => {
    setFormData({ ...mac });
    setErrors({});
    setEditingId(mac.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete machine ${code}?`)) {
      setMachines((prev) => prev.filter((m) => m.id !== id));
      showToast(`Machine ${code} deleted`);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = "Machine Code is required";
    } else {
      const duplicate = machines.find(
        (m) =>
          m.code.toLowerCase() === formData.code.toLowerCase().trim() &&
          m.id !== editingId
      );
      if (duplicate) {
        newErrors.code = `Machine Code "${formData.code}" is already registered`;
      }
    }

    if (!formData.name.trim()) {
      newErrors.name = "Machine Name / Model is required";
    }

    if (!formData.type.trim()) {
      newErrors.type = "Machine Type is required";
    }

    if (!formData.department) {
      newErrors.department = "Department is required";
    }

    if (!formData.ratedCapacity || formData.ratedCapacity <= 0) {
      newErrors.ratedCapacity = "Rated Capacity must be a positive number (> 0)";
    }

    if (!formData.capacityUom) {
      newErrors.capacityUom = "Capacity UOM is required";
    }

    if (!formData.operationalStatus) {
      newErrors.operationalStatus = "Initial Operational Status is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    setErrors({});

    const saved: MachineMasterItem = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
    };

    setTimeout(() => {
      if (!editingId) {
        setMachines((prev) => [saved, ...prev]);
        showToast(`Machine ${saved.code} created`);
      } else {
        setMachines((prev) => prev.map((m) => (m.id === editingId ? saved : m)));
        showToast(`Machine ${saved.code} updated`);
      }
      setIsSaving(false);
      setIsModalOpen(false);
    }, 250);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] text-[#1D1D1F]">
      <Head>
        <title>Machine Master - PRODSYNC Masters</title>
        <meta name="description" content="CNC tube benders, collaring cells, rated capacities and maintenance schedules" />
      </Head>

      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#1D1D1F] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs border border-white/10 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#34C759] shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-[#E5E5EA] px-4 py-3.5 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-xs shrink-0">
              <Cog className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#1D1D1F] tracking-tight">Machine Master</h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                  PLANT EQUIPMENT
                </span>
              </div>
              <p className="text-xs text-[#86868B] mt-0.5">
                CNC tube benders, expanding cells, rated capacities per hour, and maintenance due schedules
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Machine</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards: Total, Available, Running, Breakdown */}
      <div className="px-4 py-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#007AFF] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>TOTAL MACHINES</span>
              <span className="px-2 py-0.5 rounded bg-[#E8F2FE] text-[#007AFF] text-[9.5px] font-bold">Equipment</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#1D1D1F] mt-2">{totalCount}</div>
            <span className="text-[11px] text-[#86868B] mt-1">Total installed plant machinery</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#10B981] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>AVAILABLE</span>
              <span className="px-2 py-0.5 rounded bg-[#D1FAE5] text-[#065F46] text-[9.5px] font-bold">Ready</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#10B981] mt-2">{availableCount}</div>
            <span className="text-[11px] text-[#86868B] mt-1">Ready for work order scheduling</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#F59E0B] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>RUNNING</span>
              <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] text-[9.5px] font-bold">In Cut</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#F59E0B] mt-2">{runningCount}</div>
            <span className="text-[11px] text-[#86868B] mt-1">Live running production jobs</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#EF4444] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>BREAKDOWN</span>
              <span className="px-2 py-0.5 rounded bg-[#FEE2E2] text-[#991B1B] text-[9.5px] font-bold">Stoppage</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#EF4444] mt-2">{breakdownCount}</div>
            <span className="text-[11px] text-[#86868B] mt-1">Maintenance team dispatched</span>
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
                placeholder="Search Code, Model, Type, Location..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#007AFF]"
              />
            </div>

            <div className="relative min-w-[200px]">
              <select
                value={deptFilter}
                onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none px-3 py-1.5 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] focus:outline-none focus:border-[#007AFF] cursor-pointer"
              >
                {departmentList.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <div className="relative min-w-[190px]">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none px-3 py-1.5 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] focus:outline-none focus:border-[#007AFF] cursor-pointer"
              >
                <option value="All Operational Statuses">All Operational Statuses</option>
                <option value="Available">Available</option>
                <option value="Running">Running</option>
                <option value="Breakdown">Breakdown</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Offline">Offline</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {(searchQuery || deptFilter !== "All Departments" || statusFilter !== "All Operational Statuses") && (
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
          <table className="w-full text-left text-xs border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#E5E5EA] text-[10.5px] font-bold text-[#6E6E73] uppercase tracking-wider select-none">
                <th className="px-3 py-3 min-w-[120px]">CODE</th>
                <th className="px-3 py-3 min-w-[220px]">MACHINE NAME</th>
                <th className="px-3 py-3 min-w-[160px]">TYPE</th>
                <th className="px-3 py-3 min-w-[170px]">DEPARTMENT</th>
                <th className="px-3 py-3 text-right min-w-[120px]">CAPACITY / UOM</th>
                <th className="px-3 py-3 min-w-[130px]">LOCATION</th>
                <th className="px-3 py-3 text-center min-w-[120px]">OPERATIONAL STATUS</th>
                <th className="px-3 py-3 text-center min-w-[140px]">NEXT MAINTENANCE</th>
                <th className="px-3 py-3 text-center min-w-[100px]">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F2F7]">
              {paginatedMachines.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-[#86868B]">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <Package className="w-8 h-8 text-[#C7C7CC] mb-2" />
                      <p className="text-sm font-semibold text-[#1D1D1F]">No Machines Found</p>
                      <p className="text-xs text-[#86868B] mt-1">Try resetting filters or click Add Machine.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedMachines.map((mac) => {
                  return (
                    <tr key={mac.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] font-mono text-[11px] font-semibold">
                          {mac.code}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-[#1D1D1F]">
                        <div>
                          <span>{mac.name}</span>
                          {mac.serialNumber && (
                            <span className="text-[10px] text-[#86868B] block mt-0.5">S/N: {mac.serialNumber}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[#52525B]">{mac.type}</td>
                      <td className="px-3 py-3 text-[#52525B]">
                        <span className="px-2 py-0.5 rounded-md bg-[#F2F2F7] text-[#48484A] text-[11px]">
                          {mac.department}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-[#1D1D1F]">
                        {mac.ratedCapacity} <span className="text-[10px] font-normal text-[#86868B]">{mac.capacityUom}</span>
                      </td>
                      <td className="px-3 py-3 text-[#52525B]">{mac.location || "—"}</td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase inline-flex items-center gap-1",
                            mac.operationalStatus === "Available" && "bg-[#EAF8EF] text-[#16A34A] border border-[#34C759]/30",
                            mac.operationalStatus === "Running" && "bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30",
                            mac.operationalStatus === "Breakdown" && "bg-[#FEE2E2] text-[#DC2626] border border-[#EF4444]/30",
                            mac.operationalStatus === "Maintenance" && "bg-[#EFF6FF] text-[#2563EB] border border-[#3B82F6]/30",
                            mac.operationalStatus === "Offline" && "bg-[#F2F2F7] text-[#86868B] border border-[#D1D1D6]"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              mac.operationalStatus === "Available" && "bg-[#16A34A]",
                              mac.operationalStatus === "Running" && "bg-[#F59E0B]",
                              mac.operationalStatus === "Breakdown" && "bg-[#DC2626]",
                              mac.operationalStatus === "Maintenance" && "bg-[#2563EB]",
                              mac.operationalStatus === "Offline" && "bg-[#86868B]"
                            )}
                          />
                          <span>{mac.operationalStatus}</span>
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-mono text-[11.5px] text-[#52525B]">
                        {mac.nextMaintenanceDue || "—"}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(mac)}
                            className="p-1 rounded-md text-[#6E6E73] hover:text-[#007AFF] hover:bg-[#E8F2FE] transition-colors"
                            title="Edit Machine"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(mac.id, mac.code)}
                            className="p-1 rounded-md text-[#6E6E73] hover:text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                            title="Delete Machine"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
              Showing <span className="font-semibold text-[#1D1D1F]">{filteredMachines.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to <span className="font-semibold text-[#1D1D1F]">{Math.min(currentPage * pageSize, filteredMachines.length)}</span> of <span className="font-semibold text-[#1D1D1F]">{filteredMachines.length}</span> machines
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E5EA] animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#007AFF]" />
                <h3 className="text-base font-bold text-[#1D1D1F]">{editingId ? "Edit Machine" : "Add New Machine"}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-[#F5F5F7] text-[#86868B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="py-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Machine Code */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Machine Code <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CNC-TB-08"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 bg-white border rounded-lg text-xs font-mono font-medium focus:outline-none",
                      errors.code ? "border-[#EF4444] bg-[#FFF5F5]" : "border-[#E5E5EA] focus:border-[#007AFF]"
                    )}
                  />
                  {errors.code && <span className="text-[10px] text-[#EF4444] mt-0.5 block">{errors.code}</span>}
                </div>

                {/* Machine Name / Model */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Machine Name / Model <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Crippa CA542 Multi-Axis"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 bg-white border rounded-lg text-xs font-medium focus:outline-none",
                      errors.name ? "border-[#EF4444] bg-[#FFF5F5]" : "border-[#E5E5EA] focus:border-[#007AFF]"
                    )}
                  />
                  {errors.name && <span className="text-[10px] text-[#EF4444] mt-0.5 block">{errors.name}</span>}
                </div>

                {/* Machine Type */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Machine Type <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CNC Rotary Draw Bender"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 bg-white border rounded-lg text-xs font-medium focus:outline-none",
                      errors.type ? "border-[#EF4444] bg-[#FFF5F5]" : "border-[#E5E5EA] focus:border-[#007AFF]"
                    )}
                  />
                  {errors.type && <span className="text-[10px] text-[#EF4444] mt-0.5 block">{errors.type}</span>}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Department <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs font-medium focus:outline-none focus:border-[#007AFF]"
                    >
                      {INITIAL_DEPARTMENTS.map((d) => (
                        <option key={d.code} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-3 pointer-events-none" />
                  </div>
                  {errors.department && <span className="text-[10px] text-[#EF4444] mt-0.5 block">{errors.department}</span>}
                </div>

                {/* Rated Capacity */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Rated Capacity <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.ratedCapacity}
                    onChange={(e) => setFormData({ ...formData, ratedCapacity: parseFloat(e.target.value) || 0 })}
                    className={cn(
                      "w-full px-3 py-2 bg-white border rounded-lg text-xs font-mono font-bold focus:outline-none",
                      errors.ratedCapacity ? "border-[#EF4444] bg-[#FFF5F5]" : "border-[#E5E5EA] focus:border-[#007AFF]"
                    )}
                  />
                  {errors.ratedCapacity && <span className="text-[10px] text-[#EF4444] mt-0.5 block">{errors.ratedCapacity}</span>}
                </div>

                {/* Capacity UOM (e.g. pcs/hr) */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Capacity UOM <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.capacityUom}
                      onChange={(e) => setFormData({ ...formData, capacityUom: e.target.value })}
                      className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs font-mono font-medium focus:outline-none focus:border-[#007AFF]"
                    >
                      <option value="pcs/hr">pcs/hr (Pieces per hour)</option>
                      <option value="bends/hr">bends/hr (Bends per hour)</option>
                      <option value="meters/hr">meters/hr (Meters per hour)</option>
                      <option value="joints/hr">joints/hr (Brazed joints/hr)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Operational Status */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Initial Operational Status <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.operationalStatus}
                      onChange={(e) => setFormData({ ...formData, operationalStatus: e.target.value as MachineOperationalStatus })}
                      className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs font-medium focus:outline-none focus:border-[#007AFF]"
                    >
                      <option value="Available">Available</option>
                      <option value="Running">Running</option>
                      <option value="Breakdown">Breakdown</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Offline">Offline</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Next Maintenance Due Date */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Next Maintenance Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.nextMaintenanceDue || ""}
                    onChange={(e) => setFormData({ ...formData, nextMaintenanceDue: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-xs focus:outline-none focus:border-[#007AFF]"
                  />
                </div>

                {/* Serial Number */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">Serial Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. CRP-2021-992"
                    value={formData.serialNumber || ""}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-xs focus:outline-none focus:border-[#007AFF]"
                  />
                </div>

                {/* Location / Shop */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">Floor Location / Shop (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Bay 1 - North"
                    value={formData.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-xs focus:outline-none focus:border-[#007AFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">Remarks (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Tooling setup capabilities, clamp limitations..."
                  value={formData.remarks || ""}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-xs resize-none focus:outline-none focus:border-[#007AFF]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E5EA]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E5EA] hover:bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Saving..." : "Save Machine"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

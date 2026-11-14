import React, { useState, useMemo } from "react";
import Head from "next/head";
import {
  MapPin,
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
import { ZoneItem, MasterStatus } from "@/lib/masters-types";
import { INITIAL_ZONES } from "@/lib/masters-mock-data";
import { usePersistentState } from "@/lib/use-persistent-state";

export function ZoneMasterView() {
  const [zones, setZones] = usePersistentState<ZoneItem[]>(
    "prodsync_master_zones",
    INITIAL_ZONES
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const initialForm: ZoneItem = {
    id: "",
    code: "",
    name: "",
    sequence: 1,
    description: "",
    status: "Active",
  };

  const [formData, setFormData] = useState<ZoneItem>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        z.code.toLowerCase().includes(q) ||
        z.name.toLowerCase().includes(q) ||
        (z.description && z.description.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === "All Statuses" || z.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [zones, searchQuery, statusFilter]);

  const paginatedZones = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredZones.slice(start, start + pageSize);
  }, [filteredZones, currentPage]);

  const totalPages = Math.ceil(filteredZones.length / pageSize) || 1;

  const totalCount = zones.length;
  const activeCount = zones.filter((z) => z.status === "Active").length;
  const inactiveCount = zones.filter((z) => z.status === "Inactive").length;

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All Statuses");
    setCurrentPage(1);
  };

  const handleOpenAdd = () => {
    const nextSeq = Math.max(...zones.map((z) => z.sequence), 0) + 1;
    setFormData({
      ...initialForm,
      id: `z-${Date.now()}`,
      sequence: nextSeq,
    });
    setErrors({});
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (zone: ZoneItem) => {
    setFormData({ ...zone });
    setErrors({});
    setEditingId(zone.id);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (id: string) => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id === id) {
          const next: MasterStatus = z.status === "Active" ? "Inactive" : "Active";
          showToast(`Zone ${z.code} marked ${next}`);
          return { ...z, status: next };
        }
        return z;
      })
    );
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete zone ${code}?`)) {
      setZones((prev) => prev.filter((z) => z.id !== id));
      showToast(`Zone ${code} deleted`);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = "Zone Code is required";
    } else {
      const duplicate = zones.find(
        (z) =>
          z.code.toLowerCase() === formData.code.toLowerCase().trim() &&
          z.id !== editingId
      );
      if (duplicate) {
        newErrors.code = `Zone Code "${formData.code}" is already in use`;
      }
    }

    if (!formData.name.trim()) {
      newErrors.name = "Zone Name is required";
    }

    if (!formData.sequence || formData.sequence <= 0) {
      newErrors.sequence = "Process Sequence must be a positive integer (> 0)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    setErrors({});

    const savedRecord: ZoneItem = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      sequence: Math.floor(Number(formData.sequence)),
    };

    setTimeout(() => {
      if (!editingId) {
        setZones((prev) => [...prev, savedRecord].sort((a, b) => a.sequence - b.sequence));
        showToast(`Zone ${savedRecord.code} created`);
      } else {
        setZones((prev) =>
          prev
            .map((z) => (z.id === editingId ? savedRecord : z))
            .sort((a, b) => a.sequence - b.sequence)
        );
        showToast(`Zone ${savedRecord.code} updated`);
      }
      setIsSaving(false);
      setIsModalOpen(false);
    }, 250);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] text-[#1D1D1F]">
      <Head>
        <title>Zone Master - PRODSYNC Masters</title>
        <meta name="description" content="Plant manufacturing stages and process sequence flow" />
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
            <div className="w-10 h-10 rounded-xl bg-[#D97706] text-white flex items-center justify-center shadow-xs shrink-0">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#1D1D1F] tracking-tight">Zone Master</h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                  PROCESS STAGES
                </span>
              </div>
              <p className="text-xs text-[#86868B] mt-0.5">
                Define plant manufacturing zones and their required process sequence routing
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Zone</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 py-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#007AFF] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>TOTAL ZONES</span>
              <span className="px-2 py-0.5 rounded bg-[#E8F2FE] text-[#007AFF] text-[9.5px] font-bold">Configured</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#1D1D1F] mt-2">{totalCount}</div>
            <span className="text-[11px] text-[#86868B] mt-1">Total plant floor stages</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#10B981] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>ACTIVE ZONES</span>
              <span className="px-2 py-0.5 rounded bg-[#D1FAE5] text-[#065F46] text-[9.5px] font-bold">In Routing</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#10B981] mt-2">{activeCount}</div>
            <span className="text-[11px] text-[#86868B] mt-1">Active in shop routing sequence</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#9CA3AF] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>INACTIVE ZONES</span>
              <span className="px-2 py-0.5 rounded bg-[#F2F2F7] text-[#6E6E73] text-[9.5px] font-bold">Excluded</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#6E6E73] mt-2">{inactiveCount}</div>
            <span className="text-[11px] text-[#86868B] mt-1">Excluded from new route selection</span>
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
                placeholder="Search by Code, Zone Name..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#007AFF]"
              />
            </div>

            <div className="relative min-w-[140px]">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none px-3 py-1.5 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] focus:outline-none focus:border-[#007AFF] cursor-pointer"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {(searchQuery || statusFilter !== "All Statuses") && (
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
          <table className="w-full text-left text-xs border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#E5E5EA] text-[10.5px] font-bold text-[#6E6E73] uppercase tracking-wider select-none">
                <th className="px-3 py-3 min-w-[130px]">CODE</th>
                <th className="px-3 py-3 min-w-[240px]">ZONE NAME</th>
                <th className="px-3 py-3 text-center min-w-[100px]">SEQUENCE</th>
                <th className="px-3 py-3 min-w-[250px]">DESCRIPTION</th>
                <th className="px-3 py-3 text-center min-w-[100px]">STATUS</th>
                <th className="px-3 py-3 text-center min-w-[100px]">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F2F7]">
              {paginatedZones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#86868B]">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <Package className="w-8 h-8 text-[#C7C7CC] mb-2" />
                      <p className="text-sm font-semibold text-[#1D1D1F]">No Zones Found</p>
                      <p className="text-xs text-[#86868B] mt-1">Try resetting filters or click Add Zone.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedZones.map((zone) => {
                  const isActive = zone.status === "Active";
                  return (
                    <tr key={zone.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] font-mono text-[11px] font-semibold">
                          {zone.code}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-[#1D1D1F]">{zone.name}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#E8F2FE] text-[#007AFF] font-bold font-mono text-xs">
                          #{zone.sequence}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[#52525B]">
                        <span className="truncate block max-w-[320px]">{zone.description || "—"}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(zone.id)}
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase transition-colors inline-flex items-center gap-1",
                            isActive
                              ? "bg-[#EAF8EF] text-[#16A34A] border border-[#34C759]/30 hover:bg-[#DCFCE7]"
                              : "bg-[#F2F2F7] text-[#86868B] border border-[#D1D1D6] hover:bg-[#E5E5EA]"
                          )}
                          title="Click to toggle status"
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-[#16A34A]" : "bg-[#86868B]")} />
                          <span>{zone.status}</span>
                        </button>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(zone)}
                            className="p-1 rounded-md text-[#6E6E73] hover:text-[#007AFF] hover:bg-[#E8F2FE] transition-colors"
                            title="Edit Zone"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(zone.id, zone.code)}
                            className="p-1 rounded-md text-[#6E6E73] hover:text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                            title="Delete Zone"
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
              Showing <span className="font-semibold text-[#1D1D1F]">{filteredZones.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to <span className="font-semibold text-[#1D1D1F]">{Math.min(currentPage * pageSize, filteredZones.length)}</span> of <span className="font-semibold text-[#1D1D1F]">{filteredZones.length}</span> zones
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E5EA] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#007AFF]" />
                <h3 className="text-base font-bold text-[#1D1D1F]">{editingId ? "Edit Zone" : "Add New Zone"}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-[#F5F5F7] text-[#86868B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="py-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                  Zone Code <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ZONE-BR"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className={cn(
                    "w-full px-3 py-2 bg-white border rounded-lg text-xs font-mono font-medium focus:outline-none",
                    errors.code ? "border-[#EF4444] bg-[#FFF5F5]" : "border-[#E5E5EA] focus:border-[#007AFF]"
                  )}
                />
                {errors.code && <span className="text-[10px] text-[#EF4444] mt-0.5 block">{errors.code}</span>}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                  Zone Name <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Continuous Brazing Zone"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={cn(
                    "w-full px-3 py-2 bg-white border rounded-lg text-xs font-medium focus:outline-none",
                    errors.name ? "border-[#EF4444] bg-[#FFF5F5]" : "border-[#E5E5EA] focus:border-[#007AFF]"
                  )}
                />
                {errors.name && <span className="text-[10px] text-[#EF4444] mt-0.5 block">{errors.name}</span>}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                  Process Sequence <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={formData.sequence}
                  onChange={(e) => setFormData({ ...formData, sequence: parseInt(e.target.value) || 0 })}
                  className={cn(
                    "w-full px-3 py-2 bg-white border rounded-lg text-xs font-mono font-bold focus:outline-none",
                    errors.sequence ? "border-[#EF4444] bg-[#FFF5F5]" : "border-[#E5E5EA] focus:border-[#007AFF]"
                  )}
                />
                {errors.sequence && <span className="text-[10px] text-[#EF4444] mt-0.5 block">{errors.sequence}</span>}
                <span className="text-[10px] text-[#86868B] block mt-0.5">Order in which components flow through the plant</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                  Status <span className="text-[#EF4444]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as MasterStatus })}
                    className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs font-medium focus:outline-none focus:border-[#007AFF]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">Description / Remarks (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Optional operational notes or equipment summary"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  <span>{isSaving ? "Saving..." : "Save Zone"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

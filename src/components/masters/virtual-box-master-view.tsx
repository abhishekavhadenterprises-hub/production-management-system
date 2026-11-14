import React, { useState, useMemo } from "react";
import Head from "next/head";
import {
  Boxes,
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
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VirtualBoxItem, MasterStatus } from "@/lib/masters-types";
import { INITIAL_VIRTUAL_BOXES, INITIAL_ZONES } from "@/lib/masters-mock-data";
import { usePersistentState } from "@/lib/use-persistent-state";

export function VirtualBoxMasterView() {
  const [boxes, setBoxes] = usePersistentState<VirtualBoxItem[]>(
    "prodsync_master_virtual_boxes",
    INITIAL_VIRTUAL_BOXES
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const initialForm: VirtualBoxItem = {
    id: "",
    code: "",
    name: "",
    fromZone: INITIAL_ZONES[0]?.code ? `${INITIAL_ZONES[0].code} (${INITIAL_ZONES[0].name.split(" ")[0]})` : "ZONE-MC (Machining)",
    toZone: INITIAL_ZONES[1]?.code ? `${INITIAL_ZONES[1].code} (${INITIAL_ZONES[1].name.split(" ")[0]})` : "ZONE-BR (Brazing)",
    minStock: 50,
    maxCapacity: 250,
    uom: "PCS",
    currentStock: 0,
    bufferHealth: "Optimal",
    status: "Active",
  };

  const [formData, setFormData] = useState<VirtualBoxItem>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const zoneOptions = useMemo(() => {
    return INITIAL_ZONES.map((z) => `${z.code} (${z.name.split(" ")[0]})`);
  }, []);

  const filteredBoxes = useMemo(() => {
    return boxes.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        b.code.toLowerCase().includes(q) ||
        b.name.toLowerCase().includes(q) ||
        b.fromZone.toLowerCase().includes(q) ||
        b.toZone.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "All Statuses" || b.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [boxes, searchQuery, statusFilter]);

  const paginatedBoxes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBoxes.slice(start, start + pageSize);
  }, [filteredBoxes, currentPage]);

  const totalPages = Math.ceil(filteredBoxes.length / pageSize) || 1;

  // Summary cards matching spec: Total Boxes, Active Boxes, Boxes Requiring Attention
  const totalCount = boxes.length;
  const activeCount = boxes.filter((b) => b.status === "Active").length;
  const attentionCount = boxes.filter(
    (b) => b.bufferHealth === "Low Buffer" || b.bufferHealth === "Critical" || b.bufferHealth === "Overflow Warning"
  ).length;

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All Statuses");
    setCurrentPage(1);
  };

  const handleOpenAdd = () => {
    const nextNum = boxes.length + 1;
    setFormData({
      ...initialForm,
      id: `vb-${Date.now()}`,
      code: `VB${nextNum}`,
      name: `Buffer Box ${nextNum} - Plant Staging`,
    });
    setErrors({});
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (box: VirtualBoxItem) => {
    setFormData({ ...box });
    setErrors({});
    setEditingId(box.id);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (id: string) => {
    setBoxes((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const next: MasterStatus = b.status === "Active" ? "Inactive" : "Active";
          showToast(`Virtual box ${b.code} marked ${next}`);
          return { ...b, status: next };
        }
        return b;
      })
    );
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete virtual box ${code}?`)) {
      setBoxes((prev) => prev.filter((b) => b.id !== id));
      showToast(`Virtual box ${code} deleted`);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = "Box Code is required";
    } else {
      const duplicate = boxes.find(
        (b) =>
          b.code.toLowerCase() === formData.code.toLowerCase().trim() &&
          b.id !== editingId
      );
      if (duplicate) {
        newErrors.code = `Box Code "${formData.code}" is already in use`;
      }
    }

    if (!formData.name.trim()) {
      newErrors.name = "Box Name is required";
    }

    if (!formData.fromZone) {
      newErrors.fromZone = "From Zone is required";
    }

    if (!formData.toZone) {
      newErrors.toZone = "To Zone is required";
    }

    if (formData.fromZone && formData.toZone && formData.fromZone === formData.toZone) {
      newErrors.toZone = "To Zone must be different from From Zone";
    }

    if (formData.minStock !== undefined && formData.maxCapacity !== undefined) {
      if (Number(formData.minStock) > Number(formData.maxCapacity)) {
        newErrors.minStock = "Minimum stock cannot exceed maximum capacity";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    setErrors({});

    // Calculate buffer health
    const curr = formData.currentStock;
    const min = formData.minStock || 0;
    const max = formData.maxCapacity || 1000;
    let health: VirtualBoxItem["bufferHealth"] = "Optimal";
    if (curr <= min) {
      health = "Low Buffer";
    } else if (curr >= max * 0.95) {
      health = "Overflow Warning";
    }

    const saved: VirtualBoxItem = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      bufferHealth: health,
    };

    setTimeout(() => {
      if (!editingId) {
        setBoxes((prev) => [saved, ...prev]);
        showToast(`Virtual Box ${saved.code} created`);
      } else {
        setBoxes((prev) => prev.map((b) => (b.id === editingId ? saved : b)));
        showToast(`Virtual Box ${saved.code} updated`);
      }
      setIsSaving(false);
      setIsModalOpen(false);
    }, 250);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] text-[#1D1D1F]">
      <Head>
        <title>Virtual Box Master - PRODSYNC Masters</title>
        <meta name="description" content="Dynamic buffer storage bins, minimum stock thresholds, and buffer health" />
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
            <div className="w-10 h-10 rounded-xl bg-[#0284C7] text-white flex items-center justify-center shadow-xs shrink-0">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#1D1D1F] tracking-tight">Virtual Box Master</h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
                  WIP BUFFERS
                </span>
              </div>
              <p className="text-xs text-[#86868B] mt-0.5">
                Dynamic WIP storage bins (VB1–VB4), transition stage corridors, and buffer health thresholds
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Virtual Box</span>
          </button>
        </div>
      </div>

      {/* Summary Cards: Total Boxes, Active Boxes, Boxes Requiring Attention */}
      <div className="px-4 py-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#007AFF] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>TOTAL BOXES</span>
              <span className="px-2 py-0.5 rounded bg-[#E8F2FE] text-[#007AFF] text-[9.5px] font-bold">Buffers</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#1D1D1F] mt-2">{totalCount}</div>
            <span className="text-[11px] text-[#86868B] mt-1">Configured plant buffer locations</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#10B981] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>ACTIVE BOXES</span>
              <span className="px-2 py-0.5 rounded bg-[#D1FAE5] text-[#065F46] text-[9.5px] font-bold">Operational</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#10B981] mt-2">{activeCount}</div>
            <span className="text-[11px] text-[#86868B] mt-1">Accepting intermediate work lots</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#F59E0B] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>REQUIRING ATTENTION</span>
              <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] text-[9.5px] font-bold">Alert</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#F59E0B] mt-2">{attentionCount}</div>
            <span className="text-[11px] text-[#86868B] mt-1">Low buffer or near overflow limits</span>
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
                placeholder="Search Box Code, Name, Zones..."
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
          <table className="w-full text-left text-xs border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#E5E5EA] text-[10.5px] font-bold text-[#6E6E73] uppercase tracking-wider select-none">
                <th className="px-3 py-3 min-w-[100px]">CODE</th>
                <th className="px-3 py-3 min-w-[220px]">BOX NAME</th>
                <th className="px-3 py-3 min-w-[170px]">FROM ZONE</th>
                <th className="px-3 py-3 min-w-[170px]">TO ZONE</th>
                <th className="px-3 py-3 text-right min-w-[140px]">CURRENT STOCK (CALCULATED)</th>
                <th className="px-3 py-3 text-center min-w-[130px]">BUFFER HEALTH</th>
                <th className="px-3 py-3 text-center min-w-[100px]">STATUS</th>
                <th className="px-3 py-3 text-center min-w-[100px]">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F2F7]">
              {paginatedBoxes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#86868B]">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <Package className="w-8 h-8 text-[#C7C7CC] mb-2" />
                      <p className="text-sm font-semibold text-[#1D1D1F]">No Virtual Boxes Found</p>
                      <p className="text-xs text-[#86868B] mt-1">Try resetting filters or click Add Virtual Box.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedBoxes.map((box) => {
                  const isActive = box.status === "Active";
                  return (
                    <tr key={box.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD] font-mono text-[11px] font-bold">
                          {box.code}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-[#1D1D1F]">
                        <div>
                          <span>{box.name}</span>
                          <span className="text-[10px] text-[#86868B] block mt-0.5">
                            Capacity: {box.minStock || 0} – {box.maxCapacity || 0} {box.uom}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[#52525B]">
                        <span className="px-2 py-0.5 rounded-md bg-[#F2F2F7] text-[#48484A] text-[11px]">
                          {box.fromZone}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[#52525B]">
                        <span className="px-2 py-0.5 rounded-md bg-[#F2F2F7] text-[#48484A] text-[11px]">
                          {box.toZone}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-[#1D1D1F]">
                        {box.currentStock} <span className="text-[10px] font-normal text-[#86868B]">{box.uom}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase inline-flex items-center gap-1",
                            box.bufferHealth === "Optimal" && "bg-[#EAF8EF] text-[#16A34A] border border-[#34C759]/30",
                            box.bufferHealth === "Low Buffer" && "bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30",
                            (box.bufferHealth === "Critical" || box.bufferHealth === "Overflow Warning") && "bg-[#FEE2E2] text-[#DC2626] border border-[#EF4444]/30"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              box.bufferHealth === "Optimal" ? "bg-[#16A34A]" : "bg-[#DC2626]"
                            )}
                          />
                          <span>{box.bufferHealth}</span>
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(box.id)}
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase transition-colors inline-flex items-center gap-1",
                            isActive
                              ? "bg-[#EAF8EF] text-[#16A34A] border border-[#34C759]/30 hover:bg-[#DCFCE7]"
                              : "bg-[#F2F2F7] text-[#86868B] border border-[#D1D1D6] hover:bg-[#E5E5EA]"
                          )}
                          title="Click to toggle status"
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-[#16A34A]" : "bg-[#86868B]")} />
                          <span>{box.status}</span>
                        </button>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(box)}
                            className="p-1 rounded-md text-[#6E6E73] hover:text-[#007AFF] hover:bg-[#E8F2FE] transition-colors"
                            title="Edit Virtual Box"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(box.id, box.code)}
                            className="p-1 rounded-md text-[#6E6E73] hover:text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                            title="Delete Virtual Box"
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
              Showing <span className="font-semibold text-[#1D1D1F]">{filteredBoxes.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to <span className="font-semibold text-[#1D1D1F]">{Math.min(currentPage * pageSize, filteredBoxes.length)}</span> of <span className="font-semibold text-[#1D1D1F]">{filteredBoxes.length}</span> virtual boxes
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E5EA] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#007AFF]" />
                <h3 className="text-base font-bold text-[#1D1D1F]">{editingId ? "Edit Virtual Box" : "Add Virtual Box"}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-[#F5F5F7] text-[#86868B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="py-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Code */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Box Code <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VB1"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 bg-white border rounded-lg text-xs font-mono font-medium focus:outline-none",
                      errors.code ? "border-[#EF4444] bg-[#FFF5F5]" : "border-[#E5E5EA] focus:border-[#007AFF]"
                    )}
                  />
                  {errors.code && <span className="text-[10px] text-[#EF4444] mt-0.5 block">{errors.code}</span>}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Box Name <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Buffer Box 1 - Pre-Brazing"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 bg-white border rounded-lg text-xs font-medium focus:outline-none",
                      errors.name ? "border-[#EF4444] bg-[#FFF5F5]" : "border-[#E5E5EA] focus:border-[#007AFF]"
                    )}
                  />
                  {errors.name && <span className="text-[10px] text-[#EF4444] mt-0.5 block">{errors.name}</span>}
                </div>

                {/* From Zone */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    From Zone <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.fromZone}
                      onChange={(e) => setFormData({ ...formData, fromZone: e.target.value })}
                      className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs font-medium focus:outline-none focus:border-[#007AFF]"
                    >
                      {zoneOptions.map((z) => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-3 pointer-events-none" />
                  </div>
                  {errors.fromZone && <span className="text-[10px] text-[#EF4444] mt-0.5 block">{errors.fromZone}</span>}
                </div>

                {/* To Zone */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    To Zone <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.toZone}
                      onChange={(e) => setFormData({ ...formData, toZone: e.target.value })}
                      className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs font-medium focus:outline-none focus:border-[#007AFF]"
                    >
                      {zoneOptions.map((z) => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-3 pointer-events-none" />
                  </div>
                  {errors.toZone && <span className="text-[10px] text-[#EF4444] mt-0.5 block">{errors.toZone}</span>}
                </div>

                {/* Min Stock */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Minimum Stock Buffer ({formData.uom})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minStock ?? 50}
                    onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })}
                    className={cn(
                      "w-full px-3 py-2 bg-white border rounded-lg text-xs font-mono font-bold focus:outline-none",
                      errors.minStock ? "border-[#EF4444] bg-[#FFF5F5]" : "border-[#E5E5EA] focus:border-[#007AFF]"
                    )}
                  />
                  {errors.minStock && <span className="text-[10px] text-[#EF4444] mt-0.5 block">{errors.minStock}</span>}
                </div>

                {/* Max Capacity */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Maximum Capacity ({formData.uom})
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.maxCapacity ?? 250}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-[#007AFF]"
                  />
                </div>

                {/* UOM */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">UOM</label>
                  <div className="relative">
                    <select
                      value={formData.uom}
                      onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                      className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs font-mono font-medium focus:outline-none focus:border-[#007AFF]"
                    >
                      <option value="PCS">PCS</option>
                      <option value="LOTS">LOTS</option>
                      <option value="BINS">BINS</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Status */}
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
              </div>

              {/* Read-only Current Stock Note */}
              <div className="p-3 bg-[#F5F5F7] rounded-xl border border-[#E5E5EA] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#1D1D1F] block text-xs">Current Stock Balance</span>
                  <span className="text-[10px] text-[#86868B]">Derived from live shop-floor WIP transactions</span>
                </div>
                <span className="text-sm font-bold font-mono text-[#007AFF]">
                  {formData.currentStock} {formData.uom}
                </span>
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
                  <span>{isSaving ? "Saving..." : "Save Box"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

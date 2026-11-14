import React, { useState, useMemo } from "react";
import Head from "next/head";
import {
  Wrench,
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
import { ToolItem, MasterStatus } from "@/lib/masters-types";
import { INITIAL_TOOLS, CATALOG_CHILD_PARTS } from "@/lib/masters-mock-data";
import { usePersistentState } from "@/lib/use-persistent-state";

export function ToolMasterView() {
  const [tools, setTools] = usePersistentState<ToolItem[]>(
    "prodsync_master_tools_list",
    INITIAL_TOOLS
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [customerFilter, setCustomerFilter] = useState("All Customers");
  const [conditionFilter, setConditionFilter] = useState("All Conditions");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const initialForm: ToolItem = {
    id: "",
    code: "",
    name: "",
    condition: "OK",
    dimensions: "Ø28.6mm x 1.5mm CLR 45mm",
    customer: "",
    linkedProductCode: CATALOG_CHILD_PARTS[0]?.partCode || "",
    linkedProductName: CATALOG_CHILD_PARTS[0]?.partName || "",
    remarks: "",
    status: "Active",
  };

  const [formData, setFormData] = useState<ToolItem>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const customerList = useMemo(() => {
    const set = new Set(tools.map((t) => t.customer).filter(Boolean));
    return ["All Customers", ...Array.from(set)];
  }, [tools]);

  const filteredTools = useMemo(() => {
    return tools.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.code.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        (t.dimensions && t.dimensions.toLowerCase().includes(q)) ||
        (t.customer && t.customer.toLowerCase().includes(q)) ||
        (t.linkedProductName && t.linkedProductName.toLowerCase().includes(q));

      const matchCustomer =
        customerFilter === "All Customers" || t.customer === customerFilter;

      const matchCondition =
        conditionFilter === "All Conditions" || t.condition === conditionFilter;

      return matchSearch && matchCustomer && matchCondition;
    });
  }, [tools, searchQuery, customerFilter, conditionFilter]);

  const paginatedTools = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTools.slice(start, start + pageSize);
  }, [filteredTools, currentPage]);

  const totalPages = Math.ceil(filteredTools.length / pageSize) || 1;

  // 3 Summary Cards matching spec: Total Tools, OK, NG
  const totalCount = tools.length;
  const okCount = tools.filter((t) => t.condition === "OK").length;
  const ngCount = tools.filter((t) => t.condition === "NG").length;

  const handleClearFilters = () => {
    setSearchQuery("");
    setCustomerFilter("All Customers");
    setConditionFilter("All Conditions");
    setCurrentPage(1);
  };

  const handleOpenAdd = () => {
    setFormData({
      ...initialForm,
      id: `tool-${Date.now()}`,
    });
    setErrors({});
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tool: ToolItem) => {
    setFormData({ ...tool });
    setErrors({});
    setEditingId(tool.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete tool ${code}?`)) {
      setTools((prev) => prev.filter((t) => t.id !== id));
      showToast(`Tool ${code} deleted`);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = "Tool Code is required";
    } else {
      const duplicate = tools.find(
        (t) =>
          t.code.toLowerCase() === formData.code.toLowerCase().trim() &&
          t.id !== editingId
      );
      if (duplicate) {
        newErrors.code = `Tool Code "${formData.code}" is already in use`;
      }
    }

    if (!formData.name.trim()) {
      newErrors.name = "Tool Name is required";
    }

    if (!formData.condition) {
      newErrors.condition = "Condition (OK / NG) is required";
    }

    // Required explanation if condition is NG
    if (formData.condition === "NG" && (!formData.remarks || !formData.remarks.trim())) {
      newErrors.remarks = "Remarks explanation is required when tool condition is NG";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    setErrors({});

    const saved: ToolItem = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
    };

    setTimeout(() => {
      if (!editingId) {
        setTools((prev) => [saved, ...prev]);
        showToast(`Tool ${saved.code} created`);
      } else {
        setTools((prev) => prev.map((t) => (t.id === editingId ? saved : t)));
        showToast(`Tool ${saved.code} updated`);
      }
      setIsSaving(false);
      setIsModalOpen(false);
    }, 250);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] text-[#1D1D1F]">
      <Head>
        <title>Tool Master - PRODSYNC Masters</title>
        <meta name="description" content="Bending die sets, wiper dies, mandrels and linked tube components" />
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
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#1D1D1F] tracking-tight">Tool Master</h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                  TOOLING &amp; DIES
                </span>
              </div>
              <p className="text-xs text-[#86868B] mt-0.5">
                Bending dies, collets, mandrels, expander pins and linked part numbers with OK/NG conditions
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tool</span>
          </button>
        </div>
      </div>

      {/* Summary Cards: Total Tools, OK, NG */}
      <div className="px-4 py-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#007AFF] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>TOTAL TOOLS</span>
              <span className="px-2 py-0.5 rounded bg-[#E8F2FE] text-[#007AFF] text-[9.5px] font-bold">Tool Crib</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#1D1D1F] mt-2">{totalCount}</div>
            <span className="text-[11px] text-[#86868B] mt-1">Configured tooling sets</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#10B981] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>CONDITION: OK</span>
              <span className="px-2 py-0.5 rounded bg-[#D1FAE5] text-[#065F46] text-[9.5px] font-bold">Ready</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#10B981] mt-2">{okCount}</div>
            <span className="text-[11px] text-[#86868B] mt-1">Good condition, ready for CNC mount</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#EF4444] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>CONDITION: NG</span>
              <span className="px-2 py-0.5 rounded bg-[#FEE2E2] text-[#DC2626] text-[9.5px] font-bold">Rework</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#DC2626] mt-2">{ngCount}</div>
            <span className="text-[11px] text-[#86868B] mt-1">Requires recutting, grinding or repair</span>
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
                placeholder="Search Tool Code, Name, Part..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#007AFF]"
              />
            </div>

            <div className="relative min-w-[200px]">
              <select
                value={customerFilter}
                onChange={(e) => { setCustomerFilter(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none px-3 py-1.5 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] focus:outline-none focus:border-[#007AFF] cursor-pointer"
              >
                {customerList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <div className="relative min-w-[140px]">
              <select
                value={conditionFilter}
                onChange={(e) => { setConditionFilter(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none px-3 py-1.5 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] focus:outline-none focus:border-[#007AFF] cursor-pointer"
              >
                <option value="All Conditions">All Conditions</option>
                <option value="OK">OK (Ready)</option>
                <option value="NG">NG (Repair Needed)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {(searchQuery || customerFilter !== "All Customers" || conditionFilter !== "All Conditions") && (
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
                <th className="px-3 py-3 min-w-[130px]">TOOL CODE</th>
                <th className="px-3 py-3 min-w-[220px]">NAME</th>
                <th className="px-3 py-3 min-w-[180px]">DIMENSIONS</th>
                <th className="px-3 py-3 min-w-[180px]">CUSTOMER</th>
                <th className="px-3 py-3 min-w-[200px]">LINKED PRODUCT / PART</th>
                <th className="px-3 py-3 text-center min-w-[100px]">CONDITION</th>
                <th className="px-3 py-3 text-center min-w-[100px]">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F2F7]">
              {paginatedTools.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#86868B]">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <Package className="w-8 h-8 text-[#C7C7CC] mb-2" />
                      <p className="text-sm font-semibold text-[#1D1D1F]">No Tools Found</p>
                      <p className="text-xs text-[#86868B] mt-1">Try resetting filters or click Add Tool.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTools.map((tool) => {
                  const isOK = tool.condition === "OK";
                  return (
                    <tr key={tool.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] font-mono text-[11px] font-semibold">
                          {tool.code}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-[#1D1D1F]">
                        <div>
                          <span>{tool.name}</span>
                          {tool.remarks && (
                            <p className={cn("text-[10.5px] truncate max-w-[260px] mt-0.5", !isOK ? "text-[#DC2626] font-medium" : "text-[#86868B]")}>
                              {tool.remarks}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono text-[11px] text-[#52525B]">{tool.dimensions || "—"}</td>
                      <td className="px-3 py-3 text-[#52525B]">
                        <span className="truncate block max-w-[170px]">{tool.customer || "—"}</span>
                      </td>
                      <td className="px-3 py-3">
                        {tool.linkedProductCode ? (
                          <div className="space-y-0.5">
                            <span className="font-mono text-[10px] font-bold text-[#007AFF]">{tool.linkedProductCode}</span>
                            <span className="text-[10.5px] text-[#52525B] block truncate max-w-[190px]">{tool.linkedProductName}</span>
                          </div>
                        ) : (
                          <span className="text-[#86868B]">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase inline-flex items-center gap-1",
                            isOK
                              ? "bg-[#EAF8EF] text-[#16A34A] border border-[#34C759]/30"
                              : "bg-[#FEE2E2] text-[#DC2626] border border-[#EF4444]/30"
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", isOK ? "bg-[#16A34A]" : "bg-[#DC2626]")} />
                          <span>{tool.condition}</span>
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(tool)}
                            className="p-1 rounded-md text-[#6E6E73] hover:text-[#007AFF] hover:bg-[#E8F2FE] transition-colors"
                            title="Edit Tool"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tool.id, tool.code)}
                            className="p-1 rounded-md text-[#6E6E73] hover:text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                            title="Delete Tool"
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
              Showing <span className="font-semibold text-[#1D1D1F]">{filteredTools.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to <span className="font-semibold text-[#1D1D1F]">{Math.min(currentPage * pageSize, filteredTools.length)}</span> of <span className="font-semibold text-[#1D1D1F]">{filteredTools.length}</span> tools
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
                <h3 className="text-base font-bold text-[#1D1D1F]">{editingId ? "Edit Tool" : "Add New Tool"}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-[#F5F5F7] text-[#86868B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="py-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tool Code */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Tool Code <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TOOL-CRP-28"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 bg-white border rounded-lg text-xs font-mono font-medium focus:outline-none",
                      errors.code ? "border-[#EF4444] bg-[#FFF5F5]" : "border-[#E5E5EA] focus:border-[#007AFF]"
                    )}
                  />
                  {errors.code && <span className="text-[10px] text-[#EF4444] mt-0.5 block">{errors.code}</span>}
                </div>

                {/* Tool Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Tool Name <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bending Die Set Ø28.6mm"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 bg-white border rounded-lg text-xs font-medium focus:outline-none",
                      errors.name ? "border-[#EF4444] bg-[#FFF5F5]" : "border-[#E5E5EA] focus:border-[#007AFF]"
                    )}
                  />
                  {errors.name && <span className="text-[10px] text-[#EF4444] mt-0.5 block">{errors.name}</span>}
                </div>

                {/* Condition (OK / NG) */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Condition <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value as "OK" | "NG" })}
                      className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#007AFF]"
                    >
                      <option value="OK">OK (Good Condition)</option>
                      <option value="NG">NG (Damaged / Needs Rework)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Tool Dimensions (with example) */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Dimensions (e.g. Ø28.6mm x 1.5mm CLR 45mm)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ø28.6mm x 1.5mm CLR 45mm"
                    value={formData.dimensions || ""}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-xs focus:outline-none focus:border-[#007AFF]"
                  />
                </div>

                {/* Customer (Optional) */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">Customer (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Carrier Commercial Refrigeration Ltd"
                    value={formData.customer || ""}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-xs focus:outline-none focus:border-[#007AFF]"
                  />
                </div>

                {/* Single Searchable Linked Product / Part Selection */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Linked Product / Part (Auto-Fills Code &amp; Name)
                  </label>
                  <div className="relative">
                    <select
                      value={formData.linkedProductCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        const match = CATALOG_CHILD_PARTS.find((c) => c.partCode === code);
                        setFormData({
                          ...formData,
                          linkedProductCode: code,
                          linkedProductName: match?.partName || "",
                        });
                      }}
                      className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs font-medium focus:outline-none focus:border-[#007AFF]"
                    >
                      <option value="">None / Universal Tooling</option>
                      {CATALOG_CHILD_PARTS.map((c) => (
                        <option key={c.partCode} value={c.partCode}>
                          {c.partCode} — {c.partName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Remarks / Explanation (Required if NG) */}
              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                  Remarks / Explanation {formData.condition === "NG" && <span className="text-[#EF4444]">* (Mandatory for NG)</span>}
                </label>
                <textarea
                  rows={2}
                  placeholder={formData.condition === "NG" ? "Explain defect (e.g. chipped wiper edge, worn ball mandrel, tolerance deviation)..." : "Optional storage bin or inspection notes"}
                  value={formData.remarks || ""}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className={cn(
                    "w-full px-3 py-2 bg-white border rounded-lg text-xs resize-none focus:outline-none",
                    errors.remarks ? "border-[#EF4444] bg-[#FFF5F5]" : "border-[#E5E5EA] focus:border-[#007AFF]"
                  )}
                />
                {errors.remarks && <span className="text-[10px] text-[#EF4444] mt-0.5 block">{errors.remarks}</span>}
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
                  <span>{isSaving ? "Saving..." : "Save Tool"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

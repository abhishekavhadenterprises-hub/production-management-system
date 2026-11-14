import React, { useState, useMemo } from "react";
import Head from "next/head";
import {
  Search,
  Plus,
  Filter,
  RotateCcw,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  ChevronDown,
  Database,
  Layers,
  Save,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MasterConfig,
  StandardMasterItem,
  MasterStatus,
} from "@/lib/masters-types";
import {
  MASTERS_CONFIG_MAP,
  INITIAL_MASTERS_DATA,
} from "@/lib/masters-mock-data";
import { usePersistentState } from "@/lib/use-persistent-state";

interface GenericMasterViewProps {
  masterId: string;
}

export function GenericMasterView({ masterId }: GenericMasterViewProps) {
  const config: MasterConfig =
    MASTERS_CONFIG_MAP[masterId] || {
      id: masterId,
      title: "Master Configuration",
      shortDescription: "Manage master configuration entities",
      codeLabel: "Code",
      nameLabel: "Name",
      categoryLabel: "Category",
      secondaryLabel: "Secondary Info",
      categories: ["General"],
    };

  // State persisted per masterId
  const [items, setItems] = usePersistentState<StandardMasterItem[]>(
    `prodsync_master_${masterId}`,
    INITIAL_MASTERS_DATA[masterId] || []
  );

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal / Drawer state for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const initialFormState: StandardMasterItem = {
    id: "",
    code: "",
    name: "",
    status: "Active",
    category: config.categories?.[0] || "",
    secondaryInfo: config.secondaryOptions?.[0] || "",
    description: "",
  };

  const [formData, setFormData] = useState<StandardMasterItem>(initialFormState);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Categories list for filter
  const categoryOptions = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [items]);

  // Filtered dataset
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.secondaryInfo && item.secondaryInfo.toLowerCase().includes(q));

      const matchCategory =
        categoryFilter === "All" || item.category === categoryFilter;

      const matchStatus =
        statusFilter === "All Statuses" || item.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [items, searchQuery, categoryFilter, statusFilter]);

  // Paginated dataset
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage]);

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;

  // Summary Metrics
  const totalCount = items.length;
  const activeCount = items.filter((i) => i.status === "Active").length;
  const inactiveCount = items.filter((i) => i.status === "Inactive").length;

  const handleClearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("All");
    setStatusFilter("All Statuses");
    setCurrentPage(1);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      ...initialFormState,
      id: `${masterId}-${Date.now()}`,
      category: config.categories?.[0] || "",
      secondaryInfo: config.secondaryOptions?.[0] || "",
    });
    setValidationErrors({});
    setEditingItemId(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: StandardMasterItem) => {
    setFormData(JSON.parse(JSON.stringify(item)));
    setValidationErrors({});
    setEditingItemId(item.id);
    setIsModalOpen(true);
  };

  // Toggle Status
  const handleToggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const next: MasterStatus = i.status === "Active" ? "Inactive" : "Active";
          showToast(`Status updated to ${next} for ${i.code}`);
          return { ...i, status: next };
        }
        return i;
      })
    );
  };

  // Delete
  const handleDelete = (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete ${code}?`)) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      showToast(`Deleted ${code}`);
    }
  };

  // Save Modal Form
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.code.trim()) {
      errors.code = `${config.codeLabel} is required`;
    } else {
      // Check duplicate code
      const duplicate = items.find(
        (i) =>
          i.code.toLowerCase() === formData.code.toLowerCase().trim() &&
          i.id !== editingItemId
      );
      if (duplicate) {
        errors.code = `${config.codeLabel} "${formData.code}" is already in use`;
      }
    }

    if (!formData.name.trim()) {
      errors.name = `${config.nameLabel} is required`;
    }

    if (!formData.status) {
      errors.status = "Status is required";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSaving(true);
    setValidationErrors({});

    const saved: StandardMasterItem = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      updatedAt: new Date().toISOString().split("T")[0],
    };

    setTimeout(() => {
      if (!editingItemId) {
        setItems((prev) => [saved, ...prev]);
        showToast(`${config.title} record ${saved.code} created!`);
      } else {
        setItems((prev) =>
          prev.map((i) => (i.id === editingItemId ? saved : i))
        );
        showToast(`${config.title} record ${saved.code} updated!`);
      }
      setIsSaving(false);
      setIsModalOpen(false);
    }, 300);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] text-[#1D1D1F]">
      <Head>
        <title>{config.title} - PRODSYNC Masters</title>
        <meta name="description" content={config.shortDescription} />
      </Head>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#1D1D1F] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs border border-white/10 animate-in fade-in slide-in-from-top-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-[#34C759] shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-75 text-white/80"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Strip */}
      <div className="bg-white border-b border-[#E5E5EA] px-4 py-3.5 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#007AFF] text-white flex items-center justify-center shadow-xs shrink-0">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#1D1D1F] tracking-tight">
                  {config.title}
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[#E8F2FE] text-[#007AFF] border border-[#007AFF]/20">
                  SYSTEM MASTER
                </span>
              </div>
              <p className="text-xs text-[#86868B] mt-0.5">
                {config.shortDescription}
              </p>
            </div>
          </div>

          {/* Primary Add Button */}
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add {config.title.replace(" Master", "")}</span>
          </button>
        </div>
      </div>

      {/* Summary Cards: Total, Active, Inactive */}
      <div className="px-4 py-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Total */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#007AFF] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>TOTAL RECORDS</span>
              <span className="px-2 py-0.5 rounded bg-[#E8F2FE] text-[#007AFF] text-[9.5px] font-bold">
                Configured
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#1D1D1F] mt-2">
              {totalCount}
            </div>
            <span className="text-[11px] text-[#86868B] mt-1">
              Registered master records
            </span>
          </div>

          {/* Active */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#10B981] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>ACTIVE</span>
              <span className="px-2 py-0.5 rounded bg-[#D1FAE5] text-[#065F46] text-[9.5px] font-bold">
                Available
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#10B981] mt-2">
              {activeCount}
            </div>
            <span className="text-[11px] text-[#86868B] mt-1">
              Active in shop floor scheduling and operations
            </span>
          </div>

          {/* Inactive */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#9CA3AF] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>INACTIVE / ARCHIVED</span>
              <span className="px-2 py-0.5 rounded bg-[#F2F2F7] text-[#6E6E73] text-[9.5px] font-bold">
                Disabled
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#6E6E73] mt-2">
              {inactiveCount}
            </div>
            <span className="text-[11px] text-[#86868B] mt-1">
              Archived records protected from deletion
            </span>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="px-4 pb-2 sm:px-6">
        <div className="bg-white p-3 rounded-xl border border-[#E5E5EA] shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search */}
            <div className="relative min-w-[240px] flex-1">
              <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder={`Search by ${config.codeLabel}, ${config.nameLabel}...`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#007AFF] transition-colors"
              />
            </div>

            {/* Category Filter */}
            {config.categoryLabel && (
              <div className="relative min-w-[200px]">
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none px-3 py-1.5 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] focus:outline-none focus:border-[#007AFF] transition-colors cursor-pointer"
                >
                  <option value="All">All {config.categoryLabel}s</option>
                  {categoryOptions
                    .filter((c) => c !== "All")
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            )}

            {/* Status Filter */}
            <div className="relative min-w-[140px]">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none px-3 py-1.5 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] focus:outline-none focus:border-[#007AFF] transition-colors cursor-pointer"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || categoryFilter !== "All" || statusFilter !== "All Statuses") && (
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

      {/* Table Container */}
      <div className="px-4 py-2 sm:px-6 flex-1 flex flex-col pb-12">
        <div className="bg-white rounded-xl border border-[#E5E5EA] shadow-xs overflow-x-auto flex-1 flex flex-col justify-between">
          <table className="w-full text-left text-xs border-collapse min-w-[850px]">
            {/* Table Header */}
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#E5E5EA] text-[10.5px] font-bold text-[#6E6E73] uppercase tracking-wider select-none">
                <th className="px-3 py-3 min-w-[140px]">{(config.codeLabel || "CODE").toUpperCase()}</th>
                <th className="px-3 py-3 min-w-[220px]">{(config.nameLabel || "NAME").toUpperCase()}</th>
                {config.categoryLabel && (
                  <th className="px-3 py-3 min-w-[180px]">
                    {config.categoryLabel.toUpperCase()}
                  </th>
                )}
                {config.secondaryLabel && (
                  <th className="px-3 py-3 min-w-[180px]">
                    {config.secondaryLabel.toUpperCase()}
                  </th>
                )}
                <th className="px-3 py-3 text-center min-w-[100px]">STATUS</th>
                <th className="px-3 py-3 text-center min-w-[100px]">ACTIONS</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#F2F2F7]">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={config.categoryLabel && config.secondaryLabel ? 6 : 5}
                    className="py-16 text-center text-[#86868B]"
                  >
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <Package className="w-8 h-8 text-[#C7C7CC] mb-2" />
                      <p className="text-sm font-semibold text-[#1D1D1F]">
                        No Records Found
                      </p>
                      <p className="text-xs text-[#86868B] mt-1">
                        {searchQuery || categoryFilter !== "All" || statusFilter !== "All Statuses"
                          ? "Try clearing filters to see existing records."
                          : "Click the add button above to create your first record."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const isActive = item.status === "Active";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#F9FAFB] transition-colors"
                    >
                      {/* Code */}
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] font-mono text-[11px] font-semibold">
                          {item.code}
                        </span>
                      </td>

                      {/* Name & Description */}
                      <td className="px-3 py-3 font-medium text-[#1D1D1F]">
                        <div>
                          <span>{item.name}</span>
                          {item.description && (
                            <p className="text-[10.5px] text-[#86868B] truncate max-w-[280px] mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      {config.categoryLabel && (
                        <td className="px-3 py-3 text-[#52525B]">
                          <span className="px-2 py-0.5 rounded-md bg-[#F2F2F7] text-[#48484A] text-[11px]">
                            {item.category || "—"}
                          </span>
                        </td>
                      )}

                      {/* Secondary Info */}
                      {config.secondaryLabel && (
                        <td className="px-3 py-3 text-[#52525B]">
                          <span className="truncate block max-w-[180px]">
                            {item.secondaryInfo || "—"}
                          </span>
                        </td>
                      )}

                      {/* Status */}
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(item.id)}
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase transition-colors inline-flex items-center gap-1",
                            isActive
                              ? "bg-[#EAF8EF] text-[#16A34A] border border-[#34C759]/30 hover:bg-[#DCFCE7]"
                              : "bg-[#F2F2F7] text-[#86868B] border border-[#D1D1D6] hover:bg-[#E5E5EA]"
                          )}
                          title="Click to toggle status"
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              isActive ? "bg-[#16A34A]" : "bg-[#86868B]"
                            )}
                          />
                          <span>{item.status}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 rounded-md text-[#6E6E73] hover:text-[#007AFF] hover:bg-[#E8F2FE] transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.code)}
                            className="p-1 rounded-md text-[#6E6E73] hover:text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                            title="Delete"
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

          {/* Table Footer with Record Count & Pagination */}
          <div className="px-4 py-3 border-t border-[#E5E5EA] bg-[#FAFAFA] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6E6E73] select-none">
            <div>
              Showing{" "}
              <span className="font-semibold text-[#1D1D1F]">
                {filteredItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-[#1D1D1F]">
                {Math.min(currentPage * pageSize, filteredItems.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#1D1D1F]">
                {filteredItems.length}
              </span>{" "}
              records
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg border border-[#E5E5EA] bg-white text-[#1D1D1F] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F5F5F7] transition-colors text-xs"
              >
                Previous
              </button>
              <span className="px-2 text-xs font-medium text-[#1D1D1F]">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-lg border border-[#E5E5EA] bg-white text-[#1D1D1F] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F5F5F7] transition-colors text-xs"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          STANDARD MODAL / DRAWER FOR SHORT FORMS
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E5EA] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#007AFF]" />
                <h3 className="text-base font-bold text-[#1D1D1F]">
                  {editingItemId ? `Edit ${config.title}` : `Add New ${config.title}`}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#F5F5F7] text-[#86868B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="py-4 space-y-3.5 text-xs">
              {/* Code */}
              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                  {config.codeLabel} <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  placeholder={`e.g. ${config.id === "machines" ? "CNC-TB-08" : "CODE-01"}`}
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className={cn(
                    "w-full px-3 py-2 bg-white border rounded-lg text-xs font-mono font-medium focus:outline-none transition-colors",
                    validationErrors.code
                      ? "border-[#EF4444] bg-[#FFF5F5]"
                      : "border-[#E5E5EA] focus:border-[#007AFF]"
                  )}
                />
                {validationErrors.code && (
                  <span className="text-[10px] text-[#EF4444] mt-0.5 block">
                    {validationErrors.code}
                  </span>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                  {config.nameLabel} <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Descriptive name or specification"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={cn(
                    "w-full px-3 py-2 bg-white border rounded-lg text-xs font-medium focus:outline-none transition-colors",
                    validationErrors.name
                      ? "border-[#EF4444] bg-[#FFF5F5]"
                      : "border-[#E5E5EA] focus:border-[#007AFF]"
                  )}
                />
                {validationErrors.name && (
                  <span className="text-[10px] text-[#EF4444] mt-0.5 block">
                    {validationErrors.name}
                  </span>
                )}
              </div>

              {/* Category */}
              {config.categoryLabel && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    {config.categoryLabel}
                  </label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs font-medium focus:outline-none focus:border-[#007AFF] transition-colors"
                    >
                      {config.categories?.map((c: string) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-3 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Secondary Info */}
              {config.secondaryLabel && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    {config.secondaryLabel}
                  </label>
                  {config.secondaryOptions && config.secondaryOptions.length > 0 ? (
                    <div className="relative">
                      <select
                        value={formData.secondaryInfo}
                        onChange={(e) =>
                          setFormData({ ...formData, secondaryInfo: e.target.value })
                        }
                        className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs font-medium focus:outline-none focus:border-[#007AFF] transition-colors"
                      >
                        {config.secondaryOptions.map((opt: string) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-3 pointer-events-none" />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={formData.secondaryInfo || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, secondaryInfo: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-xs"
                    />
                  )}
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                  Status <span className="text-[#EF4444]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as MasterStatus,
                      })
                    }
                    className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs font-medium focus:outline-none focus:border-[#007AFF] transition-colors"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Description (Optional) */}
              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                  Remarks / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional technical notes, floor location, or specifications"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
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
                  <span>{isSaving ? "Saving..." : "Save Record"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

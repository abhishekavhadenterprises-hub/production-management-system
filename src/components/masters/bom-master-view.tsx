import React, { useState, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  GitFork,
  Search,
  Plus,
  Filter,
  RotateCcw,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Save,
  X,
  Copy,
  ChevronDown,
  Layers,
  Boxes,
  Package,
  Info,
  Clock,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BomAssembly,
  ChildPartMapping,
  BopPartMapping,
  MasterStatus,
} from "@/lib/masters-types";
import {
  INITIAL_BOM_ASSEMBLIES,
  CATALOG_CHILD_PARTS,
  CATALOG_BOP_ITEMS,
} from "@/lib/masters-mock-data";
import { usePersistentState } from "@/lib/use-persistent-state";

export function BomMasterView() {
  // Assemblies State persisted across sessions
  const [assemblies, setAssemblies] = usePersistentState<BomAssembly[]>(
    "prodsync_bom_assemblies_master",
    INITIAL_BOM_ASSEMBLIES
  );

  // View state: 'overview' | 'add' | 'edit' | 'view'
  const [currentView, setCurrentView] = useState<"overview" | "add" | "edit" | "view">("overview");
  const [selectedAssemblyId, setSelectedAssemblyId] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [customerFilter, setCustomerFilter] = useState("All Customers");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const initialFormState: BomAssembly = {
    id: "",
    assemblyCode: "",
    assemblyName: "",
    customer: "",
    linkedProduct: "",
    revision: "Rev 1.0",
    description: "",
    status: "Active",
    childParts: [],
    bopParts: [],
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
  };

  const [formData, setFormData] = useState<BomAssembly>(initialFormState);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Customers dynamic list
  const customersList = useMemo(() => {
    const set = new Set(assemblies.map((a) => a.customer).filter(Boolean));
    return ["All Customers", ...Array.from(set)];
  }, [assemblies]);

  // Filtered dataset
  const filteredAssemblies = useMemo(() => {
    return assemblies.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.assemblyCode.toLowerCase().includes(q) ||
        item.assemblyName.toLowerCase().includes(q) ||
        item.customer.toLowerCase().includes(q) ||
        item.linkedProduct.toLowerCase().includes(q);

      const matchCustomer =
        customerFilter === "All Customers" || item.customer === customerFilter;

      const matchStatus =
        statusFilter === "All Statuses" || item.status === statusFilter;

      return matchSearch && matchCustomer && matchStatus;
    });
  }, [assemblies, searchQuery, customerFilter, statusFilter]);

  // Paginated records
  const paginatedAssemblies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAssemblies.slice(start, start + pageSize);
  }, [filteredAssemblies, currentPage]);

  const totalPages = Math.ceil(filteredAssemblies.length / pageSize) || 1;

  // Summary Metrics calculations
  const totalAssemblies = assemblies.length;
  const activeAssemblies = assemblies.filter((a) => a.status === "Active").length;
  const inactiveAssemblies = assemblies.filter((a) => a.status === "Inactive").length;

  const totalChildParts = assemblies.reduce((sum, a) => sum + a.childParts.length, 0);
  const totalBopMappings = assemblies.reduce((sum, a) => sum + a.bopParts.length, 0);

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setCustomerFilter("All Customers");
    setStatusFilter("All Statuses");
    setCurrentPage(1);
  };

  // Open Add Form
  const handleOpenAdd = () => {
    const nextCodeNum = assemblies.length + 1005;
    setFormData({
      ...initialFormState,
      id: `bom-${Date.now()}`,
      assemblyCode: `ASSY-NEW-${nextCodeNum}`,
      revision: "Rev 1.0",
      childParts: [
        {
          id: `cp-${Date.now()}-1`,
          partCode: CATALOG_CHILD_PARTS[0].partCode,
          partName: CATALOG_CHILD_PARTS[0].partName,
          qtyPerAssembly: 1,
          uom: CATALOG_CHILD_PARTS[0].uom,
          targetMachineType: CATALOG_CHILD_PARTS[0].defaultMachineType,
          hasRawMaterial: !!CATALOG_CHILD_PARTS[0].rawMaterialCode,
          rawMaterialCode: CATALOG_CHILD_PARTS[0].rawMaterialCode,
          rawMaterialName: CATALOG_CHILD_PARTS[0].rawMaterialName,
          consumptionPerPart: CATALOG_CHILD_PARTS[0].defaultConsumption,
          rawMaterialUom: CATALOG_CHILD_PARTS[0].rawMaterialUom,
        },
      ],
      bopParts: [
        {
          id: `bp-${Date.now()}-1`,
          bopCode: CATALOG_BOP_ITEMS[0].bopCode,
          bopName: CATALOG_BOP_ITEMS[0].bopName,
          qtyPerAssembly: 1,
          uom: CATALOG_BOP_ITEMS[0].uom,
          unitCost: CATALOG_BOP_ITEMS[0].defaultUnitCost,
          processStage: CATALOG_BOP_ITEMS[0].defaultStage,
        },
      ],
    });
    setValidationErrors({});
    setSelectedAssemblyId(null);
    setCurrentView("add");
  };

  // Open Edit Form
  const handleOpenEdit = (assembly: BomAssembly) => {
    setFormData(JSON.parse(JSON.stringify(assembly)));
    setValidationErrors({});
    setSelectedAssemblyId(assembly.id);
    setCurrentView("edit");
  };

  // Open View Mode
  const handleOpenView = (assembly: BomAssembly) => {
    setFormData(JSON.parse(JSON.stringify(assembly)));
    setSelectedAssemblyId(assembly.id);
    setCurrentView("view");
  };

  // Toggle status
  const handleToggleStatus = (id: string) => {
    setAssemblies((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextStatus: MasterStatus = a.status === "Active" ? "Inactive" : "Active";
          showToast(`Status updated to ${nextStatus} for ${a.assemblyCode}`);
          return { ...a, status: nextStatus, updatedAt: new Date().toISOString().split("T")[0] };
        }
        return a;
      })
    );
  };

  // Duplicate BOM
  const handleDuplicate = (assembly: BomAssembly) => {
    const newCode = `${assembly.assemblyCode}-COPY`;
    const newAssembly: BomAssembly = {
      ...JSON.parse(JSON.stringify(assembly)),
      id: `bom-${Date.now()}`,
      assemblyCode: newCode,
      assemblyName: `${assembly.assemblyName} (Copy)`,
      revision: "Rev 1.0",
      status: "Draft",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setAssemblies((prev) => [newAssembly, ...prev]);
    showToast(`Duplicated ${assembly.assemblyCode} as ${newCode}`);
  };

  // Delete BOM
  const handleDelete = (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete assembly BOM ${code}?`)) {
      setAssemblies((prev) => prev.filter((a) => a.id !== id));
      showToast(`Deleted ${code}`);
    }
  };

  // Form: Child Part Handlers
  const handleAddChildPartRow = () => {
    const defaultPart = CATALOG_CHILD_PARTS[0];
    const newRow: ChildPartMapping = {
      id: `cp-${Date.now()}-${Math.random()}`,
      partCode: defaultPart.partCode,
      partName: defaultPart.partName,
      qtyPerAssembly: 1,
      uom: defaultPart.uom,
      targetMachineType: defaultPart.defaultMachineType,
      hasRawMaterial: !!defaultPart.rawMaterialCode,
      rawMaterialCode: defaultPart.rawMaterialCode,
      rawMaterialName: defaultPart.rawMaterialName,
      consumptionPerPart: defaultPart.defaultConsumption,
      rawMaterialUom: defaultPart.rawMaterialUom,
    };
    setFormData((prev) => ({
      ...prev,
      childParts: [...prev.childParts, newRow],
    }));
  };

  const handleRemoveChildPartRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      childParts: prev.childParts.filter((_, i) => i !== index),
    }));
  };

  const handleChildPartChange = (index: number, field: keyof ChildPartMapping, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.childParts];
      if (field === "partCode") {
        // Auto-fill from catalog
        const match = CATALOG_CHILD_PARTS.find((c) => c.partCode === value);
        if (match) {
          updated[index] = {
            ...updated[index],
            partCode: match.partCode,
            partName: match.partName,
            uom: match.uom,
            targetMachineType: match.defaultMachineType || updated[index].targetMachineType,
            hasRawMaterial: !!match.rawMaterialCode,
            rawMaterialCode: match.rawMaterialCode,
            rawMaterialName: match.rawMaterialName,
            consumptionPerPart: match.defaultConsumption,
            rawMaterialUom: match.rawMaterialUom,
          };
          return { ...prev, childParts: updated };
        }
      }
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, childParts: updated };
    });
  };

  // Form: BOP Handlers
  const handleAddBopRow = () => {
    const defaultBop = CATALOG_BOP_ITEMS[0];
    const newRow: BopPartMapping = {
      id: `bp-${Date.now()}-${Math.random()}`,
      bopCode: defaultBop.bopCode,
      bopName: defaultBop.bopName,
      qtyPerAssembly: 1,
      uom: defaultBop.uom,
      unitCost: defaultBop.defaultUnitCost,
      processStage: defaultBop.defaultStage,
    };
    setFormData((prev) => ({
      ...prev,
      bopParts: [...prev.bopParts, newRow],
    }));
  };

  const handleRemoveBopRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      bopParts: prev.bopParts.filter((_, i) => i !== index),
    }));
  };

  const handleBopChange = (index: number, field: keyof BopPartMapping, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.bopParts];
      if (field === "bopCode") {
        // Auto-fill from catalog
        const match = CATALOG_BOP_ITEMS.find((b) => b.bopCode === value);
        if (match) {
          updated[index] = {
            ...updated[index],
            bopCode: match.bopCode,
            bopName: match.bopName,
            uom: match.uom,
            unitCost: match.defaultUnitCost,
            processStage: match.defaultStage,
          };
          return { ...prev, bopParts: updated };
        }
      }
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, bopParts: updated };
    });
  };

  // Form Save & Validation
  const handleSave = () => {
    const errors: Record<string, string> = {};

    if (!formData.assemblyCode.trim()) {
      errors.assemblyCode = "Assembly Code is required";
    } else {
      // Check duplicate code
      const duplicate = assemblies.find(
        (a) =>
          a.assemblyCode.toLowerCase() === formData.assemblyCode.toLowerCase().trim() &&
          a.id !== selectedAssemblyId
      );
      if (duplicate) {
        errors.assemblyCode = `Assembly Code already in use by ${duplicate.assemblyName}`;
      }
    }

    if (!formData.assemblyName.trim()) {
      errors.assemblyName = "Assembly Name is required";
    }

    if (!formData.status) {
      errors.status = "Status is required";
    }

    // Require at least one valid component
    const totalComponents = formData.childParts.length + formData.bopParts.length;
    if (totalComponents === 0) {
      errors.components = "BOM requires at least one valid component (Child Part or Bought-Out Part).";
    }

    // Validate child parts
    const seenChildCodes = new Set<string>();
    formData.childParts.forEach((cp, idx) => {
      if (!cp.partCode.trim()) {
        errors[`child_${idx}_code`] = "Part Code required";
      } else if (seenChildCodes.has(cp.partCode)) {
        errors[`child_${idx}_code`] = "Duplicate child part in BOM";
      }
      seenChildCodes.add(cp.partCode);

      if (!cp.qtyPerAssembly || cp.qtyPerAssembly <= 0) {
        errors[`child_${idx}_qty`] = "Qty must be > 0";
      }
    });

    // Validate BOP parts
    const seenBopCodes = new Set<string>();
    formData.bopParts.forEach((bp, idx) => {
      if (!bp.bopCode.trim()) {
        errors[`bop_${idx}_code`] = "BOP item required";
      } else if (seenBopCodes.has(bp.bopCode)) {
        errors[`bop_${idx}_code`] = "Duplicate BOP item in BOM";
      }
      seenBopCodes.add(bp.bopCode);

      if (!bp.qtyPerAssembly || bp.qtyPerAssembly <= 0) {
        errors[`bop_${idx}_qty`] = "Qty must be > 0";
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showToast("Please fix the validation errors before saving.");
      return;
    }

    setIsSaving(true);
    setValidationErrors({});

    // Increment revision automatically on edit if revision was not manually altered
    let updatedRevision = formData.revision;
    if (currentView === "edit" && selectedAssemblyId) {
      const original = assemblies.find((a) => a.id === selectedAssemblyId);
      if (original) {
        const partsMatch =
          JSON.stringify(original.childParts) === JSON.stringify(formData.childParts) &&
          JSON.stringify(original.bopParts) === JSON.stringify(formData.bopParts);
        if (!partsMatch && original.revision === formData.revision) {
          const match = original.revision.match(/Rev (\d+)\.(\d+)/);
          if (match) {
            updatedRevision = `Rev ${match[1]}.${parseInt(match[2]) + 1}`;
          } else {
            updatedRevision = `${original.revision}.1`;
          }
        }
      }
    }

    const savedRecord: BomAssembly = {
      ...formData,
      assemblyCode: formData.assemblyCode.trim(),
      assemblyName: formData.assemblyName.trim(),
      revision: updatedRevision,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    setTimeout(() => {
      if (currentView === "add") {
        setAssemblies((prev) => [savedRecord, ...prev]);
        showToast(`Assembly BOM ${savedRecord.assemblyCode} created successfully!`);
      } else {
        setAssemblies((prev) =>
          prev.map((a) => (a.id === selectedAssemblyId ? savedRecord : a))
        );
        showToast(`Assembly BOM ${savedRecord.assemblyCode} updated (${updatedRevision})!`);
      }
      setIsSaving(false);
      setCurrentView("overview");
    }, 400);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] text-[#1D1D1F]">
      <Head>
        <title>BOM Master (Assembly) - PRODSYNC Masters</title>
        <meta
          name="description"
          content="Bill of Materials Master: Multi-level assembly structure, child parts, and bought-out components"
        />
      </Head>

      {/* Toast Notification */}
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

      {/* =========================================================================
          VIEW MODE 1: OVERVIEW / LIST PAGE
          ========================================================================= */}
      {currentView === "overview" && (
        <div className="flex-1 flex flex-col">
          {/* Header Strip */}
          <div className="bg-white border-b border-[#E5E5EA] px-4 py-3.5 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#007AFF] text-white flex items-center justify-center shadow-xs shrink-0">
                  <GitFork className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-[#1D1D1F] tracking-tight">
                      BOM Master (Assembly)
                    </h1>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[#E8F2FE] text-[#007AFF] border border-[#007AFF]/20">
                      MASTER CONFIG
                    </span>
                  </div>
                  <p className="text-xs text-[#86868B] mt-0.5">
                    Define product bills of material, child tube specifications, raw materials, and bought-out parts (BOP)
                  </p>
                </div>
              </div>

              {/* Primary Add Button */}
              <button
                onClick={handleOpenAdd}
                className="px-3.5 py-2 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add BOM Assembly</span>
              </button>
            </div>
          </div>

          {/* 3 Summary Cards matching instructions */}
          <div className="px-4 py-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Card 1: Assemblies */}
              <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#007AFF] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                  <span>ASSEMBLIES</span>
                  <div className="flex items-center gap-1 text-[9.5px]">
                    <span className="px-1.5 py-0.2 rounded bg-[#EAF8EF] text-[#1E823B] font-bold">
                      {activeAssemblies} Active
                    </span>
                    {inactiveAssemblies > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-[#F2F2F7] text-[#86868B] font-bold">
                        {inactiveAssemblies} Inactive
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-[#1D1D1F] mt-2">
                  {totalAssemblies}
                </div>
                <span className="text-[11px] text-[#86868B] mt-1">
                  Configured finished product BOM structures
                </span>
              </div>

              {/* Card 2: Child Parts */}
              <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#F59E0B] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                  <span>CHILD PARTS</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#FEF3C7] text-[#92400E] text-[9.5px] font-bold">
                    Fabricated
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-[#F59E0B] mt-2">
                  {totalChildParts}
                </div>
                <span className="text-[11px] text-[#86868B] mt-1">
                  Active fabricated tube components with raw material link
                </span>
              </div>

              {/* Card 3: BOP Mappings */}
              <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#10B981] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                  <span>BOP MAPPINGS</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#D1FAE5] text-[#065F46] text-[9.5px] font-bold">
                    Bought-Out
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-[#10B981] mt-2">
                  {totalBopMappings}
                </div>
                <span className="text-[11px] text-[#86868B] mt-1">
                  Standard valves, brazing rings, spun caps and grommets
                </span>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="px-4 pb-2 sm:px-6">
            <div className="bg-white p-3 rounded-xl border border-[#E5E5EA] shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                {/* Search */}
                <div className="relative min-w-[240px] flex-1">
                  <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search Assembly Code, Name, Product..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#007AFF] transition-colors"
                  />
                </div>

                {/* Customer Dropdown */}
                <div className="relative min-w-[200px]">
                  <select
                    value={customerFilter}
                    onChange={(e) => {
                      setCustomerFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full appearance-none px-3 py-1.5 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] focus:outline-none focus:border-[#007AFF] transition-colors cursor-pointer"
                  >
                    {customersList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-2.5 pointer-events-none" />
                </div>

                {/* Status Dropdown */}
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
                    <option value="Draft">Draft</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Clear Filters */}
              {(searchQuery || customerFilter !== "All Customers" || statusFilter !== "All Statuses") && (
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
              <table className="w-full text-left text-xs border-collapse min-w-[950px]">
                {/* Table Header */}
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#E5E5EA] text-[10.5px] font-bold text-[#6E6E73] uppercase tracking-wider select-none">
                    <th className="px-3 py-3 min-w-[150px]">ASSEMBLY CODE</th>
                    <th className="px-3 py-3 min-w-[220px]">NAME</th>
                    <th className="px-3 py-3 min-w-[190px]">CUSTOMER</th>
                    <th className="px-3 py-3 min-w-[190px]">LINKED PRODUCT</th>
                    <th className="px-3 py-3 text-center min-w-[90px]">REVISION</th>
                    <th className="px-3 py-3 text-center min-w-[100px]">CHILD COUNT</th>
                    <th className="px-3 py-3 text-center min-w-[90px]">BOP COUNT</th>
                    <th className="px-3 py-3 text-center min-w-[100px]">STATUS</th>
                    <th className="px-3 py-3 text-center min-w-[130px]">ACTIONS</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-[#F2F2F7]">
                  {paginatedAssemblies.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center text-[#86868B]">
                        <div className="max-w-xs mx-auto flex flex-col items-center">
                          <Package className="w-8 h-8 text-[#C7C7CC] mb-2" />
                          <p className="text-sm font-semibold text-[#1D1D1F]">
                            No BOM Assemblies Found
                          </p>
                          <p className="text-xs text-[#86868B] mt-1">
                            {searchQuery || customerFilter !== "All Customers" || statusFilter !== "All Statuses"
                              ? "Try adjusting your search query or filter selection."
                              : "Get started by adding your first product bill of materials."}
                          </p>
                          {(searchQuery || customerFilter !== "All Customers" || statusFilter !== "All Statuses") && (
                            <button
                              onClick={handleClearFilters}
                              className="mt-3 px-3 py-1.5 rounded-lg bg-[#E5E5EA] hover:bg-[#D1D1D6] text-xs font-semibold text-[#1D1D1F]"
                            >
                              Reset All Filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedAssemblies.map((assembly) => {
                      const isDraft = assembly.status === "Draft";
                      const isActive = assembly.status === "Active";

                      return (
                        <tr
                          key={assembly.id}
                          className="hover:bg-[#F9FAFB] transition-colors"
                        >
                          {/* Assembly Code */}
                          <td className="px-3 py-3">
                            <span className="px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] font-mono text-[11px] font-semibold">
                              {assembly.assemblyCode}
                            </span>
                          </td>

                          {/* Name */}
                          <td className="px-3 py-3 font-medium text-[#1D1D1F]">
                            <div>
                              <span>{assembly.assemblyName}</span>
                              {assembly.description && (
                                <p className="text-[10.5px] text-[#86868B] truncate max-w-[260px] mt-0.5">
                                  {assembly.description}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Customer */}
                          <td className="px-3 py-3 text-[#52525B]">
                            <span className="truncate block max-w-[180px]">
                              {assembly.customer || "—"}
                            </span>
                          </td>

                          {/* Linked Product */}
                          <td className="px-3 py-3 text-[#52525B]">
                            <span className="truncate block max-w-[180px]">
                              {assembly.linkedProduct || "—"}
                            </span>
                          </td>

                          {/* Revision */}
                          <td className="px-3 py-3 text-center">
                            <span className="px-1.5 py-0.5 rounded bg-[#F2F2F7] text-[#48484A] font-mono text-[10.5px] font-semibold border border-[#E5E5EA]">
                              {assembly.revision}
                            </span>
                          </td>

                          {/* Child Count */}
                          <td className="px-3 py-3 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] font-bold text-[10.5px]">
                              {assembly.childParts.length} parts
                            </span>
                          </td>

                          {/* BOP Count */}
                          <td className="px-3 py-3 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7] font-bold text-[10.5px]">
                              {assembly.bopParts.length} BOP
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-3 py-3 text-center">
                            <button
                              onClick={() => handleToggleStatus(assembly.id)}
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase transition-colors inline-flex items-center gap-1",
                                isActive && "bg-[#EAF8EF] text-[#16A34A] border border-[#34C759]/30 hover:bg-[#DCFCE7]",
                                isDraft && "bg-[#FFFBEB] text-[#B45309] border border-[#F59E0B]/30 hover:bg-[#FEF3C7]",
                                !isActive && !isDraft && "bg-[#F2F2F7] text-[#86868B] border border-[#D1D1D6] hover:bg-[#E5E5EA]"
                              )}
                              title="Click to toggle Active / Inactive"
                            >
                              <span
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  isActive && "bg-[#16A34A]",
                                  isDraft && "bg-[#B45309]",
                                  !isActive && !isDraft && "bg-[#86868B]"
                                )}
                              />
                              <span>{assembly.status}</span>
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="px-3 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {/* View */}
                              <button
                                onClick={() => handleOpenView(assembly)}
                                className="p-1 rounded-md text-[#6E6E73] hover:text-[#007AFF] hover:bg-[#E8F2FE] transition-colors"
                                title="View BOM Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => handleOpenEdit(assembly)}
                                className="p-1 rounded-md text-[#6E6E73] hover:text-[#007AFF] hover:bg-[#E8F2FE] transition-colors"
                                title="Edit BOM Assembly"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Duplicate */}
                              <button
                                onClick={() => handleDuplicate(assembly)}
                                className="p-1 rounded-md text-[#6E6E73] hover:text-[#D97706] hover:bg-[#FEF3C7] transition-colors"
                                title="Duplicate BOM"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(assembly.id, assembly.assemblyCode)}
                                className="p-1 rounded-md text-[#6E6E73] hover:text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                                title="Delete BOM"
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
                    {filteredAssemblies.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-[#1D1D1F]">
                    {Math.min(currentPage * pageSize, filteredAssemblies.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-[#1D1D1F]">
                    {filteredAssemblies.length}
                  </span>{" "}
                  assemblies
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
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 2: FULL-PAGE ADD / EDIT / VIEW FORM
          ========================================================================= */}
      {(currentView === "add" || currentView === "edit" || currentView === "view") && (
        <div className="flex-1 flex flex-col pb-16">
          {/* Top Form Navigation Bar */}
          <div className="bg-white border-b border-[#E5E5EA] px-4 py-3.5 sm:px-6 sticky top-0 z-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentView("overview")}
                  className="p-1.5 rounded-lg border border-[#E5E5EA] hover:bg-[#F5F5F7] text-[#1D1D1F] transition-colors"
                  title="Back to Overview"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-[#1D1D1F] tracking-tight">
                      {currentView === "view"
                        ? `View BOM: ${formData.assemblyCode}`
                        : currentView === "edit"
                        ? `Edit Assembly BOM: ${formData.assemblyCode}`
                        : "Create New Assembly BOM"}
                    </h1>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[#E8F2FE] text-[#007AFF] border border-[#007AFF]/20">
                      {formData.revision}
                    </span>
                  </div>
                  <p className="text-xs text-[#86868B] mt-0.5">
                    {currentView === "view"
                      ? "Read-only inspection of assembly structure and component specifications"
                      : "Define assembly details, fabricated child parts, raw materials and bought-out components"}
                  </p>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setCurrentView("overview")}
                  className="px-3 py-1.5 rounded-xl border border-[#E5E5EA] bg-white hover:bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F] transition-colors"
                >
                  Cancel
                </button>

                {currentView !== "view" && (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSave}
                    className="px-4 py-1.5 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? "Saving..." : "Save BOM"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Validation Banner if components error */}
          {validationErrors.components && (
            <div className="mx-4 sm:mx-6 mt-4 p-3 bg-[#FFF5F5] border border-[#FF3B30]/30 rounded-xl text-xs text-[#DC2626] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{validationErrors.components}</span>
            </div>
          )}

          {/* Form Content Body: 3 Structured Sections */}
          <div className="px-4 py-4 sm:px-6 space-y-5 max-w-7xl w-full mx-auto">
            {/* -------------------------------------------------------------
                SECTION 1: ASSEMBLY DETAILS
                ------------------------------------------------------------- */}
            <div className="bg-white rounded-xl border border-[#E5E5EA] shadow-xs p-4 sm:p-5">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#F2F2F7]">
                <div className="w-6 h-6 rounded-lg bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h2 className="text-sm font-bold text-[#1D1D1F]">
                  Assembly Details
                </h2>
                <span className="text-xs text-[#86868B]">
                  (Core product identification & versioning)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* Assembly Code (Required) */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Assembly Code <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={currentView === "view"}
                    placeholder="e.g. ASSY-CAR-1004"
                    value={formData.assemblyCode}
                    onChange={(e) =>
                      setFormData({ ...formData, assemblyCode: e.target.value })
                    }
                    className={cn(
                      "w-full px-3 py-2 bg-white border rounded-lg text-xs font-mono font-medium focus:outline-none transition-colors",
                      validationErrors.assemblyCode
                        ? "border-[#EF4444] bg-[#FFF5F5]"
                        : "border-[#E5E5EA] focus:border-[#007AFF]"
                    )}
                  />
                  {validationErrors.assemblyCode && (
                    <span className="text-[10px] text-[#EF4444] mt-0.5 block">
                      {validationErrors.assemblyCode}
                    </span>
                  )}
                </div>

                {/* Assembly Name (Required) */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Assembly Name <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={currentView === "view"}
                    placeholder="e.g. Multi-port Distributor Header Assembly"
                    value={formData.assemblyName}
                    onChange={(e) =>
                      setFormData({ ...formData, assemblyName: e.target.value })
                    }
                    className={cn(
                      "w-full px-3 py-2 bg-white border rounded-lg text-xs font-medium focus:outline-none transition-colors",
                      validationErrors.assemblyName
                        ? "border-[#EF4444] bg-[#FFF5F5]"
                        : "border-[#E5E5EA] focus:border-[#007AFF]"
                    )}
                  />
                  {validationErrors.assemblyName && (
                    <span className="text-[10px] text-[#EF4444] mt-0.5 block">
                      {validationErrors.assemblyName}
                    </span>
                  )}
                </div>

                {/* Status (Required) */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Status <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      disabled={currentView === "view"}
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
                      <option value="Draft">Draft</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Customer (Optional) */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Customer (Optional)
                  </label>
                  <input
                    type="text"
                    disabled={currentView === "view"}
                    placeholder="e.g. Carrier Commercial Refrigeration Ltd"
                    value={formData.customer}
                    onChange={(e) =>
                      setFormData({ ...formData, customer: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] focus:outline-none focus:border-[#007AFF] transition-colors"
                  />
                </div>

                {/* Linked Finished Product (Optional) */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Linked Finished Product (Optional)
                  </label>
                  <input
                    type="text"
                    disabled={currentView === "view"}
                    placeholder="e.g. Carrier Transicold Condenser Unit 10kW"
                    value={formData.linkedProduct}
                    onChange={(e) =>
                      setFormData({ ...formData, linkedProduct: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] focus:outline-none focus:border-[#007AFF] transition-colors"
                  />
                </div>

                {/* Revision (Generated Automatically) */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Revision (Auto-Generated)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      disabled
                      value={formData.revision}
                      className="w-full px-3 py-2 bg-[#F5F5F7] border border-[#E5E5EA] rounded-lg text-xs font-mono font-bold text-[#007AFF]"
                    />
                    <span className="text-[10px] text-[#86868B] shrink-0">
                      Auto-increments on modification
                    </span>
                  </div>
                </div>

                {/* Description (Optional) */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Engineering Remarks / Description (Optional)
                  </label>
                  <input
                    type="text"
                    disabled={currentView === "view"}
                    placeholder="e.g. 4-way distributor header with pre-fluxed brazing rings"
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] focus:outline-none focus:border-[#007AFF] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------
                SECTION 2: CHILD PARTS
                ------------------------------------------------------------- */}
            <div className="bg-white rounded-xl border border-[#E5E5EA] shadow-xs p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[#F2F2F7] gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#1D1D1F]">
                      Child Parts (Fabricated Tubes & Formings)
                    </h2>
                    <span className="text-xs text-[#86868B]">
                      Manufactured in-house with raw material consumption tracking
                    </span>
                  </div>
                </div>

                {currentView !== "view" && (
                  <button
                    type="button"
                    onClick={handleAddChildPartRow}
                    className="px-3 py-1.5 rounded-lg border border-[#F59E0B] text-[#D97706] hover:bg-[#FEF3C7] text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Child Part</span>
                  </button>
                )}
              </div>

              {formData.childParts.length === 0 ? (
                <div className="py-8 text-center text-[#86868B] text-xs border border-dashed border-[#E5E5EA] rounded-xl">
                  No child parts configured for this assembly yet. Click &quot;Add Child Part&quot; to add tube components.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                    <thead>
                      <tr className="bg-[#FAFAFA] border-b border-[#E5E5EA] text-[10px] font-bold text-[#6E6E73] uppercase tracking-wider">
                        <th className="w-8 px-2 py-2 text-center">#</th>
                        <th className="px-3 py-2 min-w-[190px]">
                          PART CODE &amp; NAME <span className="text-[#EF4444]">*</span>
                        </th>
                        <th className="px-2 py-2 w-28 text-center">
                          QTY / ASSY <span className="text-[#EF4444]">*</span>
                        </th>
                        <th className="px-2 py-2 w-20 text-center">UOM</th>
                        <th className="px-3 py-2 min-w-[170px]">TARGET MACHINE TYPE</th>
                        <th className="px-3 py-2 min-w-[240px]">RAW MATERIAL CONSUMPTION</th>
                        <th className="px-3 py-2 min-w-[150px]">REMARKS</th>
                        {currentView !== "view" && (
                          <th className="w-10 px-2 py-2 text-center">ACT</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2F2F7]">
                      {formData.childParts.map((child, idx) => {
                        const codeErr = validationErrors[`child_${idx}_code`];
                        const qtyErr = validationErrors[`child_${idx}_qty`];

                        return (
                          <tr key={child.id} className="hover:bg-[#F9FAFB]">
                            {/* # */}
                            <td className="px-2 py-2.5 text-center font-mono text-[#86868B]">
                              {idx + 1}
                            </td>

                            {/* Part Code & Auto-filled Name */}
                            <td className="px-3 py-2.5">
                              <div className="space-y-1">
                                <div className="relative">
                                  <select
                                    disabled={currentView === "view"}
                                    value={child.partCode}
                                    onChange={(e) =>
                                      handleChildPartChange(idx, "partCode", e.target.value)
                                    }
                                    className={cn(
                                      "w-full appearance-none pl-2.5 pr-7 py-1.5 bg-white border rounded-md text-xs font-mono font-medium focus:outline-none",
                                      codeErr
                                        ? "border-[#EF4444] bg-[#FFF5F5]"
                                        : "border-[#E5E5EA] focus:border-[#007AFF]"
                                    )}
                                  >
                                    {CATALOG_CHILD_PARTS.map((c) => (
                                      <option key={c.partCode} value={c.partCode}>
                                        {c.partCode} — {c.partName}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3 h-3 text-[#86868B] absolute right-2 top-2.5 pointer-events-none" />
                                </div>
                                <span className="text-[10.5px] text-[#52525B] block truncate max-w-[200px]">
                                  {child.partName}
                                </span>
                                {codeErr && (
                                  <span className="text-[9.5px] text-[#EF4444] block">
                                    {codeErr}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Quantity Per Assembly */}
                            <td className="px-2 py-2.5 text-center">
                              <input
                                type="number"
                                min={1}
                                step={1}
                                disabled={currentView === "view"}
                                value={child.qtyPerAssembly}
                                onChange={(e) =>
                                  handleChildPartChange(
                                    idx,
                                    "qtyPerAssembly",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className={cn(
                                  "w-20 px-2 py-1.5 text-center font-mono font-bold text-xs bg-white border rounded-md focus:outline-none",
                                  qtyErr
                                    ? "border-[#EF4444] bg-[#FFF5F5]"
                                    : "border-[#E5E5EA] focus:border-[#007AFF]"
                                )}
                              />
                              {qtyErr && (
                                <span className="text-[9px] text-[#EF4444] block mt-0.5">
                                  {qtyErr}
                                </span>
                              )}
                            </td>

                            {/* UOM */}
                            <td className="px-2 py-2.5 text-center font-mono font-semibold text-[#52525B]">
                              {child.uom}
                            </td>

                            {/* Target Machine Type (Optional) */}
                            <td className="px-3 py-2.5">
                              <input
                                type="text"
                                disabled={currentView === "view"}
                                placeholder="e.g. CNC Rotary Draw Bending"
                                value={child.targetMachineType || ""}
                                onChange={(e) =>
                                  handleChildPartChange(
                                    idx,
                                    "targetMachineType",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2.5 py-1.5 bg-white border border-[#E5E5EA] rounded-md text-xs focus:outline-none focus:border-[#007AFF]"
                              />
                            </td>

                            {/* Raw Material Mapping */}
                            <td className="px-3 py-2.5">
                              {child.hasRawMaterial ? (
                                <div className="p-2 bg-[#F5F5F7] rounded-md border border-[#E5E5EA] space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono text-[10px] font-bold text-[#1D1D1F]">
                                      {child.rawMaterialCode}
                                    </span>
                                    <span className="text-[10px] text-[#007AFF] font-bold">
                                      {child.consumptionPerPart} {child.rawMaterialUom}/part
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-[#86868B] block truncate">
                                    {child.rawMaterialName}
                                  </span>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <input
                                    type="text"
                                    disabled={currentView === "view"}
                                    placeholder="Raw Material Spec"
                                    value={child.rawMaterialName || ""}
                                    onChange={(e) =>
                                      handleChildPartChange(
                                        idx,
                                        "rawMaterialName",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2 py-1 bg-white border border-[#E5E5EA] rounded text-[11px]"
                                  />
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      disabled={currentView === "view"}
                                      placeholder="Consumption"
                                      value={child.consumptionPerPart || ""}
                                      onChange={(e) =>
                                        handleChildPartChange(
                                          idx,
                                          "consumptionPerPart",
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      className="w-20 px-1.5 py-0.5 border border-[#E5E5EA] rounded text-[10.5px]"
                                    />
                                    <span className="text-[10px] text-[#86868B]">MTR</span>
                                  </div>
                                </div>
                              )}
                            </td>

                            {/* Remarks (Optional) */}
                            <td className="px-3 py-2.5">
                              <input
                                type="text"
                                disabled={currentView === "view"}
                                placeholder="Bend radius, tolerances..."
                                value={child.remarks || ""}
                                onChange={(e) =>
                                  handleChildPartChange(idx, "remarks", e.target.value)
                                }
                                className="w-full px-2.5 py-1.5 bg-white border border-[#E5E5EA] rounded-md text-xs focus:outline-none focus:border-[#007AFF]"
                              />
                            </td>

                            {/* Actions */}
                            {currentView !== "view" && (
                              <td className="px-2 py-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveChildPartRow(idx)}
                                  className="p-1 rounded text-[#86868B] hover:text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                                  title="Remove child part"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* -------------------------------------------------------------
                SECTION 3: BOUGHT-OUT PARTS (BOP)
                ------------------------------------------------------------- */}
            <div className="bg-white rounded-xl border border-[#E5E5EA] shadow-xs p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[#F2F2F7] gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#10B981]/10 text-[#10B981] flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#1D1D1F]">
                      Bought-Out Parts (BOP)
                    </h2>
                    <span className="text-xs text-[#86868B]">
                      Standard valves, induction brazing rings, spun caps and hardware
                    </span>
                  </div>
                </div>

                {currentView !== "view" && (
                  <button
                    type="button"
                    onClick={handleAddBopRow}
                    className="px-3 py-1.5 rounded-lg border border-[#10B981] text-[#065F46] hover:bg-[#D1FAE5] text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add BOP Component</span>
                  </button>
                )}
              </div>

              {formData.bopParts.length === 0 ? (
                <div className="py-8 text-center text-[#86868B] text-xs border border-dashed border-[#E5E5EA] rounded-xl">
                  No bought-out components assigned. Click &quot;Add BOP Component&quot; to include valves or brazing rings.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                    <thead>
                      <tr className="bg-[#FAFAFA] border-b border-[#E5E5EA] text-[10px] font-bold text-[#6E6E73] uppercase tracking-wider">
                        <th className="w-8 px-2 py-2 text-center">#</th>
                        <th className="px-3 py-2 min-w-[220px]">
                          BOP ITEM <span className="text-[#EF4444]">*</span>
                        </th>
                        <th className="px-2 py-2 w-28 text-center">
                          QTY / ASSY <span className="text-[#EF4444]">*</span>
                        </th>
                        <th className="px-2 py-2 w-20 text-center">UOM</th>
                        <th className="px-3 py-2 w-32 text-right">UNIT COST (₹)</th>
                        <th className="px-3 py-2 min-w-[170px]">
                          PROCESS STAGE <span className="text-[#EF4444]">*</span>
                        </th>
                        <th className="px-3 py-2 min-w-[180px]">NOTES (OPTIONAL)</th>
                        {currentView !== "view" && (
                          <th className="w-10 px-2 py-2 text-center">ACT</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2F2F7]">
                      {formData.bopParts.map((bop, idx) => {
                        const codeErr = validationErrors[`bop_${idx}_code`];
                        const qtyErr = validationErrors[`bop_${idx}_qty`];

                        return (
                          <tr key={bop.id} className="hover:bg-[#F9FAFB]">
                            {/* # */}
                            <td className="px-2 py-2.5 text-center font-mono text-[#86868B]">
                              {idx + 1}
                            </td>

                            {/* BOP Item Selection */}
                            <td className="px-3 py-2.5">
                              <div className="space-y-1">
                                <div className="relative">
                                  <select
                                    disabled={currentView === "view"}
                                    value={bop.bopCode}
                                    onChange={(e) =>
                                      handleBopChange(idx, "bopCode", e.target.value)
                                    }
                                    className={cn(
                                      "w-full appearance-none pl-2.5 pr-7 py-1.5 bg-white border rounded-md text-xs font-mono font-medium focus:outline-none",
                                      codeErr
                                        ? "border-[#EF4444] bg-[#FFF5F5]"
                                        : "border-[#E5E5EA] focus:border-[#007AFF]"
                                    )}
                                  >
                                    {CATALOG_BOP_ITEMS.map((b) => (
                                      <option key={b.bopCode} value={b.bopCode}>
                                        {b.bopCode} — {b.bopName}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3 h-3 text-[#86868B] absolute right-2 top-2.5 pointer-events-none" />
                                </div>
                                <span className="text-[10.5px] text-[#52525B] block truncate max-w-[220px]">
                                  {bop.bopName}
                                </span>
                                {codeErr && (
                                  <span className="text-[9.5px] text-[#EF4444] block">
                                    {codeErr}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Qty per assembly */}
                            <td className="px-2 py-2.5 text-center">
                              <input
                                type="number"
                                min={1}
                                step={1}
                                disabled={currentView === "view"}
                                value={bop.qtyPerAssembly}
                                onChange={(e) =>
                                  handleBopChange(
                                    idx,
                                    "qtyPerAssembly",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className={cn(
                                  "w-20 px-2 py-1.5 text-center font-mono font-bold text-xs bg-white border rounded-md focus:outline-none",
                                  qtyErr
                                    ? "border-[#EF4444] bg-[#FFF5F5]"
                                    : "border-[#E5E5EA] focus:border-[#007AFF]"
                                )}
                              />
                              {qtyErr && (
                                <span className="text-[9px] text-[#EF4444] block mt-0.5">
                                  {qtyErr}
                                </span>
                              )}
                            </td>

                            {/* UOM */}
                            <td className="px-2 py-2.5 text-center font-mono font-semibold text-[#52525B]">
                              {bop.uom}
                            </td>

                            {/* Unit Cost */}
                            <td className="px-3 py-2.5 text-right font-mono font-medium text-[#1D1D1F]">
                              ₹{bop.unitCost.toFixed(2)}
                            </td>

                            {/* Process Stage */}
                            <td className="px-3 py-2.5">
                              <div className="relative">
                                <select
                                  disabled={currentView === "view"}
                                  value={bop.processStage}
                                  onChange={(e) =>
                                    handleBopChange(idx, "processStage", e.target.value)
                                  }
                                  className="w-full appearance-none pl-2.5 pr-7 py-1.5 bg-white border border-[#E5E5EA] rounded-md text-xs font-medium focus:outline-none focus:border-[#007AFF]"
                                >
                                  <option value="Brazing">Brazing</option>
                                  <option value="End Forming">End Forming</option>
                                  <option value="Assembly">Assembly</option>
                                  <option value="Final Packing">Final Packing</option>
                                </select>
                                <ChevronDown className="w-3 h-3 text-[#86868B] absolute right-2 top-2.5 pointer-events-none" />
                              </div>
                            </td>

                            {/* Notes */}
                            <td className="px-3 py-2.5">
                              <input
                                type="text"
                                disabled={currentView === "view"}
                                placeholder="Assembly instructions..."
                                value={bop.notes || ""}
                                onChange={(e) =>
                                  handleBopChange(idx, "notes", e.target.value)
                                }
                                className="w-full px-2.5 py-1.5 bg-white border border-[#E5E5EA] rounded-md text-xs focus:outline-none focus:border-[#007AFF]"
                              />
                            </td>

                            {/* Actions */}
                            {currentView !== "view" && (
                              <td className="px-2 py-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBopRow(idx)}
                                  className="p-1 rounded text-[#86868B] hover:text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                                  title="Remove BOP part"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            {currentView !== "view" && (
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentView("overview")}
                  className="px-4 py-2 rounded-xl border border-[#E5E5EA] bg-white hover:bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSave}
                  className="px-5 py-2 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Saving BOM..." : "Save Assembly BOM"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

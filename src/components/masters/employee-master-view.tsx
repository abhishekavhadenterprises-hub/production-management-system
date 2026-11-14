import React, { useState, useMemo } from "react";
import Head from "next/head";
import {
  Users,
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
import { EmployeeItem, MasterStatus } from "@/lib/masters-types";
import { INITIAL_EMPLOYEES, INITIAL_DEPARTMENTS, INITIAL_SECTIONS } from "@/lib/masters-mock-data";
import { usePersistentState } from "@/lib/use-persistent-state";

export function EmployeeMasterView() {
  const [employees, setEmployees] = usePersistentState<EmployeeItem[]>(
    "prodsync_master_employees",
    INITIAL_EMPLOYEES
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [designationFilter, setDesignationFilter] = useState("All Designations");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const initialForm: EmployeeItem = {
    id: "",
    empId: "",
    name: "",
    designation: "CNC Operator Grade 1",
    department: INITIAL_DEPARTMENTS[0]?.name || "Tube Bending & Forming",
    section: "",
    contactNumber: "",
    email: "",
    joiningDate: new Date().toISOString().split("T")[0],
    remarks: "",
    status: "Active",
  };

  const [formData, setFormData] = useState<EmployeeItem>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const departmentList = useMemo(() => {
    return ["All Departments", ...INITIAL_DEPARTMENTS.map((d) => d.name)];
  }, []);

  const designationList = useMemo(() => {
    const set = new Set(employees.map((e) => e.designation));
    return ["All Designations", ...Array.from(set)];
  }, [employees]);

  // Dynamic sections filtered by department in form
  const availableSectionsForDept = useMemo(() => {
    if (!formData.department) return [];
    return INITIAL_SECTIONS.filter(
      (s) => s.parentDepartment.toLowerCase() === formData.department.toLowerCase()
    );
  }, [formData.department]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        e.empId.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        (e.section && e.section.toLowerCase().includes(q));

      const matchDept =
        deptFilter === "All Departments" || e.department === deptFilter;

      const matchDesig =
        designationFilter === "All Designations" || e.designation === designationFilter;

      const matchStatus =
        statusFilter === "All Statuses" || e.status === statusFilter;

      return matchSearch && matchDept && matchDesig && matchStatus;
    });
  }, [employees, searchQuery, deptFilter, designationFilter, statusFilter]);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage]);

  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;

  const totalCount = employees.length;
  const activeCount = employees.filter((e) => e.status === "Active").length;
  const inactiveCount = employees.filter((e) => e.status === "Inactive").length;

  const handleClearFilters = () => {
    setSearchQuery("");
    setDeptFilter("All Departments");
    setDesignationFilter("All Designations");
    setStatusFilter("All Statuses");
    setCurrentPage(1);
  };

  const handleOpenAdd = () => {
    const nextNum = employees.length + 1060;
    const defaultDept = INITIAL_DEPARTMENTS[0]?.name || "Tube Bending & Forming";
    const defaultSec = INITIAL_SECTIONS.find((s) => s.parentDepartment === defaultDept)?.name || "";

    setFormData({
      ...initialForm,
      id: `emp-${Date.now()}`,
      empId: `EMP-0${nextNum}`,
      department: defaultDept,
      section: defaultSec,
    });
    setErrors({});
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: EmployeeItem) => {
    setFormData({ ...emp });
    setErrors({});
    setEditingId(emp.id);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (id: string) => {
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const next: MasterStatus = e.status === "Active" ? "Inactive" : "Active";
          showToast(`Employee ${e.empId} marked ${next}`);
          return { ...e, status: next };
        }
        return e;
      })
    );
  };

  const handleDelete = (id: string, empId: string) => {
    if (confirm(`Are you sure you want to delete employee ${empId}?`)) {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      showToast(`Employee ${empId} deleted`);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.empId.trim()) {
      newErrors.empId = "Employee ID is required";
    } else {
      const duplicate = employees.find(
        (e) =>
          e.empId.toLowerCase() === formData.empId.toLowerCase().trim() &&
          e.id !== editingId
      );
      if (duplicate) {
        newErrors.empId = `Employee ID "${formData.empId}" is already assigned to ${duplicate.name}`;
      }
    }

    if (!formData.name.trim()) {
      newErrors.name = "Full Name is required";
    }

    if (!formData.designation.trim()) {
      newErrors.designation = "Designation is required";
    }

    if (!formData.department) {
      newErrors.department = "Department is required";
    }

    // Require section only if this department has sections configured
    if (availableSectionsForDept.length > 0 && !formData.section) {
      newErrors.section = "Section is required for this department";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    setErrors({});

    const saved: EmployeeItem = {
      ...formData,
      empId: formData.empId.trim(),
      name: formData.name.trim(),
    };

    setTimeout(() => {
      if (!editingId) {
        setEmployees((prev) => [saved, ...prev]);
        showToast(`Employee ${saved.empId} (${saved.name}) added`);
      } else {
        setEmployees((prev) => prev.map((e) => (e.id === editingId ? saved : e)));
        showToast(`Employee ${saved.empId} updated`);
      }
      setIsSaving(false);
      setIsModalOpen(false);
    }, 250);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] text-[#1D1D1F]">
      <Head>
        <title>Employee Master - PRODSYNC Masters</title>
        <meta name="description" content="Operators, technicians, shift supervisors and quality inspectors" />
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
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#1D1D1F] tracking-tight">Employee Master</h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                  STAFF &amp; ROSTER
                </span>
              </div>
              <p className="text-xs text-[#86868B] mt-0.5">
                Machine operators, setup technicians, shift supervisors, and quality inspection staff
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 py-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#007AFF] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>TOTAL EMPLOYEES</span>
              <span className="px-2 py-0.5 rounded bg-[#E8F2FE] text-[#007AFF] text-[9.5px] font-bold">Roster</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#1D1D1F] mt-2">{totalCount}</div>
            <span className="text-[11px] text-[#86868B] mt-1">Total registered shop-floor personnel</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#10B981] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>ACTIVE STAFF</span>
              <span className="px-2 py-0.5 rounded bg-[#D1FAE5] text-[#065F46] text-[9.5px] font-bold">Available</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#10B981] mt-2">{activeCount}</div>
            <span className="text-[11px] text-[#86868B] mt-1">Available for job booking & shift scheduling</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#9CA3AF] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>INACTIVE / ON LEAVE</span>
              <span className="px-2 py-0.5 rounded bg-[#F2F2F7] text-[#6E6E73] text-[9.5px] font-bold">Unavailable</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#6E6E73] mt-2">{inactiveCount}</div>
            <span className="text-[11px] text-[#86868B] mt-1">Excluded from shift allocations</span>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="px-4 pb-2 sm:px-6">
        <div className="bg-white p-3 rounded-xl border border-[#E5E5EA] shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative min-w-[220px] flex-1">
              <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search ID, Name, Role..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#007AFF]"
              />
            </div>

            <div className="relative min-w-[190px]">
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
                value={designationFilter}
                onChange={(e) => { setDesignationFilter(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none px-3 py-1.5 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] focus:outline-none focus:border-[#007AFF] cursor-pointer"
              >
                {designationList.map((desig) => (
                  <option key={desig} value={desig}>{desig}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <div className="relative min-w-[130px]">
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

          {(searchQuery || deptFilter !== "All Departments" || designationFilter !== "All Designations" || statusFilter !== "All Statuses") && (
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
                <th className="px-3 py-3 min-w-[120px]">EMPLOYEE ID</th>
                <th className="px-3 py-3 min-w-[200px]">NAME</th>
                <th className="px-3 py-3 min-w-[220px]">DESIGNATION</th>
                <th className="px-3 py-3 min-w-[180px]">DEPARTMENT</th>
                <th className="px-3 py-3 min-w-[180px]">SECTION</th>
                <th className="px-3 py-3 text-center min-w-[100px]">STATUS</th>
                <th className="px-3 py-3 text-center min-w-[100px]">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F2F7]">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#86868B]">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <Package className="w-8 h-8 text-[#C7C7CC] mb-2" />
                      <p className="text-sm font-semibold text-[#1D1D1F]">No Employees Found</p>
                      <p className="text-xs text-[#86868B] mt-1">Try resetting filters or click Add Employee.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => {
                  const isActive = emp.status === "Active";
                  return (
                    <tr key={emp.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] font-mono text-[11px] font-semibold">
                          {emp.empId}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-[#1D1D1F]">
                        <div>
                          <span>{emp.name}</span>
                          {emp.contactNumber && (
                            <span className="text-[10px] text-[#86868B] block mt-0.5">{emp.contactNumber}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[#1D1D1F] font-medium">{emp.designation}</td>
                      <td className="px-3 py-3 text-[#52525B]">
                        <span className="px-2 py-0.5 rounded-md bg-[#F2F2F7] text-[#48484A] text-[11px]">
                          {emp.department}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[#52525B]">{emp.section || "—"}</td>
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(emp.id)}
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase transition-colors inline-flex items-center gap-1",
                            isActive
                              ? "bg-[#EAF8EF] text-[#16A34A] border border-[#34C759]/30 hover:bg-[#DCFCE7]"
                              : "bg-[#F2F2F7] text-[#86868B] border border-[#D1D1D6] hover:bg-[#E5E5EA]"
                          )}
                          title="Click to toggle status"
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-[#16A34A]" : "bg-[#86868B]")} />
                          <span>{emp.status}</span>
                        </button>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="p-1 rounded-md text-[#6E6E73] hover:text-[#007AFF] hover:bg-[#E8F2FE] transition-colors"
                            title="Edit Employee"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(emp.id, emp.empId)}
                            className="p-1 rounded-md text-[#6E6E73] hover:text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                            title="Delete Employee"
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
              Showing <span className="font-semibold text-[#1D1D1F]">{filteredEmployees.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to <span className="font-semibold text-[#1D1D1F]">{Math.min(currentPage * pageSize, filteredEmployees.length)}</span> of <span className="font-semibold text-[#1D1D1F]">{filteredEmployees.length}</span> staff
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
                <h3 className="text-base font-bold text-[#1D1D1F]">{editingId ? "Edit Employee" : "Add New Employee"}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-[#F5F5F7] text-[#86868B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="py-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Employee ID */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Employee ID <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EMP-01042"
                    value={formData.empId}
                    onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 bg-white border rounded-lg text-xs font-mono font-medium focus:outline-none",
                      errors.empId ? "border-[#EF4444] bg-[#FFF5F5]" : "border-[#E5E5EA] focus:border-[#007AFF]"
                    )}
                  />
                  {errors.empId && <span className="text-[10px] text-[#EF4444] mt-0.5 block">{errors.empId}</span>}
                  <span className="text-[9.5px] text-[#86868B] block mt-0.5">Preserves leading zeros format</span>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Full Name <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 bg-white border rounded-lg text-xs font-medium focus:outline-none",
                      errors.name ? "border-[#EF4444] bg-[#FFF5F5]" : "border-[#E5E5EA] focus:border-[#007AFF]"
                    )}
                  />
                  {errors.name && <span className="text-[10px] text-[#EF4444] mt-0.5 block">{errors.name}</span>}
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Designation <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior CNC Bending Specialist"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 bg-white border rounded-lg text-xs font-medium focus:outline-none",
                      errors.designation ? "border-[#EF4444] bg-[#FFF5F5]" : "border-[#E5E5EA] focus:border-[#007AFF]"
                    )}
                  />
                  {errors.designation && <span className="text-[10px] text-[#EF4444] mt-0.5 block">{errors.designation}</span>}
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

                {/* Department (Select) */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Department <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.department}
                      onChange={(e) => {
                        const newDept = e.target.value;
                        const validSec = INITIAL_SECTIONS.find((s) => s.parentDepartment.toLowerCase() === newDept.toLowerCase())?.name || "";
                        setFormData({ ...formData, department: newDept, section: validSec });
                      }}
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

                {/* Section (Filtered dynamically by department!) */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Section {availableSectionsForDept.length > 0 && <span className="text-[#EF4444]">*</span>}
                  </label>
                  <div className="relative">
                    <select
                      value={formData.section}
                      disabled={availableSectionsForDept.length === 0}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs font-medium focus:outline-none focus:border-[#007AFF] disabled:bg-[#F5F5F7]"
                    >
                      {availableSectionsForDept.length === 0 ? (
                        <option value="">No sections for this department</option>
                      ) : (
                        availableSectionsForDept.map((s) => (
                          <option key={s.code} value={s.name}>{s.name}</option>
                        ))
                      )}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-3 pointer-events-none" />
                  </div>
                  {errors.section && <span className="text-[10px] text-[#EF4444] mt-0.5 block">{errors.section}</span>}
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">Contact Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98230 11420"
                    value={formData.contactNumber || ""}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-xs focus:outline-none focus:border-[#007AFF]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. rajesh.s@jpan.in"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-xs focus:outline-none focus:border-[#007AFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">Remarks / Qualifications (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Optional certifications or skill level"
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
                  <span>{isSaving ? "Saving..." : "Save Employee"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

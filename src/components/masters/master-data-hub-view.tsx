import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Database,
  GitFork,
  MapPin,
  Boxes,
  Route,
  Building2,
  LayoutGrid,
  Users,
  UserCheck,
  Truck,
  Cog,
  Wrench,
  Package,
  Clock,
  CircleSlash,
  ChevronRight,
  Plus,
  Search,
  CheckCircle2,
  X,
  Layers,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface MasterModuleCard {
  id: string;
  title: string;
  category: "Core Configuration" | "Organization" | "Plant Assets" | "Reason Codes" | "Materials";
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  badge: string;
  badgeColor?: string;
  tag: string;
  description: string;
  href: string;
  entitiesCount: string;
}

export const MASTER_MODULES: MasterModuleCard[] = [
  {
    id: "employee-master",
    title: "Employee Master",
    category: "Organization",
    icon: Users,
    iconColor: "text-[#155EEF]",
    iconBg: "bg-[#EFF4FF]",
    badge: "BUILT-IN",
    tag: "Workforce",
    description: "Manage employee records and custom fields",
    href: "/masters/employee-master",
    entitiesCount: "6 Master Operators",
  },
  {
    id: "plant-location-master",
    title: "Plant / Location Master",
    category: "Organization",
    icon: MapPin,
    iconColor: "text-[#155EEF]",
    iconBg: "bg-[#EFF4FF]",
    badge: "BUILT-IN",
    tag: "Locations",
    description: "Manage manufacturing plants and locations",
    href: "/masters/zone-master",
    entitiesCount: "5 Plant Locations",
  },
  {
    id: "department-master",
    title: "Department Master",
    category: "Organization",
    icon: Building2,
    iconColor: "text-[#155EEF]",
    iconBg: "bg-[#EFF4FF]",
    badge: "BUILT-IN",
    tag: "Hierarchy",
    description: "Manage company departments and hierarchy",
    href: "/masters/department-master",
    entitiesCount: "5 Departments Registered",
  },
  {
    id: "designation-master",
    title: "Designation Master",
    category: "Organization",
    icon: UserCheck,
    iconColor: "text-[#155EEF]",
    iconBg: "bg-[#EFF4FF]",
    badge: "BUILT-IN",
    tag: "Designations",
    description: "Manage employee roles and designations",
    href: "/masters/employee-master",
    entitiesCount: "8 Active Roles",
  },
  {
    id: "shift-master",
    title: "Shift Master",
    category: "Core Configuration",
    icon: Clock,
    iconColor: "text-[#155EEF]",
    iconBg: "bg-[#EFF4FF]",
    badge: "BUILT-IN",
    tag: "Timings",
    description: "Manage working shifts and timings",
    href: "/masters/delay-reasons",
    entitiesCount: "2 Working Shifts",
  },
  {
    id: "vehicle-master",
    title: "Vehicle Master",
    category: "Organization",
    icon: Truck,
    iconColor: "text-[#155EEF]",
    iconBg: "bg-[#EFF4FF]",
    badge: "BUILT-IN",
    tag: "Fleet",
    description: "Manage company vehicles and transportation fleet",
    href: "/masters/inventory-stock",
    entitiesCount: "4 Vehicles Listed",
  },
  {
    id: "bom-master-assembly",
    title: "BOM Master (Assembly)",
    category: "Core Configuration",
    icon: GitFork,
    iconColor: "text-[#D97706]",
    iconBg: "bg-[#FEF3C7]",
    badge: "BUILT-IN",
    tag: "Child + BOP",
    description: "Manage multi-level HVAC assembly bills of materials, fabricated child parts, raw material consumption, and bought-out components.",
    href: "/masters/bom-master-assembly",
    entitiesCount: "6 Assemblies Configured",
  },
  {
    id: "zone-master",
    title: "Zone Master",
    category: "Core Configuration",
    icon: MapPin,
    iconColor: "text-[#2563EB]",
    iconBg: "bg-[#EFF6FF]",
    badge: "BUILT-IN",
    tag: "Plant Zones",
    description: "Define physical manufacturing plant zones (Machining, Brazing, Leak Testing, Packing, FG) and sequence flow rules.",
    href: "/masters/zone-master",
    entitiesCount: "5 Production Zones",
  },
  {
    id: "virtual-box-master",
    title: "Virtual Box Master",
    category: "Core Configuration",
    icon: Boxes,
    iconColor: "text-[#0284C7]",
    iconBg: "bg-[#E0F2FE]",
    badge: "BUILT-IN",
    tag: "VB1 - VB4",
    description: "Configure staging WIP buffer boxes (VB1–VB4) for intermediate handoffs, safety stock limits, and overflow alerts.",
    href: "/masters/virtual-box-master",
    entitiesCount: "4 Buffer Boxes",
  },
  {
    id: "assembly-route-card",
    title: "Assembly Route Card",
    category: "Core Configuration",
    icon: Route,
    iconColor: "text-[#7C3AED]",
    iconBg: "bg-[#F5F3FF]",
    badge: "BUILT-IN",
    tag: "Zone Map",
    description: "Standard operational manufacturing routing cards, target machine cells, and pressure decay quality gates per product model.",
    href: "/masters/assembly-route-card",
    entitiesCount: "4 Route Workflows",
  },
  {
    id: "section-master",
    title: "Section Master",
    category: "Organization",
    icon: LayoutGrid,
    iconColor: "text-[#0D9488]",
    iconBg: "bg-[#F0FDFA]",
    badge: "BUILT-IN",
    tag: "Work Bays",
    description: "Define CNC bending bays, micro capillary cells, robotic induction stations, and ultrasonic inspection areas.",
    href: "/masters/section-master",
    entitiesCount: "7 Work Center Bays",
  },
  {
    id: "machines",
    title: "Machines Master",
    category: "Plant Assets",
    icon: Cog,
    iconColor: "text-[#4F46E5]",
    iconBg: "bg-[#EEF2FF]",
    badge: "BUILT-IN",
    tag: "Plant Assets",
    description: "Manage multi-axis CNC tube benders, hydraulic ram formers, induction brazing carousels, and rated hourly capacities.",
    href: "/masters/machines",
    entitiesCount: "6 Production Machines",
  },
  {
    id: "tool-master",
    title: "Tool Master",
    category: "Plant Assets",
    icon: Wrench,
    iconColor: "text-[#D97706]",
    iconBg: "bg-[#FEF3C7]",
    badge: "BUILT-IN",
    tag: "Tooling D2",
    description: "Track bending dies, wiper die assemblies, mandrels, clamp jaws, maintenance regrinds, and physical wear condition.",
    href: "/masters/tool-master",
    entitiesCount: "4 Active Tool Sets",
  },
  {
    id: "inventory-stock",
    title: "Inventory & Stock",
    category: "Materials",
    icon: Package,
    iconColor: "text-[#0D9488]",
    iconBg: "bg-[#F0FDFA]",
    badge: "BUILT-IN",
    tag: "Raw & BOP",
    description: "Raw copper tube coil inventory, bought-out Schrader valves, silver brazing rings, buffer bins, and reorder alerts.",
    href: "/masters/inventory-stock",
    entitiesCount: "8 Master Skus",
  },
  {
    id: "delay-reasons",
    title: "Delay Reasons",
    category: "Reason Codes",
    icon: Clock,
    iconColor: "text-[#EA580C]",
    iconBg: "bg-[#FFF7ED]",
    badge: "BUILT-IN",
    tag: "Downtime",
    description: "Standardized downtime reason codes, tooling setup delays, QC wait times, and hydraulic breakdown classifications.",
    href: "/masters/delay-reasons",
    entitiesCount: "6 Delay Reason Codes",
  },
  {
    id: "cancel-split-reasons",
    title: "Cancel / Split Reasons",
    category: "Reason Codes",
    icon: CircleSlash,
    iconColor: "text-[#DC2626]",
    iconBg: "bg-[#FEF2F2]",
    badge: "BUILT-IN",
    tag: "Governance",
    description: "Authorized reason codes for batch splitting, work order cancellation, engineering drawing revisions, and holds.",
    href: "/masters/cancel-split-reasons",
    entitiesCount: "5 Reason Codes",
  },
];

export function MasterDataHubView() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Master form
  const [newMasterName, setNewMasterName] = useState("");
  const [newMasterDesc, setNewMasterDesc] = useState("");
  const [newMasterCategory, setNewMasterCategory] = useState("Core Configuration");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const categories = useMemo(() => {
    return [
      "All",
      "Core Configuration",
      "Organization",
      "Plant Assets",
      "Materials",
      "Reason Codes",
    ];
  }, []);

  const filteredModules = useMemo(() => {
    return MASTER_MODULES.filter((mod) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        mod.title.toLowerCase().includes(q) ||
        mod.description.toLowerCase().includes(q) ||
        mod.tag.toLowerCase().includes(q);

      const matchCategory =
        selectedCategory === "All" || mod.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleCreateMaster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMasterName.trim()) return;
    setIsAddModalOpen(false);
    setNewMasterName("");
    setNewMasterDesc("");
    showToast(`Master "${newMasterName}" schema created successfully!`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#101828] pb-16 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#12B76A] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
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

      {/* Main Top Header matching reference image */}
      <div className="px-6 sm:px-8 lg:px-10 pt-7 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[26px] font-bold text-[#101828] tracking-tight">
              Master Data Configuration
            </h1>
            <p className="text-sm text-[#475467] font-normal mt-1 leading-relaxed">
              Select a module to manage its master data and schema configurations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4.5 py-2.5 rounded-xl bg-[#155EEF] hover:bg-[#175CD3] text-white text-sm font-semibold transition-all flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Master</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Container - Cards Grid fills viewport without awkward gaping */}
      <div className="px-6 sm:px-8 lg:px-10 py-4 pb-16">
        {/* Master Modules Grid (3 Columns) matching reference image */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => {
            const Icon = module.icon;

            return (
              <div
                key={module.id}
                onClick={() => router.push(module.href)}
                className="bg-white rounded-2xl border border-[#EAECF0] p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-[#155EEF]/40 transition-all flex flex-col justify-between group cursor-pointer relative min-h-[190px]"
              >
                <div>
                  {/* Top Row: Icon + BUILT-IN Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs",
                        module.iconBg || "bg-[#EFF4FF]"
                      )}
                    >
                      <Icon className={cn("w-5 h-5", module.iconColor || "text-[#155EEF]")} />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-[#ECFDF3] text-[#027A48] border border-[#ABEFC6]">
                        {module.badge}
                      </span>
                    </div>
                  </div>

                  {/* Master Title */}
                  <div className="space-y-1 mb-2">
                    <h3 className="text-[17px] font-bold text-[#101828] group-hover:text-[#155EEF] transition-colors leading-snug">
                      {module.title}
                    </h3>
                    <p className="text-sm text-[#475467] leading-relaxed line-clamp-2 mt-1.5">
                      {module.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Configure Link matching reference screenshot */}
                <div className="pt-4 mt-2 flex items-center">
                  <span className="inline-flex items-center text-sm font-semibold text-[#155EEF] group-hover:text-[#175CD3] transition-colors">
                    <span>Configure</span>
                    <ChevronRight className="w-4 h-4 ml-0.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Quick Action Button matching reference screenshot */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="fixed bottom-8 right-8 z-40 w-11 h-11 rounded-full bg-[#101828] hover:bg-[#1D2939] text-white shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          title="Quick Actions"
        >
          <SlidersHorizontal className="w-5 h-5 text-white" />
        </button>

        {filteredModules.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#E5E5EA] p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] text-[#86868B] mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#1D1D1F]">
              No Master Modules Found
            </h3>
            <p className="text-xs text-[#6E6E73] max-w-sm mx-auto">
              No master module matches &quot;{searchQuery}&quot;. Clear your search or change the category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#007AFF] text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Add New Master Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E5EA] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#007AFF]" />
                <h3 className="text-base font-bold text-[#1D1D1F]">
                  Add New Master Configuration
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#86868B] hover:text-[#1D1D1F] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMaster} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                  Master Module Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paint Specification Master"
                  value={newMasterName}
                  onChange={(e) => setNewMasterName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl text-xs font-medium focus:bg-white focus:border-[#007AFF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                  Category
                </label>
                <select
                  value={newMasterCategory}
                  onChange={(e) => setNewMasterCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl text-xs font-medium focus:bg-white focus:border-[#007AFF] focus:outline-none"
                >
                  <option value="Core Configuration">Core Configuration</option>
                  <option value="Organization">Organization</option>
                  <option value="Plant Assets">Plant Assets</option>
                  <option value="Materials">Materials</option>
                  <option value="Reason Codes">Reason Codes</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the entities and schema managed by this master..."
                  value={newMasterDesc}
                  onChange={(e) => setNewMasterDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl text-xs font-medium focus:bg-white focus:border-[#007AFF] focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E5EA]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D1D5DB] text-[#48484A] text-xs font-semibold hover:bg-[#F3F4F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#007AFF] text-white text-xs font-bold hover:bg-[#0062CC]"
                >
                  Create Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import {
  Calendar,
  Columns,
  Volume2,
  Bell,
  ChevronDown,
  Search,
  Globe,
  Building,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JPanTopHeaderProps {
  onSearch?: (query: string) => void;
}

export function JPanTopHeader({ onSearch }: JPanTopHeaderProps) {
  const [plantDropdownOpen, setPlantDropdownOpen] = useState(false);
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState("All Plants");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [searchVal, setSearchVal] = useState("");

  const plants = [
    "All Plants",
    "Unit 1 - Pune Main Facility",
    "Unit 2 - Sanand Automotive",
    "Unit 3 - Pantnagar HVAC",
  ];

  const depts = [
    "All Departments",
    "Machining & Bending",
    "Brazing Section",
    "Leak Testing Gate",
    "Store & BOP Inventory",
  ];

  return (
    <header className="h-14 bg-[#0A56D1] text-white px-4 sm:px-6 flex items-center justify-between z-40 shrink-0 select-none shadow-sm">
      {/* Left: Brand Logo & Title + Selectors */}
      <div className="flex items-center gap-3 lg:gap-4 min-w-0">
        {/* Brand Pill matching reference image */}
        <div className="flex items-center gap-2.5">
          <div className="bg-white px-2.5 py-1 rounded-lg flex items-center justify-center shadow-xs">
            <span className="font-serif font-black italic text-xs tracking-tight text-[#0A56D1]">
              JPan
            </span>
          </div>
          <span className="font-extrabold text-[14px] sm:text-[15px] tracking-wide uppercase text-white whitespace-nowrap">
            JPAN DASH BOARD
          </span>
        </div>

        {/* Plant Switcher Pill */}
        <div className="relative hidden md:block">
          <button
            onClick={() => {
              setPlantDropdownOpen(!plantDropdownOpen);
              setDeptDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-medium text-white transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-white/80" />
            <span className="truncate max-w-[100px]">{selectedPlant}</span>
            <span className="bg-white/20 text-[9.5px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider">
              GLOBAL
            </span>
            <ChevronDown className="w-3 h-3 text-white/80 ml-0.5" />
          </button>

          {plantDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setPlantDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#EAECF0] p-1.5 z-50 text-[#101828]">
                {plants.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setSelectedPlant(p);
                      setPlantDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-colors",
                      selectedPlant === p
                        ? "bg-[#EFF8FF] text-[#175CD3] font-semibold"
                        : "text-[#344054] hover:bg-[#F8F9FC]"
                    )}
                  >
                    <span>{p}</span>
                    {selectedPlant === p && <Check className="w-3.5 h-3.5 text-[#175CD3]" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Department Switcher Pill */}
        <div className="relative hidden lg:block">
          <button
            onClick={() => {
              setDeptDropdownOpen(!deptDropdownOpen);
              setPlantDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-medium text-white transition-colors"
          >
            <Building className="w-3.5 h-3.5 text-white/80" />
            <span className="truncate max-w-[120px]">{selectedDept}</span>
            <ChevronDown className="w-3 h-3 text-white/80 ml-0.5" />
          </button>

          {deptDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDeptDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#EAECF0] p-1.5 z-50 text-[#101828]">
                {depts.map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setSelectedDept(d);
                      setDeptDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-colors",
                      selectedDept === d
                        ? "bg-[#EFF8FF] text-[#175CD3] font-semibold"
                        : "text-[#344054] hover:bg-[#F8F9FC]"
                    )}
                  >
                    <span>{d}</span>
                    {selectedDept === d && <Check className="w-3.5 h-3.5 text-[#175CD3]" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Universal Search & Quick Action Utilities & User Avatar */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Universal Search Pill */}
        <div className="relative hidden sm:flex items-center">
          <Search className="w-3.5 h-3.5 text-white/70 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              onSearch?.(e.target.value);
            }}
            placeholder="Universal Search (Ctrl+K)..."
            className="w-52 lg:w-64 pl-8 pr-8 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 text-xs text-white placeholder:text-white/60 focus:outline-none focus:border-white/40 transition-colors"
          />
          <kbd className="absolute right-2 text-[10px] font-medium bg-white/15 px-1 py-0.2 rounded text-white/80">
            ⌘K
          </kbd>
        </div>

        {/* Quick Utilities: Calendar, Window/Split, Audio, Notifications */}
        <div className="flex items-center gap-1 text-white/90">
          <button
            title="Operational Calendar"
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            title="Split Views"
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors hidden sm:block"
          >
            <Columns className="w-4 h-4" />
          </button>
          <button
            title="Announcements"
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors hidden md:block"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            title="Notifications"
            className="relative p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute 1 top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center leading-none">
              2
            </span>
          </button>
        </div>

        {/* User Profile matching reference image */}
        <div className="flex items-center gap-2 pl-1.5 border-l border-white/20 cursor-pointer hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-white text-[#0A56D1] font-bold text-xs flex items-center justify-center shadow-xs">
            AA
          </div>
          <div className="hidden lg:flex items-center gap-1">
            <span className="text-xs font-semibold text-white">Abhishek AE</span>
            <ChevronDown className="w-3 h-3 text-white/80" />
          </div>
        </div>
      </div>
    </header>
  );
}

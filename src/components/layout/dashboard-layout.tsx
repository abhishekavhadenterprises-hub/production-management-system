import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { Menu, X } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="apple-dashboard-layout flex h-screen overflow-hidden bg-[#F5F5F7]">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop & Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:static lg:block transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Main Content Area with Scroll */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile Top Navbar with Menu Toggle */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#E5E5EA]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1.5 rounded-lg text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="font-semibold text-sm text-[#1D1D1F]">
              PRODSYNC Scheduler v2
            </span>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#EAF8EF] text-[#1E823B]">
            Operational
          </span>
        </div>

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

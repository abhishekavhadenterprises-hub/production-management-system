import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { JPanTopHeader } from "./jpan-top-header";
import { Menu, X } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8F9FC] font-sans">
      {/* 1. Full-Width JPan Blue Top Header matching reference */}
      <JPanTopHeader />

      {/* 2. Main Workspace Body: Left Sidebar + Right Content Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Mobile Backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-xs lg:hidden transition-opacity"
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
          {/* Mobile Top Subbar with Menu Toggle */}
          <div className="lg:hidden flex items-center justify-between px-4 py-2.5 bg-white border-b border-[#EAECF0]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-1.5 rounded-lg text-[#344054] hover:bg-[#F2F4F7] transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <span className="font-semibold text-sm text-[#101828]">
                Navigation Menu
              </span>
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

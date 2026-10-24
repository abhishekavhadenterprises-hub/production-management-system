import React from "react";
import { DepartmentPerformance } from "@/lib/types";
import { Users, CheckCircle2 } from "lucide-react";

interface DepartmentPerformanceChartProps {
  departments: DepartmentPerformance[];
}

export function DepartmentPerformanceChart({
  departments,
}: DepartmentPerformanceChartProps) {
  return (
    <div className="apple-chart-card bg-white border border-[#E5E5EA] rounded-[18px] p-5 shadow-sm hover:border-[#D2D2D7] transition-all flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F2F2F7]">
        <div>
          <h3 className="text-sm font-semibold text-[#1D1D1F] tracking-tight">
            Department Performance
          </h3>
          <p className="text-xs text-[#6E6E73] mt-0.5">
            Operational score & on-time SLA compliance
          </p>
        </div>
        <span className="text-[11px] font-medium text-[#6E6E73] bg-[#F5F5F7] px-2.5 py-1 rounded-full border border-[#E5E5EA]">
          Target: 90.0%+
        </span>
      </div>

      {/* Department Rows */}
      <div className="py-3 space-y-3.5">
        {departments.map((dept) => {
          const isTopTier = dept.score >= 96;

          return (
            <div key={dept.name} className="space-y-1.5 group">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors truncate max-w-[200px]">
                  {dept.name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-[#86868B] hidden sm:inline">
                    {dept.tasksCompleted} tasks
                  </span>
                  <span className="font-bold text-[#1D1D1F] text-xs">
                    {dept.score}%
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="relative w-full h-2 bg-[#F2F2F7] rounded-full overflow-hidden">
                <div
                  style={{ width: `${dept.score}%` }}
                  className="h-full rounded-full bg-[#0071E3] group-hover:bg-[#0058B3] transition-all duration-300"
                />
              </div>

              {/* Sub-metrics */}
              <div className="flex items-center justify-between text-[10px] text-[#86868B]">
                <span>On-time SLA: {dept.onTimeRate}%</span>
                <span>{dept.headCount} active staff</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#F2F2F7] text-xs text-[#6E6E73]">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" />
          <span>All 5 departments meet or exceed enterprise baseline</span>
        </div>
      </div>
    </div>
  );
}

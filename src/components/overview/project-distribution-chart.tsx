import React, { useState } from "react";
import { ProjectStatusItem } from "@/lib/types";
import { FolderGit2 } from "lucide-react";

interface ProjectDistributionChartProps {
  data: ProjectStatusItem[];
  totalProjects?: number;
}

export function ProjectDistributionChart({
  data,
  totalProjects = 42,
}: ProjectDistributionChartProps) {
  const [activeItem, setActiveItem] = useState<ProjectStatusItem | null>(null);

  // SVG Ring calculation
  const size = 150;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;

  return (
    <div className="apple-chart-card bg-white border border-[#E5E5EA] rounded-[18px] p-5 shadow-sm hover:border-[#D2D2D7] transition-all flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F2F2F7]">
        <div>
          <h3 className="text-sm font-semibold text-[#1D1D1F] tracking-tight">
            Project Status Distribution
          </h3>
          <p className="text-xs text-[#6E6E73] mt-0.5">
            Active portfolio health breakdown
          </p>
        </div>
        <span className="text-xs font-semibold text-[#0071E3] bg-[#E8F2FE] px-2.5 py-1 rounded-full border border-[#B2D7FD]">
          {totalProjects} Active
        </span>
      </div>

      {/* Main Visual: Center Ring & Breakdown Grid */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
        {/* Apple Style Donut Ring */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#F2F2F7"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Segmented Donut arcs */}
            {data.map((item) => {
              const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -cumulativeOffset;
              cumulativeOffset += (item.percentage / 100) * circumference;

              return (
                <circle
                  key={item.status}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={item.color}
                  strokeWidth={activeItem?.status === item.status ? strokeWidth + 2 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setActiveItem(item)}
                  onMouseLeave={() => setActiveItem(null)}
                />
              );
            })}
          </svg>

          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
              {activeItem ? activeItem.count : totalProjects}
            </span>
            <span className="text-[10px] uppercase font-semibold text-[#86868B] tracking-wider">
              {activeItem ? activeItem.status : "Projects"}
            </span>
          </div>
        </div>

        {/* Legend / Status Cards */}
        <div className="flex-1 w-full space-y-2">
          {data.map((item) => (
            <div
              key={item.status}
              onMouseEnter={() => setActiveItem(item)}
              onMouseLeave={() => setActiveItem(null)}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F5F5F7] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <span
                  style={{ backgroundColor: item.color }}
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                />
                <span className="text-xs font-medium text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors">
                  {item.status}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[#1D1D1F]">
                  {item.count}
                </span>
                <span className="text-[11px] text-[#86868B] w-12 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Segmented Bar Summary */}
      <div className="pt-3 border-t border-[#F2F2F7]">
        <div className="flex h-2 rounded-full overflow-hidden gap-0.5 bg-[#F2F2F7]">
          {data.map((item) => (
            <div
              key={item.status}
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
              }}
              title={`${item.status}: ${item.percentage}%`}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

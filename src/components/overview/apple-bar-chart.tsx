import React, { useState } from "react";
import { BarDataPoint } from "@/lib/types";

interface AppleBarChartProps {
  title: string;
  modulePath: string;
  periodText?: string;
  metricValue: string;
  metricLabel: string;
  color?: "blue" | "red";
  data: BarDataPoint[];
  yAxisLabels: string[];
  maxY: number;
  legend?: { label: string; color: string }[];
  isSampleData?: boolean;
}

export function AppleBarChart({
  title,
  modulePath,
  periodText = "Last 30 Days",
  metricValue,
  metricLabel,
  color = "blue",
  data,
  yAxisLabels,
  maxY,
  legend,
  isSampleData = true,
}: AppleBarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const primaryColor = color === "blue" ? "#007AFF" : "#FF3B30";
  const hoverColor = color === "blue" ? "#0058B3" : "#D72A20";

  return (
    <div className="apple-ref-card bg-white border border-[#E5E5EA] rounded-[16px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#D2D2D7] transition-all flex flex-col justify-between h-full group">
      {/* Card Header */}
      <div>
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-[13.5px] font-semibold text-[#1D1D1F] tracking-tight">
                {title}
              </h3>
              {isSampleData && (
                <span className="text-[9.5px] font-medium px-1.5 py-0.2 rounded bg-[#F2F2F7] text-[#86868B]">
                  Sample
                </span>
              )}
            </div>
            <p className="text-[10px] text-[#86868B] font-mono tracking-tight mt-0.5 truncate">
              {modulePath}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#86868B] shrink-0">
            <span className="text-[#86868B] py-0.5 px-1 rounded flex items-center gap-1">
              <span>{periodText}</span>
              <svg className="w-2.5 h-2.5 opacity-70" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <button className="hover:text-[#1D1D1F] p-0.5 rounded transition-colors" title="Module options">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="3" cy="8" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="13" cy="8" r="1.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Big KPI Metric */}
        <div className="mt-2.5 mb-3">
          <div className="text-[28px] sm:text-[32px] font-bold text-[#1D1D1F] tracking-tight leading-none">
            {metricValue}
          </div>
          <div className="text-[11px] text-[#86868B] mt-1 font-medium">
            {metricLabel}
          </div>
        </div>
      </div>

      {/* Bar Chart Graphic */}
      <div className="relative mt-2">
        <div className="flex">
          {/* Main Chart Graphic */}
          <div className="flex-1 relative pb-6">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
              {yAxisLabels.map((_, i) => (
                <div
                  key={i}
                  className="w-full border-b border-[#EBEBF0] border-dashed h-0"
                />
              ))}
            </div>

            {/* Bars Container */}
            <div className="relative flex items-end justify-between h-36 pt-2 z-10 px-1">
              {data.map((item, idx) => {
                const heightPercent = Math.min(100, Math.max(6, (item.value / maxY) * 100));
                const isHovered = hoveredIdx === idx;

                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center flex-1 h-full justify-end cursor-pointer group"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {/* Tooltip on Hover */}
                    {isHovered && (
                      <div className="absolute -top-7 px-2 py-0.5 bg-[#1D1D1F] text-white text-[10px] rounded shadow-md pointer-events-none z-20 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                        {item.date ? `${item.date}: ` : ""}{item.value} units
                      </div>
                    )}

                    {/* Bar */}
                    <div
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: isHovered ? hoverColor : primaryColor,
                        animationDelay: `${idx * 25}ms`,
                      }}
                      className="w-full max-w-[6.5px] rounded-t-[1.5px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-y-105 origin-bottom animate-bar-grow"
                    />

                    {/* X-Axis Tick Label */}
                    {item.date && (
                      <span
                        className={`absolute -bottom-5 text-[9.5px] whitespace-nowrap select-none transition-colors ${
                          item.isKeyDate
                            ? "font-bold text-[#1D1D1F]"
                            : "text-[#86868B] font-normal"
                        }`}
                      >
                        {item.date}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Y-Axis Scale Labels */}
          <div className="w-10 flex flex-col justify-between text-right pl-2 pb-6 text-[9.5px] font-mono text-[#86868B] select-none h-36">
            {yAxisLabels.map((label, idx) => (
              <span key={idx} className="leading-none">
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Legend at bottom if provided */}
        {legend && legend.length > 0 && (
          <div className="flex items-center justify-center gap-4 pt-2 text-[10.5px] font-medium text-[#1D1D1F]">
            {legend.map((l, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span
                  style={{ backgroundColor: l.color }}
                  className="w-2 h-2 rounded-full"
                />
                <span className="text-[#6E6E73] uppercase tracking-wider text-[9.5px] font-semibold">
                  {l.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

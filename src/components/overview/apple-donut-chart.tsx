import React from "react";

interface AppleDonutChartProps {
  title: string;
  modulePath?: string;
  percentage: number;
  label?: string;
  sublabel?: string;
  color?: string;
  size?: number;
  footerLabel?: string;
  footerValue?: string;
  isSampleData?: boolean;
}

export function AppleDonutChart({
  title,
  modulePath,
  percentage,
  label,
  sublabel,
  color = "#007AFF",
  size = 120,
  footerLabel = "Status Breakdown",
  footerValue,
  isSampleData = true,
}: AppleDonutChartProps) {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="apple-ref-card bg-white border border-[#E5E5EA] rounded-[16px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#D2D2D7] transition-all flex flex-col justify-between h-full">
      {/* Header */}
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
            {modulePath && (
              <p className="text-[10px] text-[#86868B] font-mono tracking-tight mt-0.5 truncate">
                {modulePath}
              </p>
            )}
          </div>

          <button className="hover:text-[#1D1D1F] p-0.5 rounded transition-colors text-[#86868B]" title="Options">
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="3" cy="8" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="13" cy="8" r="1.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Donut Center */}
      <div className="flex items-center justify-center my-4 group cursor-pointer">
        <div className="relative flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#EBEBF0"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Active arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
            />
          </svg>

          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[20px] font-bold text-[#1D1D1F] tracking-tight leading-none group-hover:text-[#007AFF] transition-colors">
              {label || `${percentage}%`}
            </span>
            {sublabel && (
              <span className="text-[10px] text-[#86868B] font-medium mt-1">
                {sublabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Legend */}
      <div className="flex items-center justify-between pt-2 border-t border-[#F2F2F7] text-[10.5px] text-[#86868B]">
        <span>{footerLabel}</span>
        <span className="font-semibold text-[#1D1D1F]">
          {footerValue || `${percentage}% on track`}
        </span>
      </div>
    </div>
  );
}

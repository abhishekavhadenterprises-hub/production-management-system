import React, { useState } from "react";
import { PerformanceDataPoint } from "@/lib/types";
import { TrendingUp, Activity, Info } from "lucide-react";

interface PerformanceTrendChartProps {
  data: PerformanceDataPoint[];
}

export function PerformanceTrendChart({ data }: PerformanceTrendChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // SVG dimensions
  const width = 640;
  const height = 180;
  const paddingX = 40;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  // Min / max calculation for scale
  const minVal = 88;
  const maxVal = 100;
  const range = maxVal - minVal;

  const getX = (idx: number) => paddingX + (idx / (data.length - 1)) * chartWidth;
  const getY = (val: number) =>
    paddingTop + chartHeight - ((val - minVal) / range) * chartHeight;

  // Generate SVG path points for actual line
  const actualPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.actual) }));
  const targetPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.target) }));

  // Create smooth bezier curve
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const linePath = createSmoothPath(actualPoints);
  const targetPath = createSmoothPath(targetPoints);
  const areaPath = `${linePath} L ${actualPoints[actualPoints.length - 1].x} ${paddingTop + chartHeight} L ${actualPoints[0].x} ${paddingTop + chartHeight} Z`;

  const activePoint = hoveredIdx !== null ? data[hoveredIdx] : data[data.length - 1];
  const activeX = hoveredIdx !== null ? getX(hoveredIdx) : getX(data.length - 1);
  const activeY = hoveredIdx !== null ? getY(activePoint.actual) : getY(activePoint.actual);

  return (
    <div className="apple-chart-card bg-white border border-[#E5E5EA] rounded-[18px] p-5 shadow-sm hover:border-[#D2D2D7] transition-all flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F2F2F7]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#1D1D1F] tracking-tight">
              Overall Performance Trends
            </h3>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#E8F2FE] text-[#0071E3] border border-[#B2D7FD]">
              Live 96.4%
            </span>
          </div>
          <p className="text-xs text-[#6E6E73] mt-0.5">
            Operational efficiency index vs 92.0% enterprise baseline
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0071E3]"></span>
            <span className="text-[#1D1D1F] font-medium">Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#86868B] border-t border-dashed"></span>
            <span className="text-[#86868B]">Target Baseline</span>
          </div>
        </div>
      </div>

      {/* Metric Quick Bar */}
      <div className="grid grid-cols-3 gap-2 py-3 border-b border-[#F2F2F7] text-center sm:text-left">
        <div>
          <div className="text-[11px] text-[#86868B]">Current Index</div>
          <div className="text-base font-bold text-[#1D1D1F]">{activePoint.actual}%</div>
        </div>
        <div>
          <div className="text-[11px] text-[#86868B]">Period Average</div>
          <div className="text-base font-bold text-[#1D1D1F]">94.5%</div>
        </div>
        <div>
          <div className="text-[11px] text-[#86868B]">SLA Benchmark</div>
          <div className="text-base font-bold text-[#34C759]">92.0% Met</div>
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="relative w-full mt-2">
        <svg
          className="w-full h-auto overflow-visible select-none"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
        >
          <defs>
            {/* Apple Blue Area Gradient */}
            <linearGradient id="appleBlueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0071E3" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0071E3" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[90, 95, 100].map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#EBEBF0"
                  strokeWidth="1"
                  strokeDasharray={val === 90 ? "3 3" : undefined}
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#86868B"
                  fontFamily="Inter, -apple-system, sans-serif"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#appleBlueGradient)" />

          {/* Target Baseline (Dashed) */}
          <path
            d={targetPath}
            fill="none"
            stroke="#86868B"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Primary Trend Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#0071E3"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points & Hover Targets */}
          {data.map((d, idx) => {
            const x = getX(idx);
            const y = getY(d.actual);
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={d.date}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Vertical guideline on hover */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={paddingTop + chartHeight}
                    stroke="#0071E3"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* X Axis Label */}
                <text
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fill={isHovered ? "#0071E3" : "#86868B"}
                  fontWeight={isHovered ? "600" : "400"}
                >
                  {d.date}
                </text>

                {/* Visible Point Dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 5 : 3.5}
                  fill="#FFFFFF"
                  stroke="#0071E3"
                  strokeWidth={isHovered ? 2.5 : 2}
                  className="transition-all duration-150"
                />

                {/* Transparent hit area */}
                <rect
                  x={x - 20}
                  y={0}
                  width="40"
                  height={height}
                  fill="transparent"
                />
              </g>
            );
          })}
        </svg>

        {/* Dynamic Tooltip Pill */}
        <div className="flex items-center justify-between text-xs text-[#6E6E73] mt-2 pt-2 border-t border-[#F2F2F7]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]"></span>
            Active Date: <strong className="text-[#1D1D1F]">{activePoint.date}</strong>
          </span>
          <span>
            Performance Score: <strong className="text-[#0071E3]">{activePoint.actual}%</strong>
          </span>
          <span className="hidden sm:inline">
            Target Diff: <strong className="text-[#34C759]">+{Math.round((activePoint.actual - activePoint.target) * 10) / 10}%</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

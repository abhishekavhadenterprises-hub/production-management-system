import React, { useState } from "react";
import { LineSeries } from "@/lib/types";

interface AppleLineChartProps {
  title: string;
  modulePath?: string;
  periodText?: string;
  metricValue?: string;
  metricLabel?: string;
  series: LineSeries[];
  dates: string[];
  yAxisLabels: string[];
  maxY?: number;
  minY?: number;
  referenceLines?: { value: number; label?: string }[];
  height?: number;
  isSampleData?: boolean;
}

export function AppleLineChart({
  title,
  modulePath,
  periodText = "Last Week",
  metricValue,
  metricLabel,
  series,
  dates,
  yAxisLabels,
  maxY = 100,
  minY = 0,
  referenceLines,
  height = 140,
  isSampleData = true,
}: AppleLineChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const svgWidth = 400;
  const svgHeight = height;
  const paddingX = 15;
  const paddingTop = 12;
  const paddingBottom = 22;

  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingTop - paddingBottom;
  const range = maxY - minY || 1;

  const getX = (idx: number) => paddingX + (idx / (dates.length - 1)) * chartW;
  const getY = (val: number) => paddingTop + chartH - ((val - minY) / range) * chartH;

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

          <div className="flex items-center gap-1.5 text-[11px] text-[#86868B] shrink-0">
            <span className="text-[#86868B] py-0.5 px-1 rounded flex items-center gap-1">
              <span>{periodText}</span>
              <svg className="w-2.5 h-2.5 opacity-70" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <button className="hover:text-[#1D1D1F] p-0.5 rounded transition-colors" title="Options">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="3" cy="8" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="13" cy="8" r="1.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Optional Big KPI */}
        {metricValue && (
          <div className="mt-2.5 mb-2">
            <div className="text-[28px] sm:text-[32px] font-bold text-[#1D1D1F] tracking-tight leading-none">
              {metricValue}
            </div>
            {metricLabel && (
              <div className="text-[11px] text-[#86868B] mt-1 font-medium">
                {metricLabel}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Line Chart Graphics */}
      <div className="relative mt-2">
        <div className="flex">
          {/* Main SVG Area */}
          <div className="flex-1 relative">
            {/* Smooth Floating Tooltip on Hover */}
            {hoveredIdx !== null && (
              <div
                className="absolute -top-6 px-2 py-0.5 bg-[#1D1D1F] text-white text-[10px] rounded shadow-md pointer-events-none z-20 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 transition-all flex items-center gap-1.5"
                style={{
                  left: `${(getX(hoveredIdx) / svgWidth) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <span className="font-semibold text-white/90">{dates[hoveredIdx]}</span>
                {series.map((s) => (
                  <span key={s.id} className="font-mono text-[9.5px]">
                    {s.label ? `${s.label}: ` : ""}{s.data[hoveredIdx]}
                  </span>
                ))}
              </div>
            )}

            <svg
              className="w-full h-auto overflow-visible select-none"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                {series.map((s) => (
                  <linearGradient
                    key={`grad-${s.id}`}
                    id={`grad-${s.id}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={s.color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={s.color} stopOpacity="0.0" />
                  </linearGradient>
                ))}
              </defs>

              {/* Horizontal Subtle Gridlines */}
              {yAxisLabels.map((_, i) => {
                const y = paddingTop + (i / (yAxisLabels.length - 1)) * chartH;
                return (
                  <line
                    key={i}
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#EBEBF0"
                    strokeWidth="1"
                    strokeDasharray={i === yAxisLabels.length - 1 ? undefined : "3 3"}
                  />
                );
              })}

              {/* Reference Threshold Lines */}
              {referenceLines?.map((ref, idx) => {
                const y = getY(ref.value);
                return (
                  <line
                    key={idx}
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#8E8E93"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Render Series (Area + Lines) */}
              {series.map((s) => {
                const points = s.data.map((val: number, idx: number) => ({
                  x: getX(idx),
                  y: getY(val),
                }));
                const lineD = createSmoothPath(points);

                if (s.isArea) {
                  const areaD = `${lineD} L ${points[points.length - 1].x} ${
                    paddingTop + chartH
                  } L ${points[0].x} ${paddingTop + chartH} Z`;
                  return (
                    <g key={s.id}>
                      <path d={areaD} fill={`url(#grad-${s.id})`} className="transition-all duration-300" />
                      <path
                        d={lineD}
                        fill="none"
                        stroke={s.color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-300"
                      />
                    </g>
                  );
                }

                return (
                  <path
                    key={s.id}
                    d={lineD}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />
                );
              })}

              {/* Vertical Guide Line and Data Points on Hover */}
              {hoveredIdx !== null && (
                <g className="transition-opacity duration-150 pointer-events-none">
                  <line
                    x1={getX(hoveredIdx)}
                    y1={paddingTop}
                    x2={getX(hoveredIdx)}
                    y2={paddingTop + chartH}
                    stroke="#007AFF"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    opacity="0.8"
                  />
                  {series.map((s) => (
                    <circle
                      key={`point-${s.id}`}
                      cx={getX(hoveredIdx)}
                      cy={getY(s.data[hoveredIdx])}
                      r="4"
                      fill="#FFFFFF"
                      stroke={s.color}
                      strokeWidth="2.5"
                      className="transition-all duration-150"
                    />
                  ))}
                </g>
              )}

              {/* Invisible interactive hover columns */}
              {dates.map((_, idx) => {
                const x = getX(idx);
                const colWidth = chartW / dates.length;
                return (
                  <rect
                    key={`hover-zone-${idx}`}
                    x={x - colWidth / 2}
                    y={paddingTop}
                    width={colWidth}
                    height={chartH}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                );
              })}

              {/* X-Axis Tick Labels */}
              {dates.map((d, idx) => {
                const x = getX(idx);
                const isHovered = hoveredIdx === idx;
                return (
                  <text
                    key={idx}
                    x={x}
                    y={svgHeight - 4}
                    textAnchor="middle"
                    fontSize="9.5"
                    fill={isHovered ? "#007AFF" : "#86868B"}
                    fontWeight={isHovered ? "600" : "400"}
                  >
                    {d}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Right Y-Axis Scale Labels */}
          <div className="w-14 flex flex-col justify-between text-right pl-2 pb-6 text-[9.5px] font-mono text-[#86868B] select-none h-32">
            {yAxisLabels.map((label, idx) => (
              <span key={idx} className="leading-none">
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Legend at bottom if multiple series */}
        {series.length > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2 text-[10px] font-medium text-[#1D1D1F]">
            {series.map((s) => (
              <div key={s.id} className="flex items-center gap-1">
                <span
                  style={{ backgroundColor: s.color }}
                  className="w-2 h-2 rounded-full"
                />
                <span className="text-[#6E6E73] font-mono">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

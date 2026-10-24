import React from "react";

interface AppleStatTileProps {
  title: string;
  modulePath?: string;
  value: string;
  changeText?: string;
  changeType?: "up" | "down" | "neutral";
  sublabel?: string;
  hasFillGradient?: boolean;
  sparklineData?: number[];
  isSampleData?: boolean;
}

export function AppleStatTile({
  title,
  modulePath,
  value,
  changeText,
  changeType = "up",
  sublabel = "Latest",
  hasFillGradient = false,
  sparklineData,
  isSampleData = true,
}: AppleStatTileProps) {
  return (
    <div className="apple-ref-card relative overflow-hidden bg-white border border-[#E5E5EA] rounded-[16px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#D2D2D7] transition-all flex flex-col justify-between h-full group">
      {/* Subtle Bottom Blue Gradient Fill if requested */}
      {hasFillGradient && (
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#007AFF]/10 to-transparent pointer-events-none" />
      )}

      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-[13px] font-semibold text-[#1D1D1F] tracking-tight truncate">
                {title}
              </h3>
              {isSampleData && (
                <span className="text-[9px] font-medium px-1 rounded bg-[#F2F2F7] text-[#86868B]">
                  Sample
                </span>
              )}
            </div>
            {modulePath && (
              <p className="text-[9.5px] text-[#86868B] font-mono tracking-tight truncate mt-0.5">
                {modulePath}
              </p>
            )}
          </div>

          <button className="text-[#86868B] hover:text-[#1D1D1F] p-0.5 rounded transition-colors" title="Options">
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="3" cy="8" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="13" cy="8" r="1.5" />
            </svg>
          </button>
        </div>

        {/* Big Value */}
        <div className="mt-2.5">
          <div className="text-[26px] sm:text-[28px] font-bold text-[#1D1D1F] tracking-tight leading-none">
            {value}
          </div>
        </div>
      </div>

      {/* Footer Indicator / Sparkline */}
      <div className="mt-3 pt-1 flex items-center justify-between text-[11px] text-[#86868B] relative z-10">
        <div className="flex items-center gap-1.5 font-medium">
          {changeText && (
            <span className="flex items-center gap-1 text-[#1D1D1F]">
              {changeType === "up" && (
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#E5E5EA] text-[#1D1D1F] text-[9px]">
                  ↗
                </span>
              )}
              {changeType === "neutral" && (
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#E5E5EA] text-[#1D1D1F] text-[9px]">
                  →
                </span>
              )}
              {changeType === "down" && (
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#E5E5EA] text-[#1D1D1F] text-[9px]">
                  ↘
                </span>
              )}
              <span>{changeText}</span>
            </span>
          )}
          {sublabel && <span className="text-[#86868B]">{sublabel}</span>}
        </div>

        {/* Sparkline if provided */}
        {sparklineData && sparklineData.length > 1 && (
          <div className="w-16 h-4 opacity-75 group-hover:opacity-100 transition-opacity">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 60 16">
              <polyline
                fill="none"
                stroke="#007AFF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sparklineData
                  .map((v, i) => {
                    const min = Math.min(...sparklineData);
                    const max = Math.max(...sparklineData);
                    const range = max - min || 1;
                    const x = (i / (sparklineData.length - 1)) * 60;
                    const y = 14 - ((v - min) / range) * 12;
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

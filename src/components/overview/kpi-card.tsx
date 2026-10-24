import React from "react";
import {
  Users,
  Briefcase,
  Clock,
  AlertCircle,
  CheckCircle2,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { KpiMetric } from "@/lib/types";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  metric: KpiMetric;
}

export function KpiCard({ metric }: KpiCardProps) {
  // Map icon string to Lucide component
  const getIcon = (name: string) => {
    switch (name) {
      case "Users":
        return <Users className="w-4 h-4 text-[#0071E3]" />;
      case "Briefcase":
        return <Briefcase className="w-4 h-4 text-[#0071E3]" />;
      case "Clock":
        return <Clock className="w-4 h-4 text-[#FF9500]" />;
      case "AlertCircle":
        return <AlertCircle className="w-4 h-4 text-[#FF3B30]" />;
      case "CheckCircle2":
        return <CheckCircle2 className="w-4 h-4 text-[#34C759]" />;
      case "Activity":
      default:
        return <Activity className="w-4 h-4 text-[#0071E3]" />;
    }
  };

  // Generate subtle sparkline SVG path
  const minVal = Math.min(...metric.trendData);
  const maxVal = Math.max(...metric.trendData);
  const range = maxVal - minVal || 1;
  const points = metric.trendData
    .map((val, idx) => {
      const x = (idx / (metric.trendData.length - 1)) * 64;
      const y = 20 - ((val - minVal) / range) * 16;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="apple-kpi-card bg-white border border-[#E5E5EA] rounded-[16px] p-4 shadow-sm hover:border-[#D2D2D7] hover:shadow-apple-hover transition-all duration-200 flex flex-col justify-between group">
      {/* Top Header: Title & Minimal Icon */}
      <div className="apple-kpi-header flex items-center justify-between">
        <span className="apple-kpi-title text-xs font-medium text-[#6E6E73] truncate">
          {metric.title}
        </span>
        <div className="apple-kpi-icon-wrapper p-1.5 rounded-lg bg-[#F5F5F7] group-hover:bg-[#E8F2FE] transition-colors">
          {getIcon(metric.icon)}
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="apple-kpi-body my-2 flex items-baseline justify-between">
        <span className="apple-kpi-value text-2xl font-bold tracking-tight text-[#1D1D1F]">
          {metric.value}
        </span>

        {/* Mini Sparkline */}
        <div className="apple-kpi-sparkline w-16 h-5 opacity-70 group-hover:opacity-100 transition-opacity">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 64 20">
            <polyline
              fill="none"
              stroke={metric.isPositive ? "#0071E3" : "#86868B"}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>

      {/* Footer: Trend and Context */}
      <div className="apple-kpi-footer flex items-center justify-between pt-1 border-t border-[#F2F2F7]">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "apple-kpi-badge inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full",
              metric.isPositive
                ? "bg-[#EAF8EF] text-[#1E823B]"
                : "bg-[#FFF6E9] text-[#A65F00]"
            )}
          >
            {metric.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {metric.change}
          </span>
        </div>
        <span className="apple-kpi-subtitle text-[11px] text-[#86868B] truncate max-w-[130px]">
          {metric.subtitle}
        </span>
      </div>
    </div>
  );
}

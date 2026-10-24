import React from "react";
import { TaskCompletionMetric } from "@/lib/types";
import { CheckCircle2, Clock } from "lucide-react";

interface TaskCompletionChartProps {
  data: TaskCompletionMetric[];
}

export function TaskCompletionChart({ data }: TaskCompletionChartProps) {
  const totalCompleted = data.reduce((acc, curr) => acc + curr.completed, 0);
  const totalPending = data.reduce((acc, curr) => acc + curr.pending, 0);
  const overallRate = Math.round((totalCompleted / (totalCompleted + totalPending)) * 1000) / 10;

  const maxTotal = Math.max(...data.map((d) => d.completed + d.pending));

  return (
    <div className="apple-chart-card bg-white border border-[#E5E5EA] rounded-[18px] p-5 shadow-sm hover:border-[#D2D2D7] transition-all flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F2F2F7]">
        <div>
          <h3 className="text-sm font-semibold text-[#1D1D1F] tracking-tight">
            Task Completion & Throughput
          </h3>
          <p className="text-xs text-[#6E6E73] mt-0.5">
            Daily throughput comparison across 7 days
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-[#1D1D1F]">{overallRate}%</div>
          <div className="text-[10px] text-[#34C759] font-medium">Weekly SLA Met</div>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="pt-4 pb-2">
        <div className="grid grid-cols-7 gap-2.5 items-end h-32">
          {data.map((item) => {
            const completedHeight = (item.completed / maxTotal) * 100;
            const pendingHeight = (item.pending / maxTotal) * 100;

            return (
              <div
                key={item.day}
                className="flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                {/* Value Hover Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 text-[10px] font-semibold text-[#1D1D1F] bg-[#F5F5F7] px-1.5 py-0.5 rounded shadow-sm">
                  {item.completed}
                </div>

                {/* Stacked Vertical Bar */}
                <div className="w-full max-w-[28px] flex flex-col justify-end rounded-t-md overflow-hidden bg-[#F2F2F7]">
                  {/* Pending segment (Amber) */}
                  <div
                    style={{ height: `${pendingHeight}%` }}
                    className="w-full bg-[#FF9500]/70 group-hover:bg-[#FF9500] transition-colors"
                  />
                  {/* Completed segment (Apple Blue) */}
                  <div
                    style={{ height: `${completedHeight}%` }}
                    className="w-full bg-[#0071E3] group-hover:bg-[#0058B3] transition-colors"
                  />
                </div>

                {/* Day label */}
                <span className="text-[11px] font-medium text-[#86868B] group-hover:text-[#1D1D1F] mt-2 transition-colors">
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Summary Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#F2F2F7] text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#0071E3]"></span>
            <span className="text-[#6E6E73]">Completed ({totalCompleted})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#FF9500]"></span>
            <span className="text-[#6E6E73]">Pending ({totalPending})</span>
          </div>
        </div>

        <span className="text-[11px] text-[#86868B]">
          Velocity: <strong className="text-[#1D1D1F]">337/day</strong>
        </span>
      </div>
    </div>
  );
}

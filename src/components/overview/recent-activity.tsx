import React from "react";
import { RecentActivityItem } from "@/lib/types";
import { CheckCircle2, ArrowUpRight, AlertCircle, Calendar, Wrench, Lightbulb, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
  activities: RecentActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getBadgeClass = (type: string) => {
    switch (type) {
      case "green":
        return "bg-[#EAF8EF] text-[#1E823B] border-[#C3EED3]";
      case "blue":
        return "bg-[#E8F2FE] text-[#007AFF] border-[#B2D7FD]";
      case "amber":
        return "bg-[#FFF6E9] text-[#A65F00] border-[#FDE0B6]";
      default:
        return "bg-[#F2F2F7] text-[#6E6E73] border-[#E5E5EA]";
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case "meetings":
        return <Calendar className="w-3.5 h-3.5 text-[#007AFF]" />;
      case "kaizen":
        return <Lightbulb className="w-3.5 h-3.5 text-[#FF9500]" />;
      case "complaints":
        return <AlertCircle className="w-3.5 h-3.5 text-[#FF3B30]" />;
      case "maintenance":
        return <Wrench className="w-3.5 h-3.5 text-[#6E6E73]" />;
      case "quality":
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#007AFF]" />;
    }
  };

  return (
    <div className="apple-ref-card bg-white border border-[#E5E5EA] rounded-[16px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#D2D2D7] transition-all flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#F2F2F7]">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-[13.5px] font-semibold text-[#1D1D1F] tracking-tight">
                Recent Enterprise Activity & MOM Audit Log
              </h3>
              <span className="text-[9.5px] font-medium px-1.5 py-0.2 rounded bg-[#F2F2F7] text-[#86868B]">
                Sample Log
              </span>
            </div>
            <p className="text-[10.5px] text-[#86868B] font-mono tracking-tight mt-0.5">
              module: operations.audit-feed (sample)
            </p>
          </div>
          <span className="text-xs text-[#007AFF] font-medium hover:underline cursor-pointer">
            View All Logs
          </span>
        </div>

        {/* Activity Feed Items */}
        <div className="divide-y divide-[#F2F2F7] py-1">
          {activities.map((act) => (
            <div
              key={act.id}
              className="py-3 flex items-start justify-between gap-3 group hover:bg-[#FAFAFC] px-2 -mx-2 rounded-xl transition-colors cursor-pointer"
            >
              {/* User Avatar Initials */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F5F5F7] border border-[#E5E5EA] text-[#1D1D1F] font-semibold text-xs flex items-center justify-center shrink-0 group-hover:border-[#007AFF]/40 transition-colors">
                  {act.user.initials}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-[#1D1D1F] group-hover:text-[#007AFF] transition-colors">
                      {act.title}
                    </span>
                    <span
                      className={cn(
                        "border text-[9.5px] font-medium px-1.5 py-0.2 rounded-full",
                        getBadgeClass(act.badge.type)
                      )}
                    >
                      {act.badge.label}
                    </span>
                  </div>

                  <p className="text-xs text-[#6E6E73] line-clamp-1">
                    {act.description}
                  </p>

                  <div className="flex items-center gap-2 text-[10.5px] text-[#86868B] pt-0.5">
                    <span>{act.user.name}</span>
                    <span>•</span>
                    <span>{act.user.department}</span>
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <span className="text-[10.5px] text-[#86868B] whitespace-nowrap shrink-0 mt-0.5">
                {act.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-[#F2F2F7] flex items-center justify-between text-[11px] text-[#86868B]">
        <span>Illustrative records from MOM, Kaizen, Quality & Maintenance</span>
        <span className="flex items-center gap-1 text-[#34C759]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]"></span>
          Sample Stream
        </span>
      </div>
    </div>
  );
}

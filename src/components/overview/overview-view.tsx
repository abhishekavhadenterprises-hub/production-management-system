import React, { useState } from "react";
import { Header } from "@/components/layout/header";
import { AppleBarChart } from "./apple-bar-chart";
import { AppleLineChart } from "./apple-line-chart";
import { AppleDonutChart } from "./apple-donut-chart";
import { AppleStatTile } from "./apple-stat-tile";
import { RecentActivity } from "./recent-activity";
import { OperationalSummary } from "./operational-summary";
import {
  SAMPLE_TASK_BARS,
  SAMPLE_PENDING_BARS,
  SAMPLE_COMPLAINT_RATE,
  SAMPLE_LATENCY,
  SAMPLE_PRODUCTION_VOLUME,
  SAMPLE_ENTERPRISE_ACTIVITIES,
  SAMPLE_OPERATIONAL_FOCUS,
} from "@/lib/mock-data";
import { ReportingPeriod } from "@/lib/types";
import { Info, ShieldAlert } from "lucide-react";

export function OverviewView() {
  const [period, setPeriod] = useState<ReportingPeriod>("30d");

  // Dynamic datasets mapped by reporting period
  const taskBars = SAMPLE_TASK_BARS[period];
  const pendingBars = SAMPLE_PENDING_BARS[period];
  const complaintData = SAMPLE_COMPLAINT_RATE[period];
  const latencyData = SAMPLE_LATENCY[period];
  const productionData = SAMPLE_PRODUCTION_VOLUME[period];

  const periodLabels: Record<ReportingPeriod, string> = {
    today: "Today",
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    quarter: "This Quarter",
    ytd: "Year to Date",
  };

  return (
    <div className="apple-overview-page min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      {/* Top Header with J Pan branding, sample data badge, and period selector */}
      <Header period={period} onPeriodChange={setPeriod} />

      {/* Main Grid: Exact 3-column modular layout from reference screenshot */}
      <main className="px-4 sm:px-8 py-6 space-y-6 max-w-[1720px] mx-auto">
        {/* ROW 1: Completed Tasks & Roles (Blue Bars), Pending Tasks (Red Bars), and Right Column (Complaints & SLA Latency) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Card 1: Completed Tasks & Daily Roles (Mapped from Requests blue bars) */}
          <div className="lg:col-span-5 flex flex-col animate-dashboard-item delay-1">
            <AppleBarChart
              title="Completed Tasks & Daily Roles"
              modulePath="module: tasks.daily-roles (sample)"
              periodText={periodLabels[period]}
              metricValue="1,842"
              metricLabel="Total Tasks Completed (Illustrative Sample)"
              color="blue"
              data={taskBars}
              yAxisLabels={["6.0K", "4.0K", "2.0K", "0"]}
              maxY={6}
              isSampleData={true}
            />
          </div>

          {/* Card 2: Pending Tasks & Backlog (Mapped from Errors by Database red bars) */}
          <div className="lg:col-span-4 flex flex-col animate-dashboard-item delay-2">
            <AppleBarChart
              title="Pending Tasks & Issue Backlog"
              modulePath="module: quality.task-backlog (sample)"
              periodText={periodLabels[period]}
              metricValue="158"
              metricLabel="Average Active Pending (Illustrative Sample)"
              color="red"
              data={pendingBars}
              yAxisLabels={["200", "150", "100", "50", "0"]}
              maxY={200}
              legend={[
                { label: "ROUTINE", color: "#FF3B30" },
                { label: "URGENT / MOM", color: "#8E8E93" },
              ]}
              isSampleData={true}
            />
          </div>

          {/* Card 3: Right Stack: Customer Complaint Rate & Task SLA Latency */}
          <div className="lg:col-span-3 flex flex-col gap-5 animate-dashboard-item delay-3">
            {/* Customer Complaint Rate Card (Mapped from Error Rate) */}
            <div className="flex-1">
              <AppleLineChart
                title="Customer Complaint Rate"
                modulePath="module: complaints.sla-rate (sample)"
                periodText={periodLabels[period]}
                series={complaintData.series}
                dates={complaintData.dates}
                yAxisLabels={complaintData.yLabels}
                maxY={complaintData.maxY}
                minY={0}
                height={110}
                isSampleData={true}
              />
            </div>

            {/* Task Verification Latency Card (Mapped from Latency) */}
            <div className="flex-1">
              <AppleLineChart
                title="Task Verification SLA Latency"
                modulePath="module: operations.sla-turnaround (sample)"
                periodText={periodLabels[period]}
                series={latencyData.series}
                dates={latencyData.dates}
                yAxisLabels={latencyData.yLabels}
                maxY={latencyData.maxY}
                minY={0}
                referenceLines={[{ value: 100 }, { value: 50 }]}
                height={110}
                isSampleData={true}
              />
            </div>
          </div>
        </div>

        {/* ROW 2: Production Volume Line Chart, Quality & Project Gauges, and 2x2 Metric Tiles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Card 4: Mill Production Volume (Mapped from Bandwidth blue curve) */}
          <div className="lg:col-span-5 flex flex-col animate-dashboard-item delay-4">
            <AppleLineChart
              title="Mill Production & Output Volume"
              modulePath="module: manufacturing.tonnage (sample)"
              periodText={periodLabels[period]}
              metricValue={productionData.value}
              metricLabel="Total Tonnage Output (Illustrative Sample)"
              series={productionData.series}
              dates={productionData.dates}
              yAxisLabels={productionData.yLabels}
              maxY={productionData.maxY}
              minY={0}
              height={140}
              isSampleData={true}
            />
          </div>

          {/* Card 5: Circular Gauges: Project Portfolio & Ultrasonic Testing */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-dashboard-item delay-5">
            <AppleDonutChart
              title="Project Status Distribution"
              modulePath="module: projects.status (sample)"
              percentage={71}
              label="71.4%"
              sublabel="On Schedule"
              color="#D1D1D6"
              size={110}
              footerLabel="Active PMO Projects"
              footerValue="42 Projects (Sample)"
              isSampleData={true}
            />
            <AppleDonutChart
              title="Ultrasonic Inspection Pass Rate"
              modulePath="module: quality.ultrasonic (sample)"
              percentage={98}
              label="98.2%"
              sublabel="API-5CT Cleared"
              color="#007AFF"
              size={110}
              footerLabel="QC Verification"
              footerValue="Zero Rejection"
              isSampleData={true}
            />
          </div>

          {/* Card 6: 2x2 Compact Metric Tiles (Mapped from Metadata, Asset, Devices, Users) */}
          <div className="lg:col-span-3 grid grid-cols-2 gap-3.5 animate-dashboard-item delay-6">
            {/* Tile 1: Total Employees (HR & Workforce Directory) */}
            <AppleStatTile
              title="Total Employees"
              modulePath="module: hr.roster"
              value="1,284"
              changeText="4.2%"
              changeType="up"
              sublabel="Sample"
              hasFillGradient={true}
              isSampleData={true}
            />

            {/* Tile 2: Active Projects (PMO) */}
            <AppleStatTile
              title="Active Projects"
              modulePath="module: projects.pmo"
              value="42"
              changeText="0.0%"
              changeType="neutral"
              sublabel="Sample"
              isSampleData={true}
            />

            {/* Tile 3: Open Complaints (Client Services) */}
            <AppleStatTile
              title="Open Complaints"
              modulePath="module: complaints.queue"
              value="7"
              sublabel="Sample (Avg 3.8h)"
              isSampleData={true}
            />

            {/* Tile 4: Overall Performance (Operations Index) with Sparkline */}
            <AppleStatTile
              title="Overall Performance"
              modulePath="module: operations.kpi"
              value="96.4%"
              changeText="1.8%"
              changeType="up"
              sublabel="Sample"
              sparklineData={[91, 92.5, 93.8, 94.2, 95.0, 95.8, 96.4]}
              isSampleData={true}
            />
          </div>
        </div>

        {/* ROW 3: J Pan Tubular Operational Feeds (Recent Activity, MOM Actions, Kaizen, Maintenance) */}
        <div className="pt-2 animate-dashboard-item delay-7">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight">
                J Pan Tubular Enterprise Operations & Verification Stream
              </h2>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#EBEBF0] text-[#6E6E73] border border-[#D1D1D6]">
                Sample Log
              </span>
            </div>
            <span className="text-xs text-[#007AFF] font-medium hover:underline cursor-pointer">
              Export Audit Trail
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6">
              <RecentActivity activities={SAMPLE_ENTERPRISE_ACTIVITIES} />
            </div>
            <div className="lg:col-span-6">
              <OperationalSummary items={SAMPLE_OPERATIONAL_FOCUS} />
            </div>
          </div>
        </div>

        {/* Prominent Sample Data Transparency Disclosure Notice */}
        <div className="p-3.5 rounded-[14px] bg-white border border-[#E5E5EA] shadow-sm flex items-start sm:items-center justify-between gap-3 text-xs text-[#6E6E73] animate-dashboard-item delay-8">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#E8F2FE] text-[#007AFF] shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-[#1D1D1F]">
                Illustrative Sample Data Mode
              </span>
              <span className="mx-1.5 text-[#D1D1D6]">|</span>
              <span>
                All employee numbers, mill output tonnage, project totals, and performance percentages displayed on this overview are illustrative demonstration records. No production database connection is configured.
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-[#86868B] shrink-0 hidden md:inline">
            J Pan Tubular UI v2.4
          </span>
        </div>
      </main>
    </div>
  );
}

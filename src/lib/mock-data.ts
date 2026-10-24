import {
  KpiMetric,
  BarDataPoint,
  LineSeries,
  RecentActivityItem,
  OperationalSummaryItem,
  ReportingPeriod,
} from "./types";

/**
 * NOTE: The following datasets represent illustrative sample data for demonstration of the
 * J Pan Tubular Enterprise Operations & Management dashboard interface.
 * No live database connection is configured for this standalone UI project.
 */
export const IS_SAMPLE_DATA = true;

// 1. Task Throughput Bar Data (Mapped from "Requests" blue bars in reference)
export const SAMPLE_TASK_BARS: Record<ReportingPeriod, BarDataPoint[]> = {
  "30d": [
    { date: "", value: 1.2 },
    { date: "Oct 1", value: 2.1 },
    { date: "", value: 2.5 },
    { date: "", value: 3.8 },
    { date: "Oct 5", value: 4.8 },
    { date: "", value: 5.1 },
    { date: "", value: 4.9 },
    { date: "Oct 9", value: 4.2 },
    { date: "", value: 3.9 },
    { date: "", value: 3.5 },
    { date: "Oct 13", value: 4.1 },
    { date: "", value: 4.2 },
    { date: "", value: 3.7 },
    { date: "", value: 2.4 },
    { date: "Oct 17", isKeyDate: true, value: 5.4 },
    { date: "", value: 4.8 },
    { date: "Oct 20", value: 3.2 },
    { date: "", value: 1.8 },
    { date: "Oct 23", value: 2.1 },
  ],
  "7d": [
    { date: "Oct 17", isKeyDate: true, value: 5.4 },
    { date: "Oct 18", value: 4.8 },
    { date: "Oct 19", value: 4.2 },
    { date: "Oct 20", value: 3.2 },
    { date: "Oct 21", value: 3.9 },
    { date: "Oct 22", value: 4.5 },
    { date: "Oct 23", value: 4.9 },
  ],
  "today": [
    { date: "08:00", value: 12 },
    { date: "10:00", value: 28 },
    { date: "12:00", value: 45 },
    { date: "14:00", value: 62 },
    { date: "16:00", value: 78 },
    { date: "18:00", isKeyDate: true, value: 94 },
  ],
  "quarter": [
    { date: "Aug W1", value: 320 },
    { date: "Aug W3", value: 410 },
    { date: "Sep W1", value: 390 },
    { date: "Sep W3", value: 450 },
    { date: "Oct W1", isKeyDate: true, value: 480 },
    { date: "Oct W3", value: 512 },
  ],
  "ytd": [
    { date: "Jan", value: 1200 },
    { date: "Mar", value: 1450 },
    { date: "May", value: 1680 },
    { date: "Jul", value: 1720 },
    { date: "Sep", value: 1840 },
    { date: "Oct", isKeyDate: true, value: 1910 },
  ],
};

// 2. Pending Tasks & Backlog Bar Data (Mapped from "Errors by Database" red bars in reference)
export const SAMPLE_PENDING_BARS: Record<ReportingPeriod, BarDataPoint[]> = {
  "30d": [
    { date: "", value: 120 },
    { date: "Oct 1", value: 70 },
    { date: "", value: 72 },
    { date: "", value: 150 },
    { date: "Oct 5", value: 178 },
    { date: "", value: 140 },
    { date: "", value: 45 },
    { date: "Oct 9", value: 65 },
    { date: "", value: 95 },
    { date: "", value: 105 },
    { date: "Oct 13", value: 88 },
    { date: "", value: 130 },
    { date: "", value: 110 },
    { date: "", value: 60 },
    { date: "Oct 17", isKeyDate: true, value: 85 },
    { date: "", value: 75 },
    { date: "Oct 20", value: 145 },
    { date: "", value: 40 },
    { date: "Oct 23", value: 125 },
  ],
  "7d": [
    { date: "Oct 17", isKeyDate: true, value: 85 },
    { date: "Oct 18", value: 75 },
    { date: "Oct 19", value: 90 },
    { date: "Oct 20", value: 145 },
    { date: "Oct 21", value: 110 },
    { date: "Oct 22", value: 95 },
    { date: "Oct 23", value: 82 },
  ],
  "today": [
    { date: "08:00", value: 18 },
    { date: "10:00", value: 24 },
    { date: "12:00", value: 20 },
    { date: "14:00", value: 15 },
    { date: "16:00", value: 12 },
    { date: "18:00", isKeyDate: true, value: 8 },
  ],
  "quarter": [
    { date: "Aug W1", value: 180 },
    { date: "Aug W3", value: 160 },
    { date: "Sep W1", value: 140 },
    { date: "Sep W3", value: 120 },
    { date: "Oct W1", isKeyDate: true, value: 95 },
    { date: "Oct W3", value: 82 },
  ],
  "ytd": [
    { date: "Jan", value: 340 },
    { date: "Mar", value: 290 },
    { date: "May", value: 240 },
    { date: "Jul", value: 190 },
    { date: "Sep", value: 150 },
    { date: "Oct", isKeyDate: true, value: 82 },
  ],
};

// 3. Customer Complaint Rate Area Chart (Mapped from "Error Rate" in reference)
export const SAMPLE_COMPLAINT_RATE: Record<
  ReportingPeriod,
  { dates: string[]; series: LineSeries[]; yLabels: string[]; maxY: number }
> = {
  "30d": {
    dates: ["Sep 25", "Oct 1", "Oct 7", "Oct 13", "Oct 19", "Oct 23"],
    series: [
      {
        id: "complaint-rate",
        label: "Complaint Rate",
        color: "#FF3B30",
        data: [0.004, 0.003, 0.005, 0.012, 0.008, 0.004],
        isArea: true,
      },
    ],
    yLabels: ["0.02%", "0.01%", "0.01%", "0.0%"],
    maxY: 0.02,
  },
  "7d": {
    dates: ["Oct 17", "Oct 18", "Oct 19", "Oct 20", "Oct 21", "Oct 22", "Oct 23"],
    series: [
      {
        id: "complaint-rate",
        label: "Complaint Rate",
        color: "#FF3B30",
        data: [0.002, 0.002, 0.003, 0.015, 0.018, 0.014, 0.009],
        isArea: true,
      },
    ],
    yLabels: ["0.02%", "0.01%", "0.01%", "0.0%"],
    maxY: 0.02,
  },
  "today": {
    dates: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"],
    series: [
      {
        id: "complaint-rate",
        label: "Complaint Rate",
        color: "#FF3B30",
        data: [0.001, 0.001, 0.002, 0.002, 0.001, 0.001],
        isArea: true,
      },
    ],
    yLabels: ["0.01%", "0.005%", "0.0%"],
    maxY: 0.01,
  },
  "quarter": {
    dates: ["Aug", "Sep", "Oct"],
    series: [
      {
        id: "complaint-rate",
        label: "Complaint Rate",
        color: "#FF3B30",
        data: [0.012, 0.008, 0.004],
        isArea: true,
      },
    ],
    yLabels: ["0.02%", "0.01%", "0.0%"],
    maxY: 0.02,
  },
  "ytd": {
    dates: ["Q1", "Q2", "Q3", "Q4"],
    series: [
      {
        id: "complaint-rate",
        label: "Complaint Rate",
        color: "#FF3B30",
        data: [0.018, 0.014, 0.008, 0.004],
        isArea: true,
      },
    ],
    yLabels: ["0.02%", "0.01%", "0.0%"],
    maxY: 0.02,
  },
};

// 4. Task Verification Latency Multi-Line Chart (Mapped from "Latency" in reference)
export const SAMPLE_LATENCY: Record<
  ReportingPeriod,
  { dates: string[]; series: LineSeries[]; yLabels: string[]; maxY: number }
> = {
  "30d": {
    dates: ["Sep 25", "Oct 1", "Oct 7", "Oct 13", "Oct 19", "Oct 23"],
    series: [
      { id: "p99", label: "p99", color: "#007AFF", data: [78, 80, 81, 82, 102, 110] },
      { id: "p90", label: "p90", color: "#34C759", data: [58, 59, 60, 60, 72, 73] },
      { id: "avg", label: "average", color: "#FF9500", data: [40, 41, 41, 42, 44, 43] },
      { id: "p50", label: "p50", color: "#FF3B30", data: [30, 31, 31, 32, 33, 33] },
    ],
    yLabels: ["150 hrs", "100 hrs", "50 hrs", "0 hrs"],
    maxY: 150,
  },
  "7d": {
    dates: ["Oct 17", "Oct 18", "Oct 19", "Oct 20", "Oct 21", "Oct 22", "Oct 23"],
    series: [
      { id: "p99", label: "p99", color: "#007AFF", data: [72, 75, 78, 85, 95, 92, 88] },
      { id: "p90", label: "p90", color: "#34C759", data: [52, 54, 56, 62, 65, 60, 58] },
      { id: "avg", label: "average", color: "#FF9500", data: [38, 39, 40, 42, 43, 41, 40] },
      { id: "p50", label: "p50", color: "#FF3B30", data: [26, 27, 28, 29, 30, 28, 27] },
    ],
    yLabels: ["120 hrs", "80 hrs", "40 hrs", "0 hrs"],
    maxY: 120,
  },
  "today": {
    dates: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"],
    series: [
      { id: "p99", label: "p99", color: "#007AFF", data: [45, 48, 52, 58, 62, 55] },
      { id: "p90", label: "p90", color: "#34C759", data: [32, 34, 38, 42, 44, 38] },
      { id: "avg", label: "average", color: "#FF9500", data: [22, 23, 25, 28, 29, 25] },
      { id: "p50", label: "p50", color: "#FF3B30", data: [15, 16, 17, 18, 19, 16] },
    ],
    yLabels: ["80 hrs", "50 hrs", "25 hrs", "0 hrs"],
    maxY: 80,
  },
  "quarter": {
    dates: ["Aug", "Sep", "Oct"],
    series: [
      { id: "p99", label: "p99", color: "#007AFF", data: [115, 105, 88] },
      { id: "p90", label: "p90", color: "#34C759", data: [80, 72, 58] },
      { id: "avg", label: "average", color: "#FF9500", data: [52, 46, 40] },
      { id: "p50", label: "p50", color: "#FF3B30", data: [38, 32, 27] },
    ],
    yLabels: ["150 hrs", "100 hrs", "50 hrs", "0 hrs"],
    maxY: 150,
  },
  "ytd": {
    dates: ["Q1", "Q2", "Q3", "Q4"],
    series: [
      { id: "p99", label: "p99", color: "#007AFF", data: [140, 125, 102, 88] },
      { id: "p90", label: "p90", color: "#34C759", data: [98, 88, 70, 58] },
      { id: "avg", label: "average", color: "#FF9500", data: [65, 58, 48, 40] },
      { id: "p50", label: "p50", color: "#FF3B30", data: [44, 40, 32, 27] },
    ],
    yLabels: ["160 hrs", "120 hrs", "80 hrs", "40 hrs"],
    maxY: 160,
  },
};

// 5. Mill Production Volume Line Chart (Mapped from "Bandwidth" in reference)
export const SAMPLE_PRODUCTION_VOLUME: Record<
  ReportingPeriod,
  { dates: string[]; series: LineSeries[]; yLabels: string[]; maxY: number; value: string }
> = {
  "30d": {
    dates: ["Sep 25", "Oct 1", "Oct 7", "Oct 13", "Oct 19", "Oct 23"],
    series: [
      {
        id: "volume",
        label: "Output (MT)",
        color: "#007AFF",
        data: [3.8, 3.2, 3.1, 4.8, 5.6, 5.0],
      },
    ],
    yLabels: ["8K MT", "6K MT", "4K MT", "2K MT", "0 MT"],
    maxY: 8,
    value: "2,940 MT",
  },
  "7d": {
    dates: ["Oct 17", "Oct 18", "Oct 19", "Oct 20", "Oct 21", "Oct 22", "Oct 23"],
    series: [
      {
        id: "volume",
        label: "Output (MT)",
        color: "#007AFF",
        data: [420, 440, 410, 460, 480, 450, 470],
      },
    ],
    yLabels: ["600 MT", "400 MT", "200 MT", "0 MT"],
    maxY: 600,
    value: "3,130 MT",
  },
  "today": {
    dates: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"],
    series: [
      {
        id: "volume",
        label: "Output (MT)",
        color: "#007AFF",
        data: [45, 95, 150, 210, 265, 320],
      },
    ],
    yLabels: ["400 MT", "300 MT", "200 MT", "100 MT", "0 MT"],
    maxY: 400,
    value: "320 MT",
  },
  "quarter": {
    dates: ["Aug", "Sep", "Oct"],
    series: [
      {
        id: "volume",
        label: "Output (MT)",
        color: "#007AFF",
        data: [2800, 3100, 3250],
      },
    ],
    yLabels: ["4K MT", "3K MT", "2K MT", "1K MT", "0 MT"],
    maxY: 4000,
    value: "9,150 MT",
  },
  "ytd": {
    dates: ["Q1", "Q2", "Q3", "Q4"],
    series: [
      {
        id: "volume",
        label: "Output (MT)",
        color: "#007AFF",
        data: [7800, 8400, 9150, 9400],
      },
    ],
    yLabels: ["12K MT", "9K MT", "6K MT", "3K MT", "0 MT"],
    maxY: 12000,
    value: "34,750 MT",
  },
};

// 6. Recent Enterprise Activities (J Pan Tubular context: MOM, QC, Maintenance, Kaizen)
export const SAMPLE_ENTERPRISE_ACTIVITIES: RecentActivityItem[] = [
  {
    id: "act-1",
    title: "MOM Action Item Completed: Hydrostatic Test Line 2",
    description: "Meeting MOM-2026-084 action item signed off by Production Supervisor.",
    timestamp: "12m ago",
    user: {
      name: "Rahul Sharma",
      initials: "RS",
      department: "Production & Maintenance",
    },
    module: "meetings",
    badge: { label: "Verified", type: "green" },
  },
  {
    id: "act-2",
    title: "Kaizen Proposal Submitted: Scrap Reduction at Slitter",
    description: "Idea #KZ-392 submitted to optimize edge-trim width on tubular coils.",
    timestamp: "38m ago",
    user: {
      name: "Amit Patil",
      initials: "AP",
      department: "Kaizen & Continuous Improvement",
    },
    module: "kaizen",
    badge: { label: "Under Review", type: "blue" },
  },
  {
    id: "act-3",
    title: "Client Complaint Ticket #TC-910 Closed",
    description: "Dimensional discrepancy for casing shipment re-verified and resolved.",
    timestamp: "1h 10m ago",
    user: {
      name: "Pooja Mehta",
      initials: "PM",
      department: "Customer Relations & QA",
    },
    module: "complaints",
    badge: { label: "Resolved", type: "green" },
  },
  {
    id: "act-4",
    title: "Preventive Maintenance: Cold Drawing Unit 4",
    description: "Scheduled spindle lubrication and hydraulic calibration logged.",
    timestamp: "2h 45m ago",
    user: {
      name: "Suresh Nair",
      initials: "SN",
      department: "Plant Maintenance",
    },
    module: "maintenance",
    badge: { label: "Scheduled", type: "gray" },
  },
  {
    id: "act-5",
    title: "Ultrasonic Testing Report Uploaded",
    description: "Batch #JP-8841 tubular casing certified for API-5CT compliance.",
    timestamp: "4h 20m ago",
    user: {
      name: "Deepak Verma",
      initials: "DV",
      department: "Quality Assurance",
    },
    module: "quality",
    badge: { label: "Compliant", type: "green" },
  },
];

// 7. Operational Summary & Focus (MOM deadlines, Kaizen alerts, critical verifications)
export const SAMPLE_OPERATIONAL_FOCUS: OperationalSummaryItem[] = [
  {
    id: "focus-1",
    category: "attention-needed",
    title: "API-5CT Casing Inspection Sign-off #8841",
    module: "Quality & QC",
    assignedTo: "Quality Control Lead",
    dueText: "Due Today, 17:30",
    priority: "Urgent",
    status: "Awaiting Verification",
  },
  {
    id: "focus-2",
    category: "pending-tasks",
    title: "Daily Roles: Weekly Preventive Tooling Check",
    module: "Maintenance",
    assignedTo: "Plant Maintenance Team",
    dueText: "Due in 2 hours",
    priority: "High",
    status: "In Progress",
  },
  {
    id: "focus-3",
    category: "upcoming-deadlines",
    title: "Quarterly MOM Safety Audit & Review",
    module: "Meetings & MOM",
    assignedTo: "Operations Head",
    dueText: "Due Tomorrow, 11:00",
    priority: "Medium",
    status: "Agenda Circulated",
  },
  {
    id: "focus-4",
    category: "pending-tasks",
    title: "Review Kaizen Slitter Optimization #KZ-392",
    module: "Kaizen",
    assignedTo: "Engineering Manager",
    dueText: "Due in 2 days",
    priority: "Normal",
    status: "Evaluation Stage",
  },
];

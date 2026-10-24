export interface KpiMetric {
  id: string;
  title: string;
  module?: string;
  value: string | number;
  change: string;
  isPositive: boolean | null;
  subtitle: string;
  icon: string;
  trendData: number[];
  isSampleData?: boolean;
}

export interface BarDataPoint {
  date: string;
  isKeyDate?: boolean;
  value: number;
  secondaryValue?: number;
}

export interface LineSeries {
  id: string;
  label: string;
  color: string;
  data: number[];
  isArea?: boolean;
}

export interface PerformanceDataPoint {
  date: string;
  actual: number;
  target: number;
  efficiency: number;
}

export interface TaskCompletionMetric {
  day: string;
  completed: number;
  pending: number;
  rate: number;
}

export interface DepartmentPerformance {
  name: string;
  score: number;
  tasksCompleted: number;
  onTimeRate: number;
  headCount: number;
}

export interface ProjectStatusItem {
  status: "On Track" | "In Review" | "At Risk" | "Critical";
  count: number;
  percentage: number;
  color: string;
}

export interface RecentActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    avatar?: string;
    initials: string;
    department: string;
  };
  type?: "task" | "project" | "complaint" | "system";
  module?: "tasks" | "projects" | "complaints" | "quality" | "maintenance" | "kaizen" | "meetings";
  badge: {
    label: string;
    type: "green" | "blue" | "amber" | "gray";
  };
}

export interface OperationalSummaryItem {
  id: string;
  category: "pending-tasks" | "upcoming-deadlines" | "attention-needed";
  title: string;
  module?: string;
  assignedTo: string;
  dueText: string;
  priority: "Urgent" | "High" | "Medium" | "Normal";
  status: string;
}

export type ReportingPeriod = "today" | "7d" | "30d" | "quarter" | "ytd";

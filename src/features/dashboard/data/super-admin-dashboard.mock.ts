export interface MetricItem {
  id: string
  label: string
  value: string | number
  changeText: string
  changeStatus: "positive" | "warning" | "critical" | "neutral"
  trend: number[]
  iconType: "users" | "doctors" | "members" | "alerts"
}

export interface UserGrowthItem {
  month: string
  Members: number
  Doctors: number
  Admins: number
}

export interface UserDistributionItem {
  name: string
  value: number
  percentage: string
  color: string
}

export interface HealthAlertDailyItem {
  day: string
  Critical: number
  Warning: number
  Resolved: number
}

export interface SystemServiceStatus {
  id: string
  name: string
  status: "Operational" | "Degraded" | "Critical"
  uptime: string
  latency?: string
}

export interface ActivityLogItem {
  id: string
  user: string
  action: string
  role: string
  time: string
  status: "Success" | "Warning" | "Critical"
}

export interface PendingActionItem {
  id: string
  title: string
  category: string
  severity: "critical" | "warning" | "neutral"
  actionLabel: string
}

export const superAdminMetrics: MetricItem[] = [
  {
    id: "total-users",
    label: "Total Users",
    value: "12,480",
    changeText: "+8.2% from last month",
    changeStatus: "positive",
    trend: [11200, 11450, 11680, 11920, 12150, 12480],
    iconType: "users",
  },
  {
    id: "active-doctors",
    label: "Active Doctors",
    value: "426",
    changeText: "18 pending verification",
    changeStatus: "warning",
    trend: [395, 402, 408, 415, 420, 426],
    iconType: "doctors",
  },
  {
    id: "active-members",
    label: "Active Members",
    value: "11,892",
    changeText: "+324 this month",
    changeStatus: "positive",
    trend: [10850, 11100, 11300, 11520, 11710, 11892],
    iconType: "members",
  },
  {
    id: "critical-alerts",
    label: "Critical Alerts",
    value: "24",
    changeText: "8 unresolved",
    changeStatus: "critical",
    trend: [18, 22, 16, 29, 26, 24],
    iconType: "alerts",
  },
]

export const userGrowthData: UserGrowthItem[] = [
  { month: "Jan", Members: 9800, Doctors: 350, Admins: 22 },
  { month: "Feb", Members: 10250, Doctors: 368, Admins: 24 },
  { month: "Mar", Members: 10680, Doctors: 382, Admins: 26 },
  { month: "Apr", Members: 11100, Doctors: 395, Admins: 28 },
  { month: "May", Members: 11520, Doctors: 410, Admins: 29 },
  { month: "Jun", Members: 11892, Doctors: 426, Admins: 30 },
]

export const userDistributionData: UserDistributionItem[] = [
  { name: "Members", value: 11892, percentage: "88%", color: "#2563eb" }, // Blue-600
  { name: "Doctors", value: 426, percentage: "8%", color: "#0d9488" },    // Teal-600
  { name: "Admins", value: 130, percentage: "3%", color: "#6366f1" },     // Indigo-500
  { name: "Super Admin", value: 32, percentage: "1%", color: "#475569" }, // Slate-600
]

export const healthAlertsOverview = {
  summary: {
    critical: 24,
    warning: 86,
    resolved: 312,
  },
  dailyData: [
    { day: "Mon", Critical: 3, Warning: 12, Resolved: 45 },
    { day: "Tue", Critical: 5, Warning: 14, Resolved: 52 },
    { day: "Wed", Critical: 2, Warning: 9, Resolved: 38 },
    { day: "Thu", Critical: 6, Warning: 16, Resolved: 60 },
    { day: "Fri", Critical: 4, Warning: 11, Resolved: 48 },
    { day: "Sat", Critical: 2, Warning: 8, Resolved: 34 },
    { day: "Sun", Critical: 2, Warning: 16, Resolved: 35 },
  ] as HealthAlertDailyItem[],
}

export const systemServicesData: SystemServiceStatus[] = [
  { id: "srv-1", name: "API Gateway & Service", status: "Operational", uptime: "99.99%", latency: "24ms" },
  { id: "srv-2", name: "Clinical Database (PostgreSQL)", status: "Operational", uptime: "99.95%", latency: "4ms" },
  { id: "srv-3", name: "Notification & Telemetry Service", status: "Degraded", uptime: "98.12%", latency: "210ms" },
  { id: "srv-4", name: "Wearable Device Synchronization", status: "Operational", uptime: "99.89%", latency: "48ms" },
]

export const recentActivitiesData: ActivityLogItem[] = [
  { id: "act-1", user: "Dr. Nguyễn Minh", action: "Updated patient cardiology record #4912", role: "Doctor", time: "5 min ago", status: "Success" },
  { id: "act-2", user: "Admin Trần Anh", action: "Created verified doctor account", role: "Admin", time: "12 min ago", status: "Success" },
  { id: "act-3", user: "System Telemetry", action: "Failed wearable synchronization buffer", role: "System", time: "18 min ago", status: "Warning" },
  { id: "act-4", user: "Dr. Lê Phương", action: "Triggered emergency AFib protocol alert", role: "Doctor", time: "34 min ago", status: "Critical" },
  { id: "act-5", user: "Member Hưng Vũ", action: "Successfully linked Apple Watch Ultra 2", role: "Member", time: "1 hour ago", status: "Success" },
]

export const pendingActionsData: PendingActionItem[] = [
  { id: "p-1", title: "18 doctor verifications", category: "Credentialing", severity: "warning", actionLabel: "Review" },
  { id: "p-2", title: "8 unresolved critical alerts", category: "Patient Telemetry", severity: "critical", actionLabel: "Inspect" },
  { id: "p-3", title: "5 inactive hospital organizations", category: "Tenant Management", severity: "neutral", actionLabel: "Manage" },
  { id: "p-4", title: "3 failed device synchronizations", category: "Infrastructure", severity: "warning", actionLabel: "Retry" },
]

/**
 * Dữ liệu mẫu của dashboard quản trị. Chữ hiển thị không nằm ở đây: mỗi mục mang khoá dịch
 * (namespace "health", nhánh adminDashboard) và tham số, component tự dịch theo ngôn ngữ đang chọn.
 */

export type DashboardRole = "members" | "doctors" | "admins" | "superAdmins" | "system"
export type ServiceStatus = "operational" | "degraded" | "critical"
export type ActivityStatus = "success" | "warning" | "critical"

export interface MetricItem {
  id: "totalUsers" | "activeDoctors" | "activeMembers" | "criticalAlerts"
  value: number
  /** Khoá trong adminDashboard.metrics.change và tham số */
  change: { key: "growthPercent" | "pendingVerification" | "newThisMonth" | "unresolved"; values: Record<string, number> }
  changeStatus: "positive" | "warning" | "critical" | "neutral"
  trend: number[]
  iconType: "users" | "doctors" | "members" | "alerts"
}

export interface UserGrowthItem {
  /** Tháng trong năm, 0 = tháng 1 */
  month: number
  members: number
  doctors: number
  admins: number
}

export interface UserDistributionItem {
  role: DashboardRole
  value: number
  percentage: number
  color: string
}

export interface HealthAlertDailyItem {
  /** Thứ trong tuần, 0 = thứ Hai */
  weekday: number
  critical: number
  warning: number
  resolved: number
}

export interface SystemServiceStatus {
  id: "apiGateway" | "database" | "notification" | "wearableSync"
  status: ServiceStatus
  uptime: number
  latencyMs?: number
}

export interface ActivityLogItem {
  id: string
  /** Tên người thực hiện (tên riêng, không dịch); không có thì là hệ thống */
  actor?: string
  action: "updatedRecord" | "createdDoctor" | "syncFailed" | "afibAlert" | "linkedDevice"
  actionValues?: Record<string, string | number>
  role: DashboardRole
  minutesAgo: number
  status: ActivityStatus
}

export interface PendingActionItem {
  id: "doctorVerifications" | "criticalAlerts" | "inactiveOrganizations" | "failedSyncs"
  count: number
  category: "credentialing" | "telemetry" | "tenants" | "infrastructure"
  severity: "critical" | "warning" | "neutral"
  action: "review" | "inspect" | "manage" | "retry"
}

export const superAdminMetrics: MetricItem[] = [
  {
    id: "totalUsers",
    value: 12480,
    change: { key: "growthPercent", values: { value: 8.2 } },
    changeStatus: "positive",
    trend: [11200, 11450, 11680, 11920, 12150, 12480],
    iconType: "users",
  },
  {
    id: "activeDoctors",
    value: 426,
    change: { key: "pendingVerification", values: { count: 18 } },
    changeStatus: "warning",
    trend: [395, 402, 408, 415, 420, 426],
    iconType: "doctors",
  },
  {
    id: "activeMembers",
    value: 11892,
    change: { key: "newThisMonth", values: { count: 324 } },
    changeStatus: "positive",
    trend: [10850, 11100, 11300, 11520, 11710, 11892],
    iconType: "members",
  },
  {
    id: "criticalAlerts",
    value: 24,
    change: { key: "unresolved", values: { count: 8 } },
    changeStatus: "critical",
    trend: [18, 22, 16, 29, 26, 24],
    iconType: "alerts",
  },
]

export const userGrowthData: UserGrowthItem[] = [
  { month: 0, members: 9800, doctors: 350, admins: 22 },
  { month: 1, members: 10250, doctors: 368, admins: 24 },
  { month: 2, members: 10680, doctors: 382, admins: 26 },
  { month: 3, members: 11100, doctors: 395, admins: 28 },
  { month: 4, members: 11520, doctors: 410, admins: 29 },
  { month: 5, members: 11892, doctors: 426, admins: 30 },
]

export const userDistributionData: UserDistributionItem[] = [
  { role: "members", value: 11892, percentage: 88, color: "var(--color-primary-600)" },
  { role: "doctors", value: 426, percentage: 8, color: "var(--color-success-600)" },
  { role: "admins", value: 130, percentage: 3, color: "var(--color-warning-500)" },
  { role: "superAdmins", value: 32, percentage: 1, color: "var(--color-slate-600)" },
]

export const healthAlertsOverview = {
  summary: {
    critical: 24,
    warning: 86,
    resolved: 312,
  },
  dailyData: [
    { weekday: 0, critical: 3, warning: 12, resolved: 45 },
    { weekday: 1, critical: 5, warning: 14, resolved: 52 },
    { weekday: 2, critical: 2, warning: 9, resolved: 38 },
    { weekday: 3, critical: 6, warning: 16, resolved: 60 },
    { weekday: 4, critical: 4, warning: 11, resolved: 48 },
    { weekday: 5, critical: 2, warning: 8, resolved: 34 },
    { weekday: 6, critical: 2, warning: 16, resolved: 35 },
  ] as HealthAlertDailyItem[],
}

export const systemServicesData: SystemServiceStatus[] = [
  { id: "apiGateway", status: "operational", uptime: 99.99, latencyMs: 24 },
  { id: "database", status: "operational", uptime: 99.95, latencyMs: 4 },
  { id: "notification", status: "degraded", uptime: 98.12, latencyMs: 210 },
  { id: "wearableSync", status: "operational", uptime: 99.89, latencyMs: 48 },
]

export const recentActivitiesData: ActivityLogItem[] = [
  { id: "act-1", actor: "Nguyễn Minh", action: "updatedRecord", actionValues: { id: 4912 }, role: "doctors", minutesAgo: 5, status: "success" }, // i18n-ignore: tên riêng trong dữ liệu mẫu
  { id: "act-2", actor: "Trần Anh", action: "createdDoctor", role: "admins", minutesAgo: 12, status: "success" }, // i18n-ignore: tên riêng trong dữ liệu mẫu
  { id: "act-3", action: "syncFailed", role: "system", minutesAgo: 18, status: "warning" },
  { id: "act-4", actor: "Lê Phương", action: "afibAlert", role: "doctors", minutesAgo: 34, status: "critical" }, // i18n-ignore: tên riêng trong dữ liệu mẫu
  { id: "act-5", actor: "Hưng Vũ", action: "linkedDevice", actionValues: { device: "Apple Watch Ultra 2" }, role: "members", minutesAgo: 60, status: "success" }, // i18n-ignore: tên riêng trong dữ liệu mẫu
]

export const pendingActionsData: PendingActionItem[] = [
  { id: "doctorVerifications", count: 18, category: "credentialing", severity: "warning", action: "review" },
  { id: "criticalAlerts", count: 8, category: "telemetry", severity: "critical", action: "inspect" },
  { id: "inactiveOrganizations", count: 5, category: "tenants", severity: "neutral", action: "manage" },
  { id: "failedSyncs", count: 3, category: "infrastructure", severity: "warning", action: "retry" },
]

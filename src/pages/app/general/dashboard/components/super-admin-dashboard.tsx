import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  superAdminMetrics,
  userGrowthData,
  userDistributionData,
  healthAlertsOverview,
  systemServicesData,
  recentActivitiesData,
  pendingActionsData,
} from "../data/super-admin-dashboard.mock"

import { DashboardHeader, type DashboardFilters } from "./dashboard-header"
import { MetricCard } from "./metric-card"
import { UserGrowthChart } from "./user-growth-chart"
import { UserDistributionChart } from "./user-distribution-chart"
import { HealthAlertsChart } from "./health-alerts-chart"
import { SystemStatusCard } from "./system-status-card"
import { RecentActivityTable } from "./recent-activity-table"
import { PendingActionsCard } from "./pending-actions-card"

/**
 * Nội dung dashboard super admin, đặt trong PageBody. Trang chứa (management/hub) dựng Page + PageHeader với tiêu đề và
 * nút thao tác (DashboardHeaderActions).
 */
export function SuperAdminDashboard() {
  const { t } = useTranslation("health")
  const [filters, setFilters] = useState<DashboardFilters>({
    period: "30d",
    organizationId: "all",
  })

  function handleFilterChange(newFilters: Partial<DashboardFilters>) {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  return (
    <>
      {/* Interactive filter selectors */}
      <DashboardHeader filters={filters} onFilterChange={handleFilterChange} />

      {/* Section 1: KPI Summary Cards (4 columns on wide screen, 2 on laptop/narrower screens) */}
      <section aria-label={t("adminDashboard.sections.kpi")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {superAdminMetrics.map((item) => (
            <MetricCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Section 2: Core Analytics & Growth Charts */}
      <section aria-label={t("adminDashboard.sections.analytics")}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <UserGrowthChart data={userGrowthData} />
          </div>
          <div className="lg:col-span-1">
            <UserDistributionChart data={userDistributionData} />
          </div>
        </div>
      </section>

      {/* Section 3: Clinical Health Alerts & Infrastructure Status */}
      <section aria-label={t("adminDashboard.sections.alerts")}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <HealthAlertsChart data={healthAlertsOverview} />
          </div>
          <div className="lg:col-span-1">
            <SystemStatusCard services={systemServicesData} />
          </div>
        </div>
      </section>

      {/* Section 4: Operational Action Items & Activity Logs */}
      <section aria-label={t("adminDashboard.sections.activity")}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivityTable activities={recentActivitiesData} />
          </div>
          <div className="lg:col-span-1">
            <PendingActionsCard actions={pendingActionsData} />
          </div>
        </div>
      </section>
    </>
  )
}

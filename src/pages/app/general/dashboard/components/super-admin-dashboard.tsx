import { useState } from "react"
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

export function SuperAdminDashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    period: "30d",
    organizationId: "all",
  })

  function handleFilterChange(newFilters: Partial<DashboardFilters>) {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Top Header with interactive filter selectors */}
      <DashboardHeader filters={filters} onFilterChange={handleFilterChange} />

      {/* Section 1: KPI Summary Cards (4 columns on wide screen, 2 on laptop/narrower screens) */}
      <section aria-label="Key Performance Indicators">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {superAdminMetrics.map((item) => (
            <MetricCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Section 2: Core Analytics & Growth Charts */}
      <section aria-label="Platform Analytics & Charts">
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
      <section aria-label="Clinical Alerts and Infrastructure Status">
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
      <section aria-label="Activity Logs and Pending Actions">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivityTable activities={recentActivitiesData} />
          </div>
          <div className="lg:col-span-1">
            <PendingActionsCard actions={pendingActionsData} />
          </div>
        </div>
      </section>
    </div>
  )
}

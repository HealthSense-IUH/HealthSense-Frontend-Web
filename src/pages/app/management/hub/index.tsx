import { Page, PageBody, PageHeader } from "@/components/layout/page"
import { DashboardHeaderActions } from "@/pages/app/general/dashboard/components/dashboard-header"
import { SuperAdminDashboard } from "@/pages/app/general/dashboard/components/super-admin-dashboard"

export default function ManagementHubPage() {
  return (
    <Page>
      <PageHeader
        title="Bảng điều khiển quản trị"
        description="Theo dõi hoạt động của nền tảng HealthSense và hiệu năng hệ thống."
        actions={<DashboardHeaderActions />}
      />

      <PageBody>
        <SuperAdminDashboard />
      </PageBody>
    </Page>
  )
}

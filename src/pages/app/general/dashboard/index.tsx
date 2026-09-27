import { Page, PageBody, PageHeader } from "@/components/layout/page"
import { MemberHealthDashboard } from "@/pages/app/general/dashboard/components/member-health-dashboard"

export default function DashboardPage() {
  return (
    <Page>
      <PageHeader
        title="Tổng quan sức khỏe"
        description="Chỉ số tim mạch mới nhất, lịch đo theo ngày và các lần tầm soát rung nhĩ gần đây của bạn."
      />

      <PageBody>
        <MemberHealthDashboard />
      </PageBody>
    </Page>
  )
}

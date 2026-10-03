import { useTranslation } from "react-i18next"

import { Page, PageBody, PageHeader } from "@/components/layout/page"
import { DashboardHeaderActions } from "@/pages/app/general/dashboard/components/dashboard-header"
import { SuperAdminDashboard } from "@/pages/app/general/dashboard/components/super-admin-dashboard"

export default function ManagementHubPage() {
  const { t } = useTranslation("management")
  return (
    <Page>
      <PageHeader
        title={t("hub.title")}
        description={t("hub.description")}
        actions={<DashboardHeaderActions />}
      />

      <PageBody>
        <SuperAdminDashboard />
      </PageBody>
    </Page>
  )
}

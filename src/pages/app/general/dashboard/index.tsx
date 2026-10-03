import { useTranslation } from "react-i18next"

import { Page, PageBody, PageHeader } from "@/components/layout/page"
import { MemberHealthDashboard } from "@/pages/app/general/dashboard/components/member-health-dashboard"

export default function DashboardPage() {
  const { t } = useTranslation("health")
  return (
    <Page>
      <PageHeader
        title={t("dashboard.title")}
        description={t("dashboard.description")}
      />

      <PageBody>
        <MemberHealthDashboard />
      </PageBody>
    </Page>
  )
}

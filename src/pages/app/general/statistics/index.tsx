import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import {
  BarChart3,
  MessagesSquare,
  Activity,
  Coins,
} from "lucide-react"

import { Page, PageBody, PageHeader } from "@/components/layout/page"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { MemberConsultationStatisticsTab } from "./components/consultations/member-consultation-statistics-tab"
import { MemberPaymentStatisticsTab } from "./components/payments/member-payment-statistics-tab"
import { MemberHealthStatisticsTab } from "./components/health/member-health-statistics-tab"

export default function MemberStatisticsPage() {
  const { t } = useTranslation("health")
  const location = useLocation()
  const navigate = useNavigate()

  // Pure path-based active tab detection
  const activeTab = useMemo(() => {
    const path = location.pathname
    if (path.endsWith("/payments")) return "payments"
    if (path.endsWith("/health")) return "health"
    return "consultations"
  }, [location.pathname])

  const handleTabChange = (val: string) => {
    navigate(`/app/general/statistics/${val}`)
  }

  return (
    <Page>
      <PageHeader
        icon={<BarChart3 className="w-5 h-5 text-primary-600" />}
        title={t("memberStatistics.page.title")}
        description={t("memberStatistics.page.description")}
      />

      <PageBody>
        <div className="space-y-6">
          {/* Main Navigation Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full space-y-6"
          >
            <TabsList className="grid grid-cols-3 max-w-xl w-full h-auto p-1 bg-slate-100/90 rounded-2xl gap-1">
              <TabsTrigger
                value="consultations"
                className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs gap-1.5"
              >
                <MessagesSquare className="w-4 h-4 text-sky-600" />
                <span>{t("memberStatistics.tabs.consultations")}</span>
              </TabsTrigger>

              <TabsTrigger
                value="payments"
                className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs gap-1.5"
              >
                <Coins className="w-4 h-4 text-amber-600" />
                <span className="truncate">{t("memberStatistics.tabs.payments")}</span>
              </TabsTrigger>

              <TabsTrigger
                value="health"
                className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs gap-1.5"
              >
                <Activity className="w-4 h-4 text-emerald-600" />
                <span className="truncate">{t("memberStatistics.tabs.health")}</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB CONTENT: Mounts exclusively when tab is active */}
            <div className="mt-0">
              {activeTab === "consultations" && <MemberConsultationStatisticsTab />}
              {activeTab === "payments" && <MemberPaymentStatisticsTab />}
              {activeTab === "health" && <MemberHealthStatisticsTab />}
            </div>
          </Tabs>
        </div>
      </PageBody>
    </Page>
  )
}

import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import {
  BarChart3,
  Users,
  MessagesSquare,
  Activity,
  Coins,
} from "lucide-react"

import { Page, PageBody, PageHeader } from "@/components/layout/page"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { UserStatisticsTab } from "./components/users/user-statistics-tab"
import { ConsultationStatisticsTab } from "./components/consultations/consultation-statistics-tab"
import { HealthRecordStatisticsTab } from "./components/health-records/health-record-statistics-tab"
import { PaymentStatisticsTab } from "./components/payments/payment-statistics-tab"

export default function AdminStatisticsPage() {
  const { t } = useTranslation("management")
  const location = useLocation()
  const navigate = useNavigate()

  // Pure path-based active tab detection
  const activeTab = useMemo(() => {
    const path = location.pathname
    if (path.endsWith("/consultations")) return "consultations"
    if (path.endsWith("/records")) return "records"
    if (path.endsWith("/payments")) return "payments"
    return "users"
  }, [location.pathname])

  const handleTabChange = (val: string) => {
    navigate(`/app/management/statistics/${val}`)
  }

  return (
    <Page>
      <PageHeader
        icon={<BarChart3 className="w-5 h-5 text-primary-600" />}
        title={t("statistics.page.title")}
        description={t("statistics.page.description")}
      />

      <PageBody>
        <div className="space-y-6">
          {/* Main Navigation Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full space-y-6"
          >
            <TabsList className="grid grid-cols-2 md:grid-cols-4 max-w-3xl w-full h-auto p-1 bg-slate-100/90 rounded-2xl gap-1">
              <TabsTrigger
                value="users"
                className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs gap-1.5"
              >
                <Users className="w-4 h-4 text-primary-600" />
                <span>{t("statistics.tabs.users")}</span>
              </TabsTrigger>

              <TabsTrigger
                value="consultations"
                className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs gap-1.5"
              >
                <MessagesSquare className="w-4 h-4 text-sky-600" />
                <span>{t("statistics.tabs.consultations")}</span>
              </TabsTrigger>

              <TabsTrigger
                value="records"
                className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs gap-1.5"
              >
                <Activity className="w-4 h-4 text-emerald-600" />
                <span className="truncate">{t("statistics.tabs.records")}</span>
              </TabsTrigger>

              <TabsTrigger
                value="payments"
                className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs gap-1.5"
              >
                <Coins className="w-4 h-4 text-amber-600" />
                <span className="truncate">{t("statistics.tabs.payments")}</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB CONTENT: Mounts exclusively when tab is active */}
            <div className="mt-0">
              {activeTab === "users" && <UserStatisticsTab />}
              {activeTab === "consultations" && <ConsultationStatisticsTab />}
              {activeTab === "records" && <HealthRecordStatisticsTab />}
              {activeTab === "payments" && <PaymentStatisticsTab />}
            </div>
          </Tabs>
        </div>
      </PageBody>
    </Page>
  )
}

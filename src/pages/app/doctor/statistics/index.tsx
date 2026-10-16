import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { BarChart3, MessagesSquare, Users } from "lucide-react"

import { Page, PageBody, PageHeader } from "@/components/layout/page"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { DoctorConsultationStatisticsTab } from "./components/doctor-consultation-statistics-tab"
import { DoctorPatientStatisticsTab } from "./components/doctor-patient-statistics-tab"

export default function DoctorStatisticsPage() {
  const { t } = useTranslation("health")
  const location = useLocation()
  const navigate = useNavigate()

  // Pure path-based active tab detection
  const activeTab = useMemo(() => {
    const path = location.pathname
    if (path.endsWith("/patients")) return "patients"
    return "consultations"
  }, [location.pathname])

  const handleTabChange = (val: string) => {
    navigate(`/app/doctor/statistics/${val}`)
  }

  return (
    <Page>
      <PageHeader
        icon={<BarChart3 className="w-5 h-5 text-primary-600" />}
        title={t("doctorStatistics.page.title")}
        description={t("doctorStatistics.page.description")}
      />

      <PageBody>
        <div className="space-y-6">
          {/* Main Navigation Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full space-y-6"
          >
            <TabsList className="grid grid-cols-2 max-w-md w-full h-auto p-1 bg-slate-100/90 rounded-2xl gap-1">
              <TabsTrigger
                value="consultations"
                className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs gap-1.5"
              >
                <MessagesSquare className="w-4 h-4 text-sky-600" />
                <span>{t("doctorStatistics.tabs.consultations")}</span>
              </TabsTrigger>

              <TabsTrigger
                value="patients"
                className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs gap-1.5"
              >
                <Users className="w-4 h-4 text-indigo-600" />
                <span>{t("doctorStatistics.tabs.patients")}</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB CONTENT: Mounts exclusively when tab is active */}
            <div className="mt-0">
              {activeTab === "consultations" && <DoctorConsultationStatisticsTab />}
              {activeTab === "patients" && <DoctorPatientStatisticsTab />}
            </div>
          </Tabs>
        </div>
      </PageBody>
    </Page>
  )
}

import { useTranslation } from "react-i18next"
import { Activity, FileText, Users, AlertTriangle } from "lucide-react"
import type { HealthRecordStatisticsSummary } from "@/types/statistics"

interface HealthRecordSummaryCardsProps {
  summary: HealthRecordStatisticsSummary
  startDateStr: string
  endDateStr: string
}

export function HealthRecordSummaryCards({
  summary,
  startDateStr,
  endDateStr,
}: HealthRecordSummaryCardsProps) {
  const { t } = useTranslation("management")

  const cards = [
    {
      id: "totalRecords",
      title: t("statistics.healthRecords.summary.totalRecords"),
      value: summary.totalRecords.toLocaleString("vi-VN"),
      description: t("statistics.healthRecords.summary.totalRecordsDesc"),
      icon: Activity,
      iconColor: "text-primary-600 bg-primary-50 ring-1 ring-primary-200/80",
      topBar: "from-primary-600 to-cyan-500",
      accentBorder: "border-slate-200/90 hover:border-primary-200",
    },
    {
      id: "recordsInPeriod",
      title: t("statistics.healthRecords.summary.recordsInPeriod"),
      value: summary.recordsInPeriod.toLocaleString("vi-VN"),
      description: t("statistics.healthRecords.summary.recordsInPeriodDesc", {
        from: startDateStr,
        to: endDateStr,
      }),
      icon: FileText,
      iconColor: "text-cyan-700 bg-cyan-50 ring-1 ring-cyan-200/80",
      topBar: "from-cyan-600 to-cyan-400",
      accentBorder: "border-slate-200/90 hover:border-cyan-200",
    },
    {
      id: "uniqueUsersInPeriod",
      title: t("statistics.healthRecords.summary.uniqueUsersInPeriod"),
      value: summary.uniqueUsersInPeriod.toLocaleString("vi-VN"),
      description: t(
        "statistics.healthRecords.summary.uniqueUsersInPeriodDesc"
      ),
      icon: Users,
      iconColor: "text-success-700 bg-success-50 ring-1 ring-success-200/80",
      topBar: "from-success-600 to-success-400",
      accentBorder: "border-slate-200/90 hover:border-success-200",
    },
    {
      id: "afDetectedOrSuspectedInPeriod",
      title: t(
        "statistics.healthRecords.summary.afDetectedOrSuspectedInPeriod"
      ),
      value: summary.afDetectedOrSuspectedInPeriod.toLocaleString("vi-VN"),
      description: t(
        "statistics.healthRecords.summary.afDetectedOrSuspectedInPeriodDesc"
      ),
      icon: AlertTriangle,
      iconColor: summary.afDetectedOrSuspectedInPeriod > 0 ? "text-danger-600 bg-danger-50 ring-1 ring-danger-200/80" : "text-slate-600 bg-slate-100 ring-1 ring-slate-200/80",
      topBar: summary.afDetectedOrSuspectedInPeriod > 0 ? "from-danger-600 to-danger-400" : "from-slate-400 to-slate-300",
      accentBorder: summary.afDetectedOrSuspectedInPeriod > 0 ? "border-danger-200 hover:border-danger-300" : "border-slate-200/90",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.id}
            className={`relative overflow-hidden rounded-2xl border ${card.accentBorder} bg-white p-5 shadow-card flex flex-col justify-between transition-all hover:-translate-y-0.5`}
          >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.topBar}`} aria-hidden="true" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.iconColor} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-slate-900">
                {card.value}
              </div>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                {card.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

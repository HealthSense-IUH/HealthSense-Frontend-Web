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
      iconColor: "text-primary-600 bg-primary-50",
      accentBorder: "border-primary-100",
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
      iconColor: "text-sky-600 bg-sky-50",
      accentBorder: "border-sky-100",
    },
    {
      id: "uniqueUsersInPeriod",
      title: t("statistics.healthRecords.summary.uniqueUsersInPeriod"),
      value: summary.uniqueUsersInPeriod.toLocaleString("vi-VN"),
      description: t(
        "statistics.healthRecords.summary.uniqueUsersInPeriodDesc"
      ),
      icon: Users,
      iconColor: "text-indigo-600 bg-indigo-50",
      accentBorder: "border-indigo-100",
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
      iconColor: "text-rose-600 bg-rose-50",
      accentBorder: "border-rose-100",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.id}
            className={`rounded-2xl border ${card.accentBorder} bg-white p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm`}
          >
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

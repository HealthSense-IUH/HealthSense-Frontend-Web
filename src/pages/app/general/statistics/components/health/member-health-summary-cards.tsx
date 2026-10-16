import { useTranslation } from "react-i18next"
import {
  Activity,
  Calendar,
  CheckCircle2,
  HeartPulse,
  HelpCircle,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { MemberHealthRecordStatisticsSummary } from "@/types/statistics"

interface MemberHealthSummaryCardsProps {
  summary: MemberHealthRecordStatisticsSummary
  startDateStr: string
  endDateStr: string
}

function formatDateTime(isoString: string | null): string | null {
  if (!isoString) return null
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return null
    const day = String(d.getDate()).padStart(2, "0")
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, "0")
    const minutes = String(d.getMinutes()).padStart(2, "0")
    return `${day}/${month}/${year} ${hours}:${minutes}`
  } catch {
    return null
  }
}

export function MemberHealthSummaryCards({
  summary,
  startDateStr,
  endDateStr,
}: MemberHealthSummaryCardsProps) {
  const { t } = useTranslation("health")

  const formattedLatestDate = formatDateTime(summary.latestRecordAt)

  const cards = [
    {
      id: "totalRecords",
      title: t("memberStatistics.health.summary.totalRecords"),
      value: summary.totalRecords.toLocaleString("vi-VN"),
      description: t("memberStatistics.health.summary.totalRecordsDesc"),
      icon: Activity,
      iconColor: "text-primary-600 bg-primary-50",
      accentBorder: "border-primary-100",
      tooltip: null,
    },
    {
      id: "recordsInPeriod",
      title: t("memberStatistics.health.summary.recordsInPeriod"),
      value: summary.recordsInPeriod.toLocaleString("vi-VN"),
      description: t("memberStatistics.health.summary.recordsInPeriodDesc", {
        from: startDateStr,
        to: endDateStr,
      }),
      icon: Calendar,
      iconColor: "text-sky-600 bg-sky-50",
      accentBorder: "border-sky-100",
      tooltip: null,
    },
    {
      id: "completedInPeriod",
      title: t("memberStatistics.health.summary.completedInPeriod"),
      value: summary.completedInPeriod.toLocaleString("vi-VN"),
      description:
        summary.failedInPeriod > 0
          ? t("memberStatistics.health.summary.failedInPeriodWarning", {
              count: summary.failedInPeriod,
            })
          : t("memberStatistics.health.summary.completedInPeriodDesc"),
      icon: CheckCircle2,
      iconColor: "text-emerald-600 bg-emerald-50",
      accentBorder: "border-emerald-100",
      tooltip: t("memberStatistics.health.summary.cohortTooltip"),
    },
    {
      id: "afDetectedOrSuspectedInPeriod",
      title: t("memberStatistics.health.summary.afDetectedOrSuspectedInPeriod"),
      value: summary.afDetectedOrSuspectedInPeriod.toLocaleString("vi-VN"),
      description: formattedLatestDate
        ? t("memberStatistics.health.summary.latestRecordAt", {
            date: formattedLatestDate,
          })
        : t("memberStatistics.health.summary.noRecordsYet"),
      icon: HeartPulse,
      iconColor: "text-rose-600 bg-rose-50",
      accentBorder: "border-rose-100",
      tooltip: t("memberStatistics.health.summary.cohortTooltip"),
    },
  ]

  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.id}
              className={`rounded-2xl border ${card.accentBorder} bg-white p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm`}
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
                    {card.title}
                  </span>
                  {card.tooltip && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-slate-400 hover:text-slate-600 shrink-0"
                          aria-label={card.title}
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="max-w-xs text-xs font-normal"
                      >
                        {card.tooltip}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${card.iconColor}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4">
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
    </TooltipProvider>
  )
}

import { useTranslation } from "react-i18next"
import { HelpCircle } from "lucide-react"
import {
  HsAfibRadarIcon,
  HsChartBarsIcon,
  HsHeartPulseIcon,
  HsScreeningCheckIcon,
} from "@/components/icons/health-icons"
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
      icon: HsAfibRadarIcon,
      iconColor: "text-primary-600 bg-primary-50 ring-1 ring-primary-200/80",
      topBar: "from-primary-600 to-cyan-500",
      accentBorder: "border-slate-200/90 hover:border-primary-200",
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
      icon: HsChartBarsIcon,
      iconColor: "text-cyan-700 bg-cyan-50 ring-1 ring-cyan-200/80",
      topBar: "from-cyan-600 to-cyan-400",
      accentBorder: "border-slate-200/90 hover:border-cyan-200",
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
      icon: HsScreeningCheckIcon,
      iconColor: "text-success-700 bg-success-50 ring-1 ring-success-200/80",
      topBar: "from-success-600 to-success-400",
      accentBorder: "border-slate-200/90 hover:border-success-200",
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
      icon: HsHeartPulseIcon,
      iconColor: summary.afDetectedOrSuspectedInPeriod > 0 ? "text-danger-600 bg-danger-50 ring-1 ring-danger-200/80" : "text-slate-600 bg-slate-100 ring-1 ring-slate-200/80",
      topBar: summary.afDetectedOrSuspectedInPeriod > 0 ? "from-danger-600 to-danger-400" : "from-slate-400 to-slate-300",
      accentBorder: summary.afDetectedOrSuspectedInPeriod > 0 ? "border-danger-200 hover:border-danger-300" : "border-slate-200/90",
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
              className={`relative overflow-hidden rounded-2xl border ${card.accentBorder} bg-white p-5 shadow-card flex flex-col justify-between transition-all hover:-translate-y-0.5`}
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.topBar}`} aria-hidden="true" />
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

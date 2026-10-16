import { useTranslation } from "react-i18next"
import {
  MessagesSquare,
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { MemberConsultationStatisticsSummary } from "@/types/statistics"

interface MemberConsultationSummaryCardsProps {
  summary: MemberConsultationStatisticsSummary
  startDateStr: string
  endDateStr: string
}

export function MemberConsultationSummaryCards({
  summary,
  startDateStr,
  endDateStr,
}: MemberConsultationSummaryCardsProps) {
  const { t } = useTranslation("health")

  const cards = [
    {
      id: "totalConsultations",
      title: t("memberStatistics.consultations.summary.totalConsultations"),
      value: summary.totalConsultations.toLocaleString("vi-VN"),
      description: t("memberStatistics.consultations.summary.totalConsultationsDesc"),
      icon: MessagesSquare,
      iconColor: "text-primary-600 bg-primary-50",
      accentBorder: "border-primary-100",
      tooltip: null,
    },
    {
      id: "consultationsInPeriod",
      title: t("memberStatistics.consultations.summary.consultationsInPeriod"),
      value: summary.consultationsInPeriod.toLocaleString("vi-VN"),
      description: t(
        "memberStatistics.consultations.summary.consultationsInPeriodDesc",
        {
          from: startDateStr,
          to: endDateStr,
        }
      ),
      icon: Calendar,
      iconColor: "text-sky-600 bg-sky-50",
      accentBorder: "border-sky-100",
      tooltip: null,
    },
    {
      id: "completedInPeriod",
      title: t("memberStatistics.consultations.summary.completedInPeriod"),
      value: summary.completedInPeriod.toLocaleString("vi-VN"),
      description: t("memberStatistics.consultations.summary.completedInPeriodDesc"),
      icon: CheckCircle2,
      iconColor: "text-emerald-600 bg-emerald-50",
      accentBorder: "border-emerald-100",
      tooltip: t("memberStatistics.consultations.summary.cohortTooltip"),
    },
    {
      id: "cancelledInPeriod",
      title: t("memberStatistics.consultations.summary.cancelledInPeriod"),
      value: summary.cancelledInPeriod.toLocaleString("vi-VN"),
      description: t("memberStatistics.consultations.summary.cancelledInPeriodDesc"),
      icon: XCircle,
      iconColor: "text-rose-600 bg-rose-50",
      accentBorder: "border-rose-100",
      tooltip: t("memberStatistics.consultations.summary.cohortTooltip"),
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

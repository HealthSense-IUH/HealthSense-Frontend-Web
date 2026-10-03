import { useTranslation } from "react-i18next"
import { Coins, TrendingUp, Receipt, Scale, Info } from "lucide-react"
import type { PaymentStatisticsSummary } from "@/types/statistics"
import { formatVnd } from "@/constants/credits"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PaymentSummaryCardsProps {
  summary: PaymentStatisticsSummary
  startDateStr: string
  endDateStr: string
}

export function PaymentSummaryCards({
  summary,
  startDateStr,
  endDateStr,
}: PaymentSummaryCardsProps) {
  const { t } = useTranslation("management")

  const cards = [
    {
      id: "totalRevenue",
      title: t("statistics.payments.summary.totalRevenue"),
      value: formatVnd(summary.totalRevenueVnd),
      description: t("statistics.payments.summary.totalRevenueDesc"),
      tooltip: t("statistics.payments.summary.totalRevenueTooltip"),
      icon: Coins,
      iconColor: "text-amber-600 bg-amber-50",
      accentBorder: "border-amber-100",
    },
    {
      id: "revenueInPeriod",
      title: t("statistics.payments.summary.revenueInPeriod"),
      value: formatVnd(summary.revenueInPeriodVnd),
      description: t("statistics.payments.summary.revenueInPeriodDesc", {
        from: startDateStr,
        to: endDateStr,
      }),
      tooltip: t("statistics.payments.summary.revenueInPeriodTooltip"),
      icon: TrendingUp,
      iconColor: "text-emerald-600 bg-emerald-50",
      accentBorder: "border-emerald-100",
    },
    {
      id: "totalTransactions",
      title: t("statistics.payments.summary.totalTransactions"),
      value: summary.totalBusinessTransactions.toLocaleString("vi-VN"),
      description: t("statistics.payments.summary.totalTransactionsDesc"),
      tooltip: t("statistics.payments.summary.totalTransactionsTooltip"),
      icon: Receipt,
      iconColor: "text-sky-600 bg-sky-50",
      accentBorder: "border-sky-100",
    },
    {
      id: "averagePaidValue",
      title: t("statistics.payments.summary.averagePaidValue"),
      value: formatVnd(summary.averagePaidTransactionValueVnd),
      description: t("statistics.payments.summary.averagePaidValueDesc"),
      tooltip: t("statistics.payments.summary.averagePaidValueTooltip"),
      icon: Scale,
      iconColor: "text-purple-600 bg-purple-50",
      accentBorder: "border-purple-100",
    },
  ]

  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.id}
              className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-xs transition-all hover:shadow-md ${card.accentBorder}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
                    {card.title}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label={card.tooltip}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs">
                      {card.tooltip}
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className={`p-2.5 rounded-xl shrink-0 ${card.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-3">
                <div className="text-2xl font-bold tracking-tight text-slate-900 truncate">
                  {card.value}
                </div>
                <p className="mt-1 text-xs text-slate-500 line-clamp-1">
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

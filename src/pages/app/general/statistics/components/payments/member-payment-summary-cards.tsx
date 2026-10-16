import { useTranslation } from "react-i18next"
import {
  Coins,
  CreditCard,
  CheckCircle2,
  Wallet,
  HelpCircle,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type {
  MemberPaymentStatisticsSummary,
  MemberWalletSummary,
} from "@/types/statistics"

interface MemberPaymentSummaryCardsProps {
  summary: MemberPaymentStatisticsSummary
  wallet: MemberWalletSummary
  startDateStr: string
  endDateStr: string
}

export function MemberPaymentSummaryCards({
  summary,
  wallet,
}: MemberPaymentSummaryCardsProps) {
  const { t } = useTranslation("health")

  const cards = [
    {
      id: "paidInPeriod",
      title: t("memberStatistics.payments.summary.paidInPeriod"),
      value: `${summary.paidInPeriodVnd.toLocaleString("vi-VN")} ₫`,
      description: t("memberStatistics.payments.summary.totalPaid", {
        amount: `${summary.totalPaidVnd.toLocaleString("vi-VN")} ₫`,
      }),
      icon: Coins,
      iconColor: "text-amber-600 bg-amber-50",
      accentBorder: "border-amber-100",
      tooltip: t("memberStatistics.payments.summary.paidAtTooltip"),
    },
    {
      id: "purchasedCreditsInPeriod",
      title: t("memberStatistics.payments.summary.purchasedCreditsInPeriod"),
      value: summary.purchasedCreditsInPeriod.toLocaleString("vi-VN"),
      description: t("memberStatistics.payments.summary.totalPurchasedCredits", {
        count: summary.totalPurchasedCredits.toLocaleString("vi-VN"),
      }),
      icon: CreditCard,
      iconColor: "text-primary-600 bg-primary-50",
      accentBorder: "border-primary-100",
      tooltip: t("memberStatistics.payments.summary.paidAtTooltip"),
    },
    {
      id: "successfulOrdersInPeriod",
      title: t("memberStatistics.payments.summary.successfulOrdersInPeriod"),
      value: summary.successfulOrdersInPeriod.toLocaleString("vi-VN"),
      description: t("memberStatistics.payments.summary.totalSuccessfulOrders", {
        count: summary.totalSuccessfulOrders.toLocaleString("vi-VN"),
      }),
      icon: CheckCircle2,
      iconColor: "text-emerald-600 bg-emerald-50",
      accentBorder: "border-emerald-100",
      tooltip: t("memberStatistics.payments.summary.paidAtTooltip"),
    },
    {
      id: "walletAvailable",
      title: t("memberStatistics.payments.summary.walletAvailable"),
      value: wallet.available.toLocaleString("vi-VN"),
      description: t("memberStatistics.payments.summary.walletDetails", {
        balance: wallet.balance.toLocaleString("vi-VN"),
        reserved: wallet.reserved.toLocaleString("vi-VN"),
      }),
      icon: Wallet,
      iconColor: "text-sky-600 bg-sky-50",
      accentBorder: "border-sky-100",
      tooltip: null,
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

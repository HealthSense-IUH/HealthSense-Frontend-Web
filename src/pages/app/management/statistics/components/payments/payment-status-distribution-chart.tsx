import { useTranslation } from "react-i18next"
import type { CategoryCount } from "@/types/statistics"
import type { CreditOrderStatus } from "@/types/credits"
import { Info } from "lucide-react"
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PaymentStatusDistributionChartProps {
  creditPurchase: CategoryCount<CreditOrderStatus>[]
}

const CREDIT_STATUS_COLORS: Record<CreditOrderStatus, string> = {
  PAID: "#10b981",
  PENDING_PAYMENT: "#f59e0b",
  CANCELLED: "#64748b",
  EXPIRED: "#f97316",
  REQUIRES_REVIEW: "#a855f7",
}

export function PaymentStatusDistributionChart({
  creditPurchase,
}: PaymentStatusDistributionChartProps) {
  const { t } = useTranslation("management")

  const totalCredit = creditPurchase.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
      <div className="pb-4 border-b border-slate-100 flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-bold text-slate-900">
              {t("statistics.payments.statusDistribution.title")}
            </h3>
            <TooltipProvider delayDuration={200}>
              <UiTooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={t("statistics.payments.statusDistribution.tooltip")}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs">
                  {t("statistics.payments.statusDistribution.tooltip")}
                </TooltipContent>
              </UiTooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t("statistics.payments.statusDistribution.description")}
          </p>
        </div>
      </div>

      <div className="mt-6">
        {/* CREDIT PURCHASE */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {t("statistics.payments.statusDistribution.creditPurchaseTitle")}
            </h4>
            <span className="text-xs font-bold text-purple-600">
              {totalCredit.toLocaleString("vi-VN")}
            </span>
          </div>

          <div className="space-y-2.5">
            {creditPurchase.map((item) => {
              const label = t(
                `statistics.payments.statusDistribution.creditStatuses.${item.key}`,
                { defaultValue: item.key }
              )
              const color = CREDIT_STATUS_COLORS[item.key] || "#94a3b8"
              const percent = totalCredit > 0 ? (item.count / totalCredit) * 100 : 0

              return (
                <div key={item.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-slate-700 font-medium">{label}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-900">{item.count}</span>
                      <span className="text-slate-500 text-[11px] ml-1">
                        ({percent.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200/60 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

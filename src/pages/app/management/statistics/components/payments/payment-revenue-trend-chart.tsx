import { useTranslation } from "react-i18next"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import type {
  PaymentRevenueTrendBucket,
  StatisticsGroupBy,
} from "@/types/statistics"
import { formatVnd } from "@/constants/credits"
import { Info } from "lucide-react"
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PaymentRevenueTrendChartProps {
  data: PaymentRevenueTrendBucket[]
  groupBy: StatisticsGroupBy
}

function formatBucketLabel(
  bucketStart: string,
  groupBy: StatisticsGroupBy,
  formatWeek: (date: string) => string
): string {
  const parts = bucketStart.split("-")
  if (parts.length !== 3) return bucketStart

  const [year, month, day] = parts

  if (groupBy === "DAY") {
    return `${day}/${month}`
  }
  if (groupBy === "WEEK") {
    return formatWeek(`${day}/${month}`)
  }
  if (groupBy === "MONTH") {
    return `${month}/${year}`
  }
  return `${day}/${month}`
}

export function PaymentRevenueTrendChart({
  data,
  groupBy,
}: PaymentRevenueTrendChartProps) {
  const { t } = useTranslation("management")

  const totalInPeriod = data.reduce((sum, item) => sum + item.totalVnd, 0)
  const chartData = data.map((item) => ({
    ...item,
    formattedLabel: formatBucketLabel(
      item.bucketStart,
      groupBy,
      (date) => t("statistics.filter.weekFrom", { date })
    ),
  }))

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-bold text-slate-900">
              {t("statistics.payments.revenueTrend.title")}
            </h3>
            <TooltipProvider delayDuration={200}>
              <UiTooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={t("statistics.payments.revenueTrend.tooltip")}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs">
                  {t("statistics.payments.revenueTrend.tooltip")}
                </TooltipContent>
              </UiTooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t("statistics.payments.revenueTrend.description")}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t("statistics.payments.revenueTrend.totalLabel")}
            </span>
            <div className="text-lg font-bold text-emerald-600">
              {formatVnd(totalInPeriod)}
            </div>
          </div>
        </div>
      </div>

      <div className="h-72 w-full mt-6">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            {t("statistics.payments.revenueTrend.empty")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="formattedLabel"
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                tick={{ fill: "#64748b", fontSize: 11 }}
                dy={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickFormatter={(val: number) => {
                  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
                  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`
                  return String(val)
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null
                  const item = payload[0].payload as PaymentRevenueTrendBucket & {
                    formattedLabel: string
                  }
                  return (
                    <div className="rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-md backdrop-blur-xs text-xs space-y-1.5">
                      <div className="font-semibold text-slate-800">
                        {item.formattedLabel}
                      </div>
                      <div className="flex items-center justify-between gap-4 text-sky-600">
                        <span>{t("statistics.payments.revenueTrend.directCareLabel")}:</span>
                        <span className="font-semibold">{formatVnd(item.directCareVnd)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-purple-600">
                        <span>{t("statistics.payments.revenueTrend.creditPurchaseLabel")}:</span>
                        <span className="font-semibold">{formatVnd(item.creditPurchaseVnd)}</span>
                      </div>
                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-4 text-slate-900 font-bold">
                        <span>{t("statistics.payments.revenueTrend.totalLabel")}:</span>
                        <span className="text-emerald-600">{formatVnd(item.totalVnd)}</span>
                      </div>
                    </div>
                  )
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 10, fontSize: 12 }}
                formatter={(val) => {
                  if (val === "directCareVnd") return t("statistics.payments.revenueTrend.directCareLabel")
                  if (val === "creditPurchaseVnd") return t("statistics.payments.revenueTrend.creditPurchaseLabel")
                  return String(val)
                }}
              />
              <Bar
                dataKey="directCareVnd"
                stackId="revenue"
                fill="#0284c7"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="creditPurchaseVnd"
                stackId="revenue"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

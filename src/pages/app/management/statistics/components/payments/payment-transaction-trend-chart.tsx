import { useTranslation } from "react-i18next"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import type { StatisticsCountBucket, StatisticsGroupBy } from "@/types/statistics"
import { Info } from "lucide-react"
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PaymentTransactionTrendChartProps {
  data: StatisticsCountBucket[]
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

export function PaymentTransactionTrendChart({
  data,
  groupBy,
}: PaymentTransactionTrendChartProps) {
  const { t } = useTranslation("management")

  const totalInPeriod = data.reduce((sum, item) => sum + item.count, 0)
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
              {t("statistics.payments.transactionTrend.title")}
            </h3>
            <TooltipProvider delayDuration={200}>
              <UiTooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={t("statistics.payments.transactionTrend.tooltip")}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs">
                  {t("statistics.payments.transactionTrend.tooltip")}
                </TooltipContent>
              </UiTooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t("statistics.payments.transactionTrend.description")}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t("statistics.payments.transactionTrend.countLabel")}
            </span>
            <div className="text-lg font-bold text-sky-600">
              {totalInPeriod.toLocaleString("vi-VN")}
            </div>
          </div>
        </div>
      </div>

      <div className="h-72 w-full mt-6">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            {t("statistics.payments.transactionTrend.empty")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="txGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
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
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null
                  const item = payload[0].payload as StatisticsCountBucket & {
                    formattedLabel: string
                  }
                  return (
                    <div className="rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-md backdrop-blur-xs text-xs space-y-1">
                      <div className="font-semibold text-slate-800">
                        {item.formattedLabel}
                      </div>
                      <div className="flex items-center gap-2 text-sky-600 font-medium">
                        <span className="w-2 h-2 rounded-full bg-sky-600" />
                        <span>
                          {t("statistics.payments.transactionTrend.countLabel")}:{" "}
                          <strong className="text-slate-900">{item.count}</strong>
                        </span>
                      </div>
                    </div>
                  )
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#0284c7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#txGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

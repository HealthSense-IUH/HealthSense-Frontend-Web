import { useTranslation } from "react-i18next"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
import type {
  PaymentRevenueBySourceItem,
  PaymentRevenueSource,
} from "@/types/statistics"
import { formatVnd } from "@/constants/credits"

interface PaymentRevenueBySourceChartProps {
  data: PaymentRevenueBySourceItem[]
}

const SOURCE_COLORS: Record<PaymentRevenueSource, string> = {
  DIRECT_CARE: "#0284c7",
  CREDIT_PURCHASE: "#8b5cf6",
}

export function PaymentRevenueBySourceChart({
  data,
}: PaymentRevenueBySourceChartProps) {
  const { t } = useTranslation("management")

  const totalRevenue = data.reduce((sum, item) => sum + item.amountVnd, 0)

  // Map source strictly by KEY
  const chartData = data.map((item) => {
    const label = t(`statistics.payments.revenueBySource.sources.${item.key}`, {
      defaultValue: item.key,
    })
    const color = SOURCE_COLORS[item.key] || "#94a3b8"
    const percentNum =
      totalRevenue > 0 ? (item.amountVnd / totalRevenue) * 100 : 0

    return {
      name: label,
      value: item.amountVnd,
      percent: percentNum.toFixed(1),
      color,
      key: item.key,
    }
  })

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
      <div className="pb-4 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-900">
          {t("statistics.payments.revenueBySource.title")}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {t("statistics.payments.revenueBySource.description")}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 mt-6">
        <div className="h-56 w-56 shrink-0 relative">
          {totalRevenue === 0 ? (
            <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-dashed border-slate-200 text-xs text-slate-400">
              0 ₫
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null
                    const item = payload[0].payload as {
                      name: string
                      value: number
                      percent: string
                    }
                    return (
                      <div className="rounded-xl border border-slate-200/80 bg-white/95 p-2.5 shadow-md backdrop-blur-xs text-xs space-y-1">
                        <div className="font-semibold text-slate-800">
                          {item.name}
                        </div>
                        <div className="text-slate-600">
                          {formatVnd(item.value)} ({item.percent}%)
                        </div>
                      </div>
                    )
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend breakdown list */}
        <div className="flex-1 w-full space-y-3">
          {chartData.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-md shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-semibold text-slate-700">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-900">
                  {formatVnd(item.value)}
                </span>
                <span className="text-[11px] font-medium text-slate-500 ml-1.5">
                  ({item.percent}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

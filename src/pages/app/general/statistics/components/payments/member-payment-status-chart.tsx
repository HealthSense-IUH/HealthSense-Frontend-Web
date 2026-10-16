import { useTranslation } from "react-i18next"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
import { HelpCircle } from "lucide-react"
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { CategoryCount, CreditOrderStatus } from "@/types/statistics"

interface MemberPaymentStatusChartProps {
  data: CategoryCount<CreditOrderStatus>[]
}

const ORDER_STATUS_COLORS: Record<CreditOrderStatus, string> = {
  PENDING_PAYMENT: "#f59e0b",
  PAID: "#10b981",
  CANCELLED: "#ef4444",
  EXPIRED: "#94a3b8",
  REQUIRES_REVIEW: "#8b5cf6",
}

export function MemberPaymentStatusChart({
  data,
}: MemberPaymentStatusChartProps) {
  const { t } = useTranslation("health")

  const filteredData = data.filter(
    (item) => item.key !== "EXPIRED" && item.key !== "REQUIRES_REVIEW"
  )
  const totalOrders = filteredData.reduce((sum, item) => sum + item.count, 0)

  // Map status strictly by KEY
  const chartData = filteredData.map((item) => {
    const label = t(`memberStatistics.payments.statuses.${item.key}`, {
      defaultValue: item.key,
    })
    const color = ORDER_STATUS_COLORS[item.key] || "#94a3b8"
    const percentNum = totalOrders > 0 ? (item.count / totalOrders) * 100 : 0
    const percentStr = percentNum.toFixed(1)

    return {
      key: item.key,
      name: label,
      value: item.count,
      color,
      percentStr,
    }
  })

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-bold text-slate-900">
              {t("memberStatistics.payments.statusDistribution.title")}
            </h3>
            <TooltipProvider delayDuration={200}>
              <UiTooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-600 shrink-0"
                    aria-label="info"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs font-normal">
                  {t("memberStatistics.payments.statusDistribution.createdAtTooltip")}
                </TooltipContent>
              </UiTooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t("memberStatistics.payments.statusDistribution.description")}
          </p>
        </div>
      </div>

      <div className="h-[210px] w-full my-3">
        {totalOrders === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            {t("memberStatistics.payments.statusDistribution.empty")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  borderColor: "#e2e8f0",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
                formatter={(value: unknown, name: unknown) => [
                  Number(value).toLocaleString("vi-VN"),
                  String(name),
                ]}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                stroke="none"
              >
                {chartData.map((item) => (
                  <Cell key={item.key} fill={item.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend list breakdown */}
      <div className="space-y-2 border-t border-slate-100 pt-3">
        {chartData.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-600 font-medium">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">
                {item.value.toLocaleString("vi-VN")}
              </span>
              <span className="text-slate-400 w-12 text-right">
                ({item.percentStr}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { useTranslation } from "react-i18next"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
import { AlertTriangle } from "lucide-react"
import type { CategoryCount, StatisticsPredictionLabel } from "@/types/statistics"

interface MemberHealthResultChartProps {
  data: CategoryCount<StatisticsPredictionLabel>[]
}

const PREDICTION_COLORS: Record<StatisticsPredictionLabel, string> = {
  NORMAL: "#10b981",
  AFIB: "#ef4444",
  AFIB_SUSPECTED: "#f59e0b",
  UNCERTAIN: "#94a3b8",
}

export function MemberHealthResultChart({
  data,
}: MemberHealthResultChartProps) {
  const { t } = useTranslation("health")

  const filteredData = data.filter(
    (item) => item.key !== "UNCERTAIN" && item.key !== "AFIB_SUSPECTED"
  )
  const totalResults = filteredData.reduce((sum, item) => sum + item.count, 0)

  // Map results strictly by KEY
  const chartData = filteredData.map((item) => {
    const label = t(`memberStatistics.health.results.${item.key}`, {
      defaultValue: item.key,
    })
    const color = PREDICTION_COLORS[item.key] || "#94a3b8"
    const percentNum = totalResults > 0 ? (item.count / totalResults) * 100 : 0
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
      <div>
        <h3 className="text-base font-bold text-slate-900">
          {t("memberStatistics.health.resultDistribution.title")}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {t("memberStatistics.health.resultDistribution.description")}
        </p>
      </div>

      <div className="h-[210px] w-full my-3">
        {totalResults === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            {t("memberStatistics.health.resultDistribution.empty")}
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

      {/* Medical disclaimer note */}
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-500 border border-slate-100">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
        <span>{t("memberStatistics.health.resultDistribution.disclaimer")}</span>
      </div>
    </div>
  )
}

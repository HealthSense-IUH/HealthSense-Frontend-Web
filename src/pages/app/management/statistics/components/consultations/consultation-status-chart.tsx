import { useTranslation } from "react-i18next"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
import type { CategoryCount, StatisticsConsultationStatus } from "@/types/statistics"

interface ConsultationStatusChartProps {
  data: CategoryCount<StatisticsConsultationStatus>[]
}

const CONSULTATION_STATUS_COLORS: Record<StatisticsConsultationStatus, string> = {
  SCHEDULED: "#06b6d4",
  ACTIVE: "#3b82f6",
  COMPLETED: "#10b981",
  CANCELLED: "#ef4444",
}

export function ConsultationStatusChart({
  data,
}: ConsultationStatusChartProps) {
  const { t } = useTranslation("management")

  const totalSessions = data.reduce((sum, item) => sum + item.count, 0)

  // Map status strictly by KEY
  const chartData = data.map((item) => {
    const label = t(`statistics.consultations.statuses.${item.key}`, {
      defaultValue: item.key,
    })
    const color = CONSULTATION_STATUS_COLORS[item.key] || "#94a3b8"
    // Safe percentage calculation: 0 if totalSessions === 0 to avoid NaN
    const percentNum =
      totalSessions > 0 ? (item.count / totalSessions) * 100 : 0
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
          {t("statistics.consultations.statusDistribution.title")}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {t("statistics.consultations.statusDistribution.description")}
        </p>
      </div>

      <div className="h-[210px] w-full my-3">
        {totalSessions === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            {t("statistics.consultations.statusDistribution.empty")}
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
            <div className="flex items-center gap-2 font-medium text-slate-700">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.name}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="font-semibold text-slate-900">
                {item.value.toLocaleString("vi-VN")}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                ({item.percentStr}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { Users, Stethoscope, UserCheck, AlertTriangle } from "lucide-react"
import { ResponsiveContainer, LineChart, Line } from "recharts"
import { useTranslation } from "react-i18next"

import { formatCount } from "../data/admin-format"
import type { MetricItem } from "../data/super-admin-dashboard.mock"

export function MetricCard({ item }: { item: MetricItem }) {
  const { t } = useTranslation("health")
  const chartData = item.trend.map((val, index) => ({ index, value: val }))

  const getIcon = () => {
    switch (item.iconType) {
      case "users":
        return <Users className="h-5 w-5 text-primary-600" />
      case "doctors":
        return <Stethoscope className="h-5 w-5 text-success-600" />
      case "members":
        return <UserCheck className="h-5 w-5 text-success-600" />
      case "alerts":
        return <AlertTriangle className="h-5 w-5 text-danger-600" />
    }
  }

  const getBadgeStyle = () => {
    switch (item.changeStatus) {
      case "positive":
        return "text-success-700 bg-success-50 border-success-200/80"
      case "warning":
        return "text-warning-700 bg-warning-50 border-warning-200/80"
      case "critical":
        return "text-danger-700 bg-danger-50 border-danger-200/80 font-bold"
      default:
        return "text-slate-700 bg-slate-50 border-slate-200"
    }
  }

  const getLineColor = () => {
    switch (item.changeStatus) {
      case "positive":
        return "var(--color-success-500)"
      case "warning":
        return "var(--color-warning-500)"
      case "critical":
        return "var(--color-danger-500)"
      default:
        return "var(--color-slate-500)"
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between h-36">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {t(`adminDashboard.metrics.${item.id}`)}
        </span>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shadow-2xs">
          {getIcon()}
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 mt-2">
        <div>
          <h3 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
            {formatCount(item.value)}
          </h3>
          <span
            className={`mt-1 inline-block rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getBadgeStyle()}`}
          >
            {t(`adminDashboard.metrics.change.${item.change.key}`, {
              count: item.change.values.count,
              // Số hiển thị định dạng theo ngôn ngữ (8,2 / 8.2); count giữ dạng số để chọn số ít / số nhiều
              ...Object.fromEntries(Object.entries(item.change.values).map(([k, v]) => [k === "count" ? "countText" : k, formatCount(v)])),
            })}
          </span>
        </div>

        {/* Tiny Recharts Sparkline wrapped in ResponsiveContainer with fixed container height */}
        <div className="h-11 w-24 pb-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={getLineColor()}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

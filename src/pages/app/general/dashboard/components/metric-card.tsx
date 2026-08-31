import { Users, Stethoscope, UserCheck, AlertTriangle } from "lucide-react"
import { ResponsiveContainer, LineChart, Line } from "recharts"

import type { MetricItem } from "../data/super-admin-dashboard.mock"

export function MetricCard({ item }: { item: MetricItem }) {
  const chartData = item.trend.map((val, index) => ({ index, value: val }))

  const getIcon = () => {
    switch (item.iconType) {
      case "users":
        return <Users className="h-5 w-5 text-blue-600" />
      case "doctors":
        return <Stethoscope className="h-5 w-5 text-teal-600" />
      case "members":
        return <UserCheck className="h-5 w-5 text-emerald-600" />
      case "alerts":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
    }
  }

  const getBadgeStyle = () => {
    switch (item.changeStatus) {
      case "positive":
        return "text-emerald-700 bg-emerald-50 border-emerald-200/80"
      case "warning":
        return "text-amber-700 bg-amber-50 border-amber-200/80"
      case "critical":
        return "text-red-700 bg-red-50 border-red-200/80 font-bold"
      default:
        return "text-slate-700 bg-slate-50 border-slate-200"
    }
  }

  const getLineColor = () => {
    switch (item.changeStatus) {
      case "positive":
        return "#10b981" // emerald
      case "warning":
        return "#f59e0b" // amber
      case "critical":
        return "#ef4444" // red
      default:
        return "#64748b" // slate
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between h-36">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {item.label}
        </span>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shadow-2xs">
          {getIcon()}
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 mt-2">
        <div>
          <h3 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
            {item.value}
          </h3>
          <span
            className={`mt-1 inline-block rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getBadgeStyle()}`}
          >
            {item.changeText}
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

import { useTranslation } from "react-i18next"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import type { HourCount } from "@/types/statistics"

interface MemberHealthHourChartProps {
  data: HourCount[]
}

export function MemberHealthHourChart({
  data,
}: MemberHealthHourChartProps) {
  const { t } = useTranslation("health")

  // Ensure all 24 hours are present
  const fullHourData = Array.from({ length: 24 }).map((_, hour) => {
    const found = data.find((d) => d.hour === hour)
    return {
      hour,
      hourLabel: `${hour}h`,
      count: found ? found.count : 0,
    }
  })

  const totalHourCounts = fullHourData.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            {t("memberStatistics.health.hourDistribution.title")}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t("memberStatistics.health.hourDistribution.description")}
          </p>
        </div>
      </div>

      <div className="h-[250px] w-full mt-4">
        {totalHourCounts === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            {t("memberStatistics.health.hourDistribution.empty")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={fullHourData}
              margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="hourLabel"
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                tick={{ fill: "#64748b", fontSize: 11 }}
                interval={1}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  borderColor: "#e2e8f0",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                }}
                formatter={(value: unknown) => [
                  Number(value).toLocaleString("vi-VN"),
                  t("memberStatistics.health.hourDistribution.countLabel"),
                ]}
                labelFormatter={(label) => `${label} - ${Number(String(label).replace("h", "")) + 1}h`}
              />
              <Bar
                dataKey="count"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

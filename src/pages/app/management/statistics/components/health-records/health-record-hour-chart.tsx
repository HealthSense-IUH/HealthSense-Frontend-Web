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

interface HealthRecordHourChartProps {
  data: HourCount[]
}

export function HealthRecordHourChart({ data }: HealthRecordHourChartProps) {
  const { t } = useTranslation("management")

  const chartData = data.map((item) => ({
    ...item,
    formattedHour: `${String(item.hour).padStart(2, "0")}:00`,
  }))

  const totalInHours = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
      <div>
        <h3 className="text-base font-bold text-slate-900">
          {t("statistics.healthRecords.recordedHourDistribution.title")}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {t("statistics.healthRecords.recordedHourDistribution.description")}
        </p>
      </div>

      <div className="h-[210px] w-full my-3">
        {totalInHours === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            {t("statistics.healthRecords.recordedHourDistribution.empty")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="formattedHour"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval={2} // Show every 2-3 hours to avoid crowding 24 ticks
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  borderColor: "#e2e8f0",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
                formatter={(value: unknown) => [
                  Number(value).toLocaleString("vi-VN"),
                  t("statistics.healthRecords.recordedHourDistribution.countLabel"),
                ]}
                labelFormatter={(label) => `${label}`}
              />
              <Bar
                dataKey="count"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="border-t border-slate-100 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-500">
        <span className="line-clamp-1">
          {t("statistics.healthRecords.recordedHourDistribution.tooltip")}
        </span>
        <span className="font-semibold text-slate-700 shrink-0">
          {t("statistics.healthRecords.recordedHourDistribution.countLabel")}:{" "}
          {totalInHours.toLocaleString("vi-VN")}
        </span>
      </div>
    </div>
  )
}

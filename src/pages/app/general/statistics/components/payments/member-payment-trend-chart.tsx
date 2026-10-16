import { useTranslation } from "react-i18next"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import type {
  MemberPaymentTrendBucket,
  StatisticsGroupBy,
} from "@/types/statistics"

interface MemberPaymentTrendChartProps {
  data: MemberPaymentTrendBucket[]
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

export function MemberPaymentTrendChart({
  data,
  groupBy,
}: MemberPaymentTrendChartProps) {
  const { t } = useTranslation("health")

  const totalPaidInPeriod = data.reduce((sum, item) => sum + item.paidVnd, 0)
  const chartData = data.map((item) => ({
    ...item,
    formattedLabel: formatBucketLabel(
      item.bucketStart,
      groupBy,
      (date) => t("memberStatistics.filter.weekFrom", { date })
    ),
  }))

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            {t("memberStatistics.payments.trend.title")}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t("memberStatistics.payments.trend.description")}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="rounded-xl bg-amber-50 text-amber-700 font-semibold px-3 py-1.5 text-xs border border-amber-100">
            {t("memberStatistics.payments.trend.paidVndLabel")}:{" "}
            <strong className="font-bold text-amber-800">
              {totalPaidInPeriod.toLocaleString("vi-VN")} ₫
            </strong>
          </span>
        </div>
      </div>

      <div className="h-[280px] w-full mt-4">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            {t("memberStatistics.payments.trend.empty")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="colorMemberPayments"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#d97706" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
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
                tick={{ fill: "#64748b", fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickFormatter={(val: number) => {
                  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}tr`
                  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`
                  return String(val)
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  borderColor: "#e2e8f0",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                }}
                formatter={(value: unknown, name: unknown) => {
                  const num = Number(value)
                  if (name === "paidVnd") {
                    return [`${num.toLocaleString("vi-VN")} ₫`, t("memberStatistics.payments.trend.paidVndLabel")]
                  }
                  if (name === "purchasedCredits") {
                    return [num.toLocaleString("vi-VN"), t("memberStatistics.payments.trend.creditsLabel")]
                  }
                  return [num.toLocaleString("vi-VN"), t("memberStatistics.payments.trend.ordersLabel")]
                }}
                labelFormatter={(label) => String(label)}
              />
              <Area
                type="monotone"
                dataKey="paidVnd"
                stroke="#d97706"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorMemberPayments)"
                activeDot={{ r: 5, fill: "#d97706", stroke: "#ffffff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

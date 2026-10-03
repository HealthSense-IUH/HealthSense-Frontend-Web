import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Activity, Droplets, HeartPulse, Loader2, RefreshCcw } from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Page, PageBody, PageHeader } from "@/components/layout/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { healthRecordApi } from "@/services"
import type { HealthStatisticsResponse, MemberHealthRecord } from "@/types/health-record"

interface DayAggregate {
  date: string
  label: string
  avgHr: number | null
  maxHr: number | null
  minHr: number | null
  count: number
}

function aggregateByDay(records: MemberHealthRecord[]): DayAggregate[] {
  const byDay = new Map<string, { hr: number[]; hrMax: number[]; hrMin: number[] }>()

  for (const record of records) {
    if (record.status !== "COMPLETED" || !record.hrvFeatures) continue
    const hr = record.hrvFeatures.HR_mean
    if (typeof hr !== "number") continue

    const date = record.createdAt.slice(0, 10)
    const bucket = byDay.get(date) ?? { hr: [], hrMax: [], hrMin: [] }
    bucket.hr.push(hr)
    if (typeof record.hrvFeatures.hrMax === "number") bucket.hrMax.push(record.hrvFeatures.hrMax)
    if (typeof record.hrvFeatures.hrMin === "number") bucket.hrMin.push(record.hrvFeatures.hrMin)
    byDay.set(date, bucket)
  }

  const mean = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, bucket]) => ({
      date,
      label: date.slice(5).replace("-", "/"),
      avgHr: mean(bucket.hr) !== null ? Math.round(mean(bucket.hr) as number) : null,
      maxHr: bucket.hrMax.length ? Math.round(Math.max(...bucket.hrMax)) : null,
      minHr: bucket.hrMin.length ? Math.round(Math.min(...bucket.hrMin)) : null,
      count: bucket.hr.length,
    }))
}

function collectMetric(records: MemberHealthRecord[], key: string): number[] {
  return records
    .filter((r) => r.status === "COMPLETED" && r.hrvFeatures)
    .map((r) => r.hrvFeatures?.[key])
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v))
}

export default function ReportsPage() {
  const { t } = useTranslation("health")
  const [records, setRecords] = useState<MemberHealthRecord[]>([])
  const [stats, setStats] = useState<HealthStatisticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadFailed(false)
    try {
      const [recordsRes, statsRes] = await Promise.all([
        healthRecordApi.getMyRecords({ page: 1, size: 100 }),
        healthRecordApi.getHealthStatistics({ period: "MONTH" }),
      ])
      setRecords(recordsRes.data?.content ?? [])
      setStats(statsRes.data ?? null)
    } catch (err) {
      console.error("Failed to load reports data:", err)
      setLoadFailed(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const trend = useMemo(() => aggregateByDay(records), [records])

  const summary = useMemo(() => {
    const hrValues = collectMetric(records, "HR_mean")
    const spo2Values = collectMetric(records, "deviceSpO2")
    const rmssdValues = collectMetric(records, "RMSSD")
    const mean = (arr: number[]) =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null
    return {
      avgHr: mean(hrValues),
      avgSpO2: mean(spo2Values),
      avgRmssd: mean(rmssdValues),
      totalMeasurements: records.filter((r) => r.status === "COMPLETED").length,
    }
  }, [records])

  const totalScreened =
    (stats?.totalNormal ?? 0) +
    (stats?.totalAfibRisk ?? 0) +
    (stats?.totalUncertain ?? 0) +
    (stats?.totalAfibSuspected ?? 0)

  return (
    <Page>
      <PageHeader
        title={t("reports.title")}
        description={t("reports.description", { count: summary.totalMeasurements })}
        actions={
          <Button
            variant="outline"
            onClick={() => void loadData()}
            disabled={loading}
            className="rounded-xl bg-white border-0 shadow-sm h-10"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="mr-2 h-4 w-4" />
            )}
            {t("reports.refresh")}
          </Button>
        }
      />

      <PageBody>
        {loadFailed && (
          <div className="rounded-2xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700">
            {t("reports.loadError")}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="rounded-2xl border-0 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <HeartPulse className="h-4 w-4 text-danger-500" /> {t("reports.avgHeartRate")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">
                  {summary.avgHr !== null ? Math.round(summary.avgHr) : "--"}
                </span>
                <span className="text-sm text-muted-foreground">BPM</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t("reports.heartRateReference")}</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <Droplets className="h-4 w-4 text-primary-500" /> {t("reports.avgSpo2")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">
                  {summary.avgSpO2 !== null ? Math.round(summary.avgSpO2) : "--"}
                </span>
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {summary.avgSpO2 !== null
                  ? t("reports.spo2Reference")
                  : t("reports.spo2NoData")}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-success-500" /> {t("reports.avgHrv")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">
                  {summary.avgRmssd !== null ? Math.round(summary.avgRmssd) : "--"}
                </span>
                <span className="text-sm text-muted-foreground">ms</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("reports.hrvHint")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Kết quả tầm soát 30 ngày */}
        {stats && totalScreened > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: t("reports.screening.normal"), value: stats.totalNormal, cls: "text-success-600" },
              { label: t("reports.screening.uncertain"), value: stats.totalUncertain, cls: "text-warning-600" },
              { label: t("reports.screening.afibSuspected"), value: stats.totalAfibSuspected, cls: "text-warning-600" },
              { label: t("reports.screening.afib"), value: stats.totalAfibRisk, cls: "text-danger-600" },
            ].map((item) => (
              <div
                key={item.label}
                className="p-3.5 rounded-2xl bg-white border-0 shadow-sm"
              >
                <span className="text-xs text-muted-foreground font-medium block">{item.label}</span>
                <span className={`text-2xl font-bold ${item.cls}`}>{item.value}</span>
                <span className="text-[11px] text-muted-foreground block">{t("reports.screening.per30Days")}</span>
              </div>
            ))}
          </div>
        )}

        {/* Xu hướng nhịp tim theo ngày */}
        <Card className="rounded-2xl border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle>{t("reports.trend.title")}</CardTitle>
            <CardDescription>
              {t("reports.trend.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : trend.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <HeartPulse className="h-10 w-10 opacity-30" />
                <p className="text-sm">{t("reports.trend.empty")}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-slate-200)" />
                  <XAxis dataKey="label" stroke="var(--color-slate-400)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-slate-400)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    formatter={(value, name) => [`${String(value ?? "--")} BPM`, name]}
                    labelFormatter={(label) => t("reports.trend.tooltipDate", { date: String(label ?? "") })}
                  />
                  <Line
                    type="monotone"
                    dataKey="maxHr"
                    name={t("reports.trend.max")}
                    stroke="var(--color-danger-500)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="avgHr"
                    name={t("reports.trend.avg")}
                    stroke="var(--color-primary-500)"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="minHr"
                    name={t("reports.trend.min")}
                    stroke="var(--color-slate-400)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </PageBody>
    </Page>
  )
}

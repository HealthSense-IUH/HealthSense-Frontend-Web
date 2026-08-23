import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  Activity,
  HeartPulse,
  TrendingUp,
  Sliders,
  ChevronRight,
  Eye,
} from "lucide-react"
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { healthRecordApi } from "@/features/member-health-records/services/health-record-api"
import { HealthRecordDetailModal } from "@/features/member-health-records/components/HealthRecordDetailModal"
import { 
  getPredictionMeta, 
  formatHrvNumber, 
  formatRecordDate 
} from "@/lib/health-record-labels"
import type { MemberHealthRecord, HealthStatisticsResponse } from "@/features/member-health-records/types"

type PeriodType = "DAY" | "WEEK" | "MONTH" | "YEAR"

export function MemberHealthDashboard() {
  const navigate = useNavigate()

  // State for stats & recent records
  const [stats, setStats] = useState<HealthStatisticsResponse | null>(null)
  const [recentRecords, setRecentRecords] = useState<MemberHealthRecord[]>([])
  const [period, setPeriod] = useState<PeriodType>("WEEK")
  const [loading, setLoading] = useState(true)

  // Modal states
  const [selectedRecord, setSelectedRecord] = useState<MemberHealthRecord | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Fetch Dashboard Data (Statistics + Recent Records)
  const loadDashboardData = useCallback(async () => {
    setLoading(true)

    try {
      const [statsRes, recordsRes] = await Promise.all([
        healthRecordApi.getHealthStatistics({ period, timezone: "Asia/Ho_Chi_Minh" }),
        healthRecordApi.getMyRecords({ page: 1, size: 5 }),
      ])

      setStats(statsRes.data || null)
      setRecentRecords(recordsRes.data?.content || [])
    } catch (err) {
      console.error("Failed to load dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Latest record for summary cards
  const latestRecord = recentRecords.length > 0 ? recentRecords[0] : null
  const latestMeta = latestRecord ? getPredictionMeta(latestRecord.predictionLabel, latestRecord.status) : null
  const latestHr = latestRecord?.hrvFeatures?.HR_mean ? Math.round(Number(latestRecord.hrvFeatures.HR_mean)) : null
  const latestRmssd = latestRecord?.hrvFeatures?.RMSSD ? Number(latestRecord.hrvFeatures.RMSSD) : null
  const latestSdnn = latestRecord?.hrvFeatures?.SDNN ? Number(latestRecord.hrvFeatures.SDNN) : null

  // Total summary counts
  const totalNormal = stats?.totalNormal || 0
  const totalAfib = stats?.totalAfibRisk || 0
  const totalSuspected = stats?.totalAfibSuspected || 0
  const totalUncertain = stats?.totalUncertain || 0
  const totalScreenings = totalNormal + totalAfib + totalSuspected + totalUncertain

  const chartData = stats?.chartData || []

  return (
    <div className="space-y-6 w-full pb-10">
      {/* 4 Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Latest Heart Rate */}
        <Card className="rounded-3xl border border-border shadow-xs bg-white dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium text-muted-foreground">Lần đo gần nhất</span>
            <HeartPulse className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold text-foreground">
              {latestHr ? `${latestHr} ` : "-- "}
              <span className="text-xs font-normal text-muted-foreground">BPM</span>
            </div>
            {latestRecord ? (
              <span className="text-xs text-muted-foreground block truncate">
                {formatRecordDate(latestRecord.createdAt)}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground block">Chưa có dữ liệu</span>
            )}
          </CardContent>
        </Card>

        {/* Latest AFib Probability */}
        <Card className="rounded-3xl border border-border shadow-xs bg-white dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium text-muted-foreground">Khả năng bị rung nhĩ</span>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold text-foreground">
              {latestRecord?.confidence !== null && latestRecord?.confidence !== undefined
                ? `${(latestRecord.confidence * 100).toFixed(1)}%`
                : "--"}
            </div>
            {latestMeta ? (
              <span className={`inline-flex items-center justify-center w-32 py-1 rounded-full text-xs font-bold border shadow-2xs ${latestMeta.badgeClass}`}>
                {latestMeta.badgeText}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground block">Chưa có kết luận</span>
            )}
          </CardContent>
        </Card>

        {/* Latest HRV (RMSSD / SDNN) */}
        <Card className="rounded-3xl border border-border shadow-xs bg-white dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium text-muted-foreground">Biến thiên nhịp (RMSSD)</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold text-foreground">
              {latestRmssd ? formatHrvNumber(latestRmssd, 1) : "--"}{" "}
              <span className="text-xs font-normal text-muted-foreground">ms</span>
            </div>
            <span className="text-xs text-muted-foreground block">
              SDNN: {latestSdnn ? `${formatHrvNumber(latestSdnn, 1)} ms` : "--"}
            </span>
          </CardContent>
        </Card>

        {/* Total Screenings */}
        <Card className="rounded-3xl border border-border shadow-xs bg-white dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium text-muted-foreground">Tổng lượt tầm soát</span>
            <Sliders className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold text-foreground">
              {totalScreenings}{" "}
              <span className="text-xs font-normal text-muted-foreground">lần đo</span>
            </div>
            <span className="text-xs text-muted-foreground block truncate">
              {totalNormal} bình thường • {totalAfib + totalSuspected} cảnh báo
            </span>
          </CardContent>
        </Card>
      </div>

      {/* 2-Column Grid: Left Chart + Right Recent Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: AI Screening Trends Chart (6 cols) */}
        <Card className="lg:col-span-6 rounded-3xl border border-border shadow-xs bg-white dark:bg-card flex flex-col justify-between">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Thống kê Phân bổ Tầm soát AI
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Số lượng các lần đo theo mốc thời gian
              </CardDescription>
            </div>

            {/* Period Selector Buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl">
              <button
                type="button"
                onClick={() => setPeriod("DAY")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  period === "DAY"
                    ? "bg-white dark:bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={() => setPeriod("WEEK")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  period === "WEEK"
                    ? "bg-white dark:bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Tuần
              </button>
              <button
                type="button"
                onClick={() => setPeriod("MONTH")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  period === "MONTH"
                    ? "bg-white dark:bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Tháng
              </button>
              <button
                type="button"
                onClick={() => setPeriod("YEAR")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  period === "YEAR"
                    ? "bg-white dark:bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Năm
              </button>
            </div>
          </CardHeader>

          <CardContent className="pt-6 flex-1 flex flex-col justify-center">
            {loading ? (
              <div className="h-72 w-full flex items-center justify-center p-4">
                <div className="h-48 w-full bg-slate-100 dark:bg-slate-800/40 rounded-2xl animate-pulse" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
                <Activity className="h-8 w-8 text-slate-300" />
                <p className="text-xs font-medium">Chưa có dữ liệu đo lường trong khoảng thời gian này</p>
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100 dark:stroke-slate-800" />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card, #ffffff)",
                        borderRadius: "16px",
                        border: "1px solid var(--border, #e2e8f0)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                        fontSize: "12px",
                        fontWeight: 500,
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: "12px", fontSize: "11px" }}
                    />
                    <Bar dataKey="normalCount" name="Bình thường" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="afibSuspectedCount" name="Nghi ngờ" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="afibRiskCount" name="Rung nhĩ" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="uncertainCount" name="Chưa rõ" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Recent Screenings Table (6 cols) */}
        <Card className="lg:col-span-6 rounded-3xl border border-border shadow-xs bg-white dark:bg-card flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Lịch sử Đo Gần Đây
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                5 lần đo mới nhất của bạn trên hệ thống
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/app/afib-history")}
              className="text-xs font-semibold text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl gap-1 cursor-pointer"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col justify-between">
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentRecords.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                <Activity className="h-8 w-8 text-slate-300" />
                <span>Chưa có bản ghi đo nào. Hãy tải lên file đầu tiên!</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-semibold bg-slate-50/50 dark:bg-slate-900/30">
                      <th className="py-3 px-4">Thời gian đo</th>
                      <th className="py-3 px-4">Kết luận AI</th>
                      <th className="py-3 px-4 text-center">Khả năng AFib</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-medium">
                    {recentRecords.map((record) => {
                      const meta = getPredictionMeta(record.predictionLabel, record.status)
                      const hr = record.hrvFeatures?.HR_mean ? Math.round(Number(record.hrvFeatures.HR_mean)) : null
                      const confPct = record.confidence !== null && record.confidence !== undefined 
                        ? (record.confidence * 100).toFixed(1) 
                        : null

                      return (
                        <tr 
                          key={record.id}
                          onClick={() => {
                            setSelectedRecord(record)
                            setIsDetailOpen(true)
                          }}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                        >
                          <td className="py-3 px-4">
                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {formatRecordDate(record.createdAt)}
                            </div>
                            <span className="text-[11px] text-muted-foreground truncate block max-w-[140px]">
                              {record.fileName}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center justify-center w-32 py-1 rounded-full text-xs font-bold border shadow-2xs ${meta.badgeClass}`}>
                              {meta.badgeText}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="font-bold text-foreground">
                              {confPct !== null ? `${confPct}%` : "--"}
                            </div>
                            <span className="text-[11px] text-muted-foreground block">
                              {hr ? `${hr} BPM` : ""}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedRecord(record)
                                setIsDetailOpen(true)
                              }}
                              className="h-8 px-3 rounded-xl bg-white dark:bg-slate-800 border border-border text-foreground hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>Xem chi tiết</span>
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <HealthRecordDetailModal
        record={selectedRecord}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setSelectedRecord(null)
        }}
      />
    </div>
  )
}

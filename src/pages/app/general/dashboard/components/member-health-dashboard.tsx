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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { healthRecordApi } from "@/services"
import { HealthRecordDetailModal } from "@/pages/app/general/afib-history/components/HealthRecordDetailModal"
import { HealthHeatmapCalendar } from "./health-heatmap-calendar"
import { MemberGreetingBanner } from "./member-greeting-banner"
import { 
  getPredictionMeta, 
  formatHrvNumber, 
  formatRecordDate 
} from "@/lib"
import type { MemberHealthRecord, HealthStatisticsResponse } from "@/types/health-record"

export function MemberHealthDashboard() {
  const navigate = useNavigate()

  // State for stats & recent records
  const [stats, setStats] = useState<HealthStatisticsResponse | null>(null)
  const [recentRecords, setRecentRecords] = useState<MemberHealthRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Modal states
  const [selectedRecord, setSelectedRecord] = useState<MemberHealthRecord | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Fetch Dashboard Data (Statistics + Recent Records)
  const loadDashboardData = useCallback(async () => {
    setLoading(true)

    try {
      const [statsRes, recordsRes] = await Promise.all([
        healthRecordApi.getHealthStatistics({ timezone: "Asia/Ho_Chi_Minh" }),
        healthRecordApi.getMyRecords({ page: 1, size: 5 }),
      ])

      setStats(statsRes.data || null)
      setRecentRecords(recordsRes.data?.content || [])
    } catch (err) {
      console.error("Failed to load dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

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

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Top Greeting Banner */}
      <MemberGreetingBanner />

      {/* 4 Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Latest Heart Rate */}
        <Card className="rounded-2xl border border-border shadow-2xs bg-card hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">Lần đo gần nhất</span>
            <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400 flex items-center justify-center">
              <HeartPulse className="h-4.5 w-4.5" />
            </div>
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

        {/* Latest AFib Risk Assessment */}
        <Card className="rounded-2xl border border-border shadow-2xs bg-card hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">Khả năng bị rung nhĩ</span>
            <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-500 dark:text-sky-400 flex items-center justify-center">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
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
              <span className="text-xs text-muted-foreground block">Chưa có đánh giá</span>
            )}
          </CardContent>
        </Card>

        {/* HRV Metrics (RMSSD & SDNN) */}
        <Card className="rounded-2xl border border-border shadow-2xs bg-card hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">Biến thiên nhịp (RMSSD)</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
              <Sliders className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold text-foreground">
              {latestRmssd ? `${formatHrvNumber(latestRmssd, 1)} ` : "-- "}
              <span className="text-xs font-normal text-muted-foreground">ms</span>
            </div>
            <span className="text-xs text-muted-foreground block">
              SDNN: {latestSdnn ? `${formatHrvNumber(latestSdnn, 1)} ms` : "--"}
            </span>
          </CardContent>
        </Card>

        {/* Total Screenings Summary */}
        <Card className="rounded-2xl border border-border shadow-2xs bg-card hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">Tổng lượt tầm soát</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
              <Activity className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold text-foreground">
              {totalScreenings} <span className="text-xs font-normal text-muted-foreground">lần</span>
            </div>
            <span className="text-xs text-muted-foreground block truncate">
              {totalNormal} bình thường • {totalAfib + totalSuspected} cảnh báo
            </span>
          </CardContent>
        </Card>
      </div>

      {/* 2-Column Grid: Health Heatmap Calendar (Left) vs Recent Screenings Table (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Heatmap Calendar (6 cols) */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-start">
          <HealthHeatmapCalendar
            onSelectRecord={(rec) => {
              setSelectedRecord(rec)
              setIsDetailOpen(true)
            }}
          />
        </div>

        {/* Right Column: Recent Screenings Table (6 cols) */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-start">
          {/* Recent Screenings Table */}
          <Card className="rounded-3xl border border-border shadow-xs bg-white dark:bg-card flex flex-col justify-between overflow-hidden">
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
                onClick={() => navigate("/app/general/afib-history")}
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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

import { useState, useEffect, useMemo, useCallback } from "react"
import { Calendar as CalendarIcon, Flame, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { healthRecordApi } from "@/services"
import type { MemberHealthRecord } from "@/types/health-record"

interface HealthHeatmapCalendarProps {
  onSelectRecord?: (record: MemberHealthRecord) => void
  className?: string
}

interface DayStatus {
  dateStr: string // YYYY-MM-DD
  dayOfMonth: number
  hasData: boolean
  isToday: boolean
  isFuture: boolean
  highestRiskLevel: "NORMAL" | "UNCERTAIN" | "AFIB_SUSPECTED" | "AFIB" | "NONE"
  recordCount: number
}

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
]

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

export function HealthHeatmapCalendar({ onSelectRecord, className = "" }: HealthHeatmapCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedDateRecords, setSelectedDateRecords] = useState<MemberHealthRecord[]>([])
  const [loadingRecords, setLoadingRecords] = useState(false)

  // Fetch all dates with measurements on mount
  const fetchAvailableDates = useCallback(async () => {
    try {
      const res = await healthRecordApi.getAvailableHistoryDates("Asia/Ho_Chi_Minh")
      if (res.data) {
        setAvailableDates(res.data)
      }
    } catch (err) {
      console.error("Failed to fetch available history dates:", err)
    }
  }, [])

  useEffect(() => {
    fetchAvailableDates()
  }, [fetchAvailableDates])

  // Month navigation
  const prevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    setSelectedDate(null)
    setSelectedDateRecords([])
  }

  const nextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    setSelectedDate(null)
    setSelectedDateRecords([])
  }

  const resetToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(null)
    setSelectedDateRecords([])
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const totalDays = lastDayOfMonth.getDate()

    // Day of week: 0 (Sun) to 6 (Sat) -> Convert to 0 (Mon) to 6 (Sun)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1
    if (startDayOfWeek < 0) startDayOfWeek = 6

    const days: (DayStatus | null)[] = []

    // Padding empty days before start of month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }

    const availableSet = new Set(availableDates)

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const isToday = dateStr === todayStr
      const dayDate = new Date(year, month, day)
      const isFuture = dayDate > today
      const hasData = availableSet.has(dateStr)

      days.push({
        dateStr,
        dayOfMonth: day,
        hasData,
        isToday,
        isFuture,
        highestRiskLevel: hasData ? "NORMAL" : "NONE",
        recordCount: hasData ? 1 : 0,
      })
    }

    return days
  }, [year, month, availableDates])

  // Handle day click -> load records for that date
  const handleDayClick = async (day: DayStatus) => {
    if (!day.hasData) return

    setSelectedDate(day.dateStr)
    setLoadingRecords(true)

    try {
      const res = await healthRecordApi.getRecordsByDate(day.dateStr, "Asia/Ho_Chi_Minh")
      setSelectedDateRecords(res.data || [])
    } catch (err) {
      console.error("Failed to load records for date:", day.dateStr, err)
      setSelectedDateRecords([])
    } finally {
      setLoadingRecords(false)
    }
  }

  // Calculate month metrics
  const activeDaysThisMonth = useMemo(() => {
    return calendarDays.filter((d) => d && d.hasData).length
  }, [calendarDays])

  return (
    <Card className={`rounded-3xl border border-border shadow-xs bg-white dark:bg-card overflow-hidden flex flex-col justify-between ${className}`}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <CardTitle className="text-base font-bold text-foreground">
              Lịch Theo Dõi & Bản Đồ Nhiệt Đo Nhịp Tim
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Tổng quan tần suất tầm soát và phân bố an toàn theo từng ngày trong tháng
          </CardDescription>
        </div>

        {/* Month Navigation & Legend */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-card text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-foreground px-2 min-w-[100px] text-center">
              {MONTH_NAMES[month]} / {year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-card text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetToToday}
            className="h-8 text-xs font-semibold rounded-xl text-primary hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            Hôm nay
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-5">
        {/* Top Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-border flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">Số ngày đã đo</span>
              <strong className="text-sm font-bold text-foreground">{activeDaysThisMonth} ngày</strong>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-border flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">Tổng ngày lịch sử</span>
              <strong className="text-sm font-bold text-foreground">{availableDates.length} ngày</strong>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-border col-span-2 sm:col-span-1 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-md bg-emerald-500" />
              <span className="text-xs text-muted-foreground font-medium">Có bản ghi đo</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-md bg-slate-100 dark:bg-slate-800 border border-border" />
              <span className="text-xs text-muted-foreground font-medium">Chưa đo</span>
            </div>
          </div>
        </div>

        {/* Heatmap Month Grid */}
        <div className="border border-border rounded-2xl p-4 bg-slate-50/40 dark:bg-slate-900/20">
          {/* Day of week header */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[11px] font-bold text-muted-foreground">
            {DAY_LABELS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="h-11 rounded-xl bg-transparent" />
              }

              const isSelected = selectedDate === day.dateStr

              return (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  disabled={!day.hasData}
                  title={`${day.dateStr}${day.hasData ? " (Nhấn để xem các lần đo)" : ""}`}
                  className={`h-11 rounded-xl flex flex-col items-center justify-center transition-all relative font-semibold text-xs ${
                    day.hasData
                      ? isSelected
                        ? "bg-emerald-600 text-white ring-2 ring-emerald-500 ring-offset-2 shadow-md cursor-pointer scale-105"
                        : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-900 dark:text-emerald-300 border border-emerald-400/30 hover:border-emerald-500 cursor-pointer shadow-2xs"
                      : day.isToday
                        ? "bg-white dark:bg-card border-2 border-primary text-primary font-bold"
                        : day.isFuture
                          ? "bg-slate-100/40 dark:bg-slate-800/20 text-slate-300 dark:text-slate-700 cursor-not-allowed"
                          : "bg-white dark:bg-card border border-border text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-default"
                  }`}
                >
                  <span>{day.dayOfMonth}</span>
                  {day.hasData && (
                    <span className={`h-1.5 w-1.5 rounded-full mt-0.5 ${isSelected ? "bg-white" : "bg-emerald-500"}`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected Date Measurements Panel */}
        {selectedDate && (
          <div className="p-4 rounded-2xl bg-white dark:bg-card border border-border shadow-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  Các lần đo ngày {selectedDate}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                  {selectedDateRecords.length} lần đo
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate(null)}
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                Đóng
              </Button>
            </div>

            {loadingRecords ? (
              <div className="py-6 text-center text-xs text-muted-foreground animate-pulse">
                Đang tải dữ liệu đo của ngày {selectedDate}...
              </div>
            ) : selectedDateRecords.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                Không tìm thấy bản ghi đo nào trong ngày này.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedDateRecords.map((record) => {
                  const hr = record.hrvFeatures?.HR_mean ? Math.round(Number(record.hrvFeatures.HR_mean)) : null
                  const confPct = record.confidence !== null && record.confidence !== undefined 
                    ? (record.confidence * 100).toFixed(1) 
                    : null

                  return (
                    <div
                      key={record.id}
                      onClick={() => onSelectRecord?.(record)}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-xs font-bold text-foreground truncate block">
                          File: {record.fileName}
                        </span>
                        <span className="text-[11px] text-muted-foreground block">
                          {hr ? `Nhịp tim: ${hr} BPM` : "Nhịp tim: --"} • {confPct ? `Khả năng AFib: ${confPct}%` : ""}
                        </span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs font-semibold rounded-lg bg-white dark:bg-card shrink-0"
                      >
                        Chi tiết
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

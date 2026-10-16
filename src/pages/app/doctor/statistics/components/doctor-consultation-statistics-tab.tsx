import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import {
  CalendarClock,
  CheckCircle2,
  XCircle,
  Clock,
  PlayCircle,
  Percent,
  Layers,
  HelpCircle,
  AlertCircle,
  RotateCw,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  type StatisticsPreset,
  getPresetDateRange,
  toStartOfDayInstant,
  nextDayOf,
} from "@/pages/app/general/statistics/utils/date-range"
import { useDoctorConsultationStatistics } from "../hooks/use-doctor-consultation-statistics"
import { DoctorStatisticsFilterBar } from "./doctor-statistics-filter-bar"

export function DoctorConsultationStatisticsTab() {
  const { t } = useTranslation("health")

  const [preset, setPreset] = useState<StatisticsPreset>("7d")
  const initialRange = useMemo(() => getPresetDateRange("7d"), [])
  const [startDateStr, setStartDateStr] = useState(initialRange.startDateStr)
  const [endDateStr, setEndDateStr] = useState(initialRange.endDateStr)

  // API ISO Instant Range: [startDate 00:00:00+07:00, (endDate + 1 day) 00:00:00+07:00)
  const apiRange = useMemo(() => {
    return {
      from: toStartOfDayInstant(startDateStr),
      to: toStartOfDayInstant(nextDayOf(endDateStr)),
    }
  }, [startDateStr, endDateStr])

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useDoctorConsultationStatistics(apiRange)

  const handlePresetChange = (newPreset: StatisticsPreset) => {
    setPreset(newPreset)
    if (newPreset !== "custom") {
      const range = getPresetDateRange(newPreset)
      setStartDateStr(range.startDateStr)
      setEndDateStr(range.endDateStr)
    }
  }

  const handleCustomRangeChange = (start: string, end: string) => {
    setStartDateStr(start)
    setEndDateStr(end)
  }

  const summary = data?.summary

  return (
    <div className="space-y-6">
      {/* Date Filter Bar */}
      <DoctorStatisticsFilterBar
        preset={preset}
        startDateStr={startDateStr}
        endDateStr={endDateStr}
        isFetching={isFetching}
        onPresetChange={handlePresetChange}
        onCustomRangeChange={handleCustomRangeChange}
        onRefresh={() => refetch()}
      />

      {/* Error state */}
      {error && !isLoading && (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm font-medium text-red-800">
            {t("doctorStatistics.error.loadFailed")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-xl border-red-200 text-red-700 hover:bg-red-100/50"
          >
            <RotateCw className="w-3.5 h-3.5 mr-1.5" />
            {t("doctorStatistics.filter.refresh")}
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-5 rounded-2xl border-slate-200/80 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-xl" />
              </div>
              <Skeleton className="h-7 w-20 rounded-md" />
              <Skeleton className="h-3 w-36 rounded-md" />
            </Card>
          ))}
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && summary && (
        <div className="space-y-6">
          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Tổng phiên toàn thời gian */}
            <Card className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t("doctorStatistics.consultations.summary.totalConsultations")}
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Layers className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  {summary.totalConsultations.toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {t("doctorStatistics.consultations.summary.totalConsultationsDesc")}
              </p>
            </Card>

            {/* 2. Phiên trong kỳ */}
            <Card className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {t("doctorStatistics.consultations.summary.consultationsInPeriod")}
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-slate-400 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-xs">
                        {t("doctorStatistics.consultations.summary.cohortTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <CalendarClock className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  {summary.consultationsInPeriod.toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {t("doctorStatistics.consultations.summary.consultationsInPeriodDesc", {
                  from: startDateStr,
                  to: endDateStr,
                })}
              </p>
            </Card>

            {/* 3. Đã lên lịch */}
            <Card className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t("doctorStatistics.consultations.summary.scheduledInPeriod")}
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Clock className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  {summary.scheduledInPeriod.toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {t("doctorStatistics.consultations.summary.scheduledInPeriodDesc")}
              </p>
            </Card>

            {/* 4. Đang diễn ra */}
            <Card className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t("doctorStatistics.consultations.summary.activeInPeriod")}
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <PlayCircle className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  {summary.activeInPeriod.toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {t("doctorStatistics.consultations.summary.activeInPeriodDesc")}
              </p>
            </Card>

            {/* 5. Đã hoàn thành */}
            <Card className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t("doctorStatistics.consultations.summary.completedInPeriod")}
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold tracking-tight text-emerald-600">
                  {summary.completedInPeriod.toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {t("doctorStatistics.consultations.summary.completedInPeriodDesc")}
              </p>
            </Card>

            {/* 6. Đã hủy */}
            <Card className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t("doctorStatistics.consultations.summary.cancelledInPeriod")}
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <XCircle className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold tracking-tight text-rose-600">
                  {summary.cancelledInPeriod.toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {t("doctorStatistics.consultations.summary.cancelledInPeriodDesc")}
              </p>
            </Card>

            {/* 7. Tỷ lệ hoàn thành (%) */}
            <Card className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t("doctorStatistics.consultations.summary.completionRate")}
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <Percent className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold tracking-tight text-teal-700">
                  {summary.completionRate.toFixed(1)}%
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {t("doctorStatistics.consultations.summary.completionRateDesc")}
              </p>
            </Card>

            {/* 8. Tỷ lệ hủy (%) */}
            <Card className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t("doctorStatistics.consultations.summary.cancellationRate")}
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <Percent className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold tracking-tight text-orange-700">
                  {summary.cancellationRate.toFixed(1)}%
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {t("doctorStatistics.consultations.summary.cancellationRateDesc")}
              </p>
            </Card>
          </div>

          {/* Empty banner if no sessions in period */}
          {summary.consultationsInPeriod === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500 text-sm">
              {t("doctorStatistics.consultations.empty")}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

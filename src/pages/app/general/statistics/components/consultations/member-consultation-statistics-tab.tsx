import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { StatisticsGroupBy } from "@/types/statistics"

import { useMemberConsultationStatistics } from "../../hooks/use-member-consultation-statistics"
import {
  DASHBOARD_TIMEZONE,
  type StatisticsPreset,
  getPresetDateRange,
  nextDayOf,
  toStartOfDayInstant,
} from "../../utils/date-range"

import { MemberStatisticsFilterBar } from "../member-statistics-filter-bar"
import { MemberConsultationSummaryCards } from "./member-consultation-summary-cards"
import { MemberConsultationTrendChart } from "./member-consultation-trend-chart"
import { MemberConsultationStatusChart } from "./member-consultation-status-chart"
import { StatisticsSkeleton } from "../statistics-skeleton"

export function MemberConsultationStatisticsTab() {
  const { t } = useTranslation("health")

  // Tab-specific filter state
  const defaultRange = useMemo(() => getPresetDateRange("7d"), [])
  const [preset, setPreset] = useState<StatisticsPreset>("7d")
  const [startDateStr, setStartDateStr] = useState(defaultRange.startDateStr)
  const [endDateStr, setEndDateStr] = useState(defaultRange.endDateStr)
  const [groupBy, setGroupBy] = useState<StatisticsGroupBy>("DAY")

  const queryParams = useMemo(() => {
    const from = toStartOfDayInstant(startDateStr)
    const nextDay = nextDayOf(endDateStr)
    const to = toStartOfDayInstant(nextDay)
    return {
      from,
      to,
      groupBy,
      timezone: DASHBOARD_TIMEZONE,
    }
  }, [startDateStr, endDateStr, groupBy])

  const {
    data: statsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useMemberConsultationStatistics(queryParams)

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

  const errorMessage = useMemo(() => {
    if (!error) return null
    const err = error as {
      response?: { data?: { message?: string } }
      message?: string
    }
    return (
      err.response?.data?.message ||
      err.message ||
      t("memberStatistics.error.loadFailed")
    )
  }, [error, t])

  return (
    <div className="space-y-6">
      {/* Tab-specific Filter Bar */}
      <MemberStatisticsFilterBar
        preset={preset}
        startDateStr={startDateStr}
        endDateStr={endDateStr}
        groupBy={groupBy}
        isFetching={isFetching}
        onPresetChange={handlePresetChange}
        onCustomRangeChange={handleCustomRangeChange}
        onGroupByChange={setGroupBy}
        onRefresh={() => refetch()}
      />

      {/* Error Alert */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="text-red-700 hover:text-red-800 hover:bg-red-100/50 text-xs h-7"
          >
            {t("memberStatistics.filter.refresh")}
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && !statsData ? (
        <StatisticsSkeleton />
      ) : statsData ? (
        <div className="space-y-6">
          {/* 1. Summary Cards */}
          <MemberConsultationSummaryCards
            summary={statsData.summary}
            startDateStr={startDateStr}
            endDateStr={endDateStr}
          />

          {/* 2. Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MemberConsultationTrendChart
                data={statsData.consultationTrend || []}
                groupBy={statsData.period?.groupBy || groupBy}
              />
            </div>
            <div className="lg:col-span-1">
              <MemberConsultationStatusChart
                data={statsData.byStatus || []}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

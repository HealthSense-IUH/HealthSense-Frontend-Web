import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { StatisticsGroupBy } from "@/types/statistics"

import { useHealthRecordStatistics } from "../../hooks/use-health-record-statistics"
import {
  DASHBOARD_TIMEZONE,
  type StatisticsPreset,
  getPresetDateRange,
  nextDayOf,
  toStartOfDayInstant,
} from "../../utils/date-range"

import { StatisticsFilterBar } from "../statistics-filter-bar"
import { HealthRecordSummaryCards } from "./health-record-summary-cards"
import { HealthRecordTrendChart } from "./health-record-trend-chart"
import { HealthRecordResultChart } from "./health-record-result-chart"
import { HealthRecordHourChart } from "./health-record-hour-chart"
import { StatisticsSkeleton } from "../statistics-skeleton"

export function HealthRecordStatisticsTab() {
  const { t } = useTranslation("management")

  // Tab-specific filter state (independent from users & consultations tabs)
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
  } = useHealthRecordStatistics(queryParams)

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
      t("statistics.error.loadFailed")
    )
  }, [error, t])

  return (
    <div className="space-y-6">
      {/* Tab-specific Filter Bar */}
      <StatisticsFilterBar
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
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-7 text-xs border-red-200 text-red-700 hover:bg-red-100"
          >
            {t("statistics.error.retry")}
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <StatisticsSkeleton />
      ) : statsData ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <HealthRecordSummaryCards
            summary={statsData.summary}
            startDateStr={startDateStr}
            endDateStr={endDateStr}
          />

          {/* Record Trend Chart */}
          <HealthRecordTrendChart
            data={statsData.recordTrend || []}
            groupBy={statsData.period?.groupBy || groupBy}
          />

          {/* Breakdown Distributions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HealthRecordResultChart
              data={statsData.resultDistribution || []}
            />
            <HealthRecordHourChart
              data={statsData.recordedHourDistribution || []}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

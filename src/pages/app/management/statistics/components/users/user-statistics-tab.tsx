import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { StatisticsGroupBy } from "@/types/statistics"

import { useUserStatistics } from "../../hooks/use-user-statistics"
import {
  DASHBOARD_TIMEZONE,
  type StatisticsPreset,
  getPresetDateRange,
  nextDayOf,
  toStartOfDayInstant,
} from "../../utils/date-range"

import { StatisticsFilterBar } from "../statistics-filter-bar"
import { UserSummaryCards } from "../user-summary-cards"
import { RegistrationTrendChart } from "../registration-trend-chart"
import { RoleDistributionChart } from "../role-distribution-chart"
import { StatusDistributionChart } from "../status-distribution-chart"
import { StatisticsSkeleton } from "../statistics-skeleton"

export function UserStatisticsTab() {
  const { t } = useTranslation("management")

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
  } = useUserStatistics(queryParams)

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
      {/* Filter Bar */}
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
          <UserSummaryCards
            summary={statsData.summary}
            startDateStr={startDateStr}
            endDateStr={endDateStr}
          />

          {/* Registration Trend Chart */}
          <RegistrationTrendChart
            data={statsData.registrationTrend || []}
            groupBy={statsData.period?.groupBy || groupBy}
          />

          {/* Breakdown Distributions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RoleDistributionChart data={statsData.byRole || []} />
            <StatusDistributionChart data={statsData.byStatus || []} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

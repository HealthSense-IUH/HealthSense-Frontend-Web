import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Calendar, RotateCw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { StatisticsGroupBy } from "@/types/statistics"
import {
  type StatisticsPreset,
  getPresetDateRange,
  getDaysDifference,
} from "../utils/date-range"

interface MemberStatisticsFilterBarProps {
  preset: StatisticsPreset
  startDateStr: string
  endDateStr: string
  groupBy: StatisticsGroupBy
  isFetching: boolean
  onPresetChange: (preset: StatisticsPreset) => void
  onCustomRangeChange: (start: string, end: string) => void
  onGroupByChange: (groupBy: StatisticsGroupBy) => void
  onRefresh: () => void
}

export function MemberStatisticsFilterBar({
  preset,
  startDateStr,
  endDateStr,
  groupBy,
  isFetching,
  onPresetChange,
  onCustomRangeChange,
  onGroupByChange,
  onRefresh,
}: MemberStatisticsFilterBarProps) {
  const { t } = useTranslation("health")

  const [tempStart, setTempStart] = useState(startDateStr)
  const [tempEnd, setTempEnd] = useState(endDateStr)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSelectPreset = (p: StatisticsPreset) => {
    setValidationError(null)
    onPresetChange(p)
    if (p !== "custom") {
      const range = getPresetDateRange(p)
      setTempStart(range.startDateStr)
      setTempEnd(range.endDateStr)
    }
  }

  const handleApplyCustomDates = (newStart: string, newEnd: string) => {
    if (!newStart || !newEnd) return

    if (newStart > newEnd) {
      setValidationError(t("memberStatistics.filter.rangeInvalid"))
      return
    }

    const diff = getDaysDifference(newStart, newEnd)
    if (diff > 366) {
      setValidationError(t("memberStatistics.filter.rangeExceeded"))
      return
    }

    setValidationError(null)
    onCustomRangeChange(newStart, newEnd)
  }

  const presets: { id: StatisticsPreset; label: string }[] = [
    { id: "7d", label: t("memberStatistics.filter.presets.7d") },
    { id: "30d", label: t("memberStatistics.filter.presets.30d") },
    { id: "90d", label: t("memberStatistics.filter.presets.90d") },
    { id: "custom", label: t("memberStatistics.filter.presets.custom") },
  ]

  const groupByOptions: { value: StatisticsGroupBy; label: string }[] = [
    { value: "DAY", label: t("memberStatistics.filter.groupByOptions.DAY") },
    { value: "WEEK", label: t("memberStatistics.filter.groupByOptions.WEEK") },
    { value: "MONTH", label: t("memberStatistics.filter.groupByOptions.MONTH") },
  ]

  return (
    <div className="space-y-3">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        {/* Left: Presets & Custom Date Pickers */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Preset Buttons */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1">
            {presets.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectPreset(item.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  preset === item.id
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range Pickers */}
          {preset === "custom" && (
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 text-[11px]">
                  {t("memberStatistics.filter.from")}:
                </span>
                <input
                  type="date"
                  value={tempStart}
                  onChange={(e) => {
                    setTempStart(e.target.value)
                    handleApplyCustomDates(e.target.value, tempEnd)
                  }}
                  className="bg-transparent text-xs font-medium text-slate-800 outline-none"
                />
              </div>

              <span className="text-slate-300">-</span>

              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 text-[11px]">
                  {t("memberStatistics.filter.to")}:
                </span>
                <input
                  type="date"
                  value={tempEnd}
                  onChange={(e) => {
                    setTempEnd(e.target.value)
                    handleApplyCustomDates(tempStart, e.target.value)
                  }}
                  className="bg-transparent text-xs font-medium text-slate-800 outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: GroupBy & Refresh */}
        <div className="flex items-center gap-3 self-end xl:self-auto">
          {/* GroupBy Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">
              {t("memberStatistics.filter.groupBy")}:
            </span>
            <div className="flex items-center rounded-xl bg-slate-100 p-1">
              {groupByOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onGroupByChange(opt.value)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    groupBy === opt.value
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isFetching}
            className="rounded-xl border-slate-200 h-8 px-2.5 text-xs text-slate-700 hover:bg-slate-50"
            title={t("memberStatistics.filter.refresh")}
          >
            <RotateCw
              className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-primary-600" : "text-slate-600"}`}
            />
          </Button>
        </div>
      </div>

      {/* Inline Validation Error */}
      {validationError && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  )
}

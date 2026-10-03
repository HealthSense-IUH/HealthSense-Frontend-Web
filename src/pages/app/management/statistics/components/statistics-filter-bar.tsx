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

interface StatisticsFilterBarProps {
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

export function StatisticsFilterBar({
  preset,
  startDateStr,
  endDateStr,
  groupBy,
  isFetching,
  onPresetChange,
  onCustomRangeChange,
  onGroupByChange,
  onRefresh,
}: StatisticsFilterBarProps) {
  const { t } = useTranslation("management")

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
      setValidationError(t("statistics.filter.rangeInvalid"))
      return
    }

    const diff = getDaysDifference(newStart, newEnd)
    if (diff > 366) {
      setValidationError(t("statistics.filter.rangeExceeded"))
      return
    }

    setValidationError(null)
    onCustomRangeChange(newStart, newEnd)
  }

  const groupByOptions: { value: StatisticsGroupBy; label: string }[] = [
    { value: "DAY", label: t("statistics.filter.groupByOptions.DAY") },
    { value: "WEEK", label: t("statistics.filter.groupByOptions.WEEK") },
    { value: "MONTH", label: t("statistics.filter.groupByOptions.MONTH") },
  ]

  const presetOptions: { value: StatisticsPreset; label: string }[] = [
    { value: "7d", label: t("statistics.filter.presets.7d") },
    { value: "30d", label: t("statistics.filter.presets.30d") },
    { value: "90d", label: t("statistics.filter.presets.90d") },
    { value: "custom", label: t("statistics.filter.presets.custom") },
  ]

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          {presetOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelectPreset(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                preset === opt.value
                  ? "bg-primary-600 text-white shadow-xs"
                  : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* GroupBy and Refresh */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented GroupBy */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1">
            <span className="text-[11px] font-medium text-slate-500 px-2 hidden sm:inline">
              {t("statistics.filter.groupBy")}:
            </span>
            {groupByOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onGroupByChange(opt.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  groupBy === opt.value
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isFetching}
            className="rounded-xl h-8 text-xs font-semibold gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0"
          >
            <RotateCw
              className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-primary-600" : ""}`}
            />
            <span className="hidden sm:inline">
              {t("statistics.filter.refresh")}
            </span>
          </Button>
        </div>
      </div>

      {/* Custom Date Picker Bar (shown when preset === "custom") */}
      {preset === "custom" && (
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 shadow-xs flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Calendar className="w-4 h-4 text-primary-600 shrink-0" />
            <span>{t("statistics.filter.from")}:</span>
            <input
              type="date"
              value={tempStart}
              onChange={(e) => {
                setTempStart(e.target.value)
                handleApplyCustomDates(e.target.value, tempEnd)
              }}
              className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-primary-500 font-sans"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span>{t("statistics.filter.to")}:</span>
            <input
              type="date"
              value={tempEnd}
              onChange={(e) => {
                setTempEnd(e.target.value)
                handleApplyCustomDates(tempStart, e.target.value)
              }}
              className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-primary-500 font-sans"
            />
          </div>
        </div>
      )}

      {/* Validation warning */}
      {validationError && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  )
}

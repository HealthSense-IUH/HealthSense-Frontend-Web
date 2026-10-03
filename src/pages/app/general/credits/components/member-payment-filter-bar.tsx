import { useState } from "react"
import { Calendar, Filter, RefreshCw, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getPaymentDateRangePreset,
  parseVnDateInputToStartOfDayISO,
  parseVnDateInputToEndOfDayExclusiveISO,
  CREDIT_ORDER_STATUS_CONFIG,
} from "@/constants/credits"
import type { PaymentDatePreset } from "@/constants/credits"
import type { CreditOrderStatus } from "@/types/credits"
import { useTranslation } from "react-i18next"

interface MemberPaymentFilterBarProps {
  preset: PaymentDatePreset
  onPresetChange: (preset: PaymentDatePreset, from?: string, to?: string) => void
  status?: CreditOrderStatus
  onStatusChange: (status?: CreditOrderStatus) => void
  pageSize: number
  onPageSizeChange: (size: number) => void
  onRefresh: () => void
  onReset: () => void
  loading: boolean
}

export function MemberPaymentFilterBar({
  preset,
  onPresetChange,
  status,
  onStatusChange,
  pageSize,
  onPageSizeChange,
  onRefresh,
  onReset,
  loading,
}: MemberPaymentFilterBarProps) {
  const { t } = useTranslation("credits")
  const [customFromDate, setCustomFromDate] = useState<string>("")
  const [customToDate, setCustomToDate] = useState<string>("")

  const handlePresetClick = (nextPreset: PaymentDatePreset) => {
    if (nextPreset === "custom") {
      onPresetChange("custom", undefined, undefined)
      return
    }
    const range = getPaymentDateRangePreset(nextPreset)
    setCustomFromDate("")
    setCustomToDate("")
    onPresetChange(nextPreset, range.from, range.to)
  }

  const handleCustomDateApply = (fromVal = customFromDate, toVal = customToDate) => {
    const fromISO = parseVnDateInputToStartOfDayISO(fromVal)
    const toISO = parseVnDateInputToEndOfDayExclusiveISO(toVal)
    onPresetChange("custom", fromISO, toISO)
  }

  const isFiltered = preset !== "all" || Boolean(status)

  return (
    <div className="space-y-3 bg-card border border-border/80 rounded-2xl p-4 shadow-2xs">
      {/* Row 1: Presets & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Preset Pill Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/60 rounded-xl w-fit">
          <Button
            type="button"
            variant={preset === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => handlePresetClick("all")}
            className="h-7 px-3 text-xs font-medium rounded-lg"
          >
            {t("filters.allTime")}
          </Button>
          <Button
            type="button"
            variant={preset === "today" ? "default" : "ghost"}
            size="sm"
            onClick={() => handlePresetClick("today")}
            className="h-7 px-3 text-xs font-medium rounded-lg"
          >
            {t("filters.today")}
          </Button>
          <Button
            type="button"
            variant={preset === "last7days" ? "default" : "ghost"}
            size="sm"
            onClick={() => handlePresetClick("last7days")}
            className="h-7 px-3 text-xs font-medium rounded-lg"
          >
            {t("filters.last7days")}
          </Button>
          <Button
            type="button"
            variant={preset === "thisMonth" ? "default" : "ghost"}
            size="sm"
            onClick={() => handlePresetClick("thisMonth")}
            className="h-7 px-3 text-xs font-medium rounded-lg"
          >
            {t("filters.thisMonth")}
          </Button>
          <Button
            type="button"
            variant={preset === "custom" ? "default" : "ghost"}
            size="sm"
            onClick={() => handlePresetClick("custom")}
            className="h-7 px-3 text-xs font-medium rounded-lg gap-1"
          >
            <Calendar className="h-3 w-3" /> {t("filters.custom")}
          </Button>
        </div>

        {/* Status Filter & Page Size & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Select */}
          <div className="w-44">
            <Select
              value={status || "ALL"}
              onValueChange={(val) => {
                onStatusChange(val === "ALL" ? undefined : (val as CreditOrderStatus))
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                <SelectValue placeholder={t("filters.allStatuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">
                  {t("filters.allStatuses")}
                </SelectItem>
                {(
                  Object.keys(CREDIT_ORDER_STATUS_CONFIG) as CreditOrderStatus[]
                ).map((st) => (
                  <SelectItem key={st} value={st} className="text-xs">
                    {CREDIT_ORDER_STATUS_CONFIG[st].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page Size Select */}
          <div className="w-28">
            <Select
              value={String(pageSize)}
              onValueChange={(val) => onPageSizeChange(Number(val))}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder={t("filters.rows")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10" className="text-xs">
                  {t("filters.rowsPerPage", { count: 10 })}
                </SelectItem>
                <SelectItem value="20" className="text-xs">
                  {t("filters.rowsPerPage", { count: 20 })}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset button if filtered */}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCustomFromDate("")
                setCustomToDate("")
                onReset()
              }}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" /> {t("shared.clearFilters")}
            </Button>
          )}

          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="h-8 px-2.5 text-xs gap-1.5 shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            {t("shared.refresh")}
          </Button>
        </div>
      </div>

      {/* Row 2: Custom Date Inputs (when preset === 'custom') */}
      {preset === "custom" && (
        <div className="pt-2 border-t border-border/50 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t("filters.fromDate")}</span>
            <Input
              type="date"
              value={customFromDate}
              onChange={(e) => {
                setCustomFromDate(e.target.value)
                handleCustomDateApply(e.target.value, customToDate)
              }}
              className="h-8 w-40 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t("filters.toDate")}</span>
            <Input
              type="date"
              value={customToDate}
              onChange={(e) => {
                setCustomToDate(e.target.value)
                handleCustomDateApply(customFromDate, e.target.value)
              }}
              className="h-8 w-40 text-xs"
            />
          </div>
          <span className="text-[11px] text-muted-foreground/80 italic">
            {t("filters.timezoneNote")}
          </span>
        </div>
      )}
    </div>
  )
}

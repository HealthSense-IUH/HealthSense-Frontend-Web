import { useState } from "react"
import {
  Calendar as CalendarIcon,
  Check,
  Filter,
  RefreshCw,
  User,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  getPaymentDateRangePreset,
  getStartOfDayISO,
  getStartOfNextDayISO,
  type PaymentDatePreset,
} from "@/constants/credits"
import { useTranslation } from "react-i18next"

interface PaymentFilterBarProps {
  preset: PaymentDatePreset
  onPresetChange: (preset: PaymentDatePreset) => void
  from?: string
  to?: string
  onCustomDateChange: (from?: string, to?: string) => void
  memberId?: string
  onClearMemberFilter: () => void
  onRefresh: () => void
  loading: boolean
}

// Convert ISO instant to local YYYY-MM-DD for date input
function isoToLocalDateString(iso?: string): string {
  if (!iso) return ""
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ""
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  } catch {
    return ""
  }
}

export function PaymentFilterBar({
  preset,
  onPresetChange,
  from,
  to,
  onCustomDateChange,
  memberId,
  onClearMemberFilter,
  onRefresh,
  loading,
}: PaymentFilterBarProps) {
  const { t } = useTranslation("credits")
  const [showCustomInputs, setShowCustomInputs] = useState(preset === "custom")
  const [customFromInput, setCustomFromInput] = useState(isoToLocalDateString(from))
  const [customToInput, setCustomToInput] = useState(() => {
    // Because 'to' in backend is exclusive (start of next day), the displayed date should be 'to - 1 day'
    if (!to) return ""
    try {
      const d = new Date(to)
      d.setDate(d.getDate() - 1)
      return isoToLocalDateString(d.toISOString())
    } catch {
      return ""
    }
  })
  const [dateError, setDateError] = useState<string | null>(null)

  const handleSelectPreset = (nextPreset: PaymentDatePreset) => {
    if (nextPreset === "custom") {
      setShowCustomInputs(true)
      onPresetChange("custom")
    } else {
      setShowCustomInputs(false)
      setDateError(null)
      onPresetChange(nextPreset)
      const range = getPaymentDateRangePreset(nextPreset)
      onCustomDateChange(range.from, range.to)
    }
  }

  const handleApplyCustomDates = () => {
    if (!customFromInput || !customToInput) {
      setDateError(t("admin.filter.errors.missingDates"))
      return
    }

    const fromDate = new Date(`${customFromInput}T00:00:00`)
    const toDate = new Date(`${customToInput}T00:00:00`)

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      setDateError(t("admin.filter.errors.invalidDate"))
      return
    }

    if (fromDate > toDate) {
      setDateError(t("admin.filter.errors.fromAfterTo"))
      return
    }

    setDateError(null)
    const fromISO = getStartOfDayISO(fromDate)
    const toISO = getStartOfNextDayISO(toDate) // Start of next day for exclusive 'to'
    onCustomDateChange(fromISO, toISO)
  }

  return (
    <div className="p-4 rounded-2xl bg-card border shadow-xs space-y-3.5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Date presets buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5 text-primary" />
            {t("admin.filter.time")}
          </span>

          <Button
            type="button"
            variant={preset === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSelectPreset("all")}
            className="rounded-xl h-8 text-xs px-3 shadow-3xs"
          >
            {t("filters.allTime")}
          </Button>

          <Button
            type="button"
            variant={preset === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSelectPreset("today")}
            className="rounded-xl h-8 text-xs px-3 shadow-3xs"
          >
            {t("filters.today")}
          </Button>

          <Button
            type="button"
            variant={preset === "last7days" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSelectPreset("last7days")}
            className="rounded-xl h-8 text-xs px-3 shadow-3xs"
          >
            {t("filters.last7days")}
          </Button>

          <Button
            type="button"
            variant={preset === "thisMonth" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSelectPreset("thisMonth")}
            className="rounded-xl h-8 text-xs px-3 shadow-3xs"
          >
            {t("filters.thisMonth")}
          </Button>

          <Button
            type="button"
            variant={preset === "custom" || showCustomInputs ? "secondary" : "outline"}
            size="sm"
            onClick={() => handleSelectPreset("custom")}
            className="rounded-xl h-8 text-xs px-3 shadow-3xs gap-1"
          >
            <Filter className="w-3 h-3" />
            {t("filters.custom")}
          </Button>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="rounded-xl h-8 text-xs gap-1.5 px-3"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {t("shared.refresh")}
          </Button>
        </div>
      </div>

      {/* Custom Date Range Picker form */}
      {showCustomInputs && (
        <div className="p-3 rounded-xl bg-muted/30 border space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium">{t("filters.fromDate")}</span>
            <Input
              type="date"
              value={customFromInput}
              onChange={(e) => setCustomFromInput(e.target.value)}
              className="h-8 w-36 rounded-xl text-xs bg-background"
            />

            <span className="text-muted-foreground font-medium">{t("filters.toDate")}</span>
            <Input
              type="date"
              value={customToInput}
              onChange={(e) => setCustomToInput(e.target.value)}
              className="h-8 w-36 rounded-xl text-xs bg-background"
            />

            <Button
              type="button"
              size="sm"
              onClick={handleApplyCustomDates}
              className="h-8 rounded-xl text-xs px-3 gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              {t("admin.filter.apply")}
            </Button>
          </div>

          {dateError && (
            <p className="text-[11px] text-destructive font-medium">{dateError}</p>
          )}
        </div>
      )}

      {/* Selected Member Filter Tag */}
      {memberId && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">{t("admin.filter.filteringByMember")}</span>
            <Badge variant="outline" className="font-mono font-bold bg-background text-primary">
              #{memberId}
            </Badge>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              {t("admin.filter.memberScopeNote")}
            </span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearMemberFilter}
            className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
            {t("admin.filter.clearMember")}
          </Button>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from "react"
import { AlertTriangle, ChevronDown, ChevronUp, Flame, ShieldAlert, Trash2, UtensilsCrossed } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth-store"
import { cn } from "@/lib/utils"
import {
  DAILY_CALORIE_TARGET,
  DAILY_SODIUM_CAUTION_MG,
  DAILY_SODIUM_LIMIT_MG,
  useFoodLogStore,
} from "../food-log-store"

export function DailyFoodLogCard() {
  const { t } = useTranslation("nutrition")
  const userId = useAuthStore((s) => s.userSession?.userId)
  const entries = useFoodLogStore((s) => s.entries)
  const syncToday = useFoodLogStore((s) => s.syncToday)
  const removeEntry = useFoodLogStore((s) => s.removeEntry)
  const clearToday = useFoodLogStore((s) => s.clearToday)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    syncToday()
  }, [userId, syncToday])

  const totals = entries.reduce(
    (acc, item) => ({
      energyKcal: acc.energyKcal + item.energyKcal,
      proteinG: acc.proteinG + item.proteinG,
      carbohydrateG: acc.carbohydrateG + item.carbohydrateG,
      fatTotalG: acc.fatTotalG + item.fatTotalG,
      sodiumMg: acc.sodiumMg + item.sodiumMg,
      potassiumMg: acc.potassiumMg + item.potassiumMg,
    }),
    { energyKcal: 0, proteinG: 0, carbohydrateG: 0, fatTotalG: 0, sodiumMg: 0, potassiumMg: 0 }
  )

  const calPct = Math.min(100, Math.round((totals.energyKcal / DAILY_CALORIE_TARGET) * 100))
  const sodiumPct = Math.min(100, Math.round((totals.sodiumMg / DAILY_SODIUM_LIMIT_MG) * 100))
  const isSodiumDanger = totals.sodiumMg > DAILY_SODIUM_LIMIT_MG
  const isSodiumCaution = !isSodiumDanger && totals.sodiumMg > DAILY_SODIUM_CAUTION_MG

  const sodiumBarClass = isSodiumDanger
    ? "bg-danger-500"
    : isSodiumCaution
      ? "bg-warning-500"
      : "bg-success-500"

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {t("foodLog.title")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {entries.length > 0
                  ? t("foodLog.subtitleCount", { count: entries.length })
                  : t("foodLog.emptySubtitle")}
              </p>
            </div>
          </div>

          {entries.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setExpanded((v) => !v)}
                className="h-8 px-2.5 text-xs text-slate-600 cursor-pointer"
              >
                {expanded ? t("foodLog.hideItems") : t("foodLog.showItems", { count: entries.length })}
                {expanded ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearToday}
                className="h-8 px-2 text-xs text-danger-600 hover:text-danger-700 hover:bg-danger-50 cursor-pointer"
              >
                {t("foodLog.clearAll")}
              </Button>
            </div>
          )}
        </div>

        {/* Two main clinical progress bars: Calories & AHA Sodium */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl bg-slate-50/80 border border-slate-100 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                {t("foodLog.caloriesLabel")}
              </span>
              <span className="font-bold text-slate-900 tabular-nums">
                {Math.round(totals.energyKcal)} / {DAILY_CALORIE_TARGET} kcal
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-200/80 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${calPct}%` }}
              />
            </div>
          </div>

          <div
            className={cn(
              "rounded-xl border p-3.5 space-y-2",
              isSodiumDanger
                ? "bg-danger-50/70 border-danger-200"
                : isSodiumCaution
                  ? "bg-warning-50/70 border-warning-200"
                  : "bg-slate-50/80 border-slate-100"
            )}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                {isSodiumDanger ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-danger-600" />
                ) : isSodiumCaution ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-warning-600" />
                ) : null}
                {t("foodLog.sodiumLabel")}
              </span>
              <span
                className={cn(
                  "font-bold tabular-nums",
                  isSodiumDanger
                    ? "text-danger-700"
                    : isSodiumCaution
                      ? "text-warning-700"
                      : "text-slate-900"
                )}
              >
                {Math.round(totals.sodiumMg)} / {DAILY_SODIUM_LIMIT_MG} mg
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-200/80 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-300", sodiumBarClass)}
                style={{ width: `${sodiumPct}%` }}
              />
            </div>
            {isSodiumDanger ? (
              <p className="text-[11px] font-medium text-danger-700">{t("foodLog.sodiumDangerHint")}</p>
            ) : isSodiumCaution ? (
              <p className="text-[11px] font-medium text-warning-700">{t("foodLog.sodiumCautionHint")}</p>
            ) : null}
          </div>
        </div>

        {/* Compact macro & potassium pills */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium tabular-nums">
            {t("foodLog.protein")}: <strong>{totals.proteinG.toFixed(1)} g</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium tabular-nums">
            {t("foodLog.carbs")}: <strong>{totals.carbohydrateG.toFixed(1)} g</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium tabular-nums">
            {t("foodLog.fat")}: <strong>{totals.fatTotalG.toFixed(1)} g</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-medium tabular-nums">
            {t("foodLog.potassium")}: <strong>{Math.round(totals.potassiumMg)} mg</strong>
          </span>
        </div>

        {/* Expandable logged food entries */}
        {expanded && entries.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            {entries.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/70 border border-slate-100 px-3 py-2 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-800 truncate">{item.name}</div>
                  <div className="text-[11px] text-muted-foreground tabular-nums">
                    {formatTime(item.loggedAt)} • {Math.round(item.grams)} g •{" "}
                    {Math.round(item.energyKcal)} kcal • Na {Math.round(item.sodiumMg)} mg
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeEntry(item.id)}
                  aria-label={t("foodLog.removeItem")}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-danger-600 hover:bg-danger-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

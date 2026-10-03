import { Link } from "react-router-dom"
import { ClipboardList, Search } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import i18n, { currentIntlLocale } from "@/lib/i18n"
import { USER_ROLES } from "@/constants/roles"
import { useAuthStore } from "@/stores/auth-store"
import type { DietPrescriptionRule } from "@/types/nutrition"
import { useMyDietPrescription } from "../hooks/use-nutrition"
import { DIET_RULE_META, describeRuleThresholds } from "../diet-rules"
import { DietAdviceBadge } from "./DietAdvice"

/** Ngưỡng đang áp dụng của một quy tắc, kèm "(bác sĩ đặt riêng cho bạn)" nếu bác sĩ chỉnh. */
function describe(rule: DietPrescriptionRule, sodium?: DietPrescriptionRule) {
  const text = describeRuleThresholds(
    rule.code,
    { unit: rule.unit, limit: rule.effectiveLimit, caution: rule.effectiveCaution, good: rule.effectiveGood },
    sodium && { limit: sodium.effectiveLimit, caution: sodium.effectiveCaution }
  )
  const custom = rule.limit != null || rule.caution != null || rule.good != null
  if (!text) return ""
  return custom ? i18n.t("nutrition:dietPrescription.ruleCustom", { text }) : i18n.t("nutrition:dietPrescription.rule", { text })
}

/** Chú giải màu; nội dung lấy theo khoá dietPrescription.legend.<LEVEL> */
const LEGEND = ["GOOD", "OK", "CAUTION", "LIMIT", "UNKNOWN"] as const

/** Tab "Đơn ăn uống": các quy tắc bác sĩ áp dụng trong đơn, lời dặn thêm và cách đọc màu của món. */
export function DietPrescriptionTab() {
  const { t } = useTranslation("nutrition")
  const role = useAuthStore((s) => s.userSession?.role)
  const isMember = role === USER_ROLES.MEMBER
  const { data: prescription, isLoading, isError, refetch } = useMyDietPrescription(isMember)

  if (!isMember) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-muted-foreground">
        {t("dietPrescription.membersOnly")}
      </div>
    )
  }

  if (isLoading) return <Skeleton className="h-72 rounded-2xl" />

  if (isError || !prescription) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-muted-foreground space-y-2">
        <p>{t("dietPrescription.loadError")}</p>
        <button type="button" onClick={() => refetch()} className="text-primary font-medium hover:underline cursor-pointer">
          {t("common.retry")}
        </button>
      </div>
    )
  }

  const rules = prescription.rules ?? []
  const sodium = rules.find((rule) => rule.code === "SODIUM")
  const activeRules = rules.filter((rule) => rule.enabled)

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {t("dietPrescription.title")}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {activeRules.length > 0
                  ? prescription.updatedAt
                    ? t("dietPrescription.subtitleUpdated", {
                        date: new Date(prescription.updatedAt).toLocaleDateString(currentIntlLocale()),
                      })
                    : t("dietPrescription.subtitle")
                  : t("dietPrescription.subtitleEmpty")}
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-1.5 self-start">
            <Link to="/app/general/nutrition?tab=foods">
              <Search className="w-3.5 h-3.5" />
              {t("dietPrescription.searchFoods")}
            </Link>
          </Button>
        </div>

        {activeRules.length > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {activeRules.map((rule) => {
              const meta = DIET_RULE_META[rule.code]
              const Icon = meta.icon
              return (
                <li
                  key={rule.code}
                  className="rounded-xl border border-primary-200 bg-primary-50/60 p-4 flex items-start gap-3"
                >
                  <Icon className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{rule.name}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {[describe(rule, sodium), meta.summary].filter(Boolean).join(" ")}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {prescription.note && (
          <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-4">
            <p className="text-xs font-semibold text-slate-600 mb-1">{t("dietPrescription.doctorNote")}</p>
            <p className="text-sm text-slate-800 whitespace-pre-line">{prescription.note}</p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-foreground">{t("dietPrescription.legendTitle")}</h2>
        <div className="grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground">
          {LEGEND.map((level) => (
            <p key={level} className="flex items-center gap-2">
              <DietAdviceBadge advice={{ level, reasons: [], personalized: true }} /> {t(`dietPrescription.legend.${level}`)}
            </p>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{t("dietPrescription.legendNote")}</p>
      </section>
    </div>
  )
}

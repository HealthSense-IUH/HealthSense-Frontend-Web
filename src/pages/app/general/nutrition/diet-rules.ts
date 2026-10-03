import { Beef, Candy, Coffee, Droplets, Leaf, Pill, Scale, Wine, type LucideIcon } from "lucide-react"

import i18n, { currentIntlLocale } from "@/lib/i18n"
import type { DietRuleCode } from "@/types/nutrition"

/** Mức ưu tiên của bộ quy tắc cho người rung nhĩ (V28); nhãn dịch lúc đọc theo ngôn ngữ đang chọn. */
export const PRIORITY_LABEL: Record<number, string> = Object.defineProperties({} as Record<number, string>, {
  1: { enumerable: true, get: () => i18n.t("nutrition:dietRules.priority.1") },
  2: { enumerable: true, get: () => i18n.t("nutrition:dietRules.priority.2") },
  3: { enumerable: true, get: () => i18n.t("nutrition:dietRules.priority.3") },
  4: { enumerable: true, get: () => i18n.t("nutrition:dietRules.priority.4") },
  5: { enumerable: true, get: () => i18n.t("nutrition:dietRules.priority.5") },
})

/** Icon và giải thích ngắn (dịch lúc đọc) của một quy tắc */
function ruleMeta(icon: LucideIcon, code: DietRuleCode): { icon: LucideIcon; summary: string } {
  return {
    icon,
    get summary() {
      return i18n.t(`nutrition:dietRules.summary.${code}`)
    },
  }
}

/** Icon và giải thích ngắn của từng quy tắc; ngưỡng thật lấy từ API (admin sửa trong cơ sở dữ liệu). */
export const DIET_RULE_META: Record<DietRuleCode, { icon: LucideIcon; summary: string }> = {
  ALCOHOL: ruleMeta(Wine, "ALCOHOL"),
  CAFFEINE: ruleMeta(Coffee, "CAFFEINE"),
  SUGARS: ruleMeta(Candy, "SUGARS"),
  NA_K_RATIO: ruleMeta(Scale, "NA_K_RATIO"),
  SODIUM: ruleMeta(Droplets, "SODIUM"),
  SATURATED_FAT: ruleMeta(Beef, "SATURATED_FAT"),
  MAGNESIUM: ruleMeta(Leaf, "MAGNESIUM"),
  VITAMIN_K: ruleMeta(Pill, "VITAMIN_K"),
}

export type DietThresholdField = "limit" | "caution" | "good"

/** Ô ngưỡng của từng quy tắc: magie chỉ có mức tốt, tỷ lệ Na/K có đỏ và mức tốt, còn lại đỏ / vàng. */
export function thresholdFieldsOf(code: DietRuleCode): DietThresholdField[] {
  if (code === "MAGNESIUM") return ["good"]
  if (code === "NA_K_RATIO") return ["limit", "good"]
  return ["limit", "caution"]
}

/** Nhãn và màu chấm của từng loại ngưỡng */
export const THRESHOLD_FIELD_STYLE: Record<DietThresholdField, { dot: string; label: (code: DietRuleCode) => string }> = {
  limit: { dot: "bg-danger-500", label: () => i18n.t("nutrition:dietRules.field.limit") },
  caution: { dot: "bg-warning-500", label: () => i18n.t("nutrition:dietRules.field.caution") },
  good: {
    dot: "bg-success-500",
    label: (code) =>
      code === "NA_K_RATIO" ? i18n.t("nutrition:dietRules.field.goodAtMost") : i18n.t("nutrition:dietRules.field.goodAtLeast"),
  },
}

/** Đơn vị hiển thị cạnh ô ngưỡng */
export function thresholdUnit(code: DietRuleCode, unit: string) {
  return code === "NA_K_RATIO" ? "Na/K" : `${unit} / 100 g`
}

function amount(value: number) {
  return value.toLocaleString(currentIntlLocale())
}

/**
 * Diễn đạt ngưỡng của một quy tắc, ví dụ "Đỏ khi trên 400 mg, vàng khi trên 140 mg (trên 100 g)".
 * `sodiumLimit` / `sodiumCaution`: ngưỡng của muối, dùng làm điều kiện kèm cho Na/K và magie.
 */
export function describeRuleThresholds(
  code: DietRuleCode,
  rule: { unit: string; limit?: number | null; caution?: number | null; good?: number | null },
  sodium?: { limit?: number | null; caution?: number | null }
) {
  if (code === "NA_K_RATIO") {
    const parts = [
      rule.limit != null
        ? sodium?.limit != null
          ? i18n.t("nutrition:dietRules.describe.naKLimitWithSodium", {
              value: amount(rule.limit),
              sodium: amount(sodium.limit),
            })
          : i18n.t("nutrition:dietRules.describe.naKLimit", { value: amount(rule.limit) })
        : null,
      rule.good != null ? i18n.t("nutrition:dietRules.describe.naKGood", { value: amount(rule.good) }) : null,
    ].filter(Boolean)
    return capitalize(parts.join("; "))
  }
  if (code === "MAGNESIUM") {
    if (rule.good == null) return ""
    return sodium?.caution != null
      ? i18n.t("nutrition:dietRules.describe.magnesiumGoodWithSodium", {
          value: amount(rule.good),
          unit: rule.unit,
          sodium: amount(sodium.caution),
        })
      : i18n.t("nutrition:dietRules.describe.magnesiumGood", { value: amount(rule.good), unit: rule.unit })
  }
  const parts = [
    rule.limit != null ? i18n.t("nutrition:dietRules.describe.limit", { value: amount(rule.limit), unit: rule.unit }) : null,
    rule.caution != null
      ? i18n.t("nutrition:dietRules.describe.caution", { value: amount(rule.caution), unit: rule.unit })
      : null,
  ].filter(Boolean)
  return parts.length ? i18n.t("nutrition:dietRules.describe.per100g", { text: capitalize(parts.join(", ")) }) : ""
}

function capitalize(text: string) {
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : text
}

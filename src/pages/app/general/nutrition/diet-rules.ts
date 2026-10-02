import { Beef, Candy, Coffee, Droplets, Leaf, Pill, Scale, Wine, type LucideIcon } from "lucide-react"

import type { DietRuleCode } from "@/types/nutrition"

/** Mức ưu tiên của bộ quy tắc cho người rung nhĩ (V28) */
export const PRIORITY_LABEL: Record<number, string> = {
  1: "Ưu tiên 1 · Lọc cứng",
  2: "Ưu tiên 2 · Điện giải",
  3: "Ưu tiên 3 · Tim mạch chung",
  4: "Ưu tiên 4 · Vi chất bảo vệ",
  5: "Theo đơn",
}

/** Icon và giải thích ngắn của từng quy tắc; ngưỡng thật lấy từ API (admin sửa trong cơ sở dữ liệu). */
export const DIET_RULE_META: Record<DietRuleCode, { icon: LucideIcon; summary: string }> = {
  ALCOHOL: { icon: Wine, summary: "Cồn là yếu tố kích phát cơn rung nhĩ rõ nhất: món có cồn là đỏ." },
  CAFFEINE: { icon: Coffee, summary: "Caffeine liều cao làm tim đập nhanh: vượt ngưỡng là vàng." },
  SUGARS: {
    icon: Candy,
    summary: "Tính trên đường tổng (chưa có số liệu đường bổ sung); không áp cho trái cây và sữa.",
  },
  NA_K_RATIO: {
    icon: Scale,
    summary: "Kali bằng hoặc hơn natri giúp ổn định nhịp tim; natri gấp nhiều lần kali mà món lại mặn là đỏ.",
  },
  SODIUM: { icon: Droplets, summary: "Muối nhiều gây giữ nước, tăng áp lực lên tim." },
  SATURATED_FAT: { icon: Beef, summary: "Chất béo bão hòa nhiều làm tăng nguy cơ tim mạch." },
  MAGNESIUM: { icon: Leaf, summary: "Giàu magie mà ít muối (hạt, đậu, ngũ cốc nguyên cám) là điểm tốt cho tim." },
  VITAMIN_K: {
    icon: Pill,
    summary: "Đang dùng warfarin: không cần kiêng, nhưng nên ăn lượng vitamin K đều mỗi ngày.",
  },
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
  limit: { dot: "bg-danger-500", label: () => "Đỏ khi trên" },
  caution: { dot: "bg-warning-500", label: () => "Vàng khi trên" },
  good: {
    dot: "bg-success-500",
    label: (code) => (code === "NA_K_RATIO" ? "Tốt khi từ mức này trở xuống" : "Tốt khi từ mức này trở lên"),
  },
}

/** Đơn vị hiển thị cạnh ô ngưỡng */
export function thresholdUnit(code: DietRuleCode, unit: string) {
  return code === "NA_K_RATIO" ? "Na/K" : `${unit} / 100 g`
}

function amount(value: number) {
  return value.toLocaleString("vi-VN")
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
        ? `đỏ khi Na/K trên ${amount(rule.limit)}${sodium?.limit != null ? ` và natri trên ${amount(sodium.limit)} mg` : ""}`
        : null,
      rule.good != null ? `tốt khi Na/K từ ${amount(rule.good)} trở xuống` : null,
    ].filter(Boolean)
    return capitalize(parts.join("; "))
  }
  if (code === "MAGNESIUM") {
    if (rule.good == null) return ""
    return `Tốt khi từ ${amount(rule.good)} ${rule.unit} trên 100 g${
      sodium?.caution != null ? ` và natri không quá ${amount(sodium.caution)} mg` : ""
    }`
  }
  const parts = [
    rule.limit != null ? `đỏ khi trên ${amount(rule.limit)} ${rule.unit}` : null,
    rule.caution != null ? `vàng khi trên ${amount(rule.caution)} ${rule.unit}` : null,
  ].filter(Boolean)
  return parts.length ? `${capitalize(parts.join(", "))} (trên 100 g)` : ""
}

function capitalize(text: string) {
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : text
}

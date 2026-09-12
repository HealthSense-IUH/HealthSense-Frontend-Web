/**
 * Formatting utilities for HealthSense application.
 *
 * Mọi hàm ở đây bám theo NGÔN NGỮ ĐANG CHỌN (xem lib/i18n.ts) thay vì cứng
 * "vi-VN": đổi ngôn ngữ trên thanh trên cùng thì ngày/giờ/số cũng đổi theo.
 */
import i18n, { currentIntlLocale } from "@/lib/i18n"

/**
 * Format numbers with Vietnamese locale
 */
export function formatHrvNumber(val: unknown, decimals = 2): string {
  if (typeof val !== "number" || isNaN(val)) return "--"
  return Number(val.toFixed(decimals)).toLocaleString(currentIntlLocale())
}

/**
 * Format ISO datetime string to vi-VN formatted date
 */
export function formatRecordDate(isoString?: string): string {
  if (!isoString) return "N/A"
  try {
    const d = new Date(isoString)
    return d.toLocaleString(currentIntlLocale(), {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return isoString
  }
}

/**
 * Format chat message date separator (Today, Yesterday, or formatted date)
 */
export function formatChatDate(dateString?: string | null): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ""

  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)

  if (date.toDateString() === now.toDateString()) {
    return i18n.t("date.today")
  } else if (date.toDateString() === yesterday.toDateString()) {
    return i18n.t("date.yesterday")
  }

  return date.toLocaleDateString(currentIntlLocale(), {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  })
}

/**
 * Format chat message time
 */
export function formatMessageTime(dateString?: string | null): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ""
  return date.toLocaleTimeString(currentIntlLocale(), {
    hour: "2-digit",
    minute: "2-digit",
    // Tiếng Việt dùng 24 giờ; tiếng Anh để Intl tự quyết theo locale
    hour12: currentIntlLocale() === "vi-VN" ? false : undefined,
  })
}

/**
 * Format a short date (dd thg M, yyyy) with Vietnamese locale.
 * Dùng chung thay cho các hàm formatDate cục bộ từng viết lại trong component.
 */
export function formatShortDate(val?: string | number | null, fallback?: string): string {
  if (val === undefined || val === null || val === "") return fallback ?? i18n.t("common.notAvailable")
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return String(val)
    return d.toLocaleDateString(currentIntlLocale(), { day: "numeric", month: "short", year: "numeric" })
  } catch {
    return String(val)
  }
}

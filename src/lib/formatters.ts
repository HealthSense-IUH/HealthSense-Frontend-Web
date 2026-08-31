/**
 * Formatting utilities for HealthSense application
 */

/**
 * Format numbers with Vietnamese locale
 */
export function formatHrvNumber(val: unknown, decimals = 2): string {
  if (typeof val !== "number" || isNaN(val)) return "--"
  return Number(val.toFixed(decimals)).toLocaleString("vi-VN")
}

/**
 * Format ISO datetime string to vi-VN formatted date
 */
export function formatRecordDate(isoString?: string): string {
  if (!isoString) return "N/A"
  try {
    const d = new Date(isoString)
    return d.toLocaleString("vi-VN", {
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
    return "Today"
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday"
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
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
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export const DASHBOARD_TIMEZONE = "Asia/Ho_Chi_Minh"
export const TIMEZONE_OFFSET_STR = "+07:00"

export interface CalendarDateParts {
  year: number
  month: number // 1-12
  day: number // 1-31
}

/**
 * Lấy các thành phần ngày { year, month, day } hiện tại theo múi giờ Asia/Ho_Chi_Minh
 * sử dụng Intl.DateTimeFormat.
 */
export function getTodayInHoChiMinh(referenceDate: Date = new Date()): CalendarDateParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: DASHBOARD_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  })
  const parts = formatter.formatToParts(referenceDate)
  let year = 0
  let month = 0
  let day = 0
  for (const part of parts) {
    if (part.type === "year") year = parseInt(part.value, 10)
    if (part.type === "month") month = parseInt(part.value, 10)
    if (part.type === "day") day = parseInt(part.value, 10)
  }
  return { year, month, day }
}

/**
 * Thực hiện cộng/trừ ngày bằng calendar arithmetic (sử dụng Date.UTC
 * để đảm bảo an toàn tuyệt đối, tự động xử lý năm nhuận, cuối tháng, chuyển năm).
 */
export function addDaysToDateParts(
  parts: CalendarDateParts,
  daysToAdd: number
): CalendarDateParts {
  const utcDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + daysToAdd))
  return {
    year: utcDate.getUTCFullYear(),
    month: utcDate.getUTCMonth() + 1,
    day: utcDate.getUTCDate(),
  }
}

/**
 * Định dạng CalendarDateParts thành chuỗi YYYY-MM-DD
 */
export function formatDateString(parts: CalendarDateParts): string {
  const y = String(parts.year).padStart(4, "0")
  const m = String(parts.month).padStart(2, "0")
  const d = String(parts.day).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/**
 * Parse chuỗi YYYY-MM-DD thành CalendarDateParts
 */
export function parseDateString(dateStr: string): CalendarDateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  if (!match) return null
  return {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10),
    day: parseInt(match[3], 10),
  }
}

/**
 * Tính ngày tiếp theo của một chuỗi ngày YYYY-MM-DD.
 * Đảm bảo xử lý chính xác cuối tháng, cuối năm và năm nhuận.
 */
export function nextDayOf(dateStr: string): string {
  const parts = parseDateString(dateStr)
  if (!parts) {
    throw new Error(`Invalid date string: ${dateStr}`)
  }
  const nextParts = addDaysToDateParts(parts, 1)
  return formatDateString(nextParts)
}

/**
 * Chuyển ngày YYYY-MM-DD thành ISO-8601 Instant bắt đầu ngày với offset +07:00
 * Ví dụ: "2026-10-01" -> "2026-10-01T00:00:00+07:00"
 */
export function toStartOfDayInstant(dateStr: string): string {
  return `${dateStr}T00:00:00${TIMEZONE_OFFSET_STR}`
}

/**
 * Tính khoảng cách số ngày giữa 2 chuỗi YYYY-MM-DD (exclusive cận trên khi toDateStr là ngày kết thúc)
 */
export function getDaysDifference(fromDateStr: string, toDateStr: string): number {
  const fromParts = parseDateString(fromDateStr)
  const toParts = parseDateString(toDateStr)
  if (!fromParts || !toParts) return 0
  const fromUtc = Date.UTC(fromParts.year, fromParts.month - 1, fromParts.day)
  const toUtc = Date.UTC(toParts.year, toParts.month - 1, toParts.day)
  return Math.round((toUtc - fromUtc) / (24 * 60 * 60 * 1000)) + 1
}

export type StatisticsPreset = "7d" | "30d" | "90d" | "custom"

export interface PresetDateRange {
  startDateStr: string
  endDateStr: string
}

/**
 * Lấy khoảng thời gian mặc định theo preset
 * endDateStr: Hôm nay tại Asia/Ho_Chi_Minh
 * startDateStr: (endDateStr - days + 1)
 */
export function getPresetDateRange(preset: StatisticsPreset): PresetDateRange {
  const todayParts = getTodayInHoChiMinh()
  const endDateStr = formatDateString(todayParts)

  let daysToSubtract = 6
  if (preset === "30d") {
    daysToSubtract = 29
  } else if (preset === "90d") {
    daysToSubtract = 89
  }

  const startParts = addDaysToDateParts(todayParts, -daysToSubtract)
  const startDateStr = formatDateString(startParts)

  return { startDateStr, endDateStr }
}

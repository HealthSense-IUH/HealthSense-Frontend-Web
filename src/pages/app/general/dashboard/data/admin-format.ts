import { currentIntlLocale } from "@/lib/i18n"

/** Định dạng số liệu dashboard quản trị theo ngôn ngữ đang chọn (tháng, thứ, thời gian tương đối, số). */

export function formatCount(value: number) {
  return value.toLocaleString(currentIntlLocale())
}

export function formatPercent(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat(currentIntlLocale(), { style: "percent", maximumFractionDigits }).format(value / 100)
}

export function formatMs(value: number) {
  return `${formatCount(value)} ms`
}

/** Tên tháng ngắn; month 0 = tháng 1 */
export function formatMonth(month: number) {
  return new Intl.DateTimeFormat(currentIntlLocale(), { month: "short" }).format(new Date(2024, month, 1))
}

/** Tên thứ ngắn; weekday 0 = thứ Hai (1/1/2024 là thứ Hai) */
export function formatWeekday(weekday: number) {
  return new Intl.DateTimeFormat(currentIntlLocale(), { weekday: "short" }).format(new Date(2024, 0, 1 + weekday))
}

/** "5 phút trước" / "5 min. ago"; từ 60 phút trở lên tính theo giờ */
export function formatMinutesAgo(minutes: number) {
  const rtf = new Intl.RelativeTimeFormat(currentIntlLocale(), { numeric: "auto", style: "short" })
  return minutes >= 60 ? rtf.format(-Math.round(minutes / 60), "hour") : rtf.format(-minutes, "minute")
}

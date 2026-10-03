import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import i18n, { currentIntlLocale } from "@/lib/i18n"

export function formatDate(value?: string | null) {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat(currentIntlLocale(), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

/** Tên trạng thái phiên / yêu cầu theo ngôn ngữ đang chọn ("ACTIVE" -> "Đang hoạt động"); trạng thái lạ giữ nguyên mã. */
export function statusLabel(status?: string | null): string {
  if (!status) return ""
  const key = status === "IN_PROGRESS" ? "processing" : status.toLowerCase().replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
  return i18n.t(`consultation:status.${key}`, { defaultValue: status })
}

export function statusBadge(status: string) {
  const statusText = (key: string) => i18n.t(`consultation:status.${key}`)
  let label = status
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
  let className = ""

  switch (status) {
    case "PENDING_REVIEW":
      label = statusText("pendingReview")
      variant = "secondary"
      break
    case "NEED_MORE_INFO":
      label = statusText("needMoreInfo")
      variant = "outline"
      className = "text-warning-500 border-warning-500 bg-warning-50"
      break
    case "WAITING_ACCEPTANCE":
      return <Badge variant="outline" className="bg-warning-50 text-warning-800 border-warning-300">{statusText("waitingAcceptance")}</Badge>
    case "WAITING_PAYMENT":
      return <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">{statusText("waitingPayment")}</Badge>
    case "QUEUED":
      return <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">{statusText("queued")}</Badge>
    case "WAITING":
      return <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">{statusText("waiting")}</Badge>
    case "OFFERING_DOCTOR":
      return <Badge variant="outline" className="bg-warning-50 text-warning-700 border-warning-300">{statusText("offeringDoctor")}</Badge>
    case "WAITING_MEMBER_CONFIRMATION":
      return <Badge variant="outline" className="bg-success-50 text-success-700 border-success-300">{statusText("waitingMemberConfirmation")}</Badge>
    case "TIMED_OUT":
      return <Badge variant="destructive" className="bg-slate-100 text-slate-600 border-slate-300">{statusText("timedOut")}</Badge>
    case "FULFILLED":
      return <Badge variant="outline" className="bg-success-50 text-success-700 border-success-200">{statusText("fulfilled")}</Badge>
    case "SCHEDULED":
      return <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">{statusText("scheduled")}</Badge>
    case "COMPLETED":
      return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">{statusText("completed")}</Badge>
    case "REJECTED":
      label = statusText("rejected")
      variant = "destructive"
      break
    case "CANCELLED":
      label = statusText("cancelled")
      variant = "destructive"
      break
    case "EXPIRED":
      label = statusText("expired")
      variant = "destructive"
      break
    case "ACTIVE":
      label = statusText("active")
      variant = "default"
      break
    case "APPROVED":
      label = statusText("approved")
      variant = "default"
      break
    case "PENDING":
      label = statusText("pending")
      variant = "secondary"
      break
    case "PROCESSING":
    case "IN_PROGRESS":
      label = statusText("processing")
      variant = "secondary"
      break
    case "FAILED":
      label = statusText("failed")
      variant = "destructive"
      break
    case "CLOSED":
      label = statusText("closed")
      variant = "destructive"
      break
  }

  return <Badge variant={variant} className={className || undefined}>{label}</Badge>
}

export function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center text-sm text-slate-500">
        {text}
      </TableCell>
    </TableRow>
  )
}

export const DAYS_OF_WEEK_VN: Record<string, string> = {
  get MONDAY() {
    return i18n.t("consultation:days.monday")
  },
  get TUESDAY() {
    return i18n.t("consultation:days.tuesday")
  },
  get WEDNESDAY() {
    return i18n.t("consultation:days.wednesday")
  },
  get THURSDAY() {
    return i18n.t("consultation:days.thursday")
  },
  get FRIDAY() {
    return i18n.t("consultation:days.friday")
  },
  get SATURDAY() {
    return i18n.t("consultation:days.saturday")
  },
  get SUNDAY() {
    return i18n.t("consultation:days.sunday")
  },
}

export interface ScheduleDayGroup {
  day: string
  dayLabel: string
  times: string[]
}

export function parseSupportSchedule(jsonStr?: string | null): ScheduleDayGroup[] | null {
  if (!jsonStr) return null
  try {
    const data = JSON.parse(jsonStr)
    if (!data.weekly || !Array.isArray(data.weekly) || data.weekly.length === 0) return null
    const dayOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]
    const map = new Map<string, string[]>()
    for (const slot of data.weekly) {
      if (!slot.dayOfWeek || !slot.start || !slot.end) continue
      const list = map.get(slot.dayOfWeek) || []
      list.push(`${slot.start} - ${slot.end}`)
      map.set(slot.dayOfWeek, list)
    }
    const grouped: ScheduleDayGroup[] = []
    for (const day of dayOrder) {
      if (map.has(day)) {
        grouped.push({
          day,
          dayLabel: DAYS_OF_WEEK_VN[day] || day,
          times: map.get(day)!,
        })
      }
    }
    return grouped.length > 0 ? grouped : null
  } catch {
    return null
  }
}

export function canEditFinalSummaryDraft(session?: {
  status?: string | null
  meaningfulCareOccurred?: boolean | null
} | null): boolean {
  if (!session?.status) return false
  return (
    session.status === "ACTIVE" ||
    session.status === "COMPLETED" ||
    (session.status === "CANCELLED" && session.meaningfulCareOccurred === true)
  )
}

export function canFinalizeFinalSummary(session?: {
  status?: string | null
  meaningfulCareOccurred?: boolean | null
} | null): boolean {
  if (!session?.status) return false
  return (
    session.status === "COMPLETED" ||
    (session.status === "CANCELLED" && session.meaningfulCareOccurred === true)
  )
}

export function canShowDoctorFinalSummary(
  session?: {
    status?: string | null
    meaningfulCareOccurred?: boolean | null
  } | null,
  isDoctor = true
): boolean {
  return isDoctor && canEditFinalSummaryDraft(session)
}


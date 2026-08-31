import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"

export function formatDate(value?: string | null) {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function statusBadge(status: string) {
  let label = status
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
  let className = ""

  switch (status) {
    case "PENDING_REVIEW":
      label = "Chờ xem xét"
      variant = "secondary"
      break
    case "NEED_MORE_INFO":
      label = "Cần bổ sung TT"
      variant = "outline"
      className = "text-orange-500 border-orange-500 bg-orange-50 dark:bg-orange-950/20"
      break
    case "WAITING_ACCEPTANCE":
      return <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300">Chờ xác nhận thỏa thuận</Badge>
    case "WAITING_PAYMENT":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Chờ thanh toán</Badge>
    case "FULFILLED":
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Đã kích hoạt tư vấn</Badge>
    case "SCHEDULED":
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Đã lên lịch</Badge>
    case "COMPLETED":
      return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">Đã hoàn thành</Badge>
    case "REJECTED":
      label = "Đã từ chối"
      variant = "destructive"
      break
    case "CANCELLED":
      label = "Đã hủy"
      variant = "destructive"
      break
    case "EXPIRED":
      label = "Đã hết hạn"
      variant = "destructive"
      break
    case "ACTIVE":
    case "APPROVED":
      variant = "default"
      break
    case "PENDING":
      variant = "secondary"
      break
    case "CLOSED":
      variant = "destructive"
      break
  }

  return <Badge variant={variant} className={className || undefined}>{label}</Badge>
}

export function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center text-sm text-neutral-500">
        {text}
      </TableCell>
    </TableRow>
  )
}

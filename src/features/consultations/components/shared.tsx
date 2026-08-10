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
    case "WAITING_PAYMENT":
      label = "Chờ thanh toán"
      variant = "secondary"
      break
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

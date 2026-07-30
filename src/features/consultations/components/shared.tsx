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
  const variant =
    status === "ACTIVE" || status === "APPROVED"
      ? "default"
      : status === "PENDING"
        ? "secondary"
        : status === "REJECTED" || status === "CLOSED"
          ? "destructive"
          : "outline"
  return <Badge variant={variant}>{status}</Badge>
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

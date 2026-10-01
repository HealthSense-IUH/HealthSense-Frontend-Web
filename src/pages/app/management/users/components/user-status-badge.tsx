import type { UserAccountStatus as AccountStatus } from "@/types/user"

interface UserStatusBadgeProps {
  status?: AccountStatus | string
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const getBadgeStyles = () => {
    switch (status) {
      case "ACTIVE":
        return {
          bg: "bg-success-50 text-success-700 border-success-200/80",
          dot: "bg-success-500",
          label: "Hoạt động",
        }
      case "PENDING_VERIFY":
        return {
          bg: "bg-warning-50 text-warning-700 border-warning-200/80",
          dot: "bg-warning-500 animate-pulse",
          label: "Chờ xác thực",
        }
      case "INACTIVE":
        return {
          bg: "bg-slate-100 text-slate-600 border-slate-200",
          dot: "bg-slate-400",
          label: "Không hoạt động",
        }
      case "LOCKED":
        return {
          bg: "bg-danger-50 text-danger-700 border-danger-200/80",
          dot: "bg-danger-500",
          label: "Đã khóa",
        }
      case "BANNED":
        return {
          bg: "bg-primary-50 text-primary-700 border-primary-200/80",
          dot: "bg-primary-600",
          label: "Bị cấm",
        }
      default:
        return {
          bg: "bg-success-50 text-success-700 border-success-200/80",
          dot: "bg-success-500",
          label: status ? String(status) : "Hoạt động",
        }
    }
  }

  const styles = getBadgeStyles()

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${styles.bg} whitespace-nowrap shadow-3xs`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${styles.dot}`} />
      <span>{styles.label}</span>
    </span>
  )
}

import type { UserAccountStatus as AccountStatus } from "@/types/user"

interface UserStatusBadgeProps {
  status?: AccountStatus | string
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const getBadgeStyles = () => {
    switch (status) {
      case "ACTIVE":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          dot: "bg-emerald-500",
          label: "Active",
        }
      case "PENDING_VERIFY":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200/80",
          dot: "bg-amber-500 animate-pulse",
          label: "Pending Verify",
        }
      case "INACTIVE":
        return {
          bg: "bg-slate-100 text-slate-600 border-slate-200",
          dot: "bg-slate-400",
          label: "Inactive",
        }
      case "LOCKED":
        return {
          bg: "bg-red-50 text-red-700 border-red-200/80",
          dot: "bg-red-500",
          label: "Locked",
        }
      case "BANNED":
        return {
          bg: "bg-purple-50 text-purple-700 border-purple-200/80",
          dot: "bg-purple-600",
          label: "Banned",
        }
      default:
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          dot: "bg-emerald-500",
          label: status ? String(status) : "Active",
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

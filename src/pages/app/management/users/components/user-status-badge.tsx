import { useTranslation } from "react-i18next"
import type { UserAccountStatus as AccountStatus } from "@/types/user"

interface UserStatusBadgeProps {
  status?: AccountStatus | string
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const { t } = useTranslation("management")
  const getBadgeStyles = () => {
    switch (status) {
      case "ACTIVE":
        return {
          bg: "bg-success-50 text-success-700 border-success-200/80",
          dot: "bg-success-500",
          label: t("users.status.active"),
        }
      case "PENDING_VERIFY":
        return {
          bg: "bg-warning-50 text-warning-700 border-warning-200/80",
          dot: "bg-warning-500 animate-pulse",
          label: t("users.status.pendingVerify"),
        }
      case "INACTIVE":
        return {
          bg: "bg-slate-100 text-slate-600 border-slate-200",
          dot: "bg-slate-400",
          label: t("users.status.inactive"),
        }
      case "LOCKED":
        return {
          bg: "bg-danger-50 text-danger-700 border-danger-200/80",
          dot: "bg-danger-500",
          label: t("users.status.locked"),
        }
      case "BANNED":
        return {
          bg: "bg-primary-50 text-primary-700 border-primary-200/80",
          dot: "bg-primary-600",
          label: t("users.status.banned"),
        }
      default:
        return {
          bg: "bg-success-50 text-success-700 border-success-200/80",
          dot: "bg-success-500",
          label: status ? String(status) : t("users.status.active"),
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

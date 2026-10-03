import { useTranslation } from "react-i18next"

import type { ActivityStatus, ServiceStatus } from "../data/super-admin-dashboard.mock"

interface StatusIndicatorProps {
  status: ServiceStatus | ActivityStatus
  showText?: boolean
}

export function StatusIndicator({ status, showText = true }: StatusIndicatorProps) {
  const { t } = useTranslation("health")
  let badgeColor = "bg-slate-100 text-slate-700 border-slate-200"
  let dotColor = "bg-slate-500"
  let pingColor = "bg-slate-400"
  let isAnimate = false

  switch (status) {
    case "operational":
    case "success":
      badgeColor = "bg-success-50 text-success-700 border-success-200"
      dotColor = "bg-success-500"
      pingColor = "bg-success-400"
      isAnimate = true
      break
    case "degraded":
    case "warning":
      badgeColor = "bg-warning-50 text-warning-700 border-warning-200"
      dotColor = "bg-warning-500"
      pingColor = "bg-warning-400"
      break
    case "critical":
      badgeColor = "bg-danger-50 text-danger-700 border-danger-200"
      dotColor = "bg-danger-500"
      pingColor = "bg-danger-400"
      isAnimate = true
      break
    default:
      break
  }

  const label = t(`adminDashboard.status.${status}`)
  return (
    <span
      title={showText ? undefined : label}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-2xs ${badgeColor}`}
    >
      <span className="relative flex h-2 w-2">
        {isAnimate && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${pingColor}`}></span>
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${dotColor}`}></span>
      </span>
      {showText ? <span>{label}</span> : <span className="sr-only">{label}</span>}
    </span>
  )
}

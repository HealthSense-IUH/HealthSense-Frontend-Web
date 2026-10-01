interface StatusIndicatorProps {
  status: "Operational" | "Degraded" | "Critical" | "Success" | "Warning" | "Neutral" | string
  showText?: boolean
}

export function StatusIndicator({ status, showText = true }: StatusIndicatorProps) {
  let badgeColor = "bg-slate-100 text-slate-700 border-slate-200"
  let dotColor = "bg-slate-500"
  let pingColor = "bg-slate-400"
  let isAnimate = false

  switch (status) {
    case "Operational":
    case "Success":
      badgeColor = "bg-success-50 text-success-700 border-success-200"
      dotColor = "bg-success-500"
      pingColor = "bg-success-400"
      isAnimate = true
      break
    case "Degraded":
    case "Warning":
      badgeColor = "bg-warning-50 text-warning-700 border-warning-200"
      dotColor = "bg-warning-500"
      pingColor = "bg-warning-400"
      break
    case "Critical":
      badgeColor = "bg-danger-50 text-danger-700 border-danger-200"
      dotColor = "bg-danger-500"
      pingColor = "bg-danger-400"
      isAnimate = true
      break
    default:
      break
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-2xs ${badgeColor}`}
    >
      <span className="relative flex h-2 w-2">
        {isAnimate && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${pingColor}`}></span>
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${dotColor}`}></span>
      </span>
      {showText && <span>{status}</span>}
    </span>
  )
}

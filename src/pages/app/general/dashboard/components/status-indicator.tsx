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
      badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200"
      dotColor = "bg-emerald-500"
      pingColor = "bg-emerald-400"
      isAnimate = true
      break
    case "Degraded":
    case "Warning":
      badgeColor = "bg-amber-50 text-amber-700 border-amber-200"
      dotColor = "bg-amber-500"
      pingColor = "bg-amber-400"
      break
    case "Critical":
      badgeColor = "bg-red-50 text-red-700 border-red-200"
      dotColor = "bg-red-500"
      pingColor = "bg-red-400"
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

import { AlertCircle, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react"
import type { GuidanceType } from "@/types/nutrition"
import { cn } from "@/lib/utils"

interface GuidanceBadgeProps {
  type?: GuidanceType
  className?: string
  showIcon?: boolean
  size?: "sm" | "md" | "lg"
}

export function GuidanceBadge({
  type,
  className,
  showIcon = true,
  size = "md",
}: GuidanceBadgeProps) {
  if (!type) return null

  const sizeStyles = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-xs font-medium px-2.5 py-1 gap-1.5",
    lg: "text-sm font-medium px-3.5 py-1.5 gap-2",
  }[size]

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  }[size]

  switch (type) {
    case "PRIORITIZE":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50",
            sizeStyles,
            className
          )}
        >
          {showIcon && <CheckCircle2 className={cn(iconSizes, "text-emerald-600 dark:text-emerald-400")} />}
          <span>Nên ưu tiên</span>
        </span>
      )
    case "LIMIT":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/50",
            sizeStyles,
            className
          )}
        >
          {showIcon && <AlertTriangle className={cn(iconSizes, "text-rose-600 dark:text-rose-400")} />}
          <span>Nên hạn chế</span>
        </span>
      )
    case "CAUTION":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50",
            sizeStyles,
            className
          )}
        >
          {showIcon && <AlertCircle className={cn(iconSizes, "text-amber-600 dark:text-amber-400")} />}
          <span>Cần lưu ý</span>
        </span>
      )
    default:
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border border-slate-200 dark:border-slate-800",
            sizeStyles,
            className
          )}
        >
          {showIcon && <HelpCircle className={cn(iconSizes, "text-slate-500")} />}
          <span>Tham khảo</span>
        </span>
      )
  }
}

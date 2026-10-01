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
            "inline-flex items-center rounded-full bg-success-50 text-success-700 border border-success-200/80",
            sizeStyles,
            className
          )}
        >
          {showIcon && <CheckCircle2 className={cn(iconSizes, "text-success-600")} />}
          <span>Nên ưu tiên</span>
        </span>
      )
    case "LIMIT":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-danger-50 text-danger-700 border border-danger-200/80",
            sizeStyles,
            className
          )}
        >
          {showIcon && <AlertTriangle className={cn(iconSizes, "text-danger-600")} />}
          <span>Nên hạn chế</span>
        </span>
      )
    case "CAUTION":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-warning-50 text-warning-700 border border-warning-200/80",
            sizeStyles,
            className
          )}
        >
          {showIcon && <AlertCircle className={cn(iconSizes, "text-warning-600")} />}
          <span>Cần lưu ý</span>
        </span>
      )
    default:
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-slate-50 text-slate-700 border border-slate-200",
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

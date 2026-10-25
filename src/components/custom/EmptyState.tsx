import type { ReactNode } from "react"

import { illustrations, type IllustrationName } from "@/components/illustrations/registry"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  /** Tên minh hoạ trong bộ SVG của HealthSense, hoặc một node tuỳ ý */
  illustration?: IllustrationName | ReactNode
  title: ReactNode
  description?: ReactNode
  /** Nút hành động bên dưới (tải lên, tạo mới, thử lại…) */
  action?: ReactNode
  /** Gọn hơn cho ô nhỏ trong card */
  compact?: boolean
  className?: string
}

/**
 * Trạng thái trống dùng chung cho mọi trang: minh hoạ + tiêu đề + mô tả + hành động, cùng một nhịp bố cục.
 */
export function EmptyState({ illustration = "empty", title, description, action, compact = false, className }: EmptyStateProps) {
  const Illustration = typeof illustration === "string" ? illustrations[illustration as IllustrationName] : null

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-2 px-4 py-6" : "gap-3 px-6 py-10",
        className
      )}
    >
      <div className={cn("motion-safe:animate-float", compact ? "w-28" : "w-44 sm:w-52")}>
        {Illustration ? <Illustration /> : illustration}
      </div>
      <div className="space-y-1">
        <p className={cn("font-bold text-foreground", compact ? "text-sm" : "text-base")}>{title}</p>
        {description && (
          <p className={cn("mx-auto max-w-md text-muted-foreground", compact ? "text-xs" : "text-sm")}>{description}</p>
        )}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  )
}

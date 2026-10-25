import * as React from "react"

import { cn } from "@/lib/utils"

/** Khung xương chờ tải: nền nhạt với vệt sáng quét ngang (skeleton-shimmer trong index.css). */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton-shimmer rounded-md bg-slate-100", className)} {...props} />
}

export { Skeleton }

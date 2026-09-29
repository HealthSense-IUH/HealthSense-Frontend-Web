import { AlertTriangle, Ban, CheckCircle2, HelpCircle, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { DietAdvice as DietAdviceData, DietAdviceLevel } from "@/types/nutrition"

const LEVEL_STYLE: Record<DietAdviceLevel, { label: string; icon: LucideIcon; badge: string; icon_: string; box: string }> = {
  OK: {
    label: "Phù hợp",
    icon: CheckCircle2,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50",
    icon_: "text-emerald-600 dark:text-emerald-400",
    box: "bg-emerald-50/60 border-emerald-200/80 dark:bg-emerald-950/20 dark:border-emerald-800/50",
  },
  CAUTION: {
    label: "Cần lưu ý",
    icon: AlertTriangle,
    badge: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50",
    icon_: "text-amber-600 dark:text-amber-400",
    box: "bg-amber-50/60 border-amber-200/80 dark:bg-amber-950/20 dark:border-amber-800/50",
  },
  LIMIT: {
    label: "Nên hạn chế",
    icon: Ban,
    badge: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50",
    icon_: "text-rose-600 dark:text-rose-400",
    box: "bg-rose-50/60 border-rose-200/80 dark:bg-rose-950/20 dark:border-rose-800/50",
  },
  UNKNOWN: {
    label: "Chưa đủ số liệu",
    icon: HelpCircle,
    badge: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-muted dark:text-slate-300 dark:border-border",
    icon_: "text-slate-500",
    box: "bg-slate-50 border-slate-200 dark:bg-muted/30 dark:border-border",
  },
}

/** Nhãn màu của một món theo đơn ăn uống (xanh / vàng / đỏ / xám). */
export function DietAdviceBadge({ advice, className }: { advice?: DietAdviceData; className?: string }) {
  if (!advice) return null
  const style = LEVEL_STYLE[advice.level]
  const Icon = style.icon
  return (
    <span
      title={advice.reasons.map((r) => r.message).join("\n") || undefined}
      className={cn(
        "inline-flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded-md border text-[10px] font-semibold",
        style.badge,
        className
      )}
    >
      <Icon className={cn("w-3 h-3", style.icon_)} />
      {style.label}
    </span>
  )
}

/** Hộp đánh giá chi tiết trên trang một món: màu, từng lý do và nguồn của đánh giá. */
export function DietAdviceNote({ advice }: { advice?: DietAdviceData }) {
  if (!advice) return null
  const style = LEVEL_STYLE[advice.level]
  const Icon = style.icon
  return (
    <div className={cn("rounded-2xl border p-4 space-y-2", style.box)}>
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-foreground">
        <Icon className={cn("w-4 h-4", style.icon_)} />
        <span>
          {style.label}
          {advice.personalized ? " theo đơn ăn uống của bác sĩ" : " theo lời khuyên chung cho người bệnh tim"}
        </span>
      </div>
      {advice.reasons.length > 0 ? (
        <ul className="space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
          {advice.reasons.map((reason) => (
            <li key={reason.code}>{reason.message}</li>
          ))}
        </ul>
      ) : (
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          Không có điểm nào cần lưu ý với {advice.personalized ? "đơn của bạn" : "lời khuyên chung"}.
        </p>
      )}
      {!advice.personalized && (
        <p className="text-xs text-muted-foreground">
          Bác sĩ chưa kê đơn ăn uống riêng cho bạn. Khi bác sĩ kê đơn trong buổi tư vấn, đánh giá sẽ theo đơn đó.
        </p>
      )}
    </div>
  )
}

import { AlertTriangle, Ban, Circle, HeartPulse, HelpCircle, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { DietAdvice as DietAdviceData, DietAdviceLevel } from "@/types/nutrition"

const LEVEL_STYLE: Record<DietAdviceLevel, { label: string; icon: LucideIcon; badge: string; icon_: string; box: string }> = {
  GOOD: {
    label: "Tốt cho nhịp tim",
    icon: HeartPulse,
    badge: "bg-success-50 text-success-700 border-success-200/80",
    icon_: "text-success-600",
    box: "bg-success-50/60 border-success-200/80",
  },
  OK: {
    label: "Không có lưu ý",
    icon: Circle,
    badge: "bg-slate-50 text-slate-600 border-slate-200",
    icon_: "text-slate-500",
    box: "bg-slate-50 border-slate-200",
  },
  CAUTION: {
    label: "Cần lưu ý",
    icon: AlertTriangle,
    badge: "bg-warning-50 text-warning-700 border-warning-200/80",
    icon_: "text-warning-600",
    box: "bg-warning-50/60 border-warning-200/80",
  },
  LIMIT: {
    label: "Nên hạn chế",
    icon: Ban,
    badge: "bg-danger-50 text-danger-700 border-danger-200/80",
    icon_: "text-danger-600",
    box: "bg-danger-50/60 border-danger-200/80",
  },
  UNKNOWN: {
    label: "Chưa đủ số liệu",
    icon: HelpCircle,
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    icon_: "text-slate-500",
    box: "bg-slate-50 border-slate-200",
  },
}

/** Nhãn màu của một món theo đơn ăn uống bác sĩ kê (xanh / trung tính / vàng / đỏ / xám). */
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
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Icon className={cn("w-4 h-4", style.icon_)} />
        <span>
          {style.label}
          {" theo đơn ăn uống của bác sĩ"}
        </span>
      </div>
      {advice.reasons.length > 0 ? (
        <ul className="space-y-1 text-xs sm:text-sm text-slate-700 list-disc pl-5">
          {advice.reasons.map((reason) => (
            <li key={reason.code}>{reason.message}</li>
          ))}
        </ul>
      ) : (
        <p className="text-xs sm:text-sm text-slate-700">
          Không có điểm nào cần lưu ý, nhưng cũng chưa có điểm nổi bật cho nhịp tim (kali cao hơn natri, hoặc giàu
          magie mà ít muối).
        </p>
      )}
      {!advice.personalized && (
        <p className="text-xs text-muted-foreground">
          Bác sĩ chưa kê đơn ăn uống riêng cho bạn. Khi bác sĩ kê đơn trong buổi tư vấn, đánh giá sẽ thêm các điều
          bác sĩ dặn.
        </p>
      )}
    </div>
  )
}

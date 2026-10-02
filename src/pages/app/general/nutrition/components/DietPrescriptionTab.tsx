import { Link } from "react-router-dom"
import { ClipboardList, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { USER_ROLES } from "@/constants/roles"
import { useAuthStore } from "@/stores/auth-store"
import { cn } from "@/lib/utils"
import type { DietPrescriptionRule } from "@/types/nutrition"
import { useMyDietPrescription } from "../hooks/use-nutrition"
import { DIET_RULE_META, describeRuleThresholds } from "../diet-rules"
import { DietAdviceBadge } from "./DietAdvice"

/** Ngưỡng đang áp dụng của một quy tắc, kèm "(bác sĩ đặt riêng cho bạn)" nếu bác sĩ chỉnh. */
function describe(rule: DietPrescriptionRule, sodium?: DietPrescriptionRule) {
  const text = describeRuleThresholds(
    rule.code,
    { unit: rule.unit, limit: rule.effectiveLimit, caution: rule.effectiveCaution, good: rule.effectiveGood },
    sodium && { limit: sodium.effectiveLimit, caution: sodium.effectiveCaution }
  )
  const custom = rule.limit != null || rule.caution != null || rule.good != null
  return text ? `${text}${custom ? " (bác sĩ đặt riêng cho bạn)" : ""}.` : ""
}

const LEGEND = [
  { level: "GOOD", text: "Không có điểm xấu và có điểm tốt cho nhịp tim." },
  { level: "OK", text: "Không vướng quy tắc nào, cũng chưa có điểm tốt nổi bật." },
  { level: "CAUTION", text: "Ăn được, chú ý lượng." },
  { level: "LIMIT", text: "Nên hạn chế hoặc tránh." },
  { level: "UNKNOWN", text: "Nguồn dữ liệu thiếu số liệu để đánh giá." },
] as const

/** Tab "Đơn ăn uống": các quy tắc cho người rung nhĩ đang áp dụng, điều bác sĩ dặn riêng và cách đọc màu của món. */
export function DietPrescriptionTab() {
  const role = useAuthStore((s) => s.userSession?.role)
  const isMember = role === USER_ROLES.MEMBER
  const { data: prescription, isLoading, isError, refetch } = useMyDietPrescription(isMember)

  if (!isMember) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-muted-foreground">
        Đơn ăn uống chỉ dành cho hội viên. Bác sĩ kê đơn cho bệnh nhân trong tab "Dinh dưỡng" của phiên tư vấn.
      </div>
    )
  }

  if (isLoading) return <Skeleton className="h-72 rounded-2xl" />

  if (isError || !prescription) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-muted-foreground space-y-2">
        <p>Không tải được đơn ăn uống.</p>
        <button type="button" onClick={() => refetch()} className="text-primary font-medium hover:underline cursor-pointer">
          Thử lại
        </button>
      </div>
    )
  }

  const rules = prescription.rules ?? []
  const sodium = rules.find((rule) => rule.code === "SODIUM")
  const activeRules = rules.filter((rule) => rule.enabled)

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {prescription.personalized ? "Đơn ăn uống của bạn" : "Khuyến nghị cho người rung nhĩ"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {prescription.personalized
                  ? `Các quy tắc chung cho người rung nhĩ, cộng thêm điều bác sĩ dặn trong buổi tư vấn${
                      prescription.updatedAt
                        ? ` (cập nhật ${new Date(prescription.updatedAt).toLocaleDateString("vi-VN")})`
                        : ""
                    }.`
                  : "Bác sĩ chưa kê đơn riêng cho bạn. Các món được chấm màu theo các quy tắc chung dưới đây."}
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-1.5 self-start">
            <Link to="/app/general/nutrition?tab=foods">
              <Search className="w-3.5 h-3.5" />
              Tra cứu món
            </Link>
          </Button>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {activeRules.map((rule) => {
            const meta = DIET_RULE_META[rule.code]
            const Icon = meta.icon
            return (
              <li
                key={rule.code}
                className={cn(
                  "rounded-xl border p-4 flex items-start gap-3",
                  rule.prescribed ? "border-primary-200 bg-primary-50/60" : "border-border bg-card"
                )}
              >
                <Icon className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {rule.name}
                    {rule.prescribed && (
                      <span className="ml-2 text-[11px] font-medium text-primary">Bác sĩ dặn riêng</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {[describe(rule, sodium), meta.summary].filter(Boolean).join(" ")}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>

        {prescription.note && (
          <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-4">
            <p className="text-xs font-semibold text-slate-600 mb-1">Bác sĩ dặn thêm</p>
            <p className="text-sm text-slate-800 whitespace-pre-line">{prescription.note}</p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-foreground">Cách đọc màu của món</h2>
        <div className="grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground">
          {LEGEND.map((item) => (
            <p key={item.level} className="flex items-center gap-2">
              <DietAdviceBadge advice={{ level: item.level, reasons: [], personalized: true }} /> {item.text}
            </p>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Có điểm đỏ thì món là đỏ, không có đỏ mà có vàng thì là vàng. Mở từng món để xem lý do. Đánh giá chỉ so số liệu
          trên 100 g với các ngưỡng, không thay thế lời khuyên trực tiếp của bác sĩ.
        </p>
      </section>
    </div>
  )
}

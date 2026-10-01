import { Link } from "react-router-dom"
import { ClipboardList, Coffee, Droplets, Pill, Search, Wine } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { USER_ROLES } from "@/constants/roles"
import { useAuthStore } from "@/stores/auth-store"
import { cn } from "@/lib/utils"
import type { DietPrescription, DietPrescriptionRule, DietRuleCode } from "@/types/nutrition"
import { useMyDietPrescription } from "../hooks/use-nutrition"
import { DietAdviceBadge } from "./DietAdvice"

const RULES = [
  { key: "limitSodium", code: "SODIUM", icon: Droplets, title: "Hạn chế muối", extra: "" },
  {
    key: "avoidAlcohol",
    code: "ALCOHOL",
    icon: Wine,
    title: "Tránh rượu bia",
    extra: "Rượu bia là tác nhân hay gặp của cơn rung nhĩ.",
  },
  { key: "limitCaffeine", code: "CAFFEINE", icon: Coffee, title: "Hạn chế caffeine", extra: "" },
  {
    key: "onWarfarin",
    code: "VITAMIN_K",
    icon: Pill,
    title: "Đang dùng thuốc chống đông warfarin",
    extra: "Không cần kiêng món nhiều vitamin K, nhưng nên ăn lượng đều mỗi ngày để thuốc ổn định.",
  },
] as const satisfies readonly { key: keyof DietPrescription; code: DietRuleCode; icon: unknown; title: string; extra: string }[]

function formatAmount(value: number) {
  return value.toLocaleString("vi-VN")
}

/** "Đỏ từ 600 mg, vàng từ 120 mg trên 100 g" theo ngưỡng đang áp dụng; kèm "(riêng cho bạn)" nếu bác sĩ chỉnh. */
function describeThreshold(rule?: DietPrescriptionRule) {
  if (!rule) return ""
  const parts = [
    rule.effectiveLimit != null ? `đỏ từ ${formatAmount(rule.effectiveLimit)} ${rule.unit}` : null,
    rule.effectiveCaution != null ? `vàng từ ${formatAmount(rule.effectiveCaution)} ${rule.unit}` : null,
  ].filter(Boolean)
  if (parts.length === 0) return ""
  const custom = rule.limit != null || rule.caution != null
  const text = parts.join(", ")
  return `${text.charAt(0).toUpperCase()}${text.slice(1)} trên 100 g${custom ? " (bác sĩ đặt riêng cho bạn)" : ""}.`
}

/** Tab "Đơn ăn uống": đơn bác sĩ kê cho hội viên và cách các món được chấm màu theo đơn. */
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

  const activeRules = RULES.filter((rule) => prescription[rule.key])

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {prescription.personalized ? "Đơn ăn uống của bạn" : "Lời khuyên chung"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {prescription.personalized
                  ? `Bác sĩ kê trong buổi tư vấn${prescription.updatedAt ? `, cập nhật ${new Date(prescription.updatedAt).toLocaleDateString("vi-VN")}` : ""}.`
                  : "Bác sĩ chưa kê đơn riêng cho bạn. Đang áp dụng lời khuyên chung cho người bệnh tim mạch."}
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-xl gap-1.5 self-start">
            <Link to="/app/general/nutrition?tab=foods">
              <Search className="w-3.5 h-3.5" />
              Tra cứu món theo đơn
            </Link>
          </Button>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {RULES.map((rule) => {
            const on = prescription[rule.key]
            const Icon = rule.icon
            return (
              <li
                key={rule.key}
                className={cn(
                  "rounded-2xl border p-4 flex items-start gap-3",
                  on
                    ? "border-primary/30 bg-primary/5"
                    : "border-slate-200/80 bg-slate-50/60 opacity-70"
                )}
              >
                <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", on ? "text-primary" : "text-slate-400")} />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {rule.title}
                    <span className={cn("ml-2 text-[11px] font-medium", on ? "text-primary" : "text-muted-foreground")}>
                      {on ? "Đang áp dụng" : "Không áp dụng"}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {[describeThreshold(prescription.rules?.find((r) => r.code === rule.code)), rule.extra]
                      .filter(Boolean)
                      .join(" ")}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>

        {prescription.note && (
          <div className="rounded-2xl bg-slate-50 border border-slate-200/70 p-4">
            <p className="text-xs font-semibold text-slate-600 mb-1">Bác sĩ dặn thêm</p>
            <p className="text-sm text-slate-800 whitespace-pre-line">{prescription.note}</p>
          </div>
        )}

        {activeRules.length === 0 && (
          <p className="text-sm text-muted-foreground">Đơn hiện không có giới hạn nào; các món đều hiện "Phù hợp".</p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-slate-900">Cách đọc màu của món</h2>
        <div className="grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground">
          <p className="flex items-center gap-2">
            <DietAdviceBadge advice={{ level: "OK", reasons: [], personalized: true }} /> Không vướng điều nào trong đơn.
          </p>
          <p className="flex items-center gap-2">
            <DietAdviceBadge advice={{ level: "CAUTION", reasons: [], personalized: true }} /> Ăn được, chú ý lượng.
          </p>
          <p className="flex items-center gap-2">
            <DietAdviceBadge advice={{ level: "LIMIT", reasons: [], personalized: true }} /> Vướng điều bác sĩ dặn hạn chế.
          </p>
          <p className="flex items-center gap-2">
            <DietAdviceBadge advice={{ level: "UNKNOWN", reasons: [], personalized: true }} /> Nguồn dữ liệu thiếu số
            liệu để đánh giá.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Mở từng món để xem lý do. Đánh giá chỉ so số liệu trên 100 g với các giới hạn trong đơn, không thay thế lời khuyên
          trực tiếp của bác sĩ.
        </p>
      </section>
    </div>
  )
}

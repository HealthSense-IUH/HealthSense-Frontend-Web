import { useEffect, useState } from "react"
import { ExternalLink, Info, RefreshCw, RotateCcw, Save, SlidersHorizontal } from "lucide-react"

import { Page, PageBody, PageFooter, PageHeader } from "@/components/layout/page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { nutritionApi } from "@/services/nutrition.service"
import type { DietRule, DietRuleCode } from "@/types/nutrition"
import {
  DIET_RULE_META,
  PRIORITY_LABEL,
  THRESHOLD_FIELD_STYLE,
  thresholdFieldsOf as fieldsOf,
  thresholdUnit,
  type DietThresholdField as Field,
} from "@/pages/app/general/nutrition/diet-rules"

type Values = Record<Field, string>

/** Giá trị khởi tạo của V28, để admin khôi phục nhanh. */
const INITIAL: Record<DietRuleCode, Values> = {
  ALCOHOL: { limit: "0", caution: "", good: "" },
  CAFFEINE: { limit: "", caution: "80", good: "" },
  SUGARS: { limit: "10", caution: "2.5", good: "" },
  NA_K_RATIO: { limit: "2", caution: "", good: "1" },
  SODIUM: { limit: "400", caution: "140", good: "" },
  SATURATED_FAT: { limit: "5", caution: "1.5", good: "" },
  MAGNESIUM: { limit: "", caution: "", good: "50" },
  VITAMIN_K: { limit: "", caution: "100", good: "" },
}

type Draft = Record<DietRuleCode, Values>

function toDraft(rules: DietRule[]): Draft {
  const draft = { ...INITIAL }
  rules.forEach((rule) => {
    draft[rule.code] = {
      limit: rule.limit?.toString() ?? "",
      caution: rule.caution?.toString() ?? "",
      good: rule.good?.toString() ?? "",
    }
  })
  return draft
}

function parse(value: string): number | null {
  const trimmed = value.trim().replace(",", ".")
  return trimmed === "" ? null : Number(trimmed)
}

/** Kiểm tra giống backend để báo lỗi ngay trên form. */
function validate(code: DietRuleCode, draft: Values): string | null {
  const values = fieldsOf(code).map((field) => parse(draft[field]))
  if (values.some((value) => value !== null && (Number.isNaN(value) || value < 0))) return "Ngưỡng phải là số không âm."
  if (values.every((value) => value === null)) return "Cần ít nhất một ngưỡng."
  const limit = parse(draft.limit)
  const caution = parse(draft.caution)
  const good = parse(draft.good)
  if (code !== "NA_K_RATIO" && limit !== null && caution !== null && limit < caution)
    return "Ngưỡng đỏ phải lớn hơn hoặc bằng ngưỡng vàng."
  if (code === "NA_K_RATIO" && limit !== null && good !== null && good > limit)
    return "Mức tốt không được cao hơn ngưỡng đỏ."
  return null
}

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string }
  if (err.response?.status === 403) return "Bạn không có quyền sửa ngưỡng đánh giá."
  return err.response?.data?.message || err.message || fallback
}

/** Admin đặt ngưỡng mặc định của bộ quy tắc cho người rung nhĩ; quy tắc chỉ áp dụng khi bác sĩ tick trong đơn và cho bệnh nhân. */
export default function AdminNutritionRulesPage() {
  const { toast } = useToast()
  const [rules, setRules] = useState<DietRule[]>([])
  const [draft, setDraft] = useState<Draft>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const apply = (data: DietRule[]) => {
    setRules(data)
    setDraft(toDraft(data))
  }

  const load = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      apply((await nutritionApi.getDietRules()).data)
    } catch (err) {
      setErrorMsg(readError(err, "Không tải được ngưỡng đánh giá."))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const errors = Object.fromEntries(rules.map((rule) => [rule.code, validate(rule.code, draft[rule.code])]))
  const hasErrors = Object.values(errors).some(Boolean)
  const changed = (rule: DietRule) =>
    fieldsOf(rule.code).some((field) => parse(draft[rule.code][field]) !== (rule[field] ?? null))
  const dirty = rules.some(changed)

  const save = async () => {
    setSaving(true)
    try {
      const thresholds = rules.filter(changed).map((rule) => {
        const fields = fieldsOf(rule.code)
        const value = (field: Field) => (fields.includes(field) ? parse(draft[rule.code][field]) : null)
        return { code: rule.code, limit: value("limit"), caution: value("caution"), good: value("good") }
      })
      apply((await nutritionApi.updateDietRules(thresholds)).data)
      toast({ description: "Đã lưu ngưỡng. Màu của các món sẽ tính theo ngưỡng mới ngay lập tức." })
    } catch (err) {
      toast({ variant: "destructive", description: readError(err, "Không lưu được ngưỡng.") })
    } finally {
      setSaving(false)
    }
  }

  const setField = (code: DietRuleCode, field: Field, value: string) =>
    setDraft((prev) => ({ ...prev, [code]: { ...prev[code], [field]: value } }))

  const priorities = Array.from(new Set(rules.map((rule) => rule.priority))).sort((a, b) => a - b)

  return (
    <Page>
      <PageHeader
        icon={<SlidersHorizontal className="w-5 h-5" />}
        title="Ngưỡng đánh giá dinh dưỡng"
        description="Ngưỡng mặc định của các quy tắc chấm xanh / vàng / đỏ cho người rung nhĩ. Quy tắc chỉ áp dụng cho bệnh nhân khi bác sĩ tick trong đơn ăn uống; bác sĩ có thể đặt ngưỡng riêng. Ngưỡng lưu trong cơ sở dữ liệu, sửa ở đây có hiệu lực ngay."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading || saving} className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Tải lại
            </Button>
            <Button size="sm" onClick={() => void save()} disabled={loading || saving || hasErrors || !dirty} className="gap-1.5">
              <Save className="w-3.5 h-3.5" />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </>
        }
      />

      <PageBody>
        {loading ? (
          <Skeleton className="h-80 rounded-2xl" />
        ) : errorMsg ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-muted-foreground">
            {errorMsg}
          </div>
        ) : (
          priorities.map((priority) => (
            <section key={priority} className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {PRIORITY_LABEL[priority] ?? `Ưu tiên ${priority}`}
              </h2>
              <div className="rounded-2xl border border-border bg-card shadow-xs divide-y divide-slate-100">
                {rules
                  .filter((rule) => rule.priority === priority)
                  .map((rule) => {
                    const meta = DIET_RULE_META[rule.code]
                    const Icon = meta.icon
                    const perUnit = thresholdUnit(rule.code, rule.unit)
                    return (
                      <div key={rule.code} className="p-4 space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="flex items-start gap-3 min-w-0">
                            <Icon className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
                            <div className="min-w-0">
                              <h3 className="text-base font-bold text-foreground">{rule.name}</h3>
                              <p className="text-xs text-muted-foreground">{meta.summary}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDraft((prev) => ({ ...prev, [rule.code]: INITIAL[rule.code] }))}
                            className="gap-1.5 text-xs"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Giá trị ban đầu
                          </Button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {fieldsOf(rule.code).map((field) => (
                            <label key={field} className="space-y-1">
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                <span className={`w-2 h-2 rounded-full ${THRESHOLD_FIELD_STYLE[field].dot}`} />
                                {field === "good" ? THRESHOLD_FIELD_STYLE.good.label(rule.code) : field === "limit" ? "Đỏ (Nên hạn chế) khi trên" : "Vàng (Cần lưu ý) khi trên"}
                              </span>
                              <div className="flex items-center gap-2">
                                <Input
                                  inputMode="decimal"
                                  value={draft[rule.code][field]}
                                  onChange={(event) => setField(rule.code, field, event.target.value)}
                                  placeholder="Không dùng"
                                  disabled={saving}
                                />
                                <span className="text-xs text-muted-foreground whitespace-nowrap">{perUnit}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                        {errors[rule.code] && <p className="text-xs font-medium text-danger-600">{errors[rule.code]}</p>}
                        {rule.evidence && (
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            <span className="font-semibold text-slate-600">Nguồn: </span>
                            {rule.evidence}
                            {rule.evidenceUrl && (
                              <a
                                href={rule.evidenceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="ml-1 inline-flex items-center gap-0.5 text-primary hover:underline"
                              >
                                Xem bài báo <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </p>
                        )}
                        {rule.updatedAt && (
                          <p className="text-[11px] text-muted-foreground">
                            Cập nhật {new Date(rule.updatedAt).toLocaleString("vi-VN")}
                            {rule.updatedBy ? ` bởi ${rule.updatedBy}` : ""}
                          </p>
                        )}
                      </div>
                    )
                  })}
              </div>
            </section>
          ))
        )}
      </PageBody>

      <PageFooter>
        <p className="flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
          <span>
            So sánh "vượt quá" trên 100 g phần ăn được. Gộp màu: có quy tắc đỏ là đỏ; không có đỏ mà có vàng là vàng; không
            có điểm xấu và có điểm tốt (Na/K thấp, hoặc giàu magie mà ít muối) là xanh. Tỷ lệ Na/K chỉ đỏ khi natri cũng
            vượt ngưỡng đỏ của muối; điểm magie chỉ tính khi natri không vượt ngưỡng vàng của muối. Để trống một ô nghĩa là
            quy tắc không có mức đó. Ngưỡng riêng bác sĩ đặt cho bệnh nhân luôn được ưu tiên hơn ngưỡng mặc định ở đây.
          </span>
        </p>
      </PageFooter>
    </Page>
  )
}

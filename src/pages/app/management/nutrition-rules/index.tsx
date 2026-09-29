import { useEffect, useState } from "react"
import { Info, RefreshCw, RotateCcw, Save, SlidersHorizontal } from "lucide-react"

import { Page, PageBody, PageFooter, PageHeader } from "@/components/layout/page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { nutritionApi } from "@/services/nutrition.service"
import type { DietRule, DietRuleCode } from "@/types/nutrition"

/** Giá trị ban đầu của V27, để admin khôi phục nhanh. */
const INITIAL: Record<DietRuleCode, { limit: string; caution: string }> = {
  SODIUM: { limit: "600", caution: "120" },
  ALCOHOL: { limit: "0.5", caution: "" },
  CAFFEINE: { limit: "", caution: "10" },
  VITAMIN_K: { limit: "", caution: "100" },
}

const RULE_HINT: Record<DietRuleCode, string> = {
  SODIUM: "Áp dụng khi đơn có \"Hạn chế muối\" (và cho lời khuyên chung). Mặc định theo nhãn thực phẩm FSA (Anh).",
  ALCOHOL: "Áp dụng khi đơn có \"Tránh rượu bia\" (và cho lời khuyên chung).",
  CAFFEINE: "Áp dụng khi đơn có \"Hạn chế caffeine\".",
  VITAMIN_K: "Áp dụng khi đơn có \"Đang dùng warfarin\": nhắc bệnh nhân giữ lượng vitamin K đều mỗi ngày.",
}

type Draft = Record<DietRuleCode, { limit: string; caution: string }>

function toDraft(rules: DietRule[]): Draft {
  const draft = { ...INITIAL }
  rules.forEach((rule) => {
    draft[rule.code] = { limit: rule.limit?.toString() ?? "", caution: rule.caution?.toString() ?? "" }
  })
  return draft
}

function parse(value: string): number | null {
  const trimmed = value.trim().replace(",", ".")
  return trimmed === "" ? null : Number(trimmed)
}

/** Kiểm tra giống backend để báo lỗi ngay trên form. */
function validate(draft: { limit: string; caution: string }): string | null {
  const limit = parse(draft.limit)
  const caution = parse(draft.caution)
  if ((limit !== null && (Number.isNaN(limit) || limit < 0)) || (caution !== null && (Number.isNaN(caution) || caution < 0)))
    return "Ngưỡng phải là số không âm."
  if (limit === null && caution === null) return "Cần ít nhất một ngưỡng đỏ hoặc vàng."
  if (limit !== null && caution !== null && limit < caution) return "Ngưỡng đỏ phải lớn hơn hoặc bằng ngưỡng vàng."
  return null
}

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string }
  if (err.response?.status === 403) return "Bạn không có quyền sửa ngưỡng đánh giá."
  return err.response?.data?.message || err.message || fallback
}

/** Admin đặt ngưỡng mặc định để chấm xanh/vàng/đỏ cho thực phẩm; bác sĩ vẫn chỉnh riêng được cho từng bệnh nhân. */
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

  const errors = Object.fromEntries(rules.map((rule) => [rule.code, validate(draft[rule.code])]))
  const hasErrors = Object.values(errors).some(Boolean)
  const dirty = rules.some(
    (rule) =>
      parse(draft[rule.code].limit) !== (rule.limit ?? null) || parse(draft[rule.code].caution) !== (rule.caution ?? null)
  )

  const save = async () => {
    setSaving(true)
    try {
      const thresholds = rules.map((rule) => ({
        code: rule.code,
        limit: parse(draft[rule.code].limit),
        caution: parse(draft[rule.code].caution),
      }))
      apply((await nutritionApi.updateDietRules(thresholds)).data)
      toast({ description: "Đã lưu ngưỡng. Màu của các món sẽ tính theo ngưỡng mới ngay lập tức." })
    } catch (err) {
      toast({ variant: "destructive", description: readError(err, "Không lưu được ngưỡng.") })
    } finally {
      setSaving(false)
    }
  }

  const setField = (code: DietRuleCode, field: "limit" | "caution", value: string) =>
    setDraft((prev) => ({ ...prev, [code]: { ...prev[code], [field]: value } }))

  return (
    <Page width="narrow">
      <PageHeader
        icon={<SlidersHorizontal className="w-5 h-5" />}
        title="Ngưỡng đánh giá dinh dưỡng"
        description="Ngưỡng mặc định để chấm xanh / vàng / đỏ cho từng món bệnh nhân tra cứu. Bác sĩ vẫn chỉnh riêng được cho từng bệnh nhân khi kê đơn ăn uống."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading || saving} className="rounded-xl gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Tải lại
            </Button>
            <Button size="sm" onClick={() => void save()} disabled={loading || saving || hasErrors || !dirty} className="rounded-xl gap-1.5">
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
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-border p-8 text-center text-sm text-muted-foreground">
            {errorMsg}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-border dark:bg-card divide-y divide-slate-100 dark:divide-border">
            {rules.map((rule) => (
              <div key={rule.code} className="p-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-foreground">{rule.name}</h2>
                    <p className="text-xs text-muted-foreground">{RULE_HINT[rule.code]}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDraft((prev) => ({ ...prev, [rule.code]: INITIAL[rule.code] }))}
                    className="rounded-xl gap-1.5 text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Giá trị ban đầu
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["limit", "caution"] as const).map((field) => (
                    <label key={field} className="space-y-1">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span className={field === "limit" ? "w-2 h-2 rounded-full bg-rose-500" : "w-2 h-2 rounded-full bg-amber-500"} />
                        {field === "limit" ? "Đỏ (Nên hạn chế) từ" : "Vàng (Cần lưu ý) từ"}
                      </span>
                      <div className="flex items-center gap-2">
                        <Input
                          inputMode="decimal"
                          value={draft[rule.code][field]}
                          onChange={(event) => setField(rule.code, field, event.target.value)}
                          placeholder="Không dùng"
                          disabled={saving}
                          className="rounded-xl"
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{rule.unit} / 100 g</span>
                      </div>
                    </label>
                  ))}
                </div>
                {errors[rule.code] && <p className="text-xs font-medium text-rose-600">{errors[rule.code]}</p>}
                {rule.updatedAt && (
                  <p className="text-[11px] text-muted-foreground">
                    Cập nhật {new Date(rule.updatedAt).toLocaleString("vi-VN")}
                    {rule.updatedBy ? ` bởi ${rule.updatedBy}` : ""}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </PageBody>

      <PageFooter>
        <p className="flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
          <span>
            So sánh "từ mức này trở lên" trên 100 g phần ăn được: đạt ngưỡng đỏ là "Nên hạn chế", đạt ngưỡng vàng là "Cần
            lưu ý". Để trống một ô nghĩa là quy tắc không có mức đó. Ngưỡng riêng bác sĩ đặt cho bệnh nhân luôn được ưu
            tiên hơn ngưỡng mặc định ở đây.
          </span>
        </p>
      </PageFooter>
    </Page>
  )
}

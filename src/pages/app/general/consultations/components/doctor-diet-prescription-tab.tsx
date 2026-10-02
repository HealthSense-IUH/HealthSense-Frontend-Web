import { useEffect, useState } from "react"
import { AlertCircle, ClipboardList, Lock, RefreshCw, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { nutritionApi } from "@/services/nutrition.service"
import type { DietPrescription, DietPrescriptionFlags, DietPrescriptionRule, DietRuleCode } from "@/types/nutrition"
import {
  DIET_RULE_META,
  THRESHOLD_FIELD_STYLE,
  thresholdFieldsOf,
  thresholdUnit,
  type DietThresholdField,
} from "@/pages/app/general/nutrition/diet-rules"

const NOTE_MAX = 1000

/** Mỗi ô ứng với một quy tắc, theo thứ tự ưu tiên. Quy tắc nền luôn áp dụng; ô warfarin bật thêm quy tắc vitamin K. */
const FLAGS: { key: keyof DietPrescriptionFlags; code: DietRuleCode; title: string; detail: string }[] = [
  { key: "avoidAlcohol", code: "ALCOHOL", title: "Tránh rượu bia", detail: "Đã có trong quy tắc chung (có cồn là đỏ); tick để dặn riêng." },
  { key: "limitCaffeine", code: "CAFFEINE", title: "Hạn chế caffeine", detail: "Tick để dặn riêng và đặt ngưỡng caffeine chặt hơn." },
  { key: "limitSugars", code: "SUGARS", title: "Hạn chế đường", detail: "Tick để dặn riêng và đặt ngưỡng đường (không áp cho trái cây, sữa)." },
  {
    key: "watchSodiumPotassium",
    code: "NA_K_RATIO",
    title: "Theo dõi tỷ lệ natri/kali",
    detail: "Tick để dặn riêng và đặt ngưỡng Na/K đỏ, mức Na/K tốt riêng.",
  },
  { key: "limitSodium", code: "SODIUM", title: "Hạn chế muối", detail: "Tick để dặn riêng và đặt ngưỡng muối riêng cho bệnh nhân." },
  {
    key: "limitSaturatedFat",
    code: "SATURATED_FAT",
    title: "Hạn chế chất béo bão hòa",
    detail: "Tick để dặn riêng và đặt ngưỡng chất béo bão hòa riêng.",
  },
  {
    key: "encourageMagnesium",
    code: "MAGNESIUM",
    title: "Khuyến khích món giàu magie",
    detail: "Tick để nhắc bệnh nhân và đặt mức magie được tính là tốt.",
  },
  {
    key: "onWarfarin",
    code: "VITAMIN_K",
    title: "Đang dùng warfarin",
    detail: "Bật thêm quy tắc vitamin K: món nhiều vitamin K hiện vàng, nhắc giữ lượng ăn đều mỗi ngày.",
  },
]

const NO_FLAGS: DietPrescriptionFlags = {
  limitSodium: false,
  onWarfarin: false,
  avoidAlcohol: false,
  limitCaffeine: false,
  limitSugars: false,
  watchSodiumPotassium: false,
  limitSaturatedFat: false,
  encourageMagnesium: false,
}

type Values = Record<DietThresholdField, string>
type Overrides = Record<DietRuleCode, Values>

const EMPTY: Values = { limit: "", caution: "", good: "" }
const EMPTY_OVERRIDES = Object.fromEntries(FLAGS.map((flag) => [flag.code, EMPTY])) as Overrides

function parse(value: string): number | null {
  const trimmed = value.trim().replace(",", ".")
  return trimmed === "" ? null : Number(trimmed)
}

const DEFAULT_OF: Record<DietThresholdField, (rule?: DietPrescriptionRule) => number | undefined> = {
  limit: (rule) => rule?.defaultLimit,
  caution: (rule) => rule?.defaultCaution,
  good: (rule) => rule?.defaultGood,
}

/** Kiểm tra ngưỡng sau khi gộp với mặc định, giống backend. */
function validate(code: DietRuleCode, rule: DietPrescriptionRule | undefined, values: Values): string | null {
  const fields = thresholdFieldsOf(code)
  const parsed = fields.map((field) => parse(values[field]))
  if (parsed.some((value) => value !== null && (Number.isNaN(value) || value < 0))) return "Ngưỡng phải là số không âm."
  const merged = (field: DietThresholdField) =>
    fields.includes(field) ? (parse(values[field]) ?? DEFAULT_OF[field](rule) ?? null) : null
  const limit = merged("limit")
  const caution = merged("caution")
  const good = merged("good")
  if (limit !== null && caution !== null && limit < caution)
    return `Ngưỡng đỏ (${limit}) phải lớn hơn hoặc bằng ngưỡng vàng (${caution}).`
  if (code === "NA_K_RATIO" && limit !== null && good !== null && good > limit)
    return `Mức tốt (${good}) không được cao hơn ngưỡng đỏ (${limit}).`
  return null
}

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string }
  if (err.response?.status === 403) return "Bạn không có quyền xem đơn ăn uống của phiên này."
  return err.response?.data?.message || err.message || fallback
}

interface DoctorDietPrescriptionTabProps {
  sessionId: string | number
  /** Phiên đã kết thúc: chỉ xem */
  readOnly: boolean
}

/** Tab "Dinh dưỡng" trong workspace bác sĩ: kê đơn ăn uống, các món bệnh nhân tra cứu sẽ được chấm màu theo đơn. */
export function DoctorDietPrescriptionTab({ sessionId, readOnly }: DoctorDietPrescriptionTabProps) {
  const { toast } = useToast()
  const [prescription, setPrescription] = useState<DietPrescription | null>(null)
  const [flags, setFlags] = useState<DietPrescriptionFlags>(NO_FLAGS)
  const [overrides, setOverrides] = useState<Overrides>(EMPTY_OVERRIDES)
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const apply = (data: DietPrescription) => {
    setPrescription(data)
    setFlags({
      ...NO_FLAGS,
      ...Object.fromEntries(FLAGS.map((flag) => [flag.key, Boolean(data[flag.key])])),
    })
    const next = { ...EMPTY_OVERRIDES }
    data.rules.forEach((rule) => {
      next[rule.code] = {
        limit: rule.limit?.toString() ?? "",
        caution: rule.caution?.toString() ?? "",
        good: rule.good?.toString() ?? "",
      }
    })
    setOverrides(next)
    setNote(data.note ?? "")
  }

  const load = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      apply((await nutritionApi.getSessionDietPrescription(sessionId)).data)
    } catch (err) {
      setErrorMsg(readError(err, "Không thể tải đơn ăn uống."))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  const ruleOf = (code: DietRuleCode) => prescription?.rules.find((rule) => rule.code === code)
  const errors = Object.fromEntries(
    FLAGS.map((flag) => [flag.code, flags[flag.key] ? validate(flag.code, ruleOf(flag.code), overrides[flag.code]) : null])
  )
  const hasErrors = Object.values(errors).some(Boolean)

  const save = async () => {
    setSaving(true)
    try {
      // Chỉ gửi ngưỡng riêng của quy tắc đang tick và có nhập; còn lại dùng mặc định
      const thresholds = FLAGS.filter((flag) => flags[flag.key])
        .map((flag) => {
          const fields = thresholdFieldsOf(flag.code)
          const value = (field: DietThresholdField) => (fields.includes(field) ? parse(overrides[flag.code][field]) : null)
          return { code: flag.code, limit: value("limit"), caution: value("caution"), good: value("good") }
        })
        .filter((t) => t.limit !== null || t.caution !== null || t.good !== null)
      apply(
        (await nutritionApi.updateSessionDietPrescription(sessionId, { ...flags, note: note.trim() || undefined, thresholds }))
          .data
      )
      toast({ description: "Đã lưu đơn ăn uống. Các món bệnh nhân tra cứu sẽ được đánh giá theo đơn này." })
    } catch (err) {
      toast({ variant: "destructive", description: readError(err, "Không thể lưu đơn ăn uống.") })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Skeleton className="h-80 rounded-2xl" />

  if (errorMsg || !prescription) {
    return (
      <Card className="rounded-2xl border-dashed">
        <CardContent className="p-6 text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-danger-500 mx-auto" />
          <p className="text-sm text-muted-foreground">{errorMsg ?? "Không có dữ liệu."}</p>
          <Button variant="outline" size="sm" onClick={() => void load()} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    )
  }

  const disabled = readOnly || saving

  return (
    <Card className="rounded-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardList className="w-4 h-4 text-primary" />
          Đơn ăn uống
        </CardTitle>
        <CardDescription>
          {prescription.personalized
            ? `Đơn hiện tại${prescription.updatedAt ? `, cập nhật ${new Date(prescription.updatedAt).toLocaleString("vi-VN")}` : ""}. Lưu lại sẽ ghi đè đơn cũ.`
            : "Bệnh nhân chưa có đơn; app đang dùng các quy tắc chung cho người rung nhĩ."}{" "}
          Quy tắc chung luôn áp dụng. Tick một ô để dặn riêng quy tắc đó và đặt ngưỡng riêng (ô để trống là dùng mặc định
          của hệ thống); ô warfarin bật thêm quy tắc vitamin K.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {readOnly && (
          <p className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            Phiên đã kết thúc nên đơn chỉ để xem. Kê hoặc sửa đơn trong phiên đã lên lịch hoặc đang diễn ra.
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {FLAGS.map((flag) => {
            const rule = ruleOf(flag.code)
            const on = flags[flag.key]
            const Icon = DIET_RULE_META[flag.code].icon
            return (
              <div
                key={flag.key}
                className={cn(
                  "rounded-xl border p-3 space-y-3 transition-colors",
                  on ? "border-primary-200 bg-primary-50/50" : "border-border"
                )}
              >
                <label className={cn("flex items-start gap-3", disabled ? "cursor-default" : "cursor-pointer")}>
                  <Checkbox
                    checked={on}
                    disabled={disabled}
                    onCheckedChange={(checked) => setFlags((prev) => ({ ...prev, [flag.key]: checked === true }))}
                    className="mt-0.5"
                  />
                  <span className="space-y-0.5 min-w-0">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                      {flag.title}
                    </span>
                    <span className="block text-xs text-muted-foreground">{flag.detail}</span>
                  </span>
                </label>

                {on && rule && (
                  <div className="grid grid-cols-2 gap-2 pl-7">
                    {thresholdFieldsOf(flag.code).map((field) => {
                      const fallback = DEFAULT_OF[field](rule)
                      return (
                        <label key={field} className="space-y-1">
                          <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                            <span className={cn("w-1.5 h-1.5 rounded-full", THRESHOLD_FIELD_STYLE[field].dot)} />
                            {THRESHOLD_FIELD_STYLE[field].label(flag.code)} ({thresholdUnit(flag.code, rule.unit)})
                          </span>
                          <Input
                            inputMode="decimal"
                            value={overrides[flag.code][field]}
                            onChange={(event) =>
                              setOverrides((prev) => ({
                                ...prev,
                                [flag.code]: { ...prev[flag.code], [field]: event.target.value },
                              }))
                            }
                            placeholder={fallback != null ? `Mặc định ${fallback}` : "Không dùng"}
                            disabled={disabled}
                            className="h-8 text-xs"
                          />
                        </label>
                      )
                    })}
                    {errors[flag.code] && (
                      <p className="col-span-2 text-[11px] font-medium text-danger-600">{errors[flag.code]}</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="diet-note" className="text-sm font-semibold text-foreground">
            Dặn thêm
          </label>
          <Textarea
            id="diet-note"
            value={note}
            maxLength={NOTE_MAX}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ví dụ: ăn thêm cá 2 bữa mỗi tuần, uống đủ nước..."
            disabled={disabled}
            rows={3}
          />
          <p className="text-[11px] text-muted-foreground text-right">
            {note.length}/{NOTE_MAX}
          </p>
        </div>

        {!readOnly && (
          <div className="flex justify-end">
            <Button onClick={() => void save()} disabled={saving || hasErrors} className="gap-1.5">
              <Save className="w-4 h-4" />
              {saving ? "Đang lưu..." : "Lưu đơn ăn uống"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

import { useEffect, useState } from "react"
import { AlertCircle, ClipboardList, RefreshCw, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { nutritionApi } from "@/services/nutrition.service"
import type { DietPrescription, DietPrescriptionFlags, DietPrescriptionRule, DietRuleCode } from "@/types/nutrition"

const NOTE_MAX = 1000

const FLAGS: { key: keyof DietPrescriptionFlags; code: DietRuleCode; title: string; detail: string }[] = [
  { key: "limitSodium", code: "SODIUM", title: "Hạn chế muối", detail: "Món nhiều natri hiện đỏ / vàng." },
  { key: "avoidAlcohol", code: "ALCOHOL", title: "Tránh rượu bia", detail: "Đồ uống có cồn hiện đỏ." },
  { key: "limitCaffeine", code: "CAFFEINE", title: "Hạn chế caffeine", detail: "Món có caffeine hiện vàng." },
  {
    key: "onWarfarin",
    code: "VITAMIN_K",
    title: "Đang dùng warfarin",
    detail: "Món nhiều vitamin K hiện vàng, nhắc giữ lượng ăn đều mỗi ngày.",
  },
]

type Overrides = Record<DietRuleCode, { limit: string; caution: string }>

const EMPTY_OVERRIDES: Overrides = {
  SODIUM: { limit: "", caution: "" },
  ALCOHOL: { limit: "", caution: "" },
  CAFFEINE: { limit: "", caution: "" },
  VITAMIN_K: { limit: "", caution: "" },
}

function parse(value: string): number | null {
  const trimmed = value.trim().replace(",", ".")
  return trimmed === "" ? null : Number(trimmed)
}

/** Kiểm tra ngưỡng sau khi gộp với mặc định, giống backend. */
function validate(rule: DietPrescriptionRule | undefined, override: { limit: string; caution: string }): string | null {
  const limit = parse(override.limit)
  const caution = parse(override.caution)
  if ((limit !== null && (Number.isNaN(limit) || limit < 0)) || (caution !== null && (Number.isNaN(caution) || caution < 0)))
    return "Ngưỡng phải là số không âm."
  const effectiveLimit = limit ?? rule?.defaultLimit ?? null
  const effectiveCaution = caution ?? rule?.defaultCaution ?? null
  if (effectiveLimit !== null && effectiveCaution !== null && effectiveLimit < effectiveCaution)
    return `Ngưỡng đỏ (${effectiveLimit}) phải lớn hơn hoặc bằng ngưỡng vàng (${effectiveCaution}).`
  return null
}

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string }
  if (err.response?.status === 403) return "Bạn không có quyền xem đơn ăn uống của phiên này."
  return err.response?.data?.message || err.message || fallback
}

interface DoctorDietPrescriptionTabProps {
  sessionId: string | number
  /** Phiên đã kết thúc hoặc chưa bắt đầu: chỉ xem */
  readOnly: boolean
}

/** Tab "Dinh dưỡng" trong workspace bác sĩ: kê đơn ăn uống, các món bệnh nhân tra cứu sẽ được chấm màu theo đơn. */
export function DoctorDietPrescriptionTab({ sessionId, readOnly }: DoctorDietPrescriptionTabProps) {
  const { toast } = useToast()
  const [prescription, setPrescription] = useState<DietPrescription | null>(null)
  const [flags, setFlags] = useState<DietPrescriptionFlags>({
    limitSodium: false,
    onWarfarin: false,
    avoidAlcohol: false,
    limitCaffeine: false,
  })
  const [overrides, setOverrides] = useState<Overrides>(EMPTY_OVERRIDES)
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const apply = (data: DietPrescription) => {
    setPrescription(data)
    setFlags({
      limitSodium: data.limitSodium,
      onWarfarin: data.onWarfarin,
      avoidAlcohol: data.avoidAlcohol,
      limitCaffeine: data.limitCaffeine,
    })
    const next = { ...EMPTY_OVERRIDES }
    data.rules.forEach((rule) => {
      next[rule.code] = { limit: rule.limit?.toString() ?? "", caution: rule.caution?.toString() ?? "" }
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
    FLAGS.map((flag) => [flag.code, flags[flag.key] ? validate(ruleOf(flag.code), overrides[flag.code]) : null])
  )
  const hasErrors = Object.values(errors).some(Boolean)

  const save = async () => {
    setSaving(true)
    try {
      // Chỉ gửi ngưỡng riêng của quy tắc đang bật và có nhập; còn lại dùng mặc định
      const thresholds = FLAGS.filter((flag) => flags[flag.key])
        .map((flag) => ({
          code: flag.code,
          limit: parse(overrides[flag.code].limit),
          caution: parse(overrides[flag.code].caution),
        }))
        .filter((t) => t.limit !== null || t.caution !== null)
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
          <Button variant="outline" size="sm" onClick={() => void load()} className="rounded-xl gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    )
  }

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
            : "Bệnh nhân chưa có đơn; app đang dùng lời khuyên chung (hạn chế muối, tránh rượu bia)."}{" "}
          Mọi món bệnh nhân tra cứu sẽ hiện xanh / vàng / đỏ theo đơn này. Ô ngưỡng để trống là dùng mặc định của hệ
          thống.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {FLAGS.map((flag) => {
            const rule = ruleOf(flag.code)
            const on = flags[flag.key]
            return (
              <div key={flag.key} className="rounded-xl border border-slate-200/80 p-3 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer has-[:disabled]:cursor-default">
                  <Checkbox
                    checked={on}
                    disabled={readOnly || saving}
                    onCheckedChange={(checked) => setFlags((prev) => ({ ...prev, [flag.key]: checked === true }))}
                    className="mt-0.5"
                  />
                  <span className="space-y-0.5">
                    <span className="block text-sm font-semibold text-slate-900">{flag.title}</span>
                    <span className="block text-xs text-muted-foreground">{flag.detail}</span>
                  </span>
                </label>

                {on && rule && (
                  <div className="grid grid-cols-2 gap-2 pl-7">
                    {(["limit", "caution"] as const).map((field) => {
                      const fallback = field === "limit" ? rule.defaultLimit : rule.defaultCaution
                      return (
                        <label key={field} className="space-y-1">
                          <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                            <span className={field === "limit" ? "w-1.5 h-1.5 rounded-full bg-danger-500" : "w-1.5 h-1.5 rounded-full bg-warning-500"} />
                            {field === "limit" ? "Đỏ từ" : "Vàng từ"} ({rule.unit}/100 g)
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
                            disabled={readOnly || saving}
                            className="h-8 rounded-lg text-xs"
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
          <label htmlFor="diet-note" className="text-sm font-semibold text-slate-900">
            Dặn thêm
          </label>
          <Textarea
            id="diet-note"
            value={note}
            maxLength={NOTE_MAX}
            disabled={readOnly || saving}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ví dụ: ăn thêm cá 2 bữa mỗi tuần, uống đủ nước..."
            className="rounded-xl"
          />
          <p className="text-[11px] text-muted-foreground text-right">
            {note.length}/{NOTE_MAX}
          </p>
        </div>

        {readOnly ? (
          <p className="text-xs text-muted-foreground">Phiên không còn diễn ra: chỉ xem, không sửa được đơn.</p>
        ) : (
          <div className="flex justify-end">
            <Button onClick={() => void save()} disabled={saving || hasErrors} className="rounded-xl gap-1.5">
              <Save className="w-4 h-4" />
              {saving ? "Đang lưu..." : "Lưu đơn ăn uống"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

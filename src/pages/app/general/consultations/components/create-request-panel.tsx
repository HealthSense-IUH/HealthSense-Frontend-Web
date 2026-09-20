import { type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Send, Activity, AlertCircle, Sparkles, Coins } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

import type { HealthRecordItem, CareServicePackage, ConsultationQueueStatisticsResponse } from "@/types/consultation"
import { formatDate } from "./shared"

export interface RequestFormData {
  packageId?: string
  reasonForCare: string
  currentConcern: string
  careGoal: string
  memberNote: string
  relevantSelfReportedContext: string
  selectedHealthRecordIds: string[]
  preferredDoctorId?: string
  // legacy fallback
  healthRecordId?: string
  reason?: string
}

export function CreateRequestPanel({
  form,
  healthRecords,
  loading,
  insufficientCredits,
  queueStatistics,
  onChange,
  onSubmit,
}: {
  form: RequestFormData
  healthRecords: HealthRecordItem[]
  packages?: CareServicePackage[]
  loading: boolean
  insufficientCredits?: boolean
  queueStatistics?: ConsultationQueueStatisticsResponse | null
  onChange: (form: RequestFormData) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  const navigate = useNavigate()
  const toggleRecordSelection = (recordIdStr: string) => {
    const current = form.selectedHealthRecordIds || []
    const updated = current.includes(recordIdStr)
      ? current.filter((id) => id !== recordIdStr)
      : [...current, recordIdStr]
    onChange({
      ...form,
      selectedHealthRecordIds: updated,
      healthRecordId: updated[0] || "",
    })
  }

  const selectAllRecords = () => {
    const allIds = healthRecords.map((r) => String(r.id))
    onChange({
      ...form,
      selectedHealthRecordIds: allIds,
      healthRecordId: allIds[0] || "",
    })
  }

  const deselectAllRecords = () => {
    onChange({
      ...form,
      selectedHealthRecordIds: [],
      healthRecordId: "",
    })
  }

  const isValid = !!form.reasonForCare.trim() && !!form.currentConcern.trim()

  return (
    <Card className="shadow-sm border rounded-2xl max-w-2xl mx-auto">
      <CardHeader className="border-b bg-muted/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Đăng ký Tư vấn Sức khỏe</CardTitle>
            <CardDescription>
              Yêu cầu của bạn sẽ được xếp vào hàng đợi trực tiếp (FIFO) và ghép nối tự động với bác sĩ đang trực.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form className="flex flex-col gap-6" onSubmit={onSubmit}>
          {insufficientCredits && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl gap-3 text-amber-950 dark:text-amber-200">
              <div className="flex items-start sm:items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <p className="font-semibold text-sm text-foreground">Bạn không đủ lượt tư vấn để vào hàng đợi</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Thông tin đã nhập trên form được giữ nguyên. Vui lòng mua thêm gói lượt để tiếp tục.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                className="shrink-0 bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-xl gap-1.5 shadow-xs"
                onClick={() => navigate("/app/general/credits?tab=packages")}
              >
                <Coins className="w-3.5 h-3.5" />
                Mua thêm lượt tư vấn
              </Button>
            </div>
          )}

          {/* Section 2: Health Records Selection */}
          <div className="space-y-3 border-t pt-5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-primary" />
                Hồ sơ đo đạc đính kèm ({form.selectedHealthRecordIds?.length || 0} đã chọn)
              </Label>
              {healthRecords.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    onClick={selectAllRecords}
                  >
                    Chọn tất cả
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    onClick={deselectAllRecords}
                  >
                    Bỏ chọn
                  </Button>
                </div>
              )}
            </div>

            {healthRecords.length === 0 ? (
              <div className="p-4 bg-muted/20 border border-dashed rounded-xl text-xs text-muted-foreground text-center">
                Bạn chưa có bản ghi đo đạc nào. Bạn vẫn có thể gửi yêu cầu tư vấn trực tiếp và tải lên hồ sơ sau.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1 border rounded-xl bg-muted/10">
                {healthRecords.map((record) => {
                  const idStr = String(record.id)
                  const isChecked = form.selectedHealthRecordIds?.includes(idStr)
                  return (
                    <div
                      key={record.id}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.preventDefault()
                        toggleRecordSelection(idStr)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          toggleRecordSelection(idStr)
                        }
                      }}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all select-none ${
                        isChecked
                          ? "bg-primary/10 border-primary/50 shadow-2xs"
                          : "bg-card hover:bg-muted/30 border-border"
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        tabIndex={-1}
                        className="data-[state=checked]:bg-primary pointer-events-none"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs truncate text-foreground">
                            #{record.id} {record.originalFileName ? `- ${record.originalFileName}` : ""}
                          </span>
                          {record.predictionLabel && (
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 px-1.5 h-4 bg-background"
                            >
                              {record.predictionLabel}
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {formatDate(record.createdAt)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Section 3: V3 Clinical Intake Details */}
          <div className="space-y-4 border-t pt-5">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reasonForCare" className="text-sm font-semibold">
                  Lý do đăng ký chăm sóc / tư vấn <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="reasonForCare"
                  required
                  placeholder="VD: Nhịp tim không đều sau khi tập thể dục, cần tư vấn chuyên khoa tim mạch..."
                  value={form.reasonForCare}
                  onChange={(e) => onChange({ ...form, reasonForCare: e.target.value, reason: e.target.value })}
                  className="rounded-xl h-11"
                  maxLength={1000}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentConcern" className="text-sm font-semibold">
                  Triệu chứng & Vấn đề lo ngại hiện tại <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="currentConcern"
                  required
                  rows={3}
                  placeholder="Mô tả cụ thể triệu chứng: thời điểm xuất hiện, tần suất, cảm giác hồi hộp, khó thở, chóng mặt..."
                  value={form.currentConcern}
                  onChange={(e) => onChange({ ...form, currentConcern: e.target.value })}
                  className="rounded-xl resize-none"
                  maxLength={2000}
                />
              </div>
            </div>
          </div>

          <div className="flex items-start sm:items-center gap-2.5 p-3.5 bg-primary/5 border border-primary/20 rounded-xl text-xs text-muted-foreground">
            <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5 sm:mt-0" />
            <span>
              {queueStatistics?.creditPolicy === "PER_SESSION_V1"
                ? `Mỗi phiên tư vấn sử dụng ${queueStatistics.creditCost ?? 1} lượt. Lượt sẽ được tạm giữ khi vào hàng đợi và chỉ trừ khi bắt đầu phiên khám.`
                : queueStatistics?.creditPolicy === "FREE_EXISTING" || queueStatistics?.creditPolicy === "FREE_DISABLED"
                ? "Phiên tư vấn miễn phí, không trừ lượt."
                : "Yêu cầu của bạn sẽ nhận số thứ tự cố định và được xếp vào hàng đợi trực tiếp (FIFO)."}
            </span>
          </div>

          <Button
            type="submit"
            disabled={loading || !isValid}
            className="w-full h-11 rounded-xl text-base font-semibold gap-2 shadow-xs"
          >
            <Send className="w-4 h-4" />
            {loading ? "Đang gửi yêu cầu..." : "Gửi yêu cầu & Vào hàng đợi"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

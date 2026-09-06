import { type FormEvent } from "react"
import { Send, Activity, AlertCircle, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

import type { HealthRecordItem, CareServicePackage } from "@/types/consultation"
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
  onChange,
  onSubmit,
}: {
  form: RequestFormData
  healthRecords: HealthRecordItem[]
  packages?: CareServicePackage[]
  loading: boolean
  onChange: (form: RequestFormData) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="careGoal" className="text-sm font-semibold">
                    Mục tiêu tư vấn (Tùy chọn)
                  </Label>
                  <Input
                    id="careGoal"
                    placeholder="VD: Có kế hoạch theo dõi và cải thiện lối sống..."
                    value={form.careGoal}
                    onChange={(e) => onChange({ ...form, careGoal: e.target.value })}
                    className="rounded-xl h-11"
                    maxLength={1000}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="memberNote" className="text-sm font-semibold">
                    Ghi chú thêm (Tùy chọn)
                  </Label>
                  <Input
                    id="memberNote"
                    placeholder="VD: Tôi thường làm ca tối, huyết áp bình thường..."
                    value={form.memberNote}
                    onChange={(e) => onChange({ ...form, memberNote: e.target.value })}
                    className="rounded-xl h-11"
                    maxLength={1000}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="relevantSelfReportedContext" className="text-sm font-semibold">
                  Bối cảnh sức khỏe tự báo cáo (Tùy chọn)
                </Label>
                <Textarea
                  id="relevantSelfReportedContext"
                  rows={2}
                  placeholder="VD: Không dùng thuốc kê đơn, tiền sử gia đình không có bệnh tim mạch..."
                  value={form.relevantSelfReportedContext}
                  onChange={(e) => onChange({ ...form, relevantSelfReportedContext: e.target.value })}
                  className="rounded-xl resize-none"
                  maxLength={4000}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3.5 bg-primary/5 border border-primary/20 rounded-xl text-xs text-muted-foreground">
            <AlertCircle className="w-4 h-4 text-primary shrink-0" />
            <span>
              Yêu cầu của bạn sẽ nhận số thứ tự cố định và được xếp vào hàng đợi trực tiếp (FIFO). Không yêu cầu chọn gói hay thanh toán.
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

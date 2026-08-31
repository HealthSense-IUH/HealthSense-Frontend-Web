import { type FormEvent } from "react"
import { Send, FileText, Activity, AlertCircle, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

import type { HealthRecordItem, CareServicePackage } from "../types"
import { formatDate } from "./shared"

export interface RequestFormData {
  packageId: string
  reasonForCare: string
  currentConcern: string
  careGoal: string
  memberNote: string
  relevantSelfReportedContext: string
  selectedHealthRecordIds: string[]
  preferredDoctorId: string
  // legacy fallback
  healthRecordId?: string
  reason?: string
}

export function CreateRequestPanel({
  form,
  healthRecords,
  packages,
  loading,
  onChange,
  onSubmit,
}: {
  form: RequestFormData
  healthRecords: HealthRecordItem[]
  packages: CareServicePackage[]
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

  const selectedPackage = packages.find((p) => String(p.id) === form.packageId)
  const isValid = !!form.packageId && !!form.reasonForCare.trim() && !!form.currentConcern.trim()

  return (
    <Card className="shadow-sm border rounded-2xl">
      <CardHeader className="border-b bg-muted/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Đăng ký Tư vấn & Chăm sóc 1-1</CardTitle>
            <CardDescription>
              Hoàn tất phiếu thông tin sức khỏe ban đầu để điều phối viên ghép nối bác sĩ phù hợp nhất.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form className="flex flex-col gap-6" onSubmit={onSubmit}>
          {/* Section 1: Package Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary" />
              Gói dịch vụ chăm sóc <span className="text-red-500">*</span>
            </Label>
            <Select
              required
              value={form.packageId || ""}
              onValueChange={(value) => onChange({ ...form, packageId: value })}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Chọn gói dịch vụ tư vấn phù hợp">
                  {selectedPackage
                    ? `${selectedPackage.name} (${selectedPackage.priceAmount.toLocaleString("vi-VN", { style: "currency", currency: selectedPackage.currency || "VND" })} • ${selectedPackage.durationDays} ngày)`
                    : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {packages.map((pkg) => (
                    <SelectItem key={pkg.id} value={String(pkg.id)}>
                      {pkg.name} — {pkg.priceAmount.toLocaleString("vi-VN", { style: "currency", currency: pkg.currency || "VND" })} • {pkg.durationDays} ngày
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {selectedPackage && (
              <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-xl text-xs text-muted-foreground space-y-1">
                <div className="font-medium text-foreground">{selectedPackage.name} - {selectedPackage.code}</div>
                {selectedPackage.description && <p>{selectedPackage.description}</p>}
                <div className="text-primary font-semibold pt-0.5">
                  Thời hạn đồng hành: {selectedPackage.durationDays} ngày &bull; Giá: {selectedPackage.priceAmount.toLocaleString("vi-VN", { style: "currency", currency: selectedPackage.currency || "VND" })}
                </div>
              </div>
            )}
          </div>

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
                  maxLength={500}
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
                  maxLength={1000}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="careGoal" className="text-sm font-medium">
                    Mục tiêu chăm sóc mong muốn (Tùy chọn)
                  </Label>
                  <Textarea
                    id="careGoal"
                    rows={2}
                    placeholder="VD: Ổn định nhịp tim, cải thiện giấc ngủ, tối ưu hóa chỉ số HRV..."
                    value={form.careGoal}
                    onChange={(e) => onChange({ ...form, careGoal: e.target.value })}
                    className="rounded-xl resize-none text-xs"
                    maxLength={500}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relevantSelfReportedContext" className="text-sm font-medium">
                    Tiền sử bệnh & Thuốc đang dùng (Tùy chọn)
                  </Label>
                  <Textarea
                    id="relevantSelfReportedContext"
                    rows={2}
                    placeholder="VD: Tiền sử tăng huyết áp 2 năm, đang sử dụng thuốc theo đơn..."
                    value={form.relevantSelfReportedContext}
                    onChange={(e) => onChange({ ...form, relevantSelfReportedContext: e.target.value })}
                    className="rounded-xl resize-none text-xs"
                    maxLength={500}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="memberNote" className="text-sm font-medium">
                    Ghi chú thêm cho Bác sĩ (Tùy chọn)
                  </Label>
                  <Input
                    id="memberNote"
                    placeholder="Ghi chú thêm giờ giấc thuận tiện liên hệ..."
                    value={form.memberNote}
                    onChange={(e) => onChange({ ...form, memberNote: e.target.value })}
                    className="rounded-xl h-10 text-xs"
                    maxLength={300}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredDoctorId" className="text-sm font-medium">
                    Mã Bác sĩ mong muốn (Tùy chọn)
                  </Label>
                  <Input
                    id="preferredDoctorId"
                    placeholder="Để trống nếu muốn điều phối viên tự chọn"
                    value={form.preferredDoctorId}
                    onChange={(e) => onChange({ ...form, preferredDoctorId: e.target.value })}
                    className="rounded-xl h-10 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-xl text-xs text-muted-foreground">
            <AlertCircle className="w-4 h-4 text-primary shrink-0" />
            <span>
              Sau khi gửi yêu cầu, điều phối viên sẽ kiểm tra và phân công bác sĩ chuyên khoa. Bạn sẽ nhận được bản Thỏa thuận dịch vụ để xem và xác nhận trước khi thanh toán.
            </span>
          </div>

          <Button
            type="submit"
            disabled={loading || !isValid}
            className="w-full h-11 rounded-xl text-base font-semibold gap-2 shadow-xs"
          >
            <Send className="w-4 h-4" />
            {loading ? "Đang gửi yêu cầu..." : "Gửi yêu cầu tư vấn"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

import { type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import type { CareTerminationReason, ConsultationRequestItem, ConsultationSessionItem } from "@/types/consultation"

const TERMINATION_REASONS: { value: CareTerminationReason; label: string }[] = [
  { value: "ADMINISTRATIVE_CLOSURE", label: "Đóng phiên hành chính / Điều phối viên kết thúc" },
  { value: "MEMBER_REQUESTED", label: "Hội viên yêu cầu kết thúc sớm" },
  { value: "DOCTOR_UNAVAILABLE", label: "Bác sĩ không thể tiếp tục sắp xếp hỗ trợ" },
  { value: "MEMBER_UNAVAILABLE", label: "Hội viên bận / không thể tiếp tục theo dõi" },
  { value: "SAFETY_OR_SCOPE_REASON", label: "Cần can thiệp trực tiếp / Vượt phạm vi tư vấn từ xa" },
  { value: "SERVICE_VIOLATION", label: "Vi phạm quy tắc trao đổi / dịch vụ" },
  { value: "TECHNICAL_FAILURE", label: "Sự cố kỹ thuật / kết nối kéo dài" },
  { value: "OTHER", label: "Lý do khác" },
]

export type AdminDialogMode = "approve" | "reject" | "close" | null

export function AdminActionDialog({
  mode,
  request,
  session,
  doctorId,
  reason,
  terminationReason,
  meaningfulCareOccurred,
  loading,
  onDoctorIdChange,
  onReasonChange,
  onTerminationReasonChange,
  onMeaningfulCareOccurredChange,
  onSubmit,
  onOpenChange,
}: {
  mode: AdminDialogMode
  request: ConsultationRequestItem | null
  session: ConsultationSessionItem | null
  doctorId: string
  reason: string
  terminationReason: CareTerminationReason | null
  meaningfulCareOccurred: boolean
  loading: boolean
  onDoctorIdChange: (value: string) => void
  onReasonChange: (value: string) => void
  onTerminationReasonChange: (value: CareTerminationReason | null) => void
  onMeaningfulCareOccurredChange: (value: boolean) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onOpenChange: (open: boolean) => void
}) {
  const isOpen = mode !== null
  const title =
    mode === "approve"
      ? `Điều phối bác sĩ cho yêu cầu #${request?.id}`
      : mode === "reject"
        ? `Từ chối yêu cầu #${request?.id}`
        : `Đóng phiên tư vấn #${session?.id}`
  const description =
    mode === "approve"
      ? "Chỉ định mã bác sĩ phụ trách cho phiên tư vấn này."
      : mode === "reject"
        ? "Nhập lý do từ chối yêu cầu tư vấn."
        : "Xác nhận đóng phiên tư vấn và thiết lập trạng thái phát sinh chăm sóc."
  const needsReason = mode === "reject" || mode === "close"

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          {mode === "approve" && (
            <label className="flex flex-col gap-2 text-sm font-medium">
              Mã Bác sĩ (Doctor ID) <span className="text-destructive">*</span>
              <Input
                required
                placeholder="Nhập ID bác sĩ..."
                value={doctorId}
                onChange={(event) => onDoctorIdChange(event.target.value)}
              />
            </label>
          )}

          {mode === "close" && (
            <>
              <div className="flex items-start space-x-3 rounded-lg border p-3 bg-muted/30">
                <Checkbox
                  id="meaningful-care"
                  checked={meaningfulCareOccurred}
                  onCheckedChange={(checked) => onMeaningfulCareOccurredChange(checked === true)}
                  className="mt-0.5"
                />
                <div className="space-y-1 leading-none">
                  <label
                    htmlFor="meaningful-care"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Đã phát sinh chăm sóc/tư vấn thực tế
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {session?.status === "ACTIVE"
                      ? "Mặc định BẬT cho phiên đang hoạt động. Cho phép bác sĩ tiếp tục soạn và hoàn tất Tổng kết y khoa sau khi đóng phiên."
                      : "Mặc định TẮT cho phiên chưa bắt đầu (SCHEDULED)."}
                  </p>
                </div>
              </div>

              <label className="flex flex-col gap-2 text-sm font-medium">
                Phân loại lý do kết thúc (Termination Reason)
                <Select
                  value={terminationReason || "ADMINISTRATIVE_CLOSURE"}
                  onValueChange={(val) => onTerminationReasonChange(val as CareTerminationReason)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lý do kết thúc..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TERMINATION_REASONS.map((tr) => (
                      <SelectItem key={tr.value} value={tr.value}>
                        {tr.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </>
          )}

          {needsReason && (
            <label className="flex flex-col gap-2 text-sm font-medium">
              Lý do {mode === "close" ? "đóng phiên" : "từ chối"} <span className="text-destructive">*</span>
              <Textarea
                required
                rows={3}
                placeholder={mode === "close" ? "Nhập lý do đóng phiên tư vấn..." : "Nhập lý do từ chối..."}
                value={reason}
                onChange={(event) => onReasonChange(event.target.value)}
              />
            </label>
          )}

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

import { useEffect, useState } from "react"
import { Shield, FileText, Stethoscope, Clock, AlertCircle, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"

import { consultationApi } from "@/services"
import type { CareServiceAgreementResponse } from "@/types/consultation"
import { formatDate, parseSupportSchedule } from "./shared"

interface CareAgreementDialogProps {
  requestId: string | number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAgreementAccepted: () => void
}

export function CareAgreementDialog({
  requestId,
  open,
  onOpenChange,
  onAgreementAccepted,
}: CareAgreementDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [agreement, setAgreement] = useState<CareServiceAgreementResponse | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  useEffect(() => {
    if (open && requestId) {
      setLoading(true)
      setAcceptedTerms(false)
      consultationApi.getAgreement(requestId)
        .then((res) => {
          setAgreement(res.data)
        })
        .catch((err) => {
          const msg = err.response?.data?.message || "Không thể tải thỏa thuận dịch vụ."
          toast({
            variant: "destructive",
            title: "Lỗi tải thỏa thuận",
            description: msg,
          })
          onOpenChange(false)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setAgreement(null)
      setAcceptedTerms(false)
    }
  }, [open, requestId, toast, onOpenChange])

  const handleAccept = async () => {
    if (!requestId || !agreement || !acceptedTerms) return

    const agreementId = agreement.id || agreement.agreementId
    if (!agreementId) return

    setSubmitting(true)
    try {
      await consultationApi.acceptAgreement(requestId, {
        agreementId: agreementId,
        accepted: true,
      })
      toast({
        title: "Xác nhận thỏa thuận thành công",
        description: "Bạn đã chấp nhận thỏa thuận. Vui lòng tiến hành thanh toán để kích hoạt phiên tư vấn.",
      })
      onOpenChange(false)
      onAgreementAccepted()
    } catch (err: any) {
      const msg = err.response?.data?.message || "Không thể xác nhận thỏa thuận lúc này."
      toast({
        variant: "destructive",
        title: "Lỗi xác nhận",
        description: msg,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const pkgName = agreement?.packageName || agreement?.packageSnapshot?.name || "Gói chăm sóc sức khỏe"
  const pkgCode = agreement?.packageCode || agreement?.packageSnapshot?.code || ""
  const priceAmount = agreement?.priceAmount ?? agreement?.packageSnapshot?.priceAmount ?? 0
  const currency = agreement?.currency || agreement?.packageSnapshot?.currency || "VND"
  const durationDays = agreement?.durationDays ?? agreement?.packageSnapshot?.durationDays ?? 30
  const description = agreement?.serviceDescription || agreement?.packageSnapshot?.description || ""
  const termsPolicy = agreement?.termsPolicyReference || agreement?.packageSnapshot?.termsPolicyReference || agreement?.limitations || agreement?.packageSnapshot?.limitations || ""
  const supportPolicy = agreement?.supportPolicy || agreement?.packageSnapshot?.supportPolicy || "ASSIGNED_DOCTOR_SUPPORT_SCHEDULE"
  const supportSchedule = agreement?.supportScheduleSnapshotJson || agreement?.doctorSnapshot?.declaredSupportSchedule
  const supportTimezone = agreement?.supportTimezoneSnapshot || agreement?.doctorSnapshot?.timezone || "Asia/Ho_Chi_Minh"
  const doctorName = agreement?.doctorSnapshot?.displayName || "Bác sĩ phụ trách"
  const doctorEmail = agreement?.doctorSnapshot?.email
  const doctorSpecialty = agreement?.doctorSnapshot?.specialty

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 border-b bg-muted/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Thỏa thuận Dịch vụ Chăm sóc Sức khỏe</DialogTitle>
                <DialogDescription>
                  Care Service Agreement &bull; Yêu cầu #{requestId}
                </DialogDescription>
              </div>
            </div>
            {agreement?.status && (
              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 font-medium">
                {agreement.status === "PENDING_ACCEPTANCE" ? "Chờ bạn xác nhận" : agreement.status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh] p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Đang tải thông tin thỏa thuận dịch vụ...</span>
            </div>
          ) : agreement ? (
            <div className="space-y-6">
              {/* Validity notice banner */}
              {agreement.validUntil && (
                <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Thời hạn chấp nhận & giữ chỗ:</strong> Thỏa thuận này có hiệu lực đến{" "}
                    <span className="font-semibold">{formatDate(agreement.validUntil)}</span>. Sau thời gian này nếu chưa hoàn tất thanh toán, bác sĩ sẽ được giải phóng cho hội viên khác.
                  </div>
                </div>
              )}

              {/* Grid 2 cards: Doctor & Package */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Doctor Assignment Card */}
                <div className="p-4 border rounded-xl bg-card space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Stethoscope className="w-4 h-4 text-primary" />
                    Bác sĩ phụ trách chăm sóc
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium text-base text-foreground">{doctorName}</div>
                    {doctorEmail && <div className="text-xs text-muted-foreground">{doctorEmail}</div>}
                    {doctorSpecialty && (
                      <div className="text-xs pt-1">
                        <span className="text-muted-foreground">Chuyên khoa:</span>{" "}
                        <span className="font-medium text-foreground">{doctorSpecialty}</span>
                      </div>
                    )}
                    {(() => {
                      const scheduleList = parseSupportSchedule(supportSchedule)
                      if (scheduleList && scheduleList.length > 0) {
                        return (
                          <div className="space-y-1.5 pt-2">
                            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-primary" />
                              <span>Khung giờ hỗ trợ:</span>
                            </div>
                            <div className="space-y-1 bg-muted/40 p-2.5 rounded-lg border border-border/50 text-xs">
                              {scheduleList.map((item) => (
                                <div key={item.day} className="flex items-center justify-between gap-2 py-0.5 border-b border-border/30 last:border-0">
                                  <span className="font-medium text-foreground">{item.dayLabel}:</span>
                                  <span className="text-muted-foreground font-mono text-[11px]">{item.times.join(", ")}</span>
                                </div>
                              ))}
                              {supportTimezone && (
                                <div className="text-[10px] text-muted-foreground text-right pt-1 mt-0.5">
                                  Múi giờ: {supportTimezone}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      }
                      if (supportSchedule) {
                        return (
                          <div className="text-xs pt-1 bg-muted/30 p-2 rounded-md text-muted-foreground font-mono">
                            Khung giờ hỗ trợ: {supportSchedule} {supportTimezone ? `(${supportTimezone})` : ""}
                          </div>
                        )
                      }
                      return null
                    })()}
                  </div>
                </div>

                {/* Service Package Card */}
                <div className="p-4 border rounded-xl bg-card space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <FileText className="w-4 h-4 text-primary" />
                    Gói dịch vụ đã chọn
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium text-base text-foreground">{pkgName}</div>
                    {pkgCode && <div className="text-xs text-muted-foreground">Mã gói: {pkgCode}</div>}
                    <div className="pt-1 text-base font-bold text-primary">
                      {priceAmount > 0 ? priceAmount.toLocaleString("vi-VN", { style: "currency", currency }) : "Miễn phí"}{" "}
                      <span className="text-xs font-normal text-muted-foreground">/ {durationDays} ngày đồng hành</span>
                    </div>
                    {description && (
                      <p className="text-xs text-muted-foreground pt-1 line-clamp-2">{description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Scope, Limitations & Policy */}
              <div className="p-4 border rounded-xl bg-muted/20 space-y-3 text-xs text-muted-foreground">
                <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  Phạm vi & Điều khoản dịch vụ
                </div>
                
                {termsPolicy && (
                  <div>
                    <strong className="text-foreground">Tham chiếu điều khoản & giới hạn:</strong> {termsPolicy}
                  </div>
                )}

                {agreement?.emergencyLimitation && (
                  <div>
                    <strong className="text-foreground">Giới hạn cấp cứu:</strong> {agreement.emergencyLimitation}
                  </div>
                )}

                {supportPolicy && (
                  <div>
                    <strong className="text-foreground">Chính sách hỗ trợ:</strong> {supportPolicy === "ASSIGNED_DOCTOR_SUPPORT_SCHEDULE" ? "Theo lịch làm việc của bác sĩ phụ trách" : supportPolicy}
                  </div>
                )}

                <div className="pt-2 border-t text-neutral-500 leading-relaxed">
                  * Lưu ý: Dịch vụ tư vấn trực tuyến và theo dõi sức khỏe này không thay thế cho việc cấp cứu y tế khẩn cấp hoặc chỉ định điều trị nội trú. Trong trường hợp có các dấu hiệu nguy kịch như đau thắt ngực dữ dội, khó thở cấp tính, vui lòng liên hệ ngay cơ sở y tế gần nhất hoặc gọi 115.
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">Không có dữ liệu thỏa thuận.</div>
          )}
        </ScrollArea>

        {/* Pinned Explicit Acceptance Checkbox */}
        {agreement && (
          <div className="px-6 py-3.5 border-t bg-primary/5 border-primary/20 shrink-0">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="accept-terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
                disabled={submitting}
                className="mt-0.5 data-[state=checked]:bg-primary h-4 w-4 shrink-0"
              />
              <label
                htmlFor="accept-terms"
                className="text-xs sm:text-sm font-medium leading-tight sm:leading-relaxed text-foreground cursor-pointer select-none"
              >
                Tôi đã đọc, hiểu rõ và đồng ý với các điều khoản dịch vụ, phạm vi chăm sóc, khung giờ hỗ trợ của bác sĩ và mức phí quy định trong bản Thỏa thuận này.
              </label>
            </div>
          </div>
        )}

        <DialogFooter className="p-4 border-t bg-muted/10 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Đóng
          </Button>
          <Button
            type="button"
            onClick={handleAccept}
            disabled={!acceptedTerms || submitting || loading || !agreement}
            className="gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            {submitting ? "Đang xác nhận..." : "Xác nhận & Tiến hành thanh toán"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

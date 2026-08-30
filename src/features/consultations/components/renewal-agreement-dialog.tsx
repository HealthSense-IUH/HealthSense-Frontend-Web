import { useEffect, useState } from "react"
import { FileText, Stethoscope, Clock, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"

import { consultationApi } from "../services/consultation-api"
import type { CareServiceAgreementResponse } from "../types"
import { formatDate } from "./shared"

interface RenewalAgreementDialogProps {
  renewalId: string | number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAgreementAccepted: () => void
}

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err.response?.data?.message || err.message || fallback
}

export function RenewalAgreementDialog({
  renewalId,
  open,
  onOpenChange,
  onAgreementAccepted,
}: RenewalAgreementDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [agreement, setAgreement] = useState<CareServiceAgreementResponse | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  useEffect(() => {
    if (open && renewalId) {
      setLoading(true)
      setAcceptedTerms(false)
      consultationApi
        .getRenewalAgreement(renewalId)
        .then((res) => {
          setAgreement(res.data)
        })
        .catch((err) => {
          toast({
            variant: "destructive",
            title: "Lỗi tải thỏa thuận gia hạn",
            description: readError(err, "Không thể tải thỏa thuận gia hạn dịch vụ."),
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
  }, [open, renewalId, toast, onOpenChange])

  const handleAccept = async () => {
    if (!renewalId || !agreement || !acceptedTerms) return

    const agreementId = agreement.id || agreement.agreementId
    if (!agreementId) return

    setSubmitting(true)
    try {
      await consultationApi.acceptRenewalAgreement(renewalId, {
        agreementId: Number(agreementId),
        accepted: true,
      })
      toast({
        title: "Xác nhận thỏa thuận gia hạn thành công",
        description: "Bạn đã chấp nhận thỏa thuận gia hạn. Vui lòng tiến hành thanh toán để áp dụng thời hạn mới.",
      })
      onOpenChange(false)
      onAgreementAccepted()
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Lỗi xác nhận thỏa thuận",
        description: readError(err, "Không thể xác nhận thỏa thuận gia hạn lúc này."),
      })
    } finally {
      setSubmitting(false)
    }
  }

  const pkgName = agreement?.packageName || agreement?.packageSnapshot?.name || "Gói gia hạn chăm sóc"
  const pkgCode = agreement?.packageCode || agreement?.packageSnapshot?.code || ""
  const priceAmount = agreement?.priceAmount ?? agreement?.packageSnapshot?.priceAmount ?? 0
  const currency = agreement?.currency || agreement?.packageSnapshot?.currency || "VND"
  const durationDays = agreement?.durationDays ?? agreement?.packageSnapshot?.durationDays ?? 30
  const description = agreement?.serviceDescription || agreement?.packageSnapshot?.description || ""
  const termsPolicy = agreement?.termsPolicyReference || agreement?.packageSnapshot?.termsPolicyReference || agreement?.limitations || agreement?.packageSnapshot?.limitations || ""
  const supportPolicy = agreement?.supportPolicy || agreement?.packageSnapshot?.supportPolicy || "ASSIGNED_DOCTOR_SUPPORT_SCHEDULE"
  const includedList = agreement?.includedServices || agreement?.packageSnapshot?.includedServices || agreement?.packageSnapshot?.includedServiceTypes || []
  const excludedList = agreement?.excludedServices || agreement?.packageSnapshot?.excludedServices || agreement?.packageSnapshot?.excludedServiceTypes || []
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
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Thỏa thuận Gia hạn Dịch vụ Chăm sóc</DialogTitle>
                <DialogDescription>
                  Renewal Care Service Agreement &bull; Yêu cầu gia hạn #{renewalId}
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
              <span>Đang tải thông tin thỏa thuận gia hạn...</span>
            </div>
          ) : agreement ? (
            <div className="space-y-6">
              {/* Validity notice banner */}
              {agreement.validUntil && (
                <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Thời hạn chấp nhận & thanh toán:</strong> Thỏa thuận gia hạn này có hiệu lực đến{" "}
                    <span className="font-semibold">{formatDate(agreement.validUntil)}</span>. Sau thời gian này nếu chưa hoàn tất thanh toán, yêu cầu gia hạn sẽ tự động hết hạn và thời hạn phiên chăm sóc không thay đổi.
                  </div>
                </div>
              )}

              {/* Grid 2 cards: Same Doctor & Package */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Doctor Continuity Card */}
                <div className="p-4 border rounded-xl bg-card space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Stethoscope className="w-4 h-4 text-primary" />
                    Bác sĩ tiếp tục đồng hành
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
                    {supportSchedule && (
                      <div className="text-xs pt-1 bg-muted/30 p-2 rounded-md font-mono text-muted-foreground">
                        Khung giờ hỗ trợ: {supportSchedule} ({supportTimezone})
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Package Card */}
                <div className="p-4 border rounded-xl bg-card space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <FileText className="w-4 h-4 text-primary" />
                    Gói dịch vụ gia hạn
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium text-base text-foreground">{pkgName}</div>
                    {pkgCode && <div className="text-xs text-muted-foreground">Mã gói: {pkgCode}</div>}
                    <div className="pt-1 text-base font-bold text-primary">
                      {priceAmount > 0 ? priceAmount.toLocaleString("vi-VN", { style: "currency", currency }) : "Miễn phí"}{" "}
                      <span className="text-xs font-normal text-muted-foreground">/ +{durationDays} ngày đồng hành</span>
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
                  Điều khoản gia hạn & Phạm vi chăm sóc
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

                {includedList.length > 0 && (
                  <div>
                    <strong className="text-foreground">Dịch vụ bao gồm:</strong> {includedList.join(", ")}
                  </div>
                )}

                {excludedList.length > 0 && (
                  <div>
                    <strong className="text-foreground">Dịch vụ loại trừ:</strong> {excludedList.join(", ")}
                  </div>
                )}

                <div className="pt-2 border-t text-neutral-500 leading-relaxed">
                  * Lưu ý: Việc gia hạn sẽ nối dài thời hạn hiệu lực của phiên tư vấn hiện tại và giữ nguyên toàn bộ lịch sử tư vấn. Sau khi thanh toán thành công, thời hạn mới sẽ được cập nhật tự động.
                </div>
              </div>

              {/* Explicit Acceptance Checkbox */}
              <div className="flex items-start space-x-3 p-4 border-2 border-primary/20 bg-primary/5 rounded-xl">
                <Checkbox
                  id="accept-renewal-terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
                  disabled={submitting}
                  className="mt-0.5 data-[state=checked]:bg-primary"
                />
                <label
                  htmlFor="accept-renewal-terms"
                  className="text-sm font-medium leading-relaxed text-foreground cursor-pointer select-none"
                >
                  Tôi đã đọc, hiểu rõ và đồng ý với các điều khoản gia hạn, mức phí và cam kết tiếp tục đồng hành chăm sóc cùng bác sĩ phụ trách trong phiên tư vấn này.
                </label>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">Không có dữ liệu thỏa thuận gia hạn.</div>
          )}
        </ScrollArea>

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

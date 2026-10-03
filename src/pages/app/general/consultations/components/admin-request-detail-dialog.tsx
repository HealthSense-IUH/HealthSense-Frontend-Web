import { useEffect, useState } from "react"
import { AlertCircle, FileText, CheckCircle2, User, Stethoscope } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { currentIntlLocale } from "@/lib/i18n"

import { consultationApi } from "@/services"
import type { ConsultationRequestReviewResponse } from "@/types/consultation"
import { formatDate, statusBadge } from "./shared"

export function AdminRequestDetailDialog({
  requestId,
  open,
  onOpenChange,
  onNeedMoreInfo,
  onSelectDoctor,
  onReject,
}: {
  requestId: number | string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onNeedMoreInfo: (request: ConsultationRequestReviewResponse) => void
  onSelectDoctor: (request: ConsultationRequestReviewResponse) => void
  onReject: (requestId: number | string) => void
}) {
  const { t } = useTranslation("consultation")
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<ConsultationRequestReviewResponse | null>(null)

  useEffect(() => {
    if (open && requestId) {
      setLoading(true)
      consultationApi.getRequestDetail(requestId)
        .then(res => setDetail(res.data))
        .catch(() => {
          toast({ variant: "destructive", description: t("adminRequestDetailDialog.loadError") })
          onOpenChange(false)
        })
        .finally(() => setLoading(false))
    } else {
      setDetail(null)
    }
  }, [open, requestId, toast, onOpenChange, t])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("adminRequestDetailDialog.title", { id: requestId })}</DialogTitle>
          <DialogDescription>
            {t("adminRequestDetailDialog.description")}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">{t("adminRequestDetailDialog.loading")}</div>
        ) : detail ? (
          <div className="flex flex-col gap-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">{t("adminRequestDetailDialog.statusLabel")}</span>
                {statusBadge(detail.status)}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("adminRequestDetailDialog.createdAt", { date: formatDate(detail.createdAt) })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 p-4 border rounded-md bg-muted/20">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <FileText className="w-4 h-4" />
                  {t("adminRequestDetailDialog.package")}
                </div>
                <div className="text-sm">
                  <span className="font-medium">{detail.packageNameSnapshot || "N/A"}</span>
                  <div className="text-muted-foreground text-xs mt-1">
                    {detail.packagePriceSnapshot ? detail.packagePriceSnapshot.toLocaleString(currentIntlLocale(), { style: "currency", currency: "VND" }) : t("adminRequestDetailDialog.free")} &bull; {t("adminRequestDetailDialog.durationDays", { count: detail.packageDurationDaysSnapshot })}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 p-4 border rounded-md bg-muted/20">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <User className="w-4 h-4" />
                  {t("adminRequestDetailDialog.memberInfo")}
                </div>
                {detail.member ? (
                  <div className="text-sm">
                    <span className="font-medium">{detail.member.displayName || detail.member.email}</span>
                    <div className="text-muted-foreground text-xs mt-1">
                      {t("adminRequestDetailDialog.memberCode", { id: detail.memberId })} &bull; {detail.member.phone || t("adminRequestDetailDialog.noPhone")}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm">{t("adminRequestDetailDialog.memberCode", { id: detail.memberId })}</div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 p-4 border rounded-xl bg-card">
              <span className="text-sm font-semibold text-foreground">{t("adminRequestDetailDialog.intakeTitle")}</span>
              
              {detail.reasonForCare && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">{t("adminRequestDetailDialog.reasonForCare")}</span>
                  <div className="text-sm p-2.5 bg-muted/20 rounded-lg">{detail.reasonForCare}</div>
                </div>
              )}

              {detail.currentConcern && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">{t("adminRequestDetailDialog.currentConcern")}</span>
                  <div className="text-sm p-2.5 bg-muted/20 rounded-lg whitespace-pre-wrap">{detail.currentConcern}</div>
                </div>
              )}

              {detail.careGoal && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">{t("adminRequestDetailDialog.careGoal")}</span>
                  <div className="text-xs p-2 bg-muted/20 rounded-lg">{detail.careGoal}</div>
                </div>
              )}

              {detail.relevantSelfReportedContext && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">{t("adminRequestDetailDialog.selfReportedContext")}</span>
                  <div className="text-xs p-2 bg-muted/20 rounded-lg">{detail.relevantSelfReportedContext}</div>
                </div>
              )}

              {detail.memberNote && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">{t("adminRequestDetailDialog.memberNote")}</span>
                  <div className="text-xs p-2 bg-muted/20 rounded-lg">{detail.memberNote}</div>
                </div>
              )}

              {!detail.reasonForCare && !detail.currentConcern && (
                <div className="text-sm p-3 bg-muted/30 border rounded-md whitespace-pre-wrap">
                  {detail.reason || t("adminRequestDetailDialog.noReason")}
                </div>
              )}
            </div>

            {detail.healthRecord && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold">{t("adminRequestDetailDialog.attachedRecord")}</span>
                <div className="p-3 bg-muted/30 border rounded-md text-sm">
                  #{detail.healthRecord.id} - {detail.healthRecord.title || t("adminRequestDetailDialog.defaultRecordTitle")}
                  {detail.healthRecord.summary && <div className="mt-1 text-xs text-muted-foreground">{detail.healthRecord.summary}</div>}
                </div>
              </div>
            )}

            {(detail.assignedDoctor || detail.preferredDoctor) && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold">{detail.assignedDoctorId ? t("adminRequestDetailDialog.assignedDoctor") : t("adminRequestDetailDialog.preferredDoctor")}</span>
                <div className="flex items-center gap-2 p-3 bg-muted/30 border rounded-md text-sm">
                  <Stethoscope className="w-4 h-4 text-primary" />
                  <div>
                    <span className="font-medium">
                      {detail.assignedDoctor?.displayName || detail.preferredDoctor?.displayName || t("adminRequestDetailDialog.defaultDoctorName")}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      ID: #{detail.assignedDoctorId || detail.preferredDoctor?.id}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {detail.status === "WAITING_ACCEPTANCE" && (
              <div className="p-3.5 bg-warning-50 border border-warning-200 text-warning-900 rounded-xl text-sm">
                <div className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-warning-600" /> {t("adminRequestDetailDialog.waitingAcceptanceTitle")}
                </div>
                <div className="mt-1 text-xs">
                  {t("adminRequestDetailDialog.doctorReservedAt", { date: formatDate(detail.doctorReservedAt) })}<br />
                  {t("adminRequestDetailDialog.completionDeadline", { date: formatDate(detail.paymentDeadline) })}
                </div>
              </div>
            )}

            {detail.status === "WAITING_PAYMENT" && (
              <div className="p-3 bg-primary-50 border border-primary-200 text-primary-800 rounded-md text-sm">
                <div className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {t("adminRequestDetailDialog.waitingPaymentTitle")}
                </div>
                <div className="mt-1 text-xs">
                  {t("adminRequestDetailDialog.doctorReservedAt", { date: formatDate(detail.doctorReservedAt) })}<br />
                  {t("adminRequestDetailDialog.paymentDeadline", { date: formatDate(detail.paymentDeadline) })}
                </div>
              </div>
            )}

            {detail.status === "NEED_MORE_INFO" && detail.moreInfoReason && (
              <div className="p-3 bg-warning-50 border border-warning-200 text-warning-800 rounded-md text-sm">
                <div className="font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {t("adminRequestDetailDialog.needMoreInfoTitle")}
                </div>
                <div className="mt-1">{t("adminRequestDetailDialog.reason", { reason: detail.moreInfoReason })}</div>
              </div>
            )}

            {detail.memberAdditionalNote && (
              <div className="p-3 bg-success-50 border border-success-200 text-success-800 rounded-md text-sm">
                <div className="font-semibold">{t("adminRequestDetailDialog.memberAddedInfo")}</div>
                <div className="mt-1">{detail.memberAdditionalNote}</div>
              </div>
            )}

          </div>
        ) : null}

        {detail && (
          <DialogFooter className="gap-2 sm:justify-between border-t pt-4">
            <div>
              {detail.status === "PENDING_REVIEW" && (
                <Button variant="destructive" onClick={() => onReject(detail.id)}>
                  {t("adminRequestDetailDialog.actions.reject")}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>{t("adminRequestDetailDialog.actions.close")}</Button>
              {detail.status === "PENDING_REVIEW" && (
                <>
                  <Button variant="secondary" onClick={() => onNeedMoreInfo(detail)}>
                    {t("adminRequestDetailDialog.actions.requestMoreInfo")}
                  </Button>
                  <Button onClick={() => onSelectDoctor(detail)}>
                    {t("adminRequestDetailDialog.actions.selectDoctor")}
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

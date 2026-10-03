import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Shield, FileText, Stethoscope, Clock, AlertCircle, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { currentIntlLocale } from "@/lib/i18n"

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
  const { t } = useTranslation("consultation")
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
          const msg = err.response?.data?.message || t("careAgreementDialog.toast.loadErrorDescription")
          toast({
            variant: "destructive",
            title: t("careAgreementDialog.toast.loadErrorTitle"),
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
  }, [open, requestId, toast, onOpenChange, t])

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
        title: t("careAgreementDialog.toast.acceptSuccessTitle"),
        description: t("careAgreementDialog.toast.acceptSuccessDescription"),
      })
      onOpenChange(false)
      onAgreementAccepted()
    } catch (err: any) {
      const msg = err.response?.data?.message || t("careAgreementDialog.toast.acceptErrorDescription")
      toast({
        variant: "destructive",
        title: t("careAgreementDialog.toast.acceptErrorTitle"),
        description: msg,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const pkgName = agreement?.packageName || agreement?.packageSnapshot?.name || t("careAgreementDialog.packageFallback")
  const pkgCode = agreement?.packageCode || agreement?.packageSnapshot?.code || ""
  const priceAmount = agreement?.priceAmount ?? agreement?.packageSnapshot?.priceAmount ?? 0
  const currency = agreement?.currency || agreement?.packageSnapshot?.currency || "VND"
  const durationDays = agreement?.durationDays ?? agreement?.packageSnapshot?.durationDays ?? 30
  const description = agreement?.serviceDescription || agreement?.packageSnapshot?.description || ""
  const termsPolicy = agreement?.termsPolicyReference || agreement?.packageSnapshot?.termsPolicyReference || agreement?.limitations || agreement?.packageSnapshot?.limitations || ""
  const supportPolicy = agreement?.supportPolicy || agreement?.packageSnapshot?.supportPolicy || "ASSIGNED_DOCTOR_SUPPORT_SCHEDULE"
  const supportSchedule = agreement?.supportScheduleSnapshotJson || agreement?.doctorSnapshot?.declaredSupportSchedule
  const supportTimezone = agreement?.supportTimezoneSnapshot || agreement?.doctorSnapshot?.timezone || "Asia/Ho_Chi_Minh"
  const doctorName = agreement?.doctorSnapshot?.displayName || t("careAgreementDialog.doctorFallback")
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
                <DialogTitle className="text-xl font-bold">{t("careAgreementDialog.title")}</DialogTitle>
                <DialogDescription>
                  Care Service Agreement &bull; {t("careAgreementDialog.requestNumber", { id: requestId })}
                </DialogDescription>
              </div>
            </div>
            {agreement?.status && (
              <Badge variant="outline" className="bg-warning-50 text-warning-800 border-warning-300 font-medium">
                {agreement.status === "PENDING_ACCEPTANCE" ? t("careAgreementDialog.awaitingYourConfirmation") : agreement.status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh] p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <span>{t("careAgreementDialog.loading")}</span>
            </div>
          ) : agreement ? (
            <div className="space-y-6">
              {/* Validity notice banner */}
              {agreement.validUntil && (
                <div className="flex items-start gap-2.5 p-3.5 bg-warning-50 border border-warning-200 rounded-xl text-xs text-warning-900">
                  <Clock className="w-4 h-4 text-warning-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>{t("careAgreementDialog.validity.label")}</strong> {t("careAgreementDialog.validity.validUntil")}{" "}
                    <span className="font-semibold">{formatDate(agreement.validUntil)}</span>{t("careAgreementDialog.validity.afterDeadline")}
                  </div>
                </div>
              )}

              {/* Grid 2 cards: Doctor & Package */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Doctor Assignment Card */}
                <div className="p-4 border rounded-xl bg-card space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Stethoscope className="w-4 h-4 text-primary" />
                    {t("careAgreementDialog.doctorCard.title")}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium text-base text-foreground">{doctorName}</div>
                    {doctorEmail && <div className="text-xs text-muted-foreground">{doctorEmail}</div>}
                    {doctorSpecialty && (
                      <div className="text-xs pt-1">
                        <span className="text-muted-foreground">{t("careAgreementDialog.doctorCard.specialty")}</span>{" "}
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
                              <span>{t("careAgreementDialog.doctorCard.supportHours")}</span>
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
                                  {t("careAgreementDialog.doctorCard.timezone", { timezone: supportTimezone })}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      }
                      if (supportSchedule) {
                        return (
                          <div className="text-xs pt-1 bg-muted/30 p-2 rounded-md text-muted-foreground font-mono">
                            {t("careAgreementDialog.doctorCard.supportHours")} {supportSchedule} {supportTimezone ? `(${supportTimezone})` : ""}
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
                    {t("careAgreementDialog.packageCard.title")}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium text-base text-foreground">{pkgName}</div>
                    {pkgCode && <div className="text-xs text-muted-foreground">{t("careAgreementDialog.packageCard.code", { code: pkgCode })}</div>}
                    <div className="pt-1 text-base font-bold text-primary">
                      {priceAmount > 0 ? priceAmount.toLocaleString(currentIntlLocale(), { style: "currency", currency }) : t("careAgreementDialog.packageCard.free")}{" "}
                      <span className="text-xs font-normal text-muted-foreground">{t("careAgreementDialog.packageCard.duration", { count: durationDays })}</span>
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
                  {t("careAgreementDialog.terms.title")}
                </div>
                
                {termsPolicy && (
                  <div>
                    <strong className="text-foreground">{t("careAgreementDialog.terms.termsReference")}</strong> {termsPolicy}
                  </div>
                )}

                {agreement?.emergencyLimitation && (
                  <div>
                    <strong className="text-foreground">{t("careAgreementDialog.terms.emergencyLimitation")}</strong> {agreement.emergencyLimitation}
                  </div>
                )}

                {supportPolicy && (
                  <div>
                    <strong className="text-foreground">{t("careAgreementDialog.terms.supportPolicy")}</strong> {supportPolicy === "ASSIGNED_DOCTOR_SUPPORT_SCHEDULE" ? t("careAgreementDialog.terms.assignedDoctorSchedule") : supportPolicy}
                  </div>
                )}

                <div className="pt-2 border-t text-slate-500 leading-relaxed">
                  {t("careAgreementDialog.terms.note")}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">{t("careAgreementDialog.empty")}</div>
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
                {t("careAgreementDialog.acceptTerms")}
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
            {t("careAgreementDialog.close")}
          </Button>
          <Button
            type="button"
            onClick={handleAccept}
            disabled={!acceptedTerms || submitting || loading || !agreement}
            className="gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            {submitting ? t("careAgreementDialog.confirming") : t("careAgreementDialog.confirmAndPay")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

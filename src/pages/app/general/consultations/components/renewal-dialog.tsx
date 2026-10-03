import { useEffect, useState } from "react"
import { useTranslation, Trans } from "react-i18next"
import { RefreshCw, Clock, AlertTriangle, ShieldCheck, CheckCircle2, XCircle, CreditCard, FileText, ArrowRight, History } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import i18n, { currentIntlLocale } from "@/lib/i18n"

import { consultationApi } from "@/services"
import type {
  ConsultationSessionItem,
  ConsultationRenewalResponse,
  SessionExtensionResponse,
  ConsultationRenewalStatus,
} from "@/types/consultation"
import { formatDate, statusLabel } from "./shared"
import { RenewalAgreementDialog } from "./renewal-agreement-dialog"

interface RenewalDialogProps {
  session: ConsultationSessionItem
  open: boolean
  onOpenChange: (open: boolean) => void
  onSessionRefreshed?: () => void
}

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err.response?.data?.message || err.message || fallback
}

export function getRenewalStatusBadge(status: ConsultationRenewalStatus) {
  switch (status) {
    case "REQUESTED":
      return <Badge variant="outline" className="bg-warning-50 text-warning-700 border-warning-200">{i18n.t("consultation:renewalDialog.renewalStatus.requested")}</Badge>
    case "UNDER_REVIEW":
      return <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">{i18n.t("consultation:renewalDialog.renewalStatus.underReview")}</Badge>
    case "PENDING_ACCEPTANCE":
      return <Badge className="bg-primary-600 hover:bg-primary-700 text-white">{i18n.t("consultation:renewalDialog.renewalStatus.pendingAcceptance")}</Badge>
    case "WAITING_PAYMENT":
      return <Badge className="bg-warning-500 hover:bg-warning-600 text-white">{i18n.t("consultation:renewalDialog.renewalStatus.waitingPayment")}</Badge>
    case "PAID":
      return <Badge className="bg-success-600 hover:bg-success-700 text-white">{i18n.t("consultation:renewalDialog.renewalStatus.paid")}</Badge>
    case "REJECTED":
      return <Badge variant="destructive">{i18n.t("consultation:renewalDialog.renewalStatus.rejected")}</Badge>
    case "CANCELLED":
      return <Badge variant="secondary">{i18n.t("consultation:renewalDialog.renewalStatus.cancelled")}</Badge>
    case "EXPIRED":
      return <Badge variant="secondary">{i18n.t("consultation:renewalDialog.renewalStatus.expired")}</Badge>
    case "REQUIRES_REVIEW":
      return <Badge className="bg-warning-500 text-black hover:bg-warning-600">{i18n.t("consultation:renewalDialog.renewalStatus.requiresReview")}</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function RenewalDialog({
  session,
  open,
  onOpenChange,
  onSessionRefreshed,
}: RenewalDialogProps) {
  const { t } = useTranslation("consultation")
  const { toast } = useToast()
  const [renewals, setRenewals] = useState<ConsultationRenewalResponse[]>([])
  const [extensions, setExtensions] = useState<SessionExtensionResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | number | null>(null)
  const [payingId, setPayingId] = useState<string | number | null>(null)

  // Agreement dialog state
  const [agreementRenewalId, setAgreementRenewalId] = useState<string | number | null>(null)

  const isSessionActive = session.status === "ACTIVE"

  const fetchData = () => {
    if (!open) return
    setLoading(true)
    Promise.allSettled([
      consultationApi.listSessionRenewals(session.id),
      consultationApi.getSessionExtensions(session.id),
    ])
      .then(([renRes, extRes]) => {
        if (renRes.status === "fulfilled") {
          setRenewals(renRes.value.data || [])
        }
        if (extRes.status === "fulfilled") {
          setExtensions(extRes.value.data || [])
        }
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: t("renewalDialog.toast.loadErrorTitle"),
          description: readError(err, t("renewalDialog.toast.loadErrorDescription")),
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open, session.id])

  // Check if there is an active unresolved renewal
  const unresolvedRenewal = renewals.find((r) =>
    ["REQUESTED", "UNDER_REVIEW", "PENDING_ACCEPTANCE", "WAITING_PAYMENT", "REQUIRES_REVIEW"].includes(r.status)
  )

  const handleRequestRenewal = async () => {
    if (!isSessionActive) {
      toast({
        variant: "destructive",
        title: t("renewalDialog.toast.invalidSessionTitle"),
        description: t("renewalDialog.toast.invalidSessionDescription"),
      })
      return
    }

    setRequesting(true)
    try {
      await consultationApi.requestRenewal(session.id)
      toast({
        title: t("renewalDialog.toast.requestSuccessTitle"),
        description: t("renewalDialog.toast.requestSuccessDescription"),
      })
      fetchData()
      onSessionRefreshed?.()
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("renewalDialog.toast.requestErrorTitle"),
        description: readError(err, t("renewalDialog.toast.requestErrorDescription")),
      })
    } finally {
      setRequesting(false)
    }
  }

  const handleCancelRenewal = async (renewalId: string | number) => {
    setCancellingId(renewalId)
    try {
      await consultationApi.cancelRenewal(renewalId)
      toast({
        title: t("renewalDialog.toast.cancelSuccessTitle"),
        description: t("renewalDialog.toast.cancelSuccessDescription"),
      })
      fetchData()
      onSessionRefreshed?.()
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("renewalDialog.toast.cancelErrorTitle"),
        description: readError(err, t("renewalDialog.toast.cancelErrorDescription")),
      })
    } finally {
      setCancellingId(null)
    }
  }

  const handlePayRenewal = async (renewalId: string | number) => {
    setPayingId(renewalId)
    try {
      const res = await consultationApi.createRenewalPayment(renewalId)
      const paymentData = res.data
      if (paymentData.checkoutUrl) {
        localStorage.setItem("healthsense.pendingPaymentType", "renewal")
        localStorage.setItem("healthsense.pendingPaymentRenewalId", String(renewalId))
        localStorage.setItem("healthsense.pendingPaymentSessionId", String(session.id))
        window.location.href = paymentData.checkoutUrl
      } else {
        toast({
          variant: "destructive",
          title: t("renewalDialog.toast.paymentErrorTitle"),
          description: t("renewalDialog.toast.paymentLinkErrorDescription"),
        })
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("renewalDialog.toast.paymentInitErrorTitle"),
        description: readError(err, t("renewalDialog.toast.paymentInitErrorDescription")),
      })
    } finally {
      setPayingId(null)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[88vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-3 border-b bg-muted/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">{t("renewalDialog.title")}</DialogTitle>
                  <DialogDescription>
                    {t("renewalDialog.sessionNumber", { id: session.id })} &bull; {session.doctorDisplayName || t("renewalDialog.doctorFallback", { id: session.doctorId })}
                  </DialogDescription>
                </div>
              </div>
              <Badge variant={isSessionActive ? "default" : "outline"} className={isSessionActive ? "bg-success-600" : ""}>
                {statusLabel(session.status)}
              </Badge>
            </div>
          </DialogHeader>

          <Tabs defaultValue="manage" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-3 border-b bg-muted/5">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manage">{t("renewalDialog.tabs.manage")}</TabsTrigger>
                <TabsTrigger value="history">{t("renewalDialog.tabs.history", { total: extensions.length })}</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="manage" className="flex-1 overflow-y-auto p-6 space-y-5 m-0 outline-none">
              {/* Session Overview Card */}
              <div className="p-4 rounded-xl border bg-card text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{t("renewalDialog.currentTermLabel")}</span>
                  <span className="text-muted-foreground font-mono">{t("renewalDialog.startedAt", { date: formatDate(session.startedAt) })}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 text-foreground">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    {t("renewalDialog.currentEndsAtLabel")} <strong className="text-primary">{formatDate(session.endsAt) || t("renewalDialog.unknown")}</strong>
                  </span>
                </div>
              </div>

              {/* Unresolved Renewal Banner / Action */}
              {unresolvedRenewal ? (
                <div className="p-4 rounded-xl border border-warning-200 bg-warning-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-warning-600" />
                      <span className="font-semibold text-warning-950 text-sm">
                        {t("renewalDialog.pendingRequestTitle", { id: unresolvedRenewal.id })}
                      </span>
                    </div>
                    {getRenewalStatusBadge(unresolvedRenewal.status)}
                  </div>

                  <div className="text-xs text-warning-900/90 space-y-1.5 pl-7">
                    {(unresolvedRenewal.proposedNewEndsAt || unresolvedRenewal.proposedEndsAt) && (
                      <p>
                        {t("renewalDialog.proposedEndsAtLabel")} <strong>{formatDate(unresolvedRenewal.proposedNewEndsAt || unresolvedRenewal.proposedEndsAt)}</strong>
                      </p>
                    )}
                    {(unresolvedRenewal.packageNameSnapshot || unresolvedRenewal.durationDays) && (
                      <p>
                        {t("renewalDialog.renewalPackageLabel")} <strong>{unresolvedRenewal.packageNameSnapshot || t("renewalDialog.packageFallback", { count: unresolvedRenewal.durationDays })}</strong>
                        {(unresolvedRenewal.packagePriceSnapshot || unresolvedRenewal.priceAmount) ? ` (${(unresolvedRenewal.packagePriceSnapshot || unresolvedRenewal.priceAmount)?.toLocaleString(currentIntlLocale())} ${unresolvedRenewal.currency || "VND"})` : ""}
                      </p>
                    )}
                    {unresolvedRenewal.paymentDeadline && (
                      <p className="text-danger-600">
                        {t("renewalDialog.paymentDeadlineLabel")} <strong>{formatDate(unresolvedRenewal.paymentDeadline)}</strong>
                      </p>
                    )}
                    {unresolvedRenewal.rejectionReason && (
                      <p className="text-danger-700">
                        {t("renewalDialog.rejectionReasonLabel")} <em>{unresolvedRenewal.rejectionReason}</em>
                      </p>
                    )}
                  </div>

                  {/* Actions for current status */}
                  <div className="flex flex-wrap gap-2 pt-2 pl-7">
                    {unresolvedRenewal.status === "PENDING_ACCEPTANCE" && (
                      <Button
                        size="sm"
                        onClick={() => setAgreementRenewalId(unresolvedRenewal.id)}
                        className="gap-1.5"
                      >
                        <FileText className="w-4 h-4" />
                        {t("renewalDialog.actions.viewAgreement")}
                      </Button>
                    )}

                    {unresolvedRenewal.status === "WAITING_PAYMENT" && (
                      <Button
                        size="sm"
                        onClick={() => handlePayRenewal(unresolvedRenewal.id)}
                        disabled={payingId === unresolvedRenewal.id}
                        className="bg-success-600 hover:bg-success-700 text-white gap-1.5"
                      >
                        <CreditCard className="w-4 h-4" />
                        {payingId === unresolvedRenewal.id ? t("renewalDialog.actions.openingPayment") : t("renewalDialog.actions.pay")}
                      </Button>
                    )}

                    {["REQUESTED", "UNDER_REVIEW", "PENDING_ACCEPTANCE", "WAITING_PAYMENT"].includes(unresolvedRenewal.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelRenewal(unresolvedRenewal.id)}
                        disabled={cancellingId === unresolvedRenewal.id}
                        className="text-danger-600 hover:bg-danger-50 border-danger-200"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        {cancellingId === unresolvedRenewal.id ? t("renewalDialog.actions.cancelling") : t("renewalDialog.actions.cancelRequest")}
                      </Button>
                    )}
                  </div>
                </div>
              ) : isSessionActive ? (
                <div className="p-4 rounded-xl border border-dashed bg-muted/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-sm">{t("renewalDialog.requestCard.title")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <Trans
                      t={t}
                      i18nKey="renewalDialog.requestCard.description"
                      values={{ doctor: session.doctorDisplayName || t("renewalDialog.doctorFallback", { id: session.doctorId }) }}
                      components={{ strong: <strong /> }}
                    />
                  </p>
                  <Button
                    onClick={handleRequestRenewal}
                    disabled={requesting || loading}
                    className="gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${requesting ? "animate-spin" : ""}`} />
                    {requesting ? t("renewalDialog.requestCard.submitting") : t("renewalDialog.requestCard.submit")}
                  </Button>
                </div>
              ) : (
                <div className="p-4 rounded-xl border bg-muted/20 text-xs text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-warning-500" />
                  <span>{t("renewalDialog.sessionInactive")}</span>
                </div>
              )}

              {/* Past Renewals List */}
              <div className="space-y-3 pt-3 border-t">
                <h4 className="text-xs font-semibold text-foreground">{t("renewalDialog.pastRequestsTitle")}</h4>
                {loading ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">{t("renewalDialog.loadingHistory")}</div>
                ) : renewals.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">{t("renewalDialog.noRequests")}</p>
                ) : (
                  <div className="space-y-2">
                    {renewals.map((r) => (
                      <div key={r.id} className="p-3 rounded-lg border bg-card text-xs flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{t("renewalDialog.requestNumber", { id: r.id })}</span>
                            <span className="text-muted-foreground font-mono">({formatDate(r.requestedAt || r.createdAt)})</span>
                          </div>
                          {(r.proposedNewEndsAt || r.proposedEndsAt) && (
                            <p className="text-muted-foreground">
                              {t("renewalDialog.proposedDeadlineLabel")} <strong>{formatDate(r.proposedNewEndsAt || r.proposedEndsAt)}</strong>
                            </p>
                          )}
                        </div>
                        <div>{getRenewalStatusBadge(r.status)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="flex-1 overflow-y-auto p-6 space-y-4 m-0 outline-none">
              <div className="text-xs text-muted-foreground">
                {t("renewalDialog.historyIntro")}
              </div>

              {extensions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground border border-dashed rounded-xl p-4">
                  <History className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="font-medium text-xs">{t("renewalDialog.noExtensions")}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{t("renewalDialog.noExtensionsHint")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {extensions.map((ext, idx) => (
                    <div key={ext.id ?? `ext-${ext.appliedAt}-${idx}`} className="p-3.5 rounded-xl border bg-card text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{t("renewalDialog.extensionNumber", { number: idx + 1 })}</span>
                        <Badge variant="outline" className="text-[10px] bg-success-50 text-success-700 border-success-200">
                          {t("renewalDialog.appliedAt", { date: formatDate(ext.appliedAt) })}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>{formatDate(ext.previousEndsAt)}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-primary" />
                        <span className="font-bold text-foreground">{formatDate(ext.newEndsAt)}</span>
                      </div>
                      {ext.packageNameSnapshot && (
                        <p className="text-muted-foreground text-[11px]">
                          {t("renewalDialog.packageLabel")} <strong>{ext.packageNameSnapshot}</strong>
                          {ext.packagePriceSnapshot ? ` &bull; ${ext.packagePriceSnapshot.toLocaleString(currentIntlLocale())} VND` : ""}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="p-4 border-t bg-muted/10">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("renewalDialog.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Renewal Agreement Modal */}
      {agreementRenewalId && (
        <RenewalAgreementDialog
          renewalId={agreementRenewalId}
          open={!!agreementRenewalId}
          onOpenChange={(open) => {
            if (!open) setAgreementRenewalId(null)
          }}
          onAgreementAccepted={() => {
            fetchData()
            onSessionRefreshed?.()
          }}
        />
      )}
    </>
  )
}

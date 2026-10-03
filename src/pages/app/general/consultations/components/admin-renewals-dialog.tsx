import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { RefreshCw, CheckCircle2, XCircle, Clock, ShieldCheck, History, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { currentIntlLocale } from "@/lib/i18n"

import { consultationApi } from "@/services"
import type {
  ConsultationSessionItem,
  ConsultationRenewalResponse,
  SessionExtensionResponse,
} from "@/types/consultation"
import { formatDate } from "./shared"
import { getRenewalStatusBadge } from "./renewal-dialog"

interface AdminRenewalsDialogProps {
  session: ConsultationSessionItem
  open: boolean
  onOpenChange: (open: boolean) => void
  onSessionRefreshed?: () => void
}

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err.response?.data?.message || err.message || fallback
}

export function AdminRenewalsDialog({
  session,
  open,
  onOpenChange,
  onSessionRefreshed,
}: AdminRenewalsDialogProps) {
  const { t } = useTranslation("consultation")
  const { toast } = useToast()
  const [renewals, setRenewals] = useState<ConsultationRenewalResponse[]>([])
  const [extensions, setExtensions] = useState<SessionExtensionResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [actionInProgressId, setActionInProgressId] = useState<string | number | null>(null)

  // Rejection modal state
  const [rejectingRenewalId, setRejectingRenewalId] = useState<string | number | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

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
          title: t("adminRenewalsDialog.toast.loadErrorTitle"),
          description: readError(err, t("adminRenewalsDialog.toast.loadErrorDescription")),
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

  const handleBeginReview = async (renewalId: string | number) => {
    setActionInProgressId(renewalId)
    try {
      await consultationApi.beginRenewalReview(renewalId)
      toast({
        title: t("adminRenewalsDialog.toast.beginReviewSuccessTitle"),
        description: t("adminRenewalsDialog.toast.beginReviewSuccessDescription"),
      })
      fetchData()
      onSessionRefreshed?.()
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("adminRenewalsDialog.toast.beginReviewErrorTitle"),
        description: readError(err, t("adminRenewalsDialog.toast.beginReviewErrorDescription")),
      })
    } finally {
      setActionInProgressId(null)
    }
  }

  const handleApprove = async (renewalId: string | number) => {
    setActionInProgressId(renewalId)
    try {
      await consultationApi.decideRenewal(renewalId, {
        approved: true,
      })
      toast({
        title: t("adminRenewalsDialog.toast.approveSuccessTitle"),
        description: t("adminRenewalsDialog.toast.approveSuccessDescription"),
      })
      fetchData()
      onSessionRefreshed?.()
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("adminRenewalsDialog.toast.approveErrorTitle"),
        description: readError(err, t("adminRenewalsDialog.toast.approveErrorDescription")),
      })
    } finally {
      setActionInProgressId(null)
    }
  }

  const handleRejectSubmit = async () => {
    if (!rejectingRenewalId) return
    if (!rejectionReason.trim()) {
      toast({
        variant: "destructive",
        title: t("adminRenewalsDialog.toast.missingReasonTitle"),
        description: t("adminRenewalsDialog.toast.missingReasonDescription"),
      })
      return
    }

    setActionInProgressId(rejectingRenewalId)
    try {
      await consultationApi.decideRenewal(rejectingRenewalId, {
        approved: false,
        rejectionReason: rejectionReason.trim(),
      })
      toast({
        title: t("adminRenewalsDialog.toast.rejectSuccessTitle"),
        description: t("adminRenewalsDialog.toast.rejectSuccessDescription"),
      })
      setRejectingRenewalId(null)
      setRejectionReason("")
      fetchData()
      onSessionRefreshed?.()
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("adminRenewalsDialog.toast.rejectErrorTitle"),
        description: readError(err, t("adminRenewalsDialog.toast.rejectErrorDescription")),
      })
    } finally {
      setActionInProgressId(null)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[88vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-3 border-b bg-muted/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">{t("adminRenewalsDialog.title")}</DialogTitle>
                  <DialogDescription>
                    {t("adminRenewalsDialog.sessionNumber", { id: session.id })} &bull; {session.memberDisplayName || t("adminRenewalsDialog.memberFallback", { id: session.memberId })} &bull; {session.doctorDisplayName || t("adminRenewalsDialog.doctorFallback", { id: session.doctorId })}
                  </DialogDescription>
                </div>
              </div>
              <Badge variant="outline">{session.status}</Badge>
            </div>
          </DialogHeader>

          <Tabs defaultValue="renewals" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-3 border-b bg-muted/5">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="renewals">{t("adminRenewalsDialog.tabs.renewals", { total: renewals.length })}</TabsTrigger>
                <TabsTrigger value="extensions">{t("adminRenewalsDialog.tabs.extensions", { total: extensions.length })}</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="renewals" className="flex-1 overflow-y-auto p-6 space-y-4 m-0 outline-none">
              <div className="p-3.5 rounded-xl border bg-muted/10 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>
                    {t("adminRenewalsDialog.currentEndsAtLabel")} <strong>{formatDate(session.endsAt) || "-"}</strong>
                  </span>
                </div>
                <span className="text-muted-foreground font-mono">{t("adminRenewalsDialog.startedAt", { date: formatDate(session.startedAt) })}</span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-muted-foreground">{t("adminRenewalsDialog.loading")}</div>
              ) : renewals.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground border border-dashed rounded-xl p-4">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="font-medium text-xs">{t("adminRenewalsDialog.noRequests")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {renewals.map((r) => {
                    const isActing = actionInProgressId === r.id
                    return (
                      <div key={r.id} className="p-4 rounded-xl border bg-card text-xs space-y-3 shadow-xs">
                        <div className="flex items-center justify-between border-b pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{t("adminRenewalsDialog.requestNumber", { id: r.id })}</span>
                            <span className="text-muted-foreground font-mono">
                              ({formatDate(r.requestedAt || r.createdAt)})
                            </span>
                          </div>
                          <div>{getRenewalStatusBadge(r.status)}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-muted-foreground">
                          {(r.proposedNewEndsAt || r.proposedEndsAt) && (
                            <div>
                              {t("adminRenewalsDialog.proposedEndsAtLabel")} <strong className="text-foreground">{formatDate(r.proposedNewEndsAt || r.proposedEndsAt)}</strong>
                            </div>
                          )}
                          {(r.packageNameSnapshot || r.durationDays) && (
                            <div>
                              {t("adminRenewalsDialog.renewalPackageLabel")} <strong className="text-foreground">{r.packageNameSnapshot || t("adminRenewalsDialog.packageFallback", { count: r.durationDays })}</strong>
                              {(r.packagePriceSnapshot || r.priceAmount) ? ` (${(r.packagePriceSnapshot || r.priceAmount)?.toLocaleString(currentIntlLocale())} ${r.currency || "VND"})` : ""}
                            </div>
                          )}
                          {r.paymentDeadline && (
                            <div className="text-warning-700">
                              {t("adminRenewalsDialog.paymentDeadlineLabel")} <strong>{formatDate(r.paymentDeadline)}</strong>
                            </div>
                          )}
                          {r.appliedAt && (
                            <div className="text-success-600">
                              {t("adminRenewalsDialog.appliedAtLabel")} <strong>{formatDate(r.appliedAt)}</strong>
                            </div>
                          )}
                        </div>

                        {r.rejectionReason && (
                          <div className="p-2.5 rounded-md bg-danger-50 text-danger-700 border border-danger-200">
                            <strong>{t("adminRenewalsDialog.rejectionReasonLabel")}</strong> {r.rejectionReason}
                          </div>
                        )}

                        {/* Coordinator Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-1 border-t">
                          {r.status === "REQUESTED" && (
                            <Button
                              size="sm"
                              onClick={() => handleBeginReview(r.id)}
                              disabled={isActing}
                              className="gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              {isActing ? t("adminRenewalsDialog.processing") : t("adminRenewalsDialog.actions.beginReview")}
                            </Button>
                          )}

                          {r.status === "UNDER_REVIEW" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(r.id)}
                                disabled={isActing}
                                className="bg-success-600 hover:bg-success-700 text-white gap-1.5"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                {isActing ? t("adminRenewalsDialog.processing") : t("adminRenewalsDialog.actions.approve")}
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setRejectingRenewalId(r.id)
                                  setRejectionReason("")
                                }}
                                disabled={isActing}
                                className="text-danger-600 hover:bg-danger-50 border-danger-200"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                {t("adminRenewalsDialog.actions.reject")}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="extensions" className="flex-1 overflow-y-auto p-6 space-y-4 m-0 outline-none">
              <div className="text-xs text-muted-foreground">
                {t("adminRenewalsDialog.extensionsIntro")}
              </div>

              {extensions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground border border-dashed rounded-xl p-4">
                  <History className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="font-medium text-xs">{t("adminRenewalsDialog.noExtensions")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {extensions.map((ext, idx) => (
                    <div key={ext.id ?? `ext-${ext.appliedAt}-${idx}`} className="p-3.5 rounded-xl border bg-card text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{t("adminRenewalsDialog.extensionNumber", { number: idx + 1 })}</span>
                        <Badge variant="outline" className="text-[10px] bg-success-50 text-success-700 border-success-200">
                          {t("adminRenewalsDialog.appliedAt", { date: formatDate(ext.appliedAt) })}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>{formatDate(ext.previousEndsAt)}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-primary" />
                        <span className="font-bold text-foreground">{formatDate(ext.newEndsAt)}</span>
                      </div>
                      {ext.packageNameSnapshot && (
                        <p className="text-muted-foreground text-[11px]">
                          {t("adminRenewalsDialog.packageLabel")} <strong>{ext.packageNameSnapshot}</strong>
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
              {t("adminRenewalsDialog.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Modal */}
      {rejectingRenewalId && (
        <Dialog open={!!rejectingRenewalId} onOpenChange={(open) => !open && setRejectingRenewalId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-danger-600 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                {t("adminRenewalsDialog.rejectDialog.title", { id: rejectingRenewalId })}
              </DialogTitle>
              <DialogDescription>
                {t("adminRenewalsDialog.rejectDialog.description")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <label className="text-xs font-semibold text-foreground">{t("adminRenewalsDialog.rejectDialog.reasonLabel")}</label>
              <Textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t("adminRenewalsDialog.rejectDialog.reasonPlaceholder")}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectingRenewalId(null)}>
                {t("adminRenewalsDialog.rejectDialog.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectSubmit}
                disabled={actionInProgressId === rejectingRenewalId || !rejectionReason.trim()}
              >
                {actionInProgressId === rejectingRenewalId ? t("adminRenewalsDialog.processing") : t("adminRenewalsDialog.rejectDialog.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

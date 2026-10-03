import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  FileSearch,
  RefreshCw,
} from "lucide-react"

import { useAuthStore } from "@/stores/auth-store"
import { currentIntlLocale } from "@/lib/i18n"
import { refundApi, businessAuditApi } from "@/services"
import type { ConsultationRefundResponse } from "@/types/refund"
import type { BusinessAuditEventResponse } from "@/types/business-audit"
import { DecideRefundDialog } from "./decide-refund-dialog"
import { ReconcileRefundDialog } from "./reconcile-refund-dialog"

interface RefundDetailDialogProps {
  refundId: number | string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RefundDetailDialog({
  refundId,
  open,
  onOpenChange,
  onSuccess,
}: RefundDetailDialogProps) {
  const { t } = useTranslation("management")
  const { toast } = useToast()
  const userSession = useAuthStore((state) => state.userSession)
  const role = userSession?.role || "MEMBER"
  const isAdminOrSuperAdmin = role === "ADMIN" || role === "SUPER_ADMIN"

  const [loading, setLoading] = useState(false)
  const [refund, setRefund] = useState<ConsultationRefundResponse | null>(null)
  const [auditEvents, setAuditEvents] = useState<BusinessAuditEventResponse[]>([])
  const [loadingAudit, setLoadingAudit] = useState(false)

  // Dialog triggers
  const [decideOpen, setDecideOpen] = useState(false)
  const [reconcileOpen, setReconcileOpen] = useState(false)
  const [executing, setExecuting] = useState(false)

  const fetchDetail = async (id: number | string) => {
    try {
      setLoading(true)
      const res = await refundApi.getRefundDetail(id)
      setRefund(res.data || null)
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } }
      toast({
        variant: "destructive",
        title: t("needsActions.refundDetail.toast.errorTitle"),
        description: anyErr.response?.data?.message || t("needsActions.refundDetail.toast.loadFailed"),
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAuditEvents = async (id: number | string) => {
    try {
      setLoadingAudit(true)
      const res = await businessAuditApi.queryAuditEvents({
        domainType: "REFUND",
        domainId: id,
        size: 20,
      })
      setAuditEvents(res.data?.content || [])
    } catch {
      setAuditEvents([])
    } finally {
      setLoadingAudit(false)
    }
  }

  useEffect(() => {
    if (open && refundId) {
      void fetchDetail(refundId)
      void fetchAuditEvents(refundId)
    } else {
      setRefund(null)
      setAuditEvents([])
    }
  }, [open, refundId])

  const handleExecute = async () => {
    if (!refund) return
    try {
      setExecuting(true)
      await refundApi.executeRefund(refund.id)
      toast({
        title: t("needsActions.refundDetail.toast.executedTitle"),
        description: t("needsActions.refundDetail.toast.executedDescription"),
      })
      void fetchDetail(refund.id)
      void fetchAuditEvents(refund.id)
      onSuccess?.()
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } }
      toast({
        variant: "destructive",
        title: t("needsActions.refundDetail.toast.executeErrorTitle"),
        description: anyErr.response?.data?.message || t("needsActions.refundDetail.toast.executeFailed"),
      })
    } finally {
      setExecuting(false)
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "SUCCEEDED":
        return <Badge className="bg-success-500 hover:bg-success-600 font-bold">{t("needsActions.refundDetail.status.succeeded")}</Badge>
      case "APPROVED":
        return <Badge className="bg-primary-500 hover:bg-primary-600 font-bold">{t("needsActions.refundDetail.status.approved")}</Badge>
      case "RECOMMENDED":
        return <Badge className="bg-warning-500 hover:bg-warning-600 font-bold">{t("needsActions.refundDetail.status.recommended")}</Badge>
      case "REVIEW_REQUIRED":
        return <Badge className="bg-primary-500 hover:bg-primary-600 font-bold">{t("needsActions.refundDetail.status.reviewRequired")}</Badge>
      case "REJECTED":
        return <Badge className="bg-danger-500 hover:bg-danger-600 font-bold">{t("needsActions.refundDetail.status.rejected")}</Badge>
      case "FAILED":
        return <Badge className="bg-danger-600 hover:bg-danger-700 font-bold">{t("needsActions.refundDetail.status.failed")}</Badge>
      case "PROCESSING":
        return <Badge className="bg-primary-500 hover:bg-primary-600 font-bold">{t("needsActions.refundDetail.status.processing")}</Badge>
      default:
        return <Badge variant="outline">{status || "UNKNOWN"}</Badge>
    }
  }

  if (!open) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-black text-slate-900">
                  {t("needsActions.refundDetail.title", { id: refundId })}
                </DialogTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("needsActions.refundDetail.subtitle")}
                </p>
              </div>
              {refund && getStatusBadge(refund.status)}
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6 space-y-5 text-xs">
            {loading ? (
              <div className="flex items-center justify-center p-12 text-slate-400 space-x-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>{t("needsActions.refundDetail.loading")}</span>
              </div>
            ) : !refund ? (
              <div className="text-center p-12 text-slate-400">{t("needsActions.refundDetail.notFound")}</div>
            ) : (
              <div className="space-y-5">
                {/* Notice on Payment immutability */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">{t("needsActions.refundDetail.originalPaymentStatus", { id: refund.paymentId })}</span>
                  <Badge variant="outline" className="font-bold bg-white text-success-700 border-success-300">
                    {t("needsActions.refundDetail.paymentHistoryBadge")}
                  </Badge>
                </div>

                {/* Amount Overview Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                    <span className="text-[11px] text-slate-400 font-bold block mb-1">{t("needsActions.refundDetail.originalAmount")}</span>
                    <span className="text-base font-black text-slate-900 font-mono">
                      {(refund.originalPaidAmount ?? refund.originalAmount)?.toLocaleString(currentIntlLocale())} {refund.currency || "VND"}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl border border-primary-100 bg-primary-50/40">
                    <span className="text-[11px] text-primary-600 font-bold block mb-1">{t("needsActions.refundDetail.approvedAmount")}</span>
                    <span className="text-base font-black text-primary-900 font-mono">
                      {refund.approvedAmount ? `${refund.approvedAmount.toLocaleString(currentIntlLocale())} ${refund.currency || "VND"}` : "—"}
                    </span>
                  </div>
                </div>

                {/* Recommendation & Decision summary */}
                <div className="rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">{t("needsActions.refundDetail.coordinatorRecommendation")}</span>
                    <span className="font-bold text-slate-800">
                      {refund.recommendation || t("needsActions.refundDetail.noRecommendation")}
                      {refund.recommendedAmount ? ` (${refund.recommendedAmount.toLocaleString(currentIntlLocale())} VND)` : ""}
                    </span>
                  </div>
                  {(refund.reviewReason || refund.recommendationReason) && (
                    <div className="p-3.5 bg-slate-50/40">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">{t("needsActions.refundDetail.recommendationReason")}</span>
                      <p className="text-slate-700 font-medium">{refund.reviewReason || refund.recommendationReason}</p>
                    </div>
                  )}
                  {refund.decisionReason && (
                    <div className="p-3.5 bg-slate-50/40">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">{t("needsActions.refundDetail.decisionReason")}</span>
                      <p className="text-slate-700 font-medium">{refund.decisionReason}</p>
                    </div>
                  )}
                  {refund.providerResult && (
                    <div className="p-3.5 bg-slate-50/40">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">{t("needsActions.refundDetail.reconciliationResult")}</span>
                      <p className="text-slate-700 font-medium">{refund.providerResult}</p>
                      {refund.providerRefundId && (
                        <p className="text-slate-500 font-mono text-[11px] mt-1">{t("needsActions.refundDetail.providerReference", { id: refund.providerRefundId })}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Real Business Audit Events for this Refund */}
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                    <FileSearch className="w-3.5 h-3.5 text-primary-600" />
                    <span>{t("needsActions.refundDetail.auditTitle")}</span>
                  </h4>
                  {loadingAudit ? (
                    <div className="p-4 text-center text-slate-400">{t("needsActions.refundDetail.auditLoading")}</div>
                  ) : auditEvents.length === 0 ? (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 text-center">
                      {t("needsActions.refundDetail.auditEmpty")}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                      {auditEvents.map((ev) => (
                        <div key={ev.id} className="p-3 text-[11px] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-primary-700">{ev.eventType}</span>
                            <span className="text-slate-400 text-[10px]">
                              {new Date(ev.occurredAt).toLocaleString(currentIntlLocale())}
                            </span>
                          </div>
                          <p className="text-slate-600">
                            {ev.actorType === "USER" ? t("needsActions.refundDetail.auditActorUser", { id: ev.actorId, role: ev.actorRole }) : t("needsActions.refundDetail.auditActorSystem")} - {ev.reason || t("needsActions.refundDetail.auditDefaultReason")}
                          </p>
                          {ev.previousState && ev.newState && (
                            <p className="font-mono text-[10px] text-slate-500">
                              {ev.previousState} ➔ {ev.newState}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Action Footer */}
          {refund && isAdminOrSuperAdmin && (
            <div className="p-4 border-t bg-slate-50/70 flex items-center justify-end gap-2">
              {refund.status === "RECOMMENDED" && (
                <Button
                  size="sm"
                  onClick={() => setDecideOpen(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold"
                >
                  {t("needsActions.refundDetail.actions.decide")}
                </Button>
              )}
              {(refund.status === "APPROVED" || refund.status === "FAILED") && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExecute}
                  disabled={executing}
                  className="text-xs font-bold"
                >
                  {executing ? t("needsActions.refundDetail.actions.retrying") : t("needsActions.refundDetail.actions.retryGateway")}
                </Button>
              )}
              {refund.status !== "REJECTED" && refund.status !== "SUCCEEDED" && (
                <Button
                  size="sm"
                  onClick={() => setReconcileOpen(true)}
                  className="bg-success-600 hover:bg-success-700 text-white text-xs font-bold"
                >
                  {t("needsActions.refundDetail.actions.reconcile")}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Decision Dialog */}
      <DecideRefundDialog
        refund={refund}
        open={decideOpen}
        onOpenChange={setDecideOpen}
        onSuccess={() => {
          if (refund) {
            void fetchDetail(refund.id)
            void fetchAuditEvents(refund.id)
          }
          onSuccess?.()
        }}
      />

      {/* Reconcile Dialog */}
      <ReconcileRefundDialog
        refund={refund}
        open={reconcileOpen}
        onOpenChange={setReconcileOpen}
        onSuccess={() => {
          if (refund) {
            void fetchDetail(refund.id)
            void fetchAuditEvents(refund.id)
          }
          onSuccess?.()
        }}
      />
    </>
  )
}

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  CheckCircle2,
  UserCheck,
  RotateCcw,
  DollarSign,
} from "lucide-react"

import { useAuthStore } from "@/stores/auth-store"
import { currentIntlLocale } from "@/lib/i18n"
import { needsActionApi } from "@/services"
import type { NeedsActionResponse } from "@/types/needs-action"
import { RecommendRefundDialog } from "@/pages/app/management/needs-actions/components/recommend-refund-dialog"
import { RefundDetailDialog } from "@/pages/app/management/needs-actions/components/refund-detail-dialog"

interface NeedsActionDetailDialogProps {
  item: NeedsActionResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function NeedsActionDetailDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: NeedsActionDetailDialogProps) {
  const { t } = useTranslation("management")
  const { toast } = useToast()
  const userSession = useAuthStore((state) => state.userSession)
  const role = userSession?.role || "MEMBER"
  const isCoordinator = role === "CARE_COORDINATOR"
  const isAdminOrSuperAdmin = role === "ADMIN" || role === "SUPER_ADMIN"

  const [loadingAction, setLoadingAction] = useState(false)
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false)
  const [resolutionText, setResolutionText] = useState("")

  // Domain action dialogs
  const [recommendRefundOpen, setRecommendRefundOpen] = useState(false)
  const [refundDetailOpen, setRefundDetailOpen] = useState(false)

  if (!item) return null

  // Claim action
  const handleClaim = async () => {
    try {
      setLoadingAction(true)
      await needsActionApi.claimNeedsAction(item.id)
      toast({
        title: t("needsActions.detail.toast.claimedTitle"),
        description: t("needsActions.detail.toast.claimedDescription", { id: item.id }),
      })
      onSuccess?.()
      onOpenChange(false)
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } }
      toast({
        variant: "destructive",
        title: t("needsActions.detail.toast.claimErrorTitle"),
        description: anyErr.response?.data?.message || t("needsActions.detail.toast.claimFailed"),
      })
    } finally {
      setLoadingAction(false)
    }
  }

  // Retry provider cancellation action (for Admin)
  const handleRetryCancellation = async () => {
    const paymentId = item.referenceId
    if (!paymentId) {
      toast({ variant: "destructive", title: t("needsActions.detail.toast.errorTitle"), description: t("needsActions.detail.toast.missingPaymentId") })
      return
    }

    try {
      setLoadingAction(true)
      await needsActionApi.retryProviderCancellation(paymentId)
      toast({
        title: t("needsActions.detail.toast.cancellationSentTitle"),
        description: t("needsActions.detail.toast.cancellationSentDescription", { id: paymentId }),
      })
      onSuccess?.()
      onOpenChange(false)
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } }
      toast({
        variant: "destructive",
        title: t("needsActions.detail.toast.retryErrorTitle"),
        description: anyErr.response?.data?.message || t("needsActions.detail.toast.retryFailed"),
      })
    } finally {
      setLoadingAction(false)
    }
  }

  // Manual resolve action
  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resolutionText.trim()) {
      toast({
        variant: "destructive",
        title: t("needsActions.detail.toast.missingInfoTitle"),
        description: t("needsActions.detail.toast.missingResolution"),
      })
      return
    }

    try {
      setLoadingAction(true)
      await needsActionApi.resolveNeedsAction(item.id, {
        resolution: resolutionText.trim(),
      })
      toast({
        title: t("needsActions.detail.toast.resolvedTitle"),
        description: t("needsActions.detail.toast.resolvedDescription", { id: item.id }),
      })
      setResolveDialogOpen(false)
      onSuccess?.()
      onOpenChange(false)
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } }
      toast({
        variant: "destructive",
        title: t("needsActions.detail.toast.resolveErrorTitle"),
        description: anyErr.response?.data?.message || t("needsActions.detail.toast.resolveFailed"),
      })
    } finally {
      setLoadingAction(false)
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return <Badge className="bg-danger-600 hover:bg-danger-700 text-white font-extrabold text-[10px]">{t("needsActions.detail.priority.critical")}</Badge>
      case "HIGH":
        return <Badge className="bg-warning-500 hover:bg-warning-600 text-white font-bold text-[10px]">{t("needsActions.detail.priority.high")}</Badge>
      default:
        return <Badge className="bg-primary-600 hover:bg-primary-700 text-white font-medium text-[10px]">{t("needsActions.detail.priority.normal")}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return <Badge className="bg-success-500 hover:bg-success-600 text-white font-bold text-[10px]">{t("needsActions.detail.status.resolved")}</Badge>
      case "CLAIMED":
        return <Badge className="bg-primary-500 hover:bg-primary-600 text-white font-bold text-[10px]">{t("needsActions.detail.status.claimed")}</Badge>
      default:
        return <Badge className="bg-warning-500 hover:bg-warning-600 text-white font-bold text-[10px]">{t("needsActions.detail.status.open")}</Badge>
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[580px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400 font-bold">#{item.id}</span>
                  {getPriorityBadge(item.priority)}
                  {getStatusBadge(item.status)}
                </div>
                <DialogTitle className="text-base font-black text-slate-900 leading-snug">
                  {item.title}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
            {/* Description */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed font-medium">
              {item.description}
            </div>

            {/* Attributes Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/40">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">{t("needsActions.detail.typeLabel")}</span>
                <span className="font-mono font-bold text-slate-800 text-xs">{item.type}</span>
              </div>
              <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/40">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">{t("needsActions.detail.assignedRole")}</span>
                <span className="font-bold text-primary-600 text-xs">{item.assignedRole}</span>
              </div>
            </div>

            {/* Reference info */}
            {item.referenceType && item.referenceId && (
              <div className="p-3.5 rounded-2xl border border-slate-100 bg-primary-50/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{t("needsActions.detail.relatedObject")}</span>
                  <span className="font-bold text-slate-800 text-xs">
                    {item.referenceType} #{item.referenceId}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-primary-600 font-mono">
                  {t("needsActions.detail.originalReference")}
                </span>
              </div>
            )}

            {/* Claimed & Resolved status */}
            <div className="rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-500 font-medium">{t("needsActions.detail.createdAt")}</span>
                <span className="font-mono text-slate-700">
                  {new Date(item.createdAt).toLocaleString(currentIntlLocale())}
                </span>
              </div>
              {item.claimedAt && (
                <div className="p-3 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">{t("needsActions.detail.claimedByLabel")}</span>
                  <span className="font-bold text-slate-800">
                    {t("needsActions.detail.claimedBy", { id: item.claimedByUserId, time: new Date(item.claimedAt).toLocaleString(currentIntlLocale()) })}
                  </span>
                </div>
              )}
              {item.resolvedAt && (
                <div className="p-3.5 bg-success-50/40 space-y-1">
                  <div className="flex items-center justify-between text-success-800 font-bold">
                    <span>{t("needsActions.detail.resolvedBy", { id: item.resolvedByUserId })}</span>
                    <span className="text-[10px] font-mono">{new Date(item.resolvedAt).toLocaleString(currentIntlLocale())}</span>
                  </div>
                  {item.resolution && (
                    <p className="text-success-900 font-medium text-xs mt-1 italic">
                      "{item.resolution}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 border-t bg-slate-50/70 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loadingAction}
              className="text-xs font-semibold"
            >
              {t("needsActions.detail.actions.close")}
            </Button>

            <div className="flex items-center gap-2">
              {/* Claim button if OPEN */}
              {item.status === "OPEN" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClaim}
                  disabled={loadingAction}
                  className="text-xs font-bold text-primary-600 border-primary-200 hover:bg-primary-50"
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                  {t("needsActions.detail.actions.claim")}
                </Button>
              )}

              {/* Direct Domain Action: Provider Cancellation Retry */}
              {item.type === "PROVIDER_CANCELLATION_RECONCILIATION" && isAdminOrSuperAdmin && item.status !== "RESOLVED" && (
                <Button
                  size="sm"
                  onClick={handleRetryCancellation}
                  disabled={loadingAction}
                  className="bg-warning-600 hover:bg-warning-700 text-white text-xs font-bold"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  {t("needsActions.detail.actions.retryPayosCancellation")}
                </Button>
              )}

              {/* Direct Domain Action: Coordinator Refund Recommendation */}
              {item.type === "REFUND_REVIEW_REQUIRED" && isCoordinator && item.status !== "RESOLVED" && (
                <Button
                  size="sm"
                  onClick={() => setRecommendRefundOpen(true)}
                  disabled={loadingAction}
                  className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold"
                >
                  <DollarSign className="w-3.5 h-3.5 mr-1" />
                  {t("needsActions.detail.actions.recommendRefund")}
                </Button>
              )}

              {/* Direct Domain Action: Admin Refund Detail & Reconciliation */}
              {(item.type === "REFUND_PROVIDER_FAILURE" || item.type === "REFUND_REVIEW_REQUIRED") && isAdminOrSuperAdmin && (
                <Button
                  size="sm"
                  onClick={() => setRefundDetailOpen(true)}
                  disabled={loadingAction}
                  className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold"
                >
                  <DollarSign className="w-3.5 h-3.5 mr-1" />
                  {t("needsActions.detail.actions.processRefund")}
                </Button>
              )}

              {/* Manual Resolve Button */}
              {item.status !== "RESOLVED" && (
                <Button
                  size="sm"
                  onClick={() => setResolveDialogOpen(true)}
                  disabled={loadingAction}
                  className="bg-success-600 hover:bg-success-700 text-white text-xs font-bold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  {t("needsActions.detail.actions.resolve")}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Resolution Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleResolve}>
            <DialogHeader>
              <DialogTitle>{t("needsActions.detail.resolveDialog.title", { id: item.id })}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <Label htmlFor="resText" className="text-xs font-bold text-slate-700">
                {t("needsActions.detail.resolveDialog.label")} <span className="text-danger-500">*</span>
              </Label>
              <Textarea
                id="resText"
                rows={4}
                placeholder={t("needsActions.detail.resolveDialog.placeholder")}
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                disabled={loadingAction}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setResolveDialogOpen(false)}
                disabled={loadingAction}
              >
                {t("needsActions.detail.resolveDialog.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={loadingAction}
                className="bg-success-600 hover:bg-success-700 text-white"
              >
                {loadingAction ? t("needsActions.detail.resolveDialog.saving") : t("needsActions.detail.resolveDialog.confirm")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Coordinator Refund Recommendation Dialog */}
      <RecommendRefundDialog
        paymentId={item.referenceId || null}
        open={recommendRefundOpen}
        onOpenChange={setRecommendRefundOpen}
        onSuccess={() => {
          onSuccess?.()
          onOpenChange(false)
        }}
      />

      {/* Admin Refund Detail Dialog */}
      <RefundDetailDialog
        refundId={item.referenceId || null}
        open={refundDetailOpen}
        onOpenChange={setRefundDetailOpen}
        onSuccess={() => {
          onSuccess?.()
          onOpenChange(false)
        }}
      />
    </>
  )
}

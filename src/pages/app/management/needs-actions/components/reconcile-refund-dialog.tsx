import { useState } from "react"
import { useTranslation, Trans } from "react-i18next"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { refundApi } from "@/services"
import { currentIntlLocale } from "@/lib/i18n"
import type { ConsultationRefundResponse } from "@/types/refund"

interface ReconcileRefundDialogProps {
  refund: ConsultationRefundResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ReconcileRefundDialog({
  refund,
  open,
  onOpenChange,
  onSuccess,
}: ReconcileRefundDialogProps) {
  const { t } = useTranslation("management")
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [succeeded, setSucceeded] = useState<boolean>(true)
  const [providerRefundId, setProviderRefundId] = useState("")
  const [providerResult, setProviderResult] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!refund) return

    if (!providerResult.trim()) {
      toast({
        variant: "destructive",
        title: t("needsActions.reconcile.toast.missingInfoTitle"),
        description: t("needsActions.reconcile.toast.missingResult"),
      })
      return
    }

    setLoading(true)
    try {
      await refundApi.reconcileRefund(refund.id, {
        succeeded,
        providerRefundId: providerRefundId.trim() || null,
        providerResult: providerResult.trim(),
      })

      toast({
        title: t("needsActions.reconcile.toast.successTitle"),
        description: t("needsActions.reconcile.toast.successDescription", {
          id: refund.id,
          status: succeeded ? "SUCCEEDED" : "FAILED",
        }),
      })
      onSuccess?.()
      onOpenChange(false)
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } }
      toast({
        variant: "destructive",
        title: t("needsActions.reconcile.toast.errorTitle"),
        description: anyErr.response?.data?.message || t("needsActions.reconcile.toast.failed"),
      })
    } finally {
      setLoading(false)
    }
  }

  if (!refund) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("needsActions.reconcile.title")}</DialogTitle>
            <DialogDescription>
              {t("needsActions.reconcile.description", { id: refund.id })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            {/* PayOS SDK notice */}
            <Alert className="bg-warning-50/70 border-warning-200 text-warning-900">
              <Info className="h-4 w-4 text-warning-600 shrink-0" />
              <div className="space-y-1">
                <AlertTitle className="text-xs font-bold">{t("needsActions.reconcile.noticeTitle")}</AlertTitle>
                <AlertDescription className="text-[11px] leading-relaxed text-warning-800">
                  <Trans t={t} i18nKey="needsActions.reconcile.noticeBody" components={{ code: <code /> }} />
                </AlertDescription>
              </div>
            </Alert>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">{t("needsActions.reconcile.approvedAmount")}</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {refund.approvedAmount?.toLocaleString(currentIntlLocale()) || refund.originalAmount?.toLocaleString(currentIntlLocale())} {refund.currency || "VND"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">{t("needsActions.reconcile.currentStatus")}</span>
                <span className="font-bold text-primary-600">{refund.status}</span>
              </div>
            </div>

            {/* Outcome Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">{t("needsActions.reconcile.outcomeLabel")}</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSucceeded(true)}
                  className={`p-3 rounded-xl border font-bold text-center cursor-pointer transition-all ${
                    succeeded ? "border-success-600 bg-success-50 text-success-800 shadow-xs" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                  disabled={loading}
                >
                  {t("needsActions.reconcile.outcomeSucceeded")}
                </button>
                <button
                  type="button"
                  onClick={() => setSucceeded(false)}
                  className={`p-3 rounded-xl border font-bold text-center cursor-pointer transition-all ${
                    !succeeded ? "border-danger-600 bg-danger-50 text-danger-800 shadow-xs" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                  disabled={loading}
                >
                  {t("needsActions.reconcile.outcomeFailed")}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="providerRefundId" className="text-xs font-bold text-slate-700">
                {t("needsActions.reconcile.providerRefundIdLabel")}
              </Label>
              <Input
                id="providerRefundId"
                placeholder={t("needsActions.reconcile.providerRefundIdPlaceholder")}
                value={providerRefundId}
                onChange={(e) => setProviderRefundId(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="providerResult" className="text-xs font-bold text-slate-700">
                {t("needsActions.reconcile.providerResultLabel")} <span className="text-danger-500">*</span>
              </Label>
              <Textarea
                id="providerResult"
                rows={3}
                placeholder={t("needsActions.reconcile.providerResultPlaceholder")}
                value={providerResult}
                onChange={(e) => setProviderResult(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t("needsActions.reconcile.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              {loading ? t("needsActions.reconcile.submitting") : t("needsActions.reconcile.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

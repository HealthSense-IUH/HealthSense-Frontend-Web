import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
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
import { refundApi } from "@/services"
import { currentIntlLocale } from "@/lib/i18n"
import type { ConsultationRefundResponse } from "@/types/refund"

interface DecideRefundDialogProps {
  refund: ConsultationRefundResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DecideRefundDialog({
  refund,
  open,
  onOpenChange,
  onSuccess,
}: DecideRefundDialogProps) {
  const { t } = useTranslation("management")
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [approved, setApproved] = useState<boolean>(true)
  const [approvedAmount, setApprovedAmount] = useState<number>(0)
  const [reason, setReason] = useState("")

  useEffect(() => {
    if (open && refund) {
      const origAmount = refund.originalPaidAmount ?? refund.originalAmount ?? 0
      const defaultAmount =
        refund.recommendedAmount ??
        (refund.recommendation === "FULL" ? origAmount : origAmount)
      setApproved(refund.recommendation !== "NONE")
      setApprovedAmount(defaultAmount)
      setReason("")
    }
  }, [open, refund])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!refund) return

    if (!reason.trim()) {
      toast({
        variant: "destructive",
        title: t("needsActions.decide.toast.missingInfoTitle"),
        description: t("needsActions.decide.toast.missingReason"),
      })
      return
    }

    if (approved && (!approvedAmount || approvedAmount <= 0)) {
      toast({
        variant: "destructive",
        title: t("needsActions.decide.toast.invalidAmountTitle"),
        description: t("needsActions.decide.toast.invalidAmount"),
      })
      return
    }

    setLoading(true)
    try {
      await refundApi.decideRefund(refund.id, {
        approved,
        approvedAmount: approved ? Number(approvedAmount) : null,
        reason: reason.trim(),
      })

      toast({
        title: approved ? t("needsActions.decide.toast.approvedTitle") : t("needsActions.decide.toast.rejectedTitle"),
        description: t("needsActions.decide.toast.recordedDescription", { id: refund.id }),
      })
      onSuccess?.()
      onOpenChange(false)
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } }
      toast({
        variant: "destructive",
        title: t("needsActions.decide.toast.errorTitle"),
        description: anyErr.response?.data?.message || t("needsActions.decide.toast.failed"),
      })
    } finally {
      setLoading(false)
    }
  }

  if (!refund) return null

  const origAmount = refund.originalPaidAmount ?? refund.originalAmount ?? 0
  const coordReason = refund.reviewReason || refund.recommendationReason

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("needsActions.decide.title")}</DialogTitle>
            <DialogDescription>
              {t("needsActions.decide.description", { id: refund.id })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            {/* Context Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">{t("needsActions.decide.originalAmount")}</span>
                <span className="font-mono font-bold text-slate-800">
                  {origAmount.toLocaleString(currentIntlLocale())} {refund.currency || "VND"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">{t("needsActions.decide.coordinatorRecommendation")}</span>
                <span className="font-bold text-primary-600">
                  {refund.recommendation === "FULL"
                    ? t("needsActions.decide.recommendationFull")
                    : refund.recommendation === "PARTIAL"
                    ? t("needsActions.decide.recommendationPartial", { amount: refund.recommendedAmount?.toLocaleString(currentIntlLocale()) })
                    : t("needsActions.decide.recommendationNone")}
                </span>
              </div>
              {coordReason && (
                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 italic">
                  "{coordReason}"
                </div>
              )}
            </div>

            {/* Decision choice */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">{t("needsActions.decide.decisionLabel")}</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setApproved(true)}
                  className={`flex flex-col items-center justify-between rounded-xl border p-3.5 cursor-pointer text-center transition-all ${
                    approved ? "border-success-600 bg-success-50/40 shadow-xs" : "border-slate-200 hover:bg-slate-50"
                  }`}
                  disabled={loading}
                >
                  <span className="font-bold text-success-700">{t("needsActions.decide.approveTitle")}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">{t("needsActions.decide.approveDescription")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setApproved(false)}
                  className={`flex flex-col items-center justify-between rounded-xl border p-3.5 cursor-pointer text-center transition-all ${
                    !approved ? "border-danger-600 bg-danger-50/40 shadow-xs" : "border-slate-200 hover:bg-slate-50"
                  }`}
                  disabled={loading}
                >
                  <span className="font-bold text-danger-700">{t("needsActions.decide.rejectTitle")}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">{t("needsActions.decide.rejectDescription")}</span>
                </button>
              </div>
            </div>

            {approved && (
              <div className="space-y-1.5">
                <Label htmlFor="approvedAmount" className="text-xs font-bold text-slate-700">
                  {t("needsActions.decide.amountLabel")}
                </Label>
                <Input
                  id="approvedAmount"
                  type="number"
                  min={1000}
                  max={refund.originalAmount || undefined}
                  value={approvedAmount || ""}
                  onChange={(e) => setApprovedAmount(Number(e.target.value))}
                  disabled={loading}
                  placeholder={t("needsActions.decide.amountPlaceholder")}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="decisionReason" className="text-xs font-bold text-slate-700">
                {t("needsActions.decide.reasonLabel")} <span className="text-danger-500">*</span>
              </Label>
              <Textarea
                id="decisionReason"
                rows={3}
                placeholder={t("needsActions.decide.reasonPlaceholder")}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
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
              {t("needsActions.decide.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={approved ? "bg-success-600 hover:bg-success-700 text-white" : "bg-danger-600 hover:bg-danger-700 text-white"}
            >
              {loading ? t("needsActions.decide.processing") : approved ? t("needsActions.decide.submitApprove") : t("needsActions.decide.submitReject")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

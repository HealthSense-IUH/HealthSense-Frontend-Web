import { useState } from "react"
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
import type { RefundRecommendation } from "@/types/refund"

interface RecommendRefundDialogProps {
  paymentId: number | string | null
  originalAmount?: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RecommendRefundDialog({
  paymentId,
  originalAmount = 0,
  open,
  onOpenChange,
  onSuccess,
}: RecommendRefundDialogProps) {
  const { t } = useTranslation("management")
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [recommendation, setRecommendation] = useState<RefundRecommendation>("FULL")
  const [recommendedAmount, setRecommendedAmount] = useState<number>(originalAmount)
  const [reason, setReason] = useState("")
  const [operationalContext, setOperationalContext] = useState("")

  const handleRecommendationChange = (val: RefundRecommendation) => {
    setRecommendation(val)
    if (val === "FULL") {
      setRecommendedAmount(originalAmount)
    } else if (val === "NONE") {
      setRecommendedAmount(0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentId) return

    if (!reason.trim()) {
      toast({
        variant: "destructive",
        title: t("needsActions.recommend.toast.missingInfoTitle"),
        description: t("needsActions.recommend.toast.missingReason"),
      })
      return
    }

    if (recommendation === "PARTIAL" && (!recommendedAmount || recommendedAmount <= 0)) {
      toast({
        variant: "destructive",
        title: t("needsActions.recommend.toast.invalidAmountTitle"),
        description: t("needsActions.recommend.toast.invalidAmount"),
      })
      return
    }

    setLoading(true)
    try {
      await refundApi.recommendRefund(paymentId, {
        recommendation,
        recommendedAmount: recommendation === "PARTIAL" ? Number(recommendedAmount) : recommendation === "FULL" ? originalAmount : null,
        reason: reason.trim(),
        operationalContext: operationalContext.trim() || null,
      })

      toast({
        title: t("needsActions.recommend.toast.successTitle"),
        description: t("needsActions.recommend.toast.successDescription"),
      })
      onSuccess?.()
      onOpenChange(false)
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } }
      toast({
        variant: "destructive",
        title: t("needsActions.recommend.toast.errorTitle"),
        description: anyErr.response?.data?.message || t("needsActions.recommend.toast.failed"),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("needsActions.recommend.title")}</DialogTitle>
            <DialogDescription>
              {t("needsActions.recommend.description", { id: paymentId })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            {originalAmount > 0 && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-medium">{t("needsActions.recommend.originalPaidAmount")}</span>
                <span className="font-mono font-black text-slate-800 text-sm">
                  {originalAmount.toLocaleString(currentIntlLocale())} VND
                </span>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">{t("needsActions.recommend.levelLabel")}</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleRecommendationChange("FULL")}
                  className={`flex flex-col items-center justify-between rounded-xl border p-3 cursor-pointer text-center transition-all ${
                    recommendation === "FULL" ? "border-primary-600 bg-primary-50/40 shadow-xs" : "border-slate-200 hover:bg-slate-50"
                  }`}
                  disabled={loading}
                >
                  <span className="font-bold text-slate-800">{t("needsActions.recommend.options.fullTitle")}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">{t("needsActions.recommend.options.fullDescription")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRecommendationChange("PARTIAL")}
                  className={`flex flex-col items-center justify-between rounded-xl border p-3 cursor-pointer text-center transition-all ${
                    recommendation === "PARTIAL" ? "border-primary-600 bg-primary-50/40 shadow-xs" : "border-slate-200 hover:bg-slate-50"
                  }`}
                  disabled={loading}
                >
                  <span className="font-bold text-slate-800">{t("needsActions.recommend.options.partialTitle")}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">{t("needsActions.recommend.options.partialDescription")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRecommendationChange("NONE")}
                  className={`flex flex-col items-center justify-between rounded-xl border p-3 cursor-pointer text-center transition-all ${
                    recommendation === "NONE" ? "border-primary-600 bg-primary-50/40 shadow-xs" : "border-slate-200 hover:bg-slate-50"
                  }`}
                  disabled={loading}
                >
                  <span className="font-bold text-slate-800">{t("needsActions.recommend.options.noneTitle")}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">{t("needsActions.recommend.options.noneDescription")}</span>
                </button>
              </div>
            </div>

            {recommendation === "PARTIAL" && (
              <div className="space-y-1.5">
                <Label htmlFor="recommendedAmount" className="text-xs font-bold text-slate-700">
                  {t("needsActions.recommend.amountLabel")}
                </Label>
                <Input
                  id="recommendedAmount"
                  type="number"
                  min={1000}
                  max={originalAmount || undefined}
                  value={recommendedAmount || ""}
                  onChange={(e) => setRecommendedAmount(Number(e.target.value))}
                  disabled={loading}
                  placeholder={t("needsActions.recommend.amountPlaceholder")}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="reason" className="text-xs font-bold text-slate-700">
                {t("needsActions.recommend.reasonLabel")} <span className="text-danger-500">*</span>
              </Label>
              <Textarea
                id="reason"
                rows={3}
                placeholder={t("needsActions.recommend.reasonPlaceholder")}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="operationalContext" className="text-xs font-bold text-slate-700">
                {t("needsActions.recommend.contextLabel")}
              </Label>
              <Textarea
                id="operationalContext"
                rows={2}
                placeholder={t("needsActions.recommend.contextPlaceholder")}
                value={operationalContext}
                onChange={(e) => setOperationalContext(e.target.value)}
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
              {t("needsActions.recommend.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("needsActions.recommend.submitting") : t("needsActions.recommend.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

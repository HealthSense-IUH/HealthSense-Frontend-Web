import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  ExternalLink,
  Loader2,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  formatVnd,
  formatCreditQuantity,
  getCreditOrderStatusConfig,
  getCreditPaymentProviderConfig,
} from "@/constants/credits"
import { useTranslation } from "react-i18next"
import { currentIntlLocale } from "@/lib/i18n"
import type { UseCreditPurchaseReturn } from "../hooks/use-credit-purchase"

interface PurchaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchaseState: UseCreditPurchaseReturn
  onViewOrderDetail?: (orderId: string) => void
}

export function PurchaseDialog({
  open,
  onOpenChange,
  purchaseState,
  onViewOrderDetail,
}: PurchaseDialogProps) {
  const { t } = useTranslation("credits")
  const {
    selectedPackage,
    idempotencyKey,
    isSubmitting,
    isFeatureDisabled,
    lastError,
    errorCode,
    successResult,
    hasPendingRetry,
    executePurchase,
    resetPurchaseState,
  } = purchaseState

  if (!selectedPackage) return null

  const handleClose = () => {
    // Không cho đóng khi đang gửi request
    if (isSubmitting) return
    resetPurchaseState()
    onOpenChange(false)
  }

  const handleExecute = async () => {
    await executePurchase()
  }

  const orderStatusConfig = successResult?.order?.status
    ? getCreditOrderStatusConfig(successResult.order.status)
    : null
  const providerConfig = successResult?.payment?.provider
    ? getCreditPaymentProviderConfig(successResult.payment.provider)
    : null

  return (
    <Dialog open={open} onOpenChange={(val) => !isSubmitting && onOpenChange(val)}>
      <DialogContent className="sm:max-w-lg p-6">
        {/* Trường hợp: Thành công */}
        {successResult ? (
          <div className="space-y-5">
            <DialogHeader>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-100 text-success-600 mb-2">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <DialogTitle className="text-center text-xl font-bold text-foreground">
                {t("purchaseDialog.successTitle")}
              </DialogTitle>
              <DialogDescription className="text-center text-xs text-muted-foreground">
                {t("purchaseDialog.successDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-border/60">
                <span className="text-muted-foreground">{t("purchaseDialog.orderId")}</span>
                <span className="font-mono font-medium text-foreground">
                  #{successResult.order.id}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("purchaseDialog.packagePurchased")}</span>
                <span className="font-semibold text-foreground">
                  {successResult.order.packageName}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("purchaseDialog.creditsReceived")}</span>
                <span className="font-bold text-success-600 text-sm">
                  +{formatCreditQuantity(successResult.order.creditQuantity)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("purchaseDialog.totalPaid")}</span>
                <span className="font-bold text-foreground">
                  {formatVnd(successResult.order.amountVnd)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("purchaseDialog.method")}</span>
                <Badge variant="outline" className="text-[11px] font-medium">
                  {providerConfig?.label || t("purchaseDialog.mockFallback")}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-muted-foreground">{t("purchaseDialog.status")}</span>
                <Badge className={`text-[11px] font-semibold ${orderStatusConfig?.className}`}>
                  {orderStatusConfig?.label || t("orderStatus.paid")}
                </Badge>
              </div>
            </div>

            {/* Snapshot số dư ví sau mua */}
            <div className="rounded-xl border border-success-200 bg-success-50/50 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Coins className="h-5 w-5 text-success-600" />
                <div>
                  <div className="text-xs font-medium text-success-900">
                    {t("purchaseDialog.currentAvailable")}
                  </div>
                  <div className="text-[11px] text-success-700/80">
                    {t("purchaseDialog.walletBreakdown", { balance: successResult.wallet.balance, reserved: successResult.wallet.reserved })}
                  </div>
                </div>
              </div>
              <div className="text-lg font-black text-success-700">
                {t("quantity.credits", { count: successResult.wallet.available, value: successResult.wallet.available.toLocaleString(currentIntlLocale()) })}
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              {onViewOrderDetail && (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleClose()
                    onViewOrderDetail(successResult.order.id)
                  }}
                  className="gap-1.5 w-full sm:w-auto"
                >
                  <ExternalLink className="h-4 w-4" /> {t("purchaseDialog.viewOrder")}
                </Button>
              )}
              <Button onClick={handleClose} className="w-full sm:w-auto font-semibold">
                {t("purchaseDialog.done")}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          /* Trường hợp: Chuẩn bị mua & Xác nhận */
          <div className="space-y-5">
            <DialogHeader>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold w-fit mb-1">
                <CreditCard className="h-3.5 w-3.5" /> {t("purchaseDialog.confirmBadge")}
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {selectedPackage.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {t("purchaseDialog.confirmDescription")}
              </DialogDescription>
            </DialogHeader>

            {/* Thông tin bảo vệ giao dịch */}
            <Alert className="border-primary-200 bg-primary-50/50 text-xs py-3">
              <ShieldCheck className="h-4 w-4 text-primary-600" />
              <AlertTitle className="text-xs font-semibold text-primary-900 mb-0.5">
                {t("purchaseDialog.protectedTitle")}
              </AlertTitle>
              <AlertDescription className="text-[11px] text-primary-700 leading-relaxed">
                {t("purchaseDialog.protectedDescription")}
              </AlertDescription>
            </Alert>

            {/* Chi tiết đơn */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("purchaseDialog.packageRef")}</span>
                <span className="font-mono font-medium text-foreground">
                  {selectedPackage.code || `#${selectedPackage.id}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("purchaseDialog.consultationCreditsReceived")}</span>
                <span className="font-bold text-success-600 text-sm">
                  +{formatCreditQuantity(selectedPackage.creditQuantity)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                <span className="text-muted-foreground font-medium">{t("purchaseDialog.packagePrice")}</span>
                <span className="text-lg font-black text-foreground">
                  {formatVnd(selectedPackage.priceVnd)}
                </span>
              </div>
            </div>

            {/* Thông báo nếu đang có giao dịch dở dang (Pending Retry) */}
            {hasPendingRetry && !isFeatureDisabled && (
              <Alert className="border-warning-200 bg-warning-50/60 text-xs py-3">
                <RotateCcw className="h-4 w-4 text-warning-600" />
                <AlertTitle className="text-xs font-semibold text-warning-900">
                  {t("purchaseDialog.pendingRetryTitle")}
                </AlertTitle>
                <AlertDescription className="text-[11px] text-warning-800 leading-relaxed">
                  {t("purchaseDialog.pendingRetryDescription")}
                </AlertDescription>
              </Alert>
            )}

            {/* Thông báo khởi tạo CREATING */}
            {purchaseState.creatingNotice && (
              <Alert className="border-primary-200 bg-primary-50/60 text-xs py-3">
                <Clock className="h-4 w-4 text-primary-600" />
                <AlertTitle className="text-xs font-semibold text-primary-900">
                  {t("purchaseDialog.creatingTitle")}
                </AlertTitle>
                <AlertDescription className="text-[11px] text-primary-800 leading-relaxed">
                  {purchaseState.creatingNotice}
                </AlertDescription>
              </Alert>
            )}

            {/* Lỗi hiển thị nếu có */}
            {lastError && (
              <Alert className="border-danger-200 bg-danger-50/60 text-xs py-3">
                <AlertCircle className="h-4 w-4 text-danger-600" />
                <AlertTitle className="text-xs font-semibold text-danger-900">
                  {errorCode === 4108 ? t("purchaseDialog.featureNotOpen") : t("purchaseDialog.cannotComplete")}
                </AlertTitle>
                <AlertDescription className="text-[11px] text-danger-800 leading-relaxed">
                  {lastError}
                </AlertDescription>
              </Alert>
            )}

            {/* Thông tin idempotency key an toàn */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono px-1">
              <span>Idempotency-Key:</span>
              <span className="truncate max-w-[220px]" title={idempotencyKey || ""}>
                {idempotencyKey ? `${idempotencyKey.slice(0, 18)}...` : "--"}
              </span>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {t("shared.close")}
              </Button>
              <Button
                onClick={handleExecute}
                disabled={isSubmitting || isFeatureDisabled}
                className="w-full sm:w-auto gap-2 font-semibold shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("purchaseDialog.processing")}
                  </>
                ) : hasPendingRetry ? (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    {t("purchaseDialog.retryTransaction")}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    {t("purchaseDialog.confirmPurchase")}
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

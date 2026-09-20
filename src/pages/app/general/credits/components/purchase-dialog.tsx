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
    if (isSubmitting) return // Không cho đóng khi đang gửi request
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
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 mb-2">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <DialogTitle className="text-center text-xl font-bold text-foreground">
                Mua lượt tư vấn thành công!
              </DialogTitle>
              <DialogDescription className="text-center text-xs text-muted-foreground">
                Giao dịch giả lập đã hoàn tất tức thì. Lượt tư vấn đã được cộng vào ví của bạn.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Mã đơn hàng:</span>
                <span className="font-mono font-medium text-foreground">
                  #{successResult.order.id}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Gói đã mua:</span>
                <span className="font-semibold text-foreground">
                  {successResult.order.packageName}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Số lượt nhận:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  +{formatCreditQuantity(successResult.order.creditQuantity)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tổng thanh toán:</span>
                <span className="font-bold text-foreground">
                  {formatVnd(successResult.order.amountVnd)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Phương thức:</span>
                <Badge variant="outline" className="text-[11px] font-medium">
                  {providerConfig?.label || "Thanh toán giả lập MOCK"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-muted-foreground">Trạng thái:</span>
                <Badge className={`text-[11px] font-semibold ${orderStatusConfig?.className}`}>
                  {orderStatusConfig?.label || "Đã thanh toán"}
                </Badge>
              </div>
            </div>

            {/* Snapshot số dư ví sau mua */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Coins className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <div className="text-xs font-medium text-emerald-900 dark:text-emerald-300">
                    Số dư khả dụng hiện tại
                  </div>
                  <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                    Tổng: {successResult.wallet.balance} | Tạm giữ: {successResult.wallet.reserved}
                  </div>
                </div>
              </div>
              <div className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                {successResult.wallet.available.toLocaleString("vi-VN")} lượt
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
                  <ExternalLink className="h-4 w-4" /> Xem chi tiết đơn
                </Button>
              )}
              <Button onClick={handleClose} className="w-full sm:w-auto font-semibold">
                Hoàn tất
              </Button>
            </DialogFooter>
          </div>
        ) : (
          /* Trường hợp: Chuẩn bị mua & Xác nhận */
          <div className="space-y-5">
            <DialogHeader>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold w-fit mb-1">
                <CreditCard className="h-3.5 w-3.5" /> Xác nhận mua lượt tư vấn
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {selectedPackage.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Vui lòng kiểm tra lại thông tin gói trước khi tiến hành thanh toán thử nghiệm.
              </DialogDescription>
            </DialogHeader>

            {/* Thông tin bảo vệ giao dịch */}
            <Alert className="border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20 text-xs py-3">
              <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-0.5">
                Giao dịch được bảo vệ
              </AlertTitle>
              <AlertDescription className="text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed">
                Hệ thống tự động bảo toàn mã giao dịch duy nhất (Idempotency-Key) nhằm đảm bảo an toàn tuyệt đối, không phát sinh trùng lặp.
              </AlertDescription>
            </Alert>

            {/* Chi tiết đơn */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Mã gói tham chiếu:</span>
                <span className="font-mono font-medium text-foreground">
                  {selectedPackage.code || `#${selectedPackage.id}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Số lượt tư vấn nhận:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  +{formatCreditQuantity(selectedPackage.creditQuantity)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                <span className="text-muted-foreground font-medium">Giá gói (VND):</span>
                <span className="text-lg font-black text-foreground">
                  {formatVnd(selectedPackage.priceVnd)}
                </span>
              </div>
            </div>

            {/* Thông báo nếu đang có giao dịch dở dang (Pending Retry) */}
            {hasPendingRetry && !isFeatureDisabled && (
              <Alert className="border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/20 text-xs py-3">
                <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                  Tiếp tục yêu cầu trước đó
                </AlertTitle>
                <AlertDescription className="text-[11px] text-amber-800 dark:text-amber-400 leading-relaxed">
                  Lần kết nối trước bị gián đoạn mạng hoặc chưa nhận được kết quả. Hệ thống sẽ tiếp tục kiểm tra lại với cùng mã giao dịch an toàn.
                </AlertDescription>
              </Alert>
            )}

            {/* Thông báo khởi tạo CREATING */}
            {purchaseState.creatingNotice && (
              <Alert className="border-sky-200 bg-sky-50/60 dark:border-sky-900/50 dark:bg-sky-950/20 text-xs py-3">
                <Clock className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <AlertTitle className="text-xs font-semibold text-sky-900 dark:text-sky-300">
                  Đang khởi tạo liên kết
                </AlertTitle>
                <AlertDescription className="text-[11px] text-sky-800 dark:text-sky-400 leading-relaxed">
                  {purchaseState.creatingNotice}
                </AlertDescription>
              </Alert>
            )}

            {/* Lỗi hiển thị nếu có */}
            {lastError && (
              <Alert className="border-red-200 bg-red-50/60 dark:border-red-900/50 dark:bg-red-950/20 text-xs py-3">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertTitle className="text-xs font-semibold text-red-900 dark:text-red-300">
                  {errorCode === 4108 ? "Chức năng chưa mở" : "Không thể hoàn tất giao dịch"}
                </AlertTitle>
                <AlertDescription className="text-[11px] text-red-800 dark:text-red-400 leading-relaxed">
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
                Đóng
              </Button>
              <Button
                onClick={handleExecute}
                disabled={isSubmitting || isFeatureDisabled}
                className="w-full sm:w-auto gap-2 font-semibold shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xử lý mua...
                  </>
                ) : hasPendingRetry ? (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Thử lại giao dịch
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Xác nhận mua lượt
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

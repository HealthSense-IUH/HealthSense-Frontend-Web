import { useEffect, useState } from "react"
import {
  AlertCircle,
  Coins,
  CreditCard,
  FileText,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Ban,
} from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useToast } from "@/hooks/use-toast"
import {
  saveStoredPendingPayment,
  clearStoredPendingPayment,
} from "../hooks/use-credit-purchase"
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
import { Skeleton } from "@/components/ui/skeleton"
import { creditsApi } from "@/services/credits.service"
import { parseApiError } from "@/lib/errorHandler"
import { formatRecordDate } from "@/lib/formatters"
import {
  formatVnd,
  formatCreditQuantity,
  getCreditOrderStatusConfig,
  getCreditPaymentStatusConfig,
  getCreditPaymentProviderConfig,
} from "@/constants/credits"
import type { CreditOrderDetail } from "@/types/credits"

interface OrderDetailDialogProps {
  orderId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onWalletUpdated?: (wallet: CreditOrderDetail["wallet"]) => void
}

export function OrderDetailDialog({
  orderId,
  open,
  onOpenChange,
  onWalletUpdated,
}: OrderDetailDialogProps) {
  const { toast } = useToast()
  const userSession = useAuthStore((state) => state.userSession)
  const userId = userSession?.userId ? String(userSession.userId) : ""

  const [detail, setDetail] = useState<CreditOrderDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const handleCancel = async () => {
    if (!orderId || isCancelling) return
    setIsCancelling(true)
    try {
      const res = await creditsApi.cancelOrder(orderId)
      const updated = res.data
      setDetail(updated)
      if (updated.order.status === "PAID") {
        toast({
          title: "Thanh toán đã hoàn tất",
          description: "Giao dịch đã được ghi nhận trước đó. Lượt đã được cộng vào ví.",
        })
        if (userId) clearStoredPendingPayment(userId)
        window.dispatchEvent(new CustomEvent("credits:refresh"))
      } else if (updated.order.status === "CANCELLED") {
        toast({
          title: "Đã hủy đơn hàng",
          description: "Đơn mua lượt tư vấn đã được hủy thành công.",
        })
        if (userId) clearStoredPendingPayment(userId)
        window.dispatchEvent(new CustomEvent("credits:refresh"))
      }
    } catch (err) {
      const parsed = parseApiError(err)
      toast({
        title: "Không thể hủy đơn",
        description: parsed.userMessage || "Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  const handleResume = () => {
    if (!detail?.payment?.checkoutUrl || !detail.payment.checkoutUrl.startsWith("https://")) {
      toast({
        title: "Không thể mở cổng thanh toán",
        description: "Liên kết thanh toán không khả dụng hoặc không an toàn.",
        variant: "destructive",
      })
      return
    }

    if (userId) {
      saveStoredPendingPayment({
        userId,
        orderId: String(detail.order.id),
        attemptId: String(detail.payment.attemptId),
        packageId: String(detail.order.packageId),
        orderCode: detail.payment.orderCode,
        checkoutUrl: detail.payment.checkoutUrl,
        expiresAt: detail.payment.expiresAt,
        createdAt: detail.order.createdAt,
      })
    }

    window.location.assign(detail.payment.checkoutUrl)
  }

  useEffect(() => {
    if (!open || !orderId) {
      setDetail(null)
      setError(null)
      return
    }

    let isMounted = true

    const fetchDetail = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await creditsApi.getOrderById(orderId)
        if (isMounted) {
          setDetail(res.data)
          if (res.data?.wallet && onWalletUpdated) {
            onWalletUpdated(res.data.wallet)
          }
        }
      } catch (err) {
        if (isMounted) {
          const parsed = parseApiError(err)
          setError(
            parsed.statusCode === 404
              ? "Không tìm thấy thông tin đơn mua lượt hoặc đơn không thuộc về bạn."
              : parsed.userMessage || "Không thể tải chi tiết đơn hàng."
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void fetchDetail()

    return () => {
      isMounted = false
    }
  }, [open, orderId, onWalletUpdated])

  const orderStatusCfg = detail?.order?.status
    ? getCreditOrderStatusConfig(detail.order.status)
    : null
  const paymentStatusCfg = detail?.payment?.status
    ? getCreditPaymentStatusConfig(detail.payment.status)
    : null
  const providerCfg = detail?.payment?.provider
    ? getCreditPaymentProviderConfig(detail.payment.provider)
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold w-fit mb-1">
            <FileText className="h-3.5 w-3.5" /> Chi tiết đơn mua lượt
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            {orderId ? `Đơn hàng #${orderId}` : "Chi tiết đơn hàng"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Thông tin snapshot tại thời điểm mua và trạng thái thanh toán hiện tại.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="space-y-4 py-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50/60 dark:border-red-900/50 dark:bg-red-950/20 p-4 space-y-3 text-center my-2">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto" />
            <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (orderId) {
                  setLoading(true)
                  setError(null)
                  creditsApi
                    .getOrderById(orderId)
                    .then((res) => setDetail(res.data))
                    .catch((err) => setError(parseApiError(err).userMessage))
                    .finally(() => setLoading(false))
                }
              }}
              className="gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Thử lại
            </Button>
          </div>
        )}

        {detail && !loading && (
          <div className="space-y-4 py-1">
            {/* 1. Snapshot Đơn hàng */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-border/60">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-primary" /> Thông tin đơn
                </span>
                <Badge className={`text-[11px] font-semibold ${orderStatusCfg?.className}`}>
                  {orderStatusCfg?.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tên gói:</span>
                <span className="font-semibold text-foreground">{detail.order.packageName}</span>
              </div>
              {detail.order.packageCode && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Mã gói:</span>
                  <span className="font-mono text-muted-foreground">{detail.order.packageCode}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Số lượt cấp:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  +{formatCreditQuantity(detail.order.creditQuantity)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tổng tiền thanh toán:</span>
                <span className="font-extrabold text-foreground">
                  {formatVnd(detail.order.amountVnd)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Thời gian tạo đơn:</span>
                <span className="text-foreground">{formatRecordDate(detail.order.createdAt)}</span>
              </div>
              {detail.order.paidAt && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Thời gian ghi nhận thanh toán:</span>
                  <span className="text-foreground">{formatRecordDate(detail.order.paidAt)}</span>
                </div>
              )}
            </div>

            {/* 2. Thông tin Thanh toán (Payment Summary) */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-border/60">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Thanh toán
                </span>
                <Badge variant="outline" className={`text-[11px] font-medium ${paymentStatusCfg?.className}`}>
                  {paymentStatusCfg?.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Cổng / Phương thức:</span>
                <span className="font-medium text-foreground">
                  {providerCfg?.label || detail.payment.provider}
                </span>
              </div>
              {detail.payment.orderCode && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Mã giao dịch PayOS:</span>
                  <span className="font-mono text-foreground font-semibold">
                    #{detail.payment.orderCode}
                  </span>
                </div>
              )}
              {detail.payment.expiresAt && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Hạn thanh toán:</span>
                  <span className="text-foreground">
                    {formatRecordDate(detail.payment.expiresAt)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Mã lần thanh toán (Attempt ID):</span>
                <span className="font-mono text-muted-foreground text-[11px]">
                  #{detail.payment.attemptId}
                </span>
              </div>
            </div>

            {/* 3. Snapshot số dư ví hiện tại */}
            {detail.wallet && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Coins className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <div className="text-xs font-semibold text-emerald-950 dark:text-emerald-300">
                      Số dư ví hiện tại
                    </div>
                    <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                      Tổng số lượt: {detail.wallet.balance}
                    </div>
                  </div>
                </div>
                <div className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                  {detail.wallet.available.toLocaleString("vi-VN")} lượt
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
          {detail?.order.status === "PENDING_PAYMENT" && (
            <>
              {detail.payment.provider === "PAYOS" &&
                detail.payment.status === "PENDING" &&
                detail.payment.checkoutUrl && (
                  <Button
                    onClick={handleResume}
                    className="gap-1.5 font-semibold w-full sm:w-auto"
                  >
                    <ExternalLink className="h-4 w-4" /> Tiếp tục thanh toán
                  </Button>
                )}
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={isCancelling}
                className="gap-1.5 w-full sm:w-auto"
              >
                <Ban className="h-4 w-4" />
                {isCancelling ? "Đang hủy..." : "Hủy đơn hàng"}
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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
  Clock,
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
import { useTranslation } from "react-i18next"
import i18n, { currentIntlLocale } from "@/lib/i18n"

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
  const { t } = useTranslation("credits")
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
          title: t("orderDetail.toast.paidTitle"),
          description: t("ordersTable.toast.alreadyPaidDescription"),
        })
        if (userId) clearStoredPendingPayment(userId)
        window.dispatchEvent(new CustomEvent("credits:refresh"))
      } else if (updated.order.status === "CANCELLED") {
        toast({
          title: t("orderDetail.toast.cancelledTitle"),
          description: t("orderDetail.toast.cancelledDescription"),
        })
        if (userId) clearStoredPendingPayment(userId)
        window.dispatchEvent(new CustomEvent("credits:refresh"))
      }
    } catch (err) {
      const parsed = parseApiError(err)
      toast({
        title: t("orderDetail.toast.cancelFailedTitle"),
        description: parsed.userMessage || t("orderDetail.toast.tryLater"),
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  const handleResume = () => {
    if (!detail?.payment?.checkoutUrl || !detail.payment.checkoutUrl.startsWith("https://")) {
      toast({
        title: t("orderDetail.toast.cannotOpenGatewayTitle"),
        description: t("orderDetail.toast.cannotOpenGatewayDescription"),
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

    window.open(detail.payment.checkoutUrl, "_blank", "noopener,noreferrer")
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
              ? i18n.t("credits:purchase.errors.orderNotFound")
              : parsed.userMessage || i18n.t("credits:orderDetail.loadError")
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

  const isExpired = detail?.payment?.expiresAt
    ? new Date(detail.payment.expiresAt).getTime() <= Date.now()
    : false

  const canResumePayment =
    detail?.order?.status === "PENDING_PAYMENT" &&
    detail?.payment?.provider === "PAYOS" &&
    detail?.payment?.status === "PENDING" &&
    Boolean(detail?.payment?.checkoutUrl && detail.payment.checkoutUrl.startsWith("https://")) &&
    !isExpired

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold w-fit mb-1">
            <FileText className="h-3.5 w-3.5" /> {t("orderDetail.badge")}
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            {orderId ? t("orderDetail.titleWithId", { id: orderId }) : t("orderDetail.title")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("orderDetail.description")}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="space-y-4 py-4">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-danger-200 bg-danger-50/60 p-4 space-y-3 text-center my-2">
            <AlertCircle className="h-8 w-8 text-danger-600 mx-auto" />
            <p className="text-xs text-danger-700">{error}</p>
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
              <RefreshCw className="h-3.5 w-3.5" /> {t("shared.retry")}
            </Button>
          </div>
        )}

        {detail && !loading && (
          <div className="space-y-4 py-1">
            {/* 1. Snapshot Đơn hàng */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-border/60">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-primary" /> {t("orderDetail.orderInfo")}
                </span>
                <Badge className={`text-[11px] font-semibold ${orderStatusCfg?.className}`}>
                  {orderStatusCfg?.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("orderDetail.packageName")}</span>
                <span className="font-semibold text-foreground">{detail.order.packageName}</span>
              </div>
              {detail.order.packageCode && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t("orderDetail.packageCode")}</span>
                  <span className="font-mono text-muted-foreground">{detail.order.packageCode}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("orderDetail.creditsGranted")}</span>
                <span className="font-bold text-success-600">
                  +{formatCreditQuantity(detail.order.creditQuantity)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("orderDetail.totalAmount")}</span>
                <span className="font-extrabold text-foreground">
                  {formatVnd(detail.order.amountVnd)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("orderDetail.createdAt")}</span>
                <span className="text-foreground">{formatRecordDate(detail.order.createdAt)}</span>
              </div>
              {detail.order.paidAt && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t("orderDetail.paidAt")}</span>
                  <span className="text-foreground">{formatRecordDate(detail.order.paidAt)}</span>
                </div>
              )}
            </div>

            {/* 2. Thông tin Thanh toán (Payment Summary) */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-border/60">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary-600" /> {t("orderDetail.payment")}
                </span>
                <Badge variant="outline" className={`text-[11px] font-medium ${paymentStatusCfg?.className}`}>
                  {paymentStatusCfg?.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("orderDetail.gateway")}</span>
                <span className="font-medium text-foreground">
                  {providerCfg?.label || detail.payment.provider}
                </span>
              </div>
              {detail.payment.orderCode && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t("orderDetail.payosOrderCode")}</span>
                  <span className="font-mono text-foreground font-semibold">
                    #{detail.payment.orderCode}
                  </span>
                </div>
              )}
              {detail.payment.expiresAt && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t("orderDetail.expiresAt")}</span>
                  <span className="text-foreground">
                    {formatRecordDate(detail.payment.expiresAt)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("orderDetail.attemptId")}</span>
                <span className="font-mono text-muted-foreground text-[11px]">
                  #{detail.payment.attemptId}
                </span>
              </div>

              {/* Expired note for PENDING_PAYMENT */}
              {detail.order.status === "PENDING_PAYMENT" && isExpired && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-warning-500/10 text-warning-800 text-xs border border-warning-500/20 mt-2">
                  <Clock className="h-4 w-4 shrink-0 text-warning-600" />
                  <span>{t("orderDetail.linkExpired")}</span>
                </div>
              )}
            </div>

            {/* 3. Snapshot số dư ví hiện tại */}
            {detail.wallet && (
              <div className="rounded-xl border border-success-200 bg-success-50/40 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Coins className="h-5 w-5 text-success-600" />
                  <div>
                    <div className="text-xs font-semibold text-success-950">
                      {t("orderDetail.currentBalance")}
                    </div>
                    <div className="text-[11px] text-success-700/80">
                      {t("orderDetail.walletBreakdown", { balance: detail.wallet.balance, reserved: detail.wallet.reserved })}
                    </div>
                  </div>
                </div>
                <div className="text-base font-extrabold text-success-700">
                  {t("quantity.credits", { count: detail.wallet.available, value: detail.wallet.available.toLocaleString(currentIntlLocale()) })}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
          {detail?.order.status === "PENDING_PAYMENT" && (
            <>
              {canResumePayment && (
                <Button
                  onClick={handleResume}
                  className="gap-1.5 font-semibold w-full sm:w-auto"
                >
                  <ExternalLink className="h-4 w-4" /> {t("ordersTable.resumePayment")}
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={isCancelling}
                className="gap-1.5 w-full sm:w-auto"
              >
                <Ban className="h-4 w-4" />
                {isCancelling ? t("orderDetail.cancelling") : t("orderDetail.cancelOrder")}
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            {t("shared.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

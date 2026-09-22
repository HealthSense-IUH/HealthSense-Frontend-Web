import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
  Ban,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/stores/auth-store"
import { creditsApi } from "@/services/credits.service"
import { parseApiError } from "@/lib/errorHandler"
import {
  formatVnd,
  formatCreditQuantity,
  getCreditOrderStatusConfig,
  getCreditPaymentProviderConfig,
  getCreditPaymentStatusConfig,
} from "@/constants/credits"
import {
  getStoredPendingPayment,
  clearStoredPendingPayment,
  saveStoredPendingPayment,
} from "../hooks/use-credit-purchase"
import type { CreditOrderDetail } from "@/types/credits"

const MAX_AUTO_POLL_COUNT = 20 // 20 lần * 3.5s ~ 70 giây
const POLL_INTERVAL_MS = 3500

export default function CreditPaymentResultPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()

  const userSession = useAuthStore((state) => state.userSession)
  const userId = userSession?.userId ? String(userSession.userId) : ""

  const [orderDetail, setOrderDetail] = useState<CreditOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [pollCount, setPollCount] = useState(0)
  const [pollStopped, setPollStopped] = useState(false)

  // Khóa ngăn chuỗi refresh thành công chạy lặp lại nhiều lần
  const hasRefreshedRef = useRef(false)
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 1. Xác định target orderId
  const pendingPayment = userId ? getStoredPendingPayment(userId) : null
  const targetOrderId = pendingPayment?.orderId || searchParams.get("orderId") || null

  // 2. Fetch order chi tiết từ backend (Nguồn chân lý duy nhất)
  const fetchOrder = useCallback(
    async (isBackgroundPoll = false) => {
      if (!targetOrderId) return

      try {
        if (!isBackgroundPoll) {
          setLoading(true)
          setErrorText(null)
        }

        const res = await creditsApi.getOrder(targetOrderId)
        const data = res.data
        setOrderDetail(data)

        // Cập nhật lại checkoutUrl / attempt vào storage nếu có
        if (userId && data.payment && data.order.status === "PENDING_PAYMENT") {
          saveStoredPendingPayment({
            userId,
            orderId: String(data.order.id),
            attemptId: String(data.payment.attemptId),
            packageId: String(data.order.packageId),
            orderCode: data.payment.orderCode,
            checkoutUrl: data.payment.checkoutUrl,
            expiresAt: data.payment.expiresAt,
            createdAt: data.order.createdAt,
          })
        }

        // Khi order đã PAID lần đầu tiên
        if (data.order.status === "PAID" && !hasRefreshedRef.current) {
          hasRefreshedRef.current = true
          if (userId) {
            clearStoredPendingPayment(userId)
          }

          // Phát sự kiện toàn cục làm mới ví
          window.dispatchEvent(new CustomEvent("credits:refresh"))

          toast({
            title: "Thanh toán thành công!",
            description: `Bạn đã được cộng ${data.order.creditQuantity} lượt tư vấn vào ví.`,
          })
        }

        // Nếu đạt trạng thái kết thúc (terminal): dọn dẹp storage
        if (["CANCELLED", "EXPIRED", "REQUIRES_REVIEW"].includes(data.order.status)) {
          if (userId) {
            clearStoredPendingPayment(userId)
          }
        }
      } catch (err) {
        const parsed = parseApiError(err)
        // Lỗi khi poll ngầm không làm đè trạng thái hiện tại thành FAILED
        if (!isBackgroundPoll) {
          setErrorText(parsed.userMessage || "Không thể tải thông tin giao dịch.")
        }
      } finally {
        if (!isBackgroundPoll) {
          setLoading(false)
        }
      }
    },
    [targetOrderId, userId, toast]
  )

  // 3. Khởi chạy fetch ban đầu hoặc điều hướng về orders nếu thiếu thông tin
  useEffect(() => {
    if (!targetOrderId) {
      toast({
        title: "Không tìm thấy giao dịch",
        description: "Vui lòng kiểm tra lại trạng thái trong lịch sử đơn mua.",
      })
      navigate("/app/general/consultations?tab=credits&creditTab=orders", { replace: true })
      return
    }

    void fetchOrder(false)
  }, [targetOrderId, navigate, toast, fetchOrder])

  // 4. Cơ chế Polling tự động khi order đang PENDING_PAYMENT
  useEffect(() => {
    // Chỉ poll khi order đang ở trạng thái PENDING_PAYMENT
    const isPending = orderDetail?.order.status === "PENDING_PAYMENT"

    if (!isPending || pollStopped || !targetOrderId) {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current)
        pollTimerRef.current = null
      }
      return
    }

    // Nếu đã quá số lần poll tối đa -> dừng auto polling
    if (pollCount >= MAX_AUTO_POLL_COUNT) {
      setPollStopped(true)
      return
    }

    // Tạm dừng khi tab bị ẩn
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      return
    }

    pollTimerRef.current = setTimeout(() => {
      setPollCount((prev) => prev + 1)
      void fetchOrder(true)
    }, POLL_INTERVAL_MS)

    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current)
        pollTimerRef.current = null
      }
    }
  }, [orderDetail?.order.status, pollCount, pollStopped, targetOrderId, fetchOrder])

  // Lắng nghe visibilitychange để tiếp tục poll khi user quay lại tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        orderDetail?.order.status === "PENDING_PAYMENT" &&
        !pollStopped
      ) {
        void fetchOrder(true)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [orderDetail?.order.status, pollStopped, fetchOrder])

  // 5. Thao tác Hủy thanh toán
  const handleCancelOrder = async () => {
    if (!targetOrderId || isCancelling) return

    setIsCancelling(true)
    try {
      const res = await creditsApi.cancelOrder(targetOrderId)
      const updated = res.data
      setOrderDetail(updated)

      if (updated.order.status === "PAID") {
        // Webhook thắng race-condition
        toast({
          title: "Thanh toán đã hoàn tất",
          description: "Giao dịch thanh toán đã được ghi nhận trước khi hủy. Lượt đã được cộng vào ví.",
        })
        if (userId) clearStoredPendingPayment(userId)
        window.dispatchEvent(new CustomEvent("credits:refresh"))
      } else if (updated.order.status === "CANCELLED") {
        toast({
          title: "Đã hủy đơn hàng",
          description: "Giao dịch thanh toán đã được hủy an toàn.",
        })
        if (userId) clearStoredPendingPayment(userId)
      } else {
        toast({
          title: "Trạng thái đơn hàng",
          description: `Đơn hàng hiện ở trạng thái: ${updated.order.status}`,
        })
      }
    } catch (err) {
      const parsed = parseApiError(err)
      toast({
        title: "Không thể hủy đơn hàng",
        description: parsed.userMessage || "Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  // 6. Loading state
  if (loading && !orderDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <RefreshCw className="h-10 w-10 text-primary animate-spin mb-4" />
        <h2 className="text-lg font-bold text-foreground mb-1">
          Đang kiểm tra kết quả giao dịch...
        </h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          Hệ thống đang kết nối máy chủ để xác thực trạng thái đơn hàng của bạn.
        </p>
      </div>
    )
  }

  // 7. Error state khi không tải được order
  if (errorText && !orderDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto p-6">
        <XCircle className="h-12 w-12 text-destructive mb-3" />
        <h2 className="text-lg font-bold text-foreground mb-2">Đã xảy ra lỗi</h2>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">{errorText}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => void fetchOrder(false)} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Thử lại
          </Button>
          <Button onClick={() => navigate("/app/general/consultations?tab=credits&creditTab=orders")}>
            <ShoppingBag className="h-4 w-4 mr-1.5" /> Về lịch sử đơn
          </Button>
        </div>
      </div>
    )
  }

  if (!orderDetail) return null

  const { order, payment } = orderDetail
  const orderStatusConfig = getCreditOrderStatusConfig(order.status)
  const paymentStatusConfig = payment?.status
    ? getCreditPaymentStatusConfig(payment.status)
    : null
  const providerConfig = payment?.provider
    ? getCreditPaymentProviderConfig(payment.provider)
    : null

  return (
    <div className="mx-auto max-w-xl py-8 px-4 space-y-6">
      {/* TRẠNG THÁI: PAID */}
      {order.status === "PAID" && (
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Thanh toán thành công!</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Giao dịch nạp lượt đã hoàn tất. Lượt tư vấn đã sẵn sàng trong ví của bạn.
            </p>
          </div>
        </div>
      )}

      {/* TRẠNG THÁI: PENDING_PAYMENT */}
      {order.status === "PENDING_PAYMENT" && (
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <Clock className="h-10 w-10 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {payment?.status === "CREATING"
                ? "Đang khởi tạo liên kết thanh toán..."
                : "Đang chờ thanh toán"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {payment?.status === "CREATING"
                ? "Hệ thống đang kết nối cổng PayOS để chuẩn bị giao dịch. Vui lòng chờ trong giây lát."
                : "Hệ thống đang tự động đồng bộ khi nhận được giao dịch từ PayOS. Bạn không cần thực hiện thêm thao tác nào."}
            </p>
          </div>

          {/* Polling status banner */}
          <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-3.5 py-1.5 rounded-full border border-blue-200/60">
            <RefreshCw className={`h-3.5 w-3.5 ${!pollStopped ? "animate-spin" : ""}`} />
            <span>
              {!pollStopped
                ? "Đang tự động kiểm tra giao dịch..."
                : "Đã tạm dừng tự động kiểm tra"}
            </span>
            {pollStopped && (
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setPollStopped(false)
                  setPollCount(0)
                  void fetchOrder(false)
                }}
                className="h-auto p-0 text-xs font-semibold text-blue-700 underline"
              >
                Kiểm tra lại
              </Button>
            )}
          </div>
        </div>
      )}

      {/* TRẠNG THÁI: CANCELLED */}
      {order.status === "CANCELLED" && (
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
            <XCircle className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Giao dịch đã hủy</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Đơn mua lượt này đã bị hủy. Bạn có thể chọn lại gói để mua lượt mới bất kỳ lúc nào.
            </p>
          </div>
        </div>
      )}

      {/* TRẠNG THÁI: EXPIRED */}
      {order.status === "EXPIRED" && (
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
            <Clock className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Giao dịch đã hết hạn</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Thời gian thanh toán cho đơn hàng đã kết thúc. Vui lòng tạo đơn mua mới nếu bạn vẫn muốn nạp lượt.
            </p>
          </div>
        </div>
      )}

      {/* TRẠNG THÁI: REQUIRES_REVIEW */}
      {order.status === "REQUIRES_REVIEW" && (
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Giao dịch đang được kiểm tra</h1>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Giao dịch đã được ghi nhận nhưng cần nhân viên đối soát thủ công. Lượt tư vấn sẽ được cộng ngay sau khi xác thực hoàn tất.
            </p>
          </div>
        </div>
      )}

      {/* THẺ THÔNG TIN ĐƠN HÀNG */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between text-xs pb-3 border-b border-border/70">
          <span className="text-muted-foreground font-medium">Mã đơn hàng:</span>
          <span className="font-mono font-semibold text-foreground">#{order.id}</span>
        </div>

        {payment?.orderCode && (
          <div className="flex items-center justify-between text-xs pb-3 border-b border-border/70">
            <span className="text-muted-foreground font-medium">Mã giao dịch PayOS:</span>
            <span className="font-mono font-semibold text-foreground">
              #{payment.orderCode}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Tên gói lượt:</span>
          <span className="font-semibold text-foreground">{order.packageName}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Số lượt nhận:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
            +{formatCreditQuantity(order.creditQuantity)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Tổng thanh toán:</span>
          <span className="font-extrabold text-foreground text-sm">
            {formatVnd(order.amountVnd)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Phương thức:</span>
          <span className="font-medium text-foreground">
            {providerConfig?.label || payment?.provider}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-muted-foreground">Trạng thái đơn:</span>
          <Badge className={`text-xs font-semibold ${orderStatusConfig?.className}`}>
            {orderStatusConfig?.label || order.status}
          </Badge>
        </div>

        {payment?.status && (
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-muted-foreground">Trạng thái thanh toán:</span>
            <Badge className={`text-xs font-medium ${paymentStatusConfig?.className}`}>
              {paymentStatusConfig?.label || payment.status}
            </Badge>
          </div>
        )}
      </div>

      {/* CÁC NÚT ĐIỀU HƯỚNG & HÀNH ĐỘNG */}
      <div className="space-y-2.5 pt-2">
        {/* Nút hành động khi PENDING_PAYMENT */}
        {order.status === "PENDING_PAYMENT" && (
          <>
            {payment?.checkoutUrl && payment.checkoutUrl.startsWith("https://") && (
              <Button
                className="w-full gap-2 font-semibold shadow-xs"
                onClick={() => {
                  window.location.assign(payment.checkoutUrl!)
                }}
              >
                <ExternalLink className="h-4 w-4" /> Mở trang thanh toán PayOS
              </Button>
            )}

            <div className="flex gap-2.5">
              <Button
                variant="outline"
                className="flex-1 gap-1.5"
                onClick={() => void fetchOrder(false)}
              >
                <RefreshCw className="h-4 w-4" /> Kiểm tra lại
              </Button>
              <Button
                variant="destructive"
                className="flex-1 gap-1.5"
                onClick={handleCancelOrder}
                disabled={isCancelling}
              >
                <Ban className="h-4 w-4" />
                {isCancelling ? "Đang hủy..." : "Hủy thanh toán"}
              </Button>
            </div>
          </>
        )}

        {/* Nút quay lại khi đã PAID / CANCELLED / EXPIRED / REVIEW */}
        {order.status !== "PENDING_PAYMENT" && (
          <div className="flex flex-col sm:flex-row gap-2.5">
            <Button
              className="flex-1 gap-1.5 font-semibold"
              onClick={() => navigate("/app/general/consultations?tab=credits")}
            >
              <ArrowLeft className="h-4 w-4" /> Về ví lượt tư vấn
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={() => navigate("/app/general/consultations?tab=credits&creditTab=orders")}
            >
              <ShoppingBag className="h-4 w-4" /> Xem lịch sử đơn mua
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

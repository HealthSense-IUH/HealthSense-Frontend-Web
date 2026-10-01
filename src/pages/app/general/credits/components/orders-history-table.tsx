import { useState } from "react"
import {
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Loader2,
  FilterX,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/stores/auth-store"
import { creditsApi } from "@/services/credits.service"
import { parseApiError } from "@/lib/errorHandler"
import { formatRecordDate } from "@/lib/formatters"
import { formatVnd, formatCreditQuantity, getCreditOrderStatusConfig } from "@/constants/credits"
import { saveStoredPendingPayment } from "../hooks/use-credit-purchase"
import type { PageResponse } from "@/types/base"
import type { CreditOrderSummary } from "@/types/credits"

interface OrdersHistoryTableProps {
  ordersData: PageResponse<CreditOrderSummary> | null
  loading: boolean
  error: string | null
  page: number
  onPageChange: (newPage: number) => void
  onViewDetail: (orderId: string) => void
  onRetry: () => void
  isFiltered?: boolean
  onResetFilters?: () => void
}

export function OrdersHistoryTable({
  ordersData,
  loading,
  error,
  page,
  onPageChange,
  onViewDetail,
  onRetry,
  isFiltered = false,
  onResetFilters,
}: OrdersHistoryTableProps) {
  const { toast } = useToast()
  const userSession = useAuthStore((state) => state.userSession)
  const userId = userSession?.userId ? String(userSession.userId) : ""
  const [resumingOrderId, setResumingOrderId] = useState<string | null>(null)

  const handleResumePayment = async (orderId: string) => {
    if (resumingOrderId) return
    setResumingOrderId(orderId)

    try {
      // 1. Fetch on-demand detail
      const res = await creditsApi.getOrderById(orderId)
      const data = res.data

      // 2. Kiểm tra nếu đã PAID
      if (data.order.status === "PAID") {
        window.dispatchEvent(new CustomEvent("credits:refresh"))
        toast({
          title: "Đơn hàng đã thanh toán",
          description: "Giao dịch đã được ghi nhận trước đó. Lượt đã được cộng vào ví.",
        })
        return
      }

      // 3. Kiểm tra nếu order không còn PENDING_PAYMENT
      if (data.order.status !== "PENDING_PAYMENT") {
        toast({
          title: "Đơn hàng không thể thanh toán",
          description: `Đơn hàng đang ở trạng thái: ${data.order.status}.`,
        })
        return
      }

      // 4. Kiểm tra hết hạn link
      const payment = data.payment
      const isExpired = payment?.expiresAt
        ? new Date(payment.expiresAt).getTime() <= Date.now()
        : false

      if (isExpired) {
        toast({
          title: "Liên kết thanh toán đã hết hạn",
          description: "Liên kết thanh toán PayOS đã hết hạn. Vui lòng tạo đơn mua mới.",
          variant: "destructive",
        })
        return
      }

      // 5. Kiểm tra nếu payment đang CREATING
      if (payment?.status === "CREATING") {
        toast({
          title: "Đang khởi tạo liên kết",
          description: "Liên kết thanh toán đang được khởi tạo bởi PayOS. Vui lòng thử lại sau vài giây.",
        })
        return
      }

      // 6. Nếu là PAYOS và có checkoutUrl HTTPS hợp lệ và chưa hết hạn
      if (
        payment?.provider === "PAYOS" &&
        payment?.status === "PENDING" &&
        payment.checkoutUrl &&
        payment.checkoutUrl.startsWith("https://")
      ) {
        if (userId) {
          saveStoredPendingPayment({
            userId,
            orderId: String(data.order.id),
            attemptId: String(payment.attemptId),
            packageId: String(data.order.packageId),
            orderCode: payment.orderCode,
            checkoutUrl: payment.checkoutUrl,
            expiresAt: payment.expiresAt,
            createdAt: data.order.createdAt,
          })
        }
        // Mở tab mới với noopener,noreferrer theo yêu cầu
        window.open(payment.checkoutUrl, "_blank", "noopener,noreferrer")
        return
      }

      toast({
        title: "Không thể lấy link thanh toán",
        description: "Vui lòng mở xem chi tiết đơn hàng để kiểm tra.",
        variant: "destructive",
      })
    } catch (err) {
      const parsed = parseApiError(err)
      toast({
        title: "Lỗi kết nối",
        description: parsed.userMessage || "Không thể kiểm tra đơn hàng. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setResumingOrderId(null)
    }
  }

  if (loading && !ordersData) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-xl" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (error && !ordersData) {
    return (
      <Card className="border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20 p-8 text-center rounded-2xl">
        <div className="max-w-md mx-auto space-y-3">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto" />
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
            Không thể tải lịch sử đơn mua
          </h3>
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5 mt-2">
            <RefreshCw className="h-3.5 w-3.5" /> Thử lại
          </Button>
        </div>
      </Card>
    )
  }

  const content = ordersData?.content ?? []
  const totalPages = ordersData?.totalPages ?? 0
  const totalElements = ordersData?.totalElements ?? 0

  if (content.length === 0) {
    if (isFiltered) {
      return (
        <Card className="border-dashed border-border p-12 text-center rounded-2xl">
          <div className="max-w-md mx-auto space-y-3">
            <FilterX className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <h3 className="text-base font-semibold text-foreground">
              Không tìm thấy đơn mua phù hợp
            </h3>
            <p className="text-xs text-muted-foreground">
              Không có đơn mua nào thỏa mãn bộ lọc ngày hoặc trạng thái đang chọn.
            </p>
            {onResetFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onResetFilters}
                className="gap-1.5 mt-2 text-xs"
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </Card>
      )
    }

    return (
      <Card className="border-dashed border-border p-12 text-center rounded-2xl">
        <div className="max-w-md mx-auto space-y-3">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <h3 className="text-base font-semibold text-foreground">
            Chưa có đơn mua lượt nào
          </h3>
          <p className="text-xs text-muted-foreground">
            Khi bạn mua các gói lượt tư vấn, thông tin các đơn hàng sẽ được lưu vết đầy đủ tại đây.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[180px] text-xs font-semibold">Mã đơn hàng</TableHead>
              <TableHead className="text-xs font-semibold">Gói lượt đã mua</TableHead>
              <TableHead className="text-xs font-semibold">Số lượt</TableHead>
              <TableHead className="text-xs font-semibold">Tổng tiền</TableHead>
              <TableHead className="text-xs font-semibold">Thời gian tạo</TableHead>
              <TableHead className="text-xs font-semibold">Trạng thái</TableHead>
              <TableHead className="text-right text-xs font-semibold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {content.map((order) => {
              const statusCfg = getCreditOrderStatusConfig(order.status)
              return (
                <TableRow key={order.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs font-semibold text-foreground">
                    #{order.id}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="font-medium text-xs text-foreground line-clamp-1">
                        {order.packageName}
                      </div>
                      {order.packageCode && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {order.packageCode}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    +{formatCreditQuantity(order.creditQuantity)}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-foreground">
                    {formatVnd(order.amountVnd)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatRecordDate(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[11px] font-medium ${statusCfg.className}`}>
                      {statusCfg.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {order.status === "PENDING_PAYMENT" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleResumePayment(order.id)}
                          disabled={resumingOrderId === order.id}
                          className="h-8 text-xs gap-1.5 font-semibold text-primary border-primary/30 hover:bg-primary/10"
                        >
                          {resumingOrderId === order.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ExternalLink className="h-3.5 w-3.5" />
                          )}
                          Tiếp tục thanh toán
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetail(order.id)}
                        className="h-8 text-xs gap-1.5 hover:bg-primary/10 hover:text-primary"
                      >
                        <Eye className="h-3.5 w-3.5" /> Chi tiết
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 pt-1 text-xs text-muted-foreground">
          <div>
            Trang <span className="font-semibold text-foreground">{page}</span> / {Math.max(1, totalPages)} (Tổng {totalElements.toLocaleString("vi-VN")} đơn)
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1 || loading}
                className="h-8 px-2.5 gap-1 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages || loading}
                className="h-8 px-2.5 gap-1 text-xs"
              >
                Sau <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

import { useState } from "react"
import {
  Check,
  Coins,
  Copy,
  CreditCard,
  Receipt,
  RefreshCw,
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
import {
  formatDateTime,
  formatVndPrice,
  getCreditOrderStatusConfig,
  getCreditPaymentProviderConfig,
  getCreditPaymentStatusConfig,
} from "@/constants/credits"
import type { AdminCreditOrderDetail } from "@/types/credits"
import { useToast } from "@/hooks/use-toast"

interface PaymentOrderDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderDetail: AdminCreditOrderDetail | null
  loading: boolean
  error?: string | null
}

export function PaymentOrderDetailDialog({
  open,
  onOpenChange,
  orderDetail,
  loading,
  error,
}: PaymentOrderDetailDialogProps) {
  const { toast } = useToast()
  const [copiedUrl, setCopiedUrl] = useState(false)

  const handleCopyCheckoutUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(true)
      toast({
        title: "Đã sao chép link thanh toán",
        description: "Link checkout đã được lưu vào bộ nhớ tạm.",
      })
      setTimeout(() => setCopiedUrl(false), 2000)
    } catch {
      toast({
        variant: "destructive",
        title: "Lỗi sao chép",
        description: "Không thể tự động sao chép link.",
      })
    }
  }

  const order = orderDetail?.order
  const attempts = orderDetail?.attempts || []
  const orderStatusConfig = order ? getCreditOrderStatusConfig(order.status) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] flex flex-col p-0 rounded-2xl overflow-hidden shadow-2xl">
        <DialogHeader className="p-5 pb-4 border-b bg-muted/20">
          <div className="flex items-center gap-2 text-primary">
            <Receipt className="w-5 h-5" />
            <DialogTitle className="text-lg font-bold text-foreground">
              Chi tiết đơn mua token
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            {order ? (
              <>
                Mã đơn: <span className="font-mono font-semibold text-primary">#{order.id}</span>
                {" • "}
                Thành viên: <span className="font-mono font-semibold text-foreground">#{orderDetail.memberId}</span>
              </>
            ) : (
              "Tra cứu thông tin gói và các lần thử thanh toán"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {loading ? (
            <div className="py-14 text-center text-xs text-muted-foreground">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
              Đang tải chi tiết đơn hàng và payment attempts...
            </div>
          ) : error ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-sm font-semibold text-destructive">{error}</p>
              <p className="text-xs text-muted-foreground">
                Đơn hàng có thể không còn tồn tại hoặc thông tin truy vấn chưa chính xác.
              </p>
            </div>
          ) : order ? (
            <>
              {/* Order Snapshot Box */}
              <div className="p-4 rounded-xl border bg-muted/20 space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-primary" />
                    Thông tin đơn hàng
                  </span>
                  {orderStatusConfig && (
                    <Badge variant="outline" className={`text-xs font-semibold ${orderStatusConfig.className}`}>
                      {orderStatusConfig.label}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Gói lượt tư vấn:</span>
                    <span className="font-semibold text-foreground">
                      {order.packageName}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground ml-1.5">
                      ({order.packageCode})
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">Số lượng token:</span>
                    <span className="font-mono font-bold text-primary text-sm flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      +{order.creditQuantity} lượt
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">Số tiền thanh toán:</span>
                    <span className="font-mono font-bold text-success-600 text-sm">
                      {formatVndPrice(order.amountVnd)}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">Thời gian tạo:</span>
                    <span className="font-mono text-muted-foreground">
                      {formatDateTime(order.createdAt)}
                    </span>
                  </div>

                  {order.paidAt && (
                    <div className="sm:col-span-2 pt-1 border-t">
                      <span className="text-muted-foreground text-[11px] mr-2">Thời điểm thanh toán (paidAt):</span>
                      <span className="font-mono font-semibold text-success-600">
                        {formatDateTime(order.paidAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Attempts List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Lịch sử cổng thanh toán ({attempts.length} lần thử)
                  </h4>
                  <span className="text-[11px] text-muted-foreground italic">
                    Xếp theo thứ tự lần thử
                  </span>
                </div>

                {attempts.length === 0 ? (
                  <div className="p-4 text-center rounded-xl border border-dashed text-xs text-muted-foreground">
                    Đơn chưa có lần thanh toán nào được ghi nhận.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {attempts.map((attempt, index) => {
                      const pStatusConfig = getCreditPaymentStatusConfig(attempt.status)
                      const providerConfig = getCreditPaymentProviderConfig(attempt.provider)

                      return (
                        <div
                          key={attempt.attemptId}
                          className="p-3.5 rounded-xl border bg-background text-xs space-y-2 hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="font-bold text-[11px]">
                                Lần {index + 1}
                              </Badge>
                              <span className="font-mono font-semibold text-foreground">
                                #{attempt.attemptId}
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-[11px] font-medium ${pStatusConfig.className}`}
                            >
                              {pStatusConfig.label}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1">
                            <div>
                              <span>Cổng thanh toán: </span>
                              <span className="font-medium text-foreground">
                                {providerConfig.label}
                              </span>
                            </div>

                            {attempt.orderCode && (
                              <div>
                                <span>Mã OrderCode: </span>
                                <span className="font-mono text-foreground font-semibold">
                                  {attempt.orderCode}
                                </span>
                              </div>
                            )}

                            {attempt.paymentLinkId && (
                              <div className="sm:col-span-2">
                                <span>Payment Link ID: </span>
                                <span className="font-mono text-muted-foreground">
                                  {attempt.paymentLinkId}
                                </span>
                              </div>
                            )}

                            {attempt.expiresAt && (
                              <div className="sm:col-span-2">
                                <span>Hết hạn: </span>
                                <span className="font-mono text-muted-foreground">
                                  {formatDateTime(attempt.expiresAt)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Read-only / Copyable Checkout URL (no payment action) */}
                          {attempt.checkoutUrl && (
                            <div className="mt-2 pt-2 border-t flex items-center justify-between gap-2 bg-muted/40 p-2 rounded-lg">
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                                  Link thanh toán (Tra cứu / Hỗ trợ):
                                </span>
                                <span className="font-mono text-[11px] text-foreground truncate block">
                                  {attempt.checkoutUrl}
                                </span>
                              </div>

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyCheckoutUrl(attempt.checkoutUrl!)}
                                className="h-7 px-2 text-[11px] gap-1 shrink-0 rounded-lg"
                              >
                                {copiedUrl ? (
                                  <>
                                    <Check className="w-3 h-3 text-success-600" />
                                    Đã chép
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    Sao chép
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        <DialogFooter className="p-4 border-t bg-muted/10">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl h-9 text-xs"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

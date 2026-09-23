import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import {
  Coins,
  CreditCard,
  Eye,
  RefreshCw,
  Search,
  User,
} from "lucide-react"

import { CreditPackagesTab } from "./components/credit-packages-tab"
import { MemberWalletDirectoryTab } from "./components/member-wallet-directory-tab"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { parseApiError } from "@/lib/errorHandler"
import { creditsApi } from "@/services/credits.service"
import {
  CREDIT_ORDER_STATUS_CONFIG,
  CREDIT_PAYMENT_PROVIDER_CONFIG,
  CREDIT_PAYMENT_STATUS_CONFIG,
  formatVndPrice,
} from "@/constants/credits"
import type {
  AdminCreditOrderDetail,
  AdminCreditOrderSummary,
  CreditOrderStatus,
  CreditPaymentProvider,
} from "@/types/credits"

export default function AdminCreditOperationsPage() {
  const { toast } = useToast()

  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get("tab")
  const activeTab =
    tabParam === "wallet" || tabParam === "orders" ? tabParam : "packages"

  /* =========================================================================
   * TAB 2: Orders & Payment Attempts
   * ========================================================================= */
  const [orders, setOrders] = useState<AdminCreditOrderSummary[]>([])
  const [ordersPage, setOrdersPage] = useState(1)
  const [ordersTotalPages, setOrdersTotalPages] = useState(1)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [orderMemberFilter, setOrderMemberFilter] = useState("")
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL")
  const [orderProviderFilter, setOrderProviderFilter] = useState<string>("ALL")

  // Order detail dialog
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<AdminCreditOrderDetail | null>(
    null
  )
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false)
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false)

  const loadAdminOrders = useCallback(
    async (page = 1) => {
      setLoadingOrders(true)
      try {
        const res = await creditsApi.adminGetOrders({
          page,
          size: 10,
          memberId: orderMemberFilter.trim() || undefined,
          status:
            orderStatusFilter !== "ALL"
              ? (orderStatusFilter as CreditOrderStatus)
              : undefined,
          provider:
            orderProviderFilter !== "ALL"
              ? (orderProviderFilter as CreditPaymentProvider)
              : undefined,
        })
        setOrders(res.data.content || [])
        setOrdersPage(res.data.page || page)
        setOrdersTotalPages(res.data.totalPages || 1)
      } catch (err) {
        const parsed = parseApiError(err)
        toast({
          variant: "destructive",
          title: "Lỗi tải đơn mua",
          description: parsed.userMessage || "Không thể tải danh sách đơn mua.",
        })
      } finally {
        setLoadingOrders(false)
      }
    },
    [orderMemberFilter, orderStatusFilter, orderProviderFilter, toast]
  )

  const handleOpenOrderDetail = async (orderId: string) => {
    setLoadingOrderDetail(true)
    setIsOrderDetailOpen(true)
    try {
      const res = await creditsApi.adminGetOrderDetail(orderId)
      setSelectedOrderDetail(res.data)
    } catch (err) {
      const parsed = parseApiError(err)
      toast({
        variant: "destructive",
        title: "Lỗi tải chi tiết đơn",
        description: parsed.userMessage || "Không thể tải chi tiết đơn hàng.",
      })
      setIsOrderDetailOpen(false)
    } finally {
      setLoadingOrderDetail(false)
    }
  }

  // Load active tab data on mount or tab change
  useEffect(() => {
    if (activeTab === "orders" && orders.length === 0) {
      void loadAdminOrders(1)
    }
  }, [activeTab, loadAdminOrders, orders.length])

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Coins className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Quản lý Lượt tư vấn
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý gói lượt, tra cứu ví thành viên, điều chỉnh delta và kiểm tra đơn mua lượt tư vấn.
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setSearchParams({ tab: val })}
        className="w-full space-y-6"
      >
        <TabsList className="grid grid-cols-3 max-w-xl w-full h-auto p-1 bg-muted/60 rounded-2xl">
          <TabsTrigger
            value="packages"
            className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1.5"
          >
            <Coins className="w-4 h-4" />
            Gói lượt tư vấn
          </TabsTrigger>
          <TabsTrigger
            value="wallet"
            className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1.5"
          >
            <User className="w-4 h-4" />
            Ví & Điều chỉnh
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1.5"
          >
            <CreditCard className="w-4 h-4" />
            Đơn mua & Attempts
          </TabsTrigger>
        </TabsList>

        {/* =========================================================================
         * TAB 1: Credit Packages Catalog
         * ========================================================================= */}
        <TabsContent value="packages" className="space-y-6 m-0">
          <CreditPackagesTab />
        </TabsContent>

        {/* =========================================================================
         * TAB 2: Member Wallet Directory & Ledger & Manual Adjustment
         * ========================================================================= */}
        <TabsContent value="wallet" className="space-y-6 m-0">
          <MemberWalletDirectoryTab />
        </TabsContent>

        {/* =========================================================================
         * TAB 2: Orders & Payment Attempts
         * ========================================================================= */}
        <TabsContent value="orders" className="space-y-6 m-0">
          <Card className="rounded-2xl border shadow-xs">
            <CardHeader className="pb-4 border-b">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="text-base font-bold">Danh sách đơn mua lượt</CardTitle>
                  <CardDescription className="text-xs">
                    Tra cứu toàn bộ đơn mua lượt và các lần thử thanh toán (payment attempts)
                  </CardDescription>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                  <div className="relative w-full sm:w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Lọc theo Member ID..."
                      value={orderMemberFilter}
                      onChange={(e) => setOrderMemberFilter(e.target.value)}
                      className="pl-8 h-8 rounded-xl text-xs"
                    />
                  </div>

                  <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                    <SelectTrigger className="w-[140px] h-8 rounded-xl text-xs">
                      <SelectValue placeholder="Trạng thái đơn" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl text-xs">
                      <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                      <SelectItem value="PAID">Đã thanh toán (PAID)</SelectItem>
                      <SelectItem value="PENDING_PAYMENT">Chờ thanh toán</SelectItem>
                      <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                      <SelectItem value="EXPIRED">Đã hết hạn</SelectItem>
                      <SelectItem value="REQUIRES_REVIEW">Cần xem xét</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={orderProviderFilter} onValueChange={setOrderProviderFilter}>
                    <SelectTrigger className="w-[120px] h-8 rounded-xl text-xs">
                      <SelectValue placeholder="Cổng TT" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl text-xs">
                      <SelectItem value="ALL">Tất cả cổng</SelectItem>
                      <SelectItem value="MOCK">MOCK</SelectItem>
                      <SelectItem value="PAYOS">PayOS</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void loadAdminOrders(1)}
                    disabled={loadingOrders}
                    className="h-8 rounded-xl text-xs gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? "animate-spin" : ""}`} />
                    Lọc
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs font-semibold">Mã đơn hàng</TableHead>
                      <TableHead className="text-xs font-semibold">Thành viên</TableHead>
                      <TableHead className="text-xs font-semibold">Gói lượt</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Số lượt</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Số tiền</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Trạng thái</TableHead>
                      <TableHead className="text-xs font-semibold">Thời gian tạo</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingOrders ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-36 text-center text-xs text-muted-foreground">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                          Đang tải danh sách đơn hàng...
                        </TableCell>
                      </TableRow>
                    ) : orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-36 text-center text-xs text-muted-foreground">
                          Không tìm thấy đơn mua lượt nào phù hợp.
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((ord) => {
                        const statusConfig = CREDIT_ORDER_STATUS_CONFIG[ord.status] || {
                          label: ord.status,
                          className: "bg-muted text-muted-foreground",
                        }
                        return (
                          <TableRow key={ord.id} className="hover:bg-muted/20">
                            <TableCell className="font-mono text-xs font-semibold text-primary">
                              #{ord.id}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {ord.memberId ? `#${ord.memberId}` : "—"}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-xs text-foreground">
                                {ord.packageName}
                              </div>
                              <div className="font-mono text-[11px] text-muted-foreground">
                                {ord.packageCode}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-mono font-bold text-xs text-primary">
                              +{ord.creditQuantity}
                            </TableCell>
                            <TableCell className="text-right font-mono font-semibold text-xs">
                              {formatVndPrice(ord.amountVnd)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className={`text-xs font-medium ${statusConfig.className}`}
                              >
                                {statusConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(ord.createdAt).toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => void handleOpenOrderDetail(ord.id)}
                                className="h-8 px-2 text-xs gap-1 hover:text-primary rounded-lg"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Chi tiết
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>

            {ordersTotalPages > 1 && (
              <div className="flex items-center justify-between p-3 border-t text-xs">
                <span className="text-muted-foreground">
                  Trang {ordersPage} / {ordersTotalPages}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={ordersPage <= 1 || loadingOrders}
                    onClick={() => void loadAdminOrders(ordersPage - 1)}
                    className="h-7 text-xs rounded-lg"
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={ordersPage >= ordersTotalPages || loadingOrders}
                    onClick={() => void loadAdminOrders(ordersPage + 1)}
                    className="h-7 text-xs rounded-lg"
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Order Detail Modal */}
          <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
            <DialogContent className="sm:max-w-[550px] rounded-2xl">
              <DialogHeader>
                <div className="flex items-center gap-2 text-primary">
                  <CreditCard className="w-5 h-5" />
                  <DialogTitle className="text-lg font-bold">Chi tiết đơn mua lượt</DialogTitle>
                </div>
                <DialogDescription className="text-xs">
                  Mã đơn #{selectedOrderDetail?.order?.id} • Thành viên #{selectedOrderDetail?.memberId}
                </DialogDescription>
              </DialogHeader>

              {loadingOrderDetail ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                  Đang tải thông tin chi tiết đơn...
                </div>
              ) : selectedOrderDetail ? (
                <div className="space-y-4 py-2">
                  {/* Order summary box */}
                  <div className="p-3 bg-muted/30 rounded-xl border text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gói lượt:</span>
                      <span className="font-semibold text-foreground">
                        {selectedOrderDetail.order.packageName} ({selectedOrderDetail.order.packageCode})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số lượt:</span>
                      <span className="font-mono font-bold text-primary">
                        +{selectedOrderDetail.order.creditQuantity} lượt
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số tiền thanh toán:</span>
                      <span className="font-mono font-bold text-foreground">
                        {formatVndPrice(selectedOrderDetail.order.amountVnd)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-1.5">
                      <span className="text-muted-foreground">Trạng thái đơn:</span>
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium ${
                          CREDIT_ORDER_STATUS_CONFIG[selectedOrderDetail.order.status]?.className
                        }`}
                      >
                        {CREDIT_ORDER_STATUS_CONFIG[selectedOrderDetail.order.status]?.label}
                      </Badge>
                    </div>
                    {selectedOrderDetail.order.paidAt && (
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Thời gian thanh toán:</span>
                        <span>
                          {new Date(selectedOrderDetail.order.paidAt).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Payment Attempts Section */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Lịch sử cổng thanh toán ({selectedOrderDetail.attempts?.length || 0} lần thử)
                    </h4>
                    {selectedOrderDetail.attempts && selectedOrderDetail.attempts.length > 0 ? (
                      <div className="space-y-2">
                        {selectedOrderDetail.attempts.map((attempt) => {
                          const pConfig = CREDIT_PAYMENT_STATUS_CONFIG[attempt.status] || {
                            label: attempt.status,
                            className: "bg-muted text-muted-foreground",
                          }
                          const providerConfig = CREDIT_PAYMENT_PROVIDER_CONFIG[attempt.provider]
                          return (
                            <div
                              key={attempt.attemptId}
                              className="p-3 bg-background rounded-xl border text-xs space-y-1"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-mono font-bold text-foreground">
                                  #{attempt.attemptId}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-[11px] font-medium ${pConfig.className}`}
                                >
                                  {pConfig.label}
                                </Badge>
                              </div>
                              <div className="flex justify-between text-[11px] text-muted-foreground">
                                <span>Cổng thanh toán:</span>
                                <span className="font-medium text-foreground">
                                  {providerConfig?.label || attempt.provider}
                                </span>
                              </div>
                              {attempt.expiresAt && (
                                <div className="flex justify-between text-[11px] text-muted-foreground">
                                  <span>Hạn thanh toán:</span>
                                  <span>{new Date(attempt.expiresAt).toLocaleString("vi-VN")}</span>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Chưa có lần thử thanh toán nào được tạo.
                      </p>
                    )}
                  </div>
                </div>
              ) : null}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOrderDetailOpen(false)}
                  className="rounded-xl"
                >
                  Đóng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  )
}

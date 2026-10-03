import { useCallback, useEffect, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Inbox,
  RefreshCw,
  SlidersHorizontal,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { parseApiError } from "@/lib/errorHandler"
import { creditsApi } from "@/services/credits.service"
import {
  formatCreditQuantity,
  formatDateTime,
  formatVndPrice,
  getCreditOrderStatusConfig,
} from "@/constants/credits"
import type {
  AdminCreditOrderDetail,
  AdminCreditOrderSummary,
  AdminMemberCreditSummary,
  CreditOrderStatus,
} from "@/types/credits"
import { PaymentOrderDetailDialog } from "./payment-order-detail-dialog"
import { Trans, useTranslation } from "react-i18next"
import i18n from "@/lib/i18n"

interface MemberTransactionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: AdminMemberCreditSummary | null
}

export function MemberTransactionsDialog({
  open,
  onOpenChange,
  member,
}: MemberTransactionsDialogProps) {
  const { t } = useTranslation("credits")
  const { toast } = useToast()

  const [orders, setOrders] = useState<AdminCreditOrderSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(5)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalElements, setTotalElements] = useState<number>(0)

  // Order Detail modal state
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<AdminCreditOrderDetail | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  const fetchOrders = useCallback(
    async (mId: string, targetPage: number, targetSize: number, targetStatus: string) => {
      setLoading(true)
      try {
        const res = await creditsApi.adminGetOrders({
          memberId: mId,
          page: targetPage,
          size: targetSize,
          status: targetStatus !== "ALL" ? (targetStatus as CreditOrderStatus) : undefined,
        })
        const data = res.data
        setOrders(data.content || [])
        setTotalPages(data.totalPages || 1)
        setTotalElements(data.totalElements || 0)
      } catch (err) {
        const parsed = parseApiError(err)
        toast({
          variant: "destructive",
          title: i18n.t("credits:admin.memberTransactions.errors.loadTitle"),
          description: parsed.userMessage || i18n.t("credits:admin.memberTransactions.errors.load"),
        })
      } finally {
        setLoading(false)
      }
    },
    [toast]
  )

  // Reload when modal opens or member / page / pageSize / status changes
  useEffect(() => {
    if (open && member?.memberId) {
      void fetchOrders(member.memberId, page, pageSize, statusFilter)
    }
  }, [open, member?.memberId, page, pageSize, statusFilter, fetchOrders])

  // Reset page when filter or member changes
  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus)
    setPage(1)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return
    setPage(newPage)
  }

  // Handle open single order detail
  const handleViewOrderDetail = async (orderId: string) => {
    setIsDetailOpen(true)
    setLoadingDetail(true)
    setDetailError(null)
    setSelectedOrderDetail(null)
    try {
      const res = await creditsApi.adminGetOrderDetail(orderId)
      setSelectedOrderDetail(res.data)
    } catch (err) {
      const parsed = parseApiError(err)
      setDetailError(parsed.userMessage || t("admin.memberTransactions.errors.detail"))
    } finally {
      setLoadingDetail(false)
    }
  }

  const getPageNumbers = () => {
    const pages: (number | "...")[] = []
    const total = Math.max(1, totalPages)
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push("...")
      const start = Math.max(2, page - 1)
      const end = Math.min(total - 1, page + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (page < total - 2) pages.push("...")
      pages.push(total)
    }
    return pages
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl">
          {/* Header */}
          <DialogHeader className="px-6 pt-5 pb-4 border-b bg-muted/20">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-10 w-10 shrink-0 border border-primary/20">
                {member?.avatarUrl && (
                  <AvatarImage src={member.avatarUrl} alt={member.displayName} />
                )}
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {member?.displayName?.slice(0, 2).toUpperCase() || "MB"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold flex items-center gap-2 truncate">
                  <span>{t("admin.memberTransactions.title")}</span>
                  <Badge variant="outline" className="font-mono text-[11px] font-normal">
                    #{member?.memberId}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground truncate">
                  {member?.displayName} &bull; {member?.email}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Subheader / Filter Bar */}
          <div className="px-6 py-3 border-b flex flex-wrap items-center justify-between gap-2.5 bg-background">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-[160px] h-8 rounded-xl text-xs">
                  <SelectValue placeholder={t("admin.ordersTable.statusPlaceholder")} />
                </SelectTrigger>
                <SelectContent className="rounded-xl text-xs">
                  <SelectItem value="ALL">{t("filters.allStatuses")}</SelectItem>
                  <SelectItem value="PAID">{t("admin.ordersTable.statusOptions.paid")}</SelectItem>
                  <SelectItem value="PENDING">{t("admin.memberTransactions.statusOptions.pending")}</SelectItem>
                  <SelectItem value="CANCELLED">{t("admin.memberTransactions.statusOptions.cancelled")}</SelectItem>
                  <SelectItem value="EXPIRED">{t("admin.memberTransactions.statusOptions.expired")}</SelectItem>
                  <SelectItem value="FAILED">{t("admin.memberTransactions.statusOptions.failed")}</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (member?.memberId) {
                    void fetchOrders(member.memberId, page, pageSize, statusFilter)
                  }
                }}
                disabled={loading}
                className="h-8 rounded-xl text-xs px-2.5"
                title={t("admin.memberTransactions.reloadTitle")}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <Trans
                t={t}
                i18nKey="admin.memberTransactions.found"
                count={totalElements}
                values={{ count: totalElements }}
                components={{ strong: <strong className="text-foreground font-semibold" /> }}
              />
            </div>
          </div>

          {/* Content / Table */}
          <div className="flex-1 overflow-y-auto p-0 min-h-[260px]">
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                <span>{t("admin.ordersTable.loading")}</span>
              </div>
            ) : orders.length === 0 ? (
              /* Empty State */
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 gap-2.5">
                <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-1">
                  <Inbox className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {t("admin.memberTransactions.emptyTitle")}
                </div>
                <p className="text-xs text-muted-foreground max-w-sm">
                  {statusFilter !== "ALL"
                    ? t("admin.memberTransactions.emptyFiltered")
                    : t("admin.memberTransactions.emptyAll")}
                </p>
                {statusFilter !== "ALL" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusFilterChange("ALL")}
                    className="h-8 rounded-xl text-xs mt-1"
                  >
                    {t("admin.memberTransactions.viewAllStatuses")}
                  </Button>
                )}
              </div>
            ) : (
              /* Transaction Table */
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs font-semibold whitespace-nowrap min-w-[160px]">{t("admin.ordersTable.columns.orderId")}</TableHead>
                      <TableHead className="text-xs font-semibold whitespace-nowrap min-w-[200px]">{t("admin.memberTransactions.columns.package")}</TableHead>
                      <TableHead className="text-xs font-semibold text-center whitespace-nowrap min-w-[110px]">{t("admin.memberTransactions.columns.quantity")}</TableHead>
                      <TableHead className="text-xs font-semibold text-right whitespace-nowrap min-w-[120px]">{t("admin.ordersTable.columns.amount")}</TableHead>
                      <TableHead className="text-xs font-semibold text-center whitespace-nowrap min-w-[130px]">{t("admin.ordersTable.columns.status")}</TableHead>
                      <TableHead className="text-xs font-semibold whitespace-nowrap min-w-[190px]">{t("admin.memberTransactions.columns.time")}</TableHead>
                      <TableHead className="text-xs font-semibold text-right whitespace-nowrap min-w-[90px]">{t("admin.ordersTable.columns.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((ord) => {
                      const statusConfig = getCreditOrderStatusConfig(ord.status)

                      return (
                        <TableRow key={ord.id} className="hover:bg-muted/20">
                          {/* Order ID */}
                          <TableCell className="font-mono text-xs font-bold text-primary whitespace-nowrap">
                            #{ord.id}
                          </TableCell>

                          {/* Package */}
                          <TableCell className="whitespace-nowrap">
                            <div className="font-semibold text-xs text-foreground">
                              {ord.packageName}
                            </div>
                            <div className="font-mono text-[10px] text-muted-foreground">
                              {ord.packageCode}
                            </div>
                          </TableCell>

                          {/* Quantity */}
                          <TableCell className="text-center font-mono font-bold text-xs text-primary whitespace-nowrap">
                            +{formatCreditQuantity(ord.creditQuantity)}
                          </TableCell>

                          {/* Amount */}
                          <TableCell className="text-right font-mono font-bold text-xs text-success-600 whitespace-nowrap">
                            {formatVndPrice(ord.amountVnd)}
                          </TableCell>

                          {/* Status */}
                          <TableCell className="text-center whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className={`text-[11px] font-medium ${statusConfig.className}`}
                            >
                              {statusConfig.label}
                            </Badge>
                          </TableCell>

                          {/* Time */}
                          <TableCell className="text-[11px] text-muted-foreground font-mono whitespace-nowrap">
                            <div className="flex flex-col gap-0.5">
                              <div>{t("admin.memberTransactions.createdAt", { value: formatDateTime(ord.createdAt) })}</div>
                              {ord.paidAt && (
                                <div className="text-success-600 font-semibold">
                                  {t("admin.memberTransactions.paidAt", { value: formatDateTime(ord.paidAt) })}
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Action */}
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewOrderDetail(ord.id)}
                              className="h-8 px-2.5 text-xs gap-1 hover:text-primary rounded-lg"
                              title={t("admin.memberTransactions.viewDetailTitle")}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{t("shared.details")}</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {totalElements > 0 && (
            <div className="px-6 py-2.5 border-t flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-muted/10 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>{t("admin.pagination.show")}</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => handlePageSizeChange(Number(v))}
                >
                  <SelectTrigger className="w-[105px] h-7 rounded-lg text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl text-xs">
                    <SelectItem value="5">{t("admin.pagination.perPage", { count: 5 })}</SelectItem>
                    <SelectItem value="10">{t("admin.pagination.perPage", { count: 10 })}</SelectItem>
                    <SelectItem value="20">{t("admin.pagination.perPage", { count: 20 })}</SelectItem>
                  </SelectContent>
                </Select>
                <span>
                  &bull;{" "}
                  <Trans
                    t={t}
                    i18nKey="admin.pagination.pageOf"
                    values={{ page, totalPages }}
                    components={{ strong: <strong className="text-foreground" /> }}
                  />
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1 || loading}
                  className="h-7 px-2 rounded-lg text-xs gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t("shared.prev")}</span>
                </Button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((p, idx) =>
                    p === "..." ? (
                      <span key={`dots-${idx}`} className="px-1 text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={p}
                        variant={p === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(p)}
                        disabled={loading}
                        className={`h-7 w-7 p-0 rounded-lg text-xs font-mono ${
                          p === page ? "pointer-events-none" : ""
                        }`}
                      >
                        {p}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages || loading}
                  className="h-7 px-2 rounded-lg text-xs gap-1"
                >
                  <span className="hidden sm:inline">{t("shared.next")}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Dialog Footer Actions */}
          <DialogFooter className="px-6 py-3 border-t bg-muted/20 flex flex-row items-center justify-end">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 px-4 rounded-xl text-xs"
            >
              {t("shared.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nested Order Detail Dialog */}
      <PaymentOrderDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        orderDetail={selectedOrderDetail}
        loading={loadingDetail}
        error={detailError}
      />
    </>
  )
}

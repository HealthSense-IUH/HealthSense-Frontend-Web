import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Receipt,
  RefreshCw,
  User,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  formatDateTime,
  formatVndPrice,
  getCreditOrderStatusConfig,
} from "@/constants/credits"
import type { AdminCreditOrderSummary } from "@/types/credits"
import { Trans, useTranslation } from "react-i18next"

interface PaymentOrdersTableProps {
  orders: AdminCreditOrderSummary[]
  loading: boolean
  page: number
  totalPages: number
  totalElements: number
  onPageChange: (newPage: number) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  providerFilter: string
  onProviderFilterChange: (provider: string) => void
  onSelectMember: (memberId: string) => void
  onViewDetail: (orderId: string) => void
  onRefresh: () => void
}

export function PaymentOrdersTable({
  orders,
  loading,
  page,
  totalPages,
  totalElements,
  onPageChange,
  statusFilter,
  onStatusFilterChange,
  providerFilter,
  onProviderFilterChange,
  onSelectMember,
  onViewDetail,
  onRefresh,
}: PaymentOrdersTableProps) {
  const { t } = useTranslation("credits")
  return (
    <Card className="rounded-2xl border shadow-xs">
      <CardHeader className="pb-4 border-b">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-primary" />
                {t("admin.ordersTable.title")}
              </CardTitle>
              <Badge variant="secondary" className="text-xs font-mono">
                {t("admin.ordersTable.count", { count: totalElements })}
              </Badge>
            </div>
            <CardDescription className="text-xs mt-0.5">
              {t("admin.ordersTable.description")}
            </CardDescription>
          </div>

          {/* Table filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="w-[145px] h-8 rounded-xl text-xs">
                  <SelectValue placeholder={t("admin.ordersTable.statusPlaceholder")} />
                </SelectTrigger>
                <SelectContent className="rounded-xl text-xs">
                  <SelectItem value="ALL">{t("filters.allStatuses")}</SelectItem>
                  <SelectItem value="PAID">{t("admin.ordersTable.statusOptions.paid")}</SelectItem>
                  <SelectItem value="PENDING_PAYMENT">{t("admin.ordersTable.statusOptions.pendingPayment")}</SelectItem>
                  <SelectItem value="CANCELLED">{t("admin.ordersTable.statusOptions.cancelled")}</SelectItem>
                  <SelectItem value="EXPIRED">{t("admin.ordersTable.statusOptions.expired")}</SelectItem>
                  <SelectItem value="REQUIRES_REVIEW">{t("admin.ordersTable.statusOptions.requiresReview")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={providerFilter} onValueChange={onProviderFilterChange}>
              <SelectTrigger className="w-[125px] h-8 rounded-xl text-xs">
                <SelectValue placeholder={t("admin.ordersTable.providerPlaceholder")} />
              </SelectTrigger>
              <SelectContent className="rounded-xl text-xs">
                <SelectItem value="ALL">{t("admin.ordersTable.allProviders")}</SelectItem>
                <SelectItem value="MOCK">MOCK</SelectItem>
                <SelectItem value="PAYOS">PayOS</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="h-8 rounded-xl text-xs gap-1 px-2.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs font-semibold">{t("admin.ordersTable.columns.orderId")}</TableHead>
                <TableHead className="text-xs font-semibold">{t("admin.ordersTable.columns.member")}</TableHead>
                <TableHead className="text-xs font-semibold">{t("admin.ordersTable.columns.package")}</TableHead>
                <TableHead className="text-xs font-semibold text-center">{t("admin.ordersTable.columns.tokens")}</TableHead>
                <TableHead className="text-xs font-semibold text-right">{t("admin.ordersTable.columns.amount")}</TableHead>
                <TableHead className="text-xs font-semibold text-center">{t("admin.ordersTable.columns.status")}</TableHead>
                <TableHead className="text-xs font-semibold">{t("admin.ordersTable.columns.createdAt")}</TableHead>
                <TableHead className="text-xs font-semibold">{t("admin.ordersTable.columns.paidAt")}</TableHead>
                <TableHead className="text-xs font-semibold text-right">{t("admin.ordersTable.columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-36 text-center text-xs text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    {t("admin.ordersTable.loading")}
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-36 text-center text-xs text-muted-foreground">
                    {t("admin.ordersTable.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((ord) => {
                  const statusConfig = getCreditOrderStatusConfig(ord.status)
                  return (
                    <TableRow key={ord.id} className="hover:bg-muted/20">
                      {/* Order ID */}
                      <TableCell className="font-mono text-xs font-bold text-primary whitespace-nowrap">
                        #{ord.id}
                      </TableCell>

                      {/* Member ID with 1-click filter button */}
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => onSelectMember(ord.memberId)}
                          className="flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline"
                          title={t("admin.ordersTable.filterByMemberTitle")}
                        >
                          <User className="w-3 h-3 text-muted-foreground shrink-0" />
                          #{ord.memberId}
                        </button>
                      </TableCell>

                      {/* Package Name & Code */}
                      <TableCell>
                        <div className="font-medium text-xs text-foreground max-w-[170px] truncate">
                          {ord.packageName}
                        </div>
                        <div className="font-mono text-[11px] text-muted-foreground">
                          {ord.packageCode}
                        </div>
                      </TableCell>

                      {/* Credit Quantity */}
                      <TableCell className="text-center font-mono font-bold text-xs text-primary whitespace-nowrap">
                        +{ord.creditQuantity}
                      </TableCell>

                      {/* Amount VND */}
                      <TableCell className="text-right font-mono font-bold text-xs whitespace-nowrap">
                        {formatVndPrice(ord.amountVnd)}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${statusConfig.className}`}
                        >
                          {statusConfig.label}
                        </Badge>
                      </TableCell>

                      {/* Created At */}
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap font-mono">
                        {formatDateTime(ord.createdAt)}
                      </TableCell>

                      {/* Paid At */}
                      <TableCell className="text-xs whitespace-nowrap font-mono">
                        {ord.paidAt ? (
                          <span className="text-success-600 font-semibold">
                            {formatDateTime(ord.paidAt)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">—</span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetail(ord.id)}
                          className="h-8 px-2.5 text-xs gap-1 hover:text-primary rounded-lg"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {t("shared.details")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* 1-based Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground">
            <div>
              <Trans
                t={t}
                i18nKey="ordersTable.pagination"
                values={{ page, totalPages, total: totalElements }}
                components={{ strong: <span className="font-semibold text-foreground" /> }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1 || loading}
                className="h-8 px-2.5 rounded-xl text-xs gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                {t("shared.prev")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages || loading}
                className="h-8 px-2.5 rounded-xl text-xs gap-1"
              >
                {t("shared.next")}
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

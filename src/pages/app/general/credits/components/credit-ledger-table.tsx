import { History, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, ExternalLink } from "lucide-react"
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
import { formatRecordDate } from "@/lib/formatters"
import {
  getCreditOperationConfig,
  getCreditSourceTypeConfig,
} from "@/constants/credits"
import type { PageResponse } from "@/types/base"
import type { CreditLedgerEntry } from "@/types/credits"

interface CreditLedgerTableProps {
  ledgerData: PageResponse<CreditLedgerEntry> | null
  loading: boolean
  error: string | null
  page: number
  onPageChange: (newPage: number) => void
  onViewOrderDetail: (orderId: string) => void
  onRetry: () => void
}

export function CreditLedgerTable({
  ledgerData,
  loading,
  error,
  page,
  onPageChange,
  onViewOrderDetail,
  onRetry,
}: CreditLedgerTableProps) {
  if (loading && !ledgerData) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (error && !ledgerData) {
    return (
      <Card className="border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20 p-8 text-center">
        <div className="max-w-md mx-auto space-y-3">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto" />
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
            Không thể tải lịch sử biến động lượt
          </h3>
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5 mt-2">
            <RefreshCw className="h-3.5 w-3.5" /> Thử lại
          </Button>
        </div>
      </Card>
    )
  }

  const content = ledgerData?.content ?? []
  const totalPages = ledgerData?.totalPages ?? 0
  const totalElements = ledgerData?.totalElements ?? 0

  if (content.length === 0) {
    return (
      <Card className="border-dashed border-border p-12 text-center">
        <div className="max-w-md mx-auto space-y-3">
          <History className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <h3 className="text-base font-semibold text-foreground">
            Chưa có biến động lượt tư vấn nào
          </h3>
          <p className="text-xs text-muted-foreground">
            Mọi thao tác mua lượt, giữ lượt hoặc bồi hoàn sẽ được ghi chép minh bạch tại đây.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[170px] text-xs font-semibold">Thời gian</TableHead>
              <TableHead className="text-xs font-semibold">Loại biến động</TableHead>
              <TableHead className="text-xs font-semibold">Lượt khả dụng</TableHead>
              <TableHead className="text-xs font-semibold">Tổng lượt</TableHead>
              <TableHead className="text-xs font-semibold">Lượt tạm giữ</TableHead>
              <TableHead className="text-xs font-semibold">Số dư sau</TableHead>
              <TableHead className="text-right text-xs font-semibold">Nguồn gốc</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {content.map((entry) => {
              const opCfg = getCreditOperationConfig(entry.operation)
              const sourceCfg = getCreditSourceTypeConfig(entry.sourceType)

              // deltaAvailable = deltaBalance - deltaReserved theo đúng đặc tả tài liệu
              const deltaAvailable = entry.deltaBalance - entry.deltaReserved
              const availableAfter = entry.balanceAfter - entry.reservedAfter

              return (
                <TableRow key={entry.id} className="hover:bg-muted/30">
                  <TableCell className="text-xs text-muted-foreground">
                    {formatRecordDate(entry.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[11px] font-medium ${opCfg.className}`}>
                      {opCfg.label}
                    </Badge>
                  </TableCell>
                  {/* Thay đổi lượt khả dụng */}
                  <TableCell>
                    <span
                      className={`text-xs font-bold ${
                        deltaAvailable > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : deltaAvailable < 0
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-muted-foreground"
                      }`}
                    >
                      {deltaAvailable > 0 ? `+${deltaAvailable}` : deltaAvailable} lượt
                    </span>
                  </TableCell>
                  {/* Thay đổi tổng lượt */}
                  <TableCell className="text-xs font-medium text-foreground">
                    {entry.deltaBalance > 0 ? `+${entry.deltaBalance}` : entry.deltaBalance}
                  </TableCell>
                  {/* Thay đổi lượt giữ */}
                  <TableCell className="text-xs font-medium text-foreground">
                    {entry.deltaReserved > 0 ? `+${entry.deltaReserved}` : entry.deltaReserved}
                  </TableCell>
                  {/* Số dư sau giao dịch */}
                  <TableCell>
                    <div className="text-xs space-y-0.5">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {availableAfter} khả dụng
                      </span>
                      <div className="text-[10px] text-muted-foreground">
                        Tổng: {entry.balanceAfter} | Giữ: {entry.reservedAfter}
                      </div>
                    </div>
                  </TableCell>
                  {/* Đối tượng nguồn */}
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {sourceCfg.label}
                      </span>
                      {sourceCfg.isOrder && entry.sourceId ? (
                        <button
                          type="button"
                          onClick={() => onViewOrderDetail(entry.sourceId)}
                          className="inline-flex items-center gap-1 text-xs font-mono text-primary hover:underline hover:text-primary/80 transition-colors cursor-pointer"
                          title="Xem chi tiết đơn mua này"
                        >
                          <span>#{entry.sourceId}</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-muted-foreground/70">
                          #{entry.sourceId}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-1 text-xs text-muted-foreground">
          <div>
            Trang <span className="font-semibold text-foreground">{page}</span> / {totalPages} (Tổng {totalElements} biến động)
          </div>
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
        </div>
      )}
    </div>
  )
}

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  CircleDollarSign,
  Coins,
  HelpCircle,
  RefreshCw,
  Users,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatCreditQuantity, formatDateTime, formatVnd } from "@/constants/credits"
import type { AdminCreditPaymentOverview } from "@/types/credits"

interface PaymentKpiCardsProps {
  overview: AdminCreditPaymentOverview | null
  loading: boolean
  error: string | null
  onRetry?: () => void
  isMemberFiltered?: boolean
}

export function PaymentKpiCards({
  overview,
  loading,
  error,
  onRetry,
  isMemberFiltered = false,
}: PaymentKpiCardsProps) {
  if (error) {
    return (
      <Card className="rounded-2xl border-destructive/30 bg-destructive/5 shadow-xs">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Không thể tải số liệu KPI tổng quan</p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          </div>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="rounded-xl text-xs gap-1.5 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Thử lại
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const isZeroState =
    overview &&
    overview.successfulOrderCount === 0 &&
    overview.totalPaidVnd === 0 &&
    !loading

  return (
    <div className="space-y-3">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Doanh thu */}
        <Card className="rounded-2xl border shadow-xs bg-card transition-all hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tổng tiền đã thu
            </CardDescription>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CircleDollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {loading ? (
              <Skeleton className="h-8 w-32 rounded-lg" />
            ) : (
              <CardTitle className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatVnd(overview?.totalPaidVnd ?? 0)}
              </CardTitle>
            )}
            <p className="text-[11px] text-muted-foreground">
              Tổng snapshot từ các đơn trạng thái PAID
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Tổng token */}
        <Card className="rounded-2xl border shadow-xs bg-card transition-all hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tổng token đã bán
            </CardDescription>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Coins className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {loading ? (
              <Skeleton className="h-8 w-28 rounded-lg" />
            ) : (
              <CardTitle className="text-2xl font-bold font-mono text-primary">
                +{formatCreditQuantity(overview?.totalPurchasedCredits ?? 0)}
              </CardTitle>
            )}
            <p className="text-[11px] text-muted-foreground">
              Token ghi nhận qua đơn thanh toán thành công
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Số đơn thành công */}
        <Card className="rounded-2xl border shadow-xs bg-card transition-all hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Đơn thành công
            </CardDescription>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {loading ? (
              <Skeleton className="h-8 w-20 rounded-lg" />
            ) : (
              <CardTitle className="text-2xl font-bold font-mono text-foreground">
                {(overview?.successfulOrderCount ?? 0).toLocaleString("vi-VN")}
              </CardTitle>
            )}
            <p className="text-[11px] text-muted-foreground">
              Đơn hàng mua token có status = PAID
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Số member thanh toán */}
        <Card className="rounded-2xl border shadow-xs bg-card transition-all hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isMemberFiltered ? "Thành viên thanh toán" : "Số member thanh toán"}
            </CardDescription>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {loading ? (
              <Skeleton className="h-8 w-20 rounded-lg" />
            ) : (
              <CardTitle className="text-2xl font-bold font-mono text-foreground">
                {(overview?.payingMemberCount ?? 0).toLocaleString("vi-VN")}
                {isMemberFiltered && (
                  <span className="text-xs font-normal text-muted-foreground ml-1.5">
                    ({overview?.payingMemberCount ? "Đã từng mua" : "Chưa có đơn"})
                  </span>
                )}
              </CardTitle>
            )}
            <p className="text-[11px] text-muted-foreground">
              {isMemberFiltered
                ? "Thành viên đang lọc có đơn PAID trong kỳ"
                : "Số hội viên riêng biệt có đơn thanh toán PAID"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Metadata bar: firstPaidAt, lastPaidAt and Tooltip explanation */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 py-2 rounded-xl bg-muted/30 border text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>Thanh toán đầu:</span>
            {loading ? (
              <Skeleton className="h-4 w-28 inline-block" />
            ) : (
              <span className="font-mono font-medium text-foreground">
                {overview?.firstPaidAt ? formatDateTime(overview.firstPaidAt) : "Chưa có"}
              </span>
            )}
          </div>

          <span className="text-muted-foreground/40 hidden sm:inline">•</span>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>Thanh toán gần nhất:</span>
            {loading ? (
              <Skeleton className="h-4 w-28 inline-block" />
            ) : (
              <span className="font-mono font-medium text-foreground">
                {overview?.lastPaidAt ? formatDateTime(overview.lastPaidAt) : "Chưa có"}
              </span>
            )}
          </div>
        </div>

        {/* Explain tooltip */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-[11px] cursor-help hover:text-foreground transition-colors ml-auto">
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Quy tắc ghi nhận KPI</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs p-3 space-y-1.5 leading-relaxed">
              <p className="font-bold text-foreground">Cách tính KPI và Bảng giao dịch:</p>
              <p>
                • <strong>KPI:</strong> Tính trên các đơn đã thanh toán thành công (<code>PAID</code>) và lọc theo thời điểm thanh toán thực tế (<code>paidAt</code>).
              </p>
              <p>
                • <strong>Bảng đơn hàng:</strong> Lọc theo thời điểm tạo đơn (<code>createdAt</code>).
              </p>
              <p className="text-muted-foreground text-[11px]">
                Do đó, nếu một đơn được tạo vào cuối ngày hôm trước và hoàn tất thanh toán vào ngày hôm sau, số liệu KPI và số dòng đơn hàng trong cùng bộ lọc ngày có thể chênh lệch.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Empty State Banner if 0 transactions in chosen range */}
      {isZeroState && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-center justify-between">
          <span>Chưa có thanh toán thành công (PAID) nào trong khoảng thời gian đã chọn.</span>
        </div>
      )}
    </div>
  )
}

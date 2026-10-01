import { AlertCircle, CheckCircle2, Coins, CreditCard, RefreshCw, Wallet } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { formatVnd, formatCreditQuantity, formatDateTime } from "@/constants/credits"
import type { MemberCreditPaymentOverview } from "@/types/credits"

interface MemberPaymentKpiCardsProps {
  overview: MemberCreditPaymentOverview | null
  loading: boolean
  error: string | null
  onRetry: () => void
}

export function MemberPaymentKpiCards({
  overview,
  loading,
  error,
  onRetry,
}: MemberPaymentKpiCardsProps) {
  if (loading && !overview) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl w-full" />
          ))}
        </div>
        <Skeleton className="h-10 rounded-xl w-full" />
      </div>
    )
  }

  if (error && !overview) {
    return (
      <Card className="border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20 p-4 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Không thể tải tổng kết thanh toán: {error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={onRetry} className="h-8 gap-1.5 text-xs shrink-0">
            <RefreshCw className="h-3.5 w-3.5" /> Thử lại
          </Button>
        </div>
      </Card>
    )
  }

  const data = overview ?? {
    totalPaidVnd: 0,
    totalPurchasedCredits: 0,
    successfulOrderCount: 0,
    wallet: {
      available: 0,
      balance: 0,
      reserved: 0,
    },
    firstPaidAt: null,
    lastPaidAt: null,
  }

  return (
    <div className="space-y-3">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Tổng tiền thanh toán */}
        <Card className="border border-border/80 shadow-xs hover:shadow-sm transition-all bg-card/80 backdrop-blur-xs">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Tổng tiền đã thanh toán</span>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xl font-bold tracking-tight text-foreground">
                {formatVnd(data.totalPaidVnd)}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Chỉ tính giao dịch đã hoàn tất
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Tổng token đã mua */}
        <Card className="border border-border/80 shadow-xs hover:shadow-sm transition-all bg-card/80 backdrop-blur-xs">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Tổng token đã mua</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Coins className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                +{formatCreditQuantity(data.totalPurchasedCredits)} <span className="text-xs font-semibold">lượt</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Từ các gói đã mua thành công
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Số lần mua thành công */}
        <Card className="border border-border/80 shadow-xs hover:shadow-sm transition-all bg-card/80 backdrop-blur-xs">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Lần mua thành công</span>
              <div className="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xl font-bold tracking-tight text-foreground">
                {data.successfulOrderCount.toLocaleString("vi-VN")}{" "}
                <span className="text-xs font-semibold text-muted-foreground">đơn</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Giao dịch nạp được xác nhận
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Token khả dụng (Wallet snapshot) */}
        <Card className="border border-border/80 shadow-xs hover:shadow-sm transition-all bg-card/80 backdrop-blur-xs">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Token khả dụng hiện tại</span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xl font-bold tracking-tight text-foreground">
                {formatCreditQuantity(data.wallet.available)}{" "}
                <span className="text-xs font-semibold text-muted-foreground">lượt</span>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 truncate">
                <span>Số dư: {data.wallet.balance}</span>
                <span>•</span>
                <span>Đang giữ: {data.wallet.reserved}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auxiliary Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 bg-muted/40 rounded-xl border border-border/60 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Lần thanh toán đầu:</span>
            <span className="font-medium text-foreground">
              {data.firstPaidAt ? formatDateTime(data.firstPaidAt) : "Chưa có"}
            </span>
          </div>
          <span className="hidden sm:inline text-muted-foreground/50">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Lần thanh toán gần nhất:</span>
            <span className="font-medium text-foreground">
              {data.lastPaidAt ? formatDateTime(data.lastPaidAt) : "Chưa có"}
            </span>
          </div>
        </div>
        <div className="text-[11px] text-muted-foreground/80 italic">
          * Số dư ví hiển thị theo thời gian thực; các chỉ số thanh toán tính theo bộ lọc thời gian.
        </div>
      </div>
    </div>
  )
}

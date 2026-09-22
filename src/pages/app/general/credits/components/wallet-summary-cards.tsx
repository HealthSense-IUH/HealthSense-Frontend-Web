import { Coins, Info, AlertCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { CreditWallet } from "@/types/credits"

interface WalletSummaryCardsProps {
  wallet: CreditWallet | null
  loading: boolean
  error: string | null
  onRetry: () => void
}

export function WalletSummaryCards({
  wallet,
  loading,
  error,
  onRetry,
}: WalletSummaryCardsProps) {
  if (loading && !wallet) {
    return (
      <Card className="p-6 space-y-3">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-4 w-64" />
      </Card>
    )
  }

  if (error && !wallet) {
    return (
      <Card className="border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                Không thể tải thông tin ví lượt
              </h3>
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5 shrink-0">
            <RefreshCw className="h-3.5 w-3.5" /> Thử lại
          </Button>
        </div>
      </Card>
    )
  }

  const available = wallet?.available ?? 0
  const reserved = wallet?.reserved ?? 0

  return (
    <Card className="relative overflow-hidden border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 via-background to-emerald-50/30 dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-background shadow-xs">
      <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
        <Coins className="h-24 w-24 text-emerald-600 dark:text-emerald-400" />
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
              <Coins className="h-4 w-4" />
            </div>
            Lượt tư vấn khả dụng
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help text-muted-foreground hover:text-foreground">
                  <Info className="h-4 w-4" />
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                Số lượt bạn có thể sử dụng ngay để đăng ký phiên tư vấn sức khỏe trực tuyến với bác sĩ.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">
            {available.toLocaleString("vi-VN")}
          </span>
          <span className="text-base font-semibold text-emerald-600/90 dark:text-emerald-400/90">
            lượt
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Sẵn sàng để bắt đầu phiên tư vấn sức khỏe trực tuyến</span>
          {reserved > 0 && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              (Đang tạm giữ {reserved} lượt cho ca hiện tại)
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

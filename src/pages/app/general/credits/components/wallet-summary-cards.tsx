import { Coins, Clock, Wallet, Info, AlertCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-4 w-full" />
          </Card>
        ))}
      </div>
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
  const balance = wallet?.balance ?? 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Lượt khả dụng - Nổi bật chính */}
      <Card className="relative overflow-hidden border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 via-background to-emerald-50/30 dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-background shadow-xs">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Coins className="h-20 w-20 text-emerald-600 dark:text-emerald-400" />
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Lượt khả dụng
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help text-muted-foreground hover:text-foreground">
                    <Info className="h-3.5 w-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  Số lượt bạn có thể sử dụng ngay để đăng ký tư vấn với bác sĩ. Tính bằng: Tổng lượt - Lượt đang tạm giữ.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <div className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">
            {available.toLocaleString("vi-VN")}{" "}
            <span className="text-sm font-medium text-emerald-600/80 dark:text-emerald-400/80">lượt</span>
          </div>
          <CardDescription className="text-xs text-emerald-700/80 dark:text-emerald-400/80">
            Sẵn sàng để đăng ký phiên tư vấn sức khỏe
          </CardDescription>
        </CardContent>
      </Card>

      {/* 2. Lượt đang được tạm giữ */}
      <Card className="relative overflow-hidden border-border bg-background shadow-xs">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Clock className="h-20 w-20 text-purple-600 dark:text-purple-400" />
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Lượt đang được tạm giữ
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help text-muted-foreground hover:text-foreground">
                    <Info className="h-3.5 w-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  Lượt đang được tạm giữ trong phiên hoặc hàng đợi tư vấn. Tính năng trừ lượt tự động khi tư vấn sẽ được áp dụng ở đợt sau (hiện tại chưa trừ lượt).
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <div className="text-3xl font-extrabold text-foreground tracking-tight">
            {reserved.toLocaleString("vi-VN")}{" "}
            <span className="text-sm font-medium text-muted-foreground">lượt</span>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Lượt đang tạm giữ (hiện tại chưa trừ lượt tư vấn)
          </CardDescription>
        </CardContent>
      </Card>

      {/* 3. Tổng số lượt sở hữu */}
      <Card className="relative overflow-hidden border-border bg-background shadow-xs">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Wallet className="h-20 w-20 text-blue-600 dark:text-blue-400" />
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Tổng số lượt
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help text-muted-foreground hover:text-foreground">
                    <Info className="h-3.5 w-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  Tổng tất cả số lượt tư vấn của bạn chưa tiêu thụ (bao gồm cả lượt khả dụng và lượt đang được tạm giữ).
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <div className="text-3xl font-extrabold text-foreground tracking-tight">
            {balance.toLocaleString("vi-VN")}{" "}
            <span className="text-sm font-medium text-muted-foreground">lượt</span>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Tổng số lượt còn lại trong tài khoản
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}

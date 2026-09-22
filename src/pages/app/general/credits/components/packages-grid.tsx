import { Package, AlertCircle, RefreshCw, ShoppingCart } from "lucide-react"
import { Card, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatVnd, formatCreditQuantity } from "@/constants/credits"
import type { CreditPackage } from "@/types/credits"

interface PackagesGridProps {
  packages: CreditPackage[]
  loading: boolean
  error: string | null
  isFeatureDisabled: boolean
  onSelectPackage: (pkg: CreditPackage) => void
  onRetry: () => void
}

export function PackagesGrid({
  packages,
  loading,
  error,
  isFeatureDisabled,
  onSelectPackage,
  onRetry,
}: PackagesGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
          </Card>
        ))}
      </div>
    )
  }

  if (isFeatureDisabled) {
    return (
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20 p-8 text-center">
        <div className="max-w-md mx-auto space-y-3">
          <AlertCircle className="h-10 w-10 text-amber-600 dark:text-amber-400 mx-auto" />
          <h3 className="text-base font-semibold text-amber-800 dark:text-amber-300">
            Chức năng mua lượt tạm chưa khả dụng
          </h3>
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            Hệ thống mua lượt tư vấn hiện đang tạm tắt trong môi trường này. Quý hội viên vui lòng quay lại sau.
          </p>
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5 mt-2">
            <RefreshCw className="h-3.5 w-3.5" /> Kiểm tra lại
          </Button>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20 p-8 text-center">
        <div className="max-w-md mx-auto space-y-3">
          <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400 mx-auto" />
          <h3 className="text-base font-semibold text-red-800 dark:text-red-300">
            Không thể tải danh sách gói lượt
          </h3>
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5 mt-2">
            <RefreshCw className="h-3.5 w-3.5" /> Thử lại
          </Button>
        </div>
      </Card>
    )
  }

  if (packages.length === 0) {
    return (
      <Card className="border-dashed border-border p-12 text-center">
        <div className="max-w-md mx-auto space-y-3">
          <Package className="h-12 w-12 text-muted-foreground/50 mx-auto" />
          <h3 className="text-base font-semibold text-foreground">
            Chưa có gói lượt tư vấn
          </h3>
          <p className="text-xs text-muted-foreground">
            Hiện tại chưa có gói lượt tư vấn nào đang mở bán. Vui lòng quay lại sau hoặc liên hệ hỗ trợ viên.
          </p>
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5 mt-2">
            <RefreshCw className="h-3.5 w-3.5" /> Làm mới danh sách
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {packages.map((pkg) => (
        <Card
          key={pkg.id}
          className="flex flex-col justify-between border-border hover:border-primary/50 transition-all hover:shadow-md overflow-hidden relative group"
        >
          <div className="p-6 space-y-4 flex-1">
            <div className="flex items-start justify-between gap-2">
              <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 border-primary/30 text-primary bg-primary/5">
                {pkg.code || "GÓI TƯ VẤN"}
              </Badge>
              <span className="text-[11px] font-mono text-muted-foreground/70">
                #{pkg.id}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {pkg.name}
              </h3>
              {pkg.description ? (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {pkg.description}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Gói lượt tư vấn chuyên sâu cùng bác sĩ chuyên khoa
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-border/60 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">Số lượt nhận:</span>
                <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                  {formatCreditQuantity(pkg.creditQuantity)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">Đơn giá:</span>
                <span className="text-xl font-black text-foreground">
                  {formatVnd(pkg.priceVnd)}
                </span>
              </div>
            </div>
          </div>

          <CardFooter className="p-6 pt-0">
            <Button
              className="w-full shadow-xs gap-2 font-semibold"
              onClick={() => onSelectPackage(pkg)}
            >
              <ShoppingCart className="h-4 w-4" />
              Mua lượt
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

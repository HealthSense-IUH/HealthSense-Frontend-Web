import { Package, AlertCircle, RefreshCw, ShoppingCart } from "lucide-react"
import { Card, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatVnd, formatCreditQuantity } from "@/constants/credits"
import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation("credits")
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
      <Card className="border-warning-200 bg-warning-50/50 p-6 text-center">
        <div className="max-w-md mx-auto space-y-3">
          <AlertCircle className="h-10 w-10 text-warning-600 mx-auto" />
          <h3 className="text-base font-semibold text-warning-800">
            {t("packagesGrid.disabledTitle")}
          </h3>
          <p className="text-xs text-warning-700 leading-relaxed">
            {t("packagesGrid.disabledDescription")}
          </p>
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5 mt-2">
            <RefreshCw className="h-3.5 w-3.5" /> {t("packagesGrid.checkAgain")}
          </Button>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-danger-200 bg-danger-50/50 p-6 text-center">
        <div className="max-w-md mx-auto space-y-3">
          <AlertCircle className="h-10 w-10 text-danger-600 mx-auto" />
          <h3 className="text-base font-semibold text-danger-800">
            {t("packagesGrid.loadError")}
          </h3>
          <p className="text-xs text-danger-600">{error}</p>
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5 mt-2">
            <RefreshCw className="h-3.5 w-3.5" /> {t("shared.retry")}
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
            {t("packagesGrid.emptyTitle")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("packagesGrid.emptyDescription")}
          </p>
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5 mt-2">
            <RefreshCw className="h-3.5 w-3.5" /> {t("packagesGrid.refreshList")}
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
                {pkg.code || t("packagesGrid.defaultCode")}
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
                  {t("packagesGrid.defaultDescription")}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-border/60 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">{t("packagesGrid.creditsReceived")}</span>
                <span className="text-base font-extrabold text-success-700">
                  {formatCreditQuantity(pkg.creditQuantity)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">{t("packagesGrid.price")}</span>
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
              {t("packagesGrid.buy")}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

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
import { Trans, useTranslation } from "react-i18next"
import { currentIntlLocale } from "@/lib/i18n"

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
  const { t } = useTranslation("credits")
  if (error) {
    return (
      <Card className="rounded-2xl border-destructive/30 bg-destructive/5 shadow-xs">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">{t("admin.kpi.loadError")}</p>
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
              {t("shared.retry")}
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
              {t("admin.kpi.totalCollected")}
            </CardDescription>
            <div className="p-2 rounded-xl bg-success-500/10 text-success-600">
              <CircleDollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {loading ? (
              <Skeleton className="h-8 w-32 rounded-lg" />
            ) : (
              <CardTitle className="text-2xl font-bold font-mono text-success-600">
                {formatVnd(overview?.totalPaidVnd ?? 0)}
              </CardTitle>
            )}
            <p className="text-[11px] text-muted-foreground">
              {t("admin.kpi.totalCollectedHint")}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Tổng token */}
        <Card className="rounded-2xl border shadow-xs bg-card transition-all hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("admin.kpi.totalSold")}
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
              {t("admin.kpi.totalSoldHint")}
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Số đơn thành công */}
        <Card className="rounded-2xl border shadow-xs bg-card transition-all hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("admin.kpi.successfulOrders")}
            </CardDescription>
            <div className="p-2 rounded-xl bg-primary-500/10 text-primary-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {loading ? (
              <Skeleton className="h-8 w-20 rounded-lg" />
            ) : (
              <CardTitle className="text-2xl font-bold font-mono text-foreground">
                {(overview?.successfulOrderCount ?? 0).toLocaleString(currentIntlLocale())}
              </CardTitle>
            )}
            <p className="text-[11px] text-muted-foreground">
              {t("admin.kpi.successfulOrdersHint")}
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Số member thanh toán */}
        <Card className="rounded-2xl border shadow-xs bg-card transition-all hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isMemberFiltered ? t("admin.kpi.payingMember") : t("admin.kpi.payingMembers")}
            </CardDescription>
            <div className="p-2 rounded-xl bg-primary-500/10 text-primary-600">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {loading ? (
              <Skeleton className="h-8 w-20 rounded-lg" />
            ) : (
              <CardTitle className="text-2xl font-bold font-mono text-foreground">
                {(overview?.payingMemberCount ?? 0).toLocaleString(currentIntlLocale())}
                {isMemberFiltered && (
                  <span className="text-xs font-normal text-muted-foreground ml-1.5">
                    ({overview?.payingMemberCount ? t("admin.kpi.hasPurchased") : t("admin.kpi.noOrders")})
                  </span>
                )}
              </CardTitle>
            )}
            <p className="text-[11px] text-muted-foreground">
              {isMemberFiltered
                ? t("admin.kpi.payingMemberHint")
                : t("admin.kpi.payingMembersHint")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Metadata bar: firstPaidAt, lastPaidAt and Tooltip explanation */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 py-2 rounded-xl bg-muted/30 border text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>{t("admin.kpi.firstPaidAt")}</span>
            {loading ? (
              <Skeleton className="h-4 w-28 inline-block" />
            ) : (
              <span className="font-mono font-medium text-foreground">
                {overview?.firstPaidAt ? formatDateTime(overview.firstPaidAt) : t("shared.none")}
              </span>
            )}
          </div>

          <span className="text-muted-foreground/40 hidden sm:inline">•</span>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>{t("admin.kpi.lastPaidAt")}</span>
            {loading ? (
              <Skeleton className="h-4 w-28 inline-block" />
            ) : (
              <span className="font-mono font-medium text-foreground">
                {overview?.lastPaidAt ? formatDateTime(overview.lastPaidAt) : t("shared.none")}
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
                <span>{t("admin.kpi.rulesLabel")}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs p-3 space-y-1.5 leading-relaxed">
              <p className="font-bold text-foreground">{t("admin.kpi.rulesTitle")}</p>
              <p>
                <Trans t={t} i18nKey="admin.kpi.rulesKpi" components={{ strong: <strong />, code: <code /> }} />
              </p>
              <p>
                <Trans t={t} i18nKey="admin.kpi.rulesTable" components={{ strong: <strong />, code: <code /> }} />
              </p>
              <p className="text-muted-foreground text-[11px]">
                {t("admin.kpi.rulesNote")}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Empty State Banner if 0 transactions in chosen range */}
      {isZeroState && (
        <div className="p-3 rounded-xl bg-warning-500/10 border border-warning-500/20 text-xs text-warning-700 flex items-center justify-between">
          <span>{t("admin.kpi.zeroState")}</span>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Coins,
  History,
  Package,
  RefreshCw,
  ShieldAlert,
  ShoppingBag,
} from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { USER_ROLES } from "@/constants/roles"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useCreditsData } from "./hooks/use-credits-data"
import { useCreditPurchase } from "./hooks/use-credit-purchase"
import { WalletSummaryCards } from "./components/wallet-summary-cards"
import { PackagesGrid } from "./components/packages-grid"
import { PurchaseDialog } from "./components/purchase-dialog"
import { OrdersHistoryTable } from "./components/orders-history-table"
import { OrderDetailDialog } from "./components/order-detail-dialog"
import { CreditLedgerTable } from "./components/credit-ledger-table"
import { MemberPaymentKpiCards } from "./components/member-payment-kpi-cards"
import { MemberPaymentFilterBar } from "./components/member-payment-filter-bar"
import type { CreditPackage } from "@/types/credits"

export default function CreditsPage() {
  const { t } = useTranslation("credits")
  const navigate = useNavigate()
  const { toast } = useToast()
  const userSession = useAuthStore((state) => state.userSession)
  const isMember = userSession?.role === USER_ROLES.MEMBER

  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("tab") || "packages"
  const orderIdParam = searchParams.get("orderId")

  // Modal states
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [detailOrderId, setDetailOrderId] = useState<string | null>(orderIdParam)
  const [detailDialogOpen, setDetailDialogOpen] = useState<boolean>(Boolean(orderIdParam))

  // Data hook
  const {
    wallet,
    loadingWallet,
    walletError,
    loadWallet,
    updateWalletDirectly,

    packages,
    loadingPackages,
    packagesError,
    isFeatureDisabled,
    loadPackages,

    overview,
    loadingOverview,
    overviewError,
    loadOverview,

    orders,
    ordersPage,
    ordersSize,
    loadingOrders,
    ordersError,
    loadOrders,
    handlePageChange,
    handlePageSizeChange,

    datePreset,
    dateFrom,
    dateTo,
    orderStatus,
    handleDatePresetChange,
    handleStatusChange,
    resetFilters,
    refreshOrdersTab,

    ledger,
    ledgerPage,
    loadingLedger,
    ledgerError,
    loadLedger,

    refreshAll,
  } = useCreditsData()

  // Purchase hook
  const purchaseState = useCreditPurchase((detail) => {
    toast({
      title: t("page.purchaseSuccessTitle"),
      description: t("page.purchaseSuccessDescription"),
    })

    if (detail.wallet) {
      updateWalletDirectly(detail.wallet)
    }

    void loadOverview({ from: dateFrom, to: dateTo })
    void loadOrders({ page: 1, size: ordersSize, status: orderStatus, from: dateFrom, to: dateTo })
    void loadLedger(1)
    void loadPackages()
  })

  // Nếu PayOS điều hướng về có query params, chuyển tiếp về trang payment-result
  useEffect(() => {
    const codeParam = searchParams.get("code")
    const statusParam = searchParams.get("status")
    const cancelParam = searchParams.get("cancel")

    if (codeParam || statusParam || cancelParam) {
      navigate("/app/general/credits/payment/result", { replace: true })
    }
  }, [searchParams, navigate])

  const handleSelectPackage = (pkg: CreditPackage) => {
    purchaseState.selectPackage(pkg)
    setPurchaseDialogOpen(true)
  }

  const handleOpenOrderDetail = (orderId: string) => {
    setDetailOrderId(orderId)
    setDetailDialogOpen(true)
    setSearchParams((prev) => {
      prev.set("orderId", orderId)
      return prev
    })
  }

  const handleCloseOrderDetail = (open: boolean) => {
    setDetailDialogOpen(open)
    if (!open) {
      setDetailOrderId(null)
      setSearchParams((prev) => {
        prev.delete("orderId")
        return prev
      })
    }
  }

  const handleTabChange = (newTab: string) => {
    setSearchParams((prev) => {
      prev.set("tab", newTab)
      return prev
    })
  }

  if (!isMember) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {t("page.accessDenied")}
        </h2>
        <p className="max-w-md text-xs text-muted-foreground">
          {t("page.accessDeniedDescription")}
        </p>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* 1. Wallet Overview Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Coins className="w-6 h-6 text-primary" />
            {t("page.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t("page.description")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refreshAll()}
          disabled={loadingWallet || loadingPackages || loadingOrders || loadingLedger || loadingOverview}
          className="gap-2 shadow-xs shrink-0"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loadingWallet || loadingPackages || loadingOrders || loadingLedger || loadingOverview
                ? "animate-spin"
                : ""
            }`}
          />
          {t("page.refresh")}
        </Button>
      </div>

      {/* 2. Wallet Summary Cards */}
      <WalletSummaryCards
        wallet={wallet}
        loading={loadingWallet}
        error={walletError}
        onRetry={loadWallet}
      />

      {/* 3. Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <div className="border-b border-border pb-1">
          <TabsList className="bg-muted/60 p-1">
            <TabsTrigger value="packages" className="gap-2 text-xs font-medium">
              <Package className="h-4 w-4" />
              {t("page.tabs.packages")}
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2 text-xs font-medium">
              <ShoppingBag className="h-4 w-4" />
              {t("page.tabs.orders")}
            </TabsTrigger>
            <TabsTrigger value="ledger" className="gap-2 text-xs font-medium">
              <History className="h-4 w-4" />
              {t("page.tabs.ledger")}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Gói lượt tư vấn */}
        <TabsContent value="packages" className="space-y-4 focus-visible:outline-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {t("page.packagesTitle")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t("page.packagesDescription")}
              </p>
            </div>
          </div>

          <PackagesGrid
            packages={packages}
            loading={loadingPackages}
            error={packagesError}
            isFeatureDisabled={isFeatureDisabled}
            onSelectPackage={handleSelectPackage}
            onRetry={loadPackages}
          />
        </TabsContent>

        {/* Tab 2: Lịch sử đơn mua & Tổng kết */}
        <TabsContent value="orders" className="space-y-6 focus-visible:outline-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">{t("page.ordersTitle")}</h2>
              <p className="text-xs text-muted-foreground">
                {t("page.ordersDescription")}
              </p>
            </div>
          </div>

          {/* KPI Cards */}
          <MemberPaymentKpiCards
            overview={overview}
            loading={loadingOverview}
            error={overviewError}
            onRetry={() => void loadOverview({ from: dateFrom, to: dateTo })}
          />

          {/* Filter Bar */}
          <MemberPaymentFilterBar
            preset={datePreset}
            onPresetChange={handleDatePresetChange}
            status={orderStatus}
            onStatusChange={handleStatusChange}
            pageSize={ordersSize}
            onPageSizeChange={handlePageSizeChange}
            onRefresh={() => void refreshOrdersTab()}
            onReset={resetFilters}
            loading={loadingOverview || loadingOrders}
          />

          {/* Table */}
          <OrdersHistoryTable
            ordersData={orders}
            loading={loadingOrders}
            error={ordersError}
            page={ordersPage}
            onPageChange={handlePageChange}
            onViewDetail={handleOpenOrderDetail}
            onRetry={() => void loadOrders()}
            isFiltered={datePreset !== "all" || Boolean(orderStatus)}
            onResetFilters={resetFilters}
          />
        </TabsContent>

        {/* Tab 3: Biến động lượt tư vấn */}
        <TabsContent value="ledger" className="space-y-4 focus-visible:outline-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {t("page.ledgerTitle")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t("page.ledgerDescription")}
              </p>
            </div>
          </div>

          <CreditLedgerTable
            ledgerData={ledger}
            loading={loadingLedger}
            error={ledgerError}
            page={ledgerPage}
            onPageChange={loadLedger}
            onViewOrderDetail={handleOpenOrderDetail}
            onRetry={() => void loadLedger(ledgerPage)}
          />
        </TabsContent>
      </Tabs>

      {/* 4. Dialogs */}
      <PurchaseDialog
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
        purchaseState={purchaseState}
        onViewOrderDetail={handleOpenOrderDetail}
      />

      <OrderDetailDialog
        orderId={detailOrderId}
        open={detailDialogOpen}
        onOpenChange={handleCloseOrderDetail}
        onWalletUpdated={updateWalletDirectly}
      />
    </div>
  )
}

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import {
  Coins,
  History,
  Package,
  RefreshCw,
  ShoppingBag,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useCreditsData } from "@/pages/app/general/credits/hooks/use-credits-data"
import { useCreditPurchase } from "@/pages/app/general/credits/hooks/use-credit-purchase"
import { WalletSummaryCards } from "@/pages/app/general/credits/components/wallet-summary-cards"
import { PackagesGrid } from "@/pages/app/general/credits/components/packages-grid"
import { PurchaseDialog } from "@/pages/app/general/credits/components/purchase-dialog"
import { OrdersHistoryTable } from "@/pages/app/general/credits/components/orders-history-table"
import { OrderDetailDialog } from "@/pages/app/general/credits/components/order-detail-dialog"
import { CreditLedgerTable } from "@/pages/app/general/credits/components/credit-ledger-table"
import type { CreditPackage } from "@/types/credits"

export function MemberCreditsPanel() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [searchParams, setSearchParams] = useSearchParams()
  const creditSubTab = searchParams.get("creditTab") || "packages"
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

    orders,
    ordersPage,
    loadingOrders,
    ordersError,
    loadOrders,

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
      title: "Thành công",
      description: "Mua lượt tư vấn giả lập thành công!",
    })

    if (detail.wallet) {
      updateWalletDirectly(detail.wallet)
    }

    void loadOrders(1)
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
      prev.set("tab", "credits")
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

  const handleSubTabChange = (newSubTab: string) => {
    setSearchParams((prev) => {
      prev.set("tab", "credits")
      prev.set("creditTab", newSubTab)
      return prev
    })
  }

  return (
    <div className="space-y-6">
      {/* 1. Wallet Overview Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            Ví lượt tư vấn
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý số dư lượt tư vấn, mua thêm lượt và theo dõi lịch sử giao dịch minh bạch.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refreshAll()}
          disabled={loadingWallet || loadingPackages || loadingOrders || loadingLedger}
          className="gap-2 shadow-xs shrink-0"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loadingWallet || loadingPackages || loadingOrders || loadingLedger
                ? "animate-spin"
                : ""
            }`}
          />
          Làm mới ví & gói
        </Button>
      </div>

      {/* 2. Wallet Summary Cards */}
      <WalletSummaryCards
        wallet={wallet}
        loading={loadingWallet}
        error={walletError}
        onRetry={loadWallet}
      />

      {/* 3. Sub Tabs */}
      <Tabs value={creditSubTab} onValueChange={handleSubTabChange} className="space-y-6">
        <div className="border-b border-border pb-1">
          <TabsList className="bg-muted/60 p-1">
            <TabsTrigger value="packages" className="gap-2 text-xs font-medium">
              <Package className="h-4 w-4" />
              Gói lượt tư vấn
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2 text-xs font-medium">
              <ShoppingBag className="h-4 w-4" />
              Lịch sử đơn mua
            </TabsTrigger>
            <TabsTrigger value="ledger" className="gap-2 text-xs font-medium">
              <History className="h-4 w-4" />
              Biến động lượt
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Gói lượt tư vấn */}
        <TabsContent value="packages" className="space-y-4 focus-visible:outline-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Danh sách gói lượt đang mở bán
              </h3>
              <p className="text-xs text-muted-foreground">
                Chọn gói lượt phù hợp để nạp thêm vào ví tư vấn của bạn.
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

        {/* Tab 2: Lịch sử đơn mua */}
        <TabsContent value="orders" className="space-y-4 focus-visible:outline-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Lịch sử đơn mua</h3>
              <p className="text-xs text-muted-foreground">
                Xem lại danh sách tất cả các đơn mua gói lượt tư vấn của bạn.
              </p>
            </div>
          </div>

          <OrdersHistoryTable
            ordersData={orders}
            loading={loadingOrders}
            error={ordersError}
            page={ordersPage}
            onPageChange={loadOrders}
            onViewDetail={handleOpenOrderDetail}
            onRetry={() => void loadOrders(ordersPage)}
          />
        </TabsContent>

        {/* Tab 3: Biến động lượt */}
        <TabsContent value="ledger" className="space-y-4 focus-visible:outline-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Lịch sử biến động lượt
              </h3>
              <p className="text-xs text-muted-foreground">
                Nhật ký chi tiết các giao dịch mua, giữ lượt và sử dụng lượt tư vấn.
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

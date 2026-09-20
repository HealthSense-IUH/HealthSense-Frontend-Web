import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import {
  Coins,
  History,
  Package,
  RefreshCw,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
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
import type { CreditPackage } from "@/types/credits"

export default function CreditsPage() {
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
    // 1. Thông báo mua thành công
    toast({
      title: "Thành công",
      description: "Mua lượt tư vấn giả lập thành công!",
    })

    // 2. Tách biệt lỗi POST và GET: Cập nhật ví ngay lập tức từ snapshot response POST
    if (detail.wallet) {
      updateWalletDirectly(detail.wallet)
    }

    // 3. Tải lại danh sách đơn mua và ledger về trang 1
    void loadOrders(1)
    void loadLedger(1)
    void loadPackages()
  })

  // Nếu PayOS điều hướng về root /app/general/credits có query params,
  // chuyển tiếp về trang chuyên biệt payment-result để đối soát authoritative từ backend
  useEffect(() => {
    const codeParam = searchParams.get("code")
    const statusParam = searchParams.get("status")
    const cancelParam = searchParams.get("cancel")

    if (codeParam || statusParam || cancelParam) {
      navigate("/app/general/credits/payment/result", { replace: true })
    }
  }, [searchParams, navigate])

  // Chọn gói mở dialog
  const handleSelectPackage = (pkg: CreditPackage) => {
    purchaseState.selectPackage(pkg)
    setPurchaseDialogOpen(true)
  }

  // Mở chi tiết đơn hàng
  const handleOpenOrderDetail = (orderId: string) => {
    setDetailOrderId(orderId)
    setDetailDialogOpen(true)
    setSearchParams((prev) => {
      prev.set("orderId", orderId)
      return prev
    })
  }

  // Đóng chi tiết đơn hàng
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

  // Đổi tab
  const handleTabChange = (newTab: string) => {
    setSearchParams((prev) => {
      prev.set("tab", newTab)
      return prev
    })
  }

  // Chặn truy cập nếu không phải MEMBER
  if (!isMember) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-4 py-24 text-center">
        <ShieldAlert className="h-12 w-12 text-red-500" />
        <h2 className="text-2xl font-bold text-foreground">Truy cập bị từ chối</h2>
        <p className="text-sm text-muted-foreground">
          Chức năng Ví lượt tư vấn chỉ dành riêng cho tài khoản Hội viên (MEMBER).
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background p-6 rounded-2xl shadow-xs border border-border">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-xs shrink-0">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Lượt tư vấn
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 text-xs font-semibold">
                <Sparkles className="h-3 w-3" /> Hội viên
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Quản lý số dư ví lượt tư vấn, mua thêm lượt và theo dõi lịch sử giao dịch minh bạch.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refreshAll()}
            disabled={loadingWallet || loadingPackages || loadingOrders || loadingLedger}
            className="gap-2 shadow-xs"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loadingWallet || loadingPackages || loadingOrders || loadingLedger
                  ? "animate-spin"
                  : ""
              }`}
            />
            Làm mới
          </Button>
        </div>
      </div>

      {/* 2. Wallet Overview Cards */}
      <WalletSummaryCards
        wallet={wallet}
        loading={loadingWallet}
        error={walletError}
        onRetry={loadWallet}
      />

      {/* 3. Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
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

        {/* Tab 1: Gói lượt & Mua lượt */}
        <TabsContent value="packages" className="space-y-4 focus-visible:outline-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Danh sách gói lượt đang mở bán
              </h2>
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
              <h2 className="text-lg font-bold text-foreground">Lịch sử đơn mua</h2>
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

        {/* Tab 3: Biến động lượt tư vấn */}
        <TabsContent value="ledger" className="space-y-4 focus-visible:outline-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Lịch sử biến động lượt
              </h2>
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

      {/* 4. Purchase Confirmation & Success Dialog */}
      <PurchaseDialog
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
        purchaseState={purchaseState}
        onViewOrderDetail={handleOpenOrderDetail}
      />

      {/* 5. Order Detail Dialog (API 6) */}
      <OrderDetailDialog
        orderId={detailOrderId}
        open={detailDialogOpen}
        onOpenChange={handleCloseOrderDetail}
        onWalletUpdated={updateWalletDirectly}
      />
    </div>
  )
}

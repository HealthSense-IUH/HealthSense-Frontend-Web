import { useSearchParams } from "react-router-dom"
import {
  Coins,
  ReceiptText,
  User,
} from "lucide-react"

import { CreditPackagesTab } from "./components/credit-packages-tab"
import { MemberWalletDirectoryTab } from "./components/member-wallet-directory-tab"
import { TokenPaymentsTab } from "./components/token-payments-tab"

import { Page, PageBody, PageHeader } from "@/components/layout/page"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminCreditOperationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get("tab")
  const activeTab =
    tabParam === "wallet" || tabParam === "payments" || tabParam === "orders"
      ? tabParam === "orders"
        ? "payments"
        : tabParam
      : "packages"

  return (
    <Page>
      <PageHeader
        icon={<Coins className="w-5 h-5" />}
        title="Quản lý lượt tư vấn"
        description="Quản lý gói lượt, tra cứu ví thành viên, điều chỉnh delta và tổng kết thanh toán token toàn hệ thống."
      />

      <PageBody>
        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setSearchParams({ tab: val })}
          className="w-full space-y-6"
        >
          <TabsList className="grid grid-cols-3 max-w-xl w-full h-auto p-1 bg-muted/60 rounded-2xl">
            <TabsTrigger
              value="packages"
              className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1.5"
            >
              <Coins className="w-4 h-4" />
              Gói lượt tư vấn
            </TabsTrigger>
            <TabsTrigger
              value="wallet"
              className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1.5"
            >
              <User className="w-4 h-4" />
              Ví & Điều chỉnh
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1.5"
            >
              <ReceiptText className="w-4 h-4" />
              Tổng kết thanh toán
            </TabsTrigger>
          </TabsList>

          {/* =========================================================================
           * TAB 1: Credit Packages Catalog
           * ========================================================================= */}
          <TabsContent value="packages" className="space-y-6 m-0">
            <CreditPackagesTab />
          </TabsContent>

          {/* =========================================================================
           * TAB 2: Member Wallet Directory & Ledger & Manual Adjustment
           * ========================================================================= */}
          <TabsContent value="wallet" className="space-y-6 m-0">
            <MemberWalletDirectoryTab />
          </TabsContent>

          {/* =========================================================================
           * TAB 3: Tổng kết thanh toán token
           * ========================================================================= */}
          <TabsContent value="payments" className="space-y-6 m-0">
            <TokenPaymentsTab />
          </TabsContent>
        </Tabs>
      </PageBody>
    </Page>
  )
}

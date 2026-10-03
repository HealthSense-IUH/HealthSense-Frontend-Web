import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import {
  CreditCard,
  Users,
} from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { parseApiError } from "@/lib/errorHandler"
import { useTranslation } from "react-i18next"
import i18n from "@/lib/i18n"
import { creditsApi } from "@/services/credits.service"
import {
  getPaymentDateRangePreset,
  type PaymentDatePreset,
} from "@/constants/credits"
import type {
  AdminCreditOrderDetail,
  AdminCreditOrderSummary,
  AdminCreditPaymentOverview,
  CreditOrderStatus,
  CreditPaymentProvider,
} from "@/types/credits"

import { PaymentKpiCards } from "./payment-kpi-cards"
import { PaymentFilterBar } from "./payment-filter-bar"
import { PaymentOrdersTable } from "./payment-orders-table"
import { PaymentOrderDetailDialog } from "./payment-order-detail-dialog"
import { MemberCreditSummaryTable } from "./member-credit-summary-table"

export function TokenPaymentsTab() {
  const { t } = useTranslation("credits")
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  // 1. Read URL Search Params
  const subtabParam = searchParams.get("subtab")
  const activeSubtab = subtabParam === "members" ? "members" : "orders"

  const urlMemberId = searchParams.get("memberId") || ""
  const urlPreset = (searchParams.get("preset") as PaymentDatePreset) || "all"
  const urlFrom = searchParams.get("from") || ""
  const urlTo = searchParams.get("to") || ""
  const urlStatus = searchParams.get("status") || "ALL"
  const urlProvider = searchParams.get("provider") || "ALL"
  const urlPage = parseInt(searchParams.get("page") || "1", 10) || 1

  // 2. Global Filters State (Member & Dates)
  const [memberId, setMemberId] = useState<string>(urlMemberId)
  const [preset, setPreset] = useState<PaymentDatePreset>(urlPreset)
  const [fromDate, setFromDate] = useState<string | undefined>(urlFrom || undefined)
  const [toDate, setToDate] = useState<string | undefined>(urlTo || undefined)

  // 3. Orders Table State
  const [orders, setOrders] = useState<AdminCreditOrderSummary[]>([])
  const [orderStatus, setOrderStatus] = useState<string>(urlStatus)
  const [orderProvider, setOrderProvider] = useState<string>(urlProvider)
  const [orderPage, setOrderPage] = useState<number>(urlPage)
  const [orderTotalPages, setOrderTotalPages] = useState<number>(1)
  const [orderTotalElements, setOrderTotalElements] = useState<number>(0)
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false)

  // 4. KPI Overview State
  const [overview, setOverview] = useState<AdminCreditPaymentOverview | null>(null)
  const [loadingOverview, setLoadingOverview] = useState<boolean>(false)
  const [overviewError, setOverviewError] = useState<string | null>(null)

  // 5. Order Detail Dialog State
  const [orderDetail, setOrderDetail] = useState<AdminCreditOrderDetail | null>(null)
  const [loadingOrderDetail, setLoadingOrderDetail] = useState<boolean>(false)
  const [orderDetailError, setOrderDetailError] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false)

  // Sync state to URL Search Params helper
  const updateUrlParams = useCallback(
    (updates: {
      subtab?: string
      memberId?: string
      preset?: string
      from?: string
      to?: string
      status?: string
      provider?: string
      page?: number
    }) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)

        if (updates.subtab !== undefined) {
          if (updates.subtab === "orders") next.delete("subtab")
          else next.set("subtab", updates.subtab)
        }

        if (updates.memberId !== undefined) {
          if (!updates.memberId) next.delete("memberId")
          else next.set("memberId", updates.memberId)
        }

        if (updates.preset !== undefined) {
          if (updates.preset === "all") next.delete("preset")
          else next.set("preset", updates.preset)
        }

        if (updates.from !== undefined) {
          if (!updates.from) next.delete("from")
          else next.set("from", updates.from)
        }

        if (updates.to !== undefined) {
          if (!updates.to) next.delete("to")
          else next.set("to", updates.to)
        }

        if (updates.status !== undefined) {
          if (updates.status === "ALL") next.delete("status")
          else next.set("status", updates.status)
        }

        if (updates.provider !== undefined) {
          if (updates.provider === "ALL") next.delete("provider")
          else next.set("provider", updates.provider)
        }

        if (updates.page !== undefined) {
          if (updates.page <= 1) next.delete("page")
          else next.set("page", String(updates.page))
        }

        return next
      })
    },
    [setSearchParams]
  )

  // 6. Fetch Overview KPI
  const fetchOverview = useCallback(
    async (mId?: string, from?: string, to?: string) => {
      setLoadingOverview(true)
      setOverviewError(null)
      try {
        const res = await creditsApi.adminGetPaymentOverview({
          memberId: mId?.trim() || undefined,
          from: from?.trim() || undefined,
          to: to?.trim() || undefined,
        })
        setOverview(res.data)
      } catch (err) {
        const parsed = parseApiError(err)
        setOverviewError(parsed.userMessage || i18n.t("credits:admin.tokenTab.errors.overview"))
      } finally {
        setLoadingOverview(false)
      }
    },
    []
  )

  // 7. Fetch Orders
  const fetchOrders = useCallback(
    async (
      page: number,
      mId?: string,
      status?: string,
      provider?: string,
      from?: string,
      to?: string
    ) => {
      setLoadingOrders(true)
      try {
        const res = await creditsApi.adminGetOrders({
          page,
          size: 20,
          memberId: mId?.trim() || undefined,
          status: status && status !== "ALL" ? (status as CreditOrderStatus) : undefined,
          provider: provider && provider !== "ALL" ? (provider as CreditPaymentProvider) : undefined,
          from: from?.trim() || undefined,
          to: to?.trim() || undefined,
        })
        const data = res.data
        setOrders(data.content || [])
        setOrderPage(data.page || page)
        setOrderTotalPages(data.totalPages || 1)
        setOrderTotalElements(data.totalElements || 0)
      } catch (err) {
        const parsed = parseApiError(err)
        toast({
          variant: "destructive",
          title: i18n.t("credits:admin.tokenTab.errors.ordersTitle"),
          description: parsed.userMessage || i18n.t("credits:admin.tokenTab.errors.orders"),
        })
      } finally {
        setLoadingOrders(false)
      }
    },
    [toast]
  )

  // 8. Fetch Order Detail
  const handleOpenOrderDetail = async (orderId: string) => {
    setIsDetailOpen(true)
    setLoadingOrderDetail(true)
    setOrderDetailError(null)
    try {
      const res = await creditsApi.adminGetOrderDetail(orderId)
      setOrderDetail(res.data)
    } catch (err) {
      const parsed = parseApiError(err)
      setOrderDetailError(parsed.userMessage || t("orderDetail.loadError"))
    } finally {
      setLoadingOrderDetail(false)
    }
  }

  // Initial load
  const initialLoadDone = useRef(false)
  useEffect(() => {
    if (initialLoadDone.current) return
    initialLoadDone.current = true

    let initialFrom = fromDate
    let initialTo = toDate
    if (preset !== "all" && preset !== "custom" && (!initialFrom || !initialTo)) {
      const range = getPaymentDateRangePreset(preset)
      initialFrom = range.from
      initialTo = range.to
      setFromDate(range.from)
      setToDate(range.to)
    }

    void fetchOverview(memberId, initialFrom, initialTo)
    void fetchOrders(orderPage, memberId, orderStatus, orderProvider, initialFrom, initialTo)
  }, [fetchOverview, fetchOrders, memberId, fromDate, toDate, orderPage, orderStatus, orderProvider, preset])

  // Handle Subtab Switch
  const handleSubtabChange = (val: string) => {
    updateUrlParams({ subtab: val })
  }

  // Handle Preset Change
  const handlePresetChange = (nextPreset: PaymentDatePreset) => {
    setPreset(nextPreset)
    if (nextPreset !== "custom") {
      const range = getPaymentDateRangePreset(nextPreset)
      setFromDate(range.from)
      setToDate(range.to)
      setOrderPage(1)
      updateUrlParams({
        preset: nextPreset,
        from: range.from || "",
        to: range.to || "",
        page: 1,
      })
      void fetchOverview(memberId, range.from, range.to)
      void fetchOrders(1, memberId, orderStatus, orderProvider, range.from, range.to)
    } else {
      updateUrlParams({ preset: "custom" })
    }
  }

  // Handle Custom Date Range Change
  const handleCustomDateChange = (from?: string, to?: string) => {
    setFromDate(from)
    setToDate(to)
    setOrderPage(1)
    updateUrlParams({
      from: from || "",
      to: to || "",
      page: 1,
    })
    void fetchOverview(memberId, from, to)
    void fetchOrders(1, memberId, orderStatus, orderProvider, from, to)
  }

  // Handle Refresh
  const handleRefresh = () => {
    void fetchOverview(memberId, fromDate, toDate)
    void fetchOrders(orderPage, memberId, orderStatus, orderProvider, fromDate, toDate)
  }

  // Handle Select Member
  const handleSelectMember = (selectedMemberId: string) => {
    setMemberId(selectedMemberId)
    setOrderPage(1)
    updateUrlParams({
      subtab: "orders",
      memberId: selectedMemberId,
      page: 1,
    })
    void fetchOverview(selectedMemberId, fromDate, toDate)
    void fetchOrders(1, selectedMemberId, orderStatus, orderProvider, fromDate, toDate)
  }

  // Handle Clear Member Filter
  const handleClearMemberFilter = () => {
    setMemberId("")
    setOrderPage(1)
    updateUrlParams({
      memberId: "",
      page: 1,
    })
    void fetchOverview("", fromDate, toDate)
    void fetchOrders(1, "", orderStatus, orderProvider, fromDate, toDate)
  }

  // Handle Order Status Filter Change
  const handleOrderStatusChange = (newStatus: string) => {
    setOrderStatus(newStatus)
    setOrderPage(1)
    updateUrlParams({
      status: newStatus,
      page: 1,
    })
    void fetchOrders(1, memberId, newStatus, orderProvider, fromDate, toDate)
  }

  // Handle Order Provider Filter Change
  const handleOrderProviderChange = (newProvider: string) => {
    setOrderProvider(newProvider)
    setOrderPage(1)
    updateUrlParams({
      provider: newProvider,
      page: 1,
    })
    void fetchOrders(1, memberId, orderStatus, newProvider, fromDate, toDate)
  }

  // Handle Orders Page Change
  const handleOrderPageChange = (newPage: number) => {
    setOrderPage(newPage)
    updateUrlParams({ page: newPage })
    void fetchOrders(newPage, memberId, orderStatus, orderProvider, fromDate, toDate)
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <PaymentFilterBar
        preset={preset}
        onPresetChange={handlePresetChange}
        from={fromDate}
        to={toDate}
        onCustomDateChange={handleCustomDateChange}
        memberId={memberId}
        onClearMemberFilter={handleClearMemberFilter}
        onRefresh={handleRefresh}
        loading={loadingOverview || loadingOrders}
      />

      {/* KPI Overview Cards */}
      <PaymentKpiCards
        overview={overview}
        loading={loadingOverview}
        error={overviewError}
        onRetry={() => void fetchOverview(memberId, fromDate, toDate)}
        isMemberFiltered={Boolean(memberId)}
      />

      {/* Dual Sub-Tabs (Orders vs Member Directory) */}
      <Tabs value={activeSubtab} onValueChange={handleSubtabChange} className="w-full space-y-4">
        <TabsList className="grid grid-cols-2 max-w-md w-full h-auto p-1 bg-muted/60 rounded-2xl">
          <TabsTrigger
            value="orders"
            className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1.5"
          >
            <CreditCard className="w-4 h-4" />
            {t("admin.tokenTab.subtabs.orders")}
          </TabsTrigger>
          <TabsTrigger
            value="members"
            className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1.5"
          >
            <Users className="w-4 h-4" />
            {t("admin.tokenTab.subtabs.members")}
          </TabsTrigger>
        </TabsList>

        {/* SUBTAB 1: Danh sách giao dịch / Đơn mua token */}
        <TabsContent value="orders" className="m-0 focus-visible:outline-none">
          <PaymentOrdersTable
            orders={orders}
            loading={loadingOrders}
            page={orderPage}
            totalPages={orderTotalPages}
            totalElements={orderTotalElements}
            onPageChange={handleOrderPageChange}
            statusFilter={orderStatus}
            onStatusFilterChange={handleOrderStatusChange}
            providerFilter={orderProvider}
            onProviderFilterChange={handleOrderProviderChange}
            onSelectMember={handleSelectMember}
            onViewDetail={handleOpenOrderDetail}
            onRefresh={() =>
              void fetchOrders(orderPage, memberId, orderStatus, orderProvider, fromDate, toDate)
            }
          />
        </TabsContent>

        {/* SUBTAB 2: Thống kê nạp token theo thành viên (Lifetime stats) */}
        <TabsContent value="members" className="m-0 focus-visible:outline-none">
          <MemberCreditSummaryTable
            onSelectMemberForOrders={handleSelectMember}
            activeMemberId={memberId}
          />
        </TabsContent>
      </Tabs>

      {/* Order Detail Modal */}
      <PaymentOrderDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        orderDetail={orderDetail}
        loading={loadingOrderDetail}
        error={orderDetailError}
      />
    </div>
  )
}

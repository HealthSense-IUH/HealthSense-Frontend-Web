import { useCallback, useEffect, useState } from "react"
import { creditsApi } from "@/services/credits.service"
import { parseApiError } from "@/lib/errorHandler"
import i18n from "@/lib/i18n"
import type { PageResponse } from "@/types/base"
import type {
  CreditLedgerEntry,
  CreditOrderSummary,
  CreditPackage,
  CreditWallet,
  MemberCreditPaymentOverview,
  CreditOrderStatus,
} from "@/types/credits"
import type { PaymentDatePreset } from "@/constants/credits"

export function useCreditsData() {
  // 1. Wallet state
  const [wallet, setWallet] = useState<CreditWallet | null>(null)
  const [loadingWallet, setLoadingWallet] = useState(true)
  const [walletError, setWalletError] = useState<string | null>(null)

  // 2. Packages state
  const [packages, setPackages] = useState<CreditPackage[]>([])
  const [loadingPackages, setLoadingPackages] = useState(true)
  const [packagesError, setPackagesError] = useState<string | null>(null)
  const [isFeatureDisabled, setIsFeatureDisabled] = useState(false)

  // 3. Payment Overview state
  const [overview, setOverview] = useState<MemberCreditPaymentOverview | null>(null)
  const [loadingOverview, setLoadingOverview] = useState(true)
  const [overviewError, setOverviewError] = useState<string | null>(null)

  // 4. Orders history & filters state
  const [ordersPage, setOrdersPage] = useState(1)
  const [ordersSize, setOrdersSize] = useState(10)
  const [datePreset, setDatePreset] = useState<PaymentDatePreset>("all")
  const [dateFrom, setDateFrom] = useState<string | undefined>(undefined)
  const [dateTo, setDateTo] = useState<string | undefined>(undefined)
  const [orderStatus, setOrderStatus] = useState<CreditOrderStatus | undefined>(undefined)

  const [orders, setOrders] = useState<PageResponse<CreditOrderSummary> | null>(null)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [ordersError, setOrdersError] = useState<string | null>(null)

  // 5. Ledger state
  const [ledgerPage, setLedgerPage] = useState(1)
  const [ledger, setLedger] = useState<PageResponse<CreditLedgerEntry> | null>(null)
  const [loadingLedger, setLoadingLedger] = useState(true)
  const [ledgerError, setLedgerError] = useState<string | null>(null)

  // Fetch Wallet
  const loadWallet = useCallback(async () => {
    try {
      setLoadingWallet(true)
      setWalletError(null)
      const res = await creditsApi.getWallet()
      setWallet(res.data)
    } catch (err) {
      const parsed = parseApiError(err)
      setWalletError(parsed.userMessage || i18n.t("credits:data.errors.wallet"))
    } finally {
      setLoadingWallet(false)
    }
  }, [])

  // Fetch Packages
  const loadPackages = useCallback(async () => {
    try {
      setLoadingPackages(true)
      setPackagesError(null)
      setIsFeatureDisabled(false)
      const res = await creditsApi.getPackages()
      setPackages(res.data || [])
    } catch (err) {
      const parsed = parseApiError(err)
      if (parsed.statusCode === 503 || parsed.code === 4108) {
        setIsFeatureDisabled(true)
        setPackagesError(i18n.t("credits:purchase.errors.featureDisabled"))
      } else {
        setPackagesError(parsed.userMessage || i18n.t("credits:data.errors.packages"))
      }
    } finally {
      setLoadingPackages(false)
    }
  }, [])

  // Fetch Payment Overview
  const loadOverview = useCallback(async (params?: { from?: string; to?: string }) => {
    try {
      setLoadingOverview(true)
      setOverviewError(null)
      const res = await creditsApi.getPaymentOverview(params)
      setOverview(res.data)
      if (res.data?.wallet) {
        setWallet((prev) => (prev ? { ...prev, ...res.data.wallet } : null))
      }
    } catch (err) {
      const parsed = parseApiError(err)
      setOverviewError(parsed.userMessage || i18n.t("credits:data.errors.overview"))
    } finally {
      setLoadingOverview(false)
    }
  }, [])

  // Fetch Orders
  const loadOrders = useCallback(
    async (
      options?:
        | number
        | {
            page?: number
            size?: number
            status?: CreditOrderStatus
            from?: string
            to?: string
          }
    ) => {
      try {
        setLoadingOrders(true)
        setOrdersError(null)
        const opts = typeof options === "number" ? { page: options } : options
        const targetPage = opts?.page ?? ordersPage
        const targetSize = opts?.size ?? ordersSize
        const targetStatus = opts?.status !== undefined ? opts.status : orderStatus
        const targetFrom = opts?.from !== undefined ? opts.from : dateFrom
        const targetTo = opts?.to !== undefined ? opts.to : dateTo

        const res = await creditsApi.getOrders({
          page: targetPage,
          size: targetSize,
          status: targetStatus,
          from: targetFrom,
          to: targetTo,
        })
        setOrders(res.data)
        setOrdersPage(targetPage)
      } catch (err) {
        const parsed = parseApiError(err)
        setOrdersError(parsed.userMessage || i18n.t("credits:data.errors.orders"))
      } finally {
        setLoadingOrders(false)
      }
    },
    [ordersPage, ordersSize, orderStatus, dateFrom, dateTo]
  )

  // Fetch Ledger
  const loadLedger = useCallback(async (targetPage = 1) => {
    try {
      setLoadingLedger(true)
      setLedgerError(null)
      const res = await creditsApi.getLedger({ page: targetPage, size: 10 })
      setLedger(res.data)
      setLedgerPage(targetPage)
    } catch (err) {
      const parsed = parseApiError(err)
      setLedgerError(parsed.userMessage || i18n.t("credits:data.errors.ledger"))
    } finally {
      setLoadingLedger(false)
    }
  }, [])

  // Filter triggers
  const handleDatePresetChange = useCallback(
    (nextPreset: PaymentDatePreset, nextFrom?: string, nextTo?: string) => {
      setDatePreset(nextPreset)
      setDateFrom(nextFrom)
      setDateTo(nextTo)
      setOrdersPage(1)
      void loadOverview({ from: nextFrom, to: nextTo })
      void loadOrders({
        page: 1,
        size: ordersSize,
        status: orderStatus,
        from: nextFrom,
        to: nextTo,
      })
    },
    [loadOverview, loadOrders, ordersSize, orderStatus]
  )

  const handleStatusChange = useCallback(
    (nextStatus?: CreditOrderStatus) => {
      setOrderStatus(nextStatus)
      setOrdersPage(1)
      void loadOrders({
        page: 1,
        size: ordersSize,
        status: nextStatus,
        from: dateFrom,
        to: dateTo,
      })
    },
    [loadOrders, ordersSize, dateFrom, dateTo]
  )

  const handlePageSizeChange = useCallback(
    (nextSize: number) => {
      setOrdersSize(nextSize)
      setOrdersPage(1)
      void loadOrders({
        page: 1,
        size: nextSize,
        status: orderStatus,
        from: dateFrom,
        to: dateTo,
      })
    },
    [loadOrders, orderStatus, dateFrom, dateTo]
  )

  const handlePageChange = useCallback(
    (nextPage: number) => {
      setOrdersPage(nextPage)
      void loadOrders({
        page: nextPage,
        size: ordersSize,
        status: orderStatus,
        from: dateFrom,
        to: dateTo,
      })
    },
    [loadOrders, ordersSize, orderStatus, dateFrom, dateTo]
  )

  const resetFilters = useCallback(() => {
    setDatePreset("all")
    setDateFrom(undefined)
    setDateTo(undefined)
    setOrderStatus(undefined)
    setOrdersPage(1)
    void loadOverview({ from: undefined, to: undefined })
    void loadOrders({
      page: 1,
      size: ordersSize,
      status: undefined,
      from: undefined,
      to: undefined,
    })
  }, [loadOverview, loadOrders, ordersSize])

  const refreshOrdersTab = useCallback(async () => {
    await Promise.allSettled([
      loadOverview({ from: dateFrom, to: dateTo }),
      loadOrders({
        page: ordersPage,
        size: ordersSize,
        status: orderStatus,
        from: dateFrom,
        to: dateTo,
      }),
      loadWallet(),
    ])
  }, [loadOverview, loadOrders, loadWallet, dateFrom, dateTo, ordersPage, ordersSize, orderStatus])

  // Cập nhật ví trực tiếp từ snapshot response của POST (tách lỗi POST khỏi lỗi GET)
  const updateWalletDirectly = useCallback((newWallet: CreditWallet) => {
    setWallet(newWallet)
  }, [])

  // Refresh toàn bộ sau mua thành công hoặc bấm nút Làm mới chung
  const refreshAll = useCallback(async () => {
    await Promise.allSettled([
      loadWallet(),
      loadPackages(),
      loadOverview({ from: dateFrom, to: dateTo }),
      loadOrders({
        page: ordersPage,
        size: ordersSize,
        status: orderStatus,
        from: dateFrom,
        to: dateTo,
      }),
      loadLedger(1),
    ])
  }, [
    loadWallet,
    loadPackages,
    loadOverview,
    loadOrders,
    loadLedger,
    dateFrom,
    dateTo,
    ordersPage,
    ordersSize,
    orderStatus,
  ])

  // Tải dữ liệu ban đầu
  useEffect(() => {
    void refreshAll()
  }, [])

  // Lắng nghe sự kiện toàn cục khi phiên tư vấn thay đổi trạng thái hoặc giữ/trả lượt
  useEffect(() => {
    const handleRefresh = () => {
      void refreshAll()
    }
    window.addEventListener("credits:refresh", handleRefresh)
    return () => {
      window.removeEventListener("credits:refresh", handleRefresh)
    }
  }, [refreshAll])

  return {
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
  }
}

import { useCallback, useEffect, useState } from "react"
import { creditsApi } from "@/services/credits.service"
import { parseApiError } from "@/lib/errorHandler"
import type { PageResponse } from "@/types/base"
import type {
  CreditLedgerEntry,
  CreditOrderSummary,
  CreditPackage,
  CreditWallet,
} from "@/types/credits"

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

  // 3. Orders history state
  const [ordersPage, setOrdersPage] = useState(1)
  const [orders, setOrders] = useState<PageResponse<CreditOrderSummary> | null>(null)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [ordersError, setOrdersError] = useState<string | null>(null)

  // 4. Ledger state
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
      setWalletError(parsed.userMessage || "Không thể tải thông tin ví.")
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
        setPackagesError("Chức năng mua lượt tư vấn tạm thời chưa khả dụng.")
      } else {
        setPackagesError(parsed.userMessage || "Không thể tải danh sách gói lượt.")
      }
    } finally {
      setLoadingPackages(false)
    }
  }, [])

  // Fetch Orders
  const loadOrders = useCallback(async (targetPage = 1) => {
    try {
      setLoadingOrders(true)
      setOrdersError(null)
      const res = await creditsApi.getOrders({ page: targetPage, size: 10 })
      setOrders(res.data)
      setOrdersPage(targetPage)
    } catch (err) {
      const parsed = parseApiError(err)
      setOrdersError(parsed.userMessage || "Không thể tải lịch sử đơn mua.")
    } finally {
      setLoadingOrders(false)
    }
  }, [])

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
      setLedgerError(parsed.userMessage || "Không thể tải lịch sử biến động lượt.")
    } finally {
      setLoadingLedger(false)
    }
  }, [])

  // Cập nhật ví trực tiếp từ snapshot response của POST (tách lỗi POST khỏi lỗi GET)
  const updateWalletDirectly = useCallback((newWallet: CreditWallet) => {
    setWallet(newWallet)
  }, [])

  // Refresh toàn bộ sau mua thành công hoặc bấm nút Làm mới
  const refreshAll = useCallback(async () => {
    await Promise.allSettled([
      loadWallet(),
      loadPackages(),
      loadOrders(1),
      loadLedger(1),
    ])
  }, [loadWallet, loadPackages, loadOrders, loadLedger])

  // Tải dữ liệu ban đầu
  useEffect(() => {
    void refreshAll()
  }, [refreshAll])

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
  }
}

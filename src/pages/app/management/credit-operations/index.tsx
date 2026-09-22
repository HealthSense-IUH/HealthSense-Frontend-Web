import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  FileSpreadsheet,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Undo2,
  User,
  Wrench,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/stores/auth-store"
import { parseApiError } from "@/lib/errorHandler"
import { creditsApi } from "@/services/credits.service"
import {
  CREDIT_OPERATION_CONFIG,
  CREDIT_ORDER_STATUS_CONFIG,
  CREDIT_PAYMENT_PROVIDER_CONFIG,
  CREDIT_PAYMENT_STATUS_CONFIG,
  CREDIT_SOURCE_TYPE_CONFIG,
  formatVndPrice,
  generateCreditIdempotencyKey,
} from "@/constants/credits"
import type {
  AdminCreditLedgerEntry,
  AdminCreditOrderDetail,
  AdminCreditOrderSummary,
  AdminMemberWallet,
  CreditMutationResponse,
  CreditOperation,
  CreditOrderStatus,
  CreditPaymentProvider,
  CreditRecoveryResult,
  CreditSourceType,
  CreditWalletReconciliation,
} from "@/types/credits"

export default function AdminCreditOperationsPage() {
  const { toast } = useToast()
  const userSession = useAuthStore((state) => state.userSession)
  const actorId = userSession?.userId || "ADMIN"

  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("tab") || "wallet"

  /* =========================================================================
   * TAB 1: Member Wallet & Ledger & Manual Adjustment
   * ========================================================================= */
  const [memberIdInput, setMemberIdInput] = useState("")
  const [currentMemberId, setCurrentMemberId] = useState("")
  const [memberWallet, setMemberWallet] = useState<AdminMemberWallet | null>(null)
  const [loadingWallet, setLoadingWallet] = useState(false)

  // Ledger state
  const [ledgerEntries, setLedgerEntries] = useState<AdminCreditLedgerEntry[]>([])
  const [ledgerPage, setLedgerPage] = useState(1)
  const [ledgerTotalPages, setLedgerTotalPages] = useState(1)
  const [loadingLedger, setLoadingLedger] = useState(false)
  const [ledgerOperationFilter, setLedgerOperationFilter] = useState<string>("ALL")
  const [ledgerSourceTypeFilter, setLedgerSourceTypeFilter] = useState<string>("ALL")

  // Adjustment dialog state
  const [isAdjustOpen, setIsAdjustOpen] = useState(false)
  const [adjustDelta, setAdjustDelta] = useState<number>(1)
  const [adjustReason, setAdjustReason] = useState("")
  const [adjustSubmitting, setAdjustSubmitting] = useState(false)
  const adjustSubmittingRef = useRef(false)

  const loadMemberWalletAndLedger = useCallback(
    async (mId: string, page = 1) => {
      if (!mId.trim()) return
      setLoadingWallet(true)
      setLoadingLedger(true)
      try {
        const [wRes, lRes] = await Promise.all([
          creditsApi.adminGetWallet(mId.trim()),
          creditsApi.adminGetLedger(mId.trim(), {
            page,
            size: 10,
            operation:
              ledgerOperationFilter !== "ALL"
                ? (ledgerOperationFilter as CreditOperation)
                : undefined,
            sourceType:
              ledgerSourceTypeFilter !== "ALL"
                ? (ledgerSourceTypeFilter as CreditSourceType)
                : undefined,
          }),
        ])
        setMemberWallet(wRes.data)
        setCurrentMemberId(mId.trim())
        setLedgerEntries(lRes.data.content || [])
        setLedgerPage(lRes.data.page || page)
        setLedgerTotalPages(lRes.data.totalPages || 1)
      } catch (err) {
        const parsed = parseApiError(err)
        toast({
          variant: "destructive",
          title: "Không tìm thấy thông tin ví",
          description: parsed.userMessage || `Không thể tra cứu ví thành viên #${mId}.`,
        })
      } finally {
        setLoadingWallet(false)
        setLoadingLedger(false)
      }
    },
    [ledgerOperationFilter, ledgerSourceTypeFilter, toast]
  )

  const handleSearchMemberWallet = (e: React.FormEvent) => {
    e.preventDefault()
    if (!memberIdInput.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu mã thành viên",
        description: "Vui lòng nhập ID thành viên để tra cứu ví.",
      })
      return
    }
    void loadMemberWalletAndLedger(memberIdInput.trim(), 1)
  }

  // Handle manual adjustment submit
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (adjustSubmittingRef.current || !currentMemberId) return

    if (adjustDelta === 0) {
      toast({
        variant: "destructive",
        title: "Số lượt điều chỉnh không hợp lệ",
        description: "Số lượt điều chỉnh delta phải khác 0 (dương để cộng, âm để trừ).",
      })
      return
    }

    if (!adjustReason.trim() || adjustReason.trim().length > 500) {
      toast({
        variant: "destructive",
        title: "Lý do không hợp lệ",
        description: "Lý do điều chỉnh là bắt buộc và tối đa 500 ký tự.",
      })
      return
    }

    // Client warning if subtracting more than available (backend 4100 is authoritative)
    if (memberWallet && adjustDelta < 0) {
      const available = memberWallet.balance - memberWallet.reserved
      if (Math.abs(adjustDelta) > available) {
        if (
          !window.confirm(
            `Cảnh báo: Lượt trừ (${Math.abs(adjustDelta)}) vượt quá số lượt khả dụng (${available}) của thành viên. Tiếp tục gửi lên hệ thống?`
          )
        ) {
          return
        }
      }
    }

    adjustSubmittingRef.current = true
    setAdjustSubmitting(true)
    const idempotencyKey = generateCreditIdempotencyKey(
      `ADJUST:${actorId}:${currentMemberId}:${adjustDelta}`
    )

    try {
      const res = await creditsApi.adminAdjustCredits(
        currentMemberId,
        { delta: Number(adjustDelta), reason: adjustReason.trim() },
        idempotencyKey
      )

      toast({
        title: "Điều chỉnh lượt thành công",
        description: `Đã ${adjustDelta > 0 ? "cộng" : "trừ"} ${Math.abs(adjustDelta)} lượt cho thành viên #${currentMemberId}.`,
      })

      // Update wallet directly from snapshot
      if (res.data.wallet) {
        setMemberWallet((prev: AdminMemberWallet | null) =>
          prev ? { ...prev, ...res.data.wallet } : (res.data.wallet as AdminMemberWallet)
        )
      }
      setIsAdjustOpen(false)
      setAdjustReason("")
      setAdjustDelta(1)

      // Refresh ledger
      void loadMemberWalletAndLedger(currentMemberId, 1)
    } catch (err: any) {
      const parsed = parseApiError(err)
      const status = err?.response?.status
      const code = err?.response?.data?.code || err?.response?.data?.errorCode

      if (status === 409 && (code === 4100 || String(code) === "4100")) {
        toast({
          variant: "destructive",
          title: "Không đủ lượt khả dụng",
          description: "Số dư khả dụng của thành viên không đủ để thực hiện lượt trừ này.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Điều chỉnh thất bại",
          description: parsed.userMessage || "Không thể thực hiện điều chỉnh ví.",
        })
      }
    } finally {
      adjustSubmittingRef.current = false
      setAdjustSubmitting(false)
    }
  }

  /* =========================================================================
   * TAB 2: Orders & Payment Attempts
   * ========================================================================= */
  const [orders, setOrders] = useState<AdminCreditOrderSummary[]>([])
  const [ordersPage, setOrdersPage] = useState(1)
  const [ordersTotalPages, setOrdersTotalPages] = useState(1)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [orderMemberFilter, setOrderMemberFilter] = useState("")
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL")
  const [orderProviderFilter, setOrderProviderFilter] = useState<string>("ALL")

  // Order detail dialog
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<AdminCreditOrderDetail | null>(
    null
  )
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false)
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false)

  const loadAdminOrders = useCallback(
    async (page = 1) => {
      setLoadingOrders(true)
      try {
        const res = await creditsApi.adminGetOrders({
          page,
          size: 10,
          memberId: orderMemberFilter.trim() || undefined,
          status:
            orderStatusFilter !== "ALL"
              ? (orderStatusFilter as CreditOrderStatus)
              : undefined,
          provider:
            orderProviderFilter !== "ALL"
              ? (orderProviderFilter as CreditPaymentProvider)
              : undefined,
        })
        setOrders(res.data.content || [])
        setOrdersPage(res.data.page || page)
        setOrdersTotalPages(res.data.totalPages || 1)
      } catch (err) {
        const parsed = parseApiError(err)
        toast({
          variant: "destructive",
          title: "Lỗi tải đơn mua",
          description: parsed.userMessage || "Không thể tải danh sách đơn mua.",
        })
      } finally {
        setLoadingOrders(false)
      }
    },
    [orderMemberFilter, orderStatusFilter, orderProviderFilter, toast]
  )

  const handleOpenOrderDetail = async (orderId: string) => {
    setLoadingOrderDetail(true)
    setIsOrderDetailOpen(true)
    try {
      const res = await creditsApi.adminGetOrderDetail(orderId)
      setSelectedOrderDetail(res.data)
    } catch (err) {
      const parsed = parseApiError(err)
      toast({
        variant: "destructive",
        title: "Lỗi tải chi tiết đơn",
        description: parsed.userMessage || "Không thể tải chi tiết đơn hàng.",
      })
      setIsOrderDetailOpen(false)
    } finally {
      setLoadingOrderDetail(false)
    }
  }

  /* =========================================================================
   * TAB 3: Session Refund (Bồi hoàn lượt tư vấn)
   * ========================================================================= */
  const [refundSessionId, setRefundSessionId] = useState("")
  const [refundReason, setRefundReason] = useState("")
  const [refundSubmitting, setRefundSubmitting] = useState(false)
  const [refundResult, setRefundResult] = useState<CreditMutationResponse | null>(null)
  const refundSubmittingRef = useRef(false)

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (refundSubmittingRef.current) return

    if (!refundSessionId.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu mã phiên tư vấn",
        description: "Vui lòng nhập ID phiên tư vấn cần bồi hoàn lượt.",
      })
      return
    }

    if (!refundReason.trim() || refundReason.trim().length > 500) {
      toast({
        variant: "destructive",
        title: "Lý do không hợp lệ",
        description: "Vui lòng nhập lý do bồi hoàn lượt (tối đa 500 ký tự).",
      })
      return
    }

    refundSubmittingRef.current = true
    setRefundSubmitting(true)
    const idempotencyKey = generateCreditIdempotencyKey(
      `REFUND_SESSION:${actorId}:${refundSessionId.trim()}`
    )

    try {
      const res = await creditsApi.adminRefundSession(
        {
          sessionId: refundSessionId.trim(),
          reason: refundReason.trim(),
        },
        idempotencyKey
      )

      setRefundResult(res.data)
      toast({
        title: "Bồi hoàn lượt thành công",
        description: `Đã hoàn trả 1 lượt tư vấn cho phiên #${refundSessionId}.`,
      })
      setRefundSessionId("")
      setRefundReason("")
    } catch (err: any) {
      const parsed = parseApiError(err)
      const status = err?.response?.status
      const code = err?.response?.data?.code || err?.response?.data?.errorCode

      if (status === 409 || code === 4111 || String(code) === "4111") {
        toast({
          variant: "destructive",
          title: "Không đủ điều kiện bồi hoàn",
          description:
            "Phiên tư vấn này không đủ điều kiện bồi hoàn lượt (phiên chưa kết thúc, chưa bị trừ lượt hoặc đã được bồi hoàn trước đó).",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Bồi hoàn thất bại",
          description: parsed.userMessage || "Không thể thực hiện bồi hoàn lượt.",
        })
      }
    } finally {
      refundSubmittingRef.current = false
      setRefundSubmitting(false)
    }
  }

  /* =========================================================================
   * TAB 4: Reconciliation & Recovery
   * ========================================================================= */
  const [reconcileMemberId, setReconcileMemberId] = useState("")
  const [reconciliations, setReconciliations] = useState<CreditWalletReconciliation[]>([])
  const [loadingReconciliation, setLoadingReconciliation] = useState(false)

  // Recovery
  const [recoverySubmitting, setRecoverySubmitting] = useState(false)
  const [recoveryResult, setRecoveryResult] = useState<CreditRecoveryResult | null>(null)
  const recoverySubmittingRef = useRef(false)

  const loadReconciliation = useCallback(
    async (mId?: string) => {
      setLoadingReconciliation(true)
      try {
        const res = await creditsApi.adminGetReconciliation(mId?.trim() || undefined)
        setReconciliations(res.data || [])
      } catch (err) {
        const parsed = parseApiError(err)
        toast({
          variant: "destructive",
          title: "Lỗi tải dữ liệu đối soát",
          description: parsed.userMessage || "Không thể tải báo cáo đối soát ví.",
        })
      } finally {
        setLoadingReconciliation(false)
      }
    },
    [toast]
  )

  const handleRunRecovery = async () => {
    if (recoverySubmittingRef.current) return
    if (
      !window.confirm(
        "Bạn có chắc muốn chạy tiến trình rà soát & thu hồi lượt mồ côi (limit 50)? Tiến trình sẽ kiểm tra và giải phóng các reservation bị treo bất thường."
      )
    ) {
      return
    }

    recoverySubmittingRef.current = true
    setRecoverySubmitting(true)
    try {
      const res = await creditsApi.adminRunRecovery(50)
      setRecoveryResult(res.data)
      toast({
        title: "Hoàn tất rà soát & phục hồi",
        description: `Đã kiểm tra ${res.data.examined} lượt, giải phóng ${res.data.released} lượt mồ côi.`,
      })
      // Refresh reconciliation after recovery
      void loadReconciliation(reconcileMemberId)
    } catch (err) {
      const parsed = parseApiError(err)
      toast({
        variant: "destructive",
        title: "Rà soát thất bại",
        description: parsed.userMessage || "Không thể thực hiện rà soát lượt treo.",
      })
    } finally {
      recoverySubmittingRef.current = false
      setRecoverySubmitting(false)
    }
  }

  // Load active tab data on mount or tab change
  useEffect(() => {
    if (activeTab === "orders" && orders.length === 0) {
      void loadAdminOrders(1)
    } else if (activeTab === "reconcile" && reconciliations.length === 0) {
      void loadReconciliation()
    }
  }, [activeTab, loadAdminOrders, loadReconciliation, orders.length, reconciliations.length])

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Wrench className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Vận hành & Đối soát lượt tư vấn
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Tra cứu ví thành viên, điều chỉnh delta, kiểm tra đơn mua, bồi hoàn phiên và phục hồi lượt treo.
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setSearchParams({ tab: val })}
        className="w-full space-y-6"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-muted/60 rounded-2xl">
          <TabsTrigger
            value="wallet"
            className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1.5"
          >
            <User className="w-4 h-4" />
            Ví & Điều chỉnh
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1.5"
          >
            <CreditCard className="w-4 h-4" />
            Đơn mua & Attempts
          </TabsTrigger>
          <TabsTrigger
            value="refund"
            className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1.5"
          >
            <Undo2 className="w-4 h-4" />
            Bồi hoàn phiên
          </TabsTrigger>
          <TabsTrigger
            value="reconcile"
            className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            Đối soát & Phục hồi
          </TabsTrigger>
        </TabsList>

        {/* =========================================================================
         * TAB 1: Member Wallet & Ledger & Manual Adjustment
         * ========================================================================= */}
        <TabsContent value="wallet" className="space-y-6 m-0">
          {/* Member Search Card */}
          <Card className="rounded-2xl border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Tra cứu ví thành viên</CardTitle>
              <CardDescription className="text-xs">
                Nhập Member ID để xem số dư ví tức thời, lịch sử biến động ledger và thực hiện điều chỉnh delta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSearchMemberWallet}
                className="flex flex-col sm:flex-row items-center gap-3"
              >
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Nhập Member ID (VD: 10001, usr_abc...)"
                    value={memberIdInput}
                    onChange={(e) => setMemberIdInput(e.target.value)}
                    className="pl-9 h-10 rounded-xl text-xs"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loadingWallet}
                  className="w-full sm:w-auto h-10 rounded-xl gap-2 font-semibold shadow-xs"
                >
                  <Search className="w-4 h-4" />
                  {loadingWallet ? "Đang tra cứu..." : "Tra cứu ví"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Wallet Summary Stats */}
          {memberWallet && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-muted/20 p-4 rounded-2xl border">
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    Ví lượt của thành viên: #{currentMemberId}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Ví ID: <span className="font-mono">{memberWallet.id}</span> • Phiên bản:{" "}
                    <span className="font-mono">v{memberWallet.version}</span>
                  </p>
                </div>
                <Button
                  onClick={() => setIsAdjustOpen(true)}
                  className="rounded-xl gap-2 font-semibold shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  Điều chỉnh lượt thủ công
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Available */}
                <Card className="rounded-2xl border shadow-xs bg-emerald-500/5 border-emerald-500/20">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      Lượt khả dụng (Available)
                    </CardDescription>
                    <CardTitle className="text-3xl font-extrabold text-emerald-600 font-mono">
                      {memberWallet.balance - memberWallet.reserved}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-[11px] text-muted-foreground">
                      Số lượt thành viên có thể dùng để vào hàng đợi
                    </p>
                  </CardContent>
                </Card>

                {/* Reserved */}
                <Card className="rounded-2xl border shadow-xs bg-amber-500/5 border-amber-500/20">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                      Lượt đang tạm giữ (Reserved)
                    </CardDescription>
                    <CardTitle className="text-3xl font-extrabold text-amber-600 font-mono">
                      {memberWallet.reserved}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-[11px] text-muted-foreground">
                      Lượt giữ trong lúc chờ bác sĩ kết nối
                    </p>
                  </CardContent>
                </Card>

                {/* Total Balance */}
                <Card className="rounded-2xl border shadow-xs bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-semibold text-primary">
                      Tổng số dư ví (Balance)
                    </CardDescription>
                    <CardTitle className="text-3xl font-extrabold text-primary font-mono">
                      {memberWallet.balance}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-[11px] text-muted-foreground">
                      Tổng số lượt thuộc quyền sở hữu của thành viên
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Ledger Table */}
              <Card className="rounded-2xl border shadow-xs">
                <CardHeader className="pb-4 border-b">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <CardTitle className="text-base font-bold">
                        Lịch sử biến động lượt (Ledger)
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Danh sách bút toán số cái đã ghi nhận cho ví #{currentMemberId}
                      </CardDescription>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                      <Select
                        value={ledgerOperationFilter}
                        onValueChange={(val) => {
                          setLedgerOperationFilter(val)
                        }}
                      >
                        <SelectTrigger className="w-[150px] h-8 rounded-xl text-xs">
                          <SelectValue placeholder="Nghiệp vụ" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl text-xs">
                          <SelectItem value="ALL">Tất cả nghiệp vụ</SelectItem>
                          <SelectItem value="PURCHASE">Nạp lượt (PURCHASE)</SelectItem>
                          <SelectItem value="SESSION_CHARGE">Dùng lượt khi vào phiên (V2)</SelectItem>
                          <SelectItem value="RESERVE">Tạm giữ (RESERVE)</SelectItem>
                          <SelectItem value="CAPTURE">Quyết toán (CAPTURE)</SelectItem>
                          <SelectItem value="RELEASE">Hoàn trả (RELEASE)</SelectItem>
                          <SelectItem value="ADJUSTMENT">Admin điều chỉnh</SelectItem>
                          <SelectItem value="SESSION_REFUND">Bồi hoàn phiên</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={ledgerSourceTypeFilter}
                        onValueChange={(val) => {
                          setLedgerSourceTypeFilter(val)
                        }}
                      >
                        <SelectTrigger className="w-[140px] h-8 rounded-xl text-xs">
                          <SelectValue placeholder="Nguồn gốc" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl text-xs">
                          <SelectItem value="ALL">Tất cả nguồn</SelectItem>
                          <SelectItem value="ORDER">Đơn mua (ORDER)</SelectItem>
                          <SelectItem value="SESSION">Phiên khám (SESSION)</SelectItem>
                          <SelectItem value="ADMIN_ADJUSTMENT">Admin điều chỉnh</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void loadMemberWalletAndLedger(currentMemberId, 1)}
                        disabled={loadingLedger}
                        className="h-8 rounded-xl text-xs gap-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingLedger ? "animate-spin" : ""}`} />
                        Lọc
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="text-xs font-semibold">Thời gian</TableHead>
                          <TableHead className="text-xs font-semibold">Nghiệp vụ</TableHead>
                          <TableHead className="text-xs font-semibold text-center">
                            Biến động lượt
                          </TableHead>
                          <TableHead className="text-xs font-semibold text-center">
                            Δ Khả dụng / Δ Giữ
                          </TableHead>
                          <TableHead className="text-xs font-semibold text-center">
                            Số dư sau
                          </TableHead>
                          <TableHead className="text-xs font-semibold">Nguồn / Mã</TableHead>
                          <TableHead className="text-xs font-semibold">Người thực hiện / Lý do</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingLedger ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                              Đang tải biến động lượt...
                            </TableCell>
                          </TableRow>
                        ) : ledgerEntries.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                              Chưa có ghi nhận biến động lượt nào phù hợp.
                            </TableCell>
                          </TableRow>
                        ) : (
                          ledgerEntries.map((entry) => {
                            const opConfig = CREDIT_OPERATION_CONFIG[entry.operation] || {
                              label: entry.operation,
                              className: "bg-muted text-muted-foreground",
                            }
                            const isPositive = entry.deltaBalance > 0
                            const isNegative = entry.deltaBalance < 0
                            return (
                              <TableRow key={entry.id} className="hover:bg-muted/20">
                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                  {new Date(entry.createdAt).toLocaleDateString("vi-VN", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs font-medium ${opConfig.className}`}
                                  >
                                    {opConfig.label}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center font-mono font-bold text-xs">
                                  {isPositive && (
                                    <span className="text-emerald-600">+{entry.deltaBalance}</span>
                                  )}
                                  {isNegative && (
                                    <span className="text-destructive">{entry.deltaBalance}</span>
                                  )}
                                  {!isPositive && !isNegative && (
                                    <span className="text-muted-foreground">0</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                  <span>{entry.deltaBalance >= 0 ? `+${entry.deltaBalance}` : entry.deltaBalance}</span>
                                  {" / "}
                                  <span>{entry.deltaReserved >= 0 ? `+${entry.deltaReserved}` : entry.deltaReserved}</span>
                                </TableCell>
                                <TableCell className="text-center font-mono text-xs">
                                  <span className="font-semibold text-foreground">
                                    {entry.balanceAfter}
                                  </span>{" "}
                                  <span className="text-muted-foreground">
                                    (giữ {entry.reservedAfter})
                                  </span>
                                </TableCell>
                                <TableCell className="text-xs">
                                  <div className="font-semibold text-foreground">
                                    {CREDIT_SOURCE_TYPE_CONFIG[entry.sourceType]?.label || entry.sourceType}
                                  </div>
                                  <div className="font-mono text-[11px] text-muted-foreground truncate max-w-[120px]">
                                    {entry.sourceId}
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs">
                                  {entry.actorId && (
                                    <div className="text-[11px] text-primary font-medium">
                                      Bởi: {entry.actorId}
                                    </div>
                                  )}
                                  {entry.reason ? (
                                    <div className="text-xs text-muted-foreground line-clamp-1">
                                      {entry.reason}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>

                {ledgerTotalPages > 1 && (
                  <div className="flex items-center justify-between p-3 border-t text-xs">
                    <span className="text-muted-foreground">
                      Trang {ledgerPage} / {ledgerTotalPages}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={ledgerPage <= 1 || loadingLedger}
                        onClick={() => void loadMemberWalletAndLedger(currentMemberId, ledgerPage - 1)}
                        className="h-7 text-xs rounded-lg"
                      >
                        Trước
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={ledgerPage >= ledgerTotalPages || loadingLedger}
                        onClick={() => void loadMemberWalletAndLedger(currentMemberId, ledgerPage + 1)}
                        className="h-7 text-xs rounded-lg"
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Adjustment Dialog */}
          <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
            <DialogContent className="sm:max-w-[480px] rounded-2xl">
              <form onSubmit={handleAdjustSubmit}>
                <DialogHeader>
                  <div className="flex items-center gap-2 text-primary">
                    <PlusCircle className="w-5 h-5" />
                    <DialogTitle className="text-lg font-bold">Điều chỉnh lượt thủ công</DialogTitle>
                  </div>
                  <DialogDescription className="text-xs">
                    Thực hiện tăng/giảm delta lượt cho thành viên #{currentMemberId}. Tuyệt đối không can thiệp trực tiếp số dư tuyệt đối.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="p-3 bg-muted/40 rounded-xl border text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số dư hiện tại:</span>
                      <span className="font-mono font-bold text-foreground">
                        {memberWallet?.balance} lượt
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lượt đang tạm giữ:</span>
                      <span className="font-mono font-bold text-amber-600">
                        {memberWallet?.reserved} lượt
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span className="text-muted-foreground">Lượt khả dụng:</span>
                      <span className="font-mono font-bold text-emerald-600">
                        {(memberWallet?.balance || 0) - (memberWallet?.reserved || 0)} lượt
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="adjust-delta" className="text-xs font-semibold">
                      Số lượt điều chỉnh (Delta) <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="adjust-delta"
                        type="number"
                        step={1}
                        placeholder="VD: +2 để cộng, -1 để trừ"
                        value={adjustDelta}
                        onChange={(e) => setAdjustDelta(parseInt(e.target.value, 10) || 0)}
                        required
                        className="rounded-xl font-mono text-sm font-bold"
                      />
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setAdjustDelta((prev) => (prev <= 0 ? 1 : prev + 1))}
                          className="h-10 px-3 text-xs rounded-xl"
                        >
                          +1
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setAdjustDelta((prev) => (prev >= 0 ? -1 : prev - 1))}
                          className="h-10 px-3 text-xs rounded-xl text-destructive hover:text-destructive"
                        >
                          -1
                        </Button>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Số nguyên khác 0. Dấu dương (+) cộng thêm lượt, dấu âm (-) trừ bớt lượt.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="adjust-reason" className="text-xs font-semibold">
                      Lý do điều chỉnh <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="adjust-reason"
                      placeholder="VD: Bồi hoàn do hệ thống gặp lỗi kết nối video, hoặc tặng thêm lượt theo chương trình đặc biệt..."
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                      required
                      maxLength={500}
                      rows={3}
                      className="rounded-xl resize-none text-xs"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Bắt buộc ghi rõ lý do để lưu vết kiểm toán (Audit Trail).
                    </p>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAdjustOpen(false)}
                    disabled={adjustSubmitting}
                    className="rounded-xl"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={adjustSubmitting || adjustDelta === 0}
                    className="rounded-xl gap-2 font-semibold shadow-xs"
                  >
                    {adjustSubmitting ? "Đang xử lý..." : "Xác nhận điều chỉnh"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* =========================================================================
         * TAB 2: Orders & Payment Attempts
         * ========================================================================= */}
        <TabsContent value="orders" className="space-y-6 m-0">
          <Card className="rounded-2xl border shadow-xs">
            <CardHeader className="pb-4 border-b">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="text-base font-bold">Danh sách đơn mua lượt</CardTitle>
                  <CardDescription className="text-xs">
                    Tra cứu toàn bộ đơn mua lượt và các lần thử thanh toán (payment attempts)
                  </CardDescription>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                  <div className="relative w-full sm:w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Lọc theo Member ID..."
                      value={orderMemberFilter}
                      onChange={(e) => setOrderMemberFilter(e.target.value)}
                      className="pl-8 h-8 rounded-xl text-xs"
                    />
                  </div>

                  <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                    <SelectTrigger className="w-[140px] h-8 rounded-xl text-xs">
                      <SelectValue placeholder="Trạng thái đơn" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl text-xs">
                      <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                      <SelectItem value="PAID">Đã thanh toán (PAID)</SelectItem>
                      <SelectItem value="PENDING_PAYMENT">Chờ thanh toán</SelectItem>
                      <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                      <SelectItem value="EXPIRED">Đã hết hạn</SelectItem>
                      <SelectItem value="REQUIRES_REVIEW">Cần xem xét</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={orderProviderFilter} onValueChange={setOrderProviderFilter}>
                    <SelectTrigger className="w-[120px] h-8 rounded-xl text-xs">
                      <SelectValue placeholder="Cổng TT" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl text-xs">
                      <SelectItem value="ALL">Tất cả cổng</SelectItem>
                      <SelectItem value="MOCK">MOCK</SelectItem>
                      <SelectItem value="PAYOS">PayOS</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void loadAdminOrders(1)}
                    disabled={loadingOrders}
                    className="h-8 rounded-xl text-xs gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? "animate-spin" : ""}`} />
                    Lọc
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs font-semibold">Mã đơn hàng</TableHead>
                      <TableHead className="text-xs font-semibold">Thành viên</TableHead>
                      <TableHead className="text-xs font-semibold">Gói lượt</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Số lượt</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Số tiền</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Trạng thái</TableHead>
                      <TableHead className="text-xs font-semibold">Thời gian tạo</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingOrders ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-36 text-center text-xs text-muted-foreground">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                          Đang tải danh sách đơn hàng...
                        </TableCell>
                      </TableRow>
                    ) : orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-36 text-center text-xs text-muted-foreground">
                          Không tìm thấy đơn mua lượt nào phù hợp.
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((ord) => {
                        const statusConfig = CREDIT_ORDER_STATUS_CONFIG[ord.status] || {
                          label: ord.status,
                          className: "bg-muted text-muted-foreground",
                        }
                        return (
                          <TableRow key={ord.id} className="hover:bg-muted/20">
                            <TableCell className="font-mono text-xs font-semibold text-primary">
                              #{ord.id}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {ord.memberId ? `#${ord.memberId}` : "—"}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-xs text-foreground">
                                {ord.packageName}
                              </div>
                              <div className="font-mono text-[11px] text-muted-foreground">
                                {ord.packageCode}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-mono font-bold text-xs text-primary">
                              +{ord.creditQuantity}
                            </TableCell>
                            <TableCell className="text-right font-mono font-semibold text-xs">
                              {formatVndPrice(ord.amountVnd)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className={`text-xs font-medium ${statusConfig.className}`}
                              >
                                {statusConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(ord.createdAt).toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => void handleOpenOrderDetail(ord.id)}
                                className="h-8 px-2 text-xs gap-1 hover:text-primary rounded-lg"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Chi tiết
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>

            {ordersTotalPages > 1 && (
              <div className="flex items-center justify-between p-3 border-t text-xs">
                <span className="text-muted-foreground">
                  Trang {ordersPage} / {ordersTotalPages}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={ordersPage <= 1 || loadingOrders}
                    onClick={() => void loadAdminOrders(ordersPage - 1)}
                    className="h-7 text-xs rounded-lg"
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={ordersPage >= ordersTotalPages || loadingOrders}
                    onClick={() => void loadAdminOrders(ordersPage + 1)}
                    className="h-7 text-xs rounded-lg"
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Order Detail Modal */}
          <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
            <DialogContent className="sm:max-w-[550px] rounded-2xl">
              <DialogHeader>
                <div className="flex items-center gap-2 text-primary">
                  <CreditCard className="w-5 h-5" />
                  <DialogTitle className="text-lg font-bold">Chi tiết đơn mua lượt</DialogTitle>
                </div>
                <DialogDescription className="text-xs">
                  Mã đơn #{selectedOrderDetail?.order?.id} • Thành viên #{selectedOrderDetail?.memberId}
                </DialogDescription>
              </DialogHeader>

              {loadingOrderDetail ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                  Đang tải thông tin chi tiết đơn...
                </div>
              ) : selectedOrderDetail ? (
                <div className="space-y-4 py-2">
                  {/* Order summary box */}
                  <div className="p-3 bg-muted/30 rounded-xl border text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gói lượt:</span>
                      <span className="font-semibold text-foreground">
                        {selectedOrderDetail.order.packageName} ({selectedOrderDetail.order.packageCode})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số lượt:</span>
                      <span className="font-mono font-bold text-primary">
                        +{selectedOrderDetail.order.creditQuantity} lượt
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số tiền thanh toán:</span>
                      <span className="font-mono font-bold text-foreground">
                        {formatVndPrice(selectedOrderDetail.order.amountVnd)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-1.5">
                      <span className="text-muted-foreground">Trạng thái đơn:</span>
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium ${
                          CREDIT_ORDER_STATUS_CONFIG[selectedOrderDetail.order.status]?.className
                        }`}
                      >
                        {CREDIT_ORDER_STATUS_CONFIG[selectedOrderDetail.order.status]?.label}
                      </Badge>
                    </div>
                    {selectedOrderDetail.order.paidAt && (
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Thời gian thanh toán:</span>
                        <span>
                          {new Date(selectedOrderDetail.order.paidAt).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Payment Attempts Section */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Lịch sử cổng thanh toán ({selectedOrderDetail.attempts?.length || 0} lần thử)
                    </h4>
                    {selectedOrderDetail.attempts && selectedOrderDetail.attempts.length > 0 ? (
                      <div className="space-y-2">
                        {selectedOrderDetail.attempts.map((attempt) => {
                          const pConfig = CREDIT_PAYMENT_STATUS_CONFIG[attempt.status] || {
                            label: attempt.status,
                            className: "bg-muted text-muted-foreground",
                          }
                          const providerConfig = CREDIT_PAYMENT_PROVIDER_CONFIG[attempt.provider]
                          return (
                            <div
                              key={attempt.attemptId}
                              className="p-3 bg-background rounded-xl border text-xs space-y-1"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-mono font-bold text-foreground">
                                  #{attempt.attemptId}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-[11px] font-medium ${pConfig.className}`}
                                >
                                  {pConfig.label}
                                </Badge>
                              </div>
                              <div className="flex justify-between text-[11px] text-muted-foreground">
                                <span>Cổng thanh toán:</span>
                                <span className="font-medium text-foreground">
                                  {providerConfig?.label || attempt.provider}
                                </span>
                              </div>
                              {attempt.expiresAt && (
                                <div className="flex justify-between text-[11px] text-muted-foreground">
                                  <span>Hạn thanh toán:</span>
                                  <span>{new Date(attempt.expiresAt).toLocaleString("vi-VN")}</span>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Chưa có lần thử thanh toán nào được tạo.
                      </p>
                    )}
                  </div>
                </div>
              ) : null}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOrderDetailOpen(false)}
                  className="rounded-xl"
                >
                  Đóng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* =========================================================================
         * TAB 3: Session Refund (Bồi hoàn lượt tư vấn)
         * ========================================================================= */}
        <TabsContent value="refund" className="space-y-6 m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form */}
            <Card className="rounded-2xl border shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-primary">
                  <Undo2 className="w-5 h-5" />
                  <CardTitle className="text-base font-bold">Bồi hoàn lượt tư vấn</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Thực hiện bồi hoàn lại 1 lượt tư vấn cho thành viên khi phiên khám gặp sự cố kỹ thuật, kết nối gián đoạn hoặc bác sĩ không tham gia.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRefundSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="refund-sessionId" className="text-xs font-semibold">
                      Mã phiên tư vấn (Session ID) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="refund-sessionId"
                      placeholder="VD: 5501, 1024..."
                      value={refundSessionId}
                      onChange={(e) => setRefundSessionId(e.target.value)}
                      required
                      className="rounded-xl font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="refund-reason" className="text-xs font-semibold">
                      Lý do bồi hoàn <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="refund-reason"
                      placeholder="VD: Phiên bị mất kết nối WebRTC từ phía bác sĩ, đã xác nhận với điều phối viên..."
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      required
                      maxLength={500}
                      rows={3}
                      className="rounded-xl resize-none text-xs"
                    />
                  </div>

                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-900 dark:text-amber-200">
                    <p className="font-semibold mb-0.5">Quy tắc nghiệp vụ:</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                      <li>Chỉ áp dụng cho phiên đã kết thúc và đã bị trừ lượt (CAPTURED).</li>
                      <li>Mỗi phiên chỉ được bồi hoàn tối đa 1 lần (Backend trả lỗi 4111 nếu vi phạm).</li>
                      <li>Thao tác này là bồi hoàn lượt tư vấn vào ví, không hoàn tiền mặt VND.</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    disabled={refundSubmitting}
                    className="w-full h-10 rounded-xl gap-2 font-semibold shadow-xs"
                  >
                    <Undo2 className="w-4 h-4" />
                    {refundSubmitting ? "Đang xử lý bồi hoàn..." : "Xác nhận bồi hoàn lượt"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Outcome Display */}
            <Card className="rounded-2xl border shadow-xs flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Kết quả giao dịch bồi hoàn</CardTitle>
                <CardDescription className="text-xs">
                  Chi tiết bút toán số cái và cập nhật ví sau khi bồi hoàn thành công
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center">
                {refundResult ? (
                  <div className="space-y-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      Giao dịch bồi hoàn thành công!
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bút toán Ledger ID:</span>
                        <span className="font-mono font-bold text-foreground">
                          {refundResult.entry.id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Số lượt bồi hoàn:</span>
                        <span className="font-mono font-bold text-emerald-600">
                          +{refundResult.entry.quantity} lượt
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Số dư ví sau hoàn:</span>
                        <span className="font-mono font-bold text-foreground">
                          {refundResult.wallet.balance} lượt
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lý do:</span>
                        <span className="text-muted-foreground italic">
                          {refundResult.entry.reason}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground text-xs">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                    Chưa có giao dịch bồi hoàn nào trong phiên làm việc hiện tại.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* =========================================================================
         * TAB 4: Reconciliation & Recovery
         * ========================================================================= */}
        <TabsContent value="reconcile" className="space-y-6 m-0">
          {/* Section 1: Reconciliation */}
          <Card className="rounded-2xl border shadow-xs">
            <CardHeader className="pb-4 border-b">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base font-bold">
                      Báo cáo đối soát ví & Ledger (Reconciliation)
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs mt-0.5">
                    Đối chiếu tính nhất quán giữa Wallet balance/reserved và Ledger balance/reserved cùng Active reservations (Chế độ đọc).
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Input
                    placeholder="Lọc Member ID (tùy chọn)..."
                    value={reconcileMemberId}
                    onChange={(e) => setReconcileMemberId(e.target.value)}
                    className="h-9 w-full sm:w-48 rounded-xl text-xs"
                  />
                  <Button
                    size="sm"
                    onClick={() => void loadReconciliation(reconcileMemberId)}
                    disabled={loadingReconciliation}
                    className="h-9 rounded-xl text-xs gap-1.5 shrink-0"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${loadingReconciliation ? "animate-spin" : ""}`}
                    />
                    Đối soát
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs font-semibold">Member ID</TableHead>
                      <TableHead className="text-xs font-semibold text-center">
                        Wallet Balance / Reserved
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-center">
                        Ledger Balance / Reserved
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-center">
                        Lượt đang giữ (Active)
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-center">
                        Tính nhất quán
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingReconciliation ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                          Đang thực hiện đối soát dữ liệu...
                        </TableCell>
                      </TableRow>
                    ) : reconciliations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                          Chưa có dữ liệu đối soát nào. Bấm nút "Đối soát" để kiểm tra.
                        </TableCell>
                      </TableRow>
                    ) : (
                      reconciliations.map((rec) => (
                        <TableRow
                          key={rec.memberId}
                          className={rec.consistent ? "hover:bg-muted/20" : "bg-destructive/5 hover:bg-destructive/10"}
                        >
                          <TableCell className="font-mono font-semibold text-xs">
                            #{rec.memberId}
                          </TableCell>
                          <TableCell className="text-center font-mono text-xs">
                            <span className="font-bold">{rec.walletBalance}</span>
                            {" / "}
                            <span className="text-muted-foreground">{rec.walletReserved}</span>
                          </TableCell>
                          <TableCell className="text-center font-mono text-xs">
                            <span className="font-bold">{rec.ledgerBalance}</span>
                            {" / "}
                            <span className="text-muted-foreground">{rec.ledgerReserved}</span>
                          </TableCell>
                          <TableCell className="text-center font-mono text-xs font-bold text-amber-600">
                            {rec.heldQuantity}
                          </TableCell>
                          <TableCell className="text-center">
                            {rec.consistent ? (
                              <Badge
                                variant="outline"
                                className="bg-emerald-500/10 text-emerald-700 border-emerald-300 text-xs font-medium gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Nhất quán
                              </Badge>
                            ) : (
                              <Badge
                                variant="destructive"
                                className="text-xs font-semibold gap-1 animate-pulse"
                              >
                                <AlertTriangle className="w-3 h-3" />
                                Bất nhất dữ liệu!
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Recovery Tool */}
          <Card className="rounded-2xl border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 text-primary">
                    <ShieldAlert className="w-5 h-5" />
                    <CardTitle className="text-base font-bold">
                      Phục hồi & Thu hồi lượt mồ côi (Recovery)
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs mt-0.5">
                    Tiến trình thủ công giải phóng các reservation bị treo do timeout hoặc hủy bất thường. Tuyệt đối không chạy ngầm tự động.
                  </CardDescription>
                </div>
                <Button
                  onClick={handleRunRecovery}
                  disabled={recoverySubmitting}
                  className="rounded-xl gap-2 font-semibold shadow-xs"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${recoverySubmitting ? "animate-spin" : ""}`}
                  />
                  {recoverySubmitting
                    ? "Đang chạy rà soát..."
                    : "Chạy kiểm tra & phục hồi lượt"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recoveryResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-muted/40 rounded-xl border text-center">
                      <span className="text-[11px] text-muted-foreground block">Đã kiểm tra</span>
                      <span className="text-2xl font-mono font-bold text-foreground">
                        {recoveryResult.examined}
                      </span>
                    </div>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block font-semibold">
                        Đã giải phóng (Released)
                      </span>
                      <span className="text-2xl font-mono font-bold text-emerald-600">
                        {recoveryResult.released}
                      </span>
                    </div>
                    <div className="p-3 bg-muted/40 rounded-xl border text-center">
                      <span className="text-[11px] text-muted-foreground block">
                        Đã kết thúc từ trước
                      </span>
                      <span className="text-2xl font-mono font-bold text-muted-foreground">
                        {recoveryResult.alreadyTerminal}
                      </span>
                    </div>
                  </div>

                  {/* Integrity Issues */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Cảnh báo toàn vẹn dữ liệu (Integrity Issues)
                    </h4>
                    {recoveryResult.integrityIssues && recoveryResult.integrityIssues.length > 0 ? (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl space-y-1">
                        {recoveryResult.integrityIssues.map((issue, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs text-destructive"
                          >
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{issue}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Không phát hiện lỗi toàn vẹn dữ liệu nào. Hệ thống hoạt động chuẩn mực.</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  Bấm nút "Chạy kiểm tra & phục hồi lượt" để quét tối đa 50 reservation đang treo.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

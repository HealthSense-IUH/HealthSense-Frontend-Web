import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Coins,
  PlusCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Wallet,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  CREDIT_SOURCE_TYPE_CONFIG,
  generateCreditIdempotencyKey,
} from "@/constants/credits"
import type {
  AdminCreditLedgerEntry,
  AdminMemberCreditSummary,
  AdminMemberWallet,
  CreditOperation,
  CreditSourceType,
  MemberAccountStatus,
} from "@/types/credits"

export function MemberWalletDirectoryTab() {
  const { toast } = useToast()
  const userSession = useAuthStore((state) => state.userSession)
  const actorId = userSession?.userId || "ADMIN"

  const [searchParams] = useSearchParams()
  const urlMemberId = searchParams.get("memberId")

  /* =========================================================================
   * 1. Member Directory State
   * ========================================================================= */
  const [members, setMembers] = useState<AdminMemberCreditSummary[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [keywordInput, setKeywordInput] = useState("")
  const [debouncedKeyword, setDebouncedKeyword] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  // Debounce search keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keywordInput.trim())
    }, 400)
    return () => clearTimeout(timer)
  }, [keywordInput])

  // Reset to page 1 on search or filter change
  useEffect(() => {
    setPage(1)
  }, [debouncedKeyword, statusFilter])

  // Load members from API (GET /api/admin/credits/members)
  const loadMembers = useCallback(
    async (targetPage = page, silent = false) => {
      if (!silent) setLoadingMembers(true)
      try {
        const res = await creditsApi.adminGetMembers({
          keyword: debouncedKeyword || undefined,
          status: statusFilter !== "ALL" ? (statusFilter as MemberAccountStatus) : undefined,
          page: targetPage,
          size: pageSize,
        })
        const data = res.data
        setMembers(data.content || [])
        setTotalPages(data.totalPages || 1)
        setTotalElements(data.totalElements || 0)
      } catch (err) {
        const parsed = parseApiError(err)
        toast({
          variant: "destructive",
          title: "Lỗi tải danh sách thành viên",
          description: parsed.userMessage || "Không thể tải danh sách thành viên.",
        })
      } finally {
        if (!silent) setLoadingMembers(false)
      }
    },
    [debouncedKeyword, statusFilter, page, pageSize, toast]
  )

  useEffect(() => {
    void loadMembers(page)
  }, [loadMembers, page])

  /* =========================================================================
   * 2. Selected Member Modal & Ledger State
   * ========================================================================= */
  const [selectedMember, setSelectedMember] = useState<AdminMemberCreditSummary | null>(null)
  const [memberWallet, setMemberWallet] = useState<AdminMemberWallet | null>(null)
  const [loadingWalletDetail, setLoadingWalletDetail] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  // Ledger state for selected member
  const [ledgerEntries, setLedgerEntries] = useState<AdminCreditLedgerEntry[]>([])
  const [ledgerPage, setLedgerPage] = useState(1)
  const [ledgerTotalPages, setLedgerTotalPages] = useState(1)
  const [ledgerTotalElements, setLedgerTotalElements] = useState(0)
  const [loadingLedger, setLoadingLedger] = useState(false)
  const [ledgerOperationFilter, setLedgerOperationFilter] = useState<string>("ALL")
  const [ledgerSourceTypeFilter, setLedgerSourceTypeFilter] = useState<string>("ALL")

  // Fetch fresh wallet detail from /api/admin/credits/wallets/{memberId}
  const loadFreshWallet = useCallback(async (memberId: string) => {
    setLoadingWalletDetail(true)
    try {
      const res = await creditsApi.adminGetWallet(memberId)
      if (res.data) {
        setMemberWallet(res.data)
      }
    } catch {
      // Wallet snapshot from directory is already present as fallback
    } finally {
      setLoadingWalletDetail(false)
    }
  }, [])

  // Fetch ledger entries for selected member
  const loadLedger = useCallback(
    async (memberId: string, targetPage = 1) => {
      setLoadingLedger(true)
      try {
        const res = await creditsApi.adminGetLedger(memberId, {
          page: targetPage,
          size: 5,
          operation:
            ledgerOperationFilter !== "ALL"
              ? (ledgerOperationFilter as CreditOperation)
              : undefined,
          sourceType:
            ledgerSourceTypeFilter !== "ALL"
              ? (ledgerSourceTypeFilter as CreditSourceType)
              : undefined,
        })
        setLedgerEntries(res.data.content || [])
        setLedgerPage(res.data.page || targetPage)
        setLedgerTotalPages(res.data.totalPages || 1)
        setLedgerTotalElements(res.data.totalElements || 0)
      } catch (err) {
        const parsed = parseApiError(err)
        toast({
          variant: "destructive",
          title: "Không thể tải lịch sử biến động",
          description: parsed.userMessage || `Lỗi tải sổ cái thành viên #${memberId}.`,
        })
      } finally {
        setLoadingLedger(false)
      }
    },
    [ledgerOperationFilter, ledgerSourceTypeFilter, toast]
  )

  // Open member wallet detail dialog
  const handleOpenWalletDetail = useCallback(
    (member: AdminMemberCreditSummary) => {
      setSelectedMember(member)
      setIsDetailDialogOpen(true)
      setIsAdjustInlineOpen(false)

      // Immediate render from snapshot in row
      setMemberWallet({
        balance: member.balance,
        reserved: member.reserved,
        available: member.available,
        updatedAt: member.walletUpdatedAt ?? undefined,
      })

      // Reset ledger filter and load page 1
      setLedgerPage(1)
      void loadLedger(member.memberId, 1)
      void loadFreshWallet(member.memberId)
    },
    [loadFreshWallet, loadLedger]
  )

  // Close member wallet detail dialog
  const handleCloseDetailDialog = (open: boolean) => {
    setIsDetailDialogOpen(open)
    if (!open) {
      setIsAdjustInlineOpen(false)
    }
  }

  // Auto-open modal if URL has memberId on initial page load (only once)
  const initialUrlMemberIdHandled = useRef(false)
  useEffect(() => {
    if (!urlMemberId || initialUrlMemberIdHandled.current) return
    if (members.length === 0) return

    initialUrlMemberIdHandled.current = true
    const found = members.find((m) => m.memberId === urlMemberId)
    if (found) {
      handleOpenWalletDetail(found)
    }
  }, [urlMemberId, members, handleOpenWalletDetail])

  /* =========================================================================
   * 3. Manual Adjustment State & Logic
   * ========================================================================= */
  const [isAdjustInlineOpen, setIsAdjustInlineOpen] = useState(false)
  const [adjustDelta, setAdjustDelta] = useState<number>(1)
  const [adjustReason, setAdjustReason] = useState("")
  const [adjustSubmitting, setAdjustSubmitting] = useState(false)
  const adjustSubmittingRef = useRef(false)

  const handleToggleAdjustInline = () => {
    if (!isAdjustInlineOpen) {
      setAdjustDelta(1)
      setAdjustReason("")
    }
    setIsAdjustInlineOpen(!isAdjustInlineOpen)
  }

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember || adjustSubmittingRef.current) return

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

    // Client warning if subtracting more than available
    const currentAvailable = memberWallet ? memberWallet.available : selectedMember.available
    if (adjustDelta < 0 && Math.abs(adjustDelta) > currentAvailable) {
      if (
        !window.confirm(
          `Cảnh báo: Lượt trừ (${Math.abs(adjustDelta)}) vượt quá số lượt khả dụng (${currentAvailable}) của thành viên. Tiếp tục gửi yêu cầu?`
        )
      ) {
        return
      }
    }

    adjustSubmittingRef.current = true
    setAdjustSubmitting(true)
    const idempotencyKey = generateCreditIdempotencyKey(
      `ADJUST:${actorId}:${selectedMember.memberId}:${adjustDelta}`
    )

    try {
      const res = await creditsApi.adminAdjustCredits(
        selectedMember.memberId,
        { delta: Number(adjustDelta), reason: adjustReason.trim() },
        idempotencyKey
      )

      toast({
        title: "Điều chỉnh lượt thành công",
        description: `Đã ${adjustDelta > 0 ? "cộng" : "trừ"} ${Math.abs(adjustDelta)} lượt cho thành viên ${selectedMember.displayName}.`,
      })

      // Update wallet immediately from mutation response
      const updatedWallet = res.data.wallet
      if (updatedWallet) {
        setMemberWallet(updatedWallet)
        setSelectedMember((prev) =>
          prev
            ? {
                ...prev,
                walletInitialized: true,
                balance: updatedWallet.balance,
                reserved: updatedWallet.reserved,
                available: updatedWallet.available,
              }
            : null
        )

        // Invalidate member directory entry in local list
        setMembers((prevList) =>
          prevList.map((m) =>
            m.memberId === selectedMember.memberId
              ? {
                  ...m,
                  walletInitialized: true,
                  balance: updatedWallet.balance,
                  reserved: updatedWallet.reserved,
                  available: updatedWallet.available,
                }
              : m
          )
        )
      }

      setIsAdjustInlineOpen(false)
      // Refetch directory silently to sync fresh data
      void loadMembers(page, true)
      // Reload ledger
      void loadLedger(selectedMember.memberId, 1)
    } catch (err) {
      const parsed = parseApiError(err)
      toast({
        variant: "destructive",
        title: "Điều chỉnh lượt thất bại",
        description: parsed.userMessage || "Không thể thực hiện điều chỉnh số dư ví.",
      })
    } finally {
      adjustSubmittingRef.current = false
      setAdjustSubmitting(false)
    }
  }

  // Account status badge styling
  const renderStatusBadge = (status: MemberAccountStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge
            variant="outline"
            className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
          >
            Hoạt động
          </Badge>
        )
      case "PENDING_VERIFY":
        return (
          <Badge
            variant="outline"
            className="text-[11px] font-semibold bg-amber-500/10 text-amber-600 border-amber-500/30"
          >
            Chờ xác thực
          </Badge>
        )
      case "INACTIVE":
      default:
        return (
          <Badge
            variant="outline"
            className="text-[11px] font-semibold bg-muted text-muted-foreground border-border"
          >
            Tạm khóa
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* =======================================================================
       * SECTION 1: Member Directory with Wallet Snapshots
       * ======================================================================= */}
      <Card className="rounded-2xl border shadow-xs">
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold">Danh sách thành viên & Ví lượt</CardTitle>
                <Badge variant="secondary" className="text-xs font-mono">
                  {totalElements} thành viên
                </Badge>
              </div>
              <CardDescription className="text-xs mt-0.5">
                Xem nhanh số lượt của thành viên và bấm <strong>"Xem ví"</strong> để xem lịch sử sổ cái hoặc điều chỉnh lượt.
              </CardDescription>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo Tên, Email, SĐT, ID..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  className="pl-9 h-9 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[145px] h-9 rounded-xl text-xs">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl text-xs">
                    <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                    <SelectItem value="ACTIVE">Hoạt động (ACTIVE)</SelectItem>
                    <SelectItem value="PENDING_VERIFY">Chờ xác thực</SelectItem>
                    <SelectItem value="INACTIVE">Tạm khóa (INACTIVE)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadMembers(page)}
                disabled={loadingMembers}
                className="rounded-xl h-9 text-xs gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingMembers ? "animate-spin" : ""}`} />
                Làm mới
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="min-w-[200px] font-semibold text-xs">Thành viên</TableHead>
                  <TableHead className="min-w-[180px] font-semibold text-xs">Liên hệ</TableHead>
                  <TableHead className="font-semibold text-xs text-center">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-xs text-center">Khả dụng</TableHead>
                  <TableHead className="font-semibold text-xs text-center">Tạm giữ</TableHead>
                  <TableHead className="font-semibold text-xs text-center">Tổng số dư</TableHead>
                  <TableHead className="font-semibold text-xs text-center">Tình trạng ví</TableHead>
                  <TableHead className="w-[110px] text-right font-semibold text-xs">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingMembers && members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-36 text-center text-muted-foreground text-xs">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                      Đang tải danh sách thành viên...
                    </TableCell>
                  </TableRow>
                ) : members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-36 text-center text-muted-foreground text-xs">
                      Không tìm thấy thành viên nào phù hợp với bộ lọc tìm kiếm.
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => {
                    const isSelected = selectedMember?.memberId === member.memberId
                    return (
                      <TableRow
                        key={member.memberId}
                        onClick={() => handleOpenWalletDetail(member)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-primary/5 hover:bg-primary/10 border-l-4 border-l-primary"
                            : "hover:bg-muted/20"
                        }`}
                      >
                        {/* Member */}
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 shrink-0">
                              {member.avatarUrl && (
                                <AvatarImage src={member.avatarUrl} alt={member.displayName} />
                              )}
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[11px]">
                                {member.displayName?.slice(0, 2).toUpperCase() || "MB"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-semibold text-sm text-foreground truncate max-w-[160px]">
                                {member.displayName}
                              </div>
                              <div className="font-mono text-[11px] text-muted-foreground">
                                #{member.memberId}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Contact */}
                        <TableCell>
                          <div className="text-xs text-foreground truncate max-w-[180px]">
                            {member.email}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {member.phone || "—"}
                          </div>
                        </TableCell>

                        {/* Account Status */}
                        <TableCell className="text-center">
                          {renderStatusBadge(member.accountStatus)}
                        </TableCell>

                        {/* Available */}
                        <TableCell className="text-center font-mono font-bold text-xs">
                          <span
                            className={
                              member.available > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-muted-foreground"
                            }
                          >
                            {member.available} lượt
                          </span>
                        </TableCell>

                        {/* Reserved */}
                        <TableCell className="text-center font-mono text-xs">
                          {member.reserved > 0 ? (
                            <span className="text-amber-600 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">
                              {member.reserved}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>

                        {/* Total Balance */}
                        <TableCell className="text-center font-mono font-bold text-xs text-foreground">
                          {member.balance}
                        </TableCell>

                        {/* Wallet Status */}
                        <TableCell className="text-center">
                          {!member.walletInitialized ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border">
                              Chưa phát sinh ví
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              Đã khởi tạo
                            </span>
                          )}
                        </TableCell>

                        {/* Action */}
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenWalletDetail(member)}
                            className="h-8 px-2.5 text-xs gap-1.5 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all shadow-3xs"
                          >
                            <Wallet className="w-3.5 h-3.5" />
                            Xem ví
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Directory Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground">
              <div>
                Trang <span className="font-semibold text-foreground">{page}</span> / {totalPages} (Tổng cộng {totalElements} thành viên)
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loadingMembers}
                  className="h-8 px-2.5 rounded-xl text-xs gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loadingMembers}
                  className="h-8 px-2.5 rounded-xl text-xs gap-1"
                >
                  Sau
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* =======================================================================
       * MODAL DIALOG: Chi tiết Ví & Lịch sử Sổ cái của Member được chọn
       * ======================================================================= */}
      <Dialog open={isDetailDialogOpen} onOpenChange={handleCloseDetailDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 rounded-2xl overflow-hidden shadow-2xl">
          {selectedMember && (
            <>
              {/* Header */}
              <DialogHeader className="p-5 pb-4 border-b bg-muted/20 pr-12 sm:pr-14">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11 border-2 border-primary/20 shrink-0">
                      {selectedMember.avatarUrl && (
                        <AvatarImage src={selectedMember.avatarUrl} alt={selectedMember.displayName} />
                      )}
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                        {selectedMember.displayName?.slice(0, 2).toUpperCase() || "MB"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <DialogTitle className="text-lg font-bold text-foreground">
                          {selectedMember.displayName}
                        </DialogTitle>
                        {renderStatusBadge(selectedMember.accountStatus)}
                      </div>
                      <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                        Mã ID: <span className="font-mono text-primary font-semibold">#{selectedMember.memberId}</span> • Email: {selectedMember.email} {selectedMember.phone ? `• SĐT: ${selectedMember.phone}` : ""}
                      </DialogDescription>
                    </div>
                  </div>

                  <Button
                    onClick={handleToggleAdjustInline}
                    size="sm"
                    className="h-9 rounded-xl gap-1.5 font-semibold shadow-xs shrink-0 mr-2 sm:mr-3"
                  >
                    <PlusCircle className="w-4 h-4" />
                    {isAdjustInlineOpen ? "Đóng biểu mẫu" : "Điều chỉnh lượt"}
                  </Button>
                </div>
              </DialogHeader>

              {/* Scrollable Content Body */}
              <div className="p-5 overflow-y-auto space-y-5 flex-1">
                {/* Inline Adjustment Form (if opened) */}
                {isAdjustInlineOpen && (
                  <form
                    onSubmit={handleAdjustSubmit}
                    className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3.5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-primary font-bold text-sm">
                        <PlusCircle className="w-4 h-4" />
                        Điều chỉnh lượt thủ công cho #{selectedMember.memberId}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAdjustInlineOpen(false)}
                        className="h-7 w-7 p-0 rounded-lg text-muted-foreground"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="inlineDelta" className="text-xs font-semibold">
                          Số lượt thay đổi (Delta) <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="inlineDelta"
                            type="number"
                            value={adjustDelta}
                            onChange={(e) => setAdjustDelta(parseInt(e.target.value, 10) || 0)}
                            required
                            className="rounded-xl text-xs font-mono pl-8 h-9"
                          />
                          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold pointer-events-none">
                            {adjustDelta > 0 ? (
                              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                            ) : adjustDelta < 0 ? (
                              <ArrowDownRight className="w-4 h-4 text-destructive" />
                            ) : (
                              "Δ"
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Dương (+) để cấp bù, âm (-) để thu hồi lượt.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="inlineReason" className="text-xs font-semibold">
                          Lý do điều chỉnh <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="inlineReason"
                          placeholder="VD: Cấp bù lượt theo biên bản hỗ trợ CS-2026-001..."
                          value={adjustReason}
                          onChange={(e) => setAdjustReason(e.target.value)}
                          required
                          rows={2}
                          maxLength={500}
                          className="rounded-xl resize-none text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAdjustInlineOpen(false)}
                        disabled={adjustSubmitting}
                        className="rounded-xl h-8 text-xs"
                      >
                        Hủy
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={adjustSubmitting || adjustDelta === 0}
                        className="rounded-xl h-8 text-xs gap-1.5 shadow-xs font-semibold"
                      >
                        {adjustSubmitting ? "Đang xử lý..." : "Xác nhận điều chỉnh"}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Available Credits Card */}
                <Card className="rounded-xl border shadow-2xs bg-emerald-500/5 border-emerald-500/20">
                  <CardHeader className="pb-1.5 p-4 flex flex-row items-center justify-between">
                    <div>
                      <CardDescription className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        Lượt khả dụng
                      </CardDescription>
                      <CardTitle className="text-3xl font-extrabold text-emerald-600 font-mono mt-1">
                        {loadingWalletDetail ? (
                          <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                        ) : (
                          `${memberWallet ? memberWallet.available : selectedMember.available} lượt`
                        )}
                      </CardTitle>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
                      <Coins className="w-6 h-6" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 pb-3.5 text-xs text-muted-foreground">
                    Số lượt tư vấn sẵn sàng để thành viên sử dụng cho các phiên khám
                  </CardContent>
                </Card>

                {/* Ledger History Section */}
                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-primary" />
                      Lịch sử biến động
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <Select
                        value={ledgerOperationFilter}
                        onValueChange={(val) => setLedgerOperationFilter(val)}
                      >
                        <SelectTrigger className="w-[140px] h-8 rounded-xl text-xs">
                          <SelectValue placeholder="Nghiệp vụ" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl text-xs">
                          <SelectItem value="ALL">Tất cả nghiệp vụ</SelectItem>
                          <SelectItem value="PURCHASE">Nạp lượt (PURCHASE)</SelectItem>
                          <SelectItem value="SESSION_CHARGE">Dùng lượt phiên khám</SelectItem>
                          <SelectItem value="RESERVE">Tạm giữ (RESERVE)</SelectItem>
                          <SelectItem value="CAPTURE">Quyết toán (CAPTURE)</SelectItem>
                          <SelectItem value="RELEASE">Hoàn trả (RELEASE)</SelectItem>
                          <SelectItem value="ADJUSTMENT">Admin điều chỉnh</SelectItem>
                          <SelectItem value="SESSION_REFUND">Bồi hoàn phiên</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={ledgerSourceTypeFilter}
                        onValueChange={(val) => setLedgerSourceTypeFilter(val)}
                      >
                        <SelectTrigger className="w-[130px] h-8 rounded-xl text-xs">
                          <SelectValue placeholder="Nguồn gốc" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl text-xs">
                          <SelectItem value="ALL">Tất cả nguồn</SelectItem>
                          <SelectItem value="PURCHASE_ORDER">Đơn mua (ORDER)</SelectItem>
                          <SelectItem value="CONSULTATION_SESSION">Phiên khám (SESSION)</SelectItem>
                          <SelectItem value="ADMIN_ADJUSTMENT">Admin điều chỉnh</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void loadLedger(selectedMember.memberId, 1)}
                        disabled={loadingLedger}
                        className="h-8 rounded-xl text-xs gap-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingLedger ? "animate-spin" : ""}`} />
                        Lọc
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="text-xs font-semibold">Thời gian</TableHead>
                            <TableHead className="text-xs font-semibold">Nghiệp vụ</TableHead>
                            <TableHead className="text-xs font-semibold text-center">Biến động</TableHead>
                            <TableHead className="text-xs font-semibold text-center">Số dư sau</TableHead>
                            <TableHead className="text-xs font-semibold">Nguồn / Mã</TableHead>
                            <TableHead className="text-xs font-semibold">Người thực hiện / Lý do</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loadingLedger ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                                Đang tải biến động sổ cái...
                              </TableCell>
                            </TableRow>
                          ) : ledgerEntries.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
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
                                  <TableCell className="text-center font-mono text-xs font-semibold text-foreground">
                                    {entry.balanceAfter}
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
                                      <span className="text-muted-foreground italic text-[11px]">—</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Ledger Pagination Footer */}
                    {ledgerEntries.length > 0 && (
                      <div className="flex items-center justify-between px-3 py-2 border-t text-xs text-muted-foreground">
                        <div>
                          Trang <span className="font-semibold text-foreground">{ledgerPage}</span> / {Math.max(1, ledgerTotalPages)}
                          {ledgerTotalElements > 0 && (
                            <span className="ml-1 text-muted-foreground/80">({ledgerTotalElements} bản ghi)</span>
                          )}
                        </div>
                        {ledgerTotalPages > 1 && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => void loadLedger(selectedMember.memberId, ledgerPage - 1)}
                              disabled={ledgerPage <= 1 || loadingLedger}
                              className="h-7 px-2 rounded-lg text-xs gap-1"
                            >
                              <ChevronLeft className="w-3 h-3" />
                              Trước
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => void loadLedger(selectedMember.memberId, ledgerPage + 1)}
                              disabled={ledgerPage >= ledgerTotalPages || loadingLedger}
                              className="h-7 px-2 rounded-lg text-xs gap-1"
                            >
                              Sau
                              <ChevronRight className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <DialogFooter className="p-4 border-t bg-muted/10">
                <Button
                  variant="outline"
                  onClick={() => handleCloseDetailDialog(false)}
                  className="rounded-xl h-9 text-xs"
                >
                  Đóng chi tiết ví
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

import { useCallback, useEffect, useState } from "react"
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Info,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { parseApiError } from "@/lib/errorHandler"
import { creditsApi } from "@/services/credits.service"
import { formatCreditQuantity, formatVndPrice } from "@/constants/credits"
import type { AdminMemberCreditSummary, MemberAccountStatus } from "@/types/credits"
import { MemberTransactionsDialog } from "./member-transactions-dialog"

interface MemberCreditSummaryTableProps {
  onSelectMemberForOrders?: (memberId: string) => void
  activeMemberId?: string
}

export function MemberCreditSummaryTable({
  onSelectMemberForOrders: _onSelectMemberForOrders,
  activeMemberId,
}: MemberCreditSummaryTableProps) {
  const { toast } = useToast()

  const [members, setMembers] = useState<AdminMemberCreditSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [keywordInput, setKeywordInput] = useState("")
  const [debouncedKeyword, setDebouncedKeyword] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(5)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  // Transactions Modal state
  const [selectedMemberForModal, setSelectedMemberForModal] = useState<AdminMemberCreditSummary | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenTransactionsModal = (member: AdminMemberCreditSummary) => {
    setSelectedMemberForModal(member)
    setIsModalOpen(true)
  }

  // Debounce search keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keywordInput.trim())
    }, 400)
    return () => clearTimeout(timer)
  }, [keywordInput])

  // Reset to page 1 on search or filter or pageSize change
  useEffect(() => {
    setPage(1)
  }, [debouncedKeyword, statusFilter, pageSize])

  const loadMembers = useCallback(
    async (targetPage: number, targetSize: number) => {
      setLoading(true)
      try {
        const res = await creditsApi.adminGetMembers({
          keyword: debouncedKeyword || undefined,
          status: statusFilter !== "ALL" ? (statusFilter as MemberAccountStatus) : undefined,
          page: targetPage,
          size: targetSize,
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
        setLoading(false)
      }
    },
    [debouncedKeyword, statusFilter, toast]
  )

  useEffect(() => {
    void loadMembers(page, pageSize)
  }, [loadMembers, page, pageSize])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return
    setPage(newPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1)
  }

  const getPageNumbers = () => {
    const pages: (number | "...")[] = []
    const total = Math.max(1, totalPages)
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push("...")
      const start = Math.max(2, page - 1)
      const end = Math.min(total - 1, page + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (page < total - 2) pages.push("...")
      pages.push(total)
    }
    return pages
  }

  const renderAccountStatusBadge = (status: MemberAccountStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge
            variant="outline"
            className="text-[11px] font-semibold bg-success-500/10 text-success-600 border-success-500/30"
          >
            Hoạt động
          </Badge>
        )
      case "PENDING_VERIFY":
        return (
          <Badge
            variant="outline"
            className="text-[11px] font-semibold bg-warning-500/10 text-warning-600 border-warning-500/30"
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
    <Card className="rounded-2xl border shadow-xs">
      <CardHeader className="pb-4 border-b">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                Thống kê nạp token theo thành viên
              </CardTitle>
              <Badge variant="secondary" className="text-xs font-mono">
                {totalElements} thành viên
              </Badge>
            </div>
            <CardDescription className="text-xs mt-0.5 flex items-center gap-1.5 text-muted-foreground">
              <span>Tra cứu số dư ví hiện tại và tổng kết lịch sử nạp token.</span>
              <span className="inline-flex items-center gap-1 font-semibold text-primary/90 bg-primary/10 px-1.5 py-0.5 rounded text-[10px]">
                <Info className="w-3 h-3" />
                Số liệu tổng kết là Toàn thời gian (Lifetime)
              </span>
            </CardDescription>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Tìm theo Tên, Email, SĐT, ID..."
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                className="pl-8 h-8 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-8 rounded-xl text-xs">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent className="rounded-xl text-xs">
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                  <SelectItem value="PENDING_VERIFY">Chờ xác thực</SelectItem>
                  <SelectItem value="INACTIVE">Tạm khóa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadMembers(page, pageSize)}
              disabled={loading}
              className="h-8 rounded-xl text-xs px-2.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs font-semibold">Hội viên</TableHead>
                <TableHead className="text-xs font-semibold">Liên hệ</TableHead>
                <TableHead className="text-xs font-semibold text-center">Trạng thái</TableHead>
                <TableHead className="text-xs font-semibold text-center">Token khả dụng</TableHead>
                <TableHead className="text-xs font-semibold text-right">
                  Tổng tiền đã nạp
                  <span className="block text-[10px] text-muted-foreground font-normal">(Toàn thời gian)</span>
                </TableHead>
                <TableHead className="text-xs font-semibold text-center">
                  Tổng token đã mua
                  <span className="block text-[10px] text-muted-foreground font-normal">(Toàn thời gian)</span>
                </TableHead>
                <TableHead className="text-xs font-semibold text-center">
                  Đơn thành công
                  <span className="block text-[10px] text-muted-foreground font-normal">(Toàn thời gian)</span>
                </TableHead>
                <TableHead className="text-xs font-semibold text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-36 text-center text-xs text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    Đang tải danh sách thành viên...
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-36 text-center text-xs text-muted-foreground">
                    Không tìm thấy thành viên.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => {
                  const isActive = activeMemberId === member.memberId

                  return (
                    <TableRow
                      key={member.memberId}
                      className={`hover:bg-muted/20 transition-colors ${
                        isActive ? "bg-primary/5 border-l-4 border-l-primary" : ""
                      }`}
                    >
                      {/* Member Info */}
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
                            <div className="font-semibold text-xs text-foreground truncate max-w-[150px]">
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
                        <div className="text-xs text-foreground truncate max-w-[170px]">
                          {member.email}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {member.phone || "—"}
                        </div>
                      </TableCell>

                      {/* Account Status */}
                      <TableCell className="text-center">
                        {renderAccountStatusBadge(member.accountStatus)}
                      </TableCell>

                      {/* Available Token */}
                      <TableCell className="text-center font-mono font-bold text-xs">
                        <span
                          className={
                            member.available > 0
                              ? "text-success-600"
                              : "text-muted-foreground"
                          }
                        >
                          {member.available} lượt
                        </span>
                      </TableCell>

                      {/* Lifetime Total Paid VND */}
                      <TableCell className="text-right font-mono font-bold text-xs whitespace-nowrap text-success-600">
                        {formatVndPrice(member.totalPaidVnd || 0)}
                      </TableCell>

                      {/* Lifetime Total Purchased Credits */}
                      <TableCell className="text-center font-mono font-bold text-xs whitespace-nowrap text-primary">
                        +{formatCreditQuantity(member.totalPurchasedCredits || 0)}
                      </TableCell>

                      {/* Lifetime Successful Order Count */}
                      <TableCell className="text-center font-mono font-semibold text-xs">
                        {(member.successfulOrderCount || 0).toLocaleString("vi-VN")}
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-right">
                        <Button
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleOpenTransactionsModal(member)}
                          className="h-8 px-2.5 text-xs gap-1.5 rounded-lg shadow-3xs hover:bg-primary hover:text-primary-foreground transition-colors"
                          title="Xem lịch sử giao dịch thanh toán của hội viên này"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Lịch sử giao dịch</span>
                          <ArrowRight className="w-3 h-3 ml-0.5 opacity-70" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {totalElements > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs">Hiển thị</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => handlePageSizeChange(Number(val))}
              >
                <SelectTrigger className="w-[110px] h-8 rounded-xl text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl text-xs">
                  <SelectItem value="5">5 / trang</SelectItem>
                  <SelectItem value="10">10 / trang</SelectItem>
                  <SelectItem value="20">20 / trang</SelectItem>
                  <SelectItem value="50">50 / trang</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                (Đang xem {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, totalElements)} trong tổng {totalElements} thành viên)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs mr-1 hidden md:inline">
                Trang <strong className="text-foreground font-semibold">{page}</strong> / {Math.max(1, totalPages)}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || loading}
                className="h-8 px-2.5 rounded-xl text-xs gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Trước</span>
              </Button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((p, idx) =>
                  p === "..." ? (
                    <span key={`dots-${idx}`} className="px-1.5 text-muted-foreground">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(p)}
                      disabled={loading}
                      className={`h-8 w-8 p-0 rounded-xl text-xs font-mono ${
                        p === page ? "pointer-events-none" : ""
                      }`}
                    >
                      {p}
                    </Button>
                  )
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages || loading}
                className="h-8 px-2.5 rounded-xl text-xs gap-1"
              >
                <span>Sau</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Modal Lịch sử giao dịch của hội viên */}
      <MemberTransactionsDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        member={selectedMemberForModal}
      />
    </Card>
  )
}

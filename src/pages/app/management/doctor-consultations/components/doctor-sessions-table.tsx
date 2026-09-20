import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Eye,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
  Calendar,
  Clock,
  AlertTriangle,
  FileText,
  Search,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DoctorConsultationSessionResponse } from "@/types/consultation"
import { formatDate } from "@/pages/app/general/consultations/components/shared"

interface DoctorSessionsTableProps {
  sessions: DoctorConsultationSessionResponse[]
  loading?: boolean
  page: number
  size: number
  totalElements: number
  totalPages: number
  onPageChange: (newPage: number) => void
  onSizeChange: (newSize: number) => void
  onRefresh: () => void
  onViewDetail: (sessionId: string | number) => void
}

function getSessionStatusBadge(status: string, meaningfulCareOccurred?: boolean | null) {
  switch (status) {
    case "SCHEDULED":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-[11px]">
          Đã lên lịch
        </Badge>
      )
    case "ACTIVE":
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          Đang chăm sóc
        </Badge>
      )
    case "COMPLETED":
      return (
        <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-200">
          Đã hoàn tất
        </Badge>
      )
    case "CANCELLED":
      return meaningfulCareOccurred ? (
        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 font-bold text-[11px]">
          Đã hủy (Có chăm sóc)
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-bold text-[11px]">
          Đã hủy
        </Badge>
      )
    case "EXPIRED":
      return (
        <Badge variant="outline" className="bg-neutral-100 text-neutral-600 border-neutral-300 font-bold text-[11px]">
          Đã hết hạn
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function DoctorSessionsTable({
  sessions,
  loading = false,
  page,
  size,
  totalElements,
  totalPages,
  onPageChange,
  onSizeChange,
  onRefresh,
  onViewDetail,
}: DoctorSessionsTableProps) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  // Client-side filtering for search and status on loaded sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      // Filter status
      if (statusFilter !== "ALL") {
        if (statusFilter === "SUMMARY_PENDING") {
          if (session.status !== "COMPLETED" || session.summaryClosureStatus !== "SUMMARY_PENDING") {
            return false
          }
        } else if (session.status !== statusFilter) {
          return false
        }
      }

      // Filter search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim()
        const matchId = String(session.id).toLowerCase().includes(query)
        const matchMemberId = String(session.memberId).toLowerCase().includes(query)
        const matchName = session.memberDisplayName?.toLowerCase().includes(query) || false
        const matchPackage = session.packageNameSnapshot?.toLowerCase().includes(query) || false
        return matchId || matchMemberId || matchName || matchPackage
      }

      return true
    })
  }, [sessions, statusFilter, searchTerm])

  const activeSessionCount = useMemo(() => {
    return sessions.filter((s) => s.status === "ACTIVE").length
  }, [sessions])

  const startItem = totalElements === 0 ? 0 : (page - 1) * size + 1
  const endItem = Math.min(page * size, totalElements)

  return (
    <div className="space-y-4">
      {/* Search, Filter & Quick Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-1 items-center gap-3 flex-wrap">
          {/* Search box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Tìm theo mã phiên, tên hoặc ID người bệnh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl bg-slate-50/70 border-slate-200 focus:bg-white transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="w-[180px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-xs rounded-xl bg-slate-50/70 border-slate-200">
                <SelectValue placeholder="Lọc trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs font-medium">Tất cả trạng thái</SelectItem>
                <SelectItem value="ACTIVE" className="text-xs font-bold text-emerald-600">Đang chăm sóc (Active)</SelectItem>
                <SelectItem value="SCHEDULED" className="text-xs font-medium text-blue-600">Đã lên lịch</SelectItem>
                <SelectItem value="SUMMARY_PENDING" className="text-xs font-bold text-amber-600">Cần lập tổng kết</SelectItem>
                <SelectItem value="COMPLETED" className="text-xs font-medium text-slate-600">Đã hoàn tất</SelectItem>
                <SelectItem value="CANCELLED" className="text-xs font-medium text-rose-600">Đã hủy</SelectItem>
                <SelectItem value="EXPIRED" className="text-xs font-medium text-neutral-600">Hết hạn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="h-9 px-3 rounded-xl border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>

        {/* Quick button to open Chat Workspace */}
        <Button
          size="sm"
          onClick={() => navigate("/app/general/consultations?tab=chat")}
          className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs shrink-0 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Vào phòng Chat tư vấn</span>
          {activeSessionCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-white text-blue-700">
              {activeSessionCount} đang khám
            </span>
          )}
        </Button>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-5 w-20">Mã phiên</th>
                <th className="py-3.5 px-4">Bệnh nhân / Người bệnh</th>
                <th className="py-3.5 px-4">Gói tư vấn</th>
                <th className="py-3.5 px-4">Bắt đầu</th>
                <th className="py-3.5 px-4">Kết thúc</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Chú ý y khoa</th>
                <th className="py-3.5 px-5 text-right w-44">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {loading && sessions.length === 0 ? (
                /* Loading State */
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                      <span className="text-sm font-bold text-slate-700">Đang tải danh sách phiên chăm sóc...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                /* Empty State */
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="p-4 rounded-full bg-slate-50 text-slate-400 border border-slate-200">
                        <Inbox className="w-8 h-8" />
                      </div>
                      <h4 className="text-base font-extrabold text-slate-800">Không tìm thấy phiên chăm sóc</h4>
                      <p className="text-xs text-slate-500 max-w-sm">
                        {searchTerm || statusFilter !== "ALL"
                          ? "Không có phiên khám nào khớp với điều kiện tìm kiếm hoặc bộ lọc trạng thái."
                          : "Hiện tại bạn chưa được phân công phiên chăm sóc nào."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* ID */}
                    <td className="py-3.5 px-5 font-mono font-extrabold text-slate-700 text-xs">
                      #{session.id}
                    </td>

                    {/* Member */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-extrabold flex items-center justify-center text-xs shrink-0">
                          {session.memberDisplayName
                            ? session.memberDisplayName.charAt(0).toUpperCase()
                            : "P"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-800 text-xs truncate max-w-[160px]">
                            {session.memberDisplayName || `Bệnh nhân #${session.memberId}`}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400">ID: #{session.memberId}</p>
                        </div>
                      </div>
                    </td>

                    {/* Package */}
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-semibold text-slate-700 line-clamp-1 max-w-[160px]">
                        {session.packageNameSnapshot || "Tư vấn chuyên khoa"}
                      </span>
                    </td>

                    {/* Started At */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formatDate(session.startedAt)}</span>
                      </div>
                    </td>

                    {/* Ends At */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{session.endsAt ? formatDate(session.endsAt) : "—"}</span>
                      </div>
                    </td>

                    {/* Status Badges */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        {getSessionStatusBadge(session.status, session.meaningfulCareOccurred)}
                        {session.status === "COMPLETED" && session.summaryClosureStatus === "SUMMARY_PENDING" && (
                          <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] px-1.5 py-0.2 animate-pulse">
                            Cần tổng kết y khoa
                          </Badge>
                        )}
                      </div>
                    </td>

                    {/* Clinical Notes / Alerts */}
                    <td className="py-3.5 px-4">
                      {session.unresolvedAttentionCount > 0 ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-[11px] font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <span>{session.unresolvedAttentionCount} hồ sơ cần xem</span>
                        </div>
                      ) : session.status === "CANCELLED" && session.meaningfulCareOccurred ? (
                        <div className="inline-flex items-center gap-1.5 text-[11px] text-amber-700">
                          <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>Có chăm sóc</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Open Chat button */}
                        {session.status === "ACTIVE" ? (
                          <Button
                            size="sm"
                            onClick={() => navigate(`/app/general/consultations?tab=chat&sessionId=${session.id}`)}
                            className="h-8 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Vào Chat</span>
                          </Button>
                        ) : session.status === "COMPLETED" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/app/general/consultations?tab=chat&sessionId=${session.id}`)}
                            className="h-8 px-2.5 rounded-lg border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                            <span>Xem Chat</span>
                          </Button>
                        ) : null}

                        {/* View Detail button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewDetail(session.id)}
                          className="h-8 px-2.5 rounded-lg border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Chi tiết</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar matching UserTable */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-bold text-slate-500">
          <div className="flex items-center gap-4">
            <span>
              Hiển thị <strong className="text-slate-800">{startItem}</strong> -{" "}
              <strong className="text-slate-800">{endItem}</strong> trên tổng số{" "}
              <strong className="text-slate-800">{totalElements}</strong> phiên khám
            </span>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <span>Số dòng mỗi trang:</span>
              <select
                aria-label="Rows per page selector"
                value={size}
                onChange={(e) => onSizeChange(Number(e.target.value))}
                disabled={loading}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs mr-2">
              Trang <strong className="text-slate-800">{page}</strong> /{" "}
              <strong className="text-slate-800">{Math.max(1, totalPages)}</strong>
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange(page - 1)}
              className="h-8 px-2.5 rounded-lg border-slate-200 font-bold hover:bg-white text-xs cursor-pointer disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span>Trước</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages || loading}
              onClick={() => onPageChange(page + 1)}
              className="h-8 px-2.5 rounded-lg border-slate-200 font-bold hover:bg-white text-xs cursor-pointer disabled:opacity-50"
            >
              <span>Sau</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

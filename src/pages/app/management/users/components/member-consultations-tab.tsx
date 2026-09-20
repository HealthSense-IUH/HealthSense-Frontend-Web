import { useState, useEffect, useCallback } from "react"
import { Eye, ChevronLeft, ChevronRight, Loader2, Inbox, RefreshCw, AlertTriangle, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { consultationApi } from "@/services"
import type { ConsultationSessionResponse, ConsultationSessionPage } from "@/types/consultation"
import { formatRecordDate, formatVND } from "@/lib/formatters"
import { ConsultationSessionDetailDialog } from "./consultation-session-detail-dialog"

interface MemberConsultationsTabProps {
  memberId: string | number
  memberDisplayName?: string
}

export function MemberConsultationsTab({ memberId, memberDisplayName }: MemberConsultationsTabProps) {
  const [sessions, setSessions] = useState<ConsultationSessionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedSession, setSelectedSession] = useState<ConsultationSessionResponse | null>(null)

  const fetchSessions = useCallback(async () => {
    if (!memberId) return
    setLoading(true)
    try {
      // Calling GET /api/admin/consultation-sessions
      const response = await consultationApi.listAdminSessions({
        page,
        size,
        memberId,
      })
      const pageData: ConsultationSessionPage | undefined = response.data
      const rawList = pageData?.content || []
      // Defensive client-side filter in case backend returns all admin sessions
      const memberSessions = rawList.filter(
        (s) => String(s.memberId) === String(memberId)
      )
      // If backend filtered by memberId, use pageData totals, otherwise adjust
      const hasFiltered = memberSessions.length !== rawList.length
      const list = hasFiltered ? memberSessions : rawList
      setSessions(list)
      setTotalElements(hasFiltered ? memberSessions.length : pageData?.totalElements || list.length)
      setTotalPages(hasFiltered ? Math.ceil(memberSessions.length / size) || 1 : pageData?.totalPages || 1)
    } catch (error) {
      console.error("Failed to load member consultation sessions:", error)
      setSessions([])
      setTotalElements(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [memberId, page, size])

  useEffect(() => {
    void fetchSessions()
  }, [fetchSessions])

  const renderStatusBadge = (status: ConsultationSessionResponse["status"]) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold">Đang diễn ra</Badge>
      case "COMPLETED":
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-bold">Hoàn tất</Badge>
      case "CLOSED":
        return <Badge variant="secondary" className="font-bold text-slate-700">Đã đóng</Badge>
      case "SCHEDULED":
        return <Badge variant="outline" className="text-amber-600 border-amber-500 bg-amber-50 font-bold">Đã lên lịch</Badge>
      case "EXTENSION_PENDING":
        return <Badge className="bg-purple-600 hover:bg-purple-700 text-white font-bold">Chờ gia hạn</Badge>
      case "CANCELLED":
        return <Badge variant="destructive" className="font-bold">Đã hủy</Badge>
      default:
        return <Badge variant="outline" className="font-bold">{status || "—"}</Badge>
    }
  }

  const renderSummaryClosureBadge = (status?: string | null) => {
    if (!status) return <span className="text-slate-400 font-mono">—</span>
    switch (status) {
      case "FINALIZED":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 font-bold">Đã tổng kết</Badge>
      case "ESCALATED":
        return <Badge className="bg-red-50 text-red-700 border-red-300 font-bold">Leo thang</Badge>
      case "PENDING":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-300 font-bold">Chờ tổng kết</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const startItem = totalElements === 0 ? 0 : (page - 1) * size + 1
  const endItem = Math.min(page * size, totalElements)

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-tight">
            Lịch sử các lần tư vấn ({totalElements})
          </h3>
          <p className="text-xs text-slate-500">
            Các phiên tư vấn trực tuyến giữa Member với bác sĩ chuyên khoa.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchSessions}
          disabled={loading}
          className="h-8 px-3 rounded-xl border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[980px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4 w-16">Mã phiên</th>
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-4">Bác sĩ</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Loại/Nguồn</th>
                <th className="py-3.5 px-4">Gói dịch vụ</th>
                <th className="py-3.5 px-4">Bắt đầu</th>
                <th className="py-3.5 px-4">Kết thúc</th>
                <th className="py-3.5 px-4">Tổng kết</th>
                <th className="py-3.5 px-4 max-w-[140px]">Tin nhắn gần nhất</th>
                <th className="py-3.5 px-4 text-center">Cờ xử lý</th>
                <th className="py-3.5 px-4 text-right w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {loading && sessions.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                      <span className="text-sm font-bold text-slate-700">Đang tải lịch sử phiên tư vấn...</span>
                    </div>
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="p-4 rounded-full bg-slate-50 text-slate-400 border border-slate-200">
                        <Inbox className="w-8 h-8" />
                      </div>
                      <h4 className="text-base font-extrabold text-slate-800">Không có phiên tư vấn nào</h4>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Member này chưa tham gia phiên tư vấn sức khỏe nào với bác sĩ trên hệ thống.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      #{session.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 truncate max-w-[110px]">
                        {session.memberDisplayName || memberDisplayName || `#${session.memberId}`}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">#{session.memberId}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 truncate max-w-[120px]">
                        {session.doctorDisplayName || (session.doctorId ? `Doctor #${session.doctorId}` : "Chưa phân công")}
                      </div>
                      {session.doctorId && (
                        <div className="text-[10px] font-mono text-slate-400">#{session.doctorId}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderStatusBadge(session.status)}
                    </td>
                    <td className="py-3.5 px-4 text-[11px]">
                      <span className="font-bold text-slate-700">{session.flowType || "STANDARD"}</span>
                      <span className="text-slate-400 text-[10px] block">{session.sourceType || "REGULAR"}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px]">
                      {session.packagePriceSnapshot != null ? (
                        <div>
                          <span className="font-bold text-emerald-700">
                            {formatVND(session.packagePriceSnapshot)}
                          </span>
                          {session.packageDurationDaysSnapshot && (
                            <span className="text-slate-400 text-[10px] block">
                              {session.packageDurationDaysSnapshot} ngày
                            </span>
                          )}
                        </div>
                      ) : session.packageId ? (
                        <span className="font-mono text-slate-600">Gói #{session.packageId}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                      {formatRecordDate(session.startedAt || session.activatedAt)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                      {formatRecordDate(session.completedAt || session.closedAt || session.endsAt)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderSummaryClosureBadge(session.summaryClosureStatus)}
                    </td>
                    <td className="py-3.5 px-4 max-w-[140px]">
                      {session.lastMessagePreview ? (
                        <span className="truncate block text-[11px] text-slate-600 italic" title={session.lastMessagePreview}>
                          "{session.lastMessagePreview}"
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {session.operationalReviewRequired && (
                          <span title="Cần rà soát vận hành" className="text-rose-600 bg-rose-50 p-1 rounded-md">
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {session.exceptionalOverride && (
                          <span title="Ghi đè ngoại lệ" className="text-amber-600 bg-amber-50 p-1 rounded-md">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {!session.operationalReviewRequired && !session.exceptionalOverride && (
                          <span className="text-slate-300 font-mono">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSession(session)}
                        className="h-8 px-2.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 font-bold text-xs cursor-pointer"
                        title="Xem chi tiết phiên tư vấn"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        <span>Chi tiết</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-bold text-slate-500">
          <div className="flex items-center gap-4">
            <span>
              Hiển thị <strong className="text-slate-800">{startItem}</strong> -{" "}
              <strong className="text-slate-800">{endItem}</strong> trong{" "}
              <strong className="text-slate-800">{totalElements}</strong> phiên
            </span>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <span>Hàng mỗi trang:</span>
              <select
                aria-label="Rows per page"
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value))
                  setPage(1)
                }}
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
              onClick={() => setPage((p) => p - 1)}
              className="h-8 px-2.5 rounded-lg border-slate-200 font-bold hover:bg-white text-xs cursor-pointer disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span>Trước</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 px-2.5 rounded-lg border-slate-200 font-bold hover:bg-white text-xs cursor-pointer disabled:opacity-50"
            >
              <span>Sau</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Detail Dialog */}
      <ConsultationSessionDetailDialog
        session={selectedSession}
        open={Boolean(selectedSession)}
        onOpenChange={(open) => !open && setSelectedSession(null)}
      />
    </div>
  )
}

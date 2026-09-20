import { useState, useEffect, useCallback } from "react"
import { Eye, ChevronLeft, ChevronRight, Loader2, Inbox, RefreshCw, FilePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { adminHealthRecordApi, userManagementApi } from "@/services"
import type { HealthRecord, PaginatedResponse } from "@/types/health-record"
import { formatRecordDate } from "@/lib/formatters"
import { HealthRecordDetailDialog } from "@/pages/app/management/health-records/components/HealthRecordDetailDialog"

interface MemberHealthRecordsTabProps {
  memberId: string | number
  memberDisplayName?: string
}

export function MemberHealthRecordsTab({ memberId, memberDisplayName }: MemberHealthRecordsTabProps) {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null)

  const fetchRecords = useCallback(async () => {
    if (!memberId) return
    setLoading(true)
    try {
      const response = await adminHealthRecordApi.getAllHealthRecords({
        memberId,
        page,
        size,
      })
      const pageData: PaginatedResponse<HealthRecord> | undefined = response.data
      setRecords(pageData?.content || [])
      setTotalElements(pageData?.totalElements || 0)
      setTotalPages(pageData?.totalPages || 1)
    } catch (error) {
      console.error("Failed to load member health records:", error)
      setRecords([])
      setTotalElements(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [memberId, page, size])

  useEffect(() => {
    void fetchRecords()
  }, [fetchRecords])

  const handleCreateMockRecord = async () => {
    setActionLoading(true)
    try {
      await userManagementApi.createFakeHealthRecord({ memberId })
      await fetchRecords()
    } catch (error) {
      console.error("Failed to create fake record:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const renderStatusBadge = (status: HealthRecord["status"]) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold">Completed</Badge>
      case "PROCESSING":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-bold">Processing</Badge>
      case "PENDING_UPLOAD":
        return <Badge variant="outline" className="text-amber-600 border-amber-500 bg-amber-50 font-bold">Pending</Badge>
      case "FAILED":
        return <Badge variant="destructive" className="font-bold">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const renderPredictionBadge = (prediction: HealthRecord["predictionLabel"]) => {
    if (!prediction) return <span className="text-slate-400 font-mono">—</span>
    switch (prediction) {
      case "NORMAL":
        return (
          <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50 font-extrabold">
            Bình thường (NORMAL)
          </Badge>
        )
      case "AFIB":
        return (
          <Badge variant="outline" className="text-rose-700 border-rose-300 bg-rose-50 font-extrabold">
            Rung nhĩ (AFIB)
          </Badge>
        )
      case "AFIB_SUSPECTED":
        return (
          <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 font-extrabold">
            Nghi ngờ (AFIB_SUSPECTED)
          </Badge>
        )
      case "UNCERTAIN":
        return (
          <Badge variant="outline" className="text-orange-700 border-orange-300 bg-orange-50 font-extrabold">
            Chưa chắc chắn (UNCERTAIN)
          </Badge>
        )
      default:
        return <Badge variant="outline">{prediction}</Badge>
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
            Lịch sử các bản đo sức khỏe ({totalElements})
          </h3>
          <p className="text-xs text-slate-500">
            Dữ liệu đo tín hiệu PPG / ECG và các chỉ số HRV được ghi nhận từ thiết bị đeo hoặc ứng dụng.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRecords}
            disabled={loading}
            className="h-8 px-3 rounded-xl border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
          <Button
            size="sm"
            onClick={handleCreateMockRecord}
            disabled={actionLoading}
            className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs cursor-pointer"
          >
            <FilePlus className="w-3.5 h-3.5 mr-1.5" />
            {actionLoading ? "Đang tạo..." : "Tạo bản đo mẫu"}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4 w-20">Mã bản đo</th>
                <th className="py-3.5 px-4">Member ID</th>
                <th className="py-3.5 px-4">Tên file</th>
                <th className="py-3.5 px-4">Trạng thái xử lý</th>
                <th className="py-3.5 px-4">Kết quả dự đoán</th>
                <th className="py-3.5 px-4">Độ tin cậy</th>
                <th className="py-3.5 px-4">Thời gian đo/tạo</th>
                <th className="py-3.5 px-4 text-right w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {loading && records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                      <span className="text-sm font-bold text-slate-700">Đang tải lịch sử bản đo...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="p-4 rounded-full bg-slate-50 text-slate-400 border border-slate-200">
                        <Inbox className="w-8 h-8" />
                      </div>
                      <h4 className="text-base font-extrabold text-slate-800">Chưa có bản ghi đo nào</h4>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Member này hiện chưa tải lên bất kỳ bản ghi tín hiệu sức khỏe nào. Bạn có thể bấm "Tạo bản đo mẫu" để thử nghiệm.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      #{record.id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-bold text-slate-800 truncate max-w-[120px]">
                        {memberDisplayName || `Member #${record.userId || memberId}`}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        #{record.userId || memberId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium max-w-[180px] truncate text-slate-800" title={record.fileName}>
                      {record.fileName || "—"}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderStatusBadge(record.status)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderPredictionBadge(record.predictionLabel)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {record.confidence !== null && record.confidence !== undefined
                        ? `${(record.confidence * 100).toFixed(1)}%`
                        : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatRecordDate(record.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRecord(record)}
                        className="h-8 px-2.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 font-bold text-xs cursor-pointer"
                        title="Xem chi tiết bản đo"
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
              <strong className="text-slate-800">{totalElements}</strong> bản ghi
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
      <HealthRecordDetailDialog
        record={selectedRecord}
        open={Boolean(selectedRecord)}
        onOpenChange={(open) => !open && setSelectedRecord(null)}
      />
    </div>
  )
}

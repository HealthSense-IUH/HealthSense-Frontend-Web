import { useState, useEffect, useCallback } from "react"
import { 
  HeartPulse, 
  Search, 
  RefreshCw, 
  Plus,
  Eye,
  LayoutList,
  LayoutGrid
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PaginationControl } from "@/components/custom/PaginationControl"
import { healthRecordApi } from "@/services"
import { HealthRecordDetailModal } from "@/features/member-health-records/components/HealthRecordDetailModal"
import { UploadMeasurementModal } from "@/features/member-health-records/components/UploadMeasurementModal"
import { PREDICTION_LABEL_CONFIG } from "@/constants"
import {
  getPredictionMeta,
  formatRecordDate,
  formatHrvNumber,
} from "@/lib"
import type { MemberHealthRecord } from "@/types/health-record"

export default function AfibHistoryPage() {
  const [records, setRecords] = useState<MemberHealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // View mode state (default to "table")
  const [viewMode, setViewMode] = useState<"table" | "card">("table")

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  // Filter state
  const [searchKeyword, setSearchKeyword] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Modal states
  const [selectedRecord, setSelectedRecord] = useState<MemberHealthRecord | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  // Fetch Health Records from API
  const fetchRecords = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const recordsRes = await healthRecordApi.getMyRecords({ page, size: pageSize })
      const pageData = recordsRes.data

      if (pageData && pageData.content) {
        setRecords(pageData.content)
        setTotalPages(pageData.totalPages || 1)
        setTotalElements(pageData.totalElements || 0)
      } else {
        setRecords([])
        setTotalPages(1)
        setTotalElements(0)
      }
    } catch (err) {
      console.error("Failed to load member health records:", err)
      setRecords([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [page, pageSize])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  // Filter records based on search and status
  const filteredRecords = records.filter((r) => {
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase()
      const matchFile = r.fileName?.toLowerCase().includes(kw)
      const matchDate = r.createdAt?.toLowerCase().includes(kw)
      if (!matchFile && !matchDate) return false
    }

    if (statusFilter === "normal") return r.predictionLabel === "NORMAL"
    if (statusFilter === "warning") return r.predictionLabel === "AFIB" || r.predictionLabel === "AFIB_SUSPECTED"
    if (statusFilter === "processing") return r.status === "PROCESSING" || r.status === "PENDING_ANALYSIS"
    return true
  })

  const handleOpenDetail = (record: MemberHealthRecord) => {
    setSelectedRecord(record)
    setIsDetailOpen(true)
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] w-full p-2 gap-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Lịch sử Tầm soát Rung nhĩ</h1>
          <p className="text-muted-foreground mt-1">Lịch sử các lần đo chủ động và cảnh báo từ AI</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchRecords(true)}
            disabled={loading || refreshing}
            className="h-10 rounded-xl bg-white dark:bg-card border-0 shadow-xs text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
            <span>Làm mới</span>
          </Button>

          <Button
            onClick={() => setIsUploadOpen(true)}
            className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-4 shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tải lên bản ghi mới</span>
          </Button>
        </div>
      </div>

      {/* Filters, View Mode Toggle & Badge Legend */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/70" />
              <Input 
                type="search" 
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm kiếm theo ngày / tên file..." 
                className="w-full pl-9 bg-white dark:bg-card border-0 rounded-xl shadow-xs h-10 text-xs font-medium"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px] bg-white dark:bg-card border-0 rounded-xl shadow-xs h-10 text-xs font-medium">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="rounded-xl text-xs">
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="normal">Bình thường (An toàn)</SelectItem>
                <SelectItem value="warning">Cảnh báo (Rung nhĩ)</SelectItem>
                <SelectItem value="processing">Đang phân tích</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Switcher (Table vs Card) */}
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-card border border-border rounded-xl shadow-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              title="Dạng bảng (Table view)"
              className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold px-3 ${
                viewMode === "table"
                  ? "bg-slate-100 dark:bg-slate-800 text-primary shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutList className="w-4 h-4" />
              <span>Bảng</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("card")}
              title="Dạng thẻ (Card view)"
              className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold px-3 ${
                viewMode === "card"
                  ? "bg-slate-100 dark:bg-slate-800 text-primary shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Thẻ</span>
            </button>
          </div>
        </div>

        {/* Badge Legend */}
        <div className="flex flex-wrap items-center gap-2.5 p-3 px-4 rounded-2xl bg-white dark:bg-card border border-border shadow-xs text-xs text-muted-foreground">
          <span className="font-semibold text-foreground shrink-0 mr-1">Chú thích AI:</span>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${PREDICTION_LABEL_CONFIG.NORMAL.badgeClass}`}>
            <span>{PREDICTION_LABEL_CONFIG.NORMAL.label}</span>
            <span className="font-normal opacity-75">(&lt; 30%)</span>
          </span>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${PREDICTION_LABEL_CONFIG.UNCERTAIN.badgeClass}`}>
            <span>{PREDICTION_LABEL_CONFIG.UNCERTAIN.label}</span>
            <span className="font-normal opacity-75">(30% - 50%)</span>
          </span>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${PREDICTION_LABEL_CONFIG.AFIB_SUSPECTED.badgeClass}`}>
            <span>{PREDICTION_LABEL_CONFIG.AFIB_SUSPECTED.label}</span>
            <span className="font-normal opacity-75">(50% - 70%)</span>
          </span>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${PREDICTION_LABEL_CONFIG.AFIB.badgeClass}`}>
            <span>{PREDICTION_LABEL_CONFIG.AFIB.label}</span>
            <span className="font-normal opacity-75">(&ge; 70%)</span>
          </span>
        </div>
      </div>

      {/* Main Display Area (Table or Card View) */}
      <div className="flex-1 w-full flex flex-col justify-start">
        {loading ? (
          viewMode === "table" ? (
            <Card className="rounded-3xl border border-border shadow-xs bg-white dark:bg-card overflow-hidden">
              <CardContent className="p-6 space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />
                ))}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-44 rounded-3xl bg-slate-100 dark:bg-slate-800/40 animate-pulse" />
              ))}
            </div>
          )
        ) : filteredRecords.length === 0 ? (
          <div className="flex-1 min-h-[360px] rounded-3xl bg-white dark:bg-card p-16 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-muted-foreground">
              <HeartPulse className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Chưa có bản ghi đo nào
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Không tìm thấy bản ghi đo phù hợp với bộ lọc. Hãy tải lên file dữ liệu mới để bắt đầu tầm soát.
            </p>
            <Button
              onClick={() => setIsUploadOpen(true)}
              className="mt-2 h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-4 cursor-pointer"
            >
              Tải lên bản ghi đầu tiên
            </Button>
          </div>
        ) : viewMode === "table" ? (
          /* ================= TABLE VIEW ================= */
          <Card className="rounded-3xl border border-border shadow-xs bg-white dark:bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-semibold bg-slate-50/50 dark:bg-slate-900/30">
                      <th className="py-3.5 px-5">Thời gian đo & File</th>
                      <th className="py-3.5 px-4 text-center">Nhịp tim TB</th>
                      <th className="py-3.5 px-4">Biến thiên HRV</th>
                      <th className="py-3.5 px-4 text-center">Kết luận AI</th>
                      <th className="py-3.5 px-4 text-center">Khả năng AFib</th>
                      <th className="py-3.5 px-5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-medium">
                    {filteredRecords.map((record) => {
                      const meta = getPredictionMeta(record.predictionLabel, record.status)
                      const hrMean = record.hrvFeatures?.HR_mean 
                        ? Math.round(Number(record.hrvFeatures.HR_mean)) 
                        : null
                      const sdnn = record.hrvFeatures?.SDNN ? formatHrvNumber(record.hrvFeatures.SDNN, 1) : null
                      const rmssd = record.hrvFeatures?.RMSSD ? formatHrvNumber(record.hrvFeatures.RMSSD, 1) : null
                      const confidencePct = record.confidence !== null && record.confidence !== undefined 
                        ? (record.confidence * 100).toFixed(1) 
                        : null

                      return (
                        <tr
                          key={record.id}
                          onClick={() => handleOpenDetail(record)}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                        >
                          {/* Col 1: Time & File */}
                          <td className="py-3.5 px-5">
                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                              {formatRecordDate(record.createdAt)}
                            </div>
                            <span className="text-[11px] text-muted-foreground truncate block max-w-[220px] mt-0.5">
                              {record.fileName}
                            </span>
                          </td>

                          {/* Col 2: Heart Rate */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="font-bold text-foreground text-sm">
                              {hrMean ? `${hrMean} ` : "-- "}
                              <span className="text-xs font-normal text-muted-foreground">BPM</span>
                            </div>
                          </td>

                          {/* Col 3: HRV SDNN / RMSSD */}
                          <td className="py-3.5 px-4">
                            <span className="text-xs text-foreground font-semibold block">
                              SDNN: {sdnn ? `${sdnn} ms` : "--"}
                            </span>
                            <span className="text-[11px] text-muted-foreground block mt-0.5">
                              RMSSD: {rmssd ? `${rmssd} ms` : "--"}
                            </span>
                          </td>

                          {/* Col 4: AI Conclusion Badge */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center justify-center w-32 py-1 rounded-full text-xs font-bold border shadow-2xs ${meta.badgeClass}`}>
                              {meta.badgeText}
                            </span>
                          </td>

                          {/* Col 5: AFib Probability */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="font-bold text-foreground text-sm">
                              {confidencePct !== null ? `${confidencePct}%` : "--"}
                            </div>
                          </td>

                          {/* Col 6: Actions */}
                          <td className="py-3.5 px-5 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenDetail(record)
                              }}
                              className="h-8 px-3 rounded-xl bg-white dark:bg-slate-800 border border-border text-foreground hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>Xem chi tiết</span>
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* ================= CARD VIEW ================= */
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecords.map((record) => {
              const meta = getPredictionMeta(record.predictionLabel, record.status)
              const hrMean = record.hrvFeatures?.HR_mean 
                ? Math.round(Number(record.hrvFeatures.HR_mean)) 
                : null
              const confidencePct = record.confidence !== null && record.confidence !== undefined 
                ? (record.confidence * 100).toFixed(1) 
                : null

              return (
                <Card
                  key={record.id}
                  onClick={() => handleOpenDetail(record)}
                  className="rounded-3xl border border-border shadow-xs bg-white dark:bg-card overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className={`h-1.5 w-full ${meta.topBarClass}`} />
                  <CardHeader className="pb-3 pt-4 px-5">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {formatRecordDate(record.createdAt)}
                      </CardTitle>
                      <span className={`inline-flex items-center justify-center w-32 py-1 rounded-full text-xs font-bold border shadow-2xs ${meta.badgeClass}`}>
                        {meta.badgeText}
                      </span>
                    </div>
                    <CardDescription className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                      <HeartPulse className="h-4 w-4 text-rose-500 shrink-0" />
                      <span>Nhịp tim: {hrMean ? `${hrMean} BPM` : "-- BPM"}</span>
                      <span>•</span>
                      <span className="truncate max-w-[120px]">{record.fileName}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-0">
                    <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-border">
                      <div className="space-y-0.5 min-w-0">
                        <p className={`font-semibold text-sm truncate ${meta.statusTextClass}`}>
                          {meta.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {confidencePct !== null ? `Khả năng bị rung nhĩ: ${confidencePct}%` : `File: ${record.fileName}`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-foreground shrink-0"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination Container (Sticky to bottom) */}
      <div className="mt-auto pt-2">
        {totalPages > 0 && totalElements > 0 && (
          <PaginationControl
            currentPage={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            isLoading={loading}
            pageSizeOptions={[10, 15, 20, 30, 50]}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize)
              setPage(1)
            }}
          />
        )}
      </div>

      {/* Modals */}
      <HealthRecordDetailModal
        record={selectedRecord}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setSelectedRecord(null)
        }}
      />

      <UploadMeasurementModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          setPage(1)
          fetchRecords()
        }}
      />
    </div>
  )
}

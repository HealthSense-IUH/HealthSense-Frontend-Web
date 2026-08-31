import { useEffect, useState, useCallback } from "react"
import {
  History,
  Calendar,
  Clock,
  RefreshCw,
  Stethoscope,
  ArrowRight,
  FileText,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { consultationApi } from "@/services"
import type { CareHistoryEpisodeResponse } from "@/types/consultation"
import { CareHistoryDetailDialog } from "../components/care-history-detail-dialog"

export default function CareHistoryPage() {
  const [episodes, setEpisodes] = useState<CareHistoryEpisodeResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [selectedEpisode, setSelectedEpisode] = useState<CareHistoryEpisodeResponse | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const fetchHistory = useCallback(async (p = 1) => {
    try {
      setLoading(true)
      const res = await consultationApi.getCareHistory({ page: p, size: 10 })
      const data = res.data
      setEpisodes(data?.content || [])
      setPage(data?.page || p)
      setTotalPages(data?.totalPages || 1)
      setTotalElements(data?.totalElements || 0)
      setHasMore(data?.hasMore || false)
    } catch (err) {
      console.error("Failed to fetch care history", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchHistory(page)
  }, [page, fetchHistory])

  const handleOpenDetail = (ep: CareHistoryEpisodeResponse) => {
    setSelectedEpisode(ep)
    setDetailOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">Đang diễn ra</Badge>
      case "COMPLETED":
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Đã hoàn thành</Badge>
      case "CANCELLED":
        return <Badge variant="destructive">Đã hủy</Badge>
      case "SCHEDULED":
        return <Badge variant="secondary">Đã lên lịch</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (val?: string | null) => {
    if (!val) return "Chưa xác định"
    try {
      return new Date(val).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return String(val)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-background p-6 rounded-2xl shadow-xs border">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Lịch sử Chăm sóc</h1>
            <p className="text-sm text-muted-foreground">
              Tra cứu các đợt khám tư vấn 1-1, bác sĩ phụ trách và tổng kết y khoa chính thức.
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={() => void fetchHistory(page)} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Làm mới
        </Button>
      </div>

      {/* Episodes List */}
      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </Card>
          ))}
        </div>
      ) : episodes.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <History className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Chưa có lịch sử chăm sóc</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Bạn chưa tham gia đợt tư vấn nào. Hãy đăng ký gói dịch vụ chăm sóc để bắt đầu cùng bác sĩ chuyên khoa.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {episodes.map((ep) => (
            <Card key={ep.sessionId} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="p-5 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                      #{ep.sessionId}
                    </span>
                    <CardTitle className="text-base font-bold">
                      {ep.packageNameSnapshot || "Gói tư vấn sức khỏe"}
                    </CardTitle>
                  </div>
                  {getStatusBadge(ep.status)}
                </div>
                <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs pt-1">
                  <span className="flex items-center gap-1">
                    <Stethoscope className="h-3.5 w-3.5 text-primary" />
                    Bác sĩ: <span className="font-semibold text-foreground">{ep.doctorName || `Bác sĩ #${ep.doctorId}`}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    Bắt đầu: {formatDate(ep.startedAt)}
                  </span>
                  {ep.endsAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      Kết thúc: {formatDate(ep.endsAt)}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t mt-3 bg-muted/10">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {ep.finalSummary ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <FileText className="h-3.5 w-3.5" /> Đã có Tổng kết Y khoa
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> Chưa có tổng kết y khoa
                    </span>
                  )}
                  {ep.authorizedHealthRecords && ep.authorizedHealthRecords.length > 0 && (
                    <span>&bull; {ep.authorizedHealthRecords.length} hồ sơ theo dõi</span>
                  )}
                </div>
                <Button size="sm" variant="outline" onClick={() => handleOpenDetail(ep)}>
                  Xem chi tiết <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Hiển thị trang {page} / {totalPages} ({totalElements} đợt chăm sóc)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore || loading}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <CareHistoryDetailDialog
        episode={selectedEpisode}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}

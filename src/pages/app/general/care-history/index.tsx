import { useEffect, useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import {
  History,
  Calendar,
  Clock,
  RefreshCw,
  Stethoscope,
  ArrowRight,
  FileText,
} from "lucide-react"

import { Page, PageBody, PageFooter, PageHeader } from "@/components/layout/page"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { currentIntlLocale } from "@/lib/i18n"
import { consultationApi } from "@/services"
import type { CareHistoryEpisodeResponse } from "@/types/consultation"
import { CareHistoryDetailDialog } from "@/pages/app/general/care-history/components/care-history-detail-dialog"

export default function CareHistoryPage() {
  const { t } = useTranslation("health")
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
        return <Badge className="bg-success-600 hover:bg-success-700 text-white">{t("careHistory.status.active")}</Badge>
      case "COMPLETED":
        return <Badge className="bg-primary-600 hover:bg-primary-700 text-white">{t("careHistory.status.completed")}</Badge>
      case "CANCELLED":
        return <Badge variant="destructive">{t("careHistory.status.cancelled")}</Badge>
      case "SCHEDULED":
        return <Badge variant="secondary">{t("careHistory.status.scheduled")}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (val?: string | null) => {
    if (!val) return t("careHistory.undetermined")
    try {
      return new Date(val).toLocaleDateString(currentIntlLocale(), {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return String(val)
    }
  }

  return (
    <Page>
      <PageHeader
        icon={<History className="w-5 h-5" />}
        title={t("careHistory.title")}
        description={t("careHistory.description")}
        actions={
          <Button variant="outline" size="sm" onClick={() => void fetchHistory(page)} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("careHistory.refresh")}
          </Button>
        }
      />

      <PageBody>
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
              <h3 className="text-lg font-semibold">{t("careHistory.empty.title")}</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {t("careHistory.empty.description")}
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
                        {ep.packageNameSnapshot || t("careHistory.defaultPackageName")}
                      </CardTitle>
                    </div>
                    {getStatusBadge(ep.status)}
                  </div>
                  <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs pt-1">
                    <span className="flex items-center gap-1">
                      <Stethoscope className="h-3.5 w-3.5 text-primary" />
                      {t("careHistory.doctorLabel")} <span className="font-semibold text-foreground">{ep.doctorName || t("careHistory.doctorFallback", { id: ep.doctorId })}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {t("careHistory.startedAt", { date: formatDate(ep.startedAt) })}
                    </span>
                    {ep.endsAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {t("careHistory.endsAt", { date: formatDate(ep.endsAt) })}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t mt-3 bg-muted/10">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {ep.finalSummary ? (
                      <span className="flex items-center gap-1 text-success-600 font-medium">
                        <FileText className="h-3.5 w-3.5" /> {t("careHistory.hasSummary")}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> {t("careHistory.noSummary")}
                      </span>
                    )}
                    {ep.authorizedHealthRecords && ep.authorizedHealthRecords.length > 0 && (
                      <span>&bull; {t("careHistory.trackedRecords", { count: ep.authorizedHealthRecords.length })}</span>
                    )}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleOpenDetail(ep)}>
                    {t("careHistory.viewDetails")} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Detail Dialog */}
        <CareHistoryDetailDialog
          episode={selectedEpisode}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      </PageBody>

      {/* Pagination */}
      {totalPages > 1 && (
        <PageFooter>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {t("careHistory.pagination.summary", { page, totalPages, total: totalElements })}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
              >
                {t("careHistory.pagination.previous")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore || loading}
              >
                {t("careHistory.pagination.next")}
              </Button>
            </div>
          </div>
        </PageFooter>
      )}
    </Page>
  )
}

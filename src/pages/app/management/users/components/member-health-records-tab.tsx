import { useState, useEffect, useCallback } from "react"
import { Eye, ChevronLeft, ChevronRight, Loader2, Inbox, RefreshCw, FilePlus } from "lucide-react"
import { Trans, useTranslation } from "react-i18next"
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
  const { t } = useTranslation("management")
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
        return <Badge className="bg-success-500 hover:bg-success-600 text-white font-bold">{t("userDetail.healthRecordsTab.status.completed")}</Badge>
      case "PROCESSING":
        return <Badge className="bg-primary-500 hover:bg-primary-600 text-white font-bold">{t("userDetail.healthRecordsTab.status.processing")}</Badge>
      case "PENDING_UPLOAD":
        return <Badge variant="outline" className="text-warning-600 border-warning-500 bg-warning-50 font-bold">{t("userDetail.healthRecordsTab.status.pending")}</Badge>
      case "FAILED":
        return <Badge variant="destructive" className="font-bold">{t("userDetail.healthRecordsTab.status.failed")}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const renderPredictionBadge = (prediction: HealthRecord["predictionLabel"]) => {
    if (!prediction) return <span className="text-slate-400 font-mono">—</span>
    switch (prediction) {
      case "NORMAL":
        return (
          <Badge variant="outline" className="text-success-700 border-success-300 bg-success-50 font-extrabold">
            {t("userDetail.healthRecordsTab.prediction.normal")}
          </Badge>
        )
      case "AFIB":
        return (
          <Badge variant="outline" className="text-danger-700 border-danger-300 bg-danger-50 font-extrabold">
            {t("userDetail.healthRecordsTab.prediction.afib")}
          </Badge>
        )
      case "AFIB_SUSPECTED":
        return (
          <Badge variant="outline" className="text-warning-700 border-warning-300 bg-warning-50 font-extrabold">
            {t("userDetail.healthRecordsTab.prediction.afibSuspected")}
          </Badge>
        )
      case "UNCERTAIN":
        return (
          <Badge variant="outline" className="text-warning-700 border-warning-300 bg-warning-50 font-extrabold">
            {t("userDetail.healthRecordsTab.prediction.uncertain")}
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
            {t("userDetail.healthRecordsTab.title", { count: totalElements })}
          </h3>
          <p className="text-xs text-slate-500">
            {t("userDetail.healthRecordsTab.description")}
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
            {t("userDetail.common.refresh")}
          </Button>
          <Button
            size="sm"
            onClick={handleCreateMockRecord}
            disabled={actionLoading}
            className="h-8 px-3 rounded-xl bg-success-600 hover:bg-success-700 text-white font-extrabold text-xs shadow-xs cursor-pointer"
          >
            <FilePlus className="w-3.5 h-3.5 mr-1.5" />
            {actionLoading ? t("userDetail.healthRecordsTab.creating") : t("userDetail.healthRecordsTab.createMock")}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4 w-20">{t("userDetail.healthRecordsTab.columns.recordCode")}</th>
                <th className="py-3.5 px-4">{t("userDetail.healthRecordsTab.columns.memberId")}</th>
                <th className="py-3.5 px-4">{t("userDetail.healthRecordsTab.columns.fileName")}</th>
                <th className="py-3.5 px-4">{t("userDetail.healthRecordsTab.columns.status")}</th>
                <th className="py-3.5 px-4">{t("userDetail.healthRecordsTab.columns.prediction")}</th>
                <th className="py-3.5 px-4">{t("userDetail.healthRecordsTab.columns.confidence")}</th>
                <th className="py-3.5 px-4">{t("userDetail.healthRecordsTab.columns.time")}</th>
                <th className="py-3.5 px-4 text-right w-28">{t("userDetail.healthRecordsTab.columns.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {loading && records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-7 h-7 text-primary-600 animate-spin" />
                      <span className="text-sm font-bold text-slate-700">{t("userDetail.healthRecordsTab.loading")}</span>
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
                      <h4 className="text-base font-extrabold text-slate-800">{t("userDetail.healthRecordsTab.emptyTitle")}</h4>
                      <p className="text-xs text-slate-500 max-w-sm">
                        {t("userDetail.healthRecordsTab.emptyDescription")}
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
                        {memberDisplayName || t("userDetail.common.memberFallback", { id: record.userId || memberId })}
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
                        className="h-8 px-2.5 rounded-lg text-slate-600 hover:text-primary-600 hover:bg-primary-50 font-bold text-xs cursor-pointer"
                        title={t("userDetail.healthRecordsTab.viewDetailTooltip")}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        <span>{t("userDetail.common.detail")}</span>
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
              <Trans
                t={t}
                i18nKey="userDetail.pagination.showingRecords"
                values={{ start: startItem, end: endItem, total: totalElements }}
                components={{ strong: <strong className="text-slate-800" /> }}
              />
            </span>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <span>{t("userDetail.pagination.rowsPerPage")}</span>
              <select
                aria-label={t("userDetail.pagination.rowsPerPageAria")}
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value))
                  setPage(1)
                }}
                disabled={loading}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs mr-2">
              <Trans
                t={t}
                i18nKey="userDetail.pagination.pageOf"
                values={{ page, total: Math.max(1, totalPages) }}
                components={{ strong: <strong className="text-slate-800" /> }}
              />
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 px-2.5 rounded-lg border-slate-200 font-bold hover:bg-white text-xs cursor-pointer disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span>{t("userDetail.pagination.previous")}</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 px-2.5 rounded-lg border-slate-200 font-bold hover:bg-white text-xs cursor-pointer disabled:opacity-50"
            >
              <span>{t("userDetail.pagination.next")}</span>
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

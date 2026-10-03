import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { AlertCircle, AlertTriangle, FileText, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

import i18n from "@/lib/i18n"
import { consultationApi } from "@/services"
import type { DoctorScopedHealthRecordResponse } from "@/types/consultation"
import { formatDate } from "./shared"
import { DoctorRecordDetailDialog } from "./doctor-record-detail-dialog"

interface DoctorScopedRecordsTabProps {
  sessionId: string | number
}

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string }
  if (err.response?.status === 403) return i18n.t("consultation:scopedRecordsTab.errors.forbidden")
  if (err.response?.status === 404) return i18n.t("consultation:scopedRecordsTab.errors.notFound")
  return err.response?.data?.message || err.message || fallback
}

export function DoctorScopedRecordsTab({ sessionId }: DoctorScopedRecordsTabProps) {
  const { t } = useTranslation("consultation")
  const [records, setRecords] = useState<DoctorScopedHealthRecordResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [selectedRecordId, setSelectedRecordId] = useState<string | number | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const fetchRecords = () => {
    setLoading(true)
    setErrorMsg(null)
    consultationApi
      .getDoctorScopedRecords(sessionId, { page: 1, size: 50 }) // assuming 50 is enough for scope
      .then((res) => {
        setRecords(res.data.content || [])
      })
      .catch((err) => {
        setErrorMsg(readError(err, t("scopedRecordsTab.errors.loadFailed")))
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchRecords()
  }, [sessionId])

  const handleRecordReviewed = (recordId: string | number) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.record?.id === recordId && r.attention) {
          return { ...r, attention: { ...r.attention, status: "REVIEWED" } }
        }
        return r
      })
    )
  }

  if (loading) {
    return (
      <div className="space-y-3 py-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    )
  }

  if (errorMsg) {
    return (
      <div className="py-8 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-danger-500 mb-2" />
        <p className="text-danger-700 font-medium">{errorMsg}</p>
        <Button variant="outline" className="mt-4" onClick={fetchRecords}>
          {t("scopedRecordsTab.retry")}
        </Button>
      </div>
    )
  }

  return (
    <div className="py-4">
      {records.length === 0 ? (
        <div className="py-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">{t("scopedRecordsTab.empty")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((item) => {
            if (!item.record) return null
            const hasAttention = item.attention?.status === "REQUIRES_ATTENTION"
            const isReviewed = item.attention?.status === "REVIEWED"

            return (
              <div
                key={item.record.id}
                onClick={() => {
                  setSelectedRecordId(item.record.id)
                  setIsDetailOpen(true)
                }}
                className={`flex cursor-pointer flex-col gap-2 rounded-xl border p-4 transition-colors hover:bg-slate-50 ${
                  hasAttention ? "border-warning-200 bg-warning-50/30" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="font-medium text-slate-900 line-clamp-1" title={item.record.fileName || item.record.originalFileName}>
                      {item.record.fileName || item.record.originalFileName || t("scopedRecordsTab.recordFallback", { id: item.record.id })}
                    </span>
                  </div>
                  {hasAttention && (
                    <Badge variant="outline" className="bg-warning-100 text-warning-700 border-warning-200 gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {t("scopedRecordsTab.needsReview")}
                    </Badge>
                  )}
                  {isReviewed && (
                    <Badge variant="outline" className="bg-success-50 text-success-700 border-success-200 gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {t("scopedRecordsTab.reviewed")}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                  <span>{formatDate(item.record.createdAt) || "-"}</span>
                  <span className="flex items-center gap-1.5">
                    {t("scopedRecordsTab.statusLabel")}{" "}<Badge variant="secondary" className="text-[10px] px-1.5 py-0">{item.record.status ? t(`management:healthRecords.status.${item.record.status}`, { defaultValue: item.record.status }) : t("scopedRecordsTab.unknownStatus")}</Badge>
                  </span>
                  {item.record.predictionLabel && (
                    <span className="flex items-center gap-1.5">
                      AI: <Badge variant={item.record.predictionLabel === "NORMAL" ? "outline" : "destructive"} className="text-[10px] px-1.5 py-0">{t(`management:healthRecords.prediction.${item.record.predictionLabel}`, { defaultValue: item.record.predictionLabel })}</Badge>
                    </span>
                  )}
                  {item.record.confidence && (
                    <span>{t("scopedRecordsTab.confidence", { value: (item.record.confidence * 100).toFixed(1) })}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <DoctorRecordDetailDialog
        sessionId={sessionId}
        recordId={selectedRecordId}
        open={isDetailOpen}
        onOpenChange={(val) => {
          setIsDetailOpen(val)
          if (!val) {
            setTimeout(() => setSelectedRecordId(null), 200)
          }
        }}
        onReviewed={handleRecordReviewed}
      />
    </div>
  )
}

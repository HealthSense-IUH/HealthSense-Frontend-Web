import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MeasurementVisuals } from "@/pages/app/general/afib-history/components/MeasurementVisuals"
import { adminHealthRecordApi } from "@/services/health-record.service"
import type { HRVFeatures, HealthRecord } from "@/types/health-record"
import { formatRecordDate } from "@/lib/formatters"

interface HealthRecordDetailDialogProps {
  record: HealthRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HealthRecordDetailDialog({ record, open, onOpenChange }: HealthRecordDetailDialogProps) {
  const { t } = useTranslation("management")
  const [detailRecord, setDetailRecord] = useState<HealthRecord | null>(record)

  useEffect(() => {
    setDetailRecord(record)
    if (!open || !record?.id || record.status !== "COMPLETED") {
      return
    }
    const featuresObj = record.hrvFeatures as HRVFeatures | null | undefined
    if (Array.isArray(featuresObj?.chartData) && featuresObj.chartData.length > 0) {
      return
    }
    let cancelled = false
    adminHealthRecordApi
      .getHealthRecordById(String(record.id))
      .then((res) => {
        if (!cancelled && res?.data) {
          setDetailRecord(res.data)
        }
      })
      .catch(() => {
        // Fallback giữ record hiện có
      })
    return () => {
      cancelled = true
    }
  }, [open, record])

  const activeRecord = detailRecord || record
  if (!activeRecord) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("healthRecords.detail.title")}</DialogTitle>
          <DialogDescription>
            {t("healthRecords.detail.recordId", { id: activeRecord.id })}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <span className="font-semibold text-slate-500">{t("healthRecords.detail.memberId")}</span>
              <p>{activeRecord.userId}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-500">{t("healthRecords.detail.fileName")}</span>
              <p>{activeRecord.fileName || '-'}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-500">{t("healthRecords.detail.status")}</span>
              <p>
                <Badge variant="outline">{activeRecord.status}</Badge>
              </p>
            </div>
            <div>
              <span className="font-semibold text-slate-500">{t("healthRecords.detail.prediction")}</span>
              <p>
                {activeRecord.predictionLabel ? (
                  <Badge variant="outline">{activeRecord.predictionLabel}</Badge>
                ) : '-'}
              </p>
            </div>
            <div>
              <span className="font-semibold text-slate-500">{t("healthRecords.detail.confidence")}</span>
              <p>{activeRecord.confidence ? `${(activeRecord.confidence * 100).toFixed(2)}%` : '-'}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-500">{t("healthRecords.detail.date")}</span>
              <p>{formatRecordDate(activeRecord.createdAt)}</p>
            </div>
          </div>

          {activeRecord.hrvFeatures && (
            <div className="mb-6">
              <MeasurementVisuals features={activeRecord.hrvFeatures as HRVFeatures} />
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">{t("healthRecords.detail.hrvFeatures")}</h3>
            {activeRecord.hrvFeatures && Object.keys(activeRecord.hrvFeatures).length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(activeRecord.hrvFeatures)
                  // Bỏ các mảng dữ liệu đồ thị (chartData, nnIntervals) — đã vẽ ở trên
                  .filter(([, value]) =>
                    typeof value === "number" || typeof value === "string" || typeof value === "boolean"
                  )
                  .map(([key, value]) => (
                    <div key={key} className="bg-slate-50 p-2 rounded-md border text-xs">
                      <span className="font-medium block text-slate-500">{key}</span>
                      <span className="block truncate" title={String(value)}>{String(value)}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">{t("healthRecords.detail.noHrvFeatures")}</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

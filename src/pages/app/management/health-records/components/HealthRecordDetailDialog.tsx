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
import type { HRVFeatures, HealthRecord } from "@/types/health-record"
import { formatRecordDate } from "@/lib/formatters"

interface HealthRecordDetailDialogProps {
  record: HealthRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HealthRecordDetailDialog({ record, open, onOpenChange }: HealthRecordDetailDialogProps) {
  const { t } = useTranslation("management")
  if (!record) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("healthRecords.detail.title")}</DialogTitle>
          <DialogDescription>
            {t("healthRecords.detail.recordId", { id: record.id })}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <span className="font-semibold text-slate-500">{t("healthRecords.detail.memberId")}</span>
              <p>{record.userId}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-500">{t("healthRecords.detail.fileName")}</span>
              <p>{record.fileName || '-'}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-500">{t("healthRecords.detail.status")}</span>
              <p>
                <Badge variant="outline">{record.status}</Badge>
              </p>
            </div>
            <div>
              <span className="font-semibold text-slate-500">{t("healthRecords.detail.prediction")}</span>
              <p>
                {record.predictionLabel ? (
                  <Badge variant="outline">{record.predictionLabel}</Badge>
                ) : '-'}
              </p>
            </div>
            <div>
              <span className="font-semibold text-slate-500">{t("healthRecords.detail.confidence")}</span>
              <p>{record.confidence ? `${(record.confidence * 100).toFixed(2)}%` : '-'}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-500">{t("healthRecords.detail.date")}</span>
              <p>{formatRecordDate(record.createdAt)}</p>
            </div>
          </div>

          {record.hrvFeatures && (
            <div className="mb-6">
              <MeasurementVisuals features={record.hrvFeatures as HRVFeatures} />
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">{t("healthRecords.detail.hrvFeatures")}</h3>
            {record.hrvFeatures && Object.keys(record.hrvFeatures).length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(record.hrvFeatures)
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

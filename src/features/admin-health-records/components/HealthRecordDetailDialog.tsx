import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { HealthRecord } from "../types"

interface HealthRecordDetailDialogProps {
  record: HealthRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HealthRecordDetailDialog({ record, open, onOpenChange }: HealthRecordDetailDialogProps) {
  if (!record) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Health Record Details</DialogTitle>
          <DialogDescription>
            Record ID: {record.id}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <span className="font-semibold text-neutral-500">Member ID:</span>
              <p>{record.userId}</p>
            </div>
            <div>
              <span className="font-semibold text-neutral-500">File Name:</span>
              <p>{record.fileName || '-'}</p>
            </div>
            <div>
              <span className="font-semibold text-neutral-500">Status:</span>
              <p>
                <Badge variant="outline">{record.status}</Badge>
              </p>
            </div>
            <div>
              <span className="font-semibold text-neutral-500">Prediction:</span>
              <p>
                {record.predictionLabel ? (
                  <Badge variant="outline">{record.predictionLabel}</Badge>
                ) : '-'}
              </p>
            </div>
            <div>
              <span className="font-semibold text-neutral-500">Confidence:</span>
              <p>{record.confidence ? `${(record.confidence * 100).toFixed(2)}%` : '-'}</p>
            </div>
            <div>
              <span className="font-semibold text-neutral-500">Date:</span>
              <p>{new Date(record.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">HRV Features</h3>
            {record.hrvFeatures && Object.keys(record.hrvFeatures).length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(record.hrvFeatures).map(([key, value]) => (
                  <div key={key} className="bg-neutral-50 dark:bg-neutral-900 p-2 rounded-md border text-xs">
                    <span className="font-medium block text-neutral-500">{key}</span>
                    <span className="block truncate" title={String(value)}>{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 italic">No HRV features available.</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

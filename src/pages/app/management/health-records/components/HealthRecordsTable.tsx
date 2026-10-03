
import { useTranslation } from "react-i18next"
import { Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { HealthRecord } from "@/types/health-record"
import { formatRecordDate } from "@/lib/formatters"

interface HealthRecordsTableProps {
  records: HealthRecord[]
  isLoading: boolean
  onView: (record: HealthRecord) => void
}

export function HealthRecordsTable({ records, isLoading, onView }: HealthRecordsTableProps) {
  const { t } = useTranslation("management")
  const renderStatusBadge = (status: HealthRecord['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-success-500 hover:bg-success-600">{t("healthRecords.status.COMPLETED")}</Badge>
      case 'PROCESSING':
        return <Badge className="bg-primary-500 hover:bg-primary-600">{t("healthRecords.status.PROCESSING")}</Badge>
      case 'PENDING_UPLOAD':
        return <Badge variant="outline" className="text-warning-600 border-warning-600">{t("healthRecords.status.PENDING_UPLOAD")}</Badge>
      case 'FAILED':
        return <Badge variant="destructive">{t("healthRecords.status.FAILED")}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const renderPredictionBadge = (prediction: HealthRecord['predictionLabel']) => {
    if (!prediction) return <span className="text-slate-400">-</span>
    switch (prediction) {
      case 'NORMAL':
        return <Badge variant="outline" className="text-success-600 border-success-600 bg-success-50">{t("healthRecords.prediction.NORMAL")}</Badge>
      case 'AFIB':
        return <Badge variant="outline" className="text-danger-600 border-danger-600 bg-danger-50">{t("healthRecords.prediction.AFIB")}</Badge>
      case 'UNCERTAIN':
        return <Badge variant="outline" className="text-warning-500 border-warning-500 bg-warning-50">{t("healthRecords.prediction.UNCERTAIN")}</Badge>
      default:
        return <Badge variant="outline">{prediction}</Badge>
    }
  }

  if (isLoading) {
    return <div className="py-10 text-center text-slate-500">{t("healthRecords.table.loading")}</div>
  }

  if (!records?.length) {
    return <div className="py-10 text-center text-slate-500">{t("healthRecords.table.empty")}</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("healthRecords.fields.fileName")}</TableHead>
            <TableHead>{t("healthRecords.fields.memberId")}</TableHead>
            <TableHead>{t("healthRecords.fields.status")}</TableHead>
            <TableHead>{t("healthRecords.fields.prediction")}</TableHead>
            <TableHead>{t("healthRecords.fields.confidence")}</TableHead>
            <TableHead>{t("healthRecords.fields.date")}</TableHead>
            <TableHead className="text-right">{t("healthRecords.fields.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium max-w-[200px] truncate" title={record.fileName}>
                {record.fileName || '-'}
              </TableCell>
              <TableCell>{record.userId}</TableCell>
              <TableCell>{renderStatusBadge(record.status)}</TableCell>
              <TableCell>{renderPredictionBadge(record.predictionLabel)}</TableCell>
              <TableCell>
                {record.confidence !== null && record.confidence !== undefined 
                  ? `${(record.confidence * 100).toFixed(1)}%` 
                  : '-'}
              </TableCell>
              <TableCell>
                {record.createdAt ? formatRecordDate(record.createdAt) : '-'}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="icon" onClick={() => onView(record)} title={t("healthRecords.table.viewDetail")}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

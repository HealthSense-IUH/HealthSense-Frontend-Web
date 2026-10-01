
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
  const renderStatusBadge = (status: HealthRecord['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-success-500 hover:bg-success-600">Completed</Badge>
      case 'PROCESSING':
        return <Badge className="bg-primary-500 hover:bg-primary-600">Processing</Badge>
      case 'PENDING_UPLOAD':
        return <Badge variant="outline" className="text-warning-600 border-warning-600">Pending</Badge>
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const renderPredictionBadge = (prediction: HealthRecord['predictionLabel']) => {
    if (!prediction) return <span className="text-slate-400">-</span>
    switch (prediction) {
      case 'NORMAL':
        return <Badge variant="outline" className="text-success-600 border-success-600 bg-success-50">Normal</Badge>
      case 'AFIB':
        return <Badge variant="outline" className="text-danger-600 border-danger-600 bg-danger-50">AFib</Badge>
      case 'UNCERTAIN':
        return <Badge variant="outline" className="text-warning-500 border-warning-500 bg-warning-50">Uncertain</Badge>
      default:
        return <Badge variant="outline">{prediction}</Badge>
    }
  }

  if (isLoading) {
    return <div className="py-10 text-center text-slate-500">Loading records...</div>
  }

  if (!records?.length) {
    return <div className="py-10 text-center text-slate-500">No records found.</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File Name</TableHead>
            <TableHead>Member ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prediction</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
                <Button variant="ghost" size="icon" onClick={() => onView(record)} title="View Detail">
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

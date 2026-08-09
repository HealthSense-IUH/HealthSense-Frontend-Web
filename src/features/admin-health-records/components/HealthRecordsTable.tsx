
import { Edit, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { HealthRecord } from "../types"

interface HealthRecordsTableProps {
  records: HealthRecord[]
  isLoading: boolean
  onView: (record: HealthRecord) => void
  onEdit: (record: HealthRecord) => void
}

export function HealthRecordsTable({ records, isLoading, onView, onEdit }: HealthRecordsTableProps) {
  const renderStatusBadge = (status: HealthRecord['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
      case 'PROCESSING':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Processing</Badge>
      case 'PENDING_UPLOAD':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const renderPredictionBadge = (prediction: HealthRecord['predictionLabel']) => {
    if (!prediction) return <span className="text-neutral-400">-</span>
    switch (prediction) {
      case 'NORMAL':
        return <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 dark:bg-green-950/20">Normal</Badge>
      case 'AFIB':
        return <Badge variant="outline" className="text-red-600 border-red-600 bg-red-50 dark:bg-red-950/20">AFib</Badge>
      case 'UNCERTAIN':
        return <Badge variant="outline" className="text-orange-500 border-orange-500 bg-orange-50 dark:bg-orange-950/20">Uncertain</Badge>
      default:
        return <Badge variant="outline">{prediction}</Badge>
    }
  }

  if (isLoading) {
    return <div className="py-10 text-center text-neutral-500">Loading records...</div>
  }

  if (!records?.length) {
    return <div className="py-10 text-center text-neutral-500">No records found.</div>
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
                {record.createdAt ? new Date(record.createdAt).toLocaleString() : '-'}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="icon" onClick={() => onView(record)} title="View Detail">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onEdit(record)} title="Edit Record">
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

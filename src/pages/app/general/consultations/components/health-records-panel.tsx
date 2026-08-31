import { FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import type { HealthRecordItem } from "@/types/consultation"
import { EmptyRow, formatDate, statusBadge } from "./shared"

export function HealthRecordsPanel({
  records,
  loading,
  onSelect,
}: {
  records: HealthRecordItem[]
  loading: boolean
  onSelect: (record: HealthRecordItem) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Health Records</CardTitle>
        <CardDescription>Select a record to quickly attach it to your consultation request.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Record</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prediction</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 && <EmptyRow colSpan={5} text={loading ? "Loading health records..." : "No health records found."} />}
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">#{record.id}</TableCell>
                <TableCell>{statusBadge(record.status ?? "-")}</TableCell>
                <TableCell>{record.predictionLabel ?? "-"}</TableCell>
                <TableCell>{formatDate(record.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => onSelect(record)}>
                    <FileText data-icon="inline-start" />
                    Use
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

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
        <CardTitle>Hồ sơ sức khỏe của tôi</CardTitle>
        <CardDescription>Chọn một hồ sơ để đính kèm nhanh vào yêu cầu tư vấn của bạn.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hồ sơ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Dự đoán</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 && <EmptyRow colSpan={5} text={loading ? "Đang tải hồ sơ sức khỏe..." : "Không tìm thấy hồ sơ sức khỏe nào."} />}
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">#{record.id}</TableCell>
                <TableCell>{statusBadge(record.status ?? "-")}</TableCell>
                <TableCell>{record.predictionLabel ?? "-"}</TableCell>
                <TableCell>{formatDate(record.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => onSelect(record)}>
                    <FileText data-icon="inline-start" />
                    Sử dụng
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

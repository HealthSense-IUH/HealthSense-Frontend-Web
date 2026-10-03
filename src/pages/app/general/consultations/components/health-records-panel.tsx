import { FileText } from "lucide-react"
import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation("consultation")
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("healthRecordsPanel.title")}</CardTitle>
        <CardDescription>{t("healthRecordsPanel.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("healthRecordsPanel.columns.record")}</TableHead>
              <TableHead>{t("healthRecordsPanel.columns.status")}</TableHead>
              <TableHead>{t("healthRecordsPanel.columns.prediction")}</TableHead>
              <TableHead>{t("healthRecordsPanel.columns.createdAt")}</TableHead>
              <TableHead className="text-right">{t("healthRecordsPanel.columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 && <EmptyRow colSpan={5} text={loading ? t("healthRecordsPanel.loading") : t("healthRecordsPanel.empty")} />}
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">#{record.id}</TableCell>
                <TableCell>{statusBadge(record.status ?? "-")}</TableCell>
                <TableCell>{record.predictionLabel ?? "-"}</TableCell>
                <TableCell>{formatDate(record.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => onSelect(record)}>
                    <FileText data-icon="inline-start" />
                    {t("healthRecordsPanel.use")}
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

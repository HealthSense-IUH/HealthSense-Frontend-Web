import { useTranslation } from "react-i18next"
import { Loader2, RefreshCw, Trash2 } from "lucide-react"

import { EmptyState } from "@/components/custom/EmptyState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatFileSize, formatRecordDate } from "@/lib/formatters"
import type { KnowledgeDocument } from "@/types/knowledge"

interface KnowledgeTableProps {
  documents: KnowledgeDocument[]
  isLoading: boolean
  busyId: string | null
  onReingest: (doc: KnowledgeDocument) => void
  onDelete: (doc: KnowledgeDocument) => void
}

export function KnowledgeTable({ documents, isLoading, busyId, onReingest, onDelete }: KnowledgeTableProps) {
  const { t } = useTranslation("knowledge")

  const renderStatus = (doc: KnowledgeDocument) => {
    switch (doc.status) {
      case "READY":
        return <Badge className="bg-success-500 hover:bg-success-600">{t("status.READY")}</Badge>
      case "PROCESSING":
        return (
          <Badge className="bg-primary-500 hover:bg-primary-600">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            {t("status.PROCESSING")}
          </Badge>
        )
      case "PENDING":
        return (
          <Badge variant="outline" className="border-warning-600 text-warning-600">
            {t("status.PENDING")}
          </Badge>
        )
      case "FAILED":
        return (
          <Badge variant="destructive" title={doc.errorMessage ?? undefined}>
            {t("status.FAILED")}
          </Badge>
        )
      default:
        return <Badge variant="outline">{doc.status}</Badge>
    }
  }

  if (isLoading && documents.length === 0) {
    return <div className="py-10 text-center text-muted-foreground">{t("table.loading")}</div>
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60">
        <EmptyState illustration="documents" title={t("table.emptyTitle")} description={t("table.empty")} />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("table.title")}</TableHead>
            <TableHead>{t("table.file")}</TableHead>
            <TableHead className="text-right">{t("table.size")}</TableHead>
            <TableHead>{t("table.status")}</TableHead>
            <TableHead className="text-right">{t("table.chunks")}</TableHead>
            <TableHead>{t("table.updated")}</TableHead>
            <TableHead className="text-right">{t("table.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => {
            const busy = busyId === doc.id
            return (
              <TableRow key={doc.id}>
                <TableCell className="max-w-[280px]">
                  <p className="truncate font-semibold text-foreground" title={doc.title}>
                    {doc.title}
                  </p>
                  {doc.status === "FAILED" && doc.errorMessage && (
                    <p className="mt-0.5 truncate text-xs text-destructive" title={doc.errorMessage}>
                      {doc.errorMessage}
                    </p>
                  )}
                </TableCell>
                <TableCell className="max-w-[220px] truncate text-muted-foreground" title={doc.fileName}>
                  {doc.fileName}
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatFileSize(doc.sizeBytes)}</TableCell>
                <TableCell>{renderStatus(doc)}</TableCell>
                <TableCell className="text-right tabular-nums">{doc.chunkCount}</TableCell>
                <TableCell className="text-muted-foreground">{formatRecordDate(doc.updatedAt)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("table.reingest")}
                      title={t("table.reingest")}
                      disabled={busy || doc.status === "PROCESSING"}
                      onClick={() => onReingest(doc)}
                      className="h-8 w-8"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("table.delete")}
                      title={t("table.delete")}
                      disabled={busy}
                      onClick={() => onDelete(doc)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

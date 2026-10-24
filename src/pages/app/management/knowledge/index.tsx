import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { BookOpen, Search, Upload } from "lucide-react"

import { Page, PageBody, PageFooter, PageHeader } from "@/components/layout/page"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { knowledgeApi } from "@/services/knowledge.service"
import type { PaginatedResponse } from "@/types/health-record"
import type { KnowledgeDocument, KnowledgeSummary } from "@/types/knowledge"
import { KnowledgeTable } from "./components/KnowledgeTable"
import { KnowledgeUploadDialog } from "./components/KnowledgeUploadDialog"

const PAGE_SIZE = 10
const POLL_MS = 5000

/**
 * Kho tri thức của trợ lý Cara: admin tải tài liệu lên, theo dõi trạng thái ingest (worker trên cloud
 * tách đoạn + embedding), ingest lại hoặc xoá. Tự làm mới mỗi 5 giây khi còn tài liệu đang xử lý.
 */
export default function KnowledgeManagementPage() {
  const { t } = useTranslation("knowledge")
  const { toast } = useToast()

  const [data, setData] = useState<PaginatedResponse<KnowledgeDocument> | null>(null)
  const [summary, setSummary] = useState<KnowledgeSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [keywordInput, setKeywordInput] = useState("")
  const [keyword, setKeyword] = useState("")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<KnowledgeDocument | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const fetchAll = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true)
      try {
        const [list, sum] = await Promise.all([
          knowledgeApi.list({ keyword: keyword || undefined, page, size: PAGE_SIZE }),
          knowledgeApi.summary(),
        ])
        setData(list.data)
        setSummary(sum.data)
      } catch {
        if (!silent) toast({ variant: "destructive", title: t("errors.load") })
      } finally {
        if (!silent) setIsLoading(false)
      }
    },
    [keyword, page, t, toast]
  )

  useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  // Còn tài liệu đang chờ/đang xử lý thì tự làm mới để thấy trạng thái đổi
  const hasInFlight = (data?.content ?? []).some((d) => d.status === "PENDING" || d.status === "PROCESSING")
  useEffect(() => {
    if (!hasInFlight) return
    const timer = window.setInterval(() => void fetchAll(true), POLL_MS)
    return () => window.clearInterval(timer)
  }, [hasInFlight, fetchAll])

  const applySearch = () => {
    setPage(1)
    setKeyword(keywordInput.trim())
  }

  const reingest = async (doc: KnowledgeDocument) => {
    setBusyId(doc.id)
    try {
      await knowledgeApi.reingest(doc.id)
      toast({ title: t("reingest.success") })
      await fetchAll(true)
    } catch {
      toast({ variant: "destructive", title: t("reingest.failed") })
    } finally {
      setBusyId(null)
    }
  }

  const confirmDelete = async () => {
    const doc = pendingDelete
    if (!doc) return
    setPendingDelete(null)
    setBusyId(doc.id)
    try {
      await knowledgeApi.remove(doc.id)
      toast({ title: t("delete.success") })
      await fetchAll(true)
    } catch {
      toast({ variant: "destructive", title: t("delete.failed") })
    } finally {
      setBusyId(null)
    }
  }

  const summaryItems: { key: keyof KnowledgeSummary; tone: string }[] = [
    { key: "total", tone: "text-foreground" },
    { key: "ready", tone: "text-success-600" },
    { key: "processing", tone: "text-primary-600" },
    { key: "failed", tone: "text-destructive" },
  ]

  return (
    <Page>
      <PageHeader
        title={t("title")}
        description={t("description")}
        icon={<BookOpen className="h-5 w-5" />}
        actions={
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            {t("upload.button")}
          </Button>
        }
      />

      <PageBody>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {summaryItems.map(({ key, tone }) => (
            <div key={key} className="rounded-xl border border-border bg-card px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t(`summary.${key}`)}</p>
              <p className={`mt-1 text-2xl font-bold tabular-nums ${tone}`}>{summary ? summary[key] : "—"}</p>
            </div>
          ))}
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            applySearch()
          }}
        >
          <Input
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder={t("search.placeholder")}
            className="max-w-md"
          />
          <Button type="submit" variant="outline">
            <Search className="mr-2 h-4 w-4" />
            {t("search.button")}
          </Button>
        </form>

        <KnowledgeTable
          documents={data?.content ?? []}
          isLoading={isLoading}
          busyId={busyId}
          onReingest={(doc) => void reingest(doc)}
          onDelete={setPendingDelete}
        />

        <KnowledgeUploadDialog
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          onSuccess={() => {
            toast({ title: t("upload.success") })
            setPage(1)
            void fetchAll(true)
          }}
        />

        <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("delete.title")}</AlertDialogTitle>
              <AlertDialogDescription>{t("delete.description", { title: pendingDelete?.title ?? "" })}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("delete.cancel")}</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => void confirmDelete()}>
                {t("delete.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PageBody>

      <PageFooter>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p>
            {t("pagination.info", {
              page: data?.page ?? 1,
              totalPages: Math.max(1, data?.totalPages ?? 1),
              total: data?.totalElements ?? 0,
            })}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || isLoading}>
              {t("pagination.previous")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!data?.hasMore || isLoading}>
              {t("pagination.next")}
            </Button>
          </div>
        </div>
      </PageFooter>
    </Page>
  )
}

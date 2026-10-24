import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Loader2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { knowledgeApi } from "@/services/knowledge.service"
import { formatFileSize } from "./KnowledgeTable"

const ACCEPT = ".pdf,.docx,.doc,.txt,.md,.markdown,.html,.htm,.csv,.xlsx,.pptx,.rtf,.odt"
const MAX_SIZE = 20 * 1024 * 1024

interface KnowledgeUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function KnowledgeUploadDialog({ open, onOpenChange, onSuccess }: KnowledgeUploadDialogProps) {
  const { t } = useTranslation("knowledge")
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setFile(null)
      setTitle("")
      setError(null)
      setSubmitting(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }, [open])

  const pick = (f: File | null) => {
    setError(null)
    if (f && f.size > MAX_SIZE) {
      setFile(null)
      setError(t("upload.tooLarge"))
      return
    }
    setFile(f)
    if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, ""))
  }

  const submit = async () => {
    if (!file) {
      setError(t("upload.fileRequired"))
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await knowledgeApi.upload(file, title)
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(message || t("upload.failed"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("upload.title")}</DialogTitle>
          <DialogDescription>{t("upload.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="knowledge-file">{t("upload.fileLabel")}</Label>
            <Input
              id="knowledge-file"
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              disabled={submitting}
              onChange={(e) => pick(e.target.files?.[0] ?? null)}
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                {file.name} · {formatFileSize(file.size)}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="knowledge-title">{t("upload.titleLabel")}</Label>
            <Input
              id="knowledge-title"
              value={title}
              maxLength={200}
              placeholder={t("upload.titlePlaceholder")}
              disabled={submitting}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" disabled={submitting} onClick={() => onOpenChange(false)}>
            {t("upload.cancel")}
          </Button>
          <Button type="button" disabled={submitting || !file} onClick={() => void submit()}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {submitting ? t("upload.uploading") : t("upload.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

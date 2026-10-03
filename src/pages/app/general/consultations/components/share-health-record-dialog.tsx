import { useEffect, useState } from "react"
import { Share2, FileText, CheckCircle2, AlertCircle, RefreshCw, Activity } from "lucide-react"
import { Trans, useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"

import { consultationApi } from "@/services"
import type { HealthRecordItem } from "@/types/consultation"
import { formatDate } from "./shared"
import i18n from "@/lib/i18n"

interface ShareHealthRecordDialogProps {
  sessionId: string | number
  sessionStatus?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSharedSuccess?: () => void
}

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string }
  if (err.response?.status === 403) return i18n.t("consultation:shareHealthRecordDialog.errors.forbidden")
  if (err.response?.status === 400) return err.response?.data?.message || i18n.t("consultation:shareHealthRecordDialog.errors.invalid")
  return err.response?.data?.message || err.message || fallback
}

export function ShareHealthRecordDialog({
  sessionId,
  sessionStatus,
  open,
  onOpenChange,
  onSharedSuccess,
}: ShareHealthRecordDialogProps) {
  const { t } = useTranslation("consultation")
  const { toast } = useToast()
  const [records, setRecords] = useState<HealthRecordItem[]>([])
  const [loading, setLoading] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [selectedRecordId, setSelectedRecordId] = useState<string | number | null>(null)

  const isSessionActive = sessionStatus === "ACTIVE"

  useEffect(() => {
    if (open) {
      setSelectedRecordId(null)
      setLoading(true)
      consultationApi.listMyHealthRecords({ page: 1, size: 50 })
        .then((res) => {
          setRecords(res.data.content || [])
        })
        .catch((err) => {
          toast({
            variant: "destructive",
            title: t("shareHealthRecordDialog.toast.loadErrorTitle"),
            description: readError(err, t("shareHealthRecordDialog.toast.loadErrorDescription")),
          })
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setSelectedRecordId(null)
    }
  }, [open, toast, t])

  const handleShare = async () => {
    if (!selectedRecordId) return
    if (!isSessionActive) {
      toast({
        variant: "destructive",
        title: t("shareHealthRecordDialog.toast.invalidSessionTitle"),
        description: t("shareHealthRecordDialog.toast.invalidSessionDescription"),
      })
      return
    }

    setSharing(true)
    try {
      await consultationApi.shareHealthRecord(sessionId, selectedRecordId)
      toast({
        title: t("shareHealthRecordDialog.toast.successTitle"),
        description: t("shareHealthRecordDialog.toast.successDescription", { id: selectedRecordId }),
      })
      onOpenChange(false)
      onSharedSuccess?.()
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("shareHealthRecordDialog.toast.shareErrorTitle"),
        description: readError(err, t("shareHealthRecordDialog.toast.shareErrorDescription")),
      })
    } finally {
      setSharing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-3 border-b bg-muted/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">{t("shareHealthRecordDialog.title")}</DialogTitle>
              <DialogDescription>
                {t("shareHealthRecordDialog.description", { id: sessionId })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 flex-1 overflow-hidden flex flex-col space-y-4">
          {!isSessionActive && (
            <div className="flex items-start gap-2 p-3 bg-warning-50 border border-warning-200 rounded-xl text-xs text-warning-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <Trans
                  t={t}
                  i18nKey="shareHealthRecordDialog.inactiveNotice"
                  values={{ status: sessionStatus || "INACTIVE" }}
                  components={{ strong: <strong /> }}
                />
              </span>
            </div>
          )}

          <div className="text-xs text-muted-foreground flex items-center justify-between">
            <span>{t("shareHealthRecordDialog.selectPrompt")}</span>
            <span>{t("shareHealthRecordDialog.availableCount", { count: records.length })}</span>
          </div>

          <ScrollArea className="flex-1 max-h-[42vh] pr-2">
            {loading ? (
              <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                <span className="text-xs">{t("shareHealthRecordDialog.loading")}</span>
              </div>
            ) : records.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2 border border-dashed rounded-xl p-4">
                <FileText className="w-8 h-8 text-muted-foreground/50" />
                <span className="text-sm font-medium">{t("shareHealthRecordDialog.emptyTitle")}</span>
                <span className="text-xs text-muted-foreground">{t("shareHealthRecordDialog.emptyDescription")}</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {records.map((record) => {
                  const isSelected = selectedRecordId === record.id
                  return (
                    <div
                      key={record.id}
                      onClick={() => isSessionActive && setSelectedRecordId(record.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all select-none ${
                        isSelected
                          ? "bg-primary/10 border-primary shadow-2xs"
                          : isSessionActive
                            ? "bg-card hover:bg-muted/30 border-border"
                            : "opacity-60 cursor-not-allowed bg-muted/10 border-border"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          <Activity className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-xs truncate text-foreground">
                              #{record.id} {record.originalFileName ? `- ${record.originalFileName}` : ""}
                            </span>
                            {record.predictionLabel && (
                              <Badge
                                variant={record.predictionLabel === "NORMAL" ? "outline" : "destructive"}
                                className="text-[10px] py-0 px-1.5 h-4"
                              >
                                {record.predictionLabel}
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {t("shareHealthRecordDialog.createdAt", { date: formatDate(record.createdAt) })}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 ml-2" />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="p-4 border-t bg-muted/10 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sharing}
          >
            {t("shareHealthRecordDialog.close")}
          </Button>
          <Button
            type="button"
            onClick={handleShare}
            disabled={!selectedRecordId || !isSessionActive || sharing || loading}
            className="gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            {sharing ? t("shareHealthRecordDialog.sharing") : t("shareHealthRecordDialog.share")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

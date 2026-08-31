import { useEffect, useState } from "react"
import { Share2, FileText, CheckCircle2, AlertCircle, RefreshCw, Activity } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"

import { consultationApi } from "@/services"
import type { HealthRecordItem } from "@/types/consultation"
import { formatDate } from "./shared"

interface ShareHealthRecordDialogProps {
  sessionId: string | number
  sessionStatus?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSharedSuccess?: () => void
}

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string }
  if (err.response?.status === 403) return "Bạn không có quyền chia sẻ hồ sơ trong phiên này."
  if (err.response?.status === 400) return err.response?.data?.message || "Hồ sơ không hợp lệ hoặc phiên chưa được kích hoạt."
  return err.response?.data?.message || err.message || fallback
}

export function ShareHealthRecordDialog({
  sessionId,
  sessionStatus,
  open,
  onOpenChange,
  onSharedSuccess,
}: ShareHealthRecordDialogProps) {
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
            title: "Lỗi tải hồ sơ",
            description: readError(err, "Không thể tải danh sách hồ sơ sức khỏe của bạn."),
          })
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setSelectedRecordId(null)
    }
  }, [open, toast])

  const handleShare = async () => {
    if (!selectedRecordId) return
    if (!isSessionActive) {
      toast({
        variant: "destructive",
        title: "Phiên không hợp lệ",
        description: "Chỉ có thể chia sẻ hồ sơ khi phiên tư vấn đang hoạt động (ACTIVE).",
      })
      return
    }

    setSharing(true)
    try {
      await consultationApi.shareHealthRecord(sessionId, selectedRecordId)
      toast({
        title: "Chia sẻ hồ sơ thành công",
        description: `Hồ sơ #${selectedRecordId} đã được cấp quyền cho bác sĩ phụ trách xem xét.`,
      })
      onOpenChange(false)
      onSharedSuccess?.()
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Lỗi chia sẻ hồ sơ",
        description: readError(err, "Không thể chia sẻ hồ sơ lúc này."),
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
              <DialogTitle className="text-lg font-bold">Chia sẻ Hồ sơ Sức khỏe</DialogTitle>
              <DialogDescription>
                Cấp quyền cho bác sĩ phụ trách xem kết quả đo nhịp tim trong phiên tư vấn #{sessionId}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 flex-1 overflow-hidden flex flex-col space-y-4">
          {!isSessionActive && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Phiên chăm sóc hiện đang ở trạng thái <strong>{sessionStatus || "INACTIVE"}</strong>. Bạn chỉ có thể chia sẻ thêm hồ sơ đo đạc khi phiên tư vấn đang hoạt động (ACTIVE).
              </span>
            </div>
          )}

          <div className="text-xs text-muted-foreground flex items-center justify-between">
            <span>Chọn 1 hồ sơ đo đạc của bạn để chia sẻ:</span>
            <span>{records.length} hồ sơ khả dụng</span>
          </div>

          <ScrollArea className="flex-1 max-h-[42vh] pr-2">
            {loading ? (
              <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                <span className="text-xs">Đang tải danh sách hồ sơ...</span>
              </div>
            ) : records.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2 border border-dashed rounded-xl p-4">
                <FileText className="w-8 h-8 text-muted-foreground/50" />
                <span className="text-sm font-medium">Chưa có hồ sơ đo đạc nào</span>
                <span className="text-xs text-muted-foreground">Bạn hãy tải lên bản ghi ECG/HRV mới ở mục Quản lý Hồ sơ trước.</span>
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
                            Ngày tạo: {formatDate(record.createdAt)}
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
            Đóng
          </Button>
          <Button
            type="button"
            onClick={handleShare}
            disabled={!selectedRecordId || !isSessionActive || sharing || loading}
            className="gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            {sharing ? "Đang chia sẻ..." : "Chia sẻ hồ sơ này"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

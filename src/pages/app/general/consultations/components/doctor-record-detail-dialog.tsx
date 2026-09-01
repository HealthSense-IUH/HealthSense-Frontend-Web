import { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2, FileText, Activity, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

import { MeasurementVisuals } from "@/pages/app/general/afib-history/components/MeasurementVisuals"
import type { HRVFeatures } from "@/types/health-record"

import { consultationApi } from "@/services"
import type { DoctorScopedHealthRecordResponse } from "@/types/consultation"
import { formatDate, statusBadge } from "./shared"

interface DoctorRecordDetailDialogProps {
  sessionId: string | number
  recordId: string | number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onReviewed?: (recordId: string | number) => void
}

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string }
  if (err.response?.status === 403) return "Bạn không có quyền xem hồ sơ này."
  if (err.response?.status === 404) return "Không tìm thấy hồ sơ trong phạm vi tư vấn."
  return err.response?.data?.message || err.message || fallback
}

export function DoctorRecordDetailDialog({
  sessionId,
  recordId,
  open,
  onOpenChange,
  onReviewed,
}: DoctorRecordDetailDialogProps) {
  const [detail, setDetail] = useState<DoctorScopedHealthRecordResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [reviewing, setReviewing] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!open || !recordId) {
      if (!open) {
        setDetail(null)
        setErrorMsg(null)
      }
      return
    }

    setLoading(true)
    setErrorMsg(null)
    consultationApi
      .getDoctorScopedRecordDetail(sessionId, recordId)
      .then((res) => {
        setDetail(res.data)
      })
      .catch((error) => {
        setErrorMsg(readError(error, "Không thể tải chi tiết hồ sơ."))
      })
      .finally(() => {
        setLoading(false)
      })
  }, [sessionId, recordId, open])

  const handleReview = async () => {
    if (!recordId) return
    setReviewing(true)
    try {
      await consultationApi.reviewDoctorScopedRecordAttention(sessionId, recordId)
      toast({ description: "Đã đánh dấu xem thành công." })
      if (detail && detail.attention) {
        setDetail({
          ...detail,
          attention: { ...detail.attention, status: "REVIEWED" },
        })
      }
      onReviewed?.(recordId)
    } catch (error) {
      toast({ variant: "destructive", description: readError(error, "Lỗi khi đánh dấu đã xem.") })
    } finally {
      setReviewing(false)
    }
  }

  const handleDownloadRawArtifact = async () => {
    if (!recordId) return
    setDownloading(true)
    try {
      const res = await consultationApi.getDoctorScopedRawArtifact(sessionId, recordId)
      const downloadUrl = res.data.downloadUrl || res.data.uploadUrl
      if (downloadUrl) {
        const link = document.createElement("a")
        link.href = downloadUrl
        link.target = "_blank"
        link.rel = "noopener noreferrer"
        link.download = detail?.record?.originalFileName || detail?.record?.fileName || `health-record-${recordId}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast({ description: "Đang tải xuống tệp dữ liệu gốc..." })
      } else {
        toast({
          variant: "destructive",
          title: "Lỗi tải tệp",
          description: "Không tìm thấy liên kết tải file dữ liệu gốc.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi tải tệp",
        description: readError(error, "Không thể tải tệp dữ liệu gốc cho hồ sơ này."),
      })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-neutral-500" />
            Chi tiết Hồ sơ sức khỏe
          </DialogTitle>
          <DialogDescription>ID Hồ sơ: {recordId}</DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : errorMsg ? (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{errorMsg}</div>
          ) : detail?.record ? (
            <div className="space-y-6">
              {detail.attention?.status === "REQUIRES_ATTENTION" && detail.attention?.reason === "AFIB" && (
                <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                  <div>
                    <h4 className="font-medium text-orange-900">Kết quả AI cần bác sĩ xem lại.</h4>
                    <p className="mt-1 text-sm text-orange-700">
                      Hệ thống ghi nhận dấu hiệu bất thường (AFIB) trong hồ sơ này.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Tên file</p>
                  <p className="font-medium truncate" title={detail.record.fileName || detail.record.originalFileName}>
                    {detail.record.fileName || detail.record.originalFileName || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Ngày tạo</p>
                  <p className="font-medium">{formatDate(detail.record.createdAt) || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Trạng thái xử lý</p>
                  <div className="font-medium">
                    {statusBadge(detail.record.status || "-")}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Dung lượng</p>
                  <p className="font-medium">
                    {detail.record.fileSize ? `${(detail.record.fileSize / 1024).toFixed(1)} KB` : "-"}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border bg-neutral-50 p-4">
                <h4 className="mb-3 flex items-center gap-2 font-medium text-neutral-700">
                  <Activity className="h-4 w-4" /> Kết quả phân tích AI
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Nhãn dự đoán</p>
                    <p className="font-medium">
                      {detail.record.predictionLabel ? (
                        <Badge variant={detail.record.predictionLabel === "NORMAL" ? "secondary" : "destructive"}>
                          {detail.record.predictionLabel}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Độ tin cậy</p>
                    <p className="font-medium">
                      {detail.record.confidence ? `${(detail.record.confidence * 100).toFixed(1)}%` : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {detail.record.hrvFeatures && (
                <MeasurementVisuals features={detail.record.hrvFeatures as HRVFeatures} />
              )}
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:justify-between flex-wrap">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
            {detail?.record && (
              <Button
                variant="outline"
                onClick={handleDownloadRawArtifact}
                disabled={downloading}
                className="gap-1.5"
              >
                <Download className="h-4 w-4" />
                {downloading ? "Đang tải..." : "Tải CSV gốc"}
              </Button>
            )}
          </div>
          {detail?.attention?.status === "REQUIRES_ATTENTION" && (
            <Button onClick={() => void handleReview()} disabled={reviewing}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Đánh dấu đã xem
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

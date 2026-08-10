import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, Save, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { consultationApi } from "../services/consultation-api"
import type { ConsultationFinalSummaryResponse, ConsultationStatus } from "../types"
import { formatDate } from "./shared"

interface DoctorFinalSummaryTabProps {
  sessionId: string | number
  sessionStatus: ConsultationStatus
}

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string }
  if (err.response?.status === 403) return "Bạn không có quyền thao tác trên phiên này."
  return err.response?.data?.message || err.message || fallback
}

export function DoctorFinalSummaryTab({ sessionId, sessionStatus }: DoctorFinalSummaryTabProps) {
  const [summary, setSummary] = useState<ConsultationFinalSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  // Draft form state
  const [summaryText, setSummaryText] = useState("")
  const [observations, setObservations] = useState("")
  const [recommendations, setRecommendations] = useState("")
  const [followUpRecommendation, setFollowUpRecommendation] = useState("")

  const [confirmFinalizeOpen, setConfirmFinalizeOpen] = useState(false)

  const { toast } = useToast()

  const fetchSummary = () => {
    setLoading(true)
    setErrorMsg(null)
    consultationApi
      .getDoctorFinalSummary(sessionId)
      .then((res) => {
        setSummary(res.data)
        setSummaryText(res.data.summary || "")
        setObservations(res.data.observations || "")
        setRecommendations(res.data.recommendations || "")
        setFollowUpRecommendation(res.data.followUpRecommendation || "")
      })
      .catch((err) => {
        // If 404, it means no summary exists yet, which is fine for DRAFT mode.
        if (err.response?.status === 404) {
          setSummary(null)
        } else {
          setErrorMsg(readError(err, "Không thể tải tổng kết chăm sóc."))
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchSummary()
  }, [sessionId])

  const handleSaveDraft = async () => {
    if (!summaryText.trim()) {
      toast({ variant: "destructive", description: "Vui lòng nhập nội dung Tổng kết." })
      return
    }

    setSaving(true)
    try {
      const payload = {
        summary: summaryText.trim(),
        observations: observations.trim() || null,
        recommendations: recommendations.trim() || null,
        followUpRecommendation: followUpRecommendation.trim() || null,
      }
      const res = await consultationApi.updateDoctorFinalSummary(sessionId, payload)
      setSummary(res.data)
      toast({ description: "Đã lưu bản nháp thành công." })
    } catch (error) {
      toast({ variant: "destructive", description: readError(error, "Lỗi khi lưu bản nháp.") })
    } finally {
      setSaving(false)
    }
  }

  const handleFinalize = async () => {
    setFinalizing(true)
    try {
      const res = await consultationApi.finalizeDoctorFinalSummary(sessionId)
      setSummary(res.data)
      setConfirmFinalizeOpen(false)
      toast({ description: "Đã hoàn tất tổng kết chăm sóc." })
    } catch (error) {
      toast({ variant: "destructive", description: readError(error, "Lỗi khi hoàn tất tổng kết.") })
    } finally {
      setFinalizing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-10 w-32" />
      </div>
    )
  }

  if (errorMsg) {
    return (
      <div className="py-8 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
        <p className="text-red-700 font-medium">{errorMsg}</p>
        <Button variant="outline" className="mt-4" onClick={fetchSummary}>
          Thử lại
        </Button>
      </div>
    )
  }

  const isFinalized = summary?.status === "FINALIZED"
  const isEditable = !isFinalized && (sessionStatus === "ACTIVE" || sessionStatus === "COMPLETED")
  const canSave = isEditable
  const canFinalize = !isFinalized && sessionStatus === "COMPLETED" && !!summaryText.trim()

  return (
    <div className="py-4 space-y-6">
      {isFinalized && (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Tổng kết phiên tư vấn</p>
              <p className="text-sm text-green-700">
                Đã hoàn tất lúc: {formatDate(summary?.finalizedAt) || "-"}
              </p>
            </div>
          </div>
          <Badge className="bg-green-600 hover:bg-green-700">Đã hoàn tất</Badge>
        </div>
      )}

      {!isFinalized && sessionStatus === "ACTIVE" && (
        <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
          <Info className="h-5 w-5 shrink-0" />
          <p>
            Bạn có thể soạn bản nháp trong khi phiên đang diễn ra. Chỉ có thể hoàn tất tổng kết sau khi phiên kết thúc.
          </p>
        </div>
      )}
      
      {!isFinalized && (sessionStatus === "SCHEDULED" || sessionStatus === "CANCELLED" || sessionStatus === "EXPIRED") && (
        <div className="flex items-start gap-2 rounded-md bg-orange-50 p-3 text-sm text-orange-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>
            Không thể lập tổng kết cho phiên tư vấn đang ở trạng thái {sessionStatus}.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700">
            Tổng kết <span className="text-red-500">*</span>
          </label>
          {isEditable ? (
            <Textarea
              placeholder="Nhập nội dung tổng kết..."
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              className="min-h-[100px]"
            />
          ) : (
            <div className="rounded-md border bg-neutral-50 p-3 text-sm whitespace-pre-wrap min-h-[80px]">
              {summaryText || <span className="text-neutral-400 italic">Không có dữ liệu</span>}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700">Nhận xét</label>
          {isEditable ? (
            <Textarea
              placeholder="Nhập nhận xét (tùy chọn)..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="min-h-[80px]"
            />
          ) : (
            <div className="rounded-md border bg-neutral-50 p-3 text-sm whitespace-pre-wrap min-h-[60px]">
              {observations || <span className="text-neutral-400 italic">Không có dữ liệu</span>}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700">Khuyến nghị</label>
          {isEditable ? (
            <Textarea
              placeholder="Nhập khuyến nghị (tùy chọn)..."
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              className="min-h-[80px]"
            />
          ) : (
            <div className="rounded-md border bg-neutral-50 p-3 text-sm whitespace-pre-wrap min-h-[60px]">
              {recommendations || <span className="text-neutral-400 italic">Không có dữ liệu</span>}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700">Khuyến nghị theo dõi</label>
          {isEditable ? (
            <Textarea
              placeholder="Khuyến nghị theo dõi (tùy chọn)..."
              value={followUpRecommendation}
              onChange={(e) => setFollowUpRecommendation(e.target.value)}
              className="min-h-[80px]"
            />
          ) : (
            <div className="rounded-md border bg-neutral-50 p-3 text-sm whitespace-pre-wrap min-h-[60px]">
              {followUpRecommendation || <span className="text-neutral-400 italic">Không có dữ liệu</span>}
            </div>
          )}
        </div>
      </div>

      {!isFinalized && (canSave || canFinalize) && (
        <div className="flex items-center gap-3 pt-4 border-t">
          {canSave && (
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={saving || finalizing}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Đang lưu..." : "Lưu nháp"}
            </Button>
          )}
          {canFinalize && (
            <Button
              onClick={() => setConfirmFinalizeOpen(true)}
              disabled={saving || finalizing}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Hoàn tất tổng kết
            </Button>
          )}
        </div>
      )}

      <Dialog open={confirmFinalizeOpen} onOpenChange={setConfirmFinalizeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hoàn tất tổng kết chăm sóc?</DialogTitle>
            <DialogDescription className="pt-2 text-neutral-900 font-medium">
              Sau khi hoàn tất, tổng kết sẽ được khóa và không thể chỉnh sửa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmFinalizeOpen(false)} disabled={finalizing}>
              Hủy
            </Button>
            <Button onClick={handleFinalize} disabled={finalizing}>
              {finalizing ? "Đang xử lý..." : "Xác nhận hoàn tất"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

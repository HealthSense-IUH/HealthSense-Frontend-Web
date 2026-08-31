import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, Save, Info, PlusCircle, FileText, Activity } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { consultationApi } from "@/services"
import type {
  ConsultationFinalSummaryResponse,
  ConsultationStatus,
  DoctorScopedHealthRecordResponse,
} from "@/types/consultation"
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
  const [scopedRecords, setScopedRecords] = useState<DoctorScopedHealthRecordResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  // Draft form state
  const [summaryText, setSummaryText] = useState("")
  const [observations, setObservations] = useState("")
  const [recommendations, setRecommendations] = useState("")
  const [followUpRecommendation, setFollowUpRecommendation] = useState("")
  const [selectedRecordIds, setSelectedRecordIds] = useState<(string | number)[]>([])

  // Finalize confirmation
  const [confirmFinalizeOpen, setConfirmFinalizeOpen] = useState(false)

  // Addendum dialog state
  const [addendumOpen, setAddendumOpen] = useState(false)
  const [addendumReason, setAddendumReason] = useState("")
  const [addendumContent, setAddendumContent] = useState("")
  const [addingAddendum, setAddingAddendum] = useState(false)

  const { toast } = useToast()

  const fetchSummary = () => {
    setLoading(true)
    setErrorMsg(null)

    Promise.allSettled([
      consultationApi.getDoctorFinalSummary(sessionId),
      consultationApi.getDoctorScopedRecords(sessionId, { page: 1, size: 50 }),
    ])
      .then(([summaryRes, recordsRes]) => {
        if (recordsRes.status === "fulfilled") {
          setScopedRecords(recordsRes.value.data.content || [])
        }

        if (summaryRes.status === "fulfilled") {
          const data = summaryRes.value.data
          setSummary(data)
          setSummaryText(data.summary || "")
          setObservations(data.observations || "")
          setRecommendations(data.recommendations || "")
          setFollowUpRecommendation(data.followUpRecommendation || "")
          if (data.referencedHealthRecordIds && Array.isArray(data.referencedHealthRecordIds)) {
            setSelectedRecordIds(data.referencedHealthRecordIds)
          }
        } else {
          const err = summaryRes.reason
          if (err?.response?.status === 404) {
            setSummary(null)
          } else {
            setErrorMsg(readError(err, "Không thể tải tổng kết chăm sóc."))
          }
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchSummary()
  }, [sessionId])

  const toggleRecordSelection = (recordId: string | number) => {
    setSelectedRecordIds((prev) =>
      prev.includes(recordId) ? prev.filter((id) => id !== recordId) : [...prev, recordId]
    )
  }

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
        referencedHealthRecordIds: selectedRecordIds.length > 0 ? selectedRecordIds : null,
      }
      const res = await consultationApi.updateDoctorFinalSummary(sessionId, payload)
      setSummary(res.data)
      toast({ description: "Đã lưu bản nháp tổng kết thành công." })
    } catch (error) {
      toast({ variant: "destructive", description: readError(error, "Lỗi khi lưu bản nháp.") })
    } finally {
      setSaving(false)
    }
  }

  const handleFinalize = async () => {
    if (!summaryText.trim() || !observations.trim() || !recommendations.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin bắt buộc",
        description: "Để hoàn tất tổng kết, vui lòng nhập đầy đủ: Tổng kết, Nhận xét và Khuyến nghị.",
      })
      return
    }

    setFinalizing(true)
    try {
      // Ensure latest draft is saved before finalization
      await consultationApi.updateDoctorFinalSummary(sessionId, {
        summary: summaryText.trim(),
        observations: observations.trim() || null,
        recommendations: recommendations.trim() || null,
        followUpRecommendation: followUpRecommendation.trim() || null,
        referencedHealthRecordIds: selectedRecordIds.length > 0 ? selectedRecordIds : null,
      })

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

  const handleAddAddendum = async () => {
    if (!addendumReason.trim() || !addendumContent.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập lý do và nội dung đính chính/bổ sung.",
      })
      return
    }

    setAddingAddendum(true)
    try {
      await consultationApi.addDoctorFinalSummaryAddendum(sessionId, {
        reason: addendumReason.trim(),
        content: addendumContent.trim(),
      })
      toast({
        title: "Thêm phụ lục thành công",
        description: "Nội dung đính chính/bổ sung đã được lưu vào hồ sơ tổng kết.",
      })
      setAddendumReason("")
      setAddendumContent("")
      setAddendumOpen(false)
      fetchSummary()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi thêm phụ lục",
        description: readError(error, "Không thể thêm phụ lục vào lúc này."),
      })
    } finally {
      setAddingAddendum(false)
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
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <div>
              <p className="font-medium text-green-900">Tổng kết phiên tư vấn (Đã khóa / Bất biến)</p>
              <p className="text-xs text-green-700">
                Đã hoàn tất lúc: {formatDate(summary?.finalizedAt) || "-"}
              </p>
            </div>
          </div>
          <Badge className="bg-green-600 hover:bg-green-700 shrink-0">FINALIZED</Badge>
        </div>
      )}

      {!isFinalized && sessionStatus === "ACTIVE" && (
        <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-xs text-blue-700">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            Bạn có thể soạn bản nháp trong khi phiên đang diễn ra. Tổng kết chỉ có thể được hoàn tất sau khi phiên kết thúc (COMPLETED).
          </p>
        </div>
      )}
      
      {!isFinalized && (sessionStatus === "SCHEDULED" || sessionStatus === "CANCELLED" || sessionStatus === "EXPIRED") && (
        <div className="flex items-start gap-2 rounded-md bg-orange-50 p-3 text-xs text-orange-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            Không thể lập tổng kết cho phiên tư vấn đang ở trạng thái {sessionStatus}.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Main fields */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700">
            Tổng kết đánh giá lâm sàng <span className="text-red-500">*</span>
          </label>
          {isEditable ? (
            <Textarea
              placeholder="Nhập nội dung tổng kết..."
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              className="min-h-[90px] text-xs"
            />
          ) : (
            <div className="rounded-md border bg-neutral-50 p-3 text-xs whitespace-pre-wrap min-h-[70px]">
              {summaryText || <span className="text-neutral-400 italic">Không có dữ liệu</span>}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700">
            Ghi nhận & Triệu chứng {isFinalized ? "" : <span className="text-red-500">* (khi hoàn tất)</span>}
          </label>
          {isEditable ? (
            <Textarea
              placeholder="Nhập nhận xét, quan sát lâm sàng..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="min-h-[70px] text-xs"
            />
          ) : (
            <div className="rounded-md border bg-neutral-50 p-3 text-xs whitespace-pre-wrap min-h-[50px]">
              {observations || <span className="text-neutral-400 italic">Không có dữ liệu</span>}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700">
            Khuyến nghị y tế & Lối sống {isFinalized ? "" : <span className="text-red-500">* (khi hoàn tất)</span>}
          </label>
          {isEditable ? (
            <Textarea
              placeholder="Nhập các khuyến nghị điều trị, dinh dưỡng, lối sống..."
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              className="min-h-[70px] text-xs"
            />
          ) : (
            <div className="rounded-md border bg-neutral-50 p-3 text-xs whitespace-pre-wrap min-h-[50px]">
              {recommendations || <span className="text-neutral-400 italic">Không có dữ liệu</span>}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700">Khuyến nghị theo dõi & Tái khám (Tùy chọn)</label>
          {isEditable ? (
            <Textarea
              placeholder="Kế hoạch tái khám hoặc theo dõi tiếp theo..."
              value={followUpRecommendation}
              onChange={(e) => setFollowUpRecommendation(e.target.value)}
              className="min-h-[60px] text-xs"
            />
          ) : (
            <div className="rounded-md border bg-neutral-50 p-3 text-xs whitespace-pre-wrap min-h-[50px]">
              {followUpRecommendation || <span className="text-neutral-400 italic">Không có dữ liệu</span>}
            </div>
          )}
        </div>

        {/* Referenced Health Records */}
        <div className="space-y-2 pt-2 border-t">
          <label className="text-xs font-semibold text-neutral-700 flex items-center justify-between">
            <span>Hồ sơ đo đạc tham chiếu ({selectedRecordIds.length})</span>
            {isEditable && <span className="text-[11px] font-normal text-muted-foreground">Chọn các hồ sơ đo đạc trong phạm vi phiên tư vấn</span>}
          </label>

          {isEditable ? (
            scopedRecords.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Không có hồ sơ nào trong phạm vi phiên tư vấn này.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {scopedRecords.map((item) => {
                  if (!item.record) return null
                  const isChecked = selectedRecordIds.some((id) => String(id) === String(item.record.id))
                  return (
                    <div
                      key={item.record.id}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.preventDefault()
                        toggleRecordSelection(item.record.id)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          toggleRecordSelection(item.record.id)
                        }
                      }}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isChecked ? "bg-primary/5 border-primary" : "bg-card hover:bg-muted/30"
                      }`}
                    >
                      <Checkbox checked={isChecked} tabIndex={-1} className="pointer-events-none" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 truncate font-medium">
                          <Activity className="h-3 w-3 shrink-0 text-muted-foreground" />
                          <span className="truncate">#{item.record.id} {item.record.originalFileName || item.record.fileName || ""}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <span>{formatDate(item.record.createdAt)}</span>
                          {item.record.predictionLabel && (
                            <Badge variant={item.record.predictionLabel === "NORMAL" ? "outline" : "destructive"} className="text-[9px] py-0 px-1 h-3.5">
                              {item.record.predictionLabel}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedRecordIds.length === 0 ? (
                <span className="text-xs text-neutral-400 italic">Không có hồ sơ nào được tham chiếu.</span>
              ) : (
                selectedRecordIds.map((recId) => (
                  <Badge key={recId} variant="secondary" className="text-xs py-1 px-2 gap-1">
                    <FileText className="w-3 h-3" />
                    Hồ sơ #{recId}
                  </Badge>
                ))
              )}
            </div>
          )}
        </div>

        {/* Existing Addenda Section (when Finalized) */}
        {isFinalized && (
          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                Phụ lục & Đính chính sau hoàn tất ({summary?.addenda?.length || 0})
              </h4>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 border-amber-300 hover:bg-amber-50 text-amber-900"
                onClick={() => setAddendumOpen(true)}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Thêm phụ lục
              </Button>
            </div>

            {summary?.addenda && summary.addenda.length > 0 ? (
              <div className="space-y-2">
                {summary.addenda.map((addendum) => (
                  <div
                    key={addendum.id}
                    className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs"
                  >
                    <div className="flex items-center justify-between font-medium text-amber-950 dark:text-amber-300 mb-1">
                      <span>Lý do: {addendum.reason}</span>
                      <span className="text-[10px] text-muted-foreground">{formatDate(addendum.createdAt)}</span>
                    </div>
                    <p className="text-foreground/90 whitespace-pre-wrap">{addendum.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Chưa có phụ lục đính chính nào.</p>
            )}
          </div>
        )}
      </div>

      {/* Action buttons for DRAFT */}
      {!isFinalized && (canSave || canFinalize) && (
        <div className="flex items-center gap-3 pt-4 border-t">
          {canSave && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={saving || finalizing}
            >
              <Save className="mr-1.5 h-4 w-4" />
              {saving ? "Đang lưu..." : "Lưu nháp"}
            </Button>
          )}
          {canFinalize && (
            <Button
              size="sm"
              onClick={() => setConfirmFinalizeOpen(true)}
              disabled={saving || finalizing}
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Hoàn tất tổng kết
            </Button>
          )}
        </div>
      )}

      {/* Confirm Finalize Dialog */}
      <Dialog open={confirmFinalizeOpen} onOpenChange={setConfirmFinalizeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hoàn tất tổng kết chăm sóc?</DialogTitle>
            <DialogDescription className="pt-2 text-neutral-800 text-sm">
              Sau khi hoàn tất, bản tổng kết gốc sẽ được khóa bất biến. Mọi đính chính sau này sẽ được ghi nhận dưới dạng Phụ lục (Addendum).
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

      {/* Add Addendum Dialog */}
      <Dialog open={addendumOpen} onOpenChange={setAddendumOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileText className="w-4 h-4 text-amber-600" />
              Thêm Phụ lục / Đính chính Tổng kết
            </DialogTitle>
            <DialogDescription className="text-xs">
              Bản tổng kết gốc sẽ được giữ nguyên và phụ lục này sẽ được gắn kèm vào hồ sơ y tế.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <label className="font-medium text-foreground">
                Lý do đính chính / bổ sung <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="VD: Cập nhật kết quả cận lâm sàng bổ sung, Điều chỉnh liều khuyến nghị..."
                value={addendumReason}
                onChange={(e) => setAddendumReason(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-foreground">
                Nội dung bổ sung <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Nhập chi tiết nội dung đính chính hoặc khuyến nghị bổ sung..."
                value={addendumContent}
                onChange={(e) => setAddendumContent(e.target.value)}
                className="min-h-[100px] text-xs"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setAddendumOpen(false)} disabled={addingAddendum}>
              Hủy
            </Button>
            <Button size="sm" onClick={handleAddAddendum} disabled={addingAddendum || !addendumReason.trim() || !addendumContent.trim()}>
              {addingAddendum ? "Đang lưu..." : "Lưu phụ lục"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


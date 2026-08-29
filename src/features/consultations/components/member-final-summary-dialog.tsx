import { useEffect, useState } from "react"
import { CheckCircle2, FileText, Activity } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { consultationApi } from "../services/consultation-api"
import type { ConsultationFinalSummaryResponse } from "../types"
import { formatDate } from "./shared"

interface MemberFinalSummaryDialogProps {
  sessionId: string | number
  open: boolean
  onOpenChange: (open: boolean) => void
  isAdminView?: boolean
}

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string }
  if (err.response?.status === 403) return "Bạn không có quyền xem thông tin này."
  return err.response?.data?.message || err.message || fallback
}

export function MemberFinalSummaryDialog({ sessionId, open, onOpenChange, isAdminView = false }: MemberFinalSummaryDialogProps) {
  const [summary, setSummary] = useState<ConsultationFinalSummaryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setSummary(null)
      setErrorMsg(null)
      return
    }

    setLoading(true)
    setErrorMsg(null)
    
    const fetchApi = isAdminView 
      ? consultationApi.getAdminFinalSummary(sessionId)
      : consultationApi.getMemberFinalSummary(sessionId)

    fetchApi
      .then((res) => {
        setSummary(res.data)
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setSummary(null) // Not found = missing
        } else {
          setErrorMsg(readError(err, "Không thể tải tổng kết chăm sóc."))
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [sessionId, open, isAdminView])

  const isFinalized = summary?.status === "FINALIZED"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Tổng kết phiên tư vấn
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : errorMsg ? (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{errorMsg}</div>
          ) : !summary || !isFinalized ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Activity className="h-12 w-12 text-neutral-300 mb-4" />
              <p className="text-neutral-500 font-medium">Bác sĩ chưa hoàn tất tổng kết phiên tư vấn.</p>
              <p className="text-sm text-neutral-400 mt-2">Tổng kết sẽ xuất hiện ở đây sau khi bác sĩ kết thúc quá trình chăm sóc.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Bản tổng kết đã được hoàn tất</p>
                    <p className="text-sm text-green-700">
                      Lúc: {formatDate(summary.finalizedAt) || "-"}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-600 hover:bg-green-700">Đã hoàn tất</Badge>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h4 className="text-sm font-semibold text-neutral-900">Tổng kết</h4>
                  <div className="rounded-md border bg-neutral-50 p-4 text-sm text-neutral-800 whitespace-pre-wrap">
                    {summary.summary || <span className="text-neutral-400 italic">Không có nội dung</span>}
                  </div>
                </div>

                {summary.observations && (
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-semibold text-neutral-900">Nhận xét</h4>
                    <div className="rounded-md border bg-neutral-50 p-4 text-sm text-neutral-800 whitespace-pre-wrap">
                      {summary.observations}
                    </div>
                  </div>
                )}

                {summary.recommendations && (
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-semibold text-neutral-900">Khuyến nghị</h4>
                    <div className="rounded-md border bg-neutral-50 p-4 text-sm text-neutral-800 whitespace-pre-wrap">
                      {summary.recommendations}
                    </div>
                  </div>
                )}

                {summary.followUpRecommendation && (
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-semibold text-neutral-900">Khuyến nghị theo dõi</h4>
                    <div className="rounded-md border bg-neutral-50 p-4 text-sm text-neutral-800 whitespace-pre-wrap">
                      {summary.followUpRecommendation}
                    </div>
                  </div>
                )}

                {/* Referenced Health Records */}
                {summary.referencedHealthRecordIds && summary.referencedHealthRecordIds.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t">
                    <h4 className="text-sm font-semibold text-neutral-900">Hồ sơ đo đạc tham chiếu</h4>
                    <div className="flex flex-wrap gap-2">
                      {summary.referencedHealthRecordIds.map((recId) => (
                        <Badge key={recId} variant="secondary" className="text-xs py-1 px-2.5 gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          Hồ sơ #{recId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Addenda Section */}
                {summary.addenda && summary.addenda.length > 0 && (
                  <div className="space-y-2.5 pt-3 border-t">
                    <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-600" />
                      Phụ lục & Đính chính sau hoàn tất ({summary.addenda.length})
                    </h4>
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
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

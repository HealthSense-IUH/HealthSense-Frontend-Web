import { useEffect, useState } from "react"
import {
  Calendar,
  Clock,
  User,
  AlertTriangle,
  FileText,
  BriefcaseMedical
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { consultationApi } from "@/services"
import type { DoctorConsultationDetailResponse } from "@/types/consultation"
import { formatDate } from "./shared"
import { DoctorScopedRecordsTab } from "./doctor-scoped-records-tab"
import { DoctorFinalSummaryTab } from "./doctor-final-summary-tab"
import { DoctorContinuityTab } from "./doctor-continuity-tab"

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err.response?.data?.message || err.message || fallback
}

const DAYS_OF_WEEK_MAP: Record<string, string> = {
  MONDAY: "Thứ Hai",
  TUESDAY: "Thứ Ba",
  WEDNESDAY: "Thứ Tư",
  THURSDAY: "Thứ Năm",
  FRIDAY: "Thứ Sáu",
  SATURDAY: "Thứ Bảy",
  SUNDAY: "Chủ Nhật"
}

interface DoctorSessionDetailDialogProps {
  sessionId: string | number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DoctorSessionDetailDialog({ sessionId, open, onOpenChange }: DoctorSessionDetailDialogProps) {
  const [detail, setDetail] = useState<DoctorConsultationDetailResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!open) return
    
    setLoading(true)
    consultationApi.getDoctorSessionDetail(sessionId)
      .then(res => setDetail(res.data))
      .catch((error) => {
        toast({ variant: "destructive", description: readError(error, "Không thể tải chi tiết phiên chăm sóc.") })
        onOpenChange(false)
      })
      .finally(() => setLoading(false))
  }, [sessionId, open, toast, onOpenChange])

  const renderSupportSchedule = () => {
    const jsonStr = detail?.session.supportScheduleSnapshotJson
    if (!jsonStr) return <p className="text-sm text-neutral-500 italic">Chưa cấu hình lịch hỗ trợ</p>
    
    try {
      const schedule = JSON.parse(jsonStr)
      if (!schedule.weekly || !Array.isArray(schedule.weekly) || schedule.weekly.length === 0) {
        return <p className="text-sm text-neutral-500 italic">Chưa cấu hình lịch hỗ trợ</p>
      }

      return (
        <div className="space-y-2 mt-2">
          {schedule.weekly.map((slot: { dayOfWeek: string; start: string; end: string }) => (
            <div key={`${slot.dayOfWeek}-${slot.start}-${slot.end}`} className="flex justify-between items-center text-sm border-b pb-1 last:border-0 last:pb-0">
              <span className="font-medium text-neutral-700">
                {DAYS_OF_WEEK_MAP[slot.dayOfWeek] || slot.dayOfWeek}
              </span>
              <span className="text-neutral-600 font-mono">
                {slot.start} - {slot.end}
              </span>
            </div>
          ))}
          {detail.session.supportTimezoneSnapshot && (
            <div className="text-xs text-neutral-400 text-right mt-1">
              Múi giờ: {detail.session.supportTimezoneSnapshot}
            </div>
          )}
        </div>
      )
    } catch (e) {
      return <p className="text-sm text-neutral-500 italic">Chưa cấu hình lịch hỗ trợ</p>
    }
  }

  if (loading || !detail) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Chi tiết phiên chăm sóc</DialogTitle>
          </DialogHeader>
          <div className="py-12 flex justify-center">
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 w-2 bg-neutral-300 rounded-full"></div>
              <div className="h-2 w-2 bg-neutral-300 rounded-full"></div>
              <div className="h-2 w-2 bg-neutral-300 rounded-full"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const { session, initialHealthRecord } = detail

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between pr-4">
            <div>
              <DialogTitle className="text-xl">
                {detail.member?.displayName || session.memberDisplayName || `Bệnh nhân #${session.memberId}`}
              </DialogTitle>
              <DialogDescription className="mt-1">
                ID Phiên: {session.id}
              </DialogDescription>
            </div>
            {session.status === "CANCELLED" && session.meaningfulCareOccurred ? (
              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300">
                Đã hủy (Có chăm sóc)
              </Badge>
            ) : (
              <Badge variant={session.status === "ACTIVE" ? "default" : "outline"} className={
                session.status === "ACTIVE" ? "bg-emerald-500 hover:bg-emerald-600" : ""
              }>
                {session.status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-4">
          <TabsList className="grid w-full grid-cols-4 text-xs">
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="records">Hồ sơ đo</TabsTrigger>
            <TabsTrigger value="continuity">Chăm sóc trước</TabsTrigger>
            <TabsTrigger value="summary">Tổng kết</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="grid gap-6 py-4 outline-none">
            {session.unresolvedAttentionCount > 0 && (
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-900">Có {session.unresolvedAttentionCount} hồ sơ/chỉ số cần xem</h4>
                  <p className="text-sm text-orange-700 mt-1">Hệ thống ghi nhận có dữ liệu mới từ bệnh nhân. Vui lòng chuyển sang tab "Hồ sơ đo" để xem.</p>
                </div>
              </div>
            )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                <Calendar className="h-4 w-4" /> Bắt đầu
              </div>
              <p className="font-medium text-neutral-900">{formatDate(session.startedAt) || '---'}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                <Clock className="h-4 w-4" /> Kết thúc dự kiến
              </div>
              <p className="font-medium text-neutral-900">{formatDate(session.endsAt) || '---'}</p>
            </div>
          </div>

          <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100">
            <div className="flex gap-2 items-center mb-3">
              <User className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-neutral-900">Thông tin bệnh nhân</h3>
            </div>
            <div className="text-sm text-neutral-600 space-y-2">
              <p><span className="font-medium text-neutral-800">Tên bệnh nhân:</span> {detail.member?.displayName || session.memberDisplayName || `Hội viên #${session.memberId}`}</p>
              <p><span className="font-medium text-neutral-800">Mã bệnh nhân:</span> #{session.memberId}</p>
              <p className="italic text-neutral-400">Các thông tin cơ bản khác sẽ hiển thị nếu được chia sẻ.</p>
            </div>
          </div>

          <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100">
            <div className="flex gap-2 items-center mb-3">
              <BriefcaseMedical className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-neutral-900">Hồ sơ ban đầu</h3>
            </div>
            {initialHealthRecord ? (
              <div className="flex items-center gap-3 p-3 bg-white border rounded-md">
                <FileText className="h-8 w-8 text-neutral-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {initialHealthRecord.originalFileName || `Hồ sơ #${initialHealthRecord.id}`}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Cập nhật: {formatDate(initialHealthRecord.updatedAt || initialHealthRecord.createdAt)}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {initialHealthRecord.predictionLabel || initialHealthRecord.status || "UNKNOWN"}
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-neutral-500 italic">Không có hồ sơ đính kèm khi bắt đầu.</p>
            )}
          </div>

          <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
            <div className="flex gap-2 items-center mb-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Khung giờ hỗ trợ đã cam kết</h3>
            </div>
            {renderSupportSchedule()}
          </div>
          </TabsContent>

          <TabsContent value="records" className="outline-none">
            <DoctorScopedRecordsTab sessionId={session.id} />
          </TabsContent>

          <TabsContent value="continuity" className="outline-none">
            <DoctorContinuityTab sessionId={session.id} />
          </TabsContent>

          <TabsContent value="summary" className="outline-none">
            <DoctorFinalSummaryTab
              sessionId={session.id}
              sessionStatus={session.status}
              meaningfulCareOccurred={session.meaningfulCareOccurred}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

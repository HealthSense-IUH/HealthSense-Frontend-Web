import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  Clock,
  FileText,
  Info,
  MessageSquare,
  Package,
  ShieldAlert,
  Stethoscope,
  User,
} from "lucide-react"
import type { ConsultationSessionResponse } from "@/types/consultation"
import { formatRecordDate, formatVND } from "@/lib/formatters"

interface ConsultationSessionDetailDialogProps {
  session: ConsultationSessionResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConsultationSessionDetailDialog({
  session,
  open,
  onOpenChange,
}: ConsultationSessionDetailDialogProps) {
  if (!session) return null

  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold">Đang diễn ra</Badge>
      case "COMPLETED":
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-bold">Hoàn tất</Badge>
      case "CLOSED":
        return <Badge variant="secondary" className="font-bold text-slate-700">Đã đóng</Badge>
      case "SCHEDULED":
        return <Badge variant="outline" className="text-amber-600 border-amber-500 bg-amber-50 font-bold">Đã lên lịch</Badge>
      case "EXTENSION_PENDING":
        return <Badge className="bg-purple-600 hover:bg-purple-700 text-white font-bold">Chờ gia hạn</Badge>
      case "CANCELLED":
        return <Badge variant="destructive" className="font-bold">Đã hủy</Badge>
      default:
        return <Badge variant="outline" className="font-bold">{status || "—"}</Badge>
    }
  }

  const renderSummaryClosureBadge = (status?: string | null) => {
    switch (status) {
      case "FINALIZED":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">Đã chốt tổng kết</Badge>
      case "ESCALATED":
        return <Badge className="bg-red-100 text-red-800 border-red-300">Leo thang (Escalated)</Badge>
      case "PENDING":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Chờ hoàn tất</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Đang thực hiện</Badge>
      default:
        return <Badge variant="outline">{status || "Chưa có"}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white rounded-3xl shadow-2xl border border-slate-200">
        {/* Header */}
        <DialogHeader className="p-6 bg-slate-50/90 border-b border-slate-100 flex flex-row items-center justify-between text-left space-y-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-slate-500">Mã phiên #{session.id}</span>
              {renderStatusBadge(session.status)}
              {session.exceptionalOverride && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 font-bold">
                  Ghi đè ngoại lệ
                </Badge>
              )}
              {session.operationalReviewRequired && (
                <Badge variant="destructive" className="font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Cần xử lý vận hành
                </Badge>
              )}
            </div>
            <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
              Chi tiết Phiên Tư vấn
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-0.5">
              Khởi tạo lúc: {formatRecordDate(session.createdAt || session.startedAt)}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 p-6 space-y-6">
          <div className="space-y-6 text-xs">
            {/* Participants Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Người khám (Member)</span>
                </div>
                <div className="font-extrabold text-sm text-slate-900">
                  {session.memberDisplayName || `Member #${session.memberId}`}
                </div>
                <div className="font-mono text-slate-500 text-[11px]">
                  ID: #{session.memberId}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <span>Bác sĩ phụ trách</span>
                </div>
                <div className="font-extrabold text-sm text-slate-900">
                  {session.doctorDisplayName || (session.doctorId ? `Doctor #${session.doctorId}` : "Chưa phân công")}
                </div>
                <div className="font-mono text-slate-500 text-[11px]">
                  ID: {session.doctorId ? `#${session.doctorId}` : "—"}
                </div>
              </div>
            </div>

            {/* Type & Package Information */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-3">
              <h4 className="font-black text-slate-700 text-xs flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600" />
                <span>Loại phiên & Gói dịch vụ</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-medium">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[11px] block">Luồng khám (Flow)</span>
                  <span className="font-bold text-slate-800">{session.flowType || "STANDARD"}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[11px] block">Nguồn phiên (Source)</span>
                  <span className="font-bold text-slate-800">{session.sourceType || "REGULAR"}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[11px] block">Mã gói dịch vụ</span>
                  <span className="font-bold text-slate-800">
                    {session.packageId ? `#${session.packageId}` : "—"}
                    {session.packageVersion ? ` (v${session.packageVersion})` : ""}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[11px] block">Giá snapshot / Thời hạn</span>
                  <span className="font-bold text-emerald-700">
                    {session.packagePriceSnapshot != null ? formatVND(session.packagePriceSnapshot) : "—"}
                    {session.packageDurationDaysSnapshot ? ` / ${session.packageDurationDaysSnapshot} ngày` : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Time & Milestones */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-3">
              <h4 className="font-black text-slate-700 text-xs flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Mốc thời gian phiên</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-medium">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[11px] block">Bắt đầu phiên</span>
                  <span className="font-bold text-slate-800">{formatRecordDate(session.startedAt)}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[11px] block">Kích hoạt</span>
                  <span className="font-bold text-slate-800">{formatRecordDate(session.activatedAt)}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[11px] block">Hạn kết thúc phiên</span>
                  <span className="font-bold text-slate-800">{formatRecordDate(session.endsAt)}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[11px] block">Hạn hỗ trợ (Support ends)</span>
                  <span className="font-bold text-slate-800">{formatRecordDate(session.supportEndsAt)}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[11px] block">Hoàn thành lúc</span>
                  <span className="font-bold text-slate-800">{formatRecordDate(session.completedAt)}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[11px] block">Đóng phiên lúc</span>
                  <span className="font-bold text-slate-800">{formatRecordDate(session.closedAt)}</span>
                </div>
              </div>
            </div>

            {/* Reasons: Completion / Termination / Close */}
            {(session.completionReason || session.closeReason || session.terminationReason) && (
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 space-y-2">
                <h4 className="font-black text-slate-700 text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span>Lý do kết thúc & Trạng thái đóng</span>
                </h4>
                <div className="space-y-1.5 font-medium">
                  {session.completionReason && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Lý do hoàn thành:</span>
                      <span className="font-bold text-slate-800">{session.completionReason}</span>
                    </div>
                  )}
                  {session.closeReason && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Lý do đóng phiên:</span>
                      <span className="font-bold text-slate-800">{session.closeReason}</span>
                    </div>
                  )}
                  {session.terminationReason && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-red-500 font-bold">Lý do chấm dứt sớm:</span>
                      <span className="font-bold text-red-700">{session.terminationReason}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Final Summary & Escalation Section */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-3">
              <h4 className="font-black text-slate-700 text-xs flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Tổng kết bệnh án & Leo thang</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-medium">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500">Trạng thái tổng kết:</span>
                  {renderSummaryClosureBadge(session.summaryClosureStatus)}
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500">Hạn nộp tổng kết:</span>
                  <span className="font-bold text-slate-800">{formatRecordDate(session.summaryDueAt)}</span>
                </div>
                {session.summaryEscalatedAt && (
                  <div className="sm:col-span-2 bg-red-50/70 p-3 rounded-xl border border-red-200 text-red-900 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        Đã leo thang tổng kết lúc:
                      </span>
                      <span className="font-bold">{formatRecordDate(session.summaryEscalatedAt)}</span>
                    </div>
                    {session.summaryEscalationReason && (
                      <p className="text-[11px] text-red-700">Lý do: {session.summaryEscalationReason}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Exceptional Override & Operational Review Section */}
            {(session.exceptionalOverride || session.operationalReviewRequired) && (
              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-3">
                <h4 className="font-black text-amber-900 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Cảnh báo quản trị & Ghi đè ngoại lệ</span>
                </h4>
                <div className="space-y-2 font-medium">
                  {session.exceptionalOverride && (
                    <div className="text-xs text-amber-800 space-y-1">
                      <div className="font-bold">Phiên được ghi đè quyền bởi Admin #{session.createdByAdminId || "—"}</div>
                      {session.overrideReason && <p>Lý do: {session.overrideReason}</p>}
                      {session.overrideServiceScope && <p>Phạm vi: {session.overrideServiceScope}</p>}
                    </div>
                  )}
                  {session.operationalReviewRequired && (
                    <div className="pt-2 border-t border-amber-200 text-xs text-red-700">
                      <span className="font-bold">Yêu cầu rà soát vận hành: </span>
                      <span>{session.operationalReviewReason || "Cần quản trị viên kiểm tra dữ liệu phiên"}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Associated Links & Message Preview */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3">
              <h4 className="font-black text-slate-700 text-xs flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-600" />
                <span>Liên kết & Tin nhắn gần nhất</span>
              </h4>
              <div className="grid grid-cols-2 gap-3 font-medium">
                <div>
                  <span className="text-slate-400 text-[11px] block">Bản đo liên kết</span>
                  <span className="font-bold text-slate-800">
                    {session.healthRecordId ? `#${session.healthRecordId}` : "Không gắn bản đo"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Yêu cầu gốc (Request ID)</span>
                  <span className="font-bold text-slate-800">
                    {session.requestId ? `#${session.requestId}` : "—"}
                  </span>
                </div>
              </div>
              {session.lastMessagePreview && (
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs">
                  <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                    <span>Tin nhắn gần nhất:</span>
                    <span>{formatRecordDate(session.lastMessageAt)}</span>
                  </div>
                  <p className="text-slate-800 font-medium italic">"{session.lastMessagePreview}"</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-xl border-slate-200 font-bold text-slate-600 text-xs px-5 hover:bg-white cursor-pointer"
          >
            Đóng cửa sổ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

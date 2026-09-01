import { useState } from "react"
import { AlertTriangle, LogOut, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { consultationApi } from "@/services"
import type { CareTerminationReason } from "@/types/consultation"

interface TerminationRequestDialogProps {
  sessionId: string | number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const TERMINATION_REASONS: { value: CareTerminationReason; label: string }[] = [
  { value: "MEMBER_REQUESTED", label: "Hội viên yêu cầu kết thúc sớm" },
  { value: "DOCTOR_UNAVAILABLE", label: "Bác sĩ không thể tiếp tục sắp xếp hỗ trợ" },
  { value: "MEMBER_UNAVAILABLE", label: "Hội viên bận / không thể tiếp tục theo dõi" },
  { value: "SAFETY_OR_SCOPE_REASON", label: "Cần can thiệp trực tiếp / Vượt phạm vi tư vấn từ xa" },
  { value: "SERVICE_VIOLATION", label: "Vi phạm quy tắc trao đổi / dịch vụ" },
  { value: "TECHNICAL_FAILURE", label: "Sự cố kỹ thuật / kết nối kéo dài" },
  { value: "ADMINISTRATIVE_CLOSURE", label: "Yêu cầu đóng hành chính" },
  { value: "OTHER", label: "Lý do khác" },
]

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err.response?.data?.message || err.message || fallback
}

export function TerminationRequestDialog({
  sessionId,
  open,
  onOpenChange,
  onSuccess,
}: TerminationRequestDialogProps) {
  const { toast } = useToast()
  const [reason, setReason] = useState<CareTerminationReason>("MEMBER_REQUESTED")
  const [details, setDetails] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason || !details.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng chọn lý do và nhập giải trình chi tiết yêu cầu kết thúc.",
      })
      return
    }

    setLoading(true)
    try {
      await consultationApi.requestSessionTermination(sessionId, {
        reason,
        details: details.trim(),
      })
      toast({
        title: "Đã gửi yêu cầu kết thúc phiên",
        description:
          "Yêu cầu của bạn đã được chuyển tới Điều phối viên chăm sóc (Care Coordinator) để rà soát vận hành.",
      })
      setDetails("")
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi gửi yêu cầu",
        description: readError(error, "Không thể gửi yêu cầu kết thúc phiên lúc này."),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2.5 text-rose-600 mb-1">
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Yêu Cầu Kết Thúc Phiên Tư Vấn
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed">
              Gửi yêu cầu kết thúc phiên chăm sóc đang hoạt động trước thời hạn. Điều phối viên sẽ rà soát nguyên nhân và hỗ trợ các thủ tục liên quan.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="termination-reason" className="text-xs font-semibold text-slate-700">
                Lý do kết thúc <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={reason}
                onValueChange={(val) => setReason(val as CareTerminationReason)}
                disabled={loading}
              >
                <SelectTrigger id="termination-reason" className="h-9 text-xs">
                  <SelectValue placeholder="Chọn lý do kết thúc..." />
                </SelectTrigger>
                <SelectContent>
                  {TERMINATION_REASONS.map((item) => (
                    <SelectItem key={item.value} value={item.value} className="text-xs">
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="termination-details" className="text-xs font-semibold text-slate-700">
                Giải trình chi tiết <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="termination-details"
                required
                maxLength={500}
                rows={4}
                placeholder="Nêu rõ lý do, bối cảnh hoặc các vấn đề phát sinh cần kết thúc sớm (tối đa 500 ký tự)..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                disabled={loading}
                className="resize-none text-xs"
              />
              <div className="text-[11px] text-slate-400 text-right">
                {details.trim().length}/500 ký tự
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || !details.trim()}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <LogOut className="w-3.5 h-3.5" />
                  Gửi yêu cầu kết thúc
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

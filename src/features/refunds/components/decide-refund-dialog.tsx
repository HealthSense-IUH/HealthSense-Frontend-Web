import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { refundApi } from "../services/refund-api"
import type { ConsultationRefundResponse } from "../types"

interface DecideRefundDialogProps {
  refund: ConsultationRefundResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DecideRefundDialog({
  refund,
  open,
  onOpenChange,
  onSuccess,
}: DecideRefundDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [approved, setApproved] = useState<boolean>(true)
  const [approvedAmount, setApprovedAmount] = useState<number>(0)
  const [reason, setReason] = useState("")

  useEffect(() => {
    if (open && refund) {
      const origAmount = refund.originalPaidAmount ?? refund.originalAmount ?? 0
      const defaultAmount =
        refund.recommendedAmount ??
        (refund.recommendation === "FULL" ? origAmount : origAmount)
      setApproved(refund.recommendation !== "NONE")
      setApprovedAmount(defaultAmount)
      setReason("")
    }
  }, [open, refund])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!refund) return

    if (!reason.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập lý do ra quyết định.",
      })
      return
    }

    if (approved && (!approvedAmount || approvedAmount <= 0)) {
      toast({
        variant: "destructive",
        title: "Số tiền không hợp lệ",
        description: "Số tiền phê duyệt hoàn phải lớn hơn 0.",
      })
      return
    }

    setLoading(true)
    try {
      await refundApi.decideRefund(refund.id, {
        approved,
        approvedAmount: approved ? Number(approvedAmount) : null,
        reason: reason.trim(),
      })

      toast({
        title: approved ? "Đã phê duyệt hoàn tiền" : "Đã từ chối hoàn tiền",
        description: `Yêu cầu hoàn tiền #${refund.id} đã được ghi nhận quyết định.`,
      })
      onSuccess?.()
      onOpenChange(false)
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } }
      toast({
        variant: "destructive",
        title: "Lỗi phê duyệt",
        description: anyErr.response?.data?.message || "Không thể thực hiện quyết định hoàn tiền.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!refund) return null

  const origAmount = refund.originalPaidAmount ?? refund.originalAmount ?? 0
  const coordReason = refund.reviewReason || refund.recommendationReason

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Quyết định Phê duyệt Hoàn tiền (Quản trị viên)</DialogTitle>
            <DialogDescription>
              Xem xét đề xuất từ điều phối viên và ra quyết định chính thức cho giao dịch hoàn #{refund.id}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            {/* Context Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Số tiền gốc:</span>
                <span className="font-mono font-bold text-slate-800">
                  {origAmount.toLocaleString("vi-VN")} {refund.currency || "VND"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Đề xuất của Điều phối:</span>
                <span className="font-bold text-blue-600">
                  {refund.recommendation === "FULL"
                    ? "Hoàn 100%"
                    : refund.recommendation === "PARTIAL"
                    ? `Hoàn ${refund.recommendedAmount?.toLocaleString("vi-VN")} VND`
                    : "Không hoàn"}
                </span>
              </div>
              {coordReason && (
                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 italic">
                  "{coordReason}"
                </div>
              )}
            </div>

            {/* Decision choice */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Quyết định</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setApproved(true)}
                  className={`flex flex-col items-center justify-between rounded-xl border p-3.5 cursor-pointer text-center transition-all ${
                    approved ? "border-emerald-600 bg-emerald-50/40 shadow-xs" : "border-slate-200 hover:bg-slate-50"
                  }`}
                  disabled={loading}
                >
                  <span className="font-bold text-emerald-700">Phê duyệt hoàn</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Chấp thuận chi hoàn trả</span>
                </button>

                <button
                  type="button"
                  onClick={() => setApproved(false)}
                  className={`flex flex-col items-center justify-between rounded-xl border p-3.5 cursor-pointer text-center transition-all ${
                    !approved ? "border-rose-600 bg-rose-50/40 shadow-xs" : "border-slate-200 hover:bg-slate-50"
                  }`}
                  disabled={loading}
                >
                  <span className="font-bold text-rose-700">Từ chối hoàn</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Bác bỏ yêu cầu hoàn</span>
                </button>
              </div>
            </div>

            {approved && (
              <div className="space-y-1.5">
                <Label htmlFor="approvedAmount" className="text-xs font-bold text-slate-700">
                  Số tiền phê duyệt hoàn (VND)
                </Label>
                <Input
                  id="approvedAmount"
                  type="number"
                  min={1000}
                  max={refund.originalAmount || undefined}
                  value={approvedAmount || ""}
                  onChange={(e) => setApprovedAmount(Number(e.target.value))}
                  disabled={loading}
                  placeholder="Nhập số tiền..."
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="decisionReason" className="text-xs font-bold text-slate-700">
                Lý do quyết định <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="decisionReason"
                rows={3}
                placeholder="Ghi rõ lý do phê duyệt hoặc từ chối..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={approved ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"}
            >
              {loading ? "Đang xử lý..." : approved ? "Phê duyệt hoàn tiền" : "Từ chối hoàn tiền"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

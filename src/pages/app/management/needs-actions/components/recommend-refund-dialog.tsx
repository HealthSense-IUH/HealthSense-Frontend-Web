import { useState } from "react"
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
import { refundApi } from "@/services"
import type { RefundRecommendation } from "@/types/refund"

interface RecommendRefundDialogProps {
  paymentId: number | string | null
  originalAmount?: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RecommendRefundDialog({
  paymentId,
  originalAmount = 0,
  open,
  onOpenChange,
  onSuccess,
}: RecommendRefundDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [recommendation, setRecommendation] = useState<RefundRecommendation>("FULL")
  const [recommendedAmount, setRecommendedAmount] = useState<number>(originalAmount)
  const [reason, setReason] = useState("")
  const [operationalContext, setOperationalContext] = useState("")

  const handleRecommendationChange = (val: RefundRecommendation) => {
    setRecommendation(val)
    if (val === "FULL") {
      setRecommendedAmount(originalAmount)
    } else if (val === "NONE") {
      setRecommendedAmount(0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentId) return

    if (!reason.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập lý do đề xuất hoàn tiền.",
      })
      return
    }

    if (recommendation === "PARTIAL" && (!recommendedAmount || recommendedAmount <= 0)) {
      toast({
        variant: "destructive",
        title: "Số tiền không hợp lệ",
        description: "Vui lòng nhập số tiền hoàn hợp lệ lớn hơn 0.",
      })
      return
    }

    setLoading(true)
    try {
      await refundApi.recommendRefund(paymentId, {
        recommendation,
        recommendedAmount: recommendation === "PARTIAL" ? Number(recommendedAmount) : recommendation === "FULL" ? originalAmount : null,
        reason: reason.trim(),
        operationalContext: operationalContext.trim() || null,
      })

      toast({
        title: "Đã gửi đề xuất",
        description: "Đề xuất hoàn tiền đã được chuyển đến Quản trị viên để phê duyệt.",
      })
      onSuccess?.()
      onOpenChange(false)
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } }
      toast({
        variant: "destructive",
        title: "Lỗi đề xuất hoàn tiền",
        description: anyErr.response?.data?.message || "Không thể tạo đề xuất hoàn tiền.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Đề xuất Hoàn tiền (Điều phối viên)</DialogTitle>
            <DialogDescription>
              Đề xuất mức hoàn trả cho giao dịch thanh toán #{paymentId}. Quyết định và thực hiện sẽ do Quản trị viên phê duyệt.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            {originalAmount > 0 && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Số tiền gốc đã thanh toán:</span>
                <span className="font-mono font-black text-slate-800 text-sm">
                  {originalAmount.toLocaleString("vi-VN")} VND
                </span>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Mức độ đề xuất hoàn trả</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleRecommendationChange("FULL")}
                  className={`flex flex-col items-center justify-between rounded-xl border p-3 cursor-pointer text-center transition-all ${
                    recommendation === "FULL" ? "border-blue-600 bg-blue-50/40 shadow-xs" : "border-slate-200 hover:bg-slate-50"
                  }`}
                  disabled={loading}
                >
                  <span className="font-bold text-slate-800">Hoàn 100%</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Toàn bộ số tiền</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRecommendationChange("PARTIAL")}
                  className={`flex flex-col items-center justify-between rounded-xl border p-3 cursor-pointer text-center transition-all ${
                    recommendation === "PARTIAL" ? "border-blue-600 bg-blue-50/40 shadow-xs" : "border-slate-200 hover:bg-slate-50"
                  }`}
                  disabled={loading}
                >
                  <span className="font-bold text-slate-800">Hoàn một phần</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Tùy chỉnh số tiền</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRecommendationChange("NONE")}
                  className={`flex flex-col items-center justify-between rounded-xl border p-3 cursor-pointer text-center transition-all ${
                    recommendation === "NONE" ? "border-blue-600 bg-blue-50/40 shadow-xs" : "border-slate-200 hover:bg-slate-50"
                  }`}
                  disabled={loading}
                >
                  <span className="font-bold text-slate-800">Không hoàn</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Từ chối hoàn trả</span>
                </button>
              </div>
            </div>

            {recommendation === "PARTIAL" && (
              <div className="space-y-1.5">
                <Label htmlFor="recommendedAmount" className="text-xs font-bold text-slate-700">
                  Số tiền đề xuất hoàn (VND)
                </Label>
                <Input
                  id="recommendedAmount"
                  type="number"
                  min={1000}
                  max={originalAmount || undefined}
                  value={recommendedAmount || ""}
                  onChange={(e) => setRecommendedAmount(Number(e.target.value))}
                  disabled={loading}
                  placeholder="Nhập số tiền..."
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="reason" className="text-xs font-bold text-slate-700">
                Lý do đề xuất <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="reason"
                rows={3}
                placeholder="Nêu rõ căn cứ đề xuất hoàn trả (vd: Bác sĩ bận việc đột xuất, Hội viên yêu cầu dừng trước hạn...)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="operationalContext" className="text-xs font-bold text-slate-700">
                Bối cảnh vận hành bổ sung (Tùy chọn)
              </Label>
              <Textarea
                id="operationalContext"
                rows={2}
                placeholder="Ghi chú thêm về liên hệ Hội viên, chính sách áp dụng..."
                value={operationalContext}
                onChange={(e) => setOperationalContext(e.target.value)}
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
            <Button type="submit" disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi đề xuất hoàn tiền"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

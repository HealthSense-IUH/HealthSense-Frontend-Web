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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { refundApi } from "../services/refund-api"
import type { ConsultationRefundResponse } from "../types"

interface ReconcileRefundDialogProps {
  refund: ConsultationRefundResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ReconcileRefundDialog({
  refund,
  open,
  onOpenChange,
  onSuccess,
}: ReconcileRefundDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [succeeded, setSucceeded] = useState<boolean>(true)
  const [providerRefundId, setProviderRefundId] = useState("")
  const [providerResult, setProviderResult] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!refund) return

    if (!providerResult.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập ghi chú / kết quả đối soát hoàn tiền.",
      })
      return
    }

    setLoading(true)
    try {
      await refundApi.reconcileRefund(refund.id, {
        succeeded,
        providerRefundId: providerRefundId.trim() || null,
        providerResult: providerResult.trim(),
      })

      toast({
        title: "Đối soát thành công",
        description: `Đã cập nhật trạng thái hoàn tiền #${refund.id} sang ${
          succeeded ? "SUCCEEDED" : "FAILED"
        }.`,
      })
      onSuccess?.()
      onOpenChange(false)
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } }
      toast({
        variant: "destructive",
        title: "Lỗi đối soát",
        description: anyErr.response?.data?.message || "Không thể thực hiện đối soát hoàn tiền.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!refund) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Đối soát Hoàn tiền Ngoại tuyến (Reconciliation)</DialogTitle>
            <DialogDescription>
              Ghi nhận kết quả chuyển tiền hoàn trả thực tế cho giao dịch hoàn #{refund.id}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            {/* PayOS SDK notice */}
            <Alert className="bg-amber-50/70 border-amber-200 text-amber-900">
              <Info className="h-4 w-4 text-amber-600 shrink-0" />
              <div className="space-y-1">
                <AlertTitle className="text-xs font-bold">Lưu ý Vận hành & Cổng Thanh toán</AlertTitle>
                <AlertDescription className="text-[11px] leading-relaxed text-amber-800">
                  Cổng PayOS hiện chưa hỗ trợ lệnh hoàn tiền trực tiếp qua API (lệnh <code>/execute</code> sẽ trả về trạng thái thất bại kỹ thuật). Quản trị viên cần thực hiện chuyển khoản hoàn tiền thủ công qua ngân hàng, sau đó đối soát và lưu mã giao dịch tại đây.
                </AlertDescription>
              </div>
            </Alert>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Số tiền phê duyệt hoàn:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {refund.approvedAmount?.toLocaleString("vi-VN") || refund.originalAmount?.toLocaleString("vi-VN")} {refund.currency || "VND"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Trạng thái hiện tại:</span>
                <span className="font-bold text-blue-600">{refund.status}</span>
              </div>
            </div>

            {/* Outcome Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Kết quả đối soát thực tế</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSucceeded(true)}
                  className={`p-3 rounded-xl border font-bold text-center cursor-pointer transition-all ${
                    succeeded ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                  disabled={loading}
                >
                  Hoàn tiền Thành công (SUCCEEDED)
                </button>
                <button
                  type="button"
                  onClick={() => setSucceeded(false)}
                  className={`p-3 rounded-xl border font-bold text-center cursor-pointer transition-all ${
                    !succeeded ? "border-rose-600 bg-rose-50 text-rose-800 shadow-xs" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                  disabled={loading}
                >
                  Đối soát Thất bại (FAILED)
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="providerRefundId" className="text-xs font-bold text-slate-700">
                Mã tham chiếu giao dịch / Mã hoàn tiền (Tùy chọn)
              </Label>
              <Input
                id="providerRefundId"
                placeholder="VD: FT240829123456 hoặc REF-99120"
                value={providerRefundId}
                onChange={(e) => setProviderRefundId(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="providerResult" className="text-xs font-bold text-slate-700">
                Bằng chứng & Ghi chú đối soát <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="providerResult"
                rows={3}
                placeholder="VD: Đã chuyển khoản qua Vietcombank số TK 0123456789 (Hội viên Nguyễn Văn A) ngày 29/08/2026. Giao dịch thành công."
                value={providerResult}
                onChange={(e) => setProviderResult(e.target.value)}
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Đang ghi nhận..." : "Xác nhận đối soát hoàn tất"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

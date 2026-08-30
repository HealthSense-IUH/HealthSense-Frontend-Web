import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  CheckCircle2,
  UserCheck,
  RotateCcw,
  DollarSign,
} from "lucide-react"

import { useAuthStore } from "@/features/auth/auth-store"
import { needsActionApi } from "../services/needs-action-api"
import type { NeedsActionResponse } from "../types"
import { RecommendRefundDialog } from "@/features/refunds/components/recommend-refund-dialog"
import { RefundDetailDialog } from "@/features/refunds/components/refund-detail-dialog"

interface NeedsActionDetailDialogProps {
  item: NeedsActionResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function NeedsActionDetailDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: NeedsActionDetailDialogProps) {
  const { toast } = useToast()
  const userSession = useAuthStore((state) => state.userSession)
  const role = userSession?.role || "MEMBER"
  const isCoordinator = role === "CARE_COORDINATOR"
  const isAdminOrSuperAdmin = role === "ADMIN" || role === "SUPER_ADMIN"

  const [loadingAction, setLoadingAction] = useState(false)
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false)
  const [resolutionText, setResolutionText] = useState("")

  // Domain action dialogs
  const [recommendRefundOpen, setRecommendRefundOpen] = useState(false)
  const [refundDetailOpen, setRefundDetailOpen] = useState(false)

  if (!item) return null

  // Claim action
  const handleClaim = async () => {
    try {
      setLoadingAction(true)
      await needsActionApi.claimNeedsAction(item.id)
      toast({
        title: "Đã tiếp nhận",
        description: `Bạn đã nhận phụ trách công việc #${item.id}.`,
      })
      onSuccess?.()
      onOpenChange(false)
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } }
      toast({
        variant: "destructive",
        title: "Lỗi tiếp nhận",
        description: anyErr.response?.data?.message || "Không thể tiếp nhận công việc.",
      })
    } finally {
      setLoadingAction(false)
    }
  }

  // Retry provider cancellation action (for Admin)
  const handleRetryCancellation = async () => {
    const paymentId = item.referenceId
    if (!paymentId) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không tìm thấy Payment ID tham chiếu." })
      return
    }

    try {
      setLoadingAction(true)
      await needsActionApi.retryProviderCancellation(paymentId)
      toast({
        title: "Đã gửi lệnh hủy",
        description: `Đã thử lại lệnh hủy liên kết thanh toán cho Payment #${paymentId}.`,
      })
      onSuccess?.()
      onOpenChange(false)
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } }
      toast({
        variant: "destructive",
        title: "Lỗi thử lại",
        description: anyErr.response?.data?.message || "Không thể gửi lệnh thử lại hủy thanh toán.",
      })
    } finally {
      setLoadingAction(false)
    }
  }

  // Manual resolve action
  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resolutionText.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập ghi chú kết quả giải quyết.",
      })
      return
    }

    try {
      setLoadingAction(true)
      await needsActionApi.resolveNeedsAction(item.id, {
        resolution: resolutionText.trim(),
      })
      toast({
        title: "Đã hoàn tất xử lý",
        description: `Công việc #${item.id} đã được đánh dấu là RESOLVED.`,
      })
      setResolveDialogOpen(false)
      onSuccess?.()
      onOpenChange(false)
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } }
      toast({
        variant: "destructive",
        title: "Lỗi giải quyết",
        description: anyErr.response?.data?.message || "Không thể ghi nhận giải quyết.",
      })
    } finally {
      setLoadingAction(false)
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return <Badge className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px]">KHẨN CẤP (CRITICAL)</Badge>
      case "HIGH":
        return <Badge className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px]">CAO (HIGH)</Badge>
      default:
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-[10px]">BÌNH THƯỜNG (NORMAL)</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px]">ĐÃ XỬ LÝ (RESOLVED)</Badge>
      case "CLAIMED":
        return <Badge className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-[10px]">ĐANG XỬ LÝ (CLAIMED)</Badge>
      default:
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px]">CHỜ XỬ LÝ (OPEN)</Badge>
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[580px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400 font-bold">#{item.id}</span>
                  {getPriorityBadge(item.priority)}
                  {getStatusBadge(item.status)}
                </div>
                <DialogTitle className="text-base font-black text-slate-900 leading-snug">
                  {item.title}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
            {/* Description */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed font-medium">
              {item.description}
            </div>

            {/* Attributes Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/40">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Loại công việc</span>
                <span className="font-mono font-bold text-slate-800 text-xs">{item.type}</span>
              </div>
              <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/40">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Vai trò phân công</span>
                <span className="font-bold text-blue-600 text-xs">{item.assignedRole}</span>
              </div>
            </div>

            {/* Reference info */}
            {item.referenceType && item.referenceId && (
              <div className="p-3.5 rounded-2xl border border-slate-100 bg-blue-50/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Đối tượng liên quan</span>
                  <span className="font-bold text-slate-800 text-xs">
                    {item.referenceType} #{item.referenceId}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-blue-600 font-mono">
                  Tham chiếu gốc
                </span>
              </div>
            )}

            {/* Claimed & Resolved status */}
            <div className="rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Tạo lúc:</span>
                <span className="font-mono text-slate-700">
                  {new Date(item.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
              {item.claimedAt && (
                <div className="p-3 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Tiếp nhận bởi:</span>
                  <span className="font-bold text-slate-800">
                    Tài khoản #{item.claimedByUserId} ({new Date(item.claimedAt).toLocaleString("vi-VN")})
                  </span>
                </div>
              )}
              {item.resolvedAt && (
                <div className="p-3.5 bg-emerald-50/40 space-y-1">
                  <div className="flex items-center justify-between text-emerald-800 font-bold">
                    <span>Đã giải quyết bởi Tài khoản #{item.resolvedByUserId}:</span>
                    <span className="text-[10px] font-mono">{new Date(item.resolvedAt).toLocaleString("vi-VN")}</span>
                  </div>
                  {item.resolution && (
                    <p className="text-emerald-900 font-medium text-xs mt-1 italic">
                      "{item.resolution}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 border-t bg-slate-50/70 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loadingAction}
              className="text-xs font-semibold"
            >
              Đóng
            </Button>

            <div className="flex items-center gap-2">
              {/* Claim button if OPEN */}
              {item.status === "OPEN" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClaim}
                  disabled={loadingAction}
                  className="text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                  Tiếp nhận xử lý
                </Button>
              )}

              {/* Direct Domain Action: Provider Cancellation Retry */}
              {item.type === "PROVIDER_CANCELLATION_RECONCILIATION" && isAdminOrSuperAdmin && item.status !== "RESOLVED" && (
                <Button
                  size="sm"
                  onClick={handleRetryCancellation}
                  disabled={loadingAction}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Thử lại hủy PayOS
                </Button>
              )}

              {/* Direct Domain Action: Coordinator Refund Recommendation */}
              {item.type === "REFUND_REVIEW_REQUIRED" && isCoordinator && item.status !== "RESOLVED" && (
                <Button
                  size="sm"
                  onClick={() => setRecommendRefundOpen(true)}
                  disabled={loadingAction}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                >
                  <DollarSign className="w-3.5 h-3.5 mr-1" />
                  Tạo đề xuất hoàn tiền
                </Button>
              )}

              {/* Direct Domain Action: Admin Refund Detail & Reconciliation */}
              {(item.type === "REFUND_PROVIDER_FAILURE" || item.type === "REFUND_REVIEW_REQUIRED") && isAdminOrSuperAdmin && (
                <Button
                  size="sm"
                  onClick={() => setRefundDetailOpen(true)}
                  disabled={loadingAction}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
                >
                  <DollarSign className="w-3.5 h-3.5 mr-1" />
                  Xử lý hoàn tiền
                </Button>
              )}

              {/* Manual Resolve Button */}
              {item.status !== "RESOLVED" && (
                <Button
                  size="sm"
                  onClick={() => setResolveDialogOpen(true)}
                  disabled={loadingAction}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Hoàn tất xử lý
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Resolution Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleResolve}>
            <DialogHeader>
              <DialogTitle>Ghi nhận kết quả xử lý #{item.id}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <Label htmlFor="resText" className="text-xs font-bold text-slate-700">
                Ghi chú giải quyết <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="resText"
                rows={4}
                placeholder="Nêu rõ phương án xử lý đã thực hiện để đóng công việc này..."
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                disabled={loadingAction}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setResolveDialogOpen(false)}
                disabled={loadingAction}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={loadingAction}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loadingAction ? "Đang lưu..." : "Xác nhận đóng công việc"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Coordinator Refund Recommendation Dialog */}
      <RecommendRefundDialog
        paymentId={item.referenceId || null}
        open={recommendRefundOpen}
        onOpenChange={setRecommendRefundOpen}
        onSuccess={() => {
          onSuccess?.()
          onOpenChange(false)
        }}
      />

      {/* Admin Refund Detail Dialog */}
      <RefundDetailDialog
        refundId={item.referenceId || null}
        open={refundDetailOpen}
        onOpenChange={setRefundDetailOpen}
        onSuccess={() => {
          onSuccess?.()
          onOpenChange(false)
        }}
      />
    </>
  )
}

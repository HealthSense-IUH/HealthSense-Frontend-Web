import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  FileSearch,
  RefreshCw,
} from "lucide-react"

import { useAuthStore } from "@/features/auth/auth-store"
import { refundApi } from "../services/refund-api"
import { businessAuditApi } from "@/features/business-audit/services/business-audit-api"
import type { ConsultationRefundResponse } from "../types"
import type { BusinessAuditEventResponse } from "@/features/business-audit/types"
import { DecideRefundDialog } from "./decide-refund-dialog"
import { ReconcileRefundDialog } from "./reconcile-refund-dialog"

interface RefundDetailDialogProps {
  refundId: number | string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RefundDetailDialog({
  refundId,
  open,
  onOpenChange,
  onSuccess,
}: RefundDetailDialogProps) {
  const { toast } = useToast()
  const userSession = useAuthStore((state) => state.userSession)
  const role = userSession?.role || "MEMBER"
  const isAdminOrSuperAdmin = role === "ADMIN" || role === "SUPER_ADMIN"

  const [loading, setLoading] = useState(false)
  const [refund, setRefund] = useState<ConsultationRefundResponse | null>(null)
  const [auditEvents, setAuditEvents] = useState<BusinessAuditEventResponse[]>([])
  const [loadingAudit, setLoadingAudit] = useState(false)

  // Dialog triggers
  const [decideOpen, setDecideOpen] = useState(false)
  const [reconcileOpen, setReconcileOpen] = useState(false)
  const [executing, setExecuting] = useState(false)

  const fetchDetail = async (id: number | string) => {
    try {
      setLoading(true)
      const res = await refundApi.getRefundDetail(id)
      setRefund(res.data || null)
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } }
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: anyErr.response?.data?.message || "Không thể tải chi tiết hoàn tiền.",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAuditEvents = async (id: number | string) => {
    try {
      setLoadingAudit(true)
      const res = await businessAuditApi.queryAuditEvents({
        domainType: "REFUND",
        domainId: id,
        size: 20,
      })
      setAuditEvents(res.data?.content || [])
    } catch {
      setAuditEvents([])
    } finally {
      setLoadingAudit(false)
    }
  }

  useEffect(() => {
    if (open && refundId) {
      void fetchDetail(refundId)
      void fetchAuditEvents(refundId)
    } else {
      setRefund(null)
      setAuditEvents([])
    }
  }, [open, refundId])

  const handleExecute = async () => {
    if (!refund) return
    try {
      setExecuting(true)
      await refundApi.executeRefund(refund.id)
      toast({
        title: "Đã kích hoạt lệnh",
        description: "Lệnh hoàn tiền đã được gửi tới cổng thanh toán.",
      })
      void fetchDetail(refund.id)
      void fetchAuditEvents(refund.id)
      onSuccess?.()
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } }
      toast({
        variant: "destructive",
        title: "Lỗi thực thi",
        description: anyErr.response?.data?.message || "Không thể kích hoạt hoàn tiền tự động.",
      })
    } finally {
      setExecuting(false)
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "SUCCEEDED":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 font-bold">Thành công (SUCCEEDED)</Badge>
      case "APPROVED":
        return <Badge className="bg-blue-500 hover:bg-blue-600 font-bold">Đã duyệt (APPROVED)</Badge>
      case "RECOMMENDED":
        return <Badge className="bg-amber-500 hover:bg-amber-600 font-bold">Đã đề xuất (RECOMMENDED)</Badge>
      case "REVIEW_REQUIRED":
        return <Badge className="bg-purple-500 hover:bg-purple-600 font-bold">Cần đánh giá (REVIEW_REQUIRED)</Badge>
      case "REJECTED":
        return <Badge className="bg-rose-500 hover:bg-rose-600 font-bold">Bác bỏ (REJECTED)</Badge>
      case "FAILED":
        return <Badge className="bg-rose-600 hover:bg-rose-700 font-bold">Thất bại (FAILED)</Badge>
      case "PROCESSING":
        return <Badge className="bg-indigo-500 hover:bg-indigo-600 font-bold">Đang xử lý (PROCESSING)</Badge>
      default:
        return <Badge variant="outline">{status || "UNKNOWN"}</Badge>
    }
  }

  if (!open) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-black text-slate-900">
                  Chi tiết Hoàn tiền #{refundId}
                </DialogTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quản lý vòng đời hoàn trả tiền dịch vụ tư vấn
                </p>
              </div>
              {refund && getStatusBadge(refund.status)}
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6 space-y-5 text-xs">
            {loading ? (
              <div className="flex items-center justify-center p-12 text-slate-400 space-x-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Đang tải thông tin hoàn tiền...</span>
              </div>
            ) : !refund ? (
              <div className="text-center p-12 text-slate-400">Không tìm thấy thông tin hoàn tiền.</div>
            ) : (
              <div className="space-y-5">
                {/* Notice on Payment immutability */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Trạng thái thanh toán gốc (Payment #{refund.paymentId}):</span>
                  <Badge variant="outline" className="font-bold bg-white text-emerald-700 border-emerald-300">
                    Lịch sử: PAID (Bảo lưu)
                  </Badge>
                </div>

                {/* Amount Overview Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                    <span className="text-[11px] text-slate-400 font-bold block mb-1">Số tiền gốc</span>
                    <span className="text-base font-black text-slate-900 font-mono">
                      {refund.originalAmount?.toLocaleString("vi-VN")} {refund.currency || "VND"}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/40">
                    <span className="text-[11px] text-blue-600 font-bold block mb-1">Số tiền phê duyệt</span>
                    <span className="text-base font-black text-blue-900 font-mono">
                      {refund.approvedAmount ? `${refund.approvedAmount.toLocaleString("vi-VN")} ${refund.currency || "VND"}` : "—"}
                    </span>
                  </div>
                </div>

                {/* Recommendation & Decision summary */}
                <div className="rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Đề xuất Điều phối:</span>
                    <span className="font-bold text-slate-800">
                      {refund.recommendation || "Chưa có"}
                      {refund.recommendedAmount ? ` (${refund.recommendedAmount.toLocaleString("vi-VN")} VND)` : ""}
                    </span>
                  </div>
                  {refund.recommendationReason && (
                    <div className="p-3.5 bg-slate-50/40">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Lý do đề xuất:</span>
                      <p className="text-slate-700 font-medium">{refund.recommendationReason}</p>
                    </div>
                  )}
                  {refund.decisionReason && (
                    <div className="p-3.5 bg-slate-50/40">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Lý do quyết định (Admin):</span>
                      <p className="text-slate-700 font-medium">{refund.decisionReason}</p>
                    </div>
                  )}
                  {refund.providerResult && (
                    <div className="p-3.5 bg-slate-50/40">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Kết quả đối soát ngoại tuyến:</span>
                      <p className="text-slate-700 font-medium">{refund.providerResult}</p>
                      {refund.providerRefundId && (
                        <p className="text-slate-500 font-mono text-[11px] mt-1">Mã tham chiếu: #{refund.providerRefundId}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Real Business Audit Events for this Refund */}
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                    <FileSearch className="w-3.5 h-3.5 text-blue-600" />
                    <span>Nhật ký Kiểm toán (Business Audit Trail)</span>
                  </h4>
                  {loadingAudit ? (
                    <div className="p-4 text-center text-slate-400">Đang tải nhật ký kiểm toán...</div>
                  ) : auditEvents.length === 0 ? (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 text-center">
                      Chưa có sự kiện kiểm toán được ghi nhận.
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                      {auditEvents.map((ev) => (
                        <div key={ev.id} className="p-3 text-[11px] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-blue-700">{ev.eventType}</span>
                            <span className="text-slate-400 text-[10px]">
                              {new Date(ev.occurredAt).toLocaleString("vi-VN")}
                            </span>
                          </div>
                          <p className="text-slate-600">
                            {ev.actorType === "USER" ? `Tài khoản #${ev.actorId} (${ev.actorRole})` : "Hệ thống"} - {ev.reason || "Cập nhật trạng thái"}
                          </p>
                          {ev.previousState && ev.newState && (
                            <p className="font-mono text-[10px] text-slate-500">
                              {ev.previousState} ➔ {ev.newState}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Action Footer */}
          {refund && isAdminOrSuperAdmin && (
            <div className="p-4 border-t bg-slate-50/70 flex items-center justify-end gap-2">
              {refund.status === "RECOMMENDED" && (
                <Button
                  size="sm"
                  onClick={() => setDecideOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                >
                  Phê duyệt / Từ chối
                </Button>
              )}
              {(refund.status === "APPROVED" || refund.status === "FAILED") && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExecute}
                  disabled={executing}
                  className="text-xs font-bold"
                >
                  {executing ? "Đang thử lại..." : "Thử lại gửi cổng"}
                </Button>
              )}
              {refund.status !== "REJECTED" && refund.status !== "SUCCEEDED" && (
                <Button
                  size="sm"
                  onClick={() => setReconcileOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                >
                  Đối soát hoàn tiền
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Decision Dialog */}
      <DecideRefundDialog
        refund={refund}
        open={decideOpen}
        onOpenChange={setDecideOpen}
        onSuccess={() => {
          if (refund) {
            void fetchDetail(refund.id)
            void fetchAuditEvents(refund.id)
          }
          onSuccess?.()
        }}
      />

      {/* Reconcile Dialog */}
      <ReconcileRefundDialog
        refund={refund}
        open={reconcileOpen}
        onOpenChange={setReconcileOpen}
        onSuccess={() => {
          if (refund) {
            void fetchDetail(refund.id)
            void fetchAuditEvents(refund.id)
          }
          onSuccess?.()
        }}
      />
    </>
  )
}

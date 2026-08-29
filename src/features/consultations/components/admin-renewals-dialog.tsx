import { useEffect, useState } from "react"
import { RefreshCw, CheckCircle2, XCircle, Clock, ShieldCheck, History, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

import { consultationApi } from "../services/consultation-api"
import type {
  ConsultationSessionItem,
  ConsultationRenewalResponse,
  SessionExtensionResponse,
} from "../types"
import { formatDate } from "./shared"
import { getRenewalStatusBadge } from "./renewal-dialog"

interface AdminRenewalsDialogProps {
  session: ConsultationSessionItem
  open: boolean
  onOpenChange: (open: boolean) => void
  onSessionRefreshed?: () => void
}

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err.response?.data?.message || err.message || fallback
}

export function AdminRenewalsDialog({
  session,
  open,
  onOpenChange,
  onSessionRefreshed,
}: AdminRenewalsDialogProps) {
  const { toast } = useToast()
  const [renewals, setRenewals] = useState<ConsultationRenewalResponse[]>([])
  const [extensions, setExtensions] = useState<SessionExtensionResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [actionInProgressId, setActionInProgressId] = useState<string | number | null>(null)

  // Rejection modal state
  const [rejectingRenewalId, setRejectingRenewalId] = useState<string | number | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  const fetchData = () => {
    if (!open) return
    setLoading(true)
    Promise.allSettled([
      consultationApi.listSessionRenewals(session.id),
      consultationApi.getSessionExtensions(session.id),
    ])
      .then(([renRes, extRes]) => {
        if (renRes.status === "fulfilled") {
          setRenewals(renRes.value.data || [])
        }
        if (extRes.status === "fulfilled") {
          setExtensions(extRes.value.data || [])
        }
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: "Lỗi tải dữ liệu",
          description: readError(err, "Không thể tải danh sách gia hạn của phiên."),
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open, session.id])

  const handleBeginReview = async (renewalId: string | number) => {
    setActionInProgressId(renewalId)
    try {
      await consultationApi.beginRenewalReview(renewalId)
      toast({
        title: "Tiếp nhận duyệt thành công",
        description: "Yêu cầu gia hạn đã chuyển sang trạng thái Đang xem xét (UNDER_REVIEW).",
      })
      fetchData()
      onSessionRefreshed?.()
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Lỗi tiếp nhận duyệt",
        description: readError(err, "Không thể tiếp nhận duyệt yêu cầu này."),
      })
    } finally {
      setActionInProgressId(null)
    }
  }

  const handleApprove = async (renewalId: string | number) => {
    setActionInProgressId(renewalId)
    try {
      await consultationApi.decideRenewal(renewalId, {
        approved: true,
      })
      toast({
        title: "Phê duyệt gia hạn thành công",
        description: "Thỏa thuận gia hạn đã được tạo và gửi đến Hội viên (PENDING_ACCEPTANCE).",
      })
      fetchData()
      onSessionRefreshed?.()
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Lỗi phê duyệt gia hạn",
        description: readError(err, "Không thể phê duyệt yêu cầu gia hạn lúc này."),
      })
    } finally {
      setActionInProgressId(null)
    }
  }

  const handleRejectSubmit = async () => {
    if (!rejectingRenewalId) return
    if (!rejectionReason.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu lý do từ chối",
        description: "Vui lòng nhập lý do từ chối yêu cầu gia hạn.",
      })
      return
    }

    setActionInProgressId(rejectingRenewalId)
    try {
      await consultationApi.decideRenewal(rejectingRenewalId, {
        approved: false,
        rejectionReason: rejectionReason.trim(),
      })
      toast({
        title: "Đã từ chối yêu cầu gia hạn",
        description: "Yêu cầu gia hạn đã được chuyển sang trạng thái Từ chối (REJECTED).",
      })
      setRejectingRenewalId(null)
      setRejectionReason("")
      fetchData()
      onSessionRefreshed?.()
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Lỗi từ chối gia hạn",
        description: readError(err, "Không thể từ chối yêu cầu gia hạn lúc này."),
      })
    } finally {
      setActionInProgressId(null)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[88vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-3 border-b bg-muted/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">Điều phối & Quản lý Gia hạn Phiên</DialogTitle>
                  <DialogDescription>
                    Phiên #{session.id} &bull; Hội viên #{session.memberId} &bull; Bác sĩ #{session.doctorId}
                  </DialogDescription>
                </div>
              </div>
              <Badge variant="outline">{session.status}</Badge>
            </div>
          </DialogHeader>

          <Tabs defaultValue="renewals" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-3 border-b bg-muted/5">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="renewals">Danh sách Yêu cầu Gia hạn ({renewals.length})</TabsTrigger>
                <TabsTrigger value="extensions">Lịch sử Mốc Thời hạn ({extensions.length})</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="renewals" className="flex-1 overflow-y-auto p-6 space-y-4 m-0 outline-none">
              <div className="p-3.5 rounded-xl border bg-muted/10 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>
                    Thời hạn phiên hiện tại: <strong>{formatDate(session.endsAt) || "-"}</strong>
                  </span>
                </div>
                <span className="text-muted-foreground font-mono">Bắt đầu: {formatDate(session.startedAt)}</span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-muted-foreground">Đang tải danh sách gia hạn...</div>
              ) : renewals.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground border border-dashed rounded-xl p-4">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="font-medium text-xs">Chưa có yêu cầu gia hạn nào được tạo cho phiên này</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {renewals.map((r) => {
                    const isActing = actionInProgressId === r.id
                    return (
                      <div key={r.id} className="p-4 rounded-xl border bg-card text-xs space-y-3 shadow-xs">
                        <div className="flex items-center justify-between border-b pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">Yêu cầu gia hạn #{r.id}</span>
                            <span className="text-muted-foreground font-mono">
                              ({formatDate(r.requestedAt || r.createdAt)})
                            </span>
                          </div>
                          <div>{getRenewalStatusBadge(r.status)}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-muted-foreground">
                          {r.proposedEndsAt && (
                            <div>
                              Thời hạn đề xuất: <strong className="text-foreground">{formatDate(r.proposedEndsAt)}</strong>
                            </div>
                          )}
                          {r.packageNameSnapshot && (
                            <div>
                              Gói gia hạn: <strong className="text-foreground">{r.packageNameSnapshot}</strong>
                              {r.packagePriceSnapshot ? ` (${r.packagePriceSnapshot.toLocaleString("vi-VN")} VND)` : ""}
                            </div>
                          )}
                          {r.paymentDeadline && (
                            <div className="text-amber-700 dark:text-amber-400">
                              Hạn chót thanh toán: <strong>{formatDate(r.paymentDeadline)}</strong>
                            </div>
                          )}
                          {r.appliedAt && (
                            <div className="text-emerald-600 dark:text-emerald-400">
                              Đã áp dụng lúc: <strong>{formatDate(r.appliedAt)}</strong>
                            </div>
                          )}
                        </div>

                        {r.rejectionReason && (
                          <div className="p-2.5 rounded-md bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/30">
                            <strong>Lý do từ chối:</strong> {r.rejectionReason}
                          </div>
                        )}

                        {/* Coordinator Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-1 border-t">
                          {r.status === "REQUESTED" && (
                            <Button
                              size="sm"
                              onClick={() => handleBeginReview(r.id)}
                              disabled={isActing}
                              className="gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              {isActing ? "Đang xử lý..." : "Tiếp nhận duyệt"}
                            </Button>
                          )}

                          {r.status === "UNDER_REVIEW" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(r.id)}
                                disabled={isActing}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                {isActing ? "Đang xử lý..." : "Phê duyệt gia hạn"}
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setRejectingRenewalId(r.id)
                                  setRejectionReason("")
                                }}
                                disabled={isActing}
                                className="text-red-600 hover:bg-red-50 border-red-200"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Từ chối
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="extensions" className="flex-1 overflow-y-auto p-6 space-y-4 m-0 outline-none">
              <div className="text-xs text-muted-foreground">
                Dưới đây là các mốc gia hạn thời hạn phiên chăm sóc đã được áp dụng thành công:
              </div>

              {extensions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground border border-dashed rounded-xl p-4">
                  <History className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="font-medium text-xs">Chưa có mốc gia hạn nào được ghi nhận</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {extensions.map((ext, idx) => (
                    <div key={ext.id || idx} className="p-3.5 rounded-xl border bg-card text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">Mốc gia hạn #{idx + 1}</span>
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                          Áp dụng: {formatDate(ext.appliedAt)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>{formatDate(ext.previousEndsAt)}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-primary" />
                        <span className="font-bold text-foreground">{formatDate(ext.newEndsAt)}</span>
                      </div>
                      {ext.packageNameSnapshot && (
                        <p className="text-muted-foreground text-[11px]">
                          Gói: <strong>{ext.packageNameSnapshot}</strong>
                          {ext.packagePriceSnapshot ? ` &bull; ${ext.packagePriceSnapshot.toLocaleString("vi-VN")} VND` : ""}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="p-4 border-t bg-muted/10">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Modal */}
      {rejectingRenewalId && (
        <Dialog open={!!rejectingRenewalId} onOpenChange={(open) => !open && setRejectingRenewalId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Từ chối Yêu cầu Gia hạn #{rejectingRenewalId}
              </DialogTitle>
              <DialogDescription>
                Vui lòng nhập lý do từ chối yêu cầu gia hạn để thông báo cho Hội viên.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <label className="text-xs font-semibold text-foreground">Lý do từ chối</label>
              <Textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Nhập lý do chi tiết..."
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectingRenewalId(null)}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectSubmit}
                disabled={actionInProgressId === rejectingRenewalId || !rejectionReason.trim()}
              >
                {actionInProgressId === rejectingRenewalId ? "Đang xử lý..." : "Xác nhận Từ chối"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

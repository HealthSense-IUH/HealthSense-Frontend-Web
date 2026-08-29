import { useEffect, useState } from "react"
import { RefreshCw, Clock, AlertTriangle, ShieldCheck, CheckCircle2, XCircle, CreditCard, FileText, ArrowRight, History } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

import { consultationApi } from "../services/consultation-api"
import type {
  ConsultationSessionItem,
  ConsultationRenewalResponse,
  SessionExtensionResponse,
  ConsultationRenewalStatus,
} from "../types"
import { formatDate } from "./shared"
import { RenewalAgreementDialog } from "./renewal-agreement-dialog"

interface RenewalDialogProps {
  session: ConsultationSessionItem
  open: boolean
  onOpenChange: (open: boolean) => void
  onSessionRefreshed?: () => void
}

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err.response?.data?.message || err.message || fallback
}

export function getRenewalStatusBadge(status: ConsultationRenewalStatus) {
  switch (status) {
    case "REQUESTED":
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Chờ tiếp nhận</Badge>
    case "UNDER_REVIEW":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Đang xem xét</Badge>
    case "PENDING_ACCEPTANCE":
      return <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white">Chờ xác nhận thỏa thuận</Badge>
    case "WAITING_PAYMENT":
      return <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Chờ thanh toán</Badge>
    case "PAID":
      return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">Đã gia hạn thành công</Badge>
    case "REJECTED":
      return <Badge variant="destructive">Bị từ chối</Badge>
    case "CANCELLED":
      return <Badge variant="secondary">Đã hủy</Badge>
    case "EXPIRED":
      return <Badge variant="secondary">Đã hết hạn</Badge>
    case "REQUIRES_REVIEW":
      return <Badge className="bg-yellow-500 text-black hover:bg-yellow-600">Cần kiểm tra thủ công</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function RenewalDialog({
  session,
  open,
  onOpenChange,
  onSessionRefreshed,
}: RenewalDialogProps) {
  const { toast } = useToast()
  const [renewals, setRenewals] = useState<ConsultationRenewalResponse[]>([])
  const [extensions, setExtensions] = useState<SessionExtensionResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | number | null>(null)
  const [payingId, setPayingId] = useState<string | number | null>(null)

  // Agreement dialog state
  const [agreementRenewalId, setAgreementRenewalId] = useState<string | number | null>(null)

  const isSessionActive = session.status === "ACTIVE"

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
          description: readError(err, "Không thể tải thông tin gia hạn của phiên."),
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

  // Check if there is an active unresolved renewal
  const unresolvedRenewal = renewals.find((r) =>
    ["REQUESTED", "UNDER_REVIEW", "PENDING_ACCEPTANCE", "WAITING_PAYMENT", "REQUIRES_REVIEW"].includes(r.status)
  )

  const handleRequestRenewal = async () => {
    if (!isSessionActive) {
      toast({
        variant: "destructive",
        title: "Phiên không hợp lệ",
        description: "Chỉ có thể yêu cầu gia hạn khi phiên tư vấn đang hoạt động (ACTIVE).",
      })
      return
    }

    setRequesting(true)
    try {
      await consultationApi.requestRenewal(session.id)
      toast({
        title: "Gửi yêu cầu gia hạn thành công",
        description: "Yêu cầu gia hạn của bạn đã được gửi đến Điều phối viên chăm sóc.",
      })
      fetchData()
      onSessionRefreshed?.()
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Lỗi yêu cầu gia hạn",
        description: readError(err, "Không thể gửi yêu cầu gia hạn vào lúc này."),
      })
    } finally {
      setRequesting(false)
    }
  }

  const handleCancelRenewal = async (renewalId: string | number) => {
    setCancellingId(renewalId)
    try {
      await consultationApi.cancelRenewal(renewalId)
      toast({
        title: "Hủy yêu cầu gia hạn thành công",
        description: "Yêu cầu gia hạn đã được hủy. Thời hạn phiên chăm sóc hiện tại giữ nguyên.",
      })
      fetchData()
      onSessionRefreshed?.()
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Lỗi hủy gia hạn",
        description: readError(err, "Không thể hủy yêu cầu gia hạn lúc này."),
      })
    } finally {
      setCancellingId(null)
    }
  }

  const handlePayRenewal = async (renewalId: string | number) => {
    setPayingId(renewalId)
    try {
      const res = await consultationApi.createRenewalPayment(renewalId)
      const paymentData = res.data
      if (paymentData.checkoutUrl) {
        localStorage.setItem("healthsense.pendingPaymentType", "renewal")
        localStorage.setItem("healthsense.pendingPaymentRenewalId", String(renewalId))
        localStorage.setItem("healthsense.pendingPaymentSessionId", String(session.id))
        window.location.href = paymentData.checkoutUrl
      } else {
        toast({
          variant: "destructive",
          title: "Lỗi thanh toán",
          description: "Không thể tạo liên kết thanh toán PayOS.",
        })
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Lỗi khởi tạo thanh toán",
        description: readError(err, "Không thể tạo giao dịch thanh toán gia hạn."),
      })
    } finally {
      setPayingId(null)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[88vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-3 border-b bg-muted/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">Gia hạn Phiên Chăm sóc</DialogTitle>
                  <DialogDescription>
                    Phiên #{session.id} &bull; Bác sĩ #{session.doctorId}
                  </DialogDescription>
                </div>
              </div>
              <Badge variant={isSessionActive ? "default" : "outline"} className={isSessionActive ? "bg-emerald-600" : ""}>
                {session.status}
              </Badge>
            </div>
          </DialogHeader>

          <Tabs defaultValue="manage" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-3 border-b bg-muted/5">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manage">Quản lý Gia hạn</TabsTrigger>
                <TabsTrigger value="history">Lịch sử Thời hạn ({extensions.length})</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="manage" className="flex-1 overflow-y-auto p-6 space-y-5 m-0 outline-none">
              {/* Session Overview Card */}
              <div className="p-4 rounded-xl border bg-card text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Thông tin thời hạn hiện tại:</span>
                  <span className="text-muted-foreground font-mono">Bắt đầu: {formatDate(session.startedAt)}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 text-foreground">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    Thời hạn hiệu lực hiện tại: <strong className="text-primary">{formatDate(session.endsAt) || "Không xác định"}</strong>
                  </span>
                </div>
              </div>

              {/* Unresolved Renewal Banner / Action */}
              {unresolvedRenewal ? (
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-amber-600" />
                      <span className="font-semibold text-amber-950 dark:text-amber-300 text-sm">
                        Yêu cầu gia hạn #{unresolvedRenewal.id} đang xử lý
                      </span>
                    </div>
                    {getRenewalStatusBadge(unresolvedRenewal.status)}
                  </div>

                  <div className="text-xs text-amber-900/90 dark:text-amber-300/90 space-y-1.5 pl-7">
                    {unresolvedRenewal.proposedEndsAt && (
                      <p>
                        Thời hạn sau khi gia hạn: <strong>{formatDate(unresolvedRenewal.proposedEndsAt)}</strong>
                      </p>
                    )}
                    {unresolvedRenewal.packageNameSnapshot && (
                      <p>
                        Gói dịch vụ gia hạn: <strong>{unresolvedRenewal.packageNameSnapshot}</strong>
                        {unresolvedRenewal.packagePriceSnapshot ? ` (${unresolvedRenewal.packagePriceSnapshot.toLocaleString("vi-VN")} VND)` : ""}
                      </p>
                    )}
                    {unresolvedRenewal.paymentDeadline && (
                      <p className="text-red-600 dark:text-red-400">
                        Hạn chót thanh toán: <strong>{formatDate(unresolvedRenewal.paymentDeadline)}</strong>
                      </p>
                    )}
                    {unresolvedRenewal.rejectionReason && (
                      <p className="text-red-700 dark:text-red-400">
                        Lý do từ chối: <em>{unresolvedRenewal.rejectionReason}</em>
                      </p>
                    )}
                  </div>

                  {/* Actions for current status */}
                  <div className="flex flex-wrap gap-2 pt-2 pl-7">
                    {unresolvedRenewal.status === "PENDING_ACCEPTANCE" && (
                      <Button
                        size="sm"
                        onClick={() => setAgreementRenewalId(unresolvedRenewal.id)}
                        className="gap-1.5"
                      >
                        <FileText className="w-4 h-4" />
                        Xem & Chấp nhận thỏa thuận
                      </Button>
                    )}

                    {unresolvedRenewal.status === "WAITING_PAYMENT" && (
                      <Button
                        size="sm"
                        onClick={() => handlePayRenewal(unresolvedRenewal.id)}
                        disabled={payingId === unresolvedRenewal.id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                      >
                        <CreditCard className="w-4 h-4" />
                        {payingId === unresolvedRenewal.id ? "Đang mở thanh toán..." : "Tiến hành thanh toán"}
                      </Button>
                    )}

                    {["REQUESTED", "UNDER_REVIEW", "PENDING_ACCEPTANCE", "WAITING_PAYMENT"].includes(unresolvedRenewal.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelRenewal(unresolvedRenewal.id)}
                        disabled={cancellingId === unresolvedRenewal.id}
                        className="text-red-600 hover:bg-red-50 border-red-200"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        {cancellingId === unresolvedRenewal.id ? "Đang hủy..." : "Hủy yêu cầu"}
                      </Button>
                    )}
                  </div>
                </div>
              ) : isSessionActive ? (
                <div className="p-4 rounded-xl border border-dashed bg-muted/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-sm">Gia hạn thêm thời gian chăm sóc</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Gia hạn chăm sóc giúp bạn tiếp tục đồng hành cùng <strong>Bác sĩ #{session.doctorId}</strong> trong cùng phiên tư vấn này mà không bị gián đoạn dữ liệu và lịch sử trò chuyện.
                  </p>
                  <Button
                    onClick={handleRequestRenewal}
                    disabled={requesting || loading}
                    className="gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${requesting ? "animate-spin" : ""}`} />
                    {requesting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu Gia hạn Chăm sóc"}
                  </Button>
                </div>
              ) : (
                <div className="p-4 rounded-xl border bg-muted/20 text-xs text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>Phiên chăm sóc đã kết thúc hoặc không còn hoạt động, không thể yêu cầu gia hạn.</span>
                </div>
              )}

              {/* Past Renewals List */}
              <div className="space-y-3 pt-3 border-t">
                <h4 className="text-xs font-semibold text-foreground">Lịch sử các yêu cầu gia hạn</h4>
                {loading ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">Đang tải lịch sử...</div>
                ) : renewals.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Chưa có yêu cầu gia hạn nào cho phiên này.</p>
                ) : (
                  <div className="space-y-2">
                    {renewals.map((r) => (
                      <div key={r.id} className="p-3 rounded-lg border bg-card text-xs flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Yêu cầu #{r.id}</span>
                            <span className="text-muted-foreground font-mono">({formatDate(r.requestedAt || r.createdAt)})</span>
                          </div>
                          {r.proposedEndsAt && (
                            <p className="text-muted-foreground">
                              Hạn đề xuất: <strong>{formatDate(r.proposedEndsAt)}</strong>
                            </p>
                          )}
                        </div>
                        <div>{getRenewalStatusBadge(r.status)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="flex-1 overflow-y-auto p-6 space-y-4 m-0 outline-none">
              <div className="text-xs text-muted-foreground">
                Dưới đây là các mốc gia hạn thời gian chăm sóc đã được áp dụng thành công vào phiên tư vấn này:
              </div>

              {extensions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground border border-dashed rounded-xl p-4">
                  <History className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="font-medium text-xs">Chưa có mốc gia hạn nào được ghi nhận</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Thời hạn phiên hiện tại là thời hạn ban đầu khi kích hoạt gói dịch vụ.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {extensions.map((ext, idx) => (
                    <div key={ext.id || idx} className="p-3.5 rounded-xl border bg-card text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">Gia hạn lần #{idx + 1}</span>
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                          Đã áp dụng: {formatDate(ext.appliedAt)}
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

      {/* Renewal Agreement Modal */}
      {agreementRenewalId && (
        <RenewalAgreementDialog
          renewalId={agreementRenewalId}
          open={!!agreementRenewalId}
          onOpenChange={(open) => {
            if (!open) setAgreementRenewalId(null)
          }}
          onAgreementAccepted={() => {
            fetchData()
            onSessionRefreshed?.()
          }}
        />
      )}
    </>
  )
}

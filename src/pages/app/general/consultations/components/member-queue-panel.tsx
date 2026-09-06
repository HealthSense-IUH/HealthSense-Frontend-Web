import { useEffect, useRef, useState } from "react"
import {
  Clock,
  Users,
  UserCheck,
  AlertCircle,
  Stethoscope,
  XCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { CurrentQueueStateResponse, ConsultationRequestItem } from "@/types/consultation"

export interface MemberQueuePanelProps {
  queueState: CurrentQueueStateResponse | null
  latestRequest: ConsultationRequestItem | null
  loading: boolean
  actionLoading: boolean
  onConfirm: (offerId: string) => void
  onCancel: (requestId: string | number) => void
  onRefresh: () => void
  onOpenSession: (sessionId: string | number) => void
  onRegisterNew: () => void
}

/**
 * Display-only countdown hook based strictly on the backend-provided ISO deadline.
 * Never invents local durations. When reaching zero, disables action and triggers onExpire.
 */
function useDeadlineCountdown(deadlineIso?: string | null, onExpire?: () => void) {
  const [timeLeftMs, setTimeLeftMs] = useState<number>(() => {
    if (!deadlineIso) return 0
    return Math.max(0, new Date(deadlineIso).getTime() - Date.now())
  })
  const expiredRef = useRef(false)

  useEffect(() => {
    if (!deadlineIso) {
      setTimeLeftMs(0)
      expiredRef.current = false
      return
    }

    expiredRef.current = false
    const calc = () => {
      const remaining = Math.max(0, new Date(deadlineIso).getTime() - Date.now())
      setTimeLeftMs(remaining)
      if (remaining <= 0 && !expiredRef.current) {
        expiredRef.current = true
        onExpire?.()
      }
    }

    calc()
    const timer = setInterval(calc, 1000)
    return () => clearInterval(timer)
  }, [deadlineIso, onExpire])

  const totalSeconds = Math.floor(timeLeftMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  const isExpired = !deadlineIso || timeLeftMs <= 0

  return { timeLeftMs, totalSeconds, formatted, isExpired }
}

export function MemberQueuePanel({
  queueState,
  latestRequest,
  loading,
  actionLoading,
  onConfirm,
  onCancel,
  onRefresh,
  onOpenSession,
  onRegisterNew,
}: MemberQueuePanelProps) {
  // Confirmation countdown (authoritative backend timestamp only)
  const confirmationDeadline = queueState?.phase === "WAITING_CONFIRMATION" ? queueState.memberConfirmExpiresAt : null
  const { formatted: confirmTimerFormatted, isExpired: isConfirmExpired } = useDeadlineCountdown(
    confirmationDeadline,
    onRefresh
  )

  // 1. ACTIVE_SESSION phase
  if (queueState?.phase === "ACTIVE_SESSION" && queueState.sessionId) {
    return (
      <Card className="shadow-sm border rounded-2xl overflow-hidden max-w-2xl mx-auto">
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white mb-1.5">Phiên tư vấn đang diễn ra</Badge>
            <h2 className="text-xl font-bold text-foreground">Bác sĩ đang đợi bạn trong phòng tư vấn</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Phiên tư vấn #{queueState.sessionId} đã được kích hoạt thành công.
            </p>
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          <div className="bg-muted/30 border rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Mã phiên tư vấn:</span>
              <span className="font-mono font-bold text-foreground">#{queueState.sessionId}</span>
            </div>
            {queueState.sessionStartedAt && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Thời gian bắt đầu:</span>
                <span className="font-medium text-foreground">
                  {new Date(queueState.sessionStartedAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            {queueState.sessionEndsAt && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Thời gian kết thúc block 15 phút:</span>
                <span className="font-medium text-foreground">
                  {new Date(queueState.sessionEndsAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0 flex gap-3">
          <Button
            size="lg"
            className="w-full h-12 rounded-xl font-semibold gap-2 shadow-sm"
            onClick={() => onOpenSession(queueState.sessionId!)}
          >
            <Sparkles className="w-4 h-4" />
            Vào phòng tư vấn ngay (Mở Chat)
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // 2. WAITING_CONFIRMATION phase
  if (queueState?.phase === "WAITING_CONFIRMATION") {
    const canConfirm =
      Boolean(queueState.offerId) &&
      queueState.doctorReady &&
      !isConfirmExpired &&
      !actionLoading

    return (
      <Card className="shadow-md border-primary/30 rounded-2xl overflow-hidden max-w-2xl mx-auto">
        <div className="bg-primary/10 border-b border-primary/20 p-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <Badge className="bg-primary text-primary-foreground mb-1.5 animate-pulse">
                Bác sĩ đã sẵn sàng
              </Badge>
              <h2 className="text-xl font-bold text-foreground">Bác sĩ đã nhận lượt tư vấn của bạn!</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Vui lòng xác nhận để bắt đầu phiên tư vấn trực tiếp.
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] font-medium text-muted-foreground block">Thời gian còn lại</span>
            <div className="flex items-center gap-1 font-mono font-bold text-lg text-primary">
              <Clock className="w-4 h-4" />
              <span>{confirmTimerFormatted}</span>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-muted/20 border space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Số thứ tự của bạn:</span>
              <span className="font-mono font-bold text-base text-primary">
                #{String(queueState.queueNumber).padStart(3, "0")}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Trạng thái:</span>
              <span className="font-semibold text-emerald-600">Bác sĩ đã chấp nhận kết nối</span>
            </div>
          </div>

          {isConfirmExpired ? (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-800 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>
                Đã hết thời gian xác nhận. Hệ thống đang làm mới trạng thái hàng đợi...
              </span>
            </div>
          ) : (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
              <span>
                Bạn có tối đa 15 phút để xác nhận. Sau khi bạn xác nhận, phiên tư vấn và khung chat trực tiếp sẽ được mở ngay lập tức.
              </span>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
          <Button
            size="lg"
            className="flex-1 h-12 rounded-xl font-semibold gap-2 shadow-sm"
            disabled={!canConfirm}
            onClick={() => {
              if (queueState.offerId) {
                onConfirm(queueState.offerId)
              }
            }}
          >
            <Sparkles className="w-4 h-4" />
            {actionLoading ? "Đang tạo phiên tư vấn..." : "Tham gia tư vấn"}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-12 rounded-xl text-muted-foreground hover:text-red-600 hover:border-red-200"
            disabled={actionLoading}
            onClick={() => {
              if (window.confirm("Bạn có chắc chắn muốn hủy lượt tư vấn này?")) {
                onCancel(queueState.requestId)
              }
            }}
          >
            <XCircle className="w-4 h-4 mr-1.5" />
            Hủy lượt
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // 3. QUEUE phase (WAITING or OFFERING_DOCTOR)
  if (queueState?.phase === "QUEUE") {
    const isOfferingDoctor = queueState.queueStatus === "OFFERING_DOCTOR"
    const hasZeroDoctors = queueState.availableDoctors === 0

    return (
      <Card className="shadow-sm border rounded-2xl overflow-hidden max-w-2xl mx-auto">
        <CardHeader className="border-b bg-muted/10 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Hàng đợi Tư vấn Sức khỏe</CardTitle>
                <CardDescription className="text-xs">
                  {isOfferingDoctor
                    ? "Hệ thống đang kết nối bạn với bác sĩ..."
                    : "Bạn đang trong hàng đợi trực tuyến (FIFO)"}
                </CardDescription>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-xs text-muted-foreground"
              disabled={loading}
              onClick={onRefresh}
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Main Queue Callout */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-primary/5 border border-primary/20 gap-4 text-center sm:text-left">
            <div>
              <span className="text-xs font-medium text-muted-foreground block uppercase tracking-wider">
                Số thứ tự của bạn
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold text-primary font-mono tracking-tight">
                #{String(queueState.queueNumber).padStart(3, "0")}
              </span>
              <span className="text-xs text-muted-foreground block mt-1">
                Ngày tiếp nhận: {queueState.queueDate}
              </span>
            </div>

            <div className="flex flex-col items-center sm:items-end">
              <Badge variant="outline" className="px-3 py-1 text-xs font-semibold bg-background mb-1.5">
                {isOfferingDoctor ? "Đang kết nối bác sĩ" : "Đang chờ đến lượt"}
              </Badge>
              <p className="text-sm font-medium text-foreground">
                Còn <strong className="text-primary font-bold text-base">{queueState.peopleAhead}</strong> người trước bạn
              </p>
            </div>
          </div>

          {/* Neutral connecting message when OFFERING_DOCTOR */}
          {isOfferingDoctor && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs">
              <div className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </div>
              <p className="font-medium">
                Hệ thống đang kết nối bạn với bác sĩ... Vui lòng giữ màn hình này và chờ phản hồi từ bác sĩ.
              </p>
            </div>
          )}

          {/* Zero Available Doctors Notice (Rule 4) */}
          {!isOfferingDoctor && hasZeroDoctors && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Hiện chưa có bác sĩ sẵn sàng.</p>
                <p className="mt-0.5">
                  Yêu cầu của bạn đã được xếp hàng và sẽ được xử lý khi có bác sĩ trực. Bạn không cần gửi lại yêu cầu.
                </p>
              </div>
            </div>
          )}

          {/* Realtime Doctor Statistics */}
          <div className="border rounded-xl p-4 bg-muted/10 space-y-2">
            <span className="text-xs font-semibold text-foreground block mb-2">Thống kê đội ngũ bác sĩ:</span>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-background border">
                <span className="text-[11px] text-muted-foreground block">Đang trực</span>
                <span className="text-base font-bold text-foreground font-mono">{queueState.doctorsOnDuty}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-background border">
                <span className="text-[11px] text-muted-foreground block">Sẵn sàng</span>
                <span className="text-base font-bold text-emerald-600 font-mono">{queueState.availableDoctors}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-background border">
                <span className="text-[11px] text-muted-foreground block">Đang bận</span>
                <span className="text-base font-bold text-amber-600 font-mono">{queueState.busyDoctors}</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t bg-muted/5 p-4 px-6 flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            Bạn có thể hủy lượt bất cứ lúc nào trước khi phiên bắt đầu.
          </span>
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-muted-foreground hover:text-red-600 hover:border-red-200"
            disabled={actionLoading}
            onClick={() => {
              if (window.confirm("Bạn có chắc chắn muốn rời khỏi hàng đợi tư vấn?")) {
                onCancel(queueState.requestId)
              }
            }}
          >
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Hủy lượt chờ
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // 4. Fallback / Terminal states from History (TIMED_OUT or CANCELLED)
  if (latestRequest?.status === "TIMED_OUT") {
    return (
      <Card className="shadow-sm border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/10 rounded-2xl overflow-hidden max-w-xl mx-auto p-6 text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">Bạn đã bỏ lỡ lượt tư vấn</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Thời hạn xác nhận lượt tư vấn trước đó đã hết. Nếu bạn vẫn muốn được bác sĩ tư vấn, vui lòng đăng ký lại để nhận số thứ tự mới.
          </p>
        </div>
        <div className="pt-2">
          <Button onClick={onRegisterNew} className="rounded-xl font-semibold gap-1.5 shadow-sm">
            <Sparkles className="w-4 h-4" />
            Đăng ký tư vấn mới
          </Button>
        </div>
      </Card>
    )
  }

  if (latestRequest?.status === "CANCELLED") {
    return (
      <Card className="shadow-sm border rounded-2xl overflow-hidden max-w-xl mx-auto p-6 text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
          <XCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">Yêu cầu tư vấn đã được hủy</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Lượt xếp hàng trước đó của bạn đã kết thúc. Bạn có thể tạo yêu cầu tư vấn mới bất cứ lúc nào.
          </p>
        </div>
        <div className="pt-2">
          <Button onClick={onRegisterNew} className="rounded-xl font-semibold gap-1.5 shadow-sm">
            <Sparkles className="w-4 h-4" />
            Đăng ký tư vấn mới
          </Button>
        </div>
      </Card>
    )
  }

  // 5. Default: No Active Request
  return (
    <Card className="shadow-sm border border-dashed rounded-2xl max-w-xl mx-auto p-8 text-center space-y-4">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
        <Stethoscope className="w-7 h-7" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-foreground">Bạn chưa có yêu cầu tư vấn đang hoạt động</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Đăng ký để được xếp vào hàng đợi tư vấn trực tiếp 1-1 với bác sĩ chuyên khoa mà không cần chờ duyệt hay thanh toán trước.
        </p>
      </div>
      <div className="pt-2">
        <Button onClick={onRegisterNew} size="lg" className="rounded-xl font-semibold gap-1.5 shadow-sm">
          <Sparkles className="w-4 h-4" />
          Đăng ký tư vấn ngay
        </Button>
      </div>
    </Card>
  )
}

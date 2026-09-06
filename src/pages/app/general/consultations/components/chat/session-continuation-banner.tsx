import { useEffect, useState, useRef, useCallback } from "react"
import { Clock, AlertCircle, CheckCircle2, RefreshCw, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { consultationApi } from "@/services"
import type { ConsultationSessionItem, ContinuationDecisionResponse } from "@/types/consultation"

interface SessionContinuationBannerProps {
  session: ConsultationSessionItem
  isDoctor: boolean
  isMember: boolean
  onSessionRefreshed: () => void
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00"
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

function readError(error: unknown, fallback: string): string {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err.response?.data?.message || err.message || fallback
}

export function SessionContinuationBanner({
  session,
  isDoctor,
  isMember: _isMember,
  onSessionRefreshed,
}: SessionContinuationBannerProps) {
  const { toast } = useToast()
  const isQueueV1 = session.flowType === "QUEUE_DISPATCH_V1"
  const isActive = session.status === "ACTIVE"

  const [currentTime, setCurrentTime] = useState<number>(() => Date.now())
  const [continuation, setContinuation] = useState<ContinuationDecisionResponse | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Local ticker every second for countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Absolute timestamps from backend
  const endsAtMs = session.endsAt ? new Date(session.endsAt).getTime() : 0
  const isBlockEnded = endsAtMs > 0 && currentTime >= endsAtMs

  // Grace timer from continuation data
  const graceExpiresAtMs = continuation?.graceExpiresAt
    ? new Date(continuation.graceExpiresAt).getTime()
    : 0
  const isGraceExpired = graceExpiresAtMs > 0 && currentTime >= graceExpiresAtMs

  // Safe ref for onSessionRefreshed
  const onSessionRefreshedRef = useRef(onSessionRefreshed)
  useEffect(() => {
    onSessionRefreshedRef.current = onSessionRefreshed
  }, [onSessionRefreshed])

  // Fetch current continuation state
  const fetchCurrentContinuation = useCallback(async () => {
    if (!isQueueV1 || !isActive) return
    try {
      const res = await consultationApi.getCurrentContinuation(session.id)
      if (res.data) {
        setContinuation(res.data)
        // If the continuation indicates session is no longer active, refresh authoritative session
        if (res.data.sessionStatus && res.data.sessionStatus !== "ACTIVE") {
          onSessionRefreshedRef.current()
        }
        // If round has incremented (both parties continued and new block started), refresh authoritative session
        if (typeof res.data.round === "number" && res.data.round > (session.continuationRound || 0)) {
          onSessionRefreshedRef.current()
        }
      } else {
        // Data is null: could be before backend opened continuation, or continuation has ended
        setContinuation(null)
      }
    } catch {
      // Ignore transient errors, will retry in polling
    }
  }, [isQueueV1, isActive, session.id, session.continuationRound])

  // Continuation polling when block is ended and session is still ACTIVE
  useEffect(() => {
    if (!isQueueV1 || !isActive || !isBlockEnded) {
      return
    }

    // Initial fetch immediately
    void fetchCurrentContinuation()

    // Light polling: ONLY fetch continuation state, do not trigger heavy loadData() unconditionally
    const interval = setInterval(() => {
      void fetchCurrentContinuation()
    }, 4000)

    return () => {
      clearInterval(interval)
    }
  }, [isQueueV1, isActive, isBlockEnded, fetchCurrentContinuation])

  // When grace timer expires locally: trigger authoritative session refresh
  const hasTriggeredGraceExpireRefresh = useRef(false)
  useEffect(() => {
    if (isGraceExpired && !hasTriggeredGraceExpireRefresh.current) {
      hasTriggeredGraceExpireRefresh.current = true
      onSessionRefreshedRef.current()
    } else if (!isGraceExpired) {
      hasTriggeredGraceExpireRefresh.current = false
    }
  }, [isGraceExpired])

  // If not Queue V1, don't render continuation logic
  if (!isQueueV1) {
    return null
  }

  // Handle participant decision (CONTINUE or STOP)
  const handleDecision = async (decision: "CONTINUE" | "STOP") => {
    if (!continuation || actionLoading) return
    setActionLoading(true)
    try {
      const res = await consultationApi.submitContinuationDecision(session.id, continuation.round, {
        decision,
      })
      setContinuation(res.data)
      // Always immediately refetch authoritative session
      onSessionRefreshedRef.current()
      if (decision === "STOP") {
        toast({
          description: "Bạn đã chọn kết thúc phiên tư vấn.",
        })
      } else {
        toast({
          description: "Bạn đã xác nhận tiếp tục thêm 15 phút. Đang chờ người còn lại xác nhận...",
        })
      }
    } catch (error: any) {
      const code = error?.response?.data?.code
      if (code === 4031) {
        toast({ variant: "destructive", description: "Block 15 phút chưa kết thúc." })
      } else if (code === 4032) {
        toast({ variant: "destructive", description: "Đã hết thời gian 5 phút xác nhận tiếp tục." })
        onSessionRefreshedRef.current()
      } else if (code === 4033) {
        toast({ variant: "destructive", description: "Lựa chọn đã được ghi nhận và không thể thay đổi." })
      } else if (code === 4034) {
        toast({ variant: "destructive", description: "Trạng thái tiếp tục đã thay đổi. Đang tải lại..." })
        onSessionRefreshedRef.current()
      } else {
        toast({ variant: "destructive", description: readError(error, "Không thể gửi quyết định.") })
      }
      onSessionRefreshedRef.current()
    } finally {
      setActionLoading(false)
    }
  }

  // Derive my decision
  const myDecision = isDoctor ? continuation?.doctorDecision : continuation?.memberDecision

  // 1. If session is ACTIVE and still within the 15-minute block
  if (isActive && !isBlockEnded) {
    const blockRemainingMs = Math.max(0, endsAtMs - currentTime)
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-muted/40 border-b border-border/60 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span>Thời gian block tư vấn (Lượt {session.continuationRound || 0}):</span>
          <span className="font-mono font-semibold text-foreground">
            {formatCountdown(blockRemainingMs)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
            Khung 15 phút
          </Badge>
        </div>
      </div>
    )
  }

  // 2. If session is ACTIVE and block has ended, but continuation grace is open in Redis
  if (isActive && isBlockEnded && continuation) {
    const graceRemainingMs = Math.max(0, graceExpiresAtMs - currentTime)
    const isButtonsDisabled = isGraceExpired || actionLoading || myDecision === "CONTINUE" || myDecision === "STOP"

    return (
      <div className="flex flex-col gap-2 p-4 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100 animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">
                Phiên tư vấn hiện tại đã kết thúc (15 phút).
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-200 mt-0.5">
                Bạn có muốn tiếp tục thêm 15 phút không? Cả hai bên cần đồng ý để tiếp tục phiên.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-mono text-xs font-medium shrink-0">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatCountdown(graceRemainingMs)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 dark:border-amber-800/60 mt-1">
          <div className="text-xs">
            {myDecision === "CONTINUE" ? (
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Bạn đã chọn tiếp tục. Đang chờ người còn lại xác nhận...
              </span>
            ) : myDecision === "STOP" ? (
              <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 font-medium">
                <XCircle className="w-4 h-4" />
                Bạn đã chọn kết thúc phiên. Đang hoàn tất...
              </span>
            ) : isGraceExpired ? (
              <span className="text-destructive font-medium">
                Đã hết thời gian xác nhận. Đang cập nhật trạng thái phiên...
              </span>
            ) : (
              <span className="text-muted-foreground text-[11px]">
                Vui lòng xác nhận trước khi hết thời gian 5 phút gia hạn.
              </span>
            )}
          </div>

          {myDecision === "PENDING" && !isGraceExpired && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-amber-300 hover:bg-amber-100/50 text-amber-900 text-xs"
                disabled={isButtonsDisabled}
                onClick={() => void handleDecision("STOP")}
              >
                Kết thúc
              </Button>
              <Button
                variant="default"
                size="sm"
                className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                disabled={isButtonsDisabled}
                onClick={() => void handleDecision("CONTINUE")}
              >
                {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                Tiếp tục
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 3. If session is ACTIVE and block ended, but continuation data has not yet arrived or is preparing
  if (isActive && isBlockEnded && !continuation) {
    return (
      <div className="flex items-center justify-between px-4 py-2.5 bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-200/50 text-xs text-amber-900 dark:text-amber-200">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
          <span>Hết block 15 phút. Đang kiểm tra trạng thái tiếp tục phiên tư vấn...</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-[11px] px-2 text-amber-800 hover:text-amber-950"
          onClick={() => {
            void fetchCurrentContinuation()
            onSessionRefreshedRef.current()
          }}
        >
          Làm mới
        </Button>
      </div>
    )
  }

  return null
}

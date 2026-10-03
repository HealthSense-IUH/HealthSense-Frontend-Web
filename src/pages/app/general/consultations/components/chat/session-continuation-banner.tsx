import { useEffect, useState, useRef, useCallback } from "react"
import { Clock, AlertCircle, CheckCircle2, RefreshCw, XCircle } from "lucide-react"
import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation("consultation")
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
          description: t("chat.continuation.stopChosenToast"),
        })
      } else {
        toast({
          description: t("chat.continuation.continueChosenToast"),
        })
      }
    } catch (error: any) {
      const code = error?.response?.data?.code
      if (code === 4031) {
        toast({ variant: "destructive", description: t("chat.continuation.errors.blockNotEnded") })
      } else if (code === 4032) {
        toast({ variant: "destructive", description: t("chat.continuation.errors.graceExpired") })
        onSessionRefreshedRef.current()
      } else if (code === 4033) {
        toast({ variant: "destructive", description: t("chat.continuation.errors.decisionLocked") })
      } else if (code === 4034) {
        toast({ variant: "destructive", description: t("chat.continuation.errors.stateChanged") })
        onSessionRefreshedRef.current()
      } else {
        toast({ variant: "destructive", description: readError(error, t("chat.continuation.errors.submitFailed")) })
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
          <span>{t("chat.continuation.blockTime", { round: session.continuationRound || 0 })}</span>
          <span className="font-mono font-semibold text-foreground">
            {formatCountdown(blockRemainingMs)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
            {t("chat.continuation.blockBadge")}
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
      <div className="flex flex-col gap-2 p-4 bg-warning-50 border-b border-warning-200 text-warning-950 animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">
                {t("chat.continuation.endedTitle")}
              </h4>
              <p className="text-xs text-warning-800 mt-0.5">
                {t("chat.continuation.endedDescription")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning-200/60 text-warning-900 font-mono text-xs font-medium shrink-0">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatCountdown(graceRemainingMs)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-warning-200/60 mt-1">
          <div className="text-xs">
            {myDecision === "CONTINUE" ? (
              <span className="flex items-center gap-1.5 text-success-700 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                {t("chat.continuation.waitingOther")}
              </span>
            ) : myDecision === "STOP" ? (
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <XCircle className="w-4 h-4" />
                {t("chat.continuation.stopping")}
              </span>
            ) : isGraceExpired ? (
              <span className="text-destructive font-medium">
                {t("chat.continuation.graceExpiredUpdating")}
              </span>
            ) : (
              <span className="text-muted-foreground text-[11px]">
                {t("chat.continuation.confirmBeforeExpiry")}
              </span>
            )}
          </div>

          {myDecision === "PENDING" && !isGraceExpired && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-warning-300 hover:bg-warning-100/50 text-warning-900 text-xs"
                disabled={isButtonsDisabled}
                onClick={() => void handleDecision("STOP")}
              >
                {t("chat.continuation.stop")}
              </Button>
              <Button
                variant="default"
                size="sm"
                className="h-8 bg-success-600 hover:bg-success-700 text-white text-xs gap-1.5"
                disabled={isButtonsDisabled}
                onClick={() => void handleDecision("CONTINUE")}
              >
                {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                {t("chat.continuation.continue")}
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
      <div className="flex items-center justify-between px-4 py-2.5 bg-warning-50/70 border-b border-warning-200/50 text-xs text-warning-900">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-warning-600" />
          <span>{t("chat.continuation.checking")}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-[11px] px-2 text-warning-800 hover:text-warning-950"
          onClick={() => {
            void fetchCurrentContinuation()
            onSessionRefreshedRef.current()
          }}
        >
          {t("chat.continuation.refresh")}
        </Button>
      </div>
    )
  }

  return null
}

import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Trans, useTranslation } from "react-i18next"
import {
  Clock,
  Users,
  UserCheck,
  AlertCircle,
  Stethoscope,
  XCircle,
  RefreshCw,
  ArrowRight,
  Info,
  Coins,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { CurrentQueueStateResponse, ConsultationRequestItem } from "@/types/consultation"
import type { CreditReservationStatus } from "@/types/credits"
import { getCreditReservationStatusConfig, getCreditDisplay } from "@/constants/credits"
import { currentIntlLocale } from "@/lib/i18n"

export interface MemberQueuePanelProps {
  queueState: CurrentQueueStateResponse | null
  latestRequest: ConsultationRequestItem | null
  loading: boolean
  actionLoading: boolean
  insufficientCredits?: boolean
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
  insufficientCredits,
  onConfirm,
  onCancel,
  onRefresh,
  onOpenSession,
  onRegisterNew,
}: MemberQueuePanelProps) {
  const { t } = useTranslation("consultation")
  const navigate = useNavigate()
  const creditPolicy = queueState?.creditPolicy || latestRequest?.creditPolicy
  const reservationStatus: CreditReservationStatus | null | undefined =
    queueState?.creditReservationStatus || latestRequest?.creditReservationStatus
  const reservationConfig = reservationStatus ? getCreditReservationStatusConfig(reservationStatus) : null
  const creditDisplay = getCreditDisplay({
    creditPolicy,
    creditReservationStatus: reservationStatus,
  })

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
        <div className="bg-success-500/10 border-b border-success-500/20 p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-success-500/20 text-success-600 flex items-center justify-center shrink-0">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <Badge className="bg-success-500 hover:bg-success-600 text-white mb-1.5">{t("queuePanel.activeSession.badge")}</Badge>
            <h2 className="text-xl font-bold text-foreground">{t("queuePanel.activeSession.title")}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("queuePanel.activeSession.activated", { id: queueState.sessionId })}
            </p>
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          <div className="bg-muted/30 border rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">{t("queuePanel.activeSession.sessionCode")}</span>
              <span className="font-mono font-bold text-foreground">#{queueState.sessionId}</span>
            </div>
            {queueState.sessionStartedAt && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">{t("queuePanel.activeSession.startTime")}</span>
                <span className="font-medium text-foreground">
                  {new Date(queueState.sessionStartedAt).toLocaleTimeString(currentIntlLocale(), {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            {queueState.sessionEndsAt && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">{t("queuePanel.activeSession.blockEndTime")}</span>
                <span className="font-medium text-foreground">
                  {new Date(queueState.sessionEndsAt).toLocaleTimeString(currentIntlLocale(), {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            {reservationStatus && reservationConfig && (
              <div className="flex justify-between items-center text-xs pt-1 border-t">
                <span className="text-muted-foreground">{t("queuePanel.activeSession.reservationStatus")}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-semibold border ${reservationConfig.className}`}>
                  {reservationConfig.label}
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
            {t("queuePanel.activeSession.enterRoom")}
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
                {t("queuePanel.confirmation.badge")}
              </Badge>
              <h2 className="text-xl font-bold text-foreground">{t("queuePanel.confirmation.title")}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("queuePanel.confirmation.subtitle")}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] font-medium text-muted-foreground block">{t("queuePanel.confirmation.timeLeft")}</span>
            <div className="flex items-center gap-1 font-mono font-bold text-lg text-primary">
              <Clock className="w-4 h-4" />
              <span>{confirmTimerFormatted}</span>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-muted/20 border space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("queuePanel.confirmation.yourNumber")}</span>
              <span className="font-mono font-bold text-base text-primary">
                #{String(queueState.queueNumber).padStart(3, "0")}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("queuePanel.confirmation.status")}</span>
              <span className="font-semibold text-success-600">{t("queuePanel.confirmation.doctorAccepted")}</span>
            </div>
            {creditDisplay && (
              <div className="flex items-center justify-between text-sm pt-2 border-t">
                <span className="text-muted-foreground">{t("queuePanel.confirmation.creditInfo")}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border bg-primary/5 text-primary border-primary/20">
                  {creditDisplay}
                </span>
              </div>
            )}
          </div>

          {insufficientCredits && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-warning-500/10 border border-warning-500/30 rounded-2xl gap-3 text-warning-950">
              <div className="flex items-start sm:items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-warning-600 shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <p className="font-semibold text-sm text-foreground">{t("queuePanel.confirmation.insufficientTitle")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("queuePanel.confirmation.insufficientDescription")}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                className="shrink-0 bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-xl gap-1.5 shadow-xs"
                onClick={() => navigate("/app/general/consultations?tab=credits")}
              >
                <Coins className="w-3.5 h-3.5" />
                {t("queuePanel.confirmation.buyCredits")}
              </Button>
            </div>
          )}

          {isConfirmExpired ? (
            <div className="p-3 bg-danger-50 border border-danger-200 rounded-xl text-xs text-danger-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-danger-600" />
              <span>
                {t("queuePanel.confirmation.expired")}
              </span>
            </div>
          ) : (
            <div className="p-3 bg-primary-50 border border-primary-200 rounded-xl text-xs text-primary-800 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary-600" />
              <span>
                {creditPolicy === "PER_SESSION_CONFIRM_V2"
                  ? t("queuePanel.confirmation.hintPerSession")
                  : t("queuePanel.confirmation.hintDefault")}
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
            {actionLoading ? t("queuePanel.confirmation.creatingSession") : t("queuePanel.confirmation.join")}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-12 rounded-xl text-muted-foreground hover:text-danger-600 hover:border-danger-200"
            disabled={actionLoading}
            onClick={() => {
              if (window.confirm(t("queuePanel.confirmation.cancelConfirm"))) {
                onCancel(queueState.requestId)
              }
            }}
          >
            <XCircle className="w-4 h-4 mr-1.5" />
            {t("queuePanel.confirmation.cancel")}
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
                <CardTitle className="text-lg font-bold">{t("queuePanel.queue.title")}</CardTitle>
                <CardDescription className="text-xs">
                  {isOfferingDoctor
                    ? t("queuePanel.queue.connecting")
                    : t("queuePanel.queue.inQueue")}
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
              {t("queuePanel.queue.refresh")}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Main Queue Callout */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-primary/5 border border-primary/20 gap-4 text-center sm:text-left">
            <div>
              <span className="text-xs font-medium text-muted-foreground block uppercase tracking-wider">
                {t("queuePanel.queue.yourNumber")}
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold text-primary font-mono tracking-tight">
                #{String(queueState.queueNumber).padStart(3, "0")}
              </span>
              <span className="text-xs text-muted-foreground block mt-1">
                {t("queuePanel.queue.queueDate", { date: queueState.queueDate })}
              </span>
            </div>

            <div className="flex flex-col items-center sm:items-end gap-1.5">
              <div className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-end">
                <Badge variant="outline" className="px-3 py-1 text-xs font-semibold bg-background">
                  {isOfferingDoctor ? t("queuePanel.queue.connectingDoctor") : t("queuePanel.queue.waitingTurn")}
                </Badge>
                {creditDisplay && (
                  <Badge variant="outline" className="px-2.5 py-1 text-xs font-semibold bg-primary/5 text-primary border-primary/20">
                    {creditDisplay}
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium text-foreground">
                <Trans
                  t={t}
                  i18nKey="queuePanel.queue.peopleAhead"
                  count={queueState.peopleAhead}
                  components={{ strong: <strong className="text-primary font-bold text-base" /> }}
                />
              </p>
            </div>
          </div>

          {/* Neutral connecting message when OFFERING_DOCTOR */}
          {isOfferingDoctor && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-warning-500/10 border border-warning-500/20 text-warning-900 text-xs">
              <div className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-warning-500"></span>
              </div>
              <p className="font-medium">
                {t("queuePanel.queue.connectingNotice")}
              </p>
            </div>
          )}

          {/* Zero Available Doctors Notice (Rule 4) */}
          {!isOfferingDoctor && hasZeroDoctors && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">{t("queuePanel.queue.noDoctorsTitle")}</p>
                <p className="mt-0.5">
                  {t("queuePanel.queue.noDoctorsDescription")}
                </p>
              </div>
            </div>
          )}

          {/* Realtime Doctor Statistics */}
          <div className="border rounded-xl p-4 bg-muted/10 space-y-2">
            <span className="text-xs font-semibold text-foreground block mb-2">{t("queuePanel.queue.doctorStats")}</span>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-background border">
                <span className="text-[11px] text-muted-foreground block">{t("queuePanel.queue.onDuty")}</span>
                <span className="text-base font-bold text-foreground font-mono">{queueState.doctorsOnDuty}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-background border">
                <span className="text-[11px] text-muted-foreground block">{t("queuePanel.queue.available")}</span>
                <span className="text-base font-bold text-success-600 font-mono">{queueState.availableDoctors}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-background border">
                <span className="text-[11px] text-muted-foreground block">{t("queuePanel.queue.busy")}</span>
                <span className="text-base font-bold text-warning-600 font-mono">{queueState.busyDoctors}</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t bg-muted/5 p-4 px-6 flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {t("queuePanel.queue.cancelHint")}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-muted-foreground hover:text-danger-600 hover:border-danger-200"
            disabled={actionLoading}
            onClick={() => {
              if (window.confirm(t("queuePanel.queue.leaveConfirm"))) {
                onCancel(queueState.requestId)
              }
            }}
          >
            <XCircle className="w-3.5 h-3.5 mr-1" />
            {t("queuePanel.queue.leave")}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // 4. Fallback / Terminal states from History (TIMED_OUT or CANCELLED)
  if (latestRequest?.status === "TIMED_OUT") {
    return (
      <Card className="shadow-sm border border-warning-200 bg-warning-50/50 rounded-2xl overflow-hidden max-w-xl mx-auto p-6 text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-full bg-warning-100 text-warning-600 flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">{t("queuePanel.timedOut.title")}</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {t("queuePanel.timedOut.description")}
          </p>
          {reservationStatus && reservationConfig && (
            <div className="pt-1">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${reservationConfig.className}`}>
                {reservationConfig.label}
              </span>
            </div>
          )}
        </div>
        <div className="pt-2">
          <Button onClick={onRegisterNew} className="rounded-xl font-semibold shadow-sm">
            {t("queuePanel.registerNew")}
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
          <h3 className="text-lg font-bold text-foreground">{t("queuePanel.cancelled.title")}</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {t("queuePanel.cancelled.description")}
          </p>
          {reservationStatus && reservationConfig && (
            <div className="pt-1">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${reservationConfig.className}`}>
                {reservationConfig.label}
              </span>
            </div>
          )}
        </div>
        <div className="pt-2">
          <Button onClick={onRegisterNew} className="rounded-xl font-semibold shadow-sm">
            {t("queuePanel.registerNew")}
          </Button>
        </div>
      </Card>
    )
  }

  // 5. Default: No Active Request
  return (
    <Card className="shadow-sm border border-dashed rounded-2xl max-w-xl mx-auto p-6 text-center space-y-4">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
        <Stethoscope className="w-7 h-7" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-foreground">{t("queuePanel.empty.title")}</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          {t("queuePanel.empty.description")}
        </p>
      </div>
      <div className="pt-2">
        <Button onClick={onRegisterNew} size="lg" className="rounded-xl font-semibold shadow-sm">
          {t("queuePanel.empty.register")}
        </Button>
      </div>
    </Card>
  )
}

import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { AlertCircle, CheckCircle2, Clock, Loader2, Sparkles, User, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { DoctorConsultationOfferResponse } from "@/types/consultation"

interface DoctorOfferCardProps {
  offer: DoctorConsultationOfferResponse
  actionLoading: boolean
  onAccept: (offerId: string) => Promise<void>
  onReject: (offerId: string) => Promise<void>
  onOfferExpired: () => void
}

export function DoctorOfferCard({
  offer,
  actionLoading,
  onAccept,
  onReject,
  onOfferExpired,
}: DoctorOfferCardProps) {
  const { t } = useTranslation("management")
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null)

  // Derive countdown strictly from offer.doctorOfferExpiresAt
  useEffect(() => {
    if (!offer.doctorOfferExpiresAt) {
      setSecondsRemaining(null)
      return
    }

    const calcRemaining = () => {
      const target = new Date(offer.doctorOfferExpiresAt).getTime()
      const now = Date.now()
      const diff = Math.max(0, Math.floor((target - now) / 1000))
      return diff
    }

    setSecondsRemaining(calcRemaining())

    const timer = setInterval(() => {
      const remaining = calcRemaining()
      setSecondsRemaining(remaining)
      if (remaining <= 0) {
        clearInterval(timer)
        onOfferExpired()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [offer.doctorOfferExpiresAt, onOfferExpired])

  const intake = offer.minimalMemberIntakeContext
  const isOffered = offer.state === "OFFERED_TO_DOCTOR"
  const isWaitingMember = offer.state === "WAITING_MEMBER_CONFIRMATION"

  return (
    <Card className="border-2 border-primary/40 bg-gradient-to-b from-primary/5 via-card to-card shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-success-500 animate-ping" />
            <CardTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {isWaitingMember ? t("doctorConsultations.offerCard.titleWaiting") : t("doctorConsultations.offerCard.titleOffered")}
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            {isOffered && secondsRemaining !== null && (
              <Badge
                variant="outline"
                className={`font-mono text-xs px-2.5 py-1 ${
                  secondsRemaining <= 10
                    ? "border-danger-500 bg-danger-50 text-danger-700 animate-pulse font-bold"
                    : "border-primary/50 bg-primary/10 text-primary"
                }`}
              >
                <Clock className="w-3.5 h-3.5 mr-1" />
                {t("doctorConsultations.offerCard.countdown", { seconds: secondsRemaining })}
              </Badge>
            )}

            {isWaitingMember && (
              <Badge variant="outline" className="border-warning-400 bg-warning-50 text-warning-800 font-medium">
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                {t("doctorConsultations.offerCard.acceptedWaiting")}
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="text-xs">
          {t("doctorConsultations.offerCard.offerCode")} <span className="font-mono text-foreground font-semibold">{offer.offerId}</span> •{" "}
          {t("doctorConsultations.offerCard.requestNumber", { id: offer.requestId })}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 pb-4 space-y-4">
        {/* Member Intake Information */}
        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <User className="w-4 h-4 text-primary" />
            <span>{t("doctorConsultations.offerCard.intakeTitle")}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-background p-3 border border-border/80">
              <span className="text-xs text-muted-foreground block font-medium mb-1">
                {t("doctorConsultations.offerCard.reasonForCare")}
              </span>
              <p className="font-medium text-foreground whitespace-pre-line">
                {intake?.reasonForCare || t("doctorConsultations.offerCard.notProvided")}
              </p>
            </div>

            <div className="rounded-lg bg-background p-3 border border-border/80">
              <span className="text-xs text-muted-foreground block font-medium mb-1">
                {t("doctorConsultations.offerCard.currentConcern")}
              </span>
              <p className="font-medium text-foreground whitespace-pre-line">
                {intake?.currentConcern || t("doctorConsultations.offerCard.notProvided")}
              </p>
            </div>
          </div>

          {intake?.careGoal && (
            <div className="text-xs text-muted-foreground pt-1">
              <span className="font-medium text-foreground">{t("doctorConsultations.offerCard.careGoal")}</span>
              {intake.careGoal}
            </div>
          )}

          {intake?.relevantSelfReportedContext && (
            <div className="text-xs text-muted-foreground pt-1">
              <span className="font-medium text-foreground">{t("doctorConsultations.offerCard.selfReportedContext")}</span>
              {intake.relevantSelfReportedContext}
            </div>
          )}
        </div>

        {isWaitingMember && (
          <div className="rounded-lg bg-warning-50 border border-warning-200 p-3.5 flex items-start gap-2.5 text-xs text-warning-900">
            <AlertCircle className="w-4 h-4 text-warning-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">{t("doctorConsultations.offerCard.acceptedNotice")}</p>
              <p className="text-warning-700">
                {t("doctorConsultations.offerCard.acceptedNoticeDetail")}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 pb-4 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-border/60 bg-muted/10">
        {isOffered ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReject(offer.offerId)}
              disabled={actionLoading || (secondsRemaining !== null && secondsRemaining <= 0)}
              className="w-full sm:w-auto text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
            >
              <XCircle className="w-4 h-4 mr-1.5" />
              {t("doctorConsultations.offerCard.reject")}
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => onAccept(offer.offerId)}
              disabled={actionLoading || (secondsRemaining !== null && secondsRemaining <= 0)}
              className="w-full sm:w-auto bg-success-600 hover:bg-success-700 text-white font-medium shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              {actionLoading ? t("doctorConsultations.offerCard.accepting") : t("doctorConsultations.offerCard.accept")}
            </Button>
          </>
        ) : (
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 py-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            {t("doctorConsultations.offerCard.waitingConfirmation")}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

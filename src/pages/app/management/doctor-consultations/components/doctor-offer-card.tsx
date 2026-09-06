import { useEffect, useState } from "react"
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
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
            <CardTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {isWaitingMember ? "Đang chờ bệnh nhân xác nhận" : "Lời mời nhận ca tư vấn mới!"}
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            {isOffered && secondsRemaining !== null && (
              <Badge
                variant="outline"
                className={`font-mono text-xs px-2.5 py-1 ${
                  secondsRemaining <= 10
                    ? "border-red-500 bg-red-50 text-red-700 animate-pulse font-bold"
                    : "border-primary/50 bg-primary/10 text-primary"
                }`}
              >
                <Clock className="w-3.5 h-3.5 mr-1" />
                Còn {secondsRemaining}s để tiếp nhận
              </Badge>
            )}

            {isWaitingMember && (
              <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-800 font-medium">
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                Đã tiếp nhận - Chờ bệnh nhân
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="text-xs">
          Mã lời mời: <span className="font-mono text-foreground font-semibold">{offer.offerId}</span> • Yêu cầu #{offer.requestId}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 pb-4 space-y-4">
        {/* Member Intake Information */}
        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <User className="w-4 h-4 text-primary" />
            <span>Thông tin sơ bộ từ người bệnh:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-background p-3 border border-border/80">
              <span className="text-xs text-muted-foreground block font-medium mb-1">
                Lý do cần tư vấn (Reason for Care):
              </span>
              <p className="font-medium text-foreground whitespace-pre-line">
                {intake?.reasonForCare || "Chưa cung cấp"}
              </p>
            </div>

            <div className="rounded-lg bg-background p-3 border border-border/80">
              <span className="text-xs text-muted-foreground block font-medium mb-1">
                Vấn đề sức khỏe chính (Current Concern):
              </span>
              <p className="font-medium text-foreground whitespace-pre-line">
                {intake?.currentConcern || "Chưa cung cấp"}
              </p>
            </div>
          </div>

          {intake?.careGoal && (
            <div className="text-xs text-muted-foreground pt-1">
              <span className="font-medium text-foreground">Mục tiêu chăm sóc: </span>
              {intake.careGoal}
            </div>
          )}

          {intake?.relevantSelfReportedContext && (
            <div className="text-xs text-muted-foreground pt-1">
              <span className="font-medium text-foreground">Bối cảnh tự báo cáo: </span>
              {intake.relevantSelfReportedContext}
            </div>
          )}
        </div>

        {isWaitingMember && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">Bạn đã chấp nhận ca tư vấn này.</p>
              <p className="text-amber-700">
                Hệ thống đang chờ bệnh nhân bấm xác nhận bắt đầu phiên tư vấn. Khi hoàn tất, phiên chat sẽ tự động kích hoạt.
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
              Từ chối nhận ca
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => onAccept(offer.offerId)}
              disabled={actionLoading || (secondsRemaining !== null && secondsRemaining <= 0)}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              {actionLoading ? "Đang tiếp nhận..." : "Tiếp nhận ca tư vấn"}
            </Button>
          </>
        ) : (
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 py-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            Đang chờ bệnh nhân xác nhận...
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

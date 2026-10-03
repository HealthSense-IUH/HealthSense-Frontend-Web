import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Clock, PauseCircle, PlayCircle, Power, Sparkles, AlertCircle, RefreshCw, Calendar } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import type { DoctorDispatchStatusResponse } from "@/types/consultation"

interface DoctorDispatchHeaderProps {
  dispatchStatus: DoctorDispatchStatusResponse | null
  loading: boolean
  actionLoading: boolean
  hasProfile: boolean
  profileLoading: boolean
  onToggleStatus: (newStatus: "AVAILABLE" | "UNAVAILABLE") => Promise<void>
  onToggleStopAfterCurrentSession: (stop: boolean) => Promise<void>
  onRetryProfile?: () => void
  onOpenScheduleDialog?: () => void
}

export function DoctorDispatchHeader({
  dispatchStatus,
  loading,
  actionLoading,
  hasProfile,
  profileLoading,
  onToggleStatus,
  onToggleStopAfterCurrentSession,
  onRetryProfile,
  onOpenScheduleDialog,
}: DoctorDispatchHeaderProps) {
  const { t } = useTranslation("management")
  const [prefLoading, setPrefLoading] = useState(false)

  const isBusy = dispatchStatus?.dispatchStatus === "BUSY"
  const isAvailable = dispatchStatus?.dispatchStatus === "AVAILABLE"
  const isUnavailable = dispatchStatus?.dispatchStatus === "UNAVAILABLE"
  const effectivelyDispatchable = dispatchStatus?.effectivelyDispatchable ?? false
  const stopAfterCurrentSession = dispatchStatus?.stopAfterCurrentSession ?? false

  const handleStatusChange = async () => {
    if (isBusy || actionLoading) return
    const nextStatus = isAvailable ? "UNAVAILABLE" : "AVAILABLE"
    await onToggleStatus(nextStatus)
  }

  const handlePrefChange = async (checked: boolean) => {
    try {
      setPrefLoading(true)
      await onToggleStopAfterCurrentSession(checked)
    } finally {
      setPrefLoading(false)
    }
  }

  return (
    <Card className="border-border bg-gradient-to-r from-card via-card to-muted/30 shadow-sm">
      <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
        {/* Missing Care Profile Alert Banner */}
        {!hasProfile && !profileLoading && (
          <div className="p-3.5 bg-warning-500/10 border border-warning-300 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-warning-800 text-xs">
            <div className="flex items-start sm:items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-warning-600 mt-0.5 sm:mt-0" />
              <span>
                <strong>{t("doctorConsultations.dispatchHeader.missingProfile.title")}</strong> {t("doctorConsultations.dispatchHeader.missingProfile.description")}
              </span>
            </div>
            {onRetryProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetryProfile}
                disabled={profileLoading}
                className="h-7 text-xs border-warning-300 hover:bg-warning-100 text-warning-900 shrink-0 font-medium cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${profileLoading ? "animate-spin" : ""}`} />
                <span>{t("doctorConsultations.dispatchHeader.missingProfile.retry")}</span>
              </Button>
            )}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Indicator & Title */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
                isBusy
                  ? "bg-warning-500/10 border-warning-300 text-warning-600"
                  : isAvailable
                  ? "bg-success-500/10 border-success-300 text-success-600"
                  : "bg-muted border-border text-muted-foreground"
              }`}
            >
              {isBusy ? (
                <Clock className="h-6 w-6 animate-pulse" />
              ) : isAvailable ? (
                <PlayCircle className="h-6 w-6" />
              ) : (
                <PauseCircle className="h-6 w-6" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  {t("doctorConsultations.dispatchHeader.title")}
                </h2>
                {isBusy && (
                  <Badge className="bg-warning-500 hover:bg-warning-600 text-white font-medium border-none shadow-sm">
                    {t("doctorConsultations.dispatchHeader.badges.busy")}
                  </Badge>
                )}
                {isAvailable && effectivelyDispatchable && (
                  <Badge className="bg-success-600 hover:bg-success-700 text-white font-medium border-none shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {t("doctorConsultations.dispatchHeader.badges.available")}
                  </Badge>
                )}
                {isAvailable && !effectivelyDispatchable && (
                  <Badge variant="outline" className="border-warning-300 bg-warning-50 text-warning-800 font-medium">
                    {t("doctorConsultations.dispatchHeader.badges.distributing")}
                  </Badge>
                )}
                {isUnavailable && (
                  <Badge variant="secondary" className="bg-muted text-muted-foreground font-medium">
                    {t("doctorConsultations.dispatchHeader.badges.unavailable")}
                  </Badge>
                )}
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground">
                {!hasProfile
                  ? t("doctorConsultations.dispatchHeader.hints.noProfile")
                  : isBusy
                  ? t("doctorConsultations.dispatchHeader.hints.busy")
                  : isAvailable && effectivelyDispatchable
                  ? t("doctorConsultations.dispatchHeader.hints.available")
                  : isAvailable && !effectivelyDispatchable
                  ? t("doctorConsultations.dispatchHeader.hints.pendingOffer")
                  : t("doctorConsultations.dispatchHeader.hints.unavailable")}
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
            {/* Self Schedule Button */}
            {onOpenScheduleDialog && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenScheduleDialog}
                className="text-xs font-medium shadow-xs border-border hover:bg-muted cursor-pointer"
              >
                <Calendar className="mr-1.5 h-3.5 w-3.5 text-primary-600" />
                <span>{t("doctorConsultations.dispatchHeader.workSchedule")}</span>
              </Button>
            )}

            {/* Stop after current session toggle */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background shadow-xs text-xs">
              <Switch
                id="stop-after"
                checked={stopAfterCurrentSession}
                onCheckedChange={handlePrefChange}
                disabled={!hasProfile || prefLoading || actionLoading || loading}
              />
              <label htmlFor="stop-after" className="cursor-pointer text-muted-foreground font-medium select-none">
                {t("doctorConsultations.dispatchHeader.stopAfterSession")}
              </label>
            </div>

            {/* Toggle Available/Unavailable Button */}
            <Button
              variant={isAvailable ? "outline" : "default"}
              size="sm"
              onClick={handleStatusChange}
              disabled={!hasProfile || isBusy || actionLoading || loading}
              className={`font-medium shadow-xs cursor-pointer ${
                !isAvailable && !isBusy && hasProfile ? "bg-success-600 hover:bg-success-700 text-white" : ""
              }`}
            >
              <Power className="mr-1.5 h-4 w-4" />
              {isBusy
                ? t("doctorConsultations.dispatchHeader.actions.inSession")
                : isAvailable
                  ? t("doctorConsultations.dispatchHeader.actions.pause")
                  : t("doctorConsultations.dispatchHeader.actions.start")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

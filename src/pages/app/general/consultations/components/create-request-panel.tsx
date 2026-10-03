import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Trans, useTranslation } from "react-i18next"
import { Send, Activity, AlertCircle, Coins, Stethoscope, ChevronRight, CheckCircle2, Clock, Users, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type { HealthRecordItem, CareServicePackage, ConsultationQueueStatisticsResponse } from "@/types/consultation"
import { formatDate } from "./shared"

export interface RequestFormData {
  packageId?: string
  reasonForCare: string
  currentConcern: string
  careGoal: string
  memberNote: string
  relevantSelfReportedContext: string
  selectedHealthRecordIds: string[]
  preferredDoctorId?: string
  // legacy fallback
  healthRecordId?: string
  reason?: string
}

export function CreateRequestPanel({
  form,
  healthRecords,
  availableCredits,
  hasActiveQueue,
  loading,
  insufficientCredits,
  queueStatistics,
  onChange,
  onSubmit,
  onPendingConflict,
  onCancel,
}: {
  form: RequestFormData
  healthRecords: HealthRecordItem[]
  packages?: CareServicePackage[]
  availableCredits?: number
  hasActiveQueue?: boolean
  loading: boolean
  insufficientCredits?: boolean
  queueStatistics?: ConsultationQueueStatisticsResponse | null
  onChange: (form: RequestFormData) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onPendingConflict?: () => void
  onCancel?: () => void
}) {
  const { t } = useTranslation("consultation")
  const navigate = useNavigate()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const latestRecord = healthRecords.length > 0 ? healthRecords[0] : null
  const hasNoRecords = healthRecords.length === 0
  const isZeroCredits = availableCredits !== undefined && availableCredits <= 0
  const hasInsufficientCredits = Boolean(insufficientCredits || isZeroCredits)

  const isValid =
    !!form.reasonForCare.trim() &&
    !!form.currentConcern.trim() &&
    !hasNoRecords &&
    !hasInsufficientCredits &&
    !hasActiveQueue

  const handleOpenConfirm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (hasActiveQueue) {
      if (onPendingConflict) {
        onPendingConflict()
      }
      return
    }
    if (!isValid) return
    setIsConfirmOpen(true)
  }

  const handleConfirmSubmit = () => {
    setIsConfirmOpen(false)
    const syntheticEvent = {
      preventDefault: () => {},
    } as unknown as FormEvent<HTMLFormElement>
    onSubmit(syntheticEvent)
  }

  return (
    <>
      <Card className="shadow-sm border rounded-2xl max-w-2xl mx-auto">
        <CardHeader className="border-b bg-muted/10 pb-4 flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">{t("createRequestPanel.title")}</CardTitle>
              <CardDescription>
                {t("createRequestPanel.description")}
              </CardDescription>
            </div>
          </div>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="gap-1.5 text-xs rounded-xl shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> {t("createRequestPanel.back")}
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <form className="flex flex-col gap-6" onSubmit={handleOpenConfirm}>
            {hasActiveQueue && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-warning-500/10 border border-warning-500/30 rounded-2xl gap-3 text-warning-950">
                <div className="flex items-start sm:items-center gap-2.5">
                  <Clock className="w-5 h-5 text-warning-600 shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">{t("createRequestPanel.activeQueue.title")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("createRequestPanel.activeQueue.description")}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="shrink-0 bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-xl gap-1.5 shadow-xs cursor-pointer"
                  onClick={() => navigate("/app/general/consultations?tab=queue")}
                >
                  <Users className="w-3.5 h-3.5" />
                  {t("createRequestPanel.activeQueue.viewQueue")}
                </Button>
              </div>
            )}

            {hasInsufficientCredits && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-warning-500/10 border border-warning-500/30 rounded-2xl gap-3 text-warning-950">
                <div className="flex items-start sm:items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-warning-600 shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">{t("createRequestPanel.insufficient.title")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <Trans
                        t={t}
                        i18nKey="createRequestPanel.insufficient.description"
                        count={availableCredits ?? 0}
                        components={{ strong: <span className="font-bold text-foreground" /> }}
                      />
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="shrink-0 bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-xl gap-1.5 shadow-xs cursor-pointer"
                  onClick={() => navigate("/app/general/consultations?tab=credits")}
                >
                  <Coins className="w-3.5 h-3.5" />
                  {t("createRequestPanel.insufficient.buyCredits")}
                </Button>
              </div>
            )}

            {/* Section 2: Health Records (Auto Latest or Warning) */}
            <div className="space-y-3 border-t pt-5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-primary" />
                  {t("createRequestPanel.records.label")}
                </Label>
              </div>

              {hasNoRecords ? (
                <div className="p-4 bg-danger-500/10 border border-danger-500/30 rounded-xl space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-danger-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-foreground">{t("createRequestPanel.records.emptyTitle")}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {t("createRequestPanel.records.emptyDescription")}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto h-9 text-xs font-medium border-danger-300 hover:bg-danger-100 gap-1.5 cursor-pointer"
                    onClick={() => navigate("/app/general/dashboard")}
                  >
                    <span>{t("createRequestPanel.records.goToDashboard")}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        #{latestRecord?.id} {latestRecord?.originalFileName ? `- ${latestRecord.originalFileName}` : ""}
                      </span>
                      {latestRecord?.predictionLabel && (
                        <Badge
                          variant="outline"
                          className="text-[11px] py-0.5 px-2 bg-background font-medium border-primary/40 text-primary"
                        >
                          {latestRecord.predictionLabel}
                        </Badge>
                      )}
                    </div>
                    <Badge className="bg-success-600/15 text-success-700 border-0 text-[11px] font-semibold flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      {t("createRequestPanel.records.autoAttached")}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-primary/10">
                    <span>{t("createRequestPanel.records.measuredAt", { time: formatDate(latestRecord?.createdAt) })}</span>
                    <span className="italic">{t("createRequestPanel.records.shareNotice")}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: V3 Clinical Intake Details */}
            <div className="space-y-4 border-t pt-5">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reasonForCare" className="text-sm font-semibold">
                    {t("createRequestPanel.form.reasonLabel")} <span className="text-danger-500">*</span>
                  </Label>
                  <Input
                    id="reasonForCare"
                    required
                    placeholder={t("createRequestPanel.form.reasonPlaceholder")}
                    value={form.reasonForCare}
                    onChange={(e) => onChange({ ...form, reasonForCare: e.target.value, reason: e.target.value })}
                    className="rounded-xl h-11"
                    maxLength={1000}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentConcern" className="text-sm font-semibold">
                    {t("createRequestPanel.form.concernLabel")} <span className="text-danger-500">*</span>
                  </Label>
                  <Textarea
                    id="currentConcern"
                    required
                    rows={3}
                    placeholder={t("createRequestPanel.form.concernPlaceholder")}
                    value={form.currentConcern}
                    onChange={(e) => onChange({ ...form, currentConcern: e.target.value })}
                    className="rounded-xl resize-none"
                    maxLength={2000}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start sm:items-center gap-2.5 p-3.5 bg-primary/5 border border-primary/20 rounded-xl text-xs text-muted-foreground">
              <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5 sm:mt-0" />
              <span>
                {queueStatistics?.creditPolicy === "PER_SESSION_CONFIRM_V2"
                  ? t("createRequestPanel.policy.perSessionConfirm", { count: queueStatistics.creditCost ?? 1 })
                  : queueStatistics?.creditPolicy === "PER_SESSION_V1"
                  ? t("createRequestPanel.policy.perSession", { count: queueStatistics.creditCost ?? 1 })
                  : queueStatistics?.creditPolicy === "FREE_EXISTING" || queueStatistics?.creditPolicy === "FREE_DISABLED"
                  ? t("createRequestPanel.policy.free")
                  : t("createRequestPanel.policy.default")}
              </span>
            </div>

            <Button
              type="submit"
              disabled={loading || !isValid}
              className="w-full h-11 rounded-xl text-base font-semibold gap-2 shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {loading ? t("createRequestPanel.submitting") : t("createRequestPanel.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog before entering queue */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="w-5 h-5 text-primary" />
              {t("createRequestPanel.confirmDialog.title")}
            </DialogTitle>
            <DialogDescription>
              {t("createRequestPanel.confirmDialog.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="text-muted-foreground shrink-0">{t("createRequestPanel.confirmDialog.reason")}</span>
                <span className="font-semibold text-foreground text-right line-clamp-2">{form.reasonForCare}</span>
              </div>
              {latestRecord && (
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
                  <span className="text-muted-foreground shrink-0">{t("createRequestPanel.confirmDialog.attachedEcg")}</span>
                  <span className="font-medium text-foreground">
                    #{latestRecord.id} {latestRecord.predictionLabel ? `[${latestRecord.predictionLabel}]` : ""}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-border/50">
                <span className="text-muted-foreground">{t("createRequestPanel.confirmDialog.availableCredits")}</span>
                <span className="font-bold text-success-600">
                  {t("createRequestPanel.creditsCount", { count: availableCredits !== undefined ? availableCredits : 1 })}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3.5 bg-primary-500/10 border border-primary-500/20 rounded-xl text-xs text-primary-950">
              <AlertCircle className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <Trans t={t} i18nKey="createRequestPanel.confirmDialog.minimumCredits" components={{ strong: <strong /> }} />
                <br />
                <Trans
                  t={t}
                  i18nKey="createRequestPanel.confirmDialog.deductionRule"
                  components={{ label: <span className="font-medium text-foreground" />, strong: <strong /> }}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={loading}
              className="cursor-pointer"
            >
              {t("createRequestPanel.confirmDialog.review")}
            </Button>
            <Button
              type="button"
              disabled={loading}
              className="font-semibold gap-1.5 cursor-pointer"
              onClick={handleConfirmSubmit}
            >
              <Send className="w-4 h-4" />
              {loading ? t("createRequestPanel.confirmDialog.sending") : t("createRequestPanel.confirmDialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

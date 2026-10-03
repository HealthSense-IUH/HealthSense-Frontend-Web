import { useEffect, useState, useRef } from "react"
import { useTranslation } from "react-i18next"
import { AlertCircle, CheckCircle2, Save, Info, PlusCircle, FileText, Activity, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import i18n from "@/lib/i18n"
import { consultationApi } from "@/services"
import type {
  ConsultationFinalSummaryResponse,
  ConsultationStatus,
  DoctorScopedHealthRecordResponse,
  DoctorDispatchStatusResponse,
  FinalSummaryClosureStatus,
  ConsultationFlowType,
} from "@/types/consultation"
import { formatDate, canEditFinalSummaryDraft, canFinalizeFinalSummary } from "./shared"

interface DoctorFinalSummaryTabProps {
  sessionId: string | number
  sessionStatus: ConsultationStatus
  meaningfulCareOccurred?: boolean | null
  flowType?: ConsultationFlowType | null
  summaryDueAt?: string | null
  summaryClosureStatus?: FinalSummaryClosureStatus | null
  onFinalized?: () => void
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00"
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string }
  if (err.response?.status === 403) return i18n.t("consultation:finalSummaryTab.errors.forbidden")
  return err.response?.data?.message || err.message || fallback
}

export function DoctorFinalSummaryTab({
  sessionId,
  sessionStatus,
  meaningfulCareOccurred,
  flowType,
  summaryDueAt,
  summaryClosureStatus,
  onFinalized,
}: DoctorFinalSummaryTabProps) {
  const [summary, setSummary] = useState<ConsultationFinalSummaryResponse | null>(null)
  const [scopedRecords, setScopedRecords] = useState<DoctorScopedHealthRecordResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now())
  const [latestDispatchStatus, setLatestDispatchStatus] = useState<DoctorDispatchStatusResponse | null>(null)
  
  // Draft form state
  const [summaryText, setSummaryText] = useState("")
  const [observations, setObservations] = useState("")
  const [recommendations, setRecommendations] = useState("")
  const [followUpRecommendation, setFollowUpRecommendation] = useState("")
  const [selectedRecordIds, setSelectedRecordIds] = useState<(string | number)[]>([])

  // Finalize confirmation
  const [confirmFinalizeOpen, setConfirmFinalizeOpen] = useState(false)

  // Addendum dialog state
  const [addendumOpen, setAddendumOpen] = useState(false)
  const [addendumReason, setAddendumReason] = useState("")
  const [addendumContent, setAddendumContent] = useState("")
  const [addingAddendum, setAddingAddendum] = useState(false)

  const { toast } = useToast()
  const { t } = useTranslation("consultation")

  const fetchSummary = () => {
    setLoading(true)
    setErrorMsg(null)

    Promise.allSettled([
      consultationApi.getDoctorFinalSummary(sessionId),
      consultationApi.getDoctorScopedRecords(sessionId, { page: 1, size: 50 }),
    ])
      .then(([summaryRes, recordsRes]) => {
        if (recordsRes.status === "fulfilled") {
          setScopedRecords(recordsRes.value.data.content || [])
        }

        if (summaryRes.status === "fulfilled") {
          const data = summaryRes.value.data
          setSummary(data)
          setSummaryText(data.summary || "")
          setObservations(data.observations || "")
          setRecommendations(data.recommendations || "")
          setFollowUpRecommendation(data.followUpRecommendation || "")
          if (data.referencedHealthRecordIds && Array.isArray(data.referencedHealthRecordIds)) {
            setSelectedRecordIds(data.referencedHealthRecordIds)
          }
        } else {
          const err = summaryRes.reason
          const is404 = err?.response?.status === 404 || err?.response?.data?.code === "ENTITY_NOT_FOUND"
          if (is404) {
            setSummary(null)
            setSummaryText("")
            setObservations("")
            setRecommendations("")
            setFollowUpRecommendation("")
            setSelectedRecordIds([])
          } else {
            setErrorMsg(readError(err, t("finalSummaryTab.errors.loadFailed")))
          }
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchSummary()
  }, [sessionId])

  // Local ticker for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const onFinalizedRef = useRef(onFinalized)
  useEffect(() => {
    onFinalizedRef.current = onFinalized
  }, [onFinalized])

  const summaryDueAtMs = summaryDueAt ? new Date(summaryDueAt).getTime() : 0
  const isSummaryOverdue = summaryClosureStatus === "SUMMARY_OVERDUE" || (summaryDueAtMs > 0 && currentTime >= summaryDueAtMs)
  const hasTriggeredTimeoutRef = useRef(false)

  // Refetch authoritative dispatch status when summary becomes overdue (only once)
  useEffect(() => {
    if (isSummaryOverdue && !summary?.finalizedAt && !hasTriggeredTimeoutRef.current) {
      hasTriggeredTimeoutRef.current = true
      if (flowType === "QUEUE_DISPATCH_V1") {
        consultationApi.getDoctorDispatchStatus()
          .then(res => setLatestDispatchStatus(res.data))
          .catch(() => {})
      }
      onFinalizedRef.current?.()
    }
  }, [isSummaryOverdue, summary?.finalizedAt, flowType])

  const toggleRecordSelection = (recordId: string | number) => {
    setSelectedRecordIds((prev) =>
      prev.some((id) => String(id) === String(recordId))
        ? prev.filter((id) => String(id) !== String(recordId))
        : [...prev, recordId]
    )
  }

  const getValidRecordIds = () => {
    const validScopedSet = new Set(scopedRecords.map((r) => String(r.record?.id)))
    return selectedRecordIds.filter((id) => validScopedSet.has(String(id)))
  }

  const handleSaveDraft = async () => {
    if (!summaryText.trim()) {
      toast({ variant: "destructive", description: t("finalSummaryTab.toast.summaryRequired") })
      return
    }

    setSaving(true)
    const validIds = getValidRecordIds()
    try {
      const payload = {
        summary: summaryText.trim(),
        observations: observations.trim() || null,
        recommendations: recommendations.trim() || null,
        followUpRecommendation: followUpRecommendation.trim() || null,
        referencedHealthRecordIds: validIds.length > 0 ? validIds : null,
      }
      const res = await consultationApi.updateDoctorFinalSummary(sessionId, payload)
      setSummary(res.data)
      toast({ description: t("finalSummaryTab.toast.draftSaved") })
    } catch (error: any) {
      const errCode = error?.response?.data?.code
      if (errCode === 4002 || errCode === "4002") {
        setSelectedRecordIds([])
        toast({
          variant: "destructive",
          title: t("finalSummaryTab.toast.attachedUnavailableTitle"),
          description: t("finalSummaryTab.toast.attachedUnavailableDraft"),
        })
      } else {
        toast({ variant: "destructive", description: readError(error, t("finalSummaryTab.toast.saveDraftFailed")) })
      }
    } finally {
      setSaving(false)
    }
  }

  const handleFinalize = async () => {
    if (!summaryText.trim() || !observations.trim() || !recommendations.trim()) {
      toast({
        variant: "destructive",
        title: t("finalSummaryTab.toast.missingRequiredTitle"),
        description: t("finalSummaryTab.toast.missingRequiredDescription"),
      })
      return
    }

    setFinalizing(true)
    const validIds = getValidRecordIds()
    try {
      // Ensure latest draft is saved before finalization
      await consultationApi.updateDoctorFinalSummary(sessionId, {
        summary: summaryText.trim(),
        observations: observations.trim() || null,
        recommendations: recommendations.trim() || null,
        followUpRecommendation: followUpRecommendation.trim() || null,
        referencedHealthRecordIds: validIds.length > 0 ? validIds : null,
      })

      const res = await consultationApi.finalizeDoctorFinalSummary(sessionId)
      setSummary(res.data)
      setConfirmFinalizeOpen(false)

      if (flowType === "QUEUE_DISPATCH_V1") {
        try {
          const dispatchRes = await consultationApi.getDoctorDispatchStatus()
          setLatestDispatchStatus(dispatchRes.data)
          const status = dispatchRes.data.dispatchStatus
          if (status === "AVAILABLE") {
            toast({ description: t("finalSummaryTab.toast.finalizedAvailable") })
          } else if (status === "UNAVAILABLE") {
            toast({ description: t("finalSummaryTab.toast.finalizedUnavailable") })
          } else {
            toast({ description: t("finalSummaryTab.toast.finalized") })
          }
        } catch {
          toast({ description: t("finalSummaryTab.toast.finalized") })
        }
      } else {
        toast({ description: t("finalSummaryTab.toast.finalized") })
      }

      onFinalized?.()
    } catch (error: any) {
      const errCode = error?.response?.data?.code
      if (errCode === 4002 || errCode === "4002") {
        setSelectedRecordIds([])
        toast({
          variant: "destructive",
          title: t("finalSummaryTab.toast.attachedUnavailableTitle"),
          description: t("finalSummaryTab.toast.attachedUnavailableFinalize"),
        })
      } else {
        toast({ variant: "destructive", description: readError(error, t("finalSummaryTab.toast.finalizeFailed")) })
      }
    } finally {
      setFinalizing(false)
    }
  }

  const handleAddAddendum = async () => {
    if (!addendumReason.trim() || !addendumContent.trim()) {
      toast({
        variant: "destructive",
        title: t("finalSummaryTab.toast.addendumMissingTitle"),
        description: t("finalSummaryTab.toast.addendumMissingDescription"),
      })
      return
    }

    setAddingAddendum(true)
    try {
      await consultationApi.addDoctorFinalSummaryAddendum(sessionId, {
        reason: addendumReason.trim(),
        content: addendumContent.trim(),
      })
      toast({
        title: t("finalSummaryTab.toast.addendumAddedTitle"),
        description: t("finalSummaryTab.toast.addendumAddedDescription"),
      })
      setAddendumReason("")
      setAddendumContent("")
      setAddendumOpen(false)
      fetchSummary()
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("finalSummaryTab.toast.addendumFailedTitle"),
        description: readError(error, t("finalSummaryTab.toast.addendumFailedDescription")),
      })
    } finally {
      setAddingAddendum(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-10 w-32" />
      </div>
    )
  }

  if (errorMsg) {
    return (
      <div className="py-8 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-danger-500 mb-2" />
        <p className="text-danger-700 font-medium">{errorMsg}</p>
        <Button variant="outline" className="mt-4" onClick={fetchSummary}>
          {t("finalSummaryTab.retry")}
        </Button>
      </div>
    )
  }

  const isFinalized = summary?.status === "FINALIZED"
  const isCancelledWithCare = sessionStatus === "CANCELLED" && !!meaningfulCareOccurred
  const isEditable = !isFinalized && canEditFinalSummaryDraft({ status: sessionStatus, meaningfulCareOccurred })
  const canSave = isEditable
  const canFinalize = !isFinalized && canFinalizeFinalSummary({ status: sessionStatus, meaningfulCareOccurred }) && !!summaryText.trim()

  return (
    <div className="py-4 space-y-6">
      {isFinalized && (
        <div className="flex items-center justify-between rounded-lg border border-success-200 bg-success-50 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-success-600 shrink-0" />
            <div>
              <p className="font-medium text-success-900">{t("finalSummaryTab.finalizedBanner.title")}</p>
              <p className="text-xs text-success-700">
                {t("finalSummaryTab.finalizedBanner.finalizedAt", { date: formatDate(summary?.finalizedAt) || "-" })}
              </p>
            </div>
          </div>
          <Badge className="bg-success-600 hover:bg-success-700 shrink-0">FINALIZED</Badge>
        </div>
      )}

      {!isFinalized && flowType === "QUEUE_DISPATCH_V1" && sessionStatus === "COMPLETED" && !isSummaryOverdue && summaryDueAt && (
        <div className="flex items-center justify-between rounded-lg border border-warning-200 bg-warning-50 p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-warning-600 shrink-0" />
            <div>
              <p className="font-medium text-warning-900 text-sm">{t("finalSummaryTab.deadline.title")}</p>
              <p className="text-xs text-warning-700 mt-0.5">
                {t("finalSummaryTab.deadline.description", { count: 10 })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning-200/80 text-warning-900 font-mono text-xs font-bold shrink-0">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatCountdown(summaryDueAtMs - currentTime)}</span>
          </div>
        </div>
      )}

      {!isFinalized && flowType === "QUEUE_DISPATCH_V1" && sessionStatus === "COMPLETED" && isSummaryOverdue && (
        <div className="flex flex-col gap-2 rounded-lg border border-danger-200 bg-danger-50 p-4 text-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-danger-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-danger-900 text-sm">{t("finalSummaryTab.overdue.title", { count: 10 })}</p>
              <p className="text-xs text-danger-700 mt-1">
                {latestDispatchStatus?.dispatchStatus === "UNAVAILABLE"
                  ? t("finalSummaryTab.overdue.unavailable")
                  : latestDispatchStatus?.dispatchStatus === "AVAILABLE"
                    ? t("finalSummaryTab.overdue.available")
                    : latestDispatchStatus?.dispatchStatus === "BUSY"
                      ? t("finalSummaryTab.overdue.busy")
                      : t("finalSummaryTab.overdue.released")}
                {" "}{t("finalSummaryTab.overdue.lateFinalizeHint")}
              </p>
            </div>
          </div>
        </div>
      )}

      {!isFinalized && sessionStatus === "ACTIVE" && (
        <div className="flex items-start gap-2 rounded-md bg-primary-50 p-3 text-xs text-primary-700">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            {t("finalSummaryTab.notices.activeDraft")}
          </p>
        </div>
      )}

      {!isFinalized && isCancelledWithCare && (
        <div className="flex items-start gap-2 rounded-md bg-primary-50 p-3 text-xs text-primary-700">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            {t("finalSummaryTab.notices.cancelledWithCare")}
          </p>
        </div>
      )}

      {!isFinalized && sessionStatus === "CANCELLED" && !meaningfulCareOccurred && (
        <div className="flex items-start gap-2 rounded-md bg-warning-50 p-3 text-xs text-warning-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            {t("finalSummaryTab.notices.cancelledNoCare")}
          </p>
        </div>
      )}
      
      {!isFinalized && (sessionStatus === "SCHEDULED" || sessionStatus === "EXPIRED") && (
        <div className="flex items-start gap-2 rounded-md bg-warning-50 p-3 text-xs text-warning-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            {t("finalSummaryTab.notices.invalidStatus", { status: sessionStatus })}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Main fields */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            {t("finalSummaryTab.fields.summary.label")} <span className="text-danger-500">*</span>
          </label>
          {isEditable ? (
            <Textarea
              placeholder={t("finalSummaryTab.fields.summary.placeholder")}
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              className="min-h-[90px] text-xs"
            />
          ) : (
            <div className="rounded-md border bg-slate-50 p-3 text-xs whitespace-pre-wrap min-h-[70px]">
              {summaryText || <span className="text-slate-400 italic">{t("finalSummaryTab.fields.noData")}</span>}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            {t("finalSummaryTab.fields.observations.label")} {isFinalized ? "" : <span className="text-danger-500">{t("finalSummaryTab.fields.requiredOnFinalize")}</span>}
          </label>
          {isEditable ? (
            <Textarea
              placeholder={t("finalSummaryTab.fields.observations.placeholder")}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="min-h-[70px] text-xs"
            />
          ) : (
            <div className="rounded-md border bg-slate-50 p-3 text-xs whitespace-pre-wrap min-h-[50px]">
              {observations || <span className="text-slate-400 italic">{t("finalSummaryTab.fields.noData")}</span>}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            {t("finalSummaryTab.fields.recommendations.label")} {isFinalized ? "" : <span className="text-danger-500">{t("finalSummaryTab.fields.requiredOnFinalize")}</span>}
          </label>
          {isEditable ? (
            <Textarea
              placeholder={t("finalSummaryTab.fields.recommendations.placeholder")}
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              className="min-h-[70px] text-xs"
            />
          ) : (
            <div className="rounded-md border bg-slate-50 p-3 text-xs whitespace-pre-wrap min-h-[50px]">
              {recommendations || <span className="text-slate-400 italic">{t("finalSummaryTab.fields.noData")}</span>}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">{t("finalSummaryTab.fields.followUp.label")}</label>
          {isEditable ? (
            <Textarea
              placeholder={t("finalSummaryTab.fields.followUp.placeholder")}
              value={followUpRecommendation}
              onChange={(e) => setFollowUpRecommendation(e.target.value)}
              className="min-h-[60px] text-xs"
            />
          ) : (
            <div className="rounded-md border bg-slate-50 p-3 text-xs whitespace-pre-wrap min-h-[50px]">
              {followUpRecommendation || <span className="text-slate-400 italic">{t("finalSummaryTab.fields.noData")}</span>}
            </div>
          )}
        </div>

        {/* Referenced Health Records */}
        <div className="space-y-2 pt-2 border-t">
          <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span>{t("finalSummaryTab.records.title", { count: selectedRecordIds.length })}</span>
            {isEditable && <span className="text-[11px] font-normal text-muted-foreground">{t("finalSummaryTab.records.hint")}</span>}
          </label>

          {isEditable ? (
            scopedRecords.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">{t("finalSummaryTab.records.emptyScope")}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {scopedRecords.map((item) => {
                  if (!item.record) return null
                  const isChecked = selectedRecordIds.some((id) => String(id) === String(item.record.id))
                  return (
                    <div
                      key={item.record.id}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.preventDefault()
                        toggleRecordSelection(item.record.id)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          toggleRecordSelection(item.record.id)
                        }
                      }}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isChecked ? "bg-primary/5 border-primary" : "bg-card hover:bg-muted/30"
                      }`}
                    >
                      <Checkbox checked={isChecked} tabIndex={-1} className="pointer-events-none" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 truncate font-medium">
                          <Activity className="h-3 w-3 shrink-0 text-muted-foreground" />
                          <span className="truncate">#{item.record.id} {item.record.originalFileName || item.record.fileName || ""}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <span>{formatDate(item.record.createdAt)}</span>
                          {item.record.predictionLabel && (
                            <Badge variant={item.record.predictionLabel === "NORMAL" ? "outline" : "destructive"} className="text-[9px] py-0 px-1 h-3.5">
                              {item.record.predictionLabel}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedRecordIds.length === 0 ? (
                <span className="text-xs text-slate-400 italic">{t("finalSummaryTab.records.noneReferenced")}</span>
              ) : (
                selectedRecordIds.map((recId) => (
                  <Badge key={recId} variant="secondary" className="text-xs py-1 px-2 gap-1">
                    <FileText className="w-3 h-3" />
                    {t("finalSummaryTab.records.recordLabel", { id: recId })}
                  </Badge>
                ))
              )}
            </div>
          )}
        </div>

        {/* Existing Addenda Section (when Finalized) */}
        {isFinalized && (
          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-warning-600" />
                {t("finalSummaryTab.addenda.title", { count: summary?.addenda?.length || 0 })}
              </h4>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 border-warning-300 hover:bg-warning-50 text-warning-900"
                onClick={() => setAddendumOpen(true)}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                {t("finalSummaryTab.addenda.add")}
              </Button>
            </div>

            {summary?.addenda && summary.addenda.length > 0 ? (
              <div className="space-y-2">
                {summary.addenda.map((addendum) => (
                  <div
                    key={addendum.id}
                    className="p-3 rounded-lg bg-warning-50/60 border border-warning-200/60 text-xs"
                  >
                    <div className="flex items-center justify-between font-medium text-warning-950 mb-1">
                      <span>{t("finalSummaryTab.addenda.reason", { reason: addendum.reason })}</span>
                      <span className="text-[10px] text-muted-foreground">{formatDate(addendum.createdAt)}</span>
                    </div>
                    <p className="text-foreground/90 whitespace-pre-wrap">{addendum.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">{t("finalSummaryTab.addenda.empty")}</p>
            )}
          </div>
        )}
      </div>

      {/* Action buttons for DRAFT */}
      {!isFinalized && (canSave || canFinalize) && (
        <div className="flex items-center gap-3 pt-4 border-t">
          {canSave && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={saving || finalizing}
            >
              <Save className="mr-1.5 h-4 w-4" />
              {saving ? t("finalSummaryTab.actions.saving") : t("finalSummaryTab.actions.saveDraft")}
            </Button>
          )}
          {canFinalize && (
            <Button
              size="sm"
              onClick={() => setConfirmFinalizeOpen(true)}
              disabled={saving || finalizing}
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              {t("finalSummaryTab.actions.finalize")}
            </Button>
          )}
        </div>
      )}

      {/* Confirm Finalize Dialog */}
      <Dialog open={confirmFinalizeOpen} onOpenChange={setConfirmFinalizeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("finalSummaryTab.confirmDialog.title")}</DialogTitle>
            <DialogDescription className="pt-2 text-slate-800 text-sm">
              {t("finalSummaryTab.confirmDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmFinalizeOpen(false)} disabled={finalizing}>
              {t("finalSummaryTab.actions.cancel")}
            </Button>
            <Button onClick={handleFinalize} disabled={finalizing}>
              {finalizing ? t("finalSummaryTab.actions.processing") : t("finalSummaryTab.actions.confirmFinalize")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Addendum Dialog */}
      <Dialog open={addendumOpen} onOpenChange={setAddendumOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileText className="w-4 h-4 text-warning-600" />
              {t("finalSummaryTab.addendumDialog.title")}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t("finalSummaryTab.addendumDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <label className="font-medium text-foreground">
                {t("finalSummaryTab.addendumDialog.reasonLabel")} <span className="text-danger-500">*</span>
              </label>
              <Input
                placeholder={t("finalSummaryTab.addendumDialog.reasonPlaceholder")}
                value={addendumReason}
                onChange={(e) => setAddendumReason(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-foreground">
                {t("finalSummaryTab.addendumDialog.contentLabel")} <span className="text-danger-500">*</span>
              </label>
              <Textarea
                placeholder={t("finalSummaryTab.addendumDialog.contentPlaceholder")}
                value={addendumContent}
                onChange={(e) => setAddendumContent(e.target.value)}
                className="min-h-[100px] text-xs"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setAddendumOpen(false)} disabled={addingAddendum}>
              {t("finalSummaryTab.actions.cancel")}
            </Button>
            <Button size="sm" onClick={handleAddAddendum} disabled={addingAddendum || !addendumReason.trim() || !addendumContent.trim()}>
              {addingAddendum ? t("finalSummaryTab.actions.saving") : t("finalSummaryTab.actions.saveAddendum")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


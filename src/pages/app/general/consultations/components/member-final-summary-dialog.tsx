import { useEffect, useState } from "react"
import { CheckCircle2, FileText, Activity } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { consultationApi } from "@/services"
import type { ConsultationFinalSummaryResponse } from "@/types/consultation"
import { formatDate } from "./shared"
import { useAppShell } from "@/components/layout/app-shell-context"
import { USER_ROLES } from "@/constants"
import i18n from "@/lib/i18n"

interface MemberFinalSummaryDialogProps {
  sessionId: string | number
  open: boolean
  onOpenChange: (open: boolean) => void
  isAdminView?: boolean
}

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string }
  if (err.response?.status === 403) return i18n.t("consultation:memberFinalSummaryDialog.errors.forbidden")
  return err.response?.data?.message || err.message || fallback
}

export function MemberFinalSummaryDialog({ sessionId, open, onOpenChange, isAdminView }: MemberFinalSummaryDialogProps) {
  const { t } = useTranslation("consultation")
  const { effectiveRole } = useAppShell()
  const isStaff = isAdminView !== undefined
    ? (isAdminView && (effectiveRole === USER_ROLES.ADMIN || effectiveRole === USER_ROLES.SUPER_ADMIN || effectiveRole === USER_ROLES.CARE_COORDINATOR))
    : (effectiveRole === USER_ROLES.ADMIN || effectiveRole === USER_ROLES.SUPER_ADMIN || effectiveRole === USER_ROLES.CARE_COORDINATOR)
  const isDoctor = effectiveRole === USER_ROLES.DOCTOR

  const [summary, setSummary] = useState<ConsultationFinalSummaryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !sessionId) {
      setSummary(null)
      setErrorMsg(null)
      return
    }

    setLoading(true)
    setErrorMsg(null)
    
    const fetchApi = isStaff 
      ? consultationApi.getAdminFinalSummary(sessionId)
      : isDoctor
        ? consultationApi.getDoctorFinalSummary(sessionId)
        : consultationApi.getMemberFinalSummary(sessionId)

    fetchApi
      .then((res) => {
        setSummary(res.data)
      })
      .catch((err) => {
        const status = err?.response?.status
        const code = err?.response?.data?.code
        const msg = String(err?.response?.data?.message || "")
        if (
          status === 404 || 
          code === 3000 || 
          code === "3000" || 
          code === "ENTITY_NOT_FOUND" ||
          msg.toLowerCase().includes("has not been finalized")
        ) {
          setSummary(null) // Not finalized / not created yet = empty state
          setErrorMsg(null)
        } else {
          setErrorMsg(readError(err, t("memberFinalSummaryDialog.errors.loadFailed")))
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [sessionId, open, isStaff, isDoctor, t])

  const isFinalized = summary?.status === "FINALIZED"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {t("memberFinalSummaryDialog.title", { id: sessionId })}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : errorMsg ? (
            <div className="rounded-md bg-danger-50 p-4 text-sm text-danger-700">{errorMsg}</div>
          ) : !summary || !isFinalized ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Activity className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-foreground font-medium">{t("memberFinalSummaryDialog.pending.title")}</p>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
                {isStaff
                  ? t("memberFinalSummaryDialog.pending.staffDescription")
                  : t("memberFinalSummaryDialog.pending.memberDescription")}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border border-success-200 bg-success-50 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success-600" />
                  <div>
                    <p className="font-medium text-success-900">{t("memberFinalSummaryDialog.finalized.title")}</p>
                    <p className="text-sm text-success-700">
                      {t("memberFinalSummaryDialog.finalized.at", { time: formatDate(summary.finalizedAt) || "-" })}
                    </p>
                  </div>
                </div>
                <Badge className="bg-success-600 hover:bg-success-700">{t("memberFinalSummaryDialog.finalized.badge")}</Badge>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h4 className="text-sm font-semibold text-slate-900">{t("memberFinalSummaryDialog.sections.summary")}</h4>
                  <div className="rounded-md border bg-slate-50 p-4 text-sm text-slate-800 whitespace-pre-wrap">
                    {summary.summary || <span className="text-slate-400 italic">{t("memberFinalSummaryDialog.sections.noContent")}</span>}
                  </div>
                </div>

                {summary.observations && (
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-semibold text-slate-900">{t("memberFinalSummaryDialog.sections.observations")}</h4>
                    <div className="rounded-md border bg-slate-50 p-4 text-sm text-slate-800 whitespace-pre-wrap">
                      {summary.observations}
                    </div>
                  </div>
                )}

                {summary.recommendations && (
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-semibold text-slate-900">{t("memberFinalSummaryDialog.sections.recommendations")}</h4>
                    <div className="rounded-md border bg-slate-50 p-4 text-sm text-slate-800 whitespace-pre-wrap">
                      {summary.recommendations}
                    </div>
                  </div>
                )}

                {summary.followUpRecommendation && (
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-semibold text-slate-900">{t("memberFinalSummaryDialog.sections.followUp")}</h4>
                    <div className="rounded-md border bg-slate-50 p-4 text-sm text-slate-800 whitespace-pre-wrap">
                      {summary.followUpRecommendation}
                    </div>
                  </div>
                )}

                {/* Referenced Health Records */}
                {summary.referencedHealthRecordIds && summary.referencedHealthRecordIds.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t">
                    <h4 className="text-sm font-semibold text-slate-900">{t("memberFinalSummaryDialog.sections.referencedRecords")}</h4>
                    <div className="flex flex-wrap gap-2">
                      {summary.referencedHealthRecordIds.map((recId) => (
                        <Badge key={recId} variant="secondary" className="text-xs py-1 px-2.5 gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          {t("memberFinalSummaryDialog.sections.recordLabel", { id: recId })}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Addenda Section */}
                {summary.addenda && summary.addenda.length > 0 && (
                  <div className="space-y-2.5 pt-3 border-t">
                    <h4 className="text-sm font-semibold text-warning-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-warning-600" />
                      {t("memberFinalSummaryDialog.sections.addenda", { count: summary.addenda.length })}
                    </h4>
                    <div className="space-y-2">
                      {summary.addenda.map((addendum) => (
                        <div
                          key={addendum.id}
                          className="p-3 rounded-lg bg-warning-50/60 border border-warning-200/60 text-xs"
                        >
                          <div className="flex items-center justify-between font-medium text-warning-950 mb-1">
                            <span>{t("memberFinalSummaryDialog.sections.reason", { reason: addendum.reason })}</span>
                            <span className="text-[10px] text-muted-foreground">{formatDate(addendum.createdAt)}</span>
                          </div>
                          <p className="text-foreground/90 whitespace-pre-wrap">{addendum.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("memberFinalSummaryDialog.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { useEffect, useState, useRef } from "react"
import { useTranslation } from "react-i18next"
import {
  Calendar,
  Clock,
  User,
  AlertTriangle,
  FileText,
  BriefcaseMedical
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import i18n from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { consultationApi } from "@/services"
import type { DoctorConsultationDetailResponse } from "@/types/consultation"
import { formatDate, statusLabel } from "./shared"
import { DoctorScopedRecordsTab } from "./doctor-scoped-records-tab"
import { DoctorFinalSummaryTab } from "./doctor-final-summary-tab"
import { DoctorContinuityTab } from "./doctor-continuity-tab"

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err.response?.data?.message || err.message || fallback
}

const DAYS_OF_WEEK_MAP: Record<string, string> = {
  get MONDAY() { return i18n.t("consultation:days.monday") },
  get TUESDAY() { return i18n.t("consultation:days.tuesday") },
  get WEDNESDAY() { return i18n.t("consultation:days.wednesday") },
  get THURSDAY() { return i18n.t("consultation:days.thursday") },
  get FRIDAY() { return i18n.t("consultation:days.friday") },
  get SATURDAY() { return i18n.t("consultation:days.saturday") },
  get SUNDAY() { return i18n.t("consultation:days.sunday") },
}

interface DoctorSessionDetailDialogProps {
  sessionId: string | number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSessionRefreshed?: () => void
}

export function DoctorSessionDetailDialog({ sessionId, open, onOpenChange, onSessionRefreshed }: DoctorSessionDetailDialogProps) {
  const [detail, setDetail] = useState<DoctorConsultationDetailResponse | null>(null)
  const [activeTab, setActiveTab] = useState("info")
  const { t } = useTranslation("consultation")
  const { toast } = useToast()
  const onOpenChangeRef = useRef(onOpenChange)

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange
  }, [onOpenChange])

  // Reset tab to "info" when opening a new session dialog
  useEffect(() => {
    if (open) {
      setActiveTab("info")
    }
  }, [open, sessionId])

  useEffect(() => {
    if (!open || !sessionId) {
      setDetail(null)
      return
    }
    
    let isSubscribed = true
    consultationApi.getDoctorSessionDetail(sessionId)
      .then(res => {
        if (isSubscribed) {
          setDetail(res.data)
        }
      })
      .catch((error) => {
        if (isSubscribed) {
          toast({ variant: "destructive", description: readError(error, t("sessionDetailDialog.loadError")) })
          onOpenChangeRef.current(false)
        }
      })

    return () => {
      isSubscribed = false
    }
  }, [sessionId, open, toast, t])

  const renderSupportSchedule = () => {
    const jsonStr = detail?.session.supportScheduleSnapshotJson
    if (!jsonStr) return <p className="text-sm text-slate-500 italic">{t("sessionDetailDialog.noSupportSchedule")}</p>
    
    try {
      const schedule = JSON.parse(jsonStr)
      if (!schedule.weekly || !Array.isArray(schedule.weekly) || schedule.weekly.length === 0) {
        return <p className="text-sm text-slate-500 italic">{t("sessionDetailDialog.noSupportSchedule")}</p>
      }

      return (
        <div className="space-y-2 mt-2">
          {schedule.weekly.map((slot: { dayOfWeek: string; start: string; end: string }) => (
            <div key={`${slot.dayOfWeek}-${slot.start}-${slot.end}`} className="flex justify-between items-center text-sm border-b pb-1 last:border-0 last:pb-0">
              <span className="font-medium text-slate-700">
                {DAYS_OF_WEEK_MAP[slot.dayOfWeek] || slot.dayOfWeek}
              </span>
              <span className="text-slate-600 font-mono">
                {slot.start} - {slot.end}
              </span>
            </div>
          ))}
          {detail.session.supportTimezoneSnapshot && (
            <div className="text-xs text-slate-400 text-right mt-1">
              {t("sessionDetailDialog.timezone", { timezone: detail.session.supportTimezoneSnapshot })}
            </div>
          )}
        </div>
      )
    } catch (e) {
      return <p className="text-sm text-slate-500 italic">{t("sessionDetailDialog.noSupportSchedule")}</p>
    }
  }

  if (!detail) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t("sessionDetailDialog.title")}</DialogTitle>
          </DialogHeader>
          <div className="py-12 flex justify-center">
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 w-2 bg-slate-300 rounded-full"></div>
              <div className="h-2 w-2 bg-slate-300 rounded-full"></div>
              <div className="h-2 w-2 bg-slate-300 rounded-full"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const { session, initialHealthRecord } = detail

  const memberDisplayName =
    (typeof detail.member?.displayName === "string" && detail.member.displayName) ||
    session.memberDisplayName ||
    t("sessionDetailDialog.patientFallback", { id: session.memberId })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between pr-4">
            <div>
              <DialogTitle className="text-xl">
                {memberDisplayName}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {t("sessionDetailDialog.sessionId", { id: session.id })}
              </DialogDescription>
            </div>
            {session.status === "CANCELLED" && session.meaningfulCareOccurred ? (
              <Badge variant="outline" className="bg-warning-50 text-warning-800 border-warning-300">
                {t("sessionDetailDialog.cancelledWithCare")}
              </Badge>
            ) : (
              <Badge variant={session.status === "ACTIVE" ? "default" : "outline"} className={
                session.status === "ACTIVE" ? "bg-success-500 hover:bg-success-600" : ""
              }>
                {statusLabel(session.status)}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4 text-xs">
            <TabsTrigger value="info">{t("sessionDetailDialog.tabs.info")}</TabsTrigger>
            <TabsTrigger value="records">{t("sessionDetailDialog.tabs.records")}</TabsTrigger>
            <TabsTrigger value="continuity">{t("sessionDetailDialog.tabs.continuity")}</TabsTrigger>
            <TabsTrigger value="summary">{t("sessionDetailDialog.tabs.summary")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="grid gap-6 py-4 outline-none">
            {session.unresolvedAttentionCount > 0 && (
              <div className="bg-warning-50 border border-warning-100 rounded-lg p-4 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-warning-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-warning-900">{t("sessionDetailDialog.attentionTitle", { count: session.unresolvedAttentionCount })}</h4>
                  <p className="text-sm text-warning-700 mt-1">{t("sessionDetailDialog.attentionDescription")}</p>
                </div>
              </div>
            )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <Calendar className="h-4 w-4" /> {t("sessionDetailDialog.startedAt")}
              </div>
              <p className="font-medium text-slate-900">{formatDate(session.startedAt) || '---'}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <Clock className="h-4 w-4" /> {t("sessionDetailDialog.expectedEnd")}
              </div>
              <p className="font-medium text-slate-900">{formatDate(session.endsAt) || '---'}</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
            <div className="flex gap-2 items-center mb-3">
              <User className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-slate-900">{t("sessionDetailDialog.patientInfo")}</h3>
            </div>
            <div className="text-sm text-slate-600 space-y-2">
              <p><span className="font-medium text-slate-800">{t("sessionDetailDialog.patientName")}</span> {memberDisplayName}</p>
              <p><span className="font-medium text-slate-800">{t("sessionDetailDialog.patientCode")}</span> #{session.memberId}</p>
              <p className="italic text-slate-400">{t("sessionDetailDialog.otherInfoNote")}</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
            <div className="flex gap-2 items-center mb-3">
              <BriefcaseMedical className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-slate-900">{t("sessionDetailDialog.initialRecord")}</h3>
            </div>
            {initialHealthRecord ? (
              <div className="flex items-center gap-3 p-3 bg-white border rounded-md">
                <FileText className="h-8 w-8 text-slate-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {initialHealthRecord.originalFileName || t("sessionDetailDialog.recordFallback", { id: initialHealthRecord.id })}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t("sessionDetailDialog.updatedAt", { date: formatDate(initialHealthRecord.updatedAt || initialHealthRecord.createdAt) })}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {initialHealthRecord.predictionLabel || initialHealthRecord.status || "UNKNOWN"}
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">{t("sessionDetailDialog.noInitialRecord")}</p>
            )}
          </div>

          <div className="bg-primary-50/50 rounded-lg p-4 border border-primary-100">
            <div className="flex gap-2 items-center mb-3">
              <Clock className="h-5 w-5 text-primary-600" />
              <h3 className="font-semibold text-primary-900">{t("sessionDetailDialog.committedSupportHours")}</h3>
            </div>
            {renderSupportSchedule()}
          </div>
          </TabsContent>

          <TabsContent value="records" className="outline-none">
            <DoctorScopedRecordsTab sessionId={session.id} />
          </TabsContent>

          <TabsContent value="continuity" className="outline-none">
            <DoctorContinuityTab sessionId={session.id} />
          </TabsContent>

          <TabsContent value="summary" className="outline-none">
            <DoctorFinalSummaryTab
              sessionId={session.id}
              sessionStatus={session.status}
              meaningfulCareOccurred={session.meaningfulCareOccurred}
              flowType={session.flowType}
              summaryDueAt={session.summaryDueAt}
              summaryClosureStatus={session.summaryClosureStatus}
              onFinalized={() => {
                consultationApi.getDoctorSessionDetail(sessionId).then(res => setDetail(res.data)).catch(() => {})
                onSessionRefreshed?.()
              }}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("sessionDetailDialog.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

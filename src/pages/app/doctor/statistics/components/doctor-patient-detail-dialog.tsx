import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { isAxiosError } from "axios"
import { Link } from "react-router-dom"
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  ShieldCheck,
  MessagesSquare,
  FileText,
  Activity,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

import {
  useDoctorPatientDetail,
  useDoctorPatientConsultations,
  useDoctorPatientMedicalHistory,
  useDoctorPatientHealthRecords,
} from "../hooks/use-doctor-patient-detail"

interface DoctorPatientDetailDialogProps {
  memberId: string | null
  open: boolean
  onClose: () => void
}

function calculateAge(dateOfBirthStr?: string | null): number | null {
  if (!dateOfBirthStr) return null
  const dob = new Date(dateOfBirthStr)
  if (isNaN(dob.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age >= 0 ? age : null
}

function formatDate(isoString?: string | null): string {
  if (!isoString) return "-"
  try {
    const d = new Date(isoString)
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d)
  } catch {
    return isoString
  }
}

export function DoctorPatientDetailDialog({
  memberId,
  open,
  onClose,
}: DoctorPatientDetailDialogProps) {
  const { t } = useTranslation("health")
  const [activeSubTab, setActiveSubTab] = useState<
    "consultations" | "medicalHistory" | "healthRecords"
  >("consultations")

  const [consultationPage, setConsultationPage] = useState(1)
  const [medicalHistoryPage, setMedicalHistoryPage] = useState(1)
  const [healthRecordPage, setHealthRecordPage] = useState(1)

  // Reset page when memberId changes
  useEffect(() => {
    if (memberId) {
      setConsultationPage(1)
      setMedicalHistoryPage(1)
      setHealthRecordPage(1)
      setActiveSubTab("consultations")
    }
  }, [memberId])

  // Queries
  const patientDetailQuery = useDoctorPatientDetail(memberId, {
    enabled: open && Boolean(memberId),
  })

  const consultationsQuery = useDoctorPatientConsultations(
    memberId,
    consultationPage,
    10,
    { enabled: open && Boolean(memberId) && activeSubTab === "consultations" }
  )

  const medicalHistoryQuery = useDoctorPatientMedicalHistory(
    memberId,
    medicalHistoryPage,
    10,
    { enabled: open && Boolean(memberId) && activeSubTab === "medicalHistory" }
  )

  const healthRecordsQuery = useDoctorPatientHealthRecords(
    memberId,
    healthRecordPage,
    10,
    { enabled: open && Boolean(memberId) && activeSubTab === "healthRecords" }
  )

  // Handle 403 Access Denied: auto-close dialog and safeguard sensitive state
  useEffect(() => {
    const check403 = (err: unknown) => {
      if (isAxiosError(err) && err.response?.status === 403) {
        onClose()
      }
    }
    if (patientDetailQuery.error) check403(patientDetailQuery.error)
    if (consultationsQuery.error) check403(consultationsQuery.error)
    if (medicalHistoryQuery.error) check403(medicalHistoryQuery.error)
    if (healthRecordsQuery.error) check403(healthRecordsQuery.error)
  }, [
    patientDetailQuery.error,
    consultationsQuery.error,
    medicalHistoryQuery.error,
    healthRecordsQuery.error,
    onClose,
  ])

  const patient = patientDetailQuery.data
  const age = calculateAge(patient?.dateOfBirth)

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-semibold">
            {t("doctorStatistics.consultations.summary.completedInPeriod")}
          </Badge>
        )
      case "ACTIVE":
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[11px] font-semibold">
            {t("doctorStatistics.consultations.summary.activeInPeriod")}
          </Badge>
        )
      case "SCHEDULED":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[11px] font-semibold">
            {t("doctorStatistics.consultations.summary.scheduledInPeriod")}
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[11px] font-semibold">
            {t("doctorStatistics.consultations.summary.cancelledInPeriod")}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const renderPredictionBadge = (
    label: string | null,
    confidence: number | null
  ) => {
    const confText = confidence ? ` (${Math.round(confidence * 100)}%)` : ""
    switch (label) {
      case "NORMAL":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px]">
            {t("doctorStatistics.detail.healthRecordsTab.predictionLabel")}:{" "}
            {t("memberStatistics.health.results.NORMAL")}
            {confText}
          </Badge>
        )
      case "AFIB":
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[11px]">
            {t("memberStatistics.health.results.AFIB")}
            {confText}
          </Badge>
        )
      case "AFIB_SUSPECTED":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[11px]">
            {t("memberStatistics.health.results.AFIB_SUSPECTED")}
            {confText}
          </Badge>
        )
      case "UNCERTAIN":
        return (
          <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[11px]">
            {t("memberStatistics.health.results.UNCERTAIN")}
          </Badge>
        )
      default:
        return <span className="text-slate-400 text-xs">-</span>
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" />
            <span>{t("doctorStatistics.detail.title")}</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 space-y-6">
          {/* Patient Overview Card */}
          {patientDetailQuery.isLoading && (
            <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          )}

          {patient && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <Avatar className="h-14 w-14 border border-slate-100 shadow-xs">
                    <AvatarImage src={patient.avatarUrl || ""} alt={patient.displayName} />
                    <AvatarFallback className="bg-primary-50 text-primary-700 font-bold text-lg">
                      {patient.displayName ? patient.displayName[0].toUpperCase() : "BN"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {patient.displayName}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      {t("doctorStatistics.detail.personalInfo")}: {patient.memberId}
                    </p>
                  </div>
                </div>

                {/* Badges: Gender & Age */}
                <div className="flex items-center gap-2">
                  {patient.gender && (
                    <Badge variant="outline" className="text-xs font-medium">
                      {patient.gender === "MALE"
                        ? t("doctorStatistics.detail.genderMale")
                        : patient.gender === "FEMALE"
                        ? t("doctorStatistics.detail.genderFemale")
                        : t("doctorStatistics.detail.genderOther")}
                    </Badge>
                  )}
                  {age !== null && (
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {t("doctorStatistics.detail.age", { age })}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Administrative info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {patient.phone || t("doctorStatistics.detail.notProvided")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {patient.email || t("doctorStatistics.detail.notProvided")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {patient.dateOfBirth || t("doctorStatistics.detail.notProvided")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {patient.address || t("doctorStatistics.detail.notProvided")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {t("doctorStatistics.detail.insurance")}:{" "}
                    {patient.healthInsuranceNumber || t("doctorStatistics.detail.notProvided")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tabs */}
          <Tabs
            value={activeSubTab}
            onValueChange={(v) =>
              setActiveSubTab(v as "consultations" | "medicalHistory" | "healthRecords")
            }
            className="w-full space-y-4 pt-2"
          >
            <TabsList className="grid grid-cols-3 w-full max-w-lg p-1 bg-slate-100 rounded-xl">
              <TabsTrigger
                value="consultations"
                className="rounded-lg py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 gap-1.5"
              >
                <MessagesSquare className="w-3.5 h-3.5 text-sky-600" />
                <span>{t("doctorStatistics.detail.tabs.consultations")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="medicalHistory"
                className="rounded-lg py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t("doctorStatistics.detail.tabs.medicalHistory")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="healthRecords"
                className="rounded-lg py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 gap-1.5"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t("doctorStatistics.detail.tabs.healthRecords")}</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: CONSULTATIONS */}
            {activeSubTab === "consultations" && (
              <div className="space-y-3">
                {consultationsQuery.isLoading && (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                  </div>
                )}

                {!consultationsQuery.isLoading &&
                  (!consultationsQuery.data?.content ||
                    consultationsQuery.data.content.length === 0) && (
                    <div className="text-center py-8 text-xs text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                      {t("doctorStatistics.detail.consultationsTab.empty")}
                    </div>
                  )}

                {!consultationsQuery.isLoading &&
                  consultationsQuery.data?.content &&
                  consultationsQuery.data.content.map((session) => (
                    <div
                      key={session.sessionId}
                      className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">
                            #{session.sessionId}
                          </span>
                          {renderStatusBadge(session.status)}
                          {session.summaryClosureStatus && (
                            <Badge variant="outline" className="text-[10px] text-slate-600">
                              {session.summaryClosureStatus === "SUMMARY_FINALIZED"
                                ? t("doctorStatistics.detail.closureStatuses.SUMMARY_FINALIZED")
                                : session.summaryClosureStatus === "SUMMARY_PENDING"
                                ? t("doctorStatistics.detail.closureStatuses.SUMMARY_PENDING")
                                : session.summaryClosureStatus === "SUMMARY_OVERDUE"
                                ? t("doctorStatistics.detail.closureStatuses.SUMMARY_OVERDUE")
                                : t("doctorStatistics.detail.closureStatuses.ESCALATED")}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-[11px]">
                          <span>
                            {t("doctorStatistics.detail.consultationsTab.activatedAt")}:{" "}
                            {formatDate(session.activatedAt)}
                          </span>
                          {session.completedAt && (
                            <span>
                              {t("doctorStatistics.detail.consultationsTab.completedAt")}:{" "}
                              {formatDate(session.completedAt)}
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="rounded-xl border-slate-200 text-xs h-8 gap-1.5 text-primary-700 hover:text-primary-800"
                      >
                        <Link to={`/app/management/doctor/consultations/${session.sessionId}`}>
                          <span>{t("doctorStatistics.detail.consultationsTab.openWorkspace")}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </Button>
                    </div>
                  ))}

                {/* Consultation Pagination */}
                {consultationsQuery.data &&
                  consultationsQuery.data.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                      <span>
                        {t("doctorStatistics.detail.pageSummary", {
                          page: consultationsQuery.data.page,
                          totalPages: consultationsQuery.data.totalPages,
                        })}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={consultationPage <= 1}
                          onClick={() => setConsultationPage((p) => Math.max(1, p - 1))}
                          className="h-7 px-2 rounded-lg"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!consultationsQuery.data.hasMore}
                          onClick={() => setConsultationPage((p) => p + 1)}
                          className="h-7 px-2 rounded-lg"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* TAB 2: MEDICAL HISTORY */}
            {activeSubTab === "medicalHistory" && (
              <div className="space-y-4">
                {medicalHistoryQuery.isLoading && (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} className="h-28 w-full rounded-xl" />
                    ))}
                  </div>
                )}

                {!medicalHistoryQuery.isLoading &&
                  (!medicalHistoryQuery.data?.content ||
                    medicalHistoryQuery.data.content.length === 0) && (
                    <div className="text-center py-8 text-xs text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                      {t("doctorStatistics.detail.medicalHistoryTab.empty")}
                    </div>
                  )}

                {!medicalHistoryQuery.isLoading &&
                  medicalHistoryQuery.data?.content &&
                  medicalHistoryQuery.data.content.map((history) => (
                    <div
                      key={history.summaryId}
                      className="p-5 rounded-2xl border border-slate-200/90 bg-white space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            #{history.summaryId}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            ({t("doctorStatistics.detail.medicalHistoryTab.sessionLabel", {
                              sessionId: history.sessionId,
                            })})
                          </span>
                        </div>
                        <span className="text-slate-500 text-[11px] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatDate(history.finalizedAt)}
                        </span>
                      </div>

                      {history.summary && (
                        <div>
                          <span className="font-semibold text-slate-700">
                            {t("doctorStatistics.detail.medicalHistoryTab.summary")}:
                          </span>
                          <p className="mt-0.5 text-slate-600 leading-relaxed">
                            {history.summary}
                          </p>
                        </div>
                      )}

                      {history.observations && (
                        <div>
                          <span className="font-semibold text-slate-700">
                            {t("doctorStatistics.detail.medicalHistoryTab.observations")}:
                          </span>
                          <p className="mt-0.5 text-slate-600 leading-relaxed">
                            {history.observations}
                          </p>
                        </div>
                      )}

                      {history.recommendations && (
                        <div>
                          <span className="font-semibold text-slate-700">
                            {t("doctorStatistics.detail.medicalHistoryTab.recommendations")}:
                          </span>
                          <p className="mt-0.5 text-slate-600 leading-relaxed">
                            {history.recommendations}
                          </p>
                        </div>
                      )}

                      {history.followUpRecommendation && (
                        <div className="rounded-xl bg-primary-50/50 border border-primary-100 p-2.5 text-primary-900">
                          <span className="font-semibold">
                            {t("doctorStatistics.detail.medicalHistoryTab.followUp")}:{" "}
                          </span>
                          <span>{history.followUpRecommendation}</span>
                        </div>
                      )}

                      {history.referencedHealthRecordIds &&
                        history.referencedHealthRecordIds.length > 0 && (
                          <div className="pt-1 text-[11px] text-slate-400">
                            {t("doctorStatistics.detail.medicalHistoryTab.referencedRecords", {
                              count: history.referencedHealthRecordIds.length,
                            })}
                          </div>
                        )}
                    </div>
                  ))}

                {/* Medical History Pagination */}
                {medicalHistoryQuery.data &&
                  medicalHistoryQuery.data.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                      <span>
                        {t("doctorStatistics.detail.pageSummary", {
                          page: medicalHistoryQuery.data.page,
                          totalPages: medicalHistoryQuery.data.totalPages,
                        })}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={medicalHistoryPage <= 1}
                          onClick={() => setMedicalHistoryPage((p) => Math.max(1, p - 1))}
                          className="h-7 px-2 rounded-lg"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!medicalHistoryQuery.data.hasMore}
                          onClick={() => setMedicalHistoryPage((p) => p + 1)}
                          className="h-7 px-2 rounded-lg"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* TAB 3: SHARED HEALTH RECORDS */}
            {activeSubTab === "healthRecords" && (
              <div className="space-y-4">
                {/* Clinical Disclaimer */}
                <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3 text-[11px] text-amber-800 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{t("doctorStatistics.detail.healthRecordsTab.disclaimer")}</span>
                </div>

                {healthRecordsQuery.isLoading && (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                  </div>
                )}

                {!healthRecordsQuery.isLoading &&
                  (!healthRecordsQuery.data?.content ||
                    healthRecordsQuery.data.content.length === 0) && (
                    <div className="text-center py-8 text-xs text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                      {t("doctorStatistics.detail.healthRecordsTab.empty")}
                    </div>
                  )}

                {!healthRecordsQuery.isLoading &&
                  healthRecordsQuery.data?.content &&
                  healthRecordsQuery.data.content.map((record) => (
                    <div
                      key={record.recordId}
                      className="p-4 rounded-xl border border-slate-200/80 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {record.fileName}
                          </span>
                          {renderPredictionBadge(record.predictionLabel, record.confidence)}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-[11px]">
                          <span>
                            {t("doctorStatistics.detail.healthRecordsTab.recordedAt")}:{" "}
                            {formatDate(record.recordedAt)}
                          </span>
                          <span>
                            {t("doctorStatistics.detail.healthRecordsTab.source")}:{" "}
                            {record.authorizationSource === "INITIAL_SHARED"
                              ? t("doctorStatistics.detail.healthRecordsTab.sources.INITIAL_SHARED")
                              : record.authorizationSource === "SHARED_DURING_CARE"
                              ? t("doctorStatistics.detail.healthRecordsTab.sources.SHARED_DURING_CARE")
                              : t("doctorStatistics.detail.healthRecordsTab.sources.CREATED_DURING_CARE")}
                          </span>
                        </div>
                      </div>

                      <Badge variant="outline" className="text-[10px] text-slate-500 self-start sm:self-auto">
                        #{record.recordId}
                      </Badge>
                    </div>
                  ))}

                {/* Health Records Pagination */}
                {healthRecordsQuery.data &&
                  healthRecordsQuery.data.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                      <span>
                        {t("doctorStatistics.detail.pageSummary", {
                          page: healthRecordsQuery.data.page,
                          totalPages: healthRecordsQuery.data.totalPages,
                        })}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={healthRecordPage <= 1}
                          onClick={() => setHealthRecordPage((p) => Math.max(1, p - 1))}
                          className="h-7 px-2 rounded-lg"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!healthRecordsQuery.data.hasMore}
                          onClick={() => setHealthRecordPage((p) => p + 1)}
                          className="h-7 px-2 rounded-lg"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

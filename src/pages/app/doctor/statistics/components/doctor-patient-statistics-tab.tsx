import { useState, useMemo, useEffect } from "react"
import { useTranslation } from "react-i18next"
import {
  Users,
  UserPlus,
  UserCheck,
  Calculator,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle,
  HelpCircle,
  RotateCw,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  type StatisticsPreset,
  getPresetDateRange,
  toStartOfDayInstant,
  nextDayOf,
} from "@/pages/app/general/statistics/utils/date-range"

import { useDoctorPatientStatistics } from "../hooks/use-doctor-patient-statistics"
import { useDoctorPatientsList } from "../hooks/use-doctor-patients-list"
import { DoctorStatisticsFilterBar } from "./doctor-statistics-filter-bar"
import { DoctorPatientDetailDialog } from "./doctor-patient-detail-dialog"

function formatDate(isoString?: string | null): string {
  if (!isoString) return "-"
  try {
    const d = new Date(isoString)
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d)
  } catch {
    return isoString
  }
}

export function DoctorPatientStatisticsTab() {
  const { t } = useTranslation("health")

  // Date filters
  const [preset, setPreset] = useState<StatisticsPreset>("7d")
  const initialRange = useMemo(() => getPresetDateRange("7d"), [])
  const [startDateStr, setStartDateStr] = useState(initialRange.startDateStr)
  const [endDateStr, setEndDateStr] = useState(initialRange.endDateStr)

  // Search & Pagination
  const [searchInput, setSearchInput] = useState("")
  const [debouncedKeyword, setDebouncedKeyword] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 20

  // Selected patient for detail dialog
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Debounce search keyword (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchInput.trim())
      setPage(1) // Reset page on search change
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  // API ISO Instant Range: [startDate 00:00:00+07:00, (endDate + 1 day) 00:00:00+07:00)
  const apiRange = useMemo(() => {
    return {
      from: toStartOfDayInstant(startDateStr),
      to: toStartOfDayInstant(nextDayOf(endDateStr)),
    }
  }, [startDateStr, endDateStr])

  // Reset page when range changes
  const handlePresetChange = (newPreset: StatisticsPreset) => {
    setPreset(newPreset)
    setPage(1)
    if (newPreset !== "custom") {
      const range = getPresetDateRange(newPreset)
      setStartDateStr(range.startDateStr)
      setEndDateStr(range.endDateStr)
    }
  }

  const handleCustomRangeChange = (start: string, end: string) => {
    setStartDateStr(start)
    setEndDateStr(end)
    setPage(1)
  }

  // 1. Overview KPIs
  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    isFetching: isOverviewFetching,
    error: overviewError,
    refetch: refetchOverview,
  } = useDoctorPatientStatistics(apiRange)

  // 2. Patients list
  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
    error: listError,
    refetch: refetchList,
  } = useDoctorPatientsList({
    ...apiRange,
    keyword: debouncedKeyword,
    page,
    size: pageSize,
  })

  const handleRefresh = () => {
    refetchOverview()
    refetchList()
  }

  const handleOpenDetail = (memberId: string) => {
    setSelectedMemberId(memberId)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setSelectedMemberId(null)
  }

  const summary = overviewData?.summary

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
            {t("doctorStatistics.consultations.summary.completedInPeriod")}
          </Badge>
        )
      case "ACTIVE":
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-semibold">
            {t("doctorStatistics.consultations.summary.activeInPeriod")}
          </Badge>
        )
      case "SCHEDULED":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-semibold">
            {t("doctorStatistics.consultations.summary.scheduledInPeriod")}
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-semibold">
            {t("doctorStatistics.consultations.summary.cancelledInPeriod")}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Date Filter Bar */}
      <DoctorStatisticsFilterBar
        preset={preset}
        startDateStr={startDateStr}
        endDateStr={endDateStr}
        isFetching={isOverviewFetching || isListFetching}
        onPresetChange={handlePresetChange}
        onCustomRangeChange={handleCustomRangeChange}
        onRefresh={handleRefresh}
      />

      {/* Overview Error */}
      {overviewError && !isOverviewLoading && (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 text-center text-xs text-red-800 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{t("doctorStatistics.error.loadFailed")}</span>
        </div>
      )}

      {/* KPI Loading Skeleton */}
      {isOverviewLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-5 rounded-2xl border-slate-200/80 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-xl" />
              </div>
              <Skeleton className="h-7 w-16 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </Card>
          ))}
        </div>
      )}

      {/* KPI Grid (5 metrics) */}
      {!isOverviewLoading && summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. Tổng bệnh nhân đã khám */}
          <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t("doctorStatistics.patients.summary.totalPatients")}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {summary.totalPatients.toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {t("doctorStatistics.patients.summary.totalPatientsDesc")}
            </p>
          </Card>

          {/* 2. Bệnh nhân trong kỳ */}
          <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t("doctorStatistics.patients.summary.patientsInPeriod")}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-slate-400 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs">
                      {t("doctorStatistics.patients.summary.cohortTooltip")}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {summary.patientsInPeriod.toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {t("doctorStatistics.patients.summary.patientsInPeriodDesc", {
                from: startDateStr,
                to: endDateStr,
              })}
            </p>
          </Card>

          {/* 3. Bệnh nhân mới trong kỳ */}
          <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t("doctorStatistics.patients.summary.newPatientsInPeriod")}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <UserPlus className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-emerald-600">
                {summary.newPatientsInPeriod.toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {t("doctorStatistics.patients.summary.newPatientsInPeriodDesc")}
            </p>
          </Card>

          {/* 4. Bệnh nhân quay lại */}
          <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t("doctorStatistics.patients.summary.returningPatientsInPeriod")}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <UserCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-teal-700">
                {summary.returningPatientsInPeriod.toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {t("doctorStatistics.patients.summary.returningPatientsInPeriodDesc")}
            </p>
          </Card>

          {/* 5. Trung bình phiên / bệnh nhân */}
          <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t("doctorStatistics.patients.summary.averageConsultations")}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Calculator className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-purple-700">
                {summary.averageConsultationsPerPatientInPeriod.toFixed(2)}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {t("doctorStatistics.patients.summary.averageConsultationsDesc")}
            </p>
          </Card>
        </div>
      )}

      {/* Patient List Section */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {/* Search header */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder={t("doctorStatistics.patients.searchPlaceholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl border-slate-200 bg-slate-50/60 focus:bg-white"
            />
          </div>

          {listData && (
            <span className="text-xs text-slate-500 font-medium">
              {t("doctorStatistics.patients.table.pagination", {
                page: listData.page,
                totalPages: listData.totalPages || 1,
                total: listData.totalElements,
              })}
            </span>
          )}
        </div>

        {/* List Error */}
        {listError && !isListLoading && (
          <div className="p-6 text-center text-xs text-red-700 space-y-2">
            <p>{t("doctorStatistics.error.loadFailed")}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchList()}
              className="h-8 rounded-xl text-xs"
            >
              <RotateCw className="w-3.5 h-3.5 mr-1.5" />
              {t("doctorStatistics.filter.refresh")}
            </Button>
          </div>
        )}

        {/* Table Loading */}
        {isListLoading && (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isListLoading &&
          !listError &&
          (!listData?.content || listData.content.length === 0) && (
            <div className="py-12 text-center text-xs text-slate-500 space-y-1">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-600">
                {t("doctorStatistics.patients.table.empty")}
              </p>
            </div>
          )}

        {/* Patients Table */}
        {!isListLoading &&
          !listError &&
          listData?.content &&
          listData.content.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">
                      {t("doctorStatistics.patients.table.patient")}
                    </th>
                    <th className="py-3 px-4">
                      {t("doctorStatistics.patients.table.memberId")}
                    </th>
                    <th className="py-3 px-4 text-center">
                      {t("doctorStatistics.patients.table.totalSessions")}
                    </th>
                    <th className="py-3 px-4 text-center">
                      {t("doctorStatistics.patients.table.completedSessions")}
                    </th>
                    <th className="py-3 px-4">
                      {t("doctorStatistics.patients.table.firstConsultation")}
                    </th>
                    <th className="py-3 px-4">
                      {t("doctorStatistics.patients.table.latestConsultation")}
                    </th>
                    <th className="py-3 px-4">
                      {t("doctorStatistics.patients.table.latestStatus")}
                    </th>
                    <th className="py-3 px-4 text-right">
                      {t("doctorStatistics.patients.table.action")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listData.content.map((patient) => (
                    <tr
                      key={patient.memberId}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Avatar & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 border border-slate-100 shadow-xs shrink-0">
                            <AvatarImage src={patient.avatarUrl || ""} alt={patient.displayName} />
                            <AvatarFallback className="bg-primary-50 text-primary-700 font-bold text-xs">
                              {patient.displayName ? patient.displayName[0].toUpperCase() : "BN"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-slate-900">
                            {patient.displayName}
                          </span>
                        </div>
                      </td>

                      {/* Snowflake ID */}
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {patient.memberId}
                      </td>

                      {/* Total sessions */}
                      <td className="py-3 px-4 text-center font-semibold text-slate-700">
                        {patient.totalConsultations}
                      </td>

                      {/* Completed sessions */}
                      <td className="py-3 px-4 text-center font-semibold text-emerald-600">
                        {patient.completedConsultations}
                      </td>

                      {/* First consultation */}
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {formatDate(patient.firstConsultationAt)}
                      </td>

                      {/* Latest consultation */}
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {formatDate(patient.latestConsultationAt)}
                      </td>

                      {/* Latest status */}
                      <td className="py-3 px-4">
                        {renderStatusBadge(patient.latestConsultationStatus)}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetail(patient.memberId)}
                          className="h-8 px-2.5 rounded-xl text-primary-600 hover:text-primary-700 hover:bg-primary-50 text-xs font-semibold gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{t("doctorStatistics.patients.table.viewDetail")}</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        {/* Pagination Footer */}
        {listData && listData.totalPages > 1 && (
          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              {t("doctorStatistics.detail.pageSummary", {
                page: listData.page,
                totalPages: listData.totalPages,
              })}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 px-3 rounded-xl border-slate-200"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                {t("common:pagination.previous")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!listData.hasMore}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 px-3 rounded-xl border-slate-200"
              >
                {t("common:pagination.next")}
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Patient Detail Modal */}
      <DoctorPatientDetailDialog
        memberId={selectedMemberId}
        open={isDetailOpen}
        onClose={handleCloseDetail}
      />
    </div>
  )
}

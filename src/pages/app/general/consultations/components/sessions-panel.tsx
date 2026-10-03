import { useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Trans, useTranslation } from "react-i18next"
import { RefreshCw, FileText, MessagesSquare, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAppShell } from "@/components/layout/app-shell-context"
import { USER_ROLES } from "@/constants"

import type { ConsultationSessionItem } from "@/types/consultation"
import { EmptyRow, formatDate, statusBadge, canEditFinalSummaryDraft } from "./shared"
import { MemberFinalSummaryDialog } from "./member-final-summary-dialog"
import { DoctorSessionDetailDialog } from "./doctor-session-detail-dialog"
import { RenewalDialog } from "./renewal-dialog"

export function SessionsPanel({
  isAdmin,
  sessions,
  loading,
  selectedSessionId,
  onClose,
  onSessionRefreshed,
}: {
  isAdmin: boolean
  sessions: ConsultationSessionItem[]
  loading: boolean
  selectedSessionId?: string | number | null
  onClose: (session: ConsultationSessionItem) => void
  onSessionRefreshed?: () => void
}) {
  const { t } = useTranslation("consultation")
  const navigate = useNavigate()
  const { effectiveRole } = useAppShell()
  const isDoctor = effectiveRole === USER_ROLES.DOCTOR
  const [summarySessionId, setSummarySessionId] = useState<string | number | null>(null)
  const [doctorSessionId, setDoctorSessionId] = useState<string | number | null>(null)
  const [renewalSession, setRenewalSession] = useState<ConsultationSessionItem | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const handleDoctorDetailOpenChange = useCallback((open: boolean) => {
    if (!open) setDoctorSessionId(null)
  }, [])

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const aActive = a.status === "ACTIVE" ? 1 : 0
      const bActive = b.status === "ACTIVE" ? 1 : 0
      if (aActive !== bActive) return bActive - aActive

      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      if (timeA !== timeB) return timeB - timeA
      return String(b.id).localeCompare(String(a.id), undefined, { numeric: true })
    })
  }, [sessions])

  const totalElements = sortedSessions.length
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize))
  const validCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (validCurrentPage - 1) * pageSize
  const paginatedSessions = sortedSessions.slice(startIndex, startIndex + pageSize)

  const activeSession = sortedSessions.find((s) => s.status === "ACTIVE")

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <CardTitle>{isAdmin ? t("sessionsPanel.titleAdmin") : t("sessionsPanel.titleMember")}</CardTitle>
          <CardDescription>
            {isAdmin 
              ? t("sessionsPanel.descriptionAdmin")
              : t("sessionsPanel.descriptionMember")}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isAdmin && !isDoctor && activeSession && (
          <div className="p-4 rounded-xl border border-success-500/30 bg-success-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success-500"></span>
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-success-950 text-sm">
                    {t("sessionsPanel.activeBanner.title")}
                  </span>
                  <Badge className="bg-success-600 hover:bg-success-700 text-white text-[10px] font-bold">
                    {t("sessionsPanel.activeBanner.badge")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("sessionsPanel.activeBanner.doctor")} <span className="font-medium text-foreground">{activeSession.doctorDisplayName || `#${activeSession.doctorId}`}</span> • {t("sessionsPanel.activeBanner.sessionId", { id: activeSession.id })}
                  {activeSession.lastMessagePreview && (
                    <span className="italic"> • {t("sessionsPanel.activeBanner.latestMessage", { message: activeSession.lastMessagePreview })}</span>
                  )}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => navigate(`/app/general/consultations/${activeSession.id}`)}
              className="gap-1.5 bg-success-600 hover:bg-success-700 text-white shadow-sm shrink-0"
            >
              <MessagesSquare className="w-4 h-4" />
              {t("sessionsPanel.activeBanner.enterNow")}
            </Button>
          </div>
        )}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="whitespace-nowrap min-w-[130px] text-xs font-semibold">{t("sessionsPanel.table.sessionId")}</TableHead>
                <TableHead className="whitespace-nowrap min-w-[160px] text-xs font-semibold">{t("sessionsPanel.table.member")}</TableHead>
                <TableHead className="whitespace-nowrap min-w-[160px] text-xs font-semibold">{t("sessionsPanel.table.doctor")}</TableHead>
                <TableHead className="whitespace-nowrap min-w-[130px] text-xs font-semibold">{t("sessionsPanel.table.status")}</TableHead>
                <TableHead className="whitespace-nowrap min-w-[150px] text-xs font-semibold">{t("sessionsPanel.table.createdAt")}</TableHead>
                <TableHead className="whitespace-nowrap min-w-[150px] text-xs font-semibold">{t("sessionsPanel.table.endsAt")}</TableHead>
                <TableHead className="min-w-[180px] text-xs font-semibold">{t("sessionsPanel.table.lastMessage")}</TableHead>
                <TableHead className="text-right whitespace-nowrap min-w-[180px] text-xs font-semibold">{t("sessionsPanel.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSessions.length === 0 && <EmptyRow colSpan={8} text={loading ? t("sessionsPanel.loading") : t("sessionsPanel.empty")} />}
              {paginatedSessions.map((session) => (
                <TableRow 
                  key={session.id} 
                  data-state={String(selectedSessionId) === String(session.id) ? "selected" : undefined}
                  className={session.status === "ACTIVE" ? "bg-success-50/40 hover:bg-success-50/60 font-medium" : undefined}
                >
                  <TableCell className="font-mono text-xs font-semibold text-primary whitespace-nowrap">#{session.id}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs">{session.memberDisplayName || `#${session.memberId}`}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs">{session.doctorDisplayName || `#${session.doctorId}`}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {statusBadge(session.status)}
                      {isDoctor && session.status === "COMPLETED" && session.summaryClosureStatus === "SUMMARY_PENDING" && (
                        <Badge className="bg-warning-500 hover:bg-warning-600 text-white text-[10px]">
                          {t("sessionsPanel.needsSummary")}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">{formatDate(session.createdAt)}</TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">{formatDate(session.endsAt)}</TableCell>
                  <TableCell>
                    <span className="block max-w-xs truncate text-xs text-slate-500">{session.lastMessagePreview ?? t("sessionsPanel.noMessages")}</span>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2 items-center flex-nowrap">
                    {!isAdmin && !isDoctor && (
                      session.status === "ACTIVE" ? (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/app/general/consultations/${session.id}`)}
                          className="gap-1 shadow-sm"
                        >
                          <MessagesSquare className="w-3.5 h-3.5" />
                          {t("sessionsPanel.actions.enterRoom")}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/app/general/consultations/${session.id}`)}
                          className="gap-1"
                        >
                          <MessagesSquare className="w-3.5 h-3.5" />
                          {t("sessionsPanel.actions.viewMessages")}
                        </Button>
                      )
                    )}
                    {isDoctor && (
                      session.status === "ACTIVE" ? (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/app/management/doctor/consultations/${session.id}`)}
                          className="gap-1 shadow-sm"
                        >
                          <MessagesSquare className="w-3.5 h-3.5" />
                          {t("sessionsPanel.actions.enterVisit")}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/app/management/doctor/consultations/${session.id}`)}
                          className="gap-1"
                        >
                          <MessagesSquare className="w-3.5 h-3.5" />
                          {t("sessionsPanel.actions.viewVisit")}
                        </Button>
                      )
                    )}
                    {isDoctor && canEditFinalSummaryDraft(session) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDoctorSessionId(session.id)}
                        className="gap-1 text-success-700 border-success-300 hover:bg-success-50"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {t("sessionsPanel.actions.summaryDetail")}
                      </Button>
                    )}
                    {!isAdmin && !isDoctor && session.flowType !== "QUEUE_DISPATCH_V1" && (session.status === "ACTIVE" || session.status === "COMPLETED") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRenewalSession(session)}
                        className="gap-1 text-primary hover:bg-primary/5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {t("sessionsPanel.actions.renew")}
                      </Button>
                    )}
                    {isAdmin && session.status === "ACTIVE" && (
                      <Button variant="destructive" size="sm" onClick={() => onClose(session)} disabled={loading}>
                        {t("sessionsPanel.actions.closeSession")}
                      </Button>
                    )}
                    {isAdmin && session.status !== "SCHEDULED" && (
                      <Button variant="outline" size="sm" onClick={() => setSummarySessionId(session.id)}>
                        {t("sessionsPanel.actions.viewSummary")}
                      </Button>
                    )}
                    {!isAdmin && !isDoctor && (session.status === "COMPLETED" || session.status === "CANCELLED") && (
                      <Button variant="outline" size="sm" onClick={() => setSummarySessionId(session.id)}>
                        {t("sessionsPanel.actions.viewSummary")}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>

        {/* Pagination Controls */}
        {totalElements > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs text-muted-foreground border-t border-border/60">
            <div className="flex items-center gap-2">
              <span>{t("sessionsPanel.pagination.show")}</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  setPageSize(Number(val))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5" className="text-xs">{t("sessionsPanel.pagination.perPage", { count: 5 })}</SelectItem>
                  <SelectItem value="10" className="text-xs">{t("sessionsPanel.pagination.perPage", { count: 10 })}</SelectItem>
                  <SelectItem value="20" className="text-xs">{t("sessionsPanel.pagination.perPage", { count: 20 })}</SelectItem>
                </SelectContent>
              </Select>
              <span>
                <Trans
                  t={t}
                  i18nKey="sessionsPanel.pagination.pageInfo"
                  values={{ page: validCurrentPage, totalPages, total: totalElements }}
                  components={{ strong: <strong className="text-foreground font-semibold" /> }}
                />
              </span>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={validCurrentPage <= 1}
                  className="h-8 px-2.5 gap-1 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> {t("sessionsPanel.pagination.previous")}
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - validCurrentPage) <= 1)
                    .map((p, idx, arr) => {
                      const prev = arr[idx - 1]
                      return (
                        <div key={p} className="flex items-center gap-1">
                          {prev && p - prev > 1 && <span className="px-1 text-muted-foreground">...</span>}
                          <Button
                            variant={validCurrentPage === p ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(p)}
                            className="h-8 w-8 p-0 text-xs font-semibold"
                          >
                            {p}
                          </Button>
                        </div>
                      )
                    })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={validCurrentPage >= totalPages}
                  className="h-8 px-2.5 gap-1 text-xs"
                >
                  {t("sessionsPanel.pagination.next")} <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {doctorSessionId && (
        <DoctorSessionDetailDialog
          sessionId={doctorSessionId}
          open={!!doctorSessionId}
          onOpenChange={handleDoctorDetailOpenChange}
          onSessionRefreshed={onSessionRefreshed}
        />
      )}

      <MemberFinalSummaryDialog
        sessionId={summarySessionId || ""}
        open={!!summarySessionId}
        onOpenChange={(open) => {
          if (!open) setSummarySessionId(null)
        }}
        isAdminView={isAdmin}
      />

      {renewalSession && (
        <RenewalDialog
          session={renewalSession}
          open={!!renewalSession}
          onOpenChange={(open) => {
            if (!open) setRenewalSession(null)
          }}
          onSessionRefreshed={onSessionRefreshed}
        />
      )}
    </Card>
  )
}

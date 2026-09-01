import { useState } from "react"
import { Clock, RefreshCw, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAppShell } from "@/components/layout/app-shell-context"
import { USER_ROLES } from "@/constants"

import type { ConsultationSessionItem } from "@/types/consultation"
import { EmptyRow, formatDate, statusBadge, canEditFinalSummaryDraft } from "./shared"
import { MemberFinalSummaryDialog } from "./member-final-summary-dialog"
import { DoctorSessionDetailDialog } from "./doctor-session-detail-dialog"
import { RenewalDialog } from "./renewal-dialog"
import { AdminRenewalsDialog } from "./admin-renewals-dialog"

export function SessionsPanel({
  isAdmin,
  sessions,
  loading,
  selectedSessionId,
  onClose,
  onExpireOverdue,
  onActivateScheduled,
  onSessionRefreshed,
}: {
  isAdmin: boolean
  sessions: ConsultationSessionItem[]
  loading: boolean
  selectedSessionId?: string | number | null
  onClose: (session: ConsultationSessionItem) => void
  onExpireOverdue: () => void
  onActivateScheduled?: () => void
  onSessionRefreshed?: () => void
}) {
  const { effectiveRole } = useAppShell()
  const isDoctor = effectiveRole === USER_ROLES.DOCTOR
  const [summarySessionId, setSummarySessionId] = useState<string | number | null>(null)
  const [doctorSessionId, setDoctorSessionId] = useState<string | number | null>(null)
  const [renewalSession, setRenewalSession] = useState<ConsultationSessionItem | null>(null)
  const [adminRenewalSession, setAdminRenewalSession] = useState<ConsultationSessionItem | null>(null)

  const sortedSessions = [...sessions].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    if (timeA !== timeB) return timeB - timeA
    return String(b.id).localeCompare(String(a.id), undefined, { numeric: true })
  })

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <CardTitle>{isAdmin ? "Quản lý Phiên Tư vấn (Consultation Sessions)" : "Phiên Tư vấn của tôi"}</CardTitle>
          <CardDescription>
            {isAdmin 
              ? "Danh sách tất cả các phiên tư vấn chăm sóc sức khỏe trên hệ thống (Sắp xếp theo mới nhất)." 
              : "Chỉ các phiên đang hoạt động (ACTIVE) mới có thể gửi tin nhắn."}
          </CardDescription>
        </div>
        {isAdmin && (
          <div className="flex flex-wrap gap-2 justify-end">
            {onActivateScheduled && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (window.confirm("Kích hoạt các phiên đã đến giờ?")) {
                    onActivateScheduled()
                  }
                }}
                disabled={loading}
              >
                Kích hoạt phiên đã đến giờ
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onExpireOverdue} disabled={loading}>
              <Clock data-icon="inline-start" />
              Đóng phiên quá hạn
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã phiên</TableHead>
              <TableHead>Hội viên</TableHead>
              <TableHead>Bác sĩ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Hạn kết thúc</TableHead>
              <TableHead>Tin nhắn gần nhất</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSessions.length === 0 && <EmptyRow colSpan={8} text={loading ? "Đang tải danh sách..." : "Không có phiên tư vấn nào."} />}
            {sortedSessions.map((session) => (
              <TableRow key={session.id} data-state={String(selectedSessionId) === String(session.id) ? "selected" : undefined}>
                <TableCell className="font-medium">#{session.id}</TableCell>
                <TableCell>#{session.memberId}</TableCell>
                <TableCell>#{session.doctorId}</TableCell>
                <TableCell>{statusBadge(session.status)}</TableCell>
                <TableCell>{formatDate(session.createdAt)}</TableCell>
                <TableCell>{formatDate(session.endsAt)}</TableCell>
                <TableCell>
                  <span className="block max-w-48 truncate text-neutral-500">{session.lastMessagePreview ?? "Chưa có tin nhắn"}</span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 flex-wrap">
                    {isDoctor && canEditFinalSummaryDraft(session) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDoctorSessionId(session.id)}
                        className="gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Tổng kết / Chi tiết
                      </Button>
                    )}
                    {!isAdmin && !isDoctor && (session.status === "ACTIVE" || session.status === "COMPLETED") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRenewalSession(session)}
                        className="gap-1 text-primary hover:bg-primary/5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Gia hạn
                      </Button>
                    )}
                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAdminRenewalSession(session)}
                        className="gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Quản lý gia hạn
                      </Button>
                    )}
                    {isAdmin && session.status === "ACTIVE" && (
                      <Button variant="destructive" size="sm" onClick={() => onClose(session)} disabled={loading}>
                        Đóng phiên
                      </Button>
                    )}
                    {isAdmin && session.status !== "SCHEDULED" && (
                      <Button variant="outline" size="sm" onClick={() => setSummarySessionId(session.id)}>
                        Xem tổng kết
                      </Button>
                    )}
                    {!isAdmin && !isDoctor && (session.status === "COMPLETED" || session.status === "CANCELLED") && (
                      <Button variant="outline" size="sm" onClick={() => setSummarySessionId(session.id)}>
                        Xem tổng kết
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {doctorSessionId && (
        <DoctorSessionDetailDialog
          sessionId={doctorSessionId}
          open={!!doctorSessionId}
          onOpenChange={(open) => {
            if (!open) setDoctorSessionId(null)
          }}
        />
      )}

      <MemberFinalSummaryDialog
        sessionId={summarySessionId || ""}
        open={!!summarySessionId}
        onOpenChange={(open) => {
          if (!open) setSummarySessionId(null)
        }}
        isAdminView={true}
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

      {adminRenewalSession && (
        <AdminRenewalsDialog
          session={adminRenewalSession}
          open={!!adminRenewalSession}
          onOpenChange={(open) => {
            if (!open) setAdminRenewalSession(null)
          }}
          onSessionRefreshed={onSessionRefreshed}
        />
      )}
    </Card>
  )
}

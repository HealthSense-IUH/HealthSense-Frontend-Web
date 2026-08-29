import { useState } from "react"
import { Clock, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import type { ConsultationSessionItem } from "../types"
import { EmptyRow, formatDate, statusBadge } from "./shared"
import { MemberFinalSummaryDialog } from "./member-final-summary-dialog"
import { RenewalDialog } from "./renewal-dialog"
import { AdminRenewalsDialog } from "./admin-renewals-dialog"

export function SessionsPanel({
  isAdmin,
  sessions,
  loading,
  selectedSessionId,
  onSelect,
  onClose,
  onExpireOverdue,
  onActivateScheduled,
  onSessionRefreshed,
}: {
  isAdmin: boolean
  sessions: ConsultationSessionItem[]
  loading: boolean
  selectedSessionId: string | number | null
  onSelect: (session: ConsultationSessionItem) => void
  onClose: (session: ConsultationSessionItem) => void
  onExpireOverdue: () => void
  onActivateScheduled?: () => void
  onSessionRefreshed?: () => void
}) {
  const [summarySessionId, setSummarySessionId] = useState<string | number | null>(null)
  const [renewalSession, setRenewalSession] = useState<ConsultationSessionItem | null>(null)
  const [adminRenewalSession, setAdminRenewalSession] = useState<ConsultationSessionItem | null>(null)

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <CardTitle>{isAdmin ? "Consultation Sessions Management" : "My Consultations"}</CardTitle>
          <CardDescription>Only ACTIVE sessions can send messages.</CardDescription>
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
              <TableHead>Session</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ends</TableHead>
              <TableHead>Last message</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.length === 0 && <EmptyRow colSpan={7} text={loading ? "Loading sessions..." : "No sessions found."} />}
            {sessions.map((session) => (
              <TableRow key={session.id} data-state={String(selectedSessionId) === String(session.id) ? "selected" : undefined}>
                <TableCell className="font-medium">#{session.id}</TableCell>
                <TableCell>#{session.memberId}</TableCell>
                <TableCell>#{session.doctorId}</TableCell>
                <TableCell>{statusBadge(session.status)}</TableCell>
                <TableCell>{formatDate(session.endsAt)}</TableCell>
                <TableCell>
                  <span className="block max-w-56 truncate text-neutral-500">{session.lastMessagePreview ?? "No messages yet"}</span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 flex-wrap">
                    {session.status === "ACTIVE" && (
                      <Button variant="outline" size="sm" onClick={() => onSelect(session)}>
                        Chat
                      </Button>
                    )}
                    {!isAdmin && (session.status === "ACTIVE" || session.status === "COMPLETED") && (
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
                        Close
                      </Button>
                    )}
                    {isAdmin && (session.status === "COMPLETED" || session.status === "ACTIVE") && (
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

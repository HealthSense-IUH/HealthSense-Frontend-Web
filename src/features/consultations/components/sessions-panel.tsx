import { Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import type { ConsultationSessionItem } from "../types"
import { EmptyRow, formatDate, statusBadge } from "./shared"

export function SessionsPanel({
  isAdmin,
  sessions,
  loading,
  selectedSessionId,
  onSelect,
  onExtend,
  onClose,
  onExpireOverdue,
}: {
  isAdmin: boolean
  sessions: ConsultationSessionItem[]
  loading: boolean
  selectedSessionId: string | number | null
  onSelect: (session: ConsultationSessionItem) => void
  onExtend: (session: ConsultationSessionItem) => void
  onClose: (session: ConsultationSessionItem) => void
  onExpireOverdue: () => void
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <CardTitle>{isAdmin ? "Consultation Sessions Management" : "My Consultations"}</CardTitle>
          <CardDescription>Only ACTIVE sessions can send messages.</CardDescription>
        </div>
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={onExpireOverdue} disabled={loading}>
            <Clock data-icon="inline-start" />
            Expire overdue
          </Button>
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
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => onSelect(session)}>
                      Chat
                    </Button>
                    {isAdmin && session.status === "ACTIVE" && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => onExtend(session)} disabled={loading}>
                          Extend
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => onClose(session)} disabled={loading}>
                          Close
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

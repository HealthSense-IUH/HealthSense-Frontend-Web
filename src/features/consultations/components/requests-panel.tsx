import { MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import type { ConsultationRequestItem } from "../types"
import { EmptyRow, formatDate, statusBadge } from "./shared"

export function RequestsPanel({
  isAdmin,
  requests,
  loading,
  onCancel,
  onApprove,
  onReject,
  onOpenSession,
}: {
  isAdmin: boolean
  requests: ConsultationRequestItem[]
  loading: boolean
  onCancel: (requestId: string | number) => void
  onApprove: (request: ConsultationRequestItem) => void
  onReject: (request: ConsultationRequestItem) => void
  onOpenSession: (sessionId: string | number) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isAdmin ? "Consultation Requests Management" : "My Consultation Requests"}</CardTitle>
        <CardDescription>{isAdmin ? "Approve to create a consultation session, or reject if no suitable doctor is available." : "Track request status from PENDING to APPROVED to open chat session."}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Record</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 && <EmptyRow colSpan={7} text={loading ? "Loading requests..." : "No requests found."} />}
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">#{request.id}</span>
                    <span className="max-w-64 truncate text-xs text-neutral-500">{request.reason}</span>
                  </div>
                </TableCell>
                <TableCell>#{request.memberId}</TableCell>
                <TableCell>{request.healthRecordId ? `#${request.healthRecordId}` : "-"}</TableCell>
                <TableCell>{statusBadge(request.status)}</TableCell>
                <TableCell>{request.assignedDoctorId ?? request.preferredDoctorId ?? "-"}</TableCell>
                <TableCell>{formatDate(request.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {request.consultationSessionId && (
                      <Button variant="outline" size="sm" onClick={() => onOpenSession(request.consultationSessionId!)}>
                        <MessageCircle data-icon="inline-start" />
                        Chat
                      </Button>
                    )}
                    {isAdmin && request.status === "PENDING" && (
                      <>
                        <Button size="sm" onClick={() => onApprove(request)} disabled={loading}>
                          Approve
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => onReject(request)} disabled={loading}>
                          Reject
                        </Button>
                      </>
                    )}
                    {!isAdmin && request.status === "PENDING" && (
                      <Button variant="outline" size="sm" onClick={() => onCancel(request.id)} disabled={loading}>
                        Cancel
                      </Button>
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

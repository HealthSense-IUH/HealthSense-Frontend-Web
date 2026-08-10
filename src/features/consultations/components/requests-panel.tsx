import { MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import type { ConsultationRequestItem } from "../types"
import { EmptyRow, formatDate, statusBadge } from "./shared"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export function RequestsPanel({
  isAdmin,
  requests,
  loading,
  onCancel,
  onApprove,
  onReject,
  onOpenSession,
  onSubmitMoreInfo,
  adminFilters,
  onAdminFilterChange,
  onSearchAdminFilters,
}: {
  isAdmin: boolean
  requests: ConsultationRequestItem[]
  loading: boolean
  onCancel: (requestId: string | number) => void
  onApprove: (request: ConsultationRequestItem) => void
  onReject: (request: ConsultationRequestItem) => void
  onOpenSession: (sessionId: string | number) => void
  onSubmitMoreInfo?: (request: ConsultationRequestItem) => void
  adminFilters?: {
    status: string
    memberId: string
    preferredDoctorId: string
    assignedDoctorId: string
    fromDate: string
    toDate: string
  }
  onAdminFilterChange?: (filters: any) => void
  onSearchAdminFilters?: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isAdmin ? "Consultation Requests Management" : "My Consultation Requests"}</CardTitle>
        <CardDescription>{isAdmin ? "Review and assign doctors for consultation requests." : "Track request status from PENDING to APPROVED to open chat session."}</CardDescription>
      </CardHeader>
      <CardContent>
        {isAdmin && adminFilters && onAdminFilterChange && onSearchAdminFilters && (
          <div className="flex flex-wrap gap-3 mb-4 p-4 border rounded-md bg-muted/20">
            <div className="flex flex-col gap-1.5 w-[140px]">
              <span className="text-xs font-medium">Status</span>
              <Select value={adminFilters.status} onValueChange={(v) => onAdminFilterChange({ ...adminFilters, status: v === "ALL" ? "" : v })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                  <SelectItem value="NEED_MORE_INFO">Need More Info</SelectItem>
                  <SelectItem value="WAITING_PAYMENT">Waiting Payment</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-1.5 w-[120px]">
              <span className="text-xs font-medium">Member ID</span>
              <Input 
                className="h-8 text-xs" 
                placeholder="ID..." 
                value={adminFilters.memberId}
                onChange={(e) => onAdminFilterChange({ ...adminFilters, memberId: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && onSearchAdminFilters()}
              />
            </div>
            
            <div className="flex flex-col gap-1.5 w-[120px]">
              <span className="text-xs font-medium">Pref. Doctor ID</span>
              <Input 
                className="h-8 text-xs" 
                placeholder="ID..." 
                value={adminFilters.preferredDoctorId}
                onChange={(e) => onAdminFilterChange({ ...adminFilters, preferredDoctorId: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && onSearchAdminFilters()}
              />
            </div>

            <div className="flex flex-col gap-1.5 w-[140px]">
              <span className="text-xs font-medium">From Date</span>
              <Input 
                type="date"
                className="h-8 text-xs" 
                value={adminFilters.fromDate}
                onChange={(e) => onAdminFilterChange({ ...adminFilters, fromDate: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5 w-[140px]">
              <span className="text-xs font-medium">To Date</span>
              <Input 
                type="date"
                className="h-8 text-xs" 
                value={adminFilters.toDate}
                onChange={(e) => onAdminFilterChange({ ...adminFilters, toDate: e.target.value })}
              />
            </div>

            <div className="flex items-end pb-0.5">
              <Button size="sm" className="h-8" onClick={onSearchAdminFilters} disabled={loading}>
                <Search className="w-3 h-3 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        )}

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
                    <span className="max-w-64 text-xs text-neutral-500 whitespace-pre-wrap">{request.reason}</span>
                    {request.status === "WAITING_PAYMENT" && (
                      <div className="mt-1 text-xs text-blue-600 bg-blue-50 p-2 rounded-md">
                        Yêu cầu đã được giữ bác sĩ và đang chờ thanh toán.
                        {request.paymentDeadline && (
                          <div className="mt-1 font-semibold">
                            Vui lòng hoàn tất thanh toán trước: {formatDate(request.paymentDeadline)}
                          </div>
                        )}
                      </div>
                    )}
                    {request.status === "NEED_MORE_INFO" && request.moreInfoReason && (
                      <div className="mt-1 text-xs text-orange-600 bg-orange-50 p-2 rounded-md">
                        <strong>Lý do cần bổ sung:</strong> {request.moreInfoReason}
                      </div>
                    )}
                    {request.memberAdditionalNote && (
                      <div className="mt-1 text-xs text-neutral-600 bg-neutral-50 p-2 rounded-md">
                        <strong>Thông tin đã bổ sung:</strong> {request.memberAdditionalNote}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>#{request.memberId}</TableCell>
                <TableCell>{request.healthRecordId ? `#${request.healthRecordId}` : "-"}</TableCell>
                <TableCell>{statusBadge(request.status)}</TableCell>
                <TableCell>{request.assignedDoctorId ?? request.preferredDoctorId ?? "-"}</TableCell>
                <TableCell>{formatDate(request.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {request.consultationSessionId && !["PENDING_REVIEW", "NEED_MORE_INFO", "WAITING_PAYMENT", "REJECTED", "CANCELLED", "EXPIRED", "PENDING"].includes(request.status) && (
                      <Button variant="outline" size="sm" onClick={() => onOpenSession(request.consultationSessionId!)}>
                        <MessageCircle data-icon="inline-start" />
                        Chat
                      </Button>
                    )}
                    {!isAdmin && request.status === "NEED_MORE_INFO" && onSubmitMoreInfo && (
                      <Button size="sm" onClick={() => onSubmitMoreInfo(request)} disabled={loading}>
                        Bổ sung thông tin
                      </Button>
                    )}
                    {isAdmin && (
                      <>
                        <Button size="sm" onClick={() => onApprove(request)} disabled={loading}>
                          Review Details
                        </Button>
                      </>
                    )}
                    {!isAdmin && (request.status === "PENDING" || request.status === "PENDING_REVIEW") && (
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

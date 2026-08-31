import { MessageCircle, CreditCard, Shield, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import type { ConsultationRequestItem } from "@/types/consultation"
import { EmptyRow, formatDate, statusBadge } from "./shared"

export function RequestsPanel({
  isAdmin,
  requests,
  loading,
  onCancel,
  onApprove,
  onOpenSession,
  onSubmitMoreInfo,
  onReviewAgreement,
  adminFilters,
  onAdminFilterChange,
  onSearchAdminFilters,
  onInitiatePayment,
  onExpireWaitingPayment,
}: {
  isAdmin: boolean
  requests: ConsultationRequestItem[]
  loading: boolean
  onCancel: (requestId: string | number) => void
  onApprove: (request: ConsultationRequestItem) => void
  onOpenSession: (sessionId: string | number) => void
  onSubmitMoreInfo?: (request: ConsultationRequestItem) => void
  onReviewAgreement?: (request: ConsultationRequestItem) => void
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
  onInitiatePayment?: (requestId: string | number) => void
  onExpireWaitingPayment?: () => void
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{isAdmin ? "Quản lý Yêu cầu Tư vấn (Care Coordination)" : "Yêu cầu Tư vấn của tôi"}</CardTitle>
          <CardDescription>
            {isAdmin
              ? "Xem xét yêu cầu, điều phối bác sĩ và theo dõi trạng thái thỏa thuận."
              : "Theo dõi tiến trình từ gửi yêu cầu, xác nhận thỏa thuận, thanh toán đến khi mở phiên tư vấn."}
          </CardDescription>
        </div>
        {isAdmin && onExpireWaitingPayment && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              if (window.confirm("Quét và huỷ các yêu cầu quá hạn thanh toán / quá hạn xác nhận?")) {
                onExpireWaitingPayment()
              }
            }}
            disabled={loading}
          >
            Quét yêu cầu quá hạn
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isAdmin && adminFilters && onAdminFilterChange && onSearchAdminFilters && (
          <div className="flex flex-wrap gap-3 mb-4 p-4 border rounded-md bg-muted/20">
            <div className="flex flex-col gap-1.5 w-[160px]">
              <span className="text-xs font-medium">Trạng thái</span>
              <Select value={adminFilters.status} onValueChange={(v) => onAdminFilterChange({ ...adminFilters, status: v === "ALL" ? "" : v })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  <SelectItem value="PENDING_REVIEW">Chờ xem xét</SelectItem>
                  <SelectItem value="NEED_MORE_INFO">Cần bổ sung TT</SelectItem>
                  <SelectItem value="WAITING_ACCEPTANCE">Chờ xác nhận thỏa thuận</SelectItem>
                  <SelectItem value="WAITING_PAYMENT">Chờ thanh toán</SelectItem>
                  <SelectItem value="FULFILLED">Đã kích hoạt</SelectItem>
                  <SelectItem value="REJECTED">Đã từ chối</SelectItem>
                  <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                  <SelectItem value="EXPIRED">Đã hết hạn</SelectItem>
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
              <span className="text-xs font-medium">Từ ngày</span>
              <Input 
                type="date"
                className="h-8 text-xs" 
                value={adminFilters.fromDate}
                onChange={(e) => onAdminFilterChange({ ...adminFilters, fromDate: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5 w-[140px]">
              <span className="text-xs font-medium">Đến ngày</span>
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
                Lọc
              </Button>
            </div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Yêu cầu</TableHead>
              <TableHead>Hội viên</TableHead>
              <TableHead>Hồ sơ đo</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Bác sĩ</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 && <EmptyRow colSpan={7} text={loading ? "Đang tải danh sách..." : "Không có yêu cầu nào."} />}
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">#{request.id}</span>
                    <span className="max-w-64 text-xs text-neutral-500 whitespace-pre-wrap">
                      {request.reasonForCare || request.reason || "Yêu cầu tư vấn"}
                    </span>
                    
                    {request.status === "WAITING_ACCEPTANCE" && (
                      <div className="mt-1 text-xs text-amber-800 bg-amber-50 dark:bg-amber-950/20 p-2 rounded-md border border-amber-200">
                        Bác sĩ đã được giữ chỗ. Vui lòng xem và xác nhận Thỏa thuận dịch vụ để tiến hành thanh toán.
                        {request.paymentDeadline && (
                          <div className="mt-1 font-semibold">
                            Hạn xác nhận: {formatDate(request.paymentDeadline)}
                          </div>
                        )}
                      </div>
                    )}

                    {request.status === "WAITING_PAYMENT" && (
                      <div className="mt-1 text-xs text-blue-700 bg-blue-50 dark:bg-blue-950/20 p-2 rounded-md border border-blue-200">
                        Đã xác nhận thỏa thuận. Đang chờ thanh toán.
                        {request.paymentDeadline && (
                          <div className="mt-1 font-semibold">
                            Hạn thanh toán: {formatDate(request.paymentDeadline)}
                          </div>
                        )}
                      </div>
                    )}

                    {request.status === "NEED_MORE_INFO" && request.moreInfoReason && (
                      <div className="mt-1 text-xs text-orange-700 bg-orange-50 dark:bg-orange-950/20 p-2 rounded-md border border-orange-200">
                        <strong>Lý do cần bổ sung:</strong> {request.moreInfoReason}
                      </div>
                    )}

                    {request.memberAdditionalNote && (
                      <div className="mt-1 text-xs text-neutral-600 bg-neutral-50 dark:bg-neutral-900/30 p-2 rounded-md">
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
                  <div className="flex justify-end gap-2 flex-wrap">
                    {request.consultationSessionId && !["PENDING_REVIEW", "NEED_MORE_INFO", "WAITING_ACCEPTANCE", "WAITING_PAYMENT", "REJECTED", "CANCELLED", "EXPIRED", "PENDING"].includes(request.status) && (
                      <Button variant="outline" size="sm" onClick={() => onOpenSession(request.consultationSessionId!)}>
                        <MessageCircle className="mr-1.5 h-4 w-4" />
                        Chat
                      </Button>
                    )}
                    
                    {!isAdmin && request.status === "WAITING_ACCEPTANCE" && onReviewAgreement && (
                      <Button
                        size="sm"
                        onClick={() => onReviewAgreement(request)}
                        disabled={loading}
                        className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shadow-xs"
                      >
                        <Shield className="h-4 w-4" />
                        Xem & Chấp nhận thỏa thuận
                      </Button>
                    )}

                    {!isAdmin && request.status === "WAITING_PAYMENT" && onInitiatePayment && (
                      <Button size="sm" onClick={() => onInitiatePayment(request.id)} disabled={loading} className="gap-1.5">
                        <CreditCard className="h-4 w-4" />
                        Thanh toán
                      </Button>
                    )}

                    {!isAdmin && request.status === "NEED_MORE_INFO" && onSubmitMoreInfo && (
                      <Button size="sm" onClick={() => onSubmitMoreInfo(request)} disabled={loading}>
                        Bổ sung thông tin
                      </Button>
                    )}

                    {isAdmin && (
                      <Button size="sm" onClick={() => onApprove(request)} disabled={loading}>
                        Xem chi tiết & Điều phối
                      </Button>
                    )}

                    {!isAdmin && ["PENDING", "PENDING_REVIEW", "NEED_MORE_INFO", "WAITING_ACCEPTANCE", "WAITING_PAYMENT"].includes(request.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (window.confirm("Bạn có chắc chắn muốn hủy yêu cầu tư vấn này?")) {
                            onCancel(request.id)
                          }
                        }}
                        disabled={loading}
                        className="text-neutral-600 hover:text-red-600 hover:border-red-300"
                      >
                        Hủy yêu cầu
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

import { CreditCard, Shield, Search } from "lucide-react"

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
  onSubmitMoreInfo,
  onReviewAgreement,
  adminFilters,
  onAdminFilterChange,
  onSearchAdminFilters,
  onInitiatePayment,
}: {
  isAdmin: boolean
  requests: ConsultationRequestItem[]
  loading: boolean
  onCancel: (requestId: string | number) => void
  onApprove: (request: ConsultationRequestItem) => void
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
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{isAdmin ? "Quản lý Yêu cầu Tư vấn" : "Yêu cầu Tư vấn của tôi"}</CardTitle>
          <CardDescription>
            {isAdmin
              ? "Xem xét yêu cầu, điều phối bác sĩ và theo dõi trạng thái thỏa thuận."
              : "Theo dõi tiến trình từ gửi yêu cầu, xác nhận thỏa thuận, thanh toán đến khi mở phiên tư vấn."}
          </CardDescription>
        </div>
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
              <span className="text-xs font-medium">Mã hội viên</span>
              <Input 
                className="h-8 text-xs" 
                placeholder="ID..." 
                value={adminFilters.memberId}
                onChange={(e) => onAdminFilterChange({ ...adminFilters, memberId: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && onSearchAdminFilters()}
              />
            </div>
            
            <div className="flex flex-col gap-1.5 w-[130px]">
              <span className="text-xs font-medium">BS mong muốn</span>
              <Input 
                className="h-8 text-xs" 
                placeholder="ID bác sĩ..." 
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

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="min-w-[260px] text-xs font-semibold">Yêu cầu</TableHead>
                <TableHead className="whitespace-nowrap min-w-[150px] text-xs font-semibold">Hội viên</TableHead>
                <TableHead className="whitespace-nowrap min-w-[140px] text-xs font-semibold">Hồ sơ đo</TableHead>
                <TableHead className="whitespace-nowrap min-w-[130px] text-xs font-semibold">Trạng thái</TableHead>
                <TableHead className="whitespace-nowrap min-w-[150px] text-xs font-semibold">Bác sĩ</TableHead>
                <TableHead className="whitespace-nowrap min-w-[150px] text-xs font-semibold">Ngày tạo</TableHead>
                <TableHead className="text-right whitespace-nowrap min-w-[170px] text-xs font-semibold">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 && <EmptyRow colSpan={7} text={loading ? "Đang tải danh sách..." : "Không có yêu cầu nào."} />}
              {requests.map((request) => (
                <TableRow key={request.id} className="hover:bg-muted/20">
                  <TableCell className="min-w-[260px]">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-semibold text-xs text-primary">#{request.id}</span>
                        {request.flowType === "QUEUE_DISPATCH_V1" && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                            Hàng đợi {request.queueNumber ? `#${String(request.queueNumber).padStart(3, "0")}` : ""}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                        {request.reasonForCare || request.reason || "Yêu cầu tư vấn"}
                      </span>
                      
                      {request.flowType !== "QUEUE_DISPATCH_V1" && request.status === "WAITING_ACCEPTANCE" && (
                        <div className="mt-1 text-xs text-warning-800 bg-warning-50 p-2 rounded-md border border-warning-200">
                          Bác sĩ đã được giữ chỗ. Vui lòng xem và xác nhận Thỏa thuận dịch vụ để tiến hành thanh toán.
                          {request.paymentDeadline && (
                            <div className="mt-1 font-semibold">
                              Hạn xác nhận: {formatDate(request.paymentDeadline)}
                            </div>
                          )}
                        </div>
                      )}

                      {request.flowType !== "QUEUE_DISPATCH_V1" && request.status === "WAITING_PAYMENT" && (
                        <div className="mt-1 text-xs text-primary-700 bg-primary-50 p-2 rounded-md border border-primary-200">
                          Đã xác nhận thỏa thuận. Đang chờ thanh toán.
                          {request.paymentDeadline && (
                            <div className="mt-1 font-semibold">
                              Hạn thanh toán: {formatDate(request.paymentDeadline)}
                            </div>
                          )}
                        </div>
                      )}

                      {request.status === "NEED_MORE_INFO" && request.moreInfoReason && (
                        <div className="mt-1 text-xs text-warning-700 bg-warning-50 p-2 rounded-md border border-warning-200">
                          <strong>Lý do cần bổ sung:</strong> {request.moreInfoReason}
                        </div>
                      )}

                      {request.memberAdditionalNote && (
                        <div className="mt-1 text-xs text-slate-600 bg-slate-50 p-2 rounded-md">
                          <strong>Thông tin đã bổ sung:</strong> {request.memberAdditionalNote}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">#{request.memberId}</TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">{request.healthRecordId ? `#${request.healthRecordId}` : "—"}</TableCell>
                  <TableCell className="whitespace-nowrap">{statusBadge(request.queueStatus || request.status)}</TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs">{request.assignedDoctorId ? `#${request.assignedDoctorId}` : (request.preferredDoctorId ? `#${request.preferredDoctorId}` : "—")}</TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">{formatDate(request.createdAt)}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2 items-center flex-nowrap">
                      {!isAdmin && request.flowType !== "QUEUE_DISPATCH_V1" && request.status === "WAITING_ACCEPTANCE" && onReviewAgreement && (
                        <Button
                          size="sm"
                          onClick={() => onReviewAgreement(request)}
                          disabled={loading}
                          className="bg-warning-600 hover:bg-warning-700 text-white gap-1.5 shadow-xs whitespace-nowrap"
                        >
                          <Shield className="h-4 w-4" />
                          Xem & Chấp nhận thỏa thuận
                        </Button>
                      )}

                      {!isAdmin && request.flowType !== "QUEUE_DISPATCH_V1" && request.status === "WAITING_PAYMENT" && onInitiatePayment && (
                        <Button size="sm" onClick={() => onInitiatePayment(request.id)} disabled={loading} className="gap-1.5 whitespace-nowrap">
                          <CreditCard className="h-4 w-4" />
                          Thanh toán
                        </Button>
                      )}

                      {!isAdmin && request.flowType !== "QUEUE_DISPATCH_V1" && request.status === "NEED_MORE_INFO" && onSubmitMoreInfo && (
                        <Button size="sm" onClick={() => onSubmitMoreInfo(request)} disabled={loading} className="whitespace-nowrap">
                          Bổ sung thông tin
                        </Button>
                      )}

                      {isAdmin && (
                        <Button size="sm" onClick={() => onApprove(request)} disabled={loading} className="whitespace-nowrap">
                          Xem chi tiết
                        </Button>
                      )}

                      {!isAdmin && (request.flowType === "QUEUE_DISPATCH_V1" ? request.status === "QUEUED" : ["PENDING", "PENDING_REVIEW", "NEED_MORE_INFO", "WAITING_ACCEPTANCE", "WAITING_PAYMENT"].includes(request.status)) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (window.confirm("Bạn có chắc chắn muốn hủy yêu cầu tư vấn này?")) {
                              onCancel(request.id)
                            }
                          }}
                          disabled={loading}
                          className="text-slate-600 hover:text-danger-600 hover:border-danger-200 whitespace-nowrap"
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
        </div>
      </CardContent>
    </Card>
  )
}

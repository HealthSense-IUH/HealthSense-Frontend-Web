import { useEffect, useState, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ShieldAlert, RefreshCw, Eye, MessageSquare, AlertTriangle, FileText, Calendar, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { USER_ROLES } from "@/constants"
import { useAppShell } from "@/components/layout/app-shell-context"

import { consultationApi } from "@/services"
import type { 
  DoctorConsultationSessionResponse,
  DoctorDispatchStatusResponse,
  DoctorConsultationOfferResponse,
  DoctorCareProfileResponse,
} from "@/types/consultation"
import { formatDate } from "@/pages/app/general/consultations/components/shared"
import { DoctorSessionDetailDialog } from "@/pages/app/general/consultations/components/doctor-session-detail-dialog"
import { DoctorDispatchHeader } from "@/pages/app/management/doctor-consultations/components/doctor-dispatch-header"
import { DoctorOfferCard } from "@/pages/app/management/doctor-consultations/components/doctor-offer-card"
import { DoctorScheduleDialog } from "@/pages/app/management/doctor-consultations/components/doctor-schedule-dialog"

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err.response?.data?.message || err.message || fallback
}

function getSessionStatusBadge(status: string, meaningfulCareOccurred?: boolean | null) {
  switch (status) {
    case "SCHEDULED":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Đã lên lịch</Badge>
    case "ACTIVE":
      return <Badge className="bg-emerald-500 hover:bg-emerald-600">Đang chăm sóc</Badge>
    case "COMPLETED":
      return <Badge variant="secondary" className="bg-neutral-100 text-neutral-700">Đã hoàn tất</Badge>
    case "CANCELLED":
      return meaningfulCareOccurred ? (
        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300">
          Đã hủy (Có chăm sóc)
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Đã hủy
        </Badge>
      )
    case "EXPIRED":
      return <Badge variant="destructive">Đã hết hạn</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function DoctorSessionsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { effectiveRole } = useAppShell()
  const isDoctor = effectiveRole === USER_ROLES.DOCTOR

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [sessions, setSessions] = useState<DoctorConsultationSessionResponse[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<string | number | null>(null)

  const handleDoctorDetailOpenChange = useCallback((open: boolean) => {
    if (!open) setSelectedSessionId(null)
  }, [])

  // Queue Dispatch V1 States
  const [dispatchStatus, setDispatchStatus] = useState<DoctorDispatchStatusResponse | null>(null)
  const [currentOffer, setCurrentOffer] = useState<DoctorConsultationOfferResponse | null>(null)
  const isPollingRef = useRef(false)

  // Doctor Care Profile States
  const [careProfile, setCareProfile] = useState<DoctorCareProfileResponse | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  
  // Load sessions list
  const loadSessions = useCallback(async (pageNum: number, isRefresh = false) => {
    if (!isDoctor) return
    try {
      setLoading(true)
      const res = await consultationApi.getDoctorSessions({ page: pageNum, size: 10 })
      const data = res.data.content || []
      
      if (isRefresh || pageNum === 1) {
        setSessions(data)
      } else {
        setSessions(prev => [...prev, ...data])
      }
      
      setHasMore(data.length === 10)
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } }
      if (err?.response?.status === 403) {
        toast({ variant: "destructive", description: "Bạn không có quyền truy cập trang bác sĩ." })
      } else {
        toast({ variant: "destructive", description: readError(error, "Lỗi tải danh sách phiên chăm sóc.") })
      }
    } finally {
      setLoading(false)
    }
  }, [isDoctor, toast])

  // Fetch Care Profile (Precondition for Dispatch V1)
  const fetchCareProfile = useCallback(async () => {
    if (!isDoctor) return
    try {
      setProfileLoading(true)
      const res = await consultationApi.getMyDoctorCareProfile()
      setCareProfile(res.data)
      setHasProfile(true)
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { code?: number } } }
      const errCode = error.response?.data?.code
      if (errCode === 4013 || error.response?.status === 404) {
        // Missing care profile - Expected for newly assigned doctors
        setCareProfile(null)
        setHasProfile(false)
        setDispatchStatus(null)
        setCurrentOffer(null)
      } else {
        setHasProfile(false)
        toast({
          variant: "destructive",
          description: readError(err, "Không thể tải hồ sơ trực của bác sĩ."),
        })
      }
    } finally {
      setProfileLoading(false)
    }
  }, [isDoctor, toast])

  // Fetch Dispatch Status & Current Offer (ONLY if hasProfile is true)
  const fetchDispatchAndOffer = useCallback(async () => {
    if (!isDoctor || !hasProfile) return
    try {
      // 1. Fetch dispatch status
      const statusRes = await consultationApi.getDoctorDispatchStatus()
      const newStatus = statusRes.data
      setDispatchStatus(newStatus)

      // 2. Fetch current offer
      try {
        const offerRes = await consultationApi.getDoctorCurrentOffer()
        setCurrentOffer(offerRes.data)
      } catch (err: unknown) {
        const error = err as { response?: { status?: number } }
        if (error.response?.status === 404) {
          setCurrentOffer(null)
        }
      }

      // If doctor is BUSY and has a busySessionId, refresh sessions if needed
      if (newStatus.dispatchStatus === "BUSY" && newStatus.busySessionId) {
        // Session is live, reload sessions list to include the newly created session
        void loadSessions(1, true)
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { code?: number } } }
      if (error.response?.data?.code === 4013) {
        setHasProfile(false)
        setDispatchStatus(null)
        setCurrentOffer(null)
      }
    }
  }, [isDoctor, hasProfile, loadSessions])

  // Initial load
  useEffect(() => {
    if (isDoctor) {
      void loadSessions(1, true)
      void fetchCareProfile()
    }
  }, [isDoctor, loadSessions, fetchCareProfile])

  // Trigger initial dispatch fetch when profile becomes available
  useEffect(() => {
    if (isDoctor && hasProfile) {
      void fetchDispatchAndOffer()
    }
  }, [isDoctor, hasProfile, fetchDispatchAndOffer])

  // 4s polling ONLY when doctor is active AND hasProfile is true
  useEffect(() => {
    if (!isDoctor || !hasProfile) return

    const timer = setInterval(() => {
      if (isPollingRef.current) return
      isPollingRef.current = true
      fetchDispatchAndOffer().finally(() => {
        isPollingRef.current = false
      })
    }, 4000)

    return () => clearInterval(timer)
  }, [isDoctor, hasProfile, fetchDispatchAndOffer])

  // Handler: toggle dispatch status AVAILABLE <-> UNAVAILABLE
  const handleToggleDispatchStatus = async (newStatus: "AVAILABLE" | "UNAVAILABLE") => {
    try {
      setActionLoading(true)
      const res = await consultationApi.updateDoctorDispatchStatus(newStatus)
      setDispatchStatus(res.data)
      toast({
        variant: "default",
        description:
          newStatus === "AVAILABLE"
            ? "Đã kích hoạt chế độ sẵn sàng nhận bệnh."
            : "Đã tạm dừng nhận bệnh mới.",
      })
    } catch (error) {
      toast({ variant: "destructive", description: readError(error, "Không thể cập nhật trạng thái trực.") })
    } finally {
      setActionLoading(false)
    }
  }

  // Handler: toggle stop after current session
  const handleToggleStopAfterCurrentSession = async (stop: boolean) => {
    try {
      const res = await consultationApi.updateDoctorDispatchPreferences(stop)
      setDispatchStatus(res.data)
      toast({
        variant: "default",
        description: stop
          ? "Đã bật: Sẽ chuyển sang nghỉ trực sau khi kết thúc phiên khám hiện tại."
          : "Đã tắt: Sẽ tiếp tục nhận ca sau khi kết thúc phiên.",
      })
    } catch (error) {
      toast({ variant: "destructive", description: readError(error, "Không thể cập nhật tùy chọn.") })
    }
  }

  // Handler: Accept consultation offer
  const handleAcceptOffer = async (offerId: string) => {
    try {
      setActionLoading(true)
      const res = await consultationApi.acceptDoctorOffer(offerId)
      setCurrentOffer(res.data)
      toast({
        variant: "default",
        description: "Đã tiếp nhận ca tư vấn! Đang chờ người bệnh xác nhận để bắt đầu phiên...",
      })
      // Immediately refetch dispatch status
      await fetchDispatchAndOffer()
    } catch (error) {
      toast({ variant: "destructive", description: readError(error, "Không thể tiếp nhận ca khám hoặc lời mời đã hết hạn.") })
      await fetchDispatchAndOffer()
    } finally {
      setActionLoading(false)
    }
  }

  // Handler: Reject consultation offer
  const handleRejectOffer = async (offerId: string) => {
    try {
      setActionLoading(true)
      await consultationApi.rejectDoctorOffer(offerId)
      setCurrentOffer(null)
      toast({
        variant: "default",
        description: "Đã từ chối ca tư vấn. Ca khám sẽ được chuyển tiếp cho bác sĩ khác trong hàng đợi.",
      })
      await fetchDispatchAndOffer()
    } catch (error) {
      toast({ variant: "destructive", description: readError(error, "Không thể từ chối ca khám.") })
      await fetchDispatchAndOffer()
    } finally {
      setActionLoading(false)
    }
  }

  if (!isDoctor) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Quyền truy cập bị từ chối</h2>
        <p className="text-neutral-500 mb-6">Bạn không có quyền truy cập trang bác sĩ.</p>
        <Button onClick={() => navigate("/app/general/dashboard")}>Về trang chủ</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Doctor Dispatch Header */}
      <DoctorDispatchHeader
        dispatchStatus={dispatchStatus}
        loading={loading}
        actionLoading={actionLoading}
        hasProfile={hasProfile}
        profileLoading={profileLoading}
        onToggleStatus={handleToggleDispatchStatus}
        onToggleStopAfterCurrentSession={handleToggleStopAfterCurrentSession}
        onRetryProfile={fetchCareProfile}
        onOpenScheduleDialog={() => setIsScheduleOpen(true)}
      />

      {/* 2. Current Offer Card if any */}
      {currentOffer && (
        <DoctorOfferCard
          offer={currentOffer}
          actionLoading={actionLoading}
          onAccept={handleAcceptOffer}
          onReject={handleRejectOffer}
          onOfferExpired={fetchDispatchAndOffer}
        />
      )}

      {/* 3. Session list header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Phiên chăm sóc (Active Care)</h2>
          <p className="text-neutral-500">Quản lý các phiên chăm sóc và tư vấn cho bệnh nhân.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            void loadSessions(1, true)
            void fetchDispatchAndOffer()
          }}
          disabled={loading || actionLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {loading && sessions.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <Card className="border-dashed bg-neutral-50/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-neutral-300 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-1">Chưa có phiên chăm sóc nào</h3>
            <p className="text-sm text-neutral-500">Bạn chưa được phân công phiên chăm sóc nào vào lúc này.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sessions.map(session => (
            <Card key={session.id} className="group hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold line-clamp-1">
                      Bệnh nhân #{session.memberId}
                    </CardTitle>
                    <CardDescription className="text-xs font-mono mt-1">
                      ID: {session.id}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.status === "COMPLETED" && session.summaryClosureStatus === "SUMMARY_PENDING" && (
                      <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs">
                        Cần tổng kết
                      </Badge>
                    )}
                    {getSessionStatusBadge(session.status, session.meaningfulCareOccurred)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3 space-y-4">
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                  <div className="flex items-start gap-2 text-neutral-600">
                    <Calendar className="h-4 w-4 shrink-0 text-neutral-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-neutral-900">Bắt đầu</p>
                      <p>{formatDate(session.startedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-neutral-600">
                    <Clock className="h-4 w-4 shrink-0 text-neutral-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-neutral-900">Kết thúc</p>
                      <p>{formatDate(session.endsAt) || 'Không xác định'}</p>
                    </div>
                  </div>
                </div>

                {session.status === "CANCELLED" && session.meaningfulCareOccurred && (
                  <div className="bg-amber-50/80 border border-amber-200 rounded-md p-3 flex items-start gap-2.5 text-xs text-amber-900">
                    <FileText className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Phiên đã hủy nhưng có phát sinh chăm sóc</p>
                      <p className="text-amber-700 mt-0.5">Bác sĩ vẫn có thể lập và hoàn tất bản Tổng kết y khoa.</p>
                    </div>
                  </div>
                )}

                {session.unresolvedAttentionCount > 0 && (
                  <div className="bg-orange-50 border border-orange-100 rounded-md p-3 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">
                        Có {session.unresolvedAttentionCount} hồ sơ cần xem
                      </p>
                      <p className="text-xs text-orange-700 mt-0.5">Sẽ bổ sung chi tiết ở batch tiếp theo.</p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-3 border-t bg-neutral-50/50 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setSelectedSessionId(session.id)}
                >
                  <Eye className="h-4 w-4 mr-2" /> Xem chi tiết
                </Button>
                {session.status === "ACTIVE" && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate(`/app/general/consultations?tab=chat&sessionId=${session.id}`)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" /> Mở Chat
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button 
            variant="outline" 
            onClick={() => {
              const nextPage = page + 1
              setPage(nextPage)
              loadSessions(nextPage)
            }}
            disabled={loading}
          >
            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
            Tải thêm
          </Button>
        </div>
      )}

      {selectedSessionId && (
        <DoctorSessionDetailDialog 
          sessionId={selectedSessionId} 
          open={!!selectedSessionId} 
          onOpenChange={handleDoctorDetailOpenChange} 
          onSessionRefreshed={() => {
            void loadSessions(1, true)
            void fetchDispatchAndOffer()
          }}
        />
      )}

      <DoctorScheduleDialog
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        currentProfile={careProfile}
        onSuccess={() => {
          void fetchCareProfile()
        }}
      />
    </div>
  )
}

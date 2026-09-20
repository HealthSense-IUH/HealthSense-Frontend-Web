import { useEffect, useState, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { DoctorSessionDetailDialog } from "@/pages/app/general/consultations/components/doctor-session-detail-dialog"
import { DoctorDispatchHeader } from "@/pages/app/management/doctor-consultations/components/doctor-dispatch-header"
import { DoctorOfferCard } from "@/pages/app/management/doctor-consultations/components/doctor-offer-card"
import { DoctorScheduleDialog } from "@/pages/app/management/doctor-consultations/components/doctor-schedule-dialog"
import { DoctorSessionsTable } from "@/pages/app/management/doctor-consultations/components/doctor-sessions-table"

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err.response?.data?.message || err.message || fallback
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
  const [size, setSize] = useState(10)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
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
  const loadSessions = useCallback(async (pageNum: number, pageSize = size) => {
    if (!isDoctor) return
    try {
      setLoading(true)
      const res = await consultationApi.getDoctorSessions({ page: pageNum, size: pageSize })
      const data = res.data.content || []
      setSessions(data)
      setTotalElements(res.data.totalElements ?? data.length)
      setTotalPages(res.data.totalPages ?? 1)
      setPage(res.data.page ?? pageNum)
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
  }, [isDoctor, size, toast])

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
        void loadSessions(1, size)
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { code?: number } } }
      if (error.response?.data?.code === 4013) {
        setHasProfile(false)
        setDispatchStatus(null)
        setCurrentOffer(null)
      }
    }
  }, [isDoctor, hasProfile, loadSessions, size])

  // Initial load
  useEffect(() => {
    if (isDoctor) {
      void loadSessions(1, size)
      void fetchCareProfile()
    }
  }, [isDoctor, loadSessions, fetchCareProfile, size])

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
          <h2 className="text-2xl font-black tracking-tight text-slate-800">Danh sách phiên khám (Active Care)</h2>
          <p className="text-xs font-semibold text-slate-500">
            Theo dõi danh sách phiên khám, trao đổi chuyên môn và quản lý tiến trình điều trị người bệnh.
          </p>
        </div>
      </div>

      {/* 4. Doctor Sessions Table with Pagination */}
      <DoctorSessionsTable
        sessions={sessions}
        loading={loading}
        page={page}
        size={size}
        totalElements={totalElements}
        totalPages={totalPages}
        onPageChange={(newPage) => {
          setPage(newPage)
          void loadSessions(newPage, size)
        }}
        onSizeChange={(newSize) => {
          setSize(newSize)
          setPage(1)
          void loadSessions(1, newSize)
        }}
        onRefresh={() => {
          void loadSessions(page, size)
          void fetchDispatchAndOffer()
        }}
        onViewDetail={(sessionId) => setSelectedSessionId(sessionId)}
      />

      {selectedSessionId && (
        <DoctorSessionDetailDialog 
          sessionId={selectedSessionId} 
          open={!!selectedSessionId} 
          onOpenChange={handleDoctorDetailOpenChange} 
          onSessionRefreshed={() => {
            void loadSessions(page, size)
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

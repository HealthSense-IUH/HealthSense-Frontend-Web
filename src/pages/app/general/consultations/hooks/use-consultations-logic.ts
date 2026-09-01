import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { useAppShell } from "@/components/layout/app-shell-context"
import { USER_ROLES } from "@/constants"
import { useToast } from "@/hooks/use-toast"

import { useConsultationSocket } from "./use-consultation-socket"
import { consultationApi } from "@/services"
import type { AdminDialogMode } from "../components/admin-action-dialog"
import type { RequestFormData } from "../components/create-request-panel"
import type { AdminSessionFormData } from "../components/create-admin-session-panel"
import type {
  ConsultationMessageItem,
  ConsultationRequestItem,
  ConsultationSessionItem,
  HealthRecordItem,
  SendConsultationMessagePayload,
  CareServicePackage,
  ConsultationRequestReviewResponse,
  CareTerminationReason,
} from "@/types/consultation"

export type AlertState = {
  type: "success" | "error"
  text: string
}

const DEFAULT_PAGE_SIZE = 10
const DEFAULT_CHAT_SIZE = 30

function readError(error: unknown, fallback: string) {
  const err = error as {
    response?: {
      data?: {
        message?: string
        error?: string
        detail?: string
      } | string
      status?: number
    }
    message?: string
  }
  const data = err?.response?.data
  if (typeof data === "string" && data.trim()) {
    return data
  }
  if (typeof data === "object" && data !== null) {
    return data.message || data.error || data.detail || err.message || fallback
  }
  return err.message || fallback
}

function toIsoOrNull(value: string) {
  return value ? new Date(value).toISOString() : null
}

function localDateTimeIn(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

function normalizeOptionalId(value: string) {
  return value.trim() ? value.trim() : null
}

function makeClientMessageId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `client-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function checkOutsideSupportHours(session: ConsultationSessionItem | null, isMember: boolean): boolean {
  if (!isMember || !session || session.status !== "ACTIVE") return false
  const jsonStr = (session as any).supportScheduleSnapshotJson
  if (!jsonStr) return false
  
  try {
    const schedule = JSON.parse(jsonStr)
    if (!schedule.weekly || !Array.isArray(schedule.weekly) || schedule.weekly.length === 0) {
      return false
    }

    const now = new Date()
    const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
    const currentDay = days[now.getDay()]
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeStr = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`

    const todaySlots = schedule.weekly.filter((s: any) => s.dayOfWeek === currentDay)
    if (todaySlots.length === 0) return true

    for (const slot of todaySlots) {
      if (currentTimeStr >= slot.start && currentTimeStr <= slot.end) {
        return false
      }
    }
    return true
  } catch {
    return false
  }
}

export function useConsultationsLogic() {
  const { effectiveRole } = useAppShell()
  const userSession = useAuthStore((state) => state.userSession)
  const isAdmin = effectiveRole === USER_ROLES.ADMIN || effectiveRole === USER_ROLES.SUPER_ADMIN || effectiveRole === USER_ROLES.CARE_COORDINATOR
  const isDoctor = effectiveRole === USER_ROLES.DOCTOR
  const isMember = effectiveRole === USER_ROLES.MEMBER
  const { toast } = useToast()

  const [alert, setAlert] = useState<AlertState | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [healthRecords, setHealthRecords] = useState<HealthRecordItem[]>([])
  const [packages, setPackages] = useState<CareServicePackage[]>([])
  const [requests, setRequests] = useState<ConsultationRequestItem[]>([])
  const [sessions, setSessions] = useState<ConsultationSessionItem[]>([])
  const [selectedSession, setSelectedSession] = useState<ConsultationSessionItem | null>(null)
  const [messages, setMessages] = useState<ConsultationMessageItem[]>([])
  const [messageDraft, setMessageDraft] = useState("")
  const [attachmentUrl, setAttachmentUrl] = useState("")
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const [requestForm, setRequestForm] = useState<RequestFormData>({
    packageId: "",
    reasonForCare: "",
    currentConcern: "",
    careGoal: "",
    memberNote: "",
    relevantSelfReportedContext: "",
    selectedHealthRecordIds: [],
    preferredDoctorId: "",
    healthRecordId: "",
    reason: "",
  })
  const [adminSessionForm, setAdminSessionForm] = useState<AdminSessionFormData>({
    memberId: "",
    doctorId: "",
    healthRecordId: "",
    endsAt: localDateTimeIn(30),
    supportEndsAt: localDateTimeIn(33),
    initialSystemMessage: "Admin creates direct consultation session",
    overrideReason: "",
    serviceScope: "",
  })
  const [adminDialogMode, setAdminDialogMode] = useState<AdminDialogMode>(null)
  const [targetRequest, setTargetRequest] = useState<ConsultationRequestItem | null>(null)
  const [targetSession, setTargetSession] = useState<ConsultationSessionItem | null>(null)
  const [doctorId, setDoctorId] = useState("")
  const [endsAt, setEndsAt] = useState(localDateTimeIn(30))
  const [supportEndsAt, setSupportEndsAt] = useState(localDateTimeIn(33))
  const [reason, setReason] = useState("")
  const [terminationReason, setTerminationReason] = useState<CareTerminationReason | null>("ADMINISTRATIVE_CLOSURE")
  const [meaningfulCareOccurred, setMeaningfulCareOccurred] = useState<boolean>(true)

  const [adminFilters, setAdminFilters] = useState({
    status: "",
    memberId: "",
    preferredDoctorId: "",
    assignedDoctorId: "",
    fromDate: "",
    toDate: "",
  })

  const [isAdminRequestDetailOpen, setIsAdminRequestDetailOpen] = useState(false)
  const [isDoctorCandidatesOpen, setIsDoctorCandidatesOpen] = useState(false)
  const [isDoctorCareProfileOpen, setIsDoctorCareProfileOpen] = useState(false)
  const [targetDoctorId, setTargetDoctorId] = useState<number | string | null>(null)
  const [reservingDoctorId, setReservingDoctorId] = useState<number | string | null>(null)
  
  const [isMoreInfoDialogOpen, setIsMoreInfoDialogOpen] = useState(false)
  const [moreInfoNote, setMoreInfoNote] = useState("")
  const [moreInfoSelectedRecordIds, setMoreInfoSelectedRecordIds] = useState<string[]>([])
  const [isAdminMoreInfoDialogOpen, setIsAdminMoreInfoDialogOpen] = useState(false)
  const [adminMoreInfoReason, setAdminMoreInfoReason] = useState("")

  // Care Agreement Dialog State
  const [isAgreementDialogOpen, setIsAgreementDialogOpen] = useState(false)
  const [agreementTargetRequestId, setAgreementTargetRequestId] = useState<string | number | null>(null)

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()),
    [messages]
  )

  const isOutsideSupportHours = useMemo(() => checkOutsideSupportHours(selectedSession, isMember), [selectedSession, isMember])

  const handleIncomingMessage = useCallback((message: ConsultationMessageItem) => {
    setMessages((current) => {
      if (current.some((item) => item.id === message.id)) {
        return current
      }
      return [...current, message]
    })
  }, [])

  const { status: socketStatus } = useConsultationSocket(
    !isAdmin && selectedSession ? selectedSession.id : null,
    handleIncomingMessage
  )

  const loadData = useCallback(async () => {
    setLoading(true)
    setAlert(null)
    try {
      const shouldLoadRecords = isMember
      const [requestResponse, sessionResponse, healthRecordResponse, packageResponse] = await Promise.all([
        isAdmin
          ? consultationApi.listAdminRequests({ 
              page: 1, 
              size: DEFAULT_PAGE_SIZE,
              status: adminFilters.status || undefined,
              memberId: adminFilters.memberId.trim() || undefined,
              preferredDoctorId: adminFilters.preferredDoctorId.trim() || undefined,
              assignedDoctorId: adminFilters.assignedDoctorId.trim() || undefined,
              fromDate: adminFilters.fromDate ? new Date(adminFilters.fromDate).toISOString() : undefined,
              toDate: adminFilters.toDate ? new Date(adminFilters.toDate).toISOString() : undefined,
            })
          : isMember
            ? consultationApi.listMyRequests({ page: 1, size: DEFAULT_PAGE_SIZE })
            : Promise.resolve(null),
        isAdmin
          ? consultationApi.listAdminSessions({ page: 1, size: DEFAULT_PAGE_SIZE })
          : consultationApi.listMySessions({ page: 1, size: DEFAULT_PAGE_SIZE }),
        shouldLoadRecords
          ? consultationApi.listMyHealthRecords({ page: 1, size: DEFAULT_PAGE_SIZE })
          : Promise.resolve(null),
        isMember
          ? consultationApi.listCareServicePackages({ page: 1, size: 50 })
          : Promise.resolve(null),
      ])

      const loadedSessions = (sessionResponse.data.content ?? []).sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        if (timeA !== timeB) return timeB - timeA
        return String(b.id).localeCompare(String(a.id), undefined, { numeric: true })
      })
      const loadedRequests = (requestResponse?.data.content ?? []).sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        if (timeA !== timeB) return timeB - timeA
        return String(b.id).localeCompare(String(a.id), undefined, { numeric: true })
      })
      setRequests(loadedRequests)
      setSessions(loadedSessions)
      setHealthRecords(healthRecordResponse?.data.content ?? [])
      setPackages(packageResponse?.data.content ?? [])
      setSelectedSession((prev) => {
        if (prev) {
          const stillValid = loadedSessions.find((s) => String(s.id) === String(prev.id))
          if (stillValid) return stillValid
        }
        return loadedSessions.length > 0 ? loadedSessions[0] : null
      })
    } catch (error) {
      setAlert({ type: "error", text: readError(error, "Failed to load consultation data.") })
      setRequests([])
      setSessions([])
    } finally {
      setLoading(false)
    }
  }, [isAdmin, isMember, adminFilters])

  // Clear stale state when the authenticated user or role changes
  const previousUserIdRef = useRef<string | number | undefined>(userSession?.userId)
  const previousRoleRef = useRef<string | undefined>(effectiveRole)

  useEffect(() => {
    if (
      previousUserIdRef.current !== userSession?.userId ||
      previousRoleRef.current !== effectiveRole
    ) {
      previousUserIdRef.current = userSession?.userId
      previousRoleRef.current = effectiveRole

      // Reset stale consultation state
      setSelectedSession(null)
      setMessages([])
      setRequests([])
      setSessions([])
      setHealthRecords([])
      setTargetRequest(null)
      setTargetSession(null)
      setAlert(null)
      void loadData()
    }
  }, [userSession?.userId, effectiveRole, loadData])

  useEffect(() => {
    queueMicrotask(() => void loadData())
  }, [loadData])

  useEffect(() => {
    if (!selectedSession || isAdmin) {
      return
    }

    // Role / ownership sanity check to prevent cross-account session pollution
    if (userSession?.userId) {
      const currentUid = String(userSession.userId)
      if (isMember && String(selectedSession.memberId) !== currentUid) {
        if (import.meta.env.DEV) {
          console.warn(
            `[Consultations] Stale session #${selectedSession.id} belongs to member #${selectedSession.memberId}, but current user is #${currentUid}. Clearing selectedSession.`
          )
        }
        setSelectedSession(null)
        setMessages([])
        void loadData()
        return
      }
      if (isDoctor && String(selectedSession.doctorId) !== currentUid) {
        if (import.meta.env.DEV) {
          console.warn(
            `[Consultations] Stale session #${selectedSession.id} belongs to doctor #${selectedSession.doctorId}, but current user is #${currentUid}. Clearing selectedSession.`
          )
        }
        setSelectedSession(null)
        setMessages([])
        void loadData()
        return
      }
    }

    if (selectedSession.status !== "ACTIVE" && selectedSession.status !== "COMPLETED") {
      setAlert({ type: "error", text: "Phiên tư vấn chưa mở hoặc không còn hoạt động." })
      setSelectedSession(null)
      setMessages([])
      return
    }

    let mounted = true
    consultationApi
      .listMessages(selectedSession.id, { page: 1, size: DEFAULT_CHAT_SIZE })
      .then((response) => {
        if (mounted) {
          setMessages(response.data.content)
          setHasMoreMessages(response.data.content.length === DEFAULT_CHAT_SIZE)
        }
      })
      .catch((error) => {
        if (mounted) {
          if (error?.response?.status === 409 || error?.response?.data?.code === 4003) {
            setAlert({ type: "error", text: "Phiên tư vấn đã bị hủy hoặc không còn hoạt động." })
            setSelectedSession(null)
          } else {
            setAlert({ type: "error", text: readError(error, "Failed to load message history.") })
          }
          setMessages([])
        }
      })

    return () => {
      mounted = false
    }
  }, [selectedSession, isAdmin, userSession?.userId, isMember, isDoctor, loadData])

  useEffect(() => {
    if (isAdmin) return
    const lastMessage = sortedMessages.at(-1)
    if (selectedSession?.status === "ACTIVE" && lastMessage?.id) {
      void consultationApi.markRead(selectedSession.id, lastMessage.id).catch(() => undefined)
    }
  }, [selectedSession, sortedMessages, isAdmin])

  const handleLoadMoreMessages = useCallback(async () => {
    if (isAdmin || !selectedSession || loadingMoreMessages || !hasMoreMessages || messages.length === 0) {
      return
    }

    const oldestMessageId = sortedMessages[0]?.id
    if (!oldestMessageId) {
      return
    }

    setLoadingMoreMessages(true)
    try {
      const response = await consultationApi.listMessagesBefore(selectedSession.id, oldestMessageId, {
        page: 1,
        size: DEFAULT_CHAT_SIZE,
      })
      if (response.data.content.length > 0) {
        setMessages((prev) => {
          const newItems = response.data.content.filter((msg) => !prev.some((p) => p.id === msg.id))
          return [...prev, ...newItems]
        })
      }
      setHasMoreMessages(response.data.content.length === DEFAULT_CHAT_SIZE)
    } catch (error) {
      setAlert({ type: "error", text: readError(error, "Failed to load older messages.") })
    } finally {
      setLoadingMoreMessages(false)
    }
  }, [selectedSession, loadingMoreMessages, hasMoreMessages, messages.length, sortedMessages])
  async function handleCreateRequest(event: FormEvent<HTMLFormElement>, onSuccess?: () => void) {
    event.preventDefault()
    setActionLoading(true)
    setAlert(null)
    try {
      const packageIdStr = requestForm.packageId?.trim()
      if (!packageIdStr) {
        setAlert({ type: "error", text: "Vui lòng chọn gói dịch vụ." })
        setActionLoading(false)
        return
      }
      if (!requestForm.reasonForCare.trim()) {
        setAlert({ type: "error", text: "Vui lòng nhập lý do đăng ký chăm sóc." })
        setActionLoading(false)
        return
      }
      if (!requestForm.currentConcern.trim()) {
        setAlert({ type: "error", text: "Vui lòng nhập triệu chứng & vấn đề lo ngại hiện tại." })
        setActionLoading(false)
        return
      }

      await consultationApi.createRequest({
        packageId: packageIdStr,
        reasonForCare: requestForm.reasonForCare.trim(),
        currentConcern: requestForm.currentConcern.trim(),
        careGoal: requestForm.careGoal.trim() || null,
        memberNote: requestForm.memberNote.trim() || null,
        relevantSelfReportedContext: requestForm.relevantSelfReportedContext.trim() || null,
        selectedHealthRecordIds: requestForm.selectedHealthRecordIds.length > 0 ? requestForm.selectedHealthRecordIds : undefined,
        preferredDoctorId: normalizeOptionalId(requestForm.preferredDoctorId) || null,
        healthRecordId: requestForm.selectedHealthRecordIds[0] ? requestForm.selectedHealthRecordIds[0] : null,
        reason: requestForm.reasonForCare.trim(),
      })

      setRequestForm({
        packageId: "",
        reasonForCare: "",
        currentConcern: "",
        careGoal: "",
        memberNote: "",
        relevantSelfReportedContext: "",
        selectedHealthRecordIds: [],
        preferredDoctorId: "",
        healthRecordId: "",
        reason: "",
      })
      setAlert({ type: "success", text: "Đã gửi yêu cầu tư vấn thành công. Vui lòng chờ điều phối viên xét duyệt." })
      await loadData()
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      setAlert({ type: "error", text: readError(error, "Không thể gửi yêu cầu tư vấn.") })
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCancelRequest(requestId: string | number) {
    setActionLoading(true)
    setAlert(null)
    try {
      await consultationApi.cancelRequest(requestId)
      setAlert({ type: "success", text: "Đã hủy yêu cầu tư vấn." })
      await loadData()
    } catch (error) {
      setAlert({ type: "error", text: readError(error, "Không thể hủy yêu cầu tư vấn.") })
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCreateAdminSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setActionLoading(true)
    setAlert(null)
    try {
      if (!adminSessionForm.overrideReason.trim()) {
        setAlert({ type: "error", text: "Vui lòng nhập lý do ghi đè (overrideReason) của Quản trị viên." })
        setActionLoading(false)
        return
      }

      if (!adminSessionForm.serviceScope.trim()) {
        setAlert({ type: "error", text: "Vui lòng nhập phạm vi dịch vụ (serviceScope) chỉ định cho phiên." })
        setActionLoading(false)
        return
      }

      const response = await consultationApi.createSessionByAdmin({
        memberId: adminSessionForm.memberId.trim(),
        doctorId: adminSessionForm.doctorId.trim(),
        healthRecordId: normalizeOptionalId(adminSessionForm.healthRecordId),
        startedAt: null,
        endsAt: new Date(adminSessionForm.endsAt).toISOString(),
        supportEndsAt: toIsoOrNull(adminSessionForm.supportEndsAt),
        initialSystemMessage: adminSessionForm.initialSystemMessage.trim() || null,
        overrideReason: adminSessionForm.overrideReason.trim(),
        serviceScope: adminSessionForm.serviceScope.trim(),
      })
      setSelectedSession(response.data)
      setAlert({ type: "success", text: `Đã tạo phiên tư vấn đặc biệt #${response.data.id}.` })
      toast({
        title: "Tạo phiên thành công",
        description: `Đã tạo phiên tư vấn trực tiếp #${response.data.id}.`,
      })
      setAdminSessionForm({
        memberId: "",
        doctorId: "",
        healthRecordId: "",
        endsAt: localDateTimeIn(30),
        supportEndsAt: localDateTimeIn(33),
        initialSystemMessage: "Admin creates direct consultation session",
        overrideReason: "",
        serviceScope: "",
      })
      await loadData()
    } catch (error) {
      setAlert({ type: "error", text: readError(error, "Không thể tạo phiên tư vấn đặc biệt.") })
      toast({
        variant: "destructive",
        title: "Lỗi tạo phiên tư vấn",
        description: readError(error, "Đã có lỗi xảy ra khi tạo phiên tư vấn đặc biệt."),
      })
    } finally {
      setActionLoading(false)
    }
  }

  function openApproveDialog(request: ConsultationRequestItem) {
    setTargetRequest(request)
    setDoctorId(String(request.preferredDoctorId ?? ""))
    setReason("")
    setAdminDialogMode("approve")
  }

  function openRejectDialog(request: ConsultationRequestItem | ConsultationRequestReviewResponse | string | number) {
    if (typeof request === "string" || typeof request === "number") {
      const found = requests.find((r) => String(r.id) === String(request))
      if (found) setTargetRequest(found)
    } else {
      setTargetRequest(request as ConsultationRequestItem)
    }
    setReason("")
    setAdminDialogMode("reject")
  }

  function openMoreInfoDialog(request: ConsultationRequestItem) {
    setTargetRequest(request)
    setMoreInfoNote("")
    setMoreInfoSelectedRecordIds([])
    setIsMoreInfoDialogOpen(true)
  }

  function openAgreementDialog(request: ConsultationRequestItem) {
    setAgreementTargetRequestId(request.id)
    setIsAgreementDialogOpen(true)
  }

  async function handleSubmitMoreInfo() {
    if (!targetRequest || !moreInfoNote.trim()) return
    setActionLoading(true)
    setAlert(null)
    try {
      await consultationApi.submitMoreInfo(targetRequest.id, {
        additionalNote: moreInfoNote.trim(),
        responseNote: moreInfoNote.trim(),
        selectedHealthRecordIds: moreInfoSelectedRecordIds.length > 0 ? moreInfoSelectedRecordIds : undefined,
        healthRecordId: moreInfoSelectedRecordIds[0] ? moreInfoSelectedRecordIds[0] : undefined,
      })
      setAlert({ type: "success", text: `Đã gửi bổ sung thông tin cho yêu cầu #${targetRequest.id}.` })
      setIsMoreInfoDialogOpen(false)
      await loadData()
    } catch (error) {
      setAlert({ type: "error", text: readError(error, "Không thể gửi bổ sung thông tin.") })
    } finally {
      setActionLoading(false)
    }
  }

  function openAdminRequestDetail(request: ConsultationRequestItem) {
    setTargetRequest(request)
    setIsAdminRequestDetailOpen(true)
  }

  function openDoctorCandidates(request: ConsultationRequestItem | ConsultationRequestReviewResponse) {
    setIsAdminRequestDetailOpen(false)
    setTargetRequest(request as ConsultationRequestItem)
    // Small delay to allow the first dialog's overlay to unmount gracefully
    setTimeout(() => {
      setIsDoctorCandidatesOpen(true)
    }, 150)
  }

  function openDoctorCareProfile(doctorId: number | string) {
    setTargetDoctorId(doctorId)
    setIsDoctorCareProfileOpen(true)
  }

  async function handleReserveDoctor(doctorId: number | string) {
    if (!targetRequest) return
    setActionLoading(true)
    setReservingDoctorId(doctorId)
    setAlert(null)
    try {
      await consultationApi.approveRequest(targetRequest.id, { doctorId })
      setAlert({ type: "success", text: "Đã giữ bác sĩ. Yêu cầu chuyển sang chờ hội viên xác nhận thỏa thuận (WAITING_ACCEPTANCE)." })
      toast({
        title: "Đã phân công bác sĩ",
        description: "Yêu cầu đã được chuyển sang trạng thái chờ hội viên xem & xác nhận thỏa thuận dịch vụ.",
      })
      setIsDoctorCandidatesOpen(false)
      setIsAdminRequestDetailOpen(false)
      await loadData()
    } catch (error) {
      const errorMsg = readError(error, "Không thể phân công bác sĩ.")
      setAlert({ type: "error", text: errorMsg })
      toast({
        variant: "destructive",
        title: "Không thể phân công bác sĩ",
        description: errorMsg,
      })
    } finally {
      setActionLoading(false)
      setReservingDoctorId(null)
    }
  }

  function openAdminRequestMoreInfo(request: ConsultationRequestReviewResponse) {
    setTargetRequest(request as unknown as ConsultationRequestItem)
    setAdminMoreInfoReason("")
    setIsAdminMoreInfoDialogOpen(true)
  }

  async function handleAdminSubmitMoreInfoRequest() {
    if (!targetRequest || !adminMoreInfoReason.trim()) return
    setActionLoading(true)
    setAlert(null)
    try {
      await consultationApi.requestMoreInfo(targetRequest.id, { reason: adminMoreInfoReason.trim() })
      setAlert({ type: "success", text: `Đã yêu cầu bổ sung thông tin cho yêu cầu #${targetRequest.id}.` })
      setIsAdminMoreInfoDialogOpen(false)
      setIsAdminRequestDetailOpen(false)
      await loadData()
    } catch (error) {
      setAlert({ type: "error", text: readError(error, "Failed to request more info.") })
    } finally {
      setActionLoading(false)
    }
  }

  function openCloseDialog(session: ConsultationSessionItem) {
    setTargetSession(session)
    setReason("")
    setTerminationReason("ADMINISTRATIVE_CLOSURE")
    // Default meaningfulCareOccurred: true for ACTIVE, false for SCHEDULED
    setMeaningfulCareOccurred(session.status === "ACTIVE")
    setAdminDialogMode("close")
  }

  async function handleAdminDialogSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setActionLoading(true)
    setAlert(null)
    try {
      if (adminDialogMode === "approve" && targetRequest) {
        if (!doctorId || !doctorId.trim()) {
          setAlert({ type: "error", text: "Vui lòng chọn hoặc nhập mã bác sĩ hợp lệ." })
          setActionLoading(false)
          return
        }
        await consultationApi.approveRequest(targetRequest.id, {
          doctorId: doctorId.trim(),
        })
        setAlert({ type: "success", text: `Đã điều phối bác sĩ cho yêu cầu #${targetRequest.id}. Trạng thái chuyển sang CHỜ THANH TOÁN.` })
      }

      if (adminDialogMode === "reject" && targetRequest) {
        await consultationApi.rejectRequest(targetRequest.id, { rejectionReason: reason.trim() })
        setAlert({ type: "success", text: `Đã từ chối yêu cầu #${targetRequest.id}.` })
      }

      if (adminDialogMode === "close" && targetSession) {
        await consultationApi.closeSession(targetSession.id, {
          closeReason: reason.trim(),
          terminationReason: terminationReason,
          meaningfulCareOccurred: meaningfulCareOccurred,
        })
        setAlert({ type: "success", text: `Đã đóng phiên tư vấn #${targetSession.id}.` })
      }

      setAdminDialogMode(null)
      await loadData()
    } catch (error) {
      setAlert({ type: "error", text: readError(error, "Admin action failed.") })
    } finally {
      setActionLoading(false)
    }
  }

  async function handleExpireOverdue() {
    setActionLoading(true)
    setAlert(null)
    try {
      await consultationApi.expireOverdueSessions()
      setAlert({ type: "success", text: "Requested backend to expire overdue sessions." })
      await loadData()
    } catch (error) {
      setAlert({ type: "error", text: readError(error, "Failed to expire overdue sessions.") })
    } finally {
      setActionLoading(false)
    }
  }

  async function handleExpireWaitingPayment() {
    setActionLoading(true)
    setAlert(null)
    try {
      await consultationApi.expireWaitingPaymentRequests()
      setAlert({ type: "success", text: "Requested backend to expire waiting payment requests." })
      await loadData()
    } catch (error) {
      setAlert({ type: "error", text: readError(error, "Failed to expire waiting payment requests.") })
    } finally {
      setActionLoading(false)
    }
  }

  async function handleActivateScheduledSessions() {
    setActionLoading(true)
    setAlert(null)
    try {
      await consultationApi.activateScheduledSessions()
      setAlert({ type: "success", text: "Requested backend to activate scheduled sessions." })
      await loadData()
    } catch (error) {
      setAlert({ type: "error", text: readError(error, "Failed to activate scheduled sessions.") })
    } finally {
      setActionLoading(false)
    }
  }

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedSession || selectedSession.status !== "ACTIVE") {
      return
    }

    const content = messageDraft.trim()
    const fileUrl = attachmentUrl.trim()
    if (!content && !fileUrl) {
      return
    }

    const payload: SendConsultationMessagePayload = fileUrl
      ? {
          type: fileUrl.match(/\.(png|jpe?g|webp|gif)(\?|$)/i) ? "IMAGE" : "FILE",
          content: content || undefined,
          attachmentUrl: fileUrl,
          attachmentName: fileUrl.split("/").pop()?.split("?")[0] || "attachment",
          clientMessageId: makeClientMessageId(),
        }
      : {
          type: "TEXT",
          content,
          clientMessageId: makeClientMessageId(),
        }

    setActionLoading(true)
    setAlert(null)
    try {
      // Gửi luôn qua HTTP POST (kiến trúc: gửi = HTTP, nghe = WS).
      // Server phát tin vào topic sau khi lưu; nếu socket của mình đang nối
      // thì tin sẽ dội về qua topic — handleIncomingMessage đã chống trùng
      // theo message.id (POST response và frame WS mang cùng id) nên an toàn.
      const response = await consultationApi.sendMessage(selectedSession.id, payload)
      handleIncomingMessage(response.data)
      setMessageDraft("")
      setAttachmentUrl("")
    } catch (error: any) {
      const errStr = String(error?.response?.data?.message || error.message || "")
      if (error?.response?.status === 409 || error?.response?.data?.code === 4003) {
        setAlert({ type: "error", text: "Phiên tư vấn chưa mở hoặc không còn hoạt động." })
        setSelectedSession(null)
      } else if (errStr.toLowerCase().includes("support hours") || errStr.toLowerCase().includes("support_hours")) {
        setAlert({ type: "error", text: "Bạn chỉ có thể gửi tin nhắn trong khung giờ hỗ trợ của phiên tư vấn." })
        // Do not clear message draft so they don't lose their text
      } else {
        setAlert({ type: "error", text: readError(error, "Failed to send message.") })
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleInitiatePayment = useCallback(async (requestId: string | number) => {
    setActionLoading(true)
    try {
      const response = await consultationApi.createConsultationPayment(requestId)
      const data = response.data
      
      if (data.status === "PENDING" && data.checkoutUrl) {
        localStorage.setItem("healthsense.pendingPaymentRequestId", String(requestId))
        window.location.href = data.checkoutUrl
      } else if (data.status === "PAID") {
        toast({
          title: "Thanh toán thành công",
          description: "Yêu cầu tư vấn đã được kích hoạt.",
        })
        await loadData()
      } else {
        toast({
          title: "Thông báo thanh toán",
          description: `Trạng thái hiện tại: ${data.status}`,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi khởi tạo thanh toán",
        description: readError(error, "Không thể tạo giao dịch thanh toán lúc này. Vui lòng thử lại sau."),
      })
    } finally {
      setActionLoading(false)
    }
  }, [loadData, toast])

  return {
    isAdmin,
    isDoctor,
    isMember,
    userSession,
    alert,
    setAlert,
    loading,
    actionLoading,
    healthRecords,
    packages,
    requests,
    sessions,
    selectedSession,
    setSelectedSession,
    sortedMessages,
    loadingMoreMessages,
    hasMoreMessages,
    socketStatus,
    messageDraft,
    setMessageDraft,
    attachmentUrl,
    setAttachmentUrl,
    isOutsideSupportHours,
    requestForm,
    setRequestForm,
    adminSessionForm,
    setAdminSessionForm,
    adminDialogMode,
    setAdminDialogMode,
    targetRequest,
    targetSession,
    doctorId,
    setDoctorId,
    endsAt,
    setEndsAt,
    supportEndsAt,
    setSupportEndsAt,
    reason,
    setReason,
    terminationReason,
    setTerminationReason,
    meaningfulCareOccurred,
    setMeaningfulCareOccurred,
    loadData,
    handleCreateRequest,
    handleCancelRequest,
    handleCreateAdminSession,
    openApproveDialog,
    openRejectDialog,
    openCloseDialog,
    handleAdminDialogSubmit,
    handleExpireOverdue,
    handleExpireWaitingPayment,
    handleActivateScheduledSessions,
    handleSendMessage,
    handleLoadMoreMessages,
    isMoreInfoDialogOpen,
    setIsMoreInfoDialogOpen,
    moreInfoNote,
    setMoreInfoNote,
    moreInfoSelectedRecordIds,
    setMoreInfoSelectedRecordIds,
    openMoreInfoDialog,
    handleSubmitMoreInfo,
    isAgreementDialogOpen,
    setIsAgreementDialogOpen,
    agreementTargetRequestId,
    openAgreementDialog,
    adminFilters,
    setAdminFilters,
    isAdminRequestDetailOpen,
    setIsAdminRequestDetailOpen,
    isDoctorCandidatesOpen,
    setIsDoctorCandidatesOpen,
    isDoctorCareProfileOpen,
    setIsDoctorCareProfileOpen,
    targetDoctorId,
    setTargetDoctorId,
    reservingDoctorId,
    openAdminRequestDetail,
    openDoctorCandidates,
    openDoctorCareProfile,
    handleReserveDoctor,
    isAdminMoreInfoDialogOpen,
    setIsAdminMoreInfoDialogOpen,
    adminMoreInfoReason,
    setAdminMoreInfoReason,
    openAdminRequestMoreInfo,
    handleAdminSubmitMoreInfoRequest,
    handleInitiatePayment,
  }
}

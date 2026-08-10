import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { useAuthStore } from "@/features/auth/auth-store"
import { useAppShell } from "@/components/layout/app-shell-context"
import { USER_ROLES } from "@/types/authentication"
import { useToast } from "@/hooks/use-toast"

import { useConsultationSocket } from "./use-consultation-socket"
import { consultationApi } from "../services/consultation-api"
import type { AdminDialogMode } from "../components/admin-action-dialog"
import type {
  ConsultationMessageItem,
  ConsultationRequestItem,
  ConsultationSessionItem,
  HealthRecordItem,
  SendConsultationMessagePayload,
  CareServicePackage,
  ConsultationRequestReviewResponse,
} from "../types"

export type AlertState = {
  type: "success" | "error"
  text: string
}

const DEFAULT_PAGE_SIZE = 10
const DEFAULT_CHAT_SIZE = 30

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err.response?.data?.message || err.message || fallback
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
  const [requestForm, setRequestForm] = useState({
    packageId: "",
    healthRecordId: "",
    reason: "",
    preferredDoctorId: "",
  })
  const [adminSessionForm, setAdminSessionForm] = useState({
    memberId: "",
    doctorId: "",
    healthRecordId: "",
    endsAt: localDateTimeIn(30),
    supportEndsAt: localDateTimeIn(33),
    initialSystemMessage: "Admin creates direct consultation session",
  })
  const [adminDialogMode, setAdminDialogMode] = useState<AdminDialogMode>(null)
  const [targetRequest, setTargetRequest] = useState<ConsultationRequestItem | null>(null)
  const [targetSession, setTargetSession] = useState<ConsultationSessionItem | null>(null)
  const [doctorId, setDoctorId] = useState("")
  const [endsAt, setEndsAt] = useState(localDateTimeIn(30))
  const [supportEndsAt, setSupportEndsAt] = useState(localDateTimeIn(33))
  const [reason, setReason] = useState("")

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
  const [targetDoctorId, setTargetDoctorId] = useState<number | null>(null)
  
  const [isMoreInfoDialogOpen, setIsMoreInfoDialogOpen] = useState(false)
  const [moreInfoNote, setMoreInfoNote] = useState("")
  const [isAdminMoreInfoDialogOpen, setIsAdminMoreInfoDialogOpen] = useState(false)
  const [adminMoreInfoReason, setAdminMoreInfoReason] = useState("")

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()),
    [messages]
  )

  const handleIncomingMessage = useCallback((message: ConsultationMessageItem) => {
    setMessages((current) => {
      if (current.some((item) => item.id === message.id)) {
        return current
      }
      return [...current, message]
    })
  }, [])

  const { status: socketStatus, sendSocketMessage } = useConsultationSocket(
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
              memberId: adminFilters.memberId ? Number(adminFilters.memberId) : undefined,
              preferredDoctorId: adminFilters.preferredDoctorId ? Number(adminFilters.preferredDoctorId) : undefined,
              assignedDoctorId: adminFilters.assignedDoctorId ? Number(adminFilters.assignedDoctorId) : undefined,
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

      setRequests(requestResponse?.data.content ?? [])
      setSessions(sessionResponse.data.content ?? [])
      setHealthRecords(healthRecordResponse?.data.content ?? [])
      setPackages(packageResponse?.data.content ?? [])
      if (!selectedSession && sessionResponse.data.content.length > 0) {
        setSelectedSession(sessionResponse.data.content[0])
      }
    } catch (error) {
      setAlert({ type: "error", text: readError(error, "Failed to load consultation data.") })
      setRequests([])
      setSessions([])
    } finally {
      setLoading(false)
    }
  }, [isAdmin, isMember, selectedSession, adminFilters])

  useEffect(() => {
    queueMicrotask(() => void loadData())
  }, [loadData])

  useEffect(() => {
    if (!selectedSession || isAdmin) {
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
          setAlert({ type: "error", text: readError(error, "Failed to load message history.") })
          setMessages([])
        }
      })

    return () => {
      mounted = false
    }
  }, [selectedSession])

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

  async function handleCreateRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setActionLoading(true)
    setAlert(null)
    try {
      const packageIdStr = requestForm.packageId?.trim()
      if (!packageIdStr) {
        setAlert({ type: "error", text: "Please select a valid service package." })
        setActionLoading(false)
        return
      }

      await consultationApi.createRequest({
        packageId: packageIdStr,
        healthRecordId: normalizeOptionalId(requestForm.healthRecordId) || null,
        reason: requestForm.reason.trim(),
        preferredDoctorId: normalizeOptionalId(requestForm.preferredDoctorId) || null,
      })
      setRequestForm({ packageId: "", healthRecordId: "", reason: "", preferredDoctorId: "" })
      setAlert({ type: "success", text: "Consultation request sent for admin approval." })
      await loadData()
    } catch (error) {
      setAlert({ type: "error", text: readError(error, "Failed to send consultation request.") })
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCancelRequest(requestId: string | number) {
    setActionLoading(true)
    setAlert(null)
    try {
      await consultationApi.cancelRequest(requestId)
      setAlert({ type: "success", text: "Canceled pending request." })
      await loadData()
    } catch (error) {
      setAlert({ type: "error", text: readError(error, "Failed to cancel this request.") })
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCreateAdminSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setActionLoading(true)
    setAlert(null)
    try {
      const response = await consultationApi.createSessionByAdmin({
        memberId: adminSessionForm.memberId.trim(),
        doctorId: adminSessionForm.doctorId.trim(),
        healthRecordId: normalizeOptionalId(adminSessionForm.healthRecordId),
        startedAt: null,
        endsAt: new Date(adminSessionForm.endsAt).toISOString(),
        supportEndsAt: toIsoOrNull(adminSessionForm.supportEndsAt),
        initialSystemMessage: adminSessionForm.initialSystemMessage.trim() || null,
      })
      setSelectedSession(response.data)
      setAlert({ type: "success", text: `Created session #${response.data.id}.` })
      toast({
        title: "Session Created",
        description: `Successfully created direct consultation session #${response.data.id}.`,
      })
      setAdminSessionForm({
        memberId: "",
        doctorId: "",
        healthRecordId: "",
        endsAt: localDateTimeIn(30),
        supportEndsAt: localDateTimeIn(33),
        initialSystemMessage: "Admin creates direct consultation session",
      })
      await loadData()
    } catch (error) {
      setAlert({ type: "error", text: readError(error, "Failed to create direct session.") })
      toast({
        variant: "destructive",
        title: "Failed to create session",
        description: readError(error, "An error occurred while creating the session."),
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
    setIsMoreInfoDialogOpen(true)
  }

  async function handleSubmitMoreInfo() {
    if (!targetRequest || !moreInfoNote.trim()) return
    setActionLoading(true)
    setAlert(null)
    try {
      await consultationApi.submitMoreInfo(targetRequest.id, { additionalNote: moreInfoNote.trim() })
      setAlert({ type: "success", text: `Submitted additional info for request #${targetRequest.id}.` })
      setIsMoreInfoDialogOpen(false)
      await loadData()
    } catch (error) {
      setAlert({ type: "error", text: readError(error, "Failed to submit additional info.") })
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

  function openDoctorCareProfile(doctorId: number) {
    setTargetDoctorId(doctorId)
    setIsDoctorCareProfileOpen(true)
  }

  async function handleReserveDoctor(doctorId: number) {
    if (!targetRequest) return
    setActionLoading(true)
    setAlert(null)
    try {
      await consultationApi.approveRequest(targetRequest.id, { doctorId })
      setAlert({ type: "success", text: "Đã giữ bác sĩ. Yêu cầu chuyển sang chờ thanh toán." })
      setIsDoctorCandidatesOpen(false)
      setIsAdminRequestDetailOpen(false)
      await loadData()
    } catch (error) {
      setAlert({ type: "error", text: readError(error, "Failed to reserve doctor.") })
    } finally {
      setActionLoading(false)
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

  function openExtendDialog(session: ConsultationSessionItem) {
    setTargetSession(session)
    setEndsAt(localDateTimeIn(30))
    setSupportEndsAt(localDateTimeIn(33))
    setReason("")
    setAdminDialogMode("extend")
  }

  function openCloseDialog(session: ConsultationSessionItem) {
    setTargetSession(session)
    setReason("")
    setAdminDialogMode("close")
  }

  async function handleAdminDialogSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setActionLoading(true)
    setAlert(null)
    try {
      if (adminDialogMode === "approve" && targetRequest) {
        if (!doctorId || !doctorId.trim()) {
          setAlert({ type: "error", text: "Please select a valid doctor." })
          setActionLoading(false)
          return
        }
        await consultationApi.approveRequest(targetRequest.id, {
          doctorId: doctorId.trim(),
        })
        setAlert({ type: "success", text: `Reserved doctor for request #${targetRequest.id}. Status moved to WAITING_PAYMENT.` })
      }

      if (adminDialogMode === "reject" && targetRequest) {
        await consultationApi.rejectRequest(targetRequest.id, { rejectionReason: reason.trim() })
        setAlert({ type: "success", text: `Rejected request #${targetRequest.id}.` })
      }

      if (adminDialogMode === "extend" && targetSession) {
        await consultationApi.extendSession(targetSession.id, {
          endsAt: new Date(endsAt).toISOString(),
          supportEndsAt: toIsoOrNull(supportEndsAt),
          reason: reason.trim() || null,
        })
        setAlert({ type: "success", text: `Extended session #${targetSession.id}.` })
      }

      if (adminDialogMode === "close" && targetSession) {
        await consultationApi.closeSession(targetSession.id, { closeReason: reason.trim() })
        setAlert({ type: "success", text: `Closed session #${targetSession.id}.` })
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
      const sentBySocket = sendSocketMessage(payload)
      if (!sentBySocket) {
        const response = await consultationApi.sendMessage(selectedSession.id, payload)
        handleIncomingMessage(response.data)
      }
      setMessageDraft("")
      setAttachmentUrl("")
    } catch (error) {
      setAlert({ type: "error", text: readError(error, "Failed to send message.") })
    } finally {
      setActionLoading(false)
    }
  }

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
    loadData,
    handleCreateRequest,
    handleCancelRequest,
    handleCreateAdminSession,
    openApproveDialog,
    openRejectDialog,
    openExtendDialog,
    openCloseDialog,
    handleAdminDialogSubmit,
    handleExpireOverdue,
    handleSendMessage,
    handleLoadMoreMessages,
    isMoreInfoDialogOpen,
    setIsMoreInfoDialogOpen,
    moreInfoNote,
    setMoreInfoNote,
    openMoreInfoDialog,
    handleSubmitMoreInfo,
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
  }
}

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { useAuthStore } from "@/features/auth/auth-store"
import { useAppShell } from "@/components/layout/app-shell-context"
import { USER_ROLES } from "@/types/authentication"

import { useConsultationSocket } from "./use-consultation-socket"
import { consultationApi } from "../services/consultation-api"
import type { AdminDialogMode } from "../components/admin-action-dialog"
import type {
  ConsultationMessageItem,
  ConsultationRequestItem,
  ConsultationSessionItem,
  HealthRecordItem,
  SendConsultationMessagePayload,
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
  const isAdmin = effectiveRole === USER_ROLES.ADMIN || effectiveRole === USER_ROLES.SUPER_ADMIN
  const isDoctor = effectiveRole === USER_ROLES.DOCTOR
  const isMember = effectiveRole === USER_ROLES.MEMBER

  const [alert, setAlert] = useState<AlertState | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [healthRecords, setHealthRecords] = useState<HealthRecordItem[]>([])
  const [requests, setRequests] = useState<ConsultationRequestItem[]>([])
  const [sessions, setSessions] = useState<ConsultationSessionItem[]>([])
  const [selectedSession, setSelectedSession] = useState<ConsultationSessionItem | null>(null)
  const [messages, setMessages] = useState<ConsultationMessageItem[]>([])
  const [messageDraft, setMessageDraft] = useState("")
  const [attachmentUrl, setAttachmentUrl] = useState("")
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const [requestForm, setRequestForm] = useState({
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
      const [requestResponse, sessionResponse, healthRecordResponse] = await Promise.all([
        isAdmin
          ? consultationApi.listAdminRequests({ page: 1, size: DEFAULT_PAGE_SIZE })
          : isMember
            ? consultationApi.listMyRequests({ page: 1, size: DEFAULT_PAGE_SIZE })
            : Promise.resolve(null),
        isAdmin
          ? consultationApi.listAdminSessions({ page: 1, size: DEFAULT_PAGE_SIZE })
          : consultationApi.listMySessions({ page: 1, size: DEFAULT_PAGE_SIZE }),
        shouldLoadRecords
          ? consultationApi.listMyHealthRecords({ page: 1, size: DEFAULT_PAGE_SIZE })
          : Promise.resolve(null),
      ])

      setRequests(requestResponse?.data.content ?? [])
      setSessions(sessionResponse.data.content ?? [])
      setHealthRecords(healthRecordResponse?.data.content ?? [])
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
  }, [isAdmin, isMember, selectedSession])

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
      await consultationApi.createRequest({
        healthRecordId: normalizeOptionalId(requestForm.healthRecordId),
        reason: requestForm.reason.trim(),
        preferredDoctorId: normalizeOptionalId(requestForm.preferredDoctorId),
      })
      setRequestForm({ healthRecordId: "", reason: "", preferredDoctorId: "" })
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
      await loadData()
    } catch (error) {
      setAlert({ type: "error", text: readError(error, "Failed to create direct session.") })
    } finally {
      setActionLoading(false)
    }
  }

  function openApproveDialog(request: ConsultationRequestItem) {
    setTargetRequest(request)
    setDoctorId(String(request.preferredDoctorId ?? ""))
    setEndsAt(localDateTimeIn(30))
    setSupportEndsAt(localDateTimeIn(33))
    setReason("")
    setAdminDialogMode("approve")
  }

  function openRejectDialog(request: ConsultationRequestItem) {
    setTargetRequest(request)
    setReason("")
    setAdminDialogMode("reject")
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
        await consultationApi.approveRequest(targetRequest.id, {
          doctorId: doctorId.trim(),
          startedAt: null,
          endsAt: new Date(endsAt).toISOString(),
          supportEndsAt: toIsoOrNull(supportEndsAt),
        })
        setAlert({ type: "success", text: `Approved request #${targetRequest.id} and created session.` })
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
  }
}

import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import {
  Clock,
  FileText,
  History,
  Info,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Salad,
  ShieldAlert,
} from "lucide-react"

import { Page, PageBody, PageHeader } from "@/components/layout/page"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/stores/auth-store"
import { consultationApi } from "@/services"
import type {
  ConsultationMessageItem,
  DoctorConsultationDetailResponse,
  SendConsultationMessagePayload,
} from "@/types/consultation"

import { formatDate } from "@/pages/app/general/consultations/components/shared"
import { ChatMessageList } from "@/pages/app/general/consultations/components/chat/chat-message-list"
import { ChatComposer } from "@/pages/app/general/consultations/components/chat/chat-composer"
import { SessionContinuationBanner } from "@/pages/app/general/consultations/components/chat/session-continuation-banner"
import { useConsultationSocket } from "@/pages/app/general/consultations/hooks/use-consultation-socket"
import { DoctorScopedRecordsTab } from "@/pages/app/general/consultations/components/doctor-scoped-records-tab"
import { DoctorFinalSummaryTab } from "@/pages/app/general/consultations/components/doctor-final-summary-tab"
import { DoctorContinuityTab } from "@/pages/app/general/consultations/components/doctor-continuity-tab"
import { DoctorDietPrescriptionTab } from "@/pages/app/general/consultations/components/doctor-diet-prescription-tab"
import { DoctorSessionDetailDialog } from "@/pages/app/general/consultations/components/doctor-session-detail-dialog"
import { getSessionStatusBadge } from "./components/doctor-sessions-table"

const CHAT_PAGE_SIZE = 50

function makeClientMessageId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `client-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err.response?.data?.message || err.message || fallback
}

export default function DoctorSessionWorkspacePage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { toast } = useToast()
  const userSession = useAuthStore((state) => state.userSession)

  const activeTab = searchParams.get("tab") || "chat"
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab })
  }

  const [detail, setDetail] = useState<DoctorConsultationDetailResponse | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  // Chat states
  const [messages, setMessages] = useState<ConsultationMessageItem[]>([])
  const [messageDraft, setMessageDraft] = useState("")
  const [attachmentUrl, setAttachmentUrl] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)

  // 1. Initial Fetch Doctor Session Detail
  useEffect(() => {
    if (!sessionId) return
    let mounted = true
    setInitialLoading(true)
    consultationApi
      .getDoctorSessionDetail(sessionId)
      .then((res) => {
        if (mounted) setDetail(res.data)
      })
      .catch((error) => {
        if (mounted) {
          toast({
            variant: "destructive",
            description: readError(error, "Không thể tải thông tin phiên tư vấn."),
          })
        }
      })
      .finally(() => {
        if (mounted) setInitialLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [sessionId, toast])

  // Background refresh detail without unmounting child components
  const refreshDetail = useCallback(async () => {
    if (!sessionId) return
    try {
      const res = await consultationApi.getDoctorSessionDetail(sessionId)
      setDetail(res.data)
    } catch {
      // ignore or silently fail on background refresh
    }
  }, [sessionId])

  // 2. Fetch initial messages
  useEffect(() => {
    if (!sessionId) return
    let mounted = true
    consultationApi
      .listMessages(sessionId, { page: 1, size: CHAT_PAGE_SIZE })
      .then((res) => {
        if (mounted) {
          const list = res.data.content || []
          setMessages(list)
          setHasMoreMessages(list.length === CHAT_PAGE_SIZE)
        }
      })
      .catch((error) => {
        if (mounted) {
          toast({
            variant: "destructive",
            description: readError(error, "Không thể tải lịch sử trao đổi."),
          })
          setMessages([])
        }
      })

    return () => {
      mounted = false
    }
  }, [sessionId, toast])

  // 3. Chronologically sorted messages
  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
    )
  }, [messages])

  // 4. WebSocket real-time incoming messages
  const handleIncomingMessage = useCallback((message: ConsultationMessageItem) => {
    setMessages((current) => {
      if (current.some((item) => item.id === message.id)) {
        return current
      }
      return [...current, message]
    })
  }, [])

  useConsultationSocket(sessionId || null, handleIncomingMessage)

  // 5. Mark as read
  const lastMarkedMessageIdRef = useRef<string | number | null>(null)
  useEffect(() => {
    if (!sessionId || detail?.session.status !== "ACTIVE") return
    const lastMessage = sortedMessages.at(-1)
    if (lastMessage?.id && lastMarkedMessageIdRef.current !== lastMessage.id) {
      lastMarkedMessageIdRef.current = lastMessage.id
      void consultationApi.markRead(sessionId, lastMessage.id).catch(() => undefined)
    }
  }, [sessionId, detail?.session.status, sortedMessages.length, sortedMessages])

  // 6. Pagination / Load older messages
  const handleLoadMoreMessages = useCallback(async () => {
    if (!sessionId || loadingMoreMessages || !hasMoreMessages || messages.length === 0) return

    const oldestMessageId = sortedMessages[0]?.id
    if (!oldestMessageId) return

    setLoadingMoreMessages(true)
    try {
      const response = await consultationApi.listMessagesBefore(sessionId, oldestMessageId, {
        page: 1,
        size: CHAT_PAGE_SIZE,
      })
      if (response.data.content.length > 0) {
        setMessages((prev) => {
          const newItems = response.data.content.filter((msg) => !prev.some((p) => p.id === msg.id))
          return [...prev, ...newItems]
        })
      }
      setHasMoreMessages(response.data.content.length === CHAT_PAGE_SIZE)
    } catch (error) {
      toast({
        variant: "destructive",
        description: readError(error, "Không thể tải tin nhắn cũ hơn."),
      })
    } finally {
      setLoadingMoreMessages(false)
    }
  }, [sessionId, loadingMoreMessages, hasMoreMessages, messages.length, sortedMessages, toast])

  // 7. Send Message
  const handleSendMessage = useCallback(
    async (event?: FormEvent<HTMLFormElement>, contentOverride?: string) => {
      if (event) event.preventDefault()
      if (!sessionId || detail?.session.status !== "ACTIVE") return

      const content = (contentOverride !== undefined ? contentOverride : messageDraft).trim()
      const fileUrl = attachmentUrl.trim()
      if (!content && !fileUrl) return

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

      setChatLoading(true)
      try {
        const response = await consultationApi.sendMessage(sessionId, payload)
        handleIncomingMessage(response.data)
        setMessageDraft("")
        setAttachmentUrl("")
      } catch (error) {
        toast({
          variant: "destructive",
          description: readError(error, "Không thể gửi tin nhắn."),
        })
      } finally {
        setChatLoading(false)
      }
    },
    [sessionId, detail?.session.status, messageDraft, attachmentUrl, handleIncomingMessage, toast]
  )

  const session = detail?.session
  const member = session?.member
  const memberDisplayName =
    member?.displayName ||
    session?.memberDisplayName ||
    (member?.userId || session?.memberId ? `Bệnh nhân #${member?.userId || session?.memberId}` : `Bệnh nhân #${session?.id}`)
  const memberId = member?.userId || session?.memberId

  const isCompleted = session?.status === "COMPLETED"
  const isCancelled = session?.status === "CANCELLED"
  const readOnlyMode = isCompleted || isCancelled || session?.status === "SCHEDULED"
  const readOnlyReason = isCompleted
    ? "Phiên tư vấn đã hoàn tất. Bạn chỉ có thể xem lại lịch sử trao đổi."
    : isCancelled
      ? "Phiên tư vấn đã bị hủy. Không thể tiếp tục gửi tin nhắn."
      : session?.status === "SCHEDULED"
        ? "Phiên tư vấn chưa bắt đầu."
        : undefined
  const canSend = session?.status === "ACTIVE" && !readOnlyMode

  if (initialLoading && !detail) {
    return (
      <Page fill bleed>
        <PageBody className="items-center justify-center text-center gap-3 p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <p className="text-sm font-semibold text-slate-600">Đang tải không gian khám chuyên khoa...</p>
        </PageBody>
      </Page>
    )
  }

  if (!session) {
    return (
      <Page fill bleed>
        <PageBody className="items-center justify-center text-center gap-4 p-6">
          <ShieldAlert className="h-12 w-12 text-danger-500" />
          <h2 className="text-lg font-bold text-slate-800">Không tìm thấy phiên khám</h2>
          <p className="text-xs text-slate-500 max-w-md">
            Phiên tư vấn này không tồn tại hoặc bạn không được phân công phụ trách.
          </p>
          <Button onClick={() => navigate("/app/management/doctor/consultations")} className="rounded-xl">
            Quay lại danh sách
          </Button>
        </PageBody>
      </Page>
    )
  }

  return (
    <Page fill bleed>
      {/* Top Clinical Header: patient identity, status and quick clinical actions */}
      <PageHeader
        compact
        className="px-4 sm:px-6 py-3 border-b border-border bg-background"
        breadcrumbs={[
          { label: "Quản lý phiên khám", to: "/app/management/doctor/consultations" },
          { label: memberDisplayName },
        ]}
        icon={
          <span className="flex h-5 w-5 items-center justify-center text-sm font-black leading-none">
            {memberDisplayName.charAt(0).toUpperCase()}
          </span>
        }
        title={memberDisplayName}
        description={
          member?.phone || member?.email ? (
            <div className="flex flex-wrap items-center gap-3">
              {member?.phone && (
                <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {member.phone}
                </span>
              )}
              {member?.email && (
                <span className="inline-flex items-center gap-1 text-[11px]">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {member.email}
                </span>
              )}
            </div>
          ) : undefined
        }
        meta={
          <>
            {memberId && (
              <Badge variant="outline" className="font-mono text-[11px] px-1.5 py-0 border-slate-200 text-slate-500">
                ID: #{memberId}
              </Badge>
            )}
            {getSessionStatusBadge(session.status, session.meaningfulCareOccurred)}
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">
              {session.packageNameSnapshot || "Tư vấn chuyên khoa"}
            </span>
          </>
        }
        actions={
          <>
            {/* Countdown / Duration Badge */}
            {session.status === "ACTIVE" && session.endsAt && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-success-50 border border-success-200 text-success-800 text-xs font-bold shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-success-600 animate-pulse" />
                <span>Hạn kết thúc: {formatDate(session.endsAt)}</span>
              </div>
            )}

            {/* Quick Summary Prompt */}
            {session.status === "COMPLETED" && session.summaryClosureStatus === "SUMMARY_PENDING" && (
              <Button
                size="sm"
                onClick={() => setActiveTab("summary")}
                className="h-9 px-3 rounded-xl bg-warning-500 hover:bg-warning-600 text-white font-extrabold text-xs shadow-xs cursor-pointer animate-pulse"
              >
                <FileText className="w-4 h-4 mr-1.5" />
                Lập tổng kết y khoa
              </Button>
            )}

            {/* View Full Session Info & Schedule Dialog */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDetailDialogOpen(true)}
              className="h-9 px-3 rounded-xl border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Info className="w-4 h-4 text-slate-500" />
              <span>Lịch & Chi tiết</span>
            </Button>
          </>
        }
      />

      {/* Workspace panel: tab bar + content that fills the remaining height and scrolls inside */}
      <PageBody className="gap-0 overflow-hidden bg-white">
        {/* Tab Navigation */}
        <div className="shrink-0 overflow-x-auto border-b border-slate-100 px-4 sm:px-6 py-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-9 bg-slate-100/80 p-0.5 rounded-xl gap-1">
              <TabsTrigger
                value="chat"
                className="text-xs font-bold rounded-lg px-3 data-[state=active]:bg-white data-[state=active]:text-primary-700 data-[state=active]:shadow-xs flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Trò chuyện trực tiếp</span>
                {session.status === "ACTIVE" && (
                  <span className="w-2 h-2 rounded-full bg-success-500 animate-ping" />
                )}
              </TabsTrigger>

              <TabsTrigger
                value="records"
                className="text-xs font-bold rounded-lg px-3 data-[state=active]:bg-white data-[state=active]:text-primary-700 data-[state=active]:shadow-xs flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Hồ sơ sức khỏe & Bản đo</span>
                {session.unresolvedAttentionCount > 0 && (
                  <Badge className="h-4 px-1.5 rounded-full bg-danger-500 text-white font-black text-[10px]">
                    {session.unresolvedAttentionCount}
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="summary"
                className="text-xs font-bold rounded-lg px-3 data-[state=active]:bg-white data-[state=active]:text-primary-700 data-[state=active]:shadow-xs flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Tổng kết y khoa</span>
                {session.summaryClosureStatus === "SUMMARY_PENDING" && (
                  <Badge className="h-4 px-1.5 rounded-full bg-warning-500 text-white font-black text-[10px]">
                    Cần lập
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="continuity"
                className="text-xs font-bold rounded-lg px-3 data-[state=active]:bg-white data-[state=active]:text-primary-700 data-[state=active]:shadow-xs flex items-center gap-1.5"
              >
                <History className="w-3.5 h-3.5" />
                <span>Tiền sử chăm sóc</span>
              </TabsTrigger>

              <TabsTrigger
                value="nutrition"
                className="text-xs font-bold rounded-lg px-3 data-[state=active]:bg-white data-[state=active]:text-primary-700 data-[state=active]:shadow-xs flex items-center gap-1.5"
              >
                <Salad className="w-3.5 h-3.5" />
                <span>Dinh dưỡng</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Main Workspace Content Area */}
        <div className="flex-1 min-h-0 overflow-hidden relative">
          {activeTab === "chat" && (
            <div className="h-full flex flex-col bg-white">
              {session && (
                <SessionContinuationBanner
                  session={session as any}
                  isDoctor={true}
                  isMember={false}
                  onSessionRefreshed={refreshDetail}
                />
              )}
              <ChatMessageList
                messages={sortedMessages}
                loadingMoreMessages={loadingMoreMessages}
                hasMoreMessages={hasMoreMessages}
                currentUserId={userSession?.userId}
                isDoctor={true}
                isMember={false}
                onLoadMore={handleLoadMoreMessages}
              />

              <ChatComposer
                messageDraft={messageDraft}
                attachmentUrl={attachmentUrl}
                canSend={canSend}
                loading={chatLoading}
                readOnlyMode={readOnlyMode}
                readOnlyReason={readOnlyReason}
                onMessageChange={setMessageDraft}
                onSubmit={handleSendMessage}
              />
            </div>
          )}

          {activeTab === "records" && (
            <div className="h-full overflow-y-auto p-3 sm:p-4 bg-slate-50/70">
              <DoctorScopedRecordsTab sessionId={session.id} />
            </div>
          )}

          {activeTab === "summary" && (
            <div className="h-full overflow-y-auto p-3 sm:p-4 bg-slate-50/70">
              <DoctorFinalSummaryTab
                sessionId={session.id}
                sessionStatus={session.status}
                meaningfulCareOccurred={session.meaningfulCareOccurred}
                flowType={session.flowType}
                summaryDueAt={session.summaryDueAt}
                summaryClosureStatus={session.summaryClosureStatus}
                onFinalized={refreshDetail}
              />
            </div>
          )}

          {activeTab === "continuity" && (
            <div className="h-full overflow-y-auto p-3 sm:p-4 bg-slate-50/70">
              <DoctorContinuityTab sessionId={session.id} />
            </div>
          )}

          {activeTab === "nutrition" && (
            <div className="h-full overflow-y-auto p-3 sm:p-4 bg-slate-50/70">
              <DoctorDietPrescriptionTab sessionId={session.id} readOnly={session.status !== "ACTIVE" && session.status !== "SCHEDULED"} />
            </div>
          )}
        </div>
      </PageBody>

      {/* Quick Session Details & Schedule Dialog */}
      {isDetailDialogOpen && (
        <DoctorSessionDetailDialog
          sessionId={session.id}
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          onSessionRefreshed={refreshDetail}
        />
      )}
    </Page>
  )
}

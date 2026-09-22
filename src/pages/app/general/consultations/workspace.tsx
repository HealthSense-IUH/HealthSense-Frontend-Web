import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import {
  Activity,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  Loader2,
  MessagesSquare,
  RefreshCw,
  Share2,
  ShieldAlert,
  Stethoscope,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/stores/auth-store"
import { consultationApi } from "@/services"
import type {
  ConsultationFinalSummaryResponse,
  ConsultationMessageItem,
  ConsultationSessionItem,
  SendConsultationMessagePayload,
} from "@/types/consultation"

import { formatDate, statusBadge } from "@/pages/app/general/consultations/components/shared"
import { ChatMessageList } from "@/pages/app/general/consultations/components/chat/chat-message-list"
import { ChatComposer } from "@/pages/app/general/consultations/components/chat/chat-composer"
import { SessionContinuationBanner } from "@/pages/app/general/consultations/components/chat/session-continuation-banner"
import { useConsultationSocket } from "@/pages/app/general/consultations/hooks/use-consultation-socket"
import { ShareHealthRecordDialog } from "@/pages/app/general/consultations/components/share-health-record-dialog"
import { RenewalDialog } from "@/pages/app/general/consultations/components/renewal-dialog"

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

function checkOutsideSupportHours(session: ConsultationSessionItem | null): boolean {
  if (!session || session.status !== "ACTIVE") return false
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

export default function MemberSessionWorkspacePage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { toast } = useToast()
  const userSession = useAuthStore((state) => state.userSession)

  const activeTab = searchParams.get("tab") || "chat"
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab })
  }

  const [session, setSession] = useState<ConsultationSessionItem | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)

  // Dialog states
  const [isShareRecordOpen, setIsShareRecordOpen] = useState(false)
  const [isRenewalOpen, setIsRenewalOpen] = useState(false)

  // Chat states
  const [messages, setMessages] = useState<ConsultationMessageItem[]>([])
  const [messageDraft, setMessageDraft] = useState("")
  const [attachmentUrl, setAttachmentUrl] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)

  // Summary states
  const [summary, setSummary] = useState<ConsultationFinalSummaryResponse | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  // 1. Initial Fetch Member Session Detail
  useEffect(() => {
    if (!sessionId) return
    let mounted = true
    setInitialLoading(true)
    consultationApi
      .getSession(sessionId)
      .then((res) => {
        if (mounted) setSession(res.data)
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

  // Background refresh session without unmounting child components
  const refreshSession = useCallback(async () => {
    if (!sessionId) return
    try {
      const res = await consultationApi.getSession(sessionId)
      setSession(res.data)
    } catch {
      // silently ignore background refresh failure
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
    if (!sessionId || session?.status !== "ACTIVE") return
    const lastMessage = sortedMessages.at(-1)
    if (lastMessage?.id && lastMarkedMessageIdRef.current !== lastMessage.id) {
      lastMarkedMessageIdRef.current = lastMessage.id
      void consultationApi.markRead(sessionId, lastMessage.id).catch(() => undefined)
    }
  }, [sessionId, session?.status, sortedMessages])

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
      if (!sessionId || session?.status !== "ACTIVE") return

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
    [sessionId, session?.status, messageDraft, attachmentUrl, handleIncomingMessage, toast]
  )

  // 8. Fetch Final Summary on tab view
  useEffect(() => {
    if (activeTab !== "summary" || !sessionId) return
    let mounted = true
    setSummaryLoading(true)
    consultationApi
      .getMemberFinalSummary(sessionId)
      .then((res) => {
        if (mounted) setSummary(res.data)
      })
      .catch((err) => {
        const status = err?.response?.status
        const code = err?.response?.data?.code
        const msg = String(err?.response?.data?.message || "")
        if (
          status === 404 ||
          code === 3000 ||
          code === "3000" ||
          code === "ENTITY_NOT_FOUND" ||
          msg.toLowerCase().includes("has not been finalized")
        ) {
          if (mounted) setSummary(null)
        }
      })
      .finally(() => {
        if (mounted) setSummaryLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [activeTab, sessionId])

  const doctorDisplayName =
    session?.doctorDisplayName ||
    (session as any)?.doctorName ||
    (session?.doctorId ? `Bác sĩ #${session.doctorId}` : "Bác sĩ phụ trách")

  const isCompleted = session?.status === "COMPLETED"
  const isCancelled = session?.status === "CANCELLED"
  const isOutsideSupportHours = checkOutsideSupportHours(session)
  const readOnlyMode = isCompleted || isCancelled || isOutsideSupportHours || session?.status === "SCHEDULED"
  const readOnlyReason = isCompleted
    ? "Phiên tư vấn đã hoàn tất. Bạn chỉ có thể xem lại lịch sử trao đổi."
    : isCancelled
      ? "Phiên tư vấn đã bị hủy."
      : isOutsideSupportHours
        ? "Hiện ngoài khung giờ làm việc của bác sĩ. Bạn có thể gửi tin nhắn trong khung giờ hỗ trợ tiếp theo."
        : session?.status === "SCHEDULED"
          ? "Phiên tư vấn chưa bắt đầu."
          : undefined

  const canSend = session?.status === "ACTIVE" && !readOnlyMode

  if (initialLoading && !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Đang tải không gian tư vấn...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-4 py-24 text-center">
        <ShieldAlert className="h-10 w-10 text-red-500" />
        <h2 className="text-2xl font-bold text-foreground">Không tìm thấy phiên tư vấn</h2>
        <p className="text-sm text-muted-foreground">
          Phiên khám #{sessionId} không tồn tại hoặc bạn không có quyền truy cập.
        </p>
        <Button onClick={() => navigate("/app/general/consultations?tab=sessions")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách phiên
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-85px)] w-full gap-3 pb-1">
      {/* 1. Header Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-background p-4 rounded-2xl shadow-sm border border-border shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/app/general/consultations?tab=sessions")}
            className="h-9 px-2 text-muted-foreground hover:text-foreground shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Danh sách</span>
          </Button>

          <div className="h-6 w-px bg-border shrink-0" />

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
            <Stethoscope className="h-5 w-5" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold tracking-tight text-foreground truncate">
                Phiên tư vấn #{session.id}
              </h1>
              {statusBadge(session.status)}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium text-foreground">{doctorDisplayName}</span>
              </span>
              {session.endsAt && (
                <span className="flex items-center gap-1 hidden sm:inline-flex">
                  <Clock className="h-3.5 w-3.5" />
                  Hạn kết thúc: {formatDate(session.endsAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
          {session.status === "ACTIVE" && session.flowType !== "QUEUE_DISPATCH_V1" && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-primary border-primary/30 hover:bg-primary/5"
              onClick={() => setIsRenewalOpen(true)}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Gia hạn</span>
            </Button>
          )}

          {session.status === "ACTIVE" && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setIsShareRecordOpen(true)}
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Chia sẻ hồ sơ</span>
            </Button>
          )}

          {session.status !== "SCHEDULED" && (
            <Button
              variant={activeTab === "summary" ? "default" : "outline"}
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setActiveTab("summary")}
            >
              <FileCheck className="h-3.5 w-3.5" />
              <span>Tổng kết y khoa</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Main Content Tabs */}
      <div className="flex-1 min-h-0 flex flex-col bg-background rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="border-b border-border bg-muted/20 px-4 py-2 shrink-0 flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-9 bg-muted/60 p-1 rounded-xl">
              <TabsTrigger value="chat" className="rounded-lg text-xs font-semibold gap-1.5 px-3">
                <MessagesSquare className="w-3.5 h-3.5" />
                <span>Trò chuyện trực tiếp</span>
                {messages.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-primary/15 text-primary font-bold">
                    {messages.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="summary" className="rounded-lg text-xs font-semibold gap-1.5 px-3">
                <FileText className="w-3.5 h-3.5" />
                <span>Tổng kết từ Bác sĩ</span>
                {isCompleted && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-green-500/15 text-green-700 dark:text-green-400 font-bold">
                    Hoàn tất
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="records" className="rounded-lg text-xs font-semibold gap-1.5 px-3">
                <Activity className="w-3.5 h-3.5" />
                <span>Hồ sơ sức khỏe</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tab 1: Live Chat */}
        {activeTab === "chat" && (
          <div className="flex-1 min-h-0 flex flex-col relative">
            <SessionContinuationBanner
              session={session}
              isDoctor={false}
              isMember={true}
              onSessionRefreshed={refreshSession}
            />

            {isOutsideSupportHours && (
              <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900 flex items-center gap-2 shrink-0">
                <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  Hiện ngoài khung giờ hỗ trợ của bác sĩ. Bạn vẫn có thể xem lại lịch sử trao đổi và gửi tin nhắn khi đến giờ trực.
                </span>
              </div>
            )}

            <div className="flex-1 min-h-0 overflow-y-auto">
              <ChatMessageList
                messages={sortedMessages}
                loadingMoreMessages={loadingMoreMessages}
                hasMoreMessages={hasMoreMessages}
                currentUserId={userSession?.userId}
                isDoctor={false}
                isMember={true}
                onLoadMore={handleLoadMoreMessages}
              />
            </div>

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

        {/* Tab 2: Medical Summary */}
        {activeTab === "summary" && (
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full">
            {summaryLoading ? (
              <div className="space-y-4 py-8">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : !summary || summary.status !== "FINALIZED" ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Activity className="h-12 w-12 text-muted-foreground/40 mb-3" />
                  <h3 className="text-base font-semibold text-foreground">
                    Bác sĩ đang hoàn tất tổng kết phiên tư vấn
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
                    Bản tổng kết y khoa chính thức (tóm tắt lâm sàng, nhận xét, lời dặn và kế hoạch theo dõi) sẽ hiển thị tại đây ngay sau khi bác sĩ phụ trách hoàn tất phiên khám.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-green-900">Tổng kết y khoa đã được hoàn tất</p>
                      <p className="text-xs text-green-700">
                        Thời gian chốt: {formatDate(summary.finalizedAt)}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-600 hover:bg-green-700 text-white">Đã hoàn tất</Badge>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Tóm tắt lâm sàng & Đánh giá của Bác sĩ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg bg-muted/40 p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {summary.summary || <span className="text-muted-foreground italic">Không có nội dung tóm tắt</span>}
                    </div>

                    {summary.observations && (
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-muted-foreground">Nhận xét & Quan sát:</h4>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{summary.observations}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {summary.recommendations && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Lời dặn & Khuyến nghị chăm sóc
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg bg-blue-50/50 border border-blue-100 p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {summary.recommendations}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {summary.followUpRecommendation && (
                  <div className="flex items-center gap-2 p-3.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 text-sm">
                    <Calendar className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Tái khám:</strong> {summary.followUpRecommendation}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Shared Health Records */}
        {activeTab === "records" && (
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">Hồ sơ sức khỏe trong phiên khám</h3>
                <p className="text-sm text-muted-foreground">
                  Hồ sơ sức khỏe và dữ liệu sinh hiệu bác sĩ phụ trách được cấp quyền theo dõi.
                </p>
              </div>
              {session.status === "ACTIVE" && (
                <Button size="sm" onClick={() => setIsShareRecordOpen(true)} className="gap-1.5 shadow-sm">
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Chia sẻ thêm hồ sơ</span>
                </Button>
              )}
            </div>

            {session.healthRecordId ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">Hồ sơ sức khỏe #{session.healthRecordId}</CardTitle>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200">Đã chia sẻ</Badge>
                  </div>
                  <CardDescription>
                    Hồ sơ được đính kèm khi đăng ký phiên tư vấn hoặc được cấp quyền trong quá trình khám.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Activity className="h-10 w-10 text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-medium text-foreground">Chưa có hồ sơ sức khỏe nào được chia sẻ</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    Bạn có thể chia sẻ các bản đo huyết áp, đường huyết hoặc điện tâm đồ để bác sĩ nắm rõ tình trạng sức khỏe.
                  </p>
                  {session.status === "ACTIVE" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 gap-1.5"
                      onClick={() => setIsShareRecordOpen(true)}
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Chia sẻ hồ sơ ngay
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Share Health Record Dialog */}
      <ShareHealthRecordDialog
        sessionId={session.id}
        sessionStatus={session.status}
        open={isShareRecordOpen}
        onOpenChange={setIsShareRecordOpen}
        onSharedSuccess={refreshSession}
      />

      {/* Renewal Dialog */}
      <RenewalDialog
        session={session}
        open={isRenewalOpen}
        onOpenChange={setIsRenewalOpen}
        onSessionRefreshed={refreshSession}
      />
    </div>
  )
}

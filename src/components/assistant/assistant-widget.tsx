import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { AnimatePresence, animate, motion, useDragControls, useMotionValue, useReducedMotion } from "framer-motion"
import { ChevronLeft, ChevronRight, History, Loader2, Plus, Send, Square, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { assistantApi } from "@/services/assistant.service"
import { useAuthStore } from "@/stores/auth-store"
import type { AssistantConversation, AssistantMessage } from "@/types/assistant"

import { AssistantMarkdown } from "./assistant-markdown"
import { CaraMascot } from "./cara-mascot"

const STORAGE_KEY = "healthsense.assistant.conversation"

function storageKey(userId: string | number) {
  return `${STORAGE_KEY}.${userId}`
}

const POSITION_KEY = "healthsense.assistant.position"
const EXPANDED_KEY = "healthsense.assistant.expanded"
const BUTTON = 56 // nút nổi 56px, cách mép phải/dưới 20px
const PANEL_GAP = 68 // khung chat nằm 12px phía trên nút (56 + 12)

type Viewport = { w: number; h: number }

function readViewport(): Viewport {
  return { w: window.innerWidth, h: window.innerHeight }
}

function panelSize(expanded: boolean, vp: Viewport) {
  return {
    w: Math.min(expanded ? 760 : 420, vp.w - 40),
    h: Math.min(640, vp.h - 112),
  }
}

/**
 * Khoảng dịch chuyển cho phép (so với vị trí gốc ở góc phải dưới) để cả nút lẫn khung chat
 * luôn nằm trọn trong màn hình. Khi khung mở hoặc mở rộng, vùng cho phép thu hẹp lại và
 * widget được kéo ngược vào trong.
 */
function dragBounds(open: boolean, expanded: boolean, vp: Viewport) {
  const size = open ? panelSize(expanded, vp) : { w: BUTTON, h: BUTTON }
  const top = open ? vp.h - 20 - PANEL_GAP - size.h : vp.h - 20 - BUTTON
  const left = vp.w - 20 - Math.max(size.w, BUTTON)
  return { left: -left, right: 20, top: -top, bottom: 20 }
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max)
}

function readPosition() {
  try {
    const raw = localStorage.getItem(POSITION_KEY)
    if (!raw) return { x: 0, y: 0 }
    const parsed = JSON.parse(raw) as { x?: number; y?: number }
    return { x: Number(parsed.x) || 0, y: Number(parsed.y) || 0 }
  } catch {
    return { x: 0, y: 0 }
  }
}

// Hiệu ứng "genie" kiểu macOS: khung bị hút vào nút nổi qua một "phễu" ở góc phải dưới.
const CLIP_FULL = "polygon(0% 0%, 100% 0%, 100% 100%, 100% 100%, 0% 100%, 0% 100%)"
const CLIP_MID = "polygon(0% 0%, 100% 0%, 100% 70%, 97% 100%, 90% 100%, 0% 70%)"
const CLIP_TIGHT = "polygon(0% 0%, 100% 0%, 100% 40%, 99% 100%, 96% 100%, 0% 40%)"
const genie = {
  hidden: { opacity: 0, scaleX: 0.2, scaleY: 0.05, y: 60, clipPath: CLIP_TIGHT },
  shown: {
    opacity: [0, 1, 1],
    scaleX: [0.2, 0.92, 1],
    scaleY: [0.05, 0.55, 1],
    y: [60, 20, 0],
    clipPath: [CLIP_TIGHT, CLIP_MID, CLIP_FULL],
    transition: { duration: 0.5, times: [0, 0.55, 1], ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: [1, 1, 0],
    scaleX: [1, 0.92, 0.2],
    scaleY: [1, 0.55, 0.05],
    y: [0, 20, 60],
    clipPath: [CLIP_FULL, CLIP_MID, CLIP_TIGHT],
    transition: { duration: 0.4, times: [0, 0.45, 1], ease: [0.7, 0, 0.84, 0] as const },
  },
}
const fade = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

/**
 * Trợ lý AI nổi ở góc phải dưới của mọi trang trong app.
 * Câu trả lời nhận theo thời gian thực qua SSE; lịch sử lưu ở máy chủ theo hội thoại.
 */
export function AssistantWidget() {
  const { t } = useTranslation("assistant")
  const userId = useAuthStore((s) => s.userSession?.userId)

  const [open, setOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [conversations, setConversations] = useState<AssistantConversation[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  // Kéo thả + giới hạn trong màn hình
  const [expanded, setExpanded] = useState(() => localStorage.getItem(EXPANDED_KEY) === "1")
  const [viewport, setViewport] = useState<Viewport>(readViewport)
  const dragControls = useDragControls()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const draggedRef = useRef(false)
  const reducedMotion = useReducedMotion()
  const bounds = useMemo(() => dragBounds(open, expanded, viewport), [open, expanded, viewport])

  useEffect(() => {
    const saved = readPosition()
    x.set(saved.x)
    y.set(saved.y)
    const onResize = () => setViewport(readViewport())
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [x, y])

  // Vượt khung hình (đổi kích thước cửa sổ, mở khung, mở rộng) thì kéo widget ngược vào trong
  useEffect(() => {
    const nx = clamp(x.get(), bounds.left, bounds.right)
    const ny = clamp(y.get(), bounds.top, bounds.bottom)
    if (nx !== x.get()) animate(x, nx, { duration: 0.25 })
    if (ny !== y.get()) animate(y, ny, { duration: 0.25 })
    localStorage.setItem(POSITION_KEY, JSON.stringify({ x: nx, y: ny }))
  }, [bounds, x, y])

  useEffect(() => {
    localStorage.setItem(EXPANDED_KEY, expanded ? "1" : "0")
  }, [expanded])

  const loadConversation = useCallback(
    async (id: string) => {
      setLoadError(null)
      try {
        const res = await assistantApi.getMessages(id)
        setConversationId(id)
        setMessages(
          res.data.map((m) => ({ id: newId(), role: m.role, content: m.content }))
        )
        if (userId != null) localStorage.setItem(storageKey(userId), id)
      } catch {
        setLoadError(t("errors.load"))
      }
    },
    [t, userId]
  )

  const startConversation = useCallback(async () => {
    setLoadError(null)
    try {
      const res = await assistantApi.createConversation()
      setConversations((prev) => [res.data, ...prev])
      setConversationId(res.data.id)
      setMessages([])
      if (userId != null) localStorage.setItem(storageKey(userId), res.data.id)
      return res.data.id
    } catch {
      setLoadError(t("errors.load"))
      return null
    }
  }, [t, userId])

  // Mở lần đầu: lấy danh sách hội thoại, mở lại hội thoại gần nhất (hoặc tạo mới khi gửi câu đầu)
  useEffect(() => {
    if (!open || userId == null || conversationId) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await assistantApi.listConversations()
        if (cancelled) return
        setConversations(res.data)
        const remembered = localStorage.getItem(storageKey(userId))
        const candidate =
          res.data.find((c) => c.id === remembered)?.id ?? res.data[0]?.id ?? null
        if (candidate) await loadConversation(candidate)
      } catch {
        if (!cancelled) setLoadError(t("errors.load"))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, userId, conversationId, loadConversation, t])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open, conversationId])

  const stop = () => {
    abortRef.current?.abort()
    abortRef.current = null
    setStreaming(false)
    setMessages((prev) => prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)))
  }

  const send = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || streaming) return

    let id = conversationId
    if (!id) {
      id = await startConversation()
      if (!id) return
    }

    const assistantId = newId()
    setInput("")
    setMessages((prev) => [
      ...prev,
      { id: newId(), role: "user", content },
      { id: assistantId, role: "assistant", content: "", streaming: true },
    ])
    setStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    const patch = (update: Partial<AssistantMessage>, append?: string) =>
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, ...update, content: append ? m.content + append : (update.content ?? m.content) } : m
        )
      )

    try {
      await assistantApi.streamChat(
        id,
        content,
        (event) => {
          if (event.event === "delta") patch({}, event.text)
          else if (event.event === "error") patch({ error: true, streaming: false, content: event.message || t("errors.stream") })
          else if (event.event === "done") patch({ streaming: false })
        },
        controller.signal
      )
      patch({ streaming: false })
      // Hội thoại vừa có tiêu đề (câu hỏi đầu tiên): làm mới danh sách
      assistantApi.listConversations().then((res) => setConversations(res.data)).catch(() => undefined)
    } catch (err) {
      if (controller.signal.aborted) return
      const unauthorized = err instanceof Error && err.message === "UNAUTHORIZED"
      patch({ error: true, streaming: false, content: unauthorized ? t("errors.unauthorized") : t("errors.stream") })
    } finally {
      if (abortRef.current === controller) abortRef.current = null
      setStreaming(false)
    }
  }

  const removeConversation = async (id: string) => {
    try {
      await assistantApi.deleteConversation(id)
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (id === conversationId) {
        setConversationId(null)
        setMessages([])
        if (userId != null) localStorage.removeItem(storageKey(userId))
      }
    } catch {
      setLoadError(t("errors.load"))
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  if (userId == null) return null

  const startDrag = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return
    dragControls.start(e)
  }

  return (
    <motion.div
      className="fixed bottom-5 right-5 z-40 h-14 w-14"
      style={{ x, y }}
      drag
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={bounds}
      onDragStart={() => {
        draggedRef.current = true
      }}
      onDragEnd={() => localStorage.setItem(POSITION_KEY, JSON.stringify({ x: x.get(), y: y.get() }))}
    >
      {/* Nút nổi: kéo để di chuyển, bấm để mở/đóng */}
      <button
        type="button"
        onPointerDown={(e) => dragControls.start(e)}
        onClick={() => {
          if (draggedRef.current) {
            draggedRef.current = false
            return
          }
          setOpen((v) => !v)
        }}
        aria-label={open ? t("close") : t("open")}
        className={cn(
          "flex h-14 w-14 cursor-grab touch-none items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition-transform hover:scale-105 active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          open && "scale-95"
        )}
      >
        {open ? <X className="h-6 w-6" /> : <CaraMascot size={46} />}
      </button>

      {/* Khung chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            role="dialog"
            aria-label={t("title")}
            variants={reducedMotion ? fade : genie}
            initial="hidden"
            animate="shown"
            exit="exit"
            style={{ transformOrigin: "100% 100%" }}
            className={cn(
              "absolute bottom-[68px] right-0 flex h-[min(640px,calc(100vh-7rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl transition-[width] duration-300",
              expanded ? "w-[min(760px,calc(100vw-2.5rem))]" : "w-[min(420px,calc(100vw-2.5rem))]"
            )}
          >
            {/* Tay nắm bên trái: mở rộng / thu gọn */}
            <button
              type="button"
              aria-label={expanded ? t("collapse") : t("expand")}
              title={expanded ? t("collapse") : t("expand")}
              onClick={() => setExpanded((v) => !v)}
              className="absolute left-0 top-1/2 z-10 flex h-14 w-4 -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 border-border bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {expanded ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            </button>

            {/* Đầu khung: kéo ở đây để di chuyển */}
            <div
              onPointerDown={startDrag}
              className="flex cursor-grab touch-none select-none items-center gap-3 border-b border-border px-4 py-3 active:cursor-grabbing"
            >
              <CaraMascot size={40} mood={streaming ? "thinking" : "happy"} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{t("title")}</p>
                <p className="truncate text-xs text-muted-foreground">{t("subtitle")}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("history")}
                onClick={() => setShowHistory((v) => !v)}
                className={cn("h-8 w-8", showHistory && "bg-accent")}
              >
                <History className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("newConversation")}
                onClick={() => {
                  stop()
                  setShowHistory(false)
                  void startConversation()
                }}
                className="h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Danh sách hội thoại cũ */}
            {showHistory && (
              <div className="max-h-48 overflow-y-auto border-b border-border bg-muted/30 p-2 text-sm">
                {conversations.length === 0 ? (
                  <p className="px-2 py-3 text-center text-xs text-muted-foreground">{t("noHistory")}</p>
                ) : (
                  conversations.map((c) => (
                    <div
                      key={c.id}
                      className={cn(
                        "group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent",
                        c.id === conversationId && "bg-accent"
                      )}
                    >
                      <button
                        type="button"
                        className="min-w-0 flex-1 truncate text-left"
                        onClick={() => {
                          stop()
                          setShowHistory(false)
                          void loadConversation(c.id)
                        }}
                      >
                        {c.title || t("untitled")}
                      </button>
                      <button
                        type="button"
                        aria-label="delete"
                        onClick={() => void removeConversation(c.id)}
                        className="shrink-0 rounded p-1 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tin nhắn */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {loadError && (
                <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{loadError}</p>
              )}

              {messages.length === 0 && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CaraMascot size={56} />
                    <p className="pt-1 text-sm text-muted-foreground">{t("welcome")}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {(["latest", "workout", "consultation", "navigate"] as const).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => void send(t(`suggestions.${key}`))}
                        className="rounded-xl border border-border bg-background px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 hover:bg-accent"
                      >
                        {t(`suggestions.${key}`)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2.5",
                        m.role === "user"
                          ? "rounded-br-md bg-primary text-primary-foreground"
                          : "rounded-bl-md bg-muted",
                        m.error && "border border-destructive/40 bg-destructive/10 text-destructive"
                      )}
                    >
                      {m.role === "user" ? (
                        <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                      ) : m.content ? (
                        <AssistantMarkdown content={m.content} className={m.error ? "text-destructive" : undefined} />
                      ) : (
                        <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          {t("thinking")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div ref={bottomRef} />
            </div>

            {/* Ô nhập */}
            <div className="border-t border-border p-3">
              <div className="flex items-end gap-2">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={t("placeholder")}
                  rows={1}
                  className="max-h-32 min-h-10 flex-1 resize-none text-sm"
                  disabled={streaming}
                />
                {streaming ? (
                  <Button type="button" variant="outline" size="icon" aria-label={t("stop")} onClick={stop} className="h-10 w-10 shrink-0">
                    <Square className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="button" size="icon" aria-label={t("send")} onClick={() => void send()} disabled={!input.trim()} className="h-10 w-10 shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="mt-2 text-[11px] leading-snug text-muted-foreground">{t("disclaimer")}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

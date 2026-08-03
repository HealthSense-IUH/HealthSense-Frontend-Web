import { type FormEvent, useEffect, useRef } from "react"
import { Send, User, MessageSquare } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

import type { ConsultationMessageItem, ConsultationSessionItem } from "../types"
import { formatDate, statusBadge } from "./shared"

export function ChatPanel({
  sessions,
  selectedSession,
  messages,
  socketStatus,
  messageDraft,
  attachmentUrl,
  loading,
  loadingMoreMessages,
  hasMoreMessages,
  currentUserId,
  onSelectSession,
  onMessageChange,
  onAttachmentChange,
  onSubmit,
  onLoadMore,
}: {
  sessions: ConsultationSessionItem[]
  selectedSession: ConsultationSessionItem | null
  messages: ConsultationMessageItem[]
  socketStatus: string
  messageDraft: string
  attachmentUrl: string
  loading: boolean
  loadingMoreMessages?: boolean
  hasMoreMessages?: boolean
  currentUserId?: string | number
  onSelectSession: (session: ConsultationSessionItem) => void
  onMessageChange: (value: string) => void
  onAttachmentChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onLoadMore?: () => void
}) {
  const canSend = selectedSession?.status === "ACTIVE"
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex h-[700px] w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm xl:h-[750px]">
      {/* Sidebar - Sessions */}
      <div className="flex w-[320px] flex-shrink-0 flex-col border-r border-neutral-200 bg-white">
        <div className="border-b border-neutral-100 p-4">
          <h2 className="text-lg font-bold text-neutral-900">Sessions</h2>
          <p className="text-xs text-neutral-500">Select a session to chat</p>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col p-2">
            {sessions.length === 0 && (
              <p className="p-4 text-center text-sm text-neutral-500">No consultation sessions found.</p>
            )}
            {sessions.map((session) => {
              const isSelected = String(selectedSession?.id) === String(session.id)
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => onSelectSession(session)}
                  className={cn(
                    "mb-1 flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors",
                    isSelected
                      ? "bg-neutral-100"
                      : "hover:bg-neutral-50"
                  )}
                >
                  <div className={cn(
                    "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white",
                    isSelected ? "bg-[#0068ff]" : "bg-neutral-300"
                  )}>
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className={cn("truncate font-semibold text-sm", isSelected ? "text-neutral-900" : "text-neutral-700")}>
                        Session #{session.id}
                      </span>
                      <span className="flex-shrink-0 scale-75 origin-right">{statusBadge(session.status)}</span>
                    </div>
                    <p className={cn("truncate text-xs", isSelected ? "text-neutral-700" : "text-neutral-500")}>
                      {session.lastMessagePreview ?? "No messages yet"}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col min-w-0 bg-neutral-50/50">
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 shadow-sm z-10">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900">Session #{selectedSession.id}</h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    {statusBadge(selectedSession.status)}
                    <span>•</span>
                    <Badge variant={socketStatus === "connected" ? "default" : "secondary"} className="h-4 px-1 text-[10px] uppercase">
                      {socketStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="flex flex-col gap-4 py-2">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <MessageSquare className="mb-2 h-10 w-10 text-neutral-400" />
                    <p className="text-sm text-neutral-500">No messages yet in this session.</p>
                  </div>
                )}
                
                {hasMoreMessages && (
                  <div className="flex justify-center pb-4">
                    <Button variant="outline" size="sm" onClick={onLoadMore} disabled={loadingMoreMessages} className="rounded-full bg-white text-xs shadow-sm">
                      {loadingMoreMessages ? "Loading..." : "Load previous messages"}
                    </Button>
                  </div>
                )}

                {messages.map((message) => {
                  const isUserDoctor = String(selectedSession?.doctorId) === String(currentUserId)
                  const isUserMember = String(selectedSession?.memberId) === String(currentUserId)
                  const mine = String(message.senderId) === String(currentUserId) || 
                               (isUserDoctor && message.senderRole === "DOCTOR") || 
                               (isUserMember && message.senderRole === "MEMBER")
                  return (
                    <div key={message.id} className={cn("flex w-full", mine ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "group relative flex max-w-[75%] flex-col",
                        mine ? "items-end" : "items-start"
                      )}>
                        <div className="mb-1 flex items-center gap-2 px-1 text-[10px] font-medium text-neutral-400">
                          {!mine && <span>{message.senderRole}</span>}
                          <span>{formatDate(message.createdAt)}</span>
                        </div>
                        <div className={cn(
                          "relative rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed shadow-sm",
                          mine 
                            ? "rounded-br-sm bg-[#0068ff] text-white" 
                            : "rounded-bl-sm border border-neutral-200 bg-white text-neutral-900"
                        )}>
                          {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
                          {message.attachmentUrl && (
                            <a 
                              className={cn(
                                "mt-2 flex items-center gap-2 rounded-lg p-2 text-sm transition-colors",
                                mine ? "bg-white/10 hover:bg-white/20 text-white" : "bg-neutral-50 hover:bg-neutral-100 text-neutral-900 border border-neutral-100"
                              )} 
                              href={message.attachmentUrl} 
                              target="_blank" 
                              rel="noreferrer"
                            >
                              <div className="truncate font-medium">{message.attachmentName ?? "View Attachment"}</div>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Warning Banner */}
            {!canSend && (
              <div className="flex items-center justify-center border-y border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-900">
                This session is not ACTIVE, sending messages is disabled.
              </div>
            )}

            {/* Input Area */}
            <div className="bg-white p-4">
              <form 
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!canSend || loading || (!messageDraft.trim() && !attachmentUrl.trim())) return;
                  onSubmit(e)
                }} 
                className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-neutral-50/50 p-2 shadow-sm focus-within:border-neutral-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-100 transition-all"
              >
                {attachmentUrl && (
                  <div className="px-2 pt-2">
                    <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs shadow-sm">
                      <span className="truncate text-neutral-600 font-medium">Attachment: {attachmentUrl}</span>
                      <button 
                        type="button" 
                        onClick={() => onAttachmentChange("")}
                        className="text-neutral-400 hover:text-neutral-700 ml-2"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex items-end gap-2">
                  <div className="flex flex-1 flex-col">
                    <input
                      type="text"
                      className="w-full bg-transparent px-3 py-1.5 text-xs text-neutral-500 outline-none placeholder:text-neutral-400"
                      placeholder="Attachment URL (optional) for image/file"
                      value={attachmentUrl}
                      onChange={(e) => onAttachmentChange(e.target.value)}
                      disabled={!canSend || loading}
                    />
                    <textarea
                      className="max-h-32 min-h-[40px] w-full resize-none bg-transparent px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-500"
                      placeholder="Type a message..."
                      value={messageDraft}
                      onChange={(e) => onMessageChange(e.target.value)}
                      disabled={!canSend || loading}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          if (canSend && !loading && (messageDraft.trim() || attachmentUrl.trim())) {
                            onSubmit(e as any)
                          }
                        }
                      }}
                      rows={1}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="icon" 
                    className={cn(
                      "mb-1 mr-1 h-9 w-9 rounded-full transition-all flex-shrink-0",
                      messageDraft.trim() || attachmentUrl.trim() ? "bg-[#0068ff] text-white shadow-md hover:bg-blue-600" : "bg-neutral-200 text-neutral-400 hover:bg-neutral-200"
                    )}
                    disabled={!canSend || loading || (!messageDraft.trim() && !attachmentUrl.trim())} 
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center opacity-40">
            <MessageSquare className="mb-4 h-16 w-16 text-neutral-400" />
            <h3 className="text-xl font-semibold text-neutral-600">No Session Selected</h3>
            <p className="mt-2 text-sm text-neutral-500">Select a session from the sidebar to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  )
}

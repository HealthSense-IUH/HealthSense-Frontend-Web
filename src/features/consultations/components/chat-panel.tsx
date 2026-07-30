import { type FormEvent } from "react"
import { Send } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
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
  currentUserId,
  onSelectSession,
  onMessageChange,
  onAttachmentChange,
  onSubmit,
}: {
  sessions: ConsultationSessionItem[]
  selectedSession: ConsultationSessionItem | null
  messages: ConsultationMessageItem[]
  socketStatus: string
  messageDraft: string
  attachmentUrl: string
  loading: boolean
  currentUserId?: string | number
  onSelectSession: (session: ConsultationSessionItem) => void
  onMessageChange: (value: string) => void
  onAttachmentChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  const canSend = selectedSession?.status === "ACTIVE"

  return (
    <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>Select a session to load chat history.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {sessions.length === 0 && <p className="text-sm text-neutral-500">No consultation sessions found.</p>}
          {sessions.map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => onSelectSession(session)}
              className={cn(
                "rounded-lg border p-3 text-left transition hover:bg-neutral-50",
                String(selectedSession?.id) === String(session.id) ? "border-neutral-950 bg-neutral-50" : "border-neutral-200 bg-white"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">Session #{session.id}</span>
                {statusBadge(session.status)}
              </div>
              <p className="mt-1 truncate text-xs text-neutral-500">{session.lastMessagePreview ?? "No messages yet"}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="min-h-[620px]">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <CardTitle>Chat Room</CardTitle>
            <CardDescription>
              {selectedSession ? `Session #${selectedSession.id} - ${selectedSession.status}` : "Select a session to start"}
            </CardDescription>
          </div>
          <Badge variant={socketStatus === "connected" ? "default" : "secondary"}>{socketStatus}</Badge>
        </CardHeader>
        <CardContent className="flex min-h-[500px] flex-col gap-4">
          <ScrollArea className="h-[390px] rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex flex-col gap-3 pr-4">
              {!selectedSession && <p className="py-20 text-center text-sm text-neutral-500">Select a session to view messages.</p>}
              {selectedSession && messages.length === 0 && <p className="py-20 text-center text-sm text-neutral-500">No messages in this session yet.</p>}
              {messages.map((message) => {
                const mine = String(message.senderId) === String(currentUserId)
                return (
                  <div key={message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[78%] rounded-lg border p-3 shadow-sm", mine ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-950")}>
                      <div className="mb-1 flex items-center gap-2 text-xs opacity-80">
                        <span>{message.senderRole}</span>
                        <span>{formatDate(message.createdAt)}</span>
                      </div>
                      {message.content && <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>}
                      {message.attachmentUrl && (
                        <a className="mt-2 block break-all text-sm underline" href={message.attachmentUrl} target="_blank" rel="noreferrer">
                          {message.attachmentName ?? message.attachmentUrl}
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>

          {!canSend && selectedSession && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
              This session is not ACTIVE, sending messages is disabled.
            </div>
          )}

          <form className="flex flex-col gap-3" onSubmit={onSubmit}>
            <Input value={attachmentUrl} onChange={(event) => onAttachmentChange(event.target.value)} placeholder="Attachment URL (optional) for image/file" disabled={!canSend || loading} />
            <div className="flex gap-2">
              <Textarea value={messageDraft} onChange={(event) => onMessageChange(event.target.value)} placeholder="Type a message..." disabled={!canSend || loading} className="min-h-20" />
              <Button type="submit" size="icon" disabled={!canSend || loading || (!messageDraft.trim() && !attachmentUrl.trim())} aria-label="Send message">
                <Send />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

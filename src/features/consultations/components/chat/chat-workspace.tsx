import { MessageSquare } from "lucide-react"
import type { FormEvent } from "react"

import type { ConsultationMessageItem, ConsultationSessionItem } from "../../types"
import { ChatSidebar } from "./chat-sidebar"
import { ChatHeader } from "./chat-header"
import { ChatMessageList } from "./chat-message-list"
import { ChatComposer } from "./chat-composer"

interface ChatWorkspaceProps {
  sessions: ConsultationSessionItem[]
  selectedSession: ConsultationSessionItem | null
  messages: ConsultationMessageItem[]
  messageDraft: string
  attachmentUrl: string
  loading: boolean
  loadingMoreMessages?: boolean
  hasMoreMessages?: boolean
  currentUserId?: string | number
  isDoctor: boolean
  isMember: boolean
  onSelectSession: (session: ConsultationSessionItem) => void
  onMessageChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onLoadMore?: () => void
  isOutsideSupportHours?: boolean
}

export function ChatWorkspace({
  sessions,
  selectedSession,
  messages,
  messageDraft,
  attachmentUrl,
  loading,
  loadingMoreMessages = false,
  hasMoreMessages = false,
  currentUserId,
  isDoctor,
  isMember,
  onSelectSession,
  onMessageChange,
  onSubmit,
  onLoadMore,
  isOutsideSupportHours,
}: ChatWorkspaceProps) {
  const isCompleted = selectedSession?.status === "COMPLETED"
  const readOnlyMode = isCompleted || isOutsideSupportHours
  const readOnlyReason = isCompleted 
    ? "Phiên tư vấn đã hoàn tất. Bạn chỉ có thể xem lại nội dung trao đổi."
    : isOutsideSupportHours
      ? "Hiện ngoài khung giờ hỗ trợ. Bạn có thể gửi tin nhắn trong khung giờ đã cam kết."
      : undefined
  const canSend = selectedSession?.status === "ACTIVE" && !readOnlyMode

  return (
    <div className="flex flex-1 h-full w-full overflow-hidden bg-background">
      <ChatSidebar 
        sessions={sessions} 
        selectedSession={selectedSession} 
        isDoctor={isDoctor}
        isMember={isMember}
        onSelectSession={onSelectSession} 
      />

      <div className="flex flex-1 flex-col min-w-0 bg-background relative">
        {selectedSession ? (
          <>
            <ChatHeader 
              session={selectedSession} 
              isDoctor={isDoctor}
              isMember={isMember}
            />
            
            <ChatMessageList 
              messages={messages}
              loadingMoreMessages={loadingMoreMessages}
              hasMoreMessages={hasMoreMessages}
              currentUserId={currentUserId}
              isDoctor={isDoctor}
              isMember={isMember}
              onLoadMore={onLoadMore || (() => {})}
            />

            <ChatComposer 
              messageDraft={messageDraft}
              attachmentUrl={attachmentUrl}
              canSend={canSend}
              loading={loading}
              readOnlyMode={readOnlyMode}
              readOnlyReason={readOnlyReason}
              onMessageChange={onMessageChange}
              onSubmit={onSubmit}
            />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-muted/20">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-6">
              <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">No Session Selected</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm text-center">
              Select a consultation session from the sidebar to view history or start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

import { MessageSquare } from "lucide-react"
import type { FormEvent } from "react"
import { useTranslation } from "react-i18next"

import type { ConsultationMessageItem, ConsultationSessionItem } from "@/types/consultation"
import { ChatSidebar } from "./chat-sidebar"
import { ChatHeader } from "./chat-header"
import { ChatMessageList } from "./chat-message-list"
import { ChatComposer } from "./chat-composer"
import { SessionContinuationBanner } from "./session-continuation-banner"

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
  onSubmit: (event: FormEvent<HTMLFormElement>, contentOverride?: string) => void
  onLoadMore?: () => void
  isOutsideSupportHours?: boolean
  onSessionRefreshed?: () => void
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
  onSessionRefreshed,
}: ChatWorkspaceProps) {
  const { t } = useTranslation("consultation")
  const isCompleted = selectedSession?.status === "COMPLETED"
  const readOnlyMode = isCompleted || isOutsideSupportHours
  const readOnlyReason = isCompleted 
    ? t("chat.workspace.completedReadOnly")
    : isOutsideSupportHours
      ? t("chat.workspace.outsideSupportHours")
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
              onSessionRefreshed={onSessionRefreshed}
            />

            <SessionContinuationBanner
              session={selectedSession}
              isDoctor={isDoctor}
              isMember={isMember}
              onSessionRefreshed={onSessionRefreshed || (() => {})}
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
            <h3 className="text-lg font-semibold tracking-tight text-foreground">{t("chat.workspace.noSessionTitle")}</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm text-center">
              {t("chat.workspace.noSessionDescription")}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

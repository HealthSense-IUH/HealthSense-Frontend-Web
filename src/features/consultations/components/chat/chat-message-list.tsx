import { MessageSquare, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ConsultationMessageItem } from "../../types"
import { useMessageGroups } from "../../hooks/use-message-groups"
import { useChatScroll } from "../../hooks/use-chat-scroll"
import { ChatMessageGroup } from "./chat-message-group"
import { ChatDateSeparator } from "./chat-date-separator"
import { cn } from "@/lib/utils"

interface ChatMessageListProps {
  messages: ConsultationMessageItem[]
  loadingMoreMessages: boolean
  hasMoreMessages: boolean
  currentUserId?: string | number
  isDoctor: boolean
  isMember: boolean
  onLoadMore: () => void
}

export function ChatMessageList({
  messages,
  loadingMoreMessages,
  hasMoreMessages,
  currentUserId,
  isDoctor,
  isMember,
  onLoadMore,
}: ChatMessageListProps) {
  const groups = useMessageGroups(messages)
  const { scrollRef, bottomRef, showScrollButton, handleScroll, scrollToBottom } = useChatScroll(
    messages,
    loadingMoreMessages
  )

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-background">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-6"
      >
        <div className="flex w-full flex-col pb-4">
          
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 opacity-60">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No messages yet.</p>
              <p className="mt-1 text-xs text-muted-foreground">Send a message to start the conversation.</p>
            </div>
          )}
          
          {hasMoreMessages && (
            <div className="flex justify-center pb-8 pt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLoadMore} 
                disabled={loadingMoreMessages} 
                className="rounded-full bg-background shadow-sm text-xs px-6 h-8"
              >
                {loadingMoreMessages ? "Loading history..." : "Load previous messages"}
              </Button>
            </div>
          )}

          {groups.map((group, index) => {
            const previousGroup = index > 0 ? groups[index - 1] : null
            const showDateSeparator = !previousGroup || previousGroup.date !== group.date

            return (
              <div key={group.id} className="flex flex-col w-full">
                {showDateSeparator && <ChatDateSeparator date={group.date} />}
                <ChatMessageGroup 
                  group={group} 
                  currentUserId={currentUserId} 
                  isDoctor={isDoctor}
                  isMember={isMember}
                />
              </div>
            )
          })}
          
          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollButton && messages.length > 0 && (
        <button
          onClick={() => scrollToBottom()}
          className={cn(
            "absolute bottom-4 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border shadow-md text-foreground transition-all hover:bg-muted z-10 animate-in fade-in slide-in-from-bottom-2 duration-200"
          )}
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

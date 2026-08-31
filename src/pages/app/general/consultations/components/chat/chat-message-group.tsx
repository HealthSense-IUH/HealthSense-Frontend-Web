import { cn } from "@/lib/utils"
import { ChatMessageBubble } from "./chat-message-bubble"
import { formatMessageTime } from "@/lib"
import type { MessageGroup } from "../../hooks/use-message-groups"

interface ChatMessageGroupProps {
  group: MessageGroup
  currentUserId?: string | number
  isDoctor: boolean
  isMember: boolean
}

export function ChatMessageGroup({ group, currentUserId, isDoctor, isMember }: ChatMessageGroupProps) {
  // Robust check based on the recent bugfix
  const mine = String(group.senderId) === String(currentUserId) || 
               (isDoctor && group.senderRole === "DOCTOR") || 
               (isMember && group.senderRole === "MEMBER")

  const isSystem = group.senderRole === "SYSTEM"

  if (isSystem) {
    return (
      <div className="flex w-full justify-center py-2 my-2">
        <div className="rounded-full bg-muted/80 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
          {group.messages.map(m => m.content).join(" ")}
        </div>
      </div>
    )
  }

  const lastMessage = group.messages[group.messages.length - 1]
  const timeString = formatMessageTime(lastMessage.createdAt)

  return (
    <div className={cn("flex w-full flex-col mb-4", mine ? "items-end" : "items-start")}>
      <div className="group relative flex w-full max-w-[85%] sm:max-w-[75%] flex-col gap-1">
        
        {/* Messages */}
        <div className={cn("flex flex-col gap-1 w-full", mine ? "items-end" : "items-start")}>
          {group.messages.map((msg, idx) => (
            <ChatMessageBubble 
              key={msg.id} 
              message={msg} 
              mine={mine} 
              isFirstInGroup={idx === 0}
              isLastInGroup={idx === group.messages.length - 1}
            />
          ))}
        </div>

        {/* Metadata (Time) */}
        <div className={cn(
          "flex items-center gap-1.5 px-1 py-1 text-[11px] font-medium text-muted-foreground transition-opacity opacity-70 group-hover:opacity-100",
          mine ? "flex-row-reverse" : "flex-row"
        )}>
          <span>{timeString}</span>
          {!mine && group.senderRole && (
            <>
              <span className="opacity-50">•</span>
              <span className="capitalize">{group.senderRole.toLowerCase()}</span>
            </>
          )}
        </div>
        
      </div>
    </div>
  )
}

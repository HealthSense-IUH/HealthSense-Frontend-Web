import { cn } from "@/lib/utils"
import type { ConsultationMessageItem } from "@/types/consultation"

interface ChatMessageBubbleProps {
  message: ConsultationMessageItem
  mine: boolean
  isFirstInGroup: boolean
  isLastInGroup: boolean
}

export function ChatMessageBubble({ message, mine, isFirstInGroup, isLastInGroup }: ChatMessageBubbleProps) {
  const roundedClass = mine
    ? cn(
        "rounded-l-2xl",
        isFirstInGroup ? "rounded-tr-2xl" : "rounded-tr-md",
        isLastInGroup ? "rounded-br-2xl" : "rounded-br-md"
      )
    : cn(
        "rounded-r-2xl",
        isFirstInGroup ? "rounded-tl-2xl" : "rounded-tl-md",
        isLastInGroup ? "rounded-bl-2xl" : "rounded-bl-md"
      )

  const colorClass = mine
    ? "bg-white text-slate-800 border border-slate-100 shadow-sm"
    : "bg-[#84D396] text-white shadow-sm"

  return (
    <div className={cn("relative px-4 py-2 text-[15px] leading-relaxed max-w-full break-words", roundedClass, colorClass)}>
      {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
      
      {message.attachmentUrl && (
        <a 
          className={cn(
            "mt-2 flex items-center gap-2 rounded-lg p-2 text-sm transition-colors",
            mine 
              ? "bg-black/10 hover:bg-black/20 text-primary-foreground" 
              : "bg-background hover:bg-accent text-foreground border border-border"
          )} 
          href={message.attachmentUrl} 
          target="_blank" 
          rel="noreferrer"
        >
          <div className="truncate font-medium">{message.attachmentName ?? "View Attachment"}</div>
        </a>
      )}
    </div>
  )
}

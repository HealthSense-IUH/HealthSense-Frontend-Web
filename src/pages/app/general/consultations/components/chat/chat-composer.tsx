import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState, memo } from "react"
import { Send, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ChatComposerProps {
  messageDraft: string
  attachmentUrl: string
  canSend: boolean
  loading: boolean
  readOnlyMode?: boolean
  readOnlyReason?: string
  onMessageChange: (value: string) => void
  onSubmit: (e?: any, contentOverride?: string) => void
}

export const ChatComposer = memo(function ChatComposer({
  messageDraft,
  attachmentUrl,
  canSend,
  loading,
  readOnlyMode,
  readOnlyReason,
  onMessageChange,
  onSubmit,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [localDraft, setLocalDraft] = useState(messageDraft)

  // Synchronize when parent resets messageDraft (e.g. after message sent or session switched)
  useEffect(() => {
    setLocalDraft(messageDraft)
  }, [messageDraft])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`
  }, [localDraft])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (canSend && !loading && (localDraft.trim() || attachmentUrl.trim())) {
        const textToSend = localDraft
        setLocalDraft("")
        onMessageChange("")
        onSubmit(e as any, textToSend)
      }
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canSend || loading || (!localDraft.trim() && !attachmentUrl.trim())) return
    const textToSend = localDraft
    setLocalDraft("")
    onMessageChange("")
    onSubmit(e, textToSend)
  }

  const hasContent = localDraft.trim() || attachmentUrl.trim()

  if (readOnlyMode) {
    return (
      <div className="flex w-full items-center justify-center border-t border-border bg-muted/30 p-6">
        <p className="text-sm font-medium text-muted-foreground text-center">
          {readOnlyReason || "Bạn không thể gửi tin nhắn trong phiên này."}
        </p>
      </div>
    )
  }

  if (!canSend) {
    return (
      <div className="flex w-full items-center justify-center border-t border-border bg-muted/30 p-6">
        <p className="text-sm font-medium text-muted-foreground text-center">
          Phiên tư vấn chưa mở hoặc không còn hoạt động.
        </p>
      </div>
    )
  }

  return (
    <div className="border-t border-border bg-background p-4">
      <form 
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-2 bg-background p-1 transition-all duration-200"
      >
        <div className="flex items-center gap-2">
          {/* Decorative Paperclip Button */}
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            className="flex-shrink-0 h-10 w-10 text-muted-foreground hover:bg-muted rounded-full"
            aria-label="Đính kèm tệp"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <div className="flex flex-1 items-center bg-background border border-input focus-within:border-primary focus-within:ring-1 focus-within:ring-primary rounded-full px-4 py-1">
            <textarea
              ref={textareaRef}
              className="max-h-[120px] min-h-[24px] w-full resize-none bg-transparent py-2.5 text-[14px] text-foreground outline-none placeholder:text-muted-foreground"
              placeholder="Nhập tin nhắn..."
              value={localDraft}
              onChange={(e) => setLocalDraft(e.target.value)}
              disabled={loading}
              onKeyDown={handleKeyDown}
              rows={1}
            />
          </div>
          
          <Button 
            type="submit" 
            size="icon" 
            variant="ghost"
            className={cn(
              "h-10 w-10 rounded-full transition-all flex-shrink-0",
              hasContent 
                ? "text-primary hover:bg-primary/10" 
                : "text-muted-foreground hover:bg-muted"
            )}
            disabled={loading || !hasContent} 
            aria-label="Gửi tin nhắn"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  )
})

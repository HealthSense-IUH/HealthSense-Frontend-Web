import { formatChatDate } from "@/lib"

export function ChatDateSeparator({ date }: { date: string }) {
  const formattedDate = formatChatDate(date)
  if (!formattedDate) return null
  
  return (
    <div className="flex w-full items-center justify-center py-4 my-2">
      <div className="flex items-center gap-4 w-full max-w-[80%] mx-auto">
        <div className="h-px flex-1 bg-border/40" />
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{formattedDate}</span>
        <div className="h-px flex-1 bg-border/40" />
      </div>
    </div>
  )
}

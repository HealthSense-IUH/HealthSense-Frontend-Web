import { Search, Plus, User } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { ConsultationSessionItem } from "../../types"
import { statusBadge } from "../shared"

interface ChatSidebarProps {
  sessions: ConsultationSessionItem[]
  selectedSession: ConsultationSessionItem | null
  isDoctor?: boolean
  isMember?: boolean
  onSelectSession: (session: ConsultationSessionItem) => void
}

export function ChatSidebar({ sessions, selectedSession, isDoctor, isMember, onSelectSession }: ChatSidebarProps) {
  return (
    <div className="flex w-full md:w-[320px] lg:w-[360px] flex-shrink-0 flex-col border-r border-border bg-background relative h-full">
      <div className="border-b border-border/50 px-5 py-4 bg-background">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full bg-muted/40 hover:bg-muted/60 focus:bg-muted focus:ring-1 focus:ring-primary/30 transition-colors rounded-full pl-10 pr-4 py-2 text-[13px] outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-0">
          {sessions.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No sessions found.
            </div>
          )}
          {sessions.map((session) => {
            const isSelected = String(selectedSession?.id) === String(session.id)
            return (
              <button
                key={session.id}
                type="button"
                onClick={() => onSelectSession(session)}
                className={cn(
                  "flex w-full flex-col px-5 py-4 transition-all duration-200 border-l-[3px]",
                  isSelected
                    ? "bg-[#EBF7EE] border-[#84D396]"
                    : "bg-transparent border-transparent hover:bg-muted/30"
                )}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted/50 flex items-center justify-center">
                    <User className={cn("h-5 w-5", isSelected ? "text-[#84D396]" : "text-muted-foreground")} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "truncate font-medium text-[14px]",
                        isSelected ? "text-foreground" : "text-foreground/80"
                      )}>
                        {isDoctor 
                          ? `Member #${session.memberId}` 
                          : isMember 
                            ? `Doctor #${session.doctorId}`
                            : `Dr #${session.doctorId} - Mem #${session.memberId}`}
                      </span>
                      <span className="flex-shrink-0 scale-75 origin-right">{statusBadge(session.status)}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="truncate text-[12px] text-muted-foreground">
                        {session.lastMessagePreview || "No messages yet"}
                      </span>
                      <span className="shrink-0 text-[11px] font-medium text-muted-foreground/70">
                        {session.lastMessageAt ? new Date(session.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </ScrollArea>
      <div className="absolute bottom-6 right-6">
        <button className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center">
          <Plus className="h-7 w-7" />
        </button>
      </div>
    </div>
  )
}

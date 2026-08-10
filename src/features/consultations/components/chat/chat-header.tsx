import { User, Phone, Video, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ConsultationSessionItem } from "../../types"
import { statusBadge } from "../shared"
import { MemberFinalSummaryDialog } from "../member-final-summary-dialog"
import { useState } from "react"
import { FileText } from "lucide-react"

interface ChatHeaderProps {
  session: ConsultationSessionItem
  isDoctor?: boolean
  isMember?: boolean
}

export function ChatHeader({ session, isDoctor, isMember }: ChatHeaderProps) {
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)

  return (
    <div className="flex items-center justify-between border-b border-border bg-background/95 px-6 py-4 shadow-sm z-10 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground border border-border/50">
          <User className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold text-foreground text-sm tracking-tight">
            {isDoctor 
              ? `Member #${session.memberId}` 
              : isMember 
                ? `Doctor #${session.doctorId}`
                : `Doctor #${session.doctorId} - Member #${session.memberId}`}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-muted-foreground text-[11px]">
              Last seen just now
            </span>
            <span className="text-muted-foreground text-[10px]">•</span>
            {statusBadge(session.status)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isMember && session.status !== "SCHEDULED" && (
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden sm:flex"
            onClick={() => setIsSummaryOpen(true)}
          >
            <FileText className="mr-2 h-4 w-4" />
            Tổng kết từ bác sĩ
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
          <Video className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      <MemberFinalSummaryDialog
        sessionId={session.id}
        open={isSummaryOpen}
        onOpenChange={setIsSummaryOpen}
      />
    </div>
  )
}

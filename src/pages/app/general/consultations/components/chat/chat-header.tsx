import { useState } from "react"
import { User, Phone, Video, MoreHorizontal, FileText, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ConsultationSessionItem } from "@/types/consultation"
import { statusBadge } from "../shared"
import { MemberFinalSummaryDialog } from "../member-final-summary-dialog"
import { DoctorSessionDetailDialog } from "../doctor-session-detail-dialog"
import { RenewalDialog } from "../renewal-dialog"

interface ChatHeaderProps {
  session: ConsultationSessionItem
  isDoctor?: boolean
  isMember?: boolean
  onSessionRefreshed?: () => void
}

export function ChatHeader({ session, isDoctor, isMember, onSessionRefreshed }: ChatHeaderProps) {
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [isDoctorDetailOpen, setIsDoctorDetailOpen] = useState(false)
  const [isRenewalOpen, setIsRenewalOpen] = useState(false)

  const memberName =
    session.memberDisplayName ||
    (session as any).memberName ||
    (session as any).member?.displayName ||
    (session as any).member_display_name ||
    `Hội viên #${session.memberId}`

  const doctorName =
    session.doctorDisplayName ||
    (session as any).doctorName ||
    (session as any).doctor?.displayName ||
    (session as any).doctor_display_name ||
    `Bác sĩ #${session.doctorId}`

  const headerTitle = isDoctor
    ? memberName
    : isMember
      ? doctorName
      : `${doctorName} - ${memberName}`

  return (
    <div className="flex items-center justify-between border-b border-border bg-background/95 px-6 py-4 shadow-sm z-10 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground border border-border/50">
          <User className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold text-foreground text-sm tracking-tight">
            {headerTitle}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-muted-foreground text-[11px]">
              Vừa mới truy cập
            </span>
            <span className="text-muted-foreground text-[10px]">•</span>
            {statusBadge(session.status)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isMember && session.status === "ACTIVE" && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 text-primary border-primary/30 hover:bg-primary/5"
            onClick={() => setIsRenewalOpen(true)}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Gia hạn chăm sóc</span>
          </Button>
        )}
        {isDoctor && (
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden sm:flex items-center gap-1.5"
            onClick={() => setIsDoctorDetailOpen(true)}
          >
            <FileText className="h-4 w-4" />
            <span>Hồ sơ & Tổng kết</span>
          </Button>
        )}
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

      {isDoctor && (
        <DoctorSessionDetailDialog
          sessionId={session.id}
          open={isDoctorDetailOpen}
          onOpenChange={setIsDoctorDetailOpen}
        />
      )}

      <MemberFinalSummaryDialog
        sessionId={session.id}
        open={isSummaryOpen}
        onOpenChange={setIsSummaryOpen}
      />

      <RenewalDialog
        session={session}
        open={isRenewalOpen}
        onOpenChange={setIsRenewalOpen}
        onSessionRefreshed={onSessionRefreshed}
      />
    </div>
  )
}

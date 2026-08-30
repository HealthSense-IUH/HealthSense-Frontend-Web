import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  User,
  Cpu,
  FileCode,
  ArrowRight,
} from "lucide-react"
import type { BusinessAuditEventResponse } from "../types"

interface AuditEventDetailDrawerProps {
  event: BusinessAuditEventResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuditEventDetailDrawer({
  event,
  open,
  onOpenChange,
}: AuditEventDetailDrawerProps) {
  if (!event) return null

  let metadataString = ""
  if (event.metadataJson) {
    try {
      const parsed = JSON.parse(event.metadataJson)
      metadataString = JSON.stringify(parsed, null, 2)
    } catch {
      metadataString = event.metadataJson
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-slate-400 font-bold">Event #{event.id}</span>
                <Badge variant="outline" className="font-bold uppercase text-[10px] bg-slate-50">
                  {event.domainType}
                </Badge>
              </div>
              <DialogTitle className="text-base font-black text-slate-900 font-mono">
                {event.eventType}
              </DialogTitle>
            </div>
            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black bg-blue-100 text-blue-800 uppercase tracking-wider">
              {event.actorType}
            </span>
          </div>
        </DialogHeader>

        <ScrollArea className="p-6 space-y-4 text-xs flex-1">
          <div className="space-y-4">
            {/* Domain info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Domain ID</span>
                <span className="font-mono font-bold text-slate-900 text-sm">#{event.domainId}</span>
              </div>
              <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Thời điểm xảy ra</span>
                <span className="font-mono font-bold text-slate-700 text-xs">
                  {new Date(event.occurredAt).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>

            {/* Actor context */}
            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  {event.actorType === "USER" ? <User className="w-3.5 h-3.5 text-blue-600" /> : <Cpu className="w-3.5 h-3.5 text-purple-600" />}
                  <span>Tác nhân thực hiện:</span>
                </span>
                <span className="font-bold text-slate-800">
                  {event.actorType === "USER" ? `Tài khoản #${event.actorId || "N/A"} (${event.actorRole || "USER"})` : "Hệ thống tự động (SYSTEM)"}
                </span>
              </div>
              {event.reason && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Lý do nghiệp vụ:</span>
                  <p className="text-slate-700 font-medium">{event.reason}</p>
                </div>
              )}
            </div>

            {/* State Transition */}
            {(event.previousState || event.newState) && (
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Chuyển đổi trạng thái</span>
                <div className="flex items-center gap-3 font-mono font-bold text-xs">
                  <Badge variant="outline" className="bg-white">
                    {event.previousState || "INITIAL"}
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <Badge className="bg-blue-600 text-white">
                    {event.newState || "FINAL"}
                  </Badge>
                </div>
              </div>
            )}

            {/* Safe Metadata JSON View */}
            {metadataString && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-1.5 text-slate-600 font-bold text-xs">
                  <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Metadata an toàn (Filtered Safe Context)</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed">
                  <pre>{metadataString}</pre>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

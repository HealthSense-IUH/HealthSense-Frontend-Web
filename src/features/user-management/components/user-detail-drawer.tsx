import { ShieldCheck, Mail, Phone, Calendar, MapPin, Edit3, X, Clock, UserCheck } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UserStatusBadge } from "./user-status-badge"
import type { UserItem } from "../types"

interface UserDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  user: UserItem | null
  onEdit: (user: UserItem) => void
}

export function UserDetailDrawer({ isOpen, onClose, user, onEdit }: UserDetailDrawerProps) {
  if (!user && !isOpen) return null

  const formatDate = (val?: string | number) => {
    if (!val) return "Not recorded"
    try {
      const d = typeof val === "number" ? new Date(val) : new Date(val)
      if (isNaN(d.getTime())) return String(val)
      return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
    } catch {
      return String(val)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-white rounded-3xl shadow-xl border border-slate-200">
        <DialogHeader className="p-6 bg-slate-50/90 border-b border-slate-100 flex flex-row items-center justify-between text-left space-y-0">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-blue-600 text-lg font-black shrink-0">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 font-bold">#{user?.id || "N/A"}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 text-blue-800 uppercase tracking-wider">
                  {user?.role || "MEMBER"}
                </span>
              </div>
              <DialogTitle className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                {user?.displayName || "Anonymous Account"}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Status Section */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5 text-slate-600 font-extrabold">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <span>Operating State</span>
            </div>
            <UserStatusBadge status={user?.status} />
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-black text-slate-400 uppercase tracking-wider text-[11px]">Contact & Communications</h4>
            <div className="rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden font-medium">
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>Email Address</span>
                </span>
                <span className="font-mono font-bold text-slate-800 select-all">{user?.email || "—"}</span>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>Phone Number</span>
                </span>
                <span className="font-mono font-bold text-slate-800">{user?.phone || "No phone linked"}</span>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Physical Address</span>
                </span>
                <span className="text-slate-800 max-w-[220px] text-right truncate">{user?.address || "No address configured"}</span>
              </div>
            </div>
          </div>

          {/* Clinical Demographics */}
          <div className="space-y-3">
            <h4 className="font-black text-slate-400 uppercase tracking-wider text-[11px]">Demographic Profile</h4>
            <div className="grid grid-cols-2 gap-3 font-medium">
              <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/40">
                <span className="text-slate-400 block text-[11px] flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Date of Birth</span>
                </span>
                <span className="font-extrabold font-mono text-slate-800 text-sm">{user?.dateOfBirth || "Not configured"}</span>
              </div>
              <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/40">
                <span className="text-slate-400 block text-[11px] flex items-center gap-1.5 mb-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Gender</span>
                </span>
                <span className="font-extrabold text-slate-800 text-sm">{user?.gender || "Unspecified"}</span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="p-3.5 rounded-2xl bg-slate-50 text-slate-500 text-[11px] font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Registered On:</span>
            </span>
            <strong className="text-slate-700">{formatDate(user?.createdAt)}</strong>
          </div>
        </div>

        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-9 rounded-xl border-slate-200 font-bold text-slate-600 text-xs px-4 hover:bg-white cursor-pointer"
          >
            <X className="w-4 h-4 mr-1.5" />
            <span>Close Window</span>
          </Button>
          {user && (
            <Button
              onClick={() => {
                onClose()
                onEdit(user)
              }}
              className="h-9 rounded-xl bg-blue-600 hover:bg-blue-700 font-extrabold text-white text-xs px-4 shadow-sm shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Account</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

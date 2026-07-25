import { Phone, Calendar, MapPin, User, Clock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { UserResponse, ProfileAccountStatus } from "../types"

interface ProfileSummaryCardProps {
  user: UserResponse
}

function StatusBadge({ status }: { status?: ProfileAccountStatus }) {
  const getBadgeStyle = () => {
    switch (status) {
      case "ACTIVE":
        return { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Active" }
      case "PENDING_VERIFY":
        return { bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", label: "Pending Verify" }
      case "INACTIVE":
        return { bg: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400", label: "Inactive" }
      case "LOCKED":
        return { bg: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500", label: "Locked" }
      case "BANNED":
        return { bg: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-600", label: "Banned" }
      default:
        return { bg: "bg-slate-100 text-slate-700 border-slate-200", dot: "bg-slate-500", label: status || "Active" }
    }
  }

  const style = getBadgeStyle()

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${style.bg}`}>
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${style.dot}`} />
      <span>{style.label}</span>
    </span>
  )
}

export function ProfileSummaryCard({ user }: ProfileSummaryCardProps) {
  // Defensive display name fallback
  const displayName = user.displayName || user.fullName || user.email || "Current User"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const formatDate = (val?: string | number) => {
    if (!val) return "Not available"
    try {
      const d = new Date(val)
      if (isNaN(d.getTime())) return String(val)
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    } catch {
      return String(val)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col h-full justify-between gap-6">
      <div className="space-y-6">
        {/* Header with Avatar & Status */}
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
          <Avatar className="h-16 w-16 border-2 border-slate-100 shadow-sm shrink-0">
            <AvatarImage src="https://i.pravatar.cc/150?img=47" alt={displayName} />
            <AvatarFallback className="bg-blue-600 text-white font-black text-lg">
              {initials || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200/60 uppercase tracking-wider">
                {user.role || "MEMBER"}
              </span>
              <StatusBadge status={user.status} />
            </div>
            <h3 className="text-lg font-black text-slate-900 truncate tracking-tight">
              {displayName}
            </h3>
            <p className="text-xs text-slate-500 truncate font-mono mt-0.5">
              {user.email || "No email linked"}
            </p>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-3.5 text-xs font-medium">
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Account Summary
          </h4>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-slate-500 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>Phone</span>
              </span>
              <span className="font-mono font-bold text-slate-800">
                {user.phone || "Not provided"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-slate-500 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Date of Birth</span>
              </span>
              <span className="font-mono font-bold text-slate-800">
                {user.dateOfBirth || "Not provided"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-slate-500 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span>Gender</span>
              </span>
              <span className="font-bold text-slate-800">
                {user.gender || "Not specified"}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-slate-500 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>Address</span>
              </span>
              <p className="font-semibold text-slate-800 pl-6 leading-relaxed">
                {user.address || "No address configured"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timestamps footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Registered:</span>
        </span>
        <strong className="text-slate-700">{formatDate(user.createdAt)}</strong>
      </div>
    </div>
  )
}

import { useState, useRef, type ChangeEvent } from "react"
import { Camera, Loader2, ShieldCheck, Mail, CalendarDays, RefreshCw } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/features/auth/auth-store"
import { profileApi } from "../services/profile-api"
import type { UserResponse, ProfileAccountStatus } from "../types"

interface ProfileSummaryCardProps {
  user: UserResponse
  onAvatarUpdate?: (newAvatarUrl: string) => void
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

export function ProfileSummaryCard({ user, onAvatarUpdate }: ProfileSummaryCardProps) {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const userSession = useAuthStore((state) => state.userSession)
  const setUserSession = useAuthStore((state) => state.setUserSession)

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

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileName = file.name.trim()
    const lowerName = fileName.toLowerCase()
    let contentType = file.type && file.type.trim() ? file.type.trim().toLowerCase() : ""

    const validExtensions = [
      ".jpg", ".jpeg", ".jfif", ".pjpeg", ".png", ".webp", ".gif", 
      ".bmp", ".svg", ".heic", ".heif", ".avif", ".tiff", ".tif", ".ico"
    ]
    const hasValidExt = validExtensions.some((ext) => lowerName.endsWith(ext))
    const isImageType = contentType.startsWith("image/")

    if (!isImageType && !hasValidExt) {
      toast({
        variant: "destructive",
        title: "Invalid File Format",
        description: "Please select a valid image file (.jpg, .png, .webp, .gif, .heic...).",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Avatar image size must not exceed 5MB.",
      })
      return
    }

    // Resolve accurate content type if browser returns empty or octet-stream
    if (!contentType.startsWith("image/") || contentType === "application/octet-stream") {
      if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg") || lowerName.endsWith(".jfif") || lowerName.endsWith(".pjpeg")) contentType = "image/jpeg"
      else if (lowerName.endsWith(".png")) contentType = "image/png"
      else if (lowerName.endsWith(".webp")) contentType = "image/webp"
      else if (lowerName.endsWith(".gif")) contentType = "image/gif"
      else if (lowerName.endsWith(".bmp")) contentType = "image/bmp"
      else if (lowerName.endsWith(".svg")) contentType = "image/svg+xml"
      else if (lowerName.endsWith(".heic") || lowerName.endsWith(".heif")) contentType = "image/heic"
      else if (lowerName.endsWith(".avif")) contentType = "image/avif"
      else if (lowerName.endsWith(".tiff") || lowerName.endsWith(".tif")) contentType = "image/tiff"
      else if (lowerName.endsWith(".ico")) contentType = "image/x-icon"
      else contentType = "image/jpeg"
    }

    setUploading(true)
    try {
      // Step 1: Request Presigned URL from Backend
      const presignRes = await profileApi.generateAvatarPresignedUrl({
        fileName: fileName,
        contentType: contentType,
      })
      const { uploadUrl, publicUrl } = presignRes.data || {}
      if (!uploadUrl || !publicUrl) {
        throw new Error("Failed to obtain presigned upload link from server.")
      }

      // Step 2: Upload file directly to S3 with resolved contentType matching presigned signature
      await profileApi.uploadFileToS3(uploadUrl, file, contentType)

      // Step 3: Update Profile in Backend (triggers auto deletion of old avatar on S3)
      await profileApi.updateMe({ avatarUrl: publicUrl })

      // Step 4: Sync local & global auth store state
      onAvatarUpdate?.(publicUrl)
      if (userSession && setUserSession) {
        setUserSession({
          ...userSession,
          avatarUrl: publicUrl,
        })
      }

      toast({
        title: "Avatar Updated Successfully!",
        description: "Your new profile photo is saved and old avatar was removed from storage.",
      })
    } catch (err: unknown) {
      const anyErr = err as { message?: string; response?: { data?: { message?: string } } }
      console.error("Failed to upload avatar:", anyErr)
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: anyErr?.response?.data?.message || anyErr?.message || "Could not update avatar photo.",
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col h-full justify-between gap-6">
      <div className="space-y-6">
        {/* Header with Avatar & Status */}
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
          <div className="relative group shrink-0">
            <Avatar className="h-16 w-16 border-2 border-slate-100 shadow-sm transition-opacity group-hover:opacity-90">
              <AvatarImage src={user.avatarUrl || "https://i.pravatar.cc/150?img=47"} alt={displayName} className="object-cover" />
              <AvatarFallback className="bg-blue-600 text-white font-black text-lg">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>

            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:opacity-100 disabled:cursor-wait"
              title="Change Avatar Photo"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.svg,.heic,.heif,.avif,.tiff,.ico"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>

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

        {/* System & Security Meta Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Security & Meta</span>
            </h4>
            <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              Verified
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100/80 transition-colors hover:bg-slate-50">
              <span className="text-slate-500 flex items-center gap-2 font-medium">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Primary Email</span>
              </span>
              <span className="font-mono font-bold text-slate-800 truncate max-w-[170px]" title={user.email}>
                {user.email || "No email linked"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100/80 transition-colors hover:bg-slate-50">
              <span className="text-slate-500 flex items-center gap-2 font-medium">
                <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Member Since</span>
              </span>
              <span className="font-semibold text-slate-800 font-mono">
                {formatDate(user.createdAt)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100/80 transition-colors hover:bg-slate-50">
              <span className="text-slate-500 flex items-center gap-2 font-medium">
                <RefreshCw className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Last Updated</span>
              </span>
              <span className="font-semibold text-slate-700 font-mono">
                {formatDate(user.updatedAt || user.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

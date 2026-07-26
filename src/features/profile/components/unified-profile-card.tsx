import { useState, useRef, type ChangeEvent, type FormEvent } from "react"
import { 
  Camera, 
  Loader2, 
  ShieldCheck, 
  Mail, 
  CalendarDays, 
  RefreshCw, 
  Phone, 
  Calendar, 
  MapPin, 
  User as UserIcon, 
  Edit2, 
  Save, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2 
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/features/auth/auth-store"
import { profileApi } from "../services/profile-api"
import type { UserResponse, ProfileUpdateRequest, ProfileAccountStatus } from "../types"

interface UnifiedProfileCardProps {
  user: UserResponse
  onSave: (payload: ProfileUpdateRequest) => Promise<void>
  onAvatarUpdate?: (newAvatarUrl: string) => void
  loading?: boolean
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
    <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border ${style.bg}`}>
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${style.dot}`} />
      <span>{style.label}</span>
    </span>
  )
}

function UnifiedProfileCardContent({ user, onSave, onAvatarUpdate, loading = false }: UnifiedProfileCardProps) {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Auth Store bindings for real-time avatar sync across Topbar & Sidebar
  const userSession = useAuthStore((state) => state.userSession)
  const setUserSession = useAuthStore((state) => state.setUserSession)

  // Form edit state
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user.displayName || user.fullName || "")
  const [phone, setPhone] = useState(user.phone || "")
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth || "")
  const [gender, setGender] = useState(user.gender || "MALE")
  const [address, setAddress] = useState(user.address || "")

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Defensive display name fallback
  const currentDisplayName = user.displayName || user.fullName || user.email || "Current User"
  const initials = currentDisplayName
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

  // Handle Avatar Upload via S3 Presigned URL
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
      const presignRes = await profileApi.generateAvatarPresignedUrl({
        fileName: fileName,
        contentType: contentType,
      })
      const { uploadUrl, publicUrl } = presignRes.data || {}
      if (!uploadUrl || !publicUrl) {
        throw new Error("Failed to obtain presigned upload link from server.")
      }

      await profileApi.uploadFileToS3(uploadUrl, file, contentType)
      await profileApi.updateMe({ avatarUrl: publicUrl })

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

  // Handle Form Validation & Submission
  const validate = (): boolean => {
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!displayName.trim()) {
      setErrorMsg("Display name is required.")
      return false
    }
    if (displayName.length > 120) {
      setErrorMsg("Display name cannot exceed 120 characters.")
      return false
    }
    if (phone && phone.length > 30) {
      setErrorMsg("Phone number cannot exceed 30 characters.")
      return false
    }
    if (dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      setErrorMsg("Date of birth must be formatted as YYYY-MM-DD.")
      return false
    }
    if (gender && gender.length > 20) {
      setErrorMsg("Gender selection cannot exceed 20 characters.")
      return false
    }
    if (address && address.length > 500) {
      setErrorMsg("Address cannot exceed 500 characters.")
      return false
    }
    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      const payload: ProfileUpdateRequest = {
        displayName: displayName.trim(),
        phone: phone.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        address: address.trim() || undefined,
      }
      await onSave(payload)
      setSuccessMsg("Profile updated successfully.")
      setIsEditing(false)
      toast({
        title: "Profile Updated",
        description: "Your personal details have been saved successfully.",
      })
    } catch (err: unknown) {
      const anyErr = err as { message?: string; response?: { data?: { message?: string } } }
      setErrorMsg(anyErr?.response?.data?.message || anyErr?.message || "Failed to update profile.")
    }
  }

  const handleReset = () => {
    setDisplayName(user.displayName || user.fullName || "")
    setPhone(user.phone || "")
    setDateOfBirth(user.dateOfBirth || "")
    setGender(user.gender || "MALE")
    setAddress(user.address || "")
    setErrorMsg(null)
    setSuccessMsg(null)
    setIsEditing(false)
  }

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      {/* Top Banner & Header Section */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-slate-50/80 p-8 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Interactive Avatar */}
            <div className="relative group shrink-0">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white shadow-md transition-transform group-hover:scale-[1.02]">
                <AvatarImage src={user.avatarUrl || "https://i.pravatar.cc/150?img=47"} alt={currentDisplayName} className="object-cover" />
                <AvatarFallback className="bg-blue-600 text-white font-black text-2xl">
                  {initials || "U"}
                </AvatarFallback>
              </Avatar>

              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:opacity-100 disabled:cursor-wait"
                title="Change Avatar Photo"
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-white mb-0.5" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Change</span>
                  </>
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

            {/* Name, Role & Email */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-blue-600 text-white uppercase tracking-wider shadow-xs shadow-blue-500/20">
                  {user.role || "MEMBER"}
                </span>
                <StatusBadge status={user.status} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 truncate tracking-tight">
                {currentDisplayName}
              </h2>
              <p className="text-sm font-mono font-medium text-slate-500 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{user.email || "No email linked"}</span>
              </p>
            </div>
          </div>

          {/* Action Button: Edit Profile or Edit Mode Indicator */}
          <div className="w-full sm:w-auto flex justify-end">
            {!isEditing ? (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 shadow-sm flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </Button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                <Edit2 className="w-3.5 h-3.5 animate-pulse" />
                <span>Editing Mode</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body Content: Switch between Read-Only View and Editable Form */}
      <div className="p-8">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && !isEditing && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {!isEditing ? (
          /* READ-ONLY VIEW MODE: Clean, elegant information presentation without disabled inputs */
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span>Personal & Contact Information</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100/80 flex flex-col gap-1">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Phone Number</span>
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-800 pl-5">
                    {user.phone || <span className="text-slate-400 font-sans font-normal italic">Not provided</span>}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100/80 flex flex-col gap-1">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Date of Birth</span>
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-800 pl-5">
                    {user.dateOfBirth || <span className="text-slate-400 font-sans font-normal italic">Not provided</span>}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100/80 flex flex-col gap-1">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Gender</span>
                  </span>
                  <span className="text-sm font-bold text-slate-800 pl-5 capitalize">
                    {user.gender ? user.gender.toLowerCase() : <span className="text-slate-400 font-normal italic">Not specified</span>}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100/80 flex flex-col gap-1">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Residential / Practice Address</span>
                  </span>
                  <span className="text-sm font-semibold text-slate-800 pl-5 leading-relaxed">
                    {user.address || <span className="text-slate-400 font-normal italic">No address configured</span>}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <span>System Security & Timestamps</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 text-xs">
                  <span className="font-bold text-slate-500 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-slate-400" />
                    <span>Member Since</span>
                  </span>
                  <span className="font-mono font-bold text-slate-800">{formatDate(user.createdAt)}</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 text-xs">
                  <span className="font-bold text-slate-500 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-slate-400" />
                    <span>Last Profile Update</span>
                  </span>
                  <span className="font-mono font-bold text-slate-800">{formatDate(user.updatedAt || user.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* EDITABLE FORM MODE: Clean inputs with Cancel and Save Actions */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">
                Update Profile Information
              </h3>
              <span className="text-xs text-slate-500">
                Fields marked with <span className="text-red-500 font-bold">*</span> are required.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="display-name-input" className="text-xs font-bold text-slate-700">
                  Display Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="display-name-input"
                  disabled={loading}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your full display name"
                  maxLength={120}
                  required
                  className="h-11 rounded-xl border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone-input" className="text-xs font-bold text-slate-700">
                  Phone Number
                </Label>
                <Input
                  id="phone-input"
                  disabled={loading}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+84 909 123 456"
                  maxLength={30}
                  className="h-11 rounded-xl border-slate-200 text-xs font-mono font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="dob-input" className="text-xs font-bold text-slate-700">
                  Date of Birth
                </Label>
                <Input
                  id="dob-input"
                  type="date"
                  disabled={loading}
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 text-xs font-mono font-semibold cursor-pointer focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender-select" className="text-xs font-bold text-slate-700">
                  Gender
                </Label>
                <select
                  id="gender-select"
                  aria-label="Gender selection"
                  disabled={loading}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address-input" className="text-xs font-bold text-slate-700">
                Residential / Practice Address
              </Label>
              <Input
                id="address-input"
                disabled={loading}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your street address, city, country"
                maxLength={500}
                className="h-11 rounded-xl border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={handleReset}
                className="h-11 rounded-xl border-slate-200 font-bold text-slate-600 text-xs px-5 hover:bg-slate-50 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                <span>Cancel</span>
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 font-extrabold text-white text-xs px-6 shadow-md shadow-blue-500/25 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Changes</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export function UnifiedProfileCard({ user, onSave, onAvatarUpdate, loading = false }: UnifiedProfileCardProps) {
  // Key pattern resets form state cleanly when user data refreshes
  const formKey = `${user.id || "u"}-${user.updatedAt || user.displayName || "init"}`
  return <UnifiedProfileCardContent key={formKey} user={user} onSave={onSave} onAvatarUpdate={onAvatarUpdate} loading={loading} />
}

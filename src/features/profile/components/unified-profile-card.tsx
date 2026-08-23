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
  CheckCircle2,
  CreditCard,
  Building2,
  HeartHandshake,
  RotateCw,
  Eye,
  EyeOff,
  UploadCloud,
  Trash2,
  Maximize2,
  X,
  FileCheck
} from "lucide-react"
import { AvatarPlaceholder } from "@/components/ui/avatar"
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

function maskSensitiveText(val?: string): string {
  if (!val) return "Not provided"
  if (val.length <= 4) return "****"
  const visibleLength = Math.min(4, Math.floor(val.length / 3))
  const prefix = val.substring(0, visibleLength)
  const suffix = val.substring(val.length - visibleLength)
  return `${prefix}${"*".repeat(Math.max(4, val.length - visibleLength * 2))}${suffix}`
}

function UnifiedProfileCardContent({ user, onSave, onAvatarUpdate, loading = false }: UnifiedProfileCardProps) {
  const { toast } = useToast()
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  
  // CCCD input refs
  const frontCccdInputRef = useRef<HTMLInputElement>(null)
  const backCccdInputRef = useRef<HTMLInputElement>(null)
  const [uploadingFrontCccd, setUploadingFrontCccd] = useState(false)
  const [uploadingBackCccd, setUploadingBackCccd] = useState(false)

  // Lightbox preview modal state
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string; rotate: number } | null>(null)

  // Sensitive data toggle visibility in read-only mode
  const [showSensitive, setShowSensitive] = useState(false)
  
  // Auth Store bindings for real-time avatar sync
  const userSession = useAuthStore((state) => state.userSession)
  const setUserSession = useAuthStore((state) => state.setUserSession)

  // Form edit state
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user.displayName || user.fullName || "")
  const [phone, setPhone] = useState(user.phone || "")
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth || "")
  const [gender, setGender] = useState(user.gender || "MALE")
  const [address, setAddress] = useState(user.address || "")

  // Sensitive & CCCD State
  const [citizenId, setCitizenId] = useState(user.citizenId || "")
  const [bankAccount, setBankAccount] = useState(user.bankAccount || "")
  const [healthInsuranceNumber, setHealthInsuranceNumber] = useState(user.healthInsuranceNumber || "")
  const [identityCardFrontUrl, setIdentityCardFrontUrl] = useState(user.identityCardFrontUrl || "")
  const [identityCardBackUrl, setIdentityCardBackUrl] = useState(user.identityCardBackUrl || "")
  const [identityCardFrontRotate, setIdentityCardFrontRotate] = useState<number>(user.identityCardFrontRotate ?? 0)
  const [identityCardBackRotate, setIdentityCardBackRotate] = useState<number>(user.identityCardBackRotate ?? 0)

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const currentDisplayName = user.displayName || user.fullName || user.email || "Current User"

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
  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileName = file.name.trim()
    const contentType = file.type && file.type.trim() ? file.type.trim().toLowerCase() : "image/jpeg"

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Avatar image size must not exceed 5MB.",
      })
      return
    }

    setUploadingAvatar(true)
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
        description: "Your new profile photo is saved.",
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
      setUploadingAvatar(false)
      if (avatarInputRef.current) {
        avatarInputRef.current.value = ""
      }
    }
  }

  // Handle CCCD Front/Back Upload via S3 Presigned URL
  const handleCccdFileUpload = async (file: File, side: "FRONT" | "BACK") => {
    const isFront = side === "FRONT"
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "CCCD document file must not exceed 10MB.",
      })
      return
    }

    const setUploading = isFront ? setUploadingFrontCccd : setUploadingBackCccd
    setUploading(true)

    try {
      const contentType = file.type && file.type.trim() ? file.type.trim().toLowerCase() : "image/jpeg"
      const presignRes = await profileApi.generateIdentityCardPresignedUrl({
        fileName: file.name.trim(),
        contentType: contentType,
        cardSide: side,
      })

      const { uploadUrl, publicUrl } = presignRes.data || {}
      if (!uploadUrl || !publicUrl) {
        throw new Error("Failed to obtain presigned link for CCCD upload.")
      }

      await profileApi.uploadFileToS3(uploadUrl, file, contentType)

      if (isFront) {
        setIdentityCardFrontUrl(publicUrl)
        setIdentityCardFrontRotate(0)
      } else {
        setIdentityCardBackUrl(publicUrl)
        setIdentityCardBackRotate(0)
      }

      toast({
        title: `CCCD ${isFront ? "Mặt trước" : "Mặt sau"} tải lên thành công!`,
        description: "Bấm 'Save Changes' bên dưới để lưu cập nhật vào hồ sơ.",
      })
    } catch (err: unknown) {
      const anyErr = err as { message?: string; response?: { data?: { message?: string } } }
      console.error("Failed to upload CCCD:", anyErr)
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: anyErr?.response?.data?.message || anyErr?.message || "Could not upload CCCD image.",
      })
    } finally {
      setUploading(false)
      if (isFront && frontCccdInputRef.current) frontCccdInputRef.current.value = ""
      if (!isFront && backCccdInputRef.current) backCccdInputRef.current.value = ""
    }
  }

  // Rotation Helpers (0 = 0deg, 1 = 90deg, 2 = 180deg, 3 = 270deg)
  const rotateFrontClockwise = () => {
    setIdentityCardFrontRotate((prev) => (prev + 1) % 4)
  }
  const rotateFrontCounterClockwise = () => {
    setIdentityCardFrontRotate((prev) => (prev - 1 + 4) % 4)
  }
  const rotateBackClockwise = () => {
    setIdentityCardBackRotate((prev) => (prev + 1) % 4)
  }
  const rotateBackCounterClockwise = () => {
    setIdentityCardBackRotate((prev) => (prev - 1 + 4) % 4)
  }

  // Form Validation & Submit
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
    if (citizenId && citizenId.length > 20) {
      setErrorMsg("Citizen ID (CCCD) cannot exceed 20 characters.")
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
        citizenId: citizenId.trim() || undefined,
        bankAccount: bankAccount.trim() || undefined,
        healthInsuranceNumber: healthInsuranceNumber.trim() || undefined,
        identityCardFrontUrl: identityCardFrontUrl.trim() || undefined,
        identityCardBackUrl: identityCardBackUrl.trim() || undefined,
        identityCardFrontRotate: identityCardFrontRotate,
        identityCardBackRotate: identityCardBackRotate,
      }
      await onSave(payload)
      setSuccessMsg("Profile and identification details updated successfully.")
      setIsEditing(false)
      toast({
        title: "Profile Updated",
        description: "Your personal and identity card details have been saved.",
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
    setCitizenId(user.citizenId || "")
    setBankAccount(user.bankAccount || "")
    setHealthInsuranceNumber(user.healthInsuranceNumber || "")
    setIdentityCardFrontUrl(user.identityCardFrontUrl || "")
    setIdentityCardBackUrl(user.identityCardBackUrl || "")
    setIdentityCardFrontRotate(user.identityCardFrontRotate ?? 0)
    setIdentityCardBackRotate(user.identityCardBackRotate ?? 0)
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
              <AvatarPlaceholder
                src={user.avatarUrl}
                name={currentDisplayName}
                size="2xl"
                className="rounded-full border-4 border-white shadow-md transition-transform group-hover:scale-[1.02] overflow-hidden"
              />

              <button
                type="button"
                disabled={uploadingAvatar}
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:opacity-100 disabled:cursor-wait"
                title="Change Avatar Photo"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-white mb-0.5" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Change</span>
                  </>
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.svg,.heic,.heif,.avif,.tiff,.ico"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
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
                <span>Edit Profile & KYC</span>
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

      {/* Body Content */}
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
          /* READ-ONLY VIEW MODE */
          <div className="space-y-8">
            {/* Personal Information */}
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

            {/* Identification & Sensitive Information */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-500" />
                  <span>Citizen ID & Identification (CCCD / CMND)</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowSensitive((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  {showSensitive ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide Sensitive Data</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Show Sensitive Data</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/60 flex flex-col gap-1">
                  <span className="text-[11px] font-extrabold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Citizen ID (Số CCCD)</span>
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-800 pl-5">
                    {user.citizenId ? (
                      showSensitive ? user.citizenId : maskSensitiveText(user.citizenId)
                    ) : (
                      <span className="text-slate-400 font-sans font-normal italic">Not provided</span>
                    )}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/60 flex flex-col gap-1">
                  <span className="text-[11px] font-extrabold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Bank Account (Ngân hàng)</span>
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-800 pl-5">
                    {user.bankAccount ? (
                      showSensitive ? user.bankAccount : maskSensitiveText(user.bankAccount)
                    ) : (
                      <span className="text-slate-400 font-sans font-normal italic">Not provided</span>
                    )}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/60 flex flex-col gap-1">
                  <span className="text-[11px] font-extrabold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
                    <HeartHandshake className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Health Insurance (Mã BHYT)</span>
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-800 pl-5">
                    {user.healthInsuranceNumber ? (
                      showSensitive ? user.healthInsuranceNumber : maskSensitiveText(user.healthInsuranceNumber)
                    ) : (
                      <span className="text-slate-400 font-sans font-normal italic">Not provided</span>
                    )}
                  </span>
                </div>
              </div>

              {/* CCCD Image Preview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Front CCCD Card */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>CCCD Mặt Trước</span>
                    </span>
                    {user.identityCardFrontUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewImage({
                            url: user.identityCardFrontUrl!,
                            title: "CCCD Mặt Trước",
                            rotate: user.identityCardFrontRotate ?? 0,
                          })
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Xem chi tiết</span>
                      </button>
                    )}
                  </div>
                  {user.identityCardFrontUrl ? (
                    <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-900/5 flex items-center justify-center p-2 border border-slate-200">
                      <img
                        src={user.identityCardFrontUrl}
                        alt="CCCD Mặt Trước"
                        className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                        style={{
                          transform: `rotate(${(user.identityCardFrontRotate ?? 0) * 90}deg)`,
                          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-44 rounded-xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center text-slate-400 gap-2">
                      <CreditCard className="w-8 h-8 text-slate-300" />
                      <span className="text-xs font-semibold">Chưa tải ảnh mặt trước</span>
                    </div>
                  )}
                </div>

                {/* Back CCCD Card */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>CCCD Mặt Sau</span>
                    </span>
                    {user.identityCardBackUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewImage({
                            url: user.identityCardBackUrl!,
                            title: "CCCD Mặt Sau",
                            rotate: user.identityCardBackRotate ?? 0,
                          })
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Xem chi tiết</span>
                      </button>
                    )}
                  </div>
                  {user.identityCardBackUrl ? (
                    <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-900/5 flex items-center justify-center p-2 border border-slate-200">
                      <img
                        src={user.identityCardBackUrl}
                        alt="CCCD Mặt Sau"
                        className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                        style={{
                          transform: `rotate(${(user.identityCardBackRotate ?? 0) * 90}deg)`,
                          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-44 rounded-xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center text-slate-400 gap-2">
                      <CreditCard className="w-8 h-8 text-slate-300" />
                      <span className="text-xs font-semibold">Chưa tải ảnh mặt sau</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* System Security & Timestamps */}
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
          /* EDITABLE FORM MODE */
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">
                Update Profile & Identification (KYC)
              </h3>
              <span className="text-xs text-slate-500">
                Fields marked with <span className="text-red-500 font-bold">*</span> are required.
              </span>
            </div>

            {/* Section 1: Basic Info */}
            <div className="space-y-5">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                1. Thông tin cá nhân cơ bản
              </h4>
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
            </div>

            {/* Section 2: Sensitive Numbers */}
            <div className="space-y-5 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-500" />
                <span>2. Thông tin định danh & Bảo mật (Sensitive Data)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="citizen-id-input" className="text-xs font-bold text-slate-700">
                    Số CCCD / CMND
                  </Label>
                  <Input
                    id="citizen-id-input"
                    disabled={loading}
                    value={citizenId}
                    onChange={(e) => setCitizenId(e.target.value)}
                    placeholder="VD: 079204001234"
                    maxLength={20}
                    className="h-11 rounded-xl border-slate-200 text-xs font-mono font-semibold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank-account-input" className="text-xs font-bold text-slate-700">
                    Tài khoản ngân hàng
                  </Label>
                  <Input
                    id="bank-account-input"
                    disabled={loading}
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="VD: 1029384756 - Vietcombank"
                    maxLength={100}
                    className="h-11 rounded-xl border-slate-200 text-xs font-mono font-semibold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="health-ins-input" className="text-xs font-bold text-slate-700">
                    Mã số Thẻ BHYT
                  </Label>
                  <Input
                    id="health-ins-input"
                    disabled={loading}
                    value={healthInsuranceNumber}
                    onChange={(e) => setHealthInsuranceNumber(e.target.value)}
                    placeholder="VD: DN4790123456789"
                    maxLength={50}
                    className="h-11 rounded-xl border-slate-200 text-xs font-mono font-semibold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: CCCD Front & Back Image Upload with Rotation */}
            <div className="space-y-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-blue-500" />
                  <span>3. Tải lên ảnh Căn cước công dân (Presigned S3 Upload & Rotate)</span>
                </h4>
                <span className="text-[11px] text-slate-400 italic">
                  Hỗ trợ xoay ảnh mượt mà với CSS transition
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Front CCCD Card Box */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span>CCCD Mặt Trước</span>
                    </span>
                    {identityCardFrontUrl && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Xoay: {identityCardFrontRotate * 90}°
                      </span>
                    )}
                  </div>

                  {/* Image Display Area with CSS transition rotate */}
                  <div className="relative w-full h-48 rounded-xl bg-slate-900/5 border border-slate-200/80 overflow-hidden flex items-center justify-center p-2 group">
                    {uploadingFrontCccd ? (
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="text-xs font-bold">Đang tải lên S3...</span>
                      </div>
                    ) : identityCardFrontUrl ? (
                      <img
                        src={identityCardFrontUrl}
                        alt="CCCD Mặt Trước"
                        className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                        style={{
                          transform: `rotate(${identityCardFrontRotate * 90}deg)`,
                          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
                        <UploadCloud className="w-8 h-8 text-slate-300" />
                        <span className="text-xs font-bold text-slate-600">Chưa có ảnh mặt trước</span>
                        <span className="text-[10px] text-slate-400">Chọn file ảnh JPG, PNG, WEBP, HEIC</span>
                      </div>
                    )}
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <input
                      ref={frontCccdInputRef}
                      type="file"
                      accept="image/*,.jpg,.jpeg,.png,.webp,.heic,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleCccdFileUpload(file, "FRONT")
                      }}
                      disabled={uploadingFrontCccd}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => frontCccdInputRef.current?.click()}
                      disabled={uploadingFrontCccd}
                      className="h-9 rounded-xl text-xs font-bold border-slate-200 hover:bg-white cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                      <span>{identityCardFrontUrl ? "Đổi ảnh" : "Tải ảnh lên"}</span>
                    </Button>

                    {identityCardFrontUrl && (
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={rotateFrontCounterClockwise}
                          title="Xoay trái 90°"
                          className="h-9 w-9 p-0 rounded-xl border-slate-200 hover:bg-white text-slate-700 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={rotateFrontClockwise}
                          title="Xoay phải 90°"
                          className="h-9 w-9 p-0 rounded-xl border-slate-200 hover:bg-white text-slate-700 cursor-pointer"
                        >
                          <RotateCw className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIdentityCardFrontUrl("")
                            setIdentityCardFrontRotate(0)
                          }}
                          title="Xóa ảnh này"
                          className="h-9 w-9 p-0 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Back CCCD Card Box */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span>CCCD Mặt Sau</span>
                    </span>
                    {identityCardBackUrl && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Xoay: {identityCardBackRotate * 90}°
                      </span>
                    )}
                  </div>

                  {/* Image Display Area with CSS transition rotate */}
                  <div className="relative w-full h-48 rounded-xl bg-slate-900/5 border border-slate-200/80 overflow-hidden flex items-center justify-center p-2 group">
                    {uploadingBackCccd ? (
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="text-xs font-bold">Đang tải lên S3...</span>
                      </div>
                    ) : identityCardBackUrl ? (
                      <img
                        src={identityCardBackUrl}
                        alt="CCCD Mặt Sau"
                        className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                        style={{
                          transform: `rotate(${identityCardBackRotate * 90}deg)`,
                          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
                        <UploadCloud className="w-8 h-8 text-slate-300" />
                        <span className="text-xs font-bold text-slate-600">Chưa có ảnh mặt sau</span>
                        <span className="text-[10px] text-slate-400">Chọn file ảnh JPG, PNG, WEBP, HEIC</span>
                      </div>
                    )}
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <input
                      ref={backCccdInputRef}
                      type="file"
                      accept="image/*,.jpg,.jpeg,.png,.webp,.heic,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleCccdFileUpload(file, "BACK")
                      }}
                      disabled={uploadingBackCccd}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => backCccdInputRef.current?.click()}
                      disabled={uploadingBackCccd}
                      className="h-9 rounded-xl text-xs font-bold border-slate-200 hover:bg-white cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                      <span>{identityCardBackUrl ? "Đổi ảnh" : "Tải ảnh lên"}</span>
                    </Button>

                    {identityCardBackUrl && (
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={rotateBackCounterClockwise}
                          title="Xoay trái 90°"
                          className="h-9 w-9 p-0 rounded-xl border-slate-200 hover:bg-white text-slate-700 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={rotateBackClockwise}
                          title="Xoay phải 90°"
                          className="h-9 w-9 p-0 rounded-xl border-slate-200 hover:bg-white text-slate-700 cursor-pointer"
                        >
                          <RotateCw className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIdentityCardBackUrl("")
                            setIdentityCardBackRotate(0)
                          }}
                          title="Xóa ảnh này"
                          className="h-9 w-9 p-0 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={loading || uploadingFrontCccd || uploadingBackCccd}
                onClick={handleReset}
                className="h-11 rounded-xl border-slate-200 font-bold text-slate-600 text-xs px-5 hover:bg-slate-50 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                <span>Cancel</span>
              </Button>
              <Button
                type="submit"
                disabled={loading || uploadingFrontCccd || uploadingBackCccd}
                className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 font-extrabold text-white text-xs px-6 shadow-md shadow-blue-500/25 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Changes</span>
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Lightbox / Preview Modal for CCCD */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-3xl p-6 flex flex-col items-center gap-4 text-white shadow-2xl">
            <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-extrabold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span>{previewImage.title}</span>
              </h4>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full h-[60vh] flex items-center justify-center overflow-hidden p-4 bg-slate-950/60 rounded-2xl">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-full max-w-full object-contain rounded-lg"
                style={{
                  transform: `rotate(${previewImage.rotate * 90}deg)`,
                  transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setPreviewImage((prev) =>
                    prev ? { ...prev, rotate: (prev.rotate - 1 + 4) % 4 } : null
                  )
                }
                className="rounded-xl border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                <span>Xoay trái</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setPreviewImage((prev) =>
                    prev ? { ...prev, rotate: (prev.rotate + 1) % 4 } : null
                  )
                }
                className="rounded-xl border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                <RotateCw className="w-3.5 h-3.5 mr-1.5" />
                <span>Xoay phải</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setPreviewImage(null)}
                className="rounded-xl bg-blue-600 hover:bg-blue-500 font-extrabold text-xs px-5 text-white"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function UnifiedProfileCard({ user, onSave, onAvatarUpdate, loading = false }: UnifiedProfileCardProps) {
  const formKey = `${user.id || "u"}-${user.updatedAt || user.displayName || "init"}`
  return <UnifiedProfileCardContent key={formKey} user={user} onSave={onSave} onAvatarUpdate={onAvatarUpdate} loading={loading} />
}

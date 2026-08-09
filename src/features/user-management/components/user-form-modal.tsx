import { useState, type FormEvent } from "react"
import { ShieldCheck, Mail, User, Phone, Calendar, MapPin, Sparkles, Loader2, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { USER_ROLES, type UserRole } from "@/types/authentication"
import type { UserCreateRequest, UserItem, UserUpdateRequest, AccountStatus } from "../types"

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payload: UserCreateRequest | UserUpdateRequest) => Promise<void>
  initialData?: UserItem | null
  defaultRole: UserRole
  loading?: boolean
  effectiveRole?: UserRole
}

/**
 * Inner Form component using React Key pattern to automatically reset default state on modal open/switch
 * completely avoiding cascading renders from useEffect state syncing.
 */
function UserFormModalContent({
  onClose,
  onSave,
  initialData,
  defaultRole,
  loading = false,
  effectiveRole,
}: Omit<UserFormModalProps, "isOpen">) {
  const isEditMode = Boolean(initialData)

  const [email, setEmail] = useState(initialData?.email || "")
  const [role, setRole] = useState<UserRole>(initialData?.role || defaultRole)
  const [status, setStatus] = useState<AccountStatus>(initialData?.status || "ACTIVE")
  const [displayName, setDisplayName] = useState(initialData?.displayName || "")
  const [phone, setPhone] = useState(initialData?.phone || "")
  const [dateOfBirth, setDateOfBirth] = useState(initialData?.dateOfBirth || "") // yyyy-MM-dd
  const [gender, setGender] = useState(initialData?.gender || "MALE")
  const [address, setAddress] = useState(initialData?.address || "")

  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const validate = (): boolean => {
    setErrorMsg(null)

    // Email validation on create
    if (!isEditMode && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      setErrorMsg("Please enter a valid email address.")
      return false
    }

    // Role required
    if (!role) {
      setErrorMsg("User role is required.")
      return false
    }

    // Display Name required on create, max 120 chars
    if (!displayName.trim()) {
      setErrorMsg("Display name is required.")
      return false
    }
    if (displayName.length > 120) {
      setErrorMsg("Display name cannot exceed 120 characters.")
      return false
    }

    // Phone max 30 chars
    if (phone && phone.length > 30) {
      setErrorMsg("Phone number cannot exceed 30 characters.")
      return false
    }

    // Date of birth format validation yyyy-MM-dd if entered
    if (dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      setErrorMsg("Date of birth must follow the format YYYY-MM-DD.")
      return false
    }

    // Gender max 20 chars
    if (gender && gender.length > 20) {
      setErrorMsg("Gender selection cannot exceed 20 characters.")
      return false
    }

    // Address max 500 chars
    if (address && address.length > 500) {
      setErrorMsg("Address description cannot exceed 500 characters.")
      return false
    }

    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      if (isEditMode) {
        const updatePayload: UserUpdateRequest = {
          status,
          displayName: displayName.trim(),
          phone: phone.trim() || undefined,
          dateOfBirth: dateOfBirth || undefined,
          gender: gender || undefined,
          address: address.trim() || undefined,
        }

        await onSave(updatePayload)
      } else {
        const createPayload: UserCreateRequest = {
          email: email.trim(),
          role,
          displayName: displayName.trim(),
          phone: phone.trim() || undefined,
          dateOfBirth: dateOfBirth || undefined,
          gender: gender || undefined,
          address: address.trim() || undefined,
        }
        await onSave(createPayload)
      }
    } catch (err: unknown) {
      const anyErr = err as { message?: string; response?: { data?: { message?: string } } }
      setErrorMsg(anyErr?.response?.data?.message || anyErr?.message || "An unexpected error occurred while saving.")
    }
  }

  return (
    <>
      <DialogHeader className="p-6 pb-4 bg-slate-50/80 border-b border-slate-100 text-left">
        <div className="flex items-center gap-2.5 text-blue-700 font-extrabold text-xs uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>{isEditMode ? "Update Account Records" : "Account Onboarding Portal"}</span>
        </div>
        <DialogTitle className="text-xl font-black text-slate-900">
          {isEditMode ? `Edit Profile: ${initialData?.displayName}` : "Provision New Clinical User"}
        </DialogTitle>
        <DialogDescription className="text-xs text-slate-500 font-medium">
          {isEditMode
            ? "Modify user role credentials, compliance contact data, and active operating status."
            : "Register a new tenant user account. Backend will securely issue temporary passwords via email."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Row 1: Email & Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email Address <span className="text-red-500">*</span></span>
            </Label>
            <Input
              disabled={isEditMode || loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor.nguyen@healthsense.com"
              type="email"
              required={!isEditMode}
              className="h-10 rounded-xl border-slate-200 text-xs font-semibold disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="user-role-select" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>Account Role <span className="text-red-500">*</span></span>
            </Label>
            <select
              id="user-role-select"
              aria-label="Account Role Select"
              disabled={isEditMode || loading}
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
              <option value={USER_ROLES.MEMBER}>MEMBER - Patient Account</option>
              <option value={USER_ROLES.DOCTOR}>DOCTOR - Clinical Diagnostic</option>
              <option value={USER_ROLES.CARE_COORDINATOR}>CARE_COORDINATOR - Consultation Manager</option>
              {effectiveRole === USER_ROLES.SUPER_ADMIN && (
                <option value={USER_ROLES.ADMIN}>ADMIN - Tenant Manager</option>
              )}
            </select>
          </div>
        </div>

        {/* Row 2: Display Name & Status (Only on Edit) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`space-y-1.5 ${!isEditMode ? "sm:col-span-2" : ""}`}>
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Display Name <span className="text-red-500">*</span></span>
            </Label>
            <Input
              disabled={loading}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Dr. Nguyễn Văn A (Cardiology Specialist)"
              maxLength={120}
              required
              className="h-10 rounded-xl border-slate-200 text-xs font-semibold"
            />
          </div>

          {isEditMode && (
            <div className="space-y-1.5">
              <Label htmlFor="account-status-select" className="text-xs font-bold text-slate-700">
                Account Status <span className="text-red-500">*</span>
              </Label>
              <select
                id="account-status-select"
                aria-label="Account Status Select"
                disabled={loading}
                value={status}
                onChange={(e) => setStatus(e.target.value as AccountStatus)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ACTIVE">ACTIVE - Healthy Operation</option>
                <option value="PENDING_VERIFY">PENDING_VERIFY - Email Verification</option>
                <option value="INACTIVE">INACTIVE - Dormant</option>
                <option value="LOCKED">LOCKED - Security Lockout</option>
                <option value="BANNED">BANNED - Compliance Violation</option>
              </select>
            </div>
          )}
        </div>

        {/* Row 3: Phone Number & Date of Birth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Phone Number (Optional)</span>
            </Label>
            <Input
              disabled={loading}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+84 909 123 456"
              maxLength={30}
              className="h-10 rounded-xl border-slate-200 text-xs font-mono font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Date of Birth (YYYY-MM-DD)</span>
            </Label>
            <Input
              disabled={loading}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              type="date"
              className="h-10 rounded-xl border-slate-200 text-xs font-mono font-semibold cursor-pointer"
            />
          </div>
        </div>

        {/* Row 4: Gender & Address */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5 sm:col-span-1">
            <Label htmlFor="user-gender-select" className="text-xs font-bold text-slate-700">
              Gender
            </Label>
            <select
              id="user-gender-select"
              aria-label="User Gender Select"
              disabled={loading}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other / Diverse</option>
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Residential / Clinical Address</span>
            </Label>
            <Input
              disabled={loading}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ho Chi Minh City, Vietnam"
              maxLength={500}
              className="h-10 rounded-xl border-slate-200 text-xs font-medium"
            />
          </div>
        </div>

        {!isEditMode && (
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3 mt-2">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="text-xs text-blue-900">
              <strong className="font-extrabold block">Automatic Security Credentials Notice</strong>
              No manual password setup is needed. Upon submitting, backend services will instantly issue a secure temporary password and dispatch login instructions via verified email.
            </div>
          </div>
        )}

        <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={onClose}
            className="h-10 rounded-xl border-slate-200 text-slate-600 text-xs font-bold px-4 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 shadow-sm shadow-blue-500/25 flex items-center gap-2 cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isEditMode ? "Save Changes" : "Create Account"}</span>
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}

export function UserFormModal({ isOpen, onClose, onSave, initialData, defaultRole, loading = false, effectiveRole }: UserFormModalProps) {
  // Compute clean key to remount form content only when initialData identity changes or modal opens
  const formKey = initialData ? String(initialData.id) : `create-${defaultRole}`

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !loading && !val && onClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-white rounded-3xl shadow-xl border border-slate-200">
        {isOpen && (
          <UserFormModalContent
            key={formKey}
            onClose={onClose}
            onSave={onSave}
            initialData={initialData}
            defaultRole={defaultRole}
            loading={loading}
            effectiveRole={effectiveRole}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

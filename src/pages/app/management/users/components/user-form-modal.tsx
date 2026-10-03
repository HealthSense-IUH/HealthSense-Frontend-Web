import { useState, type FormEvent } from "react"
import { useTranslation } from "react-i18next"
import { ShieldCheck, Mail, User, Phone, Calendar, MapPin, Sparkles, Loader2, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { USER_ROLES } from "@/constants"
import type { UserRole } from "@/types/auth"
import type { UserCreateRequest, UserItem, UserUpdateRequest, UserAccountStatus as AccountStatus } from "@/types/user"

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
  const { t } = useTranslation("management")
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
      setErrorMsg(t("users.form.errors.invalidEmail"))
      return false
    }

    // Role required
    if (!role) {
      setErrorMsg(t("users.form.errors.roleRequired"))
      return false
    }

    // Display Name required on create, max 120 chars
    if (!displayName.trim()) {
      setErrorMsg(t("users.form.errors.displayNameRequired"))
      return false
    }
    if (displayName.length > 120) {
      setErrorMsg(t("users.form.errors.displayNameTooLong"))
      return false
    }

    // Phone max 30 chars
    if (phone && phone.length > 30) {
      setErrorMsg(t("users.form.errors.phoneTooLong"))
      return false
    }

    // Date of birth format validation yyyy-MM-dd if entered
    if (dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      setErrorMsg(t("users.form.errors.dateOfBirthFormat"))
      return false
    }

    // Gender max 20 chars
    if (gender && gender.length > 20) {
      setErrorMsg(t("users.form.errors.genderTooLong"))
      return false
    }

    // Address max 500 chars
    if (address && address.length > 500) {
      setErrorMsg(t("users.form.errors.addressTooLong"))
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
      setErrorMsg(anyErr?.response?.data?.message || anyErr?.message || t("users.form.errors.saveFailed"))
    }
  }

  return (
    <>
      <DialogHeader className="p-6 pb-4 bg-slate-50/80 border-b border-slate-100 text-left">
        <div className="flex items-center gap-2.5 text-primary-700 font-extrabold text-xs uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>{isEditMode ? t("users.form.badgeEdit") : t("users.form.badgeCreate")}</span>
        </div>
        <DialogTitle className="text-xl font-black text-slate-900">
          {isEditMode ? t("users.form.titleEdit", { name: initialData?.displayName }) : t("users.form.titleCreate")}
        </DialogTitle>
        <DialogDescription className="text-xs text-slate-500 font-medium">
          {isEditMode
            ? t("users.form.descriptionEdit")
            : t("users.form.descriptionCreate")}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-danger-50 border border-danger-200 text-danger-800 text-xs font-bold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-danger-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Row 1: Email & Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("users.form.email")} <span className="text-danger-500">*</span></span>
            </Label>
            <Input
              disabled={isEditMode || loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("users.form.emailPlaceholder")}
              type="email"
              required={!isEditMode}
              className="h-10 rounded-xl border-slate-200 text-xs font-semibold disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="user-role-select" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>{t("users.form.role")} <span className="text-danger-500">*</span></span>
            </Label>
            <select
              id="user-role-select"
              aria-label={t("users.form.roleAria")}
              disabled={isEditMode || loading}
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
              <option value={USER_ROLES.MEMBER}>{t("users.form.roleOptions.member")}</option>
              <option value={USER_ROLES.DOCTOR}>{t("users.form.roleOptions.doctor")}</option>
              {effectiveRole === USER_ROLES.SUPER_ADMIN && (
                <option value={USER_ROLES.ADMIN}>{t("users.form.roleOptions.admin")}</option>
              )}
            </select>
          </div>
        </div>

        {/* Row 2: Display Name & Status (Only on Edit) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`space-y-1.5 ${!isEditMode ? "sm:col-span-2" : ""}`}>
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("users.form.displayName")} <span className="text-danger-500">*</span></span>
            </Label>
            <Input
              disabled={loading}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t("users.form.displayNamePlaceholder")}
              maxLength={120}
              required
              className="h-10 rounded-xl border-slate-200 text-xs font-semibold"
            />
          </div>

          {isEditMode && (
            <div className="space-y-1.5">
              <Label htmlFor="account-status-select" className="text-xs font-bold text-slate-700">
                {t("users.form.status")} <span className="text-danger-500">*</span>
              </Label>
              <select
                id="account-status-select"
                aria-label={t("users.form.statusAria")}
                disabled={loading}
                value={status}
                onChange={(e) => setStatus(e.target.value as AccountStatus)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value="ACTIVE">{t("users.form.statusOptions.active")}</option>
                <option value="PENDING_VERIFY">{t("users.form.statusOptions.pendingVerify")}</option>
                <option value="INACTIVE">{t("users.form.statusOptions.inactive")}</option>
                <option value="LOCKED">{t("users.form.statusOptions.locked")}</option>
                <option value="BANNED">{t("users.form.statusOptions.banned")}</option>
              </select>
            </div>
          )}
        </div>

        {/* Row 3: Phone Number & Date of Birth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("users.form.phone")}</span>
            </Label>
            <Input
              disabled={loading}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0909 123 456"
              maxLength={30}
              className="h-10 rounded-xl border-slate-200 text-xs font-mono font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("users.form.dateOfBirth")}</span>
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
              {t("users.form.gender")}
            </Label>
            <select
              id="user-gender-select"
              aria-label={t("users.form.genderAria")}
              disabled={loading}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              <option value="MALE">{t("users.form.genderOptions.male")}</option>
              <option value="FEMALE">{t("users.form.genderOptions.female")}</option>
              <option value="OTHER">{t("users.form.genderOptions.other")}</option>
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("users.form.address")}</span>
            </Label>
            <Input
              disabled={loading}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t("users.form.addressPlaceholder")}
              maxLength={500}
              className="h-10 rounded-xl border-slate-200 text-xs font-medium"
            />
          </div>
        </div>

        {!isEditMode && (
          <div className="p-4 rounded-2xl bg-primary-50/60 border border-primary-100 flex items-start gap-3 mt-2">
            <Sparkles className="w-5 h-5 text-primary-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="text-xs text-primary-900">
              <strong className="font-extrabold block">{t("users.form.passwordNoticeTitle")}</strong>
              {t("users.form.passwordNoticeBody")}
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
            {t("users.form.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="h-10 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs px-5 shadow-sm shadow-primary-500/25 flex items-center gap-2 cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isEditMode ? t("users.form.saveChanges") : t("users.form.create")}</span>
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
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-white rounded-2xl shadow-xl border border-slate-200">
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

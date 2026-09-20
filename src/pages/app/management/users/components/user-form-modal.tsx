import { useState, type FormEvent } from "react"
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
      setErrorMsg("Vui lòng nhập địa chỉ email hợp lệ.")
      return false
    }

    // Role required
    if (!role) {
      setErrorMsg("Vai trò người dùng là bắt buộc.")
      return false
    }

    // Display Name required on create, max 120 chars
    if (!displayName.trim()) {
      setErrorMsg("Tên hiển thị là bắt buộc.")
      return false
    }
    if (displayName.length > 120) {
      setErrorMsg("Tên hiển thị không được vượt quá 120 ký tự.")
      return false
    }

    // Phone max 30 chars
    if (phone && phone.length > 30) {
      setErrorMsg("Số điện thoại không được vượt quá 30 ký tự.")
      return false
    }

    // Date of birth format validation yyyy-MM-dd if entered
    if (dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      setErrorMsg("Ngày sinh phải theo định dạng YYYY-MM-DD.")
      return false
    }

    // Gender max 20 chars
    if (gender && gender.length > 20) {
      setErrorMsg("Giới tính không được vượt quá 20 ký tự.")
      return false
    }

    // Address max 500 chars
    if (address && address.length > 500) {
      setErrorMsg("Địa chỉ không được vượt quá 500 ký tự.")
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
      setErrorMsg(anyErr?.response?.data?.message || anyErr?.message || "Đã xảy ra lỗi không mong muốn khi lưu thông tin.")
    }
  }

  return (
    <>
      <DialogHeader className="p-6 pb-4 bg-slate-50/80 border-b border-slate-100 text-left">
        <div className="flex items-center gap-2.5 text-blue-700 font-extrabold text-xs uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>{isEditMode ? "Cập nhật hồ sơ tài khoản" : "Cổng cấp phát tài khoản mới"}</span>
        </div>
        <DialogTitle className="text-xl font-black text-slate-900">
          {isEditMode ? `Chỉnh sửa: ${initialData?.displayName}` : "Thêm mới tài khoản người dùng"}
        </DialogTitle>
        <DialogDescription className="text-xs text-slate-500 font-medium">
          {isEditMode
            ? "Chỉnh sửa quyền hạn, thông tin liên lạc và trạng thái hoạt động của tài khoản."
            : "Đăng ký tài khoản người dùng mới. Hệ thống sẽ tự động gửi mật khẩu tạm thời qua email."}
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
              <span>Địa chỉ Email <span className="text-red-500">*</span></span>
            </Label>
            <Input
              disabled={isEditMode || loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="bacsi.nguyen@healthsense.com"
              type="email"
              required={!isEditMode}
              className="h-10 rounded-xl border-slate-200 text-xs font-semibold disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="user-role-select" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>Vai trò tài khoản <span className="text-red-500">*</span></span>
            </Label>
            <select
              id="user-role-select"
              aria-label="Account Role Select"
              disabled={isEditMode || loading}
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
              <option value={USER_ROLES.MEMBER}>MEMBER - Bệnh nhân / Hội viên</option>
              <option value={USER_ROLES.DOCTOR}>DOCTOR - Bác sĩ lâm sàng</option>
              {effectiveRole === USER_ROLES.SUPER_ADMIN && (
                <option value={USER_ROLES.ADMIN}>ADMIN - Quản trị viên bệnh viện</option>
              )}
            </select>
          </div>
        </div>

        {/* Row 2: Display Name & Status (Only on Edit) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`space-y-1.5 ${!isEditMode ? "sm:col-span-2" : ""}`}>
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Tên hiển thị <span className="text-red-500">*</span></span>
            </Label>
            <Input
              disabled={loading}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="BS. Nguyễn Văn A"
              maxLength={120}
              required
              className="h-10 rounded-xl border-slate-200 text-xs font-semibold"
            />
          </div>

          {isEditMode && (
            <div className="space-y-1.5">
              <Label htmlFor="account-status-select" className="text-xs font-bold text-slate-700">
                Trạng thái tài khoản <span className="text-red-500">*</span>
              </Label>
              <select
                id="account-status-select"
                aria-label="Account Status Select"
                disabled={loading}
                value={status}
                onChange={(e) => setStatus(e.target.value as AccountStatus)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ACTIVE">ACTIVE - Đang hoạt động</option>
                <option value="PENDING_VERIFY">PENDING_VERIFY - Chờ xác thực email</option>
                <option value="INACTIVE">INACTIVE - Không hoạt động</option>
                <option value="LOCKED">LOCKED - Đã khóa bảo mật</option>
                <option value="BANNED">BANNED - Bị cấm hoạt động</option>
              </select>
            </div>
          )}
        </div>

        {/* Row 3: Phone Number & Date of Birth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Số điện thoại (Không bắt buộc)</span>
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
              <span>Ngày sinh (YYYY-MM-DD)</span>
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
              Giới tính
            </Label>
            <select
              id="user-gender-select"
              aria-label="User Gender Select"
              disabled={loading}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Địa chỉ cư trú</span>
            </Label>
            <Input
              disabled={loading}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="TP. Hồ Chí Minh, Việt Nam"
              maxLength={500}
              className="h-10 rounded-xl border-slate-200 text-xs font-medium"
            />
          </div>
        </div>

        {!isEditMode && (
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3 mt-2">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="text-xs text-blue-900">
              <strong className="font-extrabold block">Thông báo bảo mật mật khẩu tự động</strong>
              Không cần thiết lập mật khẩu thủ công. Sau khi lưu, hệ thống sẽ tự động cấp mật khẩu tạm thời an toàn và gửi hướng dẫn kích hoạt tài khoản qua email.
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
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 shadow-sm shadow-blue-500/25 flex items-center gap-2 cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isEditMode ? "Lưu thay đổi" : "Tạo tài khoản"}</span>
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

import { useState, type FormEvent } from "react"
import { Loader2, Lock, Save, RotateCcw, AlertCircle, CheckCircle2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ProfileUpdateRequest, UserResponse } from "../types"

interface ProfileFormProps {
  user: UserResponse
  onSave: (payload: ProfileUpdateRequest) => Promise<void>
  loading?: boolean
}

/**
 * Inner controlled form utilizing React Key pattern to cleanly initialize and reset form fields
 * when user data updates or when 'Cancel' is pressed.
 */
function ProfileFormContent({ user, onSave, loading = false }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(user.displayName || user.fullName || "")
  const [phone, setPhone] = useState(user.phone || "")
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth || "") // yyyy-MM-dd
  const [gender, setGender] = useState(user.gender || "MALE")
  const [address, setAddress] = useState(user.address || "")

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

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
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div className="border-b border-slate-100 pb-4 mb-6 flex justify-between items-start gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Personal Information
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Update your contact details and demographic profile information.
          </p>
        </div>
        {!isEditing && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="h-9 rounded-xl border-slate-200 font-bold text-slate-700 text-xs px-4 hover:bg-slate-50 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Read-only system account credentials */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Read-Only Account Identifiers</span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              <Lock className="w-3.5 h-3.5" />
              <span>Managed by Admin</span>
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-slate-500">Email Address</Label>
              <Input
                disabled
                value={user.email || "—"}
                className="h-9 text-xs bg-white text-slate-600 font-mono font-semibold border-slate-200 cursor-not-allowed"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-slate-500">Assigned Role</Label>
              <Input
                disabled
                value={user.role || "MEMBER"}
                className="h-9 text-xs bg-white text-slate-600 font-extrabold border-slate-200 cursor-not-allowed"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-slate-500">Account Status</Label>
              <Input
                disabled
                value={user.status || "ACTIVE"}
                className="h-9 text-xs bg-white text-slate-600 font-extrabold border-slate-200 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="display-name-input" className="text-xs font-bold text-slate-700">
              Display Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="display-name-input"
              disabled={loading || !isEditing}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your full display name"
              maxLength={120}
              required
              className="h-10 rounded-xl border-slate-200 text-xs font-semibold disabled:opacity-60"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone-input" className="text-xs font-bold text-slate-700">
              Phone Number
            </Label>
            <Input
              id="phone-input"
              disabled={loading || !isEditing}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+84 909 123 456"
              maxLength={30}
              className="h-10 rounded-xl border-slate-200 text-xs font-mono font-semibold disabled:opacity-60"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="dob-input" className="text-xs font-bold text-slate-700">
              Date of Birth
            </Label>
            <Input
              id="dob-input"
              type="date"
              disabled={loading || !isEditing}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="h-10 rounded-xl border-slate-200 text-xs font-mono font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gender-select" className="text-xs font-bold text-slate-700">
              Gender
            </Label>
            <select
              id="gender-select"
              aria-label="Gender selection"
              disabled={loading || !isEditing}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address-input" className="text-xs font-bold text-slate-700">
            Address
          </Label>
          <Input
            id="address-input"
            disabled={loading || !isEditing}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter residential or practice address"
            maxLength={500}
            className="h-10 rounded-xl border-slate-200 text-xs font-medium disabled:opacity-60"
          />
        </div>

        {isEditing && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={handleReset}
              className="h-10 rounded-xl border-slate-200 font-bold text-slate-600 text-xs px-4 hover:bg-slate-50 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              <span>Cancel</span>
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 font-extrabold text-white text-xs px-5 shadow-sm shadow-blue-500/25 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}

export function ProfileForm({ user, onSave, loading = false }: ProfileFormProps) {
  // Use user.updatedAt or user.displayName as component key to ensure clean React reset without useEffect setStates
  const formKey = `${user.id || "u"}-${user.updatedAt || user.displayName || "init"}`

  return <ProfileFormContent key={formKey} user={user} onSave={onSave} loading={loading} />
}

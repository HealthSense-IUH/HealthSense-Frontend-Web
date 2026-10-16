import { useState, useRef, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useQueryClient } from "@tanstack/react-query"
import { Lock, Eye, EyeOff, KeyRound, AlertCircle, Loader2, ShieldCheck, Check } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi } from "@/services"
import { useAuthStore } from "@/stores/auth-store"

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const { t } = useTranslation("auth")
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const userSession = useAuthStore((state) => state.userSession)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  const currentPasswordRef = useRef<HTMLInputElement>(null)
  const newPasswordRef = useRef<HTMLInputElement>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }>({})
  const [generalError, setGeneralError] = useState("")

  // Realtime checklist rules (do not trim passwords!)
  const hasMinLength = newPassword.length >= 8
  const hasLettersAndNumbers = /[a-zA-Z]/.test(newPassword) && /\d/.test(newPassword)
  const isDifferentFromCurrent =
    currentPassword.length > 0 && newPassword.length > 0 && newPassword !== currentPassword
  const isMatching = confirmPassword.length > 0 && newPassword === confirmPassword

  const canSubmit =
    currentPassword.length > 0 &&
    hasMinLength &&
    hasLettersAndNumbers &&
    isDifferentFromCurrent &&
    isMatching &&
    !isSubmitting

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isSubmitting) return // Prevent closing while in-flight
    if (!nextOpen) {
      // Clear sensitive form state on close
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setFieldErrors({})
      setGeneralError("")
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
    }
    onOpenChange(nextOpen)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldErrors({})
    setGeneralError("")

    // Local validations
    if (!currentPassword) {
      setFieldErrors((prev) => ({ ...prev, currentPassword: t("changePassword.errCurrentRequired") }))
      currentPasswordRef.current?.focus()
      return
    }

    if (!hasMinLength || !hasLettersAndNumbers) {
      setFieldErrors((prev) => ({
        ...prev,
        newPassword: !hasMinLength
          ? t("changePassword.errMinLength")
          : t("changePassword.errLettersNumbers"),
      }))
      newPasswordRef.current?.focus()
      return
    }

    if (currentPassword === newPassword) {
      setFieldErrors((prev) => ({ ...prev, newPassword: t("changePassword.errSameAsCurrent") }))
      newPasswordRef.current?.focus()
      return
    }

    if (newPassword !== confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: t("changePassword.errMismatch") }))
      return
    }

    setIsSubmitting(true)
    try {
      await authApi.changePassword({ currentPassword, newPassword })

      // Successful change password sequence:
      // 1. Cancel in-flight queries & clear cache
      await queryClient.cancelQueries()
      queryClient.clear()

      // 2. Clear authentication session
      const userEmail = userSession?.email
      clearAuth()

      // 3. Close dialog
      onOpenChange(false)

      // 4. Redirect to login with message and prefilled email
      const loginUrl = userEmail ? `/login?email=${encodeURIComponent(userEmail)}` : "/login"
      navigate(loginUrl, {
        replace: true,
        state: {
          email: userEmail,
          successMessage: t("changePassword.successNotice"),
        },
      })
    } catch (error: unknown) {
      const anyErr = error as {
        response?: {
          status?: number
          data?: { code?: number; message?: string }
        }
        message?: string
      }
      const status = anyErr?.response?.status
      const code = anyErr?.response?.data?.code
      const backendMsg = anyErr?.response?.data?.message

      // 1008: CURRENT_PASSWORD_INCORRECT
      if (code === 1008) {
        setFieldErrors({ currentPassword: backendMsg || t("changePassword.errIncorrectCurrent") })
        setCurrentPassword("")
        currentPasswordRef.current?.focus()
        return
      }

      // 1009: NEW_PASSWORD_SAME_AS_CURRENT
      if (code === 1009) {
        setFieldErrors({ newPassword: backendMsg || t("changePassword.errSameAsCurrent") })
        setNewPassword("")
        setConfirmPassword("")
        newPasswordRef.current?.focus()
        return
      }

      // 401 / 403 / 404: Session expired or account disabled
      if (status === 401 || status === 403 || status === 404) {
        clearAuth()
        onOpenChange(false)
        navigate("/login", { replace: true })
        return
      }

      // 1200 or 429 or 500 or fallback general error
      setGeneralError(backendMsg || anyErr?.message || t("changePassword.errGeneral"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-200/60 mb-1">
            <KeyRound className="w-5 h-5" />
          </div>
          <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
            {t("changePassword.title")}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 leading-relaxed font-medium">
            {t("changePassword.subtitle")}
          </DialogDescription>
        </DialogHeader>

        {/* Security Notice */}
        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-amber-900 text-xs font-medium flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{t("changePassword.securityNotice")}</span>
        </div>

        {generalError && (
          <div className="p-3 rounded-xl bg-danger-50 border border-danger-200 text-danger-700 text-xs font-bold flex items-center gap-2.5 shadow-2xs animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-danger-600 shrink-0" />
            <span className="leading-normal flex-1">{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Current Password Field */}
          <div className="space-y-1.5">
            <Label htmlFor="current-password" className="text-xs font-bold text-slate-700">
              {t("changePassword.currentPasswordLabel")} <span className="text-danger-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                ref={currentPasswordRef}
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value)
                  if (fieldErrors.currentPassword) {
                    setFieldErrors((prev) => ({ ...prev, currentPassword: undefined }))
                  }
                }}
                disabled={isSubmitting}
                placeholder={t("changePassword.currentPasswordPlaceholder")}
                className={`w-full pl-10 pr-11 rounded-xl h-10 bg-white border ${
                  fieldErrors.currentPassword ? "border-danger-400 focus-visible:ring-danger-400" : "border-slate-200"
                } text-slate-900 placeholder:text-slate-400 text-xs focus-visible:ring-2 focus-visible:ring-primary shadow-2xs`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.currentPassword && (
              <p className="text-[11px] font-bold text-danger-600 pl-1">{fieldErrors.currentPassword}</p>
            )}
          </div>

          {/* New Password Field */}
          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-xs font-bold text-slate-700">
              {t("changePassword.newPasswordLabel")} <span className="text-danger-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                ref={newPasswordRef}
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  if (fieldErrors.newPassword) {
                    setFieldErrors((prev) => ({ ...prev, newPassword: undefined }))
                  }
                }}
                disabled={isSubmitting}
                placeholder={t("changePassword.newPasswordPlaceholder")}
                className={`w-full pl-10 pr-11 rounded-xl h-10 bg-white border ${
                  fieldErrors.newPassword ? "border-danger-400 focus-visible:ring-danger-400" : "border-slate-200"
                } text-slate-900 placeholder:text-slate-400 text-xs focus-visible:ring-2 focus-visible:ring-primary shadow-2xs`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.newPassword && (
              <p className="text-[11px] font-bold text-danger-600 pl-1">{fieldErrors.newPassword}</p>
            )}
          </div>

          {/* Confirm New Password Field */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password" className="text-xs font-bold text-slate-700">
              {t("changePassword.confirmPasswordLabel")} <span className="text-danger-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                  }
                }}
                disabled={isSubmitting}
                placeholder={t("changePassword.confirmPasswordPlaceholder")}
                className={`w-full pl-10 pr-11 rounded-xl h-10 bg-white border ${
                  fieldErrors.confirmPassword ? "border-danger-400 focus-visible:ring-danger-400" : "border-slate-200"
                } text-slate-900 placeholder:text-slate-400 text-xs focus-visible:ring-2 focus-visible:ring-primary shadow-2xs`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-[11px] font-bold text-danger-600 pl-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Realtime Checklist */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] font-medium text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800 mb-1">{t("changePassword.requirementsTitle")}</div>
            <div className={`flex items-center gap-2 ${hasMinLength ? "text-success-600 font-semibold" : ""}`}>
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  hasMinLength ? "bg-success-100 text-success-600" : "bg-slate-200 text-slate-400"
                }`}
              >
                <Check className="w-2.5 h-2.5" />
              </span>
              <span>{t("changePassword.reqMinLength")}</span>
            </div>
            <div className={`flex items-center gap-2 ${hasLettersAndNumbers ? "text-success-600 font-semibold" : ""}`}>
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  hasLettersAndNumbers ? "bg-success-100 text-success-600" : "bg-slate-200 text-slate-400"
                }`}
              >
                <Check className="w-2.5 h-2.5" />
              </span>
              <span>{t("changePassword.reqLettersNumbers")}</span>
            </div>
            <div className={`flex items-center gap-2 ${isDifferentFromCurrent ? "text-success-600 font-semibold" : ""}`}>
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  isDifferentFromCurrent ? "bg-success-100 text-success-600" : "bg-slate-200 text-slate-400"
                }`}
              >
                <Check className="w-2.5 h-2.5" />
              </span>
              <span>{t("changePassword.reqDifferent")}</span>
            </div>
            <div className={`flex items-center gap-2 ${isMatching ? "text-success-600 font-semibold" : ""}`}>
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  isMatching ? "bg-success-100 text-success-600" : "bg-slate-200 text-slate-400"
                }`}
              >
                <Check className="w-2.5 h-2.5" />
              </span>
              <span>{t("changePassword.reqMatch")}</span>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
              className="rounded-xl h-10 px-4 text-xs font-bold border-slate-200 hover:bg-slate-100 cursor-pointer"
            >
              {t("changePassword.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl h-10 px-5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 transition-all cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t("changePassword.submitting")}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t("changePassword.submit")}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

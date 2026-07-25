import { useState, type FormEvent } from "react"
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ShieldCheck, LogIn } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { forgotPasswordApi } from "../services/forgot-password-api"

interface ResetPasswordFormProps {
  resetToken: string
  onComplete: () => void
  isCompleted: boolean
}

export function ResetPasswordForm({ resetToken, onComplete, isCompleted }: ResetPasswordFormProps) {
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Validation states
  const hasMinLength = newPassword.length >= 8
  const hasLettersAndNumbers = /[a-zA-Z]/.test(newPassword) && /\d/.test(newPassword)
  const isMatching = newPassword !== "" && newPassword === confirmPassword

  async function handleResetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")

    if (!resetToken) {
      setErrorMessage("Your session token is missing or expired. Please request a new verification code.")
      return
    }

    if (!hasMinLength || !hasLettersAndNumbers) {
      setErrorMessage("Password must be at least 8 characters long and include both letters and numbers.")
      return
    }

    if (!isMatching) {
      setErrorMessage("New password and confirm password do not match.")
      return
    }

    setIsSubmitting(true)
    try {
      await forgotPasswordApi.resetPassword({ resetToken, newPassword })
      onComplete()
    } catch (error: unknown) {
      const anyErr = error as { response?: { data?: { message?: string } }; message?: string }
      setErrorMessage(
        anyErr?.response?.data?.message || anyErr?.message || "Failed to reset password. Please try again or request a new code."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step 4: Success Completion Screen
  if (isCompleted) {
    return (
      <div className="w-full flex flex-col items-center text-center py-4 gap-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-lg border border-emerald-200">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Password Reset Complete</h2>
          <p className="text-slate-600 text-xs sm:text-sm font-medium max-w-[320px] mx-auto leading-relaxed">
            Your password has been securely updated. You can now access your account using your new password.
          </p>
        </div>

        <div className="w-full mt-2">
          <Button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="w-full rounded-xl h-11 font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Back to login</span>
          </Button>
        </div>
      </div>
    )
  }

  // Step 3: Reset Password Input Form
  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-2xs border border-emerald-200/60">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create New Password</h2>
        <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
          Please enter and confirm your new strong password below.
        </p>
      </div>

      <form onSubmit={handleResetSubmit} className="flex flex-col gap-4 w-full">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2.5 shadow-2xs animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="leading-normal flex-1">{errorMessage}</span>
          </div>
        )}

        {/* New Password Input */}
        <div className="space-y-1.5">
          <Label htmlFor="newPassword" className="text-xs font-bold text-slate-700 ml-1">
            New Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full pl-10 pr-11 rounded-xl h-11 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary transition-all text-sm shadow-2xs hover:border-slate-300"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700 ml-1">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full pl-10 pr-11 rounded-xl h-11 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary transition-all text-sm shadow-2xs hover:border-slate-300"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Concise Security Rules Checklist */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] font-medium text-slate-600 space-y-1.5">
          <div className="font-bold text-slate-800 mb-1">Password requirements:</div>
          <div className={`flex items-center gap-2 ${hasMinLength ? "text-emerald-600 font-semibold" : ""}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? "bg-emerald-500" : "bg-slate-300"}`} />
            <span>At least 8 characters long</span>
          </div>
          <div className={`flex items-center gap-2 ${hasLettersAndNumbers ? "text-emerald-600 font-semibold" : ""}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${hasLettersAndNumbers ? "bg-emerald-500" : "bg-slate-300"}`} />
            <span>Includes both letters and numbers</span>
          </div>
          <div className={`flex items-center gap-2 ${isMatching ? "text-emerald-600 font-semibold" : ""}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isMatching ? "bg-emerald-500" : "bg-slate-300"}`} />
            <span>Confirm password matches new password</span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !hasMinLength || !hasLettersAndNumbers || !isMatching}
          className="w-full rounded-xl h-11 mt-2 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Resetting Password...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Save & Reset Password</span>
            </>
          )}
        </Button>
      </form>
    </div>
  )
}

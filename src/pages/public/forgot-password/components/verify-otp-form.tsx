import { useState, type FormEvent } from "react"
import { KeyRound, ArrowRight, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { forgotPasswordApi } from "@/services"

interface VerifyOtpFormProps {
  email: string
  onSuccess: (resetToken: string, verifiedOtp: string) => void
  onBack: () => void
}

export function VerifyOtpForm({ email, onSuccess, onBack }: VerifyOtpFormProps) {
  const [otp, setOtp] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  async function handleVerifySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")

    const cleanOtp = otp.trim()
    if (!/^\d{6}$/.test(cleanOtp)) {
      setErrorMessage("Please enter a valid 6-digit verification code.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await forgotPasswordApi.verifyOtp({ email, otp: cleanOtp })
      // Handle possible field names defensively
      const resetToken =
        response.data?.resetToken ??
        response.data?.token ??
        response.data?.passwordResetToken

      if (!resetToken) {
        setErrorMessage("Verification succeeded, but no reset token was received from the server.")
        return
      }

      onSuccess(resetToken, cleanOtp)
    } catch (error: unknown) {
      const anyErr = error as { response?: { data?: { message?: string } }; message?: string }
      setErrorMessage(
        anyErr?.response?.data?.message || anyErr?.message || "Invalid verification code. Please check and try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResendCode() {
    setErrorMessage("")
    setSuccessMessage("")
    setIsResending(true)
    try {
      await forgotPasswordApi.requestOtp({ email })
      setSuccessMessage("A new verification code has been sent to your email.")
    } catch (error: unknown) {
      const anyErr = error as { response?: { data?: { message?: string } }; message?: string }
      setErrorMessage(
        anyErr?.response?.data?.message || anyErr?.message || "Could not resend code. Please try again later."
      )
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-2xs border border-blue-200/60">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verify Code</h2>
        <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
          We sent a 6-digit code to <span className="text-slate-800 font-bold underline decoration-slate-300">{email || "your email"}</span>
        </p>
      </div>

      <form onSubmit={handleVerifySubmit} className="flex flex-col gap-4 w-full">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2.5 shadow-2xs animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="leading-normal flex-1">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2.5 shadow-2xs animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="leading-normal flex-1">{successMessage}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between ml-1 mr-1">
            <Label htmlFor="otp" className="text-xs font-bold text-slate-700">
              6-Digit OTP Code
            </Label>
            <span className="text-[11px] font-medium text-slate-400">Numbers only</span>
          </div>
          <div className="relative">
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              placeholder="123456"
              className="w-full text-center tracking-[0.3em] font-mono font-bold text-lg rounded-xl h-12 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-primary transition-all shadow-2xs hover:border-slate-300"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || otp.length < 6}
          className="w-full rounded-xl h-11 mt-1 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <span>Verify & Proceed</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      <div className="flex items-center justify-between mt-2 border-t border-slate-100 pt-4 px-1">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting || isResending}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors py-1.5 px-3 rounded-full hover:bg-slate-50 cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleResendCode}
          disabled={isResending || isSubmitting}
          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors py-1.5 px-3 rounded-full hover:bg-primary/5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin text-slate-400" : ""}`} />
          <span>{isResending ? "Sending..." : "Resend code"}</span>
        </button>
      </div>
    </div>
  )
}

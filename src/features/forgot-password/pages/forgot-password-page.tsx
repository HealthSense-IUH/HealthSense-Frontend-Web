import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { RequestOtpForm } from "../components/request-otp-form"
import { VerifyOtpForm } from "../components/verify-otp-form"
import { ResetPasswordForm } from "../components/reset-password-form"

type Step = "request" | "verify" | "reset" | "success"

export default function ForgotPasswordPage() {
  const location = useLocation()
  const navigate = useNavigate()

  // State Handling as specified by enterprise rules (memory-only token strategy)
  const [step, setStep] = useState<Step>(() => {
    if (location.pathname === "/forgot-password/verify") return "verify"
    if (location.pathname === "/reset-password") return "reset"
    return "request"
  })
  const [email, setEmail] = useState<string>("")
  const [, setOtp] = useState<string>("")
  const [resetToken, setResetToken] = useState<string>("")
  const [loading] = useState<boolean>(false)
  const [error] = useState<string | null>(null)

  // Derive active step safely without side-effect setState cascades:
  let activeStep = step
  if (step === "verify" && !email) activeStep = "request"
  if ((step === "reset" || step === "success") && !resetToken) activeStep = "request"

  // Security & Route sync: if accessing verify or reset without in-memory state, return to request route
  useEffect(() => {
    if ((location.pathname === "/forgot-password/verify" || step === "verify") && !email) {
      if (location.pathname !== "/forgot-password") navigate("/forgot-password", { replace: true })
      return
    }
    if ((location.pathname === "/reset-password" || step === "reset" || step === "success") && !resetToken) {
      if (location.pathname !== "/forgot-password") navigate("/forgot-password", { replace: true })
      return
    }
  }, [location.pathname, email, resetToken, navigate, step])

  const handleRequestSuccess = (verifiedEmail: string) => {
    setEmail(verifiedEmail)
    setStep("verify")
    navigate("/forgot-password/verify", { replace: true })
  }

  const handleVerifySuccess = (token: string, verifiedOtpCode: string) => {
    setResetToken(token)
    setOtp(verifiedOtpCode)
    setStep("reset")
    navigate("/reset-password", { replace: true })
  }

  const handleVerifyBack = () => {
    setStep("request")
    navigate("/forgot-password", { replace: true })
  }

  const handleResetComplete = () => {
    setStep("success")
    // Keep URL on /reset-password for success state
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden flex flex-col relative selection:bg-primary/20">
      {/* Subtle Grid / Gradient background for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Header Navigation */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-4 z-50 relative">
        <nav className="relative w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto bg-primary rounded-full shadow-lg shadow-primary/20 border border-white/10 backdrop-blur-md">
          <div 
            onClick={() => navigate("/", { replace: false })}
            className="flex items-center gap-2.5 cursor-pointer group transition-opacity hover:opacity-90"
          >
            <img
              src="/logo.png"
              alt="HealthSense Logo"
              className="w-10 h-10 object-contain rounded-xl group-hover:scale-105 transition-transform shrink-0"
            />
            <span className="text-2xl font-bold font-heading text-white tracking-tight">HealthSense</span>
          </div>

          <div className="flex items-center gap-4 text-sm font-semibold">
            <button
              onClick={() => navigate("/login")}
              className="bg-white text-primary hover:bg-slate-50 transition-colors px-6 py-2.5 rounded-full shadow-sm font-bold flex items-center gap-2 cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content Card Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <div className="w-full max-w-[460px] bg-white rounded-[2rem] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.08)] border border-slate-100/80 p-6 sm:p-8 md:p-10 relative overflow-hidden ring-1 ring-slate-900/5">
          {/* Subtle decoration inside card */}
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/5 blur-[30px] pointer-events-none" />

          {activeStep === "request" && (
            <RequestOtpForm initialEmail={email} onSuccess={handleRequestSuccess} />
          )}

          {activeStep === "verify" && (
            <VerifyOtpForm
              email={email}
              onSuccess={handleVerifySuccess}
              onBack={handleVerifyBack}
            />
          )}

          {(activeStep === "reset" || activeStep === "success") && (
            <ResetPasswordForm
              resetToken={resetToken}
              onComplete={handleResetComplete}
              isCompleted={activeStep === "success"}
            />
          )}

          {/* Reserved area for general loading or state display if needed */}
          {loading && <div className="text-center text-xs text-slate-400 mt-2">Processing request...</div>}
          {error && <div className="text-center text-xs text-red-500 mt-2">{error}</div>}
        </div>

        {/* Debug / Info notice */}
        <div className="text-center mt-6 text-slate-400 text-xs max-w-sm">
          Protected by HealthSense enterprise security. Need further assistance? Contact support.
        </div>
      </main>
    </div>
  )
}

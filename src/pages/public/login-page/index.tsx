import { useState, useEffect, type FormEvent } from "react"
import { 
  HeartPulse, 
  ArrowLeft, 
  Mail, 
  Lock, 
  LogIn, 
  UserPlus, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowUpRight, 
  Eye, 
  EyeOff, 
  Loader2 
} from "lucide-react"
import { useLocation, useNavigate, useSearchParams, Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { authApi } from "@/services/authentication"
import { useAuthStore } from "@/features/auth/auth-store"
import { getAuthErrorMessage } from "@/utils/authErrorHandler"

type LoginLocationState = {
  from?: {
    pathname?: string
  }
}

type AuthMode = "login" | "register"

export default function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const setAuthenticatedSession = useAuthStore((state) => state.setAuthenticatedSession)

  // Determine initial mode from URL pathname or query param
  const initialMode: AuthMode = 
    location.pathname === "/register" || searchParams.get("tab") === "register" || searchParams.get("mode") === "register"
      ? "register"
      : "login"

  const [mode, setMode] = useState<AuthMode>(initialMode)

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Register form state
  const [registerFullName, setRegisterFullName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false)

  // Feedback states
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const state = location.state as LoginLocationState | null
  const redirectTo = state?.from?.pathname ?? "/app/dashboard"

  // Synchronize mode with location / search parameters
  useEffect(() => {
    if (location.pathname === "/register" || searchParams.get("tab") === "register" || searchParams.get("mode") === "register") {
      setMode("register")
    } else {
      setMode("login")
    }
  }, [location.pathname, searchParams])

  const handleSwitchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setErrorMessage("")
    setSuccessMessage("")
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (newMode === "register") {
        next.set("tab", "register")
      } else {
        next.delete("tab")
        next.delete("mode")
      }
      return next
    })
  }

  // Handle Login submission
  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")
    setIsSubmitting(true)

    try {
      const response = await authApi.login({
        email: loginEmail.trim(),
        password: loginPassword,
      })
      setAuthenticatedSession(response.data.accessToken, response.data.userSession)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Register submission
  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")

    const fullName = registerFullName.trim()
    const email = registerEmail.trim()

    if (!fullName) {
      setErrorMessage("Vui lòng nhập họ và tên.")
      return
    }

    if (!email) {
      setErrorMessage("Vui lòng nhập địa chỉ email hợp lệ.")
      return
    }

    if (registerPassword.length < 8) {
      setErrorMessage("Mật khẩu phải có tối thiểu 8 ký tự.")
      return
    }

    if (registerPassword !== registerConfirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.")
      return
    }

    setIsSubmitting(true)

    try {
      await authApi.register({
        fullName,
        email,
        password: registerPassword,
      })

      // Try automatic login for seamless experience
      try {
        const loginResponse = await authApi.login({
          email,
          password: registerPassword,
        })
        setAuthenticatedSession(loginResponse.data.accessToken, loginResponse.data.userSession)
        navigate(redirectTo, { replace: true })
        return
      } catch {
        // If automatic login fails, switch to login tab with pre-filled email
        setLoginEmail(email)
        setLoginPassword("")
        handleSwitchMode("login")
        setSuccessMessage("Đăng ký tài khoản thành công! Vui lòng đăng nhập để tiếp tục.")
      }
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col justify-between relative overflow-hidden selection:bg-sky-500/20">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.035] pointer-events-none" />

      {/* Dynamic Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-sky-400/20 via-cyan-300/15 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[550px] h-[550px] rounded-full bg-gradient-to-tl from-red-500/15 via-rose-400/10 to-transparent blur-[140px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative top-0 left-0 right-0 p-4 sm:p-6 z-20 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform duration-300">
            <HeartPulse className="w-5 h-5 drop-shadow-xs" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-900 tracking-tight font-heading">HealthSense</span>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:block -mt-0.5">Hệ sinh thái Y tế Thông minh</span>
          </div>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200 shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về trang chủ</span>
        </Link>
      </header>

      {/* Centered Main Form Container */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-6 py-6 my-auto flex flex-col items-center">
        
        {/* Auth Card */}
        <div className="w-full bg-white rounded-3xl p-7 sm:p-9 shadow-[0_20px_60px_-15px_rgba(0,0,81,0.08)] border border-slate-200/80 relative transition-all duration-300">
          
          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 mb-6">
            <button
              type="button"
              onClick={() => handleSwitchMode("login")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer",
                mode === "login"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <LogIn className={cn("w-4 h-4", mode === "login" ? "text-sky-600" : "text-slate-400")} />
              <span>Đăng nhập</span>
            </button>
            
            <button
              type="button"
              onClick={() => handleSwitchMode("register")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer",
                mode === "register"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <UserPlus className={cn("w-4 h-4", mode === "register" ? "text-sky-600" : "text-slate-400")} />
              <span>Đăng ký</span>
            </button>
          </div>

          {/* Header / Subtitle */}
          <div className="flex flex-col items-center text-center mb-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight font-heading uppercase">
              {mode === "login" ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1 font-sans">
              {mode === "login"
                ? "Đăng nhập tài khoản HealthSense để tiếp tục"
                : "Đăng ký thành viên để theo dõi sức khỏe toàn diện"}
            </p>
          </div>

          {/* Alert Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2.5 shadow-2xs animate-in fade-in zoom-in-95 duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="leading-normal flex-1">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2.5 shadow-2xs animate-in fade-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="leading-normal flex-1">{successMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === "login" && (
            <form className="flex flex-col gap-4 w-full" onSubmit={handleLoginSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-xs font-bold text-slate-700 ml-1 font-heading">
                  Địa chỉ Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                    required
                    placeholder="user@example.com hoặc bacsi@healthsense.vn"
                    className="w-full pl-10 rounded-xl h-11 bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:border-transparent transition-all text-xs sm:text-sm font-medium shadow-2xs hover:border-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1 mr-1">
                  <Label htmlFor="login-password" className="text-xs font-bold text-slate-700 font-heading">
                    Mật khẩu
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline transition-all cursor-pointer font-sans"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="login-password"
                    type={showLoginPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 rounded-xl h-11 bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:border-transparent transition-all text-xs sm:text-sm font-medium shadow-2xs hover:border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                    tabIndex={-1}
                    aria-label={showLoginPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full rounded-xl h-11 mt-2 text-sm font-bold bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 text-white shadow-md shadow-sky-600/25 hover:shadow-lg hover:shadow-sky-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer font-heading"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xác thực thông tin...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Đăng nhập hệ thống</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === "register" && (
            <form className="flex flex-col gap-3.5 w-full" onSubmit={handleRegisterSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="register-name" className="text-xs font-bold text-slate-700 ml-1 font-heading">
                  Họ và tên
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="register-name"
                    type="text"
                    autoComplete="name"
                    value={registerFullName}
                    onChange={(event) => setRegisterFullName(event.target.value)}
                    required
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-10 rounded-xl h-11 bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:border-transparent transition-all text-xs sm:text-sm font-medium shadow-2xs hover:border-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="register-email" className="text-xs font-bold text-slate-700 ml-1 font-heading">
                  Địa chỉ Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    value={registerEmail}
                    onChange={(event) => setRegisterEmail(event.target.value)}
                    required
                    placeholder="user@example.com"
                    className="w-full pl-10 rounded-xl h-11 bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:border-transparent transition-all text-xs sm:text-sm font-medium shadow-2xs hover:border-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="register-password" className="text-xs font-bold text-slate-700 ml-1 font-heading">
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="register-password"
                    type={showRegisterPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={registerPassword}
                    onChange={(event) => setRegisterPassword(event.target.value)}
                    required
                    placeholder="Tối thiểu 8 ký tự"
                    minLength={8}
                    className="w-full pl-10 pr-10 rounded-xl h-11 bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:border-transparent transition-all text-xs sm:text-sm font-medium shadow-2xs hover:border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                    tabIndex={-1}
                    aria-label={showRegisterPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="register-confirm-password" className="text-xs font-bold text-slate-700 ml-1 font-heading">
                  Xác nhận mật khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="register-confirm-password"
                    type={showRegisterConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={registerConfirmPassword}
                    onChange={(event) => setRegisterConfirmPassword(event.target.value)}
                    required
                    placeholder="Nhập lại mật khẩu"
                    minLength={8}
                    className="w-full pl-10 pr-10 rounded-xl h-11 bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:border-transparent transition-all text-xs sm:text-sm font-medium shadow-2xs hover:border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                    tabIndex={-1}
                    aria-label={showRegisterConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showRegisterConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full rounded-xl h-11 mt-2 text-sm font-bold bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 text-white shadow-md shadow-sky-600/25 hover:shadow-lg hover:shadow-sky-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer font-heading"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang tạo tài khoản...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Tạo tài khoản mới</span>
                    <UserPlus className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>
          )}

          {/* Bottom Toggle Footnote */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            {mode === "login" ? (
              <p className="text-xs text-slate-500 font-sans">
                Bạn chưa có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => handleSwitchMode("register")}
                  className="font-bold text-sky-600 hover:text-sky-700 hover:underline cursor-pointer transition-colors"
                >
                  Đăng ký ngay
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500 font-sans">
                Bạn đã có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => handleSwitchMode("login")}
                  className="font-bold text-sky-600 hover:text-sky-700 hover:underline cursor-pointer transition-colors"
                >
                  Đăng nhập ngay
                </button>
              </p>
            )}
          </div>

        </div>

        {/* Subtle Security Badge below Card */}
        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Mã hóa bảo mật chuẩn y tế HIPAA &amp; HL7 Quốc tế</span>
        </div>

      </div>

      {/* Footer spacer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} HealthSense. Bản quyền thuộc về HealthSense.
      </footer>

    </div>
  )
}

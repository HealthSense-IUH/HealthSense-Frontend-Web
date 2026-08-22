import { useState, type FormEvent } from "react"
import { 
  HeartPulse, 
  ArrowLeft, 
  Mail, 
  Lock, 
  LogIn, 
  AlertCircle, 
  ShieldCheck, 
  Activity,
  ArrowUpRight
} from "lucide-react"
import { useLocation, useNavigate, Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi } from "@/services/authentication"
import { useAuthStore } from "@/features/auth/auth-store"
import { getAuthErrorMessage } from "@/utils/authErrorHandler"

type LoginLocationState = {
  from?: {
    pathname?: string
  }
}

export default function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const setAuthenticatedSession = useAuthStore((state) => state.setAuthenticatedSession)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const state = location.state as LoginLocationState | null
  const redirectTo = state?.from?.pathname ?? "/app/dashboard"

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")
    setIsSubmitting(true)

    try {
      const response = await authApi.login({ email, password })
      setAuthenticatedSession(response.data.accessToken, response.data.userSession)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col justify-center relative overflow-hidden selection:bg-sky-500/20">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.035] pointer-events-none" />

      {/* Dynamic Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-sky-400/20 via-cyan-300/15 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[550px] h-[550px] rounded-full bg-gradient-to-tl from-red-500/15 via-rose-400/10 to-transparent blur-[140px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="absolute top-0 left-0 right-0 p-6 z-20 flex items-center justify-between max-w-7xl mx-auto w-full">
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

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 my-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        
        {/* Left Side: Brand Value & Medical High-Tech Highlights (Hidden on small mobile) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center">
          <h1 className="text-4xl lg:text-5xl font-black font-heading text-slate-900 tracking-tight leading-[1.15] mb-5 uppercase">
            Giám sát sức khỏe <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-sky-600 to-blue-700">
              An tâm mỗi ngày
            </span>
          </h1>

          <p className="text-slate-600 text-base leading-relaxed mb-8 max-w-lg font-sans">
            Đăng nhập để xem biểu đồ nhịp tim thời gian thực, báo cáo phân tích AI về Rung nhĩ (AFib) và kết nối với bác sĩ chuyên khoa của bạn.
          </p>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-4 max-w-lg mb-8">
            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black font-heading text-slate-900">74 BPM</h4>
                <p className="text-xs text-slate-500 font-medium">Nhịp tim ổn định</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black font-heading text-slate-900">98.6%</h4>
                <p className="text-xs text-slate-500 font-medium">Độ chính xác AI</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Mã hóa bảo mật chuẩn y tế HIPAA &amp; HL7 Quốc tế</span>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="w-full lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md bg-white rounded-3xl p-7 sm:p-9 shadow-[0_20px_60px_-15px_rgba(0,0,81,0.08)] border border-slate-200/80 relative">
            
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-3 shadow-2xs">
                <LogIn className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight font-heading uppercase">
                Chào mừng trở lại
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1 font-sans">
                Đăng nhập tài khoản HealthSense để tiếp tục
              </p>
            </div>

            <form className="flex flex-col gap-4 w-full" onSubmit={handleLoginSubmit}>
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 shadow-2xs animate-in fade-in zoom-in-95 duration-200">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="leading-normal flex-1">{errorMessage}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-slate-700 ml-1 font-heading">
                  Địa chỉ Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    placeholder="bacsi@healthsense.vn hoặc user@gmail.com"
                    className="w-full pl-10 rounded-xl h-11 bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:border-transparent transition-all text-xs sm:text-sm font-medium shadow-2xs hover:border-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1 mr-1">
                  <Label htmlFor="password" className="text-xs font-bold text-slate-700 font-heading">
                    Mật khẩu
                  </Label>
                  <Link to="/forgot-password" className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline transition-all cursor-pointer font-sans">
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 rounded-xl h-11 bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:border-transparent transition-all text-xs sm:text-sm font-medium shadow-2xs hover:border-slate-300"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full rounded-xl h-11 mt-2 text-sm font-bold bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 text-white shadow-md shadow-sky-600/25 hover:shadow-lg hover:shadow-sky-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer font-heading"
              >
                {isSubmitting ? (
                  "Đang xác thực thông tin..."
                ) : (
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Đăng nhập hệ thống</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 font-sans">
                Bạn chưa có tài khoản?{" "}
                <a href="#pipeline" onClick={() => navigate("/")} className="font-bold text-sky-600 hover:underline cursor-pointer">
                  Tìm hiểu dịch vụ HealthSense
                </a>
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  )
}

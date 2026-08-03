import { useState, type FormEvent, useEffect } from "react"
import { HeartPulse, ArrowRight, CheckCircle2, LogIn, Mail, Lock, ArrowLeft, AlertCircle } from "lucide-react"
import { useLocation, useNavigate, Link } from "react-router-dom"

import { AIBenchmarkSection } from "./components/AIBenchmarkSection"
import { AIPipelineSection } from "./components/AIPipelineSection"
import { AIDatasetSection } from "./components/AIDatasetSection"
import { AIFeaturesSection } from "./components/AIFeaturesSection"
import { AIClinicalSection } from "./components/AIClinicalSection"
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

export default function LandingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Login States
  const [showLogin, setShowLogin] = useState(location.pathname === "/login")
  
  const setAuthenticatedSession = useAuthStore((state) => state.setAuthenticatedSession)
  const userSession = useAuthStore((state) => state.userSession)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const state = location.state as LoginLocationState | null
  const redirectTo = state?.from?.pathname ?? "/app/dashboard"

  useEffect(() => {
    // If user navigates via browser to /login while on the page
    if (location.pathname === "/login") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowLogin(true)
    }
  }, [location.pathname])

  const handleToggleLogin = () => {
    const newState = !showLogin
    setShowLogin(newState)
    
    // Update URL without full reload
    if (!newState) {
      window.history.pushState(null, '', '/')
    } else {
      window.history.pushState(null, '', '/login')
    }
  }

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
    <div className="min-h-screen bg-background text-foreground font-sans overflow-hidden flex flex-col relative selection:bg-primary/20">

      {/* Subtle Grid / Gradient background for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Navigation */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-2 z-50 relative">
        <nav className="relative w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto bg-primary rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/30 border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
              <HeartPulse className="w-6 h-6 drop-shadow-sm" />
            </div>
            <span className="text-2xl font-bold font-heading text-white tracking-tight">HealthSense</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-white/80">
            <a href="#" className="hover:text-white transition-colors">Về chúng tôi</a>
            <a href="#" className="hover:text-white transition-colors">Tính năng</a>
            <a href="#" className="hover:text-white transition-colors">Bác sĩ</a>
          </div>

          <div className="flex items-center gap-4 text-sm font-semibold">
            {userSession ? (
              <button 
                onClick={() => navigate('/app/dashboard')}
                className="bg-white text-primary hover:bg-slate-50 transition-colors px-6 py-2.5 rounded-full shadow-sm font-bold flex items-center gap-2"
              >
                Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={() => {
                  if (!showLogin) handleToggleLogin();
                }}
                className="bg-white text-primary hover:bg-slate-50 transition-colors px-6 py-2.5 rounded-full shadow-sm font-bold flex items-center gap-2"
              >
                Đăng nhập
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 lg:px-16 pb-12 pt-8">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center h-full">

          {/* Left Content (Text) */}
          <div className="col-span-1 lg:col-span-5 flex flex-col justify-center order-2 lg:order-1 mt-8 lg:mt-0 z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold w-fit mb-6 shadow-sm border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Nền tảng sức khỏe thông minh
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] mb-6 tracking-tight text-slate-900 font-heading">
              Đồng bộ dữ liệu <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Bảo vệ trái tim</span>
            </h1>
            <p className="text-slate-600 text-base md:text-lg mb-8 max-w-[480px] leading-relaxed font-medium">
              HealthSense giám sát nhịp tim và SpO2 liên tục, phát hiện sớm dấu hiệu Rung nhĩ (AFib) và kết nối bạn với chuyên gia y tế ngay lập tức.
            </p>

            <ul className="space-y-4 mb-10 text-slate-700 text-sm md:text-base font-semibold">
              <li className="flex items-center gap-3 bg-white/60 w-fit px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-health-heart" />
                Theo dõi nhịp tim & SpO2 thời gian thực
              </li>
              <li className="flex items-center gap-3 bg-white/60 w-fit px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-health-spo2" />
                Cảnh báo AI phát hiện bất thường
              </li>
              <li className="flex items-center gap-3 bg-white/60 w-fit px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-health-sleep" />
                Phân tích chuyên sâu chất lượng giấc ngủ
              </li>
            </ul>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  if (userSession) {
                    navigate('/app/dashboard');
                  } else if (!showLogin) {
                    handleToggleLogin();
                  }
                }}
                className="bg-primary text-primary-foreground font-bold px-8 py-4 rounded-full hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 flex items-center gap-2"
              >
                {userSession ? "Đi đến Dashboard" : "Bắt đầu Trải nghiệm"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Content (Video Mockup & Login Form) */}
          <div className="col-span-1 lg:col-span-7 relative h-auto flex flex-col items-center justify-center order-1 lg:order-2 w-full max-w-[850px] mx-auto gap-8 pt-4">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-10" />
            <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-health-heart/10 rounded-full blur-[80px] -z-10" />

            {/* Top Tags (Under header, above video) */}
            <div className={`flex flex-wrap items-center justify-center gap-6 w-full px-4 z-20 -mt-8 md:-mt-12 transition-opacity duration-500 ${showLogin ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <div className="bg-white/90 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-xl border border-slate-100/50 flex items-center gap-3 animate-[bounce_4s_ease-in-out_infinite]">
                <div className="w-10 h-10 rounded-full bg-health-heart/10 flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-health-heart" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">Cảnh báo AFib</span>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-xl border border-slate-100/50 flex items-center gap-3 animate-[bounce_5s_ease-in-out_infinite_reverse]">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary animate-ping absolute" />
                  <div className="w-2 h-2 rounded-full bg-primary relative" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">Telemedicine</span>
                  <span className="text-xs font-semibold text-slate-500">Bác sĩ trực tuyến</span>
                </div>
              </div>
            </div>

            {/* Dark modern device mockup */}
            <div
              className={`relative w-full bg-slate-900 rounded-[2.5rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.4)] p-4 overflow-hidden transition-all duration-700 ease-out border-8 border-slate-800 ring-1 ring-black/10 group ${showLogin ? 'scale-[1.02] shadow-[0_40px_100px_-20px_rgba(var(--primary),0.3)]' : 'hover:-translate-y-2'}`}
            >
              {/* Interactive Screen Container */}
              <div className="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-black relative shadow-inner">
                
                {/* 1. Video Element (Slides left when showLogin is true) */}
                <div 
                  className={`absolute inset-0 w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${showLogin ? '-translate-x-full pointer-events-none' : 'translate-x-0'}`}
                >
                  <iframe 
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    src="https://www.youtube.com/embed/_5ibr_-CpFg?enablejsapi=1&autoplay=1&mute=1&controls=0&loop=1&playlist=_5ibr_-CpFg&playsinline=1&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&vq=hd1080" 
                    title="" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    referrerPolicy="strict-origin-when-cross-origin" 
                    allowFullScreen
                  ></iframe>
                </div>

                {/* 2. Sleek Light Login Form Overlay (Slides in from right when showLogin is true) */}
                <div 
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  className={`absolute inset-0 w-full h-full bg-white flex flex-col items-center justify-center overflow-y-auto [&::-webkit-scrollbar]:hidden py-4 px-4 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${showLogin ? 'translate-x-0 pointer-events-auto z-10' : 'translate-x-full pointer-events-none z-0'}`}
                >
                  {/* Subtle Background Elements for light theme */}
                  <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-[80px] pointer-events-none" />
                  <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-400/5 blur-[80px] pointer-events-none" />

                  {/* Back button */}
                  <button 
                    onClick={handleToggleLogin}
                    type="button"
                    className="absolute top-4 left-4 sm:top-5 sm:left-5 flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors text-[11px] sm:text-xs font-bold z-20 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full border border-slate-200 cursor-pointer shadow-2xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Trở lại</span>
                  </button>

                  <div className="w-full max-w-[320px] sm:max-w-[330px] z-10 my-auto px-2 sm:px-3">
                    <div className="flex flex-col items-center text-center mb-3.5 sm:mb-4">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Chào mừng trở lại</h2>
                      <p className="text-slate-500 text-[11px] sm:text-xs font-medium mt-0.5">Đăng nhập để tiếp tục sử dụng HealthSense</p>
                    </div>

                    <form className="flex flex-col gap-2.5 sm:gap-3 w-full" onSubmit={handleLoginSubmit}>
                      {errorMessage && (
                        <div className="p-2.5 rounded-xl bg-red-50/95 border border-red-200 text-red-700 text-[11px] font-bold flex items-center gap-2 shadow-2xs animate-in fade-in zoom-in-95 duration-200">
                          <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span className="leading-normal flex-1">{errorMessage}</span>
                        </div>
                      )}

                      <div className="space-y-1">
                        <Label htmlFor="email" className="text-[11px] font-bold text-slate-700 ml-1">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            placeholder="name@example.com"
                            className="w-full pl-10 rounded-xl h-9 sm:h-10 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all text-xs font-semibold shadow-2xs hover:border-slate-300"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between ml-1 mr-1">
                          <Label htmlFor="password" className="text-[11px] font-bold text-slate-700">Mật khẩu</Label>
                          <Link to="/forgot-password" className="text-[11px] font-bold text-primary hover:underline transition-all cursor-pointer">
                            Quên mật khẩu? (Forgot)
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
                            className="w-full pl-10 rounded-xl h-9 sm:h-10 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all text-xs font-semibold shadow-2xs hover:border-slate-300"
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full rounded-xl h-9.5 sm:h-10 mt-1 sm:mt-1.5 text-xs font-black bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
                      >
                        {isSubmitting ? (
                          "Đang xác thực..."
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span>Đăng nhập</span>
                            <LogIn className="w-4 h-4" />
                          </div>
                        )}
                      </Button>
                    </form>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>

      <AIPipelineSection />
      <AIDatasetSection />
      <AIFeaturesSection />
      <AIBenchmarkSection />
      <AIClinicalSection />

      {/* Bottom Stats Section */}
      <footer className="relative z-10 w-full px-8 lg:px-16 pb-10 pt-10 bg-white/50 border-t border-slate-100 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 text-center md:text-left">

          <div className="flex flex-col gap-1 md:items-start items-center">
            <h4 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 font-heading">24/7</h4>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-slate-600 font-semibold mt-1">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Theo dõi liên tục không gián đoạn
            </div>
          </div>

          <div className="flex flex-col gap-1 md:items-start items-center">
            <h4 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 font-heading">100<span className="text-xl md:text-2xl text-slate-400 font-bold ml-1">ms</span></h4>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-slate-600 font-semibold mt-1">
              <span className="w-2 h-2 rounded-full bg-health-spo2" />
              Tốc độ truyền dẫn thời gian thực
            </div>
          </div>

          <div className="flex flex-col gap-1 md:items-start items-center">
            <h4 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 font-heading">1 Chạm</h4>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-slate-600 font-semibold mt-1">
              <span className="w-2 h-2 rounded-full bg-health-heart" />
              Kết nối chuyên gia y tế tức thì
            </div>
          </div>

        </div>
      </footer>

    </div>
  )
}

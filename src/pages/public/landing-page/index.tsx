import { HeartPulse, ArrowRight, Play, CheckCircle2 } from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useRef } from "react"

export default function LandingPage() {
  const [isPlaying, setIsPlaying] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
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
            <Link to="/login" className="text-white/90 hover:text-white transition-colors px-4 py-2">Đăng nhập</Link>
            <Link to="/register" className="bg-white text-primary hover:bg-slate-50 transition-colors px-6 py-2.5 rounded-full shadow-sm font-bold">
              Đăng ký
            </Link>
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
              <Link to="/register" className="bg-primary text-primary-foreground font-bold px-8 py-4 rounded-full hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 flex items-center gap-2">
                Bắt đầu Trải nghiệm
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Center Content (Video Mockup) */}
          <div className="col-span-1 lg:col-span-7 relative h-auto flex items-center justify-center order-1 lg:order-2 w-full max-w-[850px] mx-auto">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-10" />
            <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-health-heart/10 rounded-full blur-[80px] -z-10" />

            {/* Dark modern device mockup for the video */}
            <div
              className="relative w-full aspect-[16/9] bg-slate-900 rounded-[2.5rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.4)] p-4 overflow-hidden transform hover:-translate-y-2 transition-all duration-500 border-8 border-slate-800 ring-1 ring-black/10 cursor-pointer group"
              onClick={togglePlay}
            >
              {/* Play Button Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/10 group-hover:bg-slate-900/30 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl scale-90 group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </div>
                </div>
              )}

              {/* Video Element */}
              <div className="w-full h-full rounded-[1.5rem] overflow-hidden bg-white relative shadow-inner">
                <video
                  ref={videoRef}
                  src="/video/video_720.webm"
                  poster="/video/poster.png"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Floating Tags (Glassmorphism Light) */}
            <div className="absolute top-[15%] -left-[5%] z-20 animate-[bounce_4s_ease-in-out_infinite]">
              <div className="bg-white/90 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-xl border border-slate-100/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-health-heart/10 flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-health-heart" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">Cảnh báo AFib</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-[20%] -right-[5%] z-20 animate-[bounce_5s_ease-in-out_infinite_reverse]">
              <div className="bg-white/90 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-xl border border-slate-100/50 flex items-center gap-3">
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
          </div>
        </div>
      </main>

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

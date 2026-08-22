import { HeartPulse, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"

export function LandingFooter() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <footer className="w-full bg-[#070D1E] text-slate-300 relative overflow-hidden border-t border-white/10 pt-16 sm:pt-20 pb-12">
      
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-white/10">
          
          {/* Col 1: Brand & Mission (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
            <div>
              {/* Brand Logo */}
              <div className="inline-flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <HeartPulse className="w-5 h-5 animate-pulse" />
                </div>
                <span className="text-xl font-black font-heading tracking-tight text-white uppercase">
                  HEALTHSENSE
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm font-sans mb-4">
                Hệ sinh thái y tế AI tiên phong giám sát nhịp tim và nồng độ SpO2 liên tục 24/7 từ thiết bị đeo, nhận diện sớm Rung nhĩ (AFib) và bảo vệ trái tim của bạn.
              </p>
            </div>

            {/* System Status Indicator */}
            <div className="inline-flex items-center gap-2 text-xs text-slate-400 font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="w-2 h-2 -ml-4 rounded-full bg-emerald-500" />
              <span>Hệ thống AI hoạt động ổn định (99.99% Uptime)</span>
            </div>
          </div>

          {/* Col 2: Technology & Pipeline (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold font-heading uppercase text-white tracking-wider">
              Công Nghệ &amp; AI
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-sans text-slate-400">
              <li>
                <button 
                  onClick={() => scrollToSection("features")} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  16 Chỉ số biến thiên nhịp (HRV)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("pipeline")} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Mô hình Stacking Ensemble
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("benchmark")} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Kiểm chứng lâm sàng (Benchmark)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("benchmark")} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Trí tuệ nhân tạo minh bạch (XAI)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("benchmark")} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Cơ sở dữ liệu y tế MIMIC-III
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Company & Values (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold font-heading uppercase text-white tracking-wider">
              Về Chúng Tôi
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-sans text-slate-400">
              <li>
                <button 
                  onClick={() => scrollToSection("about")} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Câu chuyện HealthSense
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("about")} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Giá trị cốt lõi C.A.R.E
                </button>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Trang đăng nhập</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Chính sách bảo mật</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Điều khoản sử dụng</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Support (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold font-heading uppercase text-white tracking-wider">
              Liên Hệ &amp; Hỗ Trợ
            </h4>
            <div className="space-y-3 text-xs sm:text-sm font-sans text-slate-400">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <span>support@healthsense.vn</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <span>Hotline: 1900 8888 (24/7)</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <span>Khu Công nghệ Cao, TP. Hồ Chí Minh, Việt Nam</span>
              </div>
            </div>
          </div>

        </div>

        {/* Medical Disclaimer & Copyright Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 font-sans">
          <p className="text-[11px] leading-relaxed max-w-2xl text-center md:text-left text-slate-500">
            <strong>Tuyên bố miễn trừ y khoa:</strong> HealthSense là công cụ AI hỗ trợ theo dõi sức khỏe và cảnh báo sớm nguy cơ Rung nhĩ. Kết quả từ hệ thống mang tính tham khảo chuyên môn và không thay thế hoàn toàn chỉ định cấp cứu trực tiếp từ bác sĩ chuyên khoa tim mạch.
          </p>
          <div className="text-center md:text-right shrink-0 text-slate-400">
            © {new Date().getFullYear()} HealthSense. All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  )
}

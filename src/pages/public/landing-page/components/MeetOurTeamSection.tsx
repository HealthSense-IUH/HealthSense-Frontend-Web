import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"

type TeamMember = {
  id: number
  name: string
  role: string
  category: "ai" | "doctor" | "iot"
  avatar: string
  badge: string
  quote: string
  bio: string
  achievements: string[]
  gradient: string
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Phạm Ngọc Hùng",
    role: "Lead AI & Biosignal Architect",
    category: "ai",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    badge: "Trưởng nhóm Nghiên cứu AI",
    quote: "Mỗi nhịp tim là một câu chuyện sinh học. Chúng mình ứng dụng mô hình học máy Stacking và giải mã 16 đặc trưng HRV để biến thiết bị đeo thành lá chắn bảo vệ nhịp đập 24/7.",
    bio: "Nghiên cứu sinh chuyên sâu về AI trong xử lý tín hiệu y sinh, phát triển thuật toán phân loại Rung nhĩ (AFib) dựa trên kho dữ liệu MIMIC-III với độ chuẩn xác 98.65%.",
    achievements: ["Mô hình Stacking 98.65%", "16 Chỉ số HRV thời gian thực", "XAI Minh bạch"],
    gradient: "from-[#1D4ED8] via-[#1E40AF] to-[#0F172A]"
  },
  {
    id: 2,
    name: "TS. BS. Trần Minh Tuấn",
    role: "Cố vấn Y khoa Tim mạch Lâm sàng",
    category: "doctor",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
    badge: "Chuyên gia Tim mạch 18+ năm",
    quote: "Cơn Rung nhĩ (AFib) thường diễn ra âm thầm không triệu chứng. Phát hiện sớm từ xa bằng AI chính là chìa khóa vàng giúp ngăn ngừa hơn 80% biến chứng đột quỵ nguy hiểm.",
    bio: "Tiến sĩ Bác sĩ chuyên khoa Tim mạch và Can thiệp mạch máu, giảng viên bộ môn Tim mạch, đồng hành thẩm định các chuẩn mực chẩn đoán y khoa của HealthSense.",
    achievements: ["Hội đồng Tim mạch VN", "Cố vấn Lâm sàng MIMIC", "Bảo chứng Y khoa"],
    gradient: "from-[#0284C7] via-[#0369A1] to-[#0F172A]"
  },
  {
    id: 3,
    name: "ThS. BS. Nguyễn Thị Mai",
    role: "Trưởng bộ phận Telehealth & Bác sĩ 24/7",
    category: "doctor",
    avatar: "https://images.unsplash.com/photo-1594824813589-a78b4081c7e9?w=400&auto=format&fit=crop&q=80",
    badge: "Bác sĩ Chuyên khoa Tim mạch",
    quote: "Chúng tôi xây dựng cầu nối liền mạch giữa dữ liệu thiết bị đeo và phòng khám, giúp người bệnh nhận được lời khuyên chuyên môn ngay khi trái tim phát tín hiệu bất thường.",
    bio: "Thạc sĩ Bác sĩ Tim mạch, chuyên gia tư vấn từ xa (Telemedicine), dẫn dắt mạng lưới bác sĩ sẵn sàng hỗ trợ trực tuyến 1 chạm cho người dùng HealthSense.",
    achievements: ["Tư vấn Telehealth 24/7", "Phân tích ECG chuyên sâu", "Chăm sóc chủ động"],
    gradient: "from-[#0D9488] via-[#0F766E] to-[#0F172A]"
  },
  {
    id: 4,
    name: "Kỹ sư Lê Hoàng Nam",
    role: "Chuyên gia Tín hiệu IoT & Cảm biến Y tế",
    category: "iot",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    badge: "Kỹ sư Hệ thống Nhúng",
    quote: "Lọc sạch nhiễu rung lắc khi người dùng vận động để giữ lại từng đỉnh sóng R-peak chuẩn xác trong dưới 100ms là tiêu chuẩn kỹ thuật khắt khe nhất của HealthSense.",
    bio: "Kỹ sư phần cứng và thuật toán DSP (Digital Signal Processing), tối ưu hóa bộ lọc Butterworth và đường truyền Bluetooth Low Energy (BLE) trên smartwatch.",
    achievements: ["Độ trễ < 100ms", "Lọc nhiễu Butterworth", "Tương thích đa thiết bị"],
    gradient: "from-[#4F46E5] via-[#4338CA] to-[#0F172A]"
  },
]

export function MeetOurTeamSection() {
  const [activeIdx, setActiveIdx] = useState(0)
  const currentMember = teamMembers[activeIdx]

  const nextMember = () => {
    setActiveIdx((prev) => (prev + 1) % teamMembers.length)
  }

  const prevMember = () => {
    setActiveIdx((prev) => (prev - 1 + teamMembers.length) % teamMembers.length)
  }

  return (
    <section className="w-full py-24 sm:py-32 relative overflow-hidden bg-white text-slate-900 border-t border-slate-200/80">
      
      {/* Background Graphic Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-sky-500/10 via-blue-500/5 to-transparent rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/10 via-sky-500/5 to-transparent rounded-full blur-[100px] pointer-events-none" />

      {/* Abstract Ribbon Wave SVG */}
      <svg 
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.06] pointer-events-none select-none" 
        viewBox="0 0 500 500" 
        fill="none" 
        aria-hidden="true"
      >
        <path 
          d="M 500 100 C 350 150 250 300 150 250 C 50 200 0 350 0 500 L 500 500 Z" 
          fill="#1D4ED8" 
        />
        <path 
          d="M 500 200 C 400 220 300 400 200 350 C 100 300 0 450 0 500 L 500 500 Z" 
          fill="#0284C7" 
        />
      </svg>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        
        {/* ================= SECTION HEADER: MEET OUR TEAM ================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 sm:mb-20">
          <div>
            {/* Giant Stacked Title */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-[0.95] text-blue-700 uppercase">
              MEET OUR <br />
              <span className="text-slate-900">TEAM &amp; EXPERTS</span>
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 max-w-md font-sans leading-relaxed">
            Sự kết hợp liên ngành giữa các chuyên gia Trí tuệ Nhân tạo y sinh và các Bác sĩ Tim mạch đầu ngành vì một mục tiêu chung: Bảo vệ từng nhịp đập của bạn.
          </p>
        </div>

        {/* ================= MAIN FEATURED MEMBER SHOWCASE ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-stretch mb-12">
          
          {/* Left Column: Featured Member Card with Gradient Background */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMember.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br ${currentMember.gradient} text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[420px]`}
              >
                {/* Abstract Glass Flare */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                
                <div>
                  {/* Category Indicator */}
                  <span className="text-xs font-mono font-bold tracking-widest text-sky-300 uppercase block mb-3">
                    {currentMember.badge}
                  </span>

                  {/* Member Name */}
                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight mb-2 text-white">
                    {currentMember.name}
                  </h3>
                  
                  {/* Role */}
                  <p className="text-xs sm:text-sm font-bold font-heading text-sky-200/90 mb-6 uppercase tracking-wider">
                    {currentMember.role}
                  </p>

                  {/* Quote with quote icon */}
                  <div className="relative pl-6 border-l-2 border-sky-400/50 mb-6">
                    <Quote className="w-5 h-5 text-sky-400/40 absolute -left-2.5 -top-1 fill-sky-400/20" />
                    <p className="text-sm sm:text-base text-sky-50/95 italic leading-relaxed font-sans font-normal">
                      &ldquo;{currentMember.quote}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Bottom Bio & Achievements */}
                <div className="pt-6 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="text-xs text-sky-100/70 font-sans max-w-lg leading-relaxed">
                    {currentMember.bio}
                  </p>

                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    {currentMember.achievements.map((ach) => (
                      <span 
                        key={ach}
                        className="text-[10px] font-semibold font-heading px-2.5 py-1 rounded-lg bg-white/10 text-white border border-white/15"
                      >
                        {ach}
                      </span>
                    ))}
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Member Selector List + Navigation Controls */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4">
            
            <div className="space-y-3">
              {teamMembers.map((member, idx) => {
                const isActive = idx === activeIdx
                return (
                  <button
                    key={member.id}
                    onClick={() => setActiveIdx(idx)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 cursor-pointer border ${
                      isActive 
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-950/20 scale-[1.02]" 
                        : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80"
                    }`}
                  >
                    {/* Member Thumbnail */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-heading font-black text-sm shrink-0 border ${
                      isActive 
                        ? "bg-white/20 border-white/30 text-white" 
                        : "bg-white border-slate-200 text-slate-800 shadow-xs"
                    }`}>
                      0{idx + 1}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <span className={`text-sm font-black font-heading truncate ${isActive ? "text-white" : "text-slate-900"}`}>
                        {member.name}
                      </span>
                      <span className={`text-xs truncate ${isActive ? "text-sky-200 font-medium" : "text-slate-500"}`}>
                        {member.role}
                      </span>
                    </div>

                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-sky-300 shrink-0 animate-ping" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-2 px-1">
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 font-bold">
                <span>0{activeIdx + 1}</span>
                <span>/</span>
                <span>0{teamMembers.length}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={prevMember}
                  aria-label="Previous member"
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextMember}
                  aria-label="Next member"
                  className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-md shadow-blue-950/20"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}

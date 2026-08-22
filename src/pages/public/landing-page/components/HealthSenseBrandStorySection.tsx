import { motion } from "framer-motion"
import { HeartPulse, ArrowDown } from "lucide-react"

const coreValues = [
  {
    letter: "C",
    enTitle: "Continuous",
    viTitle: "Giám sát 24/7",
    desc: "Đồng bộ không dây liên tục dữ liệu nhịp tim và SpO2 từng giây qua smartwatch mà không làm gián đoạn sinh hoạt.",
    letterColor: "text-cyan-400",
  },
  {
    letter: "A",
    enTitle: "Accuracy",
    viTitle: "Chuẩn xác 98.65%",
    desc: "Mô hình học máy Stacking Ensemble phân tích 16 chỉ số biến thiên nhịp tim (HRV) đạt độ tin cậy chuẩn y tế.",
    letterColor: "text-teal-300",
  },
  {
    letter: "R",
    enTitle: "Real-time",
    viTitle: "Cảnh báo tức thì",
    desc: "Phản xạ nhanh dưới 100ms phát hiện sớm cơn Rung nhĩ (AFib) và nguy cơ đột quỵ trước khi có triệu chứng.",
    letterColor: "text-sky-400",
  },
  {
    letter: "E",
    enTitle: "Expert Care",
    viTitle: "Bác sĩ đồng hành",
    desc: "Kết nối trực tuyến 1 chạm với đội ngũ bác sĩ chuyên khoa tim mạch và tự động chia sẻ hồ sơ điện tim an toàn.",
    letterColor: "text-blue-400",
  },
]

export function HealthSenseBrandStorySection() {
  return (
    <section className="w-full relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#0369A1] to-[#0A0D1A] text-white py-20 sm:py-28">
      
      {/* Abstract Graphic Background Shapes & Lighting */}
      <div className="absolute top-0 right-0 w-[650px] h-[650px] bg-gradient-to-bl from-sky-500/25 via-cyan-600/15 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/20 via-indigo-700/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
      
      {/* Subtle Angular Overlay Shards */}
      <div className="absolute -top-12 right-1/4 w-96 h-96 border border-white/10 rounded-[3rem] rotate-12 bg-white/[0.02] backdrop-blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-10 w-80 h-80 border border-white/10 rounded-[2.5rem] -rotate-12 bg-white/[0.015] pointer-events-none" />

      {/* Mini ECG Pulse Line Watermark */}
      <svg className="absolute inset-0 w-full h-full stroke-white/[0.04] fill-none pointer-events-none" viewBox="0 0 1000 600">
        <path d="M 0 300 L 200 300 L 240 220 L 270 380 L 300 300 L 500 300 L 540 180 L 580 420 L 620 300 L 1000 300" strokeWidth="2" />
      </svg>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        
        {/* ================= TOP SECTION: WHAT'S HEALTHSENSE ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-end mb-16 sm:mb-24">
          
          {/* Left Column: Brand Logo + Giant 3D Layered Title */}
          <div className="lg:col-span-7 flex flex-col">
            
            {/* Brand Pill Logo */}
            <div className="inline-flex items-center gap-2 mb-6 sm:mb-8">
              <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white backdrop-blur-md shadow-sm">
                <HeartPulse className="w-5 h-5 text-cyan-300" />
              </div>
              <span className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white uppercase">
                HEALTHSENSE
              </span>
            </div>

            {/* Giant Stacked Typographic Headline (Exact Reference Styling) */}
            <div className="relative select-none">
              
              {/* Layer 1: Giant WHAT'S */}
              <div className="relative">
                {/* 3D Offset Shadow */}
                <span className="text-6xl sm:text-8xl lg:text-[104px] font-black font-heading tracking-tighter leading-[0.9] text-blue-950/70 absolute top-1.5 left-1.5 uppercase -z-10">
                  WHAT&apos;S
                </span>
                <h2 className="text-6xl sm:text-8xl lg:text-[104px] font-black font-heading tracking-tighter leading-[0.9] text-white uppercase drop-shadow-md">
                  WHAT&apos;S
                </h2>
              </div>

              {/* Layer 2: Giant HEALTHSENSE */}
              <div className="relative mt-1 sm:mt-2">
                {/* 3D Offset Shadow */}
                <span className="text-5xl sm:text-7xl lg:text-[92px] font-black font-heading tracking-tighter leading-[0.9] text-blue-950/70 absolute top-1.5 left-1.5 uppercase -z-10">
                  HEALTHSENSE
                </span>
                <h2 className="text-5xl sm:text-7xl lg:text-[92px] font-black font-heading tracking-tighter leading-[0.9] text-white uppercase drop-shadow-md">
                  HEALTHSENSE
                </h2>
              </div>

            </div>

          </div>

          {/* Right Column: Mission Paragraph + Action Circle Button */}
          <div className="lg:col-span-5 flex items-end justify-between gap-6 pt-4 lg:pt-0">
            <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed max-w-md font-sans">
              HealthSense được phát triển với tinh thần tiên phong và tư duy đột phá của y tế số. Chúng mình tin rằng mỗi người đều xứng đáng sở hữu giải pháp AI cá nhân hóa để theo dõi nhịp tim và bảo vệ sức khỏe tim mạch chủ động mỗi ngày.
            </p>

            {/* Circular Arrow Badge */}
            <button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
              }}
              aria-label="Scroll to features section"
              className="w-12 h-12 rounded-full bg-sky-600/80 hover:bg-sky-500 border border-sky-400/30 text-white flex items-center justify-center shadow-lg shadow-sky-950/40 shrink-0 hover:scale-110 active:scale-95 transition-all cursor-pointer group"
            >
              <ArrowDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>

        </div>

        {/* ================= MIDDLE SECTION: OUR STORY (2 COLUMNS) ================= */}
        <div className="border-t border-white/15 pt-12 sm:pt-16 mb-20 sm:mb-28">
          
          {/* Subheading: Our story */}
          <motion.h3 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-white mb-8 italic"
          >
            Our story
          </motion.h3>

          {/* Two Editorial Narrative Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-14 text-xs sm:text-sm text-sky-100/80 leading-relaxed font-sans">
            
            {/* Story Column 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <p>
                Xuất phát từ thực tế đáng lo ngại khi hàng triệu người bệnh đối mặt với các cơn Rung nhĩ (AFib) và loạn nhịp diễn ra hoàn toàn âm thầm, không có triệu chứng rõ ràng cho đến khi biến chứng đột quỵ xảy ra.
              </p>
              <p>
                Chúng mình đã xây dựng HealthSense với mong muốn xóa bỏ khoảng cách giữa bệnh nhân và chăm sóc tim mạch chuyên sâu, biến chiếc đồng hồ đeo tay thông thường thành một phòng điện tim 24/7 luôn túc trực bên bạn.
              </p>
            </motion.div>

            {/* Story Column 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <p>
                Được bảo chứng bởi mô hình học máy Stacking Ensemble đạt độ chính xác 98.65% trên cơ sở dữ liệu y khoa chuẩn hóa, HealthSense liên tục phân tích 16 chỉ số biến thiên nhịp tim (HRV) theo thời gian thực.
              </p>
              <p>
                Chúng mình tin rằng sự an tâm của bạn chính là thước đo thành công lớn nhất. HealthSense sẽ luôn là người bạn đồng hành tin cậy, lắng nghe và bảo vệ từng nhịp đập của bạn trên mọi hành trình.
              </p>
            </motion.div>

          </div>

        </div>

        {/* ================= BOTTOM SECTION: NEXT CORE VALUE STAIRCASE ================= */}
        <div className="border-t border-white/15 pt-12 sm:pt-16">
          
          {/* Header of Core Value */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 sm:mb-16">
            <div>
              <h3 className="text-2xl sm:text-4xl font-black font-heading tracking-tight text-white uppercase">
                C.A.R.E Core Values
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-sky-100/70 max-w-md font-sans">
              4 tiêu chí cốt lõi định hình nên sứ mệnh bảo vệ và chăm sóc sức khỏe tim mạch của HealthSense.
            </p>
          </div>

          {/* 4 Core Value Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {coreValues.map((val, idx) => (
              <motion.div
                key={val.letter}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative group flex flex-col"
              >
                {/* Giant Stylized Letter (Completely above card, 100% visible) */}
                <div className="mb-3 select-none flex items-baseline justify-between px-1">
                  <span className={`text-6xl sm:text-7xl lg:text-8xl font-black font-heading italic tracking-tighter leading-none transition-colors duration-300 drop-shadow-md ${val.letterColor}`}>
                    {val.letter}
                  </span>
                  <span className="text-xs font-mono text-white/40 font-bold">0{idx + 1}</span>
                </div>

                {/* Translucent Frosted Glass Card Attached Cleanly Below */}
                <div className="relative flex-1 p-5 sm:p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/40 hover:bg-white/[0.14] transition-all duration-300 group-hover:-translate-y-1 shadow-xl shadow-black/25 flex flex-col justify-between">
                  
                  <div>
                    {/* Top Keyword */}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base sm:text-lg font-black font-heading text-white">
                        {val.enTitle}
                      </span>
                    </div>

                    {/* Vietnamese Title Text */}
                    <span className="text-xs font-bold font-heading text-cyan-300 block mb-3">
                      {val.viTitle}
                    </span>

                    {/* Description Copy */}
                    <p className="text-xs text-sky-100/85 leading-relaxed font-sans">
                      {val.desc}
                    </p>
                  </div>

                  {/* Subtle Bottom Accent Indicator */}
                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="w-8 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-transparent group-hover:w-14 transition-all duration-300" />
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all" />
                  </div>

                </div>

              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  )
}



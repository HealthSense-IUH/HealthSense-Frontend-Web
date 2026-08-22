import { useState } from "react"
import { motion } from "framer-motion"
import { 
  HeartPulse, 
  Waves, 
  Zap, 
  Sliders, 
  CheckCircle2,
  ChevronRight
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface DomainPillar {
  id: string
  step: string
  title: string
  subtitle: string
  tagline: string
  accentColor: string
  borderColor: string
  desc: string
  keyStats: string[]
  visualType: "ecg-time" | "frequency-spectrum" | "poincare-scatter"
  technicalFeatures: { name: string; desc: string; formula: string; unit: string }[]
}

const domainPillars: DomainPillar[] = [
  {
    id: "time-domain",
    step: "01 / MIỀN THỜI GIAN",
    title: "BIẾN THIÊN TỨC THỜI",
    subtitle: "Time-Domain Analysis (8 Chỉ số)",
    tagline: "Đo đạc chính xác từng khoảng cách sóng R",
    accentColor: "from-blue-600 to-sky-600",
    borderColor: "border-blue-600 bg-blue-600",
    desc: "AI quét liên tục từng nhịp đập qua thuật toán lọc đỉnh Pan-Tompkins. Các chỉ số RMSSD và pNN50 phản ánh tức thời phản xạ phó giao cảm và cảnh báo nhịp chậm/nhịp nhanh bất thường.",
    keyStats: ["RMSSD nhạy > 50ms", "8 Đặc trưng thời gian thực", "Khung trượt 30 giây"],
    visualType: "ecg-time",
    technicalFeatures: [
      { name: "HR_mean", desc: "Nhịp tim trung bình trong khung cửa sổ quan sát", formula: "60 / Mean(RR)", unit: "BPM" },
      { name: "Mean_NN", desc: "Khoảng thời gian trung bình giữa 2 nhịp bình thường", formula: "1/N * Σ(RR_i)", unit: "ms" },
      { name: "SDNN", desc: "Độ lệch chuẩn khoảng NN, biểu thị dung lượng thần kinh tim", formula: "std(RR)", unit: "ms" },
      { name: "RMSSD", desc: "Căn bậc hai trung bình bình phương sai số các nhịp kề (Chỉ số Vàng)", formula: "sqrt(1/(N-1) * Σ(ΔRR_i)^2)", unit: "ms" },
      { name: "NN50", desc: "Số lượng các cặp nhịp chênh lệch > 50ms", formula: "Count(|ΔRR| > 50ms)", unit: "Lần" },
      { name: "pNN50", desc: "Tỷ lệ phần trăm các cặp nhịp chênh lệch > 50ms", formula: "(NN50 / Total_NN) * 100", unit: "%" },
      { name: "CV_NN", desc: "Hệ số biến thiên phân tán chuẩn hóa", formula: "SDNN / Mean_NN", unit: "Ratio" }
    ]
  },
  {
    id: "frequency-domain",
    step: "02 / MIỀN TẦN SỐ",
    title: "CÂN BẰNG THẦN KINH",
    subtitle: "Frequency-Domain FFT (6 Chỉ số)",
    tagline: "Phân tách phổ sóng năng lượng tim mạch",
    accentColor: "from-sky-600 to-blue-700",
    borderColor: "border-sky-600 bg-sky-600",
    desc: "Nội suy chuỗi RR 4Hz và phân tích mật độ phổ Welch PSD. Tỷ lệ LF/HF làm rõ sự cân bằng giữa thần kinh giao cảm (áp lực, co mạch) và phó giao cảm (thư giãn, hồi phục).",
    keyStats: ["LF: 0.04 - 0.15 Hz", "HF: 0.15 - 0.40 Hz", "Tỷ số cân bằng LF/HF"],
    visualType: "frequency-spectrum",
    technicalFeatures: [
      { name: "LF", desc: "Công suất dải tần số thấp (Hoạt động giao cảm & vận mạch)", formula: "∫(0.04-0.15Hz) PSD df", unit: "ms²" },
      { name: "HF", desc: "Công suất dải tần số cao (Phó giao cảm & hô hấp RSA)", formula: "∫(0.15-0.40Hz) PSD df", unit: "ms²" },
      { name: "LF_norm", desc: "Công suất LF chuẩn hóa theo tổng năng lượng khả dụng", formula: "LF / (Total - VLF) * 100", unit: "n.u." },
      { name: "HF_norm", desc: "Công suất HF chuẩn hóa phản ánh hoạt động dây X", formula: "HF / (Total - VLF) * 100", unit: "n.u." },
      { name: "LF/HF Ratio", desc: "Tỷ lệ cân bằng giao cảm / phó giao cảm kinh điển", formula: "LF_Power / HF_Power", unit: "Ratio" },
      { name: "Total_Power", desc: "Tổng năng lượng sinh học toàn dải tần số", formula: "∫(0-0.40Hz) PSD df", unit: "ms²" }
    ]
  },
  {
    id: "nonlinear-domain",
    step: "03 / PHI TUYẾN TÍNH",
    title: "ĐỊNH DANH RUNG NHĨ",
    subtitle: "Non-Linear Poincaré & SampEn (3 Chỉ số)",
    tagline: "Nhận diện tính hỗn loạn và bất định của tim",
    accentColor: "from-cyan-600 to-teal-700",
    borderColor: "border-cyan-600 bg-cyan-600",
    desc: "Sử dụng đồ thị phân tán Poincaré (SD1/SD2) và Entropy mẫu (SampEn). Khi xảy ra Rung Nhĩ (AFib), nhịp tim mất tính chu kỳ làm SampEn tăng vọt — đây là chìa khóa phát hiện bệnh sớm.",
    keyStats: ["Entropy Mẫu (SampEn)", "Đồ thị Poincaré SD1/SD2", "Độ chính xác 98.65%"],
    visualType: "poincare-scatter",
    technicalFeatures: [
      { name: "SD1", desc: "Bán kính trục ngắn Poincaré: Biến thiên tức thời nhịp kề", formula: "sqrt(1/2 * Var(ΔRR))", unit: "ms" },
      { name: "SD2", desc: "Bán kính trục dài Poincaré: Biến thiên tổng thể dài hạn", formula: "sqrt(2*Var(RR) - 1/2*Var(ΔRR))", unit: "ms" },
      { name: "SampEn", desc: "Entropy Mẫu đo lường tính bất định và hỗn loạn nhịp (Chỉ số Vàng)", formula: "-ln(A / B) [m=2, r=0.2*SDNN]", unit: "Entropy" }
    ]
  }
]

export function AIFeaturesSection() {
  const [selectedDomain, setSelectedDomain] = useState<DomainPillar | null>(null)

  return (
    <section className="w-full py-24 sm:py-32 relative bg-transparent text-slate-900 overflow-hidden">
      
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-sky-400/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-cyan-400/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 text-slate-900 font-heading tracking-tight uppercase"
          >
            16 Đặc Trưng Sinh Học Cốt Lõi
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed font-sans"
          >
            Quy trình phân rã sóng điện tim thành 3 trụ cột toán học sinh học cốt lõi giúp AI chẩn đoán chính xác nguy cơ tim mạch.
          </motion.p>
        </div>

        {/* ================= EDITORIAL OFFSET CONNECTED JOURNEY ================= */}
        <div className="relative space-y-24 sm:space-y-32">

          {/* SVG Connecting Flow Lines between milestone cards (Desktop) */}
          <svg className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" aria-hidden="true">
            {/* Smooth Curve from Card 1 (bottom left) to Card 2 (top right) */}
            <path 
              d="M 380 260 C 380 420, 680 340, 680 500" 
              fill="none" 
              stroke="#0284c7" 
              strokeWidth="3" 
              strokeDasharray="6 6"
              className="opacity-60"
            />
            {/* Smooth Curve from Card 2 (bottom right) to Card 3 (top left) */}
            <path 
              d="M 680 720 C 680 880, 380 800, 380 960" 
              fill="none" 
              stroke="#0284c7" 
              strokeWidth="3" 
              strokeDasharray="6 6"
              className="opacity-60"
            />
          </svg>

          {domainPillars.map((pillar, index) => {
            const isEven = index % 2 === 1

            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-14 relative z-10 ${
                  isEven ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Visual Offset Frame (NEXT Guideline Signature Style) */}
                <div className="w-full lg:w-1/2 flex justify-center">
                  <div className="relative w-full max-w-[480px]">
                    
                    {/* Blue / Accent Offset Background Shadow Layer */}
                    <div 
                      className={`absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 w-full h-full rounded-[2rem] sm:rounded-[2.4rem] -z-10 ${
                        index === 0 ? "bg-blue-600" : index === 1 ? "bg-sky-600" : "bg-cyan-600"
                      }`} 
                    />

                    {/* Main Clean Card Surface */}
                    <div className="bg-slate-100 rounded-[2rem] sm:rounded-[2.4rem] border-2 border-slate-200/90 p-5 sm:p-7 shadow-lg overflow-hidden relative">
                      
                      {/* Connection Pin Node (Dot with ring) */}
                      <div className={`absolute top-5 ${isEven ? "left-5" : "right-5"} z-20`}>
                        <div className="w-5 h-5 rounded-full bg-sky-600 border-2 border-white shadow-md ring-4 ring-sky-100 flex items-center justify-center animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                      </div>

                      {/* Header in visual */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[11px] font-black tracking-widest text-sky-700 font-heading uppercase">
                          {pillar.step}
                        </span>
                      </div>

                      {/* Visual Graphic Representation */}
                      <div className="w-full aspect-[16/10] bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between shadow-inner relative overflow-hidden">
                        
                        {/* Visual 1: ECG Waveform */}
                        {pillar.visualType === "ecg-time" && (
                          <div className="w-full h-full flex flex-col justify-between">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                              <span className="flex items-center gap-1.5 text-sky-600">
                                <HeartPulse className="w-4 h-4" /> Sóng ECG Liên Tục
                              </span>
                              <span className="font-mono bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md font-bold">
                                RMSSD: 42.8 ms
                              </span>
                            </div>

                            {/* Animated Mini ECG wave SVG */}
                            <svg className="w-full h-24 stroke-sky-600 fill-none my-auto" viewBox="0 0 320 80">
                              <path 
                                d="M 0 40 L 40 40 L 50 30 L 60 50 L 70 40 L 90 40 L 100 10 L 115 75 L 125 40 L 150 40 L 160 30 L 170 50 L 180 40 L 200 40 L 210 10 L 225 75 L 235 40 L 260 40 L 270 30 L 280 50 L 320 40" 
                                strokeWidth="2.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                              />
                            </svg>

                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-100">
                              <span>Khoảng RR: 820ms</span>
                              <span className="text-emerald-600 font-bold">✓ Nhịp xoang đều</span>
                            </div>
                          </div>
                        )}

                        {/* Visual 2: Frequency Power Spectrum */}
                        {pillar.visualType === "frequency-spectrum" && (
                          <div className="w-full h-full flex flex-col justify-between">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                              <span className="flex items-center gap-1.5 text-sky-600">
                                <Waves className="w-4 h-4" /> Phổ Năng Lượng FFT
                              </span>
                              <span className="font-mono bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md font-bold">
                                LF/HF = 1.45
                              </span>
                            </div>

                            {/* Frequency Bars Graphic */}
                            <div className="flex items-end justify-center gap-3 h-24 my-auto px-4">
                              <div className="flex flex-col items-center gap-1">
                                <div className="w-10 bg-amber-500 rounded-t-lg h-14 shadow-sm" />
                                <span className="text-[10px] font-bold text-slate-600 font-heading">LF</span>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <div className="w-10 bg-sky-500 rounded-t-lg h-20 shadow-sm" />
                                <span className="text-[10px] font-bold text-slate-600 font-heading">HF</span>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <div className="w-10 bg-indigo-400 rounded-t-lg h-8 shadow-sm opacity-60" />
                                <span className="text-[10px] font-bold text-slate-400 font-heading">VLF</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-100">
                              <span>Dải: 0.04 - 0.40 Hz</span>
                              <span className="text-sky-600 font-bold">✓ Cân bằng Giao cảm</span>
                            </div>
                          </div>
                        )}

                        {/* Visual 3: Poincaré Plot Scatter */}
                        {pillar.visualType === "poincare-scatter" && (
                          <div className="w-full h-full flex flex-col justify-between">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                              <span className="flex items-center gap-1.5 text-cyan-600">
                                <Zap className="w-4 h-4" /> Đồ thị Poincaré (SD1/SD2)
                              </span>
                              <span className="font-mono bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-md font-bold">
                                SampEn: 1.18
                              </span>
                            </div>

                            {/* Poincaré Ellipse Scatter Graphic */}
                            <div className="relative w-full h-24 my-auto flex items-center justify-center">
                              {/* 45-degree axis */}
                              <div className="absolute w-36 h-[1.5px] bg-slate-200 rotate-45" />
                              {/* Ellipse */}
                              <div className="w-28 h-14 rounded-[50%] border-2 border-dashed border-cyan-500 rotate-45 flex items-center justify-center bg-cyan-50/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-600" />
                              </div>
                              {/* Scatter dots */}
                              <div className="absolute top-4 left-24 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                              <div className="absolute bottom-4 right-24 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                              <div className="absolute top-8 right-20 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-100">
                              <span>SD1: Ngắn hạn | SD2: Dài hạn</span>
                              <span className="text-cyan-600 font-bold">✓ Phát hiện Rung nhĩ</span>
                            </div>
                          </div>
                        )}

                      </div>

                    </div>
                  </div>
                </div>

                {/* Right / Left Text Information Column */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center">
                  
                  {/* Step Number Tag */}
                  <span className="text-xs font-black tracking-widest text-sky-700 font-heading uppercase mb-2">
                    {pillar.step}
                  </span>

                  {/* Big Bold Headline (NEXT Guideline Style) */}
                  <h3 className="text-3xl sm:text-4xl lg:text-[42px] font-black leading-[1.1] text-slate-900 font-heading uppercase mb-3">
                    {pillar.title}
                  </h3>

                  <p className="text-sm font-semibold text-slate-500 mb-4">
                    {pillar.subtitle} — <span className="text-slate-800">{pillar.tagline}</span>
                  </p>

                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-sans">
                    {pillar.desc}
                  </p>

                  {/* Key Stats Pills */}
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    {pillar.keyStats.map((stat) => (
                      <span 
                        key={stat}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white border border-slate-200/90 text-slate-800 shadow-2xs font-heading"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                        <span>{stat}</span>
                      </span>
                    ))}
                  </div>

                  {/* Detail Modal Trigger */}
                  <div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          onClick={() => setSelectedDomain(pillar)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all cursor-pointer font-heading group"
                        >
                          <Sliders className="w-4 h-4 text-sky-600" />
                          <span>Xem chi tiết danh sách {pillar.technicalFeatures.length} công thức</span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </DialogTrigger>

                      {selectedDomain && (
                        <DialogContent className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl">
                          <DialogHeader className="mb-4">
                            <DialogTitle className="text-2xl font-black font-heading text-slate-900 uppercase">
                              {selectedDomain.title} — {selectedDomain.subtitle}
                            </DialogTitle>
                          </DialogHeader>

                          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                            {selectedDomain.technicalFeatures.map((feat) => (
                              <div 
                                key={feat.name} 
                                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-4"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/60">
                                      {feat.name}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-700">
                                      {feat.desc}
                                    </span>
                                  </div>
                                  <p className="text-[11px] font-mono text-slate-500 mt-1.5 pl-0.5">
                                    Công thức: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800 font-semibold">{feat.formula}</code>
                                  </p>
                                </div>
                                <span className="text-[11px] font-mono font-bold text-slate-500 shrink-0 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
                                  {feat.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                  </div>

                </div>
              </motion.div>
            )
          })}

        </div>

      </div>
    </section>
  )
}


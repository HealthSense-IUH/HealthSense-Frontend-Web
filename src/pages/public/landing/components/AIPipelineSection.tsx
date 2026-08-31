import { useState } from "react"
import { motion } from "framer-motion"
import { 
  HeartPulse, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  ShieldCheck,
  Zap,
  Sliders
} from "lucide-react"

type StageId = "stage-1" | "stage-2" | "stage-3"

interface PipelineStageData {
  id: StageId
  stepNum: string
  title: string
  subtitle: string
  tagline: string
  summary: string
  bulletPoints: string[]
  specs: { label: string; value: string }[]
}

const stagesData: Record<StageId, PipelineStageData> = {
  "stage-1": {
    id: "stage-1",
    stepNum: "1",
    title: "Làm Sạch Tín Hiệu Nhịp Tim",
    subtitle: "Lọc bỏ tạp âm & bắt nhịp tim chuẩn",
    tagline: "Tự động loại bỏ rung lắc khi cử động tay để giữ lại nhịp đập chính xác nhất",
    summary: "Khi bạn đi bộ, chạy bộ hay cử động tay, tín hiệu từ cảm biến đeo có thể bị rung lắc làm mờ nhịp đập. Hệ thống sẽ tự động lọc sạch các tạp âm này, giữ lại từng nhịp tim rõ nét theo thời gian thực.",
    bulletPoints: [
      "Cảm biến đo liên tục 125 lần mỗi giây",
      "Tự động khử rung lắc và tạp âm khi bạn vận động",
      "Nhận diện chính xác từng nhịp đập của tim",
      "Đo khoảng cách chuẩn xác giữa các nhịp liên tiếp"
    ],
    specs: [
      { label: "Tốc độ đo", value: "125 lần / giây" },
      { label: "Khử nhiễu rung lắc", value: "Tự động 100%" },
      { label: "Thời gian xử lý", value: "< 12 mili-giây" },
      { label: "Độ chính xác bắt nhịp", value: "99.98%" }
    ]
  },
  "stage-2": {
    id: "stage-2",
    stepNum: "2",
    title: "Phân Tích 16 Chỉ Số Sức Khỏe",
    subtitle: "Đo lường độ đều đặn & sức khỏe tim",
    tagline: "Phân tích khoảng cách giữa các nhịp đập thành 16 chỉ số sức khỏe chuyên sâu",
    summary: "Trái tim khỏe mạnh luôn có độ biến thiên linh hoạt. AI phân tích 16 chỉ số biến thiên nhịp tim (HRV) giúp nhận biết sớm tình trạng tim đập không đều, căng thẳng hoặc quá tải trước khi bạn kịp cảm thấy mệt mỏi.",
    bulletPoints: [
      "Đo độ đều đặn của nhịp tim (nhịp nhanh, chậm hay ngắt quãng)",
      "Đánh giá mức độ đồng bộ giữa nhịp tim và hơi thở",
      "Phát hiện các cơn rối loạn nhịp tim ngầm khó nhận biết",
      "Đồng bộ toàn bộ chỉ số về thang đo chuẩn để phân tích"
    ],
    specs: [
      { label: "Chỉ số phân tích", value: "16 Chỉ số tim mạch" },
      { label: "Khả năng bao quát", value: "Toàn diện nhịp tim" },
      { label: "Đồng bộ dữ liệu", value: "Tự động tức thì" },
      { label: "Thời gian tính toán", value: "< 24 mili-giây" }
    ]
  },
  "stage-3": {
    id: "stage-3",
    stepNum: "3",
    title: "Đưa Ra Đánh Giá & Cảnh Báo",
    subtitle: "Nhận diện và cảnh báo sớm Rung nhĩ (AFib)",
    tagline: "Kết hợp 4 mô hình AI cùng phân tích chéo để đưa ra kết luận chính xác và an tâm",
    summary: "Thay vì chỉ dựa vào một thuật toán duy nhất, HealthSense kết hợp 4 mô hình trí tuệ nhân tạo cùng đánh giá chéo dữ liệu. Nhờ đó, hệ thống nhận diện chính xác đến 98.65% nguy cơ Rung nhĩ (AFib) và gửi cảnh báo tức thì đến bạn.",
    bulletPoints: [
      "4 mô hình AI cùng phân tích độc lập để tránh kết luận sai",
      "Tự động chọn lọc phương án có độ tin cậy cao nhất",
      "Độ nhạy phát hiện bệnh 99.78% (hạn chế tối đa bỏ sót ca bệnh)",
      "Đưa ra cảnh báo siêu nhanh dưới 85 mili-giây"
    ],
    specs: [
      { label: "Cơ chế phân tích", value: "4 AI phân tích chéo" },
      { label: "Độ chính xác", value: "98.65%" },
      { label: "Độ nhạy bắt bệnh", value: "99.78%" },
      { label: "Tốc độ cảnh báo", value: "< 85 mili-giây" }
    ]
  }
}

export function AIPipelineSection() {
  const [activeStage, setActiveStage] = useState<StageId>("stage-1")
  const [isNoiseSimulated, setIsNoiseSimulated] = useState(false)
  const [simulatedSample, setSimulatedSample] = useState<"normal" | "afib">("normal")

  const current = stagesData[activeStage]

  return (
    <section className="w-full py-24 sm:py-32 relative bg-[#070D1E] text-white overflow-hidden border-t border-white/10">
      
      {/* Premium Deep Dark Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-blue-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[400px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ================= SECTION HEADER ================= */}
        <div className="text-center mb-14 sm:mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-bold font-heading mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Quy Trình Hoạt Động Thông Minh</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 text-white font-heading tracking-tight uppercase">
            Cách AI Phân Tích Nhịp Tim Của Bạn
          </h2>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-sans">
            Hệ thống tự động thực hiện 3 bước liên tục để bảo vệ và theo dõi sức khỏe trái tim bạn suốt 24/7.
          </p>
        </div>

        {/* ================= 3-STAGE STEPER TABS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {(["stage-1", "stage-2", "stage-3"] as StageId[]).map((stageKey) => {
            const item = stagesData[stageKey]
            const isActive = activeStage === stageKey

            return (
              <button
                key={item.id}
                onClick={() => setActiveStage(stageKey)}
                className={`relative text-left p-5 sm:p-6 rounded-3xl transition-all duration-300 cursor-pointer border flex flex-col justify-between overflow-hidden ${
                  isActive 
                    ? "bg-white/[0.12] border-sky-400/80 shadow-2xl shadow-sky-950/60 backdrop-blur-xl scale-[1.02] ring-2 ring-sky-400/30" 
                    : "bg-white/[0.04] border-white/10 hover:bg-white/[0.07] text-slate-300"
                }`}
              >
                {/* Active Top Glow Line */}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabGlow"
                    className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400" 
                  />
                )}

                <div className="flex items-center justify-between mb-3 mt-1">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    isActive ? "bg-sky-500/20 text-sky-300 border border-sky-500/40" : "bg-white/10 text-slate-400"
                  }`}>
                    Bước 0{item.stepNum}
                  </span>
                  
                  <div className={`w-3 h-3 rounded-full ${isActive ? "bg-sky-400 ring-4 ring-sky-500/20 animate-pulse" : "bg-white/20"}`} />
                </div>

                <div>
                  <h3 className={`text-base sm:text-lg font-black font-heading leading-snug mb-1.5 ${
                    isActive ? "text-white" : "text-slate-200"
                  }`}>
                    {item.title}
                  </h3>
                  <span className="text-xs text-slate-400 font-sans line-clamp-2 leading-relaxed">
                    {item.subtitle}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* ================= STAGE CONTENT & SMART HEALTH MONITOR ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column (5 Cols): Stage Explanation Card */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-white/[0.05] border border-white/15 backdrop-blur-xl shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-bold mb-4 font-heading">
                <span>Bước 0{current.stepNum}</span>
                <span>•</span>
                <span>Chi tiết quy trình</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black font-heading text-white mb-2">
                {current.title}
              </h3>
              
              <p className="text-xs sm:text-sm font-bold text-sky-400 mb-4 font-heading">
                {current.tagline}
              </p>

              <p className="text-sm text-slate-300 leading-relaxed font-sans mb-6">
                {current.summary}
              </p>

              {/* Bullet Points */}
              <div className="space-y-3 mb-8">
                {current.bulletPoints.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Spec Mini Cards */}
            <div className="grid grid-cols-2 gap-3 pt-5 border-t border-white/10">
              {current.specs.map((spec) => (
                <div key={spec.label} className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-[11px] text-slate-400 block mb-0.5 font-medium">{spec.label}</span>
                  <span className="text-xs sm:text-sm font-black font-heading text-white">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (7 Cols): Smart Health Monitor Visual Card */}
          <div className="lg:col-span-7 flex flex-col rounded-3xl bg-slate-950/90 border border-white/15 shadow-2xl overflow-hidden backdrop-blur-xl">
            
            {/* Monitor Header */}
            <div className="p-4 sm:p-5 bg-white/[0.04] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-sky-600/30">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black font-heading text-white">
                    Mô phỏng trực quan theo thời gian thực
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium font-sans">
                    Dữ liệu phân tích nhịp tim mẫu
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="w-2 h-2 -ml-3.5 rounded-full bg-emerald-400" />
                <span>Hoạt động 24/7</span>
              </div>
            </div>

            {/* Monitor Body */}
            <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between bg-gradient-to-b from-slate-950 to-slate-900/90 min-h-[380px]">
              
              <div className="flex-1 flex flex-col justify-between">
                
                {/* STAGE 1 VISUALIZER: ECG WAVEFORM */}
                {activeStage === "stage-1" && (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-sky-400" />
                        <span className="text-xs sm:text-sm font-bold font-heading text-white">
                          Sóng nhịp tim thu nhận từ thiết bị đeo
                        </span>
                      </div>

                      {/* Noise Toggle Button */}
                      <button
                        onClick={() => setIsNoiseSimulated(!isNoiseSimulated)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs font-heading ${
                          isNoiseSimulated 
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30" 
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{isNoiseSimulated ? "Đang có rung lắc cử động" : "Đã lọc sạch tín hiệu chuẩn"}</span>
                      </button>
                    </div>

                    {/* ECG Monitor Screen (Clean Medical Style) */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/10 relative overflow-hidden shadow-inner">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-2">
                        <span className="flex items-center gap-1.5">
                          <HeartPulse className="w-3.5 h-3.5 animate-pulse" />
                          Nhịp tim: 74 BPM
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal font-sans">Độ trễ: 12ms</span>
                      </div>

                      {/* SVG Wave */}
                      <svg className="w-full h-32 stroke-sky-400 fill-none" viewBox="0 0 400 100">
                        {/* Grid lines */}
                        <line x1="0" y1="50" x2="400" y2="50" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
                        
                        {/* ECG Wave: Clean vs Noisy */}
                        {isNoiseSimulated ? (
                          <path 
                            d="M 0 50 Q 15 40 30 52 Q 40 65 50 48 L 65 50 L 72 38 L 78 75 L 85 15 L 94 90 L 102 50 L 120 54 Q 135 30 150 56 Q 165 70 180 46 L 195 50 L 202 34 L 208 78 L 215 12 L 224 88 L 232 50 L 250 52 Q 265 35 280 58 Q 295 68 310 44 L 325 50 L 332 36 L 338 76 L 345 14 L 354 92 L 362 50 L 400 50" 
                            stroke="#38bdf8" 
                            strokeWidth="2.5" 
                          />
                        ) : (
                          <path 
                            d="M 0 50 L 40 50 L 50 42 L 58 58 L 66 50 L 85 50 L 95 15 L 108 85 L 118 50 L 155 50 L 165 42 L 173 58 L 181 50 L 200 50 L 210 15 L 223 85 L 233 50 L 270 50 L 280 42 L 288 58 L 296 50 L 315 50 L 325 15 L 338 85 L 348 50 L 400 50" 
                            stroke="#34d399" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                          />
                        )}

                        {/* Detected Peaks */}
                        {!isNoiseSimulated && (
                          <>
                            <circle cx="95" cy="15" r="4" fill="#34d399" />
                            <circle cx="210" cy="15" r="4" fill="#34d399" />
                            <circle cx="325" cy="15" r="4" fill="#34d399" />
                          </>
                        )}
                      </svg>

                      <div className="flex items-center justify-between text-xs text-slate-300 mt-2 pt-2 border-t border-white/10 font-sans">
                        <span>{isNoiseSimulated ? "⚠️ Đang lọc bỏ rung lắc cử động" : "🟢 Sóng nhịp tim ổn định và chuẩn xác"}</span>
                        <span className="text-slate-400">Định vị từng nhịp</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 2 VISUALIZER: 16 HRV HEALTH BARS */}
                {activeStage === "stage-2" && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-sky-400" />
                        <span className="text-xs sm:text-sm font-bold font-heading text-white">
                          16 Chỉ số biến thiên nhịp tim (HRV)
                        </span>
                      </div>
                      <span className="text-xs font-bold text-sky-300 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-800">
                        Thang đo chuẩn hóa
                      </span>
                    </div>

                    {/* 8 Featured Metric Bars */}
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 p-4 sm:p-5 rounded-2xl bg-black/50 border border-white/10">
                      {[
                        { name: "Độ lệch nhịp", val: "+0.84", h: "84%", col: "bg-sky-400" },
                        { name: "Độ biến thiên", val: "+0.62", h: "62%", col: "bg-sky-400" },
                        { name: "Nhịp ngắt", val: "-0.45", h: "45%", col: "bg-blue-400" },
                        { name: "Nhịp TB", val: "+0.78", h: "78%", col: "bg-blue-400" },
                        { name: "Tần số thấp", val: "+0.91", h: "91%", col: "bg-indigo-400" },
                        { name: "Tần số cao", val: "+0.53", h: "53%", col: "bg-indigo-400" },
                        { name: "Tỷ số thở", val: "+0.68", h: "68%", col: "bg-cyan-400" },
                        { name: "Độ ổn định", val: "+0.88", h: "88%", col: "bg-emerald-400" },
                      ].map((feat) => (
                        <div key={feat.name} className="flex flex-col items-center gap-1.5">
                          <div className="w-full h-24 bg-slate-900 rounded-xl flex items-end p-1 overflow-hidden border border-white/5">
                            <div 
                              className={`w-full ${feat.col} rounded-lg transition-all duration-500 shadow-xs`} 
                              style={{ height: feat.h }} 
                            />
                          </div>
                          <span className="text-[10px] font-bold text-white truncate text-center w-full">{feat.name}</span>
                          <span className="text-[9px] text-slate-400 font-sans">{feat.val}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-800/50 text-xs text-sky-200 font-sans flex items-center justify-between">
                      <span>✓ 16 chỉ số sức khỏe đã sẵn sàng để AI phân tích</span>
                      <span className="font-bold text-sky-300">Đã đồng bộ</span>
                    </div>
                  </div>
                )}

                {/* STAGE 3 VISUALIZER: MULTI-AI EVALUATION */}
                {activeStage === "stage-3" && (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold font-heading text-white">
                        4 Mô hình AI cùng phân tích chéo
                      </span>

                      {/* Sample Selector Buttons */}
                      <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-full border border-white/10">
                        <button
                          onClick={() => setSimulatedSample("normal")}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer font-heading ${
                            simulatedSample === "normal" 
                              ? "bg-emerald-600 text-white shadow-xs" 
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          Mẫu: Bình thường
                        </button>
                        <button
                          onClick={() => setSimulatedSample("afib")}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer font-heading ${
                            simulatedSample === "afib" 
                              ? "bg-rose-600 text-white shadow-xs" 
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          Mẫu: Loạn nhịp (AFib)
                        </button>
                      </div>
                    </div>

                    {/* 4 AI Model Mini Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { name: "Kiểm tra độ đều nhịp", conf: simulatedSample === "normal" ? "98.9% Ổn định" : "99.4% Loạn nhịp", border: "border-sky-500/40" },
                        { name: "Kiểm tra tần số tim", conf: simulatedSample === "normal" ? "97.8% Ổn định" : "98.7% Loạn nhịp", border: "border-blue-500/40" },
                        { name: "Kiểm tra cơn ngắt quãng", conf: simulatedSample === "normal" ? "99.1% Ổn định" : "99.2% Loạn nhịp", border: "border-indigo-500/40" },
                        { name: "Đánh giá dạng sóng", conf: simulatedSample === "normal" ? "98.5% Ổn định" : "98.9% Loạn nhịp", border: "border-cyan-500/40" },
                      ].map((model) => (
                        <div key={model.name} className={`p-3 rounded-2xl bg-black/50 border ${model.border} text-center`}>
                          <span className="text-[11px] text-slate-400 font-sans block truncate">{model.name}</span>
                          <span className="text-xs font-black font-heading text-white block mt-1">{model.conf}</span>
                        </div>
                      ))}
                    </div>

                    {/* Final Smart Assessment Card */}
                    <div className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-300 ${
                      simulatedSample === "normal" 
                        ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-200" 
                        : "bg-rose-950/50 border-rose-500/40 text-rose-200"
                    }`}>
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          simulatedSample === "normal" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}>
                          {simulatedSample === "normal" ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-400 block font-heading">KẾT QUẢ ĐÁNH GIÁ TỔNG HỢP (&lt; 85ms)</span>
                          <span className="text-sm sm:text-base font-black font-heading block mt-0.5 text-white">
                            {simulatedSample === "normal" ? "Nhịp tim bình thường, ổn định" : "Cảnh báo: Phát hiện dấu hiệu Rung nhĩ (AFib)"}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/10 text-white border border-white/15 whitespace-nowrap font-heading">
                        Độ chính xác: 98.65%
                      </span>
                    </div>
                  </div>
                )}

                {/* Card Bottom Note */}
                <div className="flex items-center justify-between pt-5 mt-4 border-t border-white/10 text-xs text-slate-400 font-sans">
                  <span>Đang xem: {current.title}</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Đã kiểm chứng trên dữ liệu y tế MIMIC-III
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  )
}

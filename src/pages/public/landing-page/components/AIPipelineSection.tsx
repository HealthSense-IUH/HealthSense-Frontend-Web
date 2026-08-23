import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Filter, 
  ActivitySquare, 
  CheckCircle2, 
  Zap, 
  AlertTriangle, 
  Activity 
} from "lucide-react"

type StageId = "stage-1" | "stage-2" | "stage-3"

interface PipelineStageData {
  id: StageId
  stepNum: string
  title: string
  enTitle: string
  tagline: string
  color: string
  glowColor: string
  badgeBg: string
  summary: string
  bulletPoints: string[]
  specs: { label: string; value: string }[]
}

const stagesData: Record<StageId, PipelineStageData> = {
  "stage-1": {
    id: "stage-1",
    stepNum: "01",
    title: "Thu Thập & Làm Sạch Tín Hiệu",
    enTitle: "Lọc bỏ tạp âm & bắt nhịp tim chuẩn",
    tagline: "Tự động loại bỏ rung lắc khi cử động tay để giữ lại nhịp đập chính xác",
    color: "text-sky-500",
    glowColor: "from-sky-500/20 to-blue-600/10",
    badgeBg: "bg-sky-50 border-sky-200 text-sky-700",
    summary: "Khi bạn vận động hoặc di chuyển, cảm biến đo từ thiết bị đeo có thể bị rung lắc làm tín hiệu bị nhiễu. Hệ thống sẽ tự động lọc sạch các tạp âm này, giữ lại từng nhịp tim rõ nét và chuẩn xác theo thời gian thực.",
    bulletPoints: [
      "Đo liên tục 125 lần mỗi giây từ cảm biến đeo tay",
      "Tự động lọc sạch tạp âm do cử động và rung lắc",
      "Xác định chuẩn xác từng nhịp đập với sai số cực nhỏ",
      "Đo khoảng thời gian chính xác giữa các nhịp tim liên tiếp"
    ],
    specs: [
      { label: "Tần số đo nhịp", value: "125 lần / giây" },
      { label: "Khử nhiễu cử động", value: "Tự động 100%" },
      { label: "Thời gian xử lý", value: "< 12 ms" },
      { label: "Độ chuẩn xác nhịp", value: "99.98%" }
    ]
  },
  "stage-2": {
    id: "stage-2",
    stepNum: "02",
    title: "Phân Tích 16 Chỉ Số Biến Thiên (HRV)",
    enTitle: "Đo lường độ đều đặn & sức khỏe tim",
    tagline: "Phân tích khoảng cách giữa các nhịp đập thành 16 chỉ số chuyên sâu",
    color: "text-sky-500",
    glowColor: "from-sky-500/20 to-blue-600/10",
    badgeBg: "bg-sky-50 border-sky-200 text-sky-700",
    summary: "Trái tim khỏe mạnh luôn có độ biến thiên linh hoạt. AI phân tích 16 chỉ số biến thiên nhịp tim (HRV) giúp phát hiện sớm các dấu hiệu loạn nhịp, căng thẳng hoặc quá tải tim trước khi bạn kịp cảm thấy mệt mỏi.",
    bulletPoints: [
      "Đo độ đều đặn của nhịp tim (nhịp nhanh, chậm hay ngắt quãng)",
      "Đánh giá mức độ đồng bộ giữa hơi thở và nhịp tim",
      "Nhận diện các cơn loạn nhịp ngầm khó nhận biết bằng mắt thường",
      "Quy chuẩn toàn bộ chỉ số về thang đo đồng bộ để AI phân tích"
    ],
    specs: [
      { label: "Chỉ số sức khỏe", value: "16 Chỉ số chuyên sâu" },
      { label: "Khả năng bao quát", value: "Toàn diện nhịp tim" },
      { label: "Chuẩn hóa dữ liệu", value: "Đồng bộ tự động" },
      { label: "Thời gian tính toán", value: "< 24 ms" }
    ]
  },
  "stage-3": {
    id: "stage-3",
    stepNum: "03",
    title: "Đưa Ra Kết Quả & Cảnh Báo Sớm",
    enTitle: "Nhận diện và cảnh báo Rung nhĩ (AFib)",
    tagline: "Kết hợp 4 mô hình AI cùng phân tích chéo để đưa ra cảnh báo chính xác",
    color: "text-emerald-500",
    glowColor: "from-emerald-500/20 to-teal-600/10",
    badgeBg: "bg-emerald-50 border-emerald-200 text-emerald-700",
    summary: "Thay vì chỉ dựa vào một thuật toán duy nhất, HealthSense kết hợp 4 mô hình trí tuệ nhân tạo cùng phân tích chéo dữ liệu. Nhờ đó, hệ thống nhận diện chính xác đến 98.65% nguy cơ Rung nhĩ (AFib) và gửi cảnh báo tức thì đến bạn.",
    bulletPoints: [
      "4 mô hình AI cùng làm việc độc lập để tránh kết luận sai",
      "Tự động chọn lọc phương án có độ tin cậy và chính xác cao nhất",
      "Độ nhạy phát hiện bệnh 99.78% (hạn chế tối đa bỏ sót ca bệnh)",
      "Đưa ra kết quả cảnh báo siêu nhanh dưới 85 mili-giây"
    ],
    specs: [
      { label: "Cơ chế phân tích", value: "4 Mô hình AI phân tích chéo" },
      { label: "Độ chính xác", value: "98.65%" },
      { label: "Khả năng bắt bệnh", value: "99.78%" },
      { label: "Tốc độ cảnh báo", value: "< 85 ms" }
    ]
  }
}

export function AIPipelineSection() {
  const [activeStage, setActiveStage] = useState<StageId>("stage-1")
  const [isNoiseSimulated, setIsNoiseSimulated] = useState(false)
  const [simulatedSample, setSimulatedSample] = useState<"normal" | "afib">("normal")

  const current = stagesData[activeStage]

  return (
    <section className="w-full py-24 sm:py-32 relative bg-slate-900 text-white overflow-hidden">
      
      {/* High-Tech Background Grid & Ambient Lighting */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-sky-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[400px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ================= SECTION HEADER ================= */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 text-white font-heading tracking-tight uppercase">
            Quy Trình Phân Tích &amp; Dự Đoán Của AI
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-sans">
            Khám phá 3 bước đơn giản từ lúc thiết bị đo nhịp tim đến khi đưa ra cảnh báo sức khỏe chính xác cho bạn.
          </p>
        </div>

        {/* ================= 3-STAGE INTERACTIVE STEPPER TABS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
          {(["stage-1", "stage-2", "stage-3"] as StageId[]).map((stageKey) => {
            const item = stagesData[stageKey]
            const isActive = activeStage === stageKey

            return (
              <button
                key={item.id}
                onClick={() => setActiveStage(stageKey)}
                className={`relative text-left p-4 sm:p-5 rounded-2xl transition-all duration-300 cursor-pointer border flex flex-col justify-between overflow-hidden ${
                  isActive 
                    ? "bg-white/10 border-white/30 shadow-xl shadow-sky-950/40 backdrop-blur-xl scale-[1.01]" 
                    : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] text-slate-400"
                }`}
              >
                {/* Active Top Accent Line */}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabLine"
                    className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500" 
                  />
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-mono font-black ${isActive ? "text-sky-400" : "text-slate-500"}`}>
                    BƯỚC 0{item.stepNum}
                  </span>
                  
                  <div className={`w-2.5 h-2.5 rounded-full ${isActive ? "bg-sky-400 animate-ping" : "bg-white/20"}`} />
                </div>

                <div>
                  <h3 className={`text-sm sm:text-base font-black font-heading leading-snug mb-1 ${isActive ? "text-white" : "text-slate-300"}`}>
                    {item.title}
                  </h3>
                  <span className="text-[11px] text-slate-400 line-clamp-1 block">
                    {item.enTitle}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* ================= STAGE WORKBENCH CONSOLE ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column (5 Cols): Stage Deep-Dive Details */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-mono mb-4">
                <span>Bước 0{current.stepNum}</span>
                <span>•</span>
                <span>Quy trình xử lý</span>
              </div>

              <h3 className="text-2xl font-black font-heading text-white mb-2">
                {current.title}
              </h3>
              
              <p className="text-xs sm:text-sm font-medium text-sky-400 mb-4">
                {current.tagline}
              </p>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans mb-6">
                {current.summary}
              </p>

              {/* Bullet Points */}
              <div className="space-y-2.5 mb-6">
                {current.bulletPoints.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Spec Mini Cards */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
              {current.specs.map((spec, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 block mb-0.5">{spec.label}</span>
                  <span className="text-xs font-black font-heading text-white">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (7 Cols): Interactive Simulation Console */}
          <div className="lg:col-span-7 flex flex-col rounded-3xl bg-slate-950 border border-white/15 overflow-hidden shadow-2xl">
            
            {/* Workbench Top Bar */}
            <div className="p-4 bg-slate-900/90 border-b border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-slate-400 ml-2 font-bold">
                  Mô phỏng trực quan theo thời gian thực
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold font-heading">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>Trực quan hóa</span>
              </div>
            </div>

            {/* Workbench Body: Live Interactive Simulation */}
            <div className="flex-1 p-6 flex flex-col justify-between bg-gradient-to-b from-slate-950 to-slate-900/60 min-h-[380px]">
              
              <div className="flex-1 flex flex-col justify-between">
                
                {/* STAGE 1 SIMULATION: ECG FILTERING & NOISE TOGGLE */}
                {activeStage === "stage-1" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-sky-400" />
                        <span className="text-xs font-bold font-heading text-white">
                          Mô phỏng sóng nhịp tim từ thiết bị (125 lần/giây)
                        </span>
                      </div>

                      {/* Noise Simulation Toggle Button */}
                      <button
                        onClick={() => setIsNoiseSimulated(!isNoiseSimulated)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold font-heading border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isNoiseSimulated 
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40" 
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{isNoiseSimulated ? "Đang có tạp âm do cử động" : "Đã lọc sạch tín hiệu"}</span>
                      </button>
                    </div>

                    {/* Animated ECG Waveform Screen */}
                    <div className="p-4 rounded-2xl bg-black/60 border border-white/10 relative overflow-hidden">
                      <div className="absolute top-2 right-3 text-[10px] font-mono text-emerald-400">
                        Nhịp tim: 74 BPM | Độ trễ: 12ms
                      </div>

                      <svg className="w-full h-32 stroke-sky-500 fill-none" viewBox="0 0 400 100">
                        {/* Baseline */}
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
                            stroke="#10b981" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                          />
                        )}

                        {/* Detected R-Peaks */}
                        {!isNoiseSimulated && (
                          <>
                            <circle cx="95" cy="15" r="4" fill="#10b981" />
                            <circle cx="210" cy="15" r="4" fill="#10b981" />
                            <circle cx="325" cy="15" r="4" fill="#10b981" />
                          </>
                        )}
                      </svg>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 pt-2 border-t border-white/10">
                        <span>Trạng thái: {isNoiseSimulated ? "⚠️ Tín hiệu bị rung lắc" : "🟢 Sóng tim ổn định, rõ nét"}</span>
                        <span>Định vị: Từng nhịp đập</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 2 SIMULATION: 16-D FEATURE MATRIX BARS */}
                {activeStage === "stage-2" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ActivitySquare className="w-4 h-4 text-sky-400" />
                        <span className="text-xs font-bold font-heading text-white">
                          16 Chỉ số biến thiên nhịp tim (HRV)
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800">
                        Thang đo chuẩn: [-1.0, 1.0]
                      </span>
                    </div>

                    {/* 16 Matrix Bars Grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-4 rounded-2xl bg-black/60 border border-white/10">
                      {[
                        { name: "Độ lệch nhịp", val: "+0.84", h: "84%", col: "bg-sky-400" },
                        { name: "Biến thiên", val: "+0.62", h: "62%", col: "bg-sky-400" },
                        { name: "Nhịp ngắt", val: "-0.45", h: "45%", col: "bg-sky-400" },
                        { name: "Nhịp TB", val: "+0.78", h: "78%", col: "bg-sky-400" },
                        { name: "Tần số thấp", val: "+0.91", h: "91%", col: "bg-blue-500" },
                        { name: "Tần số cao", val: "+0.53", h: "53%", col: "bg-blue-500" },
                        { name: "Tỷ số hô hấp", val: "+0.68", h: "68%", col: "bg-blue-500" },
                        { name: "Độ bất quy tắc", val: "+0.88", h: "88%", col: "bg-indigo-400" },
                      ].map((feat, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5">
                          <div className="w-full h-24 bg-slate-900 rounded-lg flex items-end p-1 border border-white/5">
                            <div className={`w-full ${feat.col} rounded-sm transition-all duration-500`} style={{ height: feat.h }} />
                          </div>
                          <span className="text-[9px] font-medium text-white truncate text-center w-full">{feat.name}</span>
                          <span className="text-[8px] font-mono text-slate-400">{feat.val}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/40 text-xs text-slate-300 font-sans flex items-center justify-between">
                      <span>✓ Các chỉ số sức khỏe đã sẵn sàng để AI phân tích</span>
                      <span className="font-mono text-sky-400 font-bold">16 Chỉ số • Đã đồng bộ</span>
                    </div>
                  </div>
                )}

                {/* STAGE 3 SIMULATION: STACKING AI LIVE INFERENCE */}
                {activeStage === "stage-3" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-heading text-white">
                        4 Mô hình AI cùng phân tích chéo
                      </span>

                      {/* Sample Switcher */}
                      <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-white/10">
                        <button
                          onClick={() => setSimulatedSample("normal")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                            simulatedSample === "normal" ? "bg-emerald-600 text-white font-bold" : "text-slate-400"
                          }`}
                        >
                          Mẫu: Nhịp tim bình thường
                        </button>
                        <button
                          onClick={() => setSimulatedSample("afib")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                            simulatedSample === "afib" ? "bg-rose-600 text-white font-bold" : "text-slate-400"
                          }`}
                        >
                          Mẫu: Rung Nhĩ (AFib)
                        </button>
                      </div>
                    </div>

                    {/* 4 Base Models Decision Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { name: "Mô hình 1 (XGBoost)", conf: simulatedSample === "normal" ? "98.9% Bình thường" : "99.4% Loạn nhịp", color: "border-sky-500/40" },
                        { name: "Mô hình 2 (Random Forest)", conf: simulatedSample === "normal" ? "97.8% Bình thường" : "98.7% Loạn nhịp", color: "border-blue-500/40" },
                        { name: "Mô hình 3 (SVM)", conf: simulatedSample === "normal" ? "99.1% Bình thường" : "99.2% Loạn nhịp", color: "border-indigo-500/40" },
                        { name: "Mô hình 4 (Neural Net)", conf: simulatedSample === "normal" ? "98.5% Bình thường" : "98.9% Loạn nhịp", color: "border-cyan-500/40" },
                      ].map((model, idx) => (
                        <div key={idx} className={`p-3 rounded-xl bg-black/60 border ${model.color} text-center`}>
                          <span className="text-[10px] text-slate-400 block truncate">{model.name}</span>
                          <span className="text-xs font-bold font-heading text-white block mt-0.5">{model.conf}</span>
                        </div>
                      ))}
                    </div>

                    {/* Meta Learner Final Decision Card */}
                    <div className={`p-4 rounded-xl border flex items-center justify-between ${
                      simulatedSample === "normal" 
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300" 
                        : "bg-rose-950/40 border-rose-500/40 text-rose-300"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                          simulatedSample === "normal" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                        }`}>
                          {simulatedSample === "normal" ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        </div>
                        <div>
                          <span className="text-xs font-mono text-slate-400 block">KẾT QUẢ TỔNG HỢP TỨC THÌ (&lt; 85ms)</span>
                          <span className="text-sm font-black font-heading text-white">
                            {simulatedSample === "normal" ? "Nhịp tim bình thường, ổn định" : "Cảnh báo: Phát hiện dấu hiệu Rung nhĩ (AFib)"}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-white/10 text-white">
                        Độ chính xác: 98.65%
                      </span>
                    </div>
                  </div>
                )}

                {/* Stage Bottom Interactive Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-slate-400 font-sans">
                  <span>Đang xem: {current.title}</span>
                  <span className="text-emerald-400">✓ Đã kiểm nghiệm trên dữ liệu y tế MIMIC-III</span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  )
}

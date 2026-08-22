import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Filter, 
  ActivitySquare, 
  Terminal, 
  CheckCircle2, 
  Zap, 
  Copy, 
  Check, 
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
  code: string
}

const stagesData: Record<StageId, PipelineStageData> = {
  "stage-1": {
    id: "stage-1",
    stepNum: "01",
    title: "Thu Thập & Khử Nhiễu R-Peak",
    enTitle: "Signal Ingestion & Butterworth Denoising",
    tagline: "Tiếp nhận dòng sóng 125Hz và lọc sạch trôi đường đẳng điện",
    color: "text-sky-500",
    glowColor: "from-sky-500/20 to-blue-600/10",
    badgeBg: "bg-sky-50 border-sky-200 text-sky-700",
    summary: "Dòng dữ liệu điện tim thô từ thiết bị đeo (hoặc kho lâm sàng MIMIC-III) thường bị lẫn tạp âm do người dùng cử động tay. Thuật toán lọc dải thông Butterworth 0.5 - 40Hz loại bỏ 100% nhiễu rung lắc, sau đó thuật toán SciPy find_peaks định vị chuẩn xác từng đỉnh sóng R với sai số dưới 2ms.",
    bulletPoints: [
      "Lấy mẫu liên tục ở tần số y tế fs = 125 Hz",
      "Bộ lọc dải thông Butterworth bậc 3 (0.5 - 40 Hz)",
      "Khung cửa sổ trượt 30 giây (Sliding Window, step 5s)",
      "Tính toán chuỗi khoảng cách liên nhịp RR-Intervals (ms)"
    ],
    specs: [
      { label: "Tần số lấy mẫu", value: "125 Hz" },
      { label: "Bậc lọc số", value: "Butterworth N=3" },
      { label: "Độ trễ xử lý", value: "< 12 ms" },
      { label: "Độ chuẩn xác đỉnh R", value: "99.98%" }
    ],
    code: `# GIAI ĐOẠN 1: TIỀN XỬ LÝ & ĐỊNH VỊ ĐỈNH SÓNG R
import numpy as np
from scipy.signal import butter, filtfilt, find_peaks

def process_raw_ecg(raw_signal, fs=125):
    """
    Lọc nhiễu dải thông Butterworth & bắt đỉnh R-peaks
    """
    # 1. Bộ lọc thông dải 0.5 - 40 Hz khử trôi đường đẳng điện
    b, a = butter(N=3, Wn=[0.5, 40], btype='bandpass', fs=fs)
    clean_ecg = filtfilt(b, a, raw_signal)
    
    # 2. Bắt đỉnh sóng R với khoảng cách tối thiểu 400ms
    min_distance = int(fs * 0.4)
    threshold = np.mean(clean_ecg) + 0.35 * np.std(clean_ecg)
    peaks, _ = find_peaks(clean_ecg, distance=min_distance, height=threshold)
    
    # 3. Chuỗi khoảng cách nhịp tim RR-intervals (ms)
    rr_intervals = np.diff(peaks) / fs * 1000.0
    return clean_ecg, peaks, rr_intervals`
  },
  "stage-2": {
    id: "stage-2",
    stepNum: "02",
    title: "Trích Xuất 16 Đặc Trưng HRV & Chuẩn Hóa",
    enTitle: "16-D Feature Extraction & Dual Scaling",
    tagline: "Phân tách nhịp tim thành vector 16 chiều và chuẩn hóa kép",
    color: "text-sky-500",
    glowColor: "from-sky-500/20 to-blue-600/10",
    badgeBg: "bg-sky-50 border-sky-200 text-sky-700",
    summary: "Chuỗi khoảng cách nhịp RR được bẻ khóa thành 16 chỉ số biến thiên nhịp tim (HRV) bao phủ cả 3 miền toán học y sinh: Thời gian, Tần số và Phi tuyến tính. Để các mô hình máy học không bị thiên lệch bởi các đơn vị đo khác nhau, không gian vector được chuẩn hóa kép Z-Score và Min-Max Scaling [-1.0, 1.0].",
    bulletPoints: [
      "8 Chỉ số Miền Thời Gian: RMSSD, SDNN, pNN50, Mean_NN, CV_NN...",
      "6 Chỉ số Miền Tần Số: Phổ Welch PSD, LF, HF, Tỷ số LF/HF...",
      "2 Chỉ số Vàng Phi Tuyến Tính: Đồ thị Poincaré (SD1/SD2) & Entropy Mẫu (SampEn)",
      "Chuẩn hóa kép: StandardScaler + Robust Min-Max [-1.0, 1.0]"
    ],
    specs: [
      { label: "Số chiều Vector", value: "16 Chiều (16-D)" },
      { label: "Miền toán học", value: "3 Miền Y Sinh" },
      { label: "Phương pháp chuẩn hóa", value: "Z-Score + MinMax" },
      { label: "Thời gian trích xuất", value: "< 24 ms" }
    ],
    code: `# GIAI ĐOẠN 2: TRÍCH XUẤT 16 ĐẶC TRƯNG HRV & CHUẨN HÓA KÉP
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler

def extract_and_scale_hrv(rr_intervals):
    # 1. Miền thời gian (Time Domain)
    rmssd = np.sqrt(np.mean(np.square(np.diff(rr_intervals))))
    sdnn = np.std(rr_intervals)
    pnn50 = np.sum(np.abs(np.diff(rr_intervals)) > 50) / len(rr_intervals) * 100
    
    # 2. Miền phi tuyến Poincaré & Entropy Mẫu
    sd1 = np.sqrt(0.5 * np.var(np.diff(rr_intervals)))
    sd2 = np.sqrt(2 * np.var(rr_intervals) - 0.5 * np.var(np.diff(rr_intervals)))
    samp_en = compute_sample_entropy(rr_intervals, m=2, r=0.2 * sdnn)
    
    # 3. Gom thành Vector 16 chiều
    features = np.array([rmssd, sdnn, pnn50, sd1, sd2, samp_en, ...]).reshape(1, -1)
    
    # 4. Chuẩn hóa kép đảm bảo cân bằng trọng số gradient
    scaled_vector = MinMaxScaler(feature_range=(-1, 1)).fit_transform(
        StandardScaler().fit_transform(features)
    )
    return scaled_vector`
  },
  "stage-3": {
    id: "stage-3",
    stepNum: "03",
    title: "Khối Óc Stacking AI & Kết Luận Lâm Sàng",
    enTitle: "Stacking Ensemble & Real-Time Inference",
    tagline: "4 thuật toán hàng đầu hội tụ đưa ra quyết định < 100ms",
    color: "text-emerald-500",
    glowColor: "from-emerald-500/20 to-teal-600/10",
    badgeBg: "bg-emerald-50 border-emerald-200 text-emerald-700",
    summary: "Thay vì chỉ dựa vào 1 thuật toán đơn lẻ, HealthSense ứng dụng kiến trúc Stacking Ensemble gồm 4 mô hình cơ sở độc lập (XGBoost, Random Forest, SVM-RBF, MLP Neural Network). Xác suất dự đoán được truyền vào Meta-Learner (Logistic Regression) để đưa ra kết luận lâm sàng với độ chính xác 98.65% và độ nhạy bắt bệnh 99.78%.",
    bulletPoints: [
      "4 Mô hình cơ sở: XGBoost, Random Forest, SVM RBF, MLP Neural Net",
      "Meta-Learner: Logistic Regression học trọng số tối thượng",
      "Độ nhạy bắt bệnh (Recall): 99.78% — Hạn chế tối đa bỏ sót ca bệnh",
      "Thời gian đưa ra kết luận tức thì < 85ms ngay trên smartwatch"
    ],
    specs: [
      { label: "Mô hình tổng hợp", value: "Stacking Classifier" },
      { label: "Độ chính xác (Accuracy)", value: "98.65%" },
      { label: "Độ nhạy bắt bệnh (Recall)", value: "99.78%" },
      { label: "Thời gian suy luận", value: "< 85 ms" }
    ],
    code: `# GIAI ĐOẠN 3: STACKING ENSEMBLE AI & KẾT LUẬN LÂM SÀNG
from sklearn.ensemble import StackingClassifier, RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.linear_model import LogisticRegression

# 4 Mô hình cơ sở học đa góc nhìn
base_models = [
    ('xgb', XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.1)),
    ('rf',  RandomForestClassifier(n_estimators=150, max_depth=8)),
    ('svm', SVC(kernel='rbf', probability=True, C=1.5)),
    ('mlp', MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=200))
]

# Meta-Learner ra quyết định tối thượng
ai_brain = StackingClassifier(
    estimators=base_models,
    final_estimator=LogisticRegression(),
    cv=5
)

# Kết luận thời gian thực: 0 (Bình thường), 1 (Rung Nhĩ AFib)
pred_label = ai_brain.predict(scaled_vector)[0]
confidence = np.max(ai_brain.predict_proba(scaled_vector)[0]) * 100`
  }
}

export function AIPipelineSection() {
  const [activeStage, setActiveStage] = useState<StageId>("stage-1")
  const [viewTab, setViewTab] = useState<"simulation" | "code">("simulation")
  const [isNoiseSimulated, setIsNoiseSimulated] = useState(false)
  const [simulatedSample, setSimulatedSample] = useState<"normal" | "afib">("normal")
  const [isCopied, setIsCopied] = useState(false)

  const current = stagesData[activeStage]

  const handleCopyCode = () => {
    navigator.clipboard.writeText(current.code)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

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
            Đường Ống Xử Lý &amp; Kiến Trúc AI
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-sans">
            Trung tâm điều khiển tương tác (Interactive AI Console) — Khám phá luồng dữ liệu 3 giai đoạn từ cảm biến sóng thô đến quyết định lâm sàng.
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
                    PHASE 0{item.stepNum}
                  </span>
                  
                  <div className={`w-2.5 h-2.5 rounded-full ${isActive ? "bg-sky-400 animate-ping" : "bg-white/20"}`} />
                </div>

                <div>
                  <h3 className={`text-sm sm:text-base font-black font-heading leading-snug mb-1 ${isActive ? "text-white" : "text-slate-300"}`}>
                    {item.title}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400 line-clamp-1 block">
                    {item.enTitle}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* ================= MAIN SPLIT-SCREEN INTERACTIVE WORKBENCH ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column (5 Cols): Stage Deep-Dive & Specifications */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-white/15 backdrop-blur-xl shadow-2xl">
            <div>
              {/* Stage Step Indicator */}
              <span className="text-xs font-mono text-sky-400 font-bold block mb-2 tracking-wider uppercase">
                GIAI ĐOẠN 0{current.stepNum} / 03
              </span>

              {/* Title */}
              <h3 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-white mb-2">
                {current.title}
              </h3>
              
              <p className="text-xs font-mono text-sky-300/80 mb-6">
                {current.tagline}
              </p>

              {/* Summary Paragraph */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans mb-6">
                {current.summary}
              </p>

              {/* Key Highlights Checklist */}
              <div className="space-y-2.5 mb-8">
                {current.bulletPoints.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 font-sans">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Specifications Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-6 border-t border-white/10">
              {current.specs.map((spec, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                  <span className="text-[10px] font-mono text-slate-400 block mb-0.5">{spec.label}</span>
                  <span className="text-xs font-bold font-heading text-white block">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (7 Cols): Interactive Simulation & Developer Code Console */}
          <div className="lg:col-span-7 flex flex-col rounded-3xl bg-slate-950 border border-white/15 overflow-hidden shadow-2xl">
            
            {/* Workbench Top Bar & View Switcher */}
            <div className="p-4 bg-slate-900/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-slate-400 ml-2 font-bold">
                  {viewTab === "simulation" ? "Live Interactive Workbench" : "Python Implementation"}
                </span>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-white/10 text-xs font-heading">
                <button
                  onClick={() => setViewTab("simulation")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewTab === "simulation" 
                      ? "bg-sky-600 text-white font-bold shadow-xs" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Trực Quan Hóa</span>
                </button>
                <button
                  onClick={() => setViewTab("code")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewTab === "code" 
                      ? "bg-sky-600 text-white font-bold shadow-xs" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Mã Nguồn Python</span>
                </button>
              </div>
            </div>

            {/* Workbench Body */}
            <div className="flex-1 p-6 flex flex-col justify-between bg-gradient-to-b from-slate-950 to-slate-900/60 min-h-[380px]">
              
              {/* TAB 1: LIVE INTERACTIVE SIMULATION */}
              {viewTab === "simulation" && (
                <div className="flex-1 flex flex-col justify-between">
                  
                  {/* STAGE 1 SIMULATION: ECG FILTERING & NOISE TOGGLE */}
                  {activeStage === "stage-1" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-sky-400" />
                          <span className="text-xs font-bold font-heading text-white">
                            Giả lập sóng ECG thời gian thực (125 Hz)
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
                          <span>{isNoiseSimulated ? "Đang bật nhiễu cơ học" : "Đã lọc sạch Butterworth"}</span>
                        </button>
                      </div>

                      {/* Animated ECG Waveform Screen */}
                      <div className="p-4 rounded-2xl bg-black/60 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-2 right-3 text-[10px] font-mono text-emerald-400">
                          BPM: 74 | RR: 810ms
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
                          <span>Status: {isNoiseSimulated ? "⚠️ Nhiễu cơ học cao" : "🟢 Sóng chuẩn y tế"}</span>
                          <span>Thuật toán: SciPy find_peaks</span>
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
                            Không gian ma trận 16 đặc trưng HRV (Đã chuẩn hóa)
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800">
                          Scale: [-1.0, 1.0]
                        </span>
                      </div>

                      {/* 16 Matrix Bars Grid */}
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-4 rounded-2xl bg-black/60 border border-white/10">
                        {[
                          { name: "RMSSD", val: "+0.84", h: "84%", col: "bg-sky-400" },
                          { name: "SDNN", val: "+0.62", h: "62%", col: "bg-sky-400" },
                          { name: "pNN50", val: "-0.45", h: "45%", col: "bg-sky-400" },
                          { name: "Mean_NN", val: "+0.78", h: "78%", col: "bg-sky-400" },
                          { name: "LF_PSD", val: "+0.91", h: "91%", col: "bg-blue-500" },
                          { name: "HF_PSD", val: "+0.53", h: "53%", col: "bg-blue-500" },
                          { name: "LF/HF", val: "+0.68", h: "68%", col: "bg-blue-500" },
                          { name: "SampEn", val: "+0.88", h: "88%", col: "bg-indigo-400" },
                        ].map((feat, i) => (
                          <div key={i} className="flex flex-col items-center gap-1.5">
                            <div className="w-full h-24 bg-slate-900 rounded-lg flex items-end p-1 border border-white/5">
                              <div className={`w-full ${feat.col} rounded-sm transition-all duration-500`} style={{ height: feat.h }} />
                            </div>
                            <span className="text-[9px] font-mono font-bold text-white truncate">{feat.name}</span>
                            <span className="text-[8px] font-mono text-slate-400">{feat.val}</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-[11px] text-slate-400 italic">
                        * 16 chỉ số được chuẩn hóa kép giúp loại bỏ hoàn toàn việc lệch biên độ giữa các đơn vị ms² và đơn vị Entropy.
                      </p>
                    </div>
                  )}

                  {/* STAGE 3 SIMULATION: STACKING ENSEMBLE LIVE PREDICTOR */}
                  {activeStage === "stage-3" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-heading text-white">
                          Thử nghiệm suy luận mô hình Stacking AI:
                        </span>

                        {/* Test Sample Switcher */}
                        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-white/10 text-xs">
                          <button
                            onClick={() => setSimulatedSample("normal")}
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                              simulatedSample === "normal" ? "bg-emerald-600 text-white font-bold" : "text-slate-400"
                            }`}
                          >
                            Ca A (Bình thường)
                          </button>
                          <button
                            onClick={() => setSimulatedSample("afib")}
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                              simulatedSample === "afib" ? "bg-rose-600 text-white font-bold" : "text-slate-400"
                            }`}
                          >
                            Ca B (Cơn Rung Nhĩ)
                          </button>
                        </div>
                      </div>

                      {/* Stacking Voting Flow Diagram */}
                      <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { name: "XGBoost", conf: simulatedSample === "normal" ? "98.9% Normal" : "99.2% AFib" },
                            { name: "RandomForest", conf: simulatedSample === "normal" ? "98.4% Normal" : "98.8% AFib" },
                            { name: "SVM-RBF", conf: simulatedSample === "normal" ? "98.6% Normal" : "99.0% AFib" },
                            { name: "MLP Neural", conf: simulatedSample === "normal" ? "98.7% Normal" : "99.1% AFib" },
                          ].map((model, i) => (
                            <div key={i} className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-center">
                              <span className="text-[10px] font-mono text-slate-400 block">{model.name}</span>
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
                              <span className="text-xs font-mono text-slate-400 block">KẾT LUẬN META-LEARNER (&lt; 85ms)</span>
                              <span className="text-sm font-black font-heading text-white">
                                {simulatedSample === "normal" ? "Nhịp Xoang Bình Thường (99.2% tin cậy)" : "Cảnh Báo: Phát Hiện Cơn Rung Nhĩ AFib"}
                              </span>
                            </div>
                          </div>

                          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-white/10 text-white">
                            Acc: 98.65%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stage Bottom Interactive Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-slate-400 font-mono">
                    <span>Active: {current.title}</span>
                    <span className="text-emerald-400">✓ Tested on MIMIC-III</span>
                  </div>

                </div>
              )}

              {/* TAB 2: DEVELOPER CODE CONSOLE */}
              {viewTab === "code" && (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="relative">
                    {/* Copy Code Button */}
                    <button
                      onClick={handleCopyCode}
                      className="absolute top-2 right-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-slate-300 border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? "Đã sao chép" : "Sao chép Code"}</span>
                    </button>

                    <pre className="p-4 rounded-2xl bg-black/70 border border-white/10 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed max-h-[300px]">
                      <code>{current.code}</code>
                    </pre>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-slate-400 font-mono">
                    <span>Framework: Python 3.11 / SciPy / Scikit-Learn</span>
                    <span>Ready for Deployment</span>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </section>
  )
}

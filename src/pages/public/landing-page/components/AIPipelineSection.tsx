import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Database, Filter, ActivitySquare, Scale, Brain, Binary, Network } from "lucide-react"

const codeSnippets = {
  filter: `peaks, _ = find_peaks(
    raw_ecg,
    distance=fs*0.4,
    height=mean+0.3*std
)`,
  hrv: `{
  "TD": ["Mean_NN", "RMSSD", "pNN50"],
  "FD": ["LF_norm", "HF_norm", "LF/HF"],
  "NL": ["SD1", "SD2", "SampEn"]
}`,
  scaling: `Z_Score = (X - μ) / σ
Min_Max = (X - min) / (max - min)`,
  stacking: `meta_model = LogisticRegression()
stack = StackingClassifier(
    estimators=base_models,
    final_estimator=meta_model
)`
}

const steps = [
  {
    id: 1,
    title: "Thu thập dữ liệu",
    description: "Tập dữ liệu MIMIC-III PERform AFib Dataset với hơn 5.25 triệu điểm dữ liệu sóng điện tim (ECG) nguyên bản chưa qua xử lý.",
    icon: Database,
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    id: 2,
    title: "Tiền xử lý & Khử nhiễu",
    description: "Áp dụng Cửa sổ trượt (Sliding Window) 30s. Bắt đỉnh R-peaks và loại bỏ nhiễu bằng thuật toán find_peaks của SciPy.",
    icon: Filter,
    color: "text-sky-500",
    bg: "bg-sky-50",
    border: "border-sky-200",
    code: codeSnippets.filter,
  },
  {
    id: 3,
    title: "Trích xuất đặc trưng",
    description: "Trích xuất 16 chỉ số sinh học HRV bao phủ 3 miền: Thời gian, Tần số, và Phi tuyến tính (RMSSD, SampEn, LF/HF...).",
    icon: ActivitySquare,
    color: "text-cyan-500",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    code: codeSnippets.hrv,
  },
  {
    id: 4,
    title: "Chuẩn hóa kép",
    description: "Sử dụng cả Z-Score và Min-Max Scaling để tối ưu không gian vector cho nhiều loại thuật toán học máy khác nhau.",
    icon: Scale,
    color: "text-teal-500",
    bg: "bg-teal-50",
    border: "border-teal-200",
    code: codeSnippets.scaling,
  },
  {
    id: 5,
    title: "Huấn luyện Base Models",
    description: "Phân luồng dữ liệu để huấn luyện độc lập các thuật toán (Logistic Reg, SVM, XGBoost, RF) với ưu thế riêng biệt.",
    icon: Brain,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  {
    id: 6,
    title: "Stacking Ensemble",
    description: "Kết hợp sức mạnh qua Meta-Learner để khử nhiễu, tối đa hóa độ nhạy phát hiện Rung nhĩ. (Độ chính xác: 98.71%)",
    icon: Binary,
    color: "text-green-500",
    bg: "bg-green-50",
    border: "border-green-200",
    code: codeSnippets.stacking,
  },
]

const CurveRow = ({ step, index, isEven }: { step: any, index: number, isEven: boolean }) => {
  const ref = useRef<HTMLDivElement>(null)
  
  // Ánh xạ tiến trình cuộn của từng thẻ. Bắt đầu khi ĐỈNH thẻ chạm GIỮA màn hình, kết thúc khi ĐÁY thẻ chạm GIỮA màn hình.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"]
  })

  // ClipPath sẽ chạy từ 100% (ẩn hoàn toàn từ dưới lên) đến 0% (hiện hoàn toàn)
  const clipPath = useTransform(scrollYProgress, [0, 1], ["inset(0% 0% 100% 0%)", "inset(0% 0% 0% 0%)"])

  // Hiệu ứng "pop" cho vòng tròn Node khi tia sáng chạy đến giữa thẻ (50% tiến trình)
  const circleScale = useTransform(scrollYProgress, [0.4, 0.5, 0.6], [0, 1.2, 1])
  const circleOpacity = useTransform(scrollYProgress, [0.4, 0.5], [0, 1])

  return (
    <div ref={ref} className={`relative flex items-stretch w-full min-h-[250px] ${index > 0 ? 'md:-mt-[3px]' : ''}`}>
      
      {/* ================= MOBILE VIEW (Straight Line) ================= */}
      {/* Base Line */}
      <div className="md:hidden absolute left-[28px] top-0 bottom-0 w-[3px] bg-slate-200/50 z-0" />
      {/* Animated Glowing Line */}
      <motion.div 
        style={{ clipPath, filter: 'drop-shadow(0 0 8px rgba(45, 212, 191, 0.8))' }}
        className="md:hidden absolute left-[28px] top-0 bottom-0 w-[3px] bg-teal-400 z-0" 
      />
      
      {/* ================= DESKTOP S-CURVE (CSS Borders) ================= */}
      {/* Base Curve (Ngầm) */}
      <div className={`hidden md:block absolute top-0 bottom-0 ${
        isEven 
        ? 'left-1/2 w-[35%] border-t-[3px] border-r-[3px] border-b-[3px] rounded-r-[150px]' 
        : 'right-1/2 w-[35%] border-t-[3px] border-l-[3px] border-b-[3px] rounded-l-[150px]'
      } border-slate-200/50 z-0`} />

      {/* Glowing Animated Curve (Chảy theo thanh cuộn) */}
      <motion.div 
        style={{ clipPath, filter: 'drop-shadow(0 0 12px rgba(45, 212, 191, 0.9))' }}
        className={`hidden md:block absolute top-0 bottom-0 ${
        isEven 
        ? 'left-1/2 w-[35%] border-t-[3px] border-r-[3px] border-b-[3px] rounded-r-[150px]' 
        : 'right-1/2 w-[35%] border-t-[3px] border-l-[3px] border-b-[3px] rounded-l-[150px]'
      } border-teal-400 z-0`} />

      {/* ================= NODE CIRCLES ================= */}
      {/* Desktop Node Circle */}
      <motion.div 
        style={{ scale: circleScale, opacity: circleOpacity }}
        className={`hidden md:flex absolute top-1/2 -translate-y-1/2 ${
        isEven ? 'left-[85%] -translate-x-1/2' : 'left-[15%] -translate-x-1/2'
      } w-14 h-14 bg-white rounded-full items-center justify-center border-4 border-white shadow-xl z-20`}>
        <div className={`w-full h-full rounded-full ${step.bg} border ${step.border} flex items-center justify-center ${step.color}`}>
          <step.icon className="w-5 h-5" />
        </div>
      </motion.div>

      {/* Mobile Node Circle */}
      <motion.div 
        style={{ scale: circleScale, opacity: circleOpacity }}
        className="flex md:hidden absolute left-[28px] top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full items-center justify-center border-4 border-white shadow-xl z-20">
        <div className={`w-full h-full rounded-full ${step.bg} border ${step.border} flex items-center justify-center ${step.color}`}>
          <step.icon className="w-5 h-5" />
        </div>
      </motion.div>

      {/* ================= CONTENT WRAPPERS ================= */}
      {/* DESKTOP CONTENT WRAPPER */}
      <div className={`hidden md:flex w-1/2 ${isEven ? 'pr-20 justify-end mr-auto' : 'pl-20 justify-start ml-auto'} py-12 relative z-10`}>
        <motion.div 
          initial={{ opacity: 0, x: isEven ? -30 : 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all w-full max-w-xl text-left relative group overflow-hidden"
        >
          <div className={`absolute top-0 ${isEven ? 'right-0' : 'left-0'} w-24 h-24 ${step.bg} rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity`} />
          <span className={`text-sm font-bold uppercase tracking-wider mb-2 block ${step.color}`}>Bước {step.id}</span>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
          {step.code && (
            <pre className="mt-5 p-4 bg-slate-900 text-slate-300 text-[11px] font-mono rounded-2xl overflow-x-auto shadow-inner border border-slate-800">
                {step.code}
            </pre>
          )}
        </motion.div>
      </div>

      {/* MOBILE CONTENT WRAPPER */}
      <div className="flex md:hidden w-full pl-20 pr-4 py-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-lg w-full text-left relative overflow-hidden"
        >
          <div className={`absolute top-0 left-0 w-24 h-24 ${step.bg} rounded-full blur-3xl opacity-50`} />
          <span className={`text-sm font-bold uppercase tracking-wider mb-2 block ${step.color}`}>Bước {step.id}</span>
          <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
          {step.code && (
            <pre className="mt-5 p-4 bg-slate-900 text-slate-300 text-[10px] font-mono rounded-2xl overflow-x-auto shadow-inner border border-slate-800">
                {step.code}
            </pre>
          )}
        </motion.div>
      </div>

    </div>
  )
}

export function AIPipelineSection() {
  const topTailRef = useRef<HTMLDivElement>(null)
  const bottomTailRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress: topProgress } = useScroll({
    target: topTailRef,
    offset: ["start center", "end center"]
  })

  const { scrollYProgress: bottomProgress } = useScroll({
    target: bottomTailRef,
    offset: ["start center", "end center"]
  })

  return (
    <section className="w-full py-32 relative bg-transparent text-slate-900 overflow-hidden">
      
      {/* Background Decorators */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 text-emerald-700 text-sm font-bold w-fit mb-6 border border-emerald-100 shadow-sm"
          >
            <Network className="w-4 h-4" />
            End-to-End ML Pipeline
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold mb-4 text-slate-900"
          >
            Kiến trúc Mô hình Học máy
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Quy trình luân chuyển luồng dữ liệu (Data Flow) từ dữ liệu thô nguyên bản đến Hệ thống Chẩn đoán Stacking Ensemble siêu nhạy.
          </motion.p>
        </div>

        {/* ================= THE GLOWING S-CURVE ================= */}
        <div className="relative w-full max-w-6xl mx-auto pb-24 overflow-hidden md:overflow-visible">
          
          {/* Top Tail (Starts from Title) */}
          <div ref={topTailRef} className="hidden md:block w-[3px] h-12 mx-auto relative">
            <div className="absolute inset-0 bg-slate-200/50" />
            <motion.div 
              style={{ scaleY: topProgress, transformOrigin: 'top', filter: 'drop-shadow(0 0 12px rgba(45, 212, 191, 0.9))' }} 
              className="absolute inset-0 bg-teal-400" 
            />
          </div>

          <div className="relative z-10">
            {steps.map((step, index) => (
              <CurveRow key={step.id} step={step} index={index} isEven={index % 2 === 0} />
            ))}
          </div>

          {/* Bottom Tail */}
          <div ref={bottomTailRef} className="hidden md:block w-[3px] h-24 mx-auto -mt-[3px] relative">
            <div className="absolute inset-0 bg-slate-200/50" />
            <motion.div 
              style={{ scaleY: bottomProgress, transformOrigin: 'top', filter: 'drop-shadow(0 0 12px rgba(45, 212, 191, 0.9))' }} 
              className="absolute inset-0 bg-teal-400" 
            />
          </div>

        </div>

      </div>
    </section>
  )
}


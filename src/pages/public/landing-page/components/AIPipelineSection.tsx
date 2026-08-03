import { motion } from "framer-motion"
import { Database, Filter, ActivitySquare, Scale, Brain, ArrowDownCircle, Network, Code2, Binary } from "lucide-react"

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

export function AIPipelineSection() {
  return (
    <section className="w-full py-24 relative bg-transparent text-slate-900 overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
      
      {/* Animated Flow Lines (Background) */}
      <div className="absolute inset-0 pointer-events-none opacity-20 hidden lg:block">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
           <path d="M 200 200 C 500 200, 500 500, 800 500" stroke="url(#blue-emerald)" strokeWidth="2" fill="none" strokeDasharray="5,5" className="animate-pulse" />
           <defs>
            <linearGradient id="blue-emerald" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-16">
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
            Quy trình công nghệ tinh gọn từ Dữ liệu thô (Raw Data) đến Hệ thống Chẩn đoán Stacking Ensemble đạt độ chính xác vô tiền khoáng hậu.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Step 1: Raw Data (Col 5) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-1 md:col-span-5 bg-slate-50/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:bg-white hover:shadow-md transition-all flex flex-col justify-center"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100/50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors" />
            <div className="w-12 h-12 bg-blue-100/50 text-blue-600 rounded-xl flex items-center justify-center mb-6 relative border border-blue-200/50">
              <Database className="w-6 h-6" />
            </div>
            <div className="relative">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2 block">Bước 1</span>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Sóng điện tim thô</h3>
              <p className="text-slate-600 text-sm">
                Tập dữ liệu MIMIC-III PERform AFib Dataset với hơn <strong>5.25 triệu điểm dữ liệu</strong> sóng điện tim (ECG) nguyên bản chưa qua xử lý.
              </p>
            </div>
          </motion.div>

          {/* Step 2: Preprocessing (Col 7) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="col-span-1 md:col-span-7 bg-slate-50/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:bg-white hover:shadow-md transition-all flex flex-col justify-center"
          >
            {/* Code Watermark */}
            <pre className="absolute top-4 right-4 text-[10px] text-slate-900/[0.04] font-mono font-bold whitespace-pre-wrap text-right pointer-events-none select-none overflow-hidden">
              {codeSnippets.filter}
            </pre>
            
            <div className="w-12 h-12 bg-sky-100/50 text-sky-600 rounded-xl flex items-center justify-center mb-6 relative border border-sky-200/50">
              <Filter className="w-6 h-6" />
            </div>
            <div className="relative z-10 w-full md:w-5/6">
              <span className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-2 block">Bước 2</span>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Tiền xử lý & Khử nhiễu</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Áp dụng Cửa sổ trượt (Sliding Window) 30s. Bắt đỉnh R-peaks và loại bỏ nhiễu tín hiệu (baseline/sóng T nhô cao) bằng thuật toán <strong>find_peaks</strong> của SciPy (sử dụng ngưỡng chiều cao & khoảng cách tối thiểu).
              </p>
            </div>
          </motion.div>

          {/* Step 3: HRV Features (Col 12 - Full Width) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="col-span-1 md:col-span-12 bg-slate-50/80 backdrop-blur-sm rounded-3xl p-8 lg:p-10 border border-slate-200 shadow-sm relative overflow-hidden group hover:bg-white hover:shadow-md transition-all"
          >
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Left Column: Text */}
              <div>
                <div className="w-12 h-12 bg-cyan-100/50 text-cyan-600 rounded-xl flex items-center justify-center mb-6 relative border border-cyan-200/50">
                  <ActivitySquare className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-cyan-500 uppercase tracking-wider mb-2 block">Bước 3</span>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Trích xuất 16 Đặc trưng (HRV)</h3>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                  Từ các đỉnh R, trích xuất 16 chỉ số sinh học quan trọng bao phủ 3 miền phân tích không gian: <strong>Thời gian (Time-Domain)</strong>, <strong>Tần số (Frequency-Domain)</strong>, và <strong>Phi tuyến tính (Non-linear)</strong>.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-white text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm">RMSSD</span>
                  <span className="px-3 py-1 rounded-full bg-white text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm">LF/HF Ratio</span>
                  <span className="px-3 py-1 rounded-full bg-white text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm">SampEn</span>
                </div>
              </div>

              {/* Right Column: Visual Feature Breakdown to fill empty space */}
              <div className="hidden md:block bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                <pre className="absolute -right-4 -bottom-4 text-[100px] text-slate-900/[0.02] font-mono font-bold leading-none pointer-events-none select-none">
                  {`{}`}
                </pre>
                <div className="grid grid-cols-2 gap-6 relative z-10">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Time-Domain (7)</h4>
                    <ul className="text-xs text-slate-600 font-medium space-y-1">
                      <li>Mean_NN, SDNN</li>
                      <li>RMSSD, pNN50</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Freq-Domain (6)</h4>
                    <ul className="text-xs text-slate-600 font-medium space-y-1">
                      <li>LF, HF, LF/HF</li>
                      <li>Total Power</li>
                    </ul>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400"></span> Non-Linear (3)</h4>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded text-[10px] font-mono border border-slate-100">SD1</span>
                      <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded text-[10px] font-mono border border-slate-100">SD2</span>
                      <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded text-[10px] font-mono border border-slate-100">SampEn</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 4: Scaling (Col 4) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="col-span-1 md:col-span-4 bg-slate-50/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:bg-white hover:shadow-md transition-all flex flex-col justify-center"
          >
            <pre className="absolute top-4 right-4 text-[10px] text-slate-900/[0.04] font-mono font-bold whitespace-pre-wrap pointer-events-none select-none text-right">
              {codeSnippets.scaling}
            </pre>
            <div className="w-12 h-12 bg-teal-100/50 text-teal-600 rounded-xl flex items-center justify-center mb-6 relative border border-teal-200/50">
              <Scale className="w-6 h-6" />
            </div>
            <div className="relative">
              <span className="text-xs font-bold text-teal-500 uppercase tracking-wider mb-2 block">Bước 4</span>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Chuẩn hóa Kép</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Sử dụng cả <strong>Z-Score</strong> và <strong>Min-Max Scaling</strong> để tối ưu không gian vector cho nhiều loại thuật toán.
              </p>
            </div>
          </motion.div>

          {/* Step 5: Base Models (Col 8) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="col-span-1 md:col-span-8 bg-slate-50/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:bg-white hover:shadow-md transition-all flex flex-col justify-center"
          >
            <div className="w-12 h-12 bg-emerald-100/50 text-emerald-600 rounded-xl flex items-center justify-center mb-6 relative border border-emerald-200/50">
              <Brain className="w-6 h-6" />
            </div>
            <div className="relative flex flex-col md:flex-row md:items-center gap-6">
              <div className="md:w-1/2">
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2 block">Bước 5</span>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Huấn luyện Base Models</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Phân luồng dữ liệu thông minh để huấn luyện độc lập các thuật toán (Base Estimators) với ưu thế riêng biệt.
                </p>
              </div>
              <div className="md:w-1/2 flex flex-col gap-3 w-full">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                  <div className="text-xs text-slate-400 font-bold">Z-Score</div>
                  <div className="text-sm font-semibold text-slate-700">Logistic Reg, SVM</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                  <div className="text-xs text-slate-400 font-bold">Min-Max</div>
                  <div className="text-sm font-semibold text-slate-700">XGBoost, RF, MLP</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 6: Stacking Ensemble (Col 12 - Hero Card) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="col-span-1 md:col-span-12 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-emerald-500/20 relative overflow-hidden mt-4"
          >
            {/* Code Background Overlay */}
            <div className="absolute inset-0 opacity-10 font-mono text-[10px] md:text-sm text-white overflow-hidden p-8 pointer-events-none mix-blend-overlay">
              {Array(5).fill(codeSnippets.stacking).join('\n\n')}
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-2/3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center border border-white/20">
                    <Binary className="w-6 h-6" />
                  </div>
                  <span className="text-emerald-100 font-bold tracking-wider uppercase text-sm">Bước Cuối Cùng</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                  Soft Voting & Stacking Ensemble
                </h3>
                <p className="text-emerald-50 text-lg leading-relaxed mb-6">
                  Kết hợp sức mạnh phân tích của các thuật toán Base thông qua Meta-Learner (Logistic Regression) để khử nhiễu dự đoán, tối đa hóa độ nhạy phát hiện Rung nhĩ.
                </p>
                <div className="flex items-center gap-2 text-white bg-black/20 w-fit px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
                  <Code2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Meta_Learner = LogisticRegression()</span>
                </div>
              </div>
              
              {/* Highlight Result Circle */}
              <div className="md:w-1/3 flex justify-center">
                <div className="w-48 h-48 rounded-full bg-white flex flex-col items-center justify-center shadow-2xl shadow-black/20 border-8 border-emerald-400/30">
                  <ArrowDownCircle className="w-8 h-8 text-emerald-500 mb-2" />
                  <span className="text-4xl font-black text-slate-900">98.71%</span>
                  <span className="text-xs font-bold text-slate-500 uppercase mt-1">Accuracy</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

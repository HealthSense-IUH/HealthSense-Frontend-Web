import { motion } from "framer-motion"
import { Filter, Activity, Server } from "lucide-react"

export function AIDatasetSection() {
  return (
    <section className="w-full py-24 relative bg-transparent border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: Text Content */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight"
            >
              Được huấn luyện từ <br />
              <span className="text-emerald-600">MIMIC-III Clinical Database</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-600 text-lg mb-8 leading-relaxed"
            >
              Dữ liệu là cốt lõi của mọi trí tuệ nhân tạo. HealthSense sử dụng tập dữ liệu vàng <strong>MIMIC PERform AFib Dataset</strong> từ Kaggle với hơn 5.25 triệu điểm dữ liệu sóng điện tim.
            </motion.p>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <Activity className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Tín hiệu PPG & ECG Chuẩn y tế</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Tương thích hoàn hảo với tín hiệu từ đồng hồ thông minh và vòng đeo tay thế hệ mới.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <Filter className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Xử lý nhiễu bằng Butterworth Filter</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Loại bỏ hoàn toàn các nhiễu tần số cao và nhiễu cơ học sinh ra trong quá trình vận động.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <Server className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Chuẩn hóa Kép (Dual Scaling)</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Sử dụng đồng thời <strong>Z-Score</strong> (cho Logistic Regression, SVM) và <strong>Min-Max Scaler</strong> (cho Tree-based & Neural Networks) để tối ưu hóa triệt để cho từng họ thuật toán.
                  </p>
                </div>
              </motion.div>
            </div>

          </div>

          {/* Right: Graphic / Visual */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-3xl bg-slate-900 p-8 shadow-2xl overflow-hidden border border-slate-800"
            >
              {/* Fake Data Grid */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="text-xs text-slate-400 font-mono">preprocess_mimic.py</div>
                </div>

                {/* Sliding Window Animation */}
                <div className="relative h-24 w-full bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 mb-2">
                  <div className="absolute inset-0 flex items-center px-4">
                    {/* Fake ECG Waveform (SVG) */}
                    <svg viewBox="0 0 400 100" className="w-full h-full stroke-emerald-500/50 fill-none" preserveAspectRatio="none">
                      <path d="M0,50 L40,50 L45,30 L55,80 L60,10 L70,90 L75,50 L110,50 L115,30 L125,80 L130,10 L140,90 L145,50 L180,50 L185,30 L195,80 L200,10 L210,90 L215,50 L250,50 L255,30 L265,80 L270,10 L280,90 L285,50 L320,50 L325,30 L335,80 L340,10 L350,90 L355,50 L400,50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  {/* The Sliding Window */}
                  <motion.div
                    animate={{ x: ["0%", "200%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-0 h-full w-1/3 border-2 border-emerald-400 bg-emerald-400/10 shadow-[0_0_15px_rgba(52,211,153,0.3)] flex flex-col justify-between"
                  >
                    <div className="bg-emerald-400 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 w-fit rounded-br-md">Window 30s</div>
                    <div className="text-emerald-300 text-[10px] px-1.5 py-0.5 text-right w-full font-mono bg-black/40">16 Features</div>
                  </motion.div>
                </div>

                <div className="font-mono text-sm text-emerald-400">
                  <p>~ Loading raw waveforms...</p>
                  <p className="text-slate-300 mt-2">Found 5,250,000+ data points.</p>
                  <p className="text-slate-300">Applying Sliding Window (30s, step 10s)...</p>
                  <p className="text-emerald-400 mt-2">~ Applying Butterworth Low-pass filter (fs=125Hz)...</p>
                  <p className="text-emerald-400">~ Z-Score Normalization applied.</p>
                  <p className="text-emerald-400">~ Min-Max Scaling applied.</p>
                  <br />
                  <p className="text-blue-400">&gt; Dataset ready: 2,238 AFib / 1,845 Normal samples.</p>
                </div>
              </div>
            </motion.div>

            {/* Decorator bubbles */}
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-emerald-400 rounded-full blur-2xl opacity-20" />
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-500 rounded-full blur-2xl opacity-20" />
          </div>

        </div>
      </div>
    </section>
  )
}

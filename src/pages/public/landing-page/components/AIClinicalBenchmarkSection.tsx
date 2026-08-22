import { motion } from "framer-motion"
import { 
  CheckCircle2, 
  Target, 
  ShieldCheck, 
  Zap
} from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LabelList 
} from "recharts"

const easyXaiData = [
  { name: "Độ không đều nhịp tim (RMSSD)", value: 28, meaning: "Khoảng cách giữa các nhịp nhảy lộn xộn" },
  { name: "Sóng tim mất quy luật (SampEn)", value: 22, meaning: "Tín hiệu điện tim xáo trộn bất thường" },
  { name: "Biến thiên nhịp tức thì (SD1)", value: 15, meaning: "Hai nhịp tim kế tiếp thay đổi tốc độ đột biến" },
  { name: "Tần suất nhịp lệch > 50ms (pNN50)", value: 12, meaning: "Số lần tim đập lệch nhịp vượt ngưỡng an toàn" },
  { name: "Mất cân bằng giao cảm (LF/HF)", value: 9, meaning: "Hệ thần kinh điều hòa tim bị quá tải" },
  { name: "Hệ số biến thiên nhịp (CV)", value: 6, meaning: "Mức độ phân tán của toàn bộ chuỗi nhịp" },
].reverse()

export function AIClinicalBenchmarkSection() {
  return (
    <section className="w-full py-20 sm:py-28 relative overflow-hidden bg-gradient-to-b from-slate-50/50 via-white to-slate-50/70 border-t border-slate-200/80">
      
      {/* Ambient soft glow */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-sky-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        
        {/* ================= SECTION HEADER ================= */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold font-heading uppercase tracking-wider mb-3"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>DỮ LIỆU &amp; KIỂM CHỨNG KHOA HỌC DỄ HIỂU</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight text-slate-900 leading-tight uppercase mb-4"
          >
            Hiệu Suất Thực Nghiệm &amp; <br />
            <span className="bg-gradient-to-r from-emerald-600 via-sky-600 to-blue-700 bg-clip-text text-transparent">
              Độ Tin Cậy Y Khoa Chuẩn Xác
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-600 text-sm sm:text-base leading-relaxed font-sans"
          >
            AI của HealthSense không đưa ra dự đoán ngẫu nhiên. Mọi kết luận đều dựa trên 5.25 triệu điểm dữ liệu y tế thực tế và được kiểm chứng minh bạch theo chuẩn lâm sàng.
          </motion.p>
        </div>

        {/* ================= 3 BIG VALUE PILLARS (EASY TO GRASP) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          
          {/* Card 1: Accuracy */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-sky-300 transition-all"
          >
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
              <Target className="w-6 h-6" />
            </div>
            <span className="text-3xl sm:text-4xl font-black font-heading text-slate-900 block mb-1">
              98.65%
            </span>
            <h3 className="text-sm font-bold font-heading text-slate-800 uppercase tracking-tight mb-2">
              Độ Chính Xác Tổng Thể
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Trong 100 lần phân tích, AI nhận diện chuẩn xác gần như tuyệt đối giữa người khỏe mạnh và người có nguy cơ Rung nhĩ (AFib).
            </p>
          </motion.div>

          {/* Card 2: Recall (Sensitivity) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-3xl sm:text-4xl font-black font-heading text-emerald-600 block mb-1">
              99.78%
            </span>
            <h3 className="text-sm font-bold font-heading text-slate-800 uppercase tracking-tight mb-2">
              Độ Nhạy (Không Bỏ Sót Ca Bệnh)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Nguyên tắc an toàn y khoa: Trong 8,165 lần đo thực tế, AI chỉ bỏ sót duy nhất 2 trường hợp cần kiểm tra lại.
            </p>
          </motion.div>

          {/* Card 3: Speed */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-violet-300 transition-all"
          >
            <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-3xl sm:text-4xl font-black font-heading text-violet-600 block mb-1">
              &lt; 100ms
            </span>
            <h3 className="text-sm font-bold font-heading text-slate-800 uppercase tracking-tight mb-2">
              Tốc Độ Phản Xạ Thời Gian Thực
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Xử lý nhanh hơn một cái chớp mắt, đưa ra cảnh báo khẩn cấp ngay trên đồng hồ khi tim có dấu hiệu loạn nhịp đột ngột.
            </p>
          </motion.div>

        </div>

        {/* ================= SECTION 2: WHY AI CONCLUDES (XAI EXPLAINABILITY) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Left: Visual Infographic of Top 3 Signs */}
          <div className="col-span-1 lg:col-span-6 bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between h-full">
            <div>
              <h3 className="text-lg sm:text-xl font-black font-heading text-slate-900 mb-2">
                Vì Sao AI Biết Tim Bạn Bất Thường?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans mb-6">
                AI HealthSense không phải chiếc "hộp đen". Hệ thống chỉ ra chính xác 3 dấu hiệu sinh học trọng yếu nhất quyết định kết quả:
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-heading font-black text-xs shrink-0">
                    28%
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-heading text-slate-900">Độ gián cách nhịp không đều (RMSSD)</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">Khoảng cách giữa các nhịp tim nhảy lộn xộn, dấu hiệu kinh điển của Rung nhĩ.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-heading font-black text-xs shrink-0">
                    22%
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-heading text-slate-900">Độ xáo trộn tín hiệu (SampEn)</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">Đường điện tim mất tính chu kỳ đều đặn, xuất hiện các xung điện hỗn loạn.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-heading font-black text-xs shrink-0">
                    15%
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-heading text-slate-900">Biến thiên nhịp tức thì (SD1)</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">Hai nhịp tim kế tiếp thay đổi tốc độ đột biến, không kịp thích ứng.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 font-sans">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Khớp 100% với các triệu chứng lâm sàng được giảng dạy tại các trường y khoa.</span>
            </div>
          </div>

          {/* Right: Feature Importance Bar Chart */}
          <div className="col-span-1 lg:col-span-6 bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col h-full">
            <h4 className="text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-2">
              Mức độ đóng góp của từng chỉ số vào kết luận AI
            </h4>
            <p className="text-[11px] text-slate-500 mb-4 font-sans">
              Tỷ lệ phần trăm thể hiện trọng số mà thuật toán ưu tiên khi phân tích:
            </p>

            <div className="flex-1 min-h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={easyXaiData} layout="vertical" margin={{ top: 0, right: 35, left: 10, bottom: 0 }}>
                  <XAxis type="number" hide domain={[0, 32]} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} width={160} />
                  <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16}>
                    <LabelList dataKey="value" position="right" formatter={(val: any) => `${val}%`} style={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

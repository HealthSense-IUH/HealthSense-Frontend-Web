import { motion } from "framer-motion"
import { Target, Activity, Lock } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts"

const featureImportance = [
  { name: "RMSSD", value: 28 },
  { name: "SampEn", value: 22 },
  { name: "SD1", value: 15 },
  { name: "pNN50", value: 12 },
  { name: "LF_HF_Ratio", value: 9 },
  { name: "CV", value: 6 },
  { name: "Mean_NN", value: 5 },
  { name: "Total_Power", value: 3 },
].reverse() // Reverse to ensure RMSSD appears at the top in Recharts vertical layout

export function AIClinicalSection() {
  return (
    <section className="w-full py-24 relative bg-transparent">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-slate-900 mb-6"
          >
            Chuẩn Mực Lâm Sàng
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 text-lg leading-relaxed"
          >
            Hệ thống được thiết kế không chỉ để đạt độ chính xác cao, mà còn phải đáp ứng các tiêu chuẩn khắt khe nhất trong chẩn đoán y khoa nhằm loại trừ mọi rủi ro sai sót.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Card 1: XAI (Feature Importance) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="col-span-1 lg:col-span-7 bg-white/80 backdrop-blur-md rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Trí tuệ nhân tạo minh bạch (XAI)</h3>
              </div>
              <p className="text-slate-600 mb-8 leading-relaxed max-w-lg">
                Phân tích Feature Importance chứng minh AI ưu tiên các chỉ số như <strong>RMSSD, SampEn</strong> hoàn toàn khớp với logic y khoa học của bệnh Rung Nhĩ. Mô hình không còn là một hộp đen.
              </p>
              
              <div className="flex-1 min-h-[350px] w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureImportance} layout="vertical" margin={{ top: 0, right: 40, left: 20, bottom: 0 }}>
                    <XAxis type="number" hide domain={[0, 32]} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }} width={90} />
                    <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24}>
                      <LabelList dataKey="value" position="right" formatter={(val: any) => `${val}%`} style={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Confusion Matrix */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="col-span-1 lg:col-span-5 bg-white/80 backdrop-blur-md rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Đánh đổi Recall vs Specificity</h3>
            </div>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Thiết bị cảnh báo sớm (Screening Tool) tuyệt đối không được bỏ sót bệnh nhân. Chúng tôi chấp nhận tỷ lệ cảnh báo nhầm nhỏ để đảm bảo <strong>Recall (Độ nhạy) luôn đạt &gt; 99%</strong>.
            </p>
            
            <div className="flex-1 flex flex-col justify-center w-full max-w-[320px] mx-auto mt-2">
              <div className="text-center text-sm font-bold text-slate-800 mb-6 tracking-wide">MA TRẬN NHẦM LẪN (CONFUSION MATRIX)</div>
              
              <div className="grid grid-cols-[auto_1fr] gap-4 items-center">
                {/* Y-axis label */}
                <div 
                  className="text-xs font-bold text-slate-500 text-center tracking-widest uppercase h-full flex items-center justify-center"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  Thực tế Lâm Sàng
                </div>
                
                <div className="flex flex-col gap-2">
                  {/* X-axis labels */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-500 text-center mb-1">
                    <div>Dự đoán:<br/>Bình Thường</div>
                    <div>Dự đoán:<br/>Rung Nhĩ</div>
                  </div>
                  
                  {/* Matrix */}
                  <div className="grid grid-cols-2 gap-2">
                     <div className="aspect-square bg-emerald-900 text-white rounded-2xl flex flex-col items-center justify-center shadow-inner relative transition-transform hover:scale-105 duration-300">
                       <span className="absolute top-3 left-3 text-[10px] opacity-60 font-semibold uppercase">Bình thường</span>
                       <span className="text-3xl sm:text-4xl font-black mt-2">390</span>
                     </div>
                     <div className="aspect-square bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold border border-emerald-100 transition-transform hover:scale-105 duration-300">
                       10
                     </div>
                     
                     <div className="aspect-square bg-white text-emerald-800 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold border border-slate-200 shadow-sm transition-transform hover:scale-105 duration-300">
                       2
                     </div>
                     <div className="aspect-square bg-emerald-900 text-white rounded-2xl flex flex-col items-center justify-center shadow-inner relative transition-transform hover:scale-105 duration-300">
                       <span className="absolute bottom-3 right-3 text-[10px] opacity-60 font-semibold uppercase">Rung Nhĩ</span>
                       <span className="text-3xl sm:text-4xl font-black mb-2">398</span>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Data Leakage */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="col-span-1 lg:col-span-12 bg-white/80 backdrop-blur-md rounded-[2rem] p-8 md:p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-8 relative overflow-hidden"
          >
            <div className="absolute -right-20 -bottom-20 opacity-[0.03] pointer-events-none">
               <Lock className="w-96 h-96" />
            </div>
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 relative z-10">
              <Lock className="w-8 h-8" />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-slate-900 mb-3">Chống rò rỉ dữ liệu (Data Leakage)</h3>
              <p className="text-slate-600 leading-relaxed max-w-4xl text-lg">
                Sử dụng phương pháp <strong className="text-slate-900">GroupKFold</strong>, dữ liệu huấn luyện và kiểm thử được chia tách nghiêm ngặt theo ID Bệnh nhân. Điều này đảm bảo AI không "học vẹt" bệnh nhân mà thực sự nhận diện được các đặc trưng cốt lõi của bệnh lý, mang lại kết quả khách quan tuyệt đối khi triển khai thực tế.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}


import { motion } from "framer-motion"
import { Cpu, HeartPulse, ActivitySquare, TrendingUp, HelpCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const timeFeatures = [
  { name: "HR_mean", desc: "Nhịp tim trung bình trong khung cửa sổ." },
  { name: "Mean_NN", desc: "Khoảng thời gian trung bình giữa các nhịp bình thường (RR interval)." },
  { name: "SDNN", desc: "Độ lệch chuẩn của khoảng NN, đánh giá mức độ biến thiên tổng thể." },
  { name: "RMSSD", desc: "Căn bậc hai trung bình bình phương sai số chuỗi kề. Cực kỳ quan trọng để phát hiện hoạt động phó giao cảm đột ngột." },
  { name: "NN50", desc: "Số lượng các nhịp liên tiếp chênh lệch > 50ms." },
  { name: "pNN50", desc: "Tỷ lệ phần trăm các nhịp liên tiếp chênh lệch > 50ms." },
  { name: "CV", desc: "Hệ số biến thiên (Coefficient of Variation)." },
]

const freqFeatures = [
  { name: "LF", desc: "Công suất dải tần số thấp (Low Frequency: 0.04 - 0.15 Hz)." },
  { name: "HF", desc: "Công suất dải tần số cao (High Frequency: 0.15 - 0.40 Hz)." },
  { name: "LF_norm", desc: "Công suất dải tần số thấp được chuẩn hóa." },
  { name: "HF_norm", desc: "Công suất dải tần số cao được chuẩn hóa." },
  { name: "LF_HF_Ratio", desc: "Tỷ lệ LF/HF, thể hiện sự cân bằng giữa thần kinh giao cảm và phó giao cảm." },
  { name: "Total_Power", desc: "Tổng năng lượng tín hiệu trên toàn phổ." },
]

const nonLinearFeatures = [
  { name: "SD1", desc: "Phân tích đồ thị Poincaré Plot: Thể hiện độ lệch chuẩn của biến thiên nhịp tim ngắn hạn." },
  { name: "SD2", desc: "Phân tích đồ thị Poincaré Plot: Thể hiện độ lệch chuẩn của biến thiên nhịp tim dài hạn." },
  { name: "SampEn", desc: "Entropy Mẫu (Sample Entropy) đo lường mức độ phức tạp, bất thường và khó đoán của chuỗi nhịp." },
]

function FeatureCard({ name, desc }: { name: string, desc: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
        <ActivitySquare className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
      </div>
      <div>
        <h4 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
          {name}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-slate-300 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[200px] text-xs">Chỉ số sinh học trích xuất từ sóng thô</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h4>
        <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

export function AIFeaturesSection() {
  return (
    <section className="w-full py-24 relative bg-transparent">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-bold w-fit mb-6 shadow-sm border border-purple-200"
          >
            <Cpu className="w-4 h-4" />
            Feature Engineering
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
          >
            16 Đặc Trưng Sinh Học Cốt Lõi
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Hệ thống AI không nhìn vào tín hiệu thô một cách máy móc, mà phân tách chúng thành 16 chỉ số Biến Thiên Nhịp Tim (HRV) mang ý nghĩa y khoa sâu sắc.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <Tabs defaultValue="time" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white p-1 rounded-xl shadow-sm border border-slate-100 h-auto">
              <TabsTrigger value="time" className="py-3 text-sm md:text-base data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg font-semibold flex items-center gap-2">
                <HeartPulse className="w-4 h-4 hidden md:block" /> Miền Thời Gian
              </TabsTrigger>
              <TabsTrigger value="freq" className="py-3 text-sm md:text-base data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 rounded-lg font-semibold flex items-center gap-2">
                <ActivitySquare className="w-4 h-4 hidden md:block" /> Miền Tần Số
              </TabsTrigger>
              <TabsTrigger value="nonlinear" className="py-3 text-sm md:text-base data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 rounded-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 hidden md:block" /> Phi Tuyến Tính
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-8">
              <TabsContent value="time" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {timeFeatures.map((feat) => (
                    <FeatureCard key={feat.name} name={feat.name} desc={feat.desc} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="freq" className="mt-0">
                <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl mb-6 text-sm text-purple-800 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping shrink-0" />
                  Được tính toán bằng cách nội suy chuỗi RR ở tần số 4Hz để phân tích phổ năng lượng chính xác.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {freqFeatures.map((feat) => (
                    <FeatureCard key={feat.name} name={feat.name} desc={feat.desc} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="nonlinear" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nonLinearFeatures.map((feat) => (
                    <FeatureCard key={feat.name} name={feat.name} desc={feat.desc} />
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>

      </div>
    </section>
  )
}

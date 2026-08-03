import { motion } from "framer-motion"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, BarChart, LabelList, Cell } from "recharts"
import { BrainCircuit, Trophy, Target, ShieldCheck } from "lucide-react"

const benchmarkData = [
  { 
    name: "1360 Mẫu", 
    model: "Stacking Ensemble", 
    accuracy: 97.79, 
    recall: 98.66, 
    f1: 98.00, 
    roc: 0.9940, 
    fn: 2 
  },
  { 
    name: "4083 Mẫu", 
    model: "Stacking Ensemble", 
    accuracy: 98.65, 
    recall: 99.11, 
    f1: 98.78, 
    roc: 0.9992, 
    fn: 4 
  },
  { 
    name: "8165 Mẫu", 
    model: "Neural Network / MLP", 
    accuracy: 98.71, 
    recall: 99.78, 
    f1: 98.84, 
    roc: 0.9979, 
    fn: 2 
  },
  { 
    name: "16358 Mẫu", 
    model: "XGBoost (Tuned)", 
    accuracy: 98.62, 
    recall: 99.61, 
    f1: 98.76, 
    roc: 0.9979, 
    fn: 7 
  },
]

export function AIBenchmarkSection() {
  return (
    <section className="w-full py-24 relative overflow-hidden bg-transparent">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute top-40 -left-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-bold w-fit mb-6 shadow-sm border border-blue-200"
          >
            <BrainCircuit className="w-4 h-4" />
            AI Benchmark
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
          >
            Hiệu Suất Vượt Trội Của Khối Óc Nhân Tạo
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Hệ thống chọn lọc các thuật toán ưu việt nhất <span className="font-bold text-slate-800">(Neural Network, XGBoost, Stacking Ensemble)</span>, được kiểm định khắt khe qua 4 cấp độ quy mô dữ liệu.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
          {/* Stats Column */}
          <div className="col-span-1 lg:col-span-4 space-y-6 flex flex-col justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 flex-1"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">98.71%</h3>
                  <p className="text-slate-500 font-medium text-sm">Đỉnh Accuracy (8,165 Mẫu)</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 border-t border-slate-100 pt-4 mt-2">
                Độ chính xác kỷ lục được thiết lập bởi <strong>Neural Network / MLP</strong>. Sẵn sàng phân tích từng nhịp đập của bạn với sự tự tin tuyệt đối.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 flex-1 flex flex-col"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">99.78%</h3>
                  <p className="text-slate-500 font-medium text-sm">Đỉnh Recall (8,165 Mẫu)</p>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4 mt-auto">
                <p className="text-sm text-slate-600 mb-3">
                  Trong y tế, không được bỏ sót bệnh nhân. Tại hiệu suất đỉnh, mô hình chỉ bỏ sót <span className="font-bold text-rose-500">2 ca duy nhất</span>.
                </p>
                {/* Confusion Matrix Mini */}
                <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-2 gap-2 border border-slate-100">
                  <div className="bg-emerald-50 rounded-lg p-2 text-center border border-emerald-100">
                    <div className="text-[10px] text-emerald-600 font-semibold mb-1 uppercase tracking-wider">True Positive</div>
                    <div className="text-lg font-black text-emerald-700">906 ca</div>
                  </div>
                  <div className="bg-rose-50 rounded-lg p-2 text-center border border-rose-100">
                    <div className="text-[10px] text-rose-500 font-semibold mb-1 uppercase tracking-wider">False Negative</div>
                    <div className="text-lg font-black text-rose-600">2 ca</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts Column */}
          <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              {/* Accuracy Chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col"
              >
                <div className="mb-4 text-center">
                  <h3 className="text-sm font-bold text-slate-900">So Sánh Accuracy Mô Hình Top 1</h3>
                </div>
                <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={benchmarkData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                      <YAxis domain={[95, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="accuracy" radius={[6, 6, 0, 0]} maxBarSize={60}>
                        {benchmarkData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.accuracy === 98.71 ? "#1e40af" : "#3b82f6"} fillOpacity={entry.accuracy === 98.71 ? 1 : 0.7} />
                        ))}
                        <LabelList dataKey="accuracy" position="top" formatter={(val: any) => `${val}%`} fill="#334155" fontSize={11} fontWeight="bold" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Recall Chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col"
              >
                <div className="mb-4 text-center">
                  <h3 className="text-sm font-bold text-slate-900">So Sánh Recall (Sensitivity) Mô Hình Top 1</h3>
                </div>
                <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={benchmarkData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                      <YAxis domain={[95, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="recall" radius={[6, 6, 0, 0]} maxBarSize={60}>
                        {benchmarkData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.recall === 99.78 ? "#047857" : "#10b981"} fillOpacity={entry.recall === 99.78 ? 1 : 0.7} />
                        ))}
                        <LabelList dataKey="recall" position="top" formatter={(val: any) => `${val}%`} fill="#334155" fontSize={11} fontWeight="bold" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden"
        >
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900">BẢNG TỔNG HỢP: SO SÁNH MÔ HÌNH TỐI ƯU NHẤT QUA CÁC QUY MÔ DỮ LIỆU</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 font-semibold text-right">Quy Mô Data</th>
                  <th className="px-6 py-4 font-semibold text-right">Model</th>
                  <th className="px-6 py-4 font-semibold text-center">Accuracy</th>
                  <th className="px-6 py-4 font-semibold text-center">Recall (Sensitivity)</th>
                  <th className="px-6 py-4 font-semibold text-center">F1-Score</th>
                  <th className="px-6 py-4 font-semibold text-center">ROC-AUC</th>
                  <th className="px-6 py-4 font-semibold text-center text-rose-500">False Negative (FN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {benchmarkData.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 text-right whitespace-nowrap">{row.name}</td>
                    <td className="px-6 py-4 text-slate-600 text-right whitespace-nowrap">{row.model}</td>
                    <td className={`px-6 py-4 text-center font-bold ${row.accuracy === 98.71 ? 'bg-blue-50 text-blue-700' : 'text-slate-700'}`}>
                      {row.accuracy}%
                    </td>
                    <td className={`px-6 py-4 text-center font-bold ${row.recall === 99.78 ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700'}`}>
                      {row.recall}%
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600">{row.f1.toFixed(2)}%</td>
                    <td className="px-6 py-4 text-center text-slate-600">{row.roc.toFixed(4)}</td>
                    <td className="px-6 py-4 text-center font-bold text-rose-500">{row.fn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </section>
  )
}

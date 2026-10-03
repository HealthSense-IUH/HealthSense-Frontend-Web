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
import { useTranslation } from "react-i18next"

/** Trọng số XAI; tên + ý nghĩa lấy từ landing:benchmark.chart.items.<key> lúc render. */
const XAI_WEIGHTS = [
  { key: "rmssd", value: 28 },
  { key: "sampEn", value: 22 },
  { key: "sd1", value: 15 },
  { key: "pnn50", value: 12 },
  { key: "lfHf", value: 9 },
  { key: "cv", value: 6 },
] as const

export function AIClinicalBenchmarkSection() {
  const { t } = useTranslation("landing")
  const easyXaiData = XAI_WEIGHTS.map(({ key, value }) => ({
    name: t(`benchmark.chart.items.${key}.name`),
    value,
    meaning: t(`benchmark.chart.items.${key}.meaning`),
  })).reverse()

  return (
    <section className="w-full py-20 sm:py-28 relative overflow-hidden bg-gradient-to-b from-slate-50/50 via-white to-slate-50/70 border-t border-slate-200/80">
      
      {/* Ambient soft glow */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-success-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        
        {/* ================= SECTION HEADER ================= */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success-50 border border-success-200 text-success-700 text-xs font-bold font-heading uppercase tracking-wider mb-3"
          >
            <ShieldCheck className="w-4 h-4 text-success-600" />
            <span>{t("benchmark.badge")}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight text-slate-900 leading-tight uppercase mb-4"
          >
            {t("benchmark.titleLine1")} <br />
            <span className="bg-gradient-to-r from-success-600 via-primary-600 to-primary-700 bg-clip-text text-transparent">
              {t("benchmark.titleLine2")}
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-600 text-sm sm:text-base leading-relaxed font-sans"
          >
            {t("benchmark.intro")}
          </motion.p>
        </div>

        {/* ================= 3 BIG VALUE PILLARS (EASY TO GRASP) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          
          {/* Card 1: Accuracy */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-primary-300 transition-all"
          >
            <div className="w-11 h-11 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
              <Target className="w-6 h-6" />
            </div>
            <span className="text-3xl sm:text-4xl font-black font-heading text-slate-900 block mb-1">
              98.65%
            </span>
            <h3 className="text-sm font-bold font-heading text-slate-800 uppercase tracking-tight mb-2">
              {t("benchmark.pillars.accuracy.title")}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              {t("benchmark.pillars.accuracy.desc")}
            </p>
          </motion.div>

          {/* Card 2: Recall (Sensitivity) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-success-300 transition-all"
          >
            <div className="w-11 h-11 rounded-2xl bg-success-50 text-success-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-3xl sm:text-4xl font-black font-heading text-success-600 block mb-1">
              99.78%
            </span>
            <h3 className="text-sm font-bold font-heading text-slate-800 uppercase tracking-tight mb-2">
              {t("benchmark.pillars.recall.title")}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              {t("benchmark.pillars.recall.desc")}
            </p>
          </motion.div>

          {/* Card 3: Speed */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-primary-300 transition-all"
          >
            <div className="w-11 h-11 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-3xl sm:text-4xl font-black font-heading text-primary-600 block mb-1">
              &lt; 100ms
            </span>
            <h3 className="text-sm font-bold font-heading text-slate-800 uppercase tracking-tight mb-2">
              {t("benchmark.pillars.speed.title")}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              {t("benchmark.pillars.speed.desc")}
            </p>
          </motion.div>

        </div>

        {/* ================= SECTION 2: WHY AI CONCLUDES (XAI EXPLAINABILITY) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Left: Visual Infographic of Top 3 Signs */}
          <div className="col-span-1 lg:col-span-6 bg-white p-7 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between h-full">
            <div>
              <h3 className="text-lg sm:text-xl font-black font-heading text-slate-900 mb-2">
                {t("benchmark.xai.title")}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans mb-6">
                {t("benchmark.xai.intro")}
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-heading font-black text-xs shrink-0">
                    28%
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-heading text-slate-900">{t("benchmark.xai.signs.rmssd.title")}</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">{t("benchmark.xai.signs.rmssd.desc")}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-heading font-black text-xs shrink-0">
                    22%
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-heading text-slate-900">{t("benchmark.xai.signs.sampEn.title")}</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">{t("benchmark.xai.signs.sampEn.desc")}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-success-100 text-success-700 flex items-center justify-center font-heading font-black text-xs shrink-0">
                    15%
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-heading text-slate-900">{t("benchmark.xai.signs.sd1.title")}</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">{t("benchmark.xai.signs.sd1.desc")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 font-sans">
              <CheckCircle2 className="w-4 h-4 text-success-600 shrink-0" />
              <span>{t("benchmark.xai.footnote")}</span>
            </div>
          </div>

          {/* Right: Feature Importance Bar Chart */}
          <div className="col-span-1 lg:col-span-6 bg-white p-7 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col h-full">
            <h4 className="text-xs font-bold font-heading text-slate-800 uppercase tracking-wider mb-2">
              {t("benchmark.chart.title")}
            </h4>
            <p className="text-[11px] text-slate-500 mb-4 font-sans">
              {t("benchmark.chart.subtitle")}
            </p>

            <div className="flex-1 min-h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={easyXaiData} layout="vertical" margin={{ top: 0, right: 35, left: 10, bottom: 0 }}>
                  <XAxis type="number" hide domain={[0, 32]} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-slate-600)', fontSize: 11, fontWeight: 600 }} width={160} />
                  <Tooltip cursor={{ fill: 'var(--color-primary-50)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-slate-200)', fontSize: '11px' }} />
                  <Bar dataKey="value" fill="var(--color-primary-500)" radius={[0, 4, 4, 0]} barSize={16}>
                    <LabelList dataKey="value" position="right" formatter={(val: React.ReactNode) => `${String(val)}%`} style={{ fill: 'var(--color-slate-500)', fontSize: 11, fontWeight: 600 }} />
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

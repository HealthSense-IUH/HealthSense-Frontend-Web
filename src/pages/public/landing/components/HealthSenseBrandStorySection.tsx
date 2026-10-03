import { motion } from "framer-motion"
import { HeartPulse, ArrowDown } from "lucide-react"
import { useTranslation } from "react-i18next"

/**
 * Bộ giá trị C.A.R.E. `enTitle` là từ khoá thương hiệu (giữ tiếng Anh ở mọi ngôn ngữ);
 * tiêu đề phụ và mô tả lấy từ landing:brandStory.values.<key> lúc render.
 */
const coreValues = [
  {
    key: "continuous",
    letter: "C",
    enTitle: "Continuous",
    letterColor: "text-primary-400",
  },
  {
    key: "accuracy",
    letter: "A",
    enTitle: "Accuracy",
    letterColor: "text-success-300",
  },
  {
    key: "realtime",
    letter: "R",
    enTitle: "Real-time",
    letterColor: "text-primary-400",
  },
  {
    key: "expertCare",
    letter: "E",
    enTitle: "Expert Care",
    letterColor: "text-primary-400",
  },
] as const

export function HealthSenseBrandStorySection() {
  const { t } = useTranslation("landing")
  return (
    <section className="w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-700 to-slate-950 text-white py-20 sm:py-28">
      
      {/* Abstract Graphic Background Shapes & Lighting */}
      <div className="absolute top-0 right-0 w-[650px] h-[650px] bg-gradient-to-bl from-primary-500/25 via-primary-600/15 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-primary-600/20 via-primary-700/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
      
      {/* Subtle Angular Overlay Shards */}
      <div className="absolute -top-12 right-1/4 w-96 h-96 border border-white/10 rounded-[3rem] rotate-12 bg-white/[0.02] backdrop-blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-10 w-80 h-80 border border-white/10 rounded-[2.5rem] -rotate-12 bg-white/[0.015] pointer-events-none" />

      {/* Mini ECG Pulse Line Watermark */}
      <svg className="absolute inset-0 w-full h-full stroke-white/[0.04] fill-none pointer-events-none" viewBox="0 0 1000 600">
        <path d="M 0 300 L 200 300 L 240 220 L 270 380 L 300 300 L 500 300 L 540 180 L 580 420 L 620 300 L 1000 300" strokeWidth="2" />
      </svg>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        
        {/* ================= TOP SECTION: WHAT'S HEALTHSENSE ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-end mb-16 sm:mb-24">
          
          {/* Left Column: Brand Logo + Giant 3D Layered Title */}
          <div className="lg:col-span-7 flex flex-col">
            
            {/* Brand Pill Logo */}
            <div className="inline-flex items-center gap-2 mb-6 sm:mb-8">
              <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white backdrop-blur-md shadow-sm">
                <HeartPulse className="w-5 h-5 text-primary-300" />
              </div>
              <span className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white uppercase">
                HEALTHSENSE
              </span>
            </div>

            {/* Giant Stacked Typographic Headline (Exact Reference Styling) */}
            <div className="relative select-none">
              
              {/* Layer 1: Giant WHAT'S */}
              <div className="relative">
                {/* 3D Offset Shadow */}
                <span className="text-6xl sm:text-8xl lg:text-[104px] font-black font-heading tracking-tighter leading-[0.9] text-primary-950/70 absolute top-1.5 left-1.5 uppercase -z-10">
                  WHAT&apos;S
                </span>
                <h2 className="text-6xl sm:text-8xl lg:text-[104px] font-black font-heading tracking-tighter leading-[0.9] text-white uppercase drop-shadow-md">
                  WHAT&apos;S
                </h2>
              </div>

              {/* Layer 2: Giant HEALTHSENSE */}
              <div className="relative mt-1 sm:mt-2">
                {/* 3D Offset Shadow */}
                <span className="text-5xl sm:text-7xl lg:text-[92px] font-black font-heading tracking-tighter leading-[0.9] text-primary-950/70 absolute top-1.5 left-1.5 uppercase -z-10">
                  HEALTHSENSE
                </span>
                <h2 className="text-5xl sm:text-7xl lg:text-[92px] font-black font-heading tracking-tighter leading-[0.9] text-white uppercase drop-shadow-md">
                  HEALTHSENSE
                </h2>
              </div>

            </div>

          </div>

          {/* Right Column: Mission Paragraph + Action Circle Button */}
          <div className="lg:col-span-5 flex items-end justify-between gap-6 pt-4 lg:pt-0">
            <p className="text-xs sm:text-sm text-primary-100/90 leading-relaxed max-w-md font-sans">
              {t("brandStory.mission")}
            </p>

            {/* Circular Arrow Badge */}
            <button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
              }}
              aria-label={t("brandStory.scrollToFeatures")}
              className="w-12 h-12 rounded-full bg-primary-600/80 hover:bg-primary-500 border border-primary-400/30 text-white flex items-center justify-center shadow-lg shadow-primary-950/40 shrink-0 hover:scale-110 active:scale-95 transition-all cursor-pointer group"
            >
              <ArrowDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>

        </div>

        {/* ================= MIDDLE SECTION: OUR STORY (2 COLUMNS) ================= */}
        <div className="border-t border-white/15 pt-12 sm:pt-16 mb-20 sm:mb-28">
          
          {/* Subheading: Our story */}
          <motion.h3 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-white mb-8 italic"
          >
            Our story
          </motion.h3>

          {/* Two Editorial Narrative Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-14 text-xs sm:text-sm text-primary-100/80 leading-relaxed font-sans">
            
            {/* Story Column 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <p>
                {t("brandStory.story.p1")}
              </p>
              <p>
                {t("brandStory.story.p2")}
              </p>
            </motion.div>

            {/* Story Column 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <p>
                {t("brandStory.story.p3")}
              </p>
              <p>
                {t("brandStory.story.p4")}
              </p>
            </motion.div>

          </div>

        </div>

        {/* ================= BOTTOM SECTION: NEXT CORE VALUE STAIRCASE ================= */}
        <div className="border-t border-white/15 pt-12 sm:pt-16">
          
          {/* Header of Core Value */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 sm:mb-16">
            <div>
              <h3 className="text-2xl sm:text-4xl font-black font-heading tracking-tight text-white uppercase">
                C.A.R.E Core Values
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-primary-100/70 max-w-md font-sans">
              {t("brandStory.valuesIntro")}
            </p>
          </div>

          {/* 4 Core Value Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {coreValues.map((val, idx) => (
              <motion.div
                key={val.letter}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative group flex flex-col"
              >
                {/* Giant Stylized Letter (Completely above card, 100% visible) */}
                <div className="mb-3 select-none flex items-baseline justify-between px-1">
                  <span className={`text-6xl sm:text-7xl lg:text-8xl font-black font-heading italic tracking-tighter leading-none transition-colors duration-300 drop-shadow-md ${val.letterColor}`}>
                    {val.letter}
                  </span>
                  <span className="text-xs font-mono text-white/40 font-bold">0{idx + 1}</span>
                </div>

                {/* Translucent Frosted Glass Card Attached Cleanly Below */}
                <div className="relative flex-1 p-5 sm:p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/40 hover:bg-white/[0.14] transition-all duration-300 group-hover:-translate-y-1 shadow-xl shadow-black/25 flex flex-col justify-between">
                  
                  <div>
                    {/* Top Keyword */}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base sm:text-lg font-black font-heading text-white">
                        {val.enTitle}
                      </span>
                    </div>

                    {/* Vietnamese Title Text */}
                    <span className="text-xs font-bold font-heading text-primary-300 block mb-3">
                      {t(`brandStory.values.${val.key}.title`)}
                    </span>

                    {/* Description Copy */}
                    <p className="text-xs text-primary-100/85 leading-relaxed font-sans">
                      {t(`brandStory.values.${val.key}.desc`)}
                    </p>
                  </div>

                  {/* Subtle Bottom Accent Indicator */}
                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="w-8 h-1 rounded-full bg-gradient-to-r from-primary-400 to-transparent group-hover:w-14 transition-all duration-300" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-400 opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all" />
                  </div>

                </div>

              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  )
}



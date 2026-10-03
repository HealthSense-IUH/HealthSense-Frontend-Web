import { useState } from "react"
import { motion } from "framer-motion"
import { 
  HeartPulse, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  ShieldCheck,
  Zap,
  Sliders
} from "lucide-react"
import { useTranslation } from "react-i18next"

type StageId = "stage-1" | "stage-2" | "stage-3"

/**
 * Cấu trúc từng bước; chữ hiển thị lấy từ landing:pipeline.stages.<key>.* lúc render
 * (bullets.<bulletKey>, specs.<specKey>.label / .value).
 */
interface PipelineStageData {
  id: StageId
  key: "stage1" | "stage2" | "stage3"
  stepNum: string
  bulletKeys: string[]
  specKeys: string[]
}

const stagesData: Record<StageId, PipelineStageData> = {
  "stage-1": {
    id: "stage-1",
    key: "stage1",
    stepNum: "1",
    bulletKeys: ["b1", "b2", "b3", "b4"],
    specKeys: ["samplingRate", "motionDenoise", "processingTime", "beatAccuracy"]
  },
  "stage-2": {
    id: "stage-2",
    key: "stage2",
    stepNum: "2",
    bulletKeys: ["b1", "b2", "b3", "b4"],
    specKeys: ["metrics", "coverage", "dataSync", "computeTime"]
  },
  "stage-3": {
    id: "stage-3",
    key: "stage3",
    stepNum: "3",
    bulletKeys: ["b1", "b2", "b3", "b4"],
    specKeys: ["mechanism", "accuracy", "sensitivity", "alertSpeed"]
  }
}

export function AIPipelineSection() {
  const { t } = useTranslation("landing")
  const [activeStage, setActiveStage] = useState<StageId>("stage-1")
  const [isNoiseSimulated, setIsNoiseSimulated] = useState(false)
  const [simulatedSample, setSimulatedSample] = useState<"normal" | "afib">("normal")

  const current = stagesData[activeStage]
  const stageText = (stage: PipelineStageData, field: "title" | "subtitle" | "tagline" | "summary") =>
    t(`pipeline.stages.${stage.key}.${field}`)
  const sampleConf = (normalPct: string, afibPct: string) =>
    simulatedSample === "normal"
      ? t("pipeline.stage3Viz.stable", { pct: normalPct })
      : t("pipeline.stage3Viz.arrhythmia", { pct: afibPct })

  return (
    <section className="w-full py-24 sm:py-32 relative bg-slate-950 text-white overflow-hidden border-t border-white/10">
      
      {/* Premium Deep Dark Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-primary-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[400px] bg-primary-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ================= SECTION HEADER ================= */}
        <div className="text-center mb-14 sm:mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-500/10 border border-primary-400/30 text-primary-300 text-xs font-bold font-heading mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-primary-400" />
            <span>{t("pipeline.badge")}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 text-white font-heading tracking-tight uppercase">
            {t("pipeline.title")}
          </h2>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-sans">
            {t("pipeline.intro")}
          </p>
        </div>

        {/* ================= 3-STAGE STEPER TABS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {(["stage-1", "stage-2", "stage-3"] as StageId[]).map((stageKey) => {
            const item = stagesData[stageKey]
            const isActive = activeStage === stageKey

            return (
              <button
                key={item.id}
                onClick={() => setActiveStage(stageKey)}
                className={`relative text-left p-5 sm:p-6 rounded-2xl transition-all duration-300 cursor-pointer border flex flex-col justify-between overflow-hidden ${
                  isActive 
                    ? "bg-white/[0.12] border-primary-400/80 shadow-2xl shadow-primary-950/60 backdrop-blur-xl scale-[1.02] ring-2 ring-primary-400/30" 
                    : "bg-white/[0.04] border-white/10 hover:bg-white/[0.07] text-slate-300"
                }`}
              >
                {/* Active Top Glow Line */}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabGlow"
                    className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-400" 
                  />
                )}

                <div className="flex items-center justify-between mb-3 mt-1">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    isActive ? "bg-primary-500/20 text-primary-300 border border-primary-500/40" : "bg-white/10 text-slate-400"
                  }`}>
                    {t("pipeline.stepLabel", { num: item.stepNum })}
                  </span>
                  
                  <div className={`w-3 h-3 rounded-full ${isActive ? "bg-primary-400 ring-4 ring-primary-500/20 animate-pulse" : "bg-white/20"}`} />
                </div>

                <div>
                  <h3 className={`text-base sm:text-lg font-black font-heading leading-snug mb-1.5 ${
                    isActive ? "text-white" : "text-slate-200"
                  }`}>
                    {stageText(item, "title")}
                  </h3>
                  <span className="text-xs text-slate-400 font-sans line-clamp-2 leading-relaxed">
                    {stageText(item, "subtitle")}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* ================= STAGE CONTENT & SMART HEALTH MONITOR ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column (5 Cols): Stage Explanation Card */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-6 rounded-2xl bg-white/[0.05] border border-white/15 backdrop-blur-xl shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-400/30 text-primary-300 text-xs font-bold mb-4 font-heading">
                <span>{t("pipeline.stepLabel", { num: current.stepNum })}</span>
                <span>•</span>
                <span>{t("pipeline.processDetail")}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black font-heading text-white mb-2">
                {stageText(current, "title")}
              </h3>

              <p className="text-xs sm:text-sm font-bold text-primary-400 mb-4 font-heading">
                {stageText(current, "tagline")}
              </p>

              <p className="text-sm text-slate-300 leading-relaxed font-sans mb-6">
                {stageText(current, "summary")}
              </p>

              {/* Bullet Points */}
              <div className="space-y-3 mb-8">
                {current.bulletKeys.map((bulletKey) => (
                  <div key={bulletKey} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                    <span>{t(`pipeline.stages.${current.key}.bullets.${bulletKey}`)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Spec Mini Cards */}
            <div className="grid grid-cols-2 gap-3 pt-5 border-t border-white/10">
              {current.specKeys.map((specKey) => (
                <div key={specKey} className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-[11px] text-slate-400 block mb-0.5 font-medium">{t(`pipeline.stages.${current.key}.specs.${specKey}.label`)}</span>
                  <span className="text-xs sm:text-sm font-black font-heading text-white">{t(`pipeline.stages.${current.key}.specs.${specKey}.value`)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (7 Cols): Smart Health Monitor Visual Card */}
          <div className="lg:col-span-7 flex flex-col rounded-2xl bg-slate-950/90 border border-white/15 shadow-2xl overflow-hidden backdrop-blur-xl">
            
            {/* Monitor Header */}
            <div className="p-4 sm:p-5 bg-white/[0.04] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-500 text-white flex items-center justify-center shadow-md shadow-primary-600/30">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black font-heading text-white">
                    {t("pipeline.monitor.title")}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium font-sans">
                    {t("pipeline.monitor.subtitle")}
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-500/10 border border-success-500/30 text-success-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-success-400 animate-ping" />
                <span className="w-2 h-2 -ml-3.5 rounded-full bg-success-400" />
                <span>{t("pipeline.monitor.live")}</span>
              </div>
            </div>

            {/* Monitor Body */}
            <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between bg-gradient-to-b from-slate-950 to-slate-900/90 min-h-[380px]">
              
              <div className="flex-1 flex flex-col justify-between">
                
                {/* STAGE 1 VISUALIZER: ECG WAVEFORM */}
                {activeStage === "stage-1" && (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary-400" />
                        <span className="text-xs sm:text-sm font-bold font-heading text-white">
                          {t("pipeline.stage1Viz.label")}
                        </span>
                      </div>

                      {/* Noise Toggle Button */}
                      <button
                        onClick={() => setIsNoiseSimulated(!isNoiseSimulated)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs font-heading ${
                          isNoiseSimulated 
                            ? "bg-warning-500/20 text-warning-300 border border-warning-500/40 hover:bg-warning-500/30" 
                            : "bg-success-500/20 text-success-300 border border-success-500/40 hover:bg-success-500/30"
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{isNoiseSimulated ? t("pipeline.stage1Viz.noiseOn") : t("pipeline.stage1Viz.noiseOff")}</span>
                      </button>
                    </div>

                    {/* ECG Monitor Screen (Clean Medical Style) */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/10 relative overflow-hidden shadow-inner">
                      <div className="flex items-center justify-between text-xs font-bold text-success-400 mb-2">
                        <span className="flex items-center gap-1.5">
                          <HeartPulse className="w-3.5 h-3.5 animate-pulse" />
                          {t("pipeline.stage1Viz.heartRate")}
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal font-sans">{t("pipeline.stage1Viz.latency")}</span>
                      </div>

                      {/* SVG Wave */}
                      <svg className="w-full h-32 stroke-primary-400 fill-none" viewBox="0 0 400 100">
                        {/* Grid lines */}
                        <line x1="0" y1="50" x2="400" y2="50" stroke="var(--color-slate-300)" strokeWidth="1" strokeDasharray="4 4" />
                        
                        {/* ECG Wave: Clean vs Noisy */}
                        {isNoiseSimulated ? (
                          <path 
                            d="M 0 50 Q 15 40 30 52 Q 40 65 50 48 L 65 50 L 72 38 L 78 75 L 85 15 L 94 90 L 102 50 L 120 54 Q 135 30 150 56 Q 165 70 180 46 L 195 50 L 202 34 L 208 78 L 215 12 L 224 88 L 232 50 L 250 52 Q 265 35 280 58 Q 295 68 310 44 L 325 50 L 332 36 L 338 76 L 345 14 L 354 92 L 362 50 L 400 50" 
                            stroke="var(--color-primary-400)" 
                            strokeWidth="2.5" 
                          />
                        ) : (
                          <path 
                            d="M 0 50 L 40 50 L 50 42 L 58 58 L 66 50 L 85 50 L 95 15 L 108 85 L 118 50 L 155 50 L 165 42 L 173 58 L 181 50 L 200 50 L 210 15 L 223 85 L 233 50 L 270 50 L 280 42 L 288 58 L 296 50 L 315 50 L 325 15 L 338 85 L 348 50 L 400 50" 
                            stroke="var(--color-success-400)" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                          />
                        )}

                        {/* Detected Peaks */}
                        {!isNoiseSimulated && (
                          <>
                            <circle cx="95" cy="15" r="4" fill="var(--color-success-400)" />
                            <circle cx="210" cy="15" r="4" fill="var(--color-success-400)" />
                            <circle cx="325" cy="15" r="4" fill="var(--color-success-400)" />
                          </>
                        )}
                      </svg>

                      <div className="flex items-center justify-between text-xs text-slate-300 mt-2 pt-2 border-t border-white/10 font-sans">
                        <span>{isNoiseSimulated ? t("pipeline.stage1Viz.statusNoisy") : t("pipeline.stage1Viz.statusClean")}</span>
                        <span className="text-slate-400">{t("pipeline.stage1Viz.beatLocalization")}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 2 VISUALIZER: 16 HRV HEALTH BARS */}
                {activeStage === "stage-2" && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-primary-400" />
                        <span className="text-xs sm:text-sm font-bold font-heading text-white">
                          {t("pipeline.stage2Viz.label")}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-primary-300 bg-primary-950/80 px-3 py-1 rounded-full border border-primary-800">
                        {t("pipeline.stage2Viz.scale")}
                      </span>
                    </div>

                    {/* 8 Featured Metric Bars */}
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 p-4 sm:p-5 rounded-2xl bg-black/50 border border-white/10">
                      {[
                        { key: "deviation", val: "+0.84", h: "84%", col: "bg-primary-400" },
                        { key: "variability", val: "+0.62", h: "62%", col: "bg-primary-400" },
                        { key: "pauses", val: "-0.45", h: "45%", col: "bg-primary-400" },
                        { key: "meanHr", val: "+0.78", h: "78%", col: "bg-primary-400" },
                        { key: "lowFreq", val: "+0.91", h: "91%", col: "bg-primary-400" },
                        { key: "highFreq", val: "+0.53", h: "53%", col: "bg-primary-400" },
                        { key: "respRatio", val: "+0.68", h: "68%", col: "bg-primary-400" },
                        { key: "stability", val: "+0.88", h: "88%", col: "bg-success-400" },
                      ].map((feat) => (
                        <div key={feat.key} className="flex flex-col items-center gap-1.5">
                          <div className="w-full h-24 bg-slate-900 rounded-xl flex items-end p-1 overflow-hidden border border-white/5">
                            <div 
                              className={`w-full ${feat.col} rounded-lg transition-all duration-500 shadow-xs`} 
                              style={{ height: feat.h }} 
                            />
                          </div>
                          <span className="text-[10px] font-bold text-white truncate text-center w-full">{t(`pipeline.stage2Viz.bars.${feat.key}`)}</span>
                          <span className="text-[9px] text-slate-400 font-sans">{feat.val}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3.5 rounded-2xl bg-primary-950/40 border border-primary-800/50 text-xs text-primary-200 font-sans flex items-center justify-between">
                      <span>{t("pipeline.stage2Viz.ready")}</span>
                      <span className="font-bold text-primary-300">{t("pipeline.stage2Viz.synced")}</span>
                    </div>
                  </div>
                )}

                {/* STAGE 3 VISUALIZER: MULTI-AI EVALUATION */}
                {activeStage === "stage-3" && (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold font-heading text-white">
                        {t("pipeline.stage3Viz.label")}
                      </span>

                      {/* Sample Selector Buttons */}
                      <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-full border border-white/10">
                        <button
                          onClick={() => setSimulatedSample("normal")}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer font-heading ${
                            simulatedSample === "normal" 
                              ? "bg-success-600 text-white shadow-xs" 
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {t("pipeline.stage3Viz.sampleNormal")}
                        </button>
                        <button
                          onClick={() => setSimulatedSample("afib")}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer font-heading ${
                            simulatedSample === "afib" 
                              ? "bg-danger-600 text-white shadow-xs" 
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {t("pipeline.stage3Viz.sampleAfib")}
                        </button>
                      </div>
                    </div>

                    {/* 4 AI Model Mini Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { name: t("pipeline.stage3Viz.models.rhythm"), conf: sampleConf("98.9%", "99.4%"), border: "border-primary-500/40" },
                        { name: t("pipeline.stage3Viz.models.rate"), conf: sampleConf("97.8%", "98.7%"), border: "border-primary-500/40" },
                        { name: t("pipeline.stage3Viz.models.pauses"), conf: sampleConf("99.1%", "99.2%"), border: "border-primary-500/40" },
                        { name: t("pipeline.stage3Viz.models.waveform"), conf: sampleConf("98.5%", "98.9%"), border: "border-primary-500/40" },
                      ].map((model) => (
                        <div key={model.name} className={`p-3 rounded-2xl bg-black/50 border ${model.border} text-center`}>
                          <span className="text-[11px] text-slate-400 font-sans block truncate">{model.name}</span>
                          <span className="text-xs font-black font-heading text-white block mt-1">{model.conf}</span>
                        </div>
                      ))}
                    </div>

                    {/* Final Smart Assessment Card */}
                    <div className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-300 ${
                      simulatedSample === "normal" 
                        ? "bg-success-950/50 border-success-500/40 text-success-200" 
                        : "bg-danger-950/50 border-danger-500/40 text-danger-200"
                    }`}>
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          simulatedSample === "normal" ? "bg-success-500/20 text-success-400 border border-success-500/30" : "bg-danger-500/20 text-danger-400 border border-danger-500/30"
                        }`}>
                          {simulatedSample === "normal" ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-400 block font-heading">{t("pipeline.stage3Viz.resultTitle")}</span>
                          <span className="text-sm sm:text-base font-black font-heading block mt-0.5 text-white">
                            {simulatedSample === "normal" ? t("pipeline.stage3Viz.resultNormal") : t("pipeline.stage3Viz.resultAfib")}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/10 text-white border border-white/15 whitespace-nowrap font-heading">
                        {t("pipeline.stage3Viz.accuracy")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Card Bottom Note */}
                <div className="flex items-center justify-between pt-5 mt-4 border-t border-white/10 text-xs text-slate-400 font-sans">
                  <span>{t("pipeline.viewing", { title: stageText(current, "title") })}</span>
                  <span className="inline-flex items-center gap-1 text-success-400 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {t("pipeline.validated")}
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  )
}

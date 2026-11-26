import { useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { CaraMascot } from "@/components/assistant/cara-mascot"
import { AppShellContext } from "@/components/layout/app-shell-context"
import { EcgLine } from "@/components/illustrations"
import { LIFESTYLE_ART } from "@/components/illustrations/lifestyle"
import { cn } from "@/lib/utils"

type AppLoaderProps = {
  message?: string
  className?: string
}

const LOADER_SCENES = [
  LIFESTYLE_ART.familyPark,
  LIFESTYLE_ART.babyParentsLove,
  LIFESTYLE_ART.familyCycling,
] as const

/** Thanh tiến trình sắc nét: gradient Sapphire → Bio-Cyan → Emerald */
function ProgressBar({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full", dark ? "bg-white/15" : "bg-slate-200/80", className)}>
      <div className="loader-sweep h-full w-2/5 rounded-full bg-gradient-to-r from-primary-500 via-cyan-400 to-success-400" />
    </div>
  )
}

/**
 * Màn chờ tải Precision Cardio Family-Friendly:
 * - Trong shell (chuyển trang): thẻ sáng ấm áp có Cara nhún nhảy, sóng ECG chạy và ảnh gia đình nhỏ.
 * - Toàn màn hình (khởi động): nền Flagship Midnight Sapphire nổi bật với Cara, 3 khung ảnh gia đình & sóng ECG phát sáng.
 */
export default function AppLoader({ message, className }: AppLoaderProps) {
  const { t } = useTranslation()
  const insideShell = useContext(AppShellContext) != null
  const hints = [t("appLoader.hints.connect"), t("appLoader.hints.sync"), t("appLoader.hints.prepare")]
  const [hintIndex, setHintIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setHintIndex((i) => (i + 1) % 3), 1800)
    return () => window.clearInterval(timer)
  }, [])

  const hint = message ?? hints[hintIndex]

  if (insideShell) {
    return (
      <div className={cn("flex min-h-[58vh] w-full flex-col items-center justify-center px-6", className)} role="status" aria-live="polite">
        <div className="relative flex w-full max-w-sm flex-col items-center gap-4 overflow-hidden rounded-3xl border border-primary-100 bg-white/95 px-7 py-7 shadow-card">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-brand" aria-hidden="true" />
          <div className="flex items-center gap-3">
            <img
              src={LIFESTYLE_ART.babyParentsLove}
              alt=""
              aria-hidden="true"
              className="h-11 w-11 -rotate-6 rounded-xl border-2 border-white bg-white object-cover shadow-sm ring-1 ring-primary-100"
            />
            <div className="loader-bounce relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50/80 ring-2 ring-primary-100">
              <CaraMascot size={54} mood="happy" />
            </div>
            <img
              src={LIFESTYLE_ART.familyCycling}
              alt=""
              aria-hidden="true"
              className="h-11 w-11 rotate-6 rounded-xl border-2 border-white bg-white object-cover shadow-sm ring-1 ring-cyan-100"
            />
          </div>

          <div className="w-44 text-primary-600 drop-shadow-[0_2px_8px_rgba(37,99,235,0.2)]" aria-hidden="true">
            <EcgLine className="h-8" animated />
          </div>

          <ProgressBar className="w-52" />

          <p className="text-center text-sm font-semibold text-slate-700">
            {hint}
            <span className="loader-dots" aria-hidden="true" />
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-flagship-navy text-white",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_58%_48%_at_50%_42%,rgba(6,182,212,0.24),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center gap-6 px-6">
        {/* 3 khung ảnh gia đình ấm áp + Cara nhún nhảy ở tâm */}
        <div className="relative flex items-center justify-center gap-3">
          <div className="hidden -rotate-6 overflow-hidden rounded-2xl border-2 border-white/85 bg-white p-1 shadow-xl sm:block">
            <img src={LOADER_SCENES[0]} alt="" aria-hidden="true" className="h-16 w-22 rounded-xl object-cover" />
          </div>

          <div className="relative flex items-center justify-center">
            <span className="loader-ripple absolute inset-0 -m-3 rounded-full border-2 border-cyan-300/60" aria-hidden="true" />
            <div className="loader-bounce relative flex h-24 w-24 items-center justify-center rounded-3xl bg-white/95 p-2 shadow-2xl shadow-black/35 ring-2 ring-cyan-300/60">
              <CaraMascot size={76} mood="happy" />
            </div>
          </div>

          <div className="hidden rotate-6 overflow-hidden rounded-2xl border-2 border-white/85 bg-white p-1 shadow-xl sm:block">
            <img src={LOADER_SCENES[1]} alt="" aria-hidden="true" className="h-16 w-22 rounded-xl object-cover" />
          </div>
        </div>

        <div className="w-64 text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.65)]" aria-hidden="true">
          <EcgLine className="h-11" animated />
        </div>

        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="HealthSense" className="h-8 w-8 rounded-lg bg-white/95 p-0.5 object-contain shadow-md" />
            <h1 className="loader-shimmer text-2xl font-extrabold tracking-tight sm:text-3xl">HealthSense</h1>
          </div>
          <p className="text-sm font-medium text-cyan-100/85">{t("brand.slogan")}</p>
        </div>

        <div className="flex w-full flex-col items-center gap-2.5">
          <ProgressBar className="w-64 sm:w-72" dark />
          <p className="text-xs font-semibold text-cyan-100/90">
            {hint}
            <span className="loader-dots" aria-hidden="true" />
          </p>
        </div>
      </div>
    </div>
  )
}

import { useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { AppShellContext } from "@/components/layout/app-shell-context"
import { EcgLine } from "@/components/illustrations"
import { cn } from "@/lib/utils"

type AppLoaderProps = {
  message?: string
  className?: string
}

/** Thanh tiến trình sắc nét: gradient Sapphire → Bio-Cyan */
function ProgressBar({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <div className={cn("h-1.5 overflow-hidden rounded-full", dark ? "bg-white/15" : "bg-slate-200/80", className)}>
      <div className="loader-sweep h-full w-1/3 rounded-full bg-gradient-to-r from-primary-500 via-cyan-400 to-success-400" />
    </div>
  )
}

/**
 * Màn chờ tải Precision Cardio Flagship: nền Midnight Sapphire nổi bật với sóng ECG phát sáng Bio-Cyan.
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
      <div className={cn("flex min-h-[55vh] w-full flex-col items-center justify-center gap-3.5 px-6", className)} role="status" aria-live="polite">
        <div className="w-40 text-primary-600 drop-shadow-[0_2px_10px_rgba(37,99,235,0.22)]">
          <EcgLine className="h-9" animated />
        </div>
        <ProgressBar className="w-48" />
        <p className="text-sm font-semibold text-slate-600">
          {hint}
          <span className="loader-dots" aria-hidden="true" />
        </p>
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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_40%,rgba(6,182,212,0.22),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6 px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/95 shadow-xl shadow-black/30 ring-2 ring-cyan-400/40">
          <img src="/logo.png" alt="HealthSense" className="h-10 w-10 object-contain" />
        </div>

        <div className="w-60 text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]" aria-hidden="true">
          <EcgLine className="h-11" animated />
        </div>

        <div className="flex flex-col items-center gap-1.5 text-center">
          <h1 className="loader-shimmer text-2xl font-extrabold tracking-tight sm:text-3xl">HealthSense</h1>
          <p className="text-sm font-medium text-cyan-100/80">{t("brand.slogan")}</p>
        </div>

        <div className="flex w-full flex-col items-center gap-2.5">
          <ProgressBar className="w-64 sm:w-72" dark />
          <p className="text-xs font-medium text-slate-300">
            {hint}
            <span className="loader-dots" aria-hidden="true" />
          </p>
        </div>
      </div>
    </div>
  )
}

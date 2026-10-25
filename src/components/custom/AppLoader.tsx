import { useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { CaraMascot } from "@/components/assistant/cara-mascot"
import { AppShellContext } from "@/components/layout/app-shell-context"
import { cn } from "@/lib/utils"

type AppLoaderProps = {
  message?: string
  className?: string
}

/** Ngôi sao / chấm màu bay lơ lửng quanh Cara */
const SPARKLES: { x: string; y: string; color: string; size: number; delay: string; star?: boolean }[] = [
  { x: "8%", y: "18%", color: "#fbbf24", size: 18, delay: "0s", star: true },
  { x: "86%", y: "14%", color: "#fb7185", size: 14, delay: "0.6s", star: true },
  { x: "14%", y: "72%", color: "#34d399", size: 12, delay: "1.1s" },
  { x: "90%", y: "66%", color: "#38bdf8", size: 16, delay: "0.3s", star: true },
  { x: "30%", y: "6%", color: "#fb7185", size: 9, delay: "1.6s" },
  { x: "70%", y: "88%", color: "#fbbf24", size: 10, delay: "0.9s" },
  { x: "4%", y: "46%", color: "#38bdf8", size: 8, delay: "2s" },
  { x: "96%", y: "40%", color: "#34d399", size: 11, delay: "1.3s", star: true },
]

function Sparkles() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {SPARKLES.map((s) => (
        <span
          key={`${s.x}-${s.y}`}
          className="loader-sparkle absolute"
          style={{ left: s.x, top: s.y, width: s.size, height: s.size, animationDelay: s.delay }}
        >
          {s.star ? (
            <svg viewBox="-8 -8 16 16" className="h-full w-full">
              <path d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z" fill={s.color} />
            </svg>
          ) : (
            <span className="block h-full w-full rounded-full" style={{ background: s.color }} />
          )}
        </span>
      ))}
    </div>
  )
}

/** Thanh tiến trình vô định: vệt màu quét qua lại trên nền nhạt */
function ProgressBar({ className }: { className?: string }) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-white shadow-inner ring-1 ring-slate-200/70", className)}>
      <div className="loader-sweep h-full w-1/3 rounded-full bg-gradient-to-r from-primary-400 via-success-400 to-primary-500" />
    </div>
  )
}

/**
 * Màn chờ tải. Ngoài khung app (lần đầu mở, đăng nhập xong): toàn màn hình nền sáng pastel, Cara nhún nhảy giữa
 * các ngôi sao, chữ thương hiệu gradient, thanh tiến trình và câu gợi ý xoay vòng. Bên trong khung app (tải một
 * trang lẻ): bản gọn, nền trong suốt, không chiếm cả màn hình.
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
      <div className={cn("flex min-h-[55vh] w-full flex-col items-center justify-center gap-4 px-6", className)} role="status" aria-live="polite">
        <div className="loader-bounce">
          <CaraMascot size={56} mood="thinking" />
        </div>
        <ProgressBar className="w-48" />
        <p className="text-sm font-medium text-muted-foreground">
          {hint}
          <span className="loader-dots" aria-hidden="true" />
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-success-50 text-slate-900",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* lưới chấm + bốn quầng pastel */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{ backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary-200/60 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 -top-10 h-80 w-80 rounded-full bg-warning-200/50 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 h-80 w-80 rounded-full bg-success-200/50 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-danger-200/40 blur-3xl" aria-hidden="true" />

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center gap-8 px-6">
        {/* Cara nhún nhảy giữa các ngôi sao */}
        <div className="relative flex h-48 w-full items-center justify-center">
          <Sparkles />
          <span className="absolute h-40 w-40 rounded-full bg-white/70 shadow-[0_20px_60px_-20px_rgba(14,165,233,0.45)] ring-1 ring-primary-100" />
          <span className="loader-ripple absolute h-40 w-40 rounded-full border-2 border-primary-300/70" />
          <span className="loader-ripple absolute h-40 w-40 rounded-full border-2 border-success-300/70 [animation-delay:0.7s]" />
          <div className="loader-bounce relative">
            <CaraMascot size={128} />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5 text-center">
          <h1 className="loader-shimmer-bright text-3xl font-extrabold tracking-tight sm:text-4xl">HealthSense</h1>
          <p className="text-sm font-medium text-slate-500">{t("brand.slogan")}</p>
        </div>

        <div className="flex w-full flex-col items-center gap-3">
          <ProgressBar className="w-72 sm:w-80" />
          <p className="text-sm font-semibold text-slate-600">
            {hint}
            <span className="loader-dots" aria-hidden="true" />
          </p>
        </div>
      </div>
    </div>
  )
}

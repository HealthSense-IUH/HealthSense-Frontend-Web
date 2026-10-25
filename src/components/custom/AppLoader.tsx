import { useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { CaraMascot } from "@/components/assistant/cara-mascot"
import { AppShellContext } from "@/components/layout/app-shell-context"
import { cn } from "@/lib/utils"

type AppLoaderProps = {
  message?: string
  className?: string
}

const TRACE =
  "M0 60 H110 L124 60 L134 28 L148 96 L160 40 L170 60 H290 L304 60 L314 24 L328 100 L340 38 L350 60 H470 L484 60 L494 28 L508 96 L520 40 L530 60 H600"

/**
 * Vệt điện tim nhiều màu: chấm sáng chạy dọc đường (animateMotion), nét gradient vẽ theo sau (stroke-dashoffset)
 * rồi mờ đi. Hai chuyển động cùng chu kỳ 3 giây nên luôn khớp nhau.
 */
function EcgTrace({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 120" className={cn("h-auto w-full overflow-visible", className)} aria-hidden="true">
      <defs>
        <linearGradient id="loader-trace-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="0.5" stopColor="#34d399" />
          <stop offset="1" stopColor="#fb7185" />
        </linearGradient>
        <filter id="loader-glow" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d={TRACE} fill="none" stroke="#bae6fd" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      <path
        id="loader-trace"
        d={TRACE}
        fill="none"
        stroke="url(#loader-trace-gradient)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={100}
        className="loader-trace"
        filter="url(#loader-glow)"
      />
      <circle r="6" fill="#fb7185" stroke="#ffffff" strokeWidth="2" filter="url(#loader-glow)">
        <animateMotion dur="3s" repeatCount="indefinite">
          <mpath href="#loader-trace" />
        </animateMotion>
      </circle>
    </svg>
  )
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
      {SPARKLES.map((s, i) => (
        <span
          key={i}
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

/** Số BPM "tăng dần" lúc khởi động cho có cảm giác thiết bị đang bắt tín hiệu */
function useBpm(target = 72) {
  const [bpm, setBpm] = useState(0)
  useEffect(() => {
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1400)
      setBpm(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target])
  return bpm
}

/**
 * Màn chờ tải. Ngoài khung app (lần đầu mở, đăng nhập xong): toàn màn hình nền sáng pastel, Cara nhún nhảy giữa
 * các ngôi sao, điện tim nhiều màu, chữ thương hiệu gradient. Bên trong khung app (tải một trang lẻ): bản gọn,
 * nền trong suốt, không chiếm cả màn hình.
 */
export default function AppLoader({ message, className }: AppLoaderProps) {
  const { t } = useTranslation()
  const insideShell = useContext(AppShellContext) != null
  const bpm = useBpm()
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
        <div className="w-full max-w-md">
          <EcgTrace className="h-20" />
        </div>
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

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-7 px-6">
        {/* Cara nhún nhảy giữa các ngôi sao */}
        <div className="relative flex h-44 w-full items-center justify-center">
          <Sparkles />
          <span className="absolute h-36 w-36 rounded-full bg-white/70 shadow-[0_20px_60px_-20px_rgba(14,165,233,0.45)] ring-1 ring-primary-100" />
          <span className="loader-ripple absolute h-36 w-36 rounded-full border-2 border-primary-300/70" />
          <span className="loader-ripple absolute h-36 w-36 rounded-full border-2 border-success-300/70 [animation-delay:0.7s]" />
          <div className="loader-bounce relative">
            <CaraMascot size={120} />
          </div>
        </div>

        <div className="w-full">
          <EcgTrace className="h-28" />
        </div>

        <div className="flex flex-col items-center gap-1.5 text-center">
          <h1 className="loader-shimmer-bright text-3xl font-extrabold tracking-tight sm:text-4xl">HealthSense</h1>
          <p className="text-sm font-medium text-slate-500">{t("brand.slogan")}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600">
          <span className="inline-flex items-center gap-2 rounded-full border border-danger-100 bg-white px-3 py-1.5 shadow-sm">
            <svg viewBox="0 0 24 24" className="loader-heartbeat h-4 w-4 text-danger-500" fill="currentColor" aria-hidden="true">
              <path d="M12 21s-7-4.6-9.3-8.6C.9 9.3 2.6 5 6.6 5c2 0 3.4 1.1 4.2 2.4C11.6 6.1 13 5 15 5c4 0 5.7 4.3 3.9 7.4C19 16.4 12 21 12 21z" />
            </svg>
            <span className="tabular-nums text-slate-900">{bpm}</span> BPM
          </span>
          <span>
            {hint}
            <span className="loader-dots" aria-hidden="true" />
          </span>
        </div>

        <div className="h-1.5 w-64 overflow-hidden rounded-full bg-white shadow-inner ring-1 ring-slate-200/70">
          <div className="loader-sweep h-full w-1/3 rounded-full bg-gradient-to-r from-primary-400 via-success-400 to-danger-400" />
        </div>
      </div>
    </div>
  )
}

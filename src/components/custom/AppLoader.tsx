import { useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { AppShellContext } from "@/components/layout/app-shell-context"
import { cn } from "@/lib/utils"

type AppLoaderProps = {
  message?: string
  className?: string
}

const HEART = "M60 54 C44 44 34 34 34 22 C34 14 40 8 48 8 C53 8 57 11 60 16 C63 11 67 8 72 8 C80 8 86 14 86 22 C86 34 76 44 60 54 Z"
const TRACE =
  "M0 60 H110 L124 60 L134 28 L148 96 L160 40 L170 60 H290 L304 60 L314 24 L328 100 L340 38 L350 60 H470 L484 60 L494 28 L508 96 L520 40 L530 60 H600"

/**
 * Vệt điện tim phát sáng: chấm sáng chạy dọc đường (animateMotion), nét vẽ theo sau (stroke-dashoffset) rồi mờ đi.
 * Hai chuyển động cùng chu kỳ 3 giây nên luôn khớp nhau.
 */
function EcgTrace({ className, stroke = "#34d399", dot = "#a7f3d0" }: { className?: string; stroke?: string; dot?: string }) {
  return (
    <svg viewBox="0 0 600 120" className={cn("h-auto w-full overflow-visible", className)} aria-hidden="true">
      <defs>
        <filter id="loader-glow" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d={TRACE} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.15" />
      <path
        id="loader-trace"
        d={TRACE}
        fill="none"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={100}
        className="loader-trace"
        filter="url(#loader-glow)"
      />
      <circle r="5" fill={dot} filter="url(#loader-glow)" className="loader-dot">
        <animateMotion dur="3s" repeatCount="indefinite">
          <mpath href="#loader-trace" />
        </animateMotion>
      </circle>
    </svg>
  )
}

/** Trái tim đập hai nhịp với vòng sóng lan ra */
function BeatingHeart({ size = 120 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <span className="loader-ripple absolute inset-0 rounded-full border-2 border-primary-300/60" />
      <span className="loader-ripple absolute inset-0 rounded-full border-2 border-primary-300/60 [animation-delay:0.7s]" />
      <span className="absolute inset-[18%] rounded-full bg-primary-400/15 blur-md" />
      <svg viewBox="30 4 60 54" width={size * 0.5} height={size * 0.45} className="loader-heartbeat relative drop-shadow-[0_0_14px_rgba(56,189,248,0.6)]" aria-hidden="true">
        <defs>
          <linearGradient id="loader-heart" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7dd3fc" />
            <stop offset="1" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        <path d={HEART} fill="url(#loader-heart)" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M44 32 H52 L55 25 L60 40 L64 32 H76" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
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
 * Màn chờ tải. Ngoài khung app (lần đầu mở, đăng nhập xong): toàn màn hình nền navy, điện tim phát sáng, tim đập,
 * thương hiệu ánh kim. Bên trong khung app (tải một trang lẻ): bản gọn, nền trong suốt, không chiếm cả màn hình.
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
        <div className="w-full max-w-md text-primary-500">
          <EcgTrace stroke="#0ea5e9" dot="#38bdf8" className="h-20" />
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
        "relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0b132b] via-[#12284f] to-primary-800 text-white",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.10]"
        style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary-500/25 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-success-400/20 blur-3xl" aria-hidden="true" />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-8 px-6">
        <BeatingHeart />

        <div className="w-full">
          <EcgTrace className="h-28" />
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="loader-shimmer text-3xl font-extrabold tracking-tight sm:text-4xl">HealthSense</h1>
          <p className="text-sm text-slate-300">{t("brand.slogan")}</p>
        </div>

        <div className="flex items-center gap-6 text-xs font-semibold text-slate-300">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-success-400 loader-blink" />
            <span className="tabular-nums text-white">{bpm}</span> BPM
          </span>
          <span>
            {hint}
            <span className="loader-dots" aria-hidden="true" />
          </span>
        </div>

        <div className="h-1 w-56 overflow-hidden rounded-full bg-white/10">
          <div className="loader-sweep h-full w-1/3 rounded-full bg-gradient-to-r from-primary-400 via-success-300 to-primary-400" />
        </div>
      </div>
    </div>
  )
}

import { useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { AppShellContext } from "@/components/layout/app-shell-context"
import { EcgLine } from "@/components/illustrations"
import { cn } from "@/lib/utils"

type AppLoaderProps = {
  message?: string
  className?: string
}

/** Thanh tiến trình gọn: một tông xanh y tế trên nền slate nhạt */
function ProgressBar({ className }: { className?: string }) {
  return (
    <div className={cn("h-1.5 overflow-hidden rounded-full bg-slate-200/80", className)}>
      <div className="loader-sweep h-full w-1/3 rounded-full bg-primary-600" />
    </div>
  )
}

/**
 * Màn chờ tải tối giản theo phong cách Clinical Cool: nền sạch, sóng ECG mảnh đơn sắc, thanh tiến trình gọn.
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
        <div className="w-36 text-primary-600">
          <EcgLine className="h-9" animated />
        </div>
        <ProgressBar className="w-44" />
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
        "relative flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 text-slate-900",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex w-full max-w-md flex-col items-center gap-6 px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-xs">
          <img src="/logo.png" alt="HealthSense" className="h-10 w-10 object-contain" />
        </div>

        <div className="w-56 text-primary-600" aria-hidden="true">
          <EcgLine className="h-10" animated />
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">HealthSense</h1>
          <p className="text-sm font-medium text-slate-500">{t("brand.slogan")}</p>
        </div>

        <div className="flex w-full flex-col items-center gap-2.5">
          <ProgressBar className="w-64 sm:w-72" />
          <p className="text-xs font-medium text-slate-500">
            {hint}
            <span className="loader-dots" aria-hidden="true" />
          </p>
        </div>
      </div>
    </div>
  )
}

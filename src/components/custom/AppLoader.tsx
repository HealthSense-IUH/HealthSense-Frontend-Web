import { useTranslation } from "react-i18next"

import { CaraMascot } from "@/components/assistant/cara-mascot"
import { EcgLine } from "@/components/illustrations"
import { cn } from "@/lib/utils"

type AppLoaderProps = {
  message?: string
  className?: string
}

/** Màn chờ tải app: Cara đang "suy nghĩ" trên nền điện tim chạy. */
export default function AppLoader({ message, className }: AppLoaderProps) {
  const { t } = useTranslation()
  return (
    <div className={cn("app-canvas flex min-h-screen w-full items-center justify-center text-foreground", className)}>
      <div className="flex flex-col items-center gap-5">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
          <div className="absolute inset-2 rounded-full bg-primary/10" />
          <CaraMascot size={72} mood="thinking" />
        </div>
        <div className="w-56 text-primary-400/60">
          <EcgLine className="h-8" animated />
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-xl font-extrabold tracking-tight">HealthSense</h1>
          <p className="animate-pulse text-sm text-muted-foreground">{message ?? t("appLoader.loading")}</p>
        </div>
      </div>
    </div>
  )
}

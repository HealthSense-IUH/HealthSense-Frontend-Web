import { Activity } from "lucide-react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"

type AppLoaderProps = {
  message?: string
  className?: string
}

export default function AppLoader({
  message,
  className,
}: AppLoaderProps) {
  const { t } = useTranslation()
  return (
    <div
      className={cn(
        "flex min-h-screen w-full items-center justify-center bg-background text-foreground",
        className
      )}
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <Activity />
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-xl font-semibold">HealthSense</h1>
          <p className="animate-pulse text-sm text-muted-foreground">{message ?? t("appLoader.loading")}</p>
        </div>
      </div>
    </div>
  )
}

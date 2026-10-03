import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useAuthStore } from "@/stores/auth-store"

export function MemberGreetingBanner() {
  const { t } = useTranslation("health")
  const userSession = useAuthStore((state) => state.userSession)

  const displayName = useMemo(() => {
    if (userSession?.fullName?.trim()) {
      return userSession.fullName.trim()
    }
    if (userSession?.email) {
      return userSession.email.split("@")[0]
    }
    return t("greeting.fallbackName")
  }, [userSession, t])

  const greetingInfo = useMemo(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      return {
        text: t("greeting.morning.text"),
        subtext: t("greeting.morning.subtext"),
      }
    }
    if (hour >= 12 && hour < 18) {
      return {
        text: t("greeting.afternoon.text"),
        subtext: t("greeting.afternoon.subtext"),
      }
    }
    return {
      text: t("greeting.evening.text"),
      subtext: t("greeting.evening.subtext"),
    }
  }, [t])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary-500/20 bg-gradient-to-r from-primary-500/10 via-success-500/5 to-primary-500/10 p-6 sm:p-7 shadow-xs">
      {/* Decorative ambient background blur lights */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-1/3 w-40 h-40 bg-success-400/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-1.5 max-w-2xl">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-foreground flex items-center flex-wrap gap-2">
          <span>{greetingInfo.text},</span>
          <span className="bg-gradient-to-r from-primary-600 via-primary to-primary-600 bg-clip-text text-transparent">
            {displayName}
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {greetingInfo.subtext}
        </p>
      </div>
    </div>
  )
}

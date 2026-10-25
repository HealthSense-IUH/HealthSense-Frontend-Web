import { useMemo } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { HeartPulse, MessagesSquare } from "lucide-react"

import { CaraMascot } from "@/components/assistant/cara-mascot"
import { EcgLine } from "@/components/illustrations"
import { useAuthStore } from "@/stores/auth-store"

/** Băng-rôn chào theo giờ trong ngày: nền gradient thương hiệu, điện tim chạy, Cara ở góc và hai lối tắt hay dùng. */
export function MemberGreetingBanner() {
  const { t } = useTranslation("health")
  const userSession = useAuthStore((state) => state.userSession)

  const displayName = useMemo(() => {
    if (userSession?.fullName?.trim()) return userSession.fullName.trim()
    if (userSession?.email) return userSession.email.split("@")[0]
    return t("greeting.fallbackName")
  }, [userSession, t])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    const slot = hour >= 5 && hour < 12 ? "morning" : hour >= 12 && hour < 18 ? "afternoon" : "evening"
    return { text: t(`greeting.${slot}.text`), subtext: t(`greeting.${slot}.subtext`) }
  }, [t])

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 p-6 text-white shadow-card sm:p-7">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/15 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-2 text-white/25" aria-hidden="true">
        <EcgLine className="h-12" animated />
      </div>

      <div className="relative z-10 flex items-center justify-between gap-6">
        <div className="min-w-0 space-y-3">
          <h2 className="flex flex-wrap items-baseline gap-x-2 text-xl font-extrabold tracking-tight sm:text-2xl">
            <span>{greeting.text},</span>
            <span className="text-primary-100">{displayName}</span>
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-primary-50/90">{greeting.subtext}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              to="/app/general/afib-history"
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-white px-3.5 text-xs font-bold text-primary-700 shadow-sm transition-colors hover:bg-primary-50"
            >
              <HeartPulse className="h-4 w-4" />
              {t("greeting.cta.history")}
            </Link>
            <Link
              to="/app/general/consultations"
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-3.5 text-xs font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <MessagesSquare className="h-4 w-4" />
              {t("greeting.cta.consult")}
            </Link>
          </div>
        </div>
        <div className="hidden shrink-0 motion-safe:animate-float sm:block">
          <CaraMascot size={104} />
        </div>
      </div>
    </div>
  )
}

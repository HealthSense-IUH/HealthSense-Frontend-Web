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
    <div className="relative overflow-hidden rounded-2xl bg-flagship-navy p-6 text-white shadow-[0_14px_36px_-12px_rgba(11,22,44,0.45)] ring-1 ring-white/10 sm:p-7">
      <div
        className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-1 text-cyan-300/35" aria-hidden="true">
        <EcgLine className="h-12" animated />
      </div>

      <div className="relative z-10 flex items-center justify-between gap-6">
        <div className="min-w-0 space-y-2.5">
          <h2 className="flex flex-wrap items-baseline gap-x-2 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            <span>{greeting.text},</span>
            <span className="text-cyan-300">{displayName}</span>
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-slate-200/90">{greeting.subtext}</p>
          <div className="flex flex-wrap gap-2.5 pt-1.5">
            <Link
              to="/app/general/afib-history"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-white px-4 text-xs font-bold text-primary-700 shadow-md shadow-black/15 transition-all hover:bg-cyan-50 hover:-translate-y-0.5"
            >
              <HeartPulse className="h-4 w-4 text-danger-500" />
              {t("greeting.cta.history")}
            </Link>
            <Link
              to="/app/general/consultations"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-4 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <MessagesSquare className="h-4 w-4 text-cyan-200" />
              {t("greeting.cta.consult")}
            </Link>
          </div>
        </div>
        <div className="relative hidden shrink-0 sm:block">
          <div className="pointer-events-none absolute inset-0 -m-2 rounded-full bg-cyan-400/20 blur-md" aria-hidden="true" />
          <div className="relative">
            <CaraMascot size={90} />
          </div>
        </div>
      </div>
    </div>
  )
}

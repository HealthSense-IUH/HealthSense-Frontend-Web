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
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-7">
      <div className="pointer-events-none absolute inset-x-0 bottom-1 text-primary-200/60" aria-hidden="true">
        <EcgLine className="h-10" animated />
      </div>

      <div className="relative z-10 flex items-center justify-between gap-6">
        <div className="min-w-0 space-y-2.5">
          <h2 className="flex flex-wrap items-baseline gap-x-2 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            <span>{greeting.text},</span>
            <span className="text-primary-700">{displayName}</span>
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-slate-600">{greeting.subtext}</p>
          <div className="flex flex-wrap gap-2.5 pt-1.5">
            <Link
              to="/app/general/afib-history"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary-700 px-3.5 text-xs font-semibold text-white transition-colors hover:bg-primary-800"
            >
              <HeartPulse className="h-4 w-4" />
              {t("greeting.cta.history")}
            </Link>
            <Link
              to="/app/general/consultations"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <MessagesSquare className="h-4 w-4 text-slate-500" />
              {t("greeting.cta.consult")}
            </Link>
          </div>
        </div>
        <div className="hidden shrink-0 sm:block">
          <CaraMascot size={88} />
        </div>
      </div>
    </div>
  )
}

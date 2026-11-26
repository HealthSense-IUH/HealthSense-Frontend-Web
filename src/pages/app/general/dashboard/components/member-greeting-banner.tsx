import { useMemo } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { HeartHandshake, HeartPulse, MessagesSquare } from "lucide-react"

import { CaraMascot } from "@/components/assistant/cara-mascot"
import { EcgLine } from "@/components/illustrations"
import { LIFESTYLE_ART } from "@/components/illustrations/lifestyle"
import { useAuthStore } from "@/stores/auth-store"

/** Băng-rôn chào theo giờ trong ngày: nền Flagship Navy, minh hoạ gia đình ấm áp, điện tim chạy và Cara. */
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
    const scenes =
      slot === "morning"
        ? { main: LIFESTYLE_ART.familyPark, side: LIFESTYLE_ART.seniorsMorning }
        : slot === "afternoon"
          ? { main: LIFESTYLE_ART.kidsActive, side: LIFESTYLE_ART.friendsJogging }
          : { main: LIFESTYLE_ART.familyMeal, side: LIFESTYLE_ART.familyPark }
    return {
      text: t(`greeting.${slot}.text`),
      subtext: t(`greeting.${slot}.subtext`),
      scenes,
    }
  }, [t])

  return (
    <div className="relative overflow-hidden rounded-2xl bg-flagship-navy p-5 text-white shadow-[0_14px_36px_-12px_rgba(11,22,44,0.45)] ring-1 ring-white/10 sm:p-6 lg:px-7">
      <div
        className="pointer-events-none absolute -right-12 -top-16 h-60 w-60 rounded-full bg-cyan-400/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-72 rounded-full bg-primary-400/15 blur-3xl"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-1 text-cyan-300/30" aria-hidden="true">
        <EcgLine className="h-12" animated />
      </div>

      <div className="relative z-10 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div className="min-w-0 space-y-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-[11px] font-bold tracking-wide text-cyan-200 backdrop-blur-sm">
            <HeartHandshake className="h-3.5 w-3.5 text-danger-300" />
            {t("common:lifestyle.dashboardTitle")}
          </span>
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

        {/* Bộ tranh minh hoạ gia đình ấm áp + Cara mascot ở phía phải banner */}
        <div className="relative hidden shrink-0 items-center md:flex">
          <div className="hidden -mr-5 -rotate-3 overflow-hidden rounded-2xl border-2 border-white/80 bg-white p-1 shadow-xl lg:block">
            <img
              src={greeting.scenes.side}
              alt={t("common:lifestyle.dashboardTitle")}
              className="h-24 w-32 rounded-xl object-cover xl:h-28 xl:w-36"
            />
          </div>
          <div className="relative z-10 rotate-1 overflow-hidden rounded-2xl border-2 border-white bg-white p-1.5 shadow-2xl">
            <img
              src={greeting.scenes.main}
              alt={t("common:lifestyle.dashboardTitle")}
              className="h-28 w-36 rounded-xl object-cover lg:h-32 lg:w-44"
            />
          </div>
          <div className="relative z-20 -ml-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/40 bg-[#0b162c]/70 shadow-lg backdrop-blur-md">
            <CaraMascot size={52} />
          </div>
        </div>
      </div>
    </div>
  )
}

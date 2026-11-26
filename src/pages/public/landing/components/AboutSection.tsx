import { useTranslation } from "react-i18next"

import {
  HsBellHeartIcon,
  HsFamilyHeartIcon,
  HsHeartPulseIcon,
  HsShieldCareIcon,
} from "@/components/icons/health-icons"
import { LIFESTYLE_ART } from "@/components/illustrations/lifestyle"

/** Về HealthSense: hai đoạn ngắn, bốn giá trị C.A.R.E với bộ icon riêng & bộ tranh gia đình bên phải. */
export function AboutSection() {
  const { t } = useTranslation("landing")
  const values = [
    { key: "continuous", icon: HsHeartPulseIcon, tone: "bg-primary-50 text-primary-600 ring-1 ring-primary-200/70" },
    { key: "accuracy", icon: HsShieldCareIcon, tone: "bg-success-50 text-success-600 ring-1 ring-success-200/70" },
    { key: "realtime", icon: HsBellHeartIcon, tone: "bg-warning-50 text-warning-600 ring-1 ring-warning-200/70" },
    { key: "expertCare", icon: HsFamilyHeartIcon, tone: "bg-danger-50 text-danger-500 ring-1 ring-danger-200/70" },
  ] as const

  return (
    <section className="relative w-full px-4 py-20 sm:px-8 sm:py-24 lg:px-14">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-700">
            {t("about.eyebrow")}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{t("about.title")}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">{t("about.p1")}</p>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">{t("about.p2")}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {values.map(({ key, icon: Icon, tone }) => (
              <div key={key} className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-card">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-bold text-slate-900">{t(`about.values.${key}.title`)}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{t(`about.values.${key}.description`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:col-span-6">
          <div
            className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-primary-500/15 via-cyan-400/12 to-success-400/15 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white p-3 shadow-xl">
            <img
              src={LIFESTYLE_ART.familyPark}
              alt={t("lifestyle.cards.family.title")}
              className="aspect-[4/3] w-full rounded-[1.4rem] object-cover"
            />
          </div>
          <div className="hidden sm:block absolute -bottom-6 -left-6 w-44 -rotate-3 overflow-hidden rounded-2xl border-2 border-white bg-white p-1.5 shadow-xl ring-1 ring-slate-200/80">
            <img
              src={LIFESTYLE_ART.babyParentsLove}
              alt={t("lifestyle.cards.baby.title")}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-xl object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

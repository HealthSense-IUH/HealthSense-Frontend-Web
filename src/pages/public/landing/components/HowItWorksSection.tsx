import { useTranslation } from "react-i18next"
import { BellRing, Stethoscope, Watch } from "lucide-react"

import { LIFESTYLE_ART, type LifestyleArtKey } from "@/components/illustrations/lifestyle"

/** Cách hoạt động: ba bước đơn giản kèm tranh minh hoạ đời thường. */
export function HowItWorksSection() {
  const { t } = useTranslation("landing")
  const steps: ReadonlyArray<{
    key: "wear" | "watch" | "care"
    icon: typeof Watch
    gradient: string
    shadow: string
    art: LifestyleArtKey
  }> = [
    { key: "wear", icon: Watch, gradient: "from-primary-600 to-cyan-500", shadow: "shadow-primary-500/25", art: "seniorsMorning" },
    { key: "watch", icon: BellRing, gradient: "from-danger-500 to-warning-500", shadow: "shadow-danger-500/25", art: "familySleepPeace" },
    { key: "care", icon: Stethoscope, gradient: "from-success-600 to-cyan-500", shadow: "shadow-success-500/25", art: "doctorTeamCare" },
  ]

  return (
    <section className="relative w-full px-4 py-20 sm:px-8 sm:py-24 lg:px-14">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-700">
            {t("how.eyebrow")}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{t("how.title")}</h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">{t("how.subtitle")}</p>
        </div>

        <ol className="relative mt-12 grid gap-6 md:grid-cols-3">
          {steps.map(({ key, icon: Icon, gradient, shadow, art }, index) => (
            <li
              key={key}
              className="group relative flex flex-col items-center overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 text-center shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl"
            >
              <div className="relative mb-4 w-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-2">
                <img
                  src={LIFESTYLE_ART[art]}
                  alt={t(`how.steps.${key}.title`)}
                  loading="lazy"
                  className="aspect-[4/3] w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className={`absolute -bottom-0 right-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg ${shadow} ring-4 ring-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#0b162c] text-xs font-bold text-white shadow-sm tabular-nums">
                  {index + 1}
                </span>
              </div>
              <h3 className="mt-1 text-lg font-bold text-slate-900">{t(`how.steps.${key}.title`)}</h3>
              <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-600">{t(`how.steps.${key}.description`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

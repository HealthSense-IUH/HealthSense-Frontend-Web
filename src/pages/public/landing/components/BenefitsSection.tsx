import { useTranslation } from "react-i18next"

import {
  ConsultationIllustration,
  HeartPulseIllustration,
  NutritionIllustration,
  WearableIllustration,
} from "@/components/illustrations"

/** Bạn nhận được gì: bốn lợi ích nói bằng ngôn ngữ đời thường, mỗi thẻ một minh hoạ. */
export function BenefitsSection() {
  const { t } = useTranslation("landing")
  const items = [
    { key: "monitor", Illustration: WearableIllustration },
    { key: "alert", Illustration: HeartPulseIllustration },
    { key: "doctor", Illustration: ConsultationIllustration },
    { key: "lifestyle", Illustration: NutritionIllustration },
  ] as const

  return (
    <section className="relative w-full bg-white/60 px-4 py-20 sm:px-8 sm:py-24 lg:px-14">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-success-200 bg-success-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-success-700">
            {t("benefits.eyebrow")}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{t("benefits.title")}</h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">{t("benefits.subtitle")}</p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ key, Illustration }) => (
            <article
              key={key}
              className="group flex flex-col rounded-3xl border border-border/70 bg-card p-5 shadow-card transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="mx-auto w-40 transition-transform duration-300 group-hover:scale-105">
                <Illustration />
              </div>
              <h3 className="mt-3 text-lg font-bold text-slate-900">{t(`benefits.items.${key}.title`)}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{t(`benefits.items.${key}.description`)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

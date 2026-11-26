import { useTranslation } from "react-i18next"

import { LIFESTYLE_ART, type LifestyleArtKey } from "@/components/illustrations/lifestyle"

/** Bạn nhận được gì: bốn lợi ích gắn với nhịp sống gia đình, người lớn tuổi, bạn bè và bác sĩ đồng hành. */
export function BenefitsSection() {
  const { t } = useTranslation("landing")
  const items: ReadonlyArray<{
    key: "monitor" | "alert" | "doctor" | "lifestyle"
    art: LifestyleArtKey
    bar: string
  }> = [
    { key: "monitor", art: "seniorsMorning", bar: "from-primary-600 to-cyan-500" },
    { key: "alert", art: "kidsActive", bar: "from-danger-500 to-warning-400" },
    { key: "doctor", art: "doctorFamilyCare", bar: "from-cyan-600 to-primary-500" },
    { key: "lifestyle", art: "familyMeal", bar: "from-success-600 to-cyan-500" },
  ]

  return (
    <section className="relative w-full bg-white/70 px-4 py-20 sm:px-8 sm:py-24 lg:px-14">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-success-200 bg-success-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-success-700">
            {t("benefits.eyebrow")}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{t("benefits.title")}</h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">{t("benefits.subtitle")}</p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ key, art, bar }) => (
            <article
              key={key}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl"
            >
              <div className={`h-1 w-full bg-gradient-to-r ${bar}`} aria-hidden="true" />
              <div className="overflow-hidden bg-white p-3.5 pb-1">
                <img
                  src={LIFESTYLE_ART[art]}
                  alt={t(`benefits.items.${key}.title`)}
                  loading="lazy"
                  className="aspect-[4/3] w-full rounded-2xl object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-5 pt-3">
                <h3 className="text-lg font-bold text-slate-900">{t(`benefits.items.${key}.title`)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{t(`benefits.items.${key}.description`)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

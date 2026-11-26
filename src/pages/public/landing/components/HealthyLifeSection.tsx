import { useTranslation } from "react-i18next"

import { HsFamilyHeartIcon } from "@/components/icons/health-icons"
import { LIFESTYLE_ART, type LifestyleArtKey } from "@/components/illustrations/lifestyle"

const MOMENTS: ReadonlyArray<{
  key: "family" | "kids" | "friends" | "seniors" | "meal" | "doctor" | "picnic" | "yoga" | "grandparents" | "cycling" | "gardening" | "baby"
  art: LifestyleArtKey
  pillTone: string
  barTone: string
}> = [
  {
    key: "family",
    art: "familyPark",
    pillTone: "border-primary-200 bg-primary-50 text-primary-700",
    barTone: "from-primary-600 to-cyan-500",
  },
  {
    key: "baby",
    art: "babyParentsLove",
    pillTone: "border-danger-200 bg-danger-50 text-danger-700",
    barTone: "from-danger-500 to-warning-400",
  },
  {
    key: "kids",
    art: "kidsActive",
    pillTone: "border-warning-200 bg-warning-50 text-warning-700",
    barTone: "from-warning-500 to-danger-400",
  },
  {
    key: "cycling",
    art: "familyCycling",
    pillTone: "border-cyan-200 bg-cyan-50 text-cyan-700",
    barTone: "from-cyan-600 to-primary-500",
  },
  {
    key: "friends",
    art: "friendsJogging",
    pillTone: "border-cyan-200 bg-cyan-50 text-cyan-700",
    barTone: "from-cyan-600 to-primary-500",
  },
  {
    key: "grandparents",
    art: "grandparentsGrandkids",
    pillTone: "border-warning-200 bg-warning-50 text-warning-700",
    barTone: "from-warning-500 to-success-500",
  },
  {
    key: "gardening",
    art: "familyGardening",
    pillTone: "border-success-200 bg-success-50 text-success-700",
    barTone: "from-success-600 to-warning-400",
  },
  {
    key: "picnic",
    art: "familyPicnic",
    pillTone: "border-success-200 bg-success-50 text-success-700",
    barTone: "from-success-600 to-cyan-500",
  },
  {
    key: "yoga",
    art: "friendsYoga",
    pillTone: "border-cyan-200 bg-cyan-50 text-cyan-700",
    barTone: "from-cyan-500 to-success-500",
  },
  {
    key: "seniors",
    art: "seniorsMorning",
    pillTone: "border-success-200 bg-success-50 text-success-700",
    barTone: "from-success-600 to-cyan-500",
  },
  {
    key: "meal",
    art: "familyMeal",
    pillTone: "border-success-200 bg-success-50 text-success-700",
    barTone: "from-success-500 to-warning-400",
  },
  {
    key: "doctor",
    art: "doctorFamilyCare",
    pillTone: "border-danger-200 bg-danger-50 text-danger-700",
    barTone: "from-danger-500 to-primary-500",
  },
]

/** Bộ 12 tranh minh hoạ cuộc sống khoẻ mạnh cùng gia đình, trẻ nhỏ, bạn bè và ông bà trên Landing Page. */
export function HealthyLifeSection() {
  const { t } = useTranslation("landing")

  return (
    <section className="relative w-full bg-white/75 px-4 py-20 sm:px-8 sm:py-24 lg:px-14">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-danger-200 bg-danger-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-danger-700">
            <HsFamilyHeartIcon className="h-4 w-4" />
            {t("lifestyle.eyebrow")}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {t("lifestyle.title")}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            {t("lifestyle.subtitle")}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MOMENTS.map(({ key, art, pillTone, barTone }) => (
            <article
              key={key}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl"
            >
              <div className={`h-1 w-full bg-gradient-to-r ${barTone}`} aria-hidden="true" />
              <div className="overflow-hidden bg-white p-4 pb-2">
                <img
                  src={LIFESTYLE_ART[art]}
                  alt={t(`lifestyle.cards.${key}.title`)}
                  loading="lazy"
                  className="aspect-[4/3] w-full rounded-2xl object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-1 flex-col px-5 pb-5 pt-2">
                <span className={`w-fit rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${pillTone}`}>
                  {t(`lifestyle.cards.${key}.tag`)}
                </span>
                <h3 className="mt-2.5 text-lg font-extrabold tracking-tight text-slate-900">
                  {t(`lifestyle.cards.${key}.title`)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {t(`lifestyle.cards.${key}.description`)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

import { useTranslation } from "react-i18next"

import { CaraMascot } from "@/components/assistant/cara-mascot"
import { HsConsultationChatIcon } from "@/components/icons/health-icons"
import { LIFESTYLE_ART } from "@/components/illustrations/lifestyle"

/** Giới thiệu trợ lý Cara: mascot lớn, ảnh bạn bè trò chuyện ấm áp và ba câu hỏi mẫu. */
export function CaraSection() {
  const { t } = useTranslation("landing")
  const samples = ["latest", "consult", "navigate"] as const

  return (
    <section className="relative w-full px-4 py-16 sm:px-8 lg:px-14">
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-primary-100 bg-gradient-to-br from-white via-primary-50/40 to-cyan-50/50 p-8 shadow-card sm:p-12">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative z-10 grid items-center gap-10 md:grid-cols-12">
          <div className="order-2 md:order-1 md:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-700">
              <HsConsultationChatIcon className="h-4 w-4 text-primary-600" />
              {t("cara.eyebrow")}
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{t("cara.title")}</h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">{t("cara.subtitle")}</p>

            <div className="mt-6 flex flex-col gap-2.5">
              {samples.map((key) => (
                <div
                  key={key}
                  className="inline-flex w-fit max-w-full items-center gap-2.5 rounded-xl border border-primary-100 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-800 shadow-2xs"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-gradient-to-r from-primary-600 to-cyan-500" />
                  {t(`cara.samples.${key}`)}
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs font-medium text-slate-500">{t("cara.note")}</p>
          </div>

          <div className="order-1 flex flex-col items-center gap-4 md:order-2 md:col-span-5">
            <div className="relative w-full max-w-xs overflow-hidden rounded-3xl border border-primary-100 bg-white p-2.5 shadow-lg">
              <img
                src={LIFESTYLE_ART.friendsParkTea}
                alt={t("cara.title")}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-2xl object-cover"
              />
              <div className="absolute -bottom-3 -right-3 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-primary-50 shadow-lg">
                <CaraMascot size={74} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

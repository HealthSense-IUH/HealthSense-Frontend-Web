import { useTranslation } from "react-i18next"
import { MessageCircleHeart } from "lucide-react"

import { CaraMascot } from "@/components/assistant/cara-mascot"

/** Giới thiệu trợ lý Cara: mascot lớn, ba câu hỏi mẫu, lời nhắc trợ lý luôn có trong app. */
export function CaraSection() {
  const { t } = useTranslation("landing")
  const samples = ["latest", "consult", "navigate"] as const

  return (
    <section className="relative w-full px-4 py-16 sm:px-8 lg:px-14">
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-card sm:p-12">
        <div className="relative z-10 grid items-center gap-10 md:grid-cols-12">
          <div className="order-2 md:order-1 md:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-700">
              <MessageCircleHeart className="h-3.5 w-3.5" />
              {t("cara.eyebrow")}
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{t("cara.title")}</h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">{t("cara.subtitle")}</p>

            <div className="mt-6 flex flex-col gap-2.5">
              {samples.map((key) => (
                <div
                  key={key}
                  className="inline-flex w-fit max-w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm font-medium text-slate-700"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600" />
                  {t(`cara.samples.${key}`)}
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs font-medium text-slate-500">{t("cara.note")}</p>
          </div>

          <div className="order-1 flex justify-center md:order-2 md:col-span-5">
            <div className="relative">
              <span className="absolute inset-0 -m-5 rounded-full border border-slate-200/80 bg-slate-50" aria-hidden="true" />
              <div className="relative">
                <CaraMascot size={184} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

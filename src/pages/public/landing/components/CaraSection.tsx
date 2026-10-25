import { useTranslation } from "react-i18next"
import { MessageCircleHeart } from "lucide-react"

import { CaraMascot } from "@/components/assistant/cara-mascot"

/** Giới thiệu trợ lý Cara: mascot lớn, ba câu hỏi mẫu, lời nhắc trợ lý luôn có trong app. */
export function CaraSection() {
  const { t } = useTranslation("landing")
  const samples = ["latest", "consult", "navigate"] as const

  return (
    <section className="relative w-full px-4 py-16 sm:px-8 lg:px-14">
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-success-50 p-8 shadow-card sm:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{ backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)", backgroundSize: "22px 22px" }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-200/50 blur-3xl" aria-hidden="true" />

        <div className="relative z-10 grid items-center gap-10 md:grid-cols-12">
          <div className="order-2 md:order-1 md:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-700">
              <MessageCircleHeart className="h-3.5 w-3.5" />
              {t("cara.eyebrow")}
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{t("cara.title")}</h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">{t("cara.subtitle")}</p>

            <div className="mt-6 flex flex-col gap-2.5">
              {samples.map((key) => (
                <div
                  key={key}
                  className="inline-flex w-fit max-w-full items-center gap-2 rounded-2xl rounded-bl-md border border-border/70 bg-card px-4 py-2.5 text-sm font-medium text-slate-700 shadow-xs"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                  {t(`cara.samples.${key}`)}
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs font-semibold text-slate-500">{t("cara.note")}</p>
          </div>

          <div className="order-1 flex justify-center md:order-2 md:col-span-5">
            <div className="relative">
              <span className="absolute inset-0 -m-6 rounded-full bg-white/70 shadow-[0_30px_80px_-30px_rgba(14,165,233,0.5)]" aria-hidden="true" />
              <div className="relative motion-safe:animate-float">
                <CaraMascot size={200} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

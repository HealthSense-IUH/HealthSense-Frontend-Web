import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowUpRight } from "lucide-react"

import { EcgLine } from "@/components/illustrations"

/** Lời mời cuối trang: nền gradient thương hiệu, một câu, một nút. */
export function CtaSection({ signedIn, dashboardTo }: { signedIn: boolean; dashboardTo: string }) {
  const { t } = useTranslation("landing")
  return (
    <section className="relative w-full px-4 pb-20 pt-4 sm:px-8 lg:px-14">
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl bg-flagship-navy px-8 py-14 text-center text-white shadow-[0_24px_60px_-16px_rgba(11,22,44,0.45)] ring-1 ring-white/15 sm:px-12">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-3 text-cyan-300/30" aria-hidden="true">
          <EcgLine className="h-14" animated />
        </div>
        <div className="relative z-10 mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("cta.title")}</h2>
          <p className="mt-3 text-base leading-relaxed text-slate-200/90">{t("cta.subtitle")}</p>
          <Link
            to={signedIn ? dashboardTo : "/register"}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-primary-700 shadow-lg shadow-black/20 transition-all hover:bg-cyan-50 hover:-translate-y-0.5"
          >
            {signedIn ? t("cta.buttonSignedIn") : t("cta.button")}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowUpRight } from "lucide-react"

import { EcgLine } from "@/components/illustrations"

/** Lời mời cuối trang: nền gradient thương hiệu, một câu, một nút. */
export function CtaSection({ signedIn, dashboardTo }: { signedIn: boolean; dashboardTo: string }) {
  const { t } = useTranslation("landing")
  return (
    <section className="relative w-full px-4 pb-20 pt-4 sm:px-8 lg:px-14">
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 px-8 py-14 text-center text-white shadow-2xl shadow-primary-900/30 sm:px-12">
        <div className="pointer-events-none absolute inset-x-0 bottom-3 text-white/20" aria-hidden="true">
          <EcgLine className="h-14" animated />
        </div>
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("cta.title")}</h2>
          <p className="mt-3 text-base leading-relaxed text-primary-50/90">{t("cta.subtitle")}</p>
          <Link
            to={signedIn ? dashboardTo : "/register"}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-extrabold text-primary-700 shadow-lg transition-transform hover:scale-[1.03]"
          >
            {signedIn ? t("cta.buttonSignedIn") : t("cta.button")}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

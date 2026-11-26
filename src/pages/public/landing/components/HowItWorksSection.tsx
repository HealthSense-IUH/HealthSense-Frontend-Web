import { useTranslation } from "react-i18next"
import { BellRing, Stethoscope, Watch } from "lucide-react"

/** Cách hoạt động: ba bước đơn giản, không thuật ngữ. */
export function HowItWorksSection() {
  const { t } = useTranslation("landing")
  const steps = [
    { key: "wear", icon: Watch, gradient: "from-primary-600 to-cyan-500", shadow: "shadow-primary-500/25" },
    { key: "watch", icon: BellRing, gradient: "from-danger-500 to-warning-500", shadow: "shadow-danger-500/25" },
    { key: "care", icon: Stethoscope, gradient: "from-success-600 to-cyan-500", shadow: "shadow-success-500/25" },
  ] as const

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
          {/* đường nối giữa các bước trên màn rộng */}
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-9 hidden border-t-2 border-dashed border-primary-200 md:block" aria-hidden="true" />
          {steps.map(({ key, icon: Icon, gradient, shadow }, index) => (
            <li key={key} className="relative flex flex-col items-center text-center">
              <div className={`relative flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg ${shadow} ring-4 ring-white`}>
                <Icon className="h-7 w-7" />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#0b162c] text-[11px] font-bold text-white tabular-nums">
                  {index + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{t(`how.steps.${key}.title`)}</h3>
              <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-600">{t(`how.steps.${key}.description`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

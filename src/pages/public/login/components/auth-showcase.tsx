import { useTranslation } from "react-i18next"
import { Activity, BellRing, Stethoscope } from "lucide-react"

import { CaraMascot } from "@/components/assistant/cara-mascot"
import { EcgLine, WearableIllustration } from "@/components/illustrations"

/**
 * Bảng giới thiệu bên trái trang đăng nhập (chỉ hiện từ màn hình lg): nền navy, minh hoạ vòng đeo, ba điểm mạnh
 * và mascot Cara. Nội dung lấy từ auth:showcase.*
 */
export function AuthShowcase() {
  const { t } = useTranslation("auth")
  const points = [
    { icon: Activity, key: "monitor" },
    { icon: BellRing, key: "alert" },
    { icon: Stethoscope, key: "doctor" },
  ] as const

  return (
    <aside className="relative hidden overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0b132b] via-[#12284f] to-primary-700 p-10 text-white shadow-2xl shadow-primary-900/30 lg:flex lg:min-h-[640px] lg:flex-col lg:justify-between">
      {/* lưới chấm + quầng sáng */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-400/30 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-success-400/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-24 text-white/20" aria-hidden="true">
        <EcgLine className="h-14" animated />
      </div>

      <div className="relative z-10 space-y-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-success-400" />
          {t("showcase.eyebrow")}
        </span>
        <h2 className="max-w-md text-3xl font-extrabold leading-tight tracking-tight xl:text-4xl">{t("showcase.title")}</h2>
        <p className="max-w-md text-sm leading-relaxed text-slate-300">{t("showcase.subtitle")}</p>
        <ul className="space-y-3 pt-2">
          {points.map(({ icon: Icon, key }) => (
            <li key={key} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-primary-200 ring-1 ring-white/15">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm leading-relaxed text-slate-200">{t(`showcase.points.${key}`)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 mt-8 flex items-end justify-between gap-6">
        <div className="w-56 motion-safe:animate-float xl:w-64">
          <WearableIllustration title="HealthSense wearable" />
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
          <CaraMascot size={44} />
          <div className="text-xs">
            <p className="font-bold">Cara</p>
            <p className="text-slate-300">{t("showcase.note")}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

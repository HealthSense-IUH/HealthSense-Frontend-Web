import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"
import type { SupportedLanguage } from "@/lib/i18n"

/** Cờ của từng ngôn ngữ (public/locales) */
const FLAGS: Record<SupportedLanguage, string> = {
  vi: "/locales/vn.png",
  en: "/locales/uk.png",
}

interface LanguageSwitcherProps {
  /** "inline": nút nhỏ trên thanh trên cùng; "floating": nút nổi góc trái dưới (landing page) */
  variant?: "inline" | "floating"
  className?: string
}

/**
 * Nút đổi ngôn ngữ: hiện cờ của ngôn ngữ đang dùng, bấm là chuyển sang ngôn ngữ còn lại (không mở menu).
 * Lựa chọn được i18next tự lưu vào localStorage (xem `detection.caches` trong lib/i18n.ts) nên giữ nguyên
 * sau khi tải lại trang.
 */
export function LanguageSwitcher({ variant = "inline", className }: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation()
  const active: SupportedLanguage = i18n.resolvedLanguage === "en" ? "en" : "vi"
  const next: SupportedLanguage = active === "vi" ? "en" : "vi"
  const label = t("lang.switchTo", { lang: t(`lang.${next}`) })

  return (
    <button
      type="button"
      onClick={() => void i18n.changeLanguage(next)}
      aria-label={label}
      title={label}
      className={cn(
        "flex items-center gap-2 border bg-white/95 text-slate-700 transition-all cursor-pointer hover:text-slate-900",
        variant === "floating"
          ? "fixed bottom-6 left-6 z-50 rounded-2xl border-slate-200/90 px-3 py-2.5 shadow-lg shadow-primary-950/10 backdrop-blur-md hover:scale-105 hover:shadow-xl active:scale-95"
          : "rounded-full border-slate-200/90 px-2.5 py-1.5 shadow-2xs hover:bg-slate-50",
        className
      )}
    >
      <img
        src={FLAGS[active]}
        alt=""
        className={cn(
          "rounded-sm object-cover ring-1 ring-slate-200",
          variant === "floating" ? "h-5 w-7" : "h-3.5 w-5"
        )}
      />
      <span className={cn("font-bold uppercase tracking-wider", variant === "floating" ? "text-xs" : "text-[11px]")}>
        {active}
      </span>
    </button>
  )
}

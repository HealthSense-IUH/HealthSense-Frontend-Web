import { Languages } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/lib/i18n"

/**
 * Nút đổi ngôn ngữ. Lựa chọn được i18next tự lưu vào localStorage
 * (xem cấu hình `detection.caches` trong lib/i18n.ts) nên giữ nguyên
 * sau khi tải lại trang.
 */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const active = (i18n.resolvedLanguage ?? "vi") as SupportedLanguage

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("lang.label")}
          title={t("lang.label")}
          className="flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/90 px-2.5 py-1.5 text-slate-600 shadow-2xs transition-all hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
        >
          <Languages className="h-4 w-4" />
          <span className="text-[11px] font-bold uppercase tracking-wider">{active}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-44 space-y-1 rounded-2xl border-slate-200 bg-white p-2 shadow-xl">
        <p className="px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {t("lang.label")}
        </p>
        {SUPPORTED_LANGUAGES.map((lng) => (
          <button
            key={lng}
            type="button"
            onClick={() => void i18n.changeLanguage(lng)}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
              active === lng
                ? "bg-sky-50 text-sky-700"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {t(`lang.${lng}`)}
            {active === lng && <span className="text-sky-600">✓</span>}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

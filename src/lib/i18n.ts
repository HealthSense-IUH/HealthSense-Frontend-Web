/**
 * Cấu hình i18n cho HealthSense.
 *
 * - Tiếng Việt là ngôn ngữ mặc định và cũng là fallback: thiếu bản dịch tiếng
 *   Anh thì người dùng thấy tiếng Việt, không bao giờ thấy khoá thô như
 *   "nav.item.dashboard".
 * - CỐ Ý KHÔNG dò theo `navigator`: đây là sản phẩm cho người dùng Việt Nam,
 *   một máy cài Windows tiếng Anh vẫn phải mở ra tiếng Việt. Chỉ khi người
 *   dùng tự bấm đổi thì mới sang tiếng Anh, và lựa chọn đó được nhớ lại.
 * - Ngôn ngữ đã chọn được lưu vào localStorage nên giữ nguyên sau khi tải lại.
 * - Bản dịch nhúng thẳng vào bundle (không tải qua HTTP) để không chớp chữ khi
 *   trang vừa mở.
 */
import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

import enCommon from "@/locales/en/common.json"
import viCommon from "@/locales/vi/common.json"

export const SUPPORTED_LANGUAGES = ["vi", "en"] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const LANGUAGE_STORAGE_KEY = "healthsense.lang"

/** Locale dùng cho Intl (toLocaleDateString/…) ứng với ngôn ngữ đang chọn. */
export const INTL_LOCALE: Record<SupportedLanguage, string> = {
  vi: "vi-VN",
  en: "en-US",
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: { common: viCommon },
      en: { common: enCommon },
    },
    ns: ["common"],
    defaultNS: "common",
    fallbackLng: "vi",
    supportedLngs: [...SUPPORTED_LANGUAGES],
    // Không tách "vi-VN" thành vùng riêng — chỉ cần "vi"
    load: "languageOnly",
    detection: {
      order: ["localStorage"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ["localStorage"],
    },
    interpolation: {
      // React đã tự chống XSS khi render
      escapeValue: false,
    },
  })

/** Ngôn ngữ đang dùng, đã chuẩn hoá về "vi" | "en". */
export function currentLanguage(): SupportedLanguage {
  const lng = i18n.resolvedLanguage ?? i18n.language ?? "vi"
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lng)
    ? (lng as SupportedLanguage)
    : "vi"
}

/** Locale Intl tương ứng ngôn ngữ đang dùng — dùng trong lib/formatters.ts. */
export function currentIntlLocale(): string {
  return INTL_LOCALE[currentLanguage()]
}

export default i18n

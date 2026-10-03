import i18n from "@/lib/i18n"
import type { ReferenceFoodSource } from "@/types/nutrition"

/** Tên hiển thị và trích dẫn của từng nguồn dữ liệu dinh dưỡng tham chiếu (dịch lúc đọc theo ngôn ngữ đang chọn). */
export const REFERENCE_SOURCES: Record<ReferenceFoodSource, { short: string; label: string; citation: string }> = {
  VN_FCT: {
    get short() {
      return i18n.t("nutrition:sources.vnFct.short")
    },
    get label() {
      return i18n.t("nutrition:sources.vnFct.label")
    },
    get citation() {
      return i18n.t("nutrition:sources.vnFct.citation")
    },
  },
  USDA_FNDDS: {
    short: "USDA",
    label: "USDA FNDDS 2021-2023",
    citation: "U.S. Department of Agriculture, Agricultural Research Service. FoodData Central: FNDDS 2021-2023.",
  },
}

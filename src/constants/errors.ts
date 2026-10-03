import i18n from "@/lib/i18n"

/**
 * Thông báo lỗi theo mã HTTP. Dùng getter để dịch lúc tra cứu (theo ngôn ngữ
 * đang chọn), không dịch lúc nạp module.
 */
export const HTTP_STATUS_MESSAGES: Record<number, string> = {
  get 400() { return i18n.t("errors:http.400") },
  get 401() { return i18n.t("errors:http.401") },
  get 403() { return i18n.t("errors:http.403") },
  get 404() { return i18n.t("errors:http.404") },
  get 409() { return i18n.t("errors:http.409") },
  get 429() { return i18n.t("errors:http.429") },
  get 500() { return i18n.t("errors:http.500") },
  get 502() { return i18n.t("errors:http.unavailable") },
  get 503() { return i18n.t("errors:http.unavailable") },
  get 504() { return i18n.t("errors:http.unavailable") },
}

export const AUTH_ERROR_FALLBACK_MESSAGES: Record<number, string> = {
  get 1001() { return i18n.t("errors:auth.1001") },
  get 1002() { return i18n.t("errors:auth.1002") },
  get 1003() { return i18n.t("errors:auth.1003") },
  get 1004() { return i18n.t("errors:auth.1004") },
  get 1005() { return i18n.t("errors:auth.1005") },
  get 1006() { return i18n.t("errors:auth.1006") },
  get 1007() { return i18n.t("errors:auth.1007") },
  get 1200() { return i18n.t("errors:auth.1200") },
  get 403() { return i18n.t("errors:auth.403") },
  get 429() { return i18n.t("errors:auth.429") },
}

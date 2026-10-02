import { useTranslation } from "react-i18next"

/** Slogan chung của HealthSense (theo ngôn ngữ đang chọn), dùng cạnh logo ở mọi nơi. */
export function BrandSlogan({ className }: { className?: string }) {
  const { t } = useTranslation()
  return <span className={className}>{t("brand.slogan")}</span>
}

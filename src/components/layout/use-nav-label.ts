import { useTranslation } from "react-i18next"

import type { NavigationGroup, NavigationItem } from "./nav-config"

/**
 * Dịch nhãn điều hướng theo `id` của mục.
 *
 * Khoá được suy ra từ id (`nav.item.dashboard`, `nav.group.general-health`…)
 * nên không phải khai báo khoá thủ công cho từng mục trong nav-config.
 * Mọi id trong nav-config đều có khoá trong common.json (vi là ngôn ngữ fallback),
 * nên nhãn luôn lấy từ bản dịch; title/shortTitle trong config chỉ là dự phòng tuỳ chọn.
 */
export function useNavLabel() {
  const { t } = useTranslation()

  const groupLabel = (group: NavigationGroup) =>
    t(`nav.group.${group.id}`, { defaultValue: group.title })

  const itemLabel = (item: NavigationItem) =>
    t(`nav.item.${item.id}`, { defaultValue: item.title })

  const itemShortLabel = (item: NavigationItem) =>
    t(`nav.short.${item.id}`, { defaultValue: item.shortTitle || item.title })

  return { groupLabel, itemLabel, itemShortLabel }
}

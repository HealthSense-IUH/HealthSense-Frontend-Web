import { useTranslation } from "react-i18next"

import type { NavigationGroup, NavigationItem } from "./nav-config"

/**
 * Dịch nhãn điều hướng theo `id` của mục.
 *
 * Khoá được suy ra từ id (`nav.item.dashboard`, `nav.group.general-health`…)
 * nên không phải khai báo khoá thủ công cho từng mục trong nav-config.
 * Thiếu bản dịch thì trả về nhãn tiếng Việt gốc đã có sẵn trong config —
 * không bao giờ lộ khoá thô ra giao diện.
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

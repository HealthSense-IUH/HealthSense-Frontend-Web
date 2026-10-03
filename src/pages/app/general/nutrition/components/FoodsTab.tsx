import { Link } from "react-router-dom"
import { ArrowRight, RefreshCw } from "lucide-react"
import { useTranslation } from "react-i18next"

import { PageSection } from "@/components/layout/page"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { currentIntlLocale } from "@/lib/i18n"
import { FoodSearchBar } from "./FoodSearchBar"
import { FoodGroupIcon } from "../group-icons"
import { useNutritionGroups } from "../hooks/use-nutrition"
import type { FoodGroup } from "@/types/nutrition"

/** Thẻ một nhóm thực phẩm (dữ liệu thật từ /api/nutrition/groups); bấm vào để xem các loại trong nhóm. */
function FoodGroupCard({ group }: { group: FoodGroup }) {
  const { t } = useTranslation("nutrition")
  const guidanceCount = group.guidanceFoodCount ?? 0
  const foodCount = group.foodCount ?? 0
  return (
    <Link
      to={`/app/general/nutrition/category/${encodeURIComponent(group.slug || group.id)}`}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-primary-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-primary-50 transition-colors">
          <FoodGroupIcon icon={group.icon} />
        </div>
        <span className="text-[11px] font-medium text-muted-foreground bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 whitespace-nowrap">
          {t("foods.groupFoodCount", { count: foodCount, value: foodCount.toLocaleString(currentIntlLocale()) })}
        </span>
      </div>

      <h3 className="mt-4 text-base font-semibold text-foreground group-hover:text-primary transition-colors">
        {group.name}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {group.description ||
          (guidanceCount > 0
            ? t("foods.groupGuidanceDescription", { count: guidanceCount })
            : t("foods.groupDefaultDescription"))}
      </p>

      <div className="mt-auto pt-4">
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-primary">
          <span>{guidanceCount > 0 ? t("foods.exploreWithGuidance", { count: guidanceCount }) : t("foods.explore")}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}

function FoodGroupGrid() {
  const { t } = useTranslation("nutrition")
  const { data: groups = [], isLoading, isError, refetch } = useNutritionGroups()

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">{t("foods.groupsLoadError")}</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          <RefreshCw /> {t("common.retry")}
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {isLoading
        ? Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)
        : groups.map((group) => <FoodGroupCard key={group.id} group={group} />)}
    </div>
  )
}

/** Tab "Tra cứu thực phẩm": tìm nhanh và duyệt theo nhóm thực phẩm (mỗi nhóm có danh sách đầy đủ ở trang nhóm). */
export function FoodsTab() {
  const { t } = useTranslation("nutrition")
  return (
    <div className="space-y-6">
      <FoodSearchBar />

      <PageSection
        title={t("foods.sectionTitle")}
        description={t("foods.sectionDescription")}
      >
        <FoodGroupGrid />
      </PageSection>
    </div>
  )
}
